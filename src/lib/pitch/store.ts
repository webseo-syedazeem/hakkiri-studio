import { loadFile, loadJson, removeDir, saveFile, saveJson, savingToDisk } from "@/lib/storage/disk";
import { demoPresentation, demoQaSession, demoRuns } from "./demo";
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

export function getPresentation(id: string): Presentation | undefined {
  return db().presentations.get(id) ?? (id === demoPresentation.id && demoOn() ? demoPresentation : undefined);
}

/** Every presentation, soonest first; ones in the past go last. */
export function listPresentations(): Presentation[] {
  const all = new Map<string, Presentation>([...(demoOn() ? ([[demoPresentation.id, demoPresentation]] as const) : []), ...db().presentations]);
  const now = Date.now();
  return [...all.values()].sort((a, b) => {
    const pa = Date.parse(a.date) < now ? 1 : 0;
    const pb = Date.parse(b.date) < now ? 1 : 0;
    return pa - pb || a.date.localeCompare(b.date);
  });
}

/** The presentation Home is about: your soonest upcoming one, or the demo until you add your own. */
export function featuredPresentation(): Presentation | undefined {
  const all = listPresentations();
  const mine = all.filter((p) => p.id !== demoPresentation.id || db().presentations.has(p.id));
  const upcoming = (p: Presentation) => Date.parse(p.date) >= Date.now() - 12 * 3600_000;
  return mine.find(upcoming) ?? all.find(upcoming) ?? all[0];
}

export function savePresentation(p: Presentation) {
  db().presentations.set(p.id, p);
  saveJson("presentations.json", [...db().presentations.values()]);
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
export function listRuns(presentationId: string): Run[] {
  const demo = presentationId === demoPresentation.id && demoOn() ? demoRuns : [];
  return [...demo, ...[...db().runs.values()].filter((r) => r.presentationId === presentationId)].sort((a, b) => a.number - b.number);
}

export function getRun(id: string): Run | undefined {
  return db().runs.get(id) ?? (demoOn() ? demoRuns.find((r) => r.id === id) : undefined);
}

export function saveRun(run: Run) {
  db().runs.set(run.id, run);
  saveJson("runs.json", [...db().runs.values()]);
}

export function nextRunNumber(presentationId: string): number {
  return listRuns(presentationId).reduce((n, r) => Math.max(n, r.number), 0) + 1;
}

/** The latest full run that reached the last slide. */
export function latestFullRun(presentationId: string): Run | undefined {
  const p = getPresentation(presentationId);
  return p ? completeRuns(listRuns(presentationId), p.timeLimitSec).pop() : undefined;
}

// ---------------------------------------------------------------------- Q&A

export function listQa(presentationId: string): QaSession[] {
  const demo = presentationId === demoQaSession.presentationId && demoOn() ? [demoQaSession] : [];
  return [...demo, ...[...db().qa.values()].filter((s) => s.presentationId === presentationId)].sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
}

export function getQa(id: string): QaSession | undefined {
  return db().qa.get(id) ?? (id === demoQaSession.id && demoOn() ? demoQaSession : undefined);
}

export function saveQa(s: QaSession) {
  db().qa.set(s.id, s);
  saveJson("qa.json", [...db().qa.values()]);
}

// ------------------------------------------------------------- your data

/** Your presentations, runs and Q&A sessions (not the demo's). */
export function allPitchData(): { presentations: Presentation[]; runs: Run[]; qa: QaSession[] } {
  return { presentations: [...db().presentations.values()], runs: [...db().runs.values()], qa: [...db().qa.values()] };
}

/** Deletes one presentation with its slide pictures, runs and Q&A rounds. Returns the ids of its answers, so their recordings can go too. */
export function deletePresentation(id: string): { runIds: string[]; answerIds: string[] } | null {
  const d = db();
  if (!d.presentations.has(id)) return null;
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
export function clearPitch() {
  db().presentations.clear();
  db().runs.clear();
  db().qa.clear();
  memoryImages().clear();
  saveJson("presentations.json", []);
  saveJson("runs.json", []);
  saveJson("qa.json", []);
  removeDir("pitch");
}
