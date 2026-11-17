"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui";
import type { Interview, QuestionGroup } from "@/lib/types";

export type PracticeQuestionType =
  | "strengths"
  | "competency"
  | "technical"
  | "situational"
  | "motivation"
  | "experience";

export interface PracticeHubClientProps {
  interviews: Interview[];
  initialInterviewId?: string;
  initialType?: PracticeQuestionType;
}

interface AnsweringGuide {
  id: string;
  name: string;
  icon: IconName;
  subtitle: string;
  approachName: string;
  steps: {
    num: number;
    title: string;
    desc: string;
  }[];
  exampleQuestion: string;
  keyTip: string;
}

const ANSWERING_GUIDES: AnsweringGuide[] = [
  {
    id: "competency",
    name: "Competency & Behavioural",
    icon: "star",
    subtitle: "Use this for questions about something you've done in the past, such as “Tell me about a time when...”.",
    approachName: "STAR",
    steps: [
      { num: 1, title: "Situation", desc: "Set the context and the problem briefly (10-15% of your answer)." },
      { num: 2, title: "Task", desc: "What was your specific responsibility or goal?" },
      { num: 3, title: "Action", desc: "What did YOU specifically do? Detail your thought process and teamwork (60-70%)." },
      { num: 4, title: "Result", desc: "What was the outcome? Quantify impact and share any key lessons." },
    ],
    exampleQuestion: "Tell me about a time when you delivered a project under tight deadlines.",
    keyTip: "Keep the Situation and Task under 30 seconds. Spend the majority of your time explaining the specific actions YOU took and the decisions behind them.",
  },
  {
    id: "strengths",
    name: "Strengths",
    icon: "zap",
    subtitle: "Use this for questions exploring what naturally energises and motivates you, and how you behave instinctively.",
    approachName: "Authentic Energy & Real Evidence",
    steps: [
      { num: 1, title: "Direct Enthusiastic Reaction", desc: "Answer directly with genuine energy and positive tone without hesitation." },
      { num: 2, title: "Why It Motivates You", desc: "Explain why this type of work or problem gives you energy." },
      { num: 3, title: "Concrete Quick Example", desc: "Ground your strength with a short, tangible moment where you applied it naturally." },
    ],
    exampleQuestion: "Do you enjoy solving unfamiliar problems? Why?",
    keyTip: "Strengths questions evaluate spontaneity and authentic enthusiasm. Don't over-rehearse a rigid essay; smile, answer with genuine energy, and give one brief real-life anchor.",
  },
  {
    id: "situational",
    name: "Situational",
    icon: "compass",
    subtitle: "Use this for hypothetical scenarios: “What would you do if...”. Focus on immediate triage, risk mitigation, and reasoned action.",
    approachName: "Assess, Decide & Mitigate",
    steps: [
      { num: 1, title: "Assess & Clarify", desc: "Quickly assess the urgency, safety, stakeholders, or missing information." },
      { num: 2, title: "Immediate Action", desc: "State your priority first action clearly (e.g. safety check, triage, stakeholder notification)." },
      { num: 3, title: "Structured Plan", desc: "Walk through your step-by-step resolution and who you would collaborate with." },
      { num: 4, title: "Prevent & Learn", desc: "Explain how you would review the outcome to prevent similar issues." },
    ],
    exampleQuestion: "What would you do if you discovered a critical bug 2 hours before a major product release?",
    keyTip: "Interviewers look for sound judgement under pressure. Lead with safety, communication, and risk containment before jumping to long-term fixes.",
  },
  {
    id: "curveball",
    name: "Curveball & Challenging",
    icon: "sparkle",
    subtitle: "Use this for unexpected, stress-testing, or non-standard questions designed to test composure and lateral thinking.",
    approachName: "Pause, Frame & Pivot",
    steps: [
      { num: 1, title: "Poised Pause", desc: "Take a calm 2–3 second breath to show emotional composure." },
      { num: 2, title: "Frame Assumptions", desc: "State your interpretation and structure how you'll break the problem down." },
      { num: 3, title: "Constructive Answer", desc: "Give a thoughtful perspective balancing trade-offs, humility, and pragmatism." },
    ],
    exampleQuestion: "If you had to eliminate 50% of your current features tomorrow, which would you cut and why?",
    keyTip: "There is usually no single 'correct' answer. The panel is watching your thought process, ability to stay calm, and how you reason through ambiguity.",
  },
  {
    id: "technical",
    name: "Technical & Problem-solving",
    icon: "code",
    subtitle: "Use this for domain-specific questions, system architecture, clinical protocols, or regulatory standards.",
    approachName: "Clarify, Approach & Trade-offs",
    steps: [
      { num: 1, title: "Clarify Scope", desc: "Confirm constraints, scale, regulatory guardrails, or clinical criteria." },
      { num: 2, title: "High-Level Approach", desc: "Outline your overarching strategy or standard framework before diving into details." },
      { num: 3, title: "Deep Dive & Trade-offs", desc: "Explain the pros, cons, edge cases, and alternatives you considered." },
      { num: 4, title: "Validation", desc: "Explain how you measure success, test safety, or ensure compliance." },
    ],
    exampleQuestion: "How do you ensure data integrity and idempotency in high-throughput transactional services?",
    keyTip: "Explain the 'why' behind technical decisions, not just the 'what'. Mention trade-offs (e.g. latency vs consistency, speed vs risk).",
  },
  {
    id: "motivation",
    name: "Motivational",
    icon: "target",
    subtitle: "Use this for questions about why you want this specific role, organisation, or career transition.",
    approachName: "The 3 Whys: Company, Role & Timing",
    steps: [
      { num: 1, title: "Why This Organisation", desc: "Show genuine insight into their mission, challenges, and public/market impact." },
      { num: 2, title: "Why This Specific Role", desc: "Connect the role's responsibilities to what genuinely energises and suits you." },
      { num: 3, title: "Why Right Now", desc: "Explain why this is the natural, exciting next step in your career trajectory." },
    ],
    exampleQuestion: "Why do you want to join HMRC as an Associate Product Manager, and why is now the right time in your career?",
    keyTip: "Avoid generic praise like 'You're an industry leader'. Name a specific initiative, service, or value that resonates with your personal career mission.",
  },
  {
    id: "general",
    name: "General & Career",
    icon: "user",
    subtitle: "Use this for open-ended background questions, career transitions, and “Tell me about yourself”.",
    approachName: "Present, Past & Future",
    steps: [
      { num: 1, title: "Present", desc: "Who you are right now, your current role, and high-impact recent focus (20-30s)." },
      { num: 2, title: "Past", desc: "Key milestones, skills gained, and relevant achievements that shaped your expertise (30-45s)." },
      { num: 3, title: "Future", desc: "Why you're sitting in this interview and how your trajectory leads to this position (20s)." },
    ],
    exampleQuestion: "Tell me about yourself and your background in product delivery.",
    keyTip: "Do not recite your entire CV chronologically. Tell a coherent narrative showing progression, key strengths, and why this interview is the logical next chapter.",
  },
];

