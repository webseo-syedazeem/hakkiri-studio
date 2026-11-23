import crypto from "node:crypto";
import { z } from "zod";
import { getMongoDb, isMongoConfigured } from "@/lib/storage/mongodb";
import { loadJson, saveJson } from "@/lib/storage/disk";
import type { User } from "@/lib/types";
import { LEGACY_MASTER_ID, isReservedAdminEmail } from "./admin-list";
import { passwordProblem } from "./password-rule";

/**
 * Accounts and sign-in sessions. With a database (MONGODB_URI) they live in
 * its `users` and `sessions` collections. Without one they are kept in the
 * app's data folder, in files only the server's own user can read, so a
 * restart doesn't sign everyone out and lose their accounts.
 *
 * Only ever stored: a salted scrypt hash of a password, and a SHA-256 hash of
 * a session token. Neither the password nor the token is written anywhere.
 */

export interface DbUserRecord {
  _id: string; // userId
  email: string;
  name: string;
  firstName: string;
  initials: string;
  passwordHash: string;
  createdAt: Date;
  trial: {
    interviewSecondsLeft: number;
    pitchSecondsLeft: number;
  };
  tier: "free" | "beta" | "job_search" | "monthly";
  /** When Google first confirmed this address belongs to the person signing in. */
  googleVerifiedAt?: Date;
}

export interface DbSessionRecord {
  _id: string; // SHA-256 of the session token
  userId: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
}

const USERS_FILE = "users.json";
const SESSIONS_FILE = "sessions.json";
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
/** What a Google-only account holds in place of a password hash. No password matches it. */
const NO_PASSWORD = "oauth:google";

const date = (v: unknown) => (v instanceof Date ? v : new Date(String(v)));
const reviveUser = (u: DbUserRecord): DbUserRecord => ({ ...u, createdAt: date(u.createdAt), ...(u.googleVerifiedAt ? { googleVerifiedAt: date(u.googleVerifiedAt) } : {}) });
const reviveSession = (s: DbSessionRecord): DbSessionRecord => ({ ...s, createdAt: date(s.createdAt), expiresAt: date(s.expiresAt) });

// Without a database: kept in memory (on globalThis, so every route sees the same accounts) and saved to the data folder.
const globalForMem = globalThis as unknown as {
  __hakkiri_memUsers?: Map<string, DbUserRecord>;
  __hakkiri_memSessions?: Map<string, DbSessionRecord>;
};
const memUsers = (globalForMem.__hakkiri_memUsers ??= new Map(
  loadJson<DbUserRecord[]>(USERS_FILE, [])
    .filter((u) => u && typeof u._id === "string" && typeof u.email === "string")
    .map((u) => [u._id, reviveUser(u)]),
));
const memSessions = (globalForMem.__hakkiri_memSessions ??= new Map(
  loadJson<DbSessionRecord[]>(SESSIONS_FILE, [])
    .filter((s) => s && typeof s._id === "string" && typeof s.userId === "string")
    .map((s) => [s._id, reviveSession(s)] as const)
    .filter(([, s]) => s.expiresAt.getTime() > Date.now()),
));

const saveUsers = () => saveJson(USERS_FILE, [...memUsers.values()], { private: true });
function saveSessions() {
  const now = Date.now();
  for (const [key, s] of memSessions) if (s.expiresAt.getTime() <= now) memSessions.delete(key);
  saveJson(SESSIONS_FILE, [...memSessions.values()], { private: true });
}

const usersCol = async () => (await getMongoDb())?.collection<DbUserRecord>("users") ?? null;
const sessionsCol = async () => (await getMongoDb())?.collection<DbSessionRecord>("sessions") ?? null;

/* ------------------------------------------------------------- passwords */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** A stored hash a password could match (as opposed to a Google-only account's marker). */
const isPasswordHash = (combined: string | undefined): combined is string => !!combined && /^[0-9a-f]{32}:[0-9a-f]{128}$/.test(combined);

export function verifyPassword(password: string, combined: string): boolean {
  const [salt, hash] = combined.split(":");
  if (!salt || !hash) return false;
  try {
    const computed = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(computed, "hex"));
  } catch {
    return false;
  }
}

let dummyHash: string | undefined;
/** Checked when there is no account, or no password, to compare against: the answer takes as long either way. */
const dummy = () => (dummyHash ??= hashPassword(crypto.randomBytes(16).toString("hex")));

