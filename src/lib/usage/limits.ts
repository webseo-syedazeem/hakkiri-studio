import "server-only";
import { NextResponse } from "next/server";
import { londonToday } from "@/lib/dates";
import { BETA, devOr, isBeta } from "@/lib/launch";
import { usageInMonth, usageOn, type UsageEntry } from "./store";
import { reportProblem } from "@/lib/alerts/store";

/**
 * Spending and practice limits, and a guard on every route that calls an AI
 * service. Until accounts land these apply to the whole app (it's one person
 * on one laptop); with accounts they become limits per person.
 * Set any limit to 0 in .env.local to turn it off.
 */

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return v != null && v !== "" && Number.isFinite(n) && n >= 0 ? n : fallback;
};

export const LIMITS = {
  /** Minutes of your speaking transcribed per day. */
  dailyMinutes: num(
    process.env.HAKKIRI_DAILY_MINUTES,
    isBeta() ? BETA.minutesPerDay : 120,
  ),
  /** Minutes of practice per calendar month. Only the beta sets it (per tester). */
  monthlyMinutes: isBeta()
    ? num(process.env.HAKKIRI_BETA_MINUTES, BETA.hoursPerTester * 60)
    : 0,
  /** Estimated dollars per day, across every service. */
  dailyUsd: num(
    process.env.HAKKIRI_DAILY_SPEND_USD,
    isBeta() ? BETA.dailyUsd : 5,
  ),
  /** Estimated dollars per calendar month. */
  monthlyUsd: num(
    process.env.HAKKIRI_MONTHLY_SPEND_USD,
    isBeta() ? BETA.monthlyUsd : 60,
  ),
};

/** Test-mode samples don't count towards limits. */
const real = (list: UsageEntry[]) => list.filter((e) => !e.simulated);

export interface Standing {
  minutesToday: number;
  spentToday: number;
  spentMonth: number;
  /** Minutes of practice this calendar month; only read in the beta. */
  minutesMonth?: number;
}

export function limitStanding(today = londonToday()): Standing {
  const t = real(usageOn(today));
  return {
    minutesToday: t.reduce((s, e) => s + (e.seconds ?? 0), 0) / 60,
    spentToday: t.reduce((s, e) => s + e.costUsd, 0),
    spentMonth: real(usageInMonth(today)).reduce((s, e) => s + e.costUsd, 0),
    minutesMonth: LIMITS.monthlyMinutes
      ? real(usageInMonth(today)).reduce((s, e) => s + (e.seconds ?? 0), 0) / 60
      : undefined,
  };
}

