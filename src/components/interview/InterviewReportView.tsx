"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon, CustomSelect, type IconName } from "@/components/ui";
import { StartButton } from "@/components/interview/StartSession";
import { BetaInterviewFeedbackModal } from "@/components/feedback/BetaInterviewFeedbackModal";
import { PrintButton } from "@/components/interview/PrintButton";
import { TestModeNotice } from "@/components/shell/TestModeNotice";
import { countsLine, type MockReport, type MockRow } from "@/lib/mocks/report";
import { GROUP_LABEL, categoryLines, reportHeadline, reportSummary, rowFeedback, takeaways, type CategoryLine } from "@/lib/mocks/report-lines";
import type { DrillSuggestion } from "@/lib/sessions/drills";
import type { Interview } from "@/lib/types";
import type { MockRecord } from "@/lib/mocks/store";

interface InterviewReportViewProps {
  interview: Interview;
  mock: MockRecord;
  rows: MockRow[];
  report: MockReport;
  whenFormatted: string;
  /** How long the session ran. Empty when it wasn't recorded. */
  durationFormatted: string;
  /** The session's own practice settings ("Hard · 20 min · Balanced"). Empty when it has none. */
  difficultyFormatted: string;
  isFullInterview: boolean;
  endedEarly: boolean;
  micOk: boolean;
  /** Practice suggested from this session's answers, by rule. Empty when nothing is suggested. */
  drills: (DrillSuggestion & { done: boolean })[];
  /** Questions that were skipped or replaced, with the reason given. */
  skipped: { question: string; reason: string }[];
  /** The app is running on stand-in AI: the scores were not worked out from what was said. */
  testMode?: boolean;
}

const CATEGORY_ICON: Record<CategoryLine["key"], IconName> = { cv: "brief", competency: "layers", technical: "code", motivation: "user", curveball: "chat", "opening-close": "sparkle" };

function getPlaybooks(role?: string, company?: string) {
  const roleName = role || "the role";
  const orgName = company || "your team";

  return [
    {
      id: "tell-me-about-yourself",
      label: "Tell me about yourself",
      title: "Tell me about yourself",
      summary: "A short, relevant summary of your background, key experience and why it's relevant to this role.",
      structure: [
        { step: 1, name: "Present", detail: "A brief overview (who you are and your current role)." },
        { step: 2, name: "Past", detail: "Key experience and achievements (with impact)." },
        { step: 3, name: "Present", detail: "Where you are now and your current focus." },
        { step: 4, name: "Future", detail: "Why this role is a good next step." },
      ],
      example:
        `“I'm an experienced ${roleName}... I've recently focused on delivering user-centred outcomes, managing cross-functional delivery, and I'm now looking to build on that at ${orgName} because of your team's mission and standards.”`,
    },
    {
      id: "why-this-role",
      label: "Why this role?",
      title: "Why this role, and why now?",
      summary: "Show genuine motivation, understanding of the company's trajectory, and how this fits your career path.",
      structure: [
        { step: 1, name: "The Hook", detail: "What specifically excites you about the company's product or mission." },
        { step: 2, name: "The Fit", detail: "How your particular skills directly solve problems they face today." },
        { step: 3, name: "The Timing", detail: "Why this stage of growth matches your career progression." },
      ],
      example:
        `“I've followed ${orgName}'s work closely. In my previous role, solving complex user and operational challenges gave me firsthand insight into key pain points, which aligns directly with the roadmap for this ${roleName} position.”`,
    },
    {
      id: "star",
      label: "A time you... (STAR)",
      title: "Competency & behavioral questions",
      summary: "Use the STAR framework to clearly structure complex stories without rambling.",
      structure: [
        { step: 1, name: "Situation", detail: "Brief context and scope (keep to 20% of the time)." },
        { step: 2, name: "Task", detail: "The specific challenge and your personal responsibility." },
        { step: 3, name: "Action", detail: "The explicit decisions, trade-offs, and actions you took." },
        { step: 4, name: "Result", detail: "Measurable metrics and what you learned." },
      ],
      example:
        "“When operational metrics dropped post-release, I audited the process end-to-end, isolated the root cause, and implemented an improved workflow within 48 hours, recovering 95% service efficiency.”",
    },
    {
      id: "technical-problem",
      label: "A technical problem",
      title: "Technical deep-dives",
      summary: "Demonstrate trade-off evaluation, architecture grasp, and cross-functional engineering empathy.",
      structure: [
        { step: 1, name: "Problem Definition", detail: "The constraint, risk, or scale ceiling encountered." },
        { step: 2, name: "Options Considered", detail: "Pros and cons of at least two alternative architectures." },
        { step: 3, name: "Decision & Delivery", detail: "Why the chosen path won and how you phased rollout." },
      ],
      example:
        "“We evaluated trade-offs between rapid delivery and long-term architectural stability. I recommended a phased component migration that preserved performance without compromising critical delivery deadlines.”",
    },
    {
      id: "prioritisation",
      label: "Prioritisation",
      title: "Prioritisation & roadmap trade-offs",
      summary: "Prove you can balance commercial upside, technical debt, and team capacity objectively.",
      structure: [
        { step: 1, name: "Framework", detail: "State the decision criteria (e.g. RICE, risk vs revenue)." },
        { step: 2, name: "Data & Inputs", detail: "Customer feedback, analytics, and engineering estimates used." },
        { step: 3, name: "Outcome", detail: "What you chose NOT to build and why stakeholders agreed." },
      ],
      example:
        "“When stakeholders requested conflicting scope changes during a key delivery phase, I evaluated impact against core strategic objectives and agreed on a phased roadmap that protected quality and deadlines.”",
    },
    {
      id: "other-questions",
      label: "Other questions",
      title: "Handling curveballs & questions for them",
      summary: "Stay composed, ask clarifying questions, and close with thoughtful questions that demonstrate curiosity.",
      structure: [
        { step: 1, name: "Clarify", detail: "Take a beat, confirm the core problem or constraint." },
        { step: 2, name: "First-Principle Logic", detail: "Walk through your mental model step-by-step out loud." },
        { step: 3, name: "Inquire Back", detail: "Ask about internal team dynamics, metrics, and trade-offs." },
      ],
      example:
        `“What does success look like for this ${roleName} role in the first six months, and where do you see the biggest opportunities for impact at ${orgName} today?”`,
    },
  ];
}

