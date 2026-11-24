"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  IconCheck, 
  IconCopy, 
  IconChevronDown, 
  IconChevronUp, 
  IconSparkles,
  IconTarget,
  IconCompass,
  IconArrowRight
} from "@/components/interview-questions/Icons";
import { 
  QUESTIONS_DATA, 
  HUB_FAQS, 
  type QuestionItem 
} from "@/components/interview-questions/data";

// Vibrant Category styling mapping
const CATEGORY_STYLES: Record<string, {
  badge: string;
  pillBorder: string;
  accentBar: string;
  numberBg: string;
  cardGlow: string;
}> = {
  "about-you": {
    badge: "bg-purple-100/90 text-purple-800 border-purple-200",
    pillBorder: "border-purple-300",
    accentBar: "border-l-purple-500",
    numberBg: "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/25",
    cardGlow: "hover:border-purple-300 hover:shadow-purple-500/10",
  },
  "experience": {
    badge: "bg-blue-100/90 text-blue-800 border-blue-200",
    pillBorder: "border-blue-300",
    accentBar: "border-l-blue-500",
    numberBg: "bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/25",
    cardGlow: "hover:border-blue-300 hover:shadow-blue-500/10",
  },
  "behavioral": {
    badge: "bg-emerald-100/90 text-emerald-800 border-emerald-200",
    pillBorder: "border-emerald-300",
    accentBar: "border-l-emerald-500",
    numberBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25",
    cardGlow: "hover:border-emerald-300 hover:shadow-emerald-500/10",
  },
  "job": {
    badge: "bg-amber-100/90 text-amber-800 border-amber-200",
    pillBorder: "border-amber-300",
    accentBar: "border-l-amber-500",
    numberBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/25",
    cardGlow: "hover:border-amber-300 hover:shadow-amber-500/10",
  },
  "closing": {
    badge: "bg-rose-100/90 text-rose-800 border-rose-200",
    pillBorder: "border-rose-300",
    accentBar: "border-l-rose-500",
    numberBg: "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/25",
    cardGlow: "hover:border-rose-300 hover:shadow-rose-500/10",
  },
};

export function QuestionsAccordion() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const toggleItem = (id: number) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    QUESTIONS_DATA.forEach((q) => { all[q.id] = true; });
    setOpenItems(all);
  };

  const collapseAll = () => {
    setOpenItems({});
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
      {/* Category Filter Tabs & Expand All Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All 20 Questions", color: "from-blue-600 to-indigo-600" },
            { key: "about-you", label: "About You (1-4)", color: "from-purple-600 to-indigo-600" },
            { key: "experience", label: "Experience (5-8)", color: "from-blue-600 to-cyan-600" },
            { key: "behavioral", label: "Behavioral (9-13)", color: "from-emerald-600 to-teal-600" },
            { key: "job", label: "Job & Company (14-18)", color: "from-amber-600 to-orange-600" },
            { key: "closing", label: "Closing (19-20)", color: "from-rose-600 to-pink-600" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeCategory === tab.key
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-md shadow-blue-500/20 scale-105`
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-semibold text-slate-500">
          <button
            type="button"
            onClick={expandAll}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={collapseAll}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Accordion List with Rich Theme Badges and Glow Borders */}
      <div className="mt-8 space-y-5">
        {filteredQuestions.map((q) => {
          const isOpen = !!openItems[q.id];
          const style = CATEGORY_STYLES[q.category] || CATEGORY_STYLES["about-you"];

          return (
            <div
              key={q.id}
              id={`q${q.id}`}
              className={`scroll-mt-24 rounded-2xl border bg-white shadow-xs transition-all duration-300 ${
                isOpen
                  ? `border-slate-300/90 shadow-md ${style.accentBar} border-l-4`
                  : `border-slate-200 hover:border-slate-300 hover:shadow-sm ${style.cardGlow}`
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(q.id)}
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-xs shadow-sm ${style.numberBg}`}>
                    {q.id}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {q.question}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${style.badge}`}>
                        {q.categoryLabel}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pt-1 text-slate-400 group-hover:text-slate-700 transition-colors">
                  {isOpen ? (
                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                      <IconChevronUp className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100">
                      <IconChevronDown className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-5 sm:px-6 pt-5 pb-7 space-y-5 animate-fadeIn">
                  {q.note && (
                    <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-violet-50/60 to-white p-4 text-xs text-indigo-950 font-medium shadow-2xs">
                      💡 <strong>Key Framework:</strong> {q.note}
                    </div>
                  )}

                  {/* 2 Colored Insights Cards */}
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50/90 to-white p-4 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold uppercase tracking-wider text-[11px] mb-2">
                        <IconTarget className="h-4 w-4 text-slate-600" />
                        What they want to know
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">{q.whatTheyWant}</p>
                    </div>

                    <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white p-4 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold uppercase tracking-wider text-[11px] mb-2">
                        <IconCompass className="h-4 w-4 text-blue-600" />
                        How to answer
                      </div>
                      <p className="text-blue-950 leading-relaxed font-medium">{q.howToAnswer}</p>
                    </div>
                  </div>

                  {/* Adaptable Sample Answer Card (Premium Dark Slate with Glow & Top Header) */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 text-slate-100 shadow-md">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                      <span className="text-[11px] font-bold tracking-wider text-amber-300 uppercase flex items-center gap-1.5">
                        <IconSparkles className="h-4 w-4 text-amber-400 animate-pulse" /> Adaptable Winning Sample Answer
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(q.id, q.example)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Copy sample answer"
                      >
                        {copiedId === q.id ? (
                          <>
                            <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <IconCopy className="h-3.5 w-3.5" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                    <blockquote className="text-sm sm:text-base italic leading-relaxed text-slate-100 font-serif">
                      "{q.example}"
                    </blockquote>
                  </div>

                  {q.guideLink && (
                    <div className="pt-2 flex items-center justify-between">
                      <Link
                        href={q.guideLink.href}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline group"
                      >
                        <span>{q.guideLink.text}</span>
                        <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        Formula + In-depth role breakdowns
                      </span>
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
    <div className="divide-y divide-slate-200/80 rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
      {HUB_FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className={`p-5 transition-colors ${isOpen ? "bg-slate-50/70" : "hover:bg-slate-50/40"}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm sm:text-base cursor-pointer group"
            >
              <span className="group-hover:text-blue-600 transition-colors">{faq.q}</span>
              <span className="shrink-0 text-slate-400">
                {isOpen ? (
                  <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <IconChevronUp className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                    <IconChevronDown className="h-4 w-4" />
                  </div>
                )}
              </span>
            </button>
            {isOpen && (
              <p className="mt-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed pl-1 animate-fadeIn">
                {faq.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
