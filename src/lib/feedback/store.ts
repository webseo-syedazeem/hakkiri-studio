import "server-only";
import { loadJson, saveJson } from "@/lib/storage/disk";
import { reportProblem } from "@/lib/alerts/store";

/**
 * Beta feedback. Every note someone sends from the Feedback button is kept in
 * feedback.json and forwarded through the alerts channel (webhook or email),
 * so the team reads it the same day. Notes carry the page it was sent from and
 * nothing else about the person; with accounts, add the user id.
 */

export interface Feedback {
  id: string;
  at: string;
  page: string;
  /** Which screen the note is about, and the question the mood answers. */
  screen?: string;
  lead?: string;
  mood: "good" | "ok" | "bad";
  text: string;
  /** Set once accounts exist. */
  userId?: string;
}

const FILE = "feedback.json";
const KEEP = 2000;

const g = globalThis as unknown as { __hakkiriFeedback?: Feedback[] };
const list = (g.__hakkiriFeedback ??= loadJson<Feedback[]>(FILE, []));

export function recentFeedback(n = 50): readonly Feedback[] {
  return [...list].sort((a, b) => b.at.localeCompare(a.at)).slice(0, n);
}

export async function addFeedback(
  input: {
    page: string;
    mood: Feedback["mood"];
    text: string;
    screen?: string;
    lead?: string;
    userId?: string;
  },
  now = new Date(),
): Promise<Feedback> {
  const f: Feedback = {
    id: crypto.randomUUID(),
    at: now.toISOString(),
    page: input.page.split("?")[0].slice(0, 200),
    screen: input.screen?.slice(0, 60),
    lead: input.lead?.slice(0, 200),
    mood: input.mood,
    text: input.text.trim().slice(0, 2000),
    userId: input.userId,
  };
  list.push(f);
  if (list.length > KEEP) list.splice(0, list.length - KEEP);
  saveJson(FILE, list);
  // Each note is its own alert: a fresh id in the message keeps them from being grouped.
  const answer = { good: "Yes", ok: "Partly", bad: "No" }[f.mood];
  const head = f.lead ? `${f.lead} ${answer}.` : `${answer}.`;
  void reportProblem({
    source: "feedback",
    where: `${f.screen ?? "General"} · ${f.page}`,
    message: `${head}\n${f.text} [${f.id.slice(0, 8)}]`,
  });
  return f;
}

/** For tests and "Delete all my data". */
export function clearFeedback() {
  list.length = 0;
  saveJson(FILE, list);
}
