import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-apply-own-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string; firstName?: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

const jobs = await import("@/app/api/apply/jobs/route");
const applications = await import("@/app/api/apply/applications/route");
const application = await import("@/app/api/apply/applications/[id]/route");
const letter = await import("@/app/api/apply/applications/[id]/letter/route");
const pack = await import("@/app/api/apply/applications/[id]/pack/route");
const answers = await import("@/app/api/apply/applications/[id]/answers/[questionId]/route");
const evidence = await import("@/app/api/apply/evidence/[id]/route");
const db = await import("@/lib/apply/db");

const alice = { id: "usr_alice", email: "alice@example.com", firstName: "Alice" };
const bob = { id: "usr_bob", email: "bob@example.com", firstName: "Bob" };
const ADVERT = "Archive Assistant at Lantern Atlas\nYou will catalogue the map collection.\nMust have experience with paper conservation and a track record of careful handling.";
const json = (body: unknown, method = "POST") => new Request("http://localhost/api", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const ctx = <T extends Record<string, string>>(params: T) => ({ params: Promise.resolve(params) });
const get = () => new Request("http://localhost/api");

/** Alice pastes an advert: the server saves the job and makes her application for it. */
async function alicesApplication() {
  signedIn = alice;
  const res = await jobs.POST(json({ text: ADVERT }));
  expect(res.status).toBeLessThan(300);
  const body = (await res.json()) as { job: { id: string }; applicationId: string };
  return { jobId: body.job.id, appId: body.applicationId };
}

beforeEach(() => {
  signedIn = null;
  for (const k of Object.keys(globalThis._applyMemoryStore ?? {})) delete globalThis._applyMemoryStore![k];
  fs.rmSync(path.join(dataDir, "apply"), { recursive: true, force: true });
});

describe("a saved job belongs to the person who pasted it", () => {
  it("is in their list and in nobody else's", async () => {
    const { jobId } = await alicesApplication();
    expect(((await (await jobs.GET()).json()) as { id: string }[]).map((j) => j.id)).toEqual([jobId]);
    signedIn = bob;
    expect(await (await jobs.GET()).json()).toEqual([]);
    expect(await (await applications.GET()).json()).toEqual([]);
    expect(await db.getJob(jobId, bob.id)).toBeNull();
    expect(await db.getJob(jobId, "")).toBeNull();
    expect((await db.getJob(jobId, alice.id))?.userId).toBe(alice.id);
  });

  it("needs a signed-in person", async () => {
    expect((await jobs.GET()).status).toBe(401);
    expect((await jobs.POST(json({ text: ADVERT }))).status).toBe(401);
  });

  it("one saved before jobs carried an owner goes to the person whose application is for it, and to nobody else", async () => {
    const { jobId, appId } = await alicesApplication();
    const stored = (await db.getDoc<{ id: string; userId?: string }>(db.APPLY_COLLECTIONS.JOBS, jobId))!;
    delete stored.userId;
    await db.saveDoc(db.APPLY_COLLECTIONS.JOBS, jobId, stored);
    expect(await db.getJob(jobId, bob.id)).toBeNull();
    expect(await db.listJobs(bob.id)).toEqual([]);
    expect((await db.getDoc<{ userId?: string }>(db.APPLY_COLLECTIONS.JOBS, jobId))?.userId).toBeUndefined();
    expect((await db.listJobs(alice.id)).map((j) => j.id)).toEqual([jobId]);
    expect((await db.getDoc<{ userId?: string }>(db.APPLY_COLLECTIONS.JOBS, jobId))?.userId).toBe(alice.id);
    expect((await db.getApplication(appId, alice.id))?.jobId).toBe(jobId);
  });
});

describe("an application and what hangs from it", () => {
  it("can't be opened, changed or written from by another account", async () => {
    const { appId } = await alicesApplication();
    signedIn = bob;
    expect((await application.GET(get(), ctx({ id: appId }))).status).toBe(404);
    expect((await application.PATCH(json({ status: "offer" }, "PATCH"), ctx({ id: appId }))).status).toBe(404);
    expect((await letter.POST(json({ whyThisJob: "Because I would like to read Alice's job advert." }), ctx({ id: appId }))).status).toBe(404);
    expect((await pack.GET(get(), ctx({ id: appId }))).status).toBe(404);
    expect((await answers.POST(json({ question: "Why?", notes: "Some rough notes of Bob's, long enough." }), ctx({ id: appId, questionId: "q1" }))).status).toBe(404);
    expect((await db.getApplication(appId, alice.id))?.status).toBe("draft");
    expect(await db.listOutputs(appId, alice.id)).toEqual([]);
  });

  it("an update holds only its status, stages and notes: the job, the owner and the fit can't be sent in", async () => {
    const { appId, jobId } = await alicesApplication();
    const before = (await db.getApplication(appId, alice.id))!;
    const patch = (body: unknown) => application.PATCH(json(body, "PATCH"), ctx({ id: appId }));
    expect((await patch({ status: "sent", notes: "Sent on Monday." })).status).toBe(200);
    expect(await db.getApplication(appId, alice.id)).toMatchObject({ status: "sent", notes: "Sent on Monday.", jobId, userId: alice.id, fit: before.fit });
    for (const bad of [{ jobId: "job_other" }, { userId: bob.id }, { fit: 100 }, { id: "app_x" }, { status: "hired-by-magic" }, { letterOutputId: "x" }, { stages: [{ name: "" }] }, { notes: 5 }]) {
      expect((await patch(bad)).status, JSON.stringify(bad)).toBe(400);
    }
    expect((await patch({ notes: "x".repeat(30_000) })).status).toBe(413);
    expect(await db.getApplication(appId, alice.id)).toMatchObject({ status: "sent", notes: "Sent on Monday.", jobId, userId: alice.id, fit: before.fit });
  });

  it("the drafts saved for it are listed only for their owner", async () => {
    const { appId } = await alicesApplication();
    await db.saveOutput({ id: "out_1", userId: alice.id, applicationId: appId, kind: "letter", currentVersionId: "v1", versions: [], createdAt: "2026-11-23T00:00:00.000Z", updatedAt: "2026-11-23T00:00:00.000Z" } as never);
    expect((await db.listOutputs(appId, alice.id)).map((o) => o.id)).toEqual(["out_1"]);
    expect(await db.listOutputs(appId, bob.id)).toEqual([]);
    expect(await db.listOutputs(appId, "")).toEqual([]);
    expect(await db.listSendLogs(appId, bob.id)).toEqual([]);
  });
});

describe("a piece of evidence", () => {
  const entry = (id: string, userId: string) => ({ id, userId, text: "Catalogued 4,000 maps in a year.", numbers: ["4,000"], skillTags: [], sourceKind: "typed-note" as const, confirmed: true, createdAt: "2026-11-01T00:00:00.000Z", updatedAt: "2026-11-01T00:00:00.000Z" });

  it("can be changed or deleted only by its owner, and only in the ways a person can change it", async () => {
    await db.saveEvidence(entry("ev_a", alice.id));
    signedIn = bob;
    expect((await evidence.PATCH(json({ text: "Rewritten by Bob." }, "PATCH"), ctx({ id: "ev_a" }))).status).toBe(404);
    expect((await evidence.DELETE(get(), ctx({ id: "ev_a" }))).status).toBe(404);
    signedIn = alice;
    for (const bad of [{ userId: bob.id }, { id: "ev_b" }, { sourceKind: "cv" }, { text: "" }, { confirmed: "yes" }, { createdAt: "2020-01-01" }]) {
      expect((await evidence.PATCH(json(bad, "PATCH"), ctx({ id: "ev_a" }))).status, JSON.stringify(bad)).toBe(400);
    }
    expect((await evidence.PATCH(json({ text: "Catalogued 4,200 maps in a year.", confirmed: false }, "PATCH"), ctx({ id: "ev_a" }))).status).toBe(200);
    expect((await db.listEvidence(alice.id))[0]).toMatchObject({ id: "ev_a", userId: alice.id, text: "Catalogued 4,200 maps in a year.", confirmed: false, createdAt: "2026-11-01T00:00:00.000Z" });
    expect((await evidence.DELETE(get(), ctx({ id: "ev_a" }))).status).toBe(200);
    expect(await db.listEvidence(alice.id)).toEqual([]);
  });
});
