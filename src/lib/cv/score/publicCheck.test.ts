import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * The free public check, attacked. It needs no account, so anything can be
 * sent to it: a body of any size, fields nobody asked for, ids that are not
 * ids, an "email" that is one character long. And the text someone pastes
 * into it is their CV, so it must not be kept for ever or handed to whoever
 * has the link. Last: "Open in CV Builder" must carry that text into the
 * builder for a brand-new visitor, without their pasting it again.
 */

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-check-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
  getCurrentUser: async () => signedIn,
}));

const check = await import("@/app/api/audit/route");
const one = await import("@/app/api/audit/[id]/route");
const unlock = await import("@/app/api/audit/[id]/unlock/route");
const fromCheck = await import("@/app/api/cv/imports/from-check/route");
const imports = await import("@/app/api/cv/imports/route");
const confirm = await import("@/app/api/cv/imports/[id]/confirm/route");
const store = await import("@/lib/cv/store");
const db = await import("@/lib/apply/db");
const { auditText } = await import("./audit");
const { CHECK_DAYS, MAX_CHECK_BYTES, UNLOCKS_A_MINUTE, getCheck, isCheckId, purgeExpiredChecks, saveCheck, summaryOf } = await import("./publicCheck");
type Audit = import("@/lib/apply/schema").Audit;

const alice = { id: "usr_alice", email: "alice@example.com" };
const bob = { id: "usr_bob", email: "bob@example.com" };
const TEXT = `Ada Example
Leeds · ada@example.com · 07700 900123

Experience
Gallery Assistant, Northgate Museum
Sep 2019 – Present
- Catalogued 1,200 objects in the collections database in one year
- Trained four volunteers to handle ceramics safely each term
- Wrote the 12-page handling guide used at every induction

Education
BA History, University of Leeds, 2016 – 2019
`;

const json = (body: unknown, headers: Record<string, string> = {}) => new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const get = () => new Request("http://localhost/api");
const made = async (body: Record<string, unknown> = {}) => {
  const res = await check.POST(json({ text: TEXT, region: "uk", ...body }));
  return { status: res.status, body: (await res.json()) as { auditId: string; score: number; summary: string; totalFindingsCount: number; interviewerQuestionsCount: number; isGoodEnough: boolean; message?: string; error?: string } };
};
const seen = async (id: string) => {
  const res = await one.GET(get(), ctx(id));
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
};
const opened = async (id: string, body: unknown, headers: Record<string, string> = {}) => {
  const res = await unlock.POST(json(body, headers), ctx(id));
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
};
const stored = (id: string) => db.getDoc<Audit>(db.APPLY_COLLECTIONS.AUDITS, id);

beforeEach(() => {
  signedIn = null;
  for (const k of Object.keys(globalThis._applyMemoryStore ?? {})) delete globalThis._applyMemoryStore![k];
  fs.rmSync(path.join(dataDir, "apply"), { recursive: true, force: true });
  (globalThis as unknown as { __hakkiriRate?: Map<string, number[]> }).__hakkiriRate?.clear();
  delete (globalThis as unknown as { __hakkiriCheckSweep?: number }).__hakkiriCheckSweep;
  vi.restoreAllMocks();
});

describe("what a check's id may be", () => {
  it("only an id this app made is looked up at all", async () => {
    for (const id of ["__proto__", "constructor", "toString", "hasOwnProperty", "aud_", "aud_../../x", "aud_a b", "lead_0123456789abcdef", "", "aud_" + "a".repeat(41)]) {
      expect(isCheckId(id), id).toBe(false);
      expect((await seen(id)).status, id).toBe(404);
      expect((await opened(id, { email: "ada@example.com" })).status, id).toBe(404);
    }
    expect(isCheckId("aud_0123456789abcdef")).toBe(true);
    // One that has the right shape and does not exist is also just "not found".
    expect((await seen("aud_0123456789abcdef")).status).toBe(404);
  });
});

