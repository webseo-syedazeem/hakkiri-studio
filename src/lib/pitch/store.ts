import { loadFile, loadFileAsync, loadJson, loadJsonAsync, removeDir, saveFile, saveJson, saveJsonAsync, savingToDisk } from "@/lib/storage/disk";
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

/**
 * Where a presentation is kept. The built-in example is each person's own
 * copy once they change it, so it is kept under their id: one person's edit
 * is never another's, and never replaces the example for everyone.
 */
const keyOf = (id: string, userId: string) => (id === demoPresentation.id ? `${id}::${userId}` : id);
/** Saved presentations, each under its key. A copy of the example with no owner is nobody's, and is dropped. */
const keyed = (list: Presentation[]) => list.filter((p) => p && p.id && !(p.id === demoPresentation.id && !p.userId)).map((p) => [keyOf(p.id, p.userId ?? ""), p] as const);

function db() {
  return (g.__hakkiriPitch ??= {
    presentations: new Map(keyed(loadJson<Presentation[]>("presentations.json", []))),
    runs: new Map(loadJson<Run[]>("runs.json", []).map((r) => [r.id, r])),
    qa: new Map(loadJson<QaSession[]>("qa.json", []).map((s) => [s.id, s])),
  });
}

/**
 * A rehearsal run or a Q&A round is a person's when it carries their id, or
 * when it belongs to a presentation that is theirs (records saved before runs
 * carried an owner). With no account named, nothing is anyone's.
 */
function owns(record: { userId?: string; presentationId: string }, userId: string): boolean {
  if (!userId) return false;
  // A record with no owner goes with its presentation, except on the example, which many people practise on.
  return record.userId === userId || (!record.userId && record.presentationId !== demoPresentation.id && db().presentations.get(record.presentationId)?.userId === userId);
}

// ------------------------------------------------------------ presentations

/** The built-in example. It stays the example for a person who has changed their copy of it. */
export const isDemoPresentation = (id: string) => id === demoPresentation.id;

/** One person's presentation, or nothing: with no account named, or for one that is someone else's or has no owner, nothing is returned. The built-in demo can be read by anyone. */
export function getPresentation(id: string, userId: string): Presentation | undefined {
  if (id === demoPresentation.id) {
    // The person's own copy if they have changed it, else the example as built.
    const mine = userId ? db().presentations.get(keyOf(id, userId)) : undefined;
    return mine && mine.userId === userId ? mine : demoOn() ? demoPresentation : undefined;
  }
  const p = db().presentations.get(id);
  return p && !!userId && p.userId === userId ? p : undefined;
}

