import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { PASSWORD_RULE, passwordProblem } from "./password-rule";
import { safeNext } from "./next";
import { cookieIsSecure, sessionCookie } from "./session-cookie";
import {
  BAD_SIGN_IN,
  CANT_REGISTER,
  accountOf,
  authenticateUser,
  checkPassword,
  createSession,
  createUser,
  deleteSessionsFor,
  deleteUser,
  findOrCreateOAuthUser,
  normaliseEmail,
  validateSession,
} from "./user-db";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as signup } from "@/app/api/auth/signup/route";

const PASSWORD = "a long and unusual phrase 41";
let n = 0;
const address = () => `person${++n}_${Date.now()}@example.com`;
const post = (path: string, body: unknown, from = "203.0.113.5", extra: Record<string, string> = {}) =>
  new NextRequest(`http://localhost${path}`, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": from, host: "localhost", ...extra }, body: typeof body === "string" ? body : JSON.stringify(body) });
const hits = () => (globalThis as unknown as { __hakkiriRate?: Map<string, number[]> }).__hakkiriRate;

beforeEach(() => {
  hits()?.clear();
  vi.stubEnv("HAKKIRI_TRUST_PROXY", "1");
});
afterEach(() => vi.unstubAllEnvs());

describe("the password rule", () => {
  it("is stated to the person as it is enforced", () => {
    expect(PASSWORD_RULE).toBe("At least 8 characters. Not a common password, and not your email address.");
  });

  it("refuses a short password, a very long one, an obvious one, a common one and the person's own address", () => {
    expect(passwordProblem("short7!")).toContain("at least 8 characters");
    expect(passwordProblem("x".repeat(129))).toContain("at most 128");
    expect(passwordProblem("aaaaaaaaaaaa")).toContain("too easy to guess");
    expect(passwordProblem("        ")).toContain("too easy to guess");
    for (const common of ["password", "Password123", "12345678", "QWERTYUIOP", "iloveyou", "letmein123"]) expect(passwordProblem(common), common).toContain("most common passwords");
    expect(passwordProblem("sam.carter@example.com", "Sam.Carter@example.com")).toContain("email address");
    expect(passwordProblem("sam.carter", "sam.carter@example.com")).toContain("email address");
    for (const notText of [undefined, null, 12345678, {}]) expect(passwordProblem(notText)).toContain("at least 8");
  });

  it("accepts a long ordinary one, with no rule about capitals or symbols", () => {
    for (const fine of [PASSWORD, "correct horse battery staple", "Password123!", "nine chars", "żółć gęślą jaźń"]) expect(passwordProblem(fine, "sam@example.com"), fine).toBeNull();
  });
});

describe("an email address", () => {
  it("is stored trimmed and in lower case, and has to be one", () => {
    expect(normaliseEmail("  Sam.Carter@Example.COM ")).toBe("sam.carter@example.com");
    for (const bad of ["", "sam", "sam@", "@example.com", "sam@example", "sam carter@example.com", `${"a".repeat(250)}@example.com`, 7, null, { $ne: "" }]) expect(normaliseEmail(bad), String(bad)).toBeNull();
  });
});

describe("creating an account", () => {
  it("says what is wrong with the address or the password, and makes nothing", async () => {
    expect(await createUser("not-an-address", PASSWORD)).toEqual({ ok: false, error: "Please enter a valid email address." });
    const email = address();
    expect((await createUser(email, "short")).ok).toBe(false);
    expect((await createUser(email, "password123")).ok).toBe(false);
    expect((await authenticateUser(email, "password123")).ok).toBe(false);
  });

  it("gives one answer for an address that is taken and one held for an administrator", async () => {
    const email = address();
    expect((await createUser(email, PASSWORD, "Sam Carter")).ok).toBe(true);
    expect(await createUser(email.toUpperCase(), "another fine password 7")).toEqual({ ok: false, error: CANT_REGISTER });
    vi.stubEnv("ADMIN_EMAILS", "the-boss@example.com");
    expect(await createUser("the-boss@example.com", PASSWORD)).toEqual({ ok: false, error: CANT_REGISTER });
    // The first account is untouched: its own password still works and the second one's doesn't.
    expect((await authenticateUser(email, PASSWORD)).ok).toBe(true);
    expect((await authenticateUser(email, "another fine password 7")).ok).toBe(false);
  });

  it("keeps a name to one short line of text", async () => {
    const made = await createUser(address(), PASSWORD, `  Sam\n\u0000  Carter ${"x".repeat(200)}`);
    expect(made.ok).toBe(true);
    if (!made.ok) return;
    const account = await accountOf(made.user.id!);
    expect(account!.name.startsWith("Sam Carter x")).toBe(true);
    expect(account!.name.length).toBeLessThanOrEqual(80);
    expect(account).toMatchObject({ hasPassword: true, signsInWithGoogle: false, tier: "beta" });
    expect(JSON.stringify(account)).not.toContain("passwordHash");
  });
});

describe("signing in", () => {
  it("gives one answer for a wrong password, an unknown address and a Google-only account", async () => {
    const email = address();
    await createUser(email, PASSWORD);
    const google = address();
    await findOrCreateOAuthUser({ email: google, name: "Gina", provider: "google" });
    for (const [who, pw] of [[email, "the wrong password 1"], [address(), PASSWORD], [google, "oauth:google"], [google, PASSWORD]]) {
      expect(await authenticateUser(who, pw), who).toEqual({ ok: false, error: BAD_SIGN_IN });
    }
    expect((await authenticateUser(`  ${email.toUpperCase()} `, PASSWORD)).ok).toBe(true);
  });

  it("checks a password the same way for confirming who is there", async () => {
    const made = await createUser(address(), PASSWORD);
    if (!made.ok) throw new Error("no account");
    expect(await checkPassword(made.user.id!, PASSWORD)).toBe(true);
    expect(await checkPassword(made.user.id!, "not it at all 99")).toBe(false);
    expect(await checkPassword("usr_nobody", PASSWORD)).toBe(false);
    expect(await checkPassword(made.user.id!, "")).toBe(false);
  });
});

describe("the sign-in routes", () => {
  it("sign-up sets a cookie scripts can't read, that other sites' requests don't carry", async () => {
    const res = await signup(post("/api/auth/signup", { email: address(), password: PASSWORD, name: "Sam" }));
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie")!;
    expect(cookie).toMatch(/^hakkiri_session=ses_[0-9a-f]{64};/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=lax/i);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).toMatch(/Max-Age=2592000/);
    const body = (await res.json()) as { user: Record<string, unknown> };
    expect(JSON.stringify(body)).not.toMatch(/passwordHash|ses_/);
  });

  it("sign-up refuses a body that is too large, isn't JSON or has no address, and a taken address, without a session", async () => {
    expect((await signup(post("/api/auth/signup", { email: address(), password: "x".repeat(9000) }))).status).toBe(413);
    for (const bad of ["not json", { email: 5, password: PASSWORD }, { password: PASSWORD }, { email: "  ", password: PASSWORD }]) {
      const res = await signup(post("/api/auth/signup", bad, `198.51.100.${++n}`));
      expect(res.status, JSON.stringify(bad)).toBe(400);
      expect(res.headers.get("set-cookie")).toBeNull();
    }
    const email = address();
    await signup(post("/api/auth/signup", { email, password: PASSWORD }, "198.51.100.200"));
    const again = await signup(post("/api/auth/signup", { email, password: PASSWORD }, "198.51.100.201"));
    expect(again.status).toBe(400);
    expect(((await again.json()) as { error: string }).error).toBe(CANT_REGISTER);
    expect(again.headers.get("set-cookie")).toBeNull();
  });

  it("allows five sign-ups in ten minutes from one address, and other addresses are unaffected", async () => {
    for (let i = 0; i < 5; i++) expect((await signup(post("/api/auth/signup", { email: address(), password: PASSWORD }, "192.0.2.50"))).status).toBe(200);
    expect((await signup(post("/api/auth/signup", { email: address(), password: PASSWORD }, "192.0.2.50"))).status).toBe(429);
    expect((await signup(post("/api/auth/signup", { email: address(), password: PASSWORD }, "192.0.2.51"))).status).toBe(200);
  });

  it("signing in answers 401 with the same message for a wrong password and an unknown address", async () => {
    const email = address();
    await createUser(email, PASSWORD);
    const wrong = await login(post("/api/auth/login", { email, password: "not the password 1" }));
    const unknown = await login(post("/api/auth/login", { email: address(), password: PASSWORD }));
    expect([wrong.status, unknown.status]).toEqual([401, 401]);
    expect(await wrong.json()).toEqual(await unknown.json());
    expect(wrong.headers.get("set-cookie")).toBeNull();
    const right = await login(post("/api/auth/login", { email, password: PASSWORD }));
    expect(right.status).toBe(200);
    expect(right.headers.get("set-cookie")).toMatch(/hakkiri_session=ses_.*HttpOnly/i);
  });

  it("after ten wrong passwords for one account it has to wait, wherever the tries come from, and other accounts don't", async () => {
    const email = address();
    const other = address();
    await createUser(email, PASSWORD);
    await createUser(other, PASSWORD);
    for (let i = 0; i < 10; i++) expect((await login(post("/api/auth/login", { email, password: `guess number ${i} x` }, `10.1.${i}.1`))).status).toBe(401);
    // The eleventh is refused before the password is looked at, even when it is the right one, from a new address.
    const locked = await login(post("/api/auth/login", { email: email.toUpperCase(), password: PASSWORD }, "10.2.0.1"));
    expect(locked.status).toBe(429);
    expect(((await locked.json()) as { error: string }).error).toContain("Wait 15 minutes");
    expect((await login(post("/api/auth/login", { email: other, password: PASSWORD }, "10.2.0.1"))).status).toBe(200);
    // An address nobody has registered is counted the same way, so the wait says nothing about who has an account.
    const nobody = address();
    for (let i = 0; i < 10; i++) await login(post("/api/auth/login", { email: nobody, password: `guess number ${i} x` }, `10.3.${i}.1`));
    expect((await login(post("/api/auth/login", { email: nobody, password: "anything at all 5" }, "10.4.0.1"))).status).toBe(429);
  });

  it("allows ten tries a minute from one address", async () => {
    for (let i = 0; i < 10; i++) await login(post("/api/auth/login", { email: address(), password: "some guess 12" }, "192.0.2.77"));
    expect((await login(post("/api/auth/login", { email: address(), password: "some guess 12" }, "192.0.2.77"))).status).toBe(429);
  });

  it("refuses a sign-in body that is too large or the wrong shape", async () => {
    expect((await login(post("/api/auth/login", { email: address(), password: "x".repeat(9000) }))).status).toBe(413);
    for (const bad of ["{", { email: { $ne: "" }, password: { $ne: "" } }, { email: "a@example.com" }, []]) expect((await login(post("/api/auth/login", bad, `192.0.2.${100 + ++n}`))).status, JSON.stringify(bad)).toBe(400);
  });
});

