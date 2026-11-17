"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Icon } from "@/components/ui";

export interface PlaybookStep {
  step: number;
  name: string;
  detail: string;
}

export interface PlaybookItem {
  id: string;
  label: string;
  title: string;
  summary: string;
  structureDuration?: string;
  structure: PlaybookStep[];
  example: string;
}

export function getPlaybooks(role?: string, company?: string): PlaybookItem[] {
  const roleName = role || "the role";
  const orgName = company || "your team";

  return [
    {
      id: "tell-me-about-yourself",
      label: "Tell me about yourself",
      title: "Tell me about yourself",
      summary: "A short, relevant summary of your background, key experience and why it's relevant to this role.",
      structureDuration: "~ 1–2 MINUTES",
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
      structureDuration: "~ 1–1.5 MINUTES",
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
      structureDuration: "~ 2–3 MINUTES",
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
      structureDuration: "~ 2–3 MINUTES",
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
      structureDuration: "~ 2 MINUTES",
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
      structureDuration: "~ 1–2 MINUTES",
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

export interface QuestionPlaybooksProps {
  role?: string;
  company?: string;
  className?: string;
}

export function QuestionPlaybooks({ role, company, className }: QuestionPlaybooksProps) {
  const playbooks = useMemo(() => getPlaybooks(role, company), [role, company]);
  const [activePlaybookId, setActivePlaybookId] = useState<string>("tell-me-about-yourself");
  const activePlaybook = playbooks.find((x) => x.id === activePlaybookId) ?? playbooks[0];

  return (
    <div className={clsx("rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 sm:p-7 shadow-xl", className)}>
      <div className="flex items-center gap-2.5 pb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue/15 text-blue-soft border border-blue-500/20">
          <Icon name="book" size={16} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">Question playbooks</h3>
          <p className="text-xs text-muted">Guidance, example structures and key things to cover for common interview questions.</p>
        </div>
      </div>

      {/* Playbook Tabs */}
      <div className="mt-5 flex flex-wrap gap-2 border-b border-white/[0.07] pb-4">
        {playbooks.map((pb) => {
          const active = pb.id === activePlaybookId;
          return (
            <button
              key={pb.id}
              type="button"
              onClick={() => setActivePlaybookId(pb.id)}
              className={clsx(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
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
          <h5 className="text-xs font-semibold text-white tracking-wide uppercase">
            A simple structure ({activePlaybook.structureDuration || "~ 1–2 minutes"})
          </h5>
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
  );
}
