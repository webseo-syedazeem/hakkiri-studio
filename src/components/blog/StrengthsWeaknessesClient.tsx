"use client";

import { useState } from "react";
import {
  IconCheck,
  IconCopy,
  IconRotateCcw,
  IconSparkles,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconCheckCircle,
  IconXCircle,
} from "@/components/interview-questions/Icons";

interface SampleAnswer {
  id: string;
  role: string;
  badge: string;
  strength: string;
  proof: string;
  text: string;
  whyItWorks: string;
}

export const STRENGTH_SAMPLES: SampleAnswer[] = [
  {
    id: "customer-service",
    role: "Customer Service",
    badge: "High-Volume / Frontline",
    strength: "Staying calm under pressure with upset customers",
    proof: "Turned escalated complaints into repeat customers same-day",
    text: `My biggest strength is staying calm with upset customers. At my last job I handled our escalated complaints, and I turned most of them into repeat customers by listening first and fixing the problem the same day. Your posting mentions handling high call volumes, so I think that calm, fix-it approach would fit well.`,
    whyItWorks: "Directly matches the job requirement, uses a calm problem-solving angle, and connects to repeat customer retention.",
  },
  {
    id: "office-admin",
    role: "Office or Admin Role",
    badge: "Operations & Organization",
    strength: "Systematic organization and workflow tracking",
    proof: "Cut team update chasing time from 1 hour to 10 minutes daily",
    text: `I'm very organized. I set up a shared tracker for our team's orders that cut the time we spent chasing updates from about an hour a day to ten minutes. I'd bring that same habit of building simple systems to this role.`,
    whyItWorks: "Replaces vague claims like 'detail-oriented' with a concrete metric: saving 50 minutes every day for the entire team.",
  },
  {
    id: "student-first-job",
    role: "Student or First Job",
    badge: "Early Career & Entry-Level",
    strength: "Fast learner who enjoys steep learning curves",
    proof: "Mastered basic Python in 3 weeks and achieved top class grade",
    text: `I'm a fast learner. In my final semester I learned basic Python in three weeks to analyze data for my group project, and our project got the top grade in the class. I know this role will have a lot to learn at the start, and I enjoy that.`,
    whyItWorks: "Acknowledges entry-level status honestly while giving hard academic proof of rapid independent skill acquisition.",
  },
];

export const WEAKNESS_SAMPLES = [
  {
    id: "public-speaking",
    title: "Public Speaking",
    badge: "Soft Skill / Communication",
    fix: "Volunteered for monthly team presentations and rehearsed out loud",
    text: `Public speaking used to make me very nervous, so I avoided presenting in team meetings. Last year I asked my manager to let me present our monthly results, and I practiced out loud beforehand each time. I'm still not a natural, but I now present every month and get good feedback.`,
    whyItWorks: "A common, relatable weakness that shows genuine initiative, measurable repetition, and positive feedback.",
  },
  {
    id: "delegating",
    title: "Delegating",
    badge: "Management & Workflow",
    fix: "Built upfront assignment plans and weekly check-ins",
    text: `I used to take on too much myself instead of delegating, which meant I was the bottleneck on some projects. Now I plan who does what at the start of each project and check in weekly instead of doing it all. Our last two projects finished on time.`,
    whyItWorks: "Shows self-awareness about project bottlenecks and demonstrates a practical project management fix that produced on-time delivery.",
  },
  {
    id: "saying-yes",
    title: "Saying Yes Too Often",
    badge: "Boundary & Priority Management",
    fix: "Time-blocking own deliverables and setting realistic help schedules",
    text: `I find it hard to say no when colleagues ask for help, and I've missed my own deadlines because of it. I now block time for my own work and give an honest 'I can help on Thursday' instead of dropping everything.`,
    whyItWorks: "Highlights generosity while demonstrating professional boundaries and protectiveness over core deadlines.",
  },
  {
    id: "technical-skill",
    title: "A Technical Skill (e.g. Advanced Excel)",
    badge: "Tool / Software Gap",
    fix: "Completed an online course and applied pivot tables directly in weekly reports",
    text: `I'm not very confident with advanced Excel yet. I'm taking an online course and use pivot tables in my weekly reports now, so I'm improving quickly.`,
    whyItWorks: "Non-fatal skill gap that is actively being closed with verifiable coursework and on-the-job application.",
  },
];

export const FAQ_LIST = [
  {
    q: 'What is the best answer for "What are your strengths and weaknesses?"',
    a: "Name one strength the job needs and prove it with an example. Then name a real weakness that is not essential for the role and explain how you are improving it.",
  },
  {
    q: "What should I say my weakness is?",
    a: "Choose a real, fixable weakness that is not core to the job, such as public speaking, delegating or a specific software skill, and focus on what you are doing to improve.",
  },
  {
    q: "Is it okay to say I'm a perfectionist?",
    a: "It's best to avoid it. Interviewers hear it so often that it sounds rehearsed. If perfectionism is a real issue for you, describe the specific problem, such as spending too long on small details, and how you manage it.",
  },
  {
    q: "How many strengths and weaknesses should I mention?",
    a: "One or two strengths and one weakness is enough. Depth and examples matter more than a long list.",
  },
  {
    q: "How long should my answer be?",
    a: "About 30 to 60 seconds for each part, or under two minutes if they ask both in one question.",
  },
  {
    q: "What if I have no work experience?",
    a: "Use examples from school, volunteering, sports or part-time jobs. A strength like learning quickly or a weakness like presenting in front of groups works well for first jobs.",
  },
];

/**
 * Interactive Answer Builder for Strengths & Weaknesses
 */
