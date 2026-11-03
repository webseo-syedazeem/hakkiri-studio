import { fileTime, loadFile, loadJson, removeDir, removeFile, saveFile, saveJson, savingToDisk } from "@/lib/storage/disk";
import { getSettings } from "@/lib/settings/store";

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

/** `at`: when it was recorded (older entries fall back to the file's date). */
type Saved = { file: string; type: string; at?: string } | null;
const INDEX = "recordings.json";
const g = globalThis as unknown as { __hakkiriAudio?: Map<string, (Recording | null)[]>; __hakkiriAudioIndex?: Record<string, Saved[]> };
const memory = (g.__hakkiriAudio ??= new Map<string, (Recording | null)[]>());
const index = (g.__hakkiriAudioIndex ??= loadJson<Record<string, Saved[]>>(INDEX, {}));

const ext = (type: string) => (/ogg/.test(type) ? "ogg" : /mp4|aac|m4a/.test(type) ? "m4a" : "webm");

export function saveRecordings(answerId: string, recordings: (Recording | null)[]) {
  // Kept in memory only when there's no disk (tests); otherwise read back from the file on demand,
  // so a long-running server doesn't hold every recording ever made.
  if (!savingToDisk) memory.set(answerId, recordings);
  const at = new Date().toISOString();
  index[answerId] = recordings.map((r, turn) => {
    if (!r) return null;
    const file = `recordings/${answerId}-${turn}.${ext(r.type)}`;
    saveFile(file, r.data);
    return { file, type: r.type, at };
  });
  saveJson(INDEX, index);
  pruneRecordings();
}

export function getRecording(answerId: string, turn: number): Recording | null {
  const inMemory = memory.get(answerId)?.[turn];
  if (inMemory) return inMemory;
  const saved = index[answerId]?.[turn];
  const data = saved ? loadFile(saved.file) : null;
  return saved && data ? { data, type: saved.type } : null;
}

export function hasRecording(answerId: string, turn = 0): boolean {
  return memory.get(answerId)?.[turn] != null || index[answerId]?.[turn] != null;
}

/** Deletes the recordings of these answers (when you delete an interview). */
export function deleteRecordings(answerIds: string[]) {
  for (const id of answerIds) {
    memory.delete(id);
    for (const saved of index[id] ?? []) if (saved) removeFile(saved.file);
    delete index[id];
  }
  saveJson(INDEX, index);
}

/* --------------------------------------------------------------- your data */

let lastPrune = 0;

/**
 * Deletes recordings older than you chose to keep them (Settings, "Keep
 * recordings for"). Transcripts and scores stay, so your reports still work;
 * only the audio goes. Runs at most hourly unless forced.
 */
export function pruneRecordings(opts: { force?: boolean; now?: number } = {}): number {
  const now = opts.now ?? Date.now();
  const days = getSettings().retentionDays;
  if (!days || (!opts.force && now - lastPrune < 3600_000)) return 0;
  lastPrune = now;
  const cutoff = now - days * 86_400_000;
  const old: string[] = [];
  for (const [id, list] of Object.entries(index)) {
    const first = list.find((x) => x);
    if (!first) continue;
    const when = first.at ? Date.parse(first.at) : (fileTime(first.file)?.getTime() ?? now);
    if (when < cutoff) old.push(id);
  }
  if (old.length) deleteRecordings(old);
  return old.length;
}

/** Every saved recording, for "Download my data". */
export function allRecordings(): { answerId: string; turn: number; file: string; type: string; at?: string }[] {
  return Object.entries(index).flatMap(([answerId, list]) => list.flatMap((x, turn) => (x ? [{ answerId, turn, ...x }] : [])));
}

/** Recordings kept in memory only (tests, saving off) count too. */
export function recordingCount(): number {
  const ids = new Set([...Object.keys(index).filter((k) => index[k].some(Boolean)), ...[...memory.entries()].filter(([, v]) => v.some(Boolean)).map(([k]) => k)]);
  return ids.size;
}

/** "Delete all my data". */
export function clearRecordings() {
  memory.clear();
  for (const k of Object.keys(index)) delete index[k];
  saveJson(INDEX, index);
  removeDir("recordings");
}
