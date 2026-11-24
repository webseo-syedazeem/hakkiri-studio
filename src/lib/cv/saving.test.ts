import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The store writes to a throwaway folder; each test chooses who is signed in.
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-saving-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

const versions = await import("@/app/api/cv/versions/route");
const one = await import("@/app/api/cv/versions/[id]/route");
const store = await import("@/lib/cv/store");
const { saveProblem, sectionIdsDiffer, tooBig, EditableSchema } = await import("./access");
const { LIMITS, newBullet, emptyEntry, newId } = await import("./schema");
const { KEEPALIVE_MAX, isOwnSave, isRefusal, sameButSpacing } = await import("@/components/cv/useCv");
const { fernCv } = await import("./render/testing");
type Section = import("./schema").Section;
type EntrySection = import("./schema").EntrySection;

const alice = { id: "usr_alice", email: "alice@example.com" };
const json = (body: unknown, method = "POST") => new Request("http://localhost/api", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const experience = (sections: Section[]) => sections.find((s) => s.kind === "experience") as EntrySection;

async function filled() {
  const id = (await (await versions.POST(json({ name: "Fern CV", level: "experienced", region: "uk" }))).json()).id as string;
  const cv = (await store.getOwnCv(id, alice.id))!;
  const fern = fernCv();
  return store.saveCv({ ...cv, contact: fern.contact, sections: fern.sections });
}
const patch = async (id: string, body: unknown) => {
  const res = await one.PATCH(json(body, "PATCH"), ctx(id));
  return { status: res.status, body: await res.json() };
};

beforeEach(() => {
  signedIn = alice;
  for (const k of Object.keys(globalThis._applyMemoryStore ?? {})) delete globalThis._applyMemoryStore![k];
  fs.rmSync(path.join(dataDir, "apply"), { recursive: true, force: true });
  (globalThis as unknown as { __hakkiriRate?: Map<string, number[]> }).__hakkiriRate?.clear();
});

describe("a save that is refused says why", () => {
  it("a role with more lines than it can hold", async () => {
    const cv = await filled();
    const sections = structuredClone(cv.sections);
    experience(sections).entries[0].bullets = Array.from({ length: LIMITS.bullets + 1 }, (_, i) => newBullet(`Line ${i + 1} of the role`));
    const out = await patch(cv.id, { rev: cv.rev, sections });
    expect(out.status).toBe(400);
    expect(out.body.message).toBe("One role has more than 30 lines. Remove one to save.");
    // Nothing was saved: the CV is as it was.
    expect((await store.getOwnCv(cv.id, alice.id))!.rev).toBe(cv.rev);
  });

  it("text far too long to be a mistake of a few characters", async () => {
    const cv = await filled();
    const sections = structuredClone(cv.sections);
    experience(sections).entries[0].bullets[0].text = "x".repeat(LIMITS.bullet * 2 + 1);
    expect((await patch(cv.id, { rev: cv.rev, sections })).body.message).toBe("Some text is longer than can be saved (text). Shorten it to save.");
  });

  it("a CV with more lines, skills or entries in total than any CV needs", async () => {
    const cv = await filled();
    const many = structuredClone(cv.sections);
    experience(many).entries = Array.from({ length: 20 }, () => ({ ...emptyEntry(), title: "Role", bullets: Array.from({ length: 21 }, () => newBullet("A line")) }));
    expect((await patch(cv.id, { rev: cv.rev, sections: many })).body.message).toMatch(new RegExp(`^This CV has 42\\d lines\\. It can hold ${LIMITS.totalLines}: remove some to save\\.$`));
    expect(tooBig(cv.sections)).toBeNull();
    const skilled: Section[] = [{ id: "s_skills01", kind: "skills", visible: true, title: "", groups: Array.from({ length: 6 }, (_, g) => ({ id: `g_${g}000`, name: "", visible: true, skills: Array.from({ length: 40 }, (_, k) => ({ id: newId("k_"), name: `Skill ${g}-${k}`, visible: true })) })) }];
    expect(tooBig(skilled)).toBe(`This CV lists 240 skills. It can hold ${LIMITS.totalSkills}: remove some to save.`);
  });

  it("two parts with the same id, at any depth", async () => {
    const cv = await filled();
    expect(sectionIdsDiffer(cv.sections)).toBe(true);
    const twins = structuredClone(cv.sections);
    const e = experience(twins).entries[0];
    e.bullets[1].id = e.bullets[0].id;
    expect(sectionIdsDiffer(twins)).toBe(false);
    const out = await patch(cv.id, { rev: cv.rev, sections: twins });
    expect(out.status).toBe(400);
    expect(out.body.message).toContain("same id");
    const sameEntry = structuredClone(cv.sections);
    experience(sameEntry).entries[1].id = experience(sameEntry).entries[0].id;
    expect(sectionIdsDiffer(sameEntry)).toBe(false);
  });

  it("names the list that is too long, whichever it is", () => {
    const tooMany = (key: string, sections: unknown) => {
      const parsed = EditableSchema.safeParse({ sections });
      expect(parsed.success, key).toBe(false);
      return parsed.success ? "" : saveProblem(parsed.error);
    };
    const item = (i: number) => ({ id: `i_${String(i).padStart(4, "0")}`, name: `Item ${i}`, level: "", visible: true });
    expect(tooMany("items", [{ id: "s_0001", kind: "interests", visible: true, title: "", items: Array.from({ length: 41 }, (_, i) => item(i)) }])).toBe("One list has more than 40 items. Remove one to save.");
    expect(tooMany("entries", [{ id: "s_0001", kind: "experience", visible: true, title: "", entries: Array.from({ length: 41 }, () => emptyEntry()) }])).toBe("One section has more than 40 entries. Remove one to save.");
  });
});

describe("a save far larger than any CV", () => {
  it("is refused with a reason, and a body with no size given is not read to the end", async () => {
    const cv = await filled();
    const { MAX_SAVE_BYTES } = await import("./access");
    // Declared: refused on its size alone.
    const declared = await one.PATCH(new Request("http://localhost/api", { method: "PATCH", headers: { "Content-Type": "application/json", "content-length": String(20 * 1024 * 1024) }, body: JSON.stringify({ rev: cv.rev, name: "x" }) }), ctx(cv.id));
    expect(declared.status).toBe(413);
    expect((await declared.json()).message).toBe("That is more than a CV can hold, so it was not saved. Shorten what you pasted and try again.");
    // Not declared: counted as it arrives, and stopped just past the limit.
    let sent = 0;
    const piece = new TextEncoder().encode("x".repeat(256 * 1024));
    const body = new ReadableStream<Uint8Array>({
      start: (c) => c.enqueue(new TextEncoder().encode(`{"rev":${cv.rev},"name":"`)),
      pull(c) {
        if (sent >= 40 * 1024 * 1024) return c.close();
        sent += piece.length;
        c.enqueue(piece);
      },
    });
    const streamed = await one.PATCH(new Request("http://localhost/api", { method: "PATCH", headers: { "Content-Type": "application/json" }, body, duplex: "half" } as RequestInit), ctx(cv.id));
    expect(streamed.status).toBe(413);
    expect(sent).toBeLessThan(MAX_SAVE_BYTES + 2 * 1024 * 1024);
    // The screen treats it as a refusal, so it is shown and not retried for ever.
    expect(isRefusal(413)).toBe(true);
    // Nothing was saved.
    expect((await store.getOwnCv(cv.id, alice.id))!.rev).toBe(cv.rev);
  });
});

describe("what the server keeps is what the form allows", () => {
  it("text at the form's limit is kept whole; nothing is cut behind the person's back", async () => {
    const cv = await filled();
    const sections = structuredClone(cv.sections);
    const text = "y".repeat(LIMITS.bullet);
    experience(sections).entries[0].bullets[0].text = text;
    const out = await patch(cv.id, { rev: cv.rev, sections });
    expect(out.status).toBe(200);
    expect(experience(out.body.cv.sections).entries[0].bullets[0].text).toBe(text);
  });
});

describe("the save hook's decisions", () => {
  it("only an answer that says no for good is a refusal", () => {
    expect([400, 413, 422].map(isRefusal)).toEqual([true, true, true]);
    // No answer, a conflict and a server fault are not: the first two have their own handling, the last is tried again.
    expect([0, 409, 500, 503].map(isRefusal)).toEqual([false, false, false, false]);
  });

  it("knows its own save when the answer was lost and the copy on the server carries its name", () => {
    const unanswered = new Set(["save-a"]);
    expect(isOwnSave("save-a", unanswered)).toBe(true);
    expect(isOwnSave("someone-else", unanswered)).toBe(false);
    expect(isOwnSave(undefined, unanswered)).toBe(false);
  });

  it("the same change sent twice is applied once, and a later change from the older copy is a conflict naming that save", async () => {
    const cv = await filled();
    const first = await patch(cv.id, { rev: cv.rev, saveId: "save-a", name: "Renamed once" });
    expect(first.body.cv.rev).toBe(cv.rev + 1);
    // The answer was lost; the browser sends the identical change again under the same name.
    const again = await patch(cv.id, { rev: cv.rev, saveId: "save-a", name: "Renamed once" });
    expect(again.status).toBe(200);
    expect(again.body.cv.rev).toBe(cv.rev + 1);
    // More was typed before the retry: a new name, the old revision. The server says conflict and shows whose save it holds.
    const later = await patch(cv.id, { rev: cv.rev, saveId: "save-b", name: "Renamed twice" });
    expect(later.status).toBe(409);
    expect(isOwnSave(later.body.cv.lastSaveId, new Set(["save-a"]))).toBe(true);
    // Carrying on from the server's revision, the newer change goes in.
    expect((await patch(cv.id, { rev: later.body.cv.rev, saveId: "save-b", name: "Renamed twice" })).body.cv.name).toBe("Renamed twice");
  });

  it("the size above which a save is not sent as the page is left is under the browser's limit", () => {
    expect(KEEPALIVE_MAX).toBeLessThan(64 * 1024);
  });

  it("tidied spacing is not a difference worth telling the person about; lost text is", () => {
    // The server trims and closes up runs of spaces: the screen need not say anything about that.
    expect(sameButSpacing({ fullName: "Fern  Castellanos " }, { fullName: "Fern Castellanos" })).toBe(true);
    expect(sameButSpacing("Two\n\nlines", "Two lines")).toBe(true);
    // Text that was cut, or a character that was taken out, is a difference.
    expect(sameButSpacing({ fullName: "Fern Castellanos-Okonkwo" }, { fullName: "Fern Castellanos" })).toBe(false);
    expect(sameButSpacing("co\u00adoperate", "cooperate")).toBe(false);
    expect(sameButSpacing(undefined, null)).toBe(true);
  });

  it("what the server stored is sent back, so the screen can show it where it differs", async () => {
    const cv = await filled();
    const sections = structuredClone(cv.sections) as Section[];
    // A soft hyphen cannot be stored (it is invisible, and breaks the file checks): the answer carries the stored text.
    experience(sections).entries[0].bullets[0].text = "Co\u00adordinated the  weekend rota";
    const out = await patch(cv.id, { rev: cv.rev, sections });
    expect(out.status).toBe(200);
    const stored = experience(out.body.cv.sections).entries[0].bullets[0].text;
    expect(stored).toBe("Coordinated the weekend rota");
    expect(sameButSpacing("Co\u00adordinated the  weekend rota", stored)).toBe(false);
  });
});