export function StrengthsWeaknessesBuilder() {
  const defaultFields = {
    strength: "problem solving and root-cause analysis",
    strengthExample: "when our ordering system kept double-booking, I investigated the logs, found the sync glitch, and built a check that eliminated duplicate entries",
    weakness: "I used to say yes to every ad-hoc request, which overloaded my weekly schedule",
    weaknessFix: "I now time-block my core deliverables and agree realistic timelines up front, hitting 100% of my deadlines this quarter",
    roleTarget: "this role",
  };

  const [fields, setFields] = useState(defaultFields);
  const [copied, setCopied] = useState(false);

  const fullAnswer = `My biggest strength is ${fields.strength || "[strength]"}. For example, ${fields.strengthExample || "[specific proof with result]"}. I'm excited to bring that problem-solving approach to ${fields.roleTarget || "this role"}. On the other hand, a weakness I've worked on is that ${fields.weakness || "[weakness]"}. To fix this, ${fields.weaknessFix || "[how you are fixing it and recent progress]"}.`;

  const wordCount = fullAnswer.split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((wordCount / 130) * 60);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(fullAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setFields(defaultFields);
  };

  return (
    <div className="relative rounded-3xl p-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-xl my-10">
      <div className="rounded-[22px] bg-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-800 mb-2">
              <IconSparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
              INTERACTIVE ANSWER BUILDER
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Build Your Custom Strengths &amp; Weaknesses Answer
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Customize each step below. Keep your total answer under 2 minutes with concrete proof.
            </p>
          </div>
          <button
            onClick={handleReset}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 self-start sm:self-center transition-colors"
          >
            <IconRotateCcw className="h-3.5 w-3.5" />
            Reset to defaults
          </button>
        </div>

        {/* Form Inputs Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Strength Step */}
          <div className="space-y-4 rounded-2xl bg-blue-50/50 p-5 border border-blue-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">1</span>
              Part 1: Your Strength (With Proof)
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Primary Strength
              </label>
              <input
                type="text"
                value={fields.strength}
                onChange={(e) => setFields({ ...fields, strength: e.target.value })}
                placeholder="e.g. staying calm under pressure with upset customers"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Proof / Example (With a Number or Outcome)
              </label>
              <textarea
                rows={2}
                value={fields.strengthExample}
                onChange={(e) => setFields({ ...fields, strengthExample: e.target.value })}
                placeholder="e.g. cut team update chasing time from 1 hour to 10 minutes"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Weakness Step */}
          <div className="space-y-4 rounded-2xl bg-purple-50/50 p-5 border border-purple-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[11px] font-bold text-white">2</span>
              Part 2: Your Weakness (With the Fix)
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Real, Fixable Weakness (Not Essential to Job)
              </label>
              <input
                type="text"
                value={fields.weakness}
                onChange={(e) => setFields({ ...fields, weakness: e.target.value })}
                placeholder="e.g. public speaking used to make me nervous in team meetings"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Action Taken &amp; Progress Made
              </label>
              <textarea
                rows={2}
                value={fields.weaknessFix}
                onChange={(e) => setFields({ ...fields, weaknessFix: e.target.value })}
                placeholder="e.g. now I block time for my own tasks and give honest timelines"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-white shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-blue-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Your Live Combined Answer
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <IconClock className="h-3.5 w-3.5 text-slate-400" />
                ~{estimatedSeconds}s speaking time
              </span>
              <span>•</span>
              <span>{wordCount} words</span>
              <span>•</span>
              <span className={estimatedSeconds <= 120 ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                {estimatedSeconds <= 120 ? "✓ Under 2m Target" : "⚠ Over 2m — Trim slightly"}
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm sm:text-base text-slate-100 leading-relaxed font-sans">
            &ldquo;{fullAnswer}&rdquo;
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Tip: Say this out loud twice before your interview to smooth out natural pauses.
            </span>
            <button
              onClick={handleCopy}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <IconCheck className="h-4 w-4 text-emerald-300" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <IconCopy className="h-4 w-4" />
                  Copy Answer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Single Answer Copy Card
 */
export function SampleCard({
  title,
  badge,
  quote,
  note,
}: {
  title: string;
  badge: string;
  quote: string;
  note?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = quote.split(/\s+/).filter(Boolean).length;
  const seconds = Math.round((wordCount / 130) * 60);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-sm font-bold text-slate-900">{title}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            {badge}
          </span>
        </div>

        <blockquote className="rounded-xl border-l-4 border-blue-500 bg-slate-50/80 p-4 text-sm text-slate-800 italic leading-relaxed">
          &ldquo;{quote}&rdquo;
        </blockquote>

        {note && (
          <p className="mt-3 text-xs text-slate-500 leading-normal">
            <strong className="text-slate-700">Why it works:</strong> {note}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <IconClock className="h-3 w-3" /> ~{seconds}s
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {copied ? (
            <>
              <IconCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <IconCopy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * FAQ Accordion for 6 FAQs
 */
export function StrengthsWeaknessesFaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="space-y-3">
      {FAQ_LIST.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            className={`rounded-2xl border transition-all ${
              isOpen
                ? "border-blue-300 bg-blue-50/20 shadow-xs"
                : "border-slate-200/80 bg-white hover:border-slate-300"
            }`}
          >
            <button
              onClick={() => toggle(idx)}
              type="button"
              className="flex w-full items-center justify-between p-5 sm:p-6 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base font-bold text-slate-900 pr-4">
                {faq.q}
              </span>
              <span className="flex-shrink-0 text-slate-400">
                {isOpen ? (
                  <IconChevronUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <IconChevronDown className="h-5 w-5" />
                )}
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
