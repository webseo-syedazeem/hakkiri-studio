import "server-only";
import { deleteDoc, getDoc, queryDocsByUser, saveDoc } from "@/lib/apply/db";
import { type CvImport, CvImportSchema } from "./import/record";
import { scoreCv } from "./score/score";
import { jobFit } from "./tailor/fit";
import { type Achievement, AchievementSchema, type CvDoc, type CvSummary, CvDocSchema, type ExportRecord, ExportRecordSchema, isEntrySection, summarise } from "./schema";

/**
 * Where CVs and uploads are kept. Every read takes the person's id and returns
 * only what is theirs: someone else's CV and a CV that does not exist look the
 * same from here, so an address cannot be used to find out which is which.
 */

export const CV_COLLECTIONS = { VERSIONS: "cv_versions", IMPORTS: "cv_imports", ACHIEVEMENTS: "cv_achievements", EXPORTS: "cv_exports" } as const;

/** A stored record that no longer fits the rules is treated as missing, not served half-read. */
function valid<T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }, raw: unknown, what: string): T | null {
  if (!raw) return null;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.warn(`[cv/store] A stored ${what} did not match its schema and was skipped.`);
    return null;
  }
  return parsed.data as T;
}

export async function getOwnCv(id: string, userId: string): Promise<CvDoc | null> {
  if (!id || !userId) return null;
  const cv = valid<CvDoc>(CvDocSchema, await getDoc(CV_COLLECTIONS.VERSIONS, id), "CV");
  return cv && cv.userId === userId ? cv : null;
}

export async function saveCv(cv: CvDoc): Promise<CvDoc> {
  const clean = CvDocSchema.parse(cv);
  await saveDoc(CV_COLLECTIONS.VERSIONS, clean.id, clean);
  return clean;
}

export async function listOwnCvs(userId: string): Promise<CvDoc[]> {
  const raw = await queryDocsByUser<CvDoc>(CV_COLLECTIONS.VERSIONS, userId);
  return raw.map((r) => valid<CvDoc>(CvDocSchema, r, "CV")).filter((c): c is CvDoc => !!c && c.userId === userId);
}

export const deleteCv = (id: string) => deleteDoc(CV_COLLECTIONS.VERSIONS, id);

export async function getOwnImport(id: string, userId: string): Promise<CvImport | null> {
  if (!id || !userId) return null;
  const imp = valid<CvImport>(CvImportSchema, await getDoc(CV_COLLECTIONS.IMPORTS, id), "upload");
  return imp && imp.userId === userId ? imp : null;
}

export async function saveImport(imp: CvImport): Promise<CvImport> {
  const clean = CvImportSchema.parse(imp);
  await saveDoc(CV_COLLECTIONS.IMPORTS, clean.id, clean);
  return clean;
}

export async function listOwnImports(userId: string): Promise<CvImport[]> {
  const raw = await queryDocsByUser<CvImport>(CV_COLLECTIONS.IMPORTS, userId);
  return raw.map((r) => valid<CvImport>(CvImportSchema, r, "upload")).filter((i): i is CvImport => !!i && i.userId === userId);
}

export const deleteImport = (id: string) => deleteDoc(CV_COLLECTIONS.IMPORTS, id);

/** The dashboard's rows: newest first, each saying whether an upload is still waiting to be checked. */
export async function listCvSummaries(userId: string): Promise<CvSummary[]> {
  const [cvs, imports] = await Promise.all([listOwnCvs(userId), listOwnImports(userId)]);
  const pending = new Map<string, string>();
  for (const i of imports) if (i.status !== "confirmed") pending.set(i.versionId, i.id);
  const now = new Date();
  return cvs
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((cv) => {
      const row = summarise(cv, pending.get(cv.id));
      if (row.empty) return row;
      // The same sums the score and tailoring screens do, so the list never disagrees with them.
      return { ...row, score: scoreCv({ cv, now }).shown, fit: jobFit(cv).score ?? undefined };
    });
}

/* ------------------------------------------------------------ achievements */

