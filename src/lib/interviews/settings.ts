import type { InterviewerStyle, QuestionGroup } from "@/lib/types";

/**
 * The settings for one interview session: how hard, how long, and the mix of
 * question categories (percentages in steps of 10 that always add up to 100).
 * Safe to import in the browser: the set-up form and the start panel use it.
 *
 * Categories keep their original keys inside the app:
 *   cv → Experience, competency → Skills, technical → Technical (or Role knowledge),
 *   motivation → Motivation, curveball → Situational.
 * Every interview also opens with "Tell me about yourself" and, from 20 minutes,
 * closes with "What questions do you have for us?". Those sit outside the mix.
 */

export type Difficulty = "easy" | "medium" | "hard";
export type MixPreset = "balanced" | "skills" | "technical" | "screening" | "final" | "custom";
export const LENGTHS = [10, 20, 30, 45, 60] as const;
export type SessionMinutes = (typeof LENGTHS)[number];
export type Mix = Record<QuestionGroup, number>;

export interface SessionSettings {
  difficulty: Difficulty;
  minutes: SessionMinutes;
  preset: MixPreset;
  mix: Mix;
}

/** The order categories are shown in. */
export const CATEGORY_ORDER: QuestionGroup[] = ["cv", "competency", "technical", "motivation", "curveball"];

/** The order they come up in an interview, after "Tell me about yourself". */
export const ASK_ORDER: QuestionGroup[] = ["motivation", "cv", "competency", "technical", "curveball"];

export const CATEGORY_LABEL: Record<QuestionGroup, string> = {
  cv: "Experience",
  competency: "Skills",
  technical: "Technical",
  motivation: "Motivation",
  curveball: "Situational",
};

/** What each category covers, before Hakkiri has read the job. */
export const CATEGORY_HINT: Record<QuestionGroup, string> = {
  cv: "Your CV: your path, moves, gaps and claims.",
  competency: "“Tell me about a time…” for the skills in the job spec.",
  technical: "What this job needs you to know or do.",
  motivation: "Why them, why this role, what you know about their market.",
  curveball: "What you’d do if…, quick-fire questions and curveballs.",
};

/** "Technical" for a technical job, "Role knowledge" for the rest. */
export type TechnicalLabel = "Technical" | "Role knowledge";

export function categoryLabel(group: QuestionGroup, technicalLabel: TechnicalLabel = "Technical"): string {
  return group === "technical" ? technicalLabel : CATEGORY_LABEL[group];
}

const TECH_WORDS = /\b(engineer|engineering|developer|software|data|analyst|analytics|scientist|devops|sre|architect|programmer|it|technical|technician|security|cloud|machine learning|ml|ai|qa|tester|web|backend|frontend|full[- ]stack|infrastructure|network|database|bi)\b/i;

/** Whether a job title reads as a technical job (used when Claude isn't there to decide). */
export function isTechRole(title: string): boolean {
  return TECH_WORDS.test(title);
}

const mix = (cv: number, competency: number, technical: number, motivation: number, curveball: number): Mix => ({ cv, competency, technical, motivation, curveball });

export const PRESETS: Record<Exclude<MixPreset, "custom">, { label: string; hint: string; mix: Mix }> = {
  balanced: { label: "Balanced", hint: "A bit of everything, like most first interviews.", mix: mix(20, 20, 20, 20, 20) },
  skills: { label: "Skills-heavy", hint: "Mostly “tell me about a time…”. Typical of graduate schemes and the public sector.", mix: mix(20, 40, 10, 20, 10) },
  technical: { label: "Technical-heavy", hint: "Mostly about doing the job itself.", mix: mix(20, 20, 50, 10, 0) },
  screening: { label: "Screening call", hint: "Why you, why them and your background, like a recruiter’s first call.", mix: mix(40, 20, 0, 40, 0) },
  final: { label: "Final round", hint: "Deeper on motivation and judgement, with some of everything.", mix: mix(20, 20, 20, 30, 10) },
};

