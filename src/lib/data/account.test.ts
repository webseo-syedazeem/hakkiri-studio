import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";
import type { User } from "@/lib/types";

process.env.HAKKIRI_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-account-"));

// Who is signed in is chosen by each test. Everything else is the real code.
let current: (User & { id: string }) | null = null;
vi.mock("@/lib/auth/require", () => ({
  getCurrentUser: async () => current,
  requireUser: async () => {
    if (!current?.id) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return current;
  },
  requirePageUser: async () => current,
}));

const { dataCounts, deleteAccount, deleteAll, deleteEverything, exportAll, hasData, pruneOldRecordings } = await import("./account");
const { DELETE_ACCOUNT_PHRASE } = await import("./confirm");
const { audio, seedEverything } = await import("@/test/seed");
const { getRecording, saveRecordings } = await import("@/lib/answers/audio");
const { allAnswers, findAnswer, saveAnswer } = await import("@/lib/answers/store");
const { allSavedInterviews, DEMO_INTERVIEW_ID, getInterview, saveInterview } = await import("@/lib/interviews/store");
const { allMocks, saveMock } = await import("@/lib/mocks/store");
const { allCustomQuestions } = await import("@/lib/questions/store");
const { allPitchData, deletePresentation, getPresentation, getRun, listPresentations, listRuns, savePresentation, saveRun } = await import("@/lib/pitch/store");
const { demoPresentation, demoRuns } = await import("@/lib/pitch/demo");
const { roadmapAnswer } = await import("@/lib/mock-data");
const { getSettings, saveSettings } = await import("@/lib/settings/store");
const { allUsage, recordUsage, usageFor, withUsageContext } = await import("@/lib/usage/store");
const { limitStanding } = await import("@/lib/usage/limits");
const { recentFeedback } = await import("@/lib/feedback/store");
const { recentSurveys } = await import("@/lib/feedback/survey-store");
const { recentProblems } = await import("@/lib/alerts/store");
const { exportApplyData } = await import("@/lib/apply/db");
const { exportCvData } = await import("@/lib/cv/store");
const users = await import("@/lib/auth/user-db");
const deleteDataRoute = await import("@/app/api/data/delete/route");
const deleteAccountRoute = await import("@/app/api/account/delete/route");
const settingsRoute = await import("@/app/api/settings/route");
const surveyRoute = await import("@/app/api/feedback/survey/route");

