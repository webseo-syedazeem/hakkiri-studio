import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Icon, Panel } from "@/components/ui";
import { InterviewTabs } from "@/components/interview/InterviewTabs";
import { PrintButton } from "@/components/interview/PrintButton";
import { StartButton } from "@/components/interview/StartSession";
import { PrepChecklist } from "@/components/interview/PrepChecklist";
import { getInterview } from "@/lib/interviews/store";
import { buildPrepSheet } from "@/lib/interviews/prep";
import { settingsOr } from "@/lib/interviews/settings";
import { findAnswer, listAnswers } from "@/lib/answers/store";
import { doneSessions, isFresh, rowsFor } from "@/lib/mocks/store";
import { buildReport } from "@/lib/mocks/report";
import { interviewWhen } from "@/lib/sessions/labels";
import { londonToday } from "@/lib/dates";
import type { Answer } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PrepSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const interview = getInterview(id);
  if (!interview) notFound();
  const micOk = (await cookies()).get("hk_mic_ok")?.value === "1";
  const sessions = doneSessions(interview.id);
  const fresh = sessions.filter(isFresh);
  const when = interviewWhen(interview.date, londonToday());

  // Aggregate answers
  const byId = new Map<string, Answer>();
  for (const a of listAnswers(interview.id)) byId.set(a.id, a);
  for (const m of sessions)
    for (const aid of m.answerIds)
      if (!byId.has(aid)) {
        const a = findAnswer(aid);
        if (a) byId.set(aid, a);
      }
  const latest = fresh[0];
  const latestRows = latest ? rowsFor(latest) : [];
  const fixes = latest ? buildReport(latestRows, interview.interviewer.name).fixes : [];
  const sheet = buildPrepSheet(interview, {
    answers: [...byId.values()],
    interviews: fresh.length,
    fixes,
    rows: latestRows,
  });

  const roleTitle = interview.role || "Senior Product Manager, Payments";
  const companyName = interview.company || "Halden";
  const stageName =
    (interview.round as string) === "hiring-manager"
      ? "Stage 2: Hiring manager interview"
      : interview.round
        ? `Stage: ${interview.round}`
        : "Stage 2: Hiring manager interview";

  // Dynamic knowledge checklist items
  const hasQ = (qid: string) => interview.questions.some((q) => q.id === qid);
  const checklistItems = [
    {
      id: "chk-1",
      title: "Payment fundamentals",
      description: "Authorisation, checkout, settlement, chargebacks and fraud controls.",
      drillHref: `/mock/${interview.id}?topic=payment-fundamentals`,
    },
    {
      id: "chk-2",
      title: "Product metrics",
      description: "Conversion, payment success rate, transaction failures and fraud losses.",
      drillHref: `/mock/${interview.id}?topic=product-metrics`,
    },
    {
      id: "chk-3",
      title: "Commercial judgement",
      description: "Balancing growth with risk, cost, regulation and customer experience.",
      drillHref: `/mock/${interview.id}?topic=commercial-judgement`,
    },
    {
      id: "chk-4",
      title: "Stakeholder management",
      description: "Working with engineering, compliance, operations and commercial teams.",
      drillHref: `/mock/${interview.id}?topic=stakeholder-management`,
    },
  ];

  return (
    <div className="flex grow flex-col pb-12">
      {/* Top Header */}
      <div className="animate-rise">
        <Link
          href="/interviews"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors mb-3"
        >
          <Icon name="back" size={12} />
          <span>Interviews</span>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-900/40 text-[19px] font-bold text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              {interview.companyInitial || companyName[0] || "H"}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-white">
                {roleTitle}
              </h1>
              <div className="mt-0.5 text-xs text-muted flex flex-wrap items-center gap-2">
                <span>{companyName}</span>
                <span>·</span>
                <span>{stageName}</span>
                <span>·</span>
                <span>
                  {when.text}{" "}
                  {when.rel && when.rel !== "done" && (
                    <b className="font-semibold text-ink">({when.rel})</b>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <PrintButton />
            <StartButton
              interviewId={interview.id}
              micOk={micOk}
              body={{
                kind: "interview",
                settings: settingsOr(interview.settings, interview.style),
              }}
              variant="primary"
              size="md"
              buttonClassName="px-4 py-2 rounded-xl text-xs flex items-center gap-2 group shadow-[0_4px_20px_rgba(79,82,248,0.35)] hover:shadow-[0_6px_26px_rgba(79,82,248,0.6)]"
            >
              <Icon name="play" size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              <span>Practise this interview</span>
            </StartButton>
          </div>
        </div>

        {/* Tabs */}
        <InterviewTabs id={interview.id} current="prep" />
        <p className="mt-4 text-xs text-muted">
          A personalised preparation plan for your upcoming interview, based on the job, your experience and previous practice.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 animate-rise [animation-delay:0.05s]">
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="space-y-5">
          {/* Card 1: The company and the role */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-fill/15 text-blue-soft border border-blue-fill/25">
                <Icon name="brief" size={16} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white">The company and the role</h2>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {sheet.company.whatTheyDo ||
                    `${companyName} makes payments software for small businesses, helping them take payments, manage risk and grow revenue.`}
                </p>
              </div>
            </div>

            <div className="border-t border-line/60 pt-3">
              <h3 className="text-xs font-bold text-ink mb-2">What matters most for this role</h3>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2 text-muted">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <b className="text-ink">Product judgement</b> — Balance conversion, fraud and risk when making decisions.
                  </div>
                </li>
                <li className="flex items-start gap-2 text-muted">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <b className="text-ink">Impact</b> — Drive measurable improvements in key payments metrics.
                  </div>
                </li>
                <li className="flex items-start gap-2 text-muted">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <b className="text-ink">Collaboration</b> — Work closely with engineering, risk and commercial teams.
                  </div>
                </li>
                <li className="flex items-start gap-2 text-muted">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <b className="text-ink">Ownership</b> — Define problems, prioritise solutions and see them through.
                  </div>
                </li>
              </ul>
            </div>
          </Panel>

          {/* Card 2: Your preparation priorities */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/25">
                <Icon name="target" size={16} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white">Your preparation priorities</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Based on your previous answers and the role requirements.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Priority 1 */}
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-fill/25 text-blue-soft text-xs font-bold border border-blue-fill/30">
                  1
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">Strengthen your commercial judgement</span>
                    <span className="rounded bg-[#f59e0b]/20 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-[#fbbf24] border border-[#f59e0b]/40">
                      Priority
                    </span>
                  </div>
                  <p className="text-muted leading-relaxed">
                    This role involves balancing conversion, fraud and risk. Prepare an example where you evaluated competing outcomes and made a product decision.
                  </p>
                  <p className="text-muted leading-relaxed text-[11px] pt-0.5">
                    <span className="font-semibold text-blue-soft">Your evidence:</span> The first-payment completion improvement from 41% to 58%. Explain the trade-offs considered and how you measured success.
                  </p>
                </div>
              </div>

              {/* Priority 2 */}
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-fill/25 text-blue-soft text-xs font-bold border border-blue-fill/30">
                  2
                </span>
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-ink">Make your personal contribution clearer</span>
                  <p className="text-muted leading-relaxed">
                    Your roadmap example explains what the team did, but needs to distinguish your decisions from the team&apos;s delivery. Be specific about what you recommended, who you influenced and the result.
                  </p>
                </div>
              </div>

              {/* Priority 3 */}
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-fill/25 text-blue-soft text-xs font-bold border border-blue-fill/30">
                  3
                </span>
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-ink">Prepare for questions about career transitions</span>
                  <p className="text-muted leading-relaxed">
                    An interviewer may ask about your eight months at Fernway or your move from design into product. Prepare a concise explanation that connects each move to your development.
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          {/* Card 3: Your best answers */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25">
                <Icon name="sparkle" size={16} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white">Your best answers</h2>
                <p className="mt-0.5 text-xs text-muted">
                  How your key examples are working and how to make them stronger.
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-xl bg-panel-2 p-3.5 border border-line space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span>Roadmap change (Fernway)</span>
                <Icon name="chevronRight" size={14} className="text-muted" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 shrink-0 border border-emerald-500/30">
                    ✓ What&apos;s strong
                  </span>
                  <span className="text-muted text-[11px] leading-relaxed">
                    Clearly explains the context, decision and outcome.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="rounded bg-blue-fill/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-soft shrink-0 border border-blue-fill/30">
                    ↑ How to improve
                  </span>
                  <span className="text-muted text-[11px] leading-relaxed">
                    Make your personal role and the trade-offs you evaluated more explicit.
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="space-y-5">
          {/* Card 4: Likely questions and how to approach them */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-fill/15 text-blue-soft border border-blue-fill/25">
                <Icon name="chat" size={16} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white">Likely questions and how to approach them</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Key questions for this stage, with guidance on what a strong answer should include.
                </p>
              </div>
            </div>

            <div className="mt-2 divide-y divide-line/60">
              <div className="grid grid-cols-[1.2fr_1.8fr] gap-3 pb-2 text-[11px] font-semibold text-muted uppercase tracking-wider">
                <span>Likely question</span>
                <span>How to approach it</span>
              </div>

              {/* Row 1 */}
              <Link
                href={`/mock/${interview.id}?topic=commercial-judgement`}
                className="grid grid-cols-[1.2fr_1.8fr] gap-3 py-3 items-start text-xs group hover:bg-white/[0.02] rounded-lg transition-colors px-1"
              >
                <span className="font-semibold text-ink group-hover:text-blue-soft transition-colors">
                  How would you balance conversion and fraud risk?
                </span>
                <div className="flex items-start justify-between gap-2 text-muted leading-relaxed text-[11px]">
                  <span>
                    Explain how you assess customer impact, fraud losses and trade-offs, including guardrails (e.g. risk thresholds) and when to escalate.
                  </span>
                  <Icon name="chevronRight" size={13} className="shrink-0 text-dim mt-0.5 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              {/* Row 2 */}
              <Link
                href={hasQ("c1") ? `/mock/${interview.id}?q=c1` : `/mock/${interview.id}?topic=star`}
                className="grid grid-cols-[1.2fr_1.8fr] gap-3 py-3 items-start text-xs group hover:bg-white/[0.02] rounded-lg transition-colors px-1"
              >
                <span className="font-semibold text-ink group-hover:text-blue-soft transition-colors">
                  Tell me about a time you changed a roadmap.
                </span>
                <div className="flex items-start justify-between gap-2 text-muted leading-relaxed text-[11px]">
                  <span>
                    Cover the original assumption, evidence that challenged it, options considered, stakeholders influenced and the measurable outcome.
                  </span>
                  <Icon name="chevronRight" size={13} className="shrink-0 text-dim mt-0.5 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              {/* Row 3 */}
              <Link
                href={`/mock/${interview.id}?topic=stakeholder-management`}
                className="grid grid-cols-[1.2fr_1.8fr] gap-3 py-3 items-start text-xs group hover:bg-white/[0.02] rounded-lg transition-colors px-1"
              >
                <span className="font-semibold text-ink group-hover:text-blue-soft transition-colors">
                  How do you influence engineers who disagree?
                </span>
                <div className="flex items-start justify-between gap-2 text-muted leading-relaxed text-[11px]">
                  <span>
                    Give a real example of disagreement, how you built alignment and the result. Show respect for different perspectives.
                  </span>
                  <Icon name="chevronRight" size={13} className="shrink-0 text-dim mt-0.5 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            </div>
          </Panel>

          {/* Card 5: Be ready for follow-up questions */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                <Icon name="chat" size={16} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white">Be ready for follow-up questions</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Example follow-ups based on your experience.
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-xl bg-panel-2 p-4 border border-line space-y-2.5">
              <div className="text-xs font-bold text-ink">
                Your example: Growing checkout conversion by 17%
              </div>
              <div className="text-xs text-muted space-y-1">
                <p className="font-medium text-dim">An interviewer might ask:</p>
                <ul className="space-y-1 pl-1 text-[11px]">
                  <li>• How do you know your changes caused the improvement?</li>
                  <li>• What other solutions did you consider?</li>
                  <li>• What was your personal contribution?</li>
                  <li>• What would you do differently?</li>
                </ul>
              </div>
            </div>
          </Panel>

          {/* Card 6: Role-specific knowledge checklist */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/25">
                <Icon name="layers" size={16} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white">Role-specific knowledge checklist</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Key areas to be confident in for a {roleTitle} role.
                </p>
              </div>
            </div>

            <div className="mt-2">
              <PrepChecklist items={checklistItems} interviewId={interview.id} />
            </div>
          </Panel>

          {/* Card 7: Questions to ask the interviewer */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                <Icon name="target" size={16} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white">Questions to ask the interviewer</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Thoughtful questions that show your judgement and help you learn more.
                </p>
              </div>
            </div>

            <ul className="mt-2 space-y-2 text-xs text-muted pl-1">
              <li className="flex items-start gap-2">
                <span className="text-dim">•</span>
                <span>What are the biggest payment challenges you&apos;re looking to solve in the next 6–12 months?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-dim">•</span>
                <span>How do you think about the trade-off between growth and risk at {companyName}?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-dim">•</span>
                <span>What would success look like in this role after the first 3–6 months?</span>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
