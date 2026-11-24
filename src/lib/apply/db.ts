import "server-only";
import { getMongoDb, isMongoConfigured } from "@/lib/storage/mongodb";
import type {
  Lead,
  Profile,
  Voice,
  Evidence,
  Audit,
  Cv,
  Output,
  Job,
  Match,
  Application,
  SendLog,
  ApplySettings,
} from "./schema";
import { isSeededEvidence } from "./seeded";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

/* --------------------------------------------------------------------------
   COLLECTION NAMES
-------------------------------------------------------------------------- */
export const APPLY_COLLECTIONS = {
  LEADS: "apply_leads",
  PROFILES: "apply_profiles",
  VOICES: "apply_voices",
  EVIDENCE: "apply_evidence",
  AUDITS: "apply_audits",
  CVS: "apply_cvs",
  OUTPUTS: "apply_outputs",
  JOBS: "apply_jobs",
  MATCHES: "apply_matches",
  APPLICATIONS: "apply_applications",
  SENDS: "apply_sends",
  SETTINGS: "apply_settings",
} as const;

// In-memory fallback cache so that even if serverless disk has any issue, data is safely retained
declare global {
  // eslint-disable-next-line no-var
  var _applyMemoryStore: Record<string, Record<string, unknown>> | undefined;
}
if (!global._applyMemoryStore) {
  global._applyMemoryStore = {};
}
const memoryStore = global._applyMemoryStore;

function resolveFallbackDir(): string {
  if (process.env.HAKKIRI_DATA_DIR) {
    return path.join(process.env.HAKKIRI_DATA_DIR, "apply");
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "hakkiri-apply");
  }
  return path.join(process.cwd(), ".data", "apply");
}

function ensureFallbackDir(dir: string) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // Non-fatal on read-only environments
  }
}

function readFallback<T>(collection: string): Record<string, T> {
  if (!memoryStore[collection]) {
    memoryStore[collection] = {};
  }
  try {
    const dir = resolveFallbackDir();
    ensureFallbackDir(dir);
    const f = path.join(dir, `${collection}.json`);
    if (fs.existsSync(f)) {
      const diskData = JSON.parse(fs.readFileSync(f, "utf-8"));
      memoryStore[collection] = { ...diskData, ...memoryStore[collection] };
    }
  } catch {
    // Fall back to memoryStore
  }
  return memoryStore[collection] as Record<string, T>;
}

function writeFallback<T>(collection: string, data: Record<string, T>) {
  if (!memoryStore[collection]) {
    memoryStore[collection] = {};
  }
  memoryStore[collection] = data as Record<string, unknown>;
  try {
    const dir = resolveFallbackDir();
    ensureFallbackDir(dir);
    const f = path.join(dir, `${collection}.json`);
    fs.writeFileSync(f, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Fall back to memoryStore
  }
}

/* --------------------------------------------------------------------------
   GENERIC DOCUMENT OPERATIONS
-------------------------------------------------------------------------- */

/**
 * A document key is used as a property name in the local store, and some keys
 * come straight from a web address. "__proto__", "constructor" and the like
 * are not documents: looking one up used to hand back JavaScript's own base
 * object, and a route that then wrote to "the document" changed every object
 * in the server. Such a key is treated as a document that does not exist.
 */
export function isDocKey(key: unknown): key is string {
  return typeof key === "string" && key.length > 0 && key.length <= 200 && key !== "__proto__" && key !== "constructor" && key !== "prototype" && !/[\u0000-\u001f]/.test(key);
}
const own = <T>(store: Record<string, T>, key: string): T | null => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null);

export async function saveDoc<T extends { id?: string; userId?: string }>(
  collectionName: string,
  docKey: string,
  doc: T,
): Promise<T> {
  if (!isDocKey(docKey)) throw new Error("That is not a document key.");
  // 1. Try MongoDB
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection(collectionName);
        await col.replaceOne(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { _id: docKey as any },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { _id: docKey as any, ...doc, updatedAt: new Date().toISOString() },
          { upsert: true },
        );
        return doc;
      }
    } catch (err) {
      console.warn(`[apply_db] Mongo save fallback for ${collectionName}:`, err);
    }
  }

  // 2. Fallback to local disk store
  const store = readFallback<T>(collectionName);
  store[docKey] = {
    ...doc,
    updatedAt: new Date().toISOString(),
  };
  writeFallback(collectionName, store);
  return doc;
}

