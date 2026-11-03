import type { Interview } from "@/lib/types";
import { DIFFICULTY_LABEL } from "@/lib/interviews/settings";
import { GROUP_QUESTIONS } from "@/lib/labels";
import { capitalise, clock, daysBetween, longDay, shortDay, withArticle } from "@/lib/format";
import { drillTitle } from "./drills";
import type { MockRecord } from "@/lib/mocks/store";

/** "Interview", "Run it again", "Technical drill", and the older kinds. */
export function sessionTitle(m: Pick<MockRecord, "kind" | "drill" | "group">, interview: Interview): string {
  switch (m.kind) {
    case "interview":
      return "Interview";
    case "rerun":
      return "Run it again";
    case "drill":
      return m.drill ? drillTitle(m.drill, (id) => interview.questions.find((q) => q.id === id)?.short ?? "this question", interview.understanding?.technicalLabel) : "Drill";
    case "full":
      return "Full mock interview";
    case "first":
      return "First session";
    case "group":
      return capitalise(GROUP_QUESTIONS[m.group ?? "competency"]);
  }
}

/** "Medium, 30 min" for an interview or re-run; empty for a drill. */
export function sessionSettingsText(m: Pick<MockRecord, "kind" | "settings">): string {
  return m.settings && (m.kind === "interview" || m.kind === "rerun") ? `${DIFFICULTY_LABEL[m.settings.difficulty]}, ${m.settings.minutes} min` : "";
}

/** The same, short: "Thu 29 Oct, 10:00". */
export function interviewWhenShort(date: string | undefined, today: string): { text: string; rel: string | null } {
  const w = interviewWhen(date, today);
  return date ? { ...w, text: `${shortDay(date)}, ${clock(date)}` } : w;
}

/** "a mid-level Data Analyst", "a Senior Product Manager" (no "senior Senior"). */
export function roleWithLevel(u: { role: string; level: string }): string {
  const level = u.level.trim();
  const words = u.role.toLowerCase();
  return withArticle(!level || words.includes(level.toLowerCase()) ? u.role : `${level.toLowerCase()} ${u.role}`);
}

/** When the real interview is: "Thursday 29 October, 10:00", and "in 5 days" / "tomorrow" / "today" / "done". */
export function interviewWhen(date: string | undefined, today: string): { text: string; rel: string | null } {
  if (!date) return { text: "No date set", rel: null };
  const days = daysBetween(today, date);
  return { text: `${longDay(date)}, ${clock(date)}`, rel: days < 0 ? "done" : days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days` };
}
