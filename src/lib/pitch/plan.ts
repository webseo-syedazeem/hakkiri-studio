import { mmss } from "@/lib/format";
import { readinessFor, type ReadinessLevel } from "@/lib/scoring/combine";
import { QA_STYLE_LABEL } from "./labels";
import type { Presentation, QaSession, Run } from "./types";

/**
 * Pitch readiness and what to rehearse next (spec: "What happens after feedback").
 * - Readiness meter: "Ready" when two full runs in a row score 4 or more and finish on time.
 * - Next step: one thing to do now, from your last run. No calendar.
 */

/** A run finishes on time when it's within the limit (a few seconds' grace for the last sentence). */
export const ON_TIME_GRACE_SEC = 5;

export function onTime(run: Pick<Run, "totalSec">, limitSec: number): boolean {
  return run.totalSec <= limitSec + ON_TIME_GRACE_SEC;
}

const byFinish = <T extends { finishedAt: string }>(xs: T[]) => [...xs].sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));

/** Full runs that went to the last slide and took at least half the time limit (not a quick click-through), oldest first. */
export function completeRuns(runs: Run[], limitSec: number): Run[] {
  return byFinish(runs.filter((r) => r.mode === "full" && !r.endedEarly && r.totalSec >= limitSec * 0.5));
}

export interface PitchReadiness {
  ready: boolean;
  /** The latest complete full run, if any. */
  last: Run | null;
  rows: { label: string; score: number; level: ReadinessLevel }[];
  /** e.g. "Over time by 1:20", "Ready", "Not rehearsed yet". */
  status: string;
  statusTone: "red" | "lilac";
  /** How many complete full runs there are. */
  fullRuns: number;
}

/**
 * The readiness rows shown on Home: each part's latest score
 * (Opening also counts opening-only runs; Q&A comes from your last Q&A).
 */
export function pitchReadiness(p: Presentation, runs: Run[], qa: QaSession[]): PitchReadiness {
  const full = completeRuns(runs, p.timeLimitSec);
  const last = full[full.length - 1] ?? null;
  const lastTwo = full.slice(-2);
  const ready = lastTwo.length === 2 && lastTwo.every((r) => (r.overall ?? 0) >= 4 && onTime(r, p.timeLimitSec));

  const latest = (pick: (r: Run) => number | null, pool: Run[]) => {
    for (const r of byFinish(pool).reverse()) {
      const v = pick(r);
      if (v != null) return v;
    }
    return null;
  };
  const rows: PitchReadiness["rows"] = [];
  const add = (label: string, v: number | null) => v != null && rows.push({ label, score: v, level: readinessFor(v) });
  add("Opening", latest((r) => r.scores.opening, runs.filter((r) => r.mode !== "section")));
  add("Message and ask", latest((r) => r.scores.message, full));
  add("Timing", latest((r) => r.scores.timing, full));
  const lastQa = byFinish(qa).pop();
  add("Q&A", lastQa?.overall ?? null);

  const over = last ? last.totalSec - p.timeLimitSec : 0;
  const status = ready
    ? "Ready: two runs at 4+ and on time"
    : !last
      ? runs.length
        ? "No full run yet"
        : "Not rehearsed yet"
      : over > ON_TIME_GRACE_SEC
        ? `Over time by ${mmss(over)}`
        : `On time. Last run ${last.overall?.toFixed(1) ?? "not scored"}`;
  return { ready, last, rows, status, statusTone: ready || (last && over <= ON_TIME_GRACE_SEC) ? "lilac" : "red", fullRuns: full.length };
}

/**
 * The next thing to rehearse, for Home's Continue button: a first full run,
 * then the slide your last run flagged, then Q&A if there are questions
 * afterwards, then the opening once you're ready.
 */
export function pitchNextStep(p: Presentation, runs: Run[], qa: QaSession[]): { label: string; detail: string; href: string } {
  const r = pitchReadiness(p, runs, qa);
  const minutes = Math.round(p.timeLimitSec / 60);
  if (!r.fullRuns) return { label: "First full run", detail: `With slides, ${minutes} min`, href: `/rehearse/${p.id}` };
  const focus = r.last?.focus;
  if (!r.ready && focus?.slide != null && (focus.kind === "cut" || focus.kind === "missed" || focus.kind === "ask")) {
    return { label: `Re-run slide ${focus.slide}`, detail: "One slide, 3 min", href: `/rehearse/${p.id}?from=${focus.slide}&to=${focus.slide}` };
  }
  if (p.qaStyle && !qa.length) return { label: "Q&A practice", detail: `${QA_STYLE_LABEL[p.qaStyle]}, 8 min`, href: `/qa/${p.id}` };
  if (r.ready) return { label: "Opening, once", detail: "2 min", href: `/rehearse/${p.id}?mode=opening` };
  return { label: "Full run", detail: `With slides, ${minutes} min`, href: `/rehearse/${p.id}` };
}
