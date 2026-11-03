"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Chip, Icon } from "@/components/ui";
import { SlideView } from "./SlideView";
import { isFiller } from "@/lib/scoring/delivery";
import { badlyOver } from "@/lib/pitch/measure";
import { mmss } from "@/lib/format";
import type { Slide, Verdict } from "@/lib/pitch/types";
import type { Word } from "@/lib/types";

export interface SlideRow {
  slide: Slide;
  planned: number;
  seconds: number;
  chip: string | null;
  note: string | null;
  covered: Verdict | null;
  quote: string | null;
  words: Word[];
  /** When this slide first came up, seconds into the recording (null if never shown). */
  firstAt: number | null;
  /** When you moved off it that first time. */
  leftAt: number | null;
  isAsk: boolean;
}

const VERDICT_LINE: Record<Verdict, string> = { yes: "Made", partly: "Partly made", no: "Not made" };

/**
 * The slide-by-slide panel of the run report (design screen 13): planned
 * time as an outline, actual time as a bar (red when over), and one flag.
 * Open a slide to see what you said on it, whether its point landed, and to
 * hear that part of your recording.
 */
export function SlideRows({ rows, presentationId, audioSrc }: { rows: SlideRow[]; presentationId: string; audioSrc: string | null }) {
  const [open, setOpen] = useState<number | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const stopAt = useRef<number | null>(null);
  const scale = Math.max(...rows.map((r) => Math.max(r.planned, r.seconds)), 1);
  const pct = (s: number) => `${(s / scale) * 100}%`;

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const onTime = () => {
      if (stopAt.current != null && a.currentTime >= stopAt.current) a.pause();
    };
    const onPause = () => setPlaying(null);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("pause", onPause);
    };
  }, []);

  const play = (r: SlideRow) => {
    const a = audio.current;
    if (!a || r.firstAt == null) return;
    if (playing === r.slide.n) return a.pause();
    a.currentTime = r.firstAt;
    stopAt.current = r.leftAt;
    void a.play();
    setPlaying(r.slide.n);
  };

  return (
    <div>
      {audioSrc && <audio ref={audio} src={audioSrc} preload="none" />}
      {rows.map((r) => {
        const over = badlyOver(r.seconds, r.planned);
        const isOpen = open === r.slide.n;
        return (
          <div key={r.slide.n} className="border-t border-line">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : r.slide.n)}
              className="grid w-full grid-cols-[64px_minmax(130px,190px)_minmax(100px,300px)_48px_minmax(150px,1fr)] items-center gap-4 rounded-md py-[7px] text-left hover:bg-white/[0.02]"
            >
              <SlideView slide={r.slide} presentationId={presentationId} className="w-16 rounded-[3px] shadow-[0_0_0_1px_var(--color-line-strong)]" />
              <span className="min-w-0 truncate text-sm">
                <span className="num mr-2 text-dim">{r.slide.n}</span>
                {r.slide.title}
              </span>
              <span className="relative block h-3.5" aria-label={`Planned ${mmss(r.planned)}, actual ${mmss(r.seconds)}`} role="img">
                <span className="absolute inset-y-0 left-0 rounded-[3px] shadow-[inset_0_0_0_1px_var(--color-line-strong)]" style={{ width: pct(r.planned) }} />
                <span className={clsx("absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full", over ? "bg-red" : "bg-blue")} style={{ width: pct(r.seconds) }} />
              </span>
              <span className={clsx("num text-right text-sm font-semibold", over ? "text-red-soft" : "text-ink")}>{mmss(r.seconds)}</span>
              <span className="flex min-w-0 items-center gap-2.5 text-[13px] text-muted">
                {r.chip ? <Chip tone="red">{r.chip}</Chip> : r.note && <span className="truncate">{r.note}</span>}
              </span>
            </button>
            {isOpen && (
              <div className="mb-3 ml-20 grid grid-cols-[minmax(0,1fr)_260px] gap-6 rounded-xl bg-panel-2 px-5 py-4 shadow-[inset_0_0_0_1px_var(--color-line)]">
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-muted">What you said</span>
                    {audioSrc && r.firstAt != null && (
                      <button type="button" onClick={() => play(r)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-soft hover:underline">
                        <Icon name={playing === r.slide.n ? "pause" : "play"} size={13} strokeWidth={2.2} />
                        {playing === r.slide.n ? "Pause" : "Hear this slide"}
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 max-h-[220px] overflow-auto pr-2 text-[15px] leading-[1.6] text-[#d4d5dd]">
                    {r.words.length ? (
                      <>
                        <span className="num mr-2 text-xs text-dim">{mmss(r.words[0].start)}</span>
                        {r.words.map((w, i) => (
                          <span key={i}>
                            {i > 0 && " "}
                            {isFiller(w) ? <span className="um">{w.text.replace(/[,.]$/, "")}</span> : w.text}
                          </span>
                        ))}
                      </>
                    ) : (
                      <span className="text-dim">Nothing was said on this slide.</span>
                    )}
                  </p>
                </div>
                <div className="text-[13px]">
                  <div className="text-muted">The point to land</div>
                  <div className="mt-1 text-sm font-semibold leading-snug">{r.slide.point}</div>
                  <div className={clsx("mt-2 font-semibold", r.covered === "yes" ? "text-blue-soft" : r.covered ? "text-red-soft" : "text-dim")}>{r.covered ? VERDICT_LINE[r.covered] : "Not checked"}</div>
                  {r.quote && <p className="mt-1 leading-normal text-muted">“{r.quote}”</p>}
                  <Link href={`/rehearse/${presentationId}?from=${r.slide.n}&to=${r.slide.n}`} className="mt-3 inline-block font-semibold text-blue-soft hover:underline">
                    Re-run this slide
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
