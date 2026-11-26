import "server-only";
import { deleteDoc, getDoc, queryDocsByUser, saveDoc } from "@/lib/apply/db";
import { type CvImport, CvImportSchema } from "./import/record";
import type { Audit } from "@/lib/apply/schema";
import { deleteOwnChecks, listOwnChecks } from "./score/publicCheck";
import { scoreCv } from "./score/score";
import { jobFit } from "./tailor/fit";
import { fontsNeeded, layoutCv } from "./render/layout";
import { loadFonts } from "./render/server";
import { paperStyle } from "./render/templates";
import { type Achievement, AchievementSchema, type CvDoc, type CvSummary, CvDocSchema, type ExportRecord, ExportRecordSchema, type FileCheckRecord, FileCheckRecordSchema, type SavedStyle, SavedStyleSchema, type StoredFileCheck, isEntrySection, summarise } from "./schema";

/**
 * Where CVs and uploads are kept. Every read takes the person's id and returns
 * only what is theirs: someone else's CV and a CV that does not exist look the
 * same from here, so an address cannot be used to find out which is which.
 */

export const CV_COLLECTIONS = { VERSIONS: "cv_versions", IMPORTS: "cv_imports", ACHIEVEMENTS: "cv_achievements", EXPORTS: "cv_exports", CHECKS: "cv_checks", STYLES: "cv_styles" } as const;

/* ------------------------------------------------------------ saved styles */

/** The most looks one person can keep. */
export const MAX_STYLES = 20;
export async function listOwnStyles(userId: string): Promise<SavedStyle[]> {
  const raw = await queryDocsByUser<SavedStyle>(CV_COLLECTIONS.STYLES, userId);
  return raw.map((r) => valid<SavedStyle>(SavedStyleSchema, r, "style")).filter((s): s is SavedStyle => !!s && s.userId === userId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
export async function getOwnStyle(id: string, userId: string): Promise<SavedStyle | null> {
  const s = valid<SavedStyle>(SavedStyleSchema, await getDoc(CV_COLLECTIONS.STYLES, id), "style");
  return s && s.userId === userId ? s : null;
}
export async function saveStyle(s: SavedStyle): Promise<SavedStyle> {
  const clean = SavedStyleSchema.parse(s);
  await saveDoc(CV_COLLECTIONS.STYLES, clean.id, clean);
  return clean;
}
export const deleteStyle = (id: string) => deleteDoc(CV_COLLECTIONS.STYLES, id);

/** The most CVs and versions one person can hold. Creating, copying, uploading and tailoring all count towards it. */
export const MAX_CVS = 60;
export const TOO_MANY_CVS = `You have reached the limit of ${MAX_CVS} CVs and versions. Delete some you no longer need, then try again.`;
/** True when the person cannot be given another CV. */
export async function atCvLimit(userId: string): Promise<boolean> {
  return (await listOwnCvs(userId)).length >= MAX_CVS;
}

/** Recursively omits null/undefined properties (which MongoDB BSON produces from undefined keys) so Zod .optional() schemas validate cleanly. */
function stripNulls(v: unknown): unknown {
  if (v === null) return undefined;
  if (Array.isArray(v)) return v.map(stripNulls);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (val !== null && val !== undefined) out[k] = stripNulls(val);
    }
    return out;
  }
  return v;
}