export async function getOwnAchievement(id: string, userId: string): Promise<Achievement | null> {
  if (!id || !userId) return null;
  const a = valid<Achievement>(AchievementSchema, await getDoc(CV_COLLECTIONS.ACHIEVEMENTS, id), "achievement");
  return a && a.userId === userId ? a : null;
}

export async function saveAchievement(a: Achievement): Promise<Achievement> {
  const clean = AchievementSchema.parse(a);
  await saveDoc(CV_COLLECTIONS.ACHIEVEMENTS, clean.id, clean);
  return clean;
}

export async function listOwnAchievements(userId: string): Promise<Achievement[]> {
  const raw = await queryDocsByUser<Achievement>(CV_COLLECTIONS.ACHIEVEMENTS, userId);
  return raw
    .map((r) => valid<Achievement>(AchievementSchema, r, "achievement"))
    .filter((a): a is Achievement => !!a && a.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export const deleteAchievement = (id: string) => deleteDoc(CV_COLLECTIONS.ACHIEVEMENTS, id);

/** Which of the person's CVs use each achievement: achievement id → the CVs holding a line taken from it. */
export async function achievementUse(userId: string): Promise<Record<string, { id: string; name: string }[]>> {
  const out: Record<string, { id: string; name: string }[]> = {};
  for (const cv of await listOwnCvs(userId)) {
    const ids = new Set<string>();
    for (const s of cv.sections) if (isEntrySection(s)) for (const e of s.entries) for (const b of e.bullets) if (b.bankId) ids.add(b.bankId);
    for (const id of ids) (out[id] ??= []).push({ id: cv.id, name: cv.name });
  }
  return out;
}

/* ---------------------------------------------------------- export records */

export async function getOwnExport(id: string, userId: string): Promise<ExportRecord | null> {
  if (!id || !userId) return null;
  const r = valid<ExportRecord>(ExportRecordSchema, await getDoc(CV_COLLECTIONS.EXPORTS, id), "export record");
  return r && r.userId === userId ? r : null;
}

export async function listOwnExports(userId: string, versionId?: string): Promise<ExportRecord[]> {
  const raw = await queryDocsByUser<ExportRecord>(CV_COLLECTIONS.EXPORTS, userId);
  return raw
    .map((r) => valid<ExportRecord>(ExportRecordSchema, r, "export record"))
    .filter((r): r is ExportRecord => !!r && r.userId === userId && (!versionId || r.versionId === versionId))
    .sort((a, b) => b.at.localeCompare(a.at));
}

/** How many downloads are remembered for one CV. Older ones are dropped. */
export const EXPORTS_KEPT = 30;

export async function saveExport(record: ExportRecord): Promise<ExportRecord> {
  const clean = ExportRecordSchema.parse(record);
  await saveDoc(CV_COLLECTIONS.EXPORTS, clean.id, clean);
  for (const old of (await listOwnExports(clean.userId, clean.versionId)).slice(EXPORTS_KEPT)) await deleteDoc(CV_COLLECTIONS.EXPORTS, old.id);
  return clean;
}

export const deleteExport = (id: string) => deleteDoc(CV_COLLECTIONS.EXPORTS, id);

/** Everything held for one person in this section: for "Download my data". */
export async function exportCvData(userId: string): Promise<{ cvs: CvDoc[]; uploads: CvImport[]; achievements: Achievement[]; exports: ExportRecord[] }> {
  const [cvs, uploads, achievements, exports] = await Promise.all([listOwnCvs(userId), listOwnImports(userId), listOwnAchievements(userId), listOwnExports(userId)]);
  return { cvs, uploads, achievements, exports };
}

/** Deletes everything held for one person in this section: for "Delete all my data". Returns how many records went. */
export async function deleteCvData(userId: string): Promise<number> {
  const { cvs, uploads, achievements, exports } = await exportCvData(userId);
  for (const c of cvs) await deleteCv(c.id);
  for (const u of uploads) await deleteImport(u.id);
  for (const a of achievements) await deleteAchievement(a.id);
  for (const e of exports) await deleteExport(e.id);
  return cvs.length + uploads.length + achievements.length + exports.length;
}