const PASSWORD = "a long and unusual phrase 41";
let n = 0;
/** A real account, as sign-up makes it. */
async function account(name: string) {
  const made = await users.createUser(`${name.toLowerCase()}${++n}_${Date.now()}@example.com`, PASSWORD, name);
  if (!made.ok) throw new Error(made.error);
  return made.user as User & { id: string; email: string };
}
const json = (body: unknown) => new Request("http://localhost/api/x", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
/** A person's download, unpacked: each file's text (recordings and pictures as their bytes, in hex). */
async function download(userId: string): Promise<Record<string, string>> {
  const zip = await JSZip.loadAsync(await exportAll(userId));
  const out: Record<string, string> = {};
  for (const name of Object.keys(zip.files).sort()) {
    if (zip.files[name].dir) continue;
    out[name] = /\.(json|txt)$/.test(name) ? (await zip.files[name].async("string")).replace(/"exportedAt": "[^"]+"/, '"exportedAt": ""') : Buffer.from(await zip.files[name].async("uint8array")).toString("hex");
  }
  return out;
}
/** Everything every store holds, for anybody, as text. */
const everything = async () =>
  JSON.stringify([allSavedInterviews(), allAnswers(), allMocks(), allCustomQuestions(), allPitchData(), recentFeedback(5000), recentSurveys(5000), recentProblems(500), allUsage(), (globalThis as Record<string, unknown>)._applyMemoryStore, [...((globalThis as Record<string, unknown>).__hakkiriDrafts as Map<string, unknown>).values()].map((d) => ({ ...(d as object), audio: undefined }))]);
const rate = () => (globalThis as unknown as { __hakkiriRate?: Map<string, number[]> }).__hakkiriRate;

beforeEach(() => {
  deleteAll();
  current = null;
  rate()?.clear();
  for (const k of Object.keys(globalThis._applyMemoryStore ?? {})) delete globalThis._applyMemoryStore![k];
  fs.rmSync(path.join(process.env.HAKKIRI_DATA_DIR!, "apply"), { recursive: true, force: true });
});
afterEach(() => vi.unstubAllEnvs());

describe("“Download my data”", () => {
  it("holds everything kept for the person, in every area of the app, and says what is in it", async () => {
    const alice = await account("Alice");
    await seedEverything(alice, "ALICEMARK");
    const zip = await download(alice.id);
    const data = JSON.parse(zip["data.json"]);
    expect(data.account).toMatchObject({ id: alice.id, email: alice.email, name: "Alice", hasPassword: true });
    expect(zip["data.json"]).not.toMatch(/passwordHash|[0-9a-f]{32}:[0-9a-f]{128}/);
    // Their own interview and their own copy of the demo.
    expect(data.interviews.map((i: { id: string }) => i.id).sort()).toEqual([DEMO_INTERVIEW_ID, "iv-ALICEMARK"].sort());
    expect(data.questions.map((q: { text: string }) => q.text)).toEqual(["Why did ALICEMARK leave?"]);
    expect(data.sessions.map((s: { id: string }) => s.id)).toEqual(["mock-ALICEMARK"]);
    expect(data.answers.map((a: { id: string }) => a.id)).toEqual(["ans-ALICEMARK"]);
    expect(data.inProgress).toMatchObject([{ id: "draft-ALICEMARK", turns: [{ asked: "A question for ALICEMARK" }] }]);
    expect(JSON.stringify(data.inProgress)).not.toContain("audio");
    expect(data.presentations.map((p: { title: string }) => p.title)).toEqual(["ALICEMARK deck"]);
    expect(data.rehearsals).toHaveLength(1);
    expect(data.audienceQa).toHaveLength(1);
    expect(data.usage).toMatchObject([{ userId: alice.id, seconds: 120 }]);
    expect(data.settings).toEqual({ retentionDays: 365 });
    expect(data.feedback.map((f: { text: string }) => f.text)).toEqual(["ALICEMARK says the report was useful"]);
    expect(data.survey).toMatchObject([{ email: alice.email, q1_realism: "ALICEMARK found it realistic" }]);

    const apply = JSON.parse(zip["apply.json"]);
    for (const part of ["jobs", "evidence", "cvs", "outputs", "matches", "applications", "sends", "profiles", "voices", "settings", "leads", "audits"]) expect(Array.isArray(apply[part]), part).toBe(true);
    expect(apply.jobs.map((j: { id: string }) => j.id).sort()).toEqual(["job-ALICEMARK", "job-old-ALICEMARK"]);
    for (const part of ["evidence", "outputs", "matches", "sends", "profiles", "voices", "settings", "leads", "audits"]) expect(JSON.stringify(apply[part]), part).toContain("ALICEMARK");
    expect(apply.applications).toHaveLength(2);
    expect(JSON.stringify(apply.leads)).not.toContain("magicTokenHash");
    expect(JSON.parse(zip["cvs.json"]).cvs.map((c: { name: string }) => c.name)).toEqual(["ALICEMARK CV"]);

    // The audio of the answer, of the rehearsal and of the Q&A answer, and the slide picture.
    const audioHex = Buffer.from("audio of ALICEMARK").toString("hex");
    expect(Object.keys(zip).filter((f) => f.startsWith("recordings/")).sort()).toEqual(["recordings/ans-ALICEMARK-0.webm", "recordings/qa-ALICEMARK-a0-0.webm", "recordings/run-r-ALICEMARK-0.webm"]);
    for (const f of Object.keys(zip).filter((x) => x.startsWith("recordings/"))) expect(zip[f]).toBe(audioHex);
    expect(zip["slides/p-ALICEMARK/slide-1.png"]).toBe(Buffer.from("audio of ALICEMARK slide").toString("hex"));

    // The README names each file, and is honest about what is not in it.
    for (const said of ["data.json", "apply.json", "cvs.json", "recordings/", "slides/", "never your password", "kept only in the browser", "Experience Library"]) expect(zip["README.txt"]).toContain(said);
  });

  it("holds nothing of anyone else's", async () => {
    const alice = await account("Alice");
    const bob = await account("Bob");
    await seedEverything(alice, "ALICEMARK");
    await seedEverything(bob, "BOBMARK");
    const [hers, his] = [await download(alice.id), await download(bob.id)];
    for (const [name, text] of Object.entries(hers)) expect(text.includes("BOBMARK") || text.includes(bob.id) || text.includes(bob.email) || name.includes("BOBMARK"), name).toBe(false);
    for (const [name, text] of Object.entries(his)) expect(text.includes("ALICEMARK") || text.includes(alice.id) || text.includes(alice.email) || name.includes("ALICEMARK"), name).toBe(false);
    expect(Object.keys(hers).length).toBe(Object.keys(his).length);
  });

  it("a new account's download is empty, and asking for it creates nothing", async () => {
    const carol = await account("Carol");
    const zip = await download(carol.id);
    const data = JSON.parse(zip["data.json"]);
    for (const part of ["interviews", "questions", "sessions", "answers", "inProgress", "presentations", "rehearsals", "audienceQa", "usage", "feedback", "survey"]) expect(data[part], part).toEqual([]);
    expect(data.settings).toBeNull();
    expect(Object.keys(zip).sort()).toEqual(["README.txt", "cvs.json", "data.json"]);
    // No settings row was made for the Apply area by looking.
    expect(Object.values(await exportApplyData(carol.id, carol.email)).flat()).toEqual([]);
    expect(hasData(dataCounts(carol.id))).toBe(false);
  });
});

describe("“Delete all my data”", () => {
  it("removes everything held for the person, everywhere, and leaves the other person's exactly as it was", async () => {
    const alice = await account("Alice");
    const bob = await account("Bob");
    await seedEverything(alice, "ALICEMARK");
    const bobs = await seedEverything(bob, "BOBMARK");
    // (A job saved before jobs carried an owner is marked as the person's the first time it is read: read once first.)
    await download(bob.id);
    const bobBefore = await download(bob.id);
    const bobCounts = dataCounts(bob.id);
    expect(dataCounts(alice.id)).toMatchObject({ interviews: 2, sessions: 1, answers: 1, recordings: 3, presentations: 1, rehearsals: 2 });

    const done = await deleteEverything(alice.id);
    expect(done.apply).toBeGreaterThanOrEqual(13);
    expect(done).toMatchObject({ cvs: 1, surveys: 1 });

    // Nothing of hers is left anywhere, for anybody.
    const all = await everything();
    expect(all).not.toContain("ALICEMARK");
    expect(all).not.toContain(alice.email);
    expect(hasData(dataCounts(alice.id))).toBe(false);
    for (const id of ["ans-ALICEMARK", "run-r-ALICEMARK", "qa-ALICEMARK-a0"]) expect(getRecording(id, 0), id).toBeNull();
    // Every kind of CV record is empty for her, whatever kinds the CV section holds (CVs, uploads, achievements,
    // download records, file checks…): checked by kind, so a kind added later is covered too.
    const cvLeft = await exportCvData(alice.id);
    expect(Object.keys(cvLeft).length).toBeGreaterThanOrEqual(3);
    for (const [kind, rows] of Object.entries(cvLeft)) expect(rows, kind).toEqual([]);
    expect(Object.values(await exportApplyData(alice.id, alice.email)).flat()).toEqual([]);
    // Her copy of the demo is the built-in one again.
    expect(JSON.stringify(getInterview(DEMO_INTERVIEW_ID, alice.id))).not.toContain("ALICEMARK");
    expect(getSettings(alice.id)).toEqual({ retentionDays: 90 });

    // Her download afterwards: the account, and nothing else.
    const after = await download(alice.id);
    expect(Object.keys(after).sort()).toEqual(["README.txt", "cvs.json", "data.json"]);
    const data = JSON.parse(after["data.json"]);
    for (const part of ["interviews", "questions", "sessions", "answers", "inProgress", "presentations", "rehearsals", "audienceQa", "feedback", "survey"]) expect(data[part], part).toEqual([]);
    expect(data.settings).toBeNull();
    expect(data.account.email).toBe(alice.email);

    // Bob's is byte for byte what it was, recordings and all.
    const bobAfter = await download(bob.id);
    for (const name of Object.keys(bobBefore)) expect(bobAfter[name], name).toBe(bobBefore[name]);
    expect(bobAfter).toEqual(bobBefore);
    expect(dataCounts(bob.id)).toEqual(bobCounts);
    for (const id of bobs.recordingIds) expect(getRecording(id, 0), id).not.toBeNull();
    expect((await users.authenticateUser(bob.email, PASSWORD)).ok).toBe(true);
    // And she can still sign in: it was her data that went, not her account.
    expect((await users.authenticateUser(alice.email, PASSWORD)).ok).toBe(true);
  });

  it("leaves her usage as bare counts, so deleting data doesn't reset the monthly allowance", async () => {
    const alice = await account("Alice");
    await seedEverything(alice, "ALICEMARK");
    const before = limitStanding(undefined, alice.id).minutesToday;
    expect(before).toBeCloseTo(2, 5);
    await deleteEverything(alice.id);
    const rows = allUsage(alice.id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ userId: alice.id, service: "deepgram", seconds: 120 });
    for (const link of ["interviewId", "sessionId", "presentationId"]) expect(rows[0]).not.toHaveProperty(link);
    expect(limitStanding(undefined, alice.id).minutesToday).toBeCloseTo(before, 5);
  });

  it("through the route: needs the typed word, deletes only the signed-in person's data, and answers when it is done", async () => {
    const alice = await account("Alice");
    const bob = await account("Bob");
    await seedEverything(alice, "ALICEMARK");
    await seedEverything(bob, "BOBMARK");
    expect((await deleteDataRoute.POST(json({ confirm: "delete" }))).status).toBe(401);
    current = alice;
    for (const bad of [{}, { confirm: "DELETE" }, { confirm: "yes" }, "delete"]) expect((await deleteDataRoute.POST(json(bad))).status, JSON.stringify(bad)).toBe(400);
    expect(hasData(dataCounts(alice.id))).toBe(true);
    // Naming someone else in the request changes nothing about whose data goes.
    expect((await deleteDataRoute.POST(json({ confirm: "delete", userId: bob.id }))).status).toBe(200);
    expect(hasData(dataCounts(alice.id))).toBe(false);
    expect(dataCounts(bob.id)).toMatchObject({ interviews: 2, answers: 1, recordings: 3 });
    expect(await everything()).not.toContain("ALICEMARK");
  });

  it("does not open a second voucher claim: the account remembers it has claimed", async () => {
    const alice = await account("Alice");
    const seeded = await seedEverything(alice, "ALICEMARK");
    current = alice;
    const answers = { email: alice.email, q1_realism: "Very", q2_questions: "Good", q3_feedback: "Fair", q4_issues: "None", q7_recommend: "Yes" };
    // The seeded survey row is for this session already.
    expect((await surveyRoute.POST(json({ mockId: seeded.sessionId, ...answers }))).status).toBe(409);
    await deleteEverything(alice.id);
    expect(recentSurveys(1000)).toEqual([]);
    // A first claim after that is allowed once…
    const full = (id: string) => saveMock({ id, interviewId: DEMO_INTERVIEW_ID, kind: "interview", status: "done", settings: { difficulty: "medium", minutes: 20, preset: "balanced", mix: { motivation: 20, competency: 20, technical: 20, cv: 20, curveball: 20 } }, startedAt: new Date().toISOString(), finishedAt: new Date().toISOString(), answerIds: ["a", "b"], planned: 2 } as never, alice.id);
    full("mock-second");
    const claim = await surveyRoute.POST(json({ mockId: "mock-second", ...answers }));
    expect(claim.status).toBe(200);
    expect(recentSurveys(10)[0]).toMatchObject({ userId: alice.id, mockId: "mock-second" });
    // …and deleting her data again, then doing another interview with another address, does not open another.
    await deleteEverything(alice.id);
    full("mock-third");
    const again = await surveyRoute.POST(json({ mockId: "mock-third", ...answers, email: "another.address@example.com" }));
    expect(again.status).toBe(409);
    expect(recentSurveys(1000)).toEqual([]);
  });
});

