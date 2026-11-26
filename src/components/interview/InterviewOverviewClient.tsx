"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Icon, Panel } from "@/components/ui";
import { Segmented } from "@/components/ui/Segmented";
import { formatStageDate } from "@/lib/format";
import { DeleteInterview } from "./DeleteInterview";
import {
  DIFFICULTY_HINT,
  DIFFICULTY_LABEL,
  FOCUS_CATEGORIES,
  PRESETS,
  getSuggestedWeights,
  presetFor,
  mixIsValid,
  totalQuestionCount,
  weightsLine,
  weightsToMix,
  type Difficulty,
  type FocusCategoryKey,
  type Mix,
  type MixPreset,
  type SessionMinutes,
  type SessionSettings,
} from "@/lib/interviews/settings";
import { mixLine } from "@/lib/interviews/setup-form";

export type FocusAreaPreset = string;

function mixForCategory(catKey: FocusCategoryKey): Mix {
  switch (catKey) {
    case "technical":
    case "caseStudy":
      return { technical: 80, competency: 20, cv: 0, motivation: 0, curveball: 0 };
    case "competency":
    case "leadership":
      return { competency: 80, cv: 20, technical: 0, motivation: 0, curveball: 0 };
    case "strengths":
      return { curveball: 40, competency: 60, cv: 0, technical: 0, motivation: 0 };
    case "experience":
      return { cv: 80, competency: 20, technical: 0, motivation: 0, curveball: 0 };
    case "motivation":
    case "valuesCulture":
      return { motivation: 80, cv: 20, competency: 0, technical: 0, curveball: 0 };
    case "situational":
    case "curveball":
      return { curveball: 80, competency: 20, cv: 0, technical: 0, motivation: 0 };
    default:
      return { cv: 20, competency: 20, technical: 20, motivation: 20, curveball: 20 };
  }
}
import { InterviewTabs } from "./InterviewTabs";
import { StartButton } from "./StartSession";
import { updateClientInterviewStages } from "@/lib/interviews/client-store";
import { prefetchVoice } from "@/components/audio/speak";

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

/** A category's score from the person's own interviews. `delta` is null until two of them have scored it. */
export type OverviewScoreCategory = {
  name: string;
  score: number;
  delta: number | null;
};

export type OverviewPracticeItem = {
  id: string;
  title: string;
  dateText: string;
  score?: number | null;
  href: string;
  interviewId?: string;
};

type PracticeMinutes = 10 | 20 | 30 | 45;

const PRACTICE_LENGTHS: PracticeMinutes[] = [10, 20, 30, 45];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function isPracticeMinutes(m: SessionMinutes): m is PracticeMinutes {
  return m === 10 || m === 20 || m === 30 || m === 45;
}

