import "server-only";
import { loadJson, saveJson } from "@/lib/storage/disk";

/**
 * Error alerts: every problem on the server or in someone's browser is kept
 * (grouped, so 50 of the same error is one entry with a count), and the first
 * of each kind sends an alert:
 *   ALERT_WEBHOOK_URL   a Slack, Discord or Teams incoming webhook
 *   RESEND_API_KEY + ALERT_EMAIL_TO (+ ALERT_EMAIL_FROM)   an email through Resend
 * The same problem alerts again only after 30 minutes, so a bad hour is one
 * message, not hundreds. Messages are cut short and carry no recordings,
 * CVs or answers.
 */

export type ProblemSource = "server" | "browser" | "service" | "spending" | "feedback";

export interface Problem {
  key: string;
  source: ProblemSource;
  where: string;
  message: string;
  stack?: string;
  first: string;
  last: string;
  count: number;
  alertedAt?: string;
}

const FILE = "problems.json";
const KEEP = 200;
const KEEP_DAYS = 30;
const REALERT_MS = 30 * 60_000;

const g = globalThis as unknown as { __hakkiriProblems?: Problem[] };
const problems = (g.__hakkiriProblems ??= loadJson<Problem[]>(FILE, []));

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);
/** Numbers, ids and quoted values vary between occurrences of the same problem. */
const shape = (s: string) => s.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "#").replace(/\d+/g, "#").replace(/"[^"]{0,80}"/g, '""').slice(0, 160);

function persist() {
  const cutoff = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString();
  const kept = problems.filter((p) => p.last >= cutoff).sort((a, b) => b.last.localeCompare(a.last)).slice(0, KEEP);
  problems.splice(0, problems.length, ...kept);
  saveJson(FILE, problems);
}

export function recentProblems(n = 20): readonly Problem[] {
  return [...problems].sort((a, b) => b.last.localeCompare(a.last)).slice(0, n);
}

export function alertsConfigured(): { webhook: boolean; email: boolean } {
  return { webhook: !!process.env.ALERT_WEBHOOK_URL, email: !!(process.env.RESEND_API_KEY && process.env.ALERT_EMAIL_TO) };
}

async function sendAlert(p: Problem): Promise<void> {
  const title = `Hakkiri ${p.source === "spending" ? "spending alert" : p.source === "feedback" ? "beta feedback" : "problem"}: ${p.where}`;
  const body = `${p.message}${p.count > 1 ? `\n(${p.count} times since ${p.first.slice(0, 16).replace("T", " ")})` : ""}`;
  const jobs: Promise<unknown>[] = [];
  const hook = process.env.ALERT_WEBHOOK_URL;
  if (hook) {
    // "text" for Slack and Teams, "content" for Discord.
    jobs.push(fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: `*${title}*\n${body}`, content: `**${title}**\n${body}` }), signal: AbortSignal.timeout(5000) }));
  }
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO;
  if (key && to) {
    jobs.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({ from: process.env.ALERT_EMAIL_FROM || "Hakkiri alerts <onboarding@resend.dev>", to: to.split(",").map((s) => s.trim()), subject: title, text: `${body}\n\n${p.stack ?? ""}`.trim() }),
        signal: AbortSignal.timeout(5000),
      }),
    );
  }
  await Promise.allSettled(jobs);
}

/** Records a problem and alerts if it's new (or hasn't alerted for 30 minutes). Never throws. */
export async function reportProblem(input: { source: ProblemSource; where: string; message: string; stack?: string }, now = new Date()): Promise<Problem | null> {
  try {
    const message = clip(input.message.trim() || "Unknown error", 400);
    const key = `${input.source}|${input.where}|${shape(message)}`;
    const at = now.toISOString();
    let p = problems.find((x) => x.key === key);
    if (p) {
      p.count += 1;
      p.last = at;
      p.message = message;
    } else {
      p = { key, source: input.source, where: clip(input.where, 120), message, stack: input.stack ? clip(input.stack, 1500) : undefined, first: at, last: at, count: 1 };
      problems.push(p);
    }
    const due = !p.alertedAt || now.getTime() - Date.parse(p.alertedAt) > REALERT_MS;
    if (due && (alertsConfigured().webhook || alertsConfigured().email)) {
      p.alertedAt = at;
      await sendAlert(p);
    }
    persist();
    return p;
  } catch (err) {
    console.warn("[alerts] couldn't record a problem:", err instanceof Error ? err.message : err);
    return null;
  }
}

/** For tests and "Delete all my data" (problems hold no personal data, but start clean). */
export function clearProblems() {
  problems.length = 0;
  saveJson(FILE, problems);
}