describe("the sign-in cookie", () => {
  const to = (url: string, headers: Record<string, string> = {}) => new Request(url, { headers });

  it("is sent over HTTPS only on a deployed server, and works on this machine without it", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(cookieIsSecure(to("https://app.example.com/api/auth/login"))).toBe(true);
    expect(cookieIsSecure(to("http://app.example.com/api/auth/login", { host: "app.example.com" }))).toBe(true);
    // Behind a proxy the server itself is reached over plain HTTP: the forwarded scheme and host decide.
    expect(cookieIsSecure(to("http://localhost:3000/api/auth/login", { "x-forwarded-proto": "https", "x-forwarded-host": "app.example.com" }))).toBe(true);
    expect(cookieIsSecure(to("http://localhost:3000/api/auth/login", { "x-forwarded-host": "app.example.com" }))).toBe(true);
    for (const local of ["http://localhost:3000/x", "http://127.0.0.1:3182/x", "http://[::1]:3000/x"]) expect(cookieIsSecure(to(local)), local).toBe(false);
    vi.stubEnv("NODE_ENV", "development");
    expect(cookieIsSecure(to("http://app.example.com/x"))).toBe(false);
  });

  it("always has the flags that keep it from scripts and from other sites", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(sessionCookie("ses_x", to("https://app.example.com/"))).toEqual({ name: "hakkiri_session", value: "ses_x", httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 2_592_000 });
  });
});

