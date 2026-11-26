"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui";
import { AnsweringGuides } from "@/components/practice/AnsweringGuides";
import type { PracticeStats, PracticeType } from "@/lib/sessions/practice-stats";

export type PracticeQuestionType = PracticeType;

/** One of the person's interviews, with what the hub shows about it. All of it is worked out on the server. */
export interface HubInterview {
  id: string;
  role: string;
  company: string;
  companyInitial: string;
  /** A built-in example interview, not one the person set up. */
  isDemo: boolean;
  /** The interview's own next stage. Null when it has no stages. */
  stage: string | null;
  /** When the real interview is, from the date the person gave. */
  when: { text: string; rel: string | null };
  /** From the person's own finished sessions on this interview. */
  stats: PracticeStats;
  /** Their lowest-scoring category. Null until a session has been scored. */
  focus: { name: string; score: number } | null;
  /** The practice topics the app matches to this job. */
  topics: { id: string; title: string; focusLabel: string; subtitle: string; minutes: number; type: PracticeType }[];
}

export interface PracticeHubClientProps {
  interviews: HubInterview[];
  initialInterviewId?: string;
  initialType?: PracticeType;
  /** One of the person's own presentations, when they have added one. */
  presentation: { id: string; title: string } | null;
  claim?: string;
  question?: string;
  returnTo?: string;
}

export type CategoryKey =
  | "behaviour"
  | "strengths"
  | "technical"
  | "experience"
  | "motivational"
  | "situational"
  | "case"
  | "leadership"
  | "challenging"
  | "values";

export interface CategorySpec {
  key: CategoryKey;
  name: string;
  icon: string;
  previewQuestion: string;
}

const CATEGORIES: CategorySpec[] = [
  {
    key: "behaviour",
    name: "Competency & Behavioural",
    icon: "◇",
    previewQuestion: "Tell me about a time you made an evidence-based decision despite competing delivery priorities.",
  },
  {
    key: "strengths",
    name: "Strengths",
    icon: "✧",
    previewQuestion: "What kind of challenge energises you most when you start your working week?",
  },
  {
    key: "technical",
    name: "Technical",
    icon: "⚙",
    previewQuestion: "How do you evaluate architectural trade-offs between delivery speed and maintainability?",
  },
  {
    key: "experience",
    name: "Experience",
    icon: "▣",
    previewQuestion: "Which previous role or project best prepared you for the core responsibilities here?",
  },
  {
    key: "motivational",
    name: "Motivational",
    icon: "◎",
    previewQuestion: "Why does this role appeal to you, and what impact do you hope to make over the next year?",
  },
  {
    key: "situational",
    name: "Situational",
    icon: "◈",
    previewQuestion: "You discover a critical data inconsistency shortly before a deadline. What steps do you take?",
  },
  {
    key: "case",
    name: "Case Study & Problem-solving",
    icon: "▤",
    previewQuestion: "A service has seen a 25% drop in completion rates over two months. How would you investigate and solve this?",
  },
  {
    key: "leadership",
    name: "Leadership & Management",
    icon: "♧",
    previewQuestion: "Tell me about a time you brought a divided cross-functional team together to deliver a critical milestone.",
  },
  {
    key: "challenging",
    name: "Challenging & Curveball",
    icon: "⚡",
    previewQuestion: "What is an established assumption or standard in your domain that you believe is fundamentally flawed?",
  },
  {
    key: "values",
    name: "Values & Culture",
    icon: "♡",
    previewQuestion: "How do you handle situations where organisational targets conflict with user fairness or ethics?",
  },
];

interface SectorSpec {
  name: string;
  mix: CategoryKey[];
  mixLabel: string;
  roles: string[];
}