export function PracticeHubClient({
  interviews,
  initialInterviewId,
  initialType = "strengths",
}: PracticeHubClientProps) {
  // 1. Selected Interview State (Defaults to Staff Nurse to match design mockup)
  const defaultSelectedId = useMemo(() => {
    if (initialInterviewId && interviews.some((i) => i.id === initialInterviewId)) {
      return initialInterviewId;
    }
    const nurse = interviews.find((i) => i.id === "staff-nurse");
    if (nurse) return nurse.id;
    return interviews[0]?.id || "staff-nurse";
  }, [initialInterviewId, interviews]);

  const [selectedId, setSelectedId] = useState<string>(defaultSelectedId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 2. Selected Practice Question Type
  const [selectedType, setSelectedType] = useState<PracticeQuestionType>(initialType);

  // 3. Practice Settings (Difficulty & Mode)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [duration, setDuration] = useState<"1-question" | "3-mins" | "5-mins">("1-question");
  const [activeGuideTab, setActiveGuideTab] = useState<string>("competency");

  // Active interview record
  const currentInterview = useMemo(() => {
    return (
      interviews.find((i) => i.id === selectedId) ||
      interviews.find((i) => i.id === "staff-nurse") ||
      interviews[0]
    );
  }, [interviews, selectedId]);

  // Role detection
  const roleText = `${currentInterview?.role ?? ""} ${currentInterview?.company ?? ""} ${currentInterview?.jobSummary ?? ""}`.toLowerCase();
  const isNursing = /\b(nurse|nursing|nhs|clinical|healthcare|hospital|ward|patient|medical)\b/i.test(roleText);
  const isCivilService = /\b(civil service|hmrc|gov|government|ministry|public sector|dwp|policy|behaviours?)\b/i.test(roleText);
  const isPM = /\b(product manager|associate product manager|pm|payments|fintech|checkout)\b/i.test(roleText);

  // Upcoming stage info
  const stageInfo = useMemo(() => {
    if (isNursing) return { label: "Clinical interview", timing: "Interview in 3 days" };
    if (isCivilService) return { label: "Competency, strength and presentation", timing: "Interview in 4 days" };
    if (currentInterview?.stages && currentInterview.stages.length > 0) {
      const next = currentInterview.stages.find((s) => s.status === "next") || currentInterview.stages[0];
      return {
        label: next.name || "Interview stage 1",
        timing: next.date ? (next.date.includes("in") ? next.date : `Interview in 3 days`) : "Interview in 3 days",
      };
    }
    return { label: "Final round interview", timing: "Interview in 5 days" };
  }, [currentInterview, isNursing, isCivilService]);

  // Focus area stat
  const focusAreaStat = useMemo(() => {
    if (isNursing) {
      return {
        title: "Clinical judgement",
        subtitle: "Improve scenario-based responses",
      };
    }
    if (isCivilService) {
      return {
        title: "Success Profiles",
        subtitle: "STAR behaviour structure & strengths",
      };
    }
    return {
      title: "Commercial judgement",
      subtitle: "Trade-offs on risk vs conversion",
    };
  }, [isNursing, isCivilService]);

  // Question Type Options (Exact Match to Design Mockup Row: 6 items)
  const questionTypes: {
    id: PracticeQuestionType;
    label: string;
    icon: IconName;
    badgeLabel?: string;
  }[] = [
    { id: "strengths", label: "Strengths", icon: "star" },
    { id: "competency", label: "Competency", icon: "layers" },
    { id: "technical", label: "Technical", icon: isNursing ? "stethoscope" : "code" },
    { id: "situational", label: "Situational", icon: "brain" },
    { id: "motivation", label: "Motivational", icon: "target" },
    { id: "experience", label: "Experience", icon: "cal" },
  ];

  // Dynamic cards tailored to the role & domain
  const practiceCards = useMemo(() => {
    if (isNursing) {
      return [
        {
          id: "nursing-strengths",
          topicId: "civil-service-strengths",
          type: "strengths" as PracticeQuestionType,
          title: "Strengths Questions",
          category: "Clinical Motivation & Energy",
          badge: "RECOMMENDED",
          duration: "3–5 mins",
          difficulty: "Realistic",
          icon: "star" as IconName,
          color: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30",
          description: "Explore what motivates you, what you enjoy and how you work in a clinical team.",
        },
        {
          id: "nursing-competency",
          topicId: "nursing-competency",
          type: "competency" as PracticeQuestionType,
          title: "Competency & Behavioural",
          category: "Healthcare Setting (STAR)",
          duration: "4–6 mins",
          difficulty: "Medium",
          icon: "layers" as IconName,
          color: "from-indigo-500/20 to-violet-500/20 text-indigo-300 border-indigo-500/30",
          description: "Use real examples to show your skills, actions and impact in a healthcare setting.",
        },
        {
          id: "nursing-clinical",
          topicId: "clinical-judgement",
          type: "technical" as PracticeQuestionType,
          title: "Technical & Clinical Judgement",
          category: "Patient Safety & NEWS2",
          duration: "5 mins",
          difficulty: "Challenging",
          icon: "stethoscope" as IconName,
          color: "from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30",
          description: "Practise role-specific questions, such as patient safety, escalation and decisions.",
        },
        {
          id: "nursing-situational",
          topicId: "curveball",
          type: "situational" as PracticeQuestionType,
          title: "Situational Questions",
          category: "Ward Scenarios & Triage",
          duration: "3–5 mins",
          difficulty: "Realistic",
          icon: "brain" as IconName,
          color: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30",
          description: "Respond to realistic scenarios, for example managing competing clinical priorities.",
        },
        {
          id: "nursing-motivation",
          topicId: "motivation",
          type: "motivation" as PracticeQuestionType,
          title: "Nursing Vocation & NHS Values",
          category: "Why Nursing & NHS Trust",
          badge: "RECOMMENDED",
          duration: "3–5 mins",
          difficulty: "Friendly",
          icon: "target" as IconName,
          color: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30",
          description: "Articulate your clinical vocation, commitment to compassionate care and alignment with NHS values.",
        },
        {
          id: "nursing-experience",
          topicId: "experience",
          type: "experience" as PracticeQuestionType,
          title: "Clinical Background & Ward Rotations",
          category: "Placements & Practical Care",
          badge: "RECOMMENDED",
          duration: "4–6 mins",
          difficulty: "Realistic",
          icon: "cal" as IconName,
          color: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30",
          description: "Walk through key clinical placements, patient care milestones and lessons from challenging ward shifts.",
        },
      ];
    }

    if (isCivilService) {
      return [
        {
          id: "cs-strengths",
          topicId: "civil-service-strengths",
          type: "strengths" as PracticeQuestionType,
          title: "Civil Service Strengths",
          category: "Success Profiles",
          badge: "RECOMMENDED",
          duration: "3–4 mins",
          difficulty: "Realistic",
          icon: "star" as IconName,
          color: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30",
          description: "Spontaneous reflections assessing genuine motivations, natural engagement and public service priorities.",
        },
        {
          id: "cs-competencies",
          topicId: "civil-service-competencies",
          type: "competency" as PracticeQuestionType,
          title: "Competency & Behavioural",
          category: "STAR Behaviours",
          duration: "4–6 mins",
          difficulty: "Medium",
          icon: "list" as IconName,
          color: "from-indigo-500/20 to-violet-500/20 text-indigo-300 border-indigo-500/30",
          description: "Delivering at pace, Communicating and influencing, and Making effective decisions using STAR examples.",
        },
        {
          id: "cs-standards",
          topicId: "technical",
          type: "technical" as PracticeQuestionType,
          title: "Government Standards & GDS",
          category: "Digital Standards & WCAG",
          duration: "5 mins",
          difficulty: "Challenging",
          icon: "code" as IconName,
          color: "from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30",
          description: "Apply GDS service patterns, WCAG 2.2 accessibility, citizen privacy and statutory public governance.",
        },
        {
          id: "cs-situational",
          topicId: "curveball",
          type: "situational" as PracticeQuestionType,
          title: "Situational & Policy Scenarios",
          category: "Stakeholder Trade-offs",
          duration: "3–5 mins",
          difficulty: "Realistic",
          icon: "compass" as IconName,
          color: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30",
          description: "Navigate shifting ministerial directives, competing department priorities and citizen impact.",
        },
        {
          id: "cs-motivation",
          topicId: "motivation",
          type: "motivation" as PracticeQuestionType,
          title: "Public Service Mission & HMRC",
          category: "Why HMRC & Citizen Value",
          badge: "RECOMMENDED",
          duration: "3–5 mins",
          difficulty: "Friendly",
          icon: "target" as IconName,
          color: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30",
          description: "Articulate why you want to deliver public value, your civil service motivations and HMRC mission alignment.",
        },
        {
          id: "cs-experience",
          topicId: "experience",
          type: "experience" as PracticeQuestionType,
          title: "Career Journey & Public Delivery",
          category: "CV & Impact Narrative",
          badge: "RECOMMENDED",
          duration: "4–6 mins",
          difficulty: "Realistic",
          icon: "cal" as IconName,
          color: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30",
          description: "Walk through key programme milestones, data-informed decisions and public impact from your CV.",
        },
      ];
    }

    // Default / PM / Tech / Halden roles
    return [
      {
        id: "pm-star",
        topicId: "star",
        type: "competency" as PracticeQuestionType,
        title: "STAR Framework Workout",
        category: "Competency & Leadership",
        badge: "MOST RECOMMENDED",
        duration: "3–5 mins",
        difficulty: "Realistic",
        icon: "star" as IconName,
        color: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30",
        description: "Structure complex experience and behavioural stories with crisp Situation, Task, Action, and measurable Result.",
      },
      {
        id: "pm-commercial",
        topicId: "commercial-judgement",
        type: "situational" as PracticeQuestionType,
        title: "Commercial Judgement & Risk",
        category: "Senior PM Decisions",
        badge: "PRIORITY AREA",
        duration: "4–6 mins",
        difficulty: "Challenging",
        icon: "target" as IconName,
        color: "from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30",
        description: "Balance user conversion, payment fraud loss limits, and business growth trade-offs under probing follow-ups.",
      },
      {
        id: "pm-technical",
        topicId: "technical",
        type: "technical" as PracticeQuestionType,
        title: "Technical Depth & Architecture",
        category: "Engineering Trade-offs",
        duration: "5 mins",
        difficulty: "Challenging",
        icon: "code" as IconName,
        color: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30",
        description: "Explain technical architecture choices, idempotency, latency constraints, and handling disagreements with senior engineers.",
      },
      {
        id: "pm-curveball",
        topicId: "civil-service-strengths",
        type: "strengths" as PracticeQuestionType,
        title: "Product Strengths & Working Style",
        category: "Energy & Problem Solving",
        badge: "RECOMMENDED",
        duration: "3–4 mins",
        difficulty: "Realistic",
        icon: "star" as IconName,
        color: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30",
        description: "Explore what energises you in product management, handling unfamiliar challenges and collaborative style.",
      },
      {
        id: "pm-motivation",
        topicId: "motivation",
        type: "motivation" as PracticeQuestionType,
        title: "Why Halden & Product Vision",
        category: "Why Role & Company",
        badge: "RECOMMENDED",
        duration: "3–5 mins",
        difficulty: "Friendly",
        icon: "target" as IconName,
        color: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30",
        description: "Articulate why Halden, why fintech payments now, and your long-term product vision for small businesses.",
      },
      {
        id: "pm-experience",
        topicId: "experience",
        type: "experience" as PracticeQuestionType,
        title: "Career Narrative & Product Track Record",
        category: "CV & Launch History",
        badge: "RECOMMENDED",
        duration: "4–6 mins",
        difficulty: "Realistic",
        icon: "cal" as IconName,
        color: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30",
        description: "Connect your track record, past product launches, and career transitions into a compelling story.",
      },
    ];
  }, [isNursing, isCivilService]);

  // Sort practice cards so the active selected type is placed first and clearly highlighted
  const displayedPracticeCards = useMemo(() => {
    return [...practiceCards].sort((a, b) => {
      if (a.type === selectedType && b.type !== selectedType) return -1;
      if (b.type === selectedType && a.type !== selectedType) return 1;
      return 0;
    });
  }, [practiceCards, selectedType]);

  return (
    <div className="flex grow flex-col w-full pb-20 animate-rise text-white">
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-soft uppercase tracking-wider mb-2">
            <Icon name="zap" size={15} />
            <span>Targeted Practice</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Practice Hub</h1>
          <p className="mt-1.5 text-sm text-[#a1a2b3] max-w-2xl leading-relaxed">
            Focused interview practice tailored to your role, stage and goals.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/interviews/${currentInterview?.id ?? "staff-nurse"}/prep`}
            className="px-4 py-2.5 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all hover:-translate-y-0.5"
          >
            {currentInterview?.company || "Interview"} prep sheet
          </Link>
          <Link
            href={`/mock/${currentInterview?.id ?? "staff-nurse"}`}
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
            <div className="text-xs text-muted font-medium">Average score</div>
            <div className="mt-0.5 num text-2xl font-bold text-white tracking-tight">3.6 / 5.0</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">+0.6 from last week</div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <Icon name="chart" size={22} />
          </div>
          <div>
            <div className="text-xs text-muted font-medium">Focus area</div>
            <div className="mt-0.5 text-base font-bold text-white tracking-tight">{focusAreaStat.title}</div>
            <div className="text-[11px] text-amber-300 mt-0.5">{focusAreaStat.subtitle}</div>
          </div>
        </div>
      </div>

      {/* 3. STEP 1 & STEP 2 SELECTOR CONTAINER (Exact Match to Design Image) */}
      <div className="mt-8 rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-2xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* STEP 1: SELECT INTERVIEW */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
                1
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Which interview are you preparing for?
              </h2>
            </div>
            <p className="text-xs text-muted pl-8.5">
              Select an upcoming interview to get tailored questions.
            </p>

            {/* Custom Interactive Dropdown */}
            <div className="relative pt-1 pl-8.5">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#141326] border border-white/15 hover:border-indigo-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                    <Icon name="cal" size={16} />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors truncate">
                      {currentInterview?.role} — {currentInterview?.company}
                    </div>
                  </div>
                </div>
                <Icon
                  name="chevronDown"
                  size={16}
                  className={clsx("text-muted transition-transform duration-200 shrink-0", isDropdownOpen && "rotate-180")}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-8.5 right-0 mt-2 z-30 rounded-xl bg-[#121124] border border-white/15 shadow-2xl overflow-hidden py-1.5 animate-fade-in backdrop-blur-xl">
                  {interviews.map((iv) => {
                    const isSelected = iv.id === selectedId;
                    return (
                      <button
                        key={iv.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(iv.id);
                          setIsDropdownOpen(false);
                        }}
                        className={clsx(
                          "w-full flex items-center justify-between px-4 py-3 text-left transition-colors text-xs",
                          isSelected
                            ? "bg-indigo-600/20 text-white font-semibold"
                            : "hover:bg-white/[0.06] text-[#c9cad4]"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
                            {iv.companyInitial || iv.company[0]}
                          </span>
                          <div className="truncate">
                            <span className="font-semibold text-white">{iv.role}</span>
                            <span className="text-muted ml-1.5">({iv.company})</span>
                          </div>
                        </div>
                        {isSelected && <Icon name="check" size={14} className="text-indigo-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Metadata Badges below Dropdown */}
              <div className="flex flex-wrap items-center gap-2 pt-3">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#16152a] border border-white/10 px-3 py-1.5 text-xs font-medium text-[#d1d2dc]">
                  <Icon name={isNursing ? "stethoscope" : isCivilService ? "bank" : "list"} size={13} className="text-blue-400" />
                  <span>{stageInfo.label}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#16152a] border border-white/10 px-3 py-1.5 text-xs font-medium text-[#d1d2dc]">
                  <Icon name="cal" size={13} className="text-indigo-400" />
                  <span>{stageInfo.timing}</span>
                </span>
              </div>
            </div>
          </div>

          {/* STEP 2: CHOOSE PRACTICE TYPE */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] text-xs font-bold text-white shadow-sm">
                2
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                What would you like to practise?
              </h2>
            </div>
            <p className="text-xs text-muted pl-8.5">
              Choose a question type based on the interview focus.
            </p>

            {/* 6 Interactive Question Type Cards in 1 Row (Exact Match to Design Mockup) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 pt-1 pl-0 sm:pl-8.5">
              {questionTypes.map((t) => {
                const isActive = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedType(t.id)}
                    className={clsx(
                      "relative flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all cursor-pointer min-h-[78px] group",
                      isActive
                        ? "bg-gradient-to-b from-[#241e4b] to-[#1c173d] border-2 border-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] ring-1 ring-[#7c3aed]/50"
                        : "bg-[#141326] border-white/10 text-[#a5a7b8] hover:border-white/20 hover:text-white"
                    )}
                  >
                    <Icon
                      name={t.icon}
                      size={22}
                      className={clsx(
                        "transition-transform group-hover:scale-110 shrink-0",
                        isActive ? "text-white" : "text-[#a5a7b8] group-hover:text-white"
                      )}
                    />
                    <span
                      className={clsx(
                        "text-xs font-semibold mt-1.5 tracking-tight truncate w-full text-center",
                        isActive ? "text-white" : "text-[#a5a7b8] group-hover:text-white"
                      )}
                    >
                      {t.label}
                    </span>
                    {isActive && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-md ring-2 ring-[#0d0c1c]">
                        <Icon name="check" size={11} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Practice Settings Toolbar */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted font-medium">Difficulty:</span>
            <div className="flex items-center rounded-lg bg-[#141326] border border-white/10 p-0.5">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={clsx(
                    "px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all",
                    difficulty === d
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-muted hover:text-white"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-3 py-1.5 rounded-lg">
            <Icon name="sparkle" size={14} />
            <span>Practice mode: <b>1 question at a time</b> with instant scoring & STAR coaching</span>
          </div>
        </div>
      </div>

      {/* 4. SECTION 1: FOCUSED PRACTICE FOR YOUR ROLE */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Focused Practice for Your Role</h2>
            <p className="text-xs text-muted">
              {isNursing
                ? "Short, targeted workouts with questions relevant to nursing and clinical roles."
                : isCivilService
                ? "Short, targeted workouts with questions relevant to Civil Service and public sector roles."
                : `Short, targeted workouts with questions relevant to ${currentInterview?.role} at ${currentInterview?.company}.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedPracticeCards.map((card) => {
            const isCardHighlighted = card.type === selectedType;
            const practiceHref = `/mock/${currentInterview?.id ?? "staff-nurse"}?practice=1&topic=${card.topicId}&type=${card.type}&difficulty=${difficulty}&duration=${duration}`;

            return (
              <div
                key={card.id}
                className={clsx(
                  "rounded-2xl border p-6 shadow-xl flex flex-col justify-between transition-all group relative",
                  isCardHighlighted
                    ? "border-[#7c3aed] bg-gradient-to-b from-[#1c163d] to-[#120f26] ring-2 ring-[#7c3aed]/50 shadow-[0_0_25px_rgba(124,58,237,0.35)]"
                    : "bg-[#0d0c1c] border-white/[0.08] hover:border-white/20"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br", card.color)}>
                        <Icon name={card.icon} size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-blue-soft transition-colors">
                          {card.title}
                        </h3>
                        <div className="text-xs text-muted">{card.category}</div>
                      </div>
                    </div>
                    {isCardHighlighted ? (
                      <span className="rounded-full bg-[#7c3aed]/25 border border-[#7c3aed]/50 px-2.5 py-0.5 text-[10px] font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Icon name="check" size={10} strokeWidth={3} className="text-[#a5a1ff]" />
                        <span>SELECTED FOCUS</span>
                      </span>
                    ) : card.badge ? (
                      <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                        {card.badge}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-[#a5a7b8] leading-relaxed mt-2 mb-4">
                    {card.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Icon name="clock" size={13} /> {card.duration}
                    </span>
                    <span>·</span>
                    <span className="capitalize">{difficulty}</span>
                    <span>·</span>
                    <span className="text-indigo-300">1 question</span>
                  </div>
                  <Link
                    href={practiceHref}
                    className={clsx(
                      "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all",
                      isCardHighlighted
                        ? "bg-gradient-to-r from-[#6366f1] to-[#7c3aed] hover:from-[#7073ff] hover:to-[#8b4bf0] shadow-md shadow-indigo-500/30"
                        : "pro-btn-glow bg-[#141326] border border-white/10 hover:border-indigo-500/50 hover:bg-[#1a1932]"
                    )}
                  >
                    <span>Start practice</span>
                    <Icon name="chevronRight" size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SECTION 2: PRESENTATION & EXECUTIVE REHEARSALS */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Presentation & Executive Rehearsals</h2>
            <p className="text-xs text-muted">Practise delivering clear, confident and structured presentations.</p>
          </div>
          <Link href="/presentations/q1-roadmap" className="text-xs font-semibold text-blue-soft hover:underline">
            View presentation overview →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                  <Icon name="flag" size={15} />
                </div>
                <h3 className="text-sm font-bold text-white">Practise Your Opening</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed mt-1 mb-4">
                A clear and confident 60-second introduction.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <span className="text-xs text-muted">1 min</span>
              <Link
                href="/rehearse/q1-roadmap"
                className="px-3.5 py-1.5 rounded-lg bg-[#141326] border border-white/10 hover:border-white/25 text-xs font-semibold text-white"
              >
                Start opening
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                  <Icon name="present" size={15} />
                </div>
                <h3 className="text-sm font-bold text-white">Practise a Specific Slide</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed mt-1 mb-4">
                Improve the delivery of a key slide from your deck.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <span className="text-xs text-muted">3–5 mins</span>
              <Link
                href="/rehearse/q1-roadmap"
                className="px-3.5 py-1.5 rounded-lg bg-[#141326] border border-white/10 hover:border-white/25 text-xs font-semibold text-white"
              >
                Pick slide
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Icon name="chat" size={15} />
                </div>
                <h3 className="text-sm font-bold text-white">Practise Q&A</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed mt-1 mb-4">
                Handle follow-up questions with clarity and confidence.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <span className="text-xs text-muted">5 mins</span>
              <Link
                href="/qa/q1-roadmap"
                className="px-3.5 py-1.5 rounded-lg bg-[#141326] border border-white/10 hover:border-white/25 text-xs font-semibold text-white"
              >
                Start Q&A
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 6. SECTION 3: ANSWERING GUIDES (QUESTION PLAYBOOKS) */}
      <div className="mt-12 pt-8 border-t border-white/[0.08]">
        <div className="flex items-center gap-3.5 mb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#241e4b] border border-[#7c3aed]/40 text-[#c084fc] shadow-[0_0_15px_rgba(124,58,237,0.25)]">
            <Icon name="book" size={20} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Answering guides</h2>
            <p className="text-xs text-muted">Learn how to structure different types of interview answers, with when to use each approach.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Left: 7 Category Tabs */}
          <div className="flex flex-col gap-2">
            {ANSWERING_GUIDES.map((guide) => {
              const isActive = activeGuideTab === guide.id;
              return (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => setActiveGuideTab(guide.id)}
                  className={clsx(
                    "flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all cursor-pointer group",
                    isActive
                      ? "bg-gradient-to-r from-[#241e4b] to-[#1c173d] border-[#7c3aed] text-white shadow-[0_0_15px_rgba(124,58,237,0.25)] ring-1 ring-[#7c3aed]/50 font-semibold"
                      : "bg-[#0d0c1c] border-white/[0.06] text-[#a5a7b8] hover:border-white/20 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={clsx(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs",
                      isActive ? "bg-[#7c3aed]/30 text-[#c084fc]" : "bg-white/[0.05] text-[#8c8d9e] group-hover:text-white"
                    )}>
                      <Icon name={guide.icon} size={15} />
                    </span>
                    <span className="text-xs truncate">{guide.name}</span>
                  </div>
                  <Icon
                    name="chevronRight"
                    size={14}
                    className={clsx("shrink-0 transition-transform", isActive ? "text-[#c084fc] translate-x-0.5" : "text-white/20 group-hover:text-white/50")}
                  />
                </button>
              );
            })}
          </div>

          {/* Right: Selected Guide Details */}
          {(() => {
            const currentGuide = ANSWERING_GUIDES.find((g) => g.id === activeGuideTab) ?? ANSWERING_GUIDES[0];
            return (
              <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 sm:p-7 shadow-xl space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{currentGuide.name}</h3>
                  <p className="text-sm text-[#9b9ca8] leading-relaxed mt-1.5">{currentGuide.subtitle}</p>
                </div>

                {/* Recommended Approach Container */}
                <div className="rounded-xl bg-[#141328] border border-white/[0.06] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#a5a1ff]">
                      Recommended approach: {currentGuide.approachName}
                    </span>
                  </div>

                  <div className={clsx("grid gap-3", currentGuide.steps.length === 4 ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" : currentGuide.steps.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}>
                    {currentGuide.steps.map((st) => (
                      <div
                        key={st.num}
                        className="rounded-xl bg-[#1a1835]/70 border border-white/[0.06] p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-white">{st.title}</span>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed]/25 text-[11px] font-bold text-[#c084fc]">
                              {st.num}
                            </span>
                          </div>
                          <p className="text-xs text-[#a5a7b8] leading-relaxed">{st.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Example Question & Key Tip Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Left: Example Question */}
                  <div className="rounded-xl bg-[#141328] border border-white/[0.06] p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#a5a1ff] mb-2.5">
                        <Icon name="chat" size={15} />
                        <span>Example question</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-white/90 italic leading-relaxed">
                        “{currentGuide.exampleQuestion}”
                      </p>
                    </div>
                  </div>

                  {/* Right: Key Tip */}
                  <div className="rounded-xl bg-[#141328] border border-white/[0.06] p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-2.5">
                        <Icon name="sparkle" size={15} />
                        <span>Key tip</span>
                      </div>
                      <p className="text-xs text-[#a5a7b8] leading-relaxed">
                        {currentGuide.keyTip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
