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

// Vibrant category theme mapping
const CATEGORY_STYLES: Record<string, {
  badge: string;
  accentBar: string;
  numberBg: string;
  glow: string;
  lightBg: string;
}> = {
  "about-you": {
    badge: "bg-purple-100 text-purple-800 border-purple-200/80 shadow-xs",
    accentBar: "border-l-purple-600",
    numberBg: "bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white shadow-md shadow-purple-500/30",
    glow: "hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10",
    lightBg: "from-purple-50/40 via-white to-white",
  },
  "experience": {
    badge: "bg-blue-100 text-blue-800 border-blue-200/80 shadow-xs",
    accentBar: "border-l-blue-600",
    numberBg: "bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/30",
    glow: "hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10",
    lightBg: "from-blue-50/40 via-white to-white",
  },
  "behavioral": {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200/80 shadow-xs",
    accentBar: "border-l-emerald-600",
    numberBg: "bg-gradient-to-br from-emerald-500 via-teal-600 to-green-600 text-white shadow-md shadow-emerald-500/30",
    glow: "hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10",
    lightBg: "from-emerald-50/40 via-white to-white",
  },
  "job": {
    badge: "bg-amber-100 text-amber-800 border-amber-200/80 shadow-xs",
    accentBar: "border-l-amber-500",
    numberBg: "bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white shadow-md shadow-amber-500/30",
    glow: "hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/10",
    lightBg: "from-amber-50/40 via-white to-white",
  },
  "closing": {
    badge: "bg-rose-100 text-rose-800 border-rose-200/80 shadow-xs",
    accentBar: "border-l-rose-500",
    numberBg: "bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 text-white shadow-md shadow-rose-500/30",
    glow: "hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/10",
    lightBg: "from-rose-50/40 via-white to-white",
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
            { key: "all", label: "All 20 Questions", color: "from-blue-600 via-indigo-600 to-violet-600" },
            { key: "about-you", label: "About You (1-4)", color: "from-purple-600 via-indigo-600 to-purple-700" },
            { key: "experience", label: "Experience (5-8)", color: "from-blue-600 via-indigo-600 to-cyan-600" },
            { key: "behavioral", label: "Behavioral (9-13)", color: "from-emerald-600 via-teal-600 to-green-600" },
            { key: "job", label: "Job & Company (14-18)", color: "from-amber-600 via-orange-600 to-amber-700" },
            { key: "closing", label: "Closing (19-20)", color: "from-rose-600 via-pink-600 to-rose-700" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeCategory === tab.key
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-md shadow-indigo-500/25 scale-[1.04]`
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-xs hover:scale-[1.02]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto text-xs font-bold text-slate-500">
          <button
            type="button"
            onClick={expandAll}
            className="hover:text-blue-600 transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="hover:text-blue-600 transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Accordion List with High-End Cards, Gradients, and Drop Shadows */}
      <div className="mt-8 space-y-4 sm:space-y-5">
        {filteredQuestions.map((q) => {
          const isOpen = !!openItems[q.id];
          const style = CATEGORY_STYLES[q.category] || CATEGORY_STYLES["about-you"];

          return (
            <div
              key={q.id}
              id={`q${q.id}`}
              className={`scroll-mt-24 rounded-3xl border transition-all duration-300 ${
                isOpen
                  ? `border-slate-300/90 shadow-xl bg-gradient-to-b ${style.lightBg} ${style.accentBar} border-l-[6px]`
                  : `border-slate-200 bg-white hover:border-slate-300 hover:shadow-md ${style.glow}`
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(q.id)}
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl font-black text-xs shadow-sm transition-transform duration-300 group-hover:scale-110 ${style.numberBg}`}>
                    {q.id}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {q.question}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${style.badge}`}>
                        {q.categoryLabel}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pt-1 text-slate-400 group-hover:text-slate-700 transition-colors">
                  {isOpen ? (
                    <div className="h-8 w-8 rounded-full bg-slate-100/90 flex items-center justify-center text-slate-800 shadow-2xs">
                      <IconChevronUp className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 shadow-2xs transition-colors">
                      <IconChevronDown className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-200/60 px-5 sm:px-7 pt-5 pb-7 space-y-5">
                  {q.note && (
                    <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/90 via-violet-50/70 to-white p-4 text-xs text-indigo-950 font-medium shadow-2xs flex items-center gap-2.5">
                      <span className="text-base">💡</span>
                      <div>
                        <strong className="font-bold text-indigo-900">Key Framework:</strong> {q.note}
                      </div>
                    </div>
                  )}

                  {/* 2 Insights Cards */}
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold uppercase tracking-wider text-[11px] mb-2.5">
                        <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                          <IconTarget className="h-3.5 w-3.5" />
                        </div>
                        <span>What they want to know</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">{q.whatTheyWant}</p>
                    </div>

                    <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white p-5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold uppercase tracking-wider text-[11px] mb-2.5">
                        <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                          <IconCompass className="h-3.5 w-3.5" />
                        </div>
                        <span>How to answer</span>
                      </div>
                      <p className="text-blue-950 leading-relaxed font-medium">{q.howToAnswer}</p>
                    </div>
                  </div>

                  {/* Adaptable Sample Answer Card (Luxury Dark Slate with Golden Sparkle & Glow) */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-slate-100 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800/80">
                      <span className="text-[11px] font-bold tracking-wider text-amber-300 uppercase flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 text-amber-400">
                          <IconSparkles className="h-3.5 w-3.5 animate-pulse" />
                        </span>
                        <span>Adaptable Winning Sample Answer</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(q.id, q.example)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95 border border-slate-700/60"
                        title="Copy sample answer"
                      >
                        {copiedId === q.id ? (
                          <>
                            <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <IconCopy className="h-3.5 w-3.5 text-slate-400" />
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 group"
                      >
                        <span className="underline">{q.guideLink.text}</span>
                        <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
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
    <div className="divide-y divide-slate-200/80 rounded-3xl border border-slate-200/90 bg-white shadow-md overflow-hidden">
      {HUB_FAQS.map((faq, idx) => {
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