describe("where a person lands after signing in", () => {
  it("is the page they asked for when it is one of ours, and the app's home otherwise", () => {
    expect(safeNext("/interviews/abc?tab=2")).toBe("/interviews/abc?tab=2");
    expect(safeNext("/cv")).toBe("/cv");
    for (const bad of [null, undefined, "", "/", "https://evil.example/", "//evil.example/", "/\\evil.example", "javascript:alert(1)", "interviews", "/login", "/login?next=/x", "/signup", "/api/data/export", "/a\nb", `/${"x".repeat(600)}`]) {
      expect(safeNext(bad as string), String(bad)).toBe("/dashboard");
    }
  });
});

describe("the first time Google confirms an address", () => {
  it("an account made with a password stops accepting it and its sessions end, so whoever registered the address first is shut out", async () => {
    const email = address();
    // Somebody registers an address that isn't theirs, and stays signed in.
    const squatter = await createUser(email, PASSWORD, "Not Them");
    if (!squatter.ok) throw new Error("no account");
    const theirSession = await createSession(squatter.user.id!, email);
    expect(await validateSession(theirSession)).not.toBeNull();
    // The real owner signs in with Google.
    const owner = await findOrCreateOAuthUser({ email: email.toUpperCase(), name: "The Owner", provider: "google" });
    expect(owner.id).toBe(squatter.user.id);
    expect(await validateSession(theirSession)).toBeNull();
    expect(await authenticateUser(email, PASSWORD)).toEqual({ ok: false, error: BAD_SIGN_IN });
    expect(await accountOf(owner.id!)).toMatchObject({ hasPassword: false, signsInWithGoogle: true });
    // The owner's own session, made afterwards, is not ended by signing in with Google again.
    const mine = await createSession(owner.id!, email);
    await findOrCreateOAuthUser({ email, provider: "google" });
    expect((await validateSession(mine))?.id).toBe(owner.id);
  });

  it("a new address gets a Google-only account that no password opens", async () => {
    const email = address();
    const made = await findOrCreateOAuthUser({ email, name: "Gina Okoro", provider: "google" });
    expect(made).toMatchObject({ email, firstName: "Gina", initials: "GO" });
    expect((await findOrCreateOAuthUser({ email, provider: "google" })).id).toBe(made.id);
    expect(await checkPassword(made.id!, "oauth:google")).toBe(false);
    await expect(findOrCreateOAuthUser({ email: "not an address", provider: "google" })).rejects.toThrow();
  });
});