export async function getPresentationAsync(id: string, userId: string): Promise<Presentation | undefined> {
  const p = getPresentation(id, userId);
  if (p && p.id !== demoPresentation.id) return p;

  if (isMongoConfigured()) {
    try {
      const fromDb = await loadJsonAsync<Presentation[]>("presentations.json", []);
      if (Array.isArray(fromDb)) {
        for (const [key, item] of keyed(fromDb)) db().presentations.set(key, item);
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
export function listPresentations(userId: string): Presentation[] {
  const userPres = userId ? [...db().presentations.values()].filter((p) => p.userId === userId) : [];
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
export function featuredPresentation(userId: string): Presentation | undefined {
  const all = listPresentations(userId);
  const mine = all.filter((p) => p.id !== demoPresentation.id && p.userId === userId);
  const upcoming = (p: Presentation) => (p.date ? Date.parse(p.date) >= Date.now() - 12 * 3600_000 : false);
  return mine.find(upcoming) ?? all.find(upcoming) ?? all[0];
}

export function savePresentation(p: Presentation, userId: string) {
  if (!userId) return;
  const item = { ...p, userId };
  db().presentations.set(keyOf(item.id, userId), item);
  saveJson("presentations.json", [...db().presentations.values()]);
}

export async function savePresentationAsync(p: Presentation, userId: string): Promise<void> {
  if (!userId) return;
  const item = { ...p, userId };
  db().presentations.set(keyOf(item.id, userId), item);
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

export async function loadSlideImageAsync(presentationId: string, file: string): Promise<ArrayBuffer | null> {
  const mem = memoryImages().get(`${presentationId}/${file}`);
  if (mem) return mem;
  const local = loadFile(`pitch/${presentationId}/${file}`);
  if (local) return local;
  return loadFileAsync(`pitch/${presentationId}/${file}`);
}

/** Keeps images when saving to disk is off (tests, HAKKIRI_SAVE=off). */
function memoryImages() {
  const gi = globalThis as unknown as { __hakkiriSlideImages?: Map<string, ArrayBuffer> };
  return (gi.__hakkiriSlideImages ??= new Map());
}

// --------------------------------------------------------------------- runs

/** Runs of a presentation, oldest first. */
export function listRuns(presentationId: string, userId: string): Run[] {
  const demo = presentationId === demoPresentation.id && demoOn() ? demoRuns : [];
  const stored = userId ? [...db().runs.values()].filter((r) => r.presentationId === presentationId && owns(r, userId)) : [];
  return [...demo, ...stored].sort((a, b) => a.number - b.number);
}

export function getRun(id: string, userId: string): Run | undefined {
  const isDemo = demoOn() && (demoRuns.some((r) => r.id === id) || id === demoRun4.id);
  if (isDemo) return demoRuns.find((r) => r.id === id) ?? (id === demoRun4.id ? demoRun4 : undefined);
  const r = db().runs.get(id);
  return r && owns(r, userId) ? r : undefined;
}

export async function getRunAsync(id: string, userId: string): Promise<Run | undefined> {
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

export function saveRun(run: Run, userId: string) {
  if (!userId) return;
  const item = { ...run, userId };
  db().runs.set(item.id, item);
  saveJson("runs.json", [...db().runs.values()]);
}

export async function saveRunAsync(run: Run, userId: string): Promise<void> {
  if (!userId) return;
  const item = { ...run, userId };
  db().runs.set(item.id, item);
  await saveJsonAsync("runs.json", [...db().runs.values()]);
}

export function nextRunNumber(presentationId: string, userId: string): number {
  return listRuns(presentationId, userId).reduce((n, r) => Math.max(n, r.number), 0) + 1;
}

/** The latest full run that reached the last slide. */
export function latestFullRun(presentationId: string, userId: string): Run | undefined {
  const p = getPresentation(presentationId, userId);
  return p ? completeRuns(listRuns(presentationId, userId), p.timeLimitSec).pop() : undefined;
}

// ---------------------------------------------------------------------- Q&A

export function listQa(presentationId: string, userId: string): QaSession[] {
  const demo = presentationId === demoQaSession.presentationId && demoOn() ? [demoQaSession] : [];
  const stored = userId ? [...db().qa.values()].filter((s) => s.presentationId === presentationId && owns(s, userId)) : [];
  return [...demo, ...stored].sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
}

export function getQa(id: string, userId: string): QaSession | undefined {
  const isDemo = demoOn() && id === demoQaSession.id;
  if (isDemo) return demoQaSession;
  const s = db().qa.get(id);
  return s && owns(s, userId) ? s : undefined;
}

export async function getQaAsync(id: string, userId: string): Promise<QaSession | undefined> {
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

export function saveQa(s: QaSession, userId: string) {
  if (!userId) return;
  const item = { ...s, userId };
  db().qa.set(item.id, item);
  saveJson("qa.json", [...db().qa.values()]);
}

export async function saveQaAsync(s: QaSession, userId: string): Promise<void> {
  if (!userId) return;
  const item = { ...s, userId };
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
  // The person's own rehearsals and Q&A. Other people's practice on the example is theirs, not this person's.
  const runs = [...db().runs.values()].filter((r) => owns(r, userId));
  const qa = [...db().qa.values()].filter((s) => owns(s, userId));
  return { presentations, runs, qa };
}

/**
 * Deletes one of the person's presentations with its slide pictures, and
 * their runs and Q&A rounds on it. Returns the ids of its answers, so their
 * recordings can go too. On the example, only the person's own copy and their
 * own practice go: the example itself and other people's practice on it stay.
 */
export function deletePresentation(id: string, userId: string): { runIds: string[]; answerIds: string[] } | null {
  const d = db();
  if (!userId) return null;
  const example = id === demoPresentation.id;
  const key = keyOf(id, userId);
  const existing = d.presentations.get(key);
  const mine = (r: { userId?: string; presentationId: string }) => r.presentationId === id && owns(r, userId);
  const runs = [...d.runs.values()].filter(mine);
  const rounds = [...d.qa.values()].filter(mine);
  if (example ? !existing && !runs.length && !rounds.length : !existing || existing.userId !== userId) return null;
  const answerIds = rounds.flatMap((s) => s.answers.map((a) => a.id));
  for (const r of runs) d.runs.delete(r.id);
  for (const s of rounds) d.qa.delete(s.id);
  if (existing) d.presentations.delete(key);
  if (!example) {
    for (const k of [...memoryImages().keys()]) if (k.startsWith(`${id}/`)) memoryImages().delete(k);
    removeDir(`pitch/${id}`);
  }
  saveJson("presentations.json", [...d.presentations.values()]);
  saveJson("runs.json", [...d.runs.values()]);
  saveJson("qa.json", [...d.qa.values()]);
  return { runIds: runs.map((r) => r.id), answerIds };
}

/** "Delete all my data": the person's presentations, slide pictures, runs and Q&A, the example included. */
export function clearPitch(userId?: string) {
  if (userId) {
    const d = db();
    const ids = new Set([...d.presentations.values()].filter((p) => p.userId === userId).map((p) => p.id));
    // Practice on the example, and on anything else, that carries this person's id.
    for (const r of [...d.runs.values(), ...d.qa.values()]) if (r.userId === userId) ids.add(r.presentationId);
    for (const id of ids) deletePresentation(id, userId);
    let left = false;
    for (const r of [...d.runs.values()]) if (r.userId === userId) left = d.runs.delete(r.id) || left;
    for (const q of [...d.qa.values()]) if (q.userId === userId) left = d.qa.delete(q.id) || left;
    if (left) {
      saveJson("runs.json", [...d.runs.values()]);
      saveJson("qa.json", [...d.qa.values()]);
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
