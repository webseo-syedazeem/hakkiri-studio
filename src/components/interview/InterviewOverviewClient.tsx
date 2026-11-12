"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Icon, Panel } from "@/components/ui";
import { Segmented } from "@/components/ui/Segmented";
import {
  DIFFICULTY_LABEL,
  totalQuestionCount,
  type Difficulty,
  type Mix,
  type MixPreset,
  type SessionMinutes,
  type SessionSettings,
} from "@/lib/interviews/settings";
import { InterviewTabs } from "./InterviewTabs";
import { StartButton } from "./StartSession";

export type OverviewStageOption = {
  id: string;
  label: string;
  selectLabel: string;
  titlePhrase: string;
  description: string;
  status: "completed" | "next" | "upcoming";
  subtitle: string;
  preset: Exclude<MixPreset, "custom">;
  mix: Mix;
};

export type OverviewScoreCategory = {
  name: string;
  score: number;
  delta: string;
  positive: boolean;
  tone: "purple" | "red";
};

type PracticeMinutes = 10 | 20 | 30 | 45;

const PRACTICE_LENGTHS: PracticeMinutes[] = [10, 20, 30, 45];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function isPracticeMinutes(m: SessionMinutes): m is PracticeMinutes {
  return m === 10 || m === 20 || m === 30 || m === 45;
}

