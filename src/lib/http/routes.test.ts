import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { User } from "@/lib/types";

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-routes-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
process.env.HAKKIRI_MOCK_AI = "1";

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
vi.mock("next/server", async (original) => ({ ...(await original<typeof import("next/server")>()), after: () => undefined }));

const { DEMO_INTERVIEW_ID, getInterview } = await import("@/lib/interviews/store");
const { saveAnswer } = await import("@/lib/answers/store");
const { saveRecordings } = await import("@/lib/answers/audio");
const { savePresentation, saveQa } = await import("@/lib/pitch/store");
const { demoPresentation, demoQaSession } = await import("@/lib/pitch/demo");
const { roadmapAnswer } = await import("@/lib/mock-data");
const { deleteAll } = await import("@/lib/data/account");
const { recentFeedback } = await import("@/lib/feedback/store");
const { mockAiEnabled } = await import("@/lib/ai/mock");
const { NOT_RUN, runAuditLogic, LEARNING_BOTS } = await import("@/lib/robot-test/tester");
const tracker = await import("@/lib/analytics/tracker");
const answers = await import("@/app/api/answers/route");
const audio = await import("@/app/api/answers/[draftId]/audio/[turn]/route");
const rephrase = await import("@/app/api/questions/rephrase/route");
const feedback = await import("@/app/api/feedback/route");
const track = await import("@/app/api/analytics/track/route");
const analytics = await import("@/app/api/admin/analytics/route");
const robot = await import("@/app/api/robot-test/route");
const blog = await import("@/app/api/admin/blog/route");
const blogPost = await import("@/app/api/admin/blog/[id]/route");
const unlock = await import("@/app/api/audit/[id]/unlock/route");
const publicAudit = await import("@/app/api/audit/route");