export async function getDoc<T>(
  collectionName: string,
  docKey: string,
): Promise<T | null> {
  if (!isDocKey(docKey)) return null;
  // 1. Try MongoDB
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection(collectionName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await col.findOne({ _id: docKey as any });
        if (res) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, ...clean } = res;
          return clean as unknown as T;
        }
      }
    } catch (err) {
      console.warn(`[apply_db] Mongo get fallback for ${collectionName}:`, err);
    }
  }

  // 2. Fallback
  const store = readFallback<T>(collectionName);
  return own(store, docKey);
}

export async function deleteDoc(
  collectionName: string,
  docKey: string,
): Promise<boolean> {
  if (!isDocKey(docKey)) return false;
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection(collectionName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await col.deleteOne({ _id: docKey as any });
      }
    } catch (err) {
      console.warn(`[apply_db] Mongo delete fallback for ${collectionName}:`, err);
    }
  }

  const store = readFallback(collectionName);
  delete store[docKey];
  writeFallback(collectionName, store);
  return true;
}

export async function queryDocs<T>(
  collectionName: string,
  predicate: (item: T) => boolean,
): Promise<T[]> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection(collectionName);
        const docs = await col.find({}).toArray();
        return docs
          .map((d) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, ...clean } = d;
            return clean as unknown as T;
          })
          .filter(predicate);
      }
    } catch (err) {
      console.warn(`[apply_db] Mongo query fallback for ${collectionName}:`, err);
    }
  }

  const store = readFallback<T>(collectionName);
  return Object.values(store).filter(predicate);
}

/** One person's documents in a collection. Asks the database for just theirs, where there is one. */
export async function queryDocsByUser<T extends { userId?: string }>(collectionName: string, userId: string): Promise<T[]> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const docs = await db.collection(collectionName).find({ userId }).toArray();
        return docs.map((d) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, ...clean } = d;
          return clean as unknown as T;
        });
      }
    } catch (err) {
      console.warn(`[apply_db] Mongo query fallback for ${collectionName}:`, err);
    }
  }
  return Object.values(readFallback<T>(collectionName)).filter((d) => d.userId === userId);
}

/* --------------------------------------------------------------------------
   TYPED ENTITY HELPERS
-------------------------------------------------------------------------- */

export async function getProfile(userId: string): Promise<Profile | null> {
  return getDoc<Profile>(APPLY_COLLECTIONS.PROFILES, userId);
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  return saveDoc<Profile>(APPLY_COLLECTIONS.PROFILES, profile.userId, profile);
}

export async function getVoice(userId: string): Promise<Voice | null> {
  return getDoc<Voice>(APPLY_COLLECTIONS.VOICES, userId);
}

export async function saveVoice(voice: Voice): Promise<Voice> {
  return saveDoc<Voice>(APPLY_COLLECTIONS.VOICES, voice.userId, voice);
}

/** A person's evidence. The invented entries an earlier build seeded are never returned (see seeded.ts). */
export async function listEvidence(userId: string): Promise<Evidence[]> {
  return queryDocs<Evidence>(APPLY_COLLECTIONS.EVIDENCE, (e) => e.userId === userId && !isSeededEvidence(e));
}

/** Deletes the invented entries an earlier build seeded into this person's bank. Returns how many were removed. */
export async function removeSeededEvidence(userId: string): Promise<number> {
  const seeded = await queryDocs<Evidence>(APPLY_COLLECTIONS.EVIDENCE, (e) => e.userId === userId && isSeededEvidence(e));
  for (const e of seeded) await deleteDoc(APPLY_COLLECTIONS.EVIDENCE, e.id);
  return seeded.length;
}

export async function saveEvidence(ev: Evidence): Promise<Evidence> {
  return saveDoc<Evidence>(APPLY_COLLECTIONS.EVIDENCE, ev.id, ev);
}

export async function getAudit(id: string): Promise<Audit | null> {
  return getDoc<Audit>(APPLY_COLLECTIONS.AUDITS, id);
}

export async function saveAudit(audit: Audit): Promise<Audit> {
  return saveDoc<Audit>(APPLY_COLLECTIONS.AUDITS, audit.id, audit);
}

export async function listCvs(userId: string): Promise<Cv[]> {
  return queryDocs<Cv>(APPLY_COLLECTIONS.CVS, (c) => c.userId === userId);
}

export async function getCv(id: string): Promise<Cv | null> {
  return getDoc<Cv>(APPLY_COLLECTIONS.CVS, id);
}

export async function saveCv(cv: Cv): Promise<Cv> {
  return saveDoc<Cv>(APPLY_COLLECTIONS.CVS, cv.id, cv);
}

export async function listApplications(userId: string): Promise<Application[]> {
  if (!userId) return [];
  return queryDocsByUser<Application>(APPLY_COLLECTIONS.APPLICATIONS, userId);
}

