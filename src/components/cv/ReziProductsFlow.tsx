"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export function ReziProductsFlow() {
  const [activeTab, setActiveTab] = useState<"build" | "score" | "target">("build");

  // Customize preview state (Screenshot 2)
  const [selectedColor, setSelectedColor] = useState<string>("#2563eb");
  const [profilePic, setProfilePic] = useState<boolean>(false);
  const [showDividers, setShowDividers] = useState<boolean>(true);

  // Score tab preview state (Screenshot 3)
  // Toggles between initial audit (58 Needs improvement) and optimized (95 Excellent)
  const [scoreState, setScoreState] = useState<"needs_improvement" | "excellent">("needs_improvement");

  // Keyword targeting state (Screenshot 4)
  const [targetedAdded, setTargetedAdded] = useState(false);

  // Template format filter (Screenshot 6)
  const [formatFilter, setFormatFilter] = useState<
    "popular" | "simple" | "modern" | "creative" | "compact"
  >("popular");

  return (
    <div className="space-y-16 w-full max-w-7xl mx-auto py-8">
      {/* =================================================================== */}
      {/* 1. THE 3-PHASE REZI FLOW: BUILD | SCORE | TARGET                     */}
      {/* =================================================================== */}
      <div className="rounded-3xl border border-line bg-gradient-to-b from-[#11121d] via-[#141523] to-[#0e0f18] p-6 sm:p-10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Column: Interactive Tab Selectors & Pitch */}
          <div className="w-full lg:w-5/12 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue/10 border border-blue/20 text-blue text-xs font-bold uppercase tracking-wider">
              <span>✦</span> The Rezi-Engineered Workflow
            </div>

            <div className="space-y-3">
              {/* Tab 1: Build */}
              <div
                onClick={() => setActiveTab("build")}
                className={clsx(
                  "p-5 rounded-2xl border transition-all cursor-pointer",
                  activeTab === "build"
                    ? "border-blue/50 bg-[#191b2c] shadow-lg shadow-blue/10"
                    : "border-transparent hover:bg-white/[0.03] opacity-60 hover:opacity-100"
                )}
              >
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Build
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  A resume that&apos;s ready before you apply. Clean sections, consistent spacing, ATS-compatible formatting — applied as you type, not after.
                </p>
                {activeTab === "build" && (
                  <div className="mt-4 flex items-center gap-3">
                    <Link
                      href="/apply/cvs"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-200 transition"
                    >
                      <span>Open Builder</span>
                      <span>→</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/10 mx-2" />

              {/* Tab 2: Score */}
              <div
                onClick={() => setActiveTab("score")}
                className={clsx(
                  "p-5 rounded-2xl border transition-all cursor-pointer",
                  activeTab === "score"
                    ? "border-blue/50 bg-[#191b2c] shadow-lg shadow-blue/10"
                    : "border-transparent hover:bg-white/[0.03] opacity-60 hover:opacity-100"
                )}
              >
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Score
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Know exactly where you stand. The Rezi Score breaks down your resume section by section. No guessing what&apos;s weak. You see it, then fix it.
                </p>
                {activeTab === "score" && (
                  <div className="mt-4 flex items-center gap-3">
                    <Link
                      href="/cv-audit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-200 transition"
                    >
                      <span>Check Your Score</span>
                      <span>→</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/10 mx-2" />

              {/* Tab 3: Target */}
              <div
                onClick={() => setActiveTab("target")}
                className={clsx(
                  "p-5 rounded-2xl border transition-all cursor-pointer",
                  activeTab === "target"
                    ? "border-blue/50 bg-[#191b2c] shadow-lg shadow-blue/10"
                    : "border-transparent hover:bg-white/[0.03] opacity-60 hover:opacity-100"
                )}
              >
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Target
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Match the job. Paste a job description and Rezi pulls every keyword you&apos;re missing. Add them in seconds and go from generic to targeted.
                </p>
                {activeTab === "target" && (
                  <div className="mt-4 flex items-center gap-3">
                    <Link
                      href="/apply/jobs/new"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-200 transition"
                    >
                      <span>Scan Job Description</span>
                      <span>→</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview Matching Rezi Mockup */}
          <div className="w-full lg:w-7/12 relative flex justify-center items-center min-h-[500px]">
            {/* The Background Stylized Paper Document */}
            <div className="w-full max-w-[520px] rounded-2xl bg-white text-slate-900 p-7 shadow-2xl border border-slate-200 font-sans text-xs select-none transition-all">
              {/* CV Header with Live Profile Pic */}
              <div className="flex items-center justify-center gap-3.5 pb-3">
                {profilePic && (
                  <div
                    className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden shadow-md ring-2 ring-offset-2 transition-all duration-300 animate-fadeIn"
                    style={{
                      outline: `2.5px solid ${selectedColor}`,
                      outlineOffset: "2px",
                    }}
                  >
                    <img
                      src="/sam.jpg"
                      alt="Charles Bloomberg"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={clsx(profilePic ? "text-left" : "text-center")}>
                  <h4
                    className="text-lg font-black tracking-tight transition-colors duration-200"
                    style={{ color: selectedColor }}
                  >
                    Charles Bloomberg
                  </h4>
                  <div className="text-[10px] text-slate-500 mt-0.5 space-x-1.5 font-sans">
                    <span>📍 Seoul, South Korea</span>
                    <span>•</span>
                    <span>✉ charlesbloomberg@gmail.com</span>
                    <span>•</span>
                    <span>in/bloomberg</span>
                  </div>
                </div>
              </div>

              {showDividers && <hr className="border-slate-300 my-2.5 transition-all" />}

              <div>
                <div
                  className="text-[10px] font-black uppercase tracking-wider mb-1 transition-colors duration-200"
                  style={{ color: selectedColor }}
                >
                  Professional Summary
                </div>
                <p className="text-[9.5px] text-slate-700 leading-relaxed">
                  Passion for building inspiring consumer software companies through industry-leading tech, design, and execution. An experienced early-stage global executive with an economics degree from the University of Wisconsin - Madison.
                </p>
              </div>

              {showDividers && <hr className="border-slate-300 my-2.5 transition-all" />}

              <div>
                <div
                  className="text-[10px] font-black uppercase tracking-wider mb-1.5 transition-colors duration-200"
                  style={{ color: selectedColor }}
                >
                  Professional Experience
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span style={{ color: selectedColor }} className="font-black">
                    CEO & Founder | Rezi
                  </span>
                  <span className="text-slate-500 font-normal">August 2015 – Present, Seoul</span>
                </div>
                <ul className="list-disc list-inside mt-1 space-y-1 text-[9px] text-slate-700 leading-normal">
                  <li>
                    Built Rezi - the most loved resume software in the world, trusted by over 2,227,254 users.
                  </li>
                  <li>
                    Architected the{" "}
                    <span className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-semibold underline decoration-emerald-500">
                      machine learning
                    </span>{" "}
                    models behind Rezi&apos;s AI resume writer, lifting quality scores 32%.
                  </li>
                  {targetedAdded && (
                    <li className="bg-blue-50 text-blue-900 p-1.5 rounded font-medium border border-blue-200 animate-fadeIn">
                      • Integrated Product Analyst benchmarks, optimizing customer conversion pipelines by 28%.
                    </li>
                  )}
                </ul>

                <div className="flex justify-between text-[10px] font-bold mt-2.5">
                  <span className="text-slate-900 font-bold">Web Developer | Kaplan</span>
                  <span className="text-slate-500 font-normal">May 2015 – November 2015</span>
                </div>
                <ul className="list-disc list-inside mt-1 space-y-1 text-[9px] text-slate-700 leading-normal">
                  {/* Under activeTab === "score", show the Rezi red flagged bullet if needs_improvement */}
                  {activeTab === "score" && scoreState === "needs_improvement" ? (
                    <li className="bg-rose-50 text-rose-900 p-1 rounded border border-rose-300 underline decoration-rose-500 animate-pulse">
                      • Managed SEO campaigns using Moz Analytics, monitored site performance, and prepared ranking reports that were shared with the management.
                    </li>
                  ) : (
                    <li>
                      • Managed SEO campaigns using Moz Analytics, lifting organic query visibility by 42%.
                    </li>
                  )}
                  <li>
                    • Executed Google Analytics tracking campaigns to maximize email re-marketing deployed via Salesforce.
                  </li>
                </ul>
              </div>
            </div>

            {/* FLOATING OVERLAY 1: "Customize" Card (Build Tab, Screenshot 2) */}
            {activeTab === "build" && (
              <div className="absolute top-4 right-2 sm:right-6 w-68 rounded-2xl bg-[#1b1c28]/95 border border-white/20 p-4.5 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-3.5 z-20">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>⚙</span> Customize
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono">Live Sync</span>
                </div>

                {/* Color Dots */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Color</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { hex: "#2563eb", name: "blue" },
                      { hex: "#14b8a6", name: "teal" },
                      { hex: "#f43f5e", name: "red" },
                      { hex: "#e11d48", name: "rose" },
                      { hex: "#a855f7", name: "purple" },
                      { hex: "#0f172a", name: "dark" },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setSelectedColor(c.hex)}
                        className={clsx(
                          "h-5 w-5 rounded-full transition transform hover:scale-110 cursor-pointer",
                          selectedColor === c.hex
                            ? "ring-2 ring-white ring-offset-2 ring-offset-[#1b1c28] scale-110"
                            : "opacity-80 hover:opacity-100"
                        )}
                        style={{ backgroundColor: c.hex }}
                        aria-label={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Profile Pic Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 flex items-center gap-1.5">
                    <span>👤</span> Profile Pic
                  </span>
                  <button
                    type="button"
                    onClick={() => setProfilePic(!profilePic)}
                    className={clsx(
                      "w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer",
                      profilePic ? "bg-blue" : "bg-slate-700"
                    )}
                    aria-label="Toggle profile picture"
                  >
                    <div
                      className={clsx(
                        "w-4 h-4 rounded-full bg-white transition-transform shadow-md",
                        profilePic ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {/* Dividers Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 flex items-center gap-1.5">
                    <span>—</span> Dividers
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDividers(!showDividers)}
                    className={clsx(
                      "w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer",
                      showDividers ? "bg-blue" : "bg-slate-700"
                    )}
                    aria-label="Toggle section dividers"
                  >
                    <div
                      className={clsx(
                        "w-4 h-4 rounded-full bg-white transition-transform shadow-md",
                        showDividers ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* FLOATING OVERLAY 2: "Rezi Score" Breakdown (Score Tab, Screenshot 3) */}
            {activeTab === "score" && (
              <div className="absolute top-2 right-2 sm:right-6 w-76 rounded-2xl bg-[#181926]/95 border border-white/20 p-5 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-3 z-20">
                {/* Semi-circular Speedometer SVG matching Screenshot 3 */}
                <div className="text-center relative pt-1">
                  <div className="relative w-44 h-22 mx-auto overflow-hidden">
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="8"
                      />
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="url(#reziScoreGrad)"
                        strokeWidth="8"
                        strokeDasharray="125.6"
                        strokeDashoffset={scoreState === "excellent" ? "20" : "68"}
                        className="transition-all duration-700 ease-out"
                      />
                      <defs>
                        <linearGradient id="reziScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f43f5e" />
                          <stop offset="40%" stopColor="#f59e0b" />
                          <stop offset="70%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                      <span className="text-2xl font-black text-white">
                        {scoreState === "excellent" ? 95 : 58}
                      </span>
                      <span
                        className={clsx(
                          "text-[10px] font-bold uppercase tracking-wider",
                          scoreState === "excellent" ? "text-emerald-400" : "text-amber-400"
                        )}
                      >
                        {scoreState === "excellent" ? "Excellent" : "Needs improvement"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {scoreState === "excellent"
                      ? "Surpasses ATS benchmark across 100% of tested enterprise systems."
                      : "Improve your Rezi score by making suggested adjustments in each category."}
                  </p>
                </div>

                {/* Score Breakdown List matching Screenshot 3 */}
                <div className="border-t border-white/10 pt-2.5 space-y-2 text-xs">
                  {[
                    { label: "Content", score: 95, state: "passed" },
                    { label: "Format", score: scoreState === "excellent" ? 92 : 11, state: scoreState === "excellent" ? "passed" : "needs_work" },
                    { label: "Optimization", score: scoreState === "excellent" ? 88 : 48, state: scoreState === "excellent" ? "passed" : "needs_work" },
                    { label: "Best Practices", score: 95, state: "passed" },
                    { label: "Application Ready", score: scoreState === "excellent" ? 90 : 11, state: scoreState === "excellent" ? "passed" : "needs_work" },
                  ].map((cat) => (
                    <div key={cat.label} className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                            cat.score >= 80
                              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          )}
                        >
                          {cat.score}
                        </span>
                        <span>{cat.label}</span>
                      </div>
                      <span
                        className={clsx(
                          "text-[11px] font-medium",
                          cat.score >= 80 ? "text-emerald-400" : "text-amber-400"
                        )}
                      >
                        {cat.score >= 80 ? "Passed" : "Needs work"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Interactive Fix Score Switch */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setScoreState(scoreState === "needs_improvement" ? "excellent" : "needs_improvement")
                    }
                    className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] font-bold text-white transition cursor-pointer text-center"
                  >
                    {scoreState === "needs_improvement" ? "✦ Preview 1-Click ATS Fix" : "↺ Reset to Raw Score (58)"}
                  </button>
                </div>
              </div>
            )}

            {/* FLOATING OVERLAY 3: "AI Keyword Targeting" (Target Tab, Screenshot 4) */}
            {activeTab === "target" && (
              <div className="absolute top-2 right-2 sm:right-6 w-80 rounded-2xl bg-[#181926]/95 border border-white/20 p-5 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-3.5 z-20">
                <div className="border-b border-white/10 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    AI Keyword Targeting
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Is this missing keyword relevant to your experience?
                  </p>
                </div>

                <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-2.5 text-center">
                  <span className="text-xs font-bold text-teal-300">Product Analyst</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetedAdded(true)}
                    className="flex-1 rounded-xl bg-blue hover:bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>👍</span>
                    <span>{targetedAdded ? "Added to CV!" : "YES, ADD BULLET POINT"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetedAdded(false)}
                    className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition cursor-pointer"
                  >
                    Skip
                  </button>
                </div>

                <div className="border-t border-white/10 pt-2 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Great work! You&apos;re ranking well for these keywords in the job description:
                  </span>
                  <div className="space-y-1 text-xs">
                    {["Marketing Strategy", "Analytics", "Marketing Objectives"].map((kw) => (
                      <div key={kw} className="flex items-center justify-between text-slate-300 text-[11px]">
                        <span>{kw}</span>
                        <span className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">
                          ✓
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1.5 border-t border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Consider adding the following keywords to your resume:
                    </span>
                    <div className="space-y-1 text-xs">
                      {["Product Analyst", "Content Design"].map((kw) => (
                        <div key={kw} className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span>{kw}</span>
                          <span className="h-3 w-3 rounded-full border border-slate-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. THE PROBLEM BANNER: ATS LOGOS (Screenshot 5)                     */}
      {/* =================================================================== */}
      <div className="rounded-3xl border border-line bg-[#0f1019] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-extrabold text-rose-400 uppercase tracking-wider">
            <span>⚠️</span> The Problem
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            You&apos;re not getting ghosted by humans
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl">
            Most companies use software called Applicant Tracking Systems (ATS) to screen resumes automatically before a recruiter touches them. If your resume isn&apos;t structured correctly, doesn&apos;t include the right keywords, or gets tripped up by a stray table or graphic — it&apos;s filtered out. Silently. Without explanation.
          </p>
        </div>

        {/* ATS Logo Bar matching Screenshot 5 */}
        <div className="mt-8 pt-8 border-t border-white/[0.08]">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Tested & Verified Across Major Enterprise ATS Gateways
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 items-center">
            {/* Ashby */}
            <div className="flex items-center gap-2 text-lg font-black tracking-tight text-indigo-400">
              <span className="text-xl font-serif">A</span>
              <span>Ashby</span>
            </div>
            {/* Greenhouse */}
            <div className="flex items-center gap-1.5 text-lg font-bold text-emerald-400">
              <span className="h-3 w-3 rounded-full bg-emerald-400 inline-block" />
              <span className="font-sans lowercase font-extrabold">greenhouse</span>
            </div>
            {/* Workday */}
            <div className="flex items-center gap-1 text-lg font-bold text-amber-400">
              <span className="font-sans lowercase">workday</span>
              <span className="text-xs text-amber-400 font-mono">.</span>
            </div>
            {/* BambooHR */}
            <div className="flex items-center gap-1 text-lg font-bold text-lime-400">
              <span className="font-sans lowercase">bamboo</span>
              <span className="font-sans uppercase text-white font-black">HR</span>
            </div>
            {/* Lever */}
            <div className="flex items-center gap-1 text-lg font-black uppercase text-teal-400 tracking-wider">
              <span>LEVER</span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. ATS-FRIENDLY RESUME FORMATS THAT LAND JOBS (Screenshot 6)        */}
      {/* =================================================================== */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ATS-friendly resume formats that land jobs
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Engineered to meet the precise technical specifications of enterprise applicant tracking systems while looking beautiful to hiring managers.
            </p>
          </div>

          {/* Filter Tabs matching Screenshot 6 */}
          <div className="flex flex-wrap items-center gap-2 bg-[#12131f] p-1.5 rounded-2xl border border-line">
            {[
              { id: "popular", label: "Most Popular" },
              { id: "simple", label: "Simple" },
              { id: "modern", label: "Modern" },
              { id: "creative", label: "Creative" },
              { id: "compact", label: "Compact" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormatFilter(tab.id as typeof formatFilter)}
                className={clsx(
                  "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  formatFilter === tab.id
                    ? "bg-blue text-white shadow-md shadow-blue/20"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Interactive Format Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Standard Professional",
              category: "popular",
              tag: "Ashby & Greenhouse Verified",
              accent: "#2563eb",
              desc: "Traditional single-column layout prioritizing quantifiable impact bullets and chronological work history.",
            },
            {
              title: "Modern Executive",
              category: "modern",
              tag: "Workday & Lever Verified",
              accent: "#10b981",
              desc: "Contemporary serif typography with subtle dividers and targeted executive competencies section.",
            },
            {
              title: "Technical Architect",
              category: "simple",
              tag: "BambooHR Verified",
              accent: "#8b5cf6",
              desc: "Optimized for engineering and data roles with dedicated skills taxonomy and GitHub/project evidence.",
            },
            {
              title: "Compact 1-Page",
              category: "compact",
              tag: "Universal ATS Standard",
              accent: "#f59e0b",
              desc: "Tight margin engineering for early-career or transition candidates needing strict 1-page compliance.",
            },
          ].map((fmt, fIdx) => (
            <div
              key={fIdx}
              className="rounded-2xl border border-line bg-[#131422] p-5 shadow-xl hover:border-blue/50 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Mini Resume Skeleton Preview */}
                <div className="h-40 w-full rounded-xl bg-white p-3 shadow-inner flex flex-col justify-between border border-slate-200 group-hover:scale-[1.02] transition-transform">
                  <div className="space-y-1.5">
                    <div
                      className="h-2 w-24 rounded-full"
                      style={{ backgroundColor: fmt.accent }}
                    />
                    <div className="h-1 w-32 bg-slate-200 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-slate-200 rounded-full" />
                    <div className="h-1 w-5/6 bg-slate-200 rounded-full" />
                    <div className="h-1 w-4/6 bg-slate-200 rounded-full" />
                  </div>
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div
                      className="h-1 w-16 rounded-full"
                      style={{ backgroundColor: fmt.accent }}
                    />
                    <div className="h-1 w-full bg-slate-200 rounded-full" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    {fmt.tag}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{fmt.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{fmt.desc}</p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-white/5">
                <Link
                  href="/apply/cvs"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white py-2 transition"
                >
                  <span>Select Format</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