const hm = (min: number) => {
  const m = Math.round(min);
  return m >= 60
    ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}`
    : `${m} min`;
};

/**
 * Why a new piece of practice can't start, or null. `grace` lets something
 * already under way (an interview you started) finish a little past the limit.
 */
export function limitReached(
  opts: { grace?: number; practice?: boolean } = {},
  s = limitStanding(),
): string | null {
  const grace = opts.grace ?? 1;
  if (LIMITS.monthlyUsd && s.spentMonth >= LIMITS.monthlyUsd * grace) {
    return devOr(
      `This month’s spending limit ($${LIMITS.monthlyUsd}) is reached. Raise HAKKIRI_MONTHLY_SPEND_USD in .env.local to carry on.`,
      "You’ve reached this month’s practice limit. It resets on the 1st.",
    );
  }
  if (LIMITS.dailyUsd && s.spentToday >= LIMITS.dailyUsd * grace) {
    return devOr(
      `Today’s spending limit ($${LIMITS.dailyUsd}) is reached. Raise HAKKIRI_DAILY_SPEND_USD in .env.local, or carry on tomorrow.`,
      "You’ve reached today’s practice limit. It resets at midnight.",
    );
  }
  if (
    opts.practice &&
    LIMITS.monthlyMinutes &&
    (s.minutesMonth ?? 0) >= LIMITS.monthlyMinutes * grace
  ) {
    return `You’ve used this month’s ${hm(LIMITS.monthlyMinutes)} of beta practice. It resets on the 1st. If you need more before then, say so with the Feedback button.`;
  }
  if (
    opts.practice &&
    LIMITS.dailyMinutes &&
    s.minutesToday >= LIMITS.dailyMinutes * grace
  ) {
    if (isBeta())
      return `You’ve practised for ${hm(s.minutesToday)} today, which is the daily cap during the beta. It resets at midnight.`;
    return devOr(
      `You’ve spoken for ${hm(s.minutesToday)} today, the daily limit (${hm(LIMITS.dailyMinutes)}). Raise HAKKIRI_DAILY_MINUTES in .env.local, or carry on tomorrow.`,
      `You’ve practised for ${hm(s.minutesToday)} today, which is today’s limit. It resets at midnight. Good work.`,
    );
  }
  return null;
}

/** Spending alerts at 80% of a limit: once a day and once a month (per server start). */
const spendAlerted = new Set<string>();
export function checkSpendAlerts(
  today = londonToday(),
  s = limitStanding(today),
) {
  const warn = (key: string, where: string, message: string) => {
    if (spendAlerted.has(key)) return;
    spendAlerted.add(key);
    void reportProblem({ source: "spending", where, message });
  };
  if (LIMITS.dailyUsd && s.spentToday >= LIMITS.dailyUsd * 0.8)
    warn(
      `day:${today}`,
      `Daily spending ${today}`,
      `Today's estimated spend is $${s.spentToday.toFixed(2)}, ${Math.round((s.spentToday / LIMITS.dailyUsd) * 100)}% of the $${LIMITS.dailyUsd} limit.`,
    );
  if (LIMITS.monthlyUsd && s.spentMonth >= LIMITS.monthlyUsd * 0.8)
    warn(
      `month:${today.slice(0, 7)}`,
      `Monthly spending ${today.slice(0, 7)}`,
      `This month's estimated spend is $${s.spentMonth.toFixed(2)}, ${Math.round((s.spentMonth / LIMITS.monthlyUsd) * 100)}% of the $${LIMITS.monthlyUsd} limit.`,
    );
}

/* ------------------------------------------------------------ rate limits */

const g = globalThis as unknown as { __hakkiriRate?: Map<string, number[]> };
const hits = (g.__hakkiriRate ??= new Map<string, number[]>());

let lastSweep = 0;
export function rateLimited(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): boolean {
  // Forget keys that haven't been seen for a while, so the map can't grow without end.
  if (now - lastSweep > 60_000) {
    lastSweep = now;
    for (const [k, times] of hits)
      if (!times.some((t) => now - t < 600_000)) hits.delete(k);
  }
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

/**
 * Who's asking, for the per-minute limits. The forwarded address is only
 * believed behind a proxy you control (HAKKIRI_TRUST_PROXY=1), because any
 * client can send that header; otherwise every request counts as one caller.
 */
export function clientKey(req: Request): string {
  if (process.env.HAKKIRI_TRUST_PROXY !== "1") return "local";
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

export type GuardKind = "build" | "plan" | "answer" | "ai" | "voice" | "read";

/** How many requests per window each kind of route allows from one person. */
const RATE: Record<GuardKind, [number, number]> = {
  build: [8, 10 * 60_000],
  plan: [20, 60_000],
  answer: [60, 60_000],
  ai: [20, 60_000],
  voice: [150, 60_000],
  read: [30, 60_000],
};

/**
 * The first line of every route that calls an AI service: too many requests,
 * or a limit reached, returns a 429 with a plain message; otherwise null.
 *   practice: starts new speaking practice (counts against daily minutes)
 *   inSession: part of something already started, so it may finish (25% grace)
 */
export function guard(
  req: Request,
  kind: GuardKind,
  opts: { practice?: boolean; inSession?: boolean } = {},
): NextResponse | null {
  const [limit, windowMs] = RATE[kind];
  if (rateLimited(`${kind}:${clientKey(req)}`, limit, windowMs)) {
    return NextResponse.json(
      {
        error: "slow-down",
        message:
          "That’s a lot of requests in a short time. Wait a minute, then try again.",
      },
      { status: 429 },
    );
  }
  if (kind === "read") return null;
  const standing = limitStanding();
  checkSpendAlerts(londonToday(), standing);
  const why = limitReached(
    { practice: opts.practice, grace: opts.inSession ? 1.25 : 1 },
    standing,
  );
  return why
    ? NextResponse.json({ error: "limit", message: why }, { status: 429 })
    : null;
}
