import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Answer, User } from "@/lib/types";

let current: (User & { id: string }) | null = null;
vi.mock("@/lib/auth/require", () => ({ getCurrentUser: async () => current, requireUser: async () => current, requirePageUser: async () => current }));

const { POST } = await import("@/app/api/answers/[draftId]/edit/route");
const { findAnswer, saveAnswer, clearAnswers } = await import("@/lib/answers/store");
const { scoreAnswerView } = await import("@/lib/answers/view");
const { answerFeedback } = await import("@/lib/answers/feedback");
const { roadmapAnswer } = await import("@/lib/mock-data");

const A = { id: "usr_alice", email: "a@example.com", firstName: "A", initials: "A", trial: { interviewSecondsLeft: 0, pitchSecondsLeft: 0 } };
const B = { ...A, id: "usr_bob", email: "b@example.com" };
const send = (id: string, body: unknown) => POST(new Request("http://localhost/x", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }), { params: Promise.resolve({ draftId: id }) });
const mine = (): Answer => ({ ...roadmapAnswer, id: "ans-edit", interviewId: "iv-1" });

beforeEach(() => {
  clearAnswers();
  current = A;
  saveAnswer(mine(), A.id);
});

describe("correcting an answer's transcript", () => {
  it("keeps the correction beside the answer and leaves what was heard, and every measurement, as it was", async () => {
    const before = scoreAnswerView(findAnswer("ans-edit", A.id)!, "competency");
    const res = await send("ans-edit", { text: "  I rebuilt the roadmap   with the team and shipped it in six weeks.  " });
    expect(res.status).toBe(200);
    const saved = findAnswer("ans-edit", A.id)!;
    expect(saved.correctedText).toBe("I rebuilt the roadmap with the team and shipped it in six weeks.");
    // The words as heard, their timings and their marks are untouched…
    expect(saved.words).toEqual(roadmapAnswer.words);
    expect(saved.highlights).toEqual(roadmapAnswer.highlights);
    // …so the length, pace, filler count, delivery score and overall score are exactly what they were.
    const after = scoreAnswerView(saved, "competency");
    expect(after.metrics).toEqual(before.metrics);
    expect(after.scores).toEqual(before.scores);
    expect(after.overall).toBe(before.overall);
    // The screen shows the correction.
    expect(answerFeedback(saved)).toMatchObject({ corrected: true, transcript: "I rebuilt the roadmap with the team and shipped it in six weeks." });
  });

  it("a correction that puts back exactly what was heard is no correction", async () => {
    await send("ans-edit", { text: "Something else entirely." });
    const heard = roadmapAnswer.words.map((w) => w.text).join(" ");
    expect((await send("ans-edit", { text: heard })).status).toBe(200);
    expect(findAnswer("ans-edit", A.id)!.correctedText).toBeUndefined();
  });

  it("is refused for an empty or oversized text, for someone else's answer and for a visitor", async () => {
    expect((await send("ans-edit", { text: "   " })).status).toBe(400);
    expect((await send("ans-edit", { text: "x".repeat(10_001) })).status).toBe(400);
    expect((await send("ans-edit", { nope: 1 })).status).toBe(400);
    current = B;
    expect((await send("ans-edit", { text: "Bob's words in Alice's answer." })).status).toBe(404);
    current = null;
    expect((await send("ans-edit", { text: "A visitor's words." })).status).toBe(401);
    expect(findAnswer("ans-edit", A.id)!.correctedText).toBeUndefined();
  });
});