/** The person's own application. Someone else's, or one that doesn't exist, is null. */
export async function getApplication(id: string, userId: string): Promise<Application | null> {
  if (!userId) return null;
  const app = await getDoc<Application>(APPLY_COLLECTIONS.APPLICATIONS, id);
  return app && app.userId === userId ? app : null;
}

export async function saveApplication(app: Application): Promise<Application> {
  return saveDoc<Application>(APPLY_COLLECTIONS.APPLICATIONS, app.id, app);
}

/** The jobs this person saved: nobody else's. */
export async function listJobs(userId: string): Promise<Job[]> {
  if (!userId) return [];
  const jobs = await queryDocsByUser<Job>(APPLY_COLLECTIONS.JOBS, userId);
  // A job saved before jobs carried an owner is found through the person's own application for it.
  const have = new Set(jobs.map((j) => j.id));
  for (const app of await listApplications(userId)) {
    if (have.has(app.jobId)) continue;
    const job = await getJob(app.jobId, userId);
    if (job) jobs.push(job);
    have.add(app.jobId);
  }
  return jobs;
}

/**
 * A job the person saved. Someone else's, or one that doesn't exist, is null.
 * A job saved before jobs carried an owner belongs to the person whose
 * application was made for it (the server made one with every job), and is
 * marked as theirs the first time they open it.
 */
export async function getJob(id: string, userId: string): Promise<Job | null> {
  if (!userId) return null;
  const job = await getDoc<Job>(APPLY_COLLECTIONS.JOBS, id);
  if (!job) return null;
  if (job.userId) return job.userId === userId ? job : null;
  const apps = await queryDocsByUser<Application>(APPLY_COLLECTIONS.APPLICATIONS, userId);
  if (!apps.some((a) => a.jobId === id)) return null;
  return saveJob({ ...job, userId });
}

export async function saveJob(job: Job): Promise<Job> {
  return saveDoc<Job>(APPLY_COLLECTIONS.JOBS, job.id, job);
}

export async function listMatches(userId: string): Promise<Match[]> {
  return queryDocs<Match>(APPLY_COLLECTIONS.MATCHES, (m) => m.userId === userId);
}

export async function saveMatch(match: Match): Promise<Match> {
  return saveDoc<Match>(APPLY_COLLECTIONS.MATCHES, match.id, match);
}

export async function getApplySettings(userId: string): Promise<ApplySettings> {
  const existing = await getDoc<ApplySettings>(APPLY_COLLECTIONS.SETTINGS, userId);
  if (existing) return existing;
  const def: ApplySettings = {
    userId,
    titles: ["Product Manager", "Lead Developer", "Operations Specialist"],
    locations: ["London", "UK Remote"],
    remote: true,
    salaryMin: 60000,
    excludeEmployers: [],
    minFit: 75,
    dailyCap: 3,
    perEmployerCap: 2,
    handsOff: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return saveDoc<ApplySettings>(APPLY_COLLECTIONS.SETTINGS, userId, def);
}

export async function saveApplySettings(settings: ApplySettings): Promise<ApplySettings> {
  return saveDoc<ApplySettings>(APPLY_COLLECTIONS.SETTINGS, settings.userId, settings);
}

export async function listOutputs(applicationId: string, userId: string): Promise<Output[]> {
  if (!userId) return [];
  return (await queryDocsByUser<Output>(APPLY_COLLECTIONS.OUTPUTS, userId)).filter((o) => o.applicationId === applicationId);
}

export async function saveOutput(output: Output): Promise<Output> {
  return saveDoc<Output>(APPLY_COLLECTIONS.OUTPUTS, output.id, output);
}

export async function listSendLogs(applicationId: string, userId: string): Promise<SendLog[]> {
  if (!userId) return [];
  return (await queryDocsByUser<SendLog>(APPLY_COLLECTIONS.SENDS, userId)).filter((s) => s.applicationId === applicationId);
}

export async function saveSendLog(sendLog: SendLog): Promise<SendLog> {
  return saveDoc<SendLog>(APPLY_COLLECTIONS.SENDS, sendLog.id, sendLog);
}

export async function getLead(email: string): Promise<Lead | null> {
  const list = await queryDocs<Lead>(APPLY_COLLECTIONS.LEADS, (l) => l.email.toLowerCase() === email.toLowerCase());
  return list[0] || null;
}

export async function saveLead(lead: Lead): Promise<Lead> {
  return saveDoc<Lead>(APPLY_COLLECTIONS.LEADS, lead.id, lead);
}

/* --------------------------------------------------------------------------
   ONE PERSON'S DATA ("Download my data" and "Delete all my data")
-------------------------------------------------------------------------- */

/** Collections whose rows carry the owner's id. */
const OWNED_COLLECTIONS = [
  APPLY_COLLECTIONS.EVIDENCE,
  APPLY_COLLECTIONS.CVS,
  APPLY_COLLECTIONS.OUTPUTS,
  APPLY_COLLECTIONS.JOBS,
  APPLY_COLLECTIONS.MATCHES,
  APPLY_COLLECTIONS.APPLICATIONS,
  APPLY_COLLECTIONS.SENDS,
] as const;
/** Collections with one document per person, kept under their id. */
const KEYED_COLLECTIONS = [APPLY_COLLECTIONS.PROFILES, APPLY_COLLECTIONS.VOICES, APPLY_COLLECTIONS.SETTINGS] as const;

/** Removes every document that matches, from the database and from the local store. Returns how many went. */
async function deleteWhere<T>(collectionName: string, mongoFilter: Record<string, unknown>, matches: (doc: T) => boolean): Promise<number> {
  let gone = 0;
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) gone += (await db.collection(collectionName).deleteMany(mongoFilter)).deletedCount ?? 0;
    } catch (err) {
      console.warn(`[apply_db] Mongo delete-many fallback for ${collectionName}:`, err);
    }
  }
  const store = readFallback<T>(collectionName);
  const keep: Record<string, T> = {};
  let local = 0;
  for (const [key, doc] of Object.entries(store)) {
    if (matches(doc)) local++;
    else keep[key] = doc;
  }
  if (local) writeFallback(collectionName, keep);
  return gone + local;
}

