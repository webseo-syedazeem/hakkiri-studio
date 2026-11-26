import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The store writes to a throwaway folder; each test chooses who is signed in and what the AI service replies.
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-talk-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

/** A stand-in for the AI service, as in the writing help's tests: replies in order, one retry, no replies means it is down. */
const ai = vi.hoisted(() => ({ mode: "ai" as "ai" | "rules" | "off", replies: [] as unknown[], calls: [] as { label: string; system: string; user: string }[] }));
vi.mock("@/lib/ai/mock", async (original) => ({ ...(await original<typeof import("@/lib/ai/mock")>()), mockAiEnabled: () => ai.mode === "rules" }));
vi.mock("@/lib/ai/config", () => ({
  aiConfig: {
    get anthropicKey() {
      return ai.mode === "ai" ? "test-key" : "";
    },
    geminiKey: "",
    mainModel: "test-model",
    fastModel: "test-model",
  },
  missingKeys: () => [],
}));
vi.mock("@/lib/ai/ask", () => ({
  ask: async (o: { label: string; system: string; user: string; schema: { safeParse: (v: unknown) => { success: boolean; data?: unknown } }; check: (v: unknown) => string[] }) => {
    ai.calls.push({ label: o.label, system: o.system, user: o.user });
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!ai.replies.length) return null;
      const parsed = o.schema.safeParse(ai.replies.shift());
      if (parsed.success && o.check(parsed.data).length === 0) return parsed.data;
    }
    return null;
  },
}));

const versions = await import("@/app/api/cv/versions/route");
const talk = await import("@/app/api/cv/versions/[id]/talk/route");
const store = await import("@/lib/cv/store");
const { fernCv } = await import("@/lib/cv/render/testing");

const alice = { id: "usr_alice", email: "alice@example.com" };
const bob = { id: "usr_bob", email: "bob@example.com" };
const json = (body: unknown) => new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const say = async (id: string, body: unknown) => {
  const res = await talk.POST(json(body), ctx(id));
  return { status: res.status, body: await res.json() };
};

async function emptyCv() {
  return (await (await versions.POST(json({ name: "My CV", level: "experienced", region: "uk" }))).json()).id as string;
}

beforeEach(() => {
  signedIn = alice;
  ai.mode = "ai";
  ai.replies = [];
  ai.calls = [];
});

describe("POST /api/cv/versions/[id]/talk", () => {
  it("answers only the CV's owner", async () => {
    const id = await emptyCv();
    signedIn = bob;
    expect((await say(id, { message: "hello" })).status).toBe(404);
    signedIn = null;
    expect((await say(id, { message: "hello" })).status).toBe(401);
  });

  it("refuses an empty message and saves nothing", async () => {
    const id = await emptyCv();
    const before = await store.getOwnCv(id, alice.id);
    const res = await say(id, { message: "   " });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Say or type something first.");
    expect((await store.getOwnCv(id, alice.id))!.rev).toBe(before!.rev);
  });

  it("sends back the model's edits that pass, and says plainly what it left out", async () => {
    const id = await emptyCv();
    const reply = {
      say: "Great! I've added your role and two impressive lines.",
      ask: "Roughly how many errors did the checks catch?",
      ops: [
        { op: "add_entry", ref: "new1", section: "experience", title: "Data Analyst", org: "Acme Payroll", start: "2021", current: true },
        { op: "add_bullet", entry: "new1", text: "Built the SQL checks that catch payroll errors before pay day", quotes: ["I built the SQL checks that catch payroll errors before pay day."] },
        { op: "add_bullet", entry: "new1", text: "Spearheaded a robust data quality programme that cut errors by 90%", quotes: [] },
      ],
    };
    // The first reply is sent back once with its problems; the second is taken, without the line that fails.
    ai.replies = [reply, reply];
    const res = await say(id, { message: "I'm a data analyst at Acme Payroll since 2021. I built the SQL checks that catch payroll errors before pay day.", step: "first-role", skipped: ["target", "name", "contact"] });
    expect(res.status).toBe(200);
    expect(res.body.by).toBe("ai");
    expect(res.body.ops.map((o: { op: string }) => o.op)).toEqual(["add_entry", "add_bullet"]);
    expect(res.body.left).toHaveLength(1);
    expect(res.body.left[0].what).toContain("Spearheaded");
    // The model's own "say" claimed both lines; it is replaced by what was actually done.
    expect(res.body.say).not.toContain("Great");
    expect(res.body.say).toContain("I made 2 changes");
    expect(res.body.ask).toBe("Roughly how many errors did the checks catch?");
    expect(ai.calls[0].label).toBe("cv-assistant");
    // Nothing is saved by the turn itself.
    expect((await store.getOwnCv(id, alice.id))!.sections.find((s) => s.kind === "experience")).toMatchObject({ entries: [] });
  });

  it("never shows the model a line taken from a private achievement", async () => {
    const id = await emptyCv();
    const cv = (await store.getOwnCv(id, alice.id))!;
    const fern = fernCv();
    await store.saveCv({ ...cv, contact: fern.contact, sections: fern.sections });
    const secret = fern.sections.flatMap((s) => ("entries" in s ? s.entries.flatMap((e) => e.bullets) : []))[0];
    await store.saveAchievement({ id: "ach_0123456789abcdef", userId: alice.id, text: secret.text, original: secret.text, sources: [], role: "", org: "", skills: [], private: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" });
    ai.replies = [{ say: "Noted.", ask: "Anything else?", ops: [] }];
    await say(id, { message: "Can you look at my CV?" });
    expect(ai.calls[0].user).not.toContain(secret.text);
    expect(ai.calls[0].user).toContain("(private line, not shown)");
  });

  it("carries on by rule when the AI service doesn't answer, and says so", async () => {
    const id = await emptyCv();
    const res = await say(id, { message: "My name is Sam Okafor and my email is sam@example.com", step: "name", skipped: ["target"] });
    expect(res.body.by).toBe("rules");
    expect(res.body.note).toContain("didn’t answer");
    expect(res.body.ops).toEqual([
      { op: "set_contact", field: "email", value: "sam@example.com" },
      { op: "set_contact", field: "fullName", value: "Sam Okafor" },
    ]);
  });

  it("saves a pasted advert as it was pasted", async () => {
    const id = await emptyCv();
    ai.mode = "rules";
    const advert = "About the role: Acme Payroll is looking for a Data Analyst. You will own the SQL models behind our payroll dashboards. Requirements: experience with SQL, Python and Tableau. We are looking for someone who explains data simply and cares about getting pay right.";
    const res = await say(id, { message: advert, step: "target" });
    expect(res.body.ops).toEqual([{ op: "set_advert", text: advert }]);
  });
});
