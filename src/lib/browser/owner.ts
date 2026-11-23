/**
 * What Hakkiri keeps in the browser (a set-up draft, the examples library,
 * where a stage tracker has got to, unsaved CV text) belongs to the account
 * that was signed in when it was written. A browser can be shared, so each
 * account's entries are set aside when it signs out or a different account
 * signs in, and brought back when their owner returns. Nothing one person
 * saved here is shown to another.
 */

/** Which account the browser's live entries belong to. */
export const OWNER_KEY = "hk_browser_owner";
const VAULT = "hk_vault:";
/** Not about a person: kept whoever is signed in. */
const SHARED = new Set(["hk_vis_id"]);

/** Screens that read these entries listen for these, and read again when one fires. */
export const BROWSER_DATA_EVENTS = ["hk_interviews_updated", "hk_draft_updated", "hk_practice_updated", "hk_archive_updated", "hk_examples_updated"] as const;

export type BrowserStore = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;

/** An entry written for the signed-in person, as opposed to the owner mark, a set-aside copy or a shared one. */
export const isPersonalKey = (key: string): boolean =>
  (key.startsWith("hk_") || key.startsWith("hakkiri.cv.")) && key !== OWNER_KEY && !key.startsWith(VAULT) && !SHARED.has(key);

function personalKeys(store: BrowserStore): string[] {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key && isPersonalKey(key)) keys.push(key);
  }
  return keys;
}

/** Moves the live entries into their owner's set-aside copy. They are removed from view either way. */
function setAside(store: BrowserStore, owner: string): number {
  const keys = personalKeys(store);
  if (!keys.length) return 0;
  const kept: Record<string, string> = {};
  for (const key of keys) {
    const value = store.getItem(key);
    if (value !== null) kept[key] = value;
  }
  for (const key of keys) store.removeItem(key);
  try {
    store.setItem(VAULT + owner, JSON.stringify(kept));
  } catch {
    // No room to keep them: they are dropped rather than left where the next person would see them.
  }
  return keys.length;
}

/** Brings an account's set-aside entries back. */
function bringBack(store: BrowserStore, owner: string): number {
  const raw = store.getItem(VAULT + owner);
  if (raw === null) return 0;
  store.removeItem(VAULT + owner);
  let count = 0;
  try {
    const kept = JSON.parse(raw) as unknown;
    if (kept && typeof kept === "object" && !Array.isArray(kept)) {
      for (const [key, value] of Object.entries(kept)) {
        if (!isPersonalKey(key) || typeof value !== "string") continue;
        store.setItem(key, value);
        count++;
      }
    }
  } catch {
    /* unreadable: nothing to bring back */
  }
  return count;
}

const clearPersonal = (store: BrowserStore | undefined) => {
  if (store) for (const key of personalKeys(store)) store.removeItem(key);
};

/**
 * A signed-in screen has loaded for `userId`. If the browser's entries belong
 * to another account they are set aside, and this account's own are brought
 * back. Returns true when what the browser holds was changed, so screens that
 * already read it can read again.
 *
 * Entries left from before the browser recorded an owner are kept for the
 * account that is signed in now: they can't be told apart, and the examples
 * library exists nowhere else, so removing them would delete a person's work.
 */
export function claimBrowser(userId: string, local: BrowserStore, session?: BrowserStore): boolean {
  if (!userId) return false;
  const owner = local.getItem(OWNER_KEY);
  if (owner === userId) return false;
  let changed = 0;
  if (owner) {
    changed += setAside(local, owner);
    clearPersonal(session);
  }
  changed += bringBack(local, userId);
  local.setItem(OWNER_KEY, userId);
  return changed > 0;
}

/** The person is signing out: their entries are set aside so the next person to use this browser starts clean. */
export function releaseBrowser(userId: string | undefined, local: BrowserStore, session?: BrowserStore): void {
  const owner = local.getItem(OWNER_KEY) ?? userId;
  if (owner) setAside(local, owner);
  else clearPersonal(local);
  clearPersonal(session);
  local.removeItem(OWNER_KEY);
}

/** The person deleted all their data: what this browser holds for them goes too, live and set aside. */
export function forgetBrowser(userId: string | undefined, local: BrowserStore, session?: BrowserStore): void {
  clearPersonal(local);
  clearPersonal(session);
  const owner = userId ?? local.getItem(OWNER_KEY);
  if (owner) local.removeItem(VAULT + owner);
}

/** Tells the screens that are open to read the browser's entries again. */
export function announceBrowserData(): void {
  if (typeof window === "undefined") return;
  for (const name of BROWSER_DATA_EVENTS) window.dispatchEvent(new Event(name));
}

const stores = (): [BrowserStore, BrowserStore] | null => {
  try {
    return typeof window === "undefined" ? null : [window.localStorage, window.sessionStorage];
  } catch {
    return null; // storage is switched off in this browser
  }
};

/** The three calls above, on this browser's own storage. Each does nothing where storage is unavailable. */
export const browserData = {
  claim(userId: string): boolean {
    const s = stores();
    try {
      return s ? claimBrowser(userId, s[0], s[1]) : false;
    } catch {
      return false;
    }
  },
  release(userId?: string): void {
    const s = stores();
    try {
      if (s) releaseBrowser(userId, s[0], s[1]);
    } catch {
      /* nothing to do */
    }
  },
  forget(userId?: string): void {
    const s = stores();
    try {
      if (s) forgetBrowser(userId, s[0], s[1]);
    } catch {
      /* nothing to do */
    }
  },
};
