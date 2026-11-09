"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Button, Icon, type IconName } from "@/components/ui";
import { StartButton } from "@/components/interview/StartSession";
import { BetaInterviewFeedbackModal } from "@/components/feedback/BetaInterviewFeedbackModal";
import type { MockReport, MockRow } from "@/lib/mocks/report";
import type { Interview } from "@/lib/types";
import type { MockRecord } from "@/lib/mocks/store";

interface InterviewReportViewProps {
  interview: Interview;
  mock: MockRecord;
  rows: MockRow[];
  report: MockReport;
  whenFormatted: string;
  durationFormatted: string;
  difficultyFormatted: string;
  isFullInterview: boolean;
  endedEarly: boolean;
  micOk: boolean;
}

const PLAYBOOKS = [
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
      "“I'm a product manager with four years' experience in payments... I've recently focused on improving conversion and checkout retention... and I'm now looking to build on that at Halden because of your focus on small merchant growth.”",
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
      "“I've followed Halden's merchant expansion closely. In my last role, solving checkout drop-off gave me firsthand insight into small business pain points, which aligns directly with this roadmap.”",
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
      "“When conversion dropped 4% post-release, I audited the checkout funnel, isolated a third-party gateway timeout, and implemented a fallback within 48 hours, recovering £45k in weekly volume.”",
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
      "“We had to choose between synchronous idempotency checks and eventual consistency queueing. I recommended the tokenised idempotency layer to avoid duplicate payments while maintaining <200ms latency.”",
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
      "“When engineering requested a 3-week refactor during our peak sales sprint, I evaluated the outage risk against delivery impact and agreed on a staggered migration that preserved launch commitments.”",
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
      "“What does success look like for this role in the first six months, and where do you see the biggest friction between product and compliance today?”",
  },
];