describe("what is stored for a check", () => {
  it("only the fields a check has, each within its limit, whatever else was sent", async () => {
    const out = await made({ region: "R".repeat(5000), docType: "D".repeat(5000), jobText: "j".repeat(9000), userId: "usr_someone_else", unlockedBy: "lead_me", score: 100, expiresAt: "2999-01-01T00:00:00.000Z", junk: { a: "x".repeat(5000) } });
    expect(out.status).toBe(200);
    const doc = (await stored(out.body.auditId))!;
    expect(Object.keys(doc).filter((k) => doc[k as keyof Audit] !== undefined && k !== "updatedAt").sort()).toEqual(["createdAt", "docType", "expiresAt", "findings", "id", "interviewerQuestions", "jobText", "modelVersion", "region", "rubricVersion", "score", "subscores", "teaser", "text", "textHash"].sort());
    expect([doc.region, doc.docType]).toEqual(["uk", "cv"]);
    expect(doc.jobText).toHaveLength(5000);
    // Nothing the sender claimed about the check is taken from them.
    expect(doc.userId).toBeUndefined();
    expect(doc.unlockedBy).toBeUndefined();
    expect(doc.score).toBe(auditText(TEXT, "uk").score);
    const days = (Date.parse(doc.expiresAt) - Date.parse(doc.createdAt)) / 86_400_000;
    expect(days).toBeCloseTo(CHECK_DAYS, 5);
    expect(JSON.stringify(doc).length).toBeLessThan(40_000);
  });

  it("text over the limit, or too little to be a CV, is refused with a reason", async () => {
    expect((await made({ text: "x".repeat(25_001) })).status).toBe(400);
    expect((await made({ text: "too short" })).body.message).toBe("Please provide at least 50 characters of CV text or upload a document.");
    expect((await made({ text: 12345 })).status).toBe(400);
    const notJson = await check.POST(json("{ this is not json"));
    expect(notJson.status).toBe(400);
  });
});

describe("the size of what is sent", () => {
  const streamed = (total: number, headers: Record<string, string> = {}) => {
    let sent = 0;
    const piece = new TextEncoder().encode("a".repeat(64 * 1024));
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"text":"'));
      },
      pull(controller) {
        if (sent >= total) return controller.close();
        sent += piece.length;
        controller.enqueue(piece);
      },
    });
    return { req: new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body, duplex: "half" } as RequestInit), sentSoFar: () => sent };
  };

  it("a body that says it is over the limit is refused before any of it is read", async () => {
    const res = await check.POST(json({ text: "a".repeat(MAX_CHECK_BYTES + 10) }, { "content-length": String(MAX_CHECK_BYTES + 100) }));
    expect(res.status).toBe(413);
    expect((await res.json()).message).toBe("That is more text than a CV holds. Paste up to 25,000 characters.");
  });

  it("a 20 MB body with no size given is stopped just past the limit, not read to the end and parsed", async () => {
    const big = streamed(20 * 1024 * 1024);
    const res = await check.POST(big.req);
    expect(res.status).toBe(413);
    expect(big.sentSoFar()).toBeLessThan(MAX_CHECK_BYTES + 512 * 1024);
  });

  it("an unlock is held to a few kilobytes", async () => {
    const out = await made();
    expect((await opened(out.body.auditId, { email: "ada@example.com", padding: "x".repeat(20_000) })).status).toBe(400);
  });
});

