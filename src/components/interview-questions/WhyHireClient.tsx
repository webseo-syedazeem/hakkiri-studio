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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <IconSparkles className="h-5 w-5 text-amber-500" />
            3-Sentence Pitch Builder
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Fill in the blanks to formulate your proven Need-Proof-Value pitch under 60 seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <IconRotateCcw className="h-3.5 w-3.5" /> Reset Template
        </button>
      </div>

      {/* Input slots */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            1. Their need (Skill 1)
          </label>
          <input
            type="text"
            value={fields.skill1}
            onChange={(e) => handleChange("skill1", e.target.value)}
            placeholder="e.g. write reliable code"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            2. Their need (Skill 2)
          </label>
          <input
            type="text"
            value={fields.skill2}
            onChange={(e) => handleChange("skill2", e.target.value)}
            placeholder="e.g. collaborate with cross-functional teams"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            3. Where you did it (Role / Project)
          </label>
          <input
            type="text"
            value={fields.role}
            onChange={(e) => handleChange("role", e.target.value)}
            placeholder="e.g. current role at Acme"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            4. Your proof (Example with a metric / result)
          </label>
          <input
            type="text"
            value={fields.example}
            onChange={(e) => handleChange("example", e.target.value)}
            placeholder="e.g. cut checkout latency by 40% with design and product"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            5. Your personal strength
          </label>
          <input
            type="text"
            value={fields.strength}
            onChange={(e) => handleChange("strength", e.target.value)}
            placeholder="e.g. mix of hands-on coding and clear communication"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            6. What they get (Goal from job description)
          </label>
          <input
            type="text"
            value={fields.goal}
            onChange={(e) => handleChange("goal", e.target.value)}
            placeholder="e.g. scale the payment platform reliably from day one"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="mt-8 rounded-2xl border-2 border-blue-200/80 bg-gradient-to-br from-blue-50/60 via-slate-50 to-white p-6 relative">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
              <IconVolume2 className="h-3 w-3" /> Live 3-Sentence Pitch
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              <IconClock className="h-3 w-3 text-slate-400" /> ~{estimatedSeconds}s spoken time ({wordCount} words)
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <IconCheck className="h-3.5 w-3.5" /> Copied!
              </>
            ) : (
              <>
                <IconCopy className="h-3.5 w-3.5" /> Copy My Pitch
              </>
            )}
          </button>
        </div>

        <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-serif italic">
          "{fullAnswer}"
        </p>

        <p className="mt-4 text-[11px] text-slate-500">
          💡 <strong>Rule of thumb:</strong> Keep it between 30 and 60 seconds. Make sure sentence 1 names their need, sentence 2 gives your proof, and sentence 3 names their direct value.
        </p>
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
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === sample.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Active Situation Card */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Sample Answer:
            </span>
            <h3 className="text-lg font-black text-slate-900">
              {selectedAnswer.label} <span className="text-sm font-normal text-slate-500">({selectedAnswer.role})</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(selectedAnswer.id, selectedAnswer.text)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer self-start sm:self-auto"
          >
            {copiedId === selectedAnswer.id ? (
              <>
                <IconCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <IconCopy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy Answer</span>
              </>
            )}
          </button>
        </div>

        <blockquote className="rounded-xl border border-slate-100 bg-slate-50/80 p-5 text-sm sm:text-base leading-relaxed text-slate-800 font-serif italic">
          "{selectedAnswer.text}"
        </blockquote>

        {selectedAnswer.note && (
          <div className="mt-4 rounded-lg bg-blue-50/70 p-3 text-xs text-blue-900 font-medium">
            🔍 <strong>Why this works:</strong> {selectedAnswer.note}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
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
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Showing <strong>{filteredJobs.length}</strong> role-specific answers.
        </p>
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter by job title (e.g. engineer, nurse, sales)..."
          className="w-full max-w-xs rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden"
        />
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">
                  {job.label}
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopy(job.id, job.text)}
                  className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
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

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>Formula: Need · Proof · Value</span>
              {copiedId === job.id && (
                <span className="text-emerald-600 font-semibold">Copied!</span>
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
    <div className="divide-y divide-slate-200/80 rounded-2xl border border-slate-200 bg-white">
      {WHY_HIRE_FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="p-4 sm:p-5">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm sm:text-base cursor-pointer"
            >
              <span>{faq.q}</span>
              <span className="shrink-0 text-slate-400">
                {isOpen ? <IconChevronUp className="h-4 w-4" /> : <IconChevronDown className="h-4 w-4" />}
              </span>
            </button>
            {isOpen && (
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {faq.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
