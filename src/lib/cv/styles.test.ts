import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.HAKKIRI_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-styles-"));
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

const list = await import("@/app/api/cv/styles/route");
const one = await import("@/app/api/cv/styles/[id]/route");
const store = await import("./store");

const alice = { id: "usr_alice", email: "alice@example.com" };
const bob = { id: "usr_bob", email: "bob@example.com" };
const post = (body: unknown) => list.POST(new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
const design = { template: "harbour", pageSize: "a4", density: "default", pageTarget: 2, bullet: "dash", headingFont: "garamond", order: ["s_1"], fileName: "Mine" };

beforeEach(() => {
  signedIn = alice;
});

describe("saved styles", () => {
  it("keep the look and leave out what belongs to one CV", async () => {
    const res = await post({ name: "Navy with dashes", design });
    expect(res.status).toBe(201);
    const { style } = await res.json();
    expect(style.design).toMatchObject({ template: "harbour", bullet: "dash", headingFont: "garamond" });
    expect(style.design).not.toHaveProperty("order");
    expect(style.design).not.toHaveProperty("fileName");
    expect(style.design).not.toHaveProperty("pageTarget");
  });

  it("belong to the person who saved them", async () => {
    const { style } = await (await post({ name: "Alice's", design })).json();
    signedIn = bob;
    expect((await (await list.GET()).json()).styles).toEqual([]);
    expect((await one.DELETE(new Request("http://localhost/api", { method: "DELETE" }), { params: Promise.resolve({ id: style.id }) })).status).toBe(404);
    signedIn = null;
    expect((await list.GET()).status).toBe(401);
  });

  it("need a name, and stop at the limit", async () => {
    signedIn = { id: "usr_many", email: "many@example.com" };
    expect((await post({ name: " ", design })).status).toBe(400);
    for (let i = 0; i < store.MAX_STYLES; i++) expect((await post({ name: `Style ${i}`, design })).status).toBe(201);
    expect((await post({ name: "One too many", design })).status).toBe(400);
  });

  it("are in the data export and go with “delete all my data”", async () => {
    signedIn = { id: "usr_leaving", email: "leaving@example.com" };
    await post({ name: "Mine", design });
    expect((await store.exportCvData("usr_leaving")).styles).toHaveLength(1);
    await store.deleteCvData("usr_leaving");
    expect((await store.exportCvData("usr_leaving")).styles).toEqual([]);
  });
});
