import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.HAKKIRI_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-share-"));
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

const templates = await import("@/app/api/cv/templates/route");
const version = await import("@/app/api/cv/versions/[id]/route");
const shareRoute = await import("@/app/api/cv/versions/[id]/share/route");
const store = await import("@/lib/cv/store");
const { shareable, isShareToken } = await import("./share");
const { isEntrySection } = await import("./schema");

let people = 0;
const fresh = () => ({ id: `usr_share_${++people}`, email: `s${people}@example.com` });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const json = (body: unknown, method = "POST") => new Request("http://localhost/api", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

async function exampleCv() {
  const res = await templates.POST(json({ templateId: "marketing-lead", name: "Shared", region: "uk", letter: true }));
  expect(res.status).toBe(201);
  return (await res.json()).id as string;
}
const call = async (fn: (r: Request, c: ReturnType<typeof ctx>) => Promise<Response>, id: string, method = "GET") => {
  const res = await fn(new Request("http://localhost/api", { method, headers: { "content-type": "application/json" }, body: method === "GET" || method === "DELETE" ? undefined : "{}" }), ctx(id));
  return { status: res.status, body: await res.json() };
};

describe("shareable", () => {
  it("keeps only what is on the page: nothing switched off, no sources, no job, no letter", async () => {
    signedIn = fresh();
    const id = await exampleCv();
    const cv = (await store.getOwnCv(id, signedIn.id))!;
    const exp = cv.sections.find(isEntrySection)!;
    exp.entries[0].bullets[0].visible = false;
    exp.entries[1].visible = false;
    const hiddenBullet = exp.entries[0].bullets[0].text;
    const hiddenRole = exp.entries[1].title;
    const shared = shareable(cv);
    const text = JSON.stringify(shared);
    expect(text).not.toContain(hiddenBullet);
    expect(text).not.toContain(`"title":"${hiddenRole}"`);
    expect(text).not.toContain(cv.target!.advert.slice(0, 60));
    expect(text).not.toContain("\"sources\":[{");
    expect(Object.keys(shared).sort()).toEqual(["contact", "design", "level", "region", "sections"]);
  });
});

describe("/api/cv/versions/[id]/share", () => {
  it("is off until turned on, then gives an opaque link to the version as it was", async () => {
    signedIn = fresh();
    const id = await exampleCv();
    expect((await call(shareRoute.GET, id)).body.share).toBeNull();
    const on = await call(shareRoute.POST, id, "POST");
    expect(on.status).toBe(201);
    const token = on.body.share.path.replace("/s/", "");
    expect(isShareToken(token)).toBe(true);
    expect(token).not.toContain(id.replace("cv_", ""));
    expect(on.body.share.current).toBe(true);
    const shared = await store.getShare(token);
    expect(shared!.cv.contact.fullName).toBeTruthy();

    // A change to the CV is not shared until the person chooses to share it.
    const cv = (await store.getOwnCv(id, signedIn.id))!;
    const changed = await version.PATCH(json({ rev: cv.rev, saveId: "s1", contact: { ...cv.contact, fullName: "Changed Name" } }, "PATCH"), ctx(id));
    expect(changed.status).toBe(200);
    const after = await call(shareRoute.GET, id);
    expect(after.body.share.current).toBe(false);
    expect((await store.getShare(token))!.cv.contact.fullName).not.toBe("Changed Name");
    const again = await call(shareRoute.POST, id, "POST");
    expect(again.body.share.path).toBe(`/s/${token}`);
    expect((await store.getShare(token))!.cv.contact.fullName).toBe("Changed Name");
  });

  it("stops working at once when turned off", async () => {
    signedIn = fresh();
    const id = await exampleCv();
    const token = (await call(shareRoute.POST, id, "POST")).body.share.path.replace("/s/", "");
    const off = await call(shareRoute.DELETE, id, "DELETE");
    expect(off.body.share).toBeNull();
    expect(await store.getShare(token)).toBeNull();
  });

  it("is the owner's alone to see or change", async () => {
    signedIn = fresh();
    const id = await exampleCv();
    const token = (await call(shareRoute.POST, id, "POST")).body.share.path.replace("/s/", "");
    signedIn = fresh();
    expect((await call(shareRoute.GET, id)).status).toBe(404);
    expect((await call(shareRoute.POST, id, "POST")).status).toBe(404);
    expect((await call(shareRoute.DELETE, id, "DELETE")).status).toBe(404);
    expect(await store.getShare(token)).not.toBeNull();
    signedIn = null;
    expect((await call(shareRoute.POST, id, "POST")).status).toBe(401);
  });

  it("goes when the CV is deleted, and with Delete all my data", async () => {
    signedIn = fresh();
    const id = await exampleCv();
    const token = (await call(shareRoute.POST, id, "POST")).body.share.path.replace("/s/", "");
    expect((await version.DELETE(new Request("http://localhost/api", { method: "DELETE" }), ctx(id))).status).toBe(200);
    expect(await store.getShare(token)).toBeNull();

    const id2 = await exampleCv();
    await call(shareRoute.POST, id2, "POST");
    expect((await store.exportCvData(signedIn.id)).shareLinks).toHaveLength(1);
    await store.deleteCvData(signedIn.id);
    expect((await store.exportCvData(signedIn.id)).shareLinks).toEqual([]);
  });

  it("refuses tokens that are not ones it makes", async () => {
    expect(await store.getShare("../cv_versions/x")).toBeNull();
    expect(await store.getShare("__proto__")).toBeNull();
    expect(await store.getShare("a".repeat(32))).toBeNull();
  });
});
