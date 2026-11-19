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
  goodAnswerSummary: string;
  goodAnswerFull: string;
  goodAnswerSteps: { step: string; text: string }[];
  whyItWorks: string[];
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
    goodAnswerSummary: "A strong, structured response using STAR.",
    goodAnswerFull:
      "In my previous role, our team was behind on a key delivery due to unexpected resource constraints (Situation). I was responsible for keeping the project on track and maintaining stakeholder confidence (Task). I re-prioritised the work, agreed a revised timeline with the stakeholder, and redistributed tasks across the team based on capacity (Action). As a result, we delivered on the new date, maintained the quality, and the stakeholder gave positive feedback on our communication and responsiveness (Result). I learnt the importance of early risk monitoring and open, proactive communication.",
    goodAnswerSteps: [
      { step: "Situation", text: "In my previous role, our team was behind on a key delivery due to unexpected resource constraints." },
      { step: "Task", text: "I was responsible for keeping the project on track and maintaining stakeholder confidence." },
      { step: "Action", text: "I re-prioritised the work, agreed a revised timeline with the stakeholder, and redistributed tasks across the team based on capacity." },
      { step: "Result", text: "As a result, we delivered on the new date, maintained the quality, and the stakeholder gave positive feedback on our communication and responsiveness. I learnt the importance of early risk monitoring and open, proactive communication." },
    ],
    whyItWorks: [
      "Clearly follows the STAR structure.",
      "Shows ownership, judgement and practical action.",
      "Demonstrates a measurable, positive outcome and a learning.",
    ],
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
    goodAnswerSummary: "An authentic, high-energy answer backed by clear evidence.",
    goodAnswerFull:
      "I'm genuinely energised by taking complex, messy problems and creating clarity (Direct Enthusiasm). For example, when an ambiguous API integration was blocking our engineering sprint, I broke down the dependencies and ran a quick technical alignment (Why It Motivates You). Within four hours, both teams had a shared schema and delivery resumed without slippage (Real Evidence). Bringing structure to chaos is where I do my best work.",
    goodAnswerSteps: [
      { step: "Direct Enthusiasm", text: "I'm genuinely energised by taking complex, messy problems and creating clarity." },
      { step: "Why It Motivates You", text: "When an ambiguous API integration was blocking our engineering sprint, I broke down the dependencies and ran a quick technical alignment." },
      { step: "Real Evidence", text: "Within four hours, both teams had a shared schema and delivery resumed without slippage. Bringing structure to chaos is where I do my best work." },
    ],
    whyItWorks: [
      "Responds with immediate, genuine enthusiasm without rehearsed hesitation.",
      "Connects personal motivation directly to business problem-solving.",
      "Backs up the trait with a concrete, tangible moment of impact.",
    ],
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
    goodAnswerSummary: "A calm triage and risk mitigation response under pressure.",
    goodAnswerFull:
      "First, I would assess immediate clinical and operational risks to identify which deadline directly impacts patient safety or contractual commitments (Assess & Clarify). I'd immediately communicate with the secondary stakeholder to flag the resource crunch and propose a staggered milestone (Immediate Priority). I'd then execute the critical deliverable with the core team while keeping both leads updated with clear checkpoint timings (Structured Resolution). Finally, I'd run a brief retrospective to understand why the deadlines conflicted and prevent recurrence (Review & Prevent).",
    goodAnswerSteps: [
      { step: "Assess & Clarify", text: "First, I would assess immediate clinical and operational risks to identify which deadline directly impacts patient safety or contractual commitments." },
      { step: "Immediate Priority", text: "I'd immediately communicate with the secondary stakeholder to flag the resource crunch and propose a staggered milestone." },
      { step: "Structured Resolution", text: "I'd then execute the critical deliverable with the core team while keeping both leads updated with clear checkpoint timings." },
      { step: "Review & Prevent", text: "Finally, I'd run a brief retrospective to understand why the deadlines conflicted and prevent recurrence." },
    ],
    whyItWorks: [
      "Demonstrates emotional composure and immediate risk triage.",
      "Prioritises stakeholder transparency instead of working in silence.",
      "Includes preventative reflection to ensure operational resilience.",
    ],
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
    goodAnswerSummary: "A balanced, thoughtful response that navigates trade-offs.",
    goodAnswerFull:
      "That's a tough but fascinating challenge (Poised Pause). I'd start by framing our core value proposition: what 20% of features drive 80% of our daily active user retention and revenue (Frame Assumptions). I would protect that core workflow and propose cutting low-adoption legacy tools that generate high customer support tickets (Constructive Perspective). I'd present this as a data-backed proposal to leadership, transparently communicating the customer transition plan.",
    goodAnswerSteps: [
      { step: "Poised Pause", text: "That's a tough but fascinating challenge. Taking a moment to consider the strategic implications." },
      { step: "Frame Assumptions", text: "I'd start by framing our core value proposition: what 20% of features drive 80% of our daily active user retention and revenue." },
      { step: "Constructive Perspective", text: "I would protect that core workflow and propose cutting low-adoption legacy tools that generate high customer support tickets. I'd present this as a data-backed proposal to leadership." },
    ],
    whyItWorks: [
      "Embraces ambiguity calmly without being defensive.",
      "Applies rational prioritisation frameworks (80/20 value).",
      "Shows executive maturity and pragmatic communication.",
    ],
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
    goodAnswerSummary: "A rigorous, safety-first protocol and architectural response.",
    goodAnswerFull:
      "Before executing any system changes, I confirm regulatory parameters, error budgets, and SLA constraints (Clarify Scope). My strategy is always to build for idempotency and graceful degradation, ensuring no transactions drop during network timeouts (Core Strategy). In our recent payments overhaul, we chose event-driven queues over direct webhooks because reliability outweighed 50ms latency (Trade-offs & Rationale). We verified this with automated load testing and Canary releases, achieving 99.99% uptime with zero payment anomalies (Validation & Safety).",
    goodAnswerSteps: [
      { step: "Clarify Scope", text: "Before executing any system changes, I confirm regulatory parameters, error budgets, and SLA constraints." },
      { step: "Core Strategy", text: "My strategy is always to build for idempotency and graceful degradation, ensuring no transactions drop during network timeouts." },
      { step: "Trade-offs & Rationale", text: "In our recent payments overhaul, we chose event-driven queues over direct webhooks because reliability outweighed 50ms latency." },
      { step: "Validation & Safety", text: "We verified this with automated load testing and Canary releases, achieving 99.99% uptime with zero payment anomalies." },
    ],
    whyItWorks: [
      "Explains the architectural 'why' behind design decisions.",
      "Demonstrates proactive risk management and regulatory safety.",
      "Quantifies real-world reliability and validation metrics.",
    ],
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
    goodAnswerSummary: "A tailored, mission-driven alignment with the organisation.",
    goodAnswerFull:
      "I've closely followed your digital transformation, particularly how you streamlined the citizen application process to reduce wait times by 30% (Why Them). In my current role leading payments and verification, I've delivered scalable onboarding flows under strict governance (Why This Role). Having proven this in the private sector, I'm specifically looking to apply my skills where public service delivery has national impact, making this role the natural next milestone (Why Right Now).",
    goodAnswerSteps: [
      { step: "Why Them", text: "I've closely followed your digital transformation, particularly how you streamlined the citizen application process to reduce wait times by 30%." },
      { step: "Why This Role", text: "In my current role leading payments and verification, I've delivered scalable onboarding flows under strict governance." },
      { step: "Why Right Now", text: "Having proven this in the private sector, I'm specifically looking to apply my skills where public service delivery has national impact, making this role the natural next milestone." },
    ],
    whyItWorks: [
      "Demonstrates genuine research into their specific mission and outcomes.",
      "Bridges proven past capabilities directly to upcoming challenges.",
      "Articulates a clear, logical career progression narrative.",
    ],
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
    goodAnswerSummary: "A focused, concise executive narrative in under 60 seconds.",
    goodAnswerFull:
      "Over the past six years, I have specialised in leading product and operational teams through high-growth digital transformations (Present). Earlier in my career, I started in data analytics and software delivery, which gave me strong technical discipline before transitioning into product strategy where I delivered a 40% efficiency gain across our core workflows (Past). I'm here today because your organisation is tackling complex scaling challenges where my blend of technical depth and product governance can drive immediate impact (Future).",
    goodAnswerSteps: [
      { step: "Present", text: "Over the past six years, I have specialised in leading product and operational teams through high-growth digital transformations." },
      { step: "Past", text: "Earlier in my career, I started in data analytics and software delivery, which gave me strong technical discipline before transitioning into product strategy where I delivered a 40% efficiency gain across our core workflows." },
      { step: "Future", text: "I'm here today because your organisation is tackling complex scaling challenges where my blend of technical depth and product governance can drive immediate impact." },
    ],
    whyItWorks: [
      "Delivers a crisp, memorable narrative in under 60 seconds.",
      "Highlights career milestones without reciting the entire CV line-by-line.",
      "Concludes with an impactful hook tailored to this specific role.",
    ],
  },
];