const SECTORS: Record<string, SectorSpec> = {
  any: {
    name: "Any industry",
    mix: ["behaviour", "strengths", "motivational", "situational"],
    mixLabel: "Competency & Behavioural · Strengths · Motivational · Situational",
    roles: [],
  },
  government: {
    name: "Government & Public Services",
    mix: ["behaviour", "strengths", "situational", "values"],
    mixLabel: "Competency & Behavioural · Strengths · Situational · Values",
    roles: ["Policy & Strategy", "Operational Delivery", "Digital Product Management", "Commercial & Procurement"],
  },
  healthcare: {
    name: "Healthcare & Social Care",
    mix: ["situational", "values", "strengths", "behaviour"],
    mixLabel: "Situational · Values & Culture · Strengths · Competency",
    roles: ["Nursing", "Clinical Support", "Healthcare Operations", "Allied Health"],
  },
  technology: {
    name: "Technology & Digital",
    mix: ["technical", "case", "behaviour", "strengths"],
    mixLabel: "Technical · Case Study · Competency · Strengths",
    roles: ["Software Engineering", "Product Management", "Data & AI", "Cloud & DevOps"],
  },
  finance: {
    name: "Banking & Finance",
    mix: ["technical", "situational", "case", "challenging"],
    mixLabel: "Technical · Situational · Case Study · Challenging",
    roles: ["Financial Analysis", "Risk & Compliance", "Accounting", "Investment Operations"],
  },
  education: {
    name: "Education & Training",
    mix: ["behaviour", "values", "motivational", "situational"],
    mixLabel: "Competency · Values & Culture · Motivational · Situational",
    roles: ["Teaching", "Academic Support", "Education Management", "Instructional Design"],
  },
};

function getTargetCount(duration: number, focus: "mix" | CategoryKey): number {
  if (focus === "strengths") {
    const table: Record<number, number> = { 5: 2, 10: 4, 20: 6, 30: 9, 45: 13 };
    return table[duration] || 8;
  }
  if (focus === "case") {
    const table: Record<number, number> = { 5: 1, 10: 2, 20: 3, 30: 5, 45: 7 };
    return table[duration] || 5;
  }
  if (focus === "behaviour" || focus === "leadership" || focus === "experience") {
    const table: Record<number, number> = { 5: 1, 10: 2, 20: 4, 30: 6, 45: 9 };
    return table[duration] || 6;
  }
  if (focus === "technical") {
    const table: Record<number, number> = { 5: 1, 10: 2, 20: 4, 30: 7, 45: 10 };
    return table[duration] || 7;
  }
  // Recommended mix
  const table: Record<number, number> = { 5: 1, 10: 3, 20: 5, 30: 8, 45: 11 };
  return table[duration] || 8;
}