export const PRESET_ORDER = Object.keys(PRESETS) as Exclude<MixPreset, "custom">[];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };

export const DIFFICULTY_HINT: Record<Difficulty, string> = {
  easy: "Common questions, a friendly interviewer, at most one gentle follow-up. Good for a first go.",
  medium: "Questions specific to this job, and up to two follow-ups when an answer is vague. Like most real interviews.",
  hard: "Probing questions, pushback, “what did you do?”, and the interviewer cuts in on long answers.",
};

export const DEFAULT_SETTINGS: SessionSettings = { difficulty: "medium", minutes: 20, preset: "balanced", mix: PRESETS.balanced.mix };

/** The interviewer's manner for each difficulty (it drives follow-ups). */
export function styleFor(d: Difficulty): InterviewerStyle {
  return d === "easy" ? "friendly" : d === "hard" ? "tough" : "realistic";
}

export function difficultyFor(style: InterviewerStyle): Difficulty {
  return style === "friendly" ? "easy" : style === "tough" ? "hard" : "medium";
}

/** Minutes per question, follow-ups included: harder interviews dig deeper, so fewer questions fit. */
const MIN_PER_QUESTION: Record<Difficulty, number> = { easy: 3.5, medium: 4, hard: 4.5 };
const OPENING_MIN = 3;
const CLOSING_MIN = 1.5;

/** Whether a session this long ends with "What questions do you have for us?". */
export function hasClosing(minutes: number): boolean {
  return minutes >= 20;
}

/** How many questions come from the mix (opening and closing not included). */
export function mixQuestionCount(minutes: number, difficulty: Difficulty): number {
  const left = minutes - OPENING_MIN - (hasClosing(minutes) ? CLOSING_MIN : 0);
  return Math.max(1, Math.round(left / MIN_PER_QUESTION[difficulty]));
}

/** Every question in the session, opening and closing included. */
export function totalQuestionCount(minutes: number, difficulty: Difficulty): number {
  return mixQuestionCount(minutes, difficulty) + 1 + (hasClosing(minutes) ? 1 : 0);
}

export function enabledGroups(m: Mix): QuestionGroup[] {
  return CATEGORY_ORDER.filter((g) => m[g] > 0);
}

/**
 * Shares `n` questions between the categories by percentage (largest
 * remainder), then makes sure every category that's switched on gets at
 * least one question when there are enough to go round.
 */
export function allocate(m: Mix, n: number): Record<QuestionGroup, number> {
  const on = enabledGroups(m);
  const out = { cv: 0, competency: 0, technical: 0, motivation: 0, curveball: 0 } as Record<QuestionGroup, number>;
  if (!on.length || n <= 0) return out;
  const total = on.reduce((s, g) => s + m[g], 0);
  const exact = on.map((g) => ({ g, v: (m[g] / total) * n }));
  for (const e of exact) out[e.g] = Math.floor(e.v);
  let left = n - on.reduce((s, g) => s + out[g], 0);
  const byRemainder = [...exact].sort((a, b) => b.v - Math.floor(b.v) - (a.v - Math.floor(a.v)) || m[b.g] - m[a.g] || CATEGORY_ORDER.indexOf(a.g) - CATEGORY_ORDER.indexOf(b.g));
  for (const e of byRemainder) {
    if (left <= 0) break;
    out[e.g] += 1;
    left -= 1;
  }
  if (n >= on.length) {
    for (const g of on) {
      if (out[g] > 0) continue;
      const donor = [...on].sort((a, b) => out[b] - out[a] || m[a] - m[b])[0];
      if (out[donor] > 1) {
        out[donor] -= 1;
        out[g] = 1;
      }
    }
  }
  return out;
}

const STEP = 10;