/** The free-check records tied to a person: by their account, or by the address they unlocked a report with. */
async function leadsAndAudits(userId: string, email?: string): Promise<{ leads: Lead[]; audits: Audit[] }> {
  const address = email?.trim().toLowerCase();
  const leads = await queryDocs<Lead>(APPLY_COLLECTIONS.LEADS, (l) => l.userId === userId || (!!address && l.email?.toLowerCase() === address));
  const leadIds = new Set(leads.map((l) => l.id));
  const audits = await queryDocs<Audit>(APPLY_COLLECTIONS.AUDITS, (a) => a.userId === userId || (!!a.unlockedBy && leadIds.has(a.unlockedBy)));
  return { leads, audits };
}

/**
 * Everything the Apply area and the free CV check hold for one person, by
 * collection. Nothing is created by asking (a person with no settings saved
 * gets no settings row).
 */
export async function exportApplyData(userId: string, email?: string): Promise<Record<string, unknown[]>> {
  if (!userId) return {};
  const out: Record<string, unknown[]> = {};
  // A job saved before jobs carried an owner is found through the person's own applications.
  out.jobs = await listJobs(userId);
  for (const name of OWNED_COLLECTIONS) {
    if (name === APPLY_COLLECTIONS.JOBS) continue;
    // Evidence an earlier build invented and put into every account is not the person's: it is left out (and deleted with the rest).
    out[name.replace(/^apply_/, "")] = name === APPLY_COLLECTIONS.EVIDENCE ? await listEvidence(userId) : await queryDocsByUser<{ userId?: string }>(name, userId);
  }
  for (const name of KEYED_COLLECTIONS) {
    const doc = await getDoc<unknown>(name, userId);
    out[name.replace(/^apply_/, "")] = doc ? [doc] : [];
  }
  const { leads, audits } = await leadsAndAudits(userId, email);
  out.leads = leads.map(({ magicTokenHash: _hash, ...rest }) => rest);
  out.audits = audits;
  // The same download twice gives the same file: rows are listed by id, not in whatever order they were stored.
  for (const rows of Object.values(out)) rows.sort((a, b) => String((a as { id?: string }).id ?? "").localeCompare(String((b as { id?: string }).id ?? "")));
  return out;
}

/** Deletes all of that, from the database and from the local store. Returns how many documents went. */
export async function deleteApplyData(userId: string, email?: string): Promise<number> {
  if (!userId) return 0;
  // Before anything goes: jobs with no owner yet are marked as this person's, so they are deleted with the rest.
  await listJobs(userId);
  const { leads, audits } = await leadsAndAudits(userId, email);
  let gone = 0;
  for (const name of OWNED_COLLECTIONS) gone += await deleteWhere<{ userId?: string }>(name, { userId }, (d) => d?.userId === userId);
  for (const name of KEYED_COLLECTIONS) gone += (await getDoc(name, userId)) ? ((await deleteDoc(name, userId)) ? 1 : 0) : 0;
  for (const a of audits) gone += (await deleteDoc(APPLY_COLLECTIONS.AUDITS, a.id)) ? 1 : 0;
  for (const l of leads) gone += (await deleteDoc(APPLY_COLLECTIONS.LEADS, l.id)) ? 1 : 0;
  return gone;
}
