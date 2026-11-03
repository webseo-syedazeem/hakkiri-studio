"use client";

import { useEffect, useRef, useState } from "react";
import type { Word } from "@/lib/types";
import type { DeliveryMetrics } from "@/lib/scoring/delivery";
import { speechAmp } from "@/components/audio/MiniWave";
import { mmss } from "@/lib/format";
import { Button, Icon, Panel, Sep } from "@/components/ui";

const BARS = 206;

/**
 * The answer as a clip (design screen 6, top): the waveform with every filler
 * marked, the late point shaded red, and where the point belongs shaded blue.
 * Everything is placed from word timings, so it always matches the transcript.
 * Play replays your recording with a playhead; click the waveform to jump.
 */
export function AnswerClip({
  words,
  metrics,
  late,
  belongsWithinSec,
  targetSec,
  audioSrc,
}: {
  words: Word[];
  metrics: DeliveryMetrics;
  late: { start: number; end: number } | null;
  belongsWithinSec: number;
  targetSec: [number, number];
  /** The saved recording, if there is one. */
  audioSrc?: string | null;
}) {
  const L = Math.max(1, metrics.lengthSec);
  // Times on the clip run from your first word; the recording starts a moment earlier.
  const t0 = words[0]?.start ?? 0;
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const onTime = () => setNow(a.currentTime - t0);
    const onEnd = () => {
      setPlaying(false);
      setNow(null);
    };
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    a.addEventListener("pause", onPause);
    a.addEventListener("play", onPlay);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("play", onPlay);
    };
  }, [t0]);

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audio.current;
    if (!a) return;
    const r = e.currentTarget.getBoundingClientRect();
    a.currentTime = t0 + ((e.clientX - r.left) / r.width) * L;
    setNow(a.currentTime - t0);
    if (a.paused) void a.play();
  };
  const x = (s: number) => `${(Math.min(Math.max(s, 0), L) / L) * 100}%`;
  const ticks: number[] = [];
  for (let s = 0; s <= L - 20; s += 15) ticks.push(s);
  const status = { in: "inside", over: "over", under: "under" }[metrics.lengthStatus];

  return (
    <Panel aria-label={`Your answer, ${mmss(L)} long`} className="animate-rise px-6 pb-3 pt-4">
      {audioSrc && <audio ref={audio} src={audioSrc} preload="auto" />}
      <div className={`relative h-[150px] ${audioSrc ? "cursor-pointer" : ""}`} onClick={audioSrc ? seek : undefined} title={audioSrc ? "Click to play from here" : undefined}>
        <div className="absolute bottom-[26px] left-0 top-5 bg-blue/10 shadow-[inset_-2px_0_0_var(--color-blue-soft)]" style={{ width: x(belongsWithinSec) }} />
        {late && (
          <div
            className="absolute bottom-[26px] top-5 bg-red/12 shadow-[inset_2px_0_0_var(--color-red),inset_-2px_0_0_var(--color-red)]"
            style={{ left: x(late.start - t0), width: `calc(${x(late.end - t0)} - ${x(late.start - t0)})` }}
          />
        )}
        <div aria-hidden className="absolute inset-x-0 top-6 flex h-24 items-center justify-between">
          {Array.from({ length: BARS }, (_, i) => {
            const t = ((i + 0.5) / BARS) * L;
            const speaking = words.some((w) => t >= w.start - t0 - 0.2 && t <= w.end - t0 + 0.2);
            const amp = speaking ? 0.22 + 0.78 * speechAmp(i, 5) : 0.06;
            const inLate = late && t >= late.start - t0 && t <= late.end - t0;
            return <span key={i} className={`w-[3px] rounded-full ${inLate ? "bg-late" : "bg-wave"}`} style={{ height: Math.max(3, Math.round(amp * 92)) }} />;
          })}
        </div>
        {metrics.fillers.map((f) => (
          <div key={f.index}>
            <span className="absolute top-5 h-[104px] w-0.5 bg-red" style={{ left: x(f.start) }} />
            <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-red-soft" style={{ left: x(f.start) }}>
              {f.text}
            </span>
          </div>
        ))}
        <span className="absolute left-0 top-[132px] whitespace-nowrap text-xs font-semibold text-blue-soft">It belongs in the first {belongsWithinSec} seconds</span>
        {now != null && (
          <span aria-hidden className="pointer-events-none absolute bottom-[26px] top-5 w-0.5 bg-white shadow-[0_0_0_2px_var(--color-panel)]" style={{ left: x(now) }} />
        )}
        {late && (
          <span className="absolute top-[132px] whitespace-nowrap text-xs font-semibold text-red-soft" style={{ left: x(late.start - t0) }}>
            Your point arrives at {mmss(late.start - t0)}
          </span>
        )}
      </div>
      <div className="relative mt-0.5 h-[18px]">
        {ticks.map((s) => (
          <span key={s} className={`num absolute text-xs text-dim ${s === 0 ? "" : "-translate-x-1/2"}`} style={{ left: x(s) }}>
            {mmss(s)}
          </span>
        ))}
        <span className="num absolute right-0 text-xs font-semibold text-blue-soft">
          {mmss(L)}, {status} the {mmss(targetSec[0])}–{mmss(targetSec[1])} target
        </span>
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5">
        <div className="flex items-center gap-[22px] text-[13px] text-muted">
          <Button size="sm" disabled={!audioSrc} onClick={toggle} title={audioSrc ? undefined : "No recording for this answer"}>
            <Icon name={playing ? "pause" : "play"} size={14} strokeWidth={2} />
            {playing ? "Pause" : now != null ? `Play from ${mmss(Math.max(0, now))}` : "Play"}
          </Button>
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-0.5 bg-red" />
            Filler
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-[3px] bg-red/25 shadow-[inset_0_0_0_1.5px_var(--color-red)]" />
            Late point
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-[3px] bg-blue/20 shadow-[inset_0_0_0_1.5px_var(--color-blue-soft)]" />
            Where it belongs
          </span>
        </div>
        <span className="text-[13px] text-muted">
          {metrics.wordsPerMinute != null && (
            <>
              Pace <b className="num font-semibold text-ink">{metrics.wordsPerMinute}</b> words a minute
              <Sep />
            </>
          )}
          {metrics.fillerCount} fillers
          <Sep />
          {metrics.longPauses.length ? `${metrics.longPauses.length} long pauses` : "Pauses well placed"}
        </span>
      </div>
    </Panel>
  );
}
