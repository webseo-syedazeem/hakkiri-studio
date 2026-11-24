import { mixIsValid, presetFor, PRESETS, type Mix } from "./settings";

/**
 * The rules of the interview set-up form: what must be there before an
 * interview can be built, and exactly what is sent to build it. The request
 * holds only what the person gave. No company, job title, CV text, date or
 * time is ever filled in for them, and the question mix sent is the mix the
 * screen shows.
 */

export interface SetupStage {
  id: string;
  name: string;
  date: string;
  time: string;
  format: string;
  interviewer: string;
  status: string;
}

export interface SetupForm {
  company: string;
  title: string;
  website: string;
  /** The job description as read from a file, a link or pasted text. Empty when none could be read. */
  jobText: string;
  jobUrl: string;
  jobLabel: string;
  /** The CV's text as read from a file or pasted. Empty when none could be read. */
  cvText: string;
  cvLabel: string;
  coverText: string;
  coverLabel: string;
  stages: SetupStage[];
  difficulty: string;
  minutes: number;
  focus: Focus;
}

export interface Focus {
  technical: number;
  skills: number;
  experience: number;
}

export interface SetupProblem {
  field: "company" | "job" | "cv";
  /** Which step of the form the field is on. */
  step: 1;
  message: string;
}

/** A CV needs at least this many words to build questions from. */
export const MIN_CV_WORDS = 15;
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** What is missing before the interview can be built. Empty when it can. */
export function setupProblems(f: SetupForm): SetupProblem[] {
  const out: SetupProblem[] = [];
  if (!f.company.trim()) out.push({ field: "company", step: 1, message: "Add the company’s name." });
  if (!f.title.trim() && !f.jobText.trim() && !f.jobUrl.trim()) out.push({ field: "job", step: 1, message: "Add the job title, or the job description." });
  if (words(f.cvText) < MIN_CV_WORDS) out.push({ field: "cv", step: 1, message: f.cvText.trim() ? "Your CV has too few words to build questions from. Paste the full text." : "Add your CV: choose a file we can read, or paste its text." });
  return out;
}

const STEP = 10;

/**
 * The question mix for the three focus sliders. Each slider's share of the
 * three together, to the nearest 10, adding up to 100: Technical is the
 * technical questions, Skills the competency questions and Experience the
 * questions about the CV. With every slider at zero the mix is the balanced one.
 */
export function focusMix(focus: Focus): Mix {
  const raw = [Math.max(0, focus.technical), Math.max(0, focus.skills), Math.max(0, focus.experience)];
  const total = raw[0] + raw[1] + raw[2];
  if (!Number.isFinite(total) || total <= 0) return { ...PRESETS.balanced.mix };
  // Largest-remainder rounding to steps of ten, so the three always add up to 100.
  const exact = raw.map((v) => (v / total) * (100 / STEP));
  const units = exact.map(Math.floor);
  let left = 100 / STEP - units.reduce((a, b) => a + b, 0);
  const order = exact.map((v, i) => ({ i, rest: v - Math.floor(v) })).sort((a, b) => b.rest - a.rest || a.i - b.i);
  for (const { i } of order) {
    if (left <= 0) break;
    units[i] += 1;
    left -= 1;
  }
  return { technical: units[0] * STEP, competency: units[1] * STEP, cv: units[2] * STEP, motivation: 0, curveball: 0 };
}

/** "Technical 50% · Skills 30% · Experience 20%": the mix as it will be sent. */
export function mixLine(mix: Mix): string {
  const parts: [string, number][] = [
    ["Technical", mix.technical],
    ["Skills", mix.competency],
    ["Experience", mix.cv],
    ["Motivation", mix.motivation],
    ["Situational", mix.curveball],
  ];
  return parts
    .filter(([, v]) => v > 0)
    .map(([label, v]) => `${label} ${v}%`)
    .join(" · ");
}

const FORMATS: Record<string, "in-person" | "video" | "phone"> = { "In person": "in-person", "Phone call": "phone", "Video call": "video" };
const MINUTES = [10, 20, 30, 45, 60];
const clip = (s: string, max: number) => s.trim().slice(0, max);

/**
 * The request that builds the interview, or null while something is missing.
 * Optional things the person left empty are left out: they are never given a
 * stand-in value.
 */
export function buildRequest(f: SetupForm) {
  if (setupProblems(f).length) return null;
  const mix = focusMix(f.focus);
  const difficulty = f.difficulty.toLowerCase();
  const stages = f.stages
    .filter((s) => s.name.trim())
    .map((s) => ({
      id: s.id,
      name: clip(s.name, 120),
      ...(s.date.trim() ? { date: s.date.trim() } : {}),
      ...(s.time.trim() ? { time: s.time.trim() } : {}),
      ...(s.format.trim() ? { format: s.format.trim() } : {}),
      ...(s.interviewer.trim() ? { interviewer: s.interviewer.trim() } : {}),
      ...(s.status.trim() ? { status: s.status.trim() } : {}),
    }));
  return {
    company: { name: clip(f.company, 80), ...(f.website.trim() ? { url: clip(f.website, 500) } : {}) },
    job: {
      title: clip(f.title, 120),
      ...(f.jobText.trim() ? { text: f.jobText.trim().slice(0, 25_000) } : {}),
      ...(f.jobUrl.trim() ? { url: clip(f.jobUrl, 500) } : {}),
      ...(f.jobLabel.trim() ? { label: clip(f.jobLabel, 200) } : {}),
    },
    cv: { text: f.cvText.trim().slice(0, 25_000), label: clip(f.cvLabel, 200) || "CV" },
    ...(f.coverText.trim() ? { coverLetter: { text: f.coverText.trim().slice(0, 25_000), label: clip(f.coverLabel, 200) || "Cover letter" } } : {}),
    format: FORMATS[f.stages[0]?.format ?? ""] ?? "video",
    settings: {
      difficulty: (["easy", "medium", "hard"].includes(difficulty) ? difficulty : "medium") as "easy" | "medium" | "hard",
      minutes: (MINUTES.includes(f.minutes) ? f.minutes : 30) as 10 | 20 | 30 | 45 | 60,
      preset: presetFor(mix),
      mix,
    },
    stages,
  };
}

/** How many of the ticked rounds are stages that still exist. */
export function roundsSelected(selected: string[], stages: { id: string }[]): string[] {
  return selected.filter((id, i) => selected.indexOf(id) === i && stages.some((s) => s.id === id));
}

/** Whether the form holds anything worth keeping as a draft. */
export function hasDraftContent(f: Pick<SetupForm, "company" | "title" | "website" | "jobText" | "jobUrl" | "cvText" | "coverText">): boolean {
  return [f.company, f.title, f.website, f.jobText, f.jobUrl, f.cvText, f.coverText].some((v) => v.trim().length > 0);
}

export { mixIsValid };
