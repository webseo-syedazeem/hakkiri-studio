import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { loadJson, saveJson } from "@/lib/storage/disk";
import { costOf } from "./prices";

/**
 * Usage: every call to Claude, Deepgram and ElevenLabs, with what it used and
 * an estimated cost, linked to the interview, session or presentation it was
 * for. Feeds the usage page, the cost on each report and the spending limits.
 * Saved to the local data folder (one year kept) until the database lands.
 */

export type Service = "claude" | "deepgram" | "elevenlabs";

export interface UsageContext {
  userId?: string;
  interviewId?: string;
  sessionId?: string;
  presentationId?: string;
  /** "set-up", "questions", "interview", "single question", "presentation", "q&a", "stories", "voice" */
  feature?: string;
}

export interface UsageEntry extends UsageContext {
  at: string;
  service: Service;
  /** What the call was for, e.g. "score-answer", "follow-up", "build-plan". */
  label: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  /** Read from Claude's prompt cache (a tenth of the input price). */
  cachedTokens?: number;
  /** Written to Claude's prompt cache (1.25 times the input price). */
  cacheWriteTokens?: number;
  /** Audio transcribed (Deepgram). */
  seconds?: number;
  /** Text spoken (ElevenLabs). */
  characters?: number;
  costUsd: number;
  /** Test mode: a sample of what a real call would use, not a real cost. */
  simulated?: boolean;
}

const FILE = "usage.json";
const KEEP_DAYS = 366;
const g = globalThis as unknown as { __hakkiriUsage?: UsageEntry[]; __hakkiriUsageCtx?: AsyncLocalStorage<UsageContext> };
const entries = (g.__hakkiriUsage ??= loadJson<UsageEntry[]>(FILE, []));
const als = (g.__hakkiriUsageCtx ??= new AsyncLocalStorage<UsageContext>());

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function persist() {
  // Calls come in bursts (a whole interview scored at once): write once they settle.
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const cutoff = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString();
    while (entries.length && entries[0].at < cutoff) entries.shift();
    saveJson(FILE, entries);
  }, 400);
}

/** Links the calls made for the rest of this request to an interview, session or presentation. */
export function setUsageContext(ctx: UsageContext) {
  als.enterWith({ ...als.getStore(), ...ctx });
}

export function withUsageContext<T>(ctx: UsageContext, fn: () => T): T {
  return als.run({ ...als.getStore(), ...ctx }, fn);
}

export function recordUsage(e: Omit<UsageEntry, "at" | "costUsd"> & { at?: string }): UsageEntry {
  const ctx = als.getStore() ?? {};
  const entry: UsageEntry = { ...ctx, ...e, at: e.at ?? new Date().toISOString(), costUsd: costOf(e) };
  entries.push(entry);
  persist();
  return entry;
}

export function allUsage(userId?: string): readonly UsageEntry[] {
  return userId ? entries.filter((e) => e.userId === userId) : entries;
}

/** London calendar day of an ISO time. */
const day = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Europe/London" });

export interface UsageTotals {
  costUsd: number;
  claudeCalls: number;
  inputTokens: number;
  outputTokens: number;
  audioSeconds: number;
  voiceCharacters: number;
  simulated: boolean;
  byService: Record<Service, number>;
}

export function totals(list: readonly UsageEntry[]): UsageTotals {
  const t: UsageTotals = { costUsd: 0, claudeCalls: 0, inputTokens: 0, outputTokens: 0, audioSeconds: 0, voiceCharacters: 0, simulated: false, byService: { claude: 0, deepgram: 0, elevenlabs: 0 } };
  for (const e of list) {
    t.costUsd += e.costUsd;
    t.byService[e.service] += e.costUsd;
    if (e.service === "claude") {
      t.claudeCalls += 1;
      t.inputTokens += e.inputTokens ?? 0;
      t.outputTokens += e.outputTokens ?? 0;
    }
    t.audioSeconds += e.seconds ?? 0;
    t.voiceCharacters += e.characters ?? 0;
    if (e.simulated) t.simulated = true;
  }
  return t;
}

export function usageOn(dayIso: string, userId?: string): UsageEntry[] {
  return entries.filter((e) => day(e.at) === dayIso && (!userId || e.userId === userId));
}

export function usageInMonth(dayIso: string, userId?: string): UsageEntry[] {
  const month = dayIso.slice(0, 7);
  return entries.filter((e) => day(e.at).startsWith(month) && (!userId || e.userId === userId));
}

export function usageFor(filter: UsageContext): UsageEntry[] {
  return entries.filter((e) => (!filter.interviewId || e.interviewId === filter.interviewId) && (!filter.sessionId || e.sessionId === filter.sessionId) && (!filter.presentationId || e.presentationId === filter.presentationId));
}

/** Spending by feature, most first. */
export function byFeature(list: readonly UsageEntry[]): { feature: string; costUsd: number; calls: number }[] {
  const m = new Map<string, { costUsd: number; calls: number }>();
  for (const e of list) {
    const k = e.feature ?? "other";
    const v = m.get(k) ?? { costUsd: 0, calls: 0 };
    v.costUsd += e.costUsd;
    v.calls += 1;
    m.set(k, v);
  }
  return [...m.entries()].map(([feature, v]) => ({ feature, ...v })).sort((a, b) => b.costUsd - a.costUsd);
}

/** Last N days, oldest first, for the usage chart. */
export function dailyCosts(todayIso: string, n = 14, userId?: string): { day: string; costUsd: number; minutes: number }[] {
  const out: { day: string; costUsd: number; minutes: number }[] = [];
  const base = new Date(`${todayIso}T12:00:00Z`);
  for (let k = n - 1; k >= 0; k--) {
    const d = new Date(base.getTime() - k * 86_400_000).toISOString().slice(0, 10);
    const list = usageOn(d, userId);
    out.push({ day: d, costUsd: list.reduce((s, e) => s + e.costUsd, 0), minutes: list.reduce((s, e) => s + (e.seconds ?? 0), 0) / 60 });
  }
  return out;
}

/**
 * "Delete all my data": the person's usage rows lose every link to what they
 * practised (which interview, session or presentation). What stays is a count:
 * when a service was called, how many seconds or characters, and the estimated
 * cost. It has to stay while the account does, or deleting your data would
 * also reset your monthly allowance. With no account named: everyone's (tests).
 */
export function anonymiseUsage(userId?: string) {
  for (const e of entries) {
    if (userId && e.userId !== userId) continue;
    delete e.interviewId;
    delete e.sessionId;
    delete e.presentationId;
  }
  saveJson(FILE, entries);
}

/**
 * "Delete my account": the rows are no longer anybody's. The counts stay,
 * because the app's own spending ceilings and the bill are worked out from
 * them, but nothing says whose they were. Returns how many rows.
 */
export function disownUsage(userId: string): number {
  if (!userId) return 0;
  let n = 0;
  for (const e of entries) {
    if (e.userId !== userId) continue;
    delete e.userId;
    delete e.interviewId;
    delete e.sessionId;
    delete e.presentationId;
    n++;
  }
  if (n) saveJson(FILE, entries);
  return n;
}
