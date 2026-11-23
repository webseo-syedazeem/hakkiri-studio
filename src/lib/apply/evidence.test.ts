import { describe, expect, it, beforeEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-evidence-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

const { GET, POST } = await import("@/app/api/apply/evidence/route");
const { saveEvidence, listEvidence, getDoc, APPLY_COLLECTIONS } = await import("@/lib/apply/db");
const { isSeededEvidence } = await import("@/lib/apply/seeded");

const alice = { id: "usr_alice", email: "alice@example.com" };
const bob = { id: "usr_bob", email: "bob@example.com" };
const SEEDS = [
  "Spearheaded migration of core billing pipeline to AWS serverless, reducing monthly infrastructure costs by 38% (£45k annual saving).",
  "Resolved major production database deadlock during Black Friday sales rush, coordinating 4 senior engineers and restoring traffic within 12 minutes.",
  "Implemented end-to-end automated testing with Playwright, improving sprint release velocity by 2.5x and dropping defect escape rate to 0.4%.",
];
const entry = (id: string, userId: string, text: string) => ({ id, userId, text, numbers: [], skillTags: [], sourceKind: "typed-note" as const, confirmed: true, createdAt: "2026-11-01T00:00:00.000Z", updatedAt: "2026-11-01T00:00:00.000Z" });

describe("Evidence Bank", () => {
  beforeEach(() => {
    signedIn = null;
    for (const k of Object.keys(globalThis._applyMemoryStore ?? {})) delete globalThis._applyMemoryStore![k];
    fs.rmSync(path.join(dataDir, "apply"), { recursive: true, force: true });
  });

  it("a new account's bank is empty: nothing is written into it", async () => {
    signedIn = alice;
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
    // And still empty on a second read: the first read stored nothing.
    expect(await (await GET()).json()).toEqual([]);
    expect(await listEvidence(alice.id)).toEqual([]);
  });

  it("what the person adds is all that comes back", async () => {
    signedIn = alice;
    const made = await POST(new Request("http://x", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "Ran the Google and Meta ads for six retail clients" }) }));
    expect(made.status).toBe(201);
    const list = await (await GET()).json();
    expect(list.map((e: { text: string }) => e.text)).toEqual(["Ran the Google and Meta ads for six retail clients"]);
  });

  it("the three invented entries an earlier build seeded are removed from an existing account", async () => {
    await saveEvidence(entry("ev_seed1", alice.id, SEEDS[0]));
    await saveEvidence(entry("ev_seed2", alice.id, SEEDS[1]));
    await saveEvidence(entry("ev_seed3", alice.id, SEEDS[2]));
    await saveEvidence(entry("ev_real", alice.id, "Cut cost per lead by 18% in six months"));
    signedIn = alice;
    const list = await (await GET()).json();
    expect(list.map((e: { id: string }) => e.id)).toEqual(["ev_real"]);
    // Deleted from the store, not just hidden.
    for (const id of ["ev_seed1", "ev_seed2", "ev_seed3"]) expect(await getDoc(APPLY_COLLECTIONS.EVIDENCE, id)).toBeNull();
    expect(await getDoc(APPLY_COLLECTIONS.EVIDENCE, "ev_real")).not.toBeNull();
  });

  it("a seeded entry the person has edited is theirs and is kept", async () => {
    await saveEvidence(entry("ev_edited", alice.id, SEEDS[0].replace("38%", "31%")));
    signedIn = alice;
    const list = await (await GET()).json();
    expect(list.map((e: { id: string }) => e.id)).toEqual(["ev_edited"]);
  });

  it("clean-up only touches the signed-in account, and seeded entries are never listed for anyone", async () => {
    await saveEvidence(entry("ev_bob_seed", bob.id, SEEDS[2]));
    signedIn = alice;
    await GET();
    expect(await getDoc(APPLY_COLLECTIONS.EVIDENCE, "ev_bob_seed")).not.toBeNull();
    expect(await listEvidence(bob.id)).toEqual([]);
  });

  it("only an exact match counts as seeded", () => {
    expect(SEEDS.every((text) => isSeededEvidence({ text }))).toBe(true);
    expect(isSeededEvidence({ text: "Spearheaded migration of core billing pipeline" })).toBe(false);
  });

  it("signed-out requests are refused", async () => {
    expect((await GET()).status).toBe(401);
  });
});
