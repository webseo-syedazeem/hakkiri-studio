/**
 * Carrying a free check into the builder. Someone who checks their CV before
 * they have an account presses "Open in CV Builder", is asked to sign in, and
 * should then arrive in the builder with the text they checked: not at an
 * empty list, pasting it all again.
 *
 * Only the check's id is remembered, in this browser, for a couple of hours.
 * The text itself stays on the server and is read from there once the person
 * is signed in.
 */

const KEY = "hakkiri.cv.fromCheck";
const KEPT_MS = 2 * 60 * 60 * 1000;
/** The same shape the server accepts for a check's id. */
const CHECK_ID = /^aud_[A-Za-z0-9_-]{8,40}$/;

export const fromCheckPath = (id: string) => `/cv/from-check/${id}`;

/** Remembers which check the person asked to open in the builder. */
export function rememberCheck(id: string): void {
  if (!CHECK_ID.test(id)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ id, at: Date.now() }));
  } catch {
    /* storage is off: the link still works for someone already signed in */
  }
}

/** The check waiting to be opened, if one was asked for recently. */
export function rememberedCheck(): string | null {
  try {
    const kept = JSON.parse(localStorage.getItem(KEY) ?? "null") as { id?: unknown; at?: unknown } | null;
    if (!kept || typeof kept.id !== "string" || !CHECK_ID.test(kept.id) || typeof kept.at !== "number" || Date.now() - kept.at > KEPT_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return kept.id;
  } catch {
    return null;
  }
}

export function forgetCheck(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to forget */
  }
}

/**
 * Where to go once signed in: to the check that was waiting, or home. The
 * address is built here from an id of the expected shape, so nothing stored
 * in the browser can send the person anywhere else.
 */
export function afterSignIn(fallback = "/"): string {
  const id = rememberedCheck();
  return id ? fromCheckPath(id) : fallback;
}
