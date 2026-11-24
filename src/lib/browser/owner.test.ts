import { describe, expect, it } from "vitest";
import { OWNER_KEY, type BrowserStore, claimBrowser, forgetBrowser, isPersonalKey, releaseBrowser } from "./owner";

/** A browser's storage, as a plain map. */
function storage(initial: Record<string, string> = {}): BrowserStore & { all(): Record<string, string>; failOn?: string } {
  const map = new Map(Object.entries(initial));
  const store = {
    failOn: undefined as string | undefined,
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (store.failOn && k.startsWith(store.failOn)) throw new Error("QuotaExceededError");
      map.set(k, v);
    },
    removeItem: (k: string) => void map.delete(k),
    all: () => Object.fromEntries(map),
  };
  return store;
}

const ALICE = "usr_alice";
const BOB = "usr_bob";
const alices = { hk_custom_interviews: '[{"id":"iv-1","company":"Quillon Biotech"}]', hk_interview_wizard_draft: '{"cv":"Alice’s CV text"}', hk_interview_examples: '[{"title":"The Helix dispute"}]', "hakkiri.cv.unsaved.cv_1": '{"name":"Alice"}', "hk_recent_practice_iv-1": "[]" };
const visible = (s: ReturnType<typeof storage>) => Object.fromEntries(Object.entries(s.all()).filter(([k]) => isPersonalKey(k)));

describe("which entries are a person's", () => {
  it("everything the app writes for the signed-in person, and not the shared or bookkeeping ones", () => {
    for (const key of Object.keys(alices).concat("hk_stage_tracker_iv-1_feedback", "hk_beta_survey_draft_v2_m1", "hk_active_stage_tracker_id")) expect(isPersonalKey(key), key).toBe(true);
    for (const key of ["hk_vis_id", OWNER_KEY, "hk_vault:usr_alice", "theme", "dismiss_phone_notice", "someone-elses-key"]) expect(isPersonalKey(key), key).toBe(false);
  });
});

describe("one browser, two accounts", () => {
  it("the next account to sign in sees nothing of the last one's", () => {
    const local = storage();
    claimBrowser(ALICE, local);
    for (const [k, v] of Object.entries(alices)) local.setItem(k, v);
    expect(claimBrowser(BOB, local)).toBe(true);
    expect(visible(local)).toEqual({});
    expect(local.getItem(OWNER_KEY)).toBe(BOB);
  });

  it("each account gets its own entries back, exactly as they were", () => {
    const local = storage();
    claimBrowser(ALICE, local);
    for (const [k, v] of Object.entries(alices)) local.setItem(k, v);
    claimBrowser(BOB, local);
    local.setItem("hk_interview_wizard_draft", '{"cv":"Bob’s CV text"}');
    expect(claimBrowser(ALICE, local)).toBe(true);
    expect(visible(local)).toEqual(alices);
    claimBrowser(BOB, local);
    expect(visible(local)).toEqual({ hk_interview_wizard_draft: '{"cv":"Bob’s CV text"}' });
  });

  it("signing out leaves nothing in view for whoever uses the browser next", () => {
    const local = storage();
    const session = storage({ hk_beta_survey_dismissed_m1: "1", dismiss_phone_notice: "1" });
    claimBrowser(ALICE, local);
    for (const [k, v] of Object.entries(alices)) local.setItem(k, v);
    releaseBrowser(ALICE, local, session);
    expect(visible(local)).toEqual({});
    expect(local.getItem(OWNER_KEY)).toBeNull();
    expect(session.all()).toEqual({ dismiss_phone_notice: "1" });
    // Bob signs in and starts clean; Alice signs back in later and has her entries.
    expect(claimBrowser(BOB, local)).toBe(false);
    expect(visible(local)).toEqual({});
    releaseBrowser(BOB, local);
    expect(claimBrowser(ALICE, local)).toBe(true);
    expect(visible(local)).toEqual(alices);
  });

  it("a session that ended without signing out is treated the same", () => {
    const local = storage();
    claimBrowser(ALICE, local);
    local.setItem("hk_interview_examples", alices.hk_interview_examples);
    // No sign-out: Alice's session expired and Bob signed in.
    claimBrowser(BOB, local);
    expect(visible(local)).toEqual({});
  });

  it("the same account loading another screen changes nothing", () => {
    const local = storage();
    claimBrowser(ALICE, local);
    for (const [k, v] of Object.entries(alices)) local.setItem(k, v);
    const before = local.all();
    expect(claimBrowser(ALICE, local)).toBe(false);
    expect(local.all()).toEqual(before);
  });

  it("entries from before the browser recorded an owner are kept for the account that is signed in", () => {
    const local = storage({ ...alices, hk_vis_id: "v-1" });
    expect(claimBrowser(ALICE, local)).toBe(false);
    expect(visible(local)).toEqual(alices);
    expect(local.getItem("hk_vis_id")).toBe("v-1");
  });

  it("the anonymous visitor id and unrelated keys are never moved", () => {
    const local = storage({ hk_vis_id: "v-1", theme: "dark" });
    claimBrowser(ALICE, local);
    local.setItem("hk_interview_examples", "[]");
    claimBrowser(BOB, local);
    releaseBrowser(BOB, local);
    expect(local.getItem("hk_vis_id")).toBe("v-1");
    expect(local.getItem("theme")).toBe("dark");
  });

  it("when there is no room to set entries aside they are removed, not left for the next person", () => {
    const local = storage();
    claimBrowser(ALICE, local);
    for (const [k, v] of Object.entries(alices)) local.setItem(k, v);
    local.failOn = "hk_vault:";
    claimBrowser(BOB, local);
    expect(visible(local)).toEqual({});
  });

  it("a set-aside copy that has been tampered with brings back nothing it shouldn't", () => {
    const local = storage({ "hk_vault:usr_bob": JSON.stringify({ [OWNER_KEY]: ALICE, "hk_vault:usr_alice": "{}", unrelated: "x", hk_interview_examples: 7, hk_interview_wizard_draft: "ok" }) });
    claimBrowser(BOB, local);
    expect(local.all()).toEqual({ [OWNER_KEY]: BOB, hk_interview_wizard_draft: "ok" });
    const broken = storage({ "hk_vault:usr_bob": "not json" });
    expect(claimBrowser(BOB, broken)).toBe(false);
    expect(broken.all()).toEqual({ [OWNER_KEY]: BOB });
  });
});

describe("deleting all my data", () => {
  it("removes what this browser holds for the person, in view and set aside, and nobody else's", () => {
    const local = storage();
    const session = storage({ hk_beta_survey_dismissed_m1: "1" });
    claimBrowser(BOB, local);
    local.setItem("hk_interview_examples", '[{"title":"Bob’s"}]');
    claimBrowser(ALICE, local);
    for (const [k, v] of Object.entries(alices)) local.setItem(k, v);
    forgetBrowser(ALICE, local, session);
    expect(visible(local)).toEqual({});
    expect(session.all()).toEqual({});
    expect(local.getItem("hk_vault:usr_alice")).toBeNull();
    // Alice is still signed in, and Bob's entries are still his.
    expect(local.getItem(OWNER_KEY)).toBe(ALICE);
    claimBrowser(BOB, local);
    expect(visible(local)).toEqual({ hk_interview_examples: '[{"title":"Bob’s"}]' });
    // Deleted while signed out of this browser: the set-aside copy goes too.
    releaseBrowser(BOB, local);
    forgetBrowser(BOB, local);
    expect(claimBrowser(BOB, local)).toBe(false);
    expect(visible(local)).toEqual({});
  });
});
