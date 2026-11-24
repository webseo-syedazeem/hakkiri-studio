import { adminDenied } from "@/lib/auth/admin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { addSurveySubmission, recentSurveysAsync } from "@/lib/feedback/survey-store";
import { findMock, findMockAsync } from "@/lib/mocks/store";
import { clientKey, rateLimited } from "@/lib/usage/limits";
import { getCurrentUser } from "@/lib/auth/require";
import { accountOf, noteVoucherClaim } from "@/lib/auth/user-db";
import { readCapped } from "@/lib/http/body";

export const runtime = "nodejs";


const Body = z.object({
  email: z.string().trim().email().max(200),
  interviewId: z.string().max(100).optional(),
  mockId: z.string().min(1, "Completed mock interview session ID is required").max(100),
  q1_realism: z.string().trim().min(1, "Please answer question 1").max(2000),
  q2_questions: z.string().trim().min(1, "Please answer question 2").max(2000),
  q3_feedback: z.string().trim().min(1, "Please answer question 3").max(2000),
  q4_issues: z.string().trim().min(1, "Please answer question 4").max(2000),
  q5_likes_dislikes: z.string().trim().max(2000).optional().default(""),
  q6_changes: z.string().trim().max(2000).optional().default(""),
  q7_recommend: z.string().trim().min(1, "Please answer question 7").max(2000),
});

/** GET /api/feedback/survey: View recent surveys or export as CSV (?format=csv) - Protected by admin */
export async function GET(req: Request) {
  const denied = await adminDenied(req, { allowSecret: true });
  if (denied) return denied;

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

  // 1. Enforce user authentication
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { error: "unauthorised", message: "Sign in required to claim the £15 beta voucher reward." },
      { status: 401 }
    );
  }
  if (rateLimited(`survey:user:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "slow-down" }, { status: 429 });
  }

  const raw = await readCapped(req, 64_000).catch(() => "");
  if (raw === null) return NextResponse.json({ error: "too-large", message: "That is too long to send. Shorten your answers and try again." }, { status: 413 });
  let json: unknown = null;
  try {
    json = JSON.parse(raw);
  } catch {
    /* not JSON: fails the check below */
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "bad-request", details: parsed.error.issues },
      { status: 400 },
    );
  }

  // 2. Validate that the session is a real full completed interview belonging to this user
  // The session must be this person's own. Someone else's, or one that does not exist, is "not found".
  const mock = user.id ? ((await findMockAsync(parsed.data.mockId, user.id)) ?? findMock(parsed.data.mockId, user.id)) : undefined;
  if (!mock || mock.userId !== user.id) {
    return NextResponse.json(
      { error: "mock-not-found", message: "Interview session not found." },
      { status: 404 }
    );
  }

  // A full interview is one the server planned ("interview"), with its settings. A session the browser
  // reported by itself, from answers recorded one at a time, does not count towards the voucher.
  const isInterview = mock.kind === "interview" && !!mock.settings;
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

  // 3. Prevent duplicate submissions per session or email address
  const existingSurveys = await recentSurveysAsync(1000);
  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  // The account remembers that it has claimed, so deleting your data (which removes the survey answers
  // and the address you gave) doesn't open a second claim.
  const account = await accountOf(user.id);
  const alreadyClaimed =
    !!account?.voucherClaimedAt ||
    existingSurveys.some(
      (s) =>
        s.userId === user.id ||
        s.mockId === parsed.data.mockId ||
        s.email.toLowerCase().trim() === normalizedEmail ||
        (user.email && s.email.toLowerCase().trim() === user.email.toLowerCase().trim())
    );

  if (alreadyClaimed) {
    return NextResponse.json(
      {
        error: "already-claimed",
        message: "A £15 voucher claim has already been submitted for this session or email address.",
      },
      { status: 409 }
    );
  }

  const submission = await addSurveySubmission({ ...parsed.data, userId: user.id });
  await noteVoucherClaim(user.id);
  return NextResponse.json({ ok: true, id: submission.id });
}