describe("“Delete my account”", () => {
  it("removes the data, the account and every session; nothing left says the person was here", async () => {
    const alice = await account("Alice");
    const bob = await account("Bob");
    await seedEverything(alice, "ALICEMARK");
    await seedEverything(bob, "BOBMARK");
    // (A job saved before jobs carried an owner is marked as the person's the first time it is read: read once first.)
    await download(bob.id);
    const bobBefore = await download(bob.id);
    const [phone, laptop] = [await users.createSession(alice.id, alice.email), await users.createSession(alice.id, alice.email)];
    const usageRows = allUsage().length;

    const done = await deleteAccount(alice.id);
    expect(done.account).toBe(true);
    expect(await users.accountOf(alice.id)).toBeNull();
    expect(await users.validateSession(phone)).toBeNull();
    expect(await users.validateSession(laptop)).toBeNull();
    expect((await users.authenticateUser(alice.email, PASSWORD)).ok).toBe(false);
    const all = await everything();
    for (const trace of ["ALICEMARK", alice.id, alice.email]) expect(all, trace).not.toContain(trace);
    // The counts the bill is worked out from stay, belonging to nobody.
    expect(allUsage().length).toBe(usageRows);
    expect(allUsage(alice.id)).toEqual([]);
    expect(await download(bob.id)).toEqual(bobBefore);

    // The address is free again, and the new account starts with nothing.
    const fresh = await users.createUser(alice.email, PASSWORD, "Alice Again");
    if (!fresh.ok) throw new Error(fresh.error);
    expect(fresh.user.id).not.toBe(alice.id);
    expect(hasData(dataCounts(fresh.user.id!))).toBe(false);
    expect(limitStanding(undefined, fresh.user.id).minutesToday).toBe(0);
  });

  it("through the route: needs the exact phrase and the account's own password, and signs the browser out", async () => {
    const alice = await account("Alice");
    const bob = await account("Bob");
    await seedEverything(alice, "ALICEMARK");
    expect((await deleteAccountRoute.POST(json({ confirm: DELETE_ACCOUNT_PHRASE, password: PASSWORD }))).status).toBe(401);
    current = alice;
    // The word that deletes data is not enough to delete the account.
    for (const bad of [{ confirm: "delete", password: PASSWORD }, { password: PASSWORD }, {}]) expect((await deleteAccountRoute.POST(json(bad))).status, JSON.stringify(bad)).toBe(400);
    const wrong = await deleteAccountRoute.POST(json({ confirm: DELETE_ACCOUNT_PHRASE, password: "not her password 1" }));
    expect(wrong.status).toBe(403);
    expect(((await wrong.json()) as { message: string }).message).toContain("Nothing has been deleted");
    expect((await deleteAccountRoute.POST(json({ confirm: DELETE_ACCOUNT_PHRASE }))).status).toBe(403);
    expect(await users.accountOf(alice.id)).not.toBeNull();
    expect(hasData(dataCounts(alice.id))).toBe(true);

    const ok = await deleteAccountRoute.POST(json({ confirm: "  Delete My Account ", password: PASSWORD, userId: bob.id }));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("set-cookie")).toMatch(/hakkiri_session=;/);
    expect(await users.accountOf(alice.id)).toBeNull();
    expect(await users.accountOf(bob.id)).not.toBeNull();
    expect(await everything()).not.toContain("ALICEMARK");
  });

  it("a wrong password can be tried a handful of times, not for ever; an account that signs in with Google confirms with the phrase alone", async () => {
    const alice = await account("Alice");
    current = alice;
    for (let i = 0; i < 5; i++) expect((await deleteAccountRoute.POST(json({ confirm: DELETE_ACCOUNT_PHRASE, password: `guess ${i} is wrong` }))).status).toBe(403);
    expect((await deleteAccountRoute.POST(json({ confirm: DELETE_ACCOUNT_PHRASE, password: PASSWORD }))).status).toBe(429);
    expect(await users.accountOf(alice.id)).not.toBeNull();

    const gina = await users.findOrCreateOAuthUser({ email: `gina${++n}@example.com`, name: "Gina", provider: "google" });
    current = gina as User & { id: string };
    expect((await deleteAccountRoute.POST(json({ confirm: DELETE_ACCOUNT_PHRASE }))).status).toBe(200);
    expect(await users.accountOf(gina.id!)).toBeNull();
  });
});

