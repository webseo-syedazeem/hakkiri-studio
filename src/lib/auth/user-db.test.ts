import { describe, expect, it } from "vitest";
import {
  hashPassword,
  verifyPassword,
  computeInitials,
  createUser,
  authenticateUser,
  createSession,
  validateSession,
  deleteSession,
} from "./user-db";

describe("authentication system", () => {
  it("hashes and verifies passwords securely", () => {
    const raw = "SuperSecret123!";
    const hashed = hashPassword(raw);
    expect(hashed).toContain(":");
    expect(verifyPassword(raw, hashed)).toBe(true);
    expect(verifyPassword("WrongPassword", hashed)).toBe(false);
  });

  it("computes initials correctly from name or email", () => {
    expect(computeInitials("Faizan Rizwan", "faizan@test.com")).toEqual({
      firstName: "Faizan",
      initials: "FR",
    });
    expect(computeInitials("Priya", "priya@test.com")).toEqual({
      firstName: "Priya",
      initials: "PR",
    });
    expect(computeInitials("", "john.doe@test.com")).toEqual({
      firstName: "John.doe",
      initials: "JO",
    });
  });

  it("creates and authenticates a user", async () => {
    const email = `tester_${Date.now()}@example.com`;
    const res = await createUser(email, "secret123", "Demo Tester");
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.user.email).toBe(email);
    expect(res.user.initials).toBe("DT");

    // Authenticate
    const authRes = await authenticateUser(email, "secret123");
    expect(authRes.ok).toBe(true);
    if (!authRes.ok) return;
    expect(authRes.user.email).toBe(email);

    // Wrong password fails
    const badRes = await authenticateUser(email, "wrong");
    expect(badRes.ok).toBe(false);

    // Duplicate registration fails
    const dupRes = await createUser(email, "secret123", "Demo Tester");
    expect(dupRes.ok).toBe(false);
  });

  it("handles sessions lifecycle", async () => {
    const email = `ses_${Date.now()}@example.com`;
    const u = await createUser(email, "secret123", "Session Tester");
    if (!u.ok) throw new Error("Could not create user");

    const token = await createSession(u.user.id ?? email, email);
    expect(token).toMatch(/^ses_/);

    const validated = await validateSession(token);
    expect(validated).not.toBeNull();
    expect(validated?.email).toBe(email);

    await deleteSession(token);
    const afterDelete = await validateSession(token);
    expect(afterDelete).toBeNull();
  });
});

describe("no built-in administrator", () => {
  const mem = (globalThis as unknown as { __hakkiri_memUsers: Map<string, Record<string, unknown>> }).__hakkiri_memUsers;

  it("the old built-in admin account cannot sign in, even with a record and the right password for it", async () => {
    // A record like the one the removed code used to write into the store.
    mem.set("usr_admin_master", { _id: "usr_admin_master", email: "old-admin@example.com", name: "Admin", firstName: "Admin", initials: "AD", passwordHash: hashPassword("whatever-it-was-1"), createdAt: new Date(), trial: { interviewSecondsLeft: 99999, pitchSecondsLeft: 99999 }, tier: "monthly" });
    const res = await authenticateUser("old-admin@example.com", "whatever-it-was-1");
    expect(res.ok).toBe(false);
    mem.delete("usr_admin_master");
  });

  it("a session left over from that account is ended, not honoured", async () => {
    const token = await createSession("usr_admin_master", "old-admin@example.com");
    expect(await validateSession(token)).toBeNull();
    // And it is gone, not just refused once.
    expect(await validateSession(token)).toBeNull();
  });

  it("no email and password pair signs anyone in without an account", async () => {
    for (const email of ["admin@example.com", "administrator@example.com", "root@localhost"]) {
      for (const password of ["admin", "password", "letmein123", "changeme-now"]) {
        expect((await authenticateUser(email, password)).ok, `${email} / ${password}`).toBe(false);
      }
    }
  });

  it("an address listed as an administrator cannot be registered with a password by whoever gets there first", async () => {
    const { vi } = await import("vitest");
    vi.stubEnv("ADMIN_EMAILS", "boss@example.com");
    const taken = await createUser("Boss@Example.com", "secret12345", "Not The Boss");
    // The same answer as for an address that already has an account, so the form doesn't say whose address is an administrator's.
    expect(taken).toEqual({ ok: false, error: "We couldn’t create an account with that address. If you already have one, sign in instead, or use “Continue with Google”." });
    const other = await createUser(`someone_${Date.now()}@example.com`, "secret12345", "Someone");
    expect(other.ok).toBe(true);
    vi.unstubAllEnvs();
  });
});
