import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/lib/types";

// Who is signed in is chosen by each test. Everything else is the real code.
let current: User | null = null;
vi.mock("@/lib/auth/require", () => ({
  getCurrentUser: async () => current,
  requireUser: async () => {
    if (!current?.id) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return current;
  },
}));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT ${to}`);
  },
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

const { adminDenied, hasAdminSecret, isAdminUser, requireAdminPage } = await import("./admin");
const { LEGACY_MASTER_ID } = await import("./admin-list");
const { forBackup } = await import("@/lib/storage/backup");
const { proxy } = await import("@/proxy");
const { NextRequest } = await import("next/server");

const person = (id: string, email: string): User => ({ id, email, firstName: "T", initials: "T", trial: { interviewSecondsLeft: 0, pitchSecondsLeft: 0 } });
const ada = person("usr_ada000000000000000000001", "ada@example.com");
const bob = person("usr_bob000000000000000000002", "bob@example.com");
const SECRET = "a-long-secret-for-tests-0123456789";

beforeEach(() => {
  current = null;
  vi.stubEnv("ADMIN_EMAILS", "");
  vi.stubEnv("ADMIN_USER_IDS", "");
  vi.stubEnv("ADMIN_SECRET_KEY", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("who is an administrator", () => {
  it("is nobody when the deployment lists nobody", () => {
    expect(isAdminUser(ada)).toBe(false);
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser({ id: "", email: "" })).toBe(false);
  });

  it("is an account whose email is listed in ADMIN_EMAILS, whatever the capitals or spaces", () => {
    vi.stubEnv("ADMIN_EMAILS", " Ada@Example.com , someone@example.org ");
    expect(isAdminUser(ada)).toBe(true);
    expect(isAdminUser(bob)).toBe(false);
  });

  it("is an account whose id is listed in ADMIN_USER_IDS", () => {
    vi.stubEnv("ADMIN_USER_IDS", `${bob.id}`);
    expect(isAdminUser(bob)).toBe(true);
    expect(isAdminUser(ada)).toBe(false);
  });

  it("is never somebody who is not signed in, even with a listed address", () => {
    vi.stubEnv("ADMIN_EMAILS", "ada@example.com");
    expect(isAdminUser({ id: undefined, email: "ada@example.com" })).toBe(false);
  });

  it("is never the old built-in admin account, even if its id or address is listed", () => {
    vi.stubEnv("ADMIN_EMAILS", "old-admin@example.com");
    vi.stubEnv("ADMIN_USER_IDS", LEGACY_MASTER_ID);
    expect(isAdminUser({ id: LEGACY_MASTER_ID, email: "old-admin@example.com" })).toBe(false);
  });
});

describe("the admin secret for scripts", () => {
  const withAuth = (value?: string) => new Request("http://localhost/api/admin/interviews", { headers: value ? { authorization: value } : {} });

  it("is accepted only as an exact Bearer value", () => {
    vi.stubEnv("ADMIN_SECRET_KEY", SECRET);
    expect(hasAdminSecret(withAuth(`Bearer ${SECRET}`))).toBe(true);
    expect(hasAdminSecret(withAuth(`Bearer ${SECRET}x`))).toBe(false);
    expect(hasAdminSecret(withAuth(SECRET))).toBe(false);
    expect(hasAdminSecret(withAuth())).toBe(false);
  });

  it("is never accepted when no secret is set, or the secret is too short to be one", () => {
    expect(hasAdminSecret(withAuth("Bearer "))).toBe(false);
    expect(hasAdminSecret(withAuth("Bearer undefined"))).toBe(false);
    vi.stubEnv("ADMIN_SECRET_KEY", "short");
    expect(hasAdminSecret(withAuth("Bearer short"))).toBe(false);
  });

  it("opens only the routes that say they accept it", async () => {
    vi.stubEnv("ADMIN_SECRET_KEY", SECRET);
    const req = withAuth(`Bearer ${SECRET}`);
    expect(await adminDenied(req, { allowSecret: true })).toBeNull();
    expect((await adminDenied(req))?.status).toBe(401);
  });
});

describe("the check every admin route makes", () => {
  it("answers 401 to a visitor, 403 to a signed-in person who is not an administrator, and lets an administrator through", async () => {
    vi.stubEnv("ADMIN_EMAILS", "ada@example.com");
    expect((await adminDenied())?.status).toBe(401);
    current = bob;
    const refused = await adminDenied();
    expect(refused?.status).toBe(403);
    expect(await refused!.json()).toEqual({ error: "forbidden", message: "This area is for administrators." });
    current = ada;
    expect(await adminDenied()).toBeNull();
  });

  it("the admin pages send a visitor to sign in and show everyone else “not found”", async () => {
    vi.stubEnv("ADMIN_EMAILS", "ada@example.com");
    await expect(requireAdminPage()).rejects.toThrow("REDIRECT /login");
    current = bob;
    await expect(requireAdminPage()).rejects.toThrow("NOT_FOUND");
    current = ada;
    expect((await requireAdminPage()).email).toBe("ada@example.com");
  });
});

/** Every handler under /api/admin, the robot tester and the admin-only exports. None may run for anyone but an administrator. */
const guarded: [string, () => Promise<{ status: number }>][] = [
  ["GET /api/admin/analytics", async () => (await import("@/app/api/admin/analytics/route")).GET()],
  ["GET /api/admin/backup", async () => (await import("@/app/api/admin/backup/route")).GET(new Request("http://localhost/api/admin/backup?download=false"))],
  ["GET /api/admin/blog", async () => (await import("@/app/api/admin/blog/route")).GET(new Request("http://localhost/api/admin/blog"))],
  ["POST /api/admin/blog", async () => (await import("@/app/api/admin/blog/route")).POST(new Request("http://localhost/api/admin/blog", { method: "POST", body: JSON.stringify({ title: "x" }) }))],
  ["GET /api/admin/blog/[id]", async () => (await import("@/app/api/admin/blog/[id]/route")).GET(new Request("http://localhost/x"), { params: Promise.resolve({ id: "none" }) })],
  ["PUT /api/admin/blog/[id]", async () => (await import("@/app/api/admin/blog/[id]/route")).PUT(new Request("http://localhost/x", { method: "PUT", body: "{}" }), { params: Promise.resolve({ id: "none" }) })],
  ["DELETE /api/admin/blog/[id]", async () => (await import("@/app/api/admin/blog/[id]/route")).DELETE(new Request("http://localhost/x", { method: "DELETE" }), { params: Promise.resolve({ id: "none" }) })],
  ["GET /api/admin/site", async () => (await import("@/app/api/admin/site/route")).GET()],
  ["POST /api/admin/site", async () => (await import("@/app/api/admin/site/route")).POST(new Request("http://localhost/x", { method: "POST", body: "{}" }))],
  ["GET /api/admin/upload", async () => (await import("@/app/api/admin/upload/route")).GET()],
  ["POST /api/admin/upload", async () => (await import("@/app/api/admin/upload/route")).POST(new Request("http://localhost/x", { method: "POST", body: new FormData() }))],
  ["GET /api/admin/interviews", async () => (await import("@/app/api/admin/interviews/route")).GET(new Request("http://localhost/api/admin/interviews"))],
  ["GET /api/robot-test", async () => (await import("@/app/api/robot-test/route")).GET()],
  ["POST /api/robot-test", async () => (await import("@/app/api/robot-test/route")).POST(new Request("http://localhost/x", { method: "POST", body: JSON.stringify({ email: "ada@example.com" }) }))],
  ["GET /api/feedback/survey", async () => (await import("@/app/api/feedback/survey/route")).GET(new Request("http://localhost/api/feedback/survey"))],
];

describe.each(guarded)("%s", (_name, call) => {
  it("answers 401 with no session", async () => {
    vi.stubEnv("ADMIN_EMAILS", "ada@example.com");
    expect((await call()).status).toBe(401);
  });

  it("answers 403 to a signed-in person who is not an administrator", async () => {
    vi.stubEnv("ADMIN_EMAILS", "ada@example.com");
    current = bob;
    expect((await call()).status).toBe(403);
  });

  it("cannot be opened by naming an administrator's address in the request", async () => {
    vi.stubEnv("ADMIN_EMAILS", "ada@example.com");
    current = { ...bob, firstName: "ada@example.com" };
    expect((await call()).status).toBe(403);
  });
});

describe("what an administrator can do", () => {
  it.each(["GET /api/admin/analytics", "GET /api/admin/backup", "GET /api/admin/blog", "GET /api/admin/site", "GET /api/admin/upload", "GET /api/admin/interviews", "GET /api/robot-test", "GET /api/feedback/survey"])("%s answers an administrator", async (name) => {
    vi.stubEnv("ADMIN_EMAILS", "ada@example.com");
    current = ada;
    const status = (await guarded.find((g) => g[0] === name)![1]()).status;
    expect([401, 403]).not.toContain(status);
    expect(status).toBeLessThan(500);
  });

  it("an upload that is not a picture is refused, whatever it is called", async () => {
    vi.stubEnv("ADMIN_EMAILS", "ada@example.com");
    current = ada;
    const { POST } = await import("@/app/api/admin/upload/route");
    const form = new FormData();
    form.set("file", new File(["<html><script>alert(1)</script></html>"], "cover.png", { type: "image/png" }));
    const res = await POST(new Request("http://localhost/api/admin/upload", { method: "POST", body: form }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Only PNG, JPEG, GIF and WebP pictures can be uploaded.");
  });
});

describe("the backup file", () => {
  it("never holds sign-in sessions or password hashes", () => {
    expect(forBackup("sessions", [{ _id: "tok", userId: "usr_1" }])).toBeNull();
    expect(forBackup("users", [{ _id: "usr_1", email: "a@example.com", passwordHash: "salt:hash" }])).toEqual([{ _id: "usr_1", email: "a@example.com", passwordHash: "[not exported]" }]);
    expect(forBackup("blogs", [{ _id: 7, title: "Post" }])).toEqual([{ _id: "7", title: "Post" }]);
  });
});

describe("the request gate", () => {
  const visit = (path: string, cookie = "") => proxy(new NextRequest(`http://localhost${path}`, { headers: cookie ? { cookie } : {} }));

  it("sends a request for the admin console with no session to sign in", () => {
    for (const path of ["/admin", "/admin/database", "/admin/blog"]) {
      const res = visit(path);
      expect(res.status, path).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost/login");
    }
  });

  it("still lets the public pages through, and the app's pages with a session", () => {
    for (const path of ["/", "/landing", "/login", "/blog", "/cv-audit"]) expect(visit(path).headers.get("location"), path).toBeNull();
    expect(visit("/dashboard").headers.get("location")).toBe("http://localhost/login");
    expect(visit("/dashboard", "hakkiri_session=anything").headers.get("location")).toBeNull();
  });
});