describe("ending sessions and deleting an account", () => {
  it("signs the account out everywhere and removes it, and nobody else", async () => {
    const a = await createUser(address(), PASSWORD);
    const b = await createUser(address(), PASSWORD);
    if (!a.ok || !b.ok) throw new Error("no account");
    const [a1, a2, b1] = [await createSession(a.user.id!, a.user.email!), await createSession(a.user.id!, a.user.email!), await createSession(b.user.id!, b.user.email!)];
    expect(await deleteSessionsFor(a.user.id!)).toBe(2);
    expect(await validateSession(a1)).toBeNull();
    expect(await validateSession(a2)).toBeNull();
    expect((await validateSession(b1))?.id).toBe(b.user.id);

    const a3 = await createSession(a.user.id!, a.user.email!);
    expect(await deleteUser(a.user.id!)).toBe(true);
    expect(await validateSession(a3)).toBeNull();
    expect(await accountOf(a.user.id!)).toBeNull();
    expect(await authenticateUser(a.user.email!, PASSWORD)).toEqual({ ok: false, error: BAD_SIGN_IN });
    expect(await deleteUser(a.user.id!)).toBe(false);
    expect(await deleteUser("")).toBe(false);
    expect((await validateSession(b1))?.id).toBe(b.user.id);
    // The address is free again.
    expect((await createUser(a.user.email!, PASSWORD)).ok).toBe(true);
  });

  it("a session whose account has gone is not honoured", async () => {
    const token = await createSession("usr_never_existed", "ghost@example.com");
    expect(await validateSession(token)).toBeNull();
    expect(await validateSession("x".repeat(500))).toBeNull();
  });
});
