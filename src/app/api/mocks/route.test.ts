import { describe, expect, it, beforeEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The stores write to a throwaway folder, and each test chooses who is signed in.
process.env.HAKKIRI_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-mocks-api-"));
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));
// "after" only runs inside a real request; the work it defers (topping up questions) isn't under test here.
vi.mock("next/server", async (original) => ({ ...(await original<typeof import("next/server")>()), after: () => {} }));

const { POST } = await import("@/app/api/mocks/route");
const { saveInterview } = await import("@/lib/interviews/store");
const { saveAnswer } = await import("@/lib/answers/store");
const { createSession, findMock, listMocks } = await import("@/lib/mocks/store");
const { deleteAll } = await import("@/lib/data/account");
const { halden } = await import("@/lib/mock-data");
type Answer = import("@/lib/types").Answer;

const alice = { id: "usr_alice", email: "alice@example.com" };
const bob = { id: "usr_bob", email: "bob@example.com" };

const post = (body: unknown) => POST(new Request("http://localhost/api/mocks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

/** An interview of their own for `user`, with one scored answer on it. */
function withAnswer(user: { id: string }, interviewId: string, answerId: string) {
  saveInterview({ ...halden, id: interviewId, userId: user.id }, user.id);
  saveAnswer(
    {
      id: answerId,
      userId: user.id,
      interviewId,
      questionId: "c1",
      questionNumber: 1,
      questionsInMock: 1,
      words: [{ text: "Hello", start: 0, end: 1 }],
      pointWordIndex: 0,
      highlights: [],
      notes: [],
      scores: { content: 4, structure: 4, delivery: 4 },
      strength: "Clear",
      oneFix: "None",
      strongerVersion: [],
      strongerLengthSec: 10,
      followUps: [],
    } as Answer,
    user.id,
  );
}

/** What the live screen sends when practice on a topic ends: an id it made up, never planned on the server. */
const topicPractice = (interviewId: string, answerId: string) => ({
  interviewId,
  sessionId: "topic_star_medium",
  kind: "drill",
  drill: { kind: "topic", topic: "star" },
  startedAt: new Date().toISOString(),
  style: "realistic",
  planned: 1,
  answerIds: [answerId],
  askedIds: ["c1"],
  skipped: [],
});

beforeEach(() => {
  deleteAll();
  signedIn = alice;
});

describe("POST /api/mocks", () => {
  it("needs a signed-in user", async () => {
    signedIn = null;
    expect((await post(topicPractice("iv-alice", "ans-alice"))).status).toBe(401);
  });

  it("saves practice on a topic, so its report can be opened", async () => {
    withAnswer(alice, "iv-alice", "ans-alice");
    const res = await post(topicPractice("iv-alice", "ans-alice"));
    expect(res.status).toBe(200);
    const { id } = (await res.json()) as { id: string };
    const saved = findMock(id, alice.id);
    expect(saved).toMatchObject({ interviewId: "iv-alice", kind: "drill", status: "done", answerIds: ["ans-alice"], drill: { kind: "topic", topic: "star" } });
    expect(listMocks("iv-alice", alice.id).map((m) => m.id)).toEqual([id]);
  });

  it("keeps two people's practice on the same topic apart", async () => {
    withAnswer(alice, "iv-alice", "ans-alice");
    withAnswer(bob, "iv-bob", "ans-bob");
    const first = ((await (await post(topicPractice("iv-alice", "ans-alice"))).json()) as { id: string }).id;
    signedIn = bob;
    const second = ((await (await post(topicPractice("iv-bob", "ans-bob"))).json()) as { id: string }).id;
    expect(second).not.toBe(first);
    // Each still has their own, and neither can open the other's.
    expect(findMock(first, alice.id)?.answerIds).toEqual(["ans-alice"]);
    expect(findMock(second, bob.id)?.answerIds).toEqual(["ans-bob"]);
    expect(findMock(first, bob.id)).toBeUndefined();
    expect(findMock(second, alice.id)).toBeUndefined();
  });

  it("finishes a planned session under the id it was planned with, once", async () => {
    withAnswer(alice, "iv-alice", "ans-alice");
    const planned = createSession({ interviewId: "iv-alice", kind: "interview", questionIds: ["c1"], spareIds: [] }, alice.id);
    const body = { interviewId: "iv-alice", sessionId: planned.id, startedAt: new Date().toISOString(), planned: 1, answerIds: ["ans-alice"] };
    expect(((await (await post(body)).json()) as { id: string }).id).toBe(planned.id);
    expect(findMock(planned.id, alice.id)).toMatchObject({ status: "done", answerIds: ["ans-alice"] });
    // Sent again (a retry): the same report, not a second one.
    expect(((await (await post(body)).json()) as { id: string }).id).toBe(planned.id);
    expect(listMocks("iv-alice", alice.id)).toHaveLength(1);
  });
});