/** A stored record that no longer fits the rules is treated as missing, not served half-read. */
function valid<T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }, raw: unknown, what: string): T | null {
  if (!raw) return null;
  const parsed = schema.safeParse(stripNulls(raw));
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

/**
 * Deletes a CV and everything kept for it alone: the uploads made for it, the
 * record of each file downloaded from it (each holds a full copy of the CV as
 * it was) and its file checks. Nothing of a deleted CV is left behind.
 */
export async function deleteCvAndRecords(cv: Pick<CvDoc, "id" | "userId">): Promise<void> {
  for (const imp of await listOwnImports(cv.userId)) if (imp.versionId === cv.id) await deleteImport(imp.id);
  for (const record of await listOwnExports(cv.userId, cv.id)) await deleteExport(record.id);
  await deleteFileChecks(cv.id);
  await deleteCv(cv.id);
}

/* -------------------------------------------------------------- file checks */

/** The file checks kept for a CV, if they are for the CV exactly as it is now. */
export async function currentFileChecks(cv: Pick<CvDoc, "id" | "userId" | "rev">): Promise<FileCheckRecord | null> {
  const r = valid<FileCheckRecord>(FileCheckRecordSchema, await getDoc(CV_COLLECTIONS.CHECKS, cv.id), "file check");
  return r && r.userId === cv.userId && r.rev === cv.rev ? r : null;
}

const clip = (list: string[] | undefined, chars: number) => list?.slice(0, 60).map((x) => [...x].slice(0, chars).join(""));

/**
 * Remembers how a file read back, for the revision it was made from. A result
 * for an older revision than the one already recorded is dropped. This never
 * throws: failing to remember a check must not fail the check or the download.
 */
export async function noteFileChecks(cv: Pick<CvDoc, "id" | "userId" | "rev">, results: { pdf?: StoredFileCheck; docx?: StoredFileCheck }): Promise<void> {
  try {
    const old = valid<FileCheckRecord>(FileCheckRecordSchema, await getDoc(CV_COLLECTIONS.CHECKS, cv.id), "file check");
    if (old && old.userId === cv.userId && old.rev > cv.rev) return;
    const kept = old && old.userId === cv.userId && old.rev === cv.rev ? { pdf: old.pdf, docx: old.docx } : {};
    const tidy = (c: StoredFileCheck | undefined) => (c ? { ...c, missing: clip(c.missing, 300), unexpected: clip(c.unexpected, 300), unsupported: clip(c.unsupported, 40) } : undefined);
    const record = FileCheckRecordSchema.parse({ id: cv.id, userId: cv.userId, rev: cv.rev, ...kept, ...(results.pdf ? { pdf: tidy(results.pdf) } : {}), ...(results.docx ? { docx: tidy(results.docx) } : {}), at: new Date().toISOString() });
    await saveDoc(CV_COLLECTIONS.CHECKS, record.id, record);
  } catch (err) {
    console.error("[cv/store] a file check could not be remembered:", err);
  }
}

export const deleteFileChecks = (id: string) => deleteDoc(CV_COLLECTIONS.CHECKS, id);

export async function listOwnFileChecks(userId: string): Promise<FileCheckRecord[]> {
  const raw = await queryDocsByUser<FileCheckRecord>(CV_COLLECTIONS.CHECKS, userId);
  return raw.map((r) => valid<FileCheckRecord>(FileCheckRecordSchema, r, "file check")).filter((r): r is FileCheckRecord => !!r && r.userId === userId);
}

/* ------------------------------------------------------- the list's numbers */

const kept = globalThis as unknown as { __hakkiriCvNumbers?: Map<string, { score: number; fit?: number }> };
const NUMBERS_KEPT = 2000;

/**
 * The score and job fit of a saved CV, worked out exactly as the builder
 * works them out: the same function, the page laid out by the same code with
 * the same fonts, and the file checks for this revision. So the list, the
 * builder and a reloaded builder all show one number.
 *
 * The answer is kept by CV, revision and month, so opening the list does not
 * score every CV again. (The month, because a date check asks whether a date
 * is in the future.)
 */
export function numbersFor(cv: CvDoc, checks: FileCheckRecord | null, now: Date): { score: number; fit?: number } {
  const cache = (kept.__hakkiriCvNumbers ??= new Map());
  const files = checks && checks.rev === cv.rev ? { pdf: checks.pdf?.status, docx: checks.docx?.status } : {};
  const key = [cv.id, cv.rev, cv.updatedAt, files.pdf ?? "-", files.docx ?? "-", now.toISOString().slice(0, 7)].join("|");
  const had = cache.get(key);
  if (had) return had;
  let pages: number | undefined;
  let missingGlyphs: string[] | undefined;
  try {
    const { layout } = layoutCv(cv, loadFonts(fontsNeeded(paperStyle(cv.design))));
    pages = layout.blocks.length ? layout.pages : undefined;
    missingGlyphs = layout.missing;
  } catch (err) {
    // With no layout the page count is left pending, as it is in the builder before the page is drawn.
    console.error("[cv/store] a CV could not be laid out for its score:", err);
  }
  const out = { score: scoreCv({ cv, pages, missingGlyphs, files, now }).shown, fit: jobFit(cv).score ?? undefined };
  cache.set(key, out);
  if (cache.size > NUMBERS_KEPT) for (const k of cache.keys()) if (cache.size > NUMBERS_KEPT * 0.9) cache.delete(k); else break;
  return out;
}

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
  const [cvs, imports, checks] = await Promise.all([listOwnCvs(userId), listOwnImports(userId), listOwnFileChecks(userId)]);
  const pending = new Map<string, string>();
  const failed = new Set<string>();
  for (const i of imports) {
    if (i.status === "confirmed") continue;
    pending.set(i.versionId, i.id);
    if (i.status === "failed") failed.add(i.versionId);
    else failed.delete(i.versionId);
  }
  const checked = new Map(checks.map((c) => [c.id, c]));
  const now = new Date();
  return cvs
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((cv) => {
      const row = { ...summarise(cv, pending.get(cv.id)), importFailed: failed.has(cv.id) || undefined };
      if (row.empty) return row;
      // The same sums the score and tailoring screens do, from the same inputs, so the list never disagrees with them.
      return { ...row, ...numbersFor(cv, checked.get(cv.id) ?? null, now) };
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
export async function exportCvData(userId: string): Promise<{ cvs: CvDoc[]; uploads: CvImport[]; achievements: Achievement[]; exports: ExportRecord[]; fileChecks: FileCheckRecord[]; freeChecks: Audit[]; styles: SavedStyle[] }> {
  // `freeChecks`: the free CV checks made or opened while signed in. Each holds the text that was pasted.
  const [cvs, uploads, achievements, exports, fileChecks, freeChecks, styles] = await Promise.all([listOwnCvs(userId), listOwnImports(userId), listOwnAchievements(userId), listOwnExports(userId), listOwnFileChecks(userId), listOwnChecks(userId), listOwnStyles(userId)]);
  return { cvs, uploads, achievements, exports, fileChecks, freeChecks, styles };
}

/** Deletes everything held for one person in this section: for "Delete all my data". Returns how many records went. */
export async function deleteCvData(userId: string): Promise<number> {
  const { cvs, uploads, achievements, exports, fileChecks, styles } = await exportCvData(userId);
  for (const s of styles) await deleteStyle(s.id);
  for (const c of cvs) await deleteCv(c.id);
  for (const u of uploads) await deleteImport(u.id);
  for (const a of achievements) await deleteAchievement(a.id);
  for (const e of exports) await deleteExport(e.id);
  for (const f of fileChecks) await deleteFileChecks(f.id);
  const freeChecks = await deleteOwnChecks(userId);
  return cvs.length + uploads.length + achievements.length + exports.length + fileChecks.length + freeChecks + styles.length;
}
