import { devOr } from "@/lib/launch";
import "server-only";
import { randomUUID } from "node:crypto";
import type { Interview, InterviewFormat, Question, QuestionGroup, RoleUnderstanding } from "@/lib/types";
import { aiConfig } from "@/lib/ai/config";
import { ask } from "@/lib/ai/ask";
import { mockAiEnabled } from "@/lib/ai/mock";
import { bankCounts, buildPlanPrompt, checkPlan, INTERVIEWER_FOR_ROUND, PlanSchema, roundFor, type PlanInput } from "@/lib/ai/interview/build-plan";
import {
  buildNewQuestionsPrompt,
  buildReviewPrompt,
  buildRethinkPrompt,
  checkNewQuestions,
  checkReview,
  NewQuestionsSchema,
  RethinkSchema,
  ReviewSchema,
  WRONG_REASON_LABEL,
  type RethinkInput,
  type WrongReason,
} from "@/lib/ai/interview/questions";
import { GROUP_ORDER } from "@/lib/labels";
import { displayHost, readLink } from "./links";
import { closingQuestion, openingQuestion, templatePlan, templateQuestions, templateUnderstanding, toQuestions, type BuiltPlan } from "./plan";
import { saveInterview, updateInterview } from "./store";
import { settingsOr, type SessionSettings } from "./settings";

/**
 * Builds an interview from what you gave at set-up, and adds questions later:
 * for a new interview, a drill, or after "Something's wrong". With a Claude key
 * the main model writes them and the fast model checks each one fits the job;
 * without one (or in tests) the standard questions are used.
 */

export interface BuildInput {
  company: { name: string; url?: string; siteText?: string };
  job: { title: string; text?: string; url?: string; label?: string };
  cv: { text: string; label: string };
  coverLetter?: { text: string; label: string };
  date?: string;
  format: InterviewFormat;
  settings: SessionSettings;
}

export interface BuildResult {
  interview: Interview;
  /** Things worth telling you (e.g. a link that couldn't be read). */
  notes: string[];
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24) || "interview";

const useModel = () => !mockAiEnabled() && Boolean(aiConfig.anthropicKey);

const emptyCounts = (): Record<QuestionGroup, number> => ({ motivation: 0, competency: 0, technical: 0, cv: 0, curveball: 0 });

export function countGroups(questions: Question[]): Record<QuestionGroup, number> {
  const c = emptyCounts();
  for (const q of questions) if (!q.slot && !q.retired && !q.pay) c[q.group] += 1;
  return c;
}

/**
 * The relevance check (fast model): drops questions that don't fit the job
 * or break a rule, as long as each category keeps `keep` of its questions.
 * Never throws; if the check can't run, the questions stand.
 */
export async function reviewQuestions(questions: Question[], understanding: RoleUnderstanding, rules: string[], keep: Record<QuestionGroup, number>): Promise<{ kept: Question[]; dropped: { question: Question; reason: string }[] }> {
  if (!useModel() || questions.length === 0) return { kept: questions, dropped: [] };
  const { system, user } = buildReviewPrompt({ understanding, rules, questions });
  const reply = await ask({ model: aiConfig.fastModel, system, user, maxTokens: 600, temperature: 0, timeoutMs: 20_000, schema: ReviewSchema, check: (r) => checkReview(r, questions.length), label: "review-questions" });
  if (!reply) return { kept: questions, dropped: [] };
  const dropped: { question: Question; reason: string }[] = [];
  const left = countGroups(questions);
  for (const d of reply.drop) {
    const q = questions[d.index - 1];
    if (!q || dropped.some((x) => x.question === q) || left[q.group] <= keep[q.group]) continue;
    left[q.group] -= 1;
    dropped.push({ question: q, reason: d.reason });
  }
  if (dropped.length) console.info("[review-questions] replaced before you heard them:", dropped.map((d) => `${d.question.text} (${d.reason})`));
  return { kept: questions.filter((q) => !dropped.some((d) => d.question === q)), dropped };
}