export function computeInitials(name: string, email: string): { firstName: string; initials: string } {
  const cleanName = name.trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? "User";
    const initials = parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : firstName.slice(0, 2).toUpperCase();
    return { firstName, initials };
  }
  const prefix = email.split("@")[0] ?? "User";
  const firstName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  const initials = prefix.slice(0, 2).toUpperCase();
  return { firstName, initials };
}

const toUser = (record: DbUserRecord): User => ({
  id: record._id,
  email: record.email,
  firstName: record.firstName,
  initials: record.initials,
  trial: record.trial,
  tier: record.tier,
  createdAt: record.createdAt instanceof Date && !Number.isNaN(record.createdAt.getTime()) ? record.createdAt.toISOString() : undefined,
});

/* ---------------------------------------------------------------- lookup */

const Email = z.string().trim().toLowerCase().max(254).email();

/** An email address as it is stored (trimmed, lower case), or null when it isn't one. */
export function normaliseEmail(email: unknown): string | null {
  const parsed = Email.safeParse(email);
  return parsed.success ? parsed.data : null;
}

async function recordByEmail(normEmail: string): Promise<DbUserRecord | null> {
  if (isMongoConfigured()) {
    const col = await usersCol();
    if (!col) throw new Error("The database isn't ready.");
    const found = await col.findOne({ email: normEmail });
    return found ? reviveUser(found as DbUserRecord) : null;
  }
  for (const u of memUsers.values()) if (u.email === normEmail) return u;
  return null;
}

async function recordById(userId: string): Promise<DbUserRecord | null> {
  if (isMongoConfigured()) {
    const col = await usersCol();
    if (!col) throw new Error("The database isn't ready.");
    const found = await col.findOne({ _id: userId });
    return found ? reviveUser(found as DbUserRecord) : null;
  }
  return memUsers.get(userId) ?? null;
}

async function insertUser(doc: DbUserRecord): Promise<void> {
  if (isMongoConfigured()) {
    const col = await usersCol();
    if (!col) throw new Error("The database isn't ready.");
    await col.insertOne(doc);
    return;
  }
  memUsers.set(doc._id, doc);
  saveUsers();
}

async function changeUser(userId: string, change: Partial<DbUserRecord>): Promise<void> {
  if (isMongoConfigured()) {
    const col = await usersCol();
    if (!col) throw new Error("The database isn't ready.");
    await col.updateOne({ _id: userId }, { $set: change });
    return;
  }
  const existing = memUsers.get(userId);
  if (!existing) return;
  memUsers.set(userId, { ...existing, ...change });
  saveUsers();
}

/* --------------------------------------------------------------- sign-up */

/**
 * One answer for every reason an address can't be registered (it has an
 * account already, or it is held back for an administrator), so the sign-up
 * form can't be used to find out which addresses have accounts.
 */
export const CANT_REGISTER = "We couldn’t create an account with that address. If you already have one, sign in instead, or use “Continue with Google”.";

/** Create a new account. */
export async function createUser(
  email: string,
  password: string,
  name = "",
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const normEmail = normaliseEmail(email);
  if (!normEmail) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  const problem = passwordProblem(password, normEmail);
  if (problem) return { ok: false, error: problem };

  const cleanName = String(name ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  const { firstName, initials } = computeInitials(cleanName, normEmail);
  // Hashed before anything is looked up, so the answer takes as long whether or not the address is taken.
  const passwordHash = hashPassword(password);
  const userId = `usr_${crypto.randomBytes(12).toString("hex")}`;

  // Sign-up does not prove who owns an address, so an address that would make its account an administrator
  // cannot be registered with a password by whoever gets there first. An administrator signs up before their
  // address is listed (or is listed by account id), or signs in with Google, which does prove the address.
  if (isReservedAdminEmail(normEmail)) return { ok: false, error: CANT_REGISTER };

  const userDoc: DbUserRecord = {
    _id: userId,
    email: normEmail,
    name: cleanName || firstName,
    firstName,
    initials,
    passwordHash,
    createdAt: new Date(),
    trial: { interviewSecondsLeft: 10 * 60, pitchSecondsLeft: 10 * 60 },
    tier: "beta",
  };

  try {
    if (await recordByEmail(normEmail)) return { ok: false, error: CANT_REGISTER };
    await insertUser(userDoc);
  } catch (err) {
    console.error("[auth] error creating user:", err);
    return { ok: false, error: "Could not create account. Please try again." };
  }
  return { ok: true, user: toUser(userDoc) };
}

/* --------------------------------------------------------------- sign-in */

/** One answer for an unknown address, a wrong password and a Google-only account. */
export const BAD_SIGN_IN = "Email or password is incorrect. If you usually use “Continue with Google”, use that.";

/** Verify user credentials and return user profile. */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const normEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normEmail || typeof password !== "string" || !password) {
    return { ok: false, error: "Please provide both email and password." };
  }
  if (normEmail.length > 254 || password.length > 1024) return { ok: false, error: BAD_SIGN_IN };

  let record: DbUserRecord | null = null;
  try {
    record = await recordByEmail(normEmail);
  } catch (err) {
    console.error("[auth] error looking up user:", err);
    return { ok: false, error: "Authentication service temporarily unavailable. Please try again." };
  }

  // The old built-in admin account is never signed in: its password was written in the source code.
  if (record?._id === LEGACY_MASTER_ID) record = null;

  // The same work is done whether or not there is an account or a password to check, so neither the
  // message nor the time taken says which addresses have accounts.
  const usable = record && isPasswordHash(record.passwordHash) ? record.passwordHash : null;
  const matches = verifyPassword(password, usable ?? dummy());
  if (!record || !usable || !matches) return { ok: false, error: BAD_SIGN_IN };
  return { ok: true, user: toUser(record) };
}

