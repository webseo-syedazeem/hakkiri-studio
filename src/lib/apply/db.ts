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

export async function saveDoc<T extends { id?: string; userId?: string }>(
  collectionName: string,
  docKey: string,
  doc: T,
): Promise<T> {
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
  return store[docKey] || null;
}

export async function deleteDoc(
  collectionName: string,
  docKey: string,
): Promise<boolean> {
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
  return queryDocs<Application>(APPLY_COLLECTIONS.APPLICATIONS, (a) => a.userId === userId);
}

export async function getApplication(id: string): Promise<Application | null> {
  return getDoc<Application>(APPLY_COLLECTIONS.APPLICATIONS, id);
}

export async function saveApplication(app: Application): Promise<Application> {
  return saveDoc<Application>(APPLY_COLLECTIONS.APPLICATIONS, app.id, app);
}

export async function listJobs(): Promise<Job[]> {
  return queryDocs<Job>(APPLY_COLLECTIONS.JOBS, () => true);
}

export async function getJob(id: string): Promise<Job | null> {
  return getDoc<Job>(APPLY_COLLECTIONS.JOBS, id);
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

export async function listOutputs(applicationId: string): Promise<Output[]> {
  return queryDocs<Output>(APPLY_COLLECTIONS.OUTPUTS, (o) => o.applicationId === applicationId);
}

export async function saveOutput(output: Output): Promise<Output> {
  return saveDoc<Output>(APPLY_COLLECTIONS.OUTPUTS, output.id, output);
}

export async function listSendLogs(applicationId: string): Promise<SendLog[]> {
  return queryDocs<SendLog>(APPLY_COLLECTIONS.SENDS, (s) => s.applicationId === applicationId);
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