describe("how long a check is kept", () => {
  const aged = async (daysAgo: number): Promise<string> => {
    const id = (await made()).body.auditId;
    const doc = (await stored(id))!;
    await saveCheck({ ...doc, expiresAt: new Date(Date.now() + (CHECK_DAYS - daysAgo) * 86_400_000).toISOString() });
    return id;
  };

  it("past its date it is gone: not shown, not unlockable, and removed from the store when asked for", async () => {
    const old = await aged(CHECK_DAYS + 1);
    const fresh = await aged(1);
    expect((await seen(old)).status).toBe(404);
    expect(await stored(old)).toBeNull();
    expect((await seen(fresh)).status).toBe(200);
    const other = await aged(CHECK_DAYS + 5);
    expect((await opened(other, { email: "ada@example.com" })).status).toBe(404);
    expect(await getCheck(other)).toBeNull();
  });

  it("old checks are cleared out as new ones are made, without anyone asking for them", async () => {
    const old = [await aged(CHECK_DAYS + 1), await aged(CHECK_DAYS + 40)];
    const fresh = await aged(2);
    // The clear-out runs at most once an hour: let it run now.
    delete (globalThis as unknown as { __hakkiriCheckSweep?: number }).__hakkiriCheckSweep;
    await made();
    for (const id of old) expect(await stored(id), id).toBeNull();
    expect(await stored(fresh)).not.toBeNull();
    // Asked directly, it reports how many it removed.
    const another = await aged(CHECK_DAYS + 1);
    expect(await purgeExpiredChecks(new Date(), true)).toBe(1);
    expect(await stored(another)).toBeNull();
  });

  it("a record with no date, or a date that is not one, counts as past it", async () => {
    const id = (await made()).body.auditId;
    await saveCheck({ ...(await stored(id))!, expiresAt: "never" });
    expect((await seen(id)).status).toBe(404);
  });
});

describe("unlocking the full report", () => {
  it("needs something with the shape of an email address", async () => {
    const id = (await made()).body.auditId;
    for (const email of ["@", "x1@", "@example.com", "ada", "ada@example", "ada @example.com", "", null, 42, { a: 1 }, `${"a".repeat(200)}@example.com`]) {
      // Each try here is counted as a new minute: the limit on tries has its own test below.
      (globalThis as unknown as { __hakkiriRate?: Map<string, number[]> }).__hakkiriRate?.clear();
      const out = await opened(id, { email });
      expect(out.status, String(email)).toBe(400);
      expect(out.body.message).toBe("Please enter a valid email address.");
    }
    expect((await seen(id)).body.isUnlocked).toBe(false);
    // A body that is not JSON is a bad request, not a server error.
    expect((await opened(id, "not json")).status).toBe(400);
  });

  it("with a real address it opens, and answers without sending the record back", async () => {
    const id = (await made()).body.auditId;
    const out = await opened(id, { email: " Ada@Example.com ", marketing: "yes please" });
    expect(out.status).toBe(200);
    expect(out.body).toEqual({ success: true, id, message: "Report unlocked successfully." });
    const lead = await db.getLead("ada@example.com");
    // Consent to marketing is only ever a plain "true".
    expect(lead).toMatchObject({ email: "ada@example.com", consent: { marketing: false } });
    expect((await seen(id)).body.isUnlocked).toBe(true);
  });

  it("is limited by address: a person makes one request, a script makes sixty", async () => {
    const id = (await made()).body.auditId;
    const codes: number[] = [];
    for (let i = 0; i < 60; i++) codes.push((await opened(id, { email: `x${i}@` })).status);
    expect(codes.filter((c) => c === 400)).toHaveLength(UNLOCKS_A_MINUTE);
    expect(codes.filter((c) => c === 429)).toHaveLength(60 - UNLOCKS_A_MINUTE);
    expect(await db.queryDocs(db.APPLY_COLLECTIONS.LEADS, () => true)).toHaveLength(0);
  });
});

