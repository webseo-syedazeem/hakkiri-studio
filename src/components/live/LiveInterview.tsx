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
import { DIFFICULTY_LABEL, difficultyFor } from "@/lib/interviews/settings";
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
  /** Drills: feedback after every answer instead of one report at the end. */
  feedbackEach?: boolean;
  drill?: { kind: DrillKind; title: string; habit?: Habit; instruction?: string; detail?: string };
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
    const answerIds = results.flatMap((r) => (r.id ? [r.id] : []));
    if (!answerIds.length) return fail(results.find((r) => r.message)?.message ?? "None of your answers could be scored.", "report");
    try {
      const res = await fetch("/api/mocks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          interviewId: p.interviewId,
          sessionId: session?.id,
          startedAt: startedAt.current,
          style,
          planned: queue.length,
          answerIds,
          askedIds: askedIds.current,
          skipped: skipped.current,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (res.ok && json.id) router.push(`/interviews/${p.interviewId}/mocks/${json.id}`);
      else fail(json.message ?? "Your report couldn’t be saved.", "report");
    } catch {
      fail("Couldn’t reach Hakkiri to save your report. Check your connection and try again.", "report");
    }
  }, [scoreDraft, fail, router, p.interviewId, session?.id, style, queue.length]);

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

  /** Session: stop now and get a report on the questions answered so far. */
  const endEarly = useCallback(async () => {
    askToken.current++;
    voice.current?.cancel();
    await mic.stop();
    if (draftId.current) {
      if (session?.feedbackEach) {
        const id = draftId.current;
        draftId.current = null;
        scored.current.push({ draftId: id, promise: scoreDraft(id) });
      } else queueScore(); // the current question was answered; keep it
    }
    if (scored.current.length === 0) router.push(`/interviews/${p.interviewId}`);
    else void finishRun();
  }, [mic, session?.feedbackEach, scoreDraft, queueScore, router, p.interviewId, finishRun]);

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
      ? "No follow-ups in this drill: quick questions, feedback after each."
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
  const title = !session ? "Practice question" : session.mode === "interview" ? "Interview" : session.mode === "rerun" ? "Run it again" : `Drill: ${session.drill?.title ?? ""}`;
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
              {session?.mode === "drill" ? "End drill" : "End interview"}
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
        <main className="flex min-h-0 grow flex-col justify-center px-6 lg:px-12 py-5 max-w-[1240px] mx-auto w-full">
          {/* Top 2 Cards: Interviewer Briefing + Ready to Start */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.58fr_1fr] gap-4 items-stretch">
            {/* Left Card: Interviewer Briefing */}
            <div className="rounded-2xl bg-[#0f0e1c] border border-white/[0.08] p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white/10 bg-[#1e1c33] shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/sam.jpg"
                      alt={name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="flex h-full w-full items-center justify-center font-semibold text-lg text-white/80 bg-[#25223e]">
                      {name[0]}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted">Your interviewer</span>
                    <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                      Your interview with {name}
                    </h1>
                    <span className="mt-1.5 inline-block rounded-full bg-[#24213d] border border-[#3e3966] px-3 py-0.5 text-xs font-semibold text-[#a5a1ff]">
                      {p.interviewer.title || "Hiring manager"}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-[#9b9ca8] leading-relaxed">
                  A realistic, role-specific interview to help you build confidence and sharpen your answers.
                </p>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="flex items-center gap-3 rounded-xl bg-[#16152a] border border-white/[0.06] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#232043] text-[#a5a1ff]">
                    <Icon name="clock" size={17} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {session?.minutes ?? 20} minutes
                    </div>
                    <div className="text-xs text-[#8c8d9e] truncate">Interview length</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-[#16152a] border border-white/[0.06] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#232043] text-[#a5a1ff]">
                    <Icon name="list" size={17} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      About {queue.length} questions
                    </div>
                    <div className="text-xs text-[#8c8d9e] truncate">Role-relevant questions</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-[#16152a] border border-white/[0.06] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#232043] text-[#a5a1ff]">
                    <Icon name="target" size={17} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">Balanced</div>
                    <div className="text-xs text-[#8c8d9e] truncate">A mix of experience, skills and technical</div>
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
                    <span className="text-sm text-white/90">Realistic, role-relevant questions.</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Icon name="check" size={13} strokeWidth={2.6} />
                    </div>
                    <span className="text-sm text-white/90">Feedback at the end, like a real interview.</span>
                  </div>
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
                  className="absolute -top-3.5 left-[33.3%] flex h-8 w-[16.7%] min-w-[130px] items-center justify-center rounded-full bg-gradient-to-r from-[#4f5df7] to-[#6d55f4] text-[11px] font-semibold text-white shadow-lg shadow-indigo-500/30"
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
                className="flex items-center gap-2 rounded-xl bg-[#3866ff] hover:bg-[#4a75ff] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Icon name="mic" size={17} strokeWidth={2.2} />
                {begun.current ? "Carry on" : session?.mode === "drill" ? "Start drill" : "Start interview"}
              </button>
            </div>
          </div>
        </main>
      ) : (
        <>
          <main className="grid min-h-0 grow grid-cols-[minmax(0,1fr)_320px] items-center gap-12 pl-[120px] pr-10">
        {phase === "finishing" || (phase === "error" && problem?.stage === "report") ? (
          <div key="end">
            <div className="animate-rise text-sm text-muted">
              {name}, {p.interviewer.title}
            </div>
            <h1 className="mt-3.5 animate-rise text-[clamp(34px,6.2vh,56px)] font-semibold leading-[1.07] tracking-[-0.03em] [animation-delay:0.1s]">
              {session?.mode === "drill" ? "That’s the drill done." : "Thank you. That’s the end of the interview."}
            </h1>
            <p className="mt-5 animate-rise text-base text-muted [animation-delay:0.2s]">Your report is being written now: every answer and follow-up, scored the same way.</p>
          </div>
        ) : phase === "feedback" && feedback && fb ? (
          <div key={`fb${feedback.question.id}`}>
            <div className="animate-rise text-sm text-muted">
              Question {qIndex + 1} of {queue.length}: {feedback.question.short}
            </div>
            <div className="mt-3 flex animate-rise items-baseline gap-4 [animation-delay:0.05s]">
              <span className="num text-[clamp(44px,8vh,72px)] font-semibold leading-none tracking-[-0.04em]">{fb.overall?.toFixed(1) ?? "n/a"}</span>
              <span className="text-lg text-muted">{fb.overall != null ? scoreLabel(fb.overall) : ""}</span>
              {before != null && fb.overall != null && (
                <span className={clsx("text-base font-semibold", fb.overall > before ? "text-blue-soft" : "text-muted")}>
                  {fb.overall > before ? `up from ${before.toFixed(1)}` : fb.overall < before ? `down from ${before.toFixed(1)}` : "the same as before"}
                </span>
              )}
            </div>
            {habit && (
              <div className={clsx("mt-5 flex animate-rise items-start gap-2.5 text-base [animation-delay:0.1s]", rowHabit(fb, habit) ? "text-blue-soft" : "text-red-soft")}>
                <Icon name={rowHabit(fb, habit) ? "check" : "x"} size={20} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                <span>
                  <b className="font-semibold">{HABIT_LABEL[habit]}.</b> <span className="text-ink">{habitLine(fb, habit)}</span>
                </span>
              </div>
            )}
            {feedback.result.pay && (
              <ul className="mt-5 animate-rise space-y-1.5 [animation-delay:0.1s]">
                {feedback.result.pay.map((c) => (
                  <li key={c.label} className={clsx("flex items-start gap-2.5 text-base", c.ok === true ? "text-blue-soft" : c.ok === false ? "text-red-soft" : "text-muted")}>
                    <Icon name={c.ok === false ? "x" : c.ok === true ? "check" : "flag"} size={18} strokeWidth={2.4} className="mt-1 shrink-0" />
                    <span>
                      <span className="font-semibold">{c.label}.</span>
                      {c.note && <span className="text-ink"> {c.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 animate-rise text-base leading-relaxed [animation-delay:0.15s]">
              <span className="text-muted">One fix: </span>
              {feedback.result.oneFix}
            </p>
            {feedback.result.strength && (
              <p className="mt-1.5 animate-rise text-base leading-relaxed [animation-delay:0.2s]">
                <span className="text-muted">Keep: </span>
                {feedback.result.strength}
              </p>
            )}
          </div>
        ) : turn.kind === "main" ? (
          <div key={`q${q.id}`}>
            <div className="animate-rise text-sm text-muted">
              {name}, {p.interviewer.title}, asks
            </div>
            <h1 className="mt-3.5 animate-rise text-[clamp(34px,6.2vh,56px)] font-semibold leading-[1.07] tracking-[-0.03em] [animation-delay:0.1s]">{q.text}</h1>
            <p className="mt-5 animate-rise text-base text-muted [animation-delay:0.2s]">
              {session?.drill?.instruction && (session.drill.kind === "fix" || session.drill.kind === "habit") ? session.drill.instruction : sameWords(q.contextLabel, q.text) ? q.contextHint : `${q.contextLabel}. ${q.contextHint}`}
            </p>
          </div>
        ) : (
          <div key={`f${q.id}-${turn.number}`}>
            <div className="flex animate-rise items-center gap-2.5">
              <Chip tone="blue">
                Follow-up {turn.number} of {turn.of}
              </Chip>
              <span className="text-sm text-muted">
                {name}, {p.interviewer.title}
              </span>
            </div>
            <h1 className="mt-4 animate-rise text-[clamp(34px,6.2vh,56px)] font-semibold leading-[1.07] tracking-[-0.03em] [animation-delay:0.1s]">{turn.question}</h1>
            <p className="mt-5 animate-rise text-base text-muted [animation-delay:0.2s]">
              {phase === "asking" ? `Answer when ${name} finishes. ` : ""}Follow-ups are usually shorter: {mmss(target[0])} to {mmss(target[1])}.
            </p>
          </div>
        )}

        {phase === "finishing" || (phase === "error" && problem?.stage === "report") ? (
          <aside className="animate-rise rounded-[14px] bg-panel px-5 py-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <div className="text-[13px] text-muted">Your report</div>
            <div className="num mt-1 text-sm font-semibold">
              {scoredCount} of {total} answers scored
            </div>
            <div className="mt-3 flex gap-[3px]" aria-hidden>
              {Array.from({ length: total }, (_, k) => (
                <span key={k} className={clsx("h-2 flex-1 rounded-[2px] transition-colors", k < scoredCount ? "bg-blue" : "bg-white/[0.08]")} />
              ))}
            </div>
            <p className="mt-3.5 border-t border-line pt-3.5 text-[13px] leading-normal text-muted">Answers were scored in the background while you carried on, so this only takes a few seconds.</p>
          </aside>
        ) : phase === "feedback" ? (
          <aside className="animate-rise rounded-[14px] bg-panel px-5 py-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <div className="text-[13px] text-muted">{feedback?.last ? "That was the last question" : "Next"}</div>
            <div className="mt-1 text-sm font-semibold">{feedback?.last ? "See how the drill went" : session?.drill?.kind === "fix" && qIndex === 0 ? "A new question on the same skill" : `Question ${qIndex + 2} of ${queue.length}`}</div>
            {session?.escalate && style !== p.interviewer.style && <p className="mt-2 text-[13px] text-lilac">Strong answer, so {name} gets tougher for the next one.</p>}
            <p className="mt-3.5 border-t border-line pt-3.5 text-[13px] leading-normal text-muted">The full feedback for each answer is in your summary at the end.</p>
          </aside>
        ) : turn.kind === "main" ? (
          <aside className="rounded-[14px] bg-panel px-5 py-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <div className="flex items-center gap-3">
              <Mark size={34} live={phase === "asking" || phase === "answering"} />
              <div>
                <div className="text-sm font-semibold">
                  {name} is {phase === "asking" ? "asking" : phase === "thinking" ? "thinking" : phase === "error" ? "waiting" : "listening"}
                </div>
                <div className="text-[13px] text-muted">{session ? `${DIFFICULTY_LABEL[difficultyFor(style)]} interview` : `${capitalise(style)} style`}</div>
              </div>
            </div>
            <p className="mt-3.5 border-t border-line pt-3.5 text-[13px] leading-normal text-muted">{followUpsLine}</p>
          </aside>
        ) : (
          <aside className="animate-rise rounded-[14px] bg-panel px-5 py-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <div className="text-[13px] text-muted">Your last answer</div>
            <div className="mt-1 text-sm font-semibold">{q.short}</div>
            <div className="num mt-0.5 text-[13px] text-muted">
              {mmss(mainSec)}, {q.contextLabel.toLowerCase()}
            </div>
            <p className="mt-3.5 border-t border-line pt-3.5 text-[13px] leading-normal text-muted">
              {isRun && !session?.feedbackEach ? "Feedback comes at the end, like a real interview." : "Feedback comes after the follow-ups, like a real interview."} Follow-up answers are scored too.
            </p>
          </aside>
        )}
      </main>

      <section aria-label={phase === "asking" ? `${name} is speaking` : "Your answer so far"} className="shrink-0 px-10">
        <div className="flex items-baseline justify-between pb-3.5 pl-20">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold">{phase === "asking" ? name : "You"}</span>
            <span className={clsx("text-[13px]", phase === "error" ? "text-red-soft" : "text-muted")} role={phase === "error" ? "alert" : undefined}>
              {tip}
            </span>
          </div>
          <div className={clsx("num text-[clamp(26px,3.8vh,34px)] font-semibold tracking-[-0.02em]", (phase === "asking" || phase === "finishing" || phase === "feedback") && "text-dim")} aria-live="off">
            {mmss(shownSec)}
          </div>
        </div>
        <div className="ml-20 rounded-2xl bg-panel px-6 pb-3.5 pt-[clamp(14px,2.4vh,22px)] shadow-[inset_0_0_0_1px_var(--color-line)]">
          <div aria-hidden className="flex h-[clamp(64px,12vh,112px)] items-center justify-between">
            {phase === "asking"
              ? SPEAKER_BARS.map((v, i) => (
                  <span key={i} className="w-[3px] animate-wave rounded-full bg-white/78" style={{ height: `max(4px, ${Math.round(v * 100)}%)`, animationDelay: `${-((i * 0.137) % 1.3).toFixed(2)}s` }} />
                ))
              : Array.from({ length: BARS }, (_, i) => {
                  const v = i < mic.bars.length ? mic.bars[i] : i === mic.bars.length && phase === "answering" ? mic.level : null;
                  return v == null ? (
                    <span key={i} className="h-0.5 w-[3px] rounded-full bg-white/12" />
                  ) : (
                    <span key={i} className={clsx("w-[3px] rounded-full", i >= mic.bars.length - 8 && phase === "answering" ? "bg-blue" : "bg-wave")} style={{ height: `max(4px, ${Math.round(v * 100)}%)` }} />
                  );
                })}
          </div>
          <div className="mt-4">
            <TargetRail totalSec={totalSec} nowSec={shownSec} target={target} />
          </div>
          {mic.error && phase !== "error" && <p className="mt-1 text-[13px] text-red-soft">{mic.error}</p>}
        </div>
        <div className="mb-[clamp(16px,3.3vh,30px)] ml-20 mt-[clamp(12px,2.2vh,20px)] flex items-center justify-between gap-6">
          <span className="text-[13px] text-muted">
            {footNote ?? (
              <>
                Press <kbd className="rounded-md bg-panel-2 px-[7px] py-0.5 font-sans text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]">Space</kbd> to finish your answer
              </>
            )}
          </span>
          <div className="flex gap-2.5">
            {canSkip && <SkipMenu simple={Boolean(q.slot)} onSkip={(r) => void skip(r)} />}
            {phase === "feedback" ? (
              <Button variant="primary" className="px-[26px]" onClick={afterFeedback}>
                {feedback?.last ? "See your summary" : "Next question"}
              </Button>
            ) : phase === "thinking" || phase === "scoring" || phase === "finishing" ? (
              <Button variant="primary" className="px-[26px]" disabled>
                {phase === "thinking" ? "One moment…" : phase === "finishing" ? "Writing your report…" : turn.kind === "main" ? "Scoring your answer…" : "Scoring your answers…"}
              </Button>
            ) : phase === "error" ? (
              problem?.stage === "mic" ? (
                <>
                  <Link href={`/mic-check?next=${encodeURIComponent(typeof window === "undefined" ? `/mock/${p.interviewId}` : window.location.pathname + window.location.search)}`} className={buttonClass("secondary", "md")}>
                    Check your microphone
                  </Link>
                  <Button variant="primary" className="px-[26px]" onClick={() => (begun.current ? answerAgain() : void start())}>
                    <Icon name="mic" size={17} strokeWidth={2} />
                    Try again
                  </Button>
                </>
              ) : problem?.stage === "report" ? (
                <Button variant="primary" className="px-[26px]" onClick={() => void finishRun()}>
                  <Icon name="repeat" size={17} strokeWidth={1.9} />
                  Try again
                </Button>
              ) : problem?.stage === "score" ? (
                <Button variant="primary" className="px-[26px]" onClick={() => (isRun ? skipAfterError() : void scoreSingle())}>
                  <Icon name="repeat" size={17} strokeWidth={1.9} />
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
                  <Button variant="primary" className="px-[26px]" onClick={answerAgain}>
                    <Icon name="mic" size={17} strokeWidth={2} />
                    Answer again
                  </Button>
                </>
              )
            ) : phase === "asking" ? (
              <>
                <Button disabled>
                  <Icon name="repeat" size={17} strokeWidth={1.9} />
                  Repeat question
                </Button>
                <Button disabled>
                  <Icon name="pause" size={17} strokeWidth={2.2} />
                  Pause
                </Button>
                <Button variant="primary" className="px-[26px]" onClick={() => voice.current?.cancel()}>
                  Start answering
                </Button>
              </>
            ) : (
              <>
                <Button onClick={repeat}>
                  <Icon name="repeat" size={17} strokeWidth={1.9} />
                  Repeat question
                </Button>
                <Button onClick={togglePause}>
                  <Icon name={phase === "paused" ? "play" : "pause"} size={17} strokeWidth={2.2} />
                  {phase === "paused" ? "Resume" : "Pause"}
                </Button>
                <Button variant="primary" className="px-[26px]" onClick={() => void finish()}>
                  Finish answer
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
      </>
      )}

      {wrong && <SomethingWrong initialReasons={wrong.reasons} skippedCount={skipped.current.filter((s) => s.reason !== "by-choice").length} busy={wrongBusy} error={wrongError} onFix={(r, n) => void fixAndRestart(r, n)} onCarryOn={carryOn} />}
    </div>
  );
}
