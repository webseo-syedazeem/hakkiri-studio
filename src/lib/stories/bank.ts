import "server-only";
import type { Interview, Story } from "@/lib/types";
import { isDemoInterview, listInterviews, updateInterview } from "@/lib/interviews/store";
import { draftStory } from "@/lib/interviews/stories";
import { normText } from "@/lib/ai/interview/build-plan";
import { findAnswer, listAnswers } from "@/lib/answers/store";
import { doneSessions } from "@/lib/mocks/store";
import { answerTells, missingParts, THEMES, themesOf, type Part } from "./themes";

/**
 * The story bank: every story from every interview in one place. Stories are
 * about you, not the job, so the same story found in two interviews (from the
 * same CV) is one entry. Until accounts land, it reads each interview's own
 * list and writes changes back to every interview that has the story.
 */

export interface BankStory {
  key: string;
  title: string;
  source: string;
  parts: Story["parts"];
  missing: Part[];
  text?: string;
  skill?: string;
  useFor: string[];
  themes: string[];
  /** Interviews it came from (yours, or the demo when you have none). */
  interviews: { id: string; company: string }[];
  /** Answers that seem to tell it (a rough match on its title words and where it happened). */
  uses: number;
  /** A question it fits, to practise it on. */
  practise: { interviewId: string; questionId: string; text: string } | null;
}

export interface StoryBank {
  stories: BankStory[];
  /** Each theme, with the stories that cover it. */
  themes: { id: string; label: string; question: string; stories: string[] }[];
  /** Skills a job asks for that no story shows yet. */
  gaps: { interviewId: string; company: string; skill: string; question: string }[];
  answers: number;
  /** Where "Build one" saves a new story: your soonest interview. */
  buildIn: { id: string; company: string } | null;
  demo: boolean;
}

export const storyKey = (title: string) => normText(title);

/** Your interviews, or the demo while you haven't added one. */
function sourceInterviews(today: string): { list: Interview[]; demo: boolean } {
  const all = listInterviews(today);
  const mine = all.filter((i) => !isDemoInterview(i.id));
  return mine.length ? { list: mine, demo: false } : { list: all, demo: all.length > 0 };
}

function practiseFor(interview: Interview, s: Story): BankStory["practise"] {
  const pool = interview.questions.filter((q) => !q.slot && !q.retired && !q.pay);
  const wanted = new Set((s.useFor ?? []).map(normText));
  const q = pool.find((x) => wanted.has(normText(x.short))) ?? pool.find((x) => x.group === "competency");
  return q ? { interviewId: interview.id, questionId: q.id, text: q.text } : null;
}

export function storyBank(today: string): StoryBank {
  const { list, demo } = sourceInterviews(today);

  // Every answer you've given in these interviews, for "which stories you reach for".
  const answerIds = new Set<string>();
  for (const i of list) {
    for (const a of listAnswers(i.id)) answerIds.add(a.id);
    for (const m of doneSessions(i.id)) for (const id of m.answerIds) answerIds.add(id);
  }
  const answers = [...answerIds].flatMap((id) => findAnswer(id) ?? []);

  const byKey = new Map<string, BankStory>();
  for (const i of list) {
    for (const s of i.stories ?? []) {
      const key = storyKey(s.title);
      const have = byKey.get(key);
      if (have) {
        have.interviews.push({ id: i.id, company: i.company });
        have.useFor = [...new Set([...have.useFor, ...(s.useFor ?? [])])];
        // The most complete version wins.
        for (const p of ["situation", "task", "action", "result"] as const) have.parts[p] ||= s.parts[p];
        have.missing = missingParts(have);
        have.text ??= s.text;
        continue;
      }
      byKey.set(key, {
        key,
        title: s.title,
        source: s.source,
        parts: { ...s.parts },
        missing: missingParts(s),
        text: s.text,
        skill: s.skill,
        useFor: s.useFor ?? [],
        themes: [],
        interviews: [{ id: i.id, company: i.company }],
        uses: 0,
        practise: practiseFor(i, s),
      });
    }
  }
  const stories = [...byKey.values()];
  for (const s of stories) {
    s.themes = themesOf(s);
    s.uses = answers.filter((a) => answerTells(s, a.words)).length;
  }
  // Complete stories first, then the ones you use most.
  stories.sort((a, b) => a.missing.length - b.missing.length || b.uses - a.uses || a.title.localeCompare(b.title));

  const built = new Set(stories.map((s) => (s.skill ?? "").toLowerCase()).filter(Boolean));
  const gaps = list.flatMap((i) => (i.gaps ?? []).filter((g) => !built.has(g.skill.toLowerCase())).map((g) => ({ interviewId: i.id, company: i.company, ...g })));

  return {
    stories,
    themes: THEMES.map((t) => ({ id: t.id, label: t.label, question: t.question, stories: stories.filter((s) => s.themes.includes(t.id)).map((s) => s.title) })),
    gaps: gaps.filter((g, k) => gaps.findIndex((x) => x.skill.toLowerCase() === g.skill.toLowerCase()) === k),
    answers: answers.length,
    buildIn: list[0] ? { id: list[0].id, company: list[0].company } : null,
    demo,
  };
}

/**
 * "Fill in the gaps": your words for each part of a story. The story is
 * redrafted from them (result first) and saved to every interview that has it.
 */
export async function completeStory(key: string, parts: Record<Part, string>, today: string): Promise<BankStory | null> {
  const { list } = sourceInterviews(today);
  const holders = list.filter((i) => (i.stories ?? []).some((s) => storyKey(s.title) === key));
  if (!holders.length) return null;
  const first = holders[0].stories!.find((s) => storyKey(s.title) === key)!;
  const drafted = await draftStory({
    skill: first.skill ?? first.useFor?.[0] ?? first.title,
    question: first.useFor?.[0] ? `Tell me about ${first.useFor[0].toLowerCase()}.` : "Tell me about a time you made a difference.",
    role: holders[0].role,
    parts,
  });
  for (const i of holders) {
    updateInterview(i.id, (x) => ({
      ...x,
      stories: (x.stories ?? []).map((s) =>
        storyKey(s.title) === key
          ? {
              ...s,
              parts: {
                situation: s.parts.situation || Boolean(parts.situation.trim()),
                task: s.parts.task || Boolean(parts.task.trim()),
                action: s.parts.action || Boolean(parts.action.trim()),
                result: s.parts.result || Boolean(parts.result.trim()),
              },
              text: drafted.text,
            }
          : s,
      ),
    }));
  }
  return storyBank(today).stories.find((s) => s.key === key) ?? null;
}
