import type { Interview, Question, Story } from "@/lib/types";
import type { Fix } from "@/lib/mocks/report";
import { profileFor } from "@/lib/scoring/profiles";
import { mmss } from "@/lib/format";

/**
 * The parts of the prep sheet that are worked out on the page rather than
 * stored: what to work on first, the questions to expect and the stage it is
 * for. Each comes from this interview and this person's own practice. Where
 * there is nothing to go on, the list is empty and the page says what would
 * fill it. Nothing is written in as an example of what might be there.
 */

export interface PrepPriority {
  kind: "fix" | "gap";
  title: string;
  detail: string;
  /** Where to work on it. */
  href: string;
  action: string;
}

const sameSkill = (a: string | undefined, b: string) => (a ?? "").trim().toLowerCase() === b.trim().toLowerCase();

/**
 * What to work on first: the patterns the person's latest interview showed
 * (its fixes), then the skills the job asks for that none of their stories
 * covers yet. Empty until there is a scored interview or a known gap.
 */
export function prepPriorities(input: { interviewId: string; fixes: Fix[]; gaps: { skill: string; question: string }[]; stories: Pick<Story, "skill">[] }, limit = 4): PrepPriority[] {
  const out: PrepPriority[] = [];
  for (const f of input.fixes) {
    out.push({ kind: "fix", title: f.title, detail: f.detail, href: `/mock/${input.interviewId}?q=${encodeURIComponent(f.practiseQuestionId)}`, action: "Practise it" });
  }
  for (const g of input.gaps) {
    if (!g.skill.trim() || input.stories.some((s) => sameSkill(s.skill, g.skill))) continue;
    out.push({
      kind: "gap",
      title: `Build a story: ${g.skill.trim().toLowerCase()}`,
      detail: `The job asks for it and none of your stories shows it yet. A question that tests it: “${g.question.trim()}”`,
      href: `/interviews/${input.interviewId}/story?skill=${encodeURIComponent(g.skill)}&question=${encodeURIComponent(g.question)}`,
      action: "Build the story",
    });
  }
  return out.slice(0, limit);
}

export interface LikelyQuestion {
  id: string;
  text: string;
  /** How this kind of question is best answered: the same rule its score is worked out from. */
  approach: string;
}

/** Questions that matter most on the day come first (the same order the prep sheet's best answers use). */
function order(q: Question): number {
  if (q.slot === "opening") return 0;
  if (q.type === "why-us") return 1;
  if (q.group === "competency") return 2;
  if (q.group === "technical") return 3;
  if (q.group === "cv") return 4;
  return 5;
}

/**
 * The questions written for this interview, most important first, each with
 * how that kind of question is best answered. Questions that were set aside,
 * and the ones kept for the pay and topic drills, are left out.
 */
export function likelyQuestions(interview: Pick<Interview, "questions">, limit = 5): LikelyQuestion[] {
  return interview.questions
    .filter((q) => !q.retired && !q.pay && !q.drillOnly && q.slot !== "closing")
    .map((q, i) => ({ q, i }))
    .sort((a, b) => order(a.q) - order(b.q) || a.i - b.i)
    .slice(0, limit)
    .map(({ q }) => {
      const p = profileFor(q.type);
      return { id: q.id, text: q.text, approach: `${p.shape}. What counts most: ${p.countsMost.charAt(0).toLowerCase()}${p.countsMost.slice(1)}. Aim for ${mmss(p.targetSec[0])} to ${mmss(p.targetSec[1])}.` };
    });
}

/** The stage this sheet is for: the interview's own next stage, or its first. Null when it has no stages. */
export function prepStage(interview: Pick<Interview, "stages">): string | null {
  const stages = (interview.stages ?? []).filter((s) => s.name?.trim());
  if (!stages.length) return null;
  const next = stages.find((s) => s.status === "next") ?? stages.find((s) => s.status !== "completed") ?? stages[0];
  return next.name.trim();
}
