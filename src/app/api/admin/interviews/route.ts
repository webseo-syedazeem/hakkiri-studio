import { NextResponse } from "next/server";
import { listInterviewsAsync } from "@/lib/interviews/store";
import { londonToday } from "@/lib/dates";
import { getCurrentUser } from "@/lib/auth/require";

export const runtime = "nodejs";

/**
 * GET /api/admin/interviews:
 * Lists the interviews users have set up (company, job role, format, AI-generated questions).
 * Excludes candidate answers, audio recordings, and transcripts to strictly safeguard privacy.
 * Supports ?format=csv for 1-click spreadsheet export.
 * Protected by admin authorization.
 */
export async function GET(req: Request) {
  // Allow test environment to run or verify admin session / token
  const isTest = process.env.NODE_ENV === "test";
  if (!isTest) {
    const user = await getCurrentUser();
    const authHeader = req.headers.get("authorization");
    const adminSecret = process.env.ADMIN_SECRET_KEY || process.env.AUTH_SECRET;
    const isSecretValid = adminSecret && authHeader === `Bearer ${adminSecret}`;
    const userEmail = user?.email?.toLowerCase() ?? "";
    const isAdminUser = Boolean(
      userEmail &&
        process.env.ADMIN_EMAILS &&
        process.env.ADMIN_EMAILS.split(",")
          .map((e) => e.trim().toLowerCase())
          .includes(userEmail)
    );

    if (!isSecretValid && !isAdminUser) {
      return NextResponse.json(
        { error: "unauthorised", message: "Admin access required to view aggregated interviews." },
        { status: 403 }
      );
    }
  }

  const { searchParams } = new URL(req.url);
  const interviews = await listInterviewsAsync(londonToday());

  const sanitized = interviews.map((i) => ({
    id: i.id,
    company: i.company,
    role: i.role,
    seniority: i.seniority || "",
    format: i.format || "video",
    date: i.date || null,
    createdAt: i.createdAt || null,
    jobSummary: i.jobSummary || "",
    questionCount: i.questions?.length || 0,
    questions: (i.questions || []).map((q) => ({
      id: q.id,
      group: q.group,
      short: q.short,
      text: q.text,
      type: q.type,
      slot: q.slot || null,
    })),
  }));

  if (searchParams.get("format") === "csv") {
    const headers = [
      "Interview ID",
      "Company",
      "Job Title / Role",
      "Seniority",
      "Format",
      "Created Date",
      "Interview Date",
      "Question Number",
      "Question Category",
      "Question Title",
      "AI Question Prompt",
    ];

    const escapeCsv = (str: string | number | null | undefined) =>
      `"${String(str ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;

    const rows: string[] = [];
    for (const interview of sanitized) {
      if (!interview.questions.length) {
        rows.push(
          [
            escapeCsv(interview.id),
            escapeCsv(interview.company),
            escapeCsv(interview.role),
            escapeCsv(interview.seniority),
            escapeCsv(interview.format),
            escapeCsv(interview.createdAt),
            escapeCsv(interview.date),
            escapeCsv(""),
            escapeCsv(""),
            escapeCsv(""),
            escapeCsv(""),
          ].join(","),
        );
      } else {
        interview.questions.forEach((q, idx) => {
          rows.push(
            [
              escapeCsv(interview.id),
              escapeCsv(interview.company),
              escapeCsv(interview.role),
              escapeCsv(interview.seniority),
              escapeCsv(interview.format),
              escapeCsv(interview.createdAt),
              escapeCsv(interview.date),
              escapeCsv(idx + 1),
              escapeCsv(q.group),
              escapeCsv(q.short),
              escapeCsv(q.text),
            ].join(","),
          );
        });
      }
    }

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="hakkiri-interviews-and-questions.csv"',
      },
    });
  }

  return NextResponse.json({
    count: sanitized.length,
    interviews: sanitized,
  });
}
