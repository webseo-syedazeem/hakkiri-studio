"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Mark as Logo } from "@/components/brand/Mark";
import { Button, buttonClass, Icon } from "@/components/ui";
import { useMicrophone } from "@/components/audio/useMicrophone";
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
  /** Where to go if there's no recording, or no keys yet. */
  demoReportHref: string | null;
}

/**
 * Live rehearsal (design screen 12). The whole run is recorded while you
 * move through your slides with the arrow keys (or a clicker); every slide
 * change is timestamped, so the report can time each slide and check what
 * you said on it. Pace, fillers and whether each point landed are worked
 * out from the recording afterwards, in the report.
 */
export function Rehearsal(p: RehearsalProps) {
  const router = useRouter();
  const scope = useMemo(() => p.slides.filter((s) => s.n >= p.from && s.n <= p.to), [p.slides, p.from, p.to]);
  const mic = useMicrophone({ barSec: 0.25 });
  const [phase, setPhase] = useState<Phase>("ready");
  const [index, setIndex] = useState(0);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [problem, setProblem] = useState<{ message: string; kind: "mic" | "score" | "keys" } | null>(null);
  const [scoringSec, setScoringSec] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const recording = useRef<{ blob: Blob; startedAt: string; marks: Mark[]; totalSec: number } | null>(null);
  const startedAt = useRef(new Date().toISOString());
  const lastHeard = useRef(0);
  const finishing = useRef(false);

  const slide = scope[index];
  const elapsed = phase === "ready" ? 0 : mic.elapsed;
  const budget = p.mode === "full" ? p.timeLimitSec : p.mode === "opening" ? OPENING_SEC : scope.reduce((a, s) => a + s.plannedSec, 0);

  /** Seconds on each slide so far, from the slide changes and the clock. */
  const perSlide = useMemo(() => {
    const out = new Map<number, number>();
    marks.forEach((m, i) => {
      const until = i + 1 < marks.length ? marks[i + 1].at : elapsed;
      out.set(m.n, (out.get(m.n) ?? 0) + Math.max(0, until - m.at));
    });
    return out;
  }, [marks, elapsed]);
  const onSlide = perSlide.get(slide.n) ?? 0;
  const overSlide = onSlide - slide.plannedSec;

  if (phase === "running" && mic.level > 0.06) lastHeard.current = elapsed;
  const quiet = phase === "running" && mic.state === "live" && elapsed - lastHeard.current > QUIET_SEC;

  const go = useCallback(
    (to: number) => {
      if (to < 0 || to >= scope.length || to === index) return;
      setIndex(to);
      if (phase === "running" || phase === "paused") setMarks((ms) => [...ms, { n: scope[to].n, at: Math.round(mic.elapsed * 100) / 100 }]);
    },
    [scope, index, phase, mic.elapsed],
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
      setProblem({ message: json.message ?? "Something went wrong while scoring your run.", kind: json.error === "not-configured" ? "keys" : "score" });
    } catch {
      setProblem({ message: "Couldn’t reach Hakkiri with your run. Check your connection and try again. Your recording is kept until you leave this page.", kind: "score" });
    }
    setPhase("error");
  }, [p.mode, p.from, p.to, p.presentationId, router]);

  const finish = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    const totalSec = mic.elapsed;
    const blob = await mic.stop();
    if (!blob || blob.size < 2000 || totalSec < 5) {
      finishing.current = false;
      if (totalSec < 5) {
        setPhase("ready");
        setIndex(0);
        setMarks([]);
        setNotice("That run was under five seconds, so there was nothing to score. Start again when you’re ready.");
        return;
      }
      if (p.demoReportHref) return router.push(`${p.demoReportHref}?demo=no-audio`);
      setProblem({ message: "No recording was captured, so there’s nothing to score. Check your microphone and run it again.", kind: "mic" });
      setPhase("error");
      return;
    }
    recording.current = { blob, startedAt: startedAt.current, marks, totalSec: Math.round(totalSec * 10) / 10 };
    await upload();
    finishing.current = false;
  }, [mic, marks, upload, p.demoReportHref, router]);

  const start = useCallback(async () => {
    setProblem(null);
    setNotice(null);
    if (!(await mic.prime()) || !(await mic.start())) {
      await mic.stop();
      setProblem({ message: MIC_BLOCKED, kind: "mic" });
      setPhase("error");
      return;
    }
    startedAt.current = new Date().toISOString();
    lastHeard.current = 0;
    setIndex(0);
    setMarks([{ n: scope[0].n, at: 0 }]);
    setPhase("running");
  }, [mic, scope]);

  const togglePause = useCallback(() => {
    if (phase === "running") {
      mic.pause();
      setPhase("paused");
    } else if (phase === "paused") {
      mic.resume();
      setPhase("running");
    }
  }, [phase, mic]);

  // The opening-only run stops itself a few seconds after the minute, so you can finish your sentence.
  useEffect(() => {
    if (p.mode === "opening" && phase === "running" && mic.elapsed >= OPENING_SEC + 5) void finish();
  }, [p.mode, phase, mic.elapsed, finish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea, select")) return;
      if (["ArrowRight", "ArrowDown", "PageDown"].includes(e.key)) {
        e.preventDefault();
        go(index + 1);
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  // Don't lose a run by closing the tab.
  useEffect(() => {
    if (phase !== "running" && phase !== "paused" && phase !== "scoring") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  useEffect(() => {
    if (phase !== "scoring") return;
    const t = setInterval(() => setScoringSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const live = phase === "running" || phase === "paused";
  const overTotal = elapsed > budget;
  const next = scope[index + 1];
  const slideMsg =
    phase === "ready"
      ? `${mmss(slide.plannedSec)} planned for this slide.`
      : overSlide > 0
        ? `${Math.round(overSlide)} seconds over. Land the point and move on.`
        : onSlide >= slide.plannedSec * 0.8
          ? "Nearly time. Land the point."
          : "On track.";
  const bars = mic.bars.slice(-BARS);
  const scoringStep = scoringSec < 6 ? "Turning your recording into text" : scoringSec < 14 ? "Splitting it slide by slide and timing each one" : scoringSec < 30 ? "Checking each slide’s point and your opening" : "Writing your one fix";

  return (
    <div className="flex h-dvh min-h-[640px] flex-col">
      <header className="flex h-[68px] shrink-0 items-center justify-between px-10">
        <div className="flex min-w-0 items-center gap-3.5">
          <Logo size={26} />
          <h1 className="flex min-w-0 items-center gap-3.5 text-sm">
            <span className="font-semibold">Rehearsal</span>
            <span className="truncate font-normal text-muted">{p.heading}</span>
          </h1>
        </div>
        <span className="text-[13px] text-muted">{p.runLabel}</span>
        <div className="flex items-center gap-2.5">
          {phase === "running" && (
            <span className="inline-flex h-[34px] items-center gap-2 rounded-full bg-red/15 px-3.5 text-[13px] font-semibold text-red-soft">
              <span className="h-2 w-2 animate-rec rounded-full bg-red" />
              Recording
            </span>
          )}
          {phase === "paused" && <span className="inline-flex h-[34px] items-center rounded-full bg-panel-2 px-3.5 text-[13px] font-semibold text-muted">Paused</span>}
          {phase === "scoring" && (
            <span className="inline-flex h-[34px] items-center gap-2 rounded-full bg-blue/15 px-3.5 text-[13px] font-semibold text-lilac">
              <span className="h-2 w-2 animate-rec rounded-full bg-blue" />
              Scoring
            </span>
          )}
          {live ? (
            <Button size="sm" onClick={() => void finish()} title="Stop here and score what you’ve done">
              End run
            </Button>
          ) : (
            phase !== "scoring" && (
              <Link href={`/presentations/${p.presentationId}`} className={buttonClass("secondary", "sm")}>
                Back
              </Link>
            )
          )}
        </div>
      </header>

      <main className="grid min-h-0 grow grid-cols-[minmax(0,960px)_minmax(300px,1fr)] gap-7 px-10 pt-3">
        {/* The slide shrinks on shorter screens so the strip, timeline and controls always fit. */}
        <div className="min-w-0 self-start" style={{ width: "min(100%, calc((100dvh - 322px) * 16 / 9))" }}>
          <SlideView
            key={slide.n}
            slide={slide}
            presentationId={p.presentationId}
            className="w-full animate-rise rounded-[10px] shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_24px_60px_rgba(0,0,0,0.35)] [animation-duration:0.35s]"
          />
          <div className="mt-[18px] flex items-center gap-[18px] rounded-xl bg-panel px-4 py-2.5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <span className="text-[13px] font-semibold">You</span>
            <div aria-hidden className="flex h-[34px] grow items-center gap-[3px] overflow-hidden">
              {Array.from({ length: BARS }, (_, i) => {
                const v = bars[i - (BARS - bars.length)];
                return v == null ? (
                  <span key={i} className="h-0.5 w-[3px] shrink-0 rounded-full bg-white/12" />
                ) : (
                  <span key={i} className={clsx("w-[3px] shrink-0 rounded-full", i >= BARS - 6 && phase === "running" ? "bg-blue" : "bg-wave")} style={{ height: `max(4px, ${Math.round(v * 100)}%)` }} />
                );
              })}
            </div>
            <span className={clsx("shrink-0 text-[13px]", quiet ? "font-semibold text-red-soft" : "text-muted")} role={quiet ? "alert" : undefined}>
              {quiet ? "Can’t hear you. Check your mic." : phase === "ready" ? "Recording starts when you press Start" : "Pace and fillers are in your report"}
            </span>
          </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-3.5">
          {phase === "scoring" || (phase === "error" && problem) ? (
            <div className="rounded-[14px] bg-panel px-5 py-[18px] shadow-[inset_0_0_0_1px_var(--color-line)]" role="status">
              {phase === "scoring" ? (
                <>
                  <div className="text-[13px] text-muted">Scoring your run</div>
                  <div className="mt-1 text-base font-semibold">{scoringStep}…</div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className="h-full rounded-full bg-blue transition-[width] duration-1000" style={{ width: `${Math.min(92, 8 + scoringSec * 2.2)}%` }} />
                  </div>
                  <p className="mt-3 text-[13px] leading-normal text-muted">A ten-minute run takes about half a minute. Your report opens when it’s ready.</p>
                </>
              ) : (
                <>
                  <div className="text-[13px] font-semibold text-red-soft">{problem?.kind === "keys" ? "Scoring isn’t set up yet" : problem?.kind === "mic" ? "Microphone" : "Your run wasn’t scored"}</div>
                  <p className="mt-1.5 text-sm leading-normal" role="alert">
                    {problem?.message}
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-[14px] bg-panel px-5 py-[18px] shadow-[inset_0_0_0_1px_var(--color-line)]">
                <div className="flex justify-between text-[13px] text-muted">
                  <span>{p.mode === "opening" ? "Your opening" : "Total"}</span>
                  <span className="num">of {mmss(budget)}</span>
                </div>
                <div className={clsx("num mt-1 text-[40px] font-semibold leading-none tracking-[-0.03em]", overTotal && "text-red-soft")}>{mmss(elapsed)}</div>
                <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className={clsx("h-full rounded-full", overTotal ? "bg-red" : "bg-blue-fill")} style={{ width: `${Math.min(100, (elapsed / Math.max(1, budget)) * 100)}%` }} />
                </div>
                {p.mode === "opening" && elapsed >= OPENING_SEC && <p className="mt-2.5 text-[13px] font-semibold text-red-soft">That’s your minute. Finish your sentence.</p>}
              </div>

              <div className={clsx("rounded-[14px] bg-panel px-5 py-[18px]", live && overSlide > 0 ? "shadow-[inset_0_0_0_1.5px_rgb(255_92_97/0.55)]" : "shadow-[inset_0_0_0_1px_var(--color-line)]")}>
                <div className="flex justify-between text-[13px] text-muted">
                  <span className="num">
                    Slide {slide.n} of {p.slides.length}
                  </span>
                  <span className="num">planned {mmss(slide.plannedSec)}</span>
                </div>
                <div className={clsx("num mt-1 text-[40px] font-semibold leading-none tracking-[-0.03em]", live && overSlide > 0 ? "text-red-soft" : phase === "ready" && "text-dim")}>{mmss(onSlide)}</div>
                <p className="mt-2.5 text-sm">{slideMsg}</p>
              </div>

              <div className="rounded-[14px] bg-panel px-5 py-[18px] shadow-[inset_0_0_0_1px_var(--color-line)]">
                <div className="text-[13px] text-muted">The point this slide needs to land</div>
                <div className="mt-1 text-[15px] font-semibold leading-snug">{slide.point}</div>
                <div className="mt-2 text-[13px] text-dim">Checked against what you said, in your report.</div>
              </div>

              {next ? (
                <button type="button" onClick={() => go(index + 1)} disabled={phase === "ready"} className="flex items-center gap-3.5 text-left disabled:cursor-default">
                  <SlideView slide={next} presentationId={p.presentationId} className="w-[150px] shrink-0 rounded-[5px] opacity-70 shadow-[0_0_0_1px_var(--color-line-strong)]" />
                  <span className="min-w-0">
                    <span className="block text-[13px] text-dim">Next</span>
                    <span className="block truncate text-sm font-semibold text-muted">{next.title}</span>
                  </span>
                </button>
              ) : (
                <p className="px-1 text-[13px] text-muted">{p.mode === "full" ? "Last slide. Make your ask, then press Finish run." : "Last slide in this run. Press Finish run when you’re done."}</p>
              )}
            </>
          )}
        </aside>
      </main>

      <section aria-label="Time per slide" className="shrink-0 px-10 pt-4">
        <div className="flex items-baseline justify-between text-[13px] text-dim">
          <span>Time per slide, sized by plan</span>
          <span className="flex items-center gap-3">
            <span className="text-muted">On time</span>
            <span className="text-dim">|</span>
            <span className="text-red-soft">Over</span>
          </span>
        </div>
        <div className="mt-2 flex gap-1.5">
          {scope.map((s, i) => {
            const t = perSlide.get(s.n) ?? 0;
            const over = t > s.plannedSec;
            const current = i === index && phase !== "ready";
            return (
              <div key={s.n} className="min-w-[10px]" style={{ flexGrow: s.plannedSec, flexBasis: 0 }}>
                <div className={clsx("relative h-2 overflow-hidden rounded-[3px] bg-white/[0.07]", current && "shadow-[0_0_0_1.5px_rgb(255_179_181/0.7)]")}>
                  <div className={clsx("absolute inset-y-0 left-0 rounded-[3px]", over ? "bg-[#9b3f49]" : current ? "bg-white/40" : "bg-wave")} style={{ width: `${Math.min(100, (t / s.plannedSec) * 100)}%` }} />
                </div>
                <div className={clsx("num mt-1.5 text-[11px]", current ? "font-semibold text-ink" : "text-dim")}>{s.n}</div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="flex shrink-0 items-center justify-between gap-6 px-10 pb-[clamp(16px,3vh,28px)] pt-3">
        <span className={clsx("text-[13px]", notice && phase === "ready" ? "text-red-soft" : "text-muted")} role={notice && phase === "ready" ? "status" : undefined}>
          {notice && phase === "ready"
            ? notice
            : phase === "ready"
            ? p.mode === "opening"
              ? "Your first 60 seconds, then it stops. Change slides with the arrow keys."
              : "Use the arrow keys or a clicker to change slides. Every change is timed."
            : "Use the arrow keys to change slides"}
        </span>
        <div className="flex gap-2.5">
          {phase === "ready" ? (
            <Button variant="primary" className="px-[26px]" onClick={() => void start()}>
              <Icon name="mic" size={17} strokeWidth={2} />
              Start run
            </Button>
          ) : phase === "scoring" ? (
            <Button variant="primary" className="px-[26px]" disabled>
              Scoring your run…
            </Button>
          ) : phase === "error" ? (
            problem?.kind === "mic" ? (
              <>
                <Link href={`/mic-check?next=${encodeURIComponent(`/rehearse/${p.presentationId}`)}`} className={buttonClass("secondary", "md")}>
                  Check your microphone
                </Link>
                <Button variant="primary" className="px-[26px]" onClick={() => void start()}>
                  <Icon name="mic" size={17} strokeWidth={2} />
                  Try again
                </Button>
              </>
            ) : problem?.kind === "keys" ? (
              <>
                {p.demoReportHref && (
                  <Link href={`${p.demoReportHref}?demo=no-keys`} className={buttonClass("secondary", "md")}>
                    See the demo report
                  </Link>
                )}
                <Link href={`/presentations/${p.presentationId}`} className={buttonClass("primary", "md")}>
                  Back to your presentation
                </Link>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    recording.current = null;
                    setPhase("ready");
                    setIndex(0);
                    setMarks([]);
                  }}
                >
                  Discard and run again
                </Button>
                <Button variant="primary" className="px-[26px]" onClick={() => void upload()}>
                  <Icon name="repeat" size={17} strokeWidth={1.9} />
                  Try scoring again
                </Button>
              </>
            )
          ) : (
            <>
              <Button onClick={() => go(index - 1)} disabled={index === 0}>
                <Icon name="back" size={16} strokeWidth={2} />
                Previous slide
              </Button>
              <Button onClick={() => go(index + 1)} disabled={!next}>
                Next slide
              </Button>
              <Button onClick={togglePause}>
                <Icon name={phase === "paused" ? "play" : "pause"} size={17} strokeWidth={2.2} />
                {phase === "paused" ? "Resume" : "Pause"}
              </Button>
              <Button variant="primary" className="px-[26px]" onClick={() => void finish()}>
                Finish run
              </Button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
