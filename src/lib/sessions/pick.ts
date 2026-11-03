import type { Question, QuestionGroup } from "@/lib/types";
import { allocate, ASK_ORDER, hasClosing, mixQuestionCount, type SessionSettings } from "@/lib/interviews/settings";
import { GROUP_ORDER } from "@/lib/labels";

/**
 * Choosing the questions for an interview: "Tell me about yourself" first,
 * then each category's share of the mix in a natural order, then (from 20
 * minutes) "What questions do you have for us?". Questions you've added
 * yourself come first in their category, then ones you haven't heard, in the
 * order they were written. Two spares per category are kept for skips.
 * Never repeats a question you've had; `short` says how many more a category
 * needs, so the server can write them.
 */

export const SPARES_PER_CATEGORY = 2;

export interface Picked {
  questionIds: string[];
  spareIds: string[];
  /** Questions still needed per category (main questions first, then spares). */
  short: Record<QuestionGroup, number>;
  /** Spares still needed per category. */
  sparesShort: Record<QuestionGroup, number>;
}

const zero = (): Record<QuestionGroup, number> => ({ motivation: 0, competency: 0, technical: 0, cv: 0, curveball: 0 });

export function pickQuestions(bank: Question[], settings: Pick<SessionSettings, "minutes" | "difficulty" | "mix">, lastAsked: Map<string, string>, opts: { allowRepeats?: boolean } = {}): Picked {
  const alloc = allocate(settings.mix, mixQuestionCount(settings.minutes, settings.difficulty));
  const short = zero();
  const sparesShort = zero();
  const main: string[] = [];
  const spares: string[] = [];
  for (const g of ASK_ORDER) {
    if (alloc[g] === 0) continue;
    const pool = bank.filter((q) => q.group === g && !q.slot && !q.retired && !q.pay);
    const unheard = [...pool.filter((q) => q.custom && !lastAsked.has(q.id)), ...pool.filter((q) => !q.custom && !lastAsked.has(q.id))];
    const chosen = unheard.slice(0, alloc[g]);
    if (chosen.length < alloc[g] && opts.allowRepeats) {
      // Without a way to write more, the ones you had longest ago come back.
      const heard = pool.filter((q) => lastAsked.has(q.id)).sort((a, b) => lastAsked.get(a.id)!.localeCompare(lastAsked.get(b.id)!));
      chosen.push(...heard.slice(0, alloc[g] - chosen.length));
    }
    short[g] = alloc[g] - chosen.length;
    const spare = unheard.slice(alloc[g], alloc[g] + SPARES_PER_CATEGORY);
    sparesShort[g] = SPARES_PER_CATEGORY - spare.length;
    main.push(...chosen.map((q) => q.id));
    spares.push(...spare.map((q) => q.id));
  }
  const opening = bank.find((q) => q.slot === "opening");
  const closing = hasClosing(settings.minutes) ? bank.find((q) => q.slot === "closing") : undefined;
  return { questionIds: [...(opening ? [opening.id] : []), ...main, ...(closing ? [closing.id] : [])], spareIds: spares, short, sparesShort };
}

/** Questions to write so the next interview has its share and its spares. */
export function questionsNeeded(p: Picked): Record<QuestionGroup, number> {
  return Object.fromEntries(GROUP_ORDER.map((g) => [g, p.short[g] + p.sparesShort[g]])) as Record<QuestionGroup, number>;
}

export function needsAny(n: Record<QuestionGroup, number>): boolean {
  return GROUP_ORDER.some((g) => n[g] > 0);
}
