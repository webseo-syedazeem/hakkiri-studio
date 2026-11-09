"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button, buttonClass, Icon } from "@/components/ui";
import { useMicrophone } from "@/components/audio/useMicrophone";
import { speak } from "@/components/audio/speak";
import { SlideView } from "./SlideView";
import { mmss } from "@/lib/format";
import { OPENING_SEC } from "@/lib/pitch/labels";
import type { Mark, RunMode, Slide } from "@/lib/pitch/types";

type Phase = "ready" | "running" | "paused" | "scoring" | "error";

const MIC_BLOCKED = "Hakkiri can’t hear your microphone. Click the lock or mic icon in the address bar, allow the microphone, then press Try again.";
const BARS = 132;
const QUIET_SEC = 10;

export interface RehearsalProps {
  presentationId: string;
  heading: string;
  /** "Run 4, full run" */
  runLabel: string;
  mode: RunMode;
  slides: Slide[];
  from: number;
  to: number;
  timeLimitSec: number;
  demoReportHref: string | null;
}

const DEFAULT_SPEAKER_NOTES: Record<number, string[]> = {
  1: ["Introduce the plan for payments in Q1.", "State clearly that you need a decision by the end.", "Set expectation for a 10-minute presentation."],
  2: ["Explain the 41% to 58% jump in payment completion.", "Highlight the reduction in customer support calls.", "Keep focus on why this creates the foundation for Q1."],
  3: ["Share customer research quotes.", "Point out that drop-off happens when payment fails.", "Connect customer pain directly to our roadmap."],
  4: ["Introduce the three key bets for Q1.", "Link each to a customer benefit.", "Keep it to around one minute."],
  5: ["Explain instant refunds and how 92% of disputes are settled.", "Mention the February rollout target.", "Address risk limits and fraud controls."],
  6: ["Highlight reduction in false declines from 3.1% to 1.4%.", "Walk through the phased rollout starting in February.", "Explain how this protects revenue."],
  7: ["Introduce one-tap repeat payments.", "Explain merchant pilot with 3 partners in March.", "Briefly mention card scheme sign-off dependency."],
  8: ["Clearly state what we're NOT doing to protect team focus.", "Explain crypto and scheme trade-offs.", "Reassure leadership about disciplined scope."],
  9: ["Summarise team capacity (7 people).", "Detail the two required hires (engineer and risk analyst).", "Explain why they need to start in January."],
  10: ["Acknowledge fraud and scheme risks transparently.", "Explain the daily review and mitigation caps.", "Show confidence in risk management."],
  11: ["Walk through the monthly milestones (Jan, Feb, Mar).", "Reiterate that all three bets land by end of March.", "Prepare to transition to the final ask."],
  12: ["Deliver the clear and direct ask.", "Request approval for the roadmap and the two hires.", "Open the floor for questions."],
};

