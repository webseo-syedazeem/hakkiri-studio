"use client";

import { useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import type { CoachNote, FollowUp, Highlight, Word } from "@/lib/types";
import { isFiller } from "@/lib/scoring/delivery";
import { scoreLabel } from "@/lib/scoring/combine";
import { FOLLOW_UP_KIND_LABEL } from "@/lib/followups";
import { mmss } from "@/lib/format";
import { Chip, Icon, Pin } from "@/components/ui";

/** A new paragraph starts after a pause this long. */
const PARAGRAPH_GAP_SEC = 1.5;

function paragraphs(words: Word[]): number[][] {
  const out: number[][] = [];
  words.forEach((w, i) => {
    if (i === 0 || w.start - words[i - 1].end >= PARAGRAPH_GAP_SEC) out.push([]);
    out[out.length - 1].push(i);
  });
  return out;
}

/** One reply as timed paragraphs: fillers struck through, marked spans, and numbered pins. */
function MarkedText({ words, highlights, notes = [] }: { words: Word[]; highlights: Highlight[]; notes?: CoachNote[] }) {
  const kindAt = (i: number) => highlights.find((h) => i >= h.from && i <= h.to)?.kind ?? null;
  const pinAfter = new Map(notes.map((n) => [n.pinAfter, n]));

  function renderParagraph(idx: number[]) {
    const out: ReactNode[] = [];
    let run: ReactNode[] = [];
    let runKind: Highlight["kind"] | null = null;
    const flush = (key: string) => {
      if (!run.length) return;
      out.push(
        runKind ? (
          <span key={key} className={runKind}>
            {run}
          </span>
        ) : (
          <span key={key}>{run}</span>
        ),
      );
      run = [];
    };
    idx.forEach((i, k) => {
      const kind = kindAt(i);
      if (kind !== runKind) {
        flush(`r${i}`);
        if (k > 0) out.push(" ");
        runKind = kind;
      } else if (k > 0) run.push(" ");
      const w = words[i];
      run.push(
        isFiller(w) ? (
          <span key={i} className="um">
            {w.text.replace(/[,.]$/, "")}
          </span>
        ) : (
          <span key={i}>{w.text}</span>
        ),
      );
      if (isFiller(w) && /[,.]$/.test(w.text)) run.push(w.text.slice(-1));
      const note = pinAfter.get(i);
      if (note) {
        flush(`p${i}`);
        out.push(<Pin key={`pin${i}`} n={note.id} tone={note.tone} />);
        runKind = null;
      }
    });
    flush("end");
    return out;
  }

  return (
    <>
      {paragraphs(words).map((idx) => (
        <p key={idx[0]} className="relative mb-3 pl-[52px] text-base leading-[1.66] text-[#d4d5dd]">
          <span className="num absolute left-0 top-[3px] text-xs text-dim">{mmss(words[idx[0]].start)}</span>
          {renderParagraph(idx)}
        </p>
      ))}
    </>
  );
}

export type FollowUpView = FollowUp & { overall: number | null; lengthSec: number; audioSrc?: string | null };

/** Plays one follow-up reply. */
function ReplyPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <audio ref={ref} src={src} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      <button
        type="button"
        onClick={() => (ref.current?.paused ? void ref.current.play() : ref.current?.pause())}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-soft hover:underline"
      >
        <Icon name={playing ? "pause" : "play"} size={13} strokeWidth={2.2} />
        {playing ? "Pause" : "Hear your reply"}
      </button>
    </>
  );
}

