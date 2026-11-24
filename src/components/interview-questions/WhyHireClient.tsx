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
  WHY_HIRE_SITUATION_ANSWERS, 
  WHY_HIRE_JOB_ANSWERS, 
  WHY_HIRE_FAQS 
} from "@/components/interview-questions/data";

export function WhyHireAnswerBuilder() {
  const defaultFields = {
    skill1: "handle a high volume of requests",
    skill2: "calm down stressful situations",
    role: "last role at a high-growth service team",
    example: "handled 60+ cases daily with a 98% satisfaction score",
    strength: "focus and patience under pressure",
    goal: "keep response times low and customer satisfaction high",
  };

  const [fields, setFields] = useState(defaultFields);
  const [copied, setCopied] = useState(false);

  const handleChange = (key: keyof typeof defaultFields, val: string) => {
    setFields((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setFields(defaultFields);
  };

  const fullAnswer = `From the job description, I can see you need someone who can ${fields.skill1 || "[skill 1]"} and ${fields.skill2 || "[skill 2]"}. In my ${fields.role || "[current or last role / project]"}, I ${fields.example || "[example with a result]"}. I can bring the same ${fields.strength || "[strength]"} to your team and help you ${fields.goal || "[goal from the job description]"}.`;

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
    <div className="relative rounded-3xl p-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 shadow-xl">
      <div className="rounded-[22px] bg-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800 mb-2">
              <IconSparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              INTERACTIVE TOOL
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              3-Sentence Pitch Builder
            </h3>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Fill in the blanks to formulate your proven Need-Proof-Value pitch under 60 seconds.
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

        {/* Input slots with modern styling */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              1. Their need (Skill 1)
            </label>
            <input
              type="text"
              value={fields.skill1}
              onChange={(e) => handleChange("skill1", e.target.value)}
              placeholder="e.g. write reliable code"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              2. Their need (Skill 2)
            </label>
            <input
              type="text"
              value={fields.skill2}
              onChange={(e) => handleChange("skill2", e.target.value)}
              placeholder="e.g. collaborate with cross-functional teams"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              3. Where you did it (Role / Project)
            </label>
            <input
              type="text"
              value={fields.role}
              onChange={(e) => handleChange("role", e.target.value)}
              placeholder="e.g. current role at Acme"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              4. Your proof (Example with a metric / result)
            </label>
            <input
              type="text"
              value={fields.example}
              onChange={(e) => handleChange("example", e.target.value)}
              placeholder="e.g. cut checkout latency by 40% with design and product"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              5. Your personal strength
            </label>
            <input
              type="text"
              value={fields.strength}
              onChange={(e) => handleChange("strength", e.target.value)}
              placeholder="e.g. mix of hands-on coding and clear communication"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              6. What they get (Goal from job description)
            </label>
            <input
              type="text"
              value={fields.goal}
              onChange={(e) => handleChange("goal", e.target.value)}
              placeholder="e.g. scale the payment platform reliably from day one"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Live Preview Box with Rich Dark Glass Styling */}
        <div className="mt-8 rounded-2xl border border-emerald-900/60 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[11px] font-bold text-emerald-300">
                <IconVolume2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> Live 3-Sentence Pitch
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <IconClock className="h-3.5 w-3.5 text-slate-400" /> ~{estimatedSeconds}s spoken time ({wordCount} words)
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <IconCheck className="h-3.5 w-3.5 text-emerald-300" /> Copied!
                </>
              ) : (
                <>
                  <IconCopy className="h-3.5 w-3.5" /> Copy My Pitch
                </>
              )}
            </button>
          </div>

          <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-serif italic pt-1">
            "{fullAnswer}"
          </p>

          <p className="mt-4 text-[11px] text-slate-400 font-medium">
            💡 <strong>Rule of thumb:</strong> Keep it between 30 and 60 seconds. Make sure sentence 1 names their need, sentence 2 gives your proof, and sentence 3 names their direct value.
          </p>
        </div>
      </div>
    </div>
  );
}

export function WhyHireSituationTabs() {
  const [activeTab, setActiveTab] = useState<string>("no-experience");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedAnswer = WHY_HIRE_SITUATION_ANSWERS.find((s) => s.id === activeTab) || WHY_HIRE_SITUATION_ANSWERS[0];

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="w-full">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-200">
        {WHY_HIRE_SITUATION_ANSWERS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => setActiveTab(sample.id)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 cursor-pointer ${
              activeTab === sample.id
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white shadow-md shadow-emerald-500/25 scale-105"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-2xs hover:scale-102"
            }`}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Active Situation Card */}
      <div className="mt-6 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 via-white to-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-200/60">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
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

        <blockquote className="rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/60 via-teal-50/20 to-white p-6 text-sm sm:text-base leading-relaxed text-slate-900 font-serif italic shadow-2xs">
          "{selectedAnswer.text}"
        </blockquote>

        {selectedAnswer.note && (
          <div className="mt-4 rounded-xl bg-emerald-100/70 border border-emerald-200/80 p-4 text-xs text-emerald-950 font-medium shadow-2xs">
            🔍 <strong>Why this works:</strong> {selectedAnswer.note}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-600 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 font-medium">
        💡 <strong>Tip:</strong> Never criticize other candidates. Focus on your rare mix of skills and what you can deliver from week one.
      </div>
    </div>
  );
}

export function WhyHireJobGrid() {
  const [filterQuery, setFilterQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredJobs = WHY_HIRE_JOB_ANSWERS.filter((job) =>
    job.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
    job.text.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Search Filter */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-xs font-semibold text-slate-600">
          Showing <strong>{filteredJobs.length}</strong> profession-tailored answers.
        </p>
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter by role (e.g. engineer, nurse, sales)..."
          className="w-full max-w-sm rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all shadow-2xs"
        />
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <h4 className="text-sm font-black text-slate-900">
                  {job.label}
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopy(job.id, job.text)}
                  className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Copy answer"
                >
                  {copiedId === job.id ? (
                    <IconCheck className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <IconCopy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <blockquote className="text-xs italic leading-relaxed text-slate-700 font-serif">
                "{job.text}"
              </blockquote>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="text-emerald-700 font-semibold">Formula: Need · Proof · Value</span>
              {copiedId === job.id && (
                <span className="text-emerald-600 font-bold">Copied!</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WhyHireFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200/80 rounded-3xl border border-slate-200/90 bg-white shadow-md overflow-hidden">
      {WHY_HIRE_FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className={`p-5 sm:p-6 transition-colors ${isOpen ? "bg-gradient-to-r from-emerald-50/40 via-white to-white" : "hover:bg-slate-50/50"}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm sm:text-base cursor-pointer group"
            >
              <span className="group-hover:text-emerald-600 transition-colors font-black">{faq.q}</span>
              <span className="shrink-0 text-slate-400">
                {isOpen ? (
                  <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                    <IconChevronUp className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shadow-2xs">
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
