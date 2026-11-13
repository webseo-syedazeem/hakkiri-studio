import type { Difficulty, SessionSettings } from "@/lib/interviews/settings";

/**
 * Domain types for Hakkiri Studio.
 * These mirror the tables in the build plan ("Data, privacy and security"),
 * so the demo data used today can be swapped for the database later.
 */

export type QuestionGroup = "motivation" | "competency" | "technical" | "cv" | "curveball";

/** The context a question or moment is scored as (spec: Context-aware scoring). */
export type ContextType =
  | "tell-me-about-yourself"
  | "why-us"
  | "competency"
  | "technical"
  | "situational"
  | "questions-for-us"
  | "salary"
  | "pay-question"
  | "presentation-opening"
  | "presentation-qa";

export type InterviewRound = "screening" | "competency" | "technical" | "final" | "not-sure";
export type InterviewerStyle = "friendly" | "realistic" | "tough";

/** One transcribed word with its timing in seconds from the start of the answer. */
export interface Word {
  text: string;
  start: number;
  end: number;
  /** Set when speech-to-text or the model marks this word (or phrase) as a filler. */
  filler?: boolean;
}

export interface Question {
  id: string;
  group: QuestionGroup;
  text: string;
  /** A few words naming the question, e.g. "Changing the roadmap". */
  short: string;
  type: ContextType;
  /** Latest overall score for this question, if practised. */
  lastScore?: number;
  /** Added by you, rather than built from the job spec. */
  custom?: boolean;
  /** "Tell me about yourself" opens every interview; "What questions do you have for us?" closes it. Outside the mix. */
  slot?: "opening" | "closing";
  /** Set aside after a rebuild ("Something's wrong"): never asked again. */
  retired?: boolean;
  /** When it was added to the bank after set-up (ISO). */
  addedAt?: string;
  /** One of the four "Talking about pay" questions: only asked in that drill. */
  pay?: boolean;
  /** Built-in topic-drill questions: only asked in their matching topic drill. */
  drillOnly?: boolean;
  /** Difficulty tier this question is calibrated for ("easy" | "medium" | "hard"). */
  difficulty?: Difficulty;
}

/** The six kinds of follow-up in the spec ("Follow-up questions"). */
export type FollowUpKind = "ownership" | "result" | "challenge" | "technical" | "cv" | "clarify";

/** One follow-up the interviewer asked after an answer, with the reply to it. */
export interface FollowUp {
  kind: FollowUpKind;
  question: string;
  words: Word[];
  /**
   * Content: answered what was asked, with substance, consistent with the first answer.
   * Structure: the answer comes first. Both from the main model; delivery is measured in code.
   */
  scores: ScoreParts;
  /** A few words for "what tripped you" (e.g. "Back to “we” again"), or null when handled well. */
  tripped: string | null;
  note: { tone: "fix" | "strength"; title: string; body: string };
  /** The words the note points to. */
  highlight: Highlight | null;
}

export type InterviewFormat = "in-person" | "video" | "phone";

/** What Hakkiri found about the company, from its website and the job spec (the company briefing). */
export interface CompanyBrief {
  /** What the company does, in two sentences. */
  whatTheyDo: string;
  /** Links between your CV and this company or role, for "why us" answers. */
  whyYou: string[];
  /** Facts worth knowing: products, customers, values, news from their site. */
  toKnow: string[];
}

/**
 * What Hakkiri understood about the job, shown before you start so a misread
 * role can be fixed in one tap. Each category's meaning is written for this role
 * (for a sales job, Role knowledge is product, pricing, pipeline and objections).
 */
export interface RoleUnderstanding {
  /** e.g. "Account Executive" */
  role: string;
  /** e.g. "Mid-level" */
  level: string;
  /** What the work is, e.g. "selling business software to small firms". */
  field: string;
  /** "Technical" for technical jobs, "Role knowledge" for the rest. */
  technicalLabel: "Technical" | "Role knowledge";
  meanings: Record<QuestionGroup, string>;
}

export interface InterviewCustomStage {
  id?: string;
  name: string;
  date?: string;
  time?: string;
  format?: string;
  interviewer?: string;
  status?: string;
}