describe("what is sent back", () => {
  it("before unlocking: the score and the first findings only", async () => {
    const id = (await made()).body.auditId;
    const { body } = await seen(id);
    expect(Object.keys(body).sort()).toEqual(["id", "isUnlocked", "score", "subscores", "teaser", "teaserFindings", "totalFindingsCount"].sort());
  });

  it("after unlocking: the report, and never the pasted text, its hash or who unlocked it", async () => {
    const id = (await made()).body.auditId;
    await opened(id, { email: "ada@example.com" });
    const { body } = await seen(id);
    expect(Object.keys(body).sort()).toEqual(["createdAt", "expiresAt", "findings", "id", "interviewerQuestions", "isGoodEnough", "isUnlocked", "region", "score", "subscores", "summary", "teaser"].sort());
    const sent = JSON.stringify(body);
    expect(sent).not.toContain("07700 900123");
    expect(sent).not.toContain("lead_");
  });

  it("the words about the score are made from the check itself", async () => {
    const out = await made();
    const result = auditText(TEXT, "uk");
    const high = result.findings.filter((f) => f.severity === "high").length;
    expect(out.body.summary).toBe(summaryOf(result));
    // This text has three lines where a CV needs six: it says so, and is not called ready.
    expect(out.body.summary).toBe("There is not much here to score yet: 3 lines saying what you did, where a CV needs at least 6. Add what you did in each role and check it again.");
    expect(out.body.isGoodEnough).toBe(false);
    expect(high).toBeGreaterThanOrEqual(0);

    const longer = TEXT.replace("\nEducation", "- Cut retrieval time from 3 days to 1 by re-shelving the store\n- Scanned 600 glass negatives for the online collection in one summer\n- Ran the monthly conservation audit across both stores for two years\n\nEducation");
    const full = auditText(longer, "uk");
    const said = summaryOf(full);
    const issues = full.findings.filter((f) => f.severity === "high").length;
    const suggestions = full.findings.length - issues;
    if (!full.isGoodEnough) {
      if (issues) expect(said).toContain(`${issues} ${issues === 1 ? "issue" : "issues"}`);
      if (suggestions) expect(said).toContain(`${suggestions} ${suggestions === 1 ? "suggestion" : "suggestions"}`);
      expect(said).toMatch(/The part that scored lowest is (evidence|clarity|structure|how software reads it), at \d+%\./);
    }
    expect(said).not.toMatch(/callback|dramatically|🌟|👍/);
  });
});

describe("a check made or opened while signed in belongs to the account", () => {
  it("it is in “Download my data” and goes with “Delete all my data”; someone else's stays", async () => {
    signedIn = alice;
    const mine = (await made()).body.auditId;
    expect((await stored(mine))!.userId).toBe(alice.id);
    // The owner sees the full report without unlocking it.
    expect((await seen(mine)).body.isUnlocked).toBe(true);
    signedIn = bob;
    const theirs = (await made()).body.auditId;
    expect((await seen(mine)).body.isUnlocked).toBe(false);
    // Made signed out, unlocked signed in: tied to the account then.
    signedIn = null;
    const later = (await made()).body.auditId;
    signedIn = alice;
    await opened(later, { email: "alice@example.com" });
    expect((await stored(later))!.userId).toBe(alice.id);

    expect((await store.exportCvData(alice.id)).freeChecks.map((c) => c.id).sort()).toEqual([mine, later].sort());
    await store.deleteCvData(alice.id);
    expect(await stored(mine)).toBeNull();
    expect(await stored(later)).toBeNull();
    expect(await stored(theirs)).not.toBeNull();
    expect((await store.exportCvData(alice.id)).freeChecks).toEqual([]);
  });
});