/** Whether this is the account's own password: asked again before the account is deleted. */
export async function checkPassword(userId: string, password: string): Promise<boolean> {
  if (!userId || typeof password !== "string" || !password || password.length > 1024) return false;
  let record: DbUserRecord | null = null;
  try {
    record = await recordById(userId);
  } catch {
    return false;
  }
  const usable = record && isPasswordHash(record.passwordHash) ? record.passwordHash : null;
  return verifyPassword(password, usable ?? dummy()) && !!usable;
}

/** What the account record holds, for Settings and "Download my data". Never the password hash. */
export async function accountOf(userId: string): Promise<{ id: string; email: string; name: string; createdAt?: string; tier: string; hasPassword: boolean; signsInWithGoogle: boolean } | null> {
  if (!userId) return null;
  let record: DbUserRecord | null = null;
  try {
    record = await recordById(userId);
  } catch {
    return null;
  }
  if (!record) return null;
  return {
    id: record._id,
    email: record.email,
    name: record.name,
    createdAt: toUser(record).createdAt,
    tier: record.tier,
    hasPassword: isPasswordHash(record.passwordHash),
    signsInWithGoogle: !!record.googleVerifiedAt || record.passwordHash === NO_PASSWORD,
  };
}

/* -------------------------------------------------------------- sessions */

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

let _ttlIndexEnsured = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureSessionIndex(col: any) {
  if (_ttlIndexEnsured) return;
  try {
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    _ttlIndexEnsured = true;
  } catch {
    // index creation silently ignored if already exists
  }
}

/**
 * Create a session token with 30-day validity.
 * Raw token is returned to caller for httpOnly cookie; hashed token is stored.
 */
export async function createSession(userId: string, email: string): Promise<string> {
  const token = `ses_${crypto.randomBytes(32).toString("hex")}`;
  const sessionDoc: DbSessionRecord = {
    _id: hashToken(token),
    userId,
    email,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + SESSION_MS),
  };

  if (isMongoConfigured()) {
    try {
      const col = await sessionsCol();
      if (col) {
        await ensureSessionIndex(col);
        await col.insertOne(sessionDoc);
      }
    } catch (err) {
      console.error("[auth] error creating session:", err);
    }
  } else {
    memSessions.set(sessionDoc._id, sessionDoc);
    saveSessions();
  }
  return token;
}

/** Validate session token and return user profile. */
export async function validateSession(token: string): Promise<User | null> {
  if (!token || typeof token !== "string" || token.length > 200) return null;

  const tokenHash = hashToken(token);
  let session: DbSessionRecord | null = null;

  if (isMongoConfigured()) {
    try {
      const col = await sessionsCol();
      if (col) {
        await ensureSessionIndex(col);
        session = (await col.findOne({ $or: [{ _id: tokenHash }, { _id: token }] })) as DbSessionRecord | null;
      }
    } catch (err) {
      console.error("[auth] error validating session:", err);
      return null;
    }
  } else {
    session = memSessions.get(tokenHash) ?? null;
  }

  if (!session) return null;
  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    void deleteSession(token);
    return null;
  }

  // A session that belongs to the old built-in admin account is ended, not honoured.
  if (session.userId === LEGACY_MASTER_ID) {
    void deleteSession(token);
    return null;
  }

  try {
    const record = await recordById(session.userId);
    if (record) return toUser(record);
  } catch (err) {
    console.error("[auth] error fetching session user:", err);
    return null;
  }
  // The account is gone (deleted): its session is too.
  void deleteSession(token);
  return null;
}

