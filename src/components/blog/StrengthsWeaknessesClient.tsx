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
import {
  FAQ_LIST,
  STRENGTH_SAMPLES,
  WEAKNESS_SAMPLES,
  type SampleAnswer,
} from "@/lib/blog/strengths-weaknesses-data";

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
