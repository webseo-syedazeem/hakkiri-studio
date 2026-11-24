import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { installFakeMongo, removeFakeMongo, type FakeDb } from "@/test/fake-mongo";

// With a database configured, accounts and sessions live in its collections and nowhere else.
let db: FakeDb = installFakeMongo();
const users = await import("./user-db");
const PASSWORD = "a long and unusual phrase 41";

beforeEach(() => {
  db = installFakeMongo();
});
afterAll(removeFakeMongo);

describe("accounts in the database", () => {
  it("an account is one document holding a hash, and a session one document under the hash of its token", async () => {
    const made = await users.createUser("Sam@Example.com", PASSWORD, "Sam Carter");
    if (!made.ok) throw new Error(made.error);
    expect(db.docs("users")).toHaveLength(1);
    expect(db.docs("users")[0]).toMatchObject({ _id: made.user.id, email: "sam@example.com", tier: "beta" });
    expect(String(db.docs("users")[0].passwordHash)).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
    const token = await users.createSession(made.user.id!, made.user.email!);
    expect(db.docs("sessions").map((s) => s._id)).toEqual([users.hashToken(token)]);
    expect(db.dump()).not.toContain(token);
    expect(db.dump()).not.toContain(PASSWORD);
    expect((await users.validateSession(token))?.email).toBe("sam@example.com");
    expect((await users.authenticateUser("sam@example.com", PASSWORD)).ok).toBe(true);
    expect((await users.createUser("sam@example.com", PASSWORD)).ok).toBe(false);
    expect(db.docs("users")).toHaveLength(1);
  });

  it("signing out removes the session; deleting the account removes it and every session it had, and nobody else's", async () => {
    const a = await users.createUser("a@example.com", PASSWORD);
    const b = await users.createUser("b@example.com", PASSWORD);
    if (!a.ok || !b.ok) throw new Error("no accounts");
    const a1 = await users.createSession(a.user.id!, "a@example.com");
    const a2 = await users.createSession(a.user.id!, "a@example.com");
    const b1 = await users.createSession(b.user.id!, "b@example.com");
    await users.deleteSession(a1);
    expect(db.docs("sessions")).toHaveLength(2);
    expect(await users.deleteUser(a.user.id!)).toBe(true);
    expect(db.docs("users").map((u) => u.email)).toEqual(["b@example.com"]);
    expect(db.docs("sessions").map((s) => s.userId)).toEqual([b.user.id]);
    expect(await users.validateSession(a2)).toBeNull();
    expect((await users.validateSession(b1))?.id).toBe(b.user.id);
    expect(db.dump()).not.toContain("a@example.com");
  });

  it("the first Google sign-in to a password account switches the password off and ends its sessions, in the database", async () => {
    const made = await users.createUser("claimed@example.com", PASSWORD);
    if (!made.ok) throw new Error(made.error);
    const old = await users.createSession(made.user.id!, "claimed@example.com");
    const owner = await users.findOrCreateOAuthUser({ email: "claimed@example.com", provider: "google" });
    expect(owner.id).toBe(made.user.id);
    expect(db.docs("users")[0]).toMatchObject({ passwordHash: "oauth:google" });
    expect(db.docs("users")[0].googleVerifiedAt).toBeInstanceOf(Date);
    expect(db.docs("sessions")).toHaveLength(0);
    expect(await users.validateSession(old)).toBeNull();
    expect((await users.authenticateUser("claimed@example.com", PASSWORD)).ok).toBe(false);
  });

  it("a session whose account document has gone is ended", async () => {
    const made = await users.createUser("gone@example.com", PASSWORD);
    if (!made.ok) throw new Error(made.error);
    const token = await users.createSession(made.user.id!, "gone@example.com");
    await db.collection("users").deleteOne({ _id: made.user.id });
    expect(await users.validateSession(token)).toBeNull();
    await new Promise((r) => setTimeout(r, 5));
    expect(db.docs("sessions")).toHaveLength(0);
  });
});
