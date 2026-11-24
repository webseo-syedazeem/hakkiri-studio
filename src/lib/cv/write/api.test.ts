import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The store writes to a throwaway folder; each test chooses who is signed in and what the AI service replies.
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-write-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

/**
 * A stand-in for the AI service. `replies` are what the model "says", in
 * order; like the real helper, a reply that fails the caller's check is
 * retried once and then given up on. With no replies queued the service is down.
 */
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
const write = await import("@/app/api/cv/versions/[id]/write/[tool]/route");
const bank = await import("@/app/api/cv/bank/route");
const oneAchievement = await import("@/app/api/cv/bank/[id]/route");
const store = await import("@/lib/cv/store");
const { fernCv } = await import("@/lib/cv/render/testing");

const alice = { id: "usr_alice", email: "alice@example.com" };
const bob = { id: "usr_bob", email: "bob@example.com" };
const json = (body: unknown, method = "POST") => new Request("http://localhost/api", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const tool = (id: string, name: string) => ({ params: Promise.resolve({ id, tool: name }) });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

/** A CV with content, owned by whoever is signed in. */
async function filledCv(advert = "") {
  const id = (await (await versions.POST(json({ name: "Fern CV", level: "experienced", region: "uk", targetTitle: advert ? "Collections officer" : "", targetAdvert: advert }))).json()).id as string;
  const cv = (await store.getOwnCv(id, signedIn!.id))!;
  const fern = fernCv();
  await store.saveCv({ ...cv, contact: fern.contact, sections: fern.sections });
  return id;
}
const run = async (id: string, name: string, body: unknown) => {
  const res = await write.POST(json(body), tool(id, name));
  return { status: res.status, body: await res.json() };
};

beforeEach(() => {
  signedIn = alice;
  ai.mode = "ai";
  ai.replies = [];
  ai.calls = [];
  for (const k of Object.keys(globalThis._applyMemoryStore ?? {})) delete globalThis._applyMemoryStore![k];
  fs.rmSync(path.join(dataDir, "apply"), { recursive: true, force: true });
  (globalThis as unknown as { __hakkiriRate?: Map<string, number[]> }).__hakkiriRate?.clear();
});

const capture = { did: "I helped run the weekly planning meeting for the Leeds site.", changed: "We cut late orders by roughly 12% over the year.", number: "" };

describe("bullets from what the person says", () => {
  it("returns the model's bullets when every word of them is in the notes", async () => {
    const id = await filledCv();
    ai.replies = [{ bullets: [{ text: "Helped run the weekly planning meeting for the Leeds site", quotes: ["I helped run the weekly planning meeting for the Leeds site."] }, { text: "Cut late orders by roughly 12% over the year", quotes: ["We cut late orders by roughly 12% over the year."] }] }];
    const { status, body } = await run(id, "bullets", capture);
    expect(status).toBe(200);
    expect(body.by).toBe("ai");
    expect(body.bullets.map((b: { text: string }) => b.text)).toEqual(["Helped run the weekly planning meeting for the Leeds site", "Cut late orders by roughly 12% over the year"]);
    expect(ai.calls[0].system).toContain("You never add a fact");
    expect(ai.calls[0].system).toContain("UK spelling");
  });

  it.each([
    ["an invented number", "Cut late orders by roughly 12% over the year, saving £40,000"],
    ["an estimate made exact", "Cut late orders by 12% over the year"],
    ["“helped” turned into “led”", "Led the weekly planning meeting for the Leeds site"],
    ["a tool nobody mentioned", "Cut late orders by roughly 12% over the year using SAP"],
    ["“I”", "I cut late orders by roughly 12% over the year"],
  ])("never shows a draft with %s: it falls back to the person's own sentences", async (_what, text) => {
    const id = await filledCv();
    const bad = { bullets: [{ text, quotes: [capture.did, capture.changed] }] };
    ai.replies = [bad, bad];
    const { body } = await run(id, "bullets", capture);
    expect(body.by).toBe("rules");
    expect(body.bullets.map((b: { text: string }) => b.text)).toEqual(["Helped run the weekly planning meeting for the Leeds site", "Cut late orders by roughly 12% over the year"]);
    expect(JSON.stringify(body.bullets)).not.toContain(text);
    expect(body.note).toMatch(/your own sentences/);
  });

  it("refuses a quote that is not in the notes word for word", async () => {
    const id = await filledCv();
    const bad = { bullets: [{ text: "Cut late orders by roughly 12% over the year", quotes: ["Late orders were cut by roughly 12% over the year."] }] };
    ai.replies = [bad, bad];
    expect((await run(id, "bullets", capture)).body.by).toBe("rules");
  });

  it("gives the person's own sentences when the service is down, in test mode, and with no keys", async () => {
    const id = await filledCv();
    for (const mode of ["ai", "rules", "off"] as const) {
      ai.mode = mode;
      ai.replies = [];
      const { status, body } = await run(id, "bullets", capture);
      expect(status).toBe(200);
      expect(body.by).toBe("rules");
      expect(body.bullets[0]).toEqual({ text: "Helped run the weekly planning meeting for the Leeds site", quotes: [capture.did] });
    }
  });

  it("writes nothing from a job title alone", async () => {
    const id = await filledCv();
    const { status, body } = await run(id, "bullets", { did: "", changed: "", number: "", title: "Operations manager", org: "Example Works" });
    expect(status).toBe(400);
    expect(body.fields.did).toBeTruthy();
    expect(ai.calls).toHaveLength(0);
  });
});

describe("rewriting a bullet", () => {
  const original = "I successfully cut the average cost per lead by 18% in six months by rebuilding the account structure";

  it("offers a rewrite that keeps every fact", async () => {
    const id = await filledCv();
    ai.replies = [{ text: "Cut average cost per lead by 18% in six months by rebuilding account structure." }];
    const { body } = await run(id, "rewrite", { text: original });
    expect(body).toEqual({ status: "ready", proposed: "Cut average cost per lead by 18% in six months by rebuilding account structure", by: "ai" });
  });

  it("refuses a rewrite that dropped the number, and says so", async () => {
    const id = await filledCv();
    const bad = { text: "Cut average cost per lead in six months by rebuilding account structure" };
    ai.replies = [bad, bad];
    const { body } = await run(id, "rewrite", { text: original });
    expect(body.status).toBe("refused");
    expect(body.message).toBe("This rewrite changed your claim. It dropped “18%”. Your original bullet is still in place.");
    expect(body.proposed).toBeUndefined();
  });

  it("refuses a rewrite that dropped the result", async () => {
    const id = await filledCv();
    const bad = { text: "Introduced weekly budget pacing" };
    ai.replies = [bad, bad];
    const { body } = await run(id, "rewrite", { text: "Introduced weekly budget pacing that stopped overspend in peak season" });
    expect(body.status).toBe("refused");
    expect(body.message).toContain("It dropped “overspend”.");
  });

  it("takes the second try when the first changed the claim", async () => {
    const id = await filledCv();
    ai.replies = [{ text: "Cut average cost per lead by 28% in six months by rebuilding account structure" }, { text: "Cut average cost per lead by 18% in six months by rebuilding account structure" }];
    const { body } = await run(id, "rewrite", { text: original });
    expect(body).toMatchObject({ status: "ready", proposed: "Cut average cost per lead by 18% in six months by rebuilding account structure" });
  });

  it("says so when there is nothing to tighten", async () => {
    const id = await filledCv();
    const tight = "Cut average cost per lead by 18% in six months by rebuilding account structure";
    ai.replies = [{ text: tight }];
    expect((await run(id, "rewrite", { text: tight })).body).toEqual({ status: "unchanged", by: "ai" });
  });

  it("says the bullet is unchanged when the service is down or there are no keys", async () => {
    const id = await filledCv();
    expect((await run(id, "rewrite", { text: original })).body).toMatchObject({ status: "unavailable" });
    ai.mode = "off";
    const off = (await run(id, "rewrite", { text: original })).body;
    expect(off.status).toBe("unavailable");
    expect(off.message).toContain("Your bullet is unchanged");
  });

  it("in test mode tidies by rule, and the tidy passes the same check", async () => {
    const id = await filledCv();
    ai.mode = "rules";
    expect((await run(id, "rewrite", { text: original })).body).toEqual({ status: "ready", proposed: "Cut the average cost per lead by 18% in six months by rebuilding the account structure", by: "rules" });
    expect((await run(id, "rewrite", { text: "Catalogued 3,200 maps in two years" })).body).toEqual({ status: "unchanged", by: "rules" });
    expect(ai.calls).toHaveLength(0);
  });
});

describe("adding the number", () => {
  it("uses the person's detail as they gave it", async () => {
    const id = await filledCv();
    ai.replies = [{ text: "Trained about 40 volunteers to handle paper safely" }];
    expect((await run(id, "number", { text: "Trained volunteers to handle paper safely", detail: "about 40 volunteers" })).body).toEqual({ proposed: "Trained about 40 volunteers to handle paper safely", by: "ai" });
  });

  it("never lets the model make the estimate exact or change the figure: the detail is placed by rule instead", async () => {
    const id = await filledCv();
    for (const text of ["Trained 40 volunteers to handle paper safely", "Trained about 400 volunteers to handle paper safely", "Trained about 40 volunteers and 12 staff to handle paper safely"]) {
      ai.replies = [{ text }, { text }];
      expect((await run(id, "number", { text: "Trained volunteers to handle paper safely", detail: "about 40 volunteers" })).body).toEqual({ proposed: "Trained about 40 volunteers to handle paper safely", by: "rules" });
    }
  });

  it("works with the service down, and never supplies a number of its own", async () => {
    const id = await filledCv();
    ai.mode = "off";
    expect((await run(id, "number", { text: "Wrote the handling guide", detail: "40 pages" })).body).toEqual({ proposed: "Wrote the handling guide, 40 pages", by: "rules" });
    const none = await run(id, "number", { text: "Wrote the handling guide", detail: "" });
    expect(none.status).toBe(400);
    expect(ai.calls).toHaveLength(0);
  });
});

describe("the profile, written last from the CV", () => {
  it("returns two versions by rule in test mode, each made only of the CV's own lines", async () => {
    const id = await filledCv();
    ai.mode = "rules";
    const { body } = await run(id, "profile", { skills: ["Cataloguing", "paper handling"] });
    expect(body.by).toBe("rules");
    expect(body.versions.map((v: { style: string }) => v.style)).toEqual(["experience", "contribution"]);
    expect(body.versions[0].text).toContain("Archive assistant");
    expect(body.versions[0].text).toContain("Skilled in Cataloguing and paper handling.");
  });

  it("refuses model versions that claim what the CV does not, and gives the rule versions instead", async () => {
    const id = await filledCv();
    const bad = { versions: [{ style: "experience", text: "Award-winning archive assistant with 15 years’ experience at Paper Kite Archive, known for excellence." }, { style: "contribution", text: "Catalogued 3,200 maps in two years at Paper Kite Archive, winning a national award." }] };
    ai.replies = [bad, bad];
    const { body } = await run(id, "profile", { skills: [] });
    expect(body.by).toBe("rules");
    expect(JSON.stringify(body.versions)).not.toMatch(/Award|15 years|national/);
    expect(body.note).toMatch(/assembled from your CV/);
  });

  it("accepts model versions that say only what the CV says", async () => {
    const id = await filledCv();
    ai.replies = [{ versions: [{ style: "experience", text: "Archive assistant with experience at Paper Kite Archive and Folio House. Skilled in cataloguing and paper handling." }, { style: "contribution", text: "Catalogue incoming paper maps and record their condition at Paper Kite Archive. Skilled in cataloguing and paper handling." }] }];
    const { body } = await run(id, "profile", { skills: ["Cataloguing", "paper handling"] });
    expect(body.by).toBe("ai");
    expect(body.versions).toHaveLength(2);
  });
});

describe("skills worth adding", () => {
  it("come with the line that shows them, or start unconfirmed", async () => {
    const id = await filledCv("We need experience with collections databases, Excel and Spectrum. Knowledge of condition reporting is essential.");
    const res = await write.GET(new Request("http://localhost/api"), tool(id, "skills"));
    const { suggestions } = await res.json();
    const names = suggestions.map((s: { name: string }) => s.name);
    // Already in the skills section: not suggested again.
    expect(names).not.toContain("Excel");
    expect(names).not.toContain("condition reporting");
    expect(names).toContain("collections databases");
    expect(names).toContain("Spectrum");
    for (const s of suggestions as { name: string; from: string; evidence?: { text: string } }[]) {
      if (s.evidence) expect(s.evidence.text.toLowerCase()).toContain(s.name.toLowerCase());
      else expect(s.from).toBe("advert");
    }
    expect(ai.calls).toHaveLength(0);
  });
});

describe("whose CV it is", () => {
  it("another account cannot use the writing help on someone else's CV", async () => {
    const id = await filledCv();
    signedIn = bob;
    for (const name of ["bullets", "rewrite", "number", "profile", "question"]) expect((await write.POST(json({}), tool(id, name))).status).toBe(404);
    expect((await write.GET(new Request("http://localhost/api"), tool(id, "skills"))).status).toBe(404);
    signedIn = null;
    expect((await write.POST(json({}), tool(id, "rewrite"))).status).toBe(401);
    expect(ai.calls).toHaveLength(0);
  });

  it("an unknown tool is not found, and nothing is saved by any tool", async () => {
    const id = await filledCv();
    const before = JSON.stringify(await store.getOwnCv(id, alice.id));
    expect((await write.POST(json({}), tool(id, "invent"))).status).toBe(404);
    ai.mode = "rules";
    await run(id, "rewrite", { text: "I successfully ran the till" });
    await run(id, "number", { text: "Ran the till", detail: "3 days a week" });
    await run(id, "bullets", capture);
    expect(JSON.stringify(await store.getOwnCv(id, alice.id))).toBe(before);
  });

  it("is limited per person", async () => {
    const id = await filledCv();
    ai.mode = "rules";
    let last = 200;
    for (let i = 0; i < 25; i++) last = (await write.POST(json({ text: "Ran the till" }), tool(id, "rewrite"))).status;
    expect(last).toBe(429);
  });
});

describe("saved achievements", () => {
  const entry = { text: "Wrote the handling guide now used by 40 volunteers", original: "I wrote the handling guide. About 40 volunteers use it now.", role: "Archive assistant", org: "Paper Kite Archive", skills: ["paper handling"] };

  it("a new account has none: nothing is seeded", async () => {
    expect(await (await bank.GET()).json()).toEqual({ achievements: [] });
  });

  it("saves, lists, changes and deletes the person's own", async () => {
    const made = await bank.POST(json(entry));
    expect(made.status).toBe(201);
    const { achievement } = await made.json();
    expect(achievement).toMatchObject({ ...entry, private: false, usedIn: [] });
    expect(achievement.id).toMatch(/^ach_[a-f0-9]{16}$/);
    expect((await (await bank.GET()).json()).achievements).toHaveLength(1);
    const changed = await oneAchievement.PATCH(json({ private: true, text: "Wrote the handling guide used by 40 volunteers" }, "PATCH"), ctx(achievement.id));
    expect((await changed.json()).achievement).toMatchObject({ private: true, text: "Wrote the handling guide used by 40 volunteers", original: entry.original });
    expect((await oneAchievement.DELETE(json({}, "DELETE"), ctx(achievement.id))).status).toBe(200);
    expect((await (await bank.GET()).json()).achievements).toEqual([]);
  });

  it("cannot be empty, and takes only what a person may set", async () => {
    expect((await bank.POST(json({ ...entry, text: "  " }))).status).toBe(400);
    expect((await bank.POST(json({ ...entry, userId: bob.id }))).status).toBe(400);
    const { achievement } = await (await bank.POST(json(entry))).json();
    expect((await oneAchievement.PATCH(json({ text: "" }, "PATCH"), ctx(achievement.id))).status).toBe(400);
    expect((await oneAchievement.PATCH(json({ id: "ach_0000000000000000" }, "PATCH"), ctx(achievement.id))).status).toBe(400);
  });

  it("another account cannot see, change or delete them", async () => {
    const { achievement } = await (await bank.POST(json(entry))).json();
    signedIn = bob;
    expect((await (await bank.GET()).json()).achievements).toEqual([]);
    expect((await oneAchievement.PATCH(json({ text: "Mine now" }, "PATCH"), ctx(achievement.id))).status).toBe(404);
    expect((await oneAchievement.DELETE(json({}, "DELETE"), ctx(achievement.id))).status).toBe(404);
    signedIn = null;
    expect((await bank.GET()).status).toBe(401);
    expect((await store.getOwnAchievement(achievement.id, alice.id))!.text).toBe(entry.text);
  });

  it("shows which CVs use each one", async () => {
    const { achievement } = await (await bank.POST(json(entry))).json();
    const id = await filledCv();
    const cv = (await store.getOwnCv(id, alice.id))!;
    const sections = cv.sections.map((s) => (s.kind === "experience" && "entries" in s ? { ...s, entries: s.entries.map((e, i) => (i === 0 ? { ...e, bullets: [...e.bullets, { id: "b_frombank01", text: entry.text, visible: true, origin: "typed" as const, sources: [], bankId: achievement.id }] } : e)) } : s));
    await store.saveCv({ ...cv, sections });
    const listed = (await (await bank.GET()).json()).achievements[0];
    expect(listed.usedIn).toEqual([{ id, name: "Fern CV" }]);
  });

  it("are part of “Download my data” and go with “Delete all my data”", async () => {
    await bank.POST(json(entry));
    const data = await store.exportCvData(alice.id);
    expect(data.achievements.map((a) => a.text)).toEqual([entry.text]);
    expect(await store.deleteCvData(alice.id)).toBe(1);
    expect((await store.exportCvData(alice.id)).achievements).toEqual([]);
  });
});
