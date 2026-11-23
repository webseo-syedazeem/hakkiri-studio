import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/lib/types";

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

// Work a route schedules for "after the response" needs a real request to hang from: here it is not run.
vi.mock("next/server", async (original) => ({ ...(await original<typeof import("next/server")>()), after: () => undefined }));

const { DEMO_INTERVIEW_ID, allSavedInterviews, clearInterviews, deleteInterview, getInterview, listEveryInterviewForAdmin, listInterviews, saveInterview, updateInterview } = await import("@/lib/interviews/store");
const { addQuestion, adoptOwnerlessQuestions, allCustomQuestions, clearQuestions, customQuestions, removeQuestion } = await import("@/lib/questions/store");
const { allMocks, createSession, doneSessions, findMock, listMocks, rerunOf, saveMock } = await import("@/lib/mocks/store");
const { allAnswers, findAnswer, listAnswers, saveAnswer } = await import("@/lib/answers/store");
const { getPresentation, getRun, listPresentations, listRuns, savePresentation, saveRun } = await import("@/lib/pitch/store");
const { demoPresentation, demoRuns } = await import("@/lib/pitch/demo");
const { roadmapAnswer } = await import("@/lib/mock-data");
const { standing } = await import("@/lib/sessions/server");
const { storyBank } = await import("@/lib/stories/bank");
const { deleteAll } = await import("@/lib/data/account");
const storiesRoute = await import("@/app/api/interviews/[id]/stories/route");
const bankRoute = await import("@/app/api/stories/route");
const interviewRoute = await import("@/app/api/interviews/[id]/route");
const questionsRoute = await import("@/app/api/questions/route");
const mocksRoute = await import("@/app/api/mocks/route");
const surveyRoute = await import("@/app/api/feedback/survey/route");