/** Revoke session on logout. */
export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  const tokenHash = hashToken(token);

  if (isMongoConfigured()) {
    try {
      const col = await sessionsCol();
      if (col) await col.deleteMany({ $or: [{ _id: tokenHash }, { _id: token }] });
    } catch (err) {
      console.error("[auth] error deleting session:", err);
    }
  } else if (memSessions.delete(tokenHash)) {
    saveSessions();
  }
}

/** Ends every session of an account: every browser it was signed in on is signed out. Returns how many. */
export async function deleteSessionsFor(userId: string): Promise<number> {
  if (!userId) return 0;
  if (isMongoConfigured()) {
    try {
      const col = await sessionsCol();
      return col ? ((await col.deleteMany({ userId })).deletedCount ?? 0) : 0;
    } catch (err) {
      console.error("[auth] error deleting sessions:", err);
      return 0;
    }
  }
  let gone = 0;
  for (const [key, s] of memSessions) {
    if (s.userId === userId) {
      memSessions.delete(key);
      gone++;
    }
  }
  if (gone) saveSessions();
  return gone;
}

/**
 * Deletes the account record and every session of it ("Delete my account").
 * What the person made in the app is deleted separately, before this.
 */
export async function deleteUser(userId: string): Promise<boolean> {
  if (!userId) return false;
  await deleteSessionsFor(userId);
  if (isMongoConfigured()) {
    try {
      const col = await usersCol();
      return col ? ((await col.deleteOne({ _id: userId })).deletedCount ?? 0) > 0 : false;
    } catch (err) {
      console.error("[auth] error deleting user:", err);
      return false;
    }
  }
  const had = memUsers.delete(userId);
  if (had) saveUsers();
  return had;
}

/* ---------------------------------------------------------------- Google */

/** Look up an existing user by email address. */
export async function findUserByEmail(email: string): Promise<User | null> {
  const normEmail = normaliseEmail(email);
  if (!normEmail) return null;
  try {
    const record = await recordByEmail(normEmail);
    return record ? toUser(record) : null;
  } catch (err) {
    console.error("[auth] findUserByEmail error:", err);
    return null;
  }
}

/**
 * Find or create the account for someone Google has just confirmed owns this
 * address.
 *
 * Sign-up with a password never proves who owns an address. So the first time
 * Google confirms it, an account that was made with a password stops
 * accepting that password and every session it had is ended: if somebody else
 * registered this person's address first, they are shut out from that moment,
 * and the real owner carries on with Google.
 */
export async function findOrCreateOAuthUser(profile: {
  email: string;
  name?: string;
  picture?: string;
  provider: "google";
  providerId?: string;
}): Promise<User> {
  const normEmail = normaliseEmail(profile.email);
  if (!normEmail) throw new Error("Google gave no usable email address.");
  const cleanName = (profile.name ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  const { firstName, initials } = computeInitials(cleanName, normEmail);

  const existing = await recordByEmail(normEmail);
  if (existing && existing._id !== LEGACY_MASTER_ID) {
    if (!existing.googleVerifiedAt) {
      const change: Partial<DbUserRecord> = { googleVerifiedAt: new Date() };
      if (existing.passwordHash !== NO_PASSWORD) {
        change.passwordHash = NO_PASSWORD;
        await deleteSessionsFor(existing._id);
      }
      await changeUser(existing._id, change);
    }
    return toUser(existing);
  }

  const record: DbUserRecord = {
    _id: `usr_${crypto.randomBytes(12).toString("hex")}`,
    email: normEmail,
    name: cleanName || firstName,
    firstName,
    initials,
    passwordHash: NO_PASSWORD,
    createdAt: new Date(),
    trial: { interviewSecondsLeft: 10 * 60, pitchSecondsLeft: 10 * 60 },
    tier: "beta",
    googleVerifiedAt: new Date(),
  };
  await insertUser(record);
  return toUser(record);
}
