import { CATEGORY_ORDER, categoryLabel, type TechnicalLabel } from "@/lib/interviews/settings";
import type { QuestionGroup } from "@/lib/types";

export interface OverviewCategory {
  key: QuestionGroup;
  name: string;
  /** From the latest interview that included this category. */
  score: number;
  /** The change since the interview before that which also included it. Null when there is no earlier one. */
  delta: number | null;
}

/**
 * The category scores shown on an interview's workspace. `perSession` holds
 * each interview's own category scores, newest first. A category appears only
 * if one of the person's interviews scored it, and a change is shown only when
 * two of them did. With no scored interview the list is empty.
 */
export function overviewCategories(perSession: Partial<Record<QuestionGroup, number>>[], technicalLabel: TechnicalLabel = "Technical"): OverviewCategory[] {
  const out: OverviewCategory[] = [];
  for (const key of CATEGORY_ORDER) {
    const scored = perSession.map((c) => c[key]).filter((v): v is number => v != null && Number.isFinite(v));
    if (!scored.length) continue;
    out.push({ key, name: categoryLabel(key, technicalLabel), score: scored[0], delta: scored.length > 1 ? Number((scored[0] - scored[1]).toFixed(1)) : null });
  }
  return out;
}