const person = (id: string, email = `${id}@example.com`): User & { id: string } => ({ id, email, firstName: id, initials: "T", trial: { interviewSecondsLeft: 600, pitchSecondsLeft: 600 } });
const alice = person("usr_alice");
const bob = person("usr_bob");
const admin = person("usr_admin", "boss@example.com");
const json = (body: unknown, method = "POST", headers: Record<string, string> = {}) => new Request("http://localhost/api/x", { method, headers: { "content-type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });
const WEBM = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, ...new Array(60).fill(7)]);
const rate = () => (globalThis as unknown as { __hakkiriRate?: Map<string, number[]> }).__hakkiriRate;

beforeEach(() => {
  deleteAll();
  current = null;
  rate()?.clear();
  vi.stubEnv("ADMIN_EMAILS", "boss@example.com");
  vi.stubEnv("HAKKIRI_TRUST_PROXY", "1");
});
afterEach(() => vi.unstubAllEnvs());

describe("a recording that is uploaded", () => {
  const upload = (file: Blob, fields: Record<string, string>) => {
    const form = new FormData();
    form.set("audio", file, "answer.webm");
    for (const [k, v] of Object.entries(fields)) form.set(k, v);
    return new Request("http://localhost/api/answers", { method: "POST", body: form });
  };
  const fields = () => ({ interviewId: DEMO_INTERVIEW_ID, questionId: getInterview(DEMO_INTERVIEW_ID, alice.id)!.questions[1].id });

  it("has to be audio, whatever it is called and whatever type it is sent as", async () => {
    current = alice;
    for (const fake of ["<!doctype html><script>alert(document.cookie)</script>", "%PDF-1.7 a document, not a recording", "just some text that is long enough"]) {
      const res = await answers.POST(upload(new Blob([fake], { type: "audio/webm" }), fields()));
      expect(res.status, fake).toBe(400);
      expect(((await res.json()) as { message: string }).message).toContain("couldn’t be read as audio");
    }
    const real = await answers.POST(upload(new Blob([WEBM], { type: "audio/webm" }), fields()));
    expect(real.status).toBe(200);
    expect(((await real.json()) as { draftId?: string }).draftId).toBeTruthy();
  });

  it("is refused when it isn't a form, or names an interview that isn't the person's", async () => {
    current = alice;
    expect((await answers.POST(json({ audio: "x" }))).status).toBe(400);
    expect((await answers.POST(upload(new Blob([WEBM]), { interviewId: "iv-of-someone-else", questionId: "q1" }))).status).toBe(404);
    current = null;
    expect((await answers.POST(upload(new Blob([WEBM]), fields()))).status).toBe(401);
  });
});

describe("playing a recording back", () => {
  const get = (id: string, turn = "0") => audio.GET(new Request(`http://localhost/api/answers/${id}/audio/${turn}`), { params: Promise.resolve({ draftId: id, turn }) });

  it("is for its owner only, and it is only ever served as audio", async () => {
    saveAnswer({ ...roadmapAnswer, id: "ans-a", interviewId: DEMO_INTERVIEW_ID }, alice.id);
    // Stored with a type that would make a browser treat it as a page.
    saveRecordings("ans-a", [{ data: WEBM.buffer as ArrayBuffer, type: "text/html" }], alice.id);
    current = alice;
    const mine = await get("ans-a");
    expect(mine.status).toBe(200);
    expect(mine.headers.get("content-type")).toBe("audio/webm");
    expect(mine.headers.get("x-content-type-options")).toBe("nosniff");
    expect(new Uint8Array(await mine.arrayBuffer())).toEqual(WEBM);
    for (const turn of ["1", "-1", "abc", "0.5", "999"]) expect((await get("ans-a", turn)).status, turn).toBe(404);
    current = bob;
    expect((await get("ans-a")).status).toBe(404);
    current = null;
    expect((await get("ans-a")).status).toBe(401);
  });

  it("works for an answer in the person's own audience Q&A, which used to be “not found” even for them", async () => {
    savePresentation({ ...demoPresentation, id: "p-a", title: "Mine" }, alice.id);
    saveQa({ ...demoQaSession, id: "qa-a", presentationId: "p-a", answers: demoQaSession.answers.map((a, i) => ({ ...a, id: `qa-a-${i}` })) }, alice.id);
    saveRecordings("qa-a-0", [{ data: WEBM.buffer as ArrayBuffer, type: "audio/webm" }]);
    current = alice;
    expect((await get("qa-a-0")).status).toBe(200);
    current = bob;
    expect((await get("qa-a-0")).status).toBe(404);
  });
});

describe("rephrasing a question", () => {
  it("needs a signed-in person and a question, and is counted against that person", async () => {
    expect((await rephrase.POST(json({ question: "Tell me about a time you led a team." }))).status).toBe(401);
    current = alice;
    for (const bad of [{}, { question: "x" }, { question: "y".repeat(401) }, "not json", { question: "Why this role?", group: "z".repeat(50) }]) expect((await rephrase.POST(json(bad))).status, JSON.stringify(bad).slice(0, 40)).toBe(400);
    expect((await rephrase.POST(json({ question: "q".repeat(300), hint: "h".repeat(5000) }))).status).toBe(413);
    const ok = await rephrase.POST(json({ question: "Tell me about a time you led a team." }));
    expect(ok.status).toBe(200);
    expect(typeof ((await ok.json()) as { rephrased: string }).rephrased).toBe("string");
    // Twenty a minute for one person; another person is not held up by it.
    rate()?.clear();
    for (let i = 0; i < 20; i++) await rephrase.POST(json({ question: "Why do you want this role?" }));
    expect((await rephrase.POST(json({ question: "Why do you want this role?" }))).status).toBe(429);
    current = bob;
    expect((await rephrase.POST(json({ question: "Why do you want this role?" }))).status).toBe(200);
  });
});

describe("a feedback note", () => {
  it("comes from a signed-in person and is kept with their account", async () => {
    const note = { page: "/dashboard?x=1", mood: "good", text: "Useful report" };
    expect((await feedback.POST(json(note))).status).toBe(401);
    expect(recentFeedback()).toHaveLength(0);
    current = alice;
    expect((await feedback.POST(json(note))).status).toBe(200);
    expect(recentFeedback()[0]).toMatchObject({ userId: alice.id, text: "Useful report", page: "/dashboard" });
    for (const bad of [{ ...note, mood: "great" }, { ...note, text: "" }, { ...note, text: "x".repeat(2001) }, []]) expect((await feedback.POST(json(bad))).status).toBe(400);
    expect((await feedback.POST(json({ ...note, text: "x".repeat(9000) }))).status).toBe(413);
    rate()?.clear();
    for (let i = 0; i < 10; i++) await feedback.POST(json(note));
    expect((await feedback.POST(json(note))).status).toBe(429);
  });
});

describe("the admin's traffic figures", () => {
  it("are what was recorded: nothing is made up, and what an earlier build made up is removed", async () => {
    const file = path.join(dataDir, "analytics_events.json");
    const today = new Date().toISOString().split("T")[0];
    // Rows like the ones the removed code wrote ("a realistic historical foundation").
    fs.writeFileSync(file, JSON.stringify(Array.from({ length: 40 }, (_, j) => ({ id: `seed_0_${j}`, path: "/blog", referrer: "", channel: "Google Organic Search", userAgent: "x", device: "mobile", visitorId: `seed_vis_0_${j}`, timestamp: new Date().toISOString(), date: today }))));
    current = admin;
    const empty = (await (await analytics.GET()).json()) as Record<string, unknown>;
    expect(empty).toMatchObject({ totalPageviews: 0, uniqueVisitors: 0, activeNow: 0, todayPageviews: 0, avgDurationSeconds: null, bounceRatePercent: null, isLive: false, topPages: [] });
    expect(JSON.parse(fs.readFileSync(file, "utf8"))).toEqual([]);

    // Two real page views by one visitor, and one by another.
    for (const [visitorId, p] of [["visitor_one", "/"], ["visitor_one", "/blog"], ["visitor_two", "/"]]) {
      expect((await track.POST(json({ path: p, visitorId }, "POST", { "x-forwarded-for": "198.51.100.9" }))).status).toBe(200);
    }
    const real = (await (await analytics.GET()).json()) as Record<string, unknown>;
    expect(real).toMatchObject({ totalPageviews: 3, uniqueVisitors: 2, activeNow: 2, todayPageviews: 3, todayVisitors: 2, avgDurationSeconds: null, bounceRatePercent: null, isLive: true });
    expect(await tracker.removeSeededEvents()).toBe(0);
  });

  it("are for administrators only", async () => {
    expect((await analytics.GET()).status).toBe(401);
    current = alice;
    expect((await analytics.GET()).status).toBe(403);
  });

  it("the public page-view route takes a small checked body, a few a second per address, and nothing personal", async () => {
    const from = (n: number) => ({ "x-forwarded-for": `203.0.113.${n}` });
    expect((await track.POST(json({ path: "/x".repeat(400) }, "POST", from(1)))).status).toBe(400);
    expect((await track.POST(json({ path: "/", junk: "y".repeat(5000) }, "POST", from(1)))).status).toBe(413);
    expect((await track.POST(json("not json", "POST", from(1)))).status).toBe(200); // counted as a view of "/"
    // A visitor id that isn't the random one the page makes is replaced, not stored.
    await track.POST(json({ path: "/about", visitorId: "someone@example.com" }, "POST", from(2)));
    const stored = JSON.parse(fs.readFileSync(path.join(dataDir, "analytics_events.json"), "utf8")) as { path: string; visitorId: string }[];
    expect(stored.find((e) => e.path === "/about")!.visitorId).toMatch(/^v_[a-z0-9]+$/);
    expect(JSON.stringify(stored)).not.toContain("someone@example.com");
    for (let i = 0; i < 120; i++) await track.POST(json({ path: "/" }, "POST", from(3)));
    expect((await track.POST(json({ path: "/" }, "POST", from(3)))).status).toBe(429);
    expect((await track.POST(json({ path: "/" }, "POST", from(4)))).status).toBe(200);
  });
});

describe("the robot tester", () => {
  it("reports that nothing was run: no scores, no bots, no passes", async () => {
    const report = runAuditLogic(7);
    expect(report).toMatchObject({ ran: false, note: NOT_RUN, totalTests: 0, results: [], learningBots: [], scoreGap: 0, scoreGapPassed: false, loopholesCount: 0, iteration: 7 });
    expect(LEARNING_BOTS).toEqual([]);
    expect(report.logs).toHaveLength(1);
    const text = JSON.stringify(report);
    for (const invented of ["99.4%", "100.0%", "PASS", "Verified", "verified", "Active", "Score:", "claude"]) expect(text, invented).not.toContain(invented);
    // The same whatever the run number: it used to nudge its made-up scores by it.
    expect({ ...runAuditLogic(2), timestamp: "", formattedTime: "", logs: [], iteration: 0 }).toEqual({ ...runAuditLogic(3), timestamp: "", formattedTime: "", logs: [], iteration: 0 });
  });

  it("is for administrators, and its route says the same", async () => {
    expect((await robot.GET()).status).toBe(401);
    current = alice;
    expect((await robot.POST(json({ runIteration: 2 }))).status).toBe(403);
    current = admin;
    const got = (await (await robot.GET()).json()) as { ran: boolean; results: unknown[] };
    expect(got).toMatchObject({ ran: false, results: [] });
    const posted = (await (await robot.POST(json({ runIteration: 2 }))).json()) as { ok: boolean; ran: boolean; report: { iteration: number; totalTests: number } };
    expect(posted).toMatchObject({ ok: true, ran: false, report: { iteration: 2, totalTests: 0 } });
    expect((await robot.POST(json({ runIteration: "x".repeat(2000) }))).status).toBe(413);
  });
});

describe("test mode", () => {
  it("is on in development and in the tests, never once launched, and in a production build only with a second flag", () => {
    expect(mockAiEnabled()).toBe(true);
    vi.stubEnv("NODE_ENV", "development");
    expect(mockAiEnabled()).toBe(true);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "production");
    expect(mockAiEnabled()).toBe(false);
    expect(warn.mock.calls.flat().join(" ")).toContain("HAKKIRI_MOCK_AI_IN_PRODUCTION");
    vi.stubEnv("HAKKIRI_MOCK_AI_IN_PRODUCTION", "1");
    expect(mockAiEnabled()).toBe(true);
    // The second flag alone does nothing, and nothing turns test mode on in the beta or at launch.
    vi.stubEnv("HAKKIRI_MOCK_AI", "");
    expect(mockAiEnabled()).toBe(false);
    vi.stubEnv("HAKKIRI_MOCK_AI", "1");
    vi.stubEnv("HAKKIRI_BETA", "1");
    expect(mockAiEnabled()).toBe(false);
    vi.stubEnv("HAKKIRI_BETA", "");
    vi.stubEnv("HAKKIRI_LAUNCH", "1");
    expect(mockAiEnabled()).toBe(false);
    warn.mockRestore();
  });
});

