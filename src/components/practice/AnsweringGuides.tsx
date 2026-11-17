"use client";

import { useState } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui";

export interface AnsweringStep {
  num: number;
  title: string;
  desc: string;
}

export interface AnsweringGuideItem {
  id: string;
  name: string;
  icon: IconName;
  subtitle: string;
  approachName: string;
  steps: AnsweringStep[];
  exampleQuestion: string;
  keyTip: string;
}

export const ANSWERING_GUIDES_DATA: AnsweringGuideItem[] = [
  {
    id: "competency",
    name: "Competency & Behavioural",
    icon: "star",
    subtitle: 'Use this for questions about something you’ve done in the past, such as “Tell me about a time when...”.',
    approachName: "STAR",
    steps: [
      { num: 1, title: "Situation", desc: "Briefly explain the context." },
      { num: 2, title: "Task", desc: "Explain your responsibility." },
      { num: 3, title: "Action", desc: "Describe what you did and why." },
      { num: 4, title: "Result", desc: "Explain the outcome, impact and what you learnt." },
    ],
    exampleQuestion: "Tell me about a time you managed a difficult situation in a team.",
    keyTip: "Spend most of your answer on your actions and the impact you achieved.",
  },
  {
    id: "strengths",
    name: "Strengths",
    icon: "zap",
    subtitle: "Use this for questions exploring what naturally energises and motivates you, and how you behave instinctively.",
    approachName: "Authentic Energy & Real Evidence",
    steps: [
      { num: 1, title: "Direct Enthusiasm", desc: "Answer directly with positive energy without hesitation." },
      { num: 2, title: "Why It Motivates You", desc: "Explain why this type of work gives you genuine energy." },
      { num: 3, title: "Real Evidence", desc: "Anchor your strength with a short, tangible moment of impact." },
    ],
    exampleQuestion: "Do you enjoy solving unfamiliar problems? Why?",
    keyTip: "Strengths evaluate genuine engagement and instinctive reaction. Answer with authentic enthusiasm and back it up with a clear real-life example.",
  },
  {
    id: "situational",
    name: "Situational",
    icon: "brain",
    subtitle: "Use this for hypothetical scenarios: “What would you do if...”. Focus on immediate triage, risk mitigation, and reasoned action.",
    approachName: "Assess, Decide & Mitigate",
    steps: [
      { num: 1, title: "Assess & Clarify", desc: "Quickly evaluate urgency, safety, stakeholders, or missing information." },
      { num: 2, title: "Immediate Priority", desc: "State your priority first action clearly to contain risk." },
      { num: 3, title: "Structured Resolution", desc: "Walk through your step-by-step actions and multidisciplinary collaboration." },
      { num: 4, title: "Review & Prevent", desc: "Explain how you would review the outcome to prevent recurrence." },
    ],
    exampleQuestion: "What would you do if you were faced with competing clinical or project priorities with conflicting deadlines?",
    keyTip: "Interviewers look for composure under pressure. Lead with safety, stakeholder communication, and immediate risk containment before diving into long-term fixes.",
  },
  {
    id: "curveball",
    name: "Curveball & Challenging",
    icon: "sparkle",
    subtitle: "Use this for unexpected, stress-testing, or non-standard questions designed to test composure and lateral thinking.",
    approachName: "Pause, Frame & Pivot",
    steps: [
      { num: 1, title: "Poised Pause", desc: "Take a calm 2–3 second breath to demonstrate emotional composure." },
      { num: 2, title: "Frame Assumptions", desc: "State your interpretation and structure how you will break the problem down." },
      { num: 3, title: "Constructive Perspective", desc: "Provide a thoughtful answer balancing trade-offs, humility, and pragmatism." },
    ],
    exampleQuestion: "If you had to eliminate 50% of your current features or workflow tomorrow, what would you cut and why?",
    keyTip: "There is rarely one 'right' answer. The panel evaluates how you stay composed, structure ambiguity, and communicate trade-offs.",
  },
  {
    id: "technical",
    name: "Technical & Problem-solving",
    icon: "code",
    subtitle: "Use this for domain-specific questions, clinical protocols, regulatory standards, or system architecture.",
    approachName: "Clarify, Approach & Trade-offs",
    steps: [
      { num: 1, title: "Clarify Scope", desc: "Confirm constraints, clinical/regulatory guardrails, and criteria." },
      { num: 2, title: "Core Strategy", desc: "Outline your overarching approach or standard protocol before details." },
      { num: 3, title: "Trade-offs & Rationale", desc: "Explain why you chose this path over alternatives and edge cases." },
      { num: 4, title: "Validation & Safety", desc: "Explain how you measure success, verify compliance, and ensure safety." },
    ],
    exampleQuestion: "Could you walk me through the specific steps you take to ensure safe protocol compliance under pressure?",
    keyTip: "Always explain the 'why' behind technical or clinical decisions, not just the 'what'. Highlight safety, governance, and user/patient impact.",
  },
  {
    id: "motivational",
    name: "Motivational",
    icon: "target",
    subtitle: "Use this for questions about why you want this specific role, organisation, or career transition.",
    approachName: "The 3 Whys: Organisation, Role & Timing",
    steps: [
      { num: 1, title: "Why Them", desc: "Show genuine knowledge of their mission, values, and public/market impact." },
      { num: 2, title: "Why This Role", desc: "Connect the day-to-day responsibilities to your proven strengths." },
      { num: 3, title: "Why Right Now", desc: "Explain why this is the natural, logical next chapter in your progression." },
    ],
    exampleQuestion: "Why do you want to join our organisation, and why is now the right time in your career?",
    keyTip: "Avoid generic praise. Reference a specific initiative, service value, or operational standard that resonates with your professional principles.",
  },
  {
    id: "general",
    name: "General & Career",
    icon: "brief",
    subtitle: "Use this for open-ended background questions, career transitions, and “Tell me about yourself”.",
    approachName: "Present, Past & Future",
    steps: [
      { num: 1, title: "Present", desc: "Who you are now, your current role, and core expertise (20-30s)." },
      { num: 2, title: "Past", desc: "Key career milestones and tangible achievements that shaped your skills (30-45s)." },
      { num: 3, title: "Future", desc: "Why you are here and why this role is the ideal next step (20s)." },
    ],
    exampleQuestion: "Tell me about yourself and your professional background.",
    keyTip: "Do not recite your entire CV chronologically. Tell a focused narrative that demonstrates career trajectory, core strengths, and alignment with this role.",
  },
];