const person = (id: string): User & { id: string } => ({ id, email: `${id}@example.com`, firstName: id, initials: "T", trial: { interviewSecondsLeft: 600, pitchSecondsLeft: 600 } });
const A = person("usr_alice");
const B = person("usr_bob");
const TODAY = "2026-11-23";
const json = (body: unknown, method = "POST") => new Request("http://localhost/api", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

/** An interview of Alice's, made from the demo's shape, with one story. */
function alicesInterview(id = "iv-alice") {
  const demo = getInterview(DEMO_INTERVIEW_ID, A.id)!;
  saveInterview({ ...demo, id, company: "Quillon Biotech", role: "Regulatory Affairs Manager", stories: [{ id: "s1", title: "The Helix dispute", source: "Built in Hakkiri", parts: { situation: true, task: false, action: true, result: false }, fits: 1, useFor: [], text: "Alice's private story." }] }, A.id);
  return id;
}

beforeEach(() => {
  deleteAll();
  current = null;
  (globalThis as unknown as { __hakkiriRate?: Map<string, number[]> }).__hakkiriRate?.clear();
});

describe("an interview belongs to the account that made it", () => {
  it("is found by its owner and by nobody else, and never without naming an account", () => {
    const id = alicesInterview();
    expect(getInterview(id, A.id)?.company).toBe("Quillon Biotech");
    expect(getInterview(id, B.id)).toBeUndefined();
    expect(getInterview(id, "")).toBeUndefined();
    expect(listInterviews(TODAY, B.id).some((i) => i.id === id)).toBe(false);
    expect(listInterviews(TODAY, "")).toEqual([]);
  });

  it("cannot be changed or deleted by anyone else", () => {
    const id = alicesInterview();
    expect(updateInterview(id, (i) => ({ ...i, company: "Hacked" }), B.id)).toBeUndefined();
    expect(deleteInterview(id, B.id)).toBe(false);
    expect(getInterview(id, A.id)?.company).toBe("Quillon Biotech");
  });

  it("is never saved without an owner", () => {
    const demo = getInterview(DEMO_INTERVIEW_ID, A.id)!;
    saveInterview({ ...demo, id: "iv-nobody" }, "");
    expect(allSavedInterviews().some((i) => i.id === "iv-nobody")).toBe(false);
  });

  it("the administrators' list holds every real interview and none of the demos", async () => {
    alicesInterview();
    updateInterview(DEMO_INTERVIEW_ID, (i) => ({ ...i, role: "My copy" }), B.id);
    const all = await listEveryInterviewForAdmin();
    expect(all.map((i) => i.id)).toEqual(["iv-alice"]);
  });
});

describe("a demo interview is each person's own copy", () => {
  it("one person's change does not show for another", () => {
    updateInterview(DEMO_INTERVIEW_ID, (i) => ({ ...i, role: "Alice's version", settings: { difficulty: "hard", minutes: 10, preset: "technical", mix: { motivation: 0, competency: 0, technical: 100, cv: 0, curveball: 0 } } }), A.id);
    expect(getInterview(DEMO_INTERVIEW_ID, A.id)?.role).toBe("Alice's version");
    const bobs = getInterview(DEMO_INTERVIEW_ID, B.id)!;
    expect(bobs.role).not.toBe("Alice's version");
    expect(bobs.settings?.difficulty).not.toBe("hard");
  });

  it("one person's practice on it is not counted for another", () => {
    const interview = getInterview(DEMO_INTERVIEW_ID, A.id)!;
    const mine = createSession({ interviewId: DEMO_INTERVIEW_ID, kind: "interview", questionIds: [interview.questions[1].id], spareIds: [] }, A.id);
    saveMock({ ...mine, status: "done", answerIds: [] }, A.id);
    expect(listMocks(DEMO_INTERVIEW_ID, A.id).some((m) => m.id === mine.id)).toBe(true);
    expect(listMocks(DEMO_INTERVIEW_ID, B.id).some((m) => m.id === mine.id)).toBe(false);
    // Bob sees the built-in example session and nothing of Alice's.
    expect(doneSessions(DEMO_INTERVIEW_ID, B.id).map((m) => m.userId)).toEqual([undefined]);
    expect(standing(getInterview(DEMO_INTERVIEW_ID, B.id)!, B.id).sessions.some((m) => m.id === mine.id)).toBe(false);
  });

  it("one person deleting their data leaves another's copy alone", () => {
    updateInterview(DEMO_INTERVIEW_ID, (i) => ({ ...i, role: "Alice's version" }), A.id);
    updateInterview(DEMO_INTERVIEW_ID, (i) => ({ ...i, role: "Bob's version" }), B.id);
    clearInterviews(A.id);
    expect(getInterview(DEMO_INTERVIEW_ID, B.id)?.role).toBe("Bob's version");
    expect(getInterview(DEMO_INTERVIEW_ID, A.id)?.role).not.toBe("Alice's version");
  });

  it("the built-in example session cannot be overwritten", () => {
    const example = findMock("demo", A.id) ?? listMocks(DEMO_INTERVIEW_ID, A.id).find((m) => !m.userId)!;
    saveMock({ ...example, planned: 99 }, A.id);
    expect(listMocks(DEMO_INTERVIEW_ID, B.id).find((m) => m.id === example.id)?.planned).not.toBe(99);
    expect(allMocks(A.id).some((m) => m.id === example.id)).toBe(false);
  });
});

describe("sessions and answers", () => {
  it("a session is found only by its owner", () => {
    const id = alicesInterview();
    const session = createSession({ interviewId: id, kind: "interview", questionIds: [], spareIds: [] }, A.id);
    expect(findMock(session.id, A.id)?.id).toBe(session.id);
    expect(findMock(session.id, B.id)).toBeUndefined();
    expect(findMock(session.id, "")).toBeUndefined();
    expect(listMocks(id, B.id)).toEqual([]);
    expect(rerunOf(session.id, B.id)).toBeUndefined();
  });

  it("an answer is found only by its owner; the built-in demo answer can be read and never replaced", () => {
    const id = alicesInterview();
    saveAnswer({ ...roadmapAnswer, id: "ans-alice", interviewId: id }, A.id);
    expect(findAnswer("ans-alice", A.id)?.id).toBe("ans-alice");
    expect(findAnswer("ans-alice", B.id)).toBeUndefined();
    expect(findAnswer("ans-alice", "")).toBeUndefined();
    expect(listAnswers(id, B.id)).toEqual([]);
    expect(findAnswer(roadmapAnswer.id, B.id)?.id).toBe(roadmapAnswer.id);
    saveAnswer({ ...roadmapAnswer, id: "ans-nobody" }, "");
    expect(allAnswers().some((a) => a.id === "ans-nobody")).toBe(false);
  });

  it("a presentation, its runs and their slides are found only by their owner", () => {
    savePresentation({ ...demoPresentation, id: "p-alice", title: "Alice's deck" }, A.id);
    saveRun({ ...demoRuns[0], id: "r-alice", presentationId: "p-alice" }, A.id);
    expect(getPresentation("p-alice", A.id)?.title).toBe("Alice's deck");
    expect(getPresentation("p-alice", B.id)).toBeUndefined();
    expect(getPresentation("p-alice", "")).toBeUndefined();
    expect(listPresentations(B.id).some((p) => p.id === "p-alice")).toBe(false);
    expect(getRun("r-alice", B.id)).toBeUndefined();
    expect(listRuns("p-alice", B.id)).toEqual([]);
    expect(listRuns("p-alice", A.id).map((r) => r.id)).toEqual(["r-alice"]);
  });
});

describe("questions a person adds", () => {
  it("are theirs alone: not in anyone else's plan, download or delete", () => {
    const id = alicesInterview();
    const q = addQuestion(id, "Why did I leave Helix after the dispute?", "motivation", A.id);
    expect(customQuestions(id, A.id).map((x) => x.text)).toEqual(["Why did I leave Helix after the dispute?"]);
    expect(customQuestions(id, B.id)).toEqual([]);
    expect(allCustomQuestions(B.id)).toEqual([]);
    expect(allCustomQuestions(A.id)).toHaveLength(1);
    expect(removeQuestion(id, q.id, B.id)).toBe(false);
    clearQuestions(B.id);
    expect(allCustomQuestions(A.id)).toHaveLength(1);
    clearQuestions(A.id);
    expect(allCustomQuestions()).toEqual([]);
  });

  it("go when their owner deletes all their data, and nobody else's do", () => {
    const id = alicesInterview();
    addQuestion(id, "A question of Alice's?", "motivation", A.id);
    addQuestion(DEMO_INTERVIEW_ID, "A question of Bob's?", "technical", B.id);
    deleteAll(A.id);
    expect(allCustomQuestions(A.id)).toEqual([]);
    expect(allCustomQuestions(B.id).map((q) => q.text)).toEqual(["A question of Bob's?"]);
  });

  it("one saved before questions carried an owner goes to the owner of its interview, or is removed", () => {
    const id = alicesInterview();
    const all = allCustomQuestions() as unknown as { id: string; interviewId: string; userId?: string; text: string }[];
    all.push({ id: "u-old1", interviewId: id, text: "Old, on Alice's interview" } as never, { id: "u-old2", interviewId: DEMO_INTERVIEW_ID, text: "Old, on the shared demo" } as never, { id: "u-old3", interviewId: "iv-gone", text: "Old, interview gone" } as never);
    const owners: Record<string, string> = { [id]: A.id };
    expect(adoptOwnerlessQuestions((interviewId) => owners[interviewId])).toBe(3);
    expect(allCustomQuestions(A.id).map((q) => q.id)).toEqual(["u-old1"]);
    expect(allCustomQuestions().map((q) => q.id)).toEqual(["u-old1"]);
  });
});

describe("the story routes", () => {
  const story = { skill: "Stakeholders", question: "Tell me about a time you handled a difficult stakeholder.", parts: { situation: "MARKER-B situation", task: "", action: "MARKER-B I did a thing that I should not be able to save here", result: "" } };

  it("building a story writes only to the signed-in person's own interview", async () => {
    const id = alicesInterview();
    current = B;
    const res = await storiesRoute.POST(json(story), ctx(id));
    expect(res.status).toBe(404);
    expect(JSON.stringify(getInterview(id, A.id))).not.toContain("MARKER-B");
    current = A;
    const own = await storiesRoute.POST(json(story), ctx(id));
    expect(own.status).toBe(200);
    expect(getInterview(id, A.id)!.stories).toHaveLength(2);
    expect(getInterview(id, B.id)).toBeUndefined();
  });

  it("“fill in the gaps” cannot reach a story in someone else's interview by its title", async () => {
    const id = alicesInterview();
    current = B;
    const res = await bankRoute.POST(json({ key: "the helix dispute", parts: { situation: "", task: "MARKER-B overwrote your story", action: "", result: "" } }));
    expect(res.status).toBe(404);
    expect(getInterview(id, A.id)!.stories![0].text).toBe("Alice's private story.");
    // Bob's own story bank holds nothing of Alice's.
    expect(storyBank(TODAY, B.id).stories.some((s) => s.title === "The Helix dispute")).toBe(false);
    expect(storyBank(TODAY, A.id).stories.some((s) => s.title === "The Helix dispute")).toBe(true);
  });
});

describe("the interview and question routes", () => {
  it("another account cannot update, delete or add a question to an interview", async () => {
    const id = alicesInterview();
    current = B;
    expect((await interviewRoute.PATCH(json({ stages: [{ name: "Hacked stage" }] }, "PATCH"), ctx(id))).status).toBe(404);
    expect((await interviewRoute.DELETE(new Request("http://localhost/x", { method: "DELETE" }), ctx(id))).status).toBe(404);
    expect((await questionsRoute.POST(json({ interviewId: id, text: "A question added by Bob to Alice's interview?", group: "motivation" }))).status).toBe(404);
    expect(getInterview(id, A.id)?.stages ?? []).not.toContainEqual(expect.objectContaining({ name: "Hacked stage" }));
  });

  it("an update holds only stages and settings, each checked, and nothing oversized", async () => {
    const id = alicesInterview();
    current = A;
    const patch = (body: unknown) => interviewRoute.PATCH(json(body, "PATCH"), ctx(id));
    expect((await patch({ stages: [{ name: "Final panel", date: "2026-12-01", format: "video" }] })).status).toBe(200);
    expect(getInterview(id, A.id)!.stages).toEqual([{ name: "Final panel", date: "2026-12-01", format: "video" }]);
    expect((await patch({ settings: { minutes: 20, difficulty: "easy" } })).status).toBe(200);
    expect(getInterview(id, A.id)!.settings).toMatchObject({ minutes: 20, difficulty: "easy" });
    // Not the right shape, a field that isn't there to change, or far too big: refused, and nothing is saved.
    for (const bad of [{ settings: { minutes: "sixty" } }, { settings: { minutes: 7 } }, { userId: B.id }, { company: "Renamed" }, { stages: [{ name: "" }] }, { stages: "x" }, { stages: [{ name: "x", junk: "y" }] }, { stages: Array.from({ length: 13 }, () => ({ name: "s" })) }]) {
      expect((await patch(bad)).status, JSON.stringify(bad).slice(0, 60)).toBe(400);
    }
    expect((await patch({ stages: [{ name: "x".repeat(21_000) }] })).status).toBe(413);
    expect(getInterview(id, A.id)).toMatchObject({ company: "Quillon Biotech", userId: A.id });
    expect(getInterview(id, A.id)!.stages).toEqual([{ name: "Final panel", date: "2026-12-01", format: "video" }]);
  });

  it("a person's change to a demo is saved to their own copy", async () => {
    current = A;
    expect((await interviewRoute.PATCH(json({ settings: { difficulty: "hard" } }, "PATCH"), ctx(DEMO_INTERVIEW_ID))).status).toBe(200);
    expect(getInterview(DEMO_INTERVIEW_ID, A.id)!.settings?.difficulty).toBe("hard");
    expect(getInterview(DEMO_INTERVIEW_ID, B.id)!.settings?.difficulty).not.toBe("hard");
  });
});

describe("finishing a session", () => {
  const finish = (body: Record<string, unknown>) => mocksRoute.POST(json({ startedAt: new Date().toISOString(), planned: 2, ...body }));

  it("needs answers that are the signed-in person's own, from that interview", async () => {
    const id = alicesInterview();
    saveAnswer({ ...roadmapAnswer, id: "ans-alice-1", interviewId: id }, A.id);
    current = B;
    // Bob names Alice's interview: not found. Bob names the demo with Alice's answers: nothing to save.
    expect((await finish({ interviewId: id, answerIds: ["ans-alice-1"] })).status).toBe(404);
    const made = await finish({ interviewId: DEMO_INTERVIEW_ID, answerIds: ["ans-alice-1", "made-up"], kind: "full" });
    expect(made.status).toBe(400);
    expect((await made.json()).error).toBe("no-answers");
    expect(allMocks(B.id)).toEqual([]);
  });

  it("naming someone else's session id neither moves nor changes it", async () => {
    const id = alicesInterview();
    const session = createSession({ interviewId: id, kind: "interview", questionIds: [], spareIds: [] }, A.id);
    saveAnswer({ ...roadmapAnswer, id: "ans-bob-1", interviewId: DEMO_INTERVIEW_ID }, B.id);
    current = B;
    const res = await finish({ interviewId: DEMO_INTERVIEW_ID, sessionId: session.id, answerIds: ["ans-bob-1"], kind: "drill" });
    expect(res.status).toBe(200);
    const made = (await res.json()).id as string;
    expect(made).not.toBe(session.id);
    expect(findMock(session.id, A.id)).toMatchObject({ userId: A.id, status: "planned", interviewId: id });
    expect(findMock(made, B.id)).toMatchObject({ userId: B.id, interviewId: DEMO_INTERVIEW_ID });
  });

  it("the voucher survey counts only a full interview the server planned for that person", async () => {
    saveAnswer({ ...roadmapAnswer, id: "ans-bob-1", interviewId: DEMO_INTERVIEW_ID }, B.id);
    saveAnswer({ ...roadmapAnswer, id: "ans-bob-2", interviewId: DEMO_INTERVIEW_ID }, B.id);
    current = B;
    // A "full interview" reported by the browser from two one-off answers is saved as practice, and earns nothing.
    const adhoc = (await (await finish({ interviewId: DEMO_INTERVIEW_ID, answerIds: ["ans-bob-1", "ans-bob-2"], kind: "full" })).json()).id as string;
    const answers = { email: "bob@example.com", q1_realism: "Very", q2_questions: "Good", q3_feedback: "Fair", q4_issues: "None", q7_recommend: "Yes" };
    const claim = await surveyRoute.POST(json({ mockId: adhoc, ...answers }));
    expect(claim.status).toBe(403);
    expect((await claim.json()).error).toBe("full-interview-required");
    // And nobody can claim on someone else's session.
    const alices = createSession({ interviewId: alicesInterview(), kind: "interview", settings: { difficulty: "medium", minutes: 20, preset: "balanced", mix: { motivation: 20, competency: 20, technical: 20, cv: 20, curveball: 20 } }, questionIds: [], spareIds: [] }, A.id);
    expect((await surveyRoute.POST(json({ mockId: alices.id, ...answers }))).status).toBe(404);
  });
});
