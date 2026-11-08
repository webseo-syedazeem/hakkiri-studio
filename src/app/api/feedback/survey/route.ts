import { NextResponse } from "next/server";
import { z } from "zod";
import { addSurveySubmission } from "@/lib/feedback/survey-store";
import { clientKey, rateLimited } from "@/lib/usage/limits";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().trim().email().max(200),
  interviewId: z.string().max(100).optional(),
  mockId: z.string().max(100).optional(),
  q1_realism: z.string().trim().min(1, "Please answer question 1").max(2000),
  q2_questions: z.string().trim().min(1, "Please answer question 2").max(2000),
  q3_feedback: z.string().trim().min(1, "Please answer question 3").max(2000),
  q4_issues: z.string().trim().min(1, "Please answer question 4").max(2000),
  q5_likes_dislikes: z.string().trim().min(1, "Please answer question 5").max(2000),
  q6_changes: z.string().trim().min(1, "Please answer question 6").max(2000),
  q7_recommend: z.string().trim().min(1, "Please answer question 7").max(2000),
});

/** POST /api/feedback/survey: 7-question survey with £15 Amazon voucher reward */
export async function POST(req: Request) {
  if (rateLimited(`survey:${clientKey(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "slow-down" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "bad-request", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const submission = await addSurveySubmission(parsed.data);
  return NextResponse.json({ ok: true, id: submission.id });
}
