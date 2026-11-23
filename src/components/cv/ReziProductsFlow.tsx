"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export function ReziProductsFlow() {
  const [activeTab, setActiveTab] = useState<"build" | "score" | "target">("build");

  // Customize preview state (Screenshot 2)
  const [selectedColor, setSelectedColor] = useState<string>("#2563eb");
  const [profilePic, setProfilePic] = useState(false);
  const [showDividers, setShowDividers] = useState(true);

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

            <div className="space-y-4">
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
          <div className="w-full lg:w-7/12 relative flex justify-center items-center min-h-[460px]">
            {/* The Background Stylized Paper Document */}
            <div className="w-full max-w-[500px] rounded-2xl bg-white text-slate-900 p-7 shadow-2xl border border-slate-200 font-sans text-xs select-none transition-all">
              <div className="text-center pb-3">
                <h4
                  className="text-lg font-black tracking-tight"
                  style={{ color: selectedColor }}
                >
                  Charles Bloomberg
                </h4>
                <div className="text-[10px] text-slate-500 mt-0.5 space-x-1.5">
                  <span>Seoul, South Korea</span>
                  <span>•</span>
                  <span>charlesbloomberg@gmail.com</span>
                  <span>•</span>
                  <span>in/bloomberg</span>
                </div>
              </div>

              {showDividers && <hr className="border-slate-200 my-2.5" />}

              <div>
                <div
                  className="text-[10px] font-black uppercase tracking-wider mb-1"
                  style={{ color: selectedColor }}
                >
                  Professional Summary
                </div>
                <p className="text-[9.5px] text-slate-700 leading-relaxed">
                  Passion for building inspiring consumer software companies through industry-leading tech, design, and execution. An experienced early-stage global executive with an economics degree.
                </p>
              </div>

              {showDividers && <hr className="border-slate-200 my-2.5" />}

              <div>
                <div
                  className="text-[10px] font-black uppercase tracking-wider mb-1.5"
                  style={{ color: selectedColor }}
                >
                  Professional Experience
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span>CEO & Founder | Rezi</span>
                  <span className="text-slate-500 font-normal">August 2015 – Present</span>
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
                    <li className="bg-blue-50 text-blue-900 p-1 rounded font-medium animate-fadeIn">
                      • Integrated Systems Design benchmarks, reducing cloud processing cost by 28%.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* FLOATING OVERLAY 1: "Customize" Card (Build Tab, Screenshot 2) */}
            {activeTab === "build" && (
              <div className="absolute top-6 right-2 sm:right-6 w-64 rounded-2xl bg-[#1e202f]/95 border border-white/20 p-4 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-3.5 z-20">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-white">Customize</span>
                  <span className="text-[10px] text-blue-400 font-mono">Live Sync</span>
                </div>

                {/* Color Dots */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Color</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { hex: "#2563eb", name: "blue" },
                      { hex: "#0d9488", name: "teal" },
                      { hex: "#e11d48", name: "rose" },
                      { hex: "#9333ea", name: "purple" },
                      { hex: "#1e293b", name: "dark" },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setSelectedColor(c.hex)}
                        className={clsx(
                          "h-5 w-5 rounded-full transition transform hover:scale-110",
                          selectedColor === c.hex
                            ? "ring-2 ring-white ring-offset-2 ring-offset-[#1e202f]"
                            : ""
                        )}
                        style={{ backgroundColor: c.hex }}
                        aria-label={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Profile Pic Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Profile Pic</span>
                  <button
                    type="button"
                    onClick={() => setProfilePic(!profilePic)}
                    className={clsx(
                      "w-9 h-5 rounded-full transition-colors relative p-0.5",
                      profilePic ? "bg-blue" : "bg-slate-700"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-4 h-4 rounded-full bg-white transition-transform",
                        profilePic ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {/* Dividers Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Dividers</span>
                  <button
                    type="button"
                    onClick={() => setShowDividers(!showDividers)}
                    className={clsx(
                      "w-9 h-5 rounded-full transition-colors relative p-0.5",
                      showDividers ? "bg-blue" : "bg-slate-700"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-4 h-4 rounded-full bg-white transition-transform",
                        showDividers ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* FLOATING OVERLAY 2: "Rezi Score" Breakdown (Score Tab, Screenshot 3) */}
            {activeTab === "score" && (
              <div className="absolute top-2 right-2 sm:right-6 w-72 rounded-2xl bg-[#1a1b2a]/95 border border-white/20 p-5 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-3 z-20">
                {/* Semi-circular Speedometer SVG */}
                <div className="text-center relative pt-2">
                  <div className="relative w-40 h-20 mx-auto overflow-hidden">
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
                        stroke="url(#scoreGrad)"
                        strokeWidth="8"
                        strokeDasharray="125.6"
                        strokeDashoffset="45"
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f43f5e" />
                          <stop offset="40%" stopColor="#f59e0b" />
                          <stop offset="80%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                      <span className="text-2xl font-black text-white">95</span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        Excellent
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Passes ATS filters across 100% of tested enterprise systems.
                  </p>
                </div>

                <div className="border-t border-white/10 pt-2.5 space-y-2 text-xs">
                  {[
                    { label: "Content", score: 95, color: "text-emerald-400 bg-emerald-500/20" },
                    { label: "Format", score: 92, color: "text-emerald-400 bg-emerald-500/20" },
                    { label: "Optimization", score: 88, color: "text-blue bg-blue/20" },
                    { label: "Best Practices", score: 95, color: "text-emerald-400 bg-emerald-500/20" },
                    { label: "Application Ready", score: 90, color: "text-emerald-400 bg-emerald-500/20" },
                  ].map((cat) => (
                    <div key={cat.label} className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className={clsx("h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold", cat.color)}>
                          {cat.score}
                        </span>
                        <span>{cat.label}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Passed</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FLOATING OVERLAY 3: "AI Keyword Targeting" (Target Tab, Screenshot 4) */}
            {activeTab === "target" && (
              <div className="absolute top-2 right-2 sm:right-6 w-80 rounded-2xl bg-[#1a1b2a]/95 border border-white/20 p-5 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-3.5 z-20">
                <div className="border-b border-white/10 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    AI Keyword Targeting
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Is this missing keyword relevant to your experience?
                  </p>
                </div>

                <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 text-center">
                  <span className="text-xs font-bold text-teal-300">
                    Systems Design & Architecture
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetedAdded(true)}
                    className="flex-1 rounded-xl bg-blue hover:bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <span>👍</span>
                    <span>{targetedAdded ? "Added to CV!" : "Yes, Add Bullet"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetedAdded(false)}
                    className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition"
                  >
                    Skip
                  </button>
                </div>

                <div className="border-t border-white/10 pt-2.5 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Great work! You&apos;re ranking well for these job keywords:
                  </span>
                  <div className="space-y-1 text-xs">
                    {["TypeScript & React", "Cloud Infrastructure", "API Architecture"].map((kw) => (
                      <div key={kw} className="flex items-center justify-between text-slate-300 text-[11px]">
                        <span>{kw}</span>
                        <span className="text-emerald-400 text-xs font-bold">✓</span>
                      </div>
                    ))}
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
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Use a template that guides you. Our ATS-compliant designs are trusted by thousands of job seekers.
            </p>
          </div>

          {/* Filter Tabs matching Screenshot 6 */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#141523] border border-white/10 text-xs font-bold text-slate-400 overflow-x-auto">
            {(
              [
                { id: "popular", label: "Most Popular" },
                { id: "simple", label: "Simple" },
                { id: "modern", label: "Modern" },
                { id: "creative", label: "Creative" },
                { id: "compact", label: "Compact" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormatFilter(tab.id)}
                className={clsx(
                  "rounded-xl px-3.5 py-1.5 transition whitespace-nowrap",
                  formatFilter === tab.id
                    ? "bg-blue text-white shadow-md"
                    : "hover:text-white hover:bg-white/5"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Standard Executive */}
          <div className="rounded-3xl border border-white/10 bg-[#141523] p-6 space-y-4 hover:border-blue/50 transition-all shadow-xl group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue uppercase tracking-wider">
                  Classic ATS Standard
                </span>
                <h4 className="text-lg font-bold text-white mt-0.5">
                  Standard Professional CV
                </h4>
              </div>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1">
                98% ATS Pass Rate
              </span>
            </div>

            {/* Stylized Preview Sheet */}
            <div className="rounded-xl bg-white p-5 text-slate-900 text-[10px] space-y-2 border border-slate-200 shadow-inner select-none font-serif">
              <div className="text-center font-bold text-slate-900 border-b border-slate-200 pb-1">
                CHARLES BLOOMBERG
                <div className="text-[8.5px] font-normal text-slate-600 font-sans">
                  Seoul, South Korea • charles@domain.com • +82 10 1234 5678
                </div>
              </div>
              <div>
                <span className="font-bold text-[9px] uppercase font-sans text-slate-900 block border-b border-slate-200">
                  Professional Summary
                </span>
                <p className="text-[8.5px] text-slate-700 leading-tight mt-0.5 font-sans">
                  Results-oriented technology leader with 8+ years experience scaling high-concurrency cloud software.
                </p>
              </div>
              <div>
                <span className="font-bold text-[9px] uppercase font-sans text-slate-900 block border-b border-slate-200">
                  Work Experience
                </span>
                <div className="flex justify-between font-bold text-[8.5px] font-sans mt-0.5">
                  <span>CEO & Founder — Rezi</span>
                  <span>2015 – Present</span>
                </div>
                <div className="text-[8px] text-slate-600 font-sans">• Built resume engine trusted by 2.2M+ job seekers.</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/apply/cvs"
                className="rounded-xl bg-white/10 hover:bg-blue hover:text-white px-4 py-2 text-xs font-bold text-slate-200 transition"
              >
                Use Standard Template →
              </Link>
            </div>
          </div>

          {/* Card 2: Modern Compact */}
          <div className="rounded-3xl border border-white/10 bg-[#141523] p-6 space-y-4 hover:border-blue/50 transition-all shadow-xl group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Optimized Compact
                </span>
                <h4 className="text-lg font-bold text-white mt-0.5">
                  Compact Single-Page Layout
                </h4>
              </div>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1">
                100% Fit Guarantee
              </span>
            </div>

            {/* Stylized Preview Sheet */}
            <div className="rounded-xl bg-white p-5 text-slate-900 text-[10px] space-y-2 border border-slate-200 shadow-inner select-none font-sans">
              <div className="flex justify-between items-baseline border-b border-slate-300 pb-1">
                <span className="font-black text-xs text-slate-950">CHARLES BLOOMBERG</span>
                <span className="text-[8.5px] text-slate-600">alex@domain.com • London, UK</span>
              </div>
              <div>
                <span className="font-bold text-[8.5px] uppercase text-blue-700 block border-b border-slate-200">
                  Core Competencies
                </span>
                <p className="text-[8px] text-slate-700 leading-tight mt-0.5">
                  Systems Design • Next.js • React • Cloud Architecture • MongoDB • CI/CD
                </p>
              </div>
              <div>
                <span className="font-bold text-[8.5px] uppercase text-blue-700 block border-b border-slate-200">
                  Experience
                </span>
                <div className="flex justify-between font-bold text-[8.5px] mt-0.5">
                  <span>Lead Systems Architect — Scaleup</span>
                  <span>2020 – Present</span>
                </div>
                <div className="text-[8px] text-slate-600">• Decreased latency by 42% through caching optimization.</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/apply/cvs"
                className="rounded-xl bg-white/10 hover:bg-blue hover:text-white px-4 py-2 text-xs font-bold text-slate-200 transition"
              >
                Use Compact Template →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
