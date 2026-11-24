import { fileTime, loadFile, loadFileAsync, loadJson, loadJsonAsync, removeDir, removeFile, saveFile, saveJson, saveJsonAsync, savingToDisk } from "@/lib/storage/disk";

/**
 * Recordings, kept so you can hear your answer on the feedback screen.
 * Saved as files in the local data folder until real file storage lands
 * (build plan: recordings in object storage, deleted on request).
 * One entry per turn: the answer, then each follow-up reply.
 */
export interface Recording {
  data: ArrayBuffer;
  type: string;
}

/** `at`: when it was recorded (older entries fall back to the file's date). `userId`: whose it is, where the caller said. */
type Saved = { file: string; type: string; at?: string; userId?: string } | null;
const INDEX = "recordings.json";
const g = globalThis as unknown as { __hakkiriAudio?: Map<string, (Recording | null)[]>; __hakkiriAudioIndex?: Record<string, Saved[]> };
const memory = (g.__hakkiriAudio ??= new Map<string, (Recording | null)[]>());
const index = (g.__hakkiriAudioIndex ??= loadJson<Record<string, Saved[]>>(INDEX, {}));

const ext = (type: string) => (/ogg/.test(type) ? "ogg" : /mp4|aac|m4a/.test(type) ? "m4a" : "webm");

/** An id that is safe as part of a file name and as a key (ids come from the server, but nothing is taken on trust). */
const safeId = (id: string) => typeof id === "string" && /^[A-Za-z0-9._-]{1,120}$/.test(id) && id !== "__proto__" && id !== "constructor" && id !== "prototype";
const own = (id: string): Saved[] | undefined => (Object.prototype.hasOwnProperty.call(index, id) ? index[id] : undefined);

export function saveRecordings(answerId: string, recordings: (Recording | null)[], userId?: string) {
  if (!safeId(answerId)) return;
  // Always keep in memory so same-instance playback is immediate
  memory.set(answerId, recordings);
  const at = new Date().toISOString();
  index[answerId] = recordings.map((r, turn) => {
    if (!r) return null;
    const file = `recordings/${answerId}-${turn}.${ext(r.type)}`;
    saveFile(file, r.data);
    return { file, type: r.type, at, ...(userId ? { userId } : {}) };
  });
  saveJson(INDEX, index);
}

export async function saveRecordingsAsync(answerId: string, recordings: (Recording | null)[], userId?: string): Promise<void> {
  if (!safeId(answerId)) return;
  memory.set(answerId, recordings);
  const at = new Date().toISOString();
  index[answerId] = recordings.map((r, turn) => {
    if (!r) return null;
    const file = `recordings/${answerId}-${turn}.${ext(r.type)}`;
    saveFile(file, r.data);
    return { file, type: r.type, at, ...(userId ? { userId } : {}) };
  });
  await saveJsonAsync(INDEX, index);
}

export function getRecording(answerId: string, turn: number): Recording | null {
  const inMemory = memory.get(answerId)?.[turn];
  if (inMemory) return inMemory;
  const saved = own(answerId)?.[turn];
  const data = saved ? loadFile(saved.file) : null;
  return saved && data ? { data, type: saved.type } : null;
}

export async function getRecordingAsync(answerId: string, turn: number): Promise<Recording | null> {
  const inMemory = memory.get(answerId)?.[turn];
  if (inMemory) return inMemory;
  let saved = own(answerId)?.[turn];
  if (!saved) {
    try {
      const fromDb = await loadJsonAsync<Record<string, Saved[]>>(INDEX, {});
      if (fromDb && fromDb[answerId]?.[turn]) {
        index[answerId] = fromDb[answerId];
        saved = fromDb[answerId]?.[turn];
      }
    } catch {
      // ignore
    }
  }
  if (saved) {
    const data = (await loadFileAsync(saved.file)) ?? loadFile(saved.file);
    if (data) {
      const rec = { data, type: saved.type };
      const existing = memory.get(answerId) ?? [];
      existing[turn] = rec;
      memory.set(answerId, existing);
      return rec;
    }
  }
  return null;
}

export function hasRecording(answerId: string, turn = 0): boolean {
  return memory.get(answerId)?.[turn] != null || own(answerId)?.[turn] != null;
}

export async function hasRecordingAsync(answerId: string, turn = 0): Promise<boolean> {
  if (hasRecording(answerId, turn)) return true;
  try {
    const fromDb = await loadJsonAsync<Record<string, Saved[]>>(INDEX, {});
    if (fromDb && fromDb[answerId]?.[turn]) {
      index[answerId] = fromDb[answerId];
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

/** Deletes the recordings of these answers (when you delete an interview): the files, on disk and in the database's copy, and their entries. */
export function deleteRecordings(answerIds: Iterable<string>) {
  for (const id of answerIds) {
    memory.delete(id);
    for (const saved of own(id) ?? []) if (saved) removeFile(saved.file);
    if (own(id)) delete index[id];
  }
  saveJson(INDEX, index);
}

/* --------------------------------------------------------------- your data */

let lastPrune = 0;

/**
 * Deletes recordings older than their owner chose to keep them (Settings,
 * "Keep recordings for"). Transcripts and scores stay, so reports still
 * work; only the audio goes. Runs at most hourly unless forced.
 *
 * `daysFor` says how long one recording is kept: it is given the answer's id
 * and, where the recording carries one, its owner. 0 means "until I delete
 * it". Each person's own setting is applied to their own recordings: see
 * pruneOldRecordings in lib/data/account, which is what the app calls.
 */
export function pruneRecordings(opts: { daysFor: (answerId: string, userId?: string) => number; force?: boolean; now?: number }): number {
  const now = opts.now ?? Date.now();
  if (!opts.force && now - lastPrune < 3600_000) return 0;
  lastPrune = now;
  const old: string[] = [];
  for (const [id, list] of Object.entries(index)) {
    const first = list.find((x) => x);
    if (!first) continue;
    const days = opts.daysFor(id, first.userId);
    if (!days) continue;
    const when = first.at ? Date.parse(first.at) : (fileTime(first.file)?.getTime() ?? now);
    if (when < now - days * 86_400_000) old.push(id);
  }
  if (old.length) deleteRecordings(old);
  return old.length;
}

/** Every saved recording (with `only`: just those answers'), for "Download my data". */
export function allRecordings(only?: ReadonlySet<string>): { answerId: string; turn: number; file: string; type: string; at?: string }[] {
  return Object.entries(index)
    .filter(([answerId]) => !only || only.has(answerId))
    .flatMap(([answerId, list]) => list.flatMap((x, turn) => (x ? [{ answerId, turn, file: x.file, type: x.type, at: x.at }] : [])));
}

/** How many answers have a recording kept (with `only`: among those answers). Recordings held in memory only (tests, saving off) count too. */
export function recordingCount(only?: ReadonlySet<string>): number {
  const ids = new Set([...Object.keys(index).filter((k) => index[k].some(Boolean)), ...[...memory.entries()].filter(([, v]) => v.some(Boolean)).map(([k]) => k)]);
  if (!only) return ids.size;
  let n = 0;
  for (const id of ids) if (only.has(id)) n++;
  return n;
}

/** Which account a recording says it belongs to, where it says. */
export function recordingOwner(answerId: string): string | undefined {
  return own(answerId)?.find((x) => x)?.userId;
}

/** "Delete all my data". */
export function clearRecordings() {
  memory.clear();
  for (const k of Object.keys(index)) delete index[k];
  saveJson(INDEX, index);
  removeDir("recordings");
}