export function InterviewReportView(p: InterviewReportViewProps) {
  const { interview, mock, rows, report } = p;
  const [activeTab, setActiveTab] = useState<"review" | "transcript" | "details">("review");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedAll, setExpandedAll] = useState(false);
  const [activePlaybookId, setActivePlaybookId] = useState("tell-me-about-yourself");
  const [shareCopied, setShareCopied] = useState(false);

  // Overall score: fallback to 3.5 if null
  const overallScore = report.score != null ? Number(report.score.toFixed(1)) : 3.5;
  const scorePercent = Math.min(100, Math.round((overallScore / 5) * 100));

  // Category data mapping
  const categoryScores: { label: string; score: number; icon: IconName; isLow: boolean }[] = [
    { label: "Experience", score: report.categories.cv ?? 4.0, icon: "brief", isLow: false },
    { label: "Skills", score: report.categories.competency ?? 3.4, icon: "layers", isLow: false },
    { label: "Technical", score: report.categories.technical ?? 2.5, icon: "code", isLow: true },
    { label: "Motivation", score: report.categories.motivation ?? 4.4, icon: "user", isLow: false },
    { label: "Situational", score: report.categories.curveball ?? 3.1, icon: "chat", isLow: false },
  ];

  const activePlaybook = PLAYBOOKS.find((x) => x.id === activePlaybookId) ?? PLAYBOOKS[0];

  const filteredRows = rows.filter((r) => {
    if (categoryFilter === "all") return true;
    return r.group === categoryFilter;
  });

  const visibleRows = expandedAll ? filteredRows : filteredRows.slice(0, 3);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      void navigator.clipboard?.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1280px] mx-auto w-full pb-20 animate-rise">
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
            <span>{p.rows.length || 6} questions</span>
            <span className="text-white/20">·</span>
            <span>{p.difficultyFormatted || "Medium"}</span>
            <span className="text-white/20">·</span>
            <span>{p.durationFormatted || "24 minutes"}</span>
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

          <button
            type="button"
            onClick={handleShare}
            className="bg-[#141326] border border-white/10 hover:border-white/25 text-white flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <Icon name="share" size={14} />
            <span>{shareCopied ? "Copied link!" : "Share report"}</span>
          </button>

          <Link
            href={`/interviews/${interview.id}#training`}
            className="pro-btn-glow bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Icon name="diamond" size={14} />
            <span>Practise recommended areas</span>
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
              <span className="num text-2xl font-bold text-white tracking-tight leading-none">{overallScore}</span>
              <span className="text-[11px] text-muted font-medium mt-0.5">/ 5</span>
            </div>
          </div>

          {/* Title & Copy */}
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {overallScore >= 4 ? "An outstanding performance" : overallScore >= 3.2 ? "A solid performance" : "Room for improvement"}
            </h2>
            <p className="mt-2 text-sm text-[#c9cad3] leading-relaxed max-w-xl">
              Clear strengths in experience and motivation. Focus on adding more technical depth and being more concise in your answers.
            </p>
          </div>
        </div>

        {/* Right: Key takeaways */}
        <div className="lg:border-l lg:border-white/[0.08] lg:pl-6 space-y-3">
          <h3 className="text-xs font-semibold text-white tracking-wide uppercase">Key takeaways</h3>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs text-[#d1d2dc] leading-relaxed">
              <Icon name="checkCircle" size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Strong, relevant examples and clear motivation.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#d1d2dc] leading-relaxed">
              <Icon name="alertCircle" size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <span>Add more technical detail and first-step thinking.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#d1d2dc] leading-relaxed">
              <Icon name="info" size={15} className="text-blue-soft shrink-0 mt-0.5" />
              <span>Be more concise, especially in longer answers.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ROW 2: 3 CARDS IN A GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* CARD 1: Scores by category */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <span>Scores by category</span>
                <Icon name="info" size={13} className="text-muted hover:text-white cursor-pointer" />
              </div>
            </div>

            <div className="mt-4 space-y-3.5">
              {categoryScores.map((cat) => (
                <div key={cat.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#c9cad3] font-medium">
                      <Icon name={cat.icon} size={14} className="text-muted" />
                      <span>{cat.label}</span>
                    </div>
                    <span className="num font-semibold text-white">{cat.score.toFixed(1)} / 5</span>
                  </div>
                  {/* Progress Meter Bar */}
                  <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all duration-700",
                        cat.isLow ? "bg-gradient-to-r from-rose-500 to-red-400" : "bg-gradient-to-r from-indigo-500 to-purple-400"
                      )}
                      style={{ width: `${Math.min(100, (cat.score / 5) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 2: Recommended next steps */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue/15 text-blue-soft">
                <Icon name="target" size={14} />
              </div>
              <h3 className="text-sm font-semibold text-white">Recommended next steps</h3>
            </div>
            <p className="text-xs text-muted mb-4 border-b border-white/[0.07] pb-3">Focus on the areas that will have the biggest impact.</p>

            <div className="space-y-2.5">
              <Link
                href={`/interviews/${interview.id}#training`}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-blue-soft group-hover:bg-blue/20 transition-colors">
                    <Icon name="code" size={17} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-soft transition-colors">Build technical depth</div>
                    <div className="text-[11px] text-muted line-clamp-1 mt-0.5">Practise questions that explore your approach and trade-offs.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-muted group-hover:text-white transition-colors shrink-0" />
              </Link>

              <Link
                href={`/interviews/${interview.id}#training`}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                    <Icon name="chat" size={17} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors">Be more concise</div>
                    <div className="text-[11px] text-muted line-clamp-1 mt-0.5">Practise giving clear, structured answers within 1–2 minutes.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-muted group-hover:text-white transition-colors shrink-0" />
              </Link>
            </div>
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
                onClick={() => setActivePlaybookId("star")}
                className="w-full text-left group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-amber-400">
                    <Icon name="star" size={15} />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white group-hover:text-blue-soft transition-colors">STAR</div>
                    <div className="text-[11px] text-muted truncate">Best for experience and situational questions.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-muted group-hover:text-white transition-colors shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setActivePlaybookId("tell-me-about-yourself")}
                className="w-full text-left group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-blue-soft">
                    <Icon name="list" size={15} />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white group-hover:text-blue-soft transition-colors">PREP</div>
                    <div className="text-[11px] text-muted truncate">A simple structure for structured responses.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-muted group-hover:text-white transition-colors shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setActivePlaybookId("prioritisation")}
                className="w-full text-left group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-purple-400">
                    <Icon name="layers" size={15} />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white group-hover:text-blue-soft transition-colors">Other useful frameworks</div>
                    <div className="text-[11px] text-muted truncate">For technical, product and strategy questions.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-muted group-hover:text-white transition-colors shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ROW 3: QUESTION REVIEW SECTION */}
      <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl">
        {/* Tabs Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("review")}
              className={clsx(
                "text-sm font-semibold pb-1 relative transition-colors",
                activeTab === "review" ? "text-white after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" : "text-muted hover:text-white"
              )}
            >
              Question review
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("transcript")}
              className={clsx(
                "text-sm font-semibold pb-1 relative transition-colors",
                activeTab === "transcript" ? "text-white after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" : "text-muted hover:text-white"
              )}
            >
              Transcription
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={clsx(
                "text-sm font-semibold pb-1 relative transition-colors",
                activeTab === "details" ? "text-white after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" : "text-muted hover:text-white"
              )}
            >
              Interview details
            </button>
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-lg bg-[#141326] border border-white/10 px-3 text-xs text-white [color-scheme:dark] focus:border-blue focus:outline-none"
            >
              <option value="all">All categories ∨</option>
              <option value="motivation">Motivation</option>
              <option value="competency">Skills</option>
              <option value="technical">Technical</option>
              <option value="cv">Experience</option>
            </select>
          </div>
        </div>

        {/* Questions Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-3 font-medium w-8">#</th>
                <th className="py-3 px-3 font-medium min-w-[280px]">Question</th>
                <th className="py-3 px-3 font-medium w-32">Category</th>
                <th className="py-3 px-3 font-medium w-24">Your score</th>
                <th className="py-3 px-3 font-medium">Key feedback</th>
                <th className="py-3 px-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-[#c9cad3]">
              {visibleRows.map((r) => {
                const isGood = (r.overall ?? 3.5) >= 4.0;
                const categoryPillLabel = r.group === "cv" ? "Experience" : r.group === "competency" ? "Skills" : r.group === "motivation" ? "Motivation" : r.group === "technical" ? "Technical" : "Situational";
                const feedbackText = r.overall && r.overall >= 4.2 ? "Strong fit and well-reasoned answer." : r.overall && r.overall >= 3.5 ? "A good example, but could be more concise and focused." : "Needs more direct technical evidence and first-principles framing.";

                return (
                  <tr key={r.number} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-3.5 px-3 num text-muted">{r.number}</td>
                    <td className="py-3.5 px-3 font-medium text-white max-w-[340px]">
                      {r.answerId ? (
                        <Link href={`/interviews/${interview.id}/answers/${r.answerId}?mock=${mock.id}`} className="hover:text-blue-soft transition-colors">
                          {r.question}
                        </Link>
                      ) : (
                        r.question
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/20">
                        {categoryPillLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 num font-bold text-white">
                      {r.overall ? `${r.overall.toFixed(1)} / 5` : "3.5 / 5"}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        {isGood ? (
                          <Icon name="checkCircle" size={14} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Icon name="info" size={14} className="text-blue-soft shrink-0" />
                        )}
                        <span className="line-clamp-1 text-[#d1d2dc]">{feedbackText}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {r.answerId && (
                        <Link href={`/interviews/${interview.id}/answers/${r.answerId}?mock=${mock.id}`} className="text-muted group-hover:text-white transition-colors">
                          <Icon name="chevronRight" size={14} />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* View all questions toggle */}
        {filteredRows.length > 3 && (
          <div className="mt-4 border-t border-white/[0.06] pt-3 text-center">
            <button
              type="button"
              onClick={() => setExpandedAll((v) => !v)}
              className="text-xs font-semibold text-muted hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{expandedAll ? "Show fewer questions ∧" : `View all ${filteredRows.length} questions ∨`}</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. ROW 4: QUESTION PLAYBOOKS */}
      <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl">
        <div className="flex items-center gap-2.5 pb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue/15 text-blue-soft">
            <Icon name="book" size={16} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">Question playbooks</h3>
            <p className="text-xs text-muted">Guidance, example structures and key things to cover for common interview questions.</p>
          </div>
        </div>

        {/* Playbook Tabs */}
        <div className="mt-5 flex flex-wrap gap-2 border-b border-white/[0.07] pb-4">
          {PLAYBOOKS.map((pb) => {
            const active = pb.id === activePlaybookId;
            return (
              <button
                key={pb.id}
                type="button"
                onClick={() => setActivePlaybookId(pb.id)}
                className={clsx(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                  active
                    ? "bg-blue border-blue-soft text-white shadow-[0_0_14px_rgba(79,70,229,0.4)]"
                    : "bg-[#141326] border-white/10 text-muted hover:text-white hover:border-white/20"
                )}
              >
                {pb.label}
              </button>
            );
          })}
        </div>

        {/* Active Playbook Breakdown */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_1.3fr_1.3fr] gap-6 items-start">
          {/* Column 1: Summary */}
          <div>
            <h4 className="text-sm font-semibold text-white">{activePlaybook.title}</h4>
            <p className="mt-2 text-xs text-muted leading-relaxed">{activePlaybook.summary}</p>
          </div>

          {/* Column 2: Structure */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-semibold text-white tracking-wide uppercase">A simple structure (~ 1–2 minutes)</h5>
            <div className="space-y-2">
              {activePlaybook.structure.map((item) => (
                <div key={item.step} className="flex items-start gap-2.5 text-xs text-[#c9cad3]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue text-[10px] font-bold text-white mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <strong className="text-white font-medium">{item.name}</strong> — {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Example Flow */}
          <div className="p-4 rounded-xl bg-[#141326] border border-white/10">
            <h5 className="text-xs font-semibold text-white tracking-wide uppercase mb-2">Example flow</h5>
            <p className="text-xs text-[#c9cad3] italic leading-relaxed">{activePlaybook.example}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
