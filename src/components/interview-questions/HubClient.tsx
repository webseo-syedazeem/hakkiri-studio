"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  IconCheck, 
  IconCopy, 
  IconChevronDown, 
  IconChevronUp, 
  IconSparkles 
} from "@/components/interview-questions/Icons";
import { 
  QUESTIONS_DATA, 
  HUB_FAQS, 
  type QuestionItem 
} from "@/components/interview-questions/data";

export function QuestionsAccordion() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const toggleItem = (id: number) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: number, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredQuestions = activeCategory === "all"
    ? QUESTIONS_DATA
    : QUESTIONS_DATA.filter((q) => q.category === activeCategory);

  return (
    <div className="w-full">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-200">
        {[
          { key: "all", label: "All 20 Questions" },
          { key: "about-you", label: "About You (1-4)" },
          { key: "experience", label: "Experience (5-8)" },
          { key: "behavioral", label: "Behavioral (9-13)" },
          { key: "job", label: "Job & Company (14-18)" },
          { key: "closing", label: "Closing (19-20)" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === tab.key
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="mt-6 space-y-4">
        {filteredQuestions.map((q) => {
          const isOpen = !!openItems[q.id];
          return (
            <div
              key={q.id}
              id={`q${q.id}`}
              className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all hover:border-slate-300"
            >
              <button
                type="button"
                onClick={() => toggleItem(q.id)}
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between gap-4 p-5 text-left cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 font-bold text-xs text-blue-700">
                    {q.id}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {q.question}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {q.categoryLabel}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 pt-1 text-slate-400">
                  {isOpen ? <IconChevronUp className="h-5 w-5" /> : <IconChevronDown className="h-5 w-5" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-5 pt-4 pb-6 space-y-4">
                  {q.note && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 text-xs text-indigo-900 font-medium">
                      💡 <strong>Key Framework:</strong> {q.note}
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-1">
                        What they want to know
                      </span>
                      <p className="text-slate-700 leading-relaxed">{q.whatTheyWant}</p>
                    </div>

                    <div className="rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/60">
                      <span className="font-bold text-blue-900 uppercase tracking-wider text-[10px] block mb-1">
                        How to answer
                      </span>
                      <p className="text-blue-950 leading-relaxed">{q.howToAnswer}</p>
                    </div>
                  </div>

                  {/* Sample Answer Box */}
                  <div className="relative rounded-xl border border-slate-200 bg-slate-900 p-4 text-slate-100 shadow-sm">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                        <IconSparkles className="h-3.5 w-3.5 text-amber-400" /> Adaptable Sample Answer
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(q.id, q.example)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                        title="Copy sample answer"
                      >
                        {copiedId === q.id ? (
                          <>
                            <IconCheck className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <IconCopy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <blockquote className="text-sm italic leading-relaxed text-slate-200 font-serif">
                      "{q.example}"
                    </blockquote>
                  </div>

                  {q.guideLink && (
                    <div className="pt-1">
                      <Link
                        href={q.guideLink.href}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {q.guideLink.text}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HubFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200/80 rounded-2xl border border-slate-200 bg-white">
      {HUB_FAQS.map((faq, idx) => {
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
