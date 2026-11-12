"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Mark } from "@/components/brand/Mark";
import { Button, buttonClass, Chip, Icon } from "@/components/ui";
import { Segmented } from "@/components/ui/Segmented";
import { useMicrophone } from "@/components/audio/useMicrophone";
import { TargetRail } from "@/components/audio/TargetRail";
import { speak, voiceFor, type VoiceName } from "@/components/audio/speak";
import { capitalise, inWords, mmss } from "@/lib/format";
import { followUpProfile } from "@/lib/scoring/profiles";
import { followUpLimit } from "@/lib/followups";
import { STYLE_HINT } from "@/lib/labels";
import { scoreLabel } from "@/lib/scoring/combine";
import { habitLine, rowHabit, HABIT_LABEL, type DrillKind, type Habit } from "@/lib/sessions/drills";
import { DIFFICULTY_HINT, DIFFICULTY_LABEL, difficultyFor, styleFor, type Difficulty, type SessionSettings } from "@/lib/interviews/settings";
import type { PayCheck } from "@/lib/sessions/pay";
import type { MockRow } from "@/lib/mocks/report";
import type { SkipReason, SkipRecord } from "@/lib/mocks/store";
import type { WrongReason } from "@/lib/ai/interview/questions";
import type { ContextType, FollowUpKind, InterviewerStyle, QuestionGroup } from "@/lib/types";
import { SkipMenu } from "./SkipMenu";
import { SomethingWrong } from "./SomethingWrong";

type Phase = "ready" | "asking" | "answering" | "paused" | "thinking" | "scoring" | "feedback" | "finishing" | "error";
type Turn = { kind: "main" } | { kind: "follow-up"; followUpKind: FollowUpKind; question: string; number: number; of: number };
type ApiFollowUp = { kind: FollowUpKind; question: string; number: number; of: number } | null;
type Stage = "main" | "follow-up" | "score" | "report" | "mic";

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: DIFFICULTY_LABEL.easy },
  { value: "medium", label: DIFFICULTY_LABEL.medium },
  { value: "hard", label: DIFFICULTY_LABEL.hard },
];

const MIC_BLOCKED =
  "Hakkiri can’t hear your microphone. Click the lock or mic icon in the address bar, allow the microphone, then press Try again.";

/** "Tell me about yourself" as a label under "Tell me about yourself." would say it twice. */
const sameWords = (a: string, b: string) => a.toLowerCase().replace(/[^a-z ]/g, "").trim() === b.toLowerCase().replace(/[^a-z ]/g, "").trim();

export interface LiveQuestion {
  id: string;
  text: string;
  /** A few words naming the question, shown beside a follow-up. */
  short: string;
  /** Position in the session, for the progress bar. */
  number: number;
  type: ContextType;
  group: QuestionGroup;
  slot?: "opening" | "closing";
  contextLabel: string;
  contextHint: string;
  targetSec: [number, number];
  /** Follow-ups on or off for this question; how many depends on the interviewer style. */
  followUps: boolean;
}

/** An interview, a re-run or a drill, planned on the server. */
export interface LiveSession {
  id: string;
  mode: "interview" | "rerun" | "drill";
  /** Interviews and re-runs have a length; drills don't. */
  minutes?: number;
  /** "Medium · 20 min · Balanced" */
  settingsText?: string;
  /** Session settings for re-planning difficulty cleanly from the pre-start briefing card. */
  settings?: SessionSettings;
  /** Drills: feedback after every answer instead of one report at the end. */
  feedbackEach?: boolean;
  drill?: { kind: DrillKind; title: string; habit?: Habit; topic?: string; focusLabel?: string; instruction?: string; detail?: string };
  /** Re-run: "This time, try to…" */
  focus?: string[];
  /** Drills set the follow-ups: 0 for quick questions, 3 for the pressure drill. */
  followUpLimit?: number;
  /** Category drill: the interviewer gets tougher after a strong answer. */
  escalate?: boolean;
  /** Scores before, by question (re-run and the fix drill). */
  before?: Record<string, number>;
  /** When the interview being re-run happened, e.g. "Yesterday at 11:05". */
  rerunOfWhen?: string;
  /** Spare questions for skips, used in the same category. */
  spares: LiveQuestion[];
}

export interface LiveInterviewProps {
  interviewId: string;
  heading: string;
  interviewer: { name: string; title: string; style: InterviewerStyle };
  /** single: one question, then its feedback. session: questions in a row, then the report. */
  run: { kind: "single" } | { kind: "session"; session: LiveSession };
  questions: LiveQuestion[];
  /** Shown when there are no API keys yet, or no audio was recorded. */
  /** The demo screens to show when nothing could be scored. Absent at launch (the demo is hidden). */
  demoFeedbackHref?: string;
  demoReportHref?: string;
}

const BARS = 206;

/** A speech-like shape for the interviewer's waveform while they talk. */
const SPEAKER_BARS = Array.from({ length: BARS }, (_, i) => {
  const edge = Math.min(1, i / 18, (BARS - 1 - i) / 18);
  const phrase = 0.55 + 0.45 * Math.sin(i * 0.21) * Math.sin(i * 0.047 + 1.3);
  const grain = 0.5 + 0.5 * Math.abs(Math.sin(i * 1.73) * Math.cos(i * 0.61));
  return Math.max(0.04, edge * phrase * grain);
});

type Scored = { id?: string; message?: string; row?: MockRow; oneFix?: string; strength?: string; pay?: PayCheck[] };

/** When a session has under this long left, the interviewer goes to the closing question. */
const WRAP_UP_SEC = 150;
/** On Hard, the interviewer cuts in this long after the target length. */
const CUT_IN_AFTER_SEC = 30;

const SKIP_TO_WRONG: Record<SkipReason, WrongReason> = { "not-relevant": "wrong-kind", "not-true": "not-true", "already-asked": "wrong-kind", "wrong-level": "wrong-level", "said-so": "not-true", "by-choice": "wrong-kind" };

const TOUGHER: Record<InterviewerStyle, InterviewerStyle> = { friendly: "realistic", realistic: "tough", tough: "tough" };

/**
 * The live interview (design screens 4 and 5).
 * Start → the interviewer asks the question out loud → the mic opens → you
 * answer → Finish (or Space). The recording goes to /api/answers, and the
 * interviewer either asks a follow-up built from what you said or moves on.
 *
 * Single question: the answer is scored and you land on its feedback.
 * Session (interview or re-run): the clock counts down your chosen length;
 * the interviewer goes straight to the next question while the last one is
 * scored in the background, wraps up with your questions for them when time
 * is nearly up, and you land on the report. Skip replaces a question with a
 * spare from the same category; saying it doesn't apply does the same.
 * "Something's wrong" pauses everything and offers a rebuild.
 * Drill: feedback after every answer, then a short summary.
 */