export async function buildInterview(input: BuildInput): Promise<BuildResult> {
  const notes: string[] = [];
  let site = input.company.siteText?.trim() || "";
  if (!site && input.company.url) {
    const r = await readLink(input.company.url, "company");
    if (r.ok) site = r.text;
    else notes.push(`${displayHost(input.company.url)}: ${r.message}`);
  }
  let job = input.job.text?.trim() || "";
  if (!job && input.job.url) {
    const r = await readLink(input.job.url, "job");
    if (r.ok) job = r.text;
    else notes.push(`The job link: ${r.message}`);
  }

  const settings = input.settings;
  const counts = bankCounts(settings);
  const round = roundFor(settings.preset);
  const planInput: PlanInput = { company: input.company.name.trim(), role: input.job.title.trim(), difficulty: settings.difficulty, counts, cv: input.cv.text, coverLetter: input.coverLetter?.text, job, site };
  let plan: BuiltPlan | null = null;
  let planBy: Interview["planBy"] = "templates";
  if (useModel()) {
    const { system, user } = buildPlanPrompt(planInput);
    const reply = await ask({ model: aiConfig.mainModel, system, user, maxTokens: 7000, temperature: 0.3, timeoutMs: 120_000, schema: PlanSchema, check: (r) => checkPlan(r, planInput), label: "build-plan" });
    if (reply) {
      plan = reply;
      planBy = "model";
    } else notes.push("Claude couldn’t build your questions this time, so you have a standard set for now. Use “Something’s wrong” in the interview to rebuild them later.");
  } else if (!mockAiEnabled()) {
    notes.push(devOr("Add ANTHROPIC_API_KEY to .env.local to build questions from your CV and the job spec. For now you have a standard set.", "Your questions couldn’t be tailored this time, so you have a standard set for now. Use “Something’s wrong” in the interview to rebuild them later."));
  }
  plan ??= templatePlan({ company: planInput.company, role: planInput.role, counts, interviewerTitle: INTERVIEWER_FOR_ROUND[round], job, site });

  let questions = toQuestions(plan.questions, counts);
  // Spares cover anything the check drops: keep what the first interview needs.
  const firstNeeds = Object.fromEntries(GROUP_ORDER.map((g) => [g, Math.max(0, counts[g] - 2)])) as Record<QuestionGroup, number>;
  questions = (await reviewQuestions(questions, plan.understanding, [], firstNeeds)).kept;
  const bank = [openingQuestion(), ...questions, closingQuestion()];

  const company = input.company.name.trim() || plan.company;
  const interview: Interview = {
    id: `${slug(company)}-${randomUUID().slice(0, 4)}`,
    company,
    companyInitial: company.charAt(0).toUpperCase(),
    companyUrl: input.company.url ? displayHost(input.company.url) : undefined,
    role: input.job.title.trim() || plan.role || "The role",
    seniority: plan.seniority || plan.understanding.level || undefined,
    round,
    format: input.format,
    date: input.date,
    style: settings.difficulty === "easy" ? "friendly" : settings.difficulty === "hard" ? "tough" : "realistic",
    interviewer: { name: "Sam", title: plan.interviewerTitle || "hiring manager" },
    groupScores: emptyCounts(),
    groupCounts: countGroups(bank),
    questions: bank,
    answersPractised: 0,
    jobSummary: plan.jobSummary,
    skills: plan.skills,
    likelyAsks: plan.probes.map((p) => p.ask),
    probes: plan.probes,
    questionsToAsk: plan.questionsToAsk,
    brief: plan.brief.whatTheyDo || plan.brief.whyYou.length || plan.brief.toKnow.length ? plan.brief : null,
    stories: plan.stories.map((s, k) => ({ ...s, id: `s${k + 1}` })),
    gaps: plan.gaps,
    understanding: plan.understanding,
    settings,
    rules: [],
    rebuilds: 0,
    sources: {
      cv: input.cv.label,
      coverLetter: input.coverLetter?.label,
      job: input.job.label ?? (input.job.url ? displayHost(input.job.url) : job ? "Pasted job description" : undefined),
      company: input.company.url ? displayHost(input.company.url) : undefined,
    },
    planBy,
    documents: { cv: input.cv.text, coverLetter: input.coverLetter?.text, job: job || undefined, site: site || undefined },
    createdAt: new Date().toISOString(),
    setupNotes: notes,
  };
  saveInterview(interview);
  return { interview, notes };
}

/** The understanding to use for an interview saved before it had one. */
export function understandingOf(interview: Interview): RoleUnderstanding {
  return interview.understanding ?? templateUnderstanding({ company: interview.company, role: interview.role, skills: interview.skills });
}

/**
 * Adds `need` new questions per category to the bank (never one you've had,
 * following your rules), checks them, and saves the interview. With
 * `retireExcept`, every question not in that list (the ones you've had) is
 * set aside first: a rebuild after "Something's wrong".
 * Returns the updated interview and how many questions it couldn't find
 * (only possible without a key, when the standard set runs out).
 */
