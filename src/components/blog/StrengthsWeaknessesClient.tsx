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
  IconVolume2,
} from "@/components/interview-questions/Icons";
import {
  FAQ_LIST,
  STRENGTH_SAMPLES,
  WEAKNESS_SAMPLES,
  type SampleAnswer,
} from "@/lib/blog/strengths-weaknesses-data";

/**
 * 60-Second Interactive Answer Builder for Strengths & Weaknesses
 * Styled to executive standards with floating inputs and rich pitch preview
 */
export function StrengthsWeaknessesBuilder() {
  const defaultFields = {
    strength: "problem solving and root-cause analysis",
    strengthExample: "when our ordering system kept double-booking, I investigated the logs, found the sync glitch, and built a check that eliminated duplicate entries",
    roleBenefit: "bring that same analytical fix-it approach to your platform team",
    weakness: "I used to say yes to every ad-hoc request, which overloaded my weekly schedule",
    weaknessFix: "I now time-block my core deliverables and agree realistic timelines up front, hitting 100% of my deadlines this quarter",
  };

  const [fields, setFields] = useState(defaultFields);
  const [copied, setCopied] = useState(false);

  const handleChange = (key: keyof typeof defaultFields, val: string) => {
    setFields((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setFields(defaultFields);
  };

  const fullAnswer = `My biggest strength is ${fields.strength || "[primary strength]"}. For example, ${fields.strengthExample || "[concrete proof with measurable outcome]"}. I'm excited to ${fields.roleBenefit || "[bring that capability to this role]"}. On the other hand, a weakness I've worked on is that ${fields.weakness || "[real, fixable weakness]"}. To fix this, ${fields.weaknessFix || "[specific action taken and progress made]"}.`;

  const wordCount = fullAnswer.split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((wordCount / 130) * 60);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(fullAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative rounded-3xl p-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-xl my-10">
      <div className="rounded-[22px] bg-white p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-800 mb-2">
              <IconSparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
              INTERACTIVE TOOL
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Build Your Custom Strengths &amp; Weaknesses Answer
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              Customize the fields below to craft your tailored 2-minute formula with proof and proactive fixes.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <IconRotateCcw className="h-3.5 w-3.5" /> Reset Template
          </button>
        </div>

        {/* Two-Column Form Inputs */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Part 1: Strength */}
          <div className="space-y-4 rounded-2xl bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-white p-5 sm:p-6 border border-blue-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-xs">
                1
              </span>
              Part 1: Your Strength (With Proof)
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                1. Primary strength that matches this role
              </label>
              <input
                type="text"
                value={fields.strength}
                onChange={(e) => handleChange("strength", e.target.value)}
                placeholder="e.g. staying calm under pressure with upset customers"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                2. Concrete proof or story with a metric / outcome
              </label>
              <input
                type="text"
                value={fields.strengthExample}
                onChange={(e) => handleChange("strengthExample", e.target.value)}
                placeholder="e.g. cut team update chasing time from 1 hour to 10 minutes daily"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                3. Why it benefits their specific company or team
              </label>
              <input
                type="text"
                value={fields.roleBenefit}
                onChange={(e) => handleChange("roleBenefit", e.target.value)}
                placeholder="e.g. bring that calm, fix-it approach to your platform team"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Part 2: Weakness */}
          <div className="space-y-4 rounded-2xl bg-gradient-to-br from-purple-50/60 via-pink-50/30 to-white p-5 sm:p-6 border border-purple-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white shadow-xs">
                2
              </span>
              Part 2: Your Weakness (With the Fix)
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                4. Real, fixable weakness (not essential to the job)
              </label>
              <input
                type="text"
                value={fields.weakness}
                onChange={(e) => handleChange("weakness", e.target.value)}
                placeholder="e.g. public speaking used to make me nervous in large groups"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-hidden transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                5. Proactive action taken &amp; measurable progress made
              </label>
              <input
                type="text"
                value={fields.weaknessFix}
                onChange={(e) => handleChange("weaknessFix", e.target.value)}
                placeholder="e.g. volunteered for monthly team reviews and practiced beforehand"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-hidden transition-all shadow-xs"
              />
            </div>

            <div className="rounded-xl bg-purple-100/60 border border-purple-200/80 p-3 text-[11px] text-purple-900 leading-normal">
              💡 <strong>Gold standard rule:</strong> Spend only 20% on the flaw, and 80% on the proactive improvement step.
            </div>
          </div>
        </div>

        {/* Live Pitch Preview Box with Rich Executive Styling */}
        <div className="mt-8 rounded-2xl border border-indigo-900/60 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-[11px] font-bold text-indigo-300">
                <IconVolume2 className="h-3.5 w-3.5 text-indigo-400 animate-pulse" /> Live Pitch Preview
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <IconClock className="h-3.5 w-3.5 text-slate-400" /> ~{estimatedSeconds}s spoken time ({wordCount} words)
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  estimatedSeconds <= 120
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {estimatedSeconds <= 120 ? "✓ Under 2m Target" : "⚠ Over 2m — Trim slightly"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <IconCheck className="h-3.5 w-3.5 text-emerald-300" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <IconCopy className="h-3.5 w-3.5" /> Copy My Answer
                </>
              )}
            </button>
          </div>

          <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-serif italic pt-1">
            &ldquo;{fullAnswer}&rdquo;
          </p>

          <p className="mt-4 text-[11px] text-slate-400 font-medium">
            💡 <strong>Executive Tip:</strong> Read this out loud at normal conversational speed. Never sound robotic or memorized; treat it as an honest, natural self-assessment.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive Tabbed Sample Answers Component
 */
export function SampleAnswersTabs() {
  const allSamples = [
    ...STRENGTH_SAMPLES.map((s) => ({
      id: s.id,
      tabTitle: s.role,
      type: "Strength" as const,
      badge: s.badge,
      text: s.text,
      whyItWorks: s.whyItWorks,
    })),
    ...WEAKNESS_SAMPLES.map((w) => ({
      id: w.id,
      tabTitle: w.title,
      type: "Weakness" as const,
      badge: w.badge,
      text: w.text,
      whyItWorks: w.whyItWorks,
    })),
  ];

  const [activeTabId, setActiveTabId] = useState(allSamples[0].id);
  const [copied, setCopied] = useState(false);

  const selected = allSamples.find((s) => s.id === activeTabId) || allSamples[0];

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(selected.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = selected.text.split(/\s+/).filter(Boolean).length;
  const seconds = Math.round((wordCount / 130) * 60);

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-md">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
        {allSamples.map((sample) => {
          const isActive = sample.id === activeTabId;
          return (
            <button
              key={sample.id}
              onClick={() => setActiveTabId(sample.id)}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="opacity-70 text-[10px] mr-1.5 uppercase tracking-wider">
                {sample.type === "Strength" ? "💪" : "🛠️"}
              </span>
              {sample.tabTitle}
            </button>
          );
        })}
      </div>

      {/* Selected Answer Card */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                selected.type === "Strength"
                  ? "bg-blue-100 text-blue-800 border border-blue-200/80"
                  : "bg-purple-100 text-purple-800 border border-purple-200/80"
              }`}
            >
              {selected.type}: {selected.badge}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <IconClock className="h-3.5 w-3.5" /> ~{seconds}s spoken ({wordCount} words)
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <IconCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <IconCopy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy Answer</span>
              </>
            )}
          </button>
        </div>

        <blockquote className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-50/60 via-indigo-50/20 to-white p-6 text-sm sm:text-base leading-relaxed text-slate-900 font-serif italic shadow-2xs">
          &ldquo;{selected.text}&rdquo;
        </blockquote>

        <div className="mt-4 rounded-xl bg-blue-100/70 border border-blue-200/80 p-4 text-xs text-blue-950 font-medium shadow-2xs">
          🔍 <strong>Why this works:</strong> {selected.whyItWorks}
        </div>
      </div>
    </div>
  );
}

/**
 * Single Answer Copy Card (used for modular grids)
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
          className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
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
 * Modern Unified Executive FAQ Accordion
 * Matches the award-winning single-card container style with circular icon badges
 */
export function StrengthsWeaknessesFaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="divide-y divide-slate-200/80 rounded-3xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50 overflow-hidden">
      {FAQ_LIST.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            className={`p-5 sm:p-6 transition-colors ${
              isOpen ? "bg-gradient-to-r from-blue-50/40 via-white to-white" : "hover:bg-slate-50/50"
            }`}
          >
            <button
              onClick={() => toggle(idx)}
              type="button"
              className="flex w-full items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm sm:text-base cursor-pointer group"
              aria-expanded={isOpen}
            >
              <span className="group-hover:text-blue-600 transition-colors font-black text-slate-900">
                {faq.q}
              </span>
              <span className="shrink-0 text-slate-400">
                {isOpen ? (
                  <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                    <IconChevronUp className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shadow-2xs">
                    <IconChevronDown className="h-4 w-4" />
                  </div>
                )}
              </span>
            </button>
            {isOpen && (
              <p className="mt-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed pl-1">
                {faq.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
