"use client";

import { useState } from "react";
import Link from "next/link";
import { Mark } from "@/components/brand/Mark";
import { MiniWave } from "@/components/audio/MiniWave";
import { Icon } from "@/components/ui";

const PLANNED = [30, 60, 45, 60, 60, 60, 60, 30, 45, 45, 45, 60];
const ACTUAL = [32, 75, 40, 160, 70, 65, 50, 25, 50, 55, 48, 10];

export function WelcomeHero({
  firstName,
  micOk,
}: {
  firstName: string;
  micOk: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section
      aria-label="Welcome and quick start"
      className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-b from-panel via-panel to-[#181922] p-6 shadow-2xl transition-all duration-300"
    >
      {/* Decorative ambient animated gradient backdrops */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue/15 blur-3xl animate-pulse-glow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-fill/10 blur-3xl"
      />

      {/* Header bar inside banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue/15 shadow-[inset_0_0_0_1px_rgba(123,136,255,0.3)] transition-transform hover:scale-105">
            <Mark size={26} live={true} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-blue/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-blue-soft border border-blue/20">
                <span className="h-1.5 w-1.5 rounded-full bg-blue animate-ping" />
                Live Studio Active
              </span>
              <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-muted">
                Accent-Neutral AI
              </span>
            </div>
            <h1 className="mt-1 text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
              Welcome to Hakkiri Studio, {firstName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/mic-check"
            className="pro-btn flex h-9 items-center gap-2 rounded-xl bg-panel-2 px-3.5 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2a2b35] transition-all"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                micOk ? "bg-emerald-400 ring-2 ring-emerald-400/30" : "bg-amber-400 animate-pulse"
              }`}
            />
            <span>{micOk ? "Mic Calibrated" : "Mic Check"}</span>
          </Link>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="pro-btn flex h-9 w-9 items-center justify-center rounded-xl bg-panel-2 text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink hover:bg-[#2a2b35] transition-all"
            title={collapsed ? "Expand Studio Overview" : "Collapse Studio Overview"}
            aria-label={collapsed ? "Expand Studio Overview" : "Collapse Studio Overview"}
          >
            <Icon name={collapsed ? "plus" : "x"} size={16} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="relative z-10 mt-5 space-y-6 animate-slide-up">
          <p className="max-w-3xl text-[15px] leading-relaxed text-muted">
            Your private speech and executive presentation rehearsal booth. Practice high-stakes questions
            with an adaptive AI interviewer who probes your reasoning, and test slide pacing against the clock.
          </p>

          {/* 3 Core Studio Modules with Smooth Hover Lift Animations */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Module 1: Interview */}
            <div className="pro-card group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-panel-2/60 p-5 backdrop-blur transition-all duration-300 hover:border-blue/40 hover:bg-panel-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-soft">
                    <Icon name="brief" size={14} />
                    Interview Simulator
                  </span>
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    Active Target
                  </span>
                </div>
                <h3 className="mt-2.5 text-lg font-bold text-ink group-hover:text-blue-soft transition-colors">
                  Halden Senior PM
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Adaptive AI interviewer (Sam) with follow-up probing across payments metrics, competency, and CV.
                </p>

                <div className="mt-3.5 rounded-xl bg-booth/80 p-3 shadow-inner border border-white/[0.04]">
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>Target Date: In 5 days</span>
                    <span className="font-bold text-ink font-mono">Score: 3.8 / 5.0</span>
                  </div>
                  <MiniWave bars={36} played={22} className="mt-2 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href="/interviews/halden"
                  className="pro-btn flex h-8 grow items-center justify-center gap-1.5 rounded-lg bg-blue-fill px-3 text-xs font-semibold text-white shadow-md hover:bg-blue-hover transition-all"
                >
                  <span>Practice Halden</span>
                  <Icon name="arrowRight" size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/interviews/new"
                  className="pro-btn flex h-8 items-center justify-center rounded-lg bg-white/[0.06] px-3 text-xs font-semibold text-muted hover:text-ink hover:bg-white/[0.1] transition-all"
                  title="Create New Interview"
                >
                  + New
                </Link>
              </div>
            </div>

            {/* Module 2: Pitch & Presentation */}
            <div className="pro-card group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-panel-2/60 p-5 backdrop-blur transition-all duration-300 hover:border-lilac/40 hover:bg-panel-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-lilac">
                    <Icon name="present" size={14} />
                    Deck & Pitch Lab
                  </span>
                  <span className="rounded-md bg-blue/10 px-2 py-0.5 text-[10px] font-semibold text-blue-soft border border-blue/20">
                    12 Slides
                  </span>
                </div>
                <h3 className="mt-2.5 text-lg font-bold text-ink group-hover:text-lilac transition-colors">
                  Q1 Roadmap Pitch
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Rehearse slide-by-slide against strict time budgets, detect overruns, and answer tough executive Q&A.
                </p>

                <div className="mt-3.5 rounded-xl bg-booth/80 p-3 shadow-inner border border-white/[0.04]">
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>15 min Target</span>
                    <span className="text-red-soft font-bold">Slide 4 ran long</span>
                  </div>
                  <div className="mt-2 flex gap-1" aria-hidden>
                    {PLANNED.slice(0, 8).map((p, i) => (
                      <span
                        key={i}
                        className={`h-2 rounded-[2px] transition-all ${
                          ACTUAL[i] > p + 15 ? "bg-red" : "bg-blue"
                        }`}
                        style={{ flex: p }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href="/presentations"
                  className="pro-btn flex h-8 grow items-center justify-center gap-1.5 rounded-lg bg-panel px-3 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2a2b35] transition-all"
                >
                  <span>Rehearse Deck</span>
                  <Icon name="arrowRight" size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/presentations/new"
                  className="pro-btn flex h-8 items-center justify-center rounded-lg bg-white/[0.06] px-3 text-xs font-semibold text-muted hover:text-ink hover:bg-white/[0.1] transition-all"
                  title="Create New Presentation"
                >
                  + New
                </Link>
              </div>
            </div>

            {/* Module 3: Executive Story Bank */}
            <div className="pro-card group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-panel-2/60 p-5 backdrop-blur transition-all duration-300 hover:border-blue/40 hover:bg-panel-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-soft">
                    <Icon name="book" size={14} />
                    Story Bank & Analytics
                  </span>
                  <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-muted">
                    6 Stories Ready
                  </span>
                </div>
                <h3 className="mt-2.5 text-lg font-bold text-ink group-hover:text-blue-soft transition-colors">
                  STAR Story Vault
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Organize your career achievements into Situation, Task, Action, and Result with automatic role alignment.
                </p>

                <div className="mt-3.5 space-y-1.5 rounded-xl bg-booth/80 p-3 text-[11px] shadow-inner border border-white/[0.04]">
                  <div className="flex items-center justify-between text-muted">
                    <span>Filler Word Rate:</span>
                    <span className="font-bold text-emerald-400">1.4 / min (Low)</span>
                  </div>
                  <div className="flex items-center justify-between text-muted">
                    <span>Ownership Ratio:</span>
                    <span className="font-bold text-blue-soft">78% ("I" vs "We")</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href="/story-bank"
                  className="pro-btn flex h-8 grow items-center justify-center gap-1.5 rounded-lg bg-panel px-3 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2a2b35] transition-all"
                >
                  <span>Explore Story Bank</span>
                  <Icon name="arrowRight" size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/settings"
                  className="pro-btn flex h-8 items-center justify-center rounded-lg bg-white/[0.06] px-3 text-xs font-semibold text-muted hover:text-ink hover:bg-white/[0.1] transition-all"
                  title="Voice & Speech Settings"
                >
                  <Icon name="gear" size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Communication Agility Gym & Clarity Strip */}
          <div className="rounded-2xl border border-blue/30 bg-blue/10 p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-fill text-white shadow-md">
                <Icon name="zap" size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-soft">
                    Communication Gym · Today's Drill
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                    <Icon name="flame" size={11} className="text-amber-400" />
                    4-Day Streak · 320 XP
                  </span>
                </div>
                <h4 className="mt-1 text-base font-bold text-white">
                  Think Fast: Spontaneous Stakeholder Objection (60s)
                </h4>
                <p className="text-xs text-ink/70">
                  Calibrated for bottom-line-up-front (BLUF) and eliminating conversational filler words.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/gym"
                className="pro-btn inline-flex items-center gap-2 rounded-xl bg-blue-fill px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-hover transition-all"
              >
                <Icon name="play" size={14} />
                <span>Launch Gym Drill</span>
              </Link>
              <Link
                href="/analytics"
                className="pro-btn inline-flex items-center gap-1.5 rounded-xl bg-panel-2 px-3.5 py-2.5 text-xs font-semibold text-ink border border-white/10 hover:bg-[#282a35] transition-colors"
              >
                <Icon name="barChart" size={14} />
                <span>Clarity Profile</span>
              </Link>
              <Link
                href="/assessment"
                className="pro-btn inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3 py-2.5 text-xs font-semibold text-muted hover:text-ink hover:bg-white/[0.1] transition-colors"
                title="Diagnostic Speaking Assessment"
              >
                <Icon name="target" size={14} />
                <span className="hidden lg:inline">Diagnostic</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-booth/60 px-5 py-3 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="text-muted">Speech Quality:</span>
                <span className="font-bold text-ink">94% Clarity</span>
              </span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-2">
                <span className="text-muted">Practiced Answers:</span>
                <span className="font-bold text-blue-soft">14 Recorded</span>
              </span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-2">
                <span className="text-muted">Trial Credit:</span>
                <span className="font-bold text-emerald-400">11 min Remaining</span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-muted">
              <span className="flex items-center gap-1.5">
                <Icon name="shield" size={14} className="text-blue-soft" />
                Zero accent bias guaranteed
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
