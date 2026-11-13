import { loadFile, loadJson, loadJsonAsync, removeDir, saveFile, saveJson, saveJsonAsync, savingToDisk } from "@/lib/storage/disk";
import { isMongoConfigured } from "@/lib/storage/mongodb";
import { demoPresentation, demoQaSession, demoRuns, demoRun4 } from "./demo";
import type { Presentation, QaSession, Run } from "./types";
import { completeRuns } from "./plan";
import { isLaunch } from "@/lib/launch";

/** The demo presentation, while building. Hidden once launched. */
const demoOn = () => !isLaunch();

/**
 * Presentations, rehearsal runs and Q&A sessions (build plan: "Presentations",
 * "Runs" and "Q&A sessions" tables). Kept in memory and saved to the local
 * data folder until the database lands. The demo presentation and its runs
 * are always there; editing the demo saves your own copy over it.
 */

const g = globalThis as unknown as {
  __hakkiriPitch?: { presentations: Map<string, Presentation>; runs: Map<string, Run>; qa: Map<string, QaSession> };
};

function db() {
  return (g.__hakkiriPitch ??= {
    presentations: new Map(loadJson<Presentation[]>("presentations.json", []).map((p) => [p.id, p])),
    runs: new Map(loadJson<Run[]>("runs.json", []).map((r) => [r.id, r])),
    qa: new Map(loadJson<QaSession[]>("qa.json", []).map((s) => [s.id, s])),
  });
}

// ------------------------------------------------------------ presentations

export const isDemoPresentation = (id: string) => id === demoPresentation.id && !db().presentations.has(id);

export function getPresentation(id: string, userId?: string): Presentation | undefined {
  if (id === demoPresentation.id && demoOn()) return demoPresentation;
  const p = db().presentations.get(id);
  if (!p) return undefined;
  if (userId && p.userId !== userId) return undefined;
  return p;
}

export async function getPresentationAsync(id: string, userId?: string): Promise<Presentation | undefined> {
  const p = getPresentation(id, userId);
  if (p && p.id !== demoPresentation.id) return p;

  if (isMongoConfigured()) {
    try {
      const fromDb = await loadJsonAsync<Presentation[]>("presentations.json", []);
      if (Array.isArray(fromDb)) {
        for (const item of fromDb) {
          db().presentations.set(item.id, item);
        }
        const found = getPresentation(id, userId);
        if (found) return found;
      }
    } catch (err) {
      console.warn("[pitch/store] MongoDB load presentations failed:", err);
    }
  }

  return getPresentation(id, userId);
}

/** Every presentation, soonest first; ones in the past go last. */
export function listPresentations(userId?: string): Presentation[] {
  const userPres = userId
    ? [...db().presentations.values()].filter((p) => p.userId === userId)
    : [...db().presentations.values()];
  const all = new Map<string, Presentation>([
    ...(demoOn() ? ([[demoPresentation.id, demoPresentation]] as const) : []),
    ...userPres.map((p) => [p.id, p] as const),
  ]);
  const now = Date.now();
  return [...all.values()].sort((a, b) => {
    const da = a.date ? Date.parse(a.date) : 0;
    const dbTime = b.date ? Date.parse(b.date) : 0;
    const pa = da && da < now ? 1 : 0;
    const pb = dbTime && dbTime < now ? 1 : 0;
    return pa - pb || (a.date ?? "").localeCompare(b.date ?? "");
  });
}

/** The presentation Home is about: your soonest upcoming one, or the demo until you add your own. */
export function featuredPresentation(userId?: string): Presentation | undefined {
  const all = listPresentations(userId);
  const mine = all.filter((p) => p.id !== demoPresentation.id || db().presentations.has(p.id));
  const upcoming = (p: Presentation) => (p.date ? Date.parse(p.date) >= Date.now() - 12 * 3600_000 : false);
  return mine.find(upcoming) ?? all.find(upcoming) ?? all[0];
}

export function savePresentation(p: Presentation, userId?: string) {
  const item = { ...p, userId: userId || p.userId };
  db().presentations.set(item.id, item);
  saveJson("presentations.json", [...db().presentations.values()]);
}

