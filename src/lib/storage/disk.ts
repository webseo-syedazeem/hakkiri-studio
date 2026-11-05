import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { isMongoConfigured, saveToMongo, hydrateFromMongo } from "./mongodb";

/**
 * Local saving for the prototype: JSON files and recordings in a
 * `.hakkiri-data` folder inside the project, so your practice survives a
 * restart. A stand-in until the real database and file storage (build plan:
 * "Data, privacy and security"); every store keeps the same functions, so
 * swapping this out won't touch the screens.
 *
 * Off in unit tests. Set HAKKIRI_DATA_DIR to keep the data somewhere else.
 */
const enabled = !process.env.VITEST && process.env.HAKKIRI_SAVE !== "off";
/** True when files are being saved to disk (false in unit tests and with HAKKIRI_SAVE=off). */
export const savingToDisk = enabled;

function resolveStorageDirectory(): string {
  if (process.env.HAKKIRI_DATA_DIR) {
    return process.env.HAKKIRI_DATA_DIR;
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "hakkiri-data");
  }
  return path.join(process.cwd(), ".hakkiri-data");
}

const DIR = resolveStorageDirectory();

// Pre-warm local storage cache from MongoDB Atlas when running on serverless/cloud
if (enabled && isMongoConfigured()) {
  void hydrateFromMongo(DIR);
}

function ensureDir(dir: string) {
  if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
}

export function loadJson<T>(name: string, fallback: T): T {
  if (!enabled) return fallback;
  try {
    return JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ DIR, name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** Writes to a temporary file first, so a crash mid-write never leaves a broken file. Also mirrors to MongoDB Atlas when configured. */
export function saveJson(name: string, value: unknown) {
  if (isMongoConfigured()) {
    void saveToMongo("storage", name, value);
  }
  if (!enabled) return;
  try {
    ensureDir(DIR);
    const file = path.join(/*turbopackIgnore: true*/ DIR, name);
    fs.writeFileSync(/*turbopackIgnore: true*/ `${file}.tmp`, JSON.stringify(value));
    fs.renameSync(`${file}.tmp`, file);
  } catch (err) {
    console.warn(`[storage] couldn't save ${name}:`, err instanceof Error ? err.message : err);
  }
}

export function saveFile(rel: string, data: ArrayBuffer) {
  if (!enabled) return;
  try {
    const file = path.join(/*turbopackIgnore: true*/ DIR, rel);
    ensureDir(path.dirname(file));
    fs.writeFileSync(/*turbopackIgnore: true*/ file, Buffer.from(data));
  } catch (err) {
    console.warn(`[storage] couldn't save ${rel}:`, err instanceof Error ? err.message : err);
  }
}

export function loadFile(rel: string): ArrayBuffer | null {
  if (!enabled) return null;
  try {
    const buf = fs.readFileSync(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ DIR, rel));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  } catch {
    return null;
  }
}

export function removeFile(rel: string) {
  if (!enabled) return;
  try {
    fs.rmSync(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ DIR, rel), { force: true });
  } catch (err) {
    console.warn(`[storage] couldn't delete ${rel}:`, err instanceof Error ? err.message : err);
  }
}

/** When a saved file was last written, or null. */
export function fileTime(rel: string): Date | null {
  if (!enabled) return null;
  try {
    return fs.statSync(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ DIR, rel)).mtime;
  } catch {
    return null;
  }
}

/** Deletes a folder in the data folder and everything in it ("Delete all my data"). */
export function removeDir(rel: string) {
  if (!enabled) return;
  try {
    fs.rmSync(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ DIR, rel), { recursive: true, force: true });
  } catch (err) {
    console.warn(`[storage] couldn't delete ${rel}:`, err instanceof Error ? err.message : err);
  }
}
