"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Icon } from "@/components/ui";
import { Transcript, type FollowUpView } from "@/components/feedback/Transcript";
import { TestModeNotice } from "@/components/shell/TestModeNotice";
import { answerFeedback } from "@/lib/answers/feedback";
import { saveExample } from "@/lib/examples/store";
import { scoreLabel } from "@/lib/scoring/combine";
import { mmss } from "@/lib/format";
import type { Answer, Question, ScoreParts } from "@/lib/types";

interface QuestionFeedbackViewProps {
  interviewId: string;
  mockId?: string;
  roleTitle: string;
  categoryLabel: string;
  question: Question;
  answer: Answer;
  /** Worked out from this answer's own scores. Null when it couldn't be scored. */
  overallScore: number | null;
  /** Content and structure as scored; delivery as measured from the recording's timings. */
  scores: ScoreParts;
  /** Measured from the answer's word timings. */
  lengthSec: number;
  wordsPerMinute: number | null;
  fillerCount: number;
  followUps: FollowUpView[];
  interviewerName: string;
  prevAnswerId?: string | null;
  nextAnswerId?: string | null;
  nextQuestionId?: string | null;
  /** The person's own recording of this answer, when one was kept. */
  audioSrc: string | null;
  /** The app is running on stand-in AI: what is shown was not worked out from what was said. */
  testMode?: boolean;
}

const part = (n: number | null) => (n == null ? "n/a" : n.toFixed(1));

/**
 * Feedback on one answer. Everything on this screen is read from the saved
 * answer: the words that were heard, the marks and notes on them, its scores,
 * the stronger version written from it and any follow-ups. Where the answer
 * holds nothing for a part, the screen says so. It never shows a stand-in.
 */
