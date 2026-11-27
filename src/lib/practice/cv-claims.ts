import "server-only";
import type { CvDoc } from "@/lib/cv/schema";
import type { Interview, Question, QuestionGroup } from "@/lib/types";
import { type CvClaim, claimQuestionId, cvClaims, parseClaimQuestionId } from "@/lib/cv/claims";
import { getInterview, getInterviewAsync, saveInterview, saveInterviewAsync } from "@/lib/interviews/store";
import { styleFor, type SessionSettings } from "@/lib/interviews/settings";
import { createSession, listMocksAsync, rowsForAsync, saveMockAsync, type MockRecord } from "@/lib/mocks/store";

/**
 * Practising the questions a CV will get (design spec v3 §04). Each person has
 * one record for it (hidden from their interviews list) holding the claim
 * questions they've practised. A question's id names the CV, the claim and the
 * claim's exact wording, so a finished session marks that claim Practised —
 * and only while the line on the CV still says the same thing.
 */

export const CV_PRACTICE_ID = "gp-cv";

const plainText = (cv: CvDoc) =>
  [cv.contact.fullName, ...cv.sections.flatMap((s) => ("entries" in s ? s.entries.flatMap((e) => [[e.title, e.org].filter(Boolean).join(", "), ...e.bullets.filter((b) => b.visible).map((b) => `- ${b.text}`)]) : "text" in s ? [s.text] : []))].filter(Boolean).join("\n");

export async function startCvClaimPractice(cv: CvDoc, claimIds: string[] | null, userId: string): Promise<{ interview: Interview; session: MockRecord; claims: CvClaim[] }> {
  // Practise this on one line can name any claim on the CV, not just the top five.
  const all = cvClaims(cv, claimIds ? 200 : 5);
  const claims = claimIds ? all.filter((c) => claimIds.includes(c.id)) : all;
  if (!claims.length) throw new Error("no-claims");

  const existing = (await getInterviewAsync(CV_PRACTICE_ID, userId)) ?? getInterview(CV_PRACTICE_ID, userId);
  const empty: Record<QuestionGroup, number> = { motivation: 0, competency: 0, technical: 0, cv: 0, curveball: 0 };
  const past = (existing?.questions ?? []).filter((q) => !q.slot && !q.custom).map((q) => ({ ...q, retired: true })).slice(-300);
  const n = past.length;
  const fresh: Question[] = claims.map((c, i) => ({
    id: claimQuestionId(cv.id, c, n + i),
    group: "cv",
    type: "competency",
    focus: "experience",
    text: c.question,
    short: c.text.slice(0, 44),
    addedAt: new Date().toISOString(),
  }));
  const settings: SessionSettings = { difficulty: "medium", minutes: claims.length > 1 ? 10 : 10, preset: "custom", mix: { cv: 100, competency: 0, technical: 0, motivation: 0, curveball: 0 }, categoryWeights: { experience: 100 } };
  const interview: Interview = {
    ...(existing ?? {
      id: CV_PRACTICE_ID,
      userId,
      companyInitial: "C",
      round: "not-sure",
      groupScores: { ...empty },
      answersPractised: 0,
      likelyAsks: [],
      skills: [],
      createdAt: new Date().toISOString(),
    }),
    id: CV_PRACTICE_ID,
    userId,
    company: "Your CV",
    companyInitial: "C",
    role: cv.name,
    style: styleFor("medium"),
    interviewer: { name: "Sam", title: "Interviewer" },
    questions: [...past, ...fresh],
    groupCounts: { ...empty, cv: fresh.length },
    jobSummary: `Questions about the claims on ${cv.name}.`,
    understanding: {
      role: cv.name.slice(0, 80),
      level: "Mid-level",
      field: "The claims on your own CV",
      technicalLabel: "Role knowledge",
      meanings: { cv: "Explaining the numbers, decisions and results on your own CV.", competency: "Past examples behind your CV.", technical: "The work itself.", motivation: "Why this work.", curveball: "Fair follow-ups." },
    },
    settings,
    planBy: "templates",
    documents: { cv: plainText(cv), job: "Practice for the claims on the candidate’s own CV. Judge the answer on whether it backs up the claim quoted in the question with what the candidate did and how the result was measured." },
    general: { industry: "cv", profession: "" },
  };
  saveInterview(interview, userId);
  await saveInterviewAsync(interview, userId);
  const session = createSession({ interviewId: CV_PRACTICE_ID, kind: "interview", settings, questionIds: fresh.map((q) => q.id), spareIds: [], style: styleFor("medium") }, userId);
  await saveMockAsync(session, userId);
  return { interview, session, claims };
}

/** For each claim on this CV: "practised" when a finished session answered it with today's wording, "stale" when the wording has changed since. */
export async function practisedClaims(cv: CvDoc, userId: string): Promise<Record<string, { state: "practised" | "stale"; score: number }>> {
  const now = new Map(cvClaims(cv, 50).map((c) => [c.id, c.hash]));
  const out: Record<string, { state: "practised" | "stale"; score: number }> = {};
  for (const m of await listMocksAsync(CV_PRACTICE_ID, userId)) {
    if (m.userId !== userId) continue;
    for (const row of await rowsForAsync(m, userId)) {
      if (row.overall == null) continue;
      const p = parseClaimQuestionId(row.questionId);
      if (!p || p.cvId !== cv.id) continue;
      const hash = now.get(p.claimId);
      // Sessions come newest first: the latest answer for a claim is the one that counts.
      if (out[p.claimId]?.state === "practised") continue;
      if (hash === p.hash) out[p.claimId] = { state: "practised", score: row.overall };
      else if (hash && !out[p.claimId]) out[p.claimId] = { state: "stale", score: row.overall };
    }
  }
  return out;
}
