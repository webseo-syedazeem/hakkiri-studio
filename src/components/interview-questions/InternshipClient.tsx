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
  INTERNSHIP_FIELD_ANSWERS, 
  INTERNSHIP_FAQS 
} from "@/components/interview-questions/data";

export function InternshipAnswerBuilder() {
  const defaultFields = {
    year: "third-year",
    major: "marketing",
    school: "university",
    area: "social media and content analytics",
    activity: "ran the Instagram account for our campus film society",
    result: "increased engagement by 60% through short student video reviews",
    skill: "how top creative agencies build multi-channel campaigns",
    companyFit: "your recent brand strategy work for local startups",
  };

  const [fields, setFields] = useState(defaultFields);
  const [copied, setCopied] = useState(false);

  const handleChange = (key: keyof typeof defaultFields, val: string) => {
    setFields((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setFields(defaultFields);
  };

  const fullAnswer = `I'm a ${fields.year || "[year]"} ${fields.major || "[major]"} student at ${fields.school || "[school]"}, and I'm especially interested in ${fields.area || "[area of the field]"}. Recently, I ${fields.activity || "[project, club, job or volunteering]"}, where I ${fields.result || "[what you did and the result]"}. I'm applying for this internship because I want to learn ${fields.skill || "[skill]"}, and ${fields.companyFit || "[something specific about the company]"} really appeals to me.`;

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
    <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-b from-white via-blue-50/20 to-white p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <IconSparkles className="h-5 w-5 text-amber-500" />
            Build Your Internship Answer in 2 Minutes
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Fill in the blanks, practice saying it out loud, and keep it under 60 seconds.
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
            1. Current year (e.g. second-year, junior, senior)
          </label>
          <input
            type="text"
            value={fields.year}
            onChange={(e) => handleChange("year", e.target.value)}
            placeholder="e.g. third-year"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            2. Major or field of study
          </label>
          <input
            type="text"
            value={fields.major}
            onChange={(e) => handleChange("major", e.target.value)}
            placeholder="e.g. computer science, business, biology"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            3. School or college name
          </label>
          <input
            type="text"
            value={fields.school}
            onChange={(e) => handleChange("school", e.target.value)}
            placeholder="e.g. State University"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            4. Area of the field you enjoy most
          </label>
          <input
            type="text"
            value={fields.area}
            onChange={(e) => handleChange("area", e.target.value)}
            placeholder="e.g. backend systems, patient care, finance"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            5. Recent project, club, part-time job or volunteering
          </label>
          <input
            type="text"
            value={fields.activity}
            onChange={(e) => handleChange("activity", e.target.value)}
            placeholder="e.g. led a four-person final project to build an app"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            6. What you did and the tangible result
          </label>
          <input
            type="text"
            value={fields.result}
            onChange={(e) => handleChange("result", e.target.value)}
            placeholder="e.g. presented findings to class and got the highest score"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            7. What practical skill you want to learn
          </label>
          <input
            type="text"
            value={fields.skill}
            onChange={(e) => handleChange("skill", e.target.value)}
            placeholder="e.g. how a production team ships code"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            8. Something specific about this company
          </label>
          <input
            type="text"
            value={fields.companyFit}
            onChange={(e) => handleChange("companyFit", e.target.value)}
            placeholder="e.g. your mentorship program and culture"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="mt-8 rounded-2xl border-2 border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white p-6 relative">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-indigo-100">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-800">
              <IconVolume2 className="h-3 w-3" /> Live Pitch Preview
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              <IconClock className="h-3 w-3 text-slate-400" /> ~{estimatedSeconds}s spoken time ({wordCount} words)
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <IconCheck className="h-3.5 w-3.5" /> Copied!
              </>
            ) : (
              <>
                <IconCopy className="h-3.5 w-3.5" /> Copy My Answer
              </>
            )}
          </button>
        </div>

        <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-serif italic">
          "{fullAnswer}"
        </p>

        <p className="mt-4 text-[11px] text-slate-500">
          💡 <strong>Tip for interns:</strong> Speak at a calm, enthusiastic pace. You don't need years of work experience—interviewers care about your coachability and genuine excitement!
        </p>
      </div>
    </div>
  );
}

export function InternshipFieldTabs() {
  const [activeTab, setActiveTab] = useState<string>("marketing");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedAnswer = INTERNSHIP_FIELD_ANSWERS.find((s) => s.id === activeTab) || INTERNSHIP_FIELD_ANSWERS[0];

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
        {INTERNSHIP_FIELD_ANSWERS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => setActiveTab(sample.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === sample.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Active Card */}
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
    </div>
  );
}

export function InternshipFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200/80 rounded-2xl border border-slate-200 bg-white">
      {INTERNSHIP_FAQS.map((faq, idx) => {
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
