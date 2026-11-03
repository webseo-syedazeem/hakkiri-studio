import { loadJson, saveJson } from "@/lib/storage/disk";

/**
 * App settings that live on the server (until accounts, there's one person).
 * The voice choice lives in a cookie instead, so the browser knows it before
 * the interviewer speaks.
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
const g = globalThis as unknown as { __hakkiriSettings?: AppSettings };
const current = (g.__hakkiriSettings ??= { ...DEFAULTS, ...loadJson<Partial<AppSettings>>(FILE, {}) });

export function getSettings(): AppSettings {
  return { ...current };
}

export function saveSettings(change: Partial<AppSettings>): AppSettings {
  Object.assign(current, change);
  saveJson(FILE, current);
  return getSettings();
}