export function Rehearsal(p: RehearsalProps) {
  const router = useRouter();
  const scope = useMemo(() => p.slides.filter((s) => s.n >= p.from && s.n <= p.to), [p.slides, p.from, p.to]);
  const mic = useMicrophone({ barSec: 0.25 });
  const [phase, setPhase] = useState<Phase>("ready");
  const [index, setIndex] = useState(0);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [problem, setProblem] = useState<{ message: string; kind: "mic" | "score" | "keys" } | null>(null);
  const [scoringSec, setScoringSec] = useState(0);
  const [speakerNotesOpen, setSpeakerNotesOpen] = useState(true);
  const [isSpeakingNotes, setIsSpeakingNotes] = useState(false);
  const voiceRef = useRef<{ done: Promise<void>; cancel: () => void } | null>(null);
  const [checklist, setChecklist] = useState<Record<number, Record<number, boolean>>>({
    4: { 0: true, 1: false, 2: false },
  });

  const recording = useRef<{ blob: Blob; startedAt: string; marks: Mark[]; totalSec: number } | null>(null);
  const startedAt = useRef(new Date().toISOString());
  const lastHeard = useRef(0);
  const finishing = useRef(false);

  const slide = scope[index] ?? scope[0];
  const elapsed = phase === "ready" ? 0 : mic.elapsed;
  const budget = p.mode === "full" ? p.timeLimitSec : p.mode === "opening" ? OPENING_SEC : scope.reduce((a, s) => a + s.plannedSec, 0);

  /** Seconds on each slide so far, from slide marks */
  const perSlide = useMemo(() => {
    const out = new Map<number, number>();
    marks.forEach((m, i) => {
      const until = i + 1 < marks.length ? marks[i + 1].at : elapsed;
      out.set(m.n, (out.get(m.n) ?? 0) + Math.max(0, until - m.at));
    });
    return out;
  }, [marks, elapsed]);

  const onSlide = perSlide.get(slide?.n ?? 1) ?? 0;
  const plannedSlideSec = slide?.plannedSec ?? 60;
  const overSlide = onSlide - plannedSlideSec;

  if (phase === "running" && mic.level > 0.06) lastHeard.current = elapsed;

  const go = useCallback(
    (to: number) => {
      if (to < 0 || to >= scope.length || to === index) return;
      voiceRef.current?.cancel();
      setIsSpeakingNotes(false);
      setIndex(to);
      if (phase === "running" || phase === "paused") {
        setMarks((ms) => [...ms, { n: scope[to].n, at: Math.round(mic.elapsed * 100) / 100 }]);
      }
    },
    [scope, index, phase, mic.elapsed]
  );

  const upload = useCallback(async () => {
    const rec = recording.current;
    if (!rec) return;
    setPhase("scoring");
    setProblem(null);
    setScoringSec(0);
    const form = new FormData();
    form.append("audio", rec.blob, "run.webm");
    form.append("meta", JSON.stringify({ mode: p.mode, from: p.from, to: p.to, startedAt: rec.startedAt, totalSec: rec.totalSec, marks: rec.marks }));
    try {
      const res = await fetch(`/api/presentations/${p.presentationId}/runs`, { method: "POST", body: form });
      const json = (await res.json().catch(() => ({}))) as { id?: string; error?: string; message?: string };
      if (res.ok && json.id) {
        router.push(`/presentations/${p.presentationId}/runs/${json.id}`);
        router.refresh();
        return;
      }
      // Resilient fallback for demo presentation
      if (p.demoReportHref) {
        router.push(p.demoReportHref);
        return;
      }
      setProblem({ message: json.message ?? "Something went wrong while scoring your run.", kind: json.error === "not-configured" ? "keys" : "score" });
    } catch {
      if (p.demoReportHref) {
        router.push(p.demoReportHref);
        return;
      }
      setProblem({ message: "Couldn’t reach Hakkiri with your run. Check your connection and try again.", kind: "score" });
    }
    setPhase("error");
  }, [p.mode, p.from, p.to, p.presentationId, p.demoReportHref, router]);

  const finish = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    voiceRef.current?.cancel();
    setIsSpeakingNotes(false);
    const totalSec = mic.elapsed;
    const blob = await mic.stop();
    if (!blob || blob.size < 2000 || totalSec < 5) {
      finishing.current = false;
      if (p.demoReportHref) return router.push(p.demoReportHref);
      router.push(`/presentations/${p.presentationId}`);
      return;
    }
    recording.current = { blob, startedAt: startedAt.current, marks, totalSec: Math.round(totalSec * 10) / 10 };
    await upload();
    finishing.current = false;
  }, [mic, marks, upload, p.demoReportHref, router]);

  const start = useCallback(async () => {
    setProblem(null);
    if (!(await mic.prime()) || !(await mic.start())) {
      await mic.stop();
      setProblem({ message: MIC_BLOCKED, kind: "mic" });
      setPhase("error");
      return;
    }
    startedAt.current = new Date().toISOString();
    lastHeard.current = 0;
    setIndex(0);
    setMarks([{ n: scope[0]?.n ?? 1, at: 0 }]);
    setPhase("running");
    
    // Voice Coach introduction out loud
    voiceRef.current?.cancel();
    const headingClean = p.heading.split(",")[0] || "your presentation";
    const minutes = Math.max(1, Math.round(budget / 60));
    voiceRef.current = speak(`Starting rehearsal for ${headingClean}. You have ${minutes} minutes for your slides. Start speaking whenever you're ready.`, { voice: "easy" });
  }, [mic, scope, p.heading, budget]);

  const togglePause = useCallback(() => {
    if (phase === "running") {
      mic.pause();
      setPhase("paused");
    } else if (phase === "paused") {
      mic.resume();
      setPhase("running");
    } else if (phase === "ready") {
      void start();
    }
  }, [phase, mic, start]);

  // Arrow key navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea, select")) return;
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        if (phase === "ready") void start();
        else go(index + 1);
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, phase, start]);

  useEffect(() => {
    return () => {
      voiceRef.current?.cancel();
    };
  }, []);

  const live = phase === "running" || phase === "paused";
  const nextSlide = scope[index + 1];
  const slideNotes = slide?.notes ? slide.notes.split("\n").filter(Boolean) : DEFAULT_SPEAKER_NOTES[slide?.n] ?? ["Deliver the key point with clear evidence.", "Stay within the allotted time."];

  const readNotesAloud = useCallback(() => {
    if (isSpeakingNotes) {
      voiceRef.current?.cancel();
      setIsSpeakingNotes(false);
      return;
    }
    const notesText = slideNotes.join(". ");
    if (!notesText.trim()) return;
    setIsSpeakingNotes(true);
    voiceRef.current?.cancel();
    const speech = speak(notesText, { voice: "easy" });
    voiceRef.current = speech;
    speech.done.then(() => setIsSpeakingNotes(false));
  }, [isSpeakingNotes, slideNotes]);

  const currentChecklist = checklist[slide?.n] ?? { 0: false, 1: false, 2: false };
  const toggleCheck = (idx: number) => {
    setChecklist((cur) => ({
      ...cur,
      [slide?.n]: {
        ...(cur[slide?.n] ?? { 0: false, 1: false, 2: false }),
        [idx]: !currentChecklist[idx],
      },
    }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#07060f] text-white">
      {/* 1. TOP HEADER (Matching Image 1) */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-6 lg:px-10 bg-[#0b0a17]">
        {/* Left info */}
        <div>
          <Link
            href={`/presentations/${p.presentationId}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors"
          >
            <Icon name="back" size={13} />
            <span>Presentations</span>
            <span className="text-white/20">/</span>
            <span className="text-[#c9cad3]">{p.heading.split(",")[0] || "Q1 product roadmap"}</span>
          </Link>

          <div className="flex items-center gap-2.5 mt-0.5">
            <h1 className="text-base font-bold text-white tracking-tight">{p.heading.split(",")[0] || "Q1 product roadmap"}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live rehearsal
            </span>
            <span className="hidden sm:inline text-xs text-muted">
              · {p.heading.split(",")[1] || "Leadership team"} · {Math.round(budget / 60)} minutes · With Q&A (Challenging)
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Recording badge */}
          {phase === "running" && (
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 border border-rose-500/25 px-3 py-1 text-xs font-semibold text-rose-300 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Recording
            </span>
          )}
          {phase === "paused" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 px-3 py-1 text-xs font-semibold text-amber-300">
              Paused
            </span>
          )}

          {/* Timer */}
          <div className="num font-bold text-sm tracking-tight text-white bg-[#141326] border border-white/10 px-3 py-1 rounded-xl">
            {mmss(elapsed)} <span className="text-muted font-normal">/ {mmss(budget)}</span>
          </div>

          {/* Pause Button */}
          {live && (
            <button
              type="button"
              onClick={togglePause}
              className="flex items-center gap-1.5 text-xs font-medium text-white px-3 py-1.5 rounded-xl bg-[#141326] border border-white/10 hover:border-white/25 transition-all"
            >
              <Icon name="pause" size={13} />
              <span>{phase === "paused" ? "Resume" : "Pause"}</span>
            </button>
          )}

          {/* End Rehearsal Button */}
          {live ? (
            <button
              type="button"
              onClick={() => void finish()}
              className="flex items-center gap-1.5 text-xs font-semibold text-white px-3.5 py-1.5 rounded-xl bg-white/[0.08] border border-white/15 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-200 transition-all"
            >
              <span className="h-2.5 w-2.5 rounded-sm bg-white" />
              <span>End rehearsal</span>
            </button>
          ) : phase === "ready" ? (
            <button
              type="button"
              onClick={() => void start()}
              className="pro-btn-glow flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-1.5 rounded-xl bg-blue shadow-lg"
            >
              <Icon name="play" size={13} />
              <span>Start</span>
            </button>
          ) : (
            <Link href={`/presentations/${p.presentationId}`} className={buttonClass("secondary", "sm")}>
              Back
            </Link>
          )}
        </div>
      </header>

      {/* 2. MAIN LAYOUT (Slide area on Left, Cards on Right) */}
      <main className="grid min-h-0 grow grid-cols-1 xl:grid-cols-[1.65fr_0.85fr] gap-6 px-6 lg:px-10 py-6 w-full items-start">
        {/* CENTER / LEFT: The Big Slide + Strip + Progress + Navigation */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* Main Slide Card */}
          <div className="relative rounded-2xl bg-white p-6 shadow-2xl border border-white/20 overflow-hidden text-gray-900 aspect-[16/10] flex flex-col justify-between">
            {slide?.layout === "cards" ? (
              <div className="flex flex-col justify-between h-full py-4 px-2">
                <h2 className="text-2xl lg:text-3xl font-extrabold text-[#111827] tracking-tight">{slide.title}</h2>
                <div className="grid grid-cols-3 gap-4 my-auto">
                  {slide.lines.map((bet, i) => (
                    <div key={i} className="rounded-2xl bg-[#eef7f2] border border-[#d2ebd9] p-5 flex flex-col justify-between h-44 shadow-sm">
                      <div className="h-9 w-9 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="text-base lg:text-lg font-bold text-[#1b4332] leading-snug">{bet}</div>
                    </div>
                  ))}
                </div>
                <div className="text-right text-xs font-semibold text-gray-400 num">{slide.n}</div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between">
                <SlideView slide={slide} presentationId={p.presentationId} className="w-full h-full" />
                <div className="text-right text-xs font-semibold text-gray-400 num">{slide?.n}</div>
              </div>
            )}
          </div>

          {/* Carousel Thumbnails Strip */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0d0c1c] border border-white/[0.08] shadow-lg">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="p-1 rounded-lg text-muted hover:text-white disabled:opacity-30 transition-colors"
            >
              <Icon name="chevronRight" size={16} className="rotate-180" />
            </button>

            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar grow py-1 px-1">
              {scope.map((s, idx) => {
                const active = idx === index;
                return (
                  <button
                    key={s.n}
                    type="button"
                    onClick={() => go(idx)}
                    className={clsx(
                      "flex-shrink-0 w-24 h-15 rounded-lg bg-white p-1.5 flex flex-col justify-between text-left transition-all border shadow-sm relative overflow-hidden",
                      active ? "border-indigo-400 ring-2 ring-indigo-500/50 scale-105" : "border-gray-200 opacity-60 hover:opacity-90"
                    )}
                  >
                    <span className="text-[8px] font-bold text-gray-800 line-clamp-1">{s.title}</span>
                    <div className="flex items-center justify-between text-[7px] text-gray-500">
                      <span className="num font-semibold">{s.n}</span>
                      <span className="h-1.5 w-6 rounded-full bg-indigo-500/40" />
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => go(index + 1)}
              disabled={index === scope.length - 1}
              className="p-1 rounded-lg text-muted hover:text-white disabled:opacity-30 transition-colors"
            >
              <Icon name="chevronRight" size={16} />
            </button>
          </div>

          {/* Presentation Progress Bar */}
          <div className="p-4 rounded-xl bg-[#0d0c1c] border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between text-xs mb-2.5">
              <div className="flex items-center gap-1.5 text-white font-medium">
                <span>Presentation progress</span>
                <Icon name="info" size={13} className="text-muted" />
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-indigo-300">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  On time
                </span>
                <span className="inline-flex items-center gap-1.5 text-rose-300">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Over time
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  Not started
                </span>
              </div>
            </div>

            {/* Segmented Timeline */}
            <div className="flex items-center gap-1.5">
              {scope.map((s, idx) => {
                const visited = idx <= index;
                const isOver = visited && (perSlide.get(s.n) ?? 0) > s.plannedSec;
                return (
                  <div key={s.n} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={clsx(
                        "h-2 w-full rounded-full transition-all",
                        !visited ? "bg-white/[0.08]" : isOver ? "bg-rose-500" : "bg-indigo-500"
                      )}
                    />
                    <span className="text-[10px] num text-muted">{s.n}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0d0c1c] border border-white/[0.08] shadow-lg">
            <div className="text-xs text-muted flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">←</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">→</span>
              <span>Use arrow keys to change slides</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(index - 1)}
                disabled={index === 0}
                className="px-3.5 py-2 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 text-xs font-semibold text-white disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <Icon name="chevronRight" size={13} className="rotate-180" />
                <span>Previous slide</span>
              </button>

              {/* Glowing Center Mic Button */}
              <button
                type="button"
                onClick={togglePause}
                title={phase === "running" ? "Pause" : "Start speaking"}
                className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_0_24px_rgba(79,70,229,0.55)] hover:scale-105 transition-all"
              >
                <Icon name="mic" size={20} />
              </button>

              <button
                type="button"
                onClick={() => go(index + 1)}
                disabled={index === scope.length - 1}
                className="px-3.5 py-2 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 text-xs font-semibold text-white disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <span>Next slide</span>
                <Icon name="chevronRight" size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (3 Cards matching Image 1) */}
        <div className="flex flex-col gap-4">
          {/* Card 1: Current slide */}
          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Current slide</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  disabled={index === 0}
                  className="p-1 rounded text-muted hover:text-white disabled:opacity-30"
                >
                  <Icon name="chevronRight" size={14} className="rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  disabled={index === scope.length - 1}
                  className="p-1 rounded text-muted hover:text-white disabled:opacity-30"
                >
                  <Icon name="chevronRight" size={14} />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-white tracking-tight num">
                {slide?.n} <span className="text-muted text-base font-normal">of {scope.length}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {/* Time on slide */}
                <div className="p-3 rounded-xl bg-[#141326] border border-white/10">
                  <div className="flex items-center gap-1 text-[11px] text-muted">
                    <Icon name="clock" size={12} />
                    <span>Time on this slide</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white num">{mmss(onSlide)}</span>
                    {overSlide > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/25">
                        +{mmss(overSlide)} over plan
                      </span>
                    )}
                  </div>
                </div>

                {/* Planned time */}
                <div className="p-3 rounded-xl bg-[#141326] border border-white/10">
                  <div className="text-[11px] text-muted">Planned time</div>
                  <div className="mt-1 text-xl font-bold text-white num">{mmss(plannedSlideSec)}</div>
                </div>
              </div>

              {/* Next slide title */}
              {nextSlide && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted pt-3 border-t border-white/[0.06]">
                  <Icon name="chevronRight" size={13} className="text-indigo-400" />
                  <span className="text-muted">Next slide:</span>
                  <span className="text-white font-medium truncate">{nextSlide.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Speaker notes */}
          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Icon name="doc" size={15} className="text-indigo-400" />
                <span>Speaker notes</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={readNotesAloud}
                  className={clsx(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer",
                    isSpeakingNotes
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25 animate-pulse"
                      : "bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25"
                  )}
                  title={isSpeakingNotes ? "Stop reading" : "Read speaker notes aloud"}
                >
                  <Icon name={isSpeakingNotes ? "pause" : "volume"} size={12} />
                  <span>{isSpeakingNotes ? "Stop" : "Read aloud"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpeakerNotesOpen((o) => !o)}
                  className={clsx(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                    speakerNotesOpen ? "bg-indigo-600" : "bg-white/20"
                  )}
                >
                  <span
                    className={clsx(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      speakerNotesOpen ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>

            {speakerNotesOpen && (
              <ul className="mt-3.5 space-y-2 text-xs text-[#c9cad3] leading-relaxed animate-rise">
                {slideNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Card 3: Rehearsal checklist */}
          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.07]">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                <Icon name="target" size={14} />
              </div>
              <span className="text-sm font-semibold text-white">Rehearsal checklist</span>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {[
                "Cover the key message for this slide",
                `Keep to the planned time (${mmss(plannedSlideSec)})`,
                "Set up the next slide clearly",
              ].map((label, i) => {
                const checked = Boolean(currentChecklist[i]);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleCheck(i)}
                    className="w-full text-left flex items-start gap-2.5 text-xs text-[#c9cad3] hover:text-white transition-colors group"
                  >
                    <div
                      className={clsx(
                        "h-4 w-4 rounded border mt-0.5 flex items-center justify-center transition-all shrink-0",
                        checked ? "bg-indigo-600 border-indigo-500 text-white" : "border-white/30 bg-[#141326] group-hover:border-white/50"
                      )}
                    >
                      {checked && <Icon name="check" size={11} strokeWidth={2.8} />}
                    </div>
                    <span className={clsx("leading-tight", checked && "text-white font-medium")}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