describe("how long recordings are kept", () => {
  const DAY = 86_400_000;

  it("is each person's own choice, applied to their own recordings", async () => {
    const alice = await account("Alice");
    const bob = await account("Bob");
    const a = await seedEverything(alice, "ALICEMARK");
    const b = await seedEverything(bob, "BOBMARK");
    saveSettings({ retentionDays: 30 }, alice.id);
    saveSettings({ retentionDays: 90 }, bob.id);
    const kept = (ids: string[]) => ids.filter((id) => getRecording(id, 0)).length;

    expect(pruneOldRecordings({ force: true, now: Date.now() + 10 * DAY })).toBe(0);
    // After 31 days hers have gone (the answer's, the rehearsal's and the Q&A's) and his have not.
    expect(pruneOldRecordings({ force: true, now: Date.now() + 31 * DAY })).toBe(3);
    expect([kept(a.recordingIds), kept(b.recordingIds)]).toEqual([0, 3]);
    expect(dataCounts(alice.id).recordings).toBe(0);
    expect(dataCounts(bob.id).recordings).toBe(3);
    // Her transcripts and scores stay: only the audio goes.
    expect(findAnswer(a.answerId, alice.id)).toBeDefined();
    expect(pruneOldRecordings({ force: true, now: Date.now() + 91 * DAY })).toBe(3);
    expect(kept(b.recordingIds)).toBe(0);
  });

  it("“until I delete them” keeps them, and one person's choice is never another's", async () => {
    const alice = await account("Alice");
    const bob = await account("Bob");
    const a = await seedEverything(alice, "ALICEMARK");
    saveSettings({ retentionDays: 0 }, alice.id);
    expect(getSettings(bob.id)).toEqual({ retentionDays: 90 });
    expect(pruneOldRecordings({ force: true, now: Date.now() + 5000 * DAY })).toBe(0);
    expect(a.recordingIds.every((id) => getRecording(id, 0))).toBe(true);
  });

  it("changing the setting removes that person's older recordings straight away, and nobody else's", async () => {
    const alice = await account("Alice");
    const bob = await account("Bob");
    const a = await seedEverything(alice, "ALICEMARK");
    const b = await seedEverything(bob, "BOBMARK");
    saveSettings({ retentionDays: 30 }, bob.id);
    // Both sets are 40 days old.
    vi.useFakeTimers({ now: Date.now() + 40 * DAY, toFake: ["Date"] });
    try {
      current = alice;
      for (const bad of [{ retentionDays: 7 }, { retentionDays: "30" }, {}, { retentionDays: 30, userId: bob.id }]) expect((await settingsRoute.POST(json(bad))).status, JSON.stringify(bad)).toBe(400);
      const res = await settingsRoute.POST(json({ retentionDays: 30 }));
      expect(await res.json()).toEqual({ settings: { retentionDays: 30 }, removed: 3 });
      expect(a.recordingIds.some((id) => getRecording(id, 0))).toBe(false);
      // Bob's are older than his own 30 days too, but it was Alice who changed her setting: his are untouched by her request.
      expect(b.recordingIds.every((id) => getRecording(id, 0))).toBe(true);
      expect(getSettings(bob.id)).toEqual({ retentionDays: 30 });
    } finally {
      vi.useRealTimers();
    }
  });

  it("a recording that can't be tied to an account is kept for the default 90 days", () => {
    saveRecordings("ans-orphan", [audio("nobody")]);
    expect(pruneOldRecordings({ force: true, now: Date.now() + 89 * DAY })).toBe(0);
    expect(pruneOldRecordings({ force: true, now: Date.now() + 91 * DAY })).toBe(1);
  });

  it("the recordings count on Settings is the person's own", async () => {
    const alice = await account("Alice");
    const bob = await account("Bob");
    await seedEverything(alice, "ALICEMARK");
    expect(dataCounts(alice.id).recordings).toBe(3);
    expect(dataCounts(bob.id).recordings).toBe(0);
    expect(hasData(dataCounts(bob.id))).toBe(false);
  });
});

