import Link from "next/link";
import clsx from "clsx";
import { Icon, Panel } from "@/components/ui";
import { getInterview } from "@/lib/interviews/store";
import { getPresentation } from "@/lib/pitch/store";
import { CHECKLIST_TOPICS, DRILL_TOPICS } from "@/lib/sessions/topics";

export const dynamic = "force-dynamic";

export default function PracticeHubPage() {
  const interview = getInterview("halden");
  const interviewId = interview?.id ?? "halden";
  const presentation = getPresentation("q1-roadmap");

  const drillCategories = [
    {
      id: "star",
      title: "STAR Framework Workout",
      category: "Competency & Leadership",
      duration: "3–5 mins",
      difficulty: "Realistic",
      icon: "star" as const,
      color: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30",
      description: "Structure complex experience and behavioural stories with crisp Situation, Task, Action, and measurable Result.",
      href: `/mock/${interviewId}?topic=star`,
      badge: "Most recommended",
    },
    {
      id: "commercial",
      title: "Commercial Judgement & Risk",
      category: "Senior PM Decisions",
      duration: "4–6 mins",
      difficulty: "Challenging",
      icon: "target" as const,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30",
      description: "Balance user conversion, payment fraud loss limits, and business growth trade-offs under probing follow-ups.",
      href: `/mock/${interviewId}?topic=commercial-judgement`,
      badge: "Priority area",
    },
    {
      id: "technical",
      title: "Technical Depth & Architecture",
      category: "Engineering Trade-offs",
      duration: "5 mins",
      difficulty: "Challenging",
      icon: "code" as const,
      color: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30",
      description: "Explain technical architecture choices, idempotency, latency constraints, and handling disagreements with senior engineers.",
      href: `/mock/${interviewId}?topic=technical`,
    },
    {
      id: "curveball",
      title: "Curveball & Salary Questions",
      category: "Situational & Closing",
      duration: "3 mins",
      difficulty: "Friendly",
      icon: "chat" as const,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30",
      description: "Handle unexpected scenarios, gap explanations, and compensation expectations with poise and confidence.",
      href: `/mock/${interviewId}?topic=curveball`,
    },
  ];

  const presentationDrills = [
    {
      id: "full-run",
      title: "Full 10-Minute Presentation Rehearsal",
      subtitle: "Q1 Product Roadmap · 12 slides",
      time: "10 mins",
      href: "/rehearse/q1-roadmap",
      icon: "present" as const,
      desc: "Rehearse all 12 slides with live audio timing, progress segmentation, and speaker notes.",
      btnText: "Start full run",
    },
    {
      id: "opening",
      title: "Executive Opening Rehearsal",
      subtitle: "First 60 seconds hook & ask",
      time: "1 min",
      href: "/rehearse/q1-roadmap",
      icon: "flag" as const,
      desc: "Practise setting the context, framing the problem, and hooking the executive audience immediately.",
      btnText: "Practise opening",
    },
    {
      id: "qa",
      title: "Executive Q&A Defence",
      subtitle: "With Dana, Finance Director",
      time: "8 mins",
      href: "/qa/q1-roadmap",
      icon: "chat" as const,
      desc: "Defend your commercial assumptions against challenging, sceptical questions from senior stakeholders.",
      btnText: "Start Q&A",
    },
  ];

  const checklistStatus: Record<(typeof CHECKLIST_TOPICS)[number], string> = {
    "payment-fundamentals": "Ready",
    "product-metrics": "Review",
    "commercial-judgement": "Priority",
    "stakeholder-management": "Ready",
  };
  const knowledgeChecklist = CHECKLIST_TOPICS.map((topicId) => ({
    id: topicId,
    name: DRILL_TOPICS[topicId].title,
    topic: DRILL_TOPICS[topicId].subtitle,
    status: checklistStatus[topicId],
    href: `/mock/${interviewId}?topic=${topicId}`,
  }));

  return (
    <div className="flex grow flex-col w-full pb-20 animate-rise text-white">
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-soft uppercase tracking-wider mb-2">
            <Icon name="zap" size={15} />
            <span>Targeted Workouts</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Practice Hub</h1>
          <p className="mt-1.5 text-sm text-[#a1a2b3] max-w-2xl leading-relaxed">
            Targeted practice drills and executive presentation workouts. Focus on your weakest areas with immediate feedback after each answer.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/interviews/halden"
            className="px-4 py-2.5 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all hover:-translate-y-0.5"
          >
            Halden prep sheet
          </Link>
          <Link
            href="/mock/halden"
            className="pro-btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4f52f8] via-[#5c5ffc] to-[#6d5eff] text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
          >
            <Icon name="play" size={13} />
            <span>Start mock interview</span>
          </Link>
        </div>
      </header>

      {/* 2. TOP METRICS / QUICK STATS */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
            <Icon name="clock" size={22} />
          </div>
          <div>
            <div className="text-xs text-muted font-medium">Practice this week</div>
            <div className="mt-0.5 num text-2xl font-bold text-white tracking-tight">45 mins</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">3 sessions completed</div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <Icon name="target" size={22} />
          </div>
          <div>
            <div className="text-xs text-muted font-medium">Readiness score</div>
            <div className="mt-0.5 num text-2xl font-bold text-white tracking-tight">3.6 / 5.0</div>
            <div className="text-[11px] text-muted mt-0.5">Strong across motivation & structure</div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <Icon name="sparkle" size={22} />
          </div>
          <div>
            <div className="text-xs text-muted font-medium">Priority workout today</div>
            <div className="mt-0.5 text-base font-bold text-white tracking-tight">Commercial Judgement</div>
            <div className="text-[11px] text-amber-300 mt-0.5">Trade-offs on risk vs conversion</div>
          </div>
        </div>
      </div>

      {/* 3. SECTION 1: INTERVIEW DRILLS */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Interview Question Drills</h2>
            <p className="text-xs text-muted">Short 3–5 minute focused workouts with instant scoring and actionable feedback.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {drillCategories.map((drill) => (
            <div
              key={drill.id}
              className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br", drill.color)}>
                      <Icon name={drill.icon} size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-blue-soft transition-colors">{drill.title}</h3>
                      <div className="text-xs text-muted">{drill.category}</div>
                    </div>
                  </div>
                  {drill.badge && (
                    <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      {drill.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#a5a7b8] leading-relaxed mt-2 mb-4">
                  {drill.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1"><Icon name="clock" size={13} /> {drill.duration}</span>
                  <span>·</span>
                  <span>{drill.difficulty}</span>
                </div>
                <Link
                  href={drill.href}
                  className="pro-btn-glow flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141326] border border-white/10 hover:border-white/25 hover:bg-[#1a1932] text-xs font-semibold text-white transition-all"
                >
                  <span>Start drill</span>
                  <Icon name="chevronRight" size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SECTION 2: PRESENTATION REHEARSAL WORKOUTS */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Presentation & Executive Rehearsals</h2>
            <p className="text-xs text-muted">Slide delivery, timing management, and defending against tough executive questions.</p>
          </div>
          <Link href="/presentations/q1-roadmap" className="text-xs font-semibold text-blue-soft hover:underline">
            View presentation overview →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {presentationDrills.map((pDrill) => (
            <div
              key={pDrill.id}
              className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-muted pb-3 border-b border-white/[0.06]">
                  <span className="font-semibold text-white/80">{pDrill.subtitle}</span>
                  <span className="num font-bold text-white bg-white/10 px-2 py-0.5 rounded-full">{pDrill.time}</span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue/15 text-blue-soft border border-blue/25">
                    <Icon name={pDrill.icon} size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-white">{pDrill.title}</h3>
                </div>

                <p className="mt-3 text-xs text-[#a5a7b8] leading-relaxed">
                  {pDrill.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06]">
                <Link
                  href={pDrill.href}
                  className="w-full pro-btn-glow flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#4f52f8] via-[#5c5ffc] to-[#6d5eff] text-xs font-semibold text-white shadow-md transition-all hover:scale-[1.01]"
                >
                  <Icon name="play" size={13} />
                  <span>{pDrill.btnText}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. SECTION 3: ROLE KNOWLEDGE CHECKLIST */}
      <div className="mt-10 rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-base font-bold text-white">Senior Product Manager Knowledge Checklist</h3>
            <p className="text-xs text-muted mt-0.5">Core domain areas to be fluent in for payments and fintech leadership interviews.</p>
          </div>
          <Link href="/interviews/halden/prep" className="text-xs font-semibold text-blue-soft hover:underline shrink-0">
            Full prep sheet →
          </Link>
        </div>

        <div className="mt-4 divide-y divide-white/[0.06]">
          {knowledgeChecklist.map((item, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{item.name}</div>
                <div className="text-xs text-[#8c8d9e] truncate mt-0.5">{item.topic}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={clsx(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  item.status === "Ready" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : item.status === "Priority" ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-blue/15 text-blue-soft border border-blue/30"
                )}>
                  {item.status}
                </span>
                <Link
                  href={item.href}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/10 transition-colors"
                >
                  Practise
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