/** +10 or −10 on one category. The other categories give or take the difference, so the mix still adds up to 100. */
export function adjustMix(m: Mix, group: QuestionGroup, delta: 10 | -10): Mix {
  const on = enabledGroups(m).filter((g) => g !== group);
  if (!on.length || m[group] === 0) return m;
  const next = { ...m };
  if (delta > 0) {
    const donor = [...on].filter((g) => next[g] > STEP).sort((a, b) => next[b] - next[a] || CATEGORY_ORDER.indexOf(b) - CATEGORY_ORDER.indexOf(a))[0];
    if (!donor) return m;
    next[donor] -= STEP;
    next[group] += STEP;
  } else {
    if (next[group] <= STEP) return m;
    const taker = [...on].sort((a, b) => next[a] - next[b] || CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))[0];
    next[taker] += STEP;
    next[group] -= STEP;
  }
  return next;
}

/** Switches a category on (it takes 10 from the largest) or off (its share goes to the others, smallest first). At least one stays on. */
export function toggleMix(m: Mix, group: QuestionGroup, on: boolean): Mix {
  const next = { ...m };
  if (on) {
    if (next[group] > 0) return m;
    const donor = enabledGroups(m).filter((g) => next[g] > STEP).sort((a, b) => next[b] - next[a])[0];
    if (!donor) return m;
    next[donor] -= STEP;
    next[group] = STEP;
    return next;
  }
  const others = enabledGroups(m).filter((g) => g !== group);
  if (!others.length) return m;
  let share = next[group];
  next[group] = 0;
  while (share > 0) {
    const taker = [...others].sort((a, b) => next[a] - next[b] || CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))[0];
    next[taker] += STEP;
    share -= STEP;
  }
  return next;
}

/** The preset a mix matches, or "custom". */
export function presetFor(m: Mix): MixPreset {
  return PRESET_ORDER.find((p) => CATEGORY_ORDER.every((g) => PRESETS[p].mix[g] === m[g])) ?? "custom";
}

export function mixIsValid(m: Mix): boolean {
  const values = CATEGORY_ORDER.map((g) => m[g]);
  return values.every((v) => v >= 0 && v % STEP === 0) && values.reduce((a, b) => a + b, 0) === 100;
}

/** "Medium · 20 min · Balanced" */
export function settingsLine(s: SessionSettings): string {
  return `${DIFFICULTY_LABEL[s.difficulty]} · ${s.minutes} min · ${s.preset === "custom" ? "Your own mix" : PRESETS[s.preset].label}`;
}

/** "about 3 questions", "1 question", "no questions" */
export function aboutQuestions(n: number): string {
  return n === 0 ? "no questions" : n === 1 ? "1 question" : `about ${n} questions`;
}

/**
 * For a new interview: move 10 points from your strongest category to your
 * weakest, so the next interview leans towards what needs work. Only between
 * categories you have switched on, and only when there's a clear gap.
 */
export function leanTowards(m: Mix, scores: Partial<Record<QuestionGroup, number>>): { mix: Mix; weakest: QuestionGroup; strongest: QuestionGroup } | null {
  const scored = enabledGroups(m).filter((g) => scores[g] != null && scores[g]! > 0);
  if (scored.length < 2) return null;
  const weakest = scored.reduce((a, b) => (scores[a]! <= scores[b]! ? a : b));
  const strongest = scored.filter((g) => m[g] > STEP).reduce<QuestionGroup | null>((a, b) => (a == null || scores[b]! > scores[a]! ? b : a), null);
  if (!strongest || strongest === weakest || scores[strongest]! - scores[weakest]! < 0.5) return null;
  const next = { ...m, [weakest]: m[weakest] + STEP, [strongest]: m[strongest] - STEP };
  return { mix: next, weakest, strongest };
}

/** Settings for an interview saved before settings existed. */
export function settingsOr(s: SessionSettings | undefined, style: InterviewerStyle): SessionSettings {
  return s && mixIsValid(s.mix) ? s : { ...DEFAULT_SETTINGS, difficulty: difficultyFor(style) };
}
