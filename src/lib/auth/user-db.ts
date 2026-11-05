import crypto from "node:crypto";
import { getMongoDb, isMongoConfigured } from "@/lib/storage/mongodb";
import type { User } from "@/lib/types";

/**
 * Authentication and User database backed by MongoDB Atlas.
 * Provides secure scrypt password hashing, session tokens, and user persistence.
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
}

export interface DbSessionRecord {
  _id: string; // session token
  userId: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
}

// In-memory fallback if MongoDB is not configured or in local test mocks
const memUsers = new Map<string, DbUserRecord>();
const memSessions = new Map<string, DbSessionRecord>();

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

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

/**
 * Create a new user account in MongoDB Atlas.
 */
export async function createUser(
  email: string,
  password: string,
  name = "",
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const normEmail = email.trim().toLowerCase();
  if (!normEmail || !normEmail.includes("@")) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters long." };
  }

  const { firstName, initials } = computeInitials(name, normEmail);
  const passwordHash = hashPassword(password);
  const userId = `usr_${crypto.randomBytes(12).toString("hex")}`;

  const userDoc: DbUserRecord = {
    _id: userId,
    email: normEmail,
    name: name.trim() || firstName,
    firstName,
    initials,
    passwordHash,
    createdAt: new Date(),
    trial: { interviewSecondsLeft: 10 * 60, pitchSecondsLeft: 10 * 60 },
    tier: "beta",
  };

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (!db) {
        return { ok: false, error: "Database service is initializing. Please try again in a moment." };
      }
      const usersCol = db.collection<DbUserRecord>("users");
      const existing = await usersCol.findOne({ email: normEmail });
      if (existing) {
        return { ok: false, error: "An account with this email already exists. Please sign in." };
      }
      await usersCol.insertOne(userDoc);
    } catch (err) {
      console.error("[auth] error creating user:", err);
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, error: `Could not create account: ${msg}` };
    }
  } else {
    // In-memory fallback
    for (const u of memUsers.values()) {
      if (u.email === normEmail) {
        return { ok: false, error: "An account with this email already exists. Please sign in." };
      }
    }
    memUsers.set(userId, userDoc);
  }

  const user: User = {
    id: userDoc._id,
    email: userDoc.email,
    firstName: userDoc.firstName,
    initials: userDoc.initials,
    trial: userDoc.trial,
    tier: userDoc.tier,
    createdAt: userDoc.createdAt.toISOString(),
  };

  return { ok: true, user };
}

/**
 * Verify user credentials and return user profile.
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const normEmail = email.trim().toLowerCase();
  if (!normEmail || !password) {
    return { ok: false, error: "Please provide both email and password." };
  }

  let record: DbUserRecord | null = null;

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const usersCol = db.collection<DbUserRecord>("users");
        record = await usersCol.findOne({ email: normEmail });
      }
    } catch (err) {
      console.error("[auth] error looking up user:", err);
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, error: `Login error: ${msg}` };
    }
  } else {
    for (const u of memUsers.values()) {
      if (u.email === normEmail) {
        record = u;
        break;
      }
    }
  }

  if (!record) {
    return { ok: false, error: "No account found with this email. Please check or create an account." };
  }

  if (!verifyPassword(password, record.passwordHash)) {
    return { ok: false, error: "Incorrect password. Please try again." };
  }

  const user: User = {
    id: record._id,
    email: record.email,
    firstName: record.firstName,
    initials: record.initials,
    trial: record.trial,
    tier: record.tier,
    createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : undefined,
  };

  return { ok: true, user };
}

/**
 * Create a session token with 30-day validity.
 */
export async function createSession(userId: string, email: string): Promise<string> {
  const token = `ses_${crypto.randomBytes(32).toString("hex")}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const sessionDoc: DbSessionRecord = {
    _id: token,
    userId,
    email,
    createdAt: new Date(),
    expiresAt,
  };

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const sessionsCol = db.collection<DbSessionRecord>("sessions");
        await sessionsCol.insertOne(sessionDoc);
      }
    } catch (err) {
      console.error("[auth] error creating session:", err);
    }
  } else {
    memSessions.set(token, sessionDoc);
  }

  return token;
}

/**
 * Validate session token and return user profile.
 */
export async function validateSession(token: string): Promise<User | null> {
  if (!token) return null;

  let session: DbSessionRecord | null = null;

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const sessionsCol = db.collection<DbSessionRecord>("sessions");
        session = await sessionsCol.findOne({ _id: token });
      }
    } catch (err) {
      console.error("[auth] error validating session:", err);
      return null;
    }
  } else {
    session = memSessions.get(token) ?? null;
  }

  if (!session) return null;
  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    // Session expired
    void deleteSession(token);
    return null;
  }

  // Fetch full user record
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const usersCol = db.collection<DbUserRecord>("users");
        const userDoc = await usersCol.findOne({ _id: session.userId });
        if (userDoc) {
          return {
            id: userDoc._id,
            email: userDoc.email,
            firstName: userDoc.firstName,
            initials: userDoc.initials,
            trial: userDoc.trial,
            tier: userDoc.tier,
            createdAt: userDoc.createdAt instanceof Date ? userDoc.createdAt.toISOString() : undefined,
          };
        }
      }
    } catch (err) {
      console.error("[auth] error fetching session user:", err);
    }
  } else {
    const userDoc = memUsers.get(session.userId);
    if (userDoc) {
      return {
        id: userDoc._id,
        email: userDoc.email,
        firstName: userDoc.firstName,
        initials: userDoc.initials,
        trial: userDoc.trial,
        tier: userDoc.tier,
      };
    }
  }

  return null;
}

/**
 * Revoke session on logout.
 */
export async function deleteSession(token: string): Promise<void> {
  if (!token) return;

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const sessionsCol = db.collection<DbSessionRecord>("sessions");
        await sessionsCol.deleteOne({ _id: token });
      }
    } catch (err) {
      console.error("[auth] error deleting session:", err);
    }
  } else {
    memSessions.delete(token);
  }
}
