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
  IconVolume2 
} from "@/components/interview-questions/Icons";
import { 
  SAMPLE_ANSWERS, 
  GUIDE_FAQS 
} from "@/components/interview-questions/data";

export function InteractiveAnswerBuilder() {
  const defaultFields = {
    currentRole: "customer service rep",
    experience: "three years of experience in fast-paced teams",
    mainSkill: "calming difficult situations and resolving issues fast",
    context: "last position",
    achievement: "trained new hires and our team's satisfaction ratings rose by 15%",
    nextGoal: "a role where I can step into team leadership",
    companyFit: "your company has an outstanding culture of customer care",
  };

  const [fields, setFields] = useState(defaultFields);
  const [copied, setCopied] = useState(false);

  const handleChange = (key: keyof typeof defaultFields, val: string) => {
    setFields((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setFields(defaultFields);
  };

  const fullAnswer = `I'm a ${fields.currentRole || "[current role]"} with ${fields.experience || "[experience]"}, and I'm best at ${fields.mainSkill || "[main skill]"}. In my ${fields.context || "[context]"}, I ${fields.achievement || "[achievement]"}. I'm now looking for ${fields.nextGoal || "[next goal]"}, and this role stood out because ${fields.companyFit || "[company fit]"}.`;

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
    <div className="relative rounded-3xl p-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-xl">
      <div className="rounded-[22px] bg-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-800 mb-2">
              <IconSparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
              INTERACTIVE TOOL
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              60-Second Answer Builder
            </h3>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Customize the slots below to generate your tailored present-past-future pitch.
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

        {/* Inputs grid with clean floating look */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              1. Current role or field
            </label>
            <input
              type="text"
              value={fields.currentRole}
              onChange={(e) => handleChange("currentRole", e.target.value)}
              placeholder="e.g. software engineer, nursing graduate"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              2. Years or type of experience
            </label>
            <input
              type="text"
              value={fields.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
              placeholder="e.g. 4 years of experience building web apps"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              3. Main skill the job needs
            </label>
            <input
              type="text"
              value={fields.mainSkill}
              onChange={(e) => handleChange("mainSkill", e.target.value)}
              placeholder="e.g. designing scalable backend APIs"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              4. Current or last role / course / project
            </label>
            <input
              type="text"
              value={fields.context}
              onChange={(e) => handleChange("context", e.target.value)}
              placeholder="e.g. last position at Acme Corp"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-800 mb-1.5">
              5. Key achievement with a tangible result
            </label>
            <input
              type="text"
              value={fields.achievement}
              onChange={(e) => handleChange("achievement", e.target.value)}
              placeholder="e.g. cut checkout latency by 40% and improved team velocity"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              6. What you want next
            </label>
            <input
              type="text"
              value={fields.nextGoal}
              onChange={(e) => handleChange("nextGoal", e.target.value)}
              placeholder="e.g. a role solving larger-scale distributed problems"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              7. Something specific about the job or company
            </label>
            <input
              type="text"
              value={fields.companyFit}
              onChange={(e) => handleChange("companyFit", e.target.value)}
              placeholder="e.g. your engineering blog and commitment to open source"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Live Pitch Preview Box with Rich Dark Styling */}
        <div className="mt-8 rounded-2xl border border-indigo-900/60 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-[11px] font-bold text-indigo-300">
                <IconVolume2 className="h-3.5 w-3.5 text-indigo-400 animate-pulse" /> Live Pitch Preview
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <IconClock className="h-3.5 w-3.5 text-slate-400" /> ~{estimatedSeconds}s spoken time ({wordCount} words)
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <IconCheck className="h-3.5 w-3.5 text-emerald-300" /> Copied!
                </>
              ) : (
                <>
                  <IconCopy className="h-3.5 w-3.5" /> Copy My Answer
                </>
              )}
            </button>
          </div>

          <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-serif italic pt-1">
            "{fullAnswer}"
          </p>

          <p className="mt-4 text-[11px] text-slate-400 font-medium">
            💡 <strong>Executive Tip:</strong> Read this out loud at normal conversational speed. If it takes longer than 90 seconds, trim the achievement to just one core metric.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SampleAnswersSection() {
  const [activeTab, setActiveTab] = useState<string>("no-experience");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedAnswer = SAMPLE_ANSWERS.find((s) => s.id === activeTab) || SAMPLE_ANSWERS[0];

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="w-full">
      {/* Category Tabs with Vibrant active styles */}
      <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-200">
        {SAMPLE_ANSWERS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => setActiveTab(sample.id)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 cursor-pointer ${
              activeTab === sample.id
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 scale-105"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-2xs hover:scale-102"
            }`}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Active Sample Card */}
      <div className="mt-6 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 via-white to-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-200/60">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Sample Answer:
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {selectedAnswer.label} <span className="text-sm font-normal text-slate-500">({selectedAnswer.role})</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(selectedAnswer.id, selectedAnswer.text)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer self-start sm:self-auto shadow-xs active:scale-95"
          >
            {copiedId === selectedAnswer.id ? (
              <>
                <IconCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <IconCopy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy Answer</span>
              </>
            )}
          </button>
        </div>

        <blockquote className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-50/60 via-indigo-50/20 to-white p-6 text-sm sm:text-base leading-relaxed text-slate-900 font-serif italic shadow-2xs">
          "{selectedAnswer.text}"
        </blockquote>

        <div className="mt-4 rounded-xl bg-blue-100/70 border border-blue-200/80 p-4 text-xs text-blue-950 font-medium shadow-2xs">
          🔍 <strong>Why this works:</strong> {selectedAnswer.note}
        </div>
      </div>
    </div>
  );
}

export function GuideFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200/80 rounded-3xl border border-slate-200/90 bg-white shadow-md overflow-hidden">
      {GUIDE_FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className={`p-5 sm:p-6 transition-colors ${isOpen ? "bg-gradient-to-r from-blue-50/40 via-white to-white" : "hover:bg-slate-50/50"}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm sm:text-base cursor-pointer group"
            >
              <span className="group-hover:text-blue-600 transition-colors font-black">{faq.q}</span>
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