export async function savePresentationAsync(p: Presentation, userId?: string): Promise<void> {
  const item = { ...p, userId: userId || p.userId };
  db().presentations.set(item.id, item);
  await saveJsonAsync("presentations.json", [...db().presentations.values()]);
}

/** Pictures of slides (PDF pages, or pictures from PowerPoint slides). */
export function saveSlideImage(presentationId: string, file: string, data: ArrayBuffer) {
  saveFile(`pitch/${presentationId}/${file}`, data);
  if (!savingToDisk) memoryImages().set(`${presentationId}/${file}`, data);
}

export function loadSlideImage(presentationId: string, file: string): ArrayBuffer | null {
  return memoryImages().get(`${presentationId}/${file}`) ?? loadFile(`pitch/${presentationId}/${file}`);
}

/** Keeps images when saving to disk is off (tests, HAKKIRI_SAVE=off). */
function memoryImages() {
  const gi = globalThis as unknown as { __hakkiriSlideImages?: Map<string, ArrayBuffer> };
  return (gi.__hakkiriSlideImages ??= new Map());
}

// --------------------------------------------------------------------- runs

/** Runs of a presentation, oldest first. */
export function listRuns(presentationId: string, userId?: string): Run[] {
  const demo = presentationId === demoPresentation.id && demoOn() ? demoRuns : [];
  const stored = [...db().runs.values()].filter(
    (r) => r.presentationId === presentationId && (!userId || r.userId === userId || db().presentations.get(presentationId)?.userId === userId)
  );
  return [...demo, ...stored].sort((a, b) => a.number - b.number);
}

export function getRun(id: string, userId?: string): Run | undefined {
  const isDemo = demoOn() && (demoRuns.some((r) => r.id === id) || id === demoRun4.id);
  if (isDemo) return demoRuns.find((r) => r.id === id) ?? (id === demoRun4.id ? demoRun4 : undefined);
  const r = db().runs.get(id);
  if (!r) return undefined;
  if (userId && r.userId && r.userId !== userId) return undefined;
  return r;
}

export async function getRunAsync(id: string, userId?: string): Promise<Run | undefined> {
  const r = getRun(id, userId);
  if (r) return r;

  if (isMongoConfigured()) {
    try {
      const fromDb = await loadJsonAsync<Run[]>("runs.json", []);
      if (Array.isArray(fromDb)) {
        for (const run of fromDb) {
          db().runs.set(run.id, run);
        }
        const found = getRun(id, userId);
        if (found) return found;
      }
    } catch (err) {
      console.warn("[pitch/store] MongoDB load runs failed:", err);
    }
  }

  return getRun(id, userId);
}

export function saveRun(run: Run, userId?: string) {
  const item = { ...run, userId: userId || run.userId };
  db().runs.set(item.id, item);
  saveJson("runs.json", [...db().runs.values()]);
}

export async function saveRunAsync(run: Run, userId?: string): Promise<void> {
  const item = { ...run, userId: userId || run.userId };
  db().runs.set(item.id, item);
  await saveJsonAsync("runs.json", [...db().runs.values()]);
}

export function nextRunNumber(presentationId: string, userId?: string): number {
  return listRuns(presentationId, userId).reduce((n, r) => Math.max(n, r.number), 0) + 1;
}

/** The latest full run that reached the last slide. */
export function latestFullRun(presentationId: string, userId?: string): Run | undefined {
  const p = getPresentation(presentationId, userId);
  return p ? completeRuns(listRuns(presentationId, userId), p.timeLimitSec).pop() : undefined;
}

// ---------------------------------------------------------------------- Q&A

export function listQa(presentationId: string, userId?: string): QaSession[] {
  const demo = presentationId === demoQaSession.presentationId && demoOn() ? [demoQaSession] : [];
  const stored = [...db().qa.values()].filter(
    (s) => s.presentationId === presentationId && (!userId || s.userId === userId || db().presentations.get(presentationId)?.userId === userId)
  );
  return [...demo, ...stored].sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
}