describe("the stores, as before", () => {
  const U = "usr_test_owner";

  it("counts, exports and deletes everything", async () => {
    const demo = getInterview(DEMO_INTERVIEW_ID, U)!;
    saveInterview({ ...demo, id: "iv-data", company: "Acme" }, U);
    saveAnswer({ ...roadmapAnswer, id: "ans-data", interviewId: "iv-data" }, U);
    saveRecordings("ans-data", [audio("x")]);
    withUsageContext({ interviewId: "iv-data" }, () => recordUsage({ service: "deepgram", label: "speech-to-text", seconds: 60 }));
    const counts = dataCounts();
    expect(counts.interviews).toBeGreaterThanOrEqual(1);
    expect(counts.recordings).toBeGreaterThanOrEqual(1);
    expect(hasData(counts)).toBe(true);
    const zip = await JSZip.loadAsync(await exportAll());
    const data = JSON.parse(await zip.file("data.json")!.async("string"));
    expect(data.interviews.map((i: { id: string }) => i.id)).toContain("iv-data");
    expect(data.answers.map((a: { id: string }) => a.id)).toContain("ans-data");
    deleteAll();
    expect(hasData(dataCounts())).toBe(false);
    expect(getInterview("iv-data", U)).toBeUndefined();
    expect(getRecording("ans-data", 0)).toBeNull();
    expect(getInterview(DEMO_INTERVIEW_ID, U)).toBeDefined();
    expect(usageFor({ interviewId: "iv-data" })).toHaveLength(0);
  });

  it("deleting one presentation removes its runs, Q&A and recordings, and never the demo", () => {
    savePresentation({ ...demoPresentation, id: "p-del", title: "Mine" }, U);
    saveRun({ ...demoRuns[0], id: "r-del", presentationId: "p-del" }, U);
    saveRecordings("run-r-del", [audio("x")]);
    expect(getRecording("run-r-del", 0)).not.toBeNull();
    const removed = deletePresentation("p-del", U);
    expect(removed?.runIds).toEqual(["r-del"]);
    expect(getPresentation("p-del", U)).toBeUndefined();
    expect(getRun("r-del", U)).toBeUndefined();
    expect(listRuns("p-del", U)).toEqual([]);
    expect(listPresentations(U).some((p) => p.id === "p-del")).toBe(false);
    expect(deletePresentation(demoPresentation.id, U)).toBeNull();
  });
});