export function PracticeHubClient({
  interviews,
  initialInterviewId,
  initialType,
  presentation,
  claim,
  question,
  returnTo,
}: PracticeHubClientProps) {
  const router = useRouter();

  // Mode: "tailored" | "general"
  const [mode, setMode] = useState<"tailored" | "general">(
    interviews.length > 0 ? "tailored" : "general"
  );

  // Selected job for tailored mode
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialInterviewId ?? interviews[0]?.id
  );
  const current = interviews.find((i) => i.id === selectedId) ?? interviews[0];

  // Stage for tailored mode
  const [stage, setStage] = useState<string>(current?.stage || "Panel interview");

  // General mode settings
  const [industry, setIndustry] = useState<string>("any");
  const [role, setRole] = useState<string>("");

  // Category Focus: "mix" | CategoryKey
  const [focus, setFocus] = useState<"mix" | CategoryKey>(
    initialType === "strengths"
      ? "strengths"
      : initialType === "technical"
      ? "technical"
      : initialType === "situational"
      ? "situational"
      : initialType === "motivation"
      ? "motivational"
      : initialType === "experience"
      ? "experience"
      : initialType === "competency"
      ? "behaviour"
      : "mix"
  );

  // Session settings
  const [duration, setDuration] = useState<5 | 10 | 20 | 30 | 45>(30);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // Plan preview toggle
  const [showPlanPreview, setShowPlanPreview] = useState<boolean>(false);

  // Active sector config for general
  const activeSector = SECTORS[industry] || SECTORS.any;

  // Derive active mix
  const activeMixKeys: CategoryKey[] =
    mode === "general"
      ? activeSector.mix
      : ["behaviour", "strengths", "technical"];

  const mixLabel =
    mode === "general"
      ? activeSector.mixLabel
      : "Competency & Behavioural · Strengths · Technical";

  const count = getTargetCount(duration, focus);

  // Calculate planned breakdown
  const plannedBreakdown: Array<{ name: string; count: number }> = [];
  if (focus !== "mix") {
    const cat = CATEGORIES.find((c) => c.key === focus);
    if (cat) {
      plannedBreakdown.push({ name: cat.name, count });
    }
  } else {
    // Distribute among active mix keys
    const n = activeMixKeys.length;
    const base = Math.floor(count / n);
    let remainder = count % n;
    for (let i = 0; i < n; i++) {
      const extra = remainder > 0 ? 1 : 0;
      if (remainder > 0) remainder--;
      const catCount = base + extra;
      if (catCount > 0) {
        const cat = CATEGORIES.find((c) => c.key === activeMixKeys[i]);
        if (cat) {
          plannedBreakdown.push({ name: cat.name, count: catCount });
        }
      }
    }
  }

  // Preview question text
  let previewQuestionText = "Tell me about a time you made an evidence-based decision despite competing delivery priorities.";
  if (focus !== "mix") {
    const cat = CATEGORIES.find((c) => c.key === focus);
    if (cat) previewQuestionText = cat.previewQuestion;
  } else if (mode === "tailored" && current) {
    previewQuestionText = `Tell me about a time in your work as a ${current.role} where you had to manage competing priorities.`;
  }

  // Live mock start URL
  const startHref = current
    ? `/mock/${current.id}?practice=1&mode=${mode}&type=${focus}&difficulty=${difficulty}&duration=${duration}m`
    : `/interviews/new`;

  return (
    <div className="flex grow flex-col w-full pb-20 animate-rise text-white">
      {/* CV Claim banner if arrived from CV */}
      {claim && (
        <div className="mb-6 rounded-2xl bg-[#1a1738] border border-indigo-500/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Practising CV Claim</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white">“{claim}”</p>
            {question && (
              <p className="mt-1 text-xs text-indigo-200/80">Anticipated question: {question}</p>
            )}
          </div>
          {returnTo && (
            <Link
              href={returnTo}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition-all shrink-0 hover:-translate-y-0.5"
            >
              ← Return to CV
            </Link>
          )}
        </div>
      )}

      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-soft uppercase tracking-wider mb-2">
            <Icon name="zap" size={15} />
            <span>Targeted Practice</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Practice Hub</h1>
          <p className="mt-1.5 text-sm text-[#a1a2b3] max-w-2xl leading-relaxed">
            Build confidence with the right questions for the right interview.
          </p>
        </div>

        {current && (
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/interviews/${current.id}/prep`}
              className="px-4 py-2.5 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all hover:-translate-y-0.5"
            >
              {current.company} prep sheet
            </Link>
            <Link
              href={`/interviews/${current.id}`}
              className="pro-btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4f52f8] via-[#5c5ffc] to-[#6d5eff] text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 transition-all"
            >
              <Icon name="play" size={13} />
              <span>Start a full interview</span>
            </Link>
          </div>
        )}
      </header>

      {/* 2. FIGURES FROM THE PERSON'S OWN SESSIONS */}
      {current && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5" data-testid="hub-stats">
          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              <Icon name="clock" size={22} />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#8a8d9f] uppercase tracking-wider">Practice this week</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {current.stats.sessionsThisWeek ? `${current.stats.sessionsThisWeek} sessions` : "0 sessions"}
                </span>
                <span className="text-xs text-muted font-medium">({current.stats.minutesThisWeek || 0} min)</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              <Icon name="check" size={22} />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#8a8d9f] uppercase tracking-wider">Average score</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {current.stats.averageScore != null ? `${current.stats.averageScore.toFixed(1)} / 5.0` : "Not scored yet"}
                </span>
                {current.stats.changeOnLastWeek != null ? (
                  <span
                    className={clsx(
                      "text-xs font-semibold",
                      current.stats.changeOnLastWeek >= 0 ? "text-emerald-400" : "text-amber-400"
                    )}
                  >
                    {current.stats.changeOnLastWeek >= 0
                      ? `+${current.stats.changeOnLastWeek.toFixed(1)}`
                      : current.stats.changeOnLastWeek.toFixed(1)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/25">
              <Icon name="sparkle" size={22} />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#8a8d9f] uppercase tracking-wider">Targeted focus</span>
              <div className="mt-1">
                {current.focus ? (
                  <span className="text-base font-bold text-white tracking-tight">{current.focus.name}</span>
                ) : (
                  <span className="text-xs text-muted">All areas balanced</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. INTERVIEW PRACTICE BUILDER */}
      <div className="mt-8 flex flex-col gap-6 max-w-4xl">
        {/* Mode Selector Card */}
        <div className="rounded-2xl bg-[#131724] border border-[#262c40] p-6 shadow-xl">
          <h2 className="text-base font-bold text-white tracking-tight">How would you like to practise?</h2>
          <p className="mt-1 text-xs text-[#a3abc3]">Start with an industry or prepare against an exact job application.</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => setMode("general")}
              className={clsx(
                "text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[110px]",
                mode === "general"
                  ? "bg-gradient-to-br from-[#242646] to-[#1c1d32] border-[#7474f3] shadow-[0_0_20px_rgba(116,116,243,0.25)]"
                  : "bg-[#191e2e] border-[#30384f] hover:border-[#4b5577] text-white"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="text-base text-indigo-400">◉</span> General practice
                </span>
                <span className={clsx("text-sm", mode === "general" ? "text-indigo-400 font-bold" : "text-muted")}>
                  {mode === "general" ? "●" : "○"}
                </span>
              </div>
              <p className="mt-2 text-xs text-[#b5bcd0] leading-relaxed">
                Common questions tailored by industry and profession. No CV needed.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("tailored")}
              className={clsx(
                "text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[110px]",
                mode === "tailored"
                  ? "bg-gradient-to-br from-[#242646] to-[#1c1d32] border-[#7474f3] shadow-[0_0_20px_rgba(116,116,243,0.25)]"
                  : "bg-[#191e2e] border-[#30384f] hover:border-[#4b5577] text-white"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="text-base text-indigo-400">▣</span> Tailored to a job
                </span>
                <span className={clsx("text-sm", mode === "tailored" ? "text-indigo-400 font-bold" : "text-muted")}>
                  {mode === "tailored" ? "●" : "○"}
                </span>
              </div>
              <p className="mt-2 text-xs text-[#b5bcd0] leading-relaxed">
                Practice against a saved job description and assessment criteria.
              </p>
            </button>
          </div>
        </div>

        {/* Step 1: Context */}
        <div className="rounded-2xl bg-[#131724] border border-[#262c40] p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#42478a] text-[#dddaff] text-xs font-bold">
              1
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              {mode === "general" ? "Choose your industry" : "Select your job"}
            </h2>
          </div>

          {mode === "general" ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="industry-select" className="block text-xs font-semibold text-[#b9c0d2] mb-1.5">
                    Industry
                  </label>
                  <select
                    id="industry-select"
                    value={industry}
                    onChange={(e) => {
                      setIndustry(e.target.value);
                      setRole("");
                    }}
                    className="w-full bg-[#1e2335] border border-[#37405a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="any">Any industry</option>
                    <option value="government">Government &amp; Public Services</option>
                    <option value="healthcare">Healthcare &amp; Social Care</option>
                    <option value="technology">Technology &amp; Digital</option>
                    <option value="finance">Banking &amp; Finance</option>
                    <option value="education">Education &amp; Training</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="profession-select" className="block text-xs font-semibold text-[#b9c0d2] mb-1.5">
                    Profession (optional)
                  </label>
                  <select
                    id="profession-select"
                    value={role}
                    disabled={activeSector.roles.length === 0}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#1e2335] border border-[#37405a] rounded-lg px-3.5 py-2.5 text-xs text-white disabled:opacity-50 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Any profession</option>
                    {activeSector.roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
                  <span>✓</span> No job description or CV required
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {interviews.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="job-select" className="block text-xs font-semibold text-[#b9c0d2] mb-1.5">
                        Saved job application
                      </label>
                      <select
                        id="job-select"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="w-full bg-[#1e2335] border border-[#37405a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        {interviews.map((iv) => (
                          <option key={iv.id} value={iv.id}>
                            {iv.role} — {iv.company}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="stage-select" className="block text-xs font-semibold text-[#b9c0d2] mb-1.5">
                        Interview stage
                      </label>
                      <select
                        id="stage-select"
                        value={stage}
                        onChange={(e) => setStage(e.target.value)}
                        className="w-full bg-[#1e2335] border border-[#37405a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value={current?.stage || "Panel interview"}>
                          {current?.stage || "Panel interview"}
                        </option>
                        <option value="Technical interview">Technical interview</option>
                        <option value="Screening call">Screening call</option>
                        <option value="Final round">Final round</option>
                      </select>
                    </div>

                    <div className="flex items-end justify-end">
                      <Link
                        href="/interviews/new"
                        className="px-4 py-2.5 rounded-lg bg-[#262c40] border border-[#37405a] hover:border-indigo-400 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 inline-flex items-center gap-1.5"
                      >
                        <span>+ Add another job</span>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                      <span>✓</span> Job spec supplied
                    </span>
                    <span className="text-xs text-[#8a8d9f]">
                      Based on your saved role requirements.
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-[#1c1d2e] border border-white/10 text-center">
                  <p className="text-xs text-muted mb-3">No saved jobs found.</p>
                  <Link
                    href="/interviews/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    + Add a job
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: What would you like to practise? */}
        <div className="rounded-2xl bg-[#131724] border border-[#262c40] p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#42478a] text-[#dddaff] text-xs font-bold">
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">What would you like to practise?</h2>
              <p className="text-xs text-[#a3abc3]">Recommended Mix or one category — the same choices in both modes.</p>
            </div>
          </div>

          {/* Recommended Mix Card */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setFocus("mix")}
              className={clsx(
                "w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4",
                focus === "mix"
                  ? "bg-gradient-to-r from-[#2c2d58] via-[#24254b] to-[#1c1d38] border-[#7474f3] shadow-[0_0_20px_rgba(116,116,243,0.3)]"
                  : "bg-[#191e2e] border-[#30384f] hover:border-[#4b5577] text-white"
              )}
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-lg font-bold">
                  ✧
                </span>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-white">Recommended Mix</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                      {mode === "tailored" ? "By job description" : "By industry"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#b5bcd0] font-medium">{mixLabel}</p>
                </div>
              </div>
              <span className={clsx("text-base font-bold", focus === "mix" ? "text-indigo-400" : "text-muted")}>
                {focus === "mix" ? "●" : "○"}
              </span>
            </button>
          </div>

          <p className="mt-6 mb-3 text-xs font-semibold text-[#8a8d9f] uppercase tracking-wider">
            Or focus on one question type
          </p>

          {/* 10-Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CATEGORIES.map((cat) => {
              const active = focus === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setFocus(cat.key)}
                  className={clsx(
                    "text-left px-3.5 py-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5",
                    active
                      ? "bg-gradient-to-r from-[#2b2b52] to-[#1e1f3a] border-[#7474f3] shadow-[0_0_15px_rgba(116,116,243,0.25)] text-white"
                      : "bg-[#191e2e] border-[#2b3248] hover:border-[#444e70] text-[#d6d9e4]"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-indigo-300 text-xs font-semibold">
                      {cat.icon}
                    </span>
                    <span className="text-xs font-semibold truncate">{cat.name}</span>
                  </div>
                  <span className={clsx("text-xs font-bold shrink-0", active ? "text-indigo-400" : "text-muted")}>
                    {active ? "●" : "○"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Session settings */}
        <div className="rounded-2xl bg-[#131724] border border-[#262c40] p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#42478a] text-[#dddaff] text-xs font-bold">
              3
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">Session settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-[#b9c0d2] mb-2.5">Duration</label>
              <div className="grid grid-cols-5 gap-1.5">
                {([5, 10, 20, 30, 45] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuration(m)}
                    className={clsx(
                      "py-2 rounded-lg text-xs font-semibold transition-all border text-center cursor-pointer",
                      duration === m
                        ? "bg-gradient-to-r from-[#5053f5] to-[#686bf8] border-[#7f82fb] text-white shadow-md shadow-indigo-500/20"
                        : "bg-[#1e2335] border-[#30384f] text-[#a8aec2] hover:border-[#4b5577] hover:text-white"
                    )}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-[#b9c0d2] mb-2.5">Difficulty</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={clsx(
                      "py-2 rounded-lg text-xs font-semibold capitalize transition-all border text-center cursor-pointer",
                      difficulty === d
                        ? "bg-gradient-to-r from-[#5053f5] to-[#686bf8] border-[#7f82fb] text-white shadow-md shadow-indigo-500/20"
                        : "bg-[#1e2335] border-[#30384f] text-[#a8aec2] hover:border-[#4b5577] hover:text-white"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. SESSION PREVIEW (AC18: Rendered BELOW Step 3) */}
        <div className="rounded-2xl bg-gradient-to-b from-[#181a2e] to-[#111322] border border-[#6366f1]/40 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 absolute top-0 left-0 right-0" />

          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="text-base font-bold text-white tracking-tight">Your session preview</h2>
            <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-xs font-bold text-indigo-300">
              {mode === "tailored" ? "Job-specific" : "General practice"}
            </span>
          </div>

          <div className="h-[1px] bg-white/[0.08] my-3.5" />

          {/* Eyebrow & Preview Question */}
          <div className="mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              {mode === "tailored" && current
                ? `${current.role} · ${current.company}`
                : `${activeSector.name} · ${role || "General"}`}
            </span>
            <h3 className="mt-1 text-base sm:text-lg font-bold text-white leading-snug">
              “{previewQuestionText}”
            </h3>
          </div>

          {/* Facts Pills */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#22283b] border border-white/10 text-xs font-semibold text-white">
              <Icon name="clock" size={13} /> {duration} min
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#22283b] border border-white/10 text-xs font-semibold capitalize text-white">
              <Icon name="target" size={13} /> {difficulty}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#22283b] border border-white/10 text-xs font-semibold text-indigo-300">
              <Icon name="layers" size={13} /> ~{count} main questions
            </span>
          </div>

          <div className="h-[1px] bg-white/[0.08] my-3.5" />

          {/* Planned question types */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-[#8a8d9f] uppercase tracking-wider block mb-2">
              Planned question types
            </span>
            <div className="flex flex-wrap gap-2">
              {plannedBreakdown.map((item) => (
                <span
                  key={item.name}
                  className="px-3 py-1 rounded-lg bg-[#262c40] border border-white/10 text-xs font-semibold text-white"
                >
                  {item.name} × {item.count}
                </span>
              ))}
            </div>
          </div>

          {/* Context note */}
          <p className="text-xs text-[#a3abc3] leading-relaxed mb-3">
            {mode === "tailored"
              ? "Suggested from the available job context; the interview questions are grounded in your saved role."
              : "Common questions tailored by sector and profession. No CV or job spec required."}
          </p>

          {/* Availability note */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-5">
            <span>✓</span> Fresh questions are available for this session.
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={startHref}
              className="pro-btn-glow flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#4f52f8] via-[#5c5ffc] to-[#6d5eff] text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 transition-all flex-1"
            >
              <Icon name="play" size={15} />
              <span>▶ Start practice</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowPlanPreview(!showPlanPreview)}
              className="px-5 py-3 rounded-xl bg-[#22283b] border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all text-center cursor-pointer"
            >
              {showPlanPreview ? "Hide question plan" : "Preview question plan"}
            </button>
          </div>

          {/* Expandable Plan Preview */}
          {showPlanPreview && (
            <div className="mt-5 p-4 rounded-xl bg-[#0e101b] border border-white/10 animate-rise">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block mb-2">
                Estimated Question Sequence
              </span>
              <div className="space-y-2">
                {Array.from({ length: count }).map((_, idx) => {
                  const catKey =
                    focus !== "mix"
                      ? focus
                      : activeMixKeys[idx % activeMixKeys.length];
                  const cat = CATEGORIES.find((c) => c.key === catKey);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.05] last:border-0"
                    >
                      <span className="text-white font-medium">
                        Q{idx + 1}: {cat?.name}
                      </span>
                      <span className="text-muted text-[11px]">
                        Target ~{catKey === "strengths" ? "1-2 min" : "3-4 min"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. PRESENTATIONS: THE PERSON'S OWN, WHEN THEY HAVE ONE */}
      <div className="mt-12" data-testid="hub-presentation">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Presentation rehearsals</h2>
            <p className="text-xs text-muted">
              {presentation ? `Rehearse “${presentation.title}”.` : "Rehearse a presentation’s opening, a slide or the questions after it."}
            </p>
          </div>
          {presentation ? (
            <Link href={`/presentations/${presentation.id}`} className="text-xs font-semibold text-blue-soft hover:underline">
              Open the presentation →
            </Link>
          ) : null}
        </div>

        {presentation ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(
              [
                { icon: "present", tone: "bg-purple-500/15 text-purple-300", title: "Rehearse it", text: "Run through your presentation and get feedback on each part.", href: `/rehearse/${presentation.id}`, action: "Start rehearsal" },
                { icon: "chat", tone: "bg-emerald-500/15 text-emerald-300", title: "Practise the Q&A", text: "Answer the questions an audience is likely to ask afterwards.", href: `/qa/${presentation.id}`, action: "Start Q&A" },
              ] as const
            ).map((c) => (
              <div key={c.title} className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={clsx("flex h-8 w-8 items-center justify-center rounded-lg", c.tone)}>
                      <Icon name={c.icon} size={15} />
                    </div>
                    <h3 className="text-sm font-bold text-white">{c.title}</h3>
                  </div>
                  <p className="text-xs text-muted leading-relaxed mt-1 mb-4">{c.text}</p>
                </div>
                <div className="flex justify-end pt-3 border-t border-white/[0.06]">
                  <Link href={c.href} className="px-3.5 py-1.5 rounded-lg bg-[#141326] border border-white/10 hover:border-white/25 text-xs font-semibold text-white">
                    {c.action}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 text-xs text-muted">
            <p>You haven’t added a presentation yet.</p>
            <Link href="/presentations" className="mt-2 inline-block font-semibold text-blue-soft hover:underline">
              Add a presentation →
            </Link>
          </div>
        )}
      </div>

      <div id="hub-playbooks" className="mt-12 pt-8 border-t border-white/[0.08]" data-testid="hub-answering-guides">
        <AnsweringGuides />
      </div>
    </div>
  );
}
