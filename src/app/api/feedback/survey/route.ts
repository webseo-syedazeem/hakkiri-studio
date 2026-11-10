import { NextResponse } from "next/server";
import { z } from "zod";
import { addSurveySubmission, recentSurveysAsync } from "@/lib/feedback/survey-store";
import { findMock, findMockAsync } from "@/lib/mocks/store";
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
  q5_likes_dislikes: z.string().trim().max(2000).optional().default(""),
  q6_changes: z.string().trim().max(2000).optional().default(""),
  q7_recommend: z.string().trim().min(1, "Please answer question 7").max(2000),
});

/** GET /api/feedback/survey: View recent surveys or export as CSV (?format=csv) */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const surveys = await recentSurveysAsync(200);

  if (searchParams.get("format") === "csv") {
    const headers = [
      "Submitted At",
      "Voucher Email",
      "Interview ID",
      "Session ID",
      "1. Realism",
      "2. Questions & Follow-ups",
      "3. Scores & Feedback",
      "4. Confusing or Broken",
      "5. Most & Least Liked",
      "6. One Change",
      "7. Recommend",
    ];

    const escapeCsv = (str: string) => `"${(str || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`;

    const rows = surveys.map((s) => [
      escapeCsv(s.at),
      escapeCsv(s.email),
      escapeCsv(s.interviewId || ""),
      escapeCsv(s.mockId || ""),
      escapeCsv(s.q1_realism),
      escapeCsv(s.q2_questions),
      escapeCsv(s.q3_feedback),
      escapeCsv(s.q4_issues),
      escapeCsv(s.q5_likes_dislikes),
      escapeCsv(s.q6_changes),
      escapeCsv(s.q7_recommend),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="hakkiri-beta-surveys.csv"',
      },
    });
  }

  return NextResponse.json({ count: surveys.length, surveys });
}

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

  // Validate that the session is a real full completed interview
  if (parsed.data.mockId) {
    const mock = (await findMockAsync(parsed.data.mockId)) ?? findMock(parsed.data.mockId);
    if (mock) {
      const isInterview = mock.kind === "interview" || mock.kind === "full";
      const isDone = mock.status === "done";
      const skippedByChoice = (mock.skipped ?? []).filter((s) => s.reason === "by-choice").length;
      const replaced = (mock.skipped ?? []).filter((s) => s.reason !== "by-choice").length;
      const answeredCount = mock.answerIds?.length ?? 0;
      const endedEarly = mock.planned > 0 && answeredCount < (mock.planned - replaced - skippedByChoice);

      if (!isInterview || !isDone || endedEarly || answeredCount < 2) {
        return NextResponse.json(
          {
            error: "full-interview-required",
            message: "The £15 Amazon voucher survey is only available after completing a full mock interview.",
          },
          { status: 403 },
        );
      }
    }
  }

  const submission = await addSurveySubmission(parsed.data);
  return NextResponse.json({ ok: true, id: submission.id });
}