export function InterviewReportView(p: InterviewReportViewProps) {
  const { interview, mock, rows, report } = p;
  const [activeTab, setActiveTab] = useState<"review" | "details">("review");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedAll, setExpandedAll] = useState(false);
  const [activePlaybookId, setActivePlaybookId] = useState("tell-me-about-yourself");
  const [selectedFramework, setSelectedFramework] = useState<"star" | "prep" | "other" | null>(null);

  // Every figure below is this session's own. With nothing scored, the gauge is empty and says "Not scored".
  const scorePercent = report.score != null ? Math.min(100, Math.round((report.score / 5) * 100)) : 0;
  const categories = useMemo(() => categoryLines(report), [report]);
  const filterOptions = useMemo(
    () => [{ value: "all", label: "All categories" }, ...Array.from(new Set(rows.map((r) => r.group))).map((g) => ({ value: g as string, label: GROUP_LABEL[g] ?? g }))],
    [rows],
  );

  const playbooks = useMemo(() => getPlaybooks(interview.role, interview.company), [interview.role, interview.company]);
  const activePlaybook = playbooks.find((x) => x.id === activePlaybookId) ?? playbooks[0];

  const filteredRows = rows.filter((r) => {
    if (categoryFilter === "all") return true;
    return r.group === categoryFilter;
  });

  const visibleRows = expandedAll ? filteredRows : filteredRows.slice(0, 3);


  return (
    <div className="flex flex-col gap-6 w-full pb-20 animate-rise">
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-white/[0.08] pb-5">
        <div>
          {/* Breadcrumb */}
          <Link
            href={`/interviews/${interview.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-white transition-colors"
          >
            <Icon name="back" size={13} />
            <span>Interviews</span>
            <span className="text-white/20">/</span>
            <span className="text-[#c9cad3]">{interview.role}</span>
          </Link>

          <h1 className="mt-2 text-[32px] font-bold tracking-tight text-white">Interview report</h1>

          {/* Meta line */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              <Icon name="cal" size={13} className="text-muted" />
              {p.whenFormatted}
            </span>
            <span className="text-white/20">·</span>
            <span>{countsLine(report.questionCount, report.followUpCount)}</span>
            {p.difficultyFormatted ? (
              <>
                <span className="text-white/20">·</span>
                <span>{p.difficultyFormatted}</span>
              </>
            ) : null}
            {p.durationFormatted ? (
              <>
                <span className="text-white/20">·</span>
                <span>{p.durationFormatted}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <StartButton
            interviewId={interview.id}
            micOk={p.micOk}
            size="sm"
            body={{ kind: "rerun", sessionId: mock.id }}
            className="bg-[#141326] border border-white/10 hover:border-white/25 text-white flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
          >
            <Icon name="repeat" size={14} />
            <span>Run it again</span>
          </StartButton>

          <PrintButton label="Print or save as PDF" />

          <Link
            href={`/interviews/${interview.id}`}
            className="pro-btn-glow bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Icon name="diamond" size={14} />
            <span>Back to your training</span>
          </Link>
        </div>
      </header>

      {/* Beta Voucher Banner */}
      <BetaInterviewFeedbackModal
        interviewId={interview.id}
        mockId={mock.id}
        company={interview.company}
        role={interview.role}
        isEligible={p.isFullInterview}
        ineligibleReason={p.endedEarly ? "ended-early" : "not-full-interview"}
      />

      {p.testMode && <TestModeNotice what="The scores and feedback in this report" />}

      {/* 2. HERO SUMMARY CARD */}
      <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 lg:p-7 shadow-xl grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-center">
        {/* Left / Middle: Gauge + Strengths */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Radial Gauge */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#radialGradient)"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - scorePercent / 100)}`}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="radialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="num text-2xl font-bold text-white tracking-tight leading-none" data-testid="report-score">{report.score != null ? report.score.toFixed(1) : "–"}</span>
              <span className="text-[11px] text-muted font-medium mt-0.5">{report.score != null ? "/ 5" : "Not scored"}</span>
            </div>
          </div>

          {/* Headline and summary, from this session's own score and categories */}
          <div data-testid="report-summary">
            <h2 className="text-xl font-bold text-white tracking-tight">{reportHeadline(report)}</h2>
            <p className="mt-2 text-sm text-[#c9cad3] leading-relaxed max-w-xl">{reportSummary(report)}</p>
          </div>
        </div>

        {/* Key takeaways: the strongest area and the patterns that repeated in this session */}
        <div className="lg:border-l lg:border-white/[0.08] lg:pl-6 space-y-3" data-testid="report-takeaways">
          <h3 className="text-xs font-semibold text-white tracking-wide uppercase">Key takeaways</h3>
          <ul className="space-y-2.5">
            {takeaways(report).map((t) => (
              <li key={t.title} className="flex items-start gap-2.5 text-xs text-[#d1d2dc] leading-relaxed">
                <Icon name={t.tone === "good" ? "checkCircle" : t.tone === "fix" ? "alertCircle" : "info"} size={15} className={clsx("shrink-0 mt-0.5", t.tone === "good" ? "text-emerald-300" : t.tone === "fix" ? "text-amber-300" : "text-blue-soft")} />
                <span>
                  {t.detail ? <b className="font-semibold text-white">{t.title}. </b> : t.title}
                  {t.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. ROW 2: 3 CARDS IN A GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* CARD 1: Scores by category: only the categories with a scored answer */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between" data-testid="report-categories">
          <div>
            <div className="pb-3 border-b border-white/[0.07]">
              <h3 className="text-sm font-semibold text-white">Scores by category</h3>
              <p className="mt-0.5 text-[11px] text-muted">The average of your scored answers in each category.</p>
            </div>

            {categories.length === 0 ? (
              <p className="mt-4 text-xs text-muted">No category could be scored in this session.</p>
            ) : (
              <div className="mt-4 space-y-3.5">
                {categories.map((cat) => (
                  <div key={cat.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-[#c9cad3] font-medium">
                        <Icon name={CATEGORY_ICON[cat.key]} size={14} className="text-muted" />
                        <span>{cat.label}</span>
                      </div>
                      <span className="num font-semibold text-white">{cat.score.toFixed(1)} / 5</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden" aria-hidden>
                      <div className={clsx("h-full rounded-full transition-all duration-700", cat.score < 3 ? "bg-gradient-to-r from-rose-500 to-red-400" : "bg-gradient-to-r from-indigo-500 to-purple-400")} style={{ width: `${Math.min(100, (cat.score / 5) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: Recommended next steps, worked out from this session */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between" data-testid="report-next-steps">
          <div>
            <div className="flex items-center gap-2 pb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue/15 text-blue-soft">
                <Icon name="target" size={14} />
              </div>
              <h3 className="text-sm font-semibold text-white">Recommended next steps</h3>
            </div>
            <p className="text-xs text-muted mb-4 border-b border-white/[0.07] pb-3">Worked out from this session’s answers: your weakest answer, your lowest category and any habit that repeated.</p>

            {p.drills.length === 0 ? (
              <p className="text-xs text-muted">{report.score == null ? "Nothing was scored in this session, so there is nothing to recommend from it." : "Nothing is recommended from this session: no answer, category or habit needs a drill."}</p>
            ) : (
              <ul className="space-y-2.5">
                {p.drills.map((d) => (
                  <li key={d.title} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#141326] border border-white/10">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white">
                        {d.title}
                        {d.done ? <span className="ml-1.5 font-medium text-emerald-300">Done</span> : null}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">
                        {d.detail} About {d.minutes} min.
                      </div>
                    </div>
                    {d.spec.kind === "story" ? (
                      <Link
                        href={`/interviews/${interview.id}/story?skill=${encodeURIComponent(d.spec.skill ?? "")}&question=${encodeURIComponent(d.spec.question ?? "")}`}
                        className="shrink-0 rounded-xl bg-[#252048] hover:bg-[#322a61] border border-indigo-500/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                      >
                        Build it
                      </Link>
                    ) : (
                      <StartButton interviewId={interview.id} micOk={p.micOk} size="sm" body={{ kind: "drill", drill: d.spec }} className="shrink-0">
                        {d.done ? "Again" : "Start"}
                      </StartButton>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* CARD 3: Answering frameworks */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue/15 text-blue-soft">
                <Icon name="layers" size={14} />
              </div>
              <h3 className="text-sm font-semibold text-white">Answering frameworks</h3>
            </div>
            <p className="text-xs text-muted mb-4 border-b border-white/[0.07] pb-3">Use proven structures to give clear, focused answers.</p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedFramework("star")}
                className="w-full text-left group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#141326] border border-white/10 hover:border-indigo-500/40 hover:bg-[#1a1832] transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-amber-400 group-hover:bg-amber-400/10 transition-colors">
                    <Icon name="star" size={15} />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white group-hover:text-blue-soft transition-colors">STAR</div>
                    <div className="text-[11px] text-muted truncate">Best for experience and situational questions.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-muted group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedFramework("prep")}
                className="w-full text-left group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#141326] border border-white/10 hover:border-indigo-500/40 hover:bg-[#1a1832] transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-blue-soft group-hover:bg-blue/10 transition-colors">
                    <Icon name="list" size={15} />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white group-hover:text-blue-soft transition-colors">PREP</div>
                    <div className="text-[11px] text-muted truncate">A simple structure for structured responses.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-muted group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedFramework("other")}
                className="w-full text-left group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#141326] border border-white/10 hover:border-indigo-500/40 hover:bg-[#1a1832] transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-purple-400 group-hover:bg-purple-400/10 transition-colors">
                    <Icon name="layers" size={15} />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white group-hover:text-blue-soft transition-colors">Other useful frameworks</div>
                    <div className="text-[11px] text-muted truncate">For technical, product and strategy questions.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-muted group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.07]">
              <Link
                href="/practice#hub-playbooks"
                className="text-xs font-semibold text-blue-soft hover:text-white flex items-center justify-between gap-2 transition-colors group"
              >
                <span>Question Playbooks moved to Practice Hub</span>
                <span className="text-[11px] text-indigo-400 group-hover:translate-x-0.5 transition-transform">Explore →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ROW 3: QUESTION REVIEW SECTION */}
      <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl">
        {/* Tabs Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div role="tablist" aria-label="Report" className="flex items-center gap-6">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "review"}
              onClick={() => setActiveTab("review")}
              className={clsx(
                "text-sm font-semibold pb-1 relative transition-colors",
                activeTab === "review" ? "text-white after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" : "text-[#a9abc0] hover:text-white"
              )}
            >
              Question review
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "details"}
              onClick={() => setActiveTab("details")}
              className={clsx(
                "text-sm font-semibold pb-1 relative transition-colors",
                activeTab === "details" ? "text-white after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" : "text-[#a9abc0] hover:text-white"
              )}
            >
              Session details
            </button>
          </div>

          {activeTab === "review" && filterOptions.length > 2 && (
            <div className="w-48">
              <CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={filterOptions} size="sm" align="right" />
            </div>
          )}
        </div>

        {activeTab === "review" && (
          <>
            <div className="mt-5 rounded-2xl bg-[#141326] border border-white/[0.08] p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/25">
                  <Icon name="chat" size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Question review</h2>
                  <p className="text-xs text-[#a5a7b8]">Open a question to hear your answer and read its transcript and feedback. The notes beside each one are what was measured in that answer.</p>
                </div>
              </div>
              <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs font-semibold text-white shrink-0">
                {filteredRows.length} question{filteredRows.length === 1 ? "" : "s"}
              </span>
            </div>

            {filteredRows.length === 0 ? (
              <p className="mt-4 rounded-xl bg-[#141326] border border-white/[0.06] p-5 text-xs text-muted" data-testid="report-no-rows">
                {rows.length === 0 ? "No questions were answered in this session." : "No questions in this category."}
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs" data-testid="report-rows">
                  <thead className="text-muted border-b border-white/[0.06]">
                    <tr>
                      <th scope="col" className="py-3 px-3 font-medium w-8">#</th>
                      <th scope="col" className="py-3 px-3 font-medium min-w-[280px]">Question</th>
                      <th scope="col" className="py-3 px-3 font-medium w-28">Category</th>
                      <th scope="col" className="py-3 px-3 font-medium w-24">Your score</th>
                      <th scope="col" className="py-3 px-3 font-medium">What was measured</th>
                      <th scope="col" className="py-3 px-3 w-44 min-w-[170px] text-right whitespace-nowrap">
                        <span className="sr-only">Open</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05] text-[#c9cad3]">
                    {visibleRows.map((r) => {
                      const measured = rowFeedback(r);
                      // Only an answer that was saved can be opened. A row without one has no link.
                      const answerHref = r.answerId ? `/interviews/${interview.id}/answers/${r.answerId}?mock=${mock.id}` : null;
                      const pill = r.slot === "opening" ? "Opening" : r.slot === "closing" ? "Close" : GROUP_LABEL[r.group];
                      return (
                        <tr key={r.number} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-4 px-3 num text-muted">{r.number}</td>
                          <td className="py-4 px-3 font-medium text-white max-w-[340px]">
                            {answerHref ? (
                              <Link href={answerHref} className="hover:text-blue-soft transition-colors">
                                {r.question}
                              </Link>
                            ) : (
                              r.question
                            )}
                          </td>
                          <td className="py-4 px-3">
                            <span className="inline-flex px-3 py-1 rounded-md text-[11px] font-semibold bg-[#2a1b42] text-[#d8b4fe] border border-[#581c87]/50">{pill}</span>
                          </td>
                          <td className="py-4 px-3 num font-bold text-white whitespace-nowrap">{r.overall != null ? `${r.overall.toFixed(1)} / 5` : <span className="font-medium text-muted">Not scored</span>}</td>
                          <td className="py-4 px-3">
                            {measured.good.length + measured.improve.length === 0 ? (
                              <span className="text-muted">Nothing could be measured in this answer.</span>
                            ) : (
                              <ul className="space-y-1.5 text-xs">
                                {measured.improve.slice(0, 2).map((line) => (
                                  <li key={line} className="flex items-start gap-2">
                                    <span aria-hidden className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-amber-400/60 text-amber-300 text-[9px] font-bold">!</span>
                                    <span className="text-[#d1d2dc] leading-tight">{line}</span>
                                  </li>
                                ))}
                                {measured.good.slice(0, 2).map((line) => (
                                  <li key={line} className="flex items-start gap-2">
                                    <span aria-hidden className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">✓</span>
                                    <span className="text-[#a5a7b8] leading-tight">{line}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                          <td className="py-4 px-3 text-right whitespace-nowrap">
                            {answerHref ? (
                              <Link href={answerHref} aria-label={`Review your answer to question ${r.number}`} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#252048] hover:bg-[#322a61] border border-indigo-500/30 hover:border-indigo-400/60 text-xs font-semibold text-white whitespace-nowrap transition-colors">
                                <span className="whitespace-nowrap">Review answer</span>
                                <span aria-hidden className="text-sm leading-none shrink-0">→</span>
                              </Link>
                            ) : (
                              <span className="text-muted">No saved answer</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filteredRows.length > 3 && (
              <div className="mt-4 border-t border-white/[0.06] pt-3 text-center">
                <button type="button" onClick={() => setExpandedAll((v) => !v)} aria-expanded={expandedAll} className="text-xs font-semibold text-[#a9abc0] hover:text-white inline-flex items-center gap-1.5 transition-colors">
                  {expandedAll ? "Show fewer questions" : `View all ${filteredRows.length} questions`}
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "details" && (
          <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-xs" data-testid="report-details">
            {(
              [
                ["Started", p.whenFormatted],
                ["Length", p.durationFormatted || "Not recorded"],
                ["Practice settings", p.difficultyFormatted || "Not recorded"],
                ["Questions planned", String(mock.planned)],
                ["Questions answered", countsLine(report.questionCount, report.followUpCount)],
                ["Overall score", report.score != null ? `${report.score.toFixed(1)} out of 5` : "Not scored"],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted font-medium">{label}</dt>
                <dd className="mt-0.5 text-white">{value}</dd>
              </div>
            ))}
            {p.endedEarly && (
              <div className="sm:col-span-2">
                <dt className="text-muted font-medium">Ended early</dt>
                <dd className="mt-0.5 text-white">This interview was ended before every planned question was answered, so the score covers only the answers above.</dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-muted font-medium">Questions skipped or replaced</dt>
              <dd className="mt-1 text-white">
                {p.skipped.length === 0 ? (
                  "None."
                ) : (
                  <ul className="space-y-1.5">
                    {p.skipped.map((s, i) => (
                      <li key={i}>
                        {s.question} <span className="text-muted">({s.reason})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          </dl>
        )}
      </div>

      {/* Framework Modal Dialog */}
      {selectedFramework && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedFramework(null)}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl bg-[#0f1122] border border-white/15 p-6 sm:p-7 shadow-2xl animate-rise space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Answering Framework Guide</span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedFramework === "star"
                    ? "The STAR Method"
                    : selectedFramework === "prep"
                      ? "The PREP Framework"
                      : "Alternative Answering Frameworks"}
                </h3>
                <p className="text-xs text-muted mt-1">
                  {selectedFramework === "star"
                    ? "Situation, Task, Action, Result — The gold standard for competency and Civil Service Success Profile answers."
                    : selectedFramework === "prep"
                      ? "Point, Reason, Example, Point — Best for direct, concise answers to motivation and strengths questions."
                      : "Specialized structures for technical trade-offs, project setbacks, and product decisions."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFramework(null)}
                className="rounded-lg p-1.5 text-muted hover:text-white hover:bg-white/[0.08] transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {selectedFramework === "star" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-[#14162a] p-3.5 border border-white/[0.08] space-y-1">
                    <div className="font-bold text-amber-300">1. Situation (~15–20s)</div>
                    <p className="text-muted leading-relaxed">Set the scene and scope. Where were you, who was involved, and what was the problem?</p>
                  </div>
                  <div className="rounded-xl bg-[#14162a] p-3.5 border border-white/[0.08] space-y-1">
                    <div className="font-bold text-blue-300">2. Task (~10–15s)</div>
                    <p className="text-muted leading-relaxed">What was your specific personal remit? Keep it strictly focused on &ldquo;I&rdquo;, not &ldquo;we&rdquo;.</p>
                  </div>
                  <div className="rounded-xl bg-[#14162a] p-3.5 border border-white/[0.08] space-y-1">
                    <div className="font-bold text-indigo-300">3. Action (~45–60s)</div>
                    <p className="text-muted leading-relaxed">The heart of your answer: decisions made, trade-offs, and concrete actions you took.</p>
                  </div>
                  <div className="rounded-xl bg-[#14162a] p-3.5 border border-white/[0.08] space-y-1">
                    <div className="font-bold text-emerald-300">4. Result (~20–30s)</div>
                    <p className="text-muted leading-relaxed">Quantifiable impact, metrics delivered, and key takeaways for this role.</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted rounded-lg bg-white/[0.03] p-2.5 border border-white/[0.06]">
                  <b className="font-semibold text-white">Pro Tip: </b> Spend at least 60% of your time on Action and Result. Interviewers score what you did and the outcomes you created.
                </p>
              </div>
            )}

            {selectedFramework === "prep" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-[#14162a] p-3.5 border border-white/[0.08] space-y-1">
                    <div className="font-bold text-blue-300">1. Point</div>
                    <p className="text-muted leading-relaxed">State your answer or thesis directly in your very first sentence.</p>
                  </div>
                  <div className="rounded-xl bg-[#14162a] p-3.5 border border-white/[0.08] space-y-1">
                    <div className="font-bold text-amber-300">2. Reason</div>
                    <p className="text-muted leading-relaxed">Give the underlying logic or motivation backing up your position.</p>
                  </div>
                  <div className="rounded-xl bg-[#14162a] p-3.5 border border-white/[0.08] space-y-1">
                    <div className="font-bold text-indigo-300">3. Example</div>
                    <p className="text-muted leading-relaxed">Ground it with a concrete anecdote or data point from your career.</p>
                  </div>
                  <div className="rounded-xl bg-[#14162a] p-3.5 border border-white/[0.08] space-y-1">
                    <div className="font-bold text-emerald-300">4. Point</div>
                    <p className="text-muted leading-relaxed">Restate your conclusion and connect it back to this organisation.</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted rounded-lg bg-white/[0.03] p-2.5 border border-white/[0.06]">
                  <b className="font-semibold text-white">Pro Tip: </b> Ideal for 45–75 second answers to motivation, why this role, and spontaneous strengths questions.
                </p>
              </div>
            )}

            {selectedFramework === "other" && (
              <div className="space-y-3">
                <div className="space-y-2.5 text-xs">
                  <div className="rounded-xl bg-[#14162a] p-3.5 border border-white/[0.08] space-y-1">
                    <div className="font-bold text-purple-300">CARL (Context, Action, Result, Learning)</div>
                    <p className="text-muted leading-relaxed">The best model for questions about project setbacks or when things didn&rsquo;t go to plan. Emphasises self-awareness and growth.</p>
                  </div>
                  <div className="rounded-xl bg-[#14162a] p-3.5 border border-white/[0.08] space-y-1">
                    <div className="font-bold text-cyan-300">SOAR (Situation, Obstacle, Action, Result)</div>
                    <p className="text-muted leading-relaxed">Highlights how you navigated severe obstacles or conflicting stakeholder demands under tight timelines.</p>
                  </div>
                  <div className="rounded-xl bg-[#14162a] p-3.5 border border-white/[0.08] space-y-1">
                    <div className="font-bold text-emerald-300">CIRCLES Method</div>
                    <p className="text-muted leading-relaxed">Industry standard for product and technical strategy: Comprehend, Identify users, Report customer needs, Cut through solutions, List trade-offs, Evaluate metrics, Summarise.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <Link
                href="/practice"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Go to Practice Hub for interactive workouts →
              </Link>
              <button
                type="button"
                onClick={() => setSelectedFramework(null)}
                className="rounded-xl bg-white/[0.08] hover:bg-white/[0.14] px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
