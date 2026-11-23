import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.HAKKIRI_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-db-"));
const { deleteDoc, getDoc, isDocKey, saveDoc } = await import("./db");
const unlock = await import("@/app/api/audit/[id]/unlock/route");

const SPECIAL = ["__proto__", "constructor", "prototype"];
const base = () => Object.keys(Object.prototype).concat(Object.getOwnPropertyNames(Object.prototype)).sort().join(",");

describe("document keys", () => {
  it("are ordinary strings: the names JavaScript keeps for itself are not documents", () => {
    for (const key of SPECIAL) expect(isDocKey(key)).toBe(false);
    for (const key of ["", "a\nb", "x".repeat(201), 7, null, undefined, {}]) expect(isDocKey(key)).toBe(false);
    for (const key of ["cv_0123456789abcdef", "aud_1", "someone@example.com", "toString", "hasOwnProperty"]) expect(isDocKey(key)).toBe(true);
  });

  it("looking one up finds nothing, where it used to hand back the base object every object shares", async () => {
    for (const key of SPECIAL) expect(await getDoc("audit_test", key)).toBeNull();
    // A name every object inherits is not a stored document either.
    expect(await getDoc("audit_test", "toString")).toBeNull();
    expect(await getDoc("audit_test", "hasOwnProperty")).toBeNull();
  });

  it("saving or deleting one changes nothing", async () => {
    const before = base();
    for (const key of SPECIAL) {
      await expect(saveDoc("audit_test", key, { id: key, polluted: true } as { id: string })).rejects.toThrow("not a document key");
      expect(await deleteDoc("audit_test", key)).toBe(false);
    }
    expect(base()).toBe(before);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("an ordinary document is saved, read and deleted as before", async () => {
    await saveDoc("audit_test", "doc_1", { id: "doc_1", userId: "usr_1" });
    expect(await getDoc<{ id: string }>("audit_test", "doc_1")).toMatchObject({ id: "doc_1", userId: "usr_1" });
    expect(await deleteDoc("audit_test", "doc_1")).toBe(true);
    expect(await getDoc("audit_test", "doc_1")).toBeNull();
  });
});

describe("the public report's unlock route", () => {
  it("answers “not found” for a special id and leaves every object in the server as it was", async () => {
    const before = base();
    for (const id of SPECIAL) {
      const res = await unlock.POST(new Request(`http://localhost/api/audit/${id}/unlock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "someone@example.com" }) }), { params: Promise.resolve({ id }) });
      expect(res.status, id).toBe(404);
    }
    expect(base()).toBe(before);
    const fresh = {} as Record<string, unknown>;
    expect(fresh.unlockedBy).toBeUndefined();
    expect(fresh.updatedAt).toBeUndefined();
  });
});
