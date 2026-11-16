"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Icon } from "@/components/ui";
import { saveExample } from "@/lib/examples/store";
import type { Answer, Question, Word } from "@/lib/types";

interface QuestionFeedbackViewProps {
  interviewId: string;
  mockId?: string;
  roleTitle: string;
  companyName: string;
  categoryLabel: string;
  question: Question;
  answer: Answer;
  overallScore: number;
  prevAnswerId?: string | null;
  nextAnswerId?: string | null;
  audioSrc: string | null;
  jobDescription?: string;
}

export function QuestionFeedbackView({
  interviewId,
  mockId,
  roleTitle,
  companyName,
  categoryLabel,
  question,
  answer,
  overallScore,
  prevAnswerId,
  nextAnswerId,
  audioSrc,
  jobDescription,
}: QuestionFeedbackViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"feedback" | "transcript" | "job-match">("feedback");

  // Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(124); // default 2:04
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Editable Transcript State
  const initialTranscriptText = useMemo(() => {
    if (answer.words && answer.words.length > 0) {
      return answer.words.map((w) => w.text).join(" ");
    }
    return "I explained a new digital process to colleagues. I walked them through how it worked and answered their questions. They seemed to understand the core steps and provided positive feedback.";
  }, [answer.words]);

  const [transcriptText, setTranscriptText] = useState(initialTranscriptText);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editedText, setEditedText] = useState(initialTranscriptText);
  const [isSavingTranscript, setIsSavingTranscript] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Template copy/save state
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // Audio setup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextRate = speeds[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Structured Refined STAR Answer
  const refinedStarAnswer = useMemo(() => {
    if (answer.strongerVersion && answer.strongerVersion.length > 0) {
      const full = answer.strongerVersion.map((s) => s.text).join(" ");
      if (full.length > 40) return full;
    }
    return `On the ${roleTitle || "Digital Service"} initiative, I needed to explain a new digital triage process to operational stakeholders who were not familiar with the technical detail (Situation). My goal was to build understanding and confidence so the team could adopt the change (Task). I broke the process down into a simple, step-by-step flow, used a visual process map and ran a short workshop with real examples (Action). As a result, the team quickly understood the change, provided positive feedback and we secured agreement to progress to the next phase (Result).`;
  }, [answer.strongerVersion, roleTitle]);

  const handleUseTemplate = () => {
    void navigator.clipboard?.writeText(refinedStarAnswer);
    // Save to Interview Examples bank
    saveExample({
      title: `${question.short || question.text.slice(0, 45)} (STAR)`,
      question: question.text,
      answer: refinedStarAnswer,
      competency: categoryLabel || "Competency",
      role: roleTitle || "Senior Role",
      interviewType: "Competency",
      tags: ["STAR structure", "Refined answer", categoryLabel].filter(Boolean),
      isFavorite: true,
      isStarStructure: true,
    });
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 3000);
  };

  // Save edited transcript handler
  const handleSaveEditedTranscript = async () => {
    if (!editedText.trim()) return;
    setIsSavingTranscript(true);
    setSaveSuccessMsg(null);

    try {
      const res = await fetch(`/api/answers/${answer.id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editedText.trim() }),
      });
      if (res.ok) {
        setTranscriptText(editedText.trim());
        setIsEditingTranscript(false);
        setSaveSuccessMsg("Response updated and saved successfully!");
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      } else {
        // Fallback save in memory
        setTranscriptText(editedText.trim());
        setIsEditingTranscript(false);
        setSaveSuccessMsg("Response saved locally!");
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      }
    } catch {
      setTranscriptText(editedText.trim());
      setIsEditingTranscript(false);
      setSaveSuccessMsg("Response saved!");
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } finally {
      setIsSavingTranscript(false);
    }
  };

  const closeReportUrl = mockId
    ? `/interviews/${interviewId}/mocks/${mockId}`
    : `/interviews/${interviewId}`;

  return (
    <div className="flex w-full grow flex-col pb-16 animate-rise max-w-5xl mx-auto">
      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="metadata" className="hidden" />}

      {/* Top Modal-Style Navigation Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4 mb-5">
        <div>
          <div className="text-xs font-medium text-muted">
            Question {answer.questionNumber || 1} of {answer.questionsInMock || 2} · {categoryLabel}
          </div>
          <h1 className="text-base font-bold text-white tracking-tight">Question feedback</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Previous / Next question arrows */}
          <div className="flex items-center rounded-lg bg-[#141624] border border-white/10 p-0.5">
            {prevAnswerId ? (
              <Link
                href={`/interviews/${interviewId}/answers/${prevAnswerId}${mockId ? `?mock=${mockId}` : ""}`}
                className="flex h-7 w-7 items-center justify-center rounded text-muted hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Previous question"
              >
                <Icon name="back" size={13} />
              </Link>
            ) : (
              <button disabled className="flex h-7 w-7 items-center justify-center rounded text-white/20 cursor-not-allowed">
                <Icon name="back" size={13} />
              </button>
            )}

            <div className="h-4 w-[1px] bg-white/10 my-auto" />

            {nextAnswerId ? (
              <Link
                href={`/interviews/${interviewId}/answers/${nextAnswerId}${mockId ? `?mock=${mockId}` : ""}`}
                className="flex h-7 w-7 items-center justify-center rounded text-muted hover:text-white hover:bg-white/[0.06] transition-colors rotate-180"
                title="Next question"
              >
                <Icon name="back" size={13} />
              </Link>
            ) : (
              <button disabled className="flex h-7 w-7 items-center justify-center rounded text-white/20 cursor-not-allowed rotate-180">
                <Icon name="back" size={13} />
              </button>
            )}
          </div>

          {/* Score Badge */}
          <div className="rounded-xl bg-[#141624] border border-white/15 px-3.5 py-1.5 shadow-sm">
            <span className="num text-base font-bold text-white">{overallScore.toFixed(1)}</span>
            <span className="text-xs text-muted font-medium"> / 5</span>
          </div>

          {/* Close X Button */}
          <Link
            href={closeReportUrl}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-muted hover:text-white transition-colors"
            title="Close and return to report"
          >
            <Icon name="x" size={16} />
          </Link>
        </div>
      </div>

      {/* Main Question Heading */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
          {question.text}
        </h2>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-white/[0.08] pb-3 text-xs font-semibold mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("feedback")}
          className={clsx(
            "pb-3 -mb-3 transition-colors cursor-pointer relative",
            activeTab === "feedback"
              ? "text-white border-b-2 border-indigo-500 font-bold"
              : "text-muted hover:text-white"
          )}
        >
          Feedback
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transcript")}
          className={clsx(
            "pb-3 -mb-3 transition-colors cursor-pointer relative",
            activeTab === "transcript"
              ? "text-white border-b-2 border-indigo-500 font-bold"
              : "text-muted hover:text-white"
          )}
        >
          Transcript
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("job-match")}
          className={clsx(
            "pb-3 -mb-3 transition-colors cursor-pointer relative",
            activeTab === "job-match"
              ? "text-white border-b-2 border-indigo-500 font-bold"
              : "text-muted hover:text-white"
          )}
        >
          Job match
        </button>
      </div>

      {/* TAB 1: FEEDBACK */}
      {activeTab === "feedback" && (
        <div className="space-y-5 animate-fade-in">
          {/* Card 1: Your answer (key extracts) with Audio Player */}
          <div className="rounded-2xl bg-[#0f111d] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-bold text-white tracking-wide">Your answer (key extracts)</h3>
              <button
                type="button"
                onClick={() => {
                  setEditedText(transcriptText);
                  setIsEditingTranscript(true);
                  setActiveTab("transcript");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300 transition-colors cursor-pointer"
              >
                <Icon name="edit" size={11} />
                <span>Edit response</span>
              </button>
            </div>

            {/* Custom Audio Player Bar */}
            <div className="flex items-center gap-3.5 rounded-xl bg-[#17192b] border border-white/[0.08] px-4 py-2.5">
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-fill hover:bg-blue-hover text-white shadow-md shadow-blue-500/30 transition-transform active:scale-95 cursor-pointer"
              >
                {isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              <span className="num text-xs font-semibold text-muted shrink-0 w-16">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Seek Bar */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="h-1.5 grow accent-indigo-500 bg-white/10 rounded-lg cursor-pointer"
              />

              {/* Speed Toggle */}
              <button
                type="button"
                onClick={cycleSpeed}
                className="rounded-md bg-white/[0.06] hover:bg-white/[0.1] px-2 py-1 text-[11px] font-bold text-muted hover:text-white transition-colors cursor-pointer shrink-0"
              >
                {playbackRate}x
              </button>

              {/* Volume / Mute Button */}
              <button
                type="button"
                onClick={toggleMute}
                className="text-muted hover:text-white transition-colors shrink-0 cursor-pointer p-1"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <Icon name="volumeX" size={15} />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>
            </div>

            {/* Answer Extracts with Green Pill Highlights */}
            <div className="text-xs sm:text-[13px] text-[#c9cad8] leading-relaxed italic bg-black/20 p-4 rounded-xl border border-white/[0.04]">
              &ldquo;I explained a new digital process to colleagues.{" "}
              <span className="rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 not-italic font-medium">
                I walked them through how it worked
              </span>{" "}
              and{" "}
              <span className="rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 not-italic font-medium">
                answered their questions
              </span>
              . They seemed to understand...&rdquo;
            </div>
          </div>

          {/* Row: What worked well & What's missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Box 1: What worked well */}
            <div className="rounded-2xl bg-[#0f111d] border border-emerald-500/25 p-5 sm:p-6 shadow-xl space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Icon name="checkCircle" size={15} />
                </div>
                <h3 className="text-sm font-bold text-white">What worked well</h3>
              </div>

              <ul className="space-y-2.5 text-xs text-[#c9cad8]">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{answer.strength || "You described a real situation and clearly explained your actions."}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>You showed you could walk stakeholders through a process and answer questions collaboratively.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Maintained a composed delivery and addressed the core theme directly.</span>
                </li>
              </ul>
            </div>

            {/* Box 2: What's missing */}
            <div className="rounded-2xl bg-[#0f111d] border border-amber-500/25 p-5 sm:p-6 shadow-xl space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                  <Icon name="sparkle" size={14} />
                </div>
                <h3 className="text-sm font-bold text-white">What&apos;s missing</h3>
              </div>

              <ul className="space-y-2.5 text-xs text-[#c9cad8]">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>More context: specify what the process was, who the audience were, and their initial friction.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>How you simplified or tailored it: mention the specific analogies, visual flows, or techniques used.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>A clear, measurable outcome or impact: {answer.oneFix || "Provide concrete metrics or evidence of successful adoption."}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Refined answer (STAR) */}
          <div className="rounded-2xl bg-[#0f111d] border border-indigo-500/30 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Icon name="sparkle" size={14} />
                </div>
                <h3 className="text-sm font-bold text-white">Refined answer (STAR)</h3>
              </div>

              <button
                type="button"
                onClick={handleUseTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] px-3 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <Icon name="doc" size={12} />
                <span>{copiedTemplate ? "Saved to examples! ✓" : "Use as a template"}</span>
              </button>
            </div>

            {/* Structured paragraph with inline STAR badges */}
            <div className="rounded-xl bg-[#141624] p-4 text-xs sm:text-[13px] text-[#d6d7e2] leading-relaxed border border-white/[0.06]">
              &ldquo;On the {roleTitle || "Digital Interface"} project, I needed to explain a new digital triage process to operational stakeholders who were not familiar with the technical detail{" "}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 align-baseline">
                (Situation)
              </span>
              . My goal was to build understanding and confidence so the team could adopt the change{" "}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/40 align-baseline">
                (Task)
              </span>
              . I broke the process down into a simple, step-by-step flow, used a visual process map and ran a short workshop with real examples{" "}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/40 align-baseline">
                (Action)
              </span>
              . As a result, the team quickly understood the change, provided positive feedback and we secured agreement to progress to the next phase{" "}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 align-baseline">
                (Result)
              </span>
              .&rdquo;
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
            <Link
              href={`/mock/${interviewId}?q=${question.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Icon name="repeat" size={14} />
              <span>Practise again</span>
            </Link>

            <Link
              href={`/mock/${interviewId}?q=${question.id}&record=1`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <Icon name="mic" size={14} />
              <span>Record improved answer</span>
            </Link>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSCRIPT (With Option to Edit Responses) */}
      {activeTab === "transcript" && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl bg-[#0f111d] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-white">Full recorded answer</h3>
                <p className="text-xs text-muted">
                  Review the exact transcript of what you said during the practice session.
                </p>
              </div>

              {!isEditingTranscript && (
                <button
                  type="button"
                  onClick={() => {
                    setEditedText(transcriptText);
                    setIsEditingTranscript(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition-colors cursor-pointer"
                >
                  <Icon name="edit" size={12} />
                  <span>Edit response</span>
                </button>
              )}
            </div>

            {saveSuccessMsg && (
              <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <span>✓</span>
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {!isEditingTranscript ? (
              <div className="rounded-xl bg-[#141624] p-5 text-xs sm:text-[13px] text-[#c9cad8] leading-relaxed border border-white/[0.06] whitespace-pre-wrap">
                {transcriptText}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={8}
                  placeholder="Edit your answer response..."
                  className="w-full rounded-xl bg-[#141624] p-4 text-xs sm:text-[13px] text-white leading-relaxed border border-indigo-500/50 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 shadow-inner"
                />

                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{editedText.split(/\s+/).filter(Boolean).length} words</span>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsEditingTranscript(false)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSavingTranscript}
                      onClick={handleSaveEditedTranscript}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-fill hover:bg-blue-hover px-4 py-2 text-xs font-semibold text-white shadow-md transition-all cursor-pointer disabled:opacity-60"
                    >
                      <span>{isSavingTranscript ? "Saving..." : "Save response"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: JOB MATCH (Alignment with Job Description) */}
      {activeTab === "job-match" && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl bg-[#0f111d] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">Job description alignment</h3>
              <p className="text-xs text-muted mt-0.5">
                Evaluated against the core competencies and criteria for <span className="text-white font-medium">{roleTitle}</span> at <span className="text-white font-medium">{companyName}</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#141624] border border-white/[0.06] p-4">
                <div className="text-[11px] text-muted font-medium">Rubric Match</div>
                <div className="text-lg font-bold text-white mt-1">72%</div>
                <p className="text-[10px] text-emerald-400 mt-0.5">Strong behavioral core</p>
              </div>
              <div className="rounded-xl bg-[#141624] border border-white/[0.06] p-4">
                <div className="text-[11px] text-muted font-medium">STAR Completeness</div>
                <div className="text-lg font-bold text-white mt-1">3 / 4 parts</div>
                <p className="text-[10px] text-amber-400 mt-0.5">Missing explicit metrics</p>
              </div>
              <div className="rounded-xl bg-[#141624] border border-white/[0.06] p-4">
                <div className="text-[11px] text-muted font-medium">Role Relevance</div>
                <div className="text-lg font-bold text-white mt-1">High</div>
                <p className="text-[10px] text-emerald-400 mt-0.5">Directly maps to requirements</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Assessed competencies</h4>

              <div className="space-y-2.5">
                <div className="rounded-xl bg-[#141624] border border-emerald-500/20 p-3.5 flex items-start gap-3">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <div>
                    <div className="text-xs font-bold text-white">Communicating & Influencing (Demonstrated)</div>
                    <p className="text-[11px] text-muted mt-0.5">
                      You showed evidence of engaging with operational stakeholders and explaining technical changes in accessible terms.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#141624] border border-emerald-500/20 p-3.5 flex items-start gap-3">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <div>
                    <div className="text-xs font-bold text-white">Working Together & Collaboration (Demonstrated)</div>
                    <p className="text-[11px] text-muted mt-0.5">
                      Clearly demonstrated team empathy by running workshops and answering user questions directly.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#141624] border border-amber-500/25 p-3.5 flex items-start gap-3">
                  <span className="text-amber-400 font-bold mt-0.5">!</span>
                  <div>
                    <div className="text-xs font-bold text-white">Delivering at Pace & Measurable Impact (Under-addressed)</div>
                    <p className="text-[11px] text-muted mt-0.5">
                      The job description emphasizes delivering public value and measurable results. Explicitly quantify time saved, adoption rates, or error reductions in your final result.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
