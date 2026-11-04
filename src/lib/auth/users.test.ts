import { describe, expect, it } from "vitest";
import {
  createUser,
  verifyCredentials,
  findUserByEmail,
  requestPasswordReset,
  getAuthenticatedUser,
} from "./users";

describe("Authentication & User Management", () => {
  it("verifies the default seeded executive account", () => {
    const res = verifyCredentials("priya@example.com", "password123");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.user.name).toBe("Priya Shah");
      expect(res.user.firstName).toBe("Priya");
      expect(res.user.initials).toBe("PS");
      expect(res.user.email).toBe("priya@example.com");
    }
  });

  it("rejects invalid login credentials with an error", () => {
    const wrongPass = verifyCredentials("priya@example.com", "wrongpassword");
    expect(wrongPass.ok).toBe(false);
    if (!wrongPass.ok) {
      expect(wrongPass.error).toBe("Invalid email or password.");
    }

    const nonExistent = verifyCredentials("nonexistent@example.com", "password123");
    expect(nonExistent.ok).toBe(false);
    if (!nonExistent.ok) {
      expect(nonExistent.error).toBe("Invalid email or password.");
    }
  });

  it("creates a new user with proper validation", () => {
    const testEmail = `test_${Date.now()}@domain.com`;
    const created = createUser({
      name: "Marcus Aurelius",
      email: testEmail,
      password: "emperorPassword456",
      targetRole: "Chief Executive Officer",
    });

    expect(created.ok).toBe(true);
    if (created.ok) {
      expect(created.user.name).toBe("Marcus Aurelius");
      expect(created.user.firstName).toBe("Marcus");
      expect(created.user.initials).toBe("MA");
      expect(created.user.email).toBe(testEmail);
      expect(created.user.targetRole).toBe("Chief Executive Officer");
    }

    // Verify login with new user works
    const login = verifyCredentials(testEmail, "emperorPassword456");
    expect(login.ok).toBe(true);
  });

  it("rejects invalid signup inputs", () => {
    // Too short password
    const shortPass = createUser({
      name: "John Doe",
      email: "john@example.com",
      password: "123",
    });
    expect(shortPass.ok).toBe(false);

    // Invalid email
    const badEmail = createUser({
      name: "John Doe",
      email: "not-an-email",
      password: "validPassword123",
    });
    expect(badEmail.ok).toBe(false);

    // Duplicate email
    const dup = createUser({
      name: "Priya Fake",
      email: "priya@example.com",
      password: "anotherPassword123",
    });
    expect(dup.ok).toBe(false);
  });

  it("handles password reset requests gracefully", () => {
    const res = requestPasswordReset("priya@example.com");
    expect(res.ok).toBe(true);
    expect(res.message).toContain("sent");
  });

  it("derives safe user profile from cookies", () => {
    const mockJar = {
      get: (k: string) => {
        if (k === "hk_user") return { value: encodeURIComponent("Elena Rostova") };
        if (k === "hk_role") return { value: encodeURIComponent("VP of Design") };
        if (k === "hk_auth") return { value: "1" };
        return undefined;
      },
    };

    const user = getAuthenticatedUser(mockJar);
    expect(user.name).toBe("Elena Rostova");
    expect(user.firstName).toBe("Elena");
    expect(user.initials).toBe("ER");
    expect(user.targetRole).toBe("VP of Design");
  });
});