export function InterviewOverviewClient({
  interviewId,
  companyName,
  companyInitial,
  roleTitle,
  whenText,
  whenRel,
  micOk,
  isNew,
  rebuilt,
  interviewerName,
  initialSettings,
  initialStageId,
  stages,
  scoreCategories,
  topics,
  roleSummary,
  inputsSummary,
}: {
  interviewId: string;
  companyName: string;
  companyInitial: string;
  roleTitle: string;
  whenText: string;
  whenRel?: string | null;
  micOk: boolean;
  isNew: boolean;
  rebuilt: boolean;
  interviewerName: string;
  initialSettings: SessionSettings;
  initialStageId: string;
  stages: OverviewStageOption[];
  scoreCategories: OverviewScoreCategory[];
  topics: { id: string; title: string }[];
  roleSummary: string;
  inputsSummary: string;
}) {
  const [stageId, setStageId] = useState<string>(initialStageId);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialSettings.difficulty);
  const [minutes, setMinutes] = useState<PracticeMinutes>(
    isPracticeMinutes(initialSettings.minutes) ? initialSettings.minutes : 10,
  );

  const activeStage = stages.find((s) => s.id === stageId) ?? stages[0];
  const nextStage = stages.find((s) => s.status === "next") ?? activeStage;
  const estQuestions = Math.max(3, totalQuestionCount(minutes, difficulty));

  const currentSettings: SessionSettings = {
    difficulty,
    minutes,
    preset: activeStage.preset,
    mix: activeStage.mix,
  };

  return (
    <div className="flex grow flex-col pb-12">
      {/* Top Header */}
      <div className="animate-rise">
        <Link
          href="/interviews"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors mb-3"
        >
          <Icon name="back" size={12} />
          <span>Interviews</span>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-900/40 text-[19px] font-bold text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              {companyInitial}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-white">{roleTitle}</h1>
              <div className="mt-0.5 text-xs text-muted flex flex-wrap items-center gap-2">
                <span>{companyName}</span>
                <span>·</span>
                <span>{stages.length} interview stages</span>
                <span>·</span>
                <span>Next: {nextStage.label}</span>
                <span>·</span>
                <span>
                  {whenText}{" "}
                  {whenRel && whenRel !== "done" && <b className="font-semibold text-ink">({whenRel})</b>}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              href={`/interviews/${interviewId}/prep`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] active:scale-[0.98]"
            >
              <Icon name="doc" size={13} />
              <span>Prep sheet</span>
              <span className="text-[11px] text-muted">↗</span>
            </Link>

            <StartButton
              interviewId={interviewId}
              micOk={micOk}
              body={{
                kind: "interview",
                settings: currentSettings,
              }}
              variant="primary"
              size="md"
              buttonClassName="px-4 py-2 rounded-xl text-xs flex items-center gap-2 group shadow-[0_4px_20px_rgba(79,82,248,0.35)] hover:shadow-[0_6px_26px_rgba(79,82,248,0.6)]"
            >
              <Icon name="play" size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              <span>Practise interview</span>
            </StartButton>
          </div>
        </div>

        {isNew && (
          <div
            role="status"
            className="mt-4 animate-rise rounded-xl bg-blue/12 px-4 py-3 text-xs text-lilac border border-blue/30"
          >
            <b className="font-semibold text-white">Your interview is ready.</b> The questions stay hidden until{" "}
            {interviewerName} asks them, like the real thing.
          </div>
        )}
        {rebuilt && (
          <div
            role="status"
            className="mt-4 animate-rise rounded-xl bg-blue/12 px-4 py-3 text-xs text-lilac border border-blue/30"
          >
            <b className="font-semibold text-white">Questions rebuilt.</b> New questions were generated following your
            feedback.
          </div>
        )}

        <InterviewTabs id={interviewId} current="overview" />
      </div>

      {/* Main 2-Column Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-5 animate-rise [animation-delay:0.05s]">
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="space-y-5">
          {/* Card 1: RECOMMENDED NEXT */}
          <div className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-[#201c3a] via-[#1a1b32] to-[#15192c] p-5 shadow-[0_4px_25px_rgba(99,102,241,0.18)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                  <Icon name="target" size={18} />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-300">
                    Recommended Next
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Practise {activeStage.titlePhrase} questions
                  </h2>
                  <p className="text-xs text-muted max-w-[490px] leading-relaxed">{activeStage.description}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2.5 py-1 border border-white/10 text-ink">
                      <Icon name="user" size={12} className="text-muted" />
                      <span>{activeStage.label}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2.5 py-1 border border-white/10 text-ink">
                      <Icon name="chart" size={12} className="text-muted" />
                      <span>{DIFFICULTY_LABEL[difficulty]}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2.5 py-1 border border-white/10 text-ink">
                      <Icon name="clock" size={12} className="text-muted" />
                      <span>{minutes} minutes</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2.5 py-1 border border-white/10 text-ink">
                      <Icon name="chat" size={12} className="text-muted" />
                      <span>
                        Around {estQuestions}–{estQuestions + 2} questions
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 sm:self-center">
                <StartButton
                  interviewId={interviewId}
                  micOk={micOk}
                  body={{
                    kind: "interview",
                    settings: currentSettings,
                  }}
                  variant="primary"
                  size="md"
                  buttonClassName="px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 group shadow-[0_4px_22px_rgba(79,82,248,0.45)] hover:shadow-[0_6px_28px_rgba(79,82,248,0.7)] transition-all duration-200"
                >
                  <Icon name="play" size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                  <span>Start practising</span>
                </StartButton>
              </div>
            </div>
          </div>

          {/* Card 2: Latest practice results */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h2 className="text-sm font-bold text-white">Latest practice results</h2>
                <p className="text-xs text-muted">Full mock interview · Yesterday, 11:05</p>
              </div>
              <Link
                href={`/interviews/${interviewId}/mocks`}
                className="text-xs font-semibold text-blue-soft hover:underline flex items-center gap-1"
              >
                <span>View full report</span>
                <span>→</span>
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {scoreCategories.map((cat) => {
                const pct = (cat.score / 5) * 100;
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white num">{cat.score.toFixed(1)}/5</span>
                        <span
                          className={clsx(
                            "text-[11px] font-bold num",
                            cat.positive ? "text-emerald-400" : "text-rose-400",
                          )}
                        >
                          {cat.positive ? "▲" : "▼"} {cat.delta}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-500",
                          cat.tone === "red"
                            ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                            : "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="pt-2 text-[11px] text-muted border-t border-line/60 flex items-center gap-1.5">
              <span>ⓘ</span>
              <span>Scores reflect your latest mock interview, not your likelihood of receiving an offer.</span>
            </p>
          </Panel>

          {/* Card 3: Recent practice */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-sm font-bold text-white">Recent practice</h2>
              <Link
                href={`/interviews/${interviewId}/mocks`}
                className="text-xs font-semibold text-blue-soft hover:underline flex items-center gap-1"
              >
                <span>See all</span>
                <span>→</span>
              </Link>
            </div>

            <ul className="divide-y divide-line/60 text-xs">
              <li className="flex items-center justify-between py-3 first:pt-1">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-ink border border-white/10">
                    <Icon name="play" size={12} />
                  </span>
                  <div>
                    <span className="font-semibold text-white">Full mock interview</span>
                    <p className="text-[11px] text-muted">Yesterday · 30 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white num">3.5 / 5</span>
                  <Link
                    href={`/interviews/${interviewId}/mocks`}
                    className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] px-3 py-1.5 text-[11px] font-semibold text-white/90 hover:text-white border border-white/10 hover:border-white/20 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                  >
                    View report
                  </Link>
                </div>
              </li>

              <li className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-ink border border-white/10">
                    <Icon name="play" size={12} />
                  </span>
                  <div>
                    <span className="font-semibold text-white">Technical questions</span>
                    <p className="text-[11px] text-muted">Wed 5 Nov · 8 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white num">2.6 / 5</span>
                  <Link
                    href={`/interviews/${interviewId}/mocks`}
                    className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] px-3 py-1.5 text-[11px] font-semibold text-white/90 hover:text-white border border-white/10 hover:border-white/20 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                  >
                    Review
                  </Link>
                </div>
              </li>

              <li className="flex items-center justify-between py-3 last:pb-1">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-ink border border-white/10">
                    <Icon name="play" size={12} />
                  </span>
                  <div>
                    <span className="font-semibold text-white">&ldquo;A payments metric drops&rdquo; (follow-ups)</span>
                    <p className="text-[11px] text-muted">Tue 4 Nov · 5 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white num">3.8 / 5</span>
                  <Link
                    href={`/interviews/${interviewId}/mocks`}
                    className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] px-3 py-1.5 text-[11px] font-semibold text-white/90 hover:text-white border border-white/10 hover:border-white/20 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                  >
                    Review
                  </Link>
                </div>
              </li>
            </ul>
          </Panel>
        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="space-y-5">
          {/* Card 4: Your interview stages */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <div>
              <h2 className="text-sm font-bold text-white">Your interview stages</h2>
              <p className="text-xs text-muted">Track your progress and prepare for each round.</p>
            </div>

            <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-line pt-2">
              {stages.map((st) => {
                const selected = st.id === activeStage.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStageId(st.id)}
                    className={clsx(
                      "relative w-full text-left flex items-center justify-between gap-3 text-xs rounded-xl transition-all cursor-pointer",
                      selected
                        ? "bg-indigo-500/12 p-2.5 -ml-2.5 border border-indigo-500/35 shadow-[0_2px_12px_rgba(79,82,248,0.12)]"
                        : "py-1.5 pr-1 hover:text-white",
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {st.status === "completed" ? (
                        <span
                          className={clsx(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold",
                            !selected && "absolute -left-6 top-1.5",
                          )}
                        >
                          ✓
                        </span>
                      ) : st.status === "next" || selected ? (
                        <span
                          className={clsx(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-[10px] shadow-[0_0_10px_rgba(99,102,241,0.5)]",
                            !selected && "absolute -left-6 top-1.5",
                          )}
                        >
                          ⦿
                        </span>
                      ) : (
                        <span className="absolute -left-6 top-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-dim border border-white/10 text-[10px]">
                          ○
                        </span>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={clsx("font-semibold truncate", selected ? "font-bold text-white" : st.status === "completed" ? "text-ink" : "text-muted")}>
                            {st.label}
                          </span>
                          {st.status === "next" && (
                            <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-indigo-300">
                              Next
                            </span>
                          )}
                        </div>
                        <p className={clsx("text-[11px]", selected ? "text-muted" : "text-dim")}>{st.subtitle}</p>
                      </div>
                    </div>

                    {selected ? (
                      <Icon name="chevronRight" size={14} className="shrink-0 text-indigo-300" />
                    ) : (
                      <span className="shrink-0 text-[11px] font-medium text-dim">{st.subtitle}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Card 5: Practice settings */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white">Practice settings</h2>
                <p className="text-xs text-muted mt-0.5">Customise your next practice interview.</p>
              </div>
              <Icon name="sliders" size={16} className="text-muted shrink-0 mt-0.5" />
            </div>

            {/* Interview stage select */}
            <div className="space-y-1.5">
              <label htmlFor="overview-stage-select" className="block text-xs font-medium text-muted">
                Interview stage
              </label>
              <div className="relative">
                <select
                  id="overview-stage-select"
                  value={activeStage.id}
                  onChange={(e) => setStageId(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-panel-2 border border-line-strong px-3.5 py-2.5 pr-9 text-xs font-semibold text-white focus:border-indigo-400 focus:outline-none cursor-pointer transition-colors"
                >
                  {stages.map((st) => (
                    <option key={st.id} value={st.id} className="bg-[#141522] text-white">
                      {st.selectLabel}
                    </option>
                  ))}
                </select>
                <Icon
                  name="chevronDown"
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </div>

            {/* Difficulty & Interview length side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.65fr] gap-3 items-start">
              <div className="space-y-1.5 min-w-0">
                <div className="text-xs font-medium text-muted">Difficulty</div>
                <Segmented<Difficulty>
                  label="Difficulty"
                  fullWidth
                  value={difficulty}
                  onChange={setDifficulty}
                  options={DIFFICULTIES.map((d) => ({ value: d, label: DIFFICULTY_LABEL[d] }))}
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="text-xs font-medium text-muted">Interview length</div>
                <Segmented<`${PracticeMinutes}`>
                  label="Interview length"
                  fullWidth
                  value={`${minutes}`}
                  onChange={(m) => setMinutes(Number(m) as PracticeMinutes)}
                  options={PRACTICE_LENGTHS.map((m) => ({
                    value: `${m}` as `${PracticeMinutes}`,
                    label: `${m} min`,
                  }))}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-line/60 flex items-center gap-1.5 text-[11px] text-muted">
              <Icon name="info" size={13} className="shrink-0" />
              <span>Adjust the difficulty and length to match your preparation needs.</span>
            </div>
          </Panel>

          {/* Card 6: Other ways to practise */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <h2 className="text-sm font-bold text-white">Other ways to practise</h2>
            <div className="space-y-2 pt-1">
              <Link
                href={`/interviews/${interviewId}/mocks`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-panel-2 border border-line hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)] group"
              >
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-fill/15 text-blue-soft border border-blue-fill/25 transition-transform duration-200 group-hover:scale-110">
                    <Icon name="play" size={13} />
                  </span>
                  <div>
                    <span className="font-semibold text-ink group-hover:text-white transition-colors">
                      Start a new full mock interview
                    </span>
                    <p className="text-[11px] text-muted">A broader practise session across key topics</p>
                  </div>
                </div>
                <Icon
                  name="chevronRight"
                  size={14}
                  className="text-muted group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </Link>

              <Link
                href={`/interviews/${interviewId}/mocks`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-panel-2 border border-line hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)] group"
              >
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/25 transition-transform duration-200 group-hover:scale-110">
                    <Icon name="doc" size={13} />
                  </span>
                  <div>
                    <span className="font-semibold text-ink group-hover:text-white transition-colors">
                      Practise your previous questions
                    </span>
                    <p className="text-[11px] text-muted">Revisit and improve answers you&apos;ve already tried</p>
                  </div>
                </div>
                <Icon
                  name="chevronRight"
                  size={14}
                  className="text-muted group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </Link>

              <Link
                href={`/interviews/${interviewId}/rebuild`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-panel-2 border border-line hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)] group"
              >
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/25 transition-transform duration-200 group-hover:scale-110">
                    <Icon name="gear" size={13} />
                  </span>
                  <div>
                    <span className="font-semibold text-ink group-hover:text-white transition-colors">
                      Customise your session
                    </span>
                    <p className="text-[11px] text-muted">Choose topics, question types and duration</p>
                  </div>
                </div>
                <Icon
                  name="chevronRight"
                  size={14}
                  className="text-muted group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </Link>
            </div>

            <div className="pt-3 border-t border-line/60">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2.5">
                Focus by topic
              </div>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <Link
                    key={t.id}
                    href={`/mock/${interviewId}?topic=${t.id}&difficulty=${difficulty}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-400/40 px-2.5 py-1.5 text-[11px] font-semibold text-ink hover:text-white transition-all"
                  >
                    <span>{t.title}</span>
                    <Icon name="chevronRight" size={11} className="text-muted" />
                  </Link>
                ))}
              </div>
            </div>
          </Panel>

          {/* Card 7: Your role information (Collapsible accordion) */}
          <details className="group rounded-2xl border border-line bg-panel p-5 shadow-sm transition-all open:bg-panel-2/70">
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-xs font-semibold text-ink list-none">
              <div className="flex items-center gap-2.5">
                <Icon name="doc" size={15} className="text-muted" />
                <div>
                  <span className="text-sm font-bold text-white block">Your role information</span>
                  <span className="text-[11px] text-muted font-normal">
                    CV, job description and company details used to tailor your practise.
                  </span>
                </div>
              </div>
              <Icon
                name="chevronDown"
                size={14}
                className="text-muted transition-transform group-open:rotate-180"
              />
            </summary>

            <div className="mt-4 pt-3 border-t border-line/60 space-y-3 text-xs">
              <div>
                <span className="font-bold text-ink">Role & Level:</span>{" "}
                <span className="text-muted">{roleSummary}</span>
              </div>
              <div>
                <span className="font-bold text-ink">Inputs used:</span>{" "}
                <span className="text-muted">{inputsSummary}</span>
              </div>
              <div className="pt-1">
                <Link
                  href={`/interviews/${interviewId}/rebuild?edit=1`}
                  className="text-xs font-semibold text-blue-soft hover:underline"
                >
                  Edit details or rebuild questions →
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