export function getQa(id: string, userId?: string): QaSession | undefined {
  const isDemo = demoOn() && id === demoQaSession.id;
  if (isDemo) return demoQaSession;
  const s = db().qa.get(id);
  if (!s) return undefined;
  if (userId && s.userId && s.userId !== userId) return undefined;
  return s;
}

export async function getQaAsync(id: string, userId?: string): Promise<QaSession | undefined> {
  const s = getQa(id, userId);
  if (s) return s;

  if (isMongoConfigured()) {
    try {
      const fromDb = await loadJsonAsync<QaSession[]>("qa.json", []);
      if (Array.isArray(fromDb)) {
        for (const item of fromDb) {
          db().qa.set(item.id, item);
        }
        const found = getQa(id, userId);
        if (found) return found;
      }
    } catch (err) {
      console.warn("[pitch/store] MongoDB load QA failed:", err);
    }
  }

  return getQa(id, userId);
}

export function saveQa(s: QaSession, userId?: string) {
  const item = { ...s, userId: userId || s.userId };
  db().qa.set(item.id, item);
  saveJson("qa.json", [...db().qa.values()]);
}

export async function saveQaAsync(s: QaSession, userId?: string): Promise<void> {
  const item = { ...s, userId: userId || s.userId };
  db().qa.set(item.id, item);
  await saveJsonAsync("qa.json", [...db().qa.values()]);
}

// ------------------------------------------------------------- your data

/** Your presentations, runs and Q&A sessions (not the demo's). */
export function allPitchData(userId?: string): { presentations: Presentation[]; runs: Run[]; qa: QaSession[] } {
  if (!userId) {
    return {
      presentations: [...db().presentations.values()],
      runs: [...db().runs.values()],
      qa: [...db().qa.values()],
    };
  }
  const presentations = [...db().presentations.values()].filter((p) => p.userId === userId);
  const userPresIds = new Set(presentations.map((p) => p.id));
  const runs = [...db().runs.values()].filter((r) => r.userId === userId || userPresIds.has(r.presentationId));
  const qa = [...db().qa.values()].filter((s) => s.userId === userId || userPresIds.has(s.presentationId));
  return { presentations, runs, qa };
}

/** Deletes one presentation with its slide pictures, runs and Q&A rounds. Returns the ids of its answers, so their recordings can go too. */
export function deletePresentation(id: string, userId?: string): { runIds: string[]; answerIds: string[] } | null {
  const d = db();
  const existing = d.presentations.get(id);
  if (!existing) return null;
  if (userId && existing.userId && existing.userId !== userId) return null;
  const runIds = [...d.runs.values()].filter((r) => r.presentationId === id).map((r) => r.id);
  const answerIds = [...d.qa.values()].filter((s) => s.presentationId === id).flatMap((s) => s.answers.map((a) => a.id));
  for (const r of runIds) d.runs.delete(r);
  for (const s of [...d.qa.values()]) if (s.presentationId === id) d.qa.delete(s.id);
  d.presentations.delete(id);
  for (const k of [...memoryImages().keys()]) if (k.startsWith(`${id}/`)) memoryImages().delete(k);
  saveJson("presentations.json", [...d.presentations.values()]);
  saveJson("runs.json", [...d.runs.values()]);
  saveJson("qa.json", [...d.qa.values()]);
  removeDir(`pitch/${id}`);
  return { runIds, answerIds };
}

/** "Delete all my data": presentations, slide pictures, runs and Q&A. */
export function clearPitch(userId?: string) {
  if (userId) {
    const d = db();
    const toDeletePres = [...d.presentations.values()].filter((p) => p.userId === userId);
    for (const p of toDeletePres) {
      deletePresentation(p.id, userId);
    }
  } else {
    db().presentations.clear();
    db().runs.clear();
    db().qa.clear();
    memoryImages().clear();
    saveJson("presentations.json", []);
    saveJson("runs.json", []);
    saveJson("qa.json", []);
    removeDir("pitch");
  }
}