function renderWithBadges(text: string) {
  const parts = text.split(/(\([A-Za-z\s&]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith("(") && part.endsWith(")")) {
      const label = part.slice(1, -1);
      return (
        <span
          key={index}
          className="mx-1 inline-flex items-center rounded bg-indigo-500/20 border border-indigo-500/40 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 not-italic align-middle"
        >
          {label}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function AnsweringGuides({ className }: { className?: string }) {
  const [activeGuideId, setActiveGuideId] = useState<string>("competency");
  const [exampleView, setExampleView] = useState<"full" | "steps">("full");
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

          {/* Card: What a good answer looks like (Exact Match to Screenshot Image 7) */}
          <div className="mt-4 rounded-xl bg-[#141328] border border-white/[0.06] p-5 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#5c64f7] text-white shadow-[0_0_12px_rgba(92,100,247,0.4)]">
                  <Icon name="star" size={15} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-white tracking-tight">What a good answer looks like</h5>
                    <span className="rounded-full bg-[#5c64f7]/20 border border-[#5c64f7]/40 px-2 py-0.5 text-[10px] font-semibold text-[#a5a1ff]">
                      Example answer
                    </span>
                  </div>
                  <p className="text-xs text-[#8c8d9e] mt-0.5">{activeGuide.goodAnswerSummary}</p>
                </div>
              </div>

              {/* View Toggle: Full example vs By step */}
              <div className="flex items-center gap-1 self-start sm:self-auto rounded-lg bg-[#0d0c1c] p-1 border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setExampleView("full")}
                  className={clsx(
                    "px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                    exampleView === "full" ? "bg-[#5c64f7] text-white shadow-sm" : "text-[#8c8d9e] hover:text-white"
                  )}
                >
                  Full example
                </button>
                <button
                  type="button"
                  onClick={() => setExampleView("steps")}
                  className={clsx(
                    "px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                    exampleView === "steps" ? "bg-[#5c64f7] text-white shadow-sm" : "text-[#8c8d9e] hover:text-white"
                  )}
                >
                  {activeGuide.approachName === "STAR" ? "By STAR step" : "By step"}
                </button>
              </div>
            </div>

            {/* Content: Left Answer Box + Right Why It Works Box */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-4 items-stretch">
              {/* Left: Example Answer Content */}
              <div className="rounded-xl bg-[#0d0c1c] border border-white/[0.06] p-4 text-xs text-[#c5c6d5] leading-relaxed relative flex flex-col justify-center">
                <span className="text-2xl text-[#5c64f7]/50 font-serif leading-none select-none mb-1">“</span>
                {exampleView === "full" ? (
                  <p className="italic pl-2 pr-1">
                    {renderWithBadges(activeGuide.goodAnswerFull)}
                  </p>
                ) : (
                  <div className="space-y-2.5 pl-2">
                    {activeGuide.goodAnswerSteps.map((st, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="shrink-0 px-2 py-0.5 rounded bg-indigo-500/25 border border-indigo-500/40 text-[10px] font-bold text-indigo-300">
                          {st.step}
                        </span>
                        <span className="text-[#d8d9e8]">{st.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                <span className="text-2xl text-[#5c64f7]/50 font-serif leading-none select-none self-end mt-1">”</span>
              </div>

              {/* Right: Why it works */}
              <div className="rounded-xl bg-[#0d0c1c] border border-white/[0.06] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-3">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      ✓
                    </span>
                    <span>Why it works</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#a5a7b8]">
                    {activeGuide.whyItWorks.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
