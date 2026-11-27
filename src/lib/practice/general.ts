import "server-only";
import type { Interview, Question, QuestionGroup, RoleUnderstanding } from "@/lib/types";
import { getInterview, getInterviewAsync, saveInterview, saveInterviewAsync } from "@/lib/interviews/store";
import { styleFor, weightsToMix, type Difficulty, type FocusCategoryKey, type SessionMinutes, type SessionSettings } from "@/lib/interviews/settings";
import { toHundred, zeroWeights } from "@/lib/interviews/focus-detect";
import { createSession, saveMockAsync, type MockRecord } from "@/lib/mocks/store";
import { CATEGORY_ASSESSES, CATEGORY_NAME, CATEGORY_SLOT, planCategories, SECTORS, type CategoryKey, type IndustryKey } from "./catalogue";
import { profileText } from "./knowledge";
import { writeGeneralQuestions, type GeneralSpec } from "./generate";

/**
 * Starts a General practice session. Each person has one practice record per
 * industry (hidden from their interviews list). It holds every question
 * they've been asked in that industry, so nothing repeats across sessions,
 * and it carries the industry's knowledge profile, so answers are scored in
 * the industry's context.
 */

export interface GeneralRequest extends GeneralSpec {
  focus: "mix" | CategoryKey;
  duration: number;
}

/** The practice record's id for an industry. */
export const generalId = (industry: IndustryKey) => `gp-${industry}`;

/** Keeps a practice record from growing without end: this many past questions are remembered. */
const HISTORY = 300;

const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1)}…`);

function understandingFor(req: GeneralRequest): RoleUnderstanding {
  const name = SECTORS[req.industry].name;
  const where = req.profession ? `${req.profession} in ${name}` : name;
  return {
    role: clip(req.profession || "General practice", 80),
    level: req.difficulty === "hard" ? "Senior" : req.difficulty === "easy" ? "Junior" : "Mid-level",
    field: clip(where, 118),
    technicalLabel: req.industry === "technology" ? "Technical" : "Role knowledge",
    meanings: {
      cv: clip(`Previous responsibilities and experience relevant to ${where}.`, 158),
      competency: clip(`Past examples of behaviours valued in ${where}, plus strengths: what energises you and comes naturally.`, 158),
      technical: clip(`Knowledge, methods and real problems in ${where}.`, 158),
      motivation: clip(`Why ${name}: its purpose, challenges and your values in it.`, 158),
      curveball: clip(`Realistic situations and fair curveballs from ${where}.`, 158),
    },
  };
}

/** How each type in the session is assessed, so the scorer judges strengths answers without STAR, and so on. */
function assessmentNotes(plan: CategoryKey[]): string {
  return [...new Set(plan)].map((k) => `- ${CATEGORY_NAME[k]}: assesses ${CATEGORY_ASSESSES[k]}.`).join("\n");
}

function newRecord(req: GeneralRequest, userId: string): Interview {
  const name = SECTORS[req.industry].name;
  const empty: Record<QuestionGroup, number> = { motivation: 0, competency: 0, technical: 0, cv: 0, curveball: 0 };
  return {
    id: generalId(req.industry),
    userId,
    company: name,
    companyInitial: name.charAt(0).toUpperCase(),
    role: req.profession || "General practice",
    round: "not-sure",
    style: styleFor(req.difficulty),
    interviewer: { name: "Sam", title: `${name} interviewer` },
    groupScores: { ...empty },
    groupCounts: { ...empty },
    questions: [],
    answersPractised: 0,
    jobSummary: "",
    skills: [],
    likelyAsks: [],
    planBy: "templates",
    createdAt: new Date().toISOString(),
    general: { industry: req.industry, profession: req.profession },
  };
}

/** Plans the session and returns it, ready for the live screen. */
export async function startGeneralPractice(req: GeneralRequest, userId: string): Promise<{ interview: Interview; session: MockRecord; by: "model" | "bank" }> {
  const id = generalId(req.industry);
  const existing = (await getInterviewAsync(id, userId)) ?? getInterview(id, userId);
  const base = existing?.general ? existing : newRecord(req, userId);
  const history = base.questions.filter((q) => !q.slot && !q.custom).map((q) => q.text);

  const plan = planCategories(req.industry, req.focus, req.duration);
  // Two spares for skips, of the same types as the session.
  const spares: CategoryKey[] = [plan[0], plan[plan.length - 1]];
  const { questions: written, by } = await writeGeneralQuestions(req, [...plan, ...spares], history);
  if (!written.length) throw new Error("No questions could be found for these choices.");

  const stamp = Date.now().toString(36);
  const fresh: Question[] = written.map((q, i) => {
    const slot = CATEGORY_SLOT[q.category];
    return { id: `gp${stamp}${i}`, group: slot.group, type: slot.type, focus: slot.focus, text: q.text, short: q.short, difficulty: req.difficulty as Difficulty, addedAt: new Date().toISOString() };
  });
  // Earlier questions stay (set aside) so past answers still read and nothing repeats. The record is read again
  // here: writing can take a while, and another session may have been started meanwhile.
  const latest = getInterview(id, userId) ?? base;
  const past = latest.questions.filter((q) => !q.slot && !q.custom).map((q) => ({ ...q, retired: true })).slice(-HISTORY);
  const questions = [...past, ...fresh];

  const weights = zeroWeights();
  for (const k of plan) weights[CATEGORY_SLOT[k].focus as FocusCategoryKey] += 1;
  const categoryWeights = toHundred(weights);
  const settings: SessionSettings = {
    difficulty: req.difficulty,
    minutes: req.duration as SessionMinutes,
    preset: "custom",
    mix: weightsToMix(categoryWeights),
    categoryWeights,
  };
  const name = SECTORS[req.industry].name;
  const groupCounts: Record<QuestionGroup, number> = { motivation: 0, competency: 0, technical: 0, cv: 0, curveball: 0 };
  for (const q of fresh) groupCounts[q.group] += 1;

  const interview: Interview = {
    ...base,
    role: req.profession || "General practice",
    style: styleFor(req.difficulty),
    interviewer: { name: base.interviewer?.name || "Sam", title: req.profession ? `${req.profession} interviewer` : `${name} interviewer` },
    questions,
    groupCounts,
    jobSummary: clip(`General practice for ${req.profession ? `${req.profession} in ` : ""}${name}.`, 230),
    understanding: understandingFor(req),
    settings,
    planBy: by === "model" ? "model" : "templates",
    documents: {
      cv: "",
      job: `${profileText(req.industry, name, req.profession)}\n\nHow the questions in this session are assessed:\n${assessmentNotes(plan)}`,
    },
    general: { industry: req.industry, profession: req.profession },
  };
  saveInterview(interview, userId);
  await saveInterviewAsync(interview, userId);

  const sessionIds = fresh.slice(0, plan.length).map((q) => q.id);
  const spareIds = fresh.slice(plan.length).map((q) => q.id);
  const session = createSession({ interviewId: id, kind: "interview", settings, questionIds: sessionIds, spareIds, style: styleFor(req.difficulty) }, userId);
  await saveMockAsync(session, userId);
  return { interview, session, by };
}