describe("writing a blog post (administrators)", () => {
  const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

  it("takes only a post's own fields, checked, and a post keeps its id", async () => {
    current = admin;
    const made = await blog.POST(json({ title: "  A real title ", content: "Words.", tags: ["one", " two "], isAdmin: true, userId: "usr_x", __proto__: { polluted: true }, seo: { metaTitle: "T", injected: "<script>" } }));
    expect(made.status).toBe(200);
    const { post } = (await made.json()) as { post: Record<string, unknown> & { id: string; seo: Record<string, unknown> } };
    expect(post).toMatchObject({ title: "A real title", content: "Words.", tags: ["one", "two"], published: false });
    for (const extra of ["isAdmin", "userId", "polluted"]) expect(post).not.toHaveProperty(extra);
    expect(post.seo).not.toHaveProperty("injected");

    for (const bad of [{ title: 5 }, { title: "T", tags: "one" }, { title: "T", content: { $ne: "" } }, { title: "T", id: "../../etc" }, { title: "T", published: "yes" }, "not json", []]) {
      expect((await blog.POST(json(bad))).status, JSON.stringify(bad).slice(0, 50)).toBe(400);
    }
    expect((await blog.POST(json({ content: "No title." }))).status).toBe(400);
    expect((await blog.POST(json({ title: "T", content: "x".repeat(1_100_000) }))).status).toBe(413);

    const changed = await blogPost.PUT(json({ id: "another-id", title: "Changed", role: "admin", author: { name: "New Name" } }, "PUT"), ctx(post.id));
    expect(changed.status).toBe(200);
    const after = ((await changed.json()) as { post: Record<string, unknown> & { author: Record<string, unknown> } }).post;
    expect(after).toMatchObject({ id: post.id, title: "Changed", content: "Words." });
    expect(after.author).toMatchObject({ name: "New Name", title: "Career & Interview Specialist" });
    expect(after).not.toHaveProperty("role");
    expect((await blogPost.PUT(json({ title: 7 }, "PUT"), ctx(post.id))).status).toBe(400);
    expect((await blogPost.PUT(json({ title: "x" }, "PUT"), ctx("no-such-post"))).status).toBe(404);
  });

  it("is refused to everyone else before the body is looked at", async () => {
    expect((await blog.POST(json({ title: "T" }))).status).toBe(401);
    current = alice;
    expect((await blog.POST(json({ title: "T" }))).status).toBe(403);
    expect((await blogPost.PUT(json({ title: "T" }, "PUT"), ctx("post-1"))).status).toBe(403);
  });
});