export async function addQuestions(interview: Interview, need: Partial<Record<QuestionGroup, number>>, opts: { retireExcept?: string[]; templatesOnly?: boolean } = {}): Promise<{ interview: Interview; added: Question[]; short: number }> {
  // Questions you added yourself live in their own store; the bank is the rest.
  let bank = interview.questions.filter((q) => !q.custom);
  if (opts.retireExcept) {
    const keep = new Set(opts.retireExcept);
    bank = bank.map((q) => (q.slot || q.pay || keep.has(q.id) ? q : { ...q, retired: true }));
  }
  const counts = { ...emptyCounts(), ...need } as Record<QuestionGroup, number>;
  const wanted = GROUP_ORDER.reduce((n, g) => n + counts[g], 0);
  if (wanted === 0 && !opts.retireExcept) return { interview, added: [], short: 0 };

  const understanding = understandingOf(interview);
  const rules = interview.rules ?? [];
  const avoid = bank.filter((q) => !q.slot && !q.pay).map((q) => q.text);
  let written: BuiltPlan["questions"] | null = null;
  if (useModel() && !opts.templatesOnly && wanted > 0 && interview.documents) {
    const settings = settingsOr(interview.settings, interview.style);
    // Ask for one spare per category, so the relevance check can drop one without leaving a gap.
    const asking = Object.fromEntries(GROUP_ORDER.map((g) => [g, counts[g] > 0 ? counts[g] + 1 : 0])) as Record<QuestionGroup, number>;
    const input = { company: interview.company, understanding, difficulty: settings.difficulty, counts: asking, rules, avoid, documents: interview.documents };
    const { system, user } = buildNewQuestionsPrompt(input);
    const reply = await ask({ model: aiConfig.mainModel, system, user, maxTokens: 3000, temperature: 0.5, timeoutMs: 90_000, schema: NewQuestionsSchema, check: (r) => checkNewQuestions(r, input), label: "new-questions" });
    written = reply?.questions ?? null;
  }
  written ??= GROUP_ORDER.flatMap((g) => templateQuestions(interview.company, interview.role, g, counts[g], avoid));

  const asking = Object.fromEntries(GROUP_ORDER.map((g) => [g, counts[g] > 0 ? counts[g] + 1 : 0])) as Record<QuestionGroup, number>;
  let fresh = toQuestions(written, asking, bank);
  fresh = (await reviewQuestions(fresh, understanding, rules, counts)).kept;
  // Keep only what was asked for.
  fresh = GROUP_ORDER.flatMap((g) => fresh.filter((q) => q.group === g).slice(0, counts[g]));
  const added = fresh.map((q) => ({ ...q, addedAt: new Date().toISOString() }));
  const opening = bank.filter((q) => q.slot === "opening");
  const closing = bank.filter((q) => q.slot === "closing");
  const middle = bank.filter((q) => !q.slot);
  const questions = [...(opening.length ? opening : [openingQuestion()]), ...middle, ...added, ...(closing.length ? closing : [closingQuestion()])];
  // The model call above can take a minute. Save only the questions, onto the interview as it
  // is now (rules, settings or retired flags may have changed meanwhile), and not at all if it
  // was deleted while we waited.
  const updated: Interview = updateInterview(interview.id, (now) => ({ ...now, questions, groupCounts: countGroups(questions) })) ?? { ...interview, questions, groupCounts: countGroups(questions) };
  const short = GROUP_ORDER.reduce((n, g) => n + Math.max(0, counts[g] - added.filter((q) => q.group === g).length), 0);
  return { interview: updated, added, short };
}

export interface RethinkResult {
  before: RoleUnderstanding;
  after: RoleUnderstanding;
  rules: string[];
  by: "model" | "rules";
}

/** Rule-based rules from what you picked and the questions you skipped, for when Claude isn't there. */
export function rulesFromFeedback(reasons: WrongReason[], note: string, skipped: string[]): string[] {
  const out: string[] = [];
  if (note.trim()) out.push(note.trim().replace(/\s+/g, " ").slice(0, 140));
  if (reasons.includes("not-true")) out.push("Only ask about things that are in the CV or the cover letter.");
  if (reasons.includes("wrong-kind") && skipped.length) out.push(`No questions like: “${skipped[0].slice(0, 90)}”`);
  if (!out.length && reasons.length) out.push(`The last questions were wrong: ${reasons.map((r) => WRONG_REASON_LABEL[r].toLowerCase()).join(", ")}.`);
  return out.slice(0, 4);
}

/** Rereads the job after "Something's wrong": a corrected understanding and rules for the next questions. */
export async function rethink(interview: Interview, feedback: { reasons: WrongReason[]; note: string; asked: string[]; skipped?: string[] }): Promise<RethinkResult> {
  const before = understandingOf(interview);
  if (useModel() && interview.documents) {
    const input: RethinkInput = { company: interview.company, understanding: before, reasons: feedback.reasons, note: feedback.note, asked: feedback.asked, rules: interview.rules ?? [], documents: interview.documents };
    const { system, user } = buildRethinkPrompt(input);
    const reply = await ask({ model: aiConfig.mainModel, system, user, maxTokens: 1500, temperature: 0.2, timeoutMs: 60_000, schema: RethinkSchema, check: () => [], label: "rethink" });
    if (reply) return { before, after: reply.understanding, rules: reply.rules, by: "model" };
  }
  return { before, after: before, rules: rulesFromFeedback(feedback.reasons, feedback.note, feedback.skipped ?? []), by: "rules" };
}