export function QuestionFeedbackView({
  interviewId,
  mockId,
  roleTitle,
  categoryLabel,
  question,
  answer,
  overallScore,
  scores,
  lengthSec,
  wordsPerMinute,
  fillerCount,
  followUps,
  interviewerName,
  prevAnswerId,
  nextAnswerId,
  nextQuestionId,
  audioSrc,
  testMode = false,
}: QuestionFeedbackViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"feedback" | "transcript">("feedback");
  const feedback = useMemo(() => answerFeedback(answer), [answer]);

  // Correcting the transcript
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(feedback.transcript);
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState<{ ok: boolean; text: string } | null>(null);

  // The recording, when there is one
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(lengthSec > 0 ? Math.ceil(lengthSec) : 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const canPlay = Boolean(audioSrc) && !audioFailed;

  const [savedExample, setSavedExample] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(Math.ceil(audio.duration));
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onError = () => {
      setAudioFailed(true);
      setIsPlaying(false);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("error", onError);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !canPlay) return;
    if (!audio.paused) return audio.pause();
    audio.playbackRate = playbackRate;
    audio.muted = isMuted;
    // The browser may refuse to play (no sound device, the file can't be read): the player then says so.
    audio.play().catch(() => setAudioFailed(true));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setCurrentTime(value);
    if (audioRef.current) audioRef.current.currentTime = value;
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
  };

  const saveStronger = () => {
    if (!feedback.stronger) return;
    saveExample({
      title: `${question.short || question.text.slice(0, 45)} (stronger version)`,
      question: question.text,
      answer: feedback.stronger,
      competency: categoryLabel,
      role: roleTitle,
      interviewType: categoryLabel,
      tags: ["Stronger version", categoryLabel].filter(Boolean),
      isFavorite: false,
      isStarStructure: false,
    });
    void navigator.clipboard?.writeText(feedback.stronger).catch(() => undefined);
    setSavedExample(true);
    setTimeout(() => setSavedExample(false), 3000);
  };

  const startEditing = () => {
    setEditedText(feedback.transcript);
    setSaveNote(null);
    setIsEditing(true);
    setActiveTab("transcript");
  };

  /** Saves a corrected transcript. It is only reported as saved when the server has saved it. */
  const saveEdit = async () => {
    const text = editedText.trim();
    if (!text) return;
    setSaving(true);
    setSaveNote(null);
    try {
      const res = await fetch(`/api/answers/${answer.id}/edit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        setSaveNote({ ok: false, text: body.message ?? "Your correction couldn’t be saved. Your text is still in the box: try again." });
        return;
      }
      setIsEditing(false);
      setSaveNote({ ok: true, text: "Saved. The scores and feedback were worked out from the answer as it was first heard, and are unchanged." });
      router.refresh();
    } catch {
      setSaveNote({ ok: false, text: "Your correction couldn’t be saved: the app couldn’t be reached. Your text is still in the box: try again." });
    } finally {
      setSaving(false);
    }
  };

  const closeReportUrl = mockId ? `/interviews/${interviewId}/mocks/${mockId}` : `/interviews/${interviewId}`;
  const answerHref = (id: string) => `/interviews/${interviewId}/answers/${id}${mockId ? `?mock=${mockId}` : ""}`;
  const position = answer.questionNumber > 0 && answer.questionsInMock > 0 ? `Question ${answer.questionNumber} of ${answer.questionsInMock} · ` : "";
  const delta = overallScore != null && answer.previousOverall != null ? overallScore - answer.previousOverall : null;
  const tabClass = (on: boolean) => clsx("pb-3 -mb-3 transition-colors cursor-pointer relative", on ? "text-white border-b-2 border-indigo-500 font-bold" : "text-[#a9abc0] hover:text-white");
  const pointList = (points: { title?: string; body: string }[], bullet: string) =>
    points.map((p, i) => (
      <li key={i} className="flex items-start gap-2">
        <span aria-hidden className={clsx("font-bold", bullet)}>
          •
        </span>
        <span>
          {p.title ? <b className="font-semibold text-white">{p.title}. </b> : null}
          {p.body}
        </span>
      </li>
    ));

  return (
    <div className="flex w-full grow flex-col pb-16 animate-rise max-w-5xl mx-auto" data-testid="answer-feedback">
      {audioSrc && !audioFailed && <audio ref={audioRef} src={audioSrc} preload="metadata" className="hidden" />}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4 mb-5">
        <div>
          <div className="text-xs font-medium text-muted">
            {position}
            {categoryLabel}
          </div>
          <h1 className="text-base font-bold text-white tracking-tight">Question feedback</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg bg-[#141624] border border-white/10 p-0.5">
            {prevAnswerId ? (
              <Link href={answerHref(prevAnswerId)} aria-label="Previous question" className="flex h-7 w-7 items-center justify-center rounded text-muted hover:text-white hover:bg-white/[0.06] transition-colors">
                <Icon name="back" size={13} />
              </Link>
            ) : (
              <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded text-white/20">
                <Icon name="back" size={13} />
              </span>
            )}
            <div className="h-4 w-[1px] bg-white/10 my-auto" />
            {nextAnswerId ? (
              <Link href={answerHref(nextAnswerId)} aria-label="Next question" className="flex h-7 w-7 items-center justify-center rounded text-muted hover:text-white hover:bg-white/[0.06] transition-colors rotate-180">
                <Icon name="back" size={13} />
              </Link>
            ) : (
              <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded text-white/20 rotate-180">
                <Icon name="back" size={13} />
              </span>
            )}
          </div>

          <div className="rounded-xl bg-[#141624] border border-white/15 px-3.5 py-1.5 shadow-sm" data-testid="answer-score">
            {overallScore != null ? (
              <>
                <span className="num text-base font-bold text-white">{overallScore.toFixed(1)}</span>
                <span className="text-xs text-muted font-medium"> / 5</span>
              </>
            ) : (
              <span className="text-xs font-semibold text-muted">Not scored</span>
            )}
          </div>

          <Link href={closeReportUrl} aria-label="Close and return to report" title="Close and return to report" className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-muted hover:text-white transition-colors">
            <Icon name="x" size={16} />
          </Link>
        </div>
      </div>

      {testMode && <TestModeNotice className="mb-5" what="The transcript, scores and feedback on this screen" />}

      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">{question.text}</h2>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Feedback" className="flex items-center gap-8 border-b border-white/[0.08] pb-3 text-xs font-semibold mb-6">
        <button type="button" role="tab" aria-selected={activeTab === "feedback"} onClick={() => setActiveTab("feedback")} className={tabClass(activeTab === "feedback")}>
          Feedback
        </button>
        <button type="button" role="tab" aria-selected={activeTab === "transcript"} onClick={() => setActiveTab("transcript")} className={tabClass(activeTab === "transcript")}>
          Transcript
        </button>
      </div>

      {activeTab === "feedback" && (
        <div className="space-y-5 animate-fade-in">
          {/* Your answer */}
          <div className="rounded-2xl bg-[#0f111d] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-bold text-white tracking-wide">
                Your answer{feedback.corrected ? <span className="ml-2 font-medium text-muted">corrected by you</span> : null}
              </h3>
              {feedback.transcript && (
                <button type="button" onClick={startEditing} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-200 transition-colors cursor-pointer">
                  <Icon name="edit" size={11} />
                  <span>Correct the transcript</span>
                </button>
              )}
            </div>

            {canPlay ? (
              <div className="flex items-center gap-3.5 rounded-xl bg-[#17192b] border border-white/[0.08] px-4 py-2.5">
                <button type="button" onClick={togglePlay} aria-label={isPlaying ? "Pause your recording" : "Play your recording"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-fill hover:bg-blue-hover text-white shadow-md shadow-blue-500/30 transition-transform active:scale-95 cursor-pointer">
                  <Icon name={isPlaying ? "pause" : "play"} size={13} strokeWidth={2.4} />
                </button>
                <span className="num text-xs font-semibold text-muted shrink-0 w-[4.5rem]">
                  {mmss(currentTime)} / {mmss(duration)}
                </span>
                <input type="range" min={0} max={duration || 1} step={0.1} value={Math.min(currentTime, duration || 1)} onChange={handleSeek} aria-label="Position in your recording" className="h-1.5 grow accent-indigo-500 bg-white/10 rounded-lg cursor-pointer" />
                <button type="button" onClick={cycleSpeed} aria-label={`Playback speed ${playbackRate}×. Change speed`} className="rounded-md bg-white/[0.06] hover:bg-white/[0.1] px-2 py-1 text-[11px] font-bold text-muted hover:text-white transition-colors cursor-pointer shrink-0">
                  {playbackRate}x
                </button>
                <button type="button" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"} aria-pressed={isMuted} className="text-muted hover:text-white transition-colors shrink-0 cursor-pointer p-1">
                  <Icon name={isMuted ? "volumeX" : "volume"} size={15} />
                </button>
              </div>
            ) : (
              <p className="rounded-xl bg-[#17192b] border border-white/[0.08] px-4 py-3 text-xs text-muted" data-testid="no-recording">
                {audioSrc ? "Your recording couldn’t be played in this browser. The transcript below is what was heard." : "No recording was kept for this answer, so there is nothing to play back."}
              </p>
            )}

            {feedback.extract.length > 0 ? (
              <p className="text-xs sm:text-[13px] text-[#c9cad8] leading-relaxed italic bg-black/20 p-4 rounded-xl border border-white/[0.04]" data-testid="answer-extract">
                &ldquo;
                {feedback.extract.map((run, i) => (
                  <span key={i}>
                    {i > 0 ? " " : ""}
                    {run.kind ? (
                      <span className={clsx("rounded-md px-1.5 py-0.5 not-italic font-medium border", run.kind === "good" ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40" : "bg-amber-500/15 text-amber-200 border-amber-500/40")}>{run.text}</span>
                    ) : (
                      run.text
                    )}
                  </span>
                ))}
                {feedback.extractCut ? "…" : ""}
                &rdquo;
              </p>
            ) : (
              <p className="text-xs sm:text-[13px] text-muted bg-black/20 p-4 rounded-xl border border-white/[0.04]" data-testid="answer-extract">
                No words were heard in this answer.
              </p>
            )}
            {feedback.extract.some((r) => r.kind) && (
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
                {feedback.extract.some((r) => r.kind === "good") && (
                  <span>
                    <span className="text-emerald-200">Green</span>: a strong line
                  </span>
                )}
                {feedback.extract.some((r) => r.kind === "late") && (
                  <span>
                    <span className="text-amber-200">Amber</span>: your point came late
                  </span>
                )}
              </p>
            )}

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="answer-parts">
              {(
                [
                  ["Content", part(scores.content)],
                  ["Structure", part(scores.structure)],
                  ["Delivery", part(scores.delivery)],
                  ["Length", lengthSec > 0 ? mmss(lengthSec) : "n/a"],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[#141624] border border-white/[0.06] px-3.5 py-3">
                  <dt className="text-[11px] text-muted font-medium">{label}</dt>
                  <dd className="num text-base font-bold text-white mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-[11px] text-muted">
              {overallScore != null ? `Overall ${overallScore.toFixed(1)} of 5 (${scoreLabel(overallScore)}).` : "This answer couldn’t be scored."}
              {delta != null && Math.abs(delta) >= 0.05 ? ` ${delta > 0 ? "Up" : "Down"} ${Math.abs(delta).toFixed(1)} on your last answer to this question.` : ""}
              {wordsPerMinute != null ? ` ${Math.round(wordsPerMinute)} words a minute.` : ""}
              {lengthSec > 0 ? ` ${fillerCount === 0 ? "No" : fillerCount} filler word${fillerCount === 1 ? "" : "s"}.` : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-[#0f111d] border border-emerald-500/25 p-5 sm:p-6 shadow-xl space-y-3.5" data-testid="answer-strengths">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <Icon name="checkCircle" size={15} />
                </div>
                <h3 className="text-sm font-bold text-white">What worked well</h3>
              </div>
              {feedback.strengths.length ? <ul className="space-y-2.5 text-xs text-[#c9cad8]">{pointList(feedback.strengths, "text-emerald-300")}</ul> : <p className="text-xs text-muted">Nothing was picked out as a strength in this answer.</p>}
            </div>

            <div className="rounded-2xl bg-[#0f111d] border border-amber-500/25 p-5 sm:p-6 shadow-xl space-y-3.5" data-testid="answer-fixes">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                  <Icon name="sparkle" size={14} />
                </div>
                <h3 className="text-sm font-bold text-white">What to work on</h3>
              </div>
              {feedback.fixes.length ? <ul className="space-y-2.5 text-xs text-[#c9cad8]">{pointList(feedback.fixes, "text-amber-300")}</ul> : <p className="text-xs text-muted">No fix was suggested for this answer.</p>}
            </div>
          </div>

          {feedback.stronger && (
            <div className="rounded-2xl bg-[#0f111d] border border-indigo-500/30 p-5 sm:p-6 shadow-xl space-y-4" data-testid="answer-stronger">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-200">
                    <Icon name="sparkle" size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">A stronger version</h3>
                    <p className="text-[11px] text-muted">
                      Rewritten from what you said{answer.strongerLengthSec > 0 ? `, about ${mmss(answer.strongerLengthSec)} spoken` : ""}. Check every fact in it is true before you use it.
                    </p>
                  </div>
                </div>
                <button type="button" onClick={saveStronger} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] px-3 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer">
                  <Icon name="doc" size={12} />
                  <span aria-live="polite">{savedExample ? "Saved to your examples" : "Save to my examples"}</span>
                </button>
              </div>
              <p className="rounded-xl bg-[#141624] p-4 text-xs sm:text-[13px] text-[#d6d7e2] leading-relaxed border border-white/[0.06]">&ldquo;{feedback.stronger}&rdquo;</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <Link href="/practice" className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer">
                <Icon name="chevronRight" size={13} className="rotate-180" />
                <span>Practice Hub</span>
              </Link>
              <Link href={`/mock/${interviewId}?q=${question.id}`} className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer">
                <Icon name="repeat" size={14} />
                <span>Practise again</span>
              </Link>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href={
                  nextAnswerId
                    ? answerHref(nextAnswerId)
                    : nextQuestionId
                      ? `/mock/${interviewId}?q=${nextQuestionId}&practice=1`
                      : `/mock/${interviewId}?practice=1&next=1&type=${question.group === "curveball" || question.type === "strengths" ? "strengths" : question.group}`
                }
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 px-4 py-2.5 text-xs font-semibold text-indigo-100 transition-colors cursor-pointer"
              >
                <span>Next question</span>
                <Icon name="chevronRight" size={13} />
              </Link>
              <Link href={`/mock/${interviewId}?q=${question.id}&record=1`} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer">
                <Icon name="mic" size={14} />
                <span>Record improved answer</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === "transcript" && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl bg-[#0f111d] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-white">What was heard</h3>
                <p className="text-xs text-muted">{testMode ? "Test mode: this is a stand-in transcript, not a reading of your recording." : "The transcript made from your recording. Speech-to-text makes mistakes: correct any you find."}</p>
              </div>
              {!isEditing && feedback.transcript && (
                <button type="button" onClick={startEditing} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition-colors cursor-pointer">
                  <Icon name="edit" size={12} />
                  <span>Correct the transcript</span>
                </button>
              )}
            </div>

            {saveNote && (
              <p role={saveNote.ok ? "status" : "alert"} className={clsx("rounded-xl border p-3 text-xs", saveNote.ok ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200" : "bg-red/10 border-red/30 text-red-soft")}>
                {saveNote.text}
              </p>
            )}

            {isEditing ? (
              <div className="space-y-3">
                <label htmlFor="transcript-edit" className="block text-xs font-semibold text-white">
                  Your answer, corrected
                </label>
                <textarea
                  id="transcript-edit"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={8}
                  maxLength={10000}
                  className="w-full rounded-xl bg-[#141624] p-4 text-xs sm:text-[13px] text-white leading-relaxed border border-indigo-500/50 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 shadow-inner"
                />
                <p className="text-[11px] text-muted">Correcting the words doesn’t change the scores or feedback: they were worked out from the answer as it was first heard. Record the answer again to be scored again.</p>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{editedText.split(/\s+/).filter(Boolean).length} words</span>
                  <div className="flex items-center gap-2.5">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-white transition-colors cursor-pointer">
                      Cancel
                    </button>
                    <button type="button" disabled={saving || !editedText.trim()} onClick={saveEdit} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-fill hover:bg-blue-hover px-4 py-2 text-xs font-semibold text-white shadow-md transition-all cursor-pointer disabled:opacity-60">
                      {saving ? "Saving…" : "Save correction"}
                    </button>
                  </div>
                </div>
              </div>
            ) : feedback.corrected ? (
              <div className="space-y-4" data-testid="answer-transcript">
                <p className="whitespace-pre-wrap rounded-xl bg-[#141624] p-5 text-xs sm:text-[13px] leading-relaxed text-[#d6d7e2] border border-white/[0.06]">{feedback.transcript}</p>
                <p className="text-[11px] text-muted">This is your corrected version. The scores, timings and marks are those of the answer as it was first heard, shown below.</p>
                <details className="rounded-xl border border-white/[0.06] bg-[#0b0c16] p-4">
                  <summary className="cursor-pointer text-xs font-semibold text-white">As it was first heard</summary>
                  <div className="mt-4 min-h-[220px]">
                    <Transcript words={answer.words} highlights={answer.highlights ?? []} notes={answer.notes ?? []} stronger={answer.strongerVersion ?? []} strongerLengthSec={answer.strongerLengthSec ?? 0} followUps={followUps} interviewerName={interviewerName} />
                  </div>
                </details>
              </div>
            ) : feedback.transcript ? (
              <div className="min-h-[220px]" data-testid="answer-transcript">
                <Transcript words={answer.words} highlights={answer.highlights ?? []} notes={answer.notes ?? []} stronger={answer.strongerVersion ?? []} strongerLengthSec={answer.strongerLengthSec ?? 0} followUps={followUps} interviewerName={interviewerName} />
              </div>
            ) : (
              <p className="rounded-xl bg-[#141624] p-5 text-xs sm:text-[13px] text-muted border border-white/[0.06]" data-testid="answer-transcript">
                No words were heard in this answer, so there is no transcript.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