describe("“Open in CV Builder” carries the checked text across", () => {
  const start = async (auditId: unknown) => {
    const res = await fromCheck.POST(json({ auditId }));
    return { status: res.status, body: (await res.json()) as { importId?: string; versionId?: string; status?: string; message?: string } };
  };
  /** A new visitor: checks a CV with no account, unlocks the report, then signs up. */
  const visitorThenAccount = async () => {
    signedIn = null;
    const id = (await made()).body.auditId;
    await opened(id, { email: "ada@example.com" });
    signedIn = alice;
    return id;
  };

  it("starts a CV from the text of the check, through the same reader as pasted text", async () => {
    const id = await visitorThenAccount();
    const out = await start(id);
    expect(out.status).toBe(201);
    expect(out.body.status).toBe("needs-review");
    const imp = (await store.getOwnImport(out.body.importId!, alice.id))!;
    expect(imp).toMatchObject({ checkId: id, source: "text", versionId: out.body.versionId });
    // What was pasted into the check is what was read: nothing typed again.
    expect(imp.draft.contact).toMatchObject({ fullName: "Ada Example", email: "ada@example.com" });
    const role = imp.draft.sections.flatMap((s) => ("entries" in s && s.kind === "experience" ? s.entries : []))[0];
    expect(role.bullets.map((b) => b.text)).toEqual(["Catalogued 1,200 objects in the collections database in one year", "Trained four volunteers to handle ceramics safely each term", "Wrote the 12-page handling guide used at every induction"]);
    const cv = (await store.getOwnCv(out.body.versionId!, alice.id))!;
    expect(cv).toMatchObject({ name: "CV from my free check", region: "uk" });
    // The check now belongs to the account.
    expect((await stored(id))!.userId).toBe(alice.id);
  });

  it("opening it in the builder lands on the score, where the findings are; an ordinary upload lands on the builder", async () => {
    const id = await visitorThenAccount();
    const out = await start(id);
    const done = await (await confirm.POST(json({}), ctx(out.body.importId!))).json();
    expect(done).toEqual({ versionId: out.body.versionId, next: "findings" });
    const cv = (await store.getOwnCv(out.body.versionId!, alice.id))!;
    expect(cv.contact.fullName).toBe("Ada Example");
    // The same CV, the same checks: the list shows a score for it straight away.
    expect((await store.listCvSummaries(alice.id))[0].score).toBeGreaterThan(0);

    const fd = new FormData();
    for (const [k, v] of Object.entries({ name: "Pasted", level: "experienced", region: "uk", text: TEXT })) fd.set(k, v);
    const pasted = await (await imports.POST(new Request("http://localhost/api", { method: "POST", body: fd }))).json();
    expect(await (await confirm.POST(json({}), ctx(pasted.importId))).json()).toEqual({ versionId: pasted.versionId, next: "edit" });
  });

  it("asked twice (a reload, the Back button), it makes one CV, not two", async () => {
    const id = await visitorThenAccount();
    const first = await start(id);
    const again = await start(id);
    expect(again.status).toBe(200);
    expect(again.body).toEqual({ importId: first.body.importId, versionId: first.body.versionId, status: "needs-review" });
    expect(await store.listOwnCvs(alice.id)).toHaveLength(1);
    // And after it has been opened in the builder, it says so.
    await confirm.POST(json({}), ctx(first.body.importId!));
    expect((await start(id)).body.status).toBe("confirmed");
    expect(await store.listOwnCvs(alice.id)).toHaveLength(1);
  });

  it("needs an account, a real id, and a check that was unlocked or is the person's own", async () => {
    const id = await visitorThenAccount();
    signedIn = null;
    expect((await fromCheck.POST(json({ auditId: id }))).status).toBe(401);
    signedIn = alice;
    for (const bad of ["__proto__", "constructor", "", 42, null]) expect((await start(bad)).status, String(bad)).toBe(400);
    // A check nobody unlocked: knowing its id is not enough to be given its text.
    signedIn = null;
    const locked = (await made()).body.auditId;
    signedIn = bob;
    const refused = await start(locked);
    expect(refused.status).toBe(404);
    expect(refused.body.message).toBe("That check is no longer available. Checks are kept for 30 days. Paste the text of your CV to start again.");
    expect(await store.listOwnCvs(bob.id)).toHaveLength(0);
    // A check past its date is gone here too.
    await saveCheck({ ...(await stored(id))!, expiresAt: new Date(Date.now() - 1000).toISOString() });
    signedIn = alice;
    expect((await start(id)).status).toBe(404);
  });
});
