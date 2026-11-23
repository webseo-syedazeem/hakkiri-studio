import { describe, expect, it, beforeEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Point the CV store at a throwaway folder, and let each test choose who is signed in.
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-access-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

const { GET: listRoute, POST: createRoute } = await import("@/app/api/apply/cvs/route");
const { GET: getRoute, PATCH: patchRoute, DELETE: deleteRoute } = await import("@/app/api/apply/cvs/[id]/route");
const { POST: bulletRoute } = await import("@/app/api/apply/cvs/[id]/bullets/route");
const { getCv } = await import("@/lib/apply/db");

const alice = { id: "usr_alice", email: "alice@example.com" };
const bob = { id: "usr_bob", email: "bob@example.com" };
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const json = (body: unknown, method = "POST") =>
  new Request("http://localhost/api", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

async function aliceCv() {
  signedIn = alice;
  const res = await createRoute(json({ name: "Alice CV" }));
  expect(res.status).toBe(201);
  return (await res.json()).id as string;
}

describe("CV ownership", () => {
  beforeEach(() => {
    signedIn = null;
    for (const k of Object.keys(globalThis._applyMemoryStore ?? {})) delete globalThis._applyMemoryStore![k];
    fs.rmSync(path.join(dataDir, "apply"), { recursive: true, force: true });
  });

  it("a new account has no CVs: nothing is invented", async () => {
    signedIn = alice;
    const res = await listRoute();
    expect(await res.json()).toEqual([]);
  });

  it("a new CV starts empty", async () => {
    const id = await aliceCv();
    const cv = await getCv(id);
    expect(cv?.bullets).toEqual([]);
    expect(cv?.sections.find((s) => s.type === "summary")?.text).toBe("");
    expect(cv?.userId).toBe(alice.id);
  });

  it("the owner can open and save their CV", async () => {
    const id = await aliceCv();
    expect((await getRoute(new Request("http://x"), ctx(id))).status).toBe(200);
    const res = await patchRoute(json({ name: "Renamed" }, "PATCH"), ctx(id));
    expect(res.status).toBe(200);
    expect((await getCv(id))?.name).toBe("Renamed");
  });

  it("another account cannot open someone else's CV", async () => {
    const id = await aliceCv();
    signedIn = bob;
    const res = await getRoute(new Request("http://x"), ctx(id));
    expect(res.status).toBe(404);
  });

  it("another account cannot save over someone else's CV or take it over", async () => {
    const id = await aliceCv();
    signedIn = bob;
    const res = await patchRoute(json({ name: "Taken" }, "PATCH"), ctx(id));
    expect(res.status).toBe(404);
    const stored = await getCv(id);
    expect(stored?.name).toBe("Alice CV");
    expect(stored?.userId).toBe(alice.id);
    signedIn = alice;
    expect((await (await listRoute()).json()).map((c: { id: string }) => c.id)).toEqual([id]);
  });

  it("another account cannot delete or add bullets to someone else's CV", async () => {
    const id = await aliceCv();
    signedIn = bob;
    expect((await deleteRoute(new Request("http://x"), ctx(id))).status).toBe(404);
    expect((await bulletRoute(json({ notes: "I ran the Google ads account" }), ctx(id))).status).toBe(404);
    expect(await getCv(id)).not.toBeNull();
  });

  it("the owner field cannot be changed through a save", async () => {
    const id = await aliceCv();
    const res = await patchRoute(json({ userId: bob.id, name: "x" }, "PATCH"), ctx(id));
    expect(res.status).toBe(400);
    expect((await getCv(id))?.userId).toBe(alice.id);
  });

  it("an unknown CV answers 404 and nothing is created in its place", async () => {
    signedIn = alice;
    expect((await getRoute(new Request("http://x"), ctx("cv_nope"))).status).toBe(404);
    expect(await (await listRoute()).json()).toEqual([]);
  });

  it("signed-out requests are refused", async () => {
    const id = await aliceCv();
    signedIn = null;
    expect((await getRoute(new Request("http://x"), ctx(id))).status).toBe(401);
    expect((await patchRoute(json({ name: "x" }, "PATCH"), ctx(id))).status).toBe(401);
  });

  it("a tailored copy can only be made from your own CV", async () => {
    const id = await aliceCv();
    signedIn = bob;
    expect((await createRoute(json({ name: "Copy", kind: "tailored", parentCvId: id }))).status).toBe(404);
  });
});

describe("adding a bullet keeps the person's words", () => {
  it("adds no verb, no number and no second bullet", async () => {
    const id = await aliceCv();
    const notes = "i looked after the Google and Meta ads for six clients and cut wasted spend by moving budget to the best campaigns each week";
    const res = await bulletRoute(json({ notes }), ctx(id));
    const data = await res.json();
    expect(data.newBullets).toHaveLength(1);
    expect(data.newBullets[0].text).toBe("I" + notes.slice(1));
    expect(data.newBullets[0].text).not.toMatch(/^Delivered/);
    expect((await getCv(id))?.bullets).toHaveLength(1);
  });
});