export interface Interview {
  id: string;
  company: string;
  companyInitial: string;
  /** The company's website, e.g. "halden.com". */
  companyUrl?: string;
  role: string;
  /** e.g. "Senior", "Mid-level", "Graduate". */
  seniority?: string;
  round: InterviewRound;
  format?: InterviewFormat;
  /** Custom interview stages configured for this role. */
  stages?: InterviewCustomStage[];
  /** ISO date-time of the real interview, if you added it. */
  date?: string;
  style: InterviewerStyle;
  interviewer: { name: string; title: string };
  /**
   * Group scores from practice before any answers recorded here (1–5).
   * 0 means not practised yet.
   */
  groupScores: Record<QuestionGroup, number>;
  /** How many likely questions are in each group of the plan. */
  groupCounts: Record<QuestionGroup, number>;
  questions: Question[];
  answersPractised: number;
  /** One sentence on what the job needs. */
  jobSummary: string;
  /** Key skills from the job spec. */
  skills: string[];
  /** CV claims or gaps the interviewer is likely to probe (fair game for follow-ups). */
  likelyAsks: string[];
  brief?: CompanyBrief | null;
  /** Stories from your CV and cover letter you can use in answers. */
  stories?: Story[];
  /** What the plan was built from, for the briefing (file names, links). */
  sources?: { cv?: string; coverLetter?: string; job?: string; company?: string };
  /** Built by the model from your documents, or from templates (no key). */
  planBy?: "model" | "templates" | "demo";
  /** The text it was built from, kept so the plan can be rebuilt. Private to you. */
  documents?: { cv: string; coverLetter?: string; job?: string; site?: string };
  /** Things set-up couldn't do (e.g. a link it couldn't read), shown once after set-up. */
  setupNotes?: string[];
  createdAt?: string;
  /** Difficulty, length and question mix for the next interview (the last ones you used). */
  settings?: SessionSettings;
  understanding?: RoleUnderstanding;
  /** Rules from your feedback ("No coding questions"), followed whenever questions are written. */
  rules?: string[];
  /** How many times the questions were rebuilt after "Something's wrong". */
  rebuilds?: number;
  /** What they're likely to probe on your CV, and how to handle it (for the prep sheet). */
  probes?: { ask: string; handle: string }[];
  /** Good questions to ask them at the end. */
  questionsToAsk?: string[];
  /** Skills the job needs that none of your stories covers yet, each with a question that tests it. */
  gaps?: { skill: string; question: string }[];
}

export interface CoachNote {
  id: number;
  tone: "fix" | "strength";
  title: string;
  body: string;
  /** Index of the word the note's pin follows. */
  pinAfter: number;
}

/** A marked span in the transcript: the late point or the strong line. */
export interface Highlight {
  kind: "late" | "good";
  from: number; // first word index
  to: number; // last word index, inclusive
}

export interface ScoreParts {
  content: number | null;
  structure: number | null;
  delivery: number | null;
}

export interface Answer {
  id: string;
  interviewId: string;
  questionId: string;
  questionNumber: number;
  questionsInMock: number;
  words: Word[];
  /** Index of the first word of the sentence that answers or decides. */
  pointWordIndex: number;
  highlights: Highlight[];
  notes: CoachNote[];
  /** Content and structure from the main model; delivery is calculated in code. */
  scores: ScoreParts;
  previousOverall?: number;
  strength: string;
  oneFix: string;
  strongerVersion: { start: number; text: string; highlight?: boolean }[];
  strongerLengthSec: number;
  /** Follow-ups asked after this answer, in order (at most two). */
  followUps: FollowUp[];
  /** When it was recorded (ISO). */
  createdAt?: string;
}

export interface Story {
  id: string;
  title: string;
  source: string;
  /** Which situation-task-action-result parts are solid. */
  parts: { situation: boolean; task: boolean; action: boolean; result: boolean };
  fits: number;
  /** Short names of the questions this story answers best, e.g. "Disagreeing with an engineer". */
  useFor?: string[];
  /** The story told in full, when you built it with the story builder. */
  text?: string;
  /** The skill it shows, when it was built for a gap. */
  skill?: string;
}

export interface User {
  id?: string;
  email?: string;
  firstName: string;
  lastName?: string;
  initials: string;
  trial: { interviewSecondsLeft: number; pitchSecondsLeft: number };
  tier?: "free" | "beta" | "job_search" | "monthly";
  createdAt?: string;
}