function StageDropdown({
  stages,
  value,
  onChange,
}: {
  stages: OverviewStageOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = stages.find((s) => s.id === value) ?? stages[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        id="overview-stage-select"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-white transition-all cursor-pointer border",
          "bg-[#141526] hover:bg-[#191a30]",
          open
            ? "border-indigo-400/75 ring-2 ring-indigo-500/20 shadow-[0_4px_18px_rgba(79,82,248,0.18)]"
            : "border-white/[0.12] hover:border-white/25",
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="truncate">{active.selectLabel}</span>
          {active.status === "next" && (
            <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-300 shrink-0">
              Next
            </span>
          )}
        </span>
        <Icon
          name="chevronDown"
          size={14}
          className={clsx("shrink-0 text-muted transition-transform duration-200", open && "rotate-180 text-indigo-300")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-labelledby="overview-stage-select"
          className="absolute left-0 right-0 z-30 mt-2 rounded-xl border border-white/[0.12] bg-[#121324]/95 backdrop-blur-xl p-1.5 shadow-[0_16px_44px_rgba(0,0,0,0.65)] space-y-0.5 animate-rise"
        >
          {stages.map((st) => {
            const selected = st.id === active.id;
            return (
              <li key={st.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(st.id);
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer",
                    selected
                      ? "bg-indigo-500/18 text-white font-semibold border border-indigo-500/30"
                      : "text-[#c9cad6] hover:bg-white/[0.06] hover:text-white border border-transparent",
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className={clsx(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        st.status === "completed"
                          ? "bg-emerald-400"
                          : st.status === "next"
                            ? "bg-indigo-400"
                            : "bg-white/25",
                      )}
                    />
                    <span className="truncate">{st.selectLabel}</span>
                  </span>

                  <span className="flex items-center gap-2 shrink-0">
                    <span
                      className={clsx(
                        "text-[10px] font-medium",
                        st.status === "completed"
                          ? "text-emerald-400/90"
                          : st.status === "next"
                            ? "text-indigo-300"
                            : "text-dim",
                      )}
                    >
                      {st.status === "completed" ? "Completed" : st.status === "next" ? "Next" : "Upcoming"}
                    </span>
                    {selected && <Icon name="check" size={13} strokeWidth={2.5} className="text-indigo-300" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
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
  ownStages,
  scoreCategories,
  topics,
  roleSummary,
  inputsSummary,
  initialRecentSessions,
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
  /** True when the stages are the ones the person entered for this interview, not the default kinds of round. */
  ownStages: boolean;
  scoreCategories: OverviewScoreCategory[];
  topics: { id: string; title: string }[];
  roleSummary: string;
  inputsSummary: string;
  initialRecentSessions?: OverviewPracticeItem[];
}) {
  const [activeStages, setActiveStages] = useState<OverviewStageOption[]>(stages);
  const [stageId, setStageId] = useState<string>(initialStageId);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialSettings.difficulty);
  const [minutes, setMinutes] = useState<PracticeMinutes>(
    isPracticeMinutes(initialSettings.minutes) ? initialSettings.minutes : 10,
  );

  // The sessions and scores shown are the ones the server holds for this person and this interview. Nothing is
  // read from the browser in their place, and nothing is shown before there is a real session.
  const recentSessions: OverviewPracticeItem[] = initialRecentSessions ?? [];
  const effectiveCategories: OverviewScoreCategory[] = scoreCategories;

  useEffect(() => {
    const syncStages = () => {
      try {
        const raw = localStorage.getItem("hk_custom_interviews");
        if (raw) {
          const list = JSON.parse(raw);
          const match = Array.isArray(list) ? list.find((it: any) => it.id === interviewId) : null;
          if (match && Array.isArray(match.stages) && match.stages.length > 0) {
            const mapped: OverviewStageOption[] = match.stages.map((st: any, idx: number) => {
              const id = st.id || `stage-${idx + 1}`;
              const label = st.name || `Stage ${idx + 1}`;
              const lName = label.toLowerCase();
              const isPresetScreen = lName.includes("screen") || lName.includes("recruiter");
              const isPresetTech = lName.includes("tech") || lName.includes("case") || lName.includes("code");
              const isPresetFinal = lName.includes("final") || lName.includes("panel") || lName.includes("lead");
              const savedMix = (match.settings?.mix && mixIsValid(match.settings.mix)) ? match.settings.mix : null;
              const preset: SessionSettings["preset"] = (match.settings?.preset && match.settings.preset !== "custom")
                ? match.settings.preset
                : isPresetScreen ? "screening" : isPresetTech ? "technical" : isPresetFinal ? "final" : "balanced";
              const mix = savedMix ?? (preset !== "custom" && preset in PRESETS ? PRESETS[preset as Exclude<MixPreset, "custom">].mix : PRESETS.balanced.mix);
              const isNext = st.status === "next" || (idx === 0 && !match.stages.some((x: any) => x.status === "next"));
              const isCompleted = st.status === "completed";
              const formattedDate = formatStageDate(st.date, st.time);
              return {
                id,
                label,
                selectLabel: label,
                titlePhrase: label.toLowerCase(),
                description: `Focus on ${label.toLowerCase()} questions, tailored to ${roleTitle} at ${companyName}.`,
                status: isCompleted ? "completed" : isNext ? "next" : "upcoming",
                subtitle: formattedDate || (isCompleted ? "Completed" : "Upcoming"),
                preset,
                mix,
              };
            });
            setActiveStages(mapped);
            if (!mapped.some((s) => s.id === stageId)) {
              const nextOne = mapped.find((s) => s.status === "next") ?? mapped[0];
              if (nextOne) setStageId(nextOne.id);
            }
          }
        }
      } catch {}
    };

    syncStages();
    window.addEventListener("hk_interviews_updated", syncStages);
    return () => window.removeEventListener("hk_interviews_updated", syncStages);
  }, [interviewId, roleTitle, companyName, stageId]);

  useEffect(() => {
    // Pre-warm the interviewer's voice for the opening question so audio is ready immediately
    const introText = `Welcome. I’m ${interviewerName}. Tell me about yourself and your background.`;
    prefetchVoice(introText);
  }, [interviewerName]);

  const deleteStage = async (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    if (activeStages.length <= 1) return;
    const nextStages = activeStages.filter((s) => s.id !== idToDelete);
    setActiveStages(nextStages);
    if (stageId === idToDelete) {
      setStageId(nextStages[0].id);
    }

    const mappedToSave = nextStages.map((st) => ({
      id: st.id,
      name: st.label,
      status: st.status,
      date: st.subtitle,
    }));

    // 1. Immediately persist to localStorage and notify all other views (like StageTracker on Home)
    updateClientInterviewStages(interviewId, mappedToSave, {
      role: roleTitle,
      company: companyName,
      companyInitial,
    });

    // 2. Persist to server / MongoDB
    try {
      await fetch(`/api/interviews/${interviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stages: mappedToSave,
        }),
      });
    } catch (err) {
      console.warn("Failed to delete interview round:", err);
    }
  };

  const activeStage = activeStages.find((s) => s.id === stageId) ?? activeStages[0] ?? stages[0];
  const nextStage = activeStages.find((s) => s.status === "next") ?? activeStage;
  const estQuestions = Math.max(3, totalQuestionCount(minutes, difficulty));

  const userWeights: Record<FocusCategoryKey, number> =
    (initialSettings.categoryWeights && Object.values(initialSettings.categoryWeights).some((v) => (v ?? 0) > 0))
      ? (initialSettings.categoryWeights as Record<FocusCategoryKey, number>)
      : getSuggestedWeights(roleTitle, inputsSummary);

  const activeCategories = FOCUS_CATEGORIES.filter((cat) => (userWeights[cat.key] || 0) > 0);
  const categoriesToShow = activeCategories.length > 0 ? activeCategories : FOCUS_CATEGORIES.slice(0, 4);

  const userMixText =
    userWeights && Object.values(userWeights).some((v) => (v ?? 0) > 0)
      ? weightsLine(userWeights)
      : mixLine(initialSettings.mix);

  const [focusPreset, setFocusPreset] = useState<FocusAreaPreset>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`hk_interview_${interviewId}_focus`);
      if (saved && (saved === "configured" || FOCUS_CATEGORIES.some((c) => c.key === saved))) return saved;
    }
    return "configured";
  });

  const activeMix =
    focusPreset === "configured"
      ? (initialSettings.mix && mixIsValid(initialSettings.mix)
          ? initialSettings.mix
          : weightsToMix(userWeights))
      : mixForCategory(focusPreset as FocusCategoryKey);

  const handleFocusChange = async (presetKey: FocusAreaPreset) => {
    setFocusPreset(presetKey);
    try {
      localStorage.setItem(`hk_interview_${interviewId}_focus`, presetKey);
      const newMix = presetKey === "configured"
        ? (initialSettings.mix && mixIsValid(initialSettings.mix) ? initialSettings.mix : weightsToMix(userWeights))
        : mixForCategory(presetKey as FocusCategoryKey);
      await fetch(`/api/interviews/${interviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            mix: newMix,
            preset: presetFor(newMix),
            difficulty,
            minutes,
            ...(presetKey === "configured" && userWeights
              ? { categoryWeights: userWeights }
              : {}),
          },
        }),
      });
    } catch (err) {
      console.warn("Failed to update settings:", err);
    }
  };

  const currentSettings: SessionSettings = {
    difficulty,
    minutes,
    preset: presetFor(activeMix),
    mix: activeMix,
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
                {ownStages ? (
                  <>
                    <span>
                      {activeStages.length} interview {activeStages.length === 1 ? "stage" : "stages"}
                    </span>
                    <span>·</span>
                    <span>Next: {nextStage.label}</span>
                  </>
                ) : (
                  <span>No stages added</span>
                )}
                <span>·</span>
                <span>
                  {whenText}{" "}
                  {whenRel && whenRel !== "done" && <b className="font-semibold text-ink">({whenRel})</b>}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/interviews/${interviewId}/rebuild?edit=1`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] active:scale-[0.98]"
            >
              <Icon name="sliders" size={13} />
              <span>Edit job & rebuild</span>
            </Link>

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
              buttonClassName="px-4 py-2 rounded-xl text-xs flex items-center justify-center min-w-[155px] whitespace-nowrap gap-2 group shadow-[0_4px_20px_rgba(79,82,248,0.35)] hover:shadow-[0_6px_26px_rgba(79,82,248,0.6)]"
            >
              <Icon name="play" size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              <span>Practise interview</span>
            </StartButton>

            <DeleteInterview id={interviewId} company={companyName} kind="interview" />
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
                    Practise {focusPreset === "configured" ? "configured assessment" : (FOCUS_CATEGORIES.find((c) => c.key === focusPreset)?.label ?? activeStage.titlePhrase)} questions
                  </h2>
                  <p className="text-xs text-muted max-w-[490px] leading-relaxed">
                    {focusPreset === "configured"
                      ? `Questions tailored to your configured weighting: ${userMixText}`
                      : (FOCUS_CATEGORIES.find((c) => c.key === focusPreset)?.description ?? activeStage.description)}
                  </p>
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
                  buttonClassName="px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center min-w-[165px] whitespace-nowrap gap-2 group shadow-[0_4px_22px_rgba(79,82,248,0.45)] hover:shadow-[0_6px_28px_rgba(79,82,248,0.7)] transition-all duration-200"
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
                <p className="text-xs text-muted">
                  {effectiveCategories.length > 0 ? "Each category’s score from your latest interview that included it." : "No practice scores recorded yet"}
                </p>
              </div>
              {effectiveCategories.length > 0 && (
                <Link
                  href={`/interviews/${interviewId}/mocks`}
                  className="text-xs font-semibold text-blue-soft hover:underline flex items-center gap-1"
                >
                  <span>View full report</span>
                  <span>→</span>
                </Link>
              )}
            </div>

            {effectiveCategories.length > 0 ? (
              <>
                <div className="space-y-3 pt-1">
                  {effectiveCategories.map((cat) => {
                    const pct = (cat.score / 5) * 100;
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-ink">{cat.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white num">{cat.score.toFixed(1)}/5</span>
                            {cat.delta != null && cat.delta !== 0 && (
                              <span className={clsx("text-[11px] font-bold num", cat.delta > 0 ? "text-emerald-300" : "text-rose-300")}>
                                <span aria-hidden>{cat.delta > 0 ? "▲" : "▼"}</span>
                                <span className="sr-only">{cat.delta > 0 ? "up" : "down"}</span> {Math.abs(cat.delta).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className={clsx(
                              "h-full rounded-full transition-all duration-500",
                              cat.score < 2
                                ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                                : cat.score < 3.5
                                  ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
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
                  <span>These are scores on your practice answers. The arrows show the change since your previous interview. They don’t predict whether you’ll get an offer.</span>
                </p>
              </>
            ) : (
              <div className="py-5 text-center text-xs text-muted">
                <div className="flex h-9 w-9 mx-auto items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-2">
                  <Icon name="chart" size={15} />
                </div>
                <p className="font-semibold text-white">Baseline scores appear after your first session</p>
                <p className="mt-1 text-dim max-w-sm mx-auto">
                  Practise a round above to generate rubric scores across Experience, Skills, Technical depth, Motivation and Situational questions.
                </p>
              </div>
            )}
          </Panel>

          {/* Card 3: Recent practice */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-sm font-bold text-white">Recent practice</h2>
              {recentSessions.length > 0 && (
                <Link
                  href={`/interviews/${interviewId}/mocks`}
                  className="text-xs font-semibold text-blue-soft hover:underline flex items-center gap-1"
                >
                  <span>See all</span>
                  <span>→</span>
                </Link>
              )}
            </div>

            {recentSessions.length > 0 ? (
              <ul className="divide-y divide-line/60 text-xs">
                {recentSessions.map((session) => (
                  <li key={session.id} className="flex items-center justify-between py-3 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-ink border border-white/10 shrink-0">
                        <Icon name="play" size={12} />
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-white block truncate">{session.title}</span>
                        <p className="text-[11px] text-muted">{session.dateText}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {session.score != null && (
                        <span className="font-semibold text-white num">{session.score} / 5</span>
                      )}
                      <Link
                        href={session.href || `/interviews/${interviewId}/mocks`}
                        className="rounded-lg bg-white/[0.05] hover:bg-white/[0.12] px-3 py-1.5 text-[11px] font-semibold text-white/90 hover:text-white border border-white/10 hover:border-white/20 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                      >
                        Review
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-7 text-center text-xs text-muted">
                <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-white/[0.04] text-muted border border-white/10 mb-2.5">
                  <Icon name="play" size={14} />
                </div>
                <p className="font-semibold text-white">No practice sessions yet</p>
                <p className="mt-1 text-dim max-w-sm mx-auto">
                  Your practice answers, scoring and feedback reports for {roleTitle} will appear here after your first session.
                </p>
              </div>
            )}
          </Panel>
        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="space-y-5">
          {/* Card 4: Your interview stages */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <div>
              <h2 className="text-sm font-bold text-white">{ownStages ? "Your interview stages" : "Rounds to practise"}</h2>
              <p className="text-xs text-muted">{ownStages ? "Track your progress and prepare for each round." : "You haven’t added this interview’s stages, so these are the usual kinds of round. Pick one to practise it."}</p>
            </div>

            <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-line pt-2">
              {activeStages.map((st) => {
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
                        <p className={clsx("text-[11px]", selected ? "text-muted" : "text-dim")}>{formatStageDate(st.subtitle) || st.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {activeStages.length > 1 && (
                        <span
                          role="button"
                          tabIndex={0}
                          title="Delete this round"
                          aria-label={`Delete ${st.label}`}
                          onClick={(e) => void deleteStage(e, st.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              void deleteStage(e as any, st.id);
                            }
                          }}
                          className="p-1 rounded-md text-dim hover:text-red-400 hover:bg-white/[0.08] transition-colors cursor-pointer opacity-70 hover:opacity-100"
                        >
                          <Icon name="trash" size={13} />
                        </span>
                      )}
                      {selected ? (
                        <Icon name="chevronRight" size={14} className="shrink-0 text-indigo-300" />
                      ) : (
                        <span className="text-[11px] font-medium text-dim">{st.subtitle}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Card 5: Practice settings */}
          <Panel className="relative z-20 p-5 sm:p-6 space-y-4">
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
              <StageDropdown stages={activeStages} value={activeStage.id} onChange={setStageId} />
            </div>

            {/* Question focus / Focus area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted">Question focus</span>
                <span className="font-semibold text-indigo-300">
                  {focusPreset === "configured"
                    ? "Assessment weighting (Full mix)"
                    : (FOCUS_CATEGORIES.find((c) => c.key === focusPreset)?.label ?? "Targeted focus")}
                </span>
              </div>

              {/* 1. Main Assessment Mix Card */}
              <button
                type="button"
                onClick={() => void handleFocusChange("configured")}
                className={clsx(
                  "w-full p-3.5 rounded-xl text-left border transition-all flex flex-col gap-2.5 cursor-pointer",
                  focusPreset === "configured"
                    ? "border-indigo-500 bg-indigo-500/15 text-white shadow-[0_0_16px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/50"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 text-[#c9cad4] hover:text-white"
                )}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">Full assessment weighting</span>
                    <span className="rounded bg-indigo-500/25 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">Active</span>
                  </div>
                  {focusPreset === "configured" && <Icon name="check" size={14} className="text-indigo-400 shrink-0" />}
                </div>

                <div className="text-[11px] text-muted">
                  Questions balanced directly to the weighting configured during setup:
                </div>

                {/* Categories progress bars */}
                <div className="space-y-2 pt-1">
                  {categoriesToShow.map((cat) => {
                    const weight = userWeights[cat.key] || 0;
                    return (
                      <div key={cat.key} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-white/80 font-medium">{cat.label}</span>
                          <span className="font-bold text-indigo-300 num">{weight}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                            style={{ width: `${Math.min(100, weight)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </button>

              {/* 2. Category Drilldown Chips */}
              <div className="pt-1 space-y-1.5">
                <span className="text-[11px] text-muted block">Or practise a single area:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categoriesToShow.map((cat) => {
                    const isSel = focusPreset === cat.key;
                    const weight = userWeights[cat.key] || 0;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => void handleFocusChange(cat.key)}
                        className={clsx(
                          "p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-1 cursor-pointer text-xs",
                          isSel
                            ? "border-indigo-500 bg-indigo-500/25 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/40"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 text-[#c9cad4] hover:text-white"
                        )}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="font-semibold text-white text-[11px] truncate">{cat.label}</span>
                          {isSel && <Icon name="check" size={12} className="text-indigo-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-muted">{weight > 0 ? `${weight}% of assessment` : "Targeted drill"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted">Difficulty</span>
                <span className="font-semibold text-indigo-300">{DIFFICULTY_LABEL[difficulty]}</span>
              </div>
              <Segmented<Difficulty>
                label="Difficulty"
                fullWidth
                value={difficulty}
                onChange={setDifficulty}
                options={DIFFICULTIES.map((d) => ({ value: d, label: DIFFICULTY_LABEL[d] }))}
              />
            </div>

            {/* Interview length */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted">Interview length</span>
                <span className="font-semibold text-ink">{minutes} min</span>
              </div>
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

            <div className="pt-2 border-t border-line/60 flex items-center gap-1.5 text-[11px] text-muted">
              <Icon name="info" size={13} className="shrink-0" />
              <span>{DIFFICULTY_HINT[difficulty]}</span>
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
                href={`/interviews/${interviewId}/rebuild?edit=1`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-panel-2 border border-line hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)] group"
              >
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/25 transition-transform duration-200 group-hover:scale-110">
                    <Icon name="gear" size={13} />
                  </span>
                  <div>
                    <span className="font-semibold text-ink group-hover:text-white transition-colors">
                      Edit job description & rebuild questions
                    </span>
                    <p className="text-[11px] text-muted">Update job spec, role understanding or upload new CV</p>
                  </div>
                </div>
                <Icon
                  name="chevronRight"
                  size={14}
                  className="text-muted group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </Link>

              <Link
                href={`/practice?interview=${interviewId}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-panel-2 border border-line hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)] group"
              >
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 transition-transform duration-200 group-hover:scale-110">
                    <Icon name="target" size={13} />
                  </span>
                  <div>
                    <span className="font-semibold text-ink group-hover:text-white transition-colors">
                      Browse Practice Hub workouts
                    </span>
                    <p className="text-[11px] text-muted">Targeted 1-question drills for Strengths, Competency and Scenarios</p>
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
