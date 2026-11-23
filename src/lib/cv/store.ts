import "server-only";
import { deleteDoc, getDoc, queryDocsByUser, saveDoc } from "@/lib/apply/db";
import { type CvImport, CvImportSchema } from "./import/record";
import { type Achievement, AchievementSchema, type CvDoc, type CvSummary, CvDocSchema, isEntrySection, summarise } from "./schema";

/**
 * Where CVs and uploads are kept. Every read takes the person's id and returns
 * only what is theirs: someone else's CV and a CV that does not exist look the
 * same from here, so an address cannot be used to find out which is which.
 */

export const CV_COLLECTIONS = { VERSIONS: "cv_versions", IMPORTS: "cv_imports", ACHIEVEMENTS: "cv_achievements" } as const;

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
  return cvs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((cv) => summarise(cv, pending.get(cv.id)));
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

/** Everything held for one person in this section: for "Download my data". */
export async function exportCvData(userId: string): Promise<{ cvs: CvDoc[]; uploads: CvImport[]; achievements: Achievement[] }> {
  const [cvs, uploads, achievements] = await Promise.all([listOwnCvs(userId), listOwnImports(userId), listOwnAchievements(userId)]);
  return { cvs, uploads, achievements };
}

/** Deletes everything held for one person in this section: for "Delete all my data". Returns how many records went. */
export async function deleteCvData(userId: string): Promise<number> {
  const { cvs, uploads, achievements } = await exportCvData(userId);
  for (const c of cvs) await deleteCv(c.id);
  for (const u of uploads) await deleteImport(u.id);
  for (const a of achievements) await deleteAchievement(a.id);
  return cvs.length + uploads.length + achievements.length;
}
