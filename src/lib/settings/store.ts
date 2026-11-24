import { loadJson, saveJson } from "@/lib/storage/disk";

/**
 * A person's settings that live on the server, kept per account. The voice
 * choice lives in a cookie instead, so the browser knows it before the
 * interviewer speaks.
 */

/** Days to keep recordings of your answers; 0 = until you delete them. */
export type Retention = 30 | 90 | 365 | 0;
export const RETENTIONS: Retention[] = [30, 90, 365, 0];
export const RETENTION_LABEL: Record<Retention, string> = { 30: "30 days", 90: "90 days", 365: "1 year", 0: "Until I delete them" };

export interface AppSettings {
  retentionDays: Retention;
}

const FILE = "settings.json";
const DEFAULTS: AppSettings = { retentionDays: 90 };
const g = globalThis as unknown as { __hakkiriSettings?: Record<string, AppSettings> };
const currentMap = (g.__hakkiriSettings ??= loadJson<Record<string, AppSettings>>(FILE, {}));

/**
 * One account's settings: what they chose, over the defaults. Nobody inherits
 * anyone else's choice. With no account named (the tests, and recordings that
 * can't be tied to anyone) it is the defaults, or what was saved without one.
 */
export function getSettings(userId?: string): AppSettings {
  const own = Object.prototype.hasOwnProperty.call(currentMap, userId || "default") ? currentMap[userId || "default"] : undefined;
  return { ...DEFAULTS, ...own };
}

/** What the person has chosen themselves, or null when they have changed nothing: for "Download my data". */
export function savedSettings(userId: string): AppSettings | null {
  return userId && Object.prototype.hasOwnProperty.call(currentMap, userId) ? { ...currentMap[userId] } : null;
}

export function saveSettings(change: Partial<AppSettings>, userId?: string): AppSettings {
  const key = userId || "default";
  if (key === "__proto__" || key === "constructor" || key === "prototype") return getSettings();
  currentMap[key] = { ...getSettings(userId), ...change };
  saveJson(FILE, currentMap);
  return { ...currentMap[key] };
}

/** "Delete all my data": the person's settings go back to the defaults. With no account named: everyone's (tests). */
export function clearSettings(userId?: string) {
  if (userId) delete currentMap[userId];
  else for (const key of Object.keys(currentMap)) delete currentMap[key];
  saveJson(FILE, currentMap);
}