describe("the free CV check", () => {
  const cv = "Sam Carter\nsam@example.com\nWarehouse supervisor at Northfield, 2019 to 2024\n- Ran a team of twelve\n- Cut picking errors by 30%";
  const from = (n: number) => ({ "x-forwarded-for": `192.0.2.${n}` });

  it("takes a checked body of a sensible size, and only the values it knows", async () => {
    const made = await publicAudit.POST(json({ text: cv, region: "mars", docType: { $ne: 1 } }, "POST", from(1)));
    expect(made.status).toBe(200);
    for (const bad of [{ text: 5 }, { text: "too short" }, "not json", []]) expect((await publicAudit.POST(json(bad, "POST", from(1)))).status).toBe(400);
    expect((await publicAudit.POST(json({ text: "x".repeat(90_000) }, "POST", from(1)))).status).toBe(413);
  });

  it("unlocking a report needs a real email address, and only so many tries a minute", async () => {
    const { auditId } = (await (await publicAudit.POST(json({ text: cv }, "POST", from(2)))).json()) as { auditId: string };
    const ctx = { params: Promise.resolve({ id: auditId }) };
    for (const bad of [{}, { email: "nope" }, { email: "a@b" }, { email: { $ne: "" } }, { email: `${"x".repeat(300)}@example.com` }]) expect((await unlock.POST(json(bad, "POST", from(2)), ctx)).status, JSON.stringify(bad).slice(0, 40)).toBe(400);
    expect((await unlock.POST(json({ email: " Sam@Example.com ", marketing: "yes" }, "POST", from(2)), ctx)).status).toBe(200);
    rate()?.clear();
    for (let i = 0; i < 10; i++) await unlock.POST(json({ email: "nope" }, "POST", from(3)), ctx);
    expect((await unlock.POST(json({ email: "sam@example.com" }, "POST", from(3)), ctx)).status).toBe(429);
  });
});