export function AnsweringGuides({ className }: { className?: string }) {
  const [activeGuideId, setActiveGuideId] = useState<string>("competency");
  const activeGuide =
    ANSWERING_GUIDES_DATA.find((g) => g.id === activeGuideId) ?? ANSWERING_GUIDES_DATA[0];

  return (
    <div className={clsx("rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 sm:p-7 shadow-xl", className)}>
      {/* Top Header */}
      <div className="flex items-center gap-3.5 mb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#241e4b] border border-[#7c3aed]/40 text-[#c084fc] shadow-[0_0_15px_rgba(124,58,237,0.25)]">
          <Icon name="book" size={20} strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Answering guides</h3>
          <p className="text-xs text-[#8c8d9e]">
            Learn how to structure different types of interview answers, with when to use each approach.
          </p>
        </div>
      </div>

      {/* Main Container: Left Sidebar Tabs + Right Guide Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 sm:gap-5 items-start">
        {/* Left: 7 Category Sidebar Buttons */}
        <div className="space-y-1.5">
          {ANSWERING_GUIDES_DATA.map((guide) => {
            const isActive = activeGuideId === guide.id;
            return (
              <button
                key={guide.id}
                type="button"
                onClick={() => setActiveGuideId(guide.id)}
                className={clsx(
                  "w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-xs transition-all cursor-pointer group",
                  isActive
                    ? "bg-gradient-to-r from-[#282156] to-[#1c173e] border border-[#7c3aed] text-white shadow-[0_0_15px_rgba(124,58,237,0.25)] font-semibold ring-1 ring-[#7c3aed]/40"
                    : "bg-transparent hover:bg-white/[0.03] text-[#8c8d9e] hover:text-white border border-transparent"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    name={guide.icon}
                    size={15}
                    className={clsx(
                      "shrink-0 transition-colors",
                      isActive ? "text-[#c084fc]" : "text-[#8c8d9e] group-hover:text-white"
                    )}
                  />
                  <span className="truncate">{guide.name}</span>
                </div>
                {isActive && (
                  <Icon name="chevronRight" size={14} className="text-[#c084fc] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Active Guide Details (Exact Match to Screenshot) */}
        <div className="min-w-0">
          <h4 className="text-lg font-bold text-white tracking-tight">{activeGuide.name}</h4>
          <p className="text-xs text-[#8c8d9e] mt-1 mb-5 leading-relaxed">{activeGuide.subtitle}</p>

          {/* Recommended Approach Container with Flowchart Steps */}
          <div className="rounded-xl bg-[#141328] border border-white/[0.06] p-4 mb-4 shadow-sm">
            <h5 className="text-xs font-semibold text-[#a5a1ff] mb-4">
              Recommended approach: {activeGuide.approachName}
            </h5>

            <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap items-stretch lg:items-center gap-2.5">
              {activeGuide.steps.map((step, idx) => {
                const isLast = idx === activeGuide.steps.length - 1;
                return (
                  <div key={step.num} className="flex items-center flex-1 min-w-[140px]">
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5c64f7] text-[10px] font-bold text-white">
                          {step.num}
                        </span>
                        <span className="text-xs font-bold text-white">{step.title}</span>
                      </div>
                      <p className="text-[11px] text-[#8c8d9e] mt-1 pl-7 leading-snug">
                        {step.desc}
                      </p>
                    </div>
                    {!isLast && (
                      <span className="hidden xl:inline-block mx-2 text-[#5c64f7]/70 font-bold select-none">
                        →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Example Question & Key Tip Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Left: Example Question */}
            <div className="rounded-xl bg-[#141328] border border-white/[0.06] p-4 flex items-start gap-3 shadow-sm">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#232044] text-[#a5a1ff] mt-0.5">
                <Icon name="chat" size={14} />
              </div>
              <div className="min-w-0">
                <h6 className="text-xs font-bold text-white mb-1">Example question</h6>
                <p className="text-xs text-[#8c8d9e] italic leading-relaxed">
                  “{activeGuide.exampleQuestion}”
                </p>
              </div>
            </div>

            {/* Right: Key Tip */}
            <div className="rounded-xl bg-[#141328] border border-white/[0.06] p-4 flex items-start gap-3 shadow-sm">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300 mt-0.5">
                <Icon name="sparkle" size={14} />
              </div>
              <div className="min-w-0">
                <h6 className="text-xs font-bold text-white mb-1">Key tip</h6>
                <p className="text-xs text-[#8c8d9e] leading-relaxed">{activeGuide.keyTip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