/** One follow-up exchange: what the interviewer asked, the reply, its score and one note. */
function FollowUpBlock({ f, n, interviewerName }: { f: FollowUpView; n: number; interviewerName: string }) {
  return (
    <section aria-label={`Follow-up ${n}`} className="mb-5 border-b border-line pb-5 last:mb-0 last:border-b-0">
      <div className="mb-3.5 flex items-start justify-between gap-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 text-[13px] text-muted">
            <span>
              Follow-up {n}: {interviewerName} asked
            </span>
            <Chip>{FOLLOW_UP_KIND_LABEL[f.kind]}</Chip>
          </div>
          <p className="mt-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink">{f.question}</p>
          {f.audioSrc && (
            <div className="mt-2">
              <ReplyPlayer src={f.audioSrc} />
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="num text-[26px] font-semibold leading-none tracking-[-0.02em]">{f.overall?.toFixed(1) ?? "n/a"}</div>
          <div className="num mt-1.5 text-xs text-muted">
            {f.overall != null ? scoreLabel(f.overall) : "Not scored"}, {mmss(f.lengthSec)}
          </div>
        </div>
      </div>
      <MarkedText words={f.words} highlights={f.highlight ? [f.highlight] : []} />
      <div className="ml-[52px] mt-1 grid grid-cols-[22px_1fr_auto] items-start gap-2.5 rounded-xl bg-panel-2 px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <span aria-hidden className={clsx("mt-[5px] h-2.5 w-2.5 justify-self-center rounded-full", f.note.tone === "fix" ? "bg-red" : "bg-blue-fill")} />
        <div>
          <div className="text-sm font-semibold">{f.note.title}</div>
          <div className="mt-0.5 text-[13px] leading-normal text-muted">{f.note.body}</div>
        </div>
        {f.tripped ? (
          <Chip tone="red" className="mt-0.5">
            {f.tripped}
          </Chip>
        ) : (
          <Chip tone="blue" className="mt-0.5">
            Handled well
          </Chip>
        )}
      </div>
    </section>
  );
}

/**
 * The marked-up transcript (design screen 6): fillers struck through,
 * the late point and the strong line underlined, numbered pins that match
 * the coach notes, a tab for the stronger version, and one for the
 * follow-ups when the interviewer asked any (screen 5).
 */
export function Transcript({
  words,
  highlights,
  notes,
  stronger,
  strongerLengthSec,
  followUps = [],
  interviewerName = "The interviewer",
  initialTab = "yours",
}: {
  words: Word[];
  highlights: Highlight[];
  notes: CoachNote[];
  stronger: { start: number; text: string; highlight?: boolean }[];
  strongerLengthSec: number;
  followUps?: FollowUpView[];
  interviewerName?: string;
  initialTab?: "yours" | "stronger" | "follow-ups";
}) {
  const [tab, setTab] = useState(initialTab);
  const tabs: [typeof tab, string][] = [
    ["yours", "Your answer"],
    ["stronger", "Stronger version"],
  ];
  if (followUps.length) tabs.push(["follow-ups", followUps.length === 1 ? "Follow-up" : `Follow-ups (${followUps.length})`]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3.5 flex items-center justify-between">
        <div role="tablist" aria-label="Transcript" className="inline-flex gap-0.5">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={clsx("h-8 rounded-lg px-[13px] text-[13px] font-semibold", tab === key ? "bg-panel-2 text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]" : "text-muted hover:text-ink")}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "stronger" ? (
          <div className="text-xs text-muted">Built from your words. {mmss(strongerLengthSec)}, point first.</div>
        ) : (
          <div className="flex gap-4 text-xs text-muted">
            <span>
              <span className="um font-semibold">um</span> filler
            </span>
            <span className="late">{tab === "yours" ? "late point" : "needs work"}</span>
            <span className="good">strong line</span>
          </div>
        )}
      </div>

      <div role="tabpanel" tabIndex={0} aria-label="Transcript" className="min-h-0 grow overflow-auto pr-2">
        {tab === "yours" && <MarkedText words={words} highlights={highlights} notes={notes} />}
        {tab === "stronger" &&
          stronger.map((s) => (
            <p key={s.start} className="relative mb-3 pl-[52px] text-base leading-[1.66] text-[#d4d5dd]">
              <span className="num absolute left-0 top-[3px] text-xs text-dim">{mmss(s.start)}</span>
              {s.highlight ? <span className="good">{s.text}</span> : s.text}
            </p>
          ))}
        {tab === "follow-ups" && followUps.map((f, k) => <FollowUpBlock key={k} f={f} n={k + 1} interviewerName={interviewerName} />)}
      </div>
    </div>
  );
}
