import "server-only";
import { loadJson, saveJson } from "@/lib/storage/disk";
import { isMongoConfigured, loadFromMongo, saveToMongo } from "@/lib/storage/mongodb";
import { reportProblem } from "@/lib/alerts/store";

export interface SurveySubmission {
  id: string;
  at: string;
  interviewId?: string;
  mockId?: string;
  email: string;
  q1_realism: string;
  q2_questions: string;
  q3_feedback: string;
  q4_issues: string;
  q5_likes_dislikes: string;
  q6_changes: string;
  q7_recommend: string;
  userId?: string;
}

const FILE = "beta-surveys.json";
const KEEP = 1000;

const g = globalThis as unknown as { __hakkiriSurveys?: SurveySubmission[] };
const surveys = (g.__hakkiriSurveys ??= loadJson<SurveySubmission[]>(FILE, []));

export function recentSurveys(n = 50): readonly SurveySubmission[] {
  return [...surveys].sort((a, b) => b.at.localeCompare(a.at)).slice(0, n);
}

/** Loads persisted surveys from MongoDB Atlas (falling back to in-memory/disk). */
export async function recentSurveysAsync(n = 50): Promise<readonly SurveySubmission[]> {
  if (isMongoConfigured()) {
    try {
      const fromDb = await loadFromMongo<SurveySubmission[]>("storage", FILE);
      if (Array.isArray(fromDb) && fromDb.length) {
        const merged = new Map<string, SurveySubmission>();
        for (const item of fromDb) merged.set(item.id, item);
        for (const item of surveys) merged.set(item.id, item);
        const list = [...merged.values()].sort((a, b) => b.at.localeCompare(a.at));
        surveys.splice(0, surveys.length, ...list.slice(0, KEEP));
        return list.slice(0, n);
      }
    } catch (err) {
      console.warn("[surveys] mongo load error:", err instanceof Error ? err.message : err);
    }
  }
  return recentSurveys(n);
}

export async function addSurveySubmission(
  input: {
    interviewId?: string;
    mockId?: string;
    email: string;
    q1_realism: string;
    q2_questions: string;
    q3_feedback: string;
    q4_issues: string;
    q5_likes_dislikes: string;
    q6_changes: string;
    q7_recommend: string;
    userId?: string;
  },
  now = new Date(),
): Promise<SurveySubmission> {
  const s: SurveySubmission = {
    id: crypto.randomUUID(),
    at: now.toISOString(),
    interviewId: input.interviewId?.slice(0, 100),
    mockId: input.mockId?.slice(0, 100),
    email: input.email.trim().toLowerCase().slice(0, 200),
    q1_realism: input.q1_realism.trim().slice(0, 2000),
    q2_questions: input.q2_questions.trim().slice(0, 2000),
    q3_feedback: input.q3_feedback.trim().slice(0, 2000),
    q4_issues: input.q4_issues.trim().slice(0, 2000),
    q5_likes_dislikes: input.q5_likes_dislikes.trim().slice(0, 2000),
    q6_changes: input.q6_changes.trim().slice(0, 2000),
    q7_recommend: input.q7_recommend.trim().slice(0, 2000),
    userId: input.userId,
  };

  surveys.push(s);
  if (surveys.length > KEEP) surveys.splice(0, surveys.length - KEEP);
  saveJson(FILE, surveys);
  if (isMongoConfigured()) {
    await saveToMongo("storage", FILE, surveys);
  }

  // Notify team via alert channel so they can review and send the £15 Amazon voucher
  await reportProblem({
    source: "feedback",
    where: `Beta Survey (£15 Voucher) · ${s.email}`,
    message: [
      `🎁 New Full Interview Survey (£15 Amazon Voucher requested by ${s.email})`,
      `Interview: ${s.interviewId ?? "n/a"} | Session: ${s.mockId ?? "n/a"}`,
      `1. Realism: ${s.q1_realism}`,
      `2. Questions: ${s.q2_questions}`,
      `3. Feedback & Scores: ${s.q3_feedback}`,
      `4. Issues / Confusing: ${s.q4_issues}`,
      `5. Most / Least Liked: ${s.q5_likes_dislikes}`,
      `6. One Change: ${s.q6_changes}`,
      `7. Recommend: ${s.q7_recommend}`,
      `Voucher Email: ${s.email}`,
    ].join("\n\n"),
  });

  return s;
}

export function clearSurveys() {
  surveys.length = 0;
  saveJson(FILE, surveys);
}
