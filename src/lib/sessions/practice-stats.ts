/**
 * The three figures at the top of the Practice Hub, worked out from one
 * person's own finished sessions on one interview. With no sessions every
 * figure is zero or null and the screen says "none yet": no figure is shown
 * that a session didn't produce.
 */

export interface PracticeSession {
  startedAt: string;
  finishedAt?: string;
  /** The session's overall score, or null when it couldn't be scored. */
  score: number | null;
}

export interface PracticeStats {
  /** Sessions started in the last seven days. */
  sessionsThisWeek: number;
  /** Minutes spent in them, to the nearest minute. */
  minutesThisWeek: number;
  /** Every scored session, whenever it was. */
  scoredSessions: number;
  /** Their mean score. Null when none has been scored. */
  averageScore: number | null;
  /** This week's mean against the seven days before. Null unless both weeks have a scored session. */
  changeOnLastWeek: number | null;
}

const WEEK = 7 * 24 * 60 * 60 * 1000;
/** A session left open is not hours of practice: anything longer than this is counted as this long. */
const LONGEST_MIN = 120;
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const round1 = (n: number) => Math.round(n * 10) / 10;

export function practiceStats(sessions: PracticeSession[], now: Date): PracticeStats {
  const at = now.getTime();
  const valid = sessions.map((s) => ({ ...s, start: Date.parse(s.startedAt) })).filter((s) => Number.isFinite(s.start) && s.start <= at);
  const thisWeek = valid.filter((s) => at - s.start < WEEK);
  const lastWeek = valid.filter((s) => at - s.start >= WEEK && at - s.start < 2 * WEEK);
  const minutes = thisWeek.reduce((n, s) => {
    const end = s.finishedAt ? Date.parse(s.finishedAt) : NaN;
    if (!Number.isFinite(end) || end <= s.start) return n;
    return n + Math.min(LONGEST_MIN, (end - s.start) / 60000);
  }, 0);
  const scores = (list: typeof valid) => list.map((s) => s.score).filter((v): v is number => v != null && Number.isFinite(v));
  const all = scores(valid);
  const now7 = mean(scores(thisWeek));
  const prev7 = mean(scores(lastWeek));
  const average = mean(all);
  return {
    sessionsThisWeek: thisWeek.length,
    minutesThisWeek: Math.round(minutes),
    scoredSessions: all.length,
    averageScore: average == null ? null : round1(average),
    changeOnLastWeek: now7 != null && prev7 != null ? round1(now7 - prev7) : null,
  };
}

export type PracticeType = "strengths" | "competency" | "technical" | "situational" | "motivation" | "experience";

/** Which of the hub's six kinds a built-in practice topic is, from the topic itself. */
export function practiceTypeOf(topic: { id: string; group: string }): PracticeType {
  if (topic.id.includes("strengths")) return "strengths";
  switch (topic.group) {
    case "technical":
      return "technical";
    case "curveball":
      return "situational";
    case "motivation":
      return "motivation";
    case "cv":
      return "experience";
    default:
      return "competency";
  }
}