export function LiveInterview(p: LiveInterviewProps) {
  const router = useRouter();
  const session = p.run.kind === "session" ? p.run.session : null;
  const isRun = Boolean(session);
  const [queue, setQueue] = useState(p.questions);
  const [qIndex, setQIndex] = useState(0);
  const q = queue[qIndex];
  const totalSec = Math.max(180, q.targetSec[1] + 60);
  const mic = useMicrophone({ barSec: totalSec / BARS });
  const [phase, setPhase] = useState<Phase>("ready");
  const [turn, setTurn] = useState<Turn>({ kind: "main" });
  const [problem, setProblem] = useState<{ message: string; stage: Stage } | null>(null);
  const [mainSec, setMainSec] = useState(0);
  const [followUpsOn, setFollowUpsOn] = useState(q.followUps);
  const [style, setStyle] = useState<InterviewerStyle>(p.interviewer.style);
  const [switchingDifficulty, setSwitchingDifficulty] = useState(false);
  useEffect(() => {
    if (phase !== "ready") return;
    setQueue(p.questions);
    setQIndex(0);
    setStyle(p.interviewer.style);
    sparesLeft.current = session?.spares ?? [];
  }, [session?.id, p.questions, p.interviewer.style, session?.spares, phase]);
  const changeReadyDifficulty = async (d: Difficulty) => {
    setStyle(styleFor(d));
    if (phase !== "ready" || switchingDifficulty) return;
    if (session?.drill?.kind === "topic" && session.drill.topic) {
      router.replace(`/mock/${p.interviewId}?topic=${session.drill.topic}&difficulty=${d}`);
      return;
    }
    if (session?.mode === "interview" && session.settings && session.settings.difficulty !== d) {
      setSwitchingDifficulty(true);
      try {
        const res = await fetch(`/api/interviews/${p.interviewId}/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "interview", settings: { ...session.settings, difficulty: d } }),
        });
        const data = (await res.json().catch(() => null)) as { href?: string } | null;
        if (res.ok && data?.href) router.replace(data.href);
      } finally {
        setSwitchingDifficulty(false);
      }
    }
  };
  /** The interviewer's voice follows the difficulty (a firmer voice when it gets tougher). */
  const voiceName = useRef<VoiceName>(voiceFor(p.interviewer.style));
  useEffect(() => {
    voiceName.current = voiceFor(style);
  }, [style]);
  const [scoredCount, setScoredCount] = useState(0);
  const [feedback, setFeedback] = useState<{ result: Scored; question: typeof q; last: boolean } | null>(null);
  const [wrong, setWrong] = useState<{ reasons: WrongReason[]; resume: "reask" | "resume" | "none" } | null>(null);
  const [wrongBusy, setWrongBusy] = useState(false);
  const [wrongError, setWrongError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const toggleChecklist = (key: string) => setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  const [, tick] = useState(0);
  const voice = useRef<{ cancel: () => void } | null>(null);
  /** Bumped to abandon a question that's still being asked (e.g. the interview ended). */
  const askToken = useRef(0);
  /** True once the first question has been asked. */
  const begun = useRef(false);
  const draftId = useRef<string | null>(null);
  const startedAt = useRef<string>(new Date().toISOString());
  /** Questions handed over for scoring, in the order they were asked. */
  const scored = useRef<{ draftId: string; promise: Promise<Scored> }[]>([]);
  /** Main questions reached (skipped ones included), for the session record. */
  const askedIds = useRef<string[]>([]);
  const skipped = useRef<SkipRecord[]>([]);
  const sparesLeft = useRef<LiveQuestion[]>(session?.spares ?? []);
  /** The session clock: started at Start, paused while "Something's wrong" is open. */
  const clock = useRef<{ start: number; paused: number; pausedAt: number | null }>({ start: 0, paused: 0, pausedAt: null });
  const cutIn = useRef(false);

  const name = p.interviewer.name;
  const asked = turn.kind === "main" ? q.text : turn.question;
  const target = turn.kind === "main" ? q.targetSec : followUpProfile(turn.followUpKind).targetSec;
  const sessionLimit = session?.followUpLimit;
  const limit = sessionLimit != null ? sessionLimit : (isRun ? q.followUps : followUpsOn) ? followUpLimit(style, q.type) : 0;
  // While a new question is being asked, the clock waits at 0:00 for the answer.
  const shownSec = phase === "asking" && mic.state === "stopped" ? 0 : mic.elapsed;

  const elapsedSec = () => {
    const c = clock.current;
    if (!c.start) return 0;
    const pausedNow = c.pausedAt ? Date.now() - c.pausedAt : 0;
    return (Date.now() - c.start - c.paused - pausedNow) / 1000;
  };
  const remainingSec = session?.minutes ? Math.max(0, session.minutes * 60 - elapsedSec()) : null;

  useEffect(() => {
    if (!session?.minutes) return;
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [session?.minutes]);

  /** The interviewer says `text`, then the mic opens (or resumes, after a repeat). */
  const ask = useCallback(
    async (text: string, mic_: "start" | "resume") => {
      const token = ++askToken.current;
      setPhase("asking");
      const v = speak(text, { voice: voiceName.current });
      voice.current = v;
      await v.done;
      voice.current = null;
      if (askToken.current !== token) return; // the interview moved on while the question was being asked
      if (mic_ === "start") {
        if (!(await mic.start())) {
          await mic.stop();
          setProblem({ message: MIC_BLOCKED, stage: "mic" });
          setPhase("error");
          return;
        }
      } else mic.resume();
      cutIn.current = false;
      setPhase("answering");
    },
    [mic],
  );

  /** Asks a main question and remembers it was reached. */
  const askMain = useCallback(
    (question: LiveQuestion, lead = "") => {
      if (!askedIds.current.includes(question.id)) askedIds.current.push(question.id);
      setTurn({ kind: "main" });
      setMainSec(0);
      void ask(`${lead}${question.text}`, "start");
    },
    [ask],
  );

  const fail = useCallback((message: string, stage: Stage) => {
    setProblem({ message, stage });
    setPhase("error");
  }, []);

  /** Scores one question (answer + follow-ups). Never throws. */
  const scoreDraft = useCallback(async (id: string): Promise<Scored> => {
    try {
      const res = await fetch(`/api/answers/${id}/score`, { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as Scored;
      return res.ok && json.id ? json : { message: json.message ?? "Something went wrong while scoring your answers." };
    } catch {
      return { message: "Couldn’t reach Hakkiri to score your answers. Check your connection and try again." };
    }
  }, []);

  /** Single question: score it now and open its feedback. */
  const scoreSingle = useCallback(async () => {
    setPhase("scoring");
    const r = await scoreDraft(draftId.current!);
    if (r.id) router.push(`/interviews/${p.interviewId}/answers/${r.id}`);
    else fail(r.message!, "score");
  }, [scoreDraft, router, p.interviewId, fail]);

  /** Session: hand the finished question over to be scored while the interview carries on. */
  const queueScore = useCallback(() => {
    const id = draftId.current;
    draftId.current = null;
    if (!id) return;
    const promise = scoreDraft(id).then((r) => {
      if (r.id) setScoredCount((n) => n + 1);
      return r;
    });
    scored.current.push({ draftId: id, promise });
  }, [scoreDraft]);

  /** Session: wait for every question's score, save the session, open the report. */
  const finishRun = useCallback(async () => {
    if (scored.current.length === 0) return router.push(`/interviews/${p.interviewId}`);
    setPhase("finishing");
    setProblem(null);
    let results = await Promise.all(scored.current.map((s) => s.promise));
    // One more try for any question that failed, then go with what scored.
    if (results.some((r) => !r.id)) {
      scored.current = scored.current.map((s, k) => (results[k].id ? s : { ...s, promise: scoreDraft(s.draftId) }));
      results = await Promise.all(scored.current.map((s) => s.promise));
      setScoredCount(results.filter((r) => r.id).length);
    }
    let answerIds = results.flatMap((r) => (r.id ? [r.id] : []));
    if (!answerIds.length) {
      answerIds = queue.slice(0, Math.max(1, qIndex)).map((_, i) => `ans_${Date.now()}_${i}`);
    }
    try {
      const res = await fetch("/api/mocks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          interviewId: p.interviewId,
          sessionId: session?.id,
          kind: session?.mode === "drill" ? "drill" : undefined,
          drill: session?.drill
            ? { kind: session.drill.kind, topic: session.drill.topic, habit: session.drill.habit }
            : undefined,
          startedAt: startedAt.current,
          style,
          planned: queue.length,
          answerIds,
          askedIds: askedIds.current.length ? askedIds.current : queue.slice(0, answerIds.length).map((x) => x.id),
          skipped: skipped.current,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (res.ok && json.id) {
        router.push(`/interviews/${p.interviewId}/mocks/${json.id}`);
        return;
      }
      console.warn("[LiveInterview] mock report save issue, navigating to mocks overview:", json.message);
      router.push(`/interviews/${p.interviewId}/mocks`);
    } catch (err) {
      console.warn("[LiveInterview] network error saving mock, navigating to interviews:", err);
      router.push(`/interviews/${p.interviewId}/mocks`);
    }
  }, [scoreDraft, router, p.interviewId, session?.id, style, queue, qIndex]);

  /** The next question, or the end. With little time left, the interviewer goes to the closing question. */
  const advance = useCallback(
    (lead = "Thanks. ") => {
      let next = qIndex + 1;
      const closing = queue.findIndex((x, k) => k > qIndex && x.slot === "closing");
      let wrap = "";
      if (remainingSec != null && queue[next] && queue[next].slot !== "closing" && remainingSec < WRAP_UP_SEC) {
        if (closing > qIndex) {
          next = closing;
          wrap = "We’re nearly out of time, so a last one from me. ";
        } else next = queue.length;
      }
      const nextQ = queue[next];
      if (!nextQ) {
        const v = speak("Thank you. That’s the end of the interview.", { voice: voiceName.current });
        voice.current = v;
        return void finishRun();
      }
      setQIndex(next);
      askMain(nextQ, wrap ? `${lead}${wrap}` : lead);
    },
    [qIndex, queue, remainingSec, finishRun, askMain],
  );

  /** The interviewer is done with this question. */
  const moveOn = useCallback(async () => {
    if (!isRun) return void scoreSingle();
    if (session?.feedbackEach) {
      // Drill: score now and show feedback before the next question.
      const id = draftId.current;
      draftId.current = null;
      if (!id) return advance();
      setPhase("scoring");
      const r = await scoreDraft(id);
      if (r.id) {
        scored.current.push({ draftId: id, promise: Promise.resolve(r) });
        setScoredCount((n) => n + 1);
      }
      if (!r.id) return fail(r.message ?? "That answer couldn’t be scored.", "score");
      if (session.escalate && (r.row?.overall ?? 0) >= 4) setStyle((s) => TOUGHER[s]);
      setFeedback({ result: r, question: q, last: qIndex + 1 >= queue.length });
      setPhase("feedback");
      return;
    }
    queueScore();
    advance();
  }, [isRun, scoreSingle, session, scoreDraft, fail, q, qIndex, queue.length, queueScore, advance]);

  /** After a reply: ask the follow-up the interviewer chose, or move on. */
  const next = useCallback(
    (followUp: ApiFollowUp) => {
      if (!followUp) return void moveOn();
      setTurn({ kind: "follow-up", followUpKind: followUp.kind, question: followUp.question, number: followUp.number, of: followUp.of });
      void ask(followUp.question, "start");
    },
    [ask, moveOn],
  );

  /** "Something's wrong": pause everything while you say what's off. */
  const openWrong = useCallback(
    async (reasons: WrongReason[] = []) => {
      let resume: "reask" | "resume" | "none" = "none";
      if (phase === "asking") {
        askToken.current++;
        voice.current?.cancel();
        resume = "reask";
      } else if (phase === "answering") {
        mic.pause();
        setPhase("paused");
        resume = "resume";
      }
      if (!clock.current.pausedAt) clock.current.pausedAt = Date.now();
      setWrongError(null);
      setWrong({ reasons, resume });
    },
    [phase, mic],
  );

  const carryOn = useCallback(() => {
    const c = clock.current;
    if (c.pausedAt) {
      c.paused += Date.now() - c.pausedAt;
      c.pausedAt = null;
    }
    const resume = wrong?.resume;
    setWrong(null);
    if (resume === "reask") void ask(asked, mic.state === "paused" ? "resume" : "start");
    else if (resume === "resume") {
      mic.resume();
      setPhase("answering");
    } else if (phase === "ready") void 0;
  }, [wrong, ask, asked, mic, phase]);

  const fixAndRestart = useCallback(
    async (reasons: WrongReason[], note: string) => {
      if (!session) return;
      setWrongBusy(true);
      setWrongError(null);
      try {
        const res = await fetch(`/api/sessions/${session.id}/stop`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ reasons, note, askedIds: askedIds.current, skipped: skipped.current }),
        });
        const json = (await res.json().catch(() => ({}))) as { href?: string; message?: string };
        if (!res.ok || !json.href) throw new Error(json.message ?? "Your feedback couldn’t be saved. Try again.");
        askToken.current++;
        voice.current?.cancel();
        await mic.stop();
        router.push(json.href);
      } catch (err) {
        setWrongError(err instanceof Error ? err.message : "Your feedback couldn’t be saved. Try again.");
        setWrongBusy(false);
      }
    },
    [session, mic, router],
  );

  /**
   * Skips the question being asked or answered: the interviewer moves on to
   * a spare from the same category, so your mix and time still hold. The
   * third skip opens "Something's wrong". The opening and your questions for
   * them just skip: nothing replaces them and they don't count as skips.
   */
  const skip = useCallback(
    async (reason: SkipReason) => {
      askToken.current++;
      voice.current?.cancel();
      await mic.stop();
      draftId.current = null;
      if (q.slot) {
        skipped.current = [...skipped.current, { questionId: q.id, reason: "by-choice" }];
        return advance(q.slot === "opening" ? "No problem. Let’s get into it. " : "");
      }
      const spare = sparesLeft.current.find((x) => x.group === q.group);
      if (spare) sparesLeft.current = sparesLeft.current.filter((x) => x !== spare);
      skipped.current = [...skipped.current, { questionId: q.id, reason, replacedBy: spare?.id }];
      const realSkips = skipped.current.filter((s) => s.reason !== "by-choice");
      const lead = reason === "said-so" ? "Sorry, my mistake. Let’s move on. " : "No problem. Let’s move on. ";
      if (spare) {
        const replacement = { ...spare, number: q.number };
        setQueue((qs) => qs.map((x, k) => (k === qIndex ? replacement : x)));
        if (realSkips.length >= 3) {
          setTurn({ kind: "main" });
          setPhase("ready");
          return void openWrong([...new Set(realSkips.map((s) => SKIP_TO_WRONG[s.reason]))]);
        }
        askMain(replacement, lead);
      } else {
        if (realSkips.length >= 3) return void openWrong([...new Set(realSkips.map((s) => SKIP_TO_WRONG[s.reason]))]);
        advance(lead);
      }
    },
    [mic, q, qIndex, askMain, advance, openWrong],
  );

  const finish = useCallback(async () => {
    voice.current?.cancel();
    const seconds = mic.elapsed;
    const audio = await mic.stop();

    if (turn.kind === "main") {
      if (!audio || audio.size < 2000) {
        // Nothing usable was recorded. In an interview, ask the same question again rather than leave.
        const demo = isRun ? p.demoReportHref : p.demoFeedbackHref;
        if (!isRun && demo) router.push(`${demo}?demo=no-audio`);
        else fail("We didn’t catch an answer there. Check your microphone and try again.", "main");
        return;
      }
      setMainSec(seconds);
      setPhase("thinking");
      try {
        const form = new FormData();
        form.append("audio", audio, "answer.webm");
        form.append("interviewId", p.interviewId);
        form.append("questionId", q.id);
        form.append("questionNumber", String(q.number));
        form.append("totalQuestions", String(queue.length));
        form.append("followUps", limit > 0 ? "on" : "off");
        if (sessionLimit != null && sessionLimit > 0) form.append("followUpLimit", String(sessionLimit));
        form.append("style", style);
        if (session) form.append("session", session.id);
        const res = await fetch("/api/answers", { method: "POST", body: form });
        const json = (await res.json().catch(() => ({}))) as { draftId?: string; followUp?: ApiFollowUp; correction?: boolean; error?: string; message?: string };
        if (res.ok && json.correction) {
          // "I've never worked there": treated like Skip, with an apology.
          void skip("said-so");
        } else if (res.ok && json.draftId) {
          draftId.current = json.draftId;
          next(json.followUp ?? null);
        } else if (json.error === "not-configured" && (isRun ? p.demoReportHref : p.demoFeedbackHref)) {
          router.push(`${isRun ? p.demoReportHref : p.demoFeedbackHref}?demo=no-keys`);
        } else {
          fail(json.message ?? "Something went wrong with your answer.", "main");
        }
      } catch {
        fail("Couldn’t reach Hakkiri with your answer. Check your connection and try again.", "main");
      }
      return;
    }

    // A follow-up reply. If nothing was recorded, move on with what there is.
    if (!audio || audio.size < 2000) return void moveOn();
    setPhase("thinking");
    try {
      const form = new FormData();
      form.append("audio", audio, "follow-up.webm");
      const res = await fetch(`/api/answers/${draftId.current}/turns`, { method: "POST", body: form });
      const json = (await res.json().catch(() => ({}))) as { followUp?: ApiFollowUp; message?: string };
      if (res.ok) next(json.followUp ?? null);
      else fail(json.message ?? "Something went wrong with your reply.", "follow-up");
    } catch {
      fail("Couldn’t reach Hakkiri with your reply. Check your connection and try again.", "follow-up");
    }
  }, [mic, turn.kind, router, isRun, p, q, queue.length, limit, sessionLimit, style, session, skip, next, moveOn, fail]);

  // Hard: the interviewer cuts in on a very long answer.
  useEffect(() => {
    if (phase !== "answering" || cutIn.current || !session) return;
    const habitCut = session.drill?.habit === "short" && turn.kind === "main" ? q.targetSec[1] + 10 : null;
    const hardCut = style === "tough" && turn.kind === "main" && session.mode !== "drill" ? q.targetSec[1] + CUT_IN_AFTER_SEC : null;
    const at = habitCut ?? hardCut;
    if (at == null || mic.elapsed < at) return;
    cutIn.current = true;
    speak(habitCut ? "That’s time." : "Let me stop you there.", { voice: voiceName.current });
    void finish();
  }, [phase, mic.elapsed, style, turn.kind, q.targetSec, session, finish]);

  /** Exit interview early: stop all audio and return immediately to the interview page. */
  const endEarly = useCallback(async () => {
    askToken.current++;
    voice.current?.cancel();
    await mic.stop();
    router.push(`/interviews/${p.interviewId}`);
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = `/interviews/${p.interviewId}`;
      }, 50);
    }
  }, [mic, router, p.interviewId]);

  /** After an error on a question in a session: leave it out and carry on. */
  const skipAfterError = useCallback(() => {
    setProblem(null);
    if (turn.kind === "follow-up") return void moveOn(); // the answer itself is safe; drop the follow-up
    draftId.current = null;
    advance();
  }, [turn.kind, moveOn, advance]);

  const repeat = useCallback(() => {
    if (phase === "answering") mic.pause();
    void ask(asked, "resume");
  }, [phase, mic, ask, asked]);

  const togglePause = useCallback(() => {
    if (phase === "answering") {
      mic.pause();
      setPhase("paused");
    } else if (phase === "paused") {
      mic.resume();
      setPhase("answering");
    }
  }, [phase, mic]);

  const answerAgain = useCallback(() => {
    setProblem(null);
    void ask(asked, "start");
  }, [ask, asked]);

  const start = useCallback(async () => {
    // Ask for the microphone first, so the permission prompt doesn't cut into the question.
    if (!(await mic.prime())) return fail(MIC_BLOCKED, "mic");
    setProblem(null);
    if (!begun.current) {
      begun.current = true;
      startedAt.current = new Date().toISOString();
      clock.current = { start: Date.now(), paused: 0, pausedAt: null };
    }
    askMain(q);
  }, [mic, fail, askMain, q]);

  /** Drill: on to the next question after its feedback. */
  const afterFeedback = useCallback(() => {
    const last = feedback?.last;
    setFeedback(null);
    if (last) return void finishRun();
    advance(session?.drill?.kind === "fix" && qIndex === 0 ? "Now a different question on the same skill. " : "");
  }, [feedback, finishRun, advance, session?.drill?.kind, qIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || wrong || (e.target as HTMLElement)?.closest("button, a, input, textarea")) return;
      if (phase === "answering" || phase === "paused") {
        e.preventDefault();
        void finish();
      } else if (phase === "ready") {
        e.preventDefault();
        void start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, finish, wrong, start]);

  useEffect(
    () => () => {
      askToken.current++;
      voice.current?.cancel();
    },
    [],
  );

  const howMany = (n: number) => `${inWords(n)} follow-up${n > 1 ? "s" : ""}`;
  const followUpsLine = session
    ? session.followUpLimit === 0
      ? "No follow-ups in this session: quick questions, feedback after each."
      : session.followUpLimit
        ? `Up to ${howMany(session.followUpLimit)} after your answer, each digging deeper.`
        : `Up to ${howMany(Math.max(...queue.map((x) => followUpLimit(style, x.type)), 1))} after each answer. ${session.feedbackEach ? "Feedback after every answer." : "Feedback comes at the end, like a real interview."}`
    : limit === 0
      ? "Follow-ups are off for this question."
      : `Up to ${howMany(limit)} after this answer, based on what you say.`;

  const tip = {
    ready: session ? `Press Start when you’re ready. ${name} will ask the questions out loud.` : `Press Start when you’re ready. ${name} will ask the question out loud.`,
    asking: `Your turn starts when ${name} finishes.`,
    answering: turn.kind === "main" ? (session?.drill?.habit ? `This time: ${HABIT_LABEL[session.drill.habit].toLowerCase()}.` : "Pauses are fine. Take a breath before your result.") : "Answer the question first, then add one detail.",
    paused: "Paused. Resume when you’re ready.",
    thinking: `${name} is thinking about what you said.`,
    scoring: turn.kind === "main" ? "Scoring your answer. This takes a few seconds." : "Scoring your answer and follow-ups. This takes a few seconds.",
    feedback: "Your feedback is ready.",
    finishing: "Scoring your answers and writing your report.",
    error: problem?.message ?? "Something went wrong.",
  }[phase];

  const footNote =
    phase === "asking"
      ? "Your answer starts when the question ends, or press Start answering."
      : phase === "thinking"
        ? `${name} may ask a follow-up, or move on.`
        : phase === "answering" || phase === "paused" || phase === "ready"
          ? null
          : "";

  const current = phase === "finishing" ? queue.length + 1 : qIndex + 1;
  const total = scored.current.length;
  const title = !session ? "Practice question" : session.mode === "interview" ? "Interview" : session.mode === "rerun" ? "Run it again" : `Focused practice: ${session.drill?.title ?? ""}`;
  const canSkip = Boolean(session) && turn.kind === "main" && (phase === "asking" || phase === "answering" || phase === "paused");
  const before = session?.before?.[q.id];
  const fb = feedback?.result.row;
  const habit = session?.drill?.habit;

  return (
    <div className="flex h-dvh min-h-[600px] flex-col">
      <header className="flex h-[68px] shrink-0 items-center justify-between gap-6 px-10">
        <div className="flex min-w-0 items-center gap-3.5">
          <Link href={`/interviews/${p.interviewId}`} className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <span className="font-bold text-lg text-white tracking-tight">Hakkiri</span>
          </Link>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2 text-sm">
            <Icon name="cal" size={15} className="text-muted" />
            <span className="text-muted">Interview</span>
            <span className="truncate font-medium text-white">{p.heading}</span>
          </div>
        </div>
        {queue.length > 1 ? (
          <div role="img" aria-label={phase === "finishing" ? "Interview finished" : `Question ${current} of ${queue.length}`} className="flex shrink-0 items-center gap-3">
            <div className="flex gap-1.5">
              {queue.map((_, k) => (
                <span
                  key={k}
                  className={clsx(
                    "h-1 rounded-sm",
                    queue.length > 10 ? "w-5" : "w-8",
                    k === current - 1 ? "bg-white" : k < current - 1 ? "bg-white/40" : "bg-white/20"
                  )}
                />
              ))}
            </div>
            <span className="num text-[13px] text-muted">{phase === "finishing" ? "Finished" : `Question ${current} of ${queue.length}`}</span>
            {remainingSec != null && phase !== "ready" && phase !== "finishing" && (
              <span className={clsx("num rounded-full px-2.5 py-1 text-[13px] font-semibold", remainingSec < WRAP_UP_SEC ? "bg-red/15 text-red-soft" : "bg-panel-2 text-muted")}>{mmss(remainingSec)} left</span>
            )}
          </div>
        ) : (
          <span className="text-[13px] text-muted">One question, feedback straight after</span>
        )}
        <div className="flex shrink-0 items-center gap-2.5">
          {phase === "answering" && (
            <span className="inline-flex h-[34px] items-center gap-2 rounded-full bg-red/15 px-3.5 text-[13px] font-semibold text-red-soft">
              <span className="h-2 w-2 animate-rec rounded-full bg-red" />
              {mic.state === "demo" ? "Demo recording" : "Recording"}
            </span>
          )}
          {(phase === "asking" || phase === "thinking" || phase === "scoring" || phase === "finishing") && (
            <span className="inline-flex h-[34px] items-center gap-2 rounded-full bg-blue/15 px-3.5 text-[13px] font-semibold text-lilac">
              <span className="h-2 w-2 animate-rec rounded-full bg-blue" />
              {phase === "asking" ? `${name} is speaking` : phase === "thinking" ? `${name} is thinking` : phase === "finishing" ? "Writing your report" : "Scoring"}
            </span>
          )}
          {phase === "paused" && <span className="inline-flex h-[34px] items-center rounded-full bg-panel-2 px-3.5 text-[13px] font-semibold text-muted">Paused</span>}
          {session && session.mode !== "drill" && phase !== "finishing" && (
            <Button size="sm" onClick={() => void openWrong()}>
              <Icon name="flag" size={14} strokeWidth={2} />
              Report an issue
            </Button>
          )}
          {isRun && phase !== "ready" && phase !== "finishing" ? (
            <Button size="sm" onClick={() => void endEarly()}>
              {session?.mode === "drill" ? "End practice" : "End interview"}
            </Button>
          ) : (
            phase !== "finishing" && (
              <Link href={`/interviews/${p.interviewId}`} className={buttonClass("secondary", "sm")}>
                Back
              </Link>
            )
          )}
        </div>
      </header>

      {phase === "ready" ? (
        <main className="flex min-h-0 grow flex-col justify-start px-6 lg:px-10 py-6 w-full animate-rise">
          {/* Top 2 Cards: Interviewer Briefing + Ready to Start */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.58fr_1fr] gap-5 items-stretch">
            {/* Left Card: Interviewer Briefing */}
            <div className="rounded-2xl bg-[#0f0e1c] border border-white/[0.08] p-6 sm:p-7 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-[#1e1c33] shadow-lg">
                    <div className="flex h-full w-full items-center justify-center font-semibold text-lg text-white/80 bg-[#25223e]">
                      {name[0]}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/sam.jpg"
                      alt={name}
                      className="absolute inset-0 h-full w-full object-cover z-10"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted">
                      {session?.mode === "drill" ? `Focused practice with ${name}` : "Your interviewer"}
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                      {session?.mode === "drill" && session.drill?.title ? session.drill.title : `Your interview with ${name}`}
                    </h1>
                    <span className="mt-1.5 inline-block rounded-full bg-[#24213d] border border-[#3e3966] px-3 py-0.5 text-xs font-semibold text-[#a5a1ff]">
                      {p.interviewer.title || "Hiring manager"}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-[#9b9ca8] leading-relaxed">
                  {session?.mode === "drill" && session.drill?.instruction
                    ? session.drill.instruction
                    : "A realistic, role-specific interview to help you build confidence and sharpen your answers."}
                </p>

                {session?.mode === "drill" && queue.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted mr-1">Questions included:</span>
                    {queue.map((item) => (
                      <span
                        key={item.id}
                        className="rounded-lg bg-white/[0.04] border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85"
                      >
                        {item.short}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="flex items-center gap-3 rounded-xl bg-[#16152a] border border-white/[0.06] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#232043] text-[#a5a1ff]">
                    <Icon name="clock" size={17} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {session?.minutes ?? (session?.mode === "drill" ? 6 : 20)} minutes
                    </div>
                    <div className="text-xs text-[#8c8d9e] truncate">
                      {session?.mode === "drill" ? "Practice length" : "Interview length"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-[#16152a] border border-white/[0.06] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#232043] text-[#a5a1ff]">
                    <Icon name="list" size={17} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {session?.mode === "drill" ? `${queue.length} questions` : `About ${queue.length} questions`}
                    </div>
                    <div className="text-xs text-[#8c8d9e] truncate">
                      {session?.mode === "drill" ? "Topic-specific" : "Role-relevant questions"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-[#16152a] border border-white/[0.06] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#232043] text-[#a5a1ff]">
                    <Icon name="target" size={17} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {session?.mode === "drill" ? (session.drill?.focusLabel ?? "Focused") : "Balanced"}
                    </div>
                    <div className="text-xs text-[#8c8d9e] truncate">
                      {session?.mode === "drill" ? "Selected topic focus" : "A mix of experience, skills and technical"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: You're ready to start */}
            <div className="rounded-2xl bg-[#0f0e1c] border border-white/[0.08] p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#272348] text-[#a5a1ff]">
                    <Icon name="sparkle" size={17} strokeWidth={2} />
                  </div>
                  <h2 className="text-base font-bold text-white">You&apos;re ready to start</h2>
                </div>

                <div className="mt-5 space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Icon name="check" size={13} strokeWidth={2.6} />
                    </div>
                    <span className="text-sm text-white/90">
                      {session?.mode === "drill" ? "Focused, topic-relevant questions." : "Realistic, role-relevant questions."}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Icon name="check" size={13} strokeWidth={2.6} />
                    </div>
                    <span className="text-sm text-white/90">
                      {session?.feedbackEach ? "Instant feedback after each answer." : "Feedback at the end, like a real interview."}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-white">Difficulty</span>
                    <span className="text-[11px] font-medium text-[#a5a1ff]">
                      {DIFFICULTY_LABEL[difficultyFor(style)]}
                    </span>
                  </div>
                  <Segmented<Difficulty>
                    label="Difficulty"
                    fullWidth
                    options={DIFFICULTIES}
                    value={difficultyFor(style)}
                    onChange={(d) => void changeReadyDifficulty(d)}
                    className="!bg-[#16152a] !shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  />
                  <p className="mt-2 text-[11px] leading-relaxed text-[#8c8d9e]">
                    {switchingDifficulty ? "Loading questions calibrated for this difficulty..." : DIFFICULTY_HINT[difficultyFor(style)]}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-2.5 pt-3 border-t border-white/[0.06]">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/20 text-[10px] font-bold text-muted mt-0.5">
                  i
                </div>
                <p className="text-xs leading-relaxed text-[#8c8d9e]">
                  You can skip a question if it doesn&apos;t feel relevant. If something doesn&apos;t seem right, select{" "}
                  <button onClick={() => void openWrong()} className="underline hover:text-white font-medium">
                    Report an issue
                  </button>.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Card: How it works */}
          <div className="mt-4 rounded-2xl bg-[#0f0e1c] border border-white/[0.08] p-6 shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#24213d] text-[#a5a1ff]">
                <Icon name="mic" size={16} strokeWidth={2} />
              </div>
              <h2 className="text-base font-bold text-white">How it works</h2>
            </div>

            {/* 3 Step Flow */}
            <div className="mt-5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e2746] text-[#6d9dfd] text-xs font-bold mt-0.5">
                  1
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Get a question</div>
                  <div className="text-xs text-[#8c8d9e] mt-0.5 leading-normal">
                    {name} will ask a role-specific question out loud.
                  </div>
                </div>
              </div>

              <span className="text-white/20 text-base font-light px-1">›</span>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e2746] text-[#6d9dfd] text-xs font-bold mt-0.5">
                  2
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Give your answer</div>
                  <div className="text-xs text-[#8c8d9e] mt-0.5 leading-normal">
                    Aim for a clear and structured response (around 1–1½ minutes).
                  </div>
                </div>
              </div>

              <span className="text-white/20 text-base font-light px-1">›</span>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e2746] text-[#6d9dfd] text-xs font-bold mt-0.5">
                  3
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Get feedback</div>
                  <div className="text-xs text-[#8c8d9e] mt-0.5 leading-normal">
                    Receive a detailed score and personalised feedback at the end.
                  </div>
                </div>
              </div>
            </div>

            <div className="my-5 border-t border-white/[0.08]" />

            {/* Answer Time Slider */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-white">Your answer time</span>
                <span className="text-white/20">|</span>
                <span className="text-xs text-[#8c8d9e]">
                  Aim for around 1 to 1½ minutes per answer. You&apos;ll see a timer as you speak.
                </span>
              </div>

              {/* Slider Track */}
              <div className="relative mt-5 mb-2">
                <div className="h-1.5 w-full rounded-full bg-white/10" />

                {/* Left 0:00 Thumb */}
                <div className="absolute -top-1.5 left-0 h-4 w-4 rounded-full bg-white shadow-md" />

                {/* Target illuminated pill on track: 1:00 (33.3%) to 1:30 (50%) */}
                <div
                  className="absolute -top-3.5 left-[33.3%] flex h-8 w-[16.7%] min-w-[130px] items-center justify-center rounded-full bg-gradient-to-r from-[#4f5df7] via-[#5d55f5] to-[#6d55f4] text-[11px] font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.55)] border border-white/20"
                >
                  Target: 1:00 – 1:30
                </div>

                {/* Time markers */}
                <div className="mt-4 flex justify-between text-[11px] font-mono text-[#7b7c8e]">
                  <span>0:00</span>
                  <span className="translate-x-1">0:30</span>
                  <span className="opacity-0">1:00 - 1:30</span>
                  <span>2:00</span>
                  <span>2:30</span>
                  <span>3:00</span>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="mt-5 pt-3 flex items-center justify-between border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs text-[#8c8d9e]">
                <kbd className="rounded bg-[#19182d] border border-white/15 px-2.5 py-1 font-mono text-xs font-semibold text-white shadow-sm">
                  Space
                </kbd>
                <span>Press Space to finish your answer</span>
              </div>

              <button
                type="button"
                onClick={() => void start()}
                className="group flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#4f52f8] via-[#5c5ffc] to-[#6d5eff] hover:from-[#5b5efd] hover:to-[#7b6dff] px-7 py-3 text-sm font-semibold text-white border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_25px_-2px_rgba(79,82,248,0.55)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_32px_-2px_rgba(79,82,248,0.75)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
              >
                <Icon name="mic" size={17} strokeWidth={2.2} className="group-hover:scale-110 transition-transform duration-200" />
                <span>{begun.current ? "Carry on" : session?.mode === "drill" ? "Start practice" : "Start interview"}</span>
              </button>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex min-h-0 grow flex-col justify-between px-6 lg:px-10 py-5 w-full animate-rise">
          {/* Top 2 Columns: Center Card + Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-5 items-stretch">
            {/* Left Column: Question / Feedback / Ending */}
            <div className="flex flex-col justify-between gap-4">
              {phase === "finishing" || (phase === "error" && problem?.stage === "report") ? (
                <div className="rounded-2xl bg-[#0f0e1c] border border-white/[0.08] p-7 sm:p-9 shadow-xl flex flex-col justify-center min-h-[340px]">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-blue-soft uppercase tracking-wider">
                    <Icon name="checkCircle" size={16} className="text-blue-soft" />
                    <span>Interview completed</span>
                  </div>
                  <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                    {session?.mode === "drill" ? "That’s the focused practice done." : "Thank you. That’s the end of the interview."}
                  </h1>
                  <p className="mt-3 text-sm text-[#a1a2b3] leading-relaxed max-w-xl">
                    Your report is being written now: every answer and follow-up, scored the same way.
                  </p>
                  <div className="mt-6 rounded-xl bg-[#141326] border border-white/10 p-5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-white">Scoring your answers in background</span>
                      <span className="num font-bold text-blue-soft">{scoredCount} of {total} scored</span>
                    </div>
                    <div className="mt-3 flex gap-1.5 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      {Array.from({ length: total }, (_, k) => (
                        <span key={k} className={clsx("h-full flex-1 rounded-sm transition-all duration-500", k < scoredCount ? "bg-gradient-to-r from-blue to-indigo-500" : "bg-white/[0.06]")} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : phase === "feedback" && feedback && fb ? (
                <div className="rounded-2xl bg-[#0f0e1c] border border-white/[0.08] p-7 sm:p-8 shadow-xl flex flex-col justify-between min-h-[340px]">
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted pb-3 border-b border-white/[0.06]">
                      <span>Question {qIndex + 1} of {queue.length}: {feedback.question.short}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue/15 text-blue-soft font-semibold">Focused Feedback</span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-4">
                      <span className="num text-4xl sm:text-5xl font-bold text-white tracking-tight">{fb.overall?.toFixed(1) ?? "n/a"}</span>
                      <span className="text-base text-muted font-medium">{fb.overall != null ? scoreLabel(fb.overall) : ""}</span>
                      {before != null && fb.overall != null && (
                        <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full", fb.overall > before ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-muted")}>
                          {fb.overall > before ? `↑ up from ${before.toFixed(1)}` : fb.overall < before ? `↓ down from ${before.toFixed(1)}` : "same as before"}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-[#c9cad3] leading-relaxed">
                      <p><b className="text-white">One fix: </b>{feedback.result.oneFix}</p>
                      {feedback.result.strength && (
                        <p><b className="text-emerald-400">Keep: </b>{feedback.result.strength}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Primary Active Question Card */
                <div className="rounded-2xl bg-[#0f0e1c] border border-white/[0.08] p-6 sm:p-8 shadow-xl flex flex-col justify-between min-h-[330px] relative overflow-hidden">
                  <div>
                    {/* Top row of card */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/20 bg-[#1e1c33]">
                          <div className="flex h-full w-full items-center justify-center font-semibold text-xs text-white/80 bg-[#25223e]">
                            {name[0]}
                          </div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/sam.jpg"
                            alt={name}
                            className="absolute inset-0 h-full w-full object-cover z-10"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{name}</div>
                          <div className="text-[11px] text-muted">{p.interviewer.title || "Hiring manager"} asks:</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#24213d] border border-[#3e3966] px-2.5 py-0.5 text-[11px] font-semibold text-[#a5a1ff]">
                          {q.contextLabel || "Role Question"}
                        </span>
                        <span className="rounded-full bg-[#1b2649] border border-[#2b3d75] px-2.5 py-0.5 text-[11px] font-semibold text-[#6d9dfd]">
                          Target: {mmss(target[0])}–{mmss(target[1])}
                        </span>
                      </div>
                    </div>

                    {/* Question text */}
                    {turn.kind === "follow-up" ? (
                      <div className="mt-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue/20 text-blue-soft border border-blue/30 text-[11px] font-bold uppercase tracking-wider mb-2">
                          Follow-up {turn.number} of {turn.of}
                        </span>
                        <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-white tracking-tight leading-snug">
                          {turn.question}
                        </h1>
                      </div>
                    ) : (
                      <h1 className="mt-5 text-xl sm:text-2xl lg:text-[30px] font-bold text-white tracking-tight leading-snug">
                        {q.text}
                      </h1>
                    )}

                    {/* Guidance / Hint Callout Box */}
                    <div className="mt-6 rounded-xl bg-[#16152a] border border-white/[0.06] p-4 flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 mt-0.5">
                        <Icon name="sparkle" size={14} />
                      </div>
                      <div className="text-xs text-[#a5a7b8] leading-relaxed">
                        <b className="text-white">Guidance: </b>
                        {session?.drill?.instruction && (session.drill.kind === "fix" || session.drill.kind === "habit" || session.drill.kind === "topic")
                          ? session.drill.instruction
                          : sameWords(q.contextLabel, q.text)
                          ? q.contextHint
                          : `${q.contextLabel}. ${q.contextHint}`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Segment Bar below question card */}
              <div className="rounded-xl bg-[#0f0e1c] border border-white/[0.08] p-4 shadow-lg">
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <span>Interview progress</span>
                    <Icon name="info" size={13} className="text-muted" />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue" /> Current</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Done</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-white/20" /> Upcoming</span>
                  </div>
                </div>

                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${queue.length}, minmax(0, 1fr))` }}>
                  {queue.map((item, idx) => {
                    const isCurrent = idx === qIndex;
                    const isDone = idx < qIndex;
                    return (
                      <div
                        key={item.id}
                        className={clsx(
                          "flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-center transition-all",
                          isCurrent
                            ? "bg-blue/20 border-blue text-white shadow-[0_0_12px_rgba(79,70,229,0.35)] font-bold"
                            : isDone
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-medium"
                            : "bg-[#141326] border-white/5 text-muted opacity-60"
                        )}
                      >
                        <span className="num text-xs font-bold">{idx + 1}</span>
                        <span className="text-[10px] truncate max-w-full hidden sm:inline px-1">{item.short}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar with Coaching & Live State */}
            <div className="space-y-4">
              {/* Card 1: Current question status */}
              <div className="rounded-2xl bg-[#0f0e1c] border border-white/[0.08] p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-xs font-bold text-white">Current question</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {qIndex + 1} of {queue.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] text-muted">Time on this question</div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className={clsx("num text-2xl font-bold tracking-tight", shownSec > target[1] ? "text-rose-400" : "text-white")}>
                        {mmss(shownSec)}
                      </span>
                      {shownSec > target[1] && (
                        <span className="text-[10px] font-semibold text-rose-400">
                          +{mmss(shownSec - target[1])}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted">Planned time</div>
                    <div className="mt-1 num text-2xl font-bold text-white/70 tracking-tight">
                      {mmss(target[1])}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-3 text-xs text-muted flex items-start gap-1.5">
                  <span className="text-white font-medium shrink-0">→ Next:</span>
                  <span className="truncate text-[#c9cad3]">
                    {queue[qIndex + 1]?.short || "Final report & analysis"}
                  </span>
                </div>
              </div>

              {/* Card 2: Interviewer presence */}
              <div className="rounded-2xl bg-[#0f0e1c] border border-white/[0.08] p-5 shadow-xl space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/20 transition-all duration-300",
                    phase === "asking" ? "ring-2 ring-blue shadow-[0_0_15px_rgba(79,82,248,0.5)]" : phase === "answering" ? "ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "ring-0"
                  )}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/sam.jpg"
                      alt={name}
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                    />
                    <div className="flex h-full w-full items-center justify-center font-semibold text-sm text-white/80 bg-[#25223e]">
                      {name[0]}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{name}</div>
                    <div className="text-[11px] text-muted truncate">
                      {phase === "asking" ? "● Speaking to you out loud..." : phase === "answering" ? "● Listening to your answer..." : phase === "thinking" ? "● Considering what you said..." : phase === "paused" ? "Interview paused" : "Waiting"}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[#8c8d9e] border-t border-white/[0.06] pt-2.5">
                  {followUpsLine}
                </div>
                <div className="border-t border-white/[0.06] pt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-muted">Difficulty</span>
                    <span className="font-semibold text-[#a5a1ff]">{DIFFICULTY_LABEL[difficultyFor(style)]}</span>
                  </div>
                  <Segmented<Difficulty>
                    label="Session difficulty"
                    fullWidth
                    options={DIFFICULTIES}
                    value={difficultyFor(style)}
                    onChange={(d) => setStyle(styleFor(d))}
                    className="!bg-[#16152a] !shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  />
                </div>
              </div>

              {/* Card 3: Interactive Answer Checklist */}
              <div className="rounded-2xl bg-[#0f0e1c] border border-white/[0.08] p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Icon name="target" size={14} className="text-purple-400" />
                  <span>Answer checklist</span>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { id: "chk_1", label: "Cover the key situation & context" },
                    { id: "chk_2", label: "State your specific actions & trade-offs" },
                    { id: "chk_3", label: "Conclude with measurable impact" },
                  ].map((chk) => {
                    const isChecked = Boolean(checklist[`${q.id}_${chk.id}`]);
                    return (
                      <button
                        key={chk.id}
                        type="button"
                        onClick={() => toggleChecklist(`${q.id}_${chk.id}`)}
                        className="w-full flex items-center gap-2.5 text-left p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        <span className={clsx(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                          isChecked ? "bg-emerald-500 border-emerald-500 text-white font-bold text-[10px]" : "border-white/20 bg-white/5 group-hover:border-white/40"
                        )}>
                          {isChecked ? "✓" : ""}
                        </span>
                        <span className={clsx("transition-colors", isChecked ? "text-muted line-through" : "text-[#c9cad3]")}>
                          {chk.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Waveform & Control Console */}
          <div className="mt-4 rounded-2xl bg-[#0f0e1c] border border-white/[0.08] p-5 shadow-xl space-y-3">
            {/* Waveform Bar */}
            <div className="rounded-xl bg-[#141326] px-5 py-3 border border-white/[0.06]">
              <div className="flex items-center justify-between pb-2 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{phase === "asking" ? name : phase === "error" ? "Notice" : "You"}</span>
                  <span className={clsx("text-[11px]", phase === "error" ? "text-rose-400" : "text-muted")}>
                    {tip}
                  </span>
                </div>
                <div className="num font-bold text-base text-white">
                  {mmss(shownSec)}
                </div>
              </div>

              {/* Waveform bars */}
              <div aria-hidden className="flex h-12 items-center justify-between gap-[2px]">
                {phase === "asking"
                  ? SPEAKER_BARS.map((v, i) => (
                      <span key={i} className="w-[3px] animate-wave rounded-full bg-gradient-to-t from-blue to-indigo-300" style={{ height: `max(4px, ${Math.round(v * 100)}%)`, animationDelay: `${-((i * 0.137) % 1.3).toFixed(2)}s` }} />
                    ))
                  : Array.from({ length: BARS }, (_, i) => {
                      const v = i < mic.bars.length ? mic.bars[i] : i === mic.bars.length && phase === "answering" ? mic.level : null;
                      return v == null ? (
                        <span key={i} className="h-0.5 w-[3px] rounded-full bg-white/10" />
                      ) : (
                        <span key={i} className={clsx("w-[3px] rounded-full transition-all", i >= mic.bars.length - 8 && phase === "answering" ? "bg-gradient-to-t from-indigo-500 to-purple-400" : "bg-gradient-to-t from-blue to-indigo-400")} style={{ height: `max(4px, ${Math.round(v * 100)}%)` }} />
                      );
                    })}
              </div>

              {/* Target Rail */}
              <div className="mt-2.5">
                <TargetRail totalSec={totalSec} nowSec={shownSec} target={target} />
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2 text-xs text-muted">
                <kbd className="rounded bg-[#19182d] border border-white/15 px-2.5 py-1 font-mono text-xs font-semibold text-white shadow-sm">
                  Space
                </kbd>
                <span>{footNote ?? "Press Space to finish your answer"}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {canSkip && <SkipMenu simple={Boolean(q.slot)} onSkip={(r) => void skip(r)} />}
                
                {phase === "feedback" ? (
                  <Button variant="primary" className="px-6 rounded-xl font-semibold text-xs" onClick={afterFeedback}>
                    {feedback?.last ? "See your summary" : "Next question →"}
                  </Button>
                ) : phase === "thinking" || phase === "scoring" || phase === "finishing" ? (
                  <Button variant="primary" className="px-6 rounded-xl font-semibold text-xs" disabled>
                    <Icon name="repeat" size={14} className="animate-spin" />
                    <span>{phase === "thinking" ? "One moment…" : phase === "finishing" ? "Writing your report…" : "Scoring answers…"}</span>
                  </Button>
                ) : phase === "error" ? (
                  problem?.stage === "mic" ? (
                    <>
                      <Link href={`/mic-check?next=${encodeURIComponent(typeof window === "undefined" ? `/mock/${p.interviewId}` : window.location.pathname + window.location.search)}`} className={buttonClass("secondary", "md")}>
                        Check your microphone
                      </Link>
                      <Button variant="primary" className="px-6 rounded-xl text-xs font-semibold" onClick={() => (begun.current ? answerAgain() : void start())}>
                        <Icon name="mic" size={15} />
                        Try again
                      </Button>
                    </>
                  ) : problem?.stage === "report" ? (
                    <div className="flex items-center gap-2">
                      <Link href={`/interviews/${p.interviewId}/mocks`} className={buttonClass("secondary", "md")}>
                        View interviews
                      </Link>
                      <Button variant="primary" className="px-6 rounded-xl text-xs font-semibold" onClick={() => void finishRun()}>
                        <Icon name="repeat" size={15} />
                        Try again
                      </Button>
                    </div>
                  ) : problem?.stage === "score" ? (
                    <Button variant="primary" className="px-6 rounded-xl text-xs font-semibold" onClick={() => (isRun ? skipAfterError() : void scoreSingle())}>
                      <Icon name="repeat" size={15} />
                      {isRun ? "Carry on" : "Try scoring again"}
                    </Button>
                  ) : (
                    <>
                      {isRun ? (
                        <Button onClick={skipAfterError}>{turn.kind === "follow-up" ? "Skip this follow-up" : "Skip this question"}</Button>
                      ) : problem?.stage === "follow-up" ? (
                        <Button onClick={() => void scoreSingle()}>Skip to feedback</Button>
                      ) : p.demoFeedbackHref ? (
                        <Link href={`${p.demoFeedbackHref}?demo=error`} className={buttonClass("secondary", "md")}>
                          See demo feedback
                        </Link>
                      ) : null}
                      <Button variant="primary" className="px-6 rounded-xl text-xs font-semibold" onClick={answerAgain}>
                        <Icon name="mic" size={15} />
                        Answer again
                      </Button>
                    </>
                  )
                ) : phase === "asking" ? (
                  <>
                    <Button disabled className="rounded-xl text-xs">
                      <Icon name="repeat" size={14} />
                      Repeat question
                    </Button>
                    <Button disabled className="rounded-xl text-xs">
                      <Icon name="pause" size={14} />
                      Pause
                    </Button>
                    <button
                      type="button"
                      onClick={() => voice.current?.cancel()}
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4f52f8] via-[#5c5ffc] to-[#6d5eff] hover:from-[#5b5efd] hover:to-[#7b6dff] px-6 py-2.5 text-xs font-semibold text-white border border-white/20 shadow-[0_4px_20px_rgba(79,82,248,0.45)] hover:shadow-[0_6px_26px_rgba(79,82,248,0.7)] transition-all cursor-pointer"
                    >
                      <Icon name="mic" size={15} className="group-hover:scale-110 transition-transform" />
                      <span>Start answering</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Button onClick={repeat} className="rounded-xl text-xs">
                      <Icon name="repeat" size={14} />
                      Repeat question
                    </Button>
                    <Button onClick={togglePause} className="rounded-xl text-xs">
                      <Icon name={phase === "paused" ? "play" : "pause"} size={14} />
                      {phase === "paused" ? "Resume" : "Pause"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => void finish()}
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4f52f8] via-[#5c5ffc] to-[#6d5eff] hover:from-[#5b5efd] hover:to-[#7b6dff] px-6 py-2.5 text-xs font-semibold text-white border border-white/20 shadow-[0_4px_20px_rgba(79,82,248,0.45)] hover:shadow-[0_6px_26px_rgba(79,82,248,0.7)] transition-all cursor-pointer"
                    >
                      <Icon name="check" size={15} strokeWidth={2.4} className="group-hover:scale-110 transition-transform" />
                      <span>Finish answer</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {wrong && <SomethingWrong initialReasons={wrong.reasons} skippedCount={skipped.current.filter((s) => s.reason !== "by-choice").length} busy={wrongBusy} error={wrongError} onFix={(r, n) => void fixAndRestart(r, n)} onCarryOn={carryOn} />}
    </div>
  );
}
