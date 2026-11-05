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
