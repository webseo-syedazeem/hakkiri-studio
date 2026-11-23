import { afterAll, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// No database here: accounts are kept in the app's data folder. Saving is switched on for this file.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-accounts-"));
process.env.HAKKIRI_DATA_DIR = dir;
process.env.HAKKIRI_SAVE = "on";
delete process.env.MONGODB_URI;

// The browser's cookie, as the server reads it.
let cookieToken = "";
vi.mock("next/headers", () => ({ cookies: async () => ({ get: (name: string) => (name === "hakkiri_session" && cookieToken ? { name, value: cookieToken } : undefined) }) }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT ${to}`);
  },
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

const PASSWORD = "a long and unusual phrase 41";
const g = globalThis as Record<string, unknown>;

/** Stops the server and starts it again on the same data folder: everything held in memory is gone. */
async function restart() {
  vi.resetModules();
  for (const key of Object.keys(g)) if (key.startsWith("__hakkiri")) delete g[key];
  return {
    db: await import("./user-db"),
    admin: await import("./admin"),
  };
}

afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

describe("accounts without a database", () => {
  it("survive a restart: the account, its password and the session it was signed in with", async () => {
    let { db } = await restart();
    const made = await db.createUser("Sam.Carter@example.com", PASSWORD, "Sam Carter");
    if (!made.ok) throw new Error(made.error);
    const token = await db.createSession(made.user.id!, made.user.email!);

    ({ db } = await restart());
    expect(await db.authenticateUser("sam.carter@example.com", PASSWORD)).toMatchObject({ ok: true, user: { id: made.user.id, email: "sam.carter@example.com", initials: "SC" } });
    expect((await db.authenticateUser("sam.carter@example.com", "not the password 1")).ok).toBe(false);
    expect(await db.validateSession(token)).toMatchObject({ id: made.user.id, createdAt: made.user.createdAt });
    // And the address is still taken.
    expect((await db.createUser("sam.carter@example.com", PASSWORD)).ok).toBe(false);
  });

  it("are kept in files only the server's user can read, holding hashes and never the password or the session token", async () => {
    let { db } = await restart();
    const made = await db.createUser("file.check@example.com", PASSWORD);
    if (!made.ok) throw new Error(made.error);
    const token = await db.createSession(made.user.id!, made.user.email!);
    for (const name of ["users.json", "sessions.json"]) {
      const file = path.join(dir, name);
      expect(fs.statSync(file).mode & 0o777, name).toBe(0o600);
      const text = fs.readFileSync(file, "utf8");
      expect(text).not.toContain(PASSWORD);
      expect(text).not.toContain(token);
      expect(text).not.toContain(token.slice(4));
    }
    const users = JSON.parse(fs.readFileSync(path.join(dir, "users.json"), "utf8")) as { email: string; passwordHash: string }[];
    expect(users.find((u) => u.email === "file.check@example.com")!.passwordHash).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
    const sessions = JSON.parse(fs.readFileSync(path.join(dir, "sessions.json"), "utf8")) as { _id: string; userId: string }[];
    expect(sessions.find((s) => s.userId === made.user.id)!._id).toBe(db.hashToken(token));
    ({ db } = await restart());
    expect((await db.validateSession(token))?.id).toBe(made.user.id);
  });

  it("signing out, and deleting the account, survive a restart too", async () => {
    let { db } = await restart();
    const made = await db.createUser("leaving@example.com", PASSWORD);
    if (!made.ok) throw new Error(made.error);
    const [one, two] = [await db.createSession(made.user.id!, made.user.email!), await db.createSession(made.user.id!, made.user.email!)];
    await db.deleteSession(one);
    ({ db } = await restart());
    expect(await db.validateSession(one)).toBeNull();
    expect((await db.validateSession(two))?.id).toBe(made.user.id);
    expect(await db.deleteUser(made.user.id!)).toBe(true);
    ({ db } = await restart());
    expect(await db.validateSession(two)).toBeNull();
    expect((await db.authenticateUser("leaving@example.com", PASSWORD)).ok).toBe(false);
    expect(fs.readFileSync(path.join(dir, "users.json"), "utf8")).not.toContain("leaving@example.com");
    expect(fs.readFileSync(path.join(dir, "sessions.json"), "utf8")).not.toContain(made.user.id!);
  });

  it("a session past its thirty days is not brought back, and a damaged file doesn't stop the server starting", async () => {
    let { db } = await restart();
    const made = await db.createUser("expired@example.com", PASSWORD);
    if (!made.ok) throw new Error(made.error);
    const token = await db.createSession(made.user.id!, made.user.email!);
    const file = path.join(dir, "sessions.json");
    const sessions = JSON.parse(fs.readFileSync(file, "utf8")) as { _id: string; expiresAt: string }[];
    for (const s of sessions) if (s._id === db.hashToken(token)) s.expiresAt = new Date(Date.now() - 1000).toISOString();
    fs.writeFileSync(file, JSON.stringify(sessions));
    ({ db } = await restart());
    expect(await db.validateSession(token)).toBeNull();

    fs.writeFileSync(file, "{ not json");
    fs.writeFileSync(path.join(dir, "users.json"), JSON.stringify([null, 5, { nonsense: true }, ...JSON.parse(fs.readFileSync(path.join(dir, "users.json"), "utf8"))]));
    ({ db } = await restart());
    expect((await db.authenticateUser("expired@example.com", PASSWORD)).ok).toBe(true);
  });

  it("the Google rule is kept across a restart: the password that was switched off stays off", async () => {
    let { db } = await restart();
    const made = await db.createUser("both.ways@example.com", PASSWORD);
    if (!made.ok) throw new Error(made.error);
    await db.findOrCreateOAuthUser({ email: "both.ways@example.com", provider: "google" });
    ({ db } = await restart());
    expect((await db.authenticateUser("both.ways@example.com", PASSWORD)).ok).toBe(false);
    expect(await db.accountOf(made.user.id!)).toMatchObject({ hasPassword: false, signsInWithGoogle: true });
  });
});

describe("an administrator, signed in for real", () => {
  it("an account whose address is listed in ADMIN_EMAILS opens the admin routes and pages with its own session; another account doesn't", async () => {
    let { db } = await restart();
    // The account exists before its address is listed (a listed address can't be registered with a password).
    const boss = await db.createUser("the.admin@example.com", PASSWORD, "Ada Admin");
    const other = await db.createUser("ordinary@example.com", PASSWORD, "Olly Ordinary");
    if (!boss.ok || !other.ok) throw new Error("no accounts");
    const bossToken = await db.createSession(boss.user.id!, boss.user.email!);
    const otherToken = await db.createSession(other.user.id!, other.user.email!);

    vi.stubEnv("ADMIN_EMAILS", "someone.else@example.com, The.Admin@example.com");
    let admin;
    ({ db, admin } = await restart());
    const interviews = await import("@/app/api/admin/interviews/route");

    cookieToken = bossToken;
    expect(await admin.adminDenied()).toBeNull();
    expect((await admin.requireAdminPage()).email).toBe("the.admin@example.com");
    expect((await interviews.GET(new Request("http://localhost/api/admin/interviews"))).status).toBe(200);

    cookieToken = otherToken;
    expect((await admin.adminDenied())?.status).toBe(403);
    await expect(admin.requireAdminPage()).rejects.toThrow("NOT_FOUND");
    expect((await interviews.GET(new Request("http://localhost/api/admin/interviews"))).status).toBe(403);

    cookieToken = "";
    expect((await admin.adminDenied())?.status).toBe(401);
    await expect(admin.requireAdminPage()).rejects.toThrow("REDIRECT /login");

    // Signed out, the administrator's old cookie opens nothing.
    await db.deleteSession(bossToken);
    cookieToken = bossToken;
    expect((await admin.adminDenied())?.status).toBe(401);
    vi.unstubAllEnvs();
  });

  it("an administrator can also be the account Google confirms for a listed address", async () => {
    vi.stubEnv("ADMIN_EMAILS", "google.admin@example.com");
    const { db, admin } = await restart();
    expect((await db.createUser("google.admin@example.com", PASSWORD)).ok).toBe(false);
    const viaGoogle = await db.findOrCreateOAuthUser({ email: "google.admin@example.com", name: "Gail Admin", provider: "google" });
    cookieToken = await db.createSession(viaGoogle.id!, viaGoogle.email!);
    expect(await admin.adminDenied()).toBeNull();
    vi.unstubAllEnvs();
    cookieToken = "";
  });
});
