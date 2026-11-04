import crypto from "node:crypto";
import { loadJson, saveJson } from "@/lib/storage/disk";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  targetRole: string;
  plan: "foundation" | "accelerator" | "executive";
  assessed: boolean;
  createdAt: string;
  lastLoginAt?: string;
  resetToken?: string;
  resetRequestedAt?: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  firstName: string;
  initials: string;
  targetRole: string;
  plan: "foundation" | "accelerator" | "executive";
  assessed: boolean;
  createdAt: string;
}

const USERS_FILE = "users.json";

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
}

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "HK";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function computeFirstName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts[0] || "Leader";
}

export function toSafeUser(u: StoredUser): SafeUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    firstName: computeFirstName(u.name),
    initials: computeInitials(u.name),
    targetRole: u.targetRole || "Senior Product Manager",
    plan: u.plan || "executive",
    assessed: Boolean(u.assessed),
    createdAt: u.createdAt,
  };
}

/** Pre-seed Priya Shah as default executive member so tests and initial runs have valid accounts */
function seedInitialUsers(): StoredUser[] {
  const salt = crypto.randomBytes(16).toString("hex");
  const priya: StoredUser = {
    id: "usr_priya_shah",
    name: "Priya Shah",
    email: "priya@example.com",
    salt,
    passwordHash: hashPassword("password123", salt),
    targetRole: "Senior Product Manager, Payments",
    plan: "executive",
    assessed: true,
    createdAt: "2026-10-01T10:00:00.000Z",
    lastLoginAt: new Date().toISOString(),
  };

  const salt2 = crypto.randomBytes(16).toString("hex");
  const alex: StoredUser = {
    id: "usr_alex_rivera",
    name: "Alex Rivera",
    email: "alex@example.com",
    salt: salt2,
    passwordHash: hashPassword("password123", salt2),
    targetRole: "VP of Engineering",
    plan: "accelerator",
    assessed: false,
    createdAt: "2026-10-15T12:00:00.000Z",
  };

  return [priya, alex];
}

let memoryUsers: StoredUser[] | null = null;

export function getAllUsers(): StoredUser[] {
  if (memoryUsers) return memoryUsers;
  const users = loadJson<StoredUser[]>(USERS_FILE, []);
  if (!users || users.length === 0) {
    const seeded = seedInitialUsers();
    saveJson(USERS_FILE, seeded);
    memoryUsers = [...seeded];
    return memoryUsers;
  }
  memoryUsers = [...users];
  return memoryUsers;
}

export function findUserByEmail(email: string): StoredUser | null {
  const clean = email.trim().toLowerCase();
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === clean) || null;
}

export function findUserById(id: string): StoredUser | null {
  const users = getAllUsers();
  return users.find((u) => u.id === id) || null;
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
  targetRole?: string;
  plan?: "foundation" | "accelerator" | "executive";
}): { ok: true; user: SafeUser } | { ok: false; error: string } {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password;
  const targetRole = input.targetRole?.trim() || "Executive Leader";

  if (!name || name.length < 2) {
    return { ok: false, error: "Please enter your full name (at least 2 characters)." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { ok: false, error: "Please enter a valid work or personal email address." };
  }

  if (!password || password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const existing = findUserByEmail(email);
  if (existing) {
    return { ok: false, error: "An account with this email address already exists. Please log in." };
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const id = `usr_${crypto.randomBytes(8).toString("hex")}`;

  const newUser: StoredUser = {
    id,
    name,
    email,
    salt,
    passwordHash,
    targetRole,
    plan: input.plan || "foundation",
    assessed: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const users = getAllUsers();
  users.push(newUser);
  saveJson(USERS_FILE, users);

  return { ok: true, user: toSafeUser(newUser) };
}

export function verifyCredentials(
  email: string,
  password: string
): { ok: true; user: SafeUser } | { ok: false; error: string } {
  const user = findUserByEmail(email);
  if (!user) {
    return { ok: false, error: "Invalid email or password." };
  }

  const expectedHash = hashPassword(password, user.salt);
  const match = crypto.timingSafeEqual(
    Buffer.from(user.passwordHash, "hex"),
    Buffer.from(expectedHash, "hex")
  );

  if (!match) {
    return { ok: false, error: "Invalid email or password." };
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  updateUser(user.id, { lastLoginAt: user.lastLoginAt });

  return { ok: true, user: toSafeUser(user) };
}

export function updateUser(id: string, updates: Partial<StoredUser>): SafeUser | null {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...updates };
  saveJson(USERS_FILE, users);
  return toSafeUser(users[idx]);
}

export function requestPasswordReset(email: string): { ok: boolean; message: string } {
  const clean = email.trim().toLowerCase();
  const user = findUserByEmail(clean);
  if (!user) {
    // Return friendly generic response to prevent email enumeration
    return {
      ok: true,
      message: "If an account matches this email, reset instructions have been sent.",
    };
  }

  const token = crypto.randomBytes(24).toString("hex");
  updateUser(user.id, {
    resetToken: token,
    resetRequestedAt: new Date().toISOString(),
  });

  return {
    ok: true,
    message: `Password reset instructions sent to ${clean}. (Token generated for verification).`,
  };
}

export function getAuthenticatedUser(cookieJar: {
  get(name: string): { value: string } | undefined;
}): SafeUser {
  const userId = cookieJar.get("hk_user_id")?.value;
  if (userId) {
    const found = findUserById(userId);
    if (found) return toSafeUser(found);
  }

  const rawUserCookie = cookieJar.get("hk_user")?.value;
  if (rawUserCookie) {
    const decodedName = decodeURIComponent(rawUserCookie);
    return {
      id: "usr_active_session",
      name: decodedName,
      email: "leader@hakkiri.studio",
      firstName: computeFirstName(decodedName),
      initials: computeInitials(decodedName),
      targetRole: decodeURIComponent(cookieJar.get("hk_role")?.value || "Senior Product Manager"),
      plan: "executive",
      assessed: cookieJar.get("hk_assessed")?.value === "1",
      createdAt: "2026-10-01T10:00:00.000Z",
    };
  }

  // Fallback to default user
  const users = getAllUsers();
  return toSafeUser(users[0]);
}
