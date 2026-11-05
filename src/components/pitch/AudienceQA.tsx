"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Mark } from "@/components/brand/Mark";
import { Button, buttonClass, Chip, Icon } from "@/components/ui";
import { useMicrophone } from "@/components/audio/useMicrophone";
import { TargetRail } from "@/components/audio/TargetRail";
import { speak, type VoiceName } from "@/components/audio/speak";
import { SlideView } from "./SlideView";
import { capitalise, inWords, mmss } from "@/lib/format";
import { profileFor, followUpProfile } from "@/lib/scoring/profiles";
import { CUT_IN_SEC, personaFor, QA_STYLE_HINT, QA_STYLE_LABEL, QA_STYLES } from "@/lib/pitch/labels";
import type { Audience, QaQuestion, QaStyle, Slide } from "@/lib/pitch/types";

type Phase = "ready" | "preparing" | "asking" | "answering" | "paused" | "thinking" | "finishing" | "error";
type Press = { kind: "challenge" | "clarify"; question: string };
type Session = { sessionId: string; persona: { name: string; title: string }; questions: QaQuestion[] };
type Stage = "start" | "answer" | "finish" | "mic";

const MIC_BLOCKED = "Hakkiri can’t hear your microphone. Click the lock or mic icon in the address bar, allow the microphone, then press Try again.";
const BARS = 206;
const SPEAKER_BARS = Array.from({ length: BARS }, (_, i) => {
  const edge = Math.min(1, i / 18, (BARS - 1 - i) / 18);
  const phrase = 0.55 + 0.45 * Math.sin(i * 0.21) * Math.sin(i * 0.047 + 1.3);
  const grain = 0.5 + 0.5 * Math.abs(Math.sin(i * 1.73) * Math.cos(i * 0.61));
  return Math.max(0.04, edge * phrase * grain);
});

/** A friendlier voice for a curious audience, a firmer one for sceptics. */
const QA_VOICE: Record<QaStyle, VoiceName> = { curious: "easy", technical: "medium", sceptical: "hard", "time-pressed": "hard" };

const ANSWER_TIP: Record<QaStyle, string> = {
  sceptical: "Give a number if you have one.",
  curious: "Answer, then give one example.",
  "time-pressed": "One line first. They’ll cut in after a minute.",
  technical: "Say how it works, then what could break.",
};

export interface AudienceQAProps {
  presentationId: string;
  heading: string;
  audience: Audience;
  defaultStyle: QaStyle;
  slides: Slide[];
  questionCount: number;
  demoReportHref: string | null;
}

/**
 * Audience Q&A (design screen 14). Someone from your audience asks questions
 * built from your slides and what you said in your last run. Each answer goes
 * to the follow-up engine: dodge the question and they ask again. A
 * time-pressed exec cuts in after a minute. Answers are scored in the
 * background; the report opens at the end.
 */
export function AudienceQA(p: AudienceQAProps) {
  const router = useRouter();
  const [style, setStyle] = useState<QaStyle>(p.defaultStyle);
  const styleRef = useRef<QaStyle>(p.defaultStyle);
  useEffect(() => {
    styleRef.current = style;
  }, [style]);
  const [session, setSession] = useState<Session | null>(null);
  const [preparing, setPreparing] = useState<string | null>(null);
  const [k, setK] = useState(0);
  const [press, setPress] = useState<Press | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [problem, setProblem] = useState<{ message: string; stage: Stage } | null>(null);
  const [scored, setScored] = useState(0);
  const prep = useRef<{ seq: number; promise: Promise<Session | null> } | null>(null);
  const seq = useRef(0);
  const voice = useRef<{ cancel: () => void } | null>(null);
  const askToken = useRef(0);
  const answered = useRef<Set<number>>(new Set());
  const scoring = useRef<Promise<unknown>[]>([]);
  const cutting = useRef(false);
  /** True once the first question has been asked. */
  const begun = useRef(false);

  const target = press ? followUpProfile(press.kind).targetSec : profileFor("presentation-qa").targetSec;
  const totalSec = Math.max(90, target[1] + 30);
  const mic = useMicrophone({ barSec: totalSec / BARS });
  const persona = session?.persona ?? personaFor(p.audience, style);
  const q = session?.questions[k];
  const shownSec = phase === "asking" && mic.state === "stopped" ? 0 : mic.elapsed;
  const count = session?.questions.length ?? p.questionCount;

  /** Questions are prepared as soon as you pick a style, so Start is quick. */
  const prepare = useCallback(
    (s: QaStyle) => {
      const mySeq = ++seq.current;
      setSession(null);
      setPreparing("Reading your slides and your last run…");
      const promise = (async () => {
        try {
          const res = await fetch("/api/qa", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ presentationId: p.presentationId, style: s }) });
          const json = (await res.json()) as Session & { message?: string };
          if (!res.ok || !json.sessionId) throw new Error(json.message ?? "");
          if (mySeq === seq.current) {
            setSession(json);
            setPreparing(null);
          }
          return json;
        } catch (err) {
          if (mySeq === seq.current) setPreparing(err instanceof Error && err.message ? err.message : "Couldn’t prepare the questions. Check your connection.");
          return null;
        }
      })();
      prep.current = { seq: mySeq, promise };
    },
    [p.presentationId],
  );

  useEffect(() => {
    prepare(p.defaultStyle);
  }, [prepare, p.defaultStyle]);

  const fail = useCallback((message: string, stage: Stage) => {
    setProblem({ message, stage });
    setPhase("error");
  }, []);

  const ask = useCallback(
    async (text: string, how: "start" | "resume") => {
      const token = ++askToken.current;
      setPhase("asking");
      const v = speak(text, { voice: QA_VOICE[styleRef.current] });
      voice.current = v;
      await v.done;
      voice.current = null;
      if (askToken.current !== token) return;
      if (how === "start") {
        cutting.current = false;
        if (!(await mic.start())) {
          await mic.stop();
          return fail(MIC_BLOCKED, "mic");
        }
      } else mic.resume();
      setPhase("answering");
    },
    [mic, fail],
  );

  /** Saves the session and opens its report, once every answer is scored. */
  const finishAll = useCallback(async () => {
    if (!session || answered.current.size === 0) return router.push(`/presentations/${p.presentationId}`);
    setPhase("finishing");
    setProblem(null);
    await Promise.all(scoring.current);
    try {
      const res = await fetch(`/api/qa/${session.sessionId}/finish`, { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (res.ok && json.id) {
        router.push(`/presentations/${p.presentationId}/qa/${json.id}`);
        router.refresh();
      } else fail(json.message ?? "Your Q&A couldn’t be saved.", "finish");
    } catch {
      fail("Couldn’t reach Hakkiri to save your Q&A. Check your connection and try again.", "finish");
    }
  }, [session, router, p.presentationId, fail]);

  const moveOn = useCallback(() => {
    if (!session) return;
    const sid = session.sessionId;
    const done = k;
    scoring.current.push(
      fetch(`/api/qa/${sid}/score`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ k: done }) })
        .then((r) => r.ok && setScored((n) => n + 1))
        .catch(() => undefined),
    );
    setPress(null);
    const nextQ = session.questions[k + 1];
    if (!nextQ) {
      voice.current = speak("Thanks. That’s all from me.", { voice: QA_VOICE[styleRef.current] });
      return void finishAll();
    }
    setK(k + 1);
    void ask(nextQ.text, "start");
  }, [session, k, ask, finishAll]);

  const finish = useCallback(
    async (cutIn = false) => {
      if (!session) return;
      voice.current?.cancel();
      const audio = await mic.stop();
      if (!audio || audio.size < 2000) {
        if (!press && p.demoReportHref) return router.push(`${p.demoReportHref}?demo=no-audio`);
        if (press) return moveOn();
        return fail("No recording was captured. Check your microphone and answer again.", "answer");
      }
      setPhase("thinking");
      try {
        const form = new FormData();
        form.append("audio", audio, "answer.webm");
        form.append("k", String(k));
        if (cutIn) form.append("cutIn", "1");
        const res = await fetch(`/api/qa/${session.sessionId}/turns`, { method: "POST", body: form });
        const json = (await res.json().catch(() => ({}))) as { press?: Press | null; error?: string; message?: string };
        if (!res.ok) {
          if (json.error === "not-configured" && p.demoReportHref) return router.push(`${p.demoReportHref}?demo=no-keys`);
          return fail(json.message ?? "Something went wrong with your answer.", "answer");
        }
        answered.current.add(k);
        if (json.press && !press) {
          setPress(json.press);
          void ask(json.press.question, "start");
        } else moveOn();
      } catch {
        fail("Couldn’t reach Hakkiri with your answer. Check your connection and try again.", "answer");
      }
    },
    [session, mic, press, p.demoReportHref, router, k, fail, ask, moveOn],
  );

  // A time-pressed exec cuts in after a minute.
  useEffect(() => {
    const limit = CUT_IN_SEC[style];
    if (limit == null || phase !== "answering" || press || cutting.current) return;
    if (mic.elapsed >= limit) {
      cutting.current = true;
      void finish(true);
    }
  }, [mic.elapsed, phase, press, style, finish]);

  const start = useCallback(async () => {
    if (!(await mic.prime())) return fail(MIC_BLOCKED, "mic");
    setProblem(null);
    let s = session;
    if (!s) {
      setPhase("preparing");
      s = (await prep.current?.promise) ?? null;
      if (!s) return fail("The questions couldn’t be prepared. Try again.", "start");
    }
    answered.current = new Set();
    scoring.current = [];
    begun.current = true;
    setK(0);
    setPress(null);
    void ask(s.questions[0].text, "start");
  }, [mic, session, fail, ask]);

  const endEarly = useCallback(async () => {
    askToken.current++;
    voice.current?.cancel();
    await mic.stop();
    if (answered.current.has(k) && phase !== "thinking") {
      // The current question's answer is in; score it with whatever was said.
      scoring.current.push(fetch(`/api/qa/${session?.sessionId}/score`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ k }) }).catch(() => undefined));
    }
    void finishAll();
  }, [mic, k, phase, session, finishAll]);

  const repeat = useCallback(() => {
    if (phase === "answering") mic.pause();
    void ask(press?.question ?? q?.text ?? "", "resume");
  }, [phase, mic, ask, press, q]);

  const togglePause = useCallback(() => {
    if (phase === "answering") {
      mic.pause();
      setPhase("paused");
    } else if (phase === "paused") {
      mic.resume();
      setPhase("answering");
    }
  }, [phase, mic]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || (e.target as HTMLElement)?.closest("button, a, input, textarea")) return;
      if (phase === "answering" || phase === "paused") {
        e.preventDefault();
        void finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, finish]);

  useEffect(
    () => () => {
      askToken.current++;
      voice.current?.cancel();
    },
    [],
  );

  const qSlide = q?.slide != null ? p.slides.find((s) => s.n === q.slide) : undefined;
  const sceptic = style === "sceptical" || style === "time-pressed";
  const tip = {
    ready: `Press Start when you’re ready. ${persona.name} will ask ${inWords(count)} questions out loud.`,
    preparing: `${persona.name} is reading your slides…`,
    asking: `Your turn starts when ${persona.name} finishes.`,
    answering: press ? "Answer it directly this time." : ANSWER_TIP[style],
    paused: "Paused. Resume when you’re ready.",
    thinking: `${persona.name} is thinking about your answer.`,
    finishing: "Scoring your answers and writing your report.",
    error: problem?.message ?? "Something went wrong.",
  }[phase];

  return (
    <div className="flex h-dvh min-h-[600px] flex-col">
      <header className="flex h-[68px] shrink-0 items-center justify-between px-10">
        <div className="flex min-w-0 items-center gap-3.5">
          <Mark size={26} />
          <span className="text-sm font-semibold">Audience Q&A</span>
          <span className="truncate text-sm text-muted">{p.heading}</span>
        </div>
        <div role="img" aria-label={phase === "finishing" ? "Q&A finished" : `Question ${k + 1} of ${count}`} className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: count }, (_, i) => (
              <span key={i} className={clsx("h-1 w-9 rounded-sm", phase === "finishing" || i < k ? "bg-muted" : i === k && phase !== "ready" ? "bg-white" : "bg-white/20")} />
            ))}
          </div>
          <span className="num text-[13px] text-muted">{phase === "finishing" ? "Q&A finished" : `Question ${k + 1} of ${count}`}</span>
        </div>
        <div className="flex items-center gap-2.5">
          {phase === "answering" && (
            <span className="inline-flex h-[34px] items-center gap-2 rounded-full bg-red/15 px-3.5 text-[13px] font-semibold text-red-soft">
              <span className="h-2 w-2 animate-rec rounded-full bg-red" />
              {mic.state === "demo" ? "Demo recording" : "Recording"}
            </span>
          )}
          {(phase === "asking" || phase === "thinking" || phase === "finishing" || phase === "preparing") && (
            <span className="inline-flex h-[34px] items-center gap-2 rounded-full bg-blue/15 px-3.5 text-[13px] font-semibold text-lilac">
              <span className="h-2 w-2 animate-rec rounded-full bg-blue" />
              {phase === "asking" ? `${persona.name} is speaking` : phase === "finishing" ? "Writing your report" : `${persona.name} is thinking`}
            </span>
          )}
          {phase === "paused" && <span className="inline-flex h-[34px] items-center rounded-full bg-panel-2 px-3.5 text-[13px] font-semibold text-muted">Paused</span>}
          {phase === "ready" || phase === "preparing" || (phase === "error" && answered.current.size === 0) ? (
            <Link href={`/presentations/${p.presentationId}`} className={buttonClass("secondary", "sm")}>
              Back
            </Link>
          ) : (
            phase !== "finishing" && (
              <Button size="sm" onClick={() => void endEarly()}>
                End Q&A
              </Button>
            )
          )}
        </div>
      </header>

      <main className="grid min-h-0 grow grid-cols-[minmax(0,1fr)_320px] items-center gap-12 pl-[120px] pr-10">
        {phase === "finishing" || (phase === "error" && problem?.stage === "finish") ? (
          <div key="end">
            <div className="animate-rise text-sm text-muted">
              {persona.name}, {persona.title}
            </div>
            <h1 className="mt-3.5 animate-rise text-[clamp(34px,6.2vh,52px)] font-semibold leading-[1.07] tracking-[-0.03em] [animation-delay:0.1s]">Thanks. That’s all from me.</h1>
            <p className="mt-5 animate-rise text-base text-muted [animation-delay:0.2s]">Your report is being written now: every answer, and every time {persona.name} asked again.</p>
          </div>
        ) : phase === "ready" || phase === "preparing" || !q ? (
          <div key="ready">
            <div className="flex animate-rise items-center gap-2.5">
              <Chip tone={sceptic ? "red" : "blue"}>{QA_STYLE_LABEL[style]}</Chip>
              <span className="text-sm text-muted">
                {persona.name}, {persona.title}
              </span>
            </div>
            <h1 className="mt-4 animate-rise text-[clamp(34px,6.2vh,52px)] font-semibold leading-[1.07] tracking-[-0.03em] [animation-delay:0.1s]">
              The talk is over. Time for questions.
            </h1>
            <p className="mt-5 animate-rise text-base text-muted [animation-delay:0.2s]">
              {capitalise(inWords(count))} questions from your slides and your last run. Answer first, then the reason, then link back to your ask.
            </p>
          </div>
        ) : press ? (
          <div key={`p${k}`}>
            <div className="flex animate-rise items-center gap-2.5">
              <Chip tone="red">Asked again</Chip>
              <span className="text-sm text-muted">
                {persona.name}, {persona.title}
              </span>
            </div>
            <h1 className="mt-4 animate-rise text-[clamp(34px,6.2vh,52px)] font-semibold leading-[1.07] tracking-[-0.03em] [animation-delay:0.1s]">{press.question}</h1>
            <p className="mt-5 animate-rise text-base text-muted [animation-delay:0.2s]">
              {phase === "asking" ? `Answer when ${persona.name} finishes. ` : ""}Answer it directly this time: {mmss(target[0])} to {mmss(target[1])}.
            </p>
          </div>
        ) : (
          <div key={`q${k}`}>
            <div className="flex animate-rise items-center gap-2.5">
              <Chip tone={sceptic ? "red" : "blue"}>{QA_STYLE_LABEL[style]}</Chip>
              <span className="text-sm text-muted">
                {persona.name}, {persona.title}, asks
              </span>
            </div>
            <h1 className="mt-4 animate-rise text-[clamp(34px,6.2vh,52px)] font-semibold leading-[1.07] tracking-[-0.03em] [animation-delay:0.1s]">{q.text}</h1>
            <p className="mt-5 animate-rise text-base text-muted [animation-delay:0.2s]">
              Answer first, then the reason, then link back to your ask. {target[0]} to {target[1]} seconds.
            </p>
          </div>
        )}

        {phase === "ready" || phase === "preparing" || (phase === "error" && problem?.stage === "start") ? (
          <aside className="rounded-[14px] bg-panel px-5 py-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <div className="text-[13px] text-muted">Who’s asking</div>
            <div className="mt-2.5">
              <div role="radiogroup" aria-label="Audience style" className="grid grid-cols-2 gap-1.5">
                {QA_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={style === s}
                    disabled={phase === "preparing"}
                    onClick={() => {
                      if (s === style) return;
                      setStyle(s);
                      prepare(s);
                    }}
                    className={clsx("rounded-[8px] px-2.5 py-2 text-left text-[13px] font-semibold", style === s ? "bg-blue-fill text-white" : "bg-panel-2 text-muted hover:text-ink")}
                  >
                    {QA_STYLE_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-normal text-muted">{QA_STYLE_HINT[style]}</p>
            <p className={clsx("mt-3.5 border-t border-line pt-3.5 text-[13px] leading-normal", preparing && !preparing.startsWith("Reading") ? "text-red-soft" : "text-muted")}>
              {session ? `${capitalise(inWords(session.questions.length))} questions ready. Feedback comes at the end.` : (preparing ?? "")}
            </p>
          </aside>
        ) : phase === "finishing" || (phase === "error" && problem?.stage === "finish") ? (
          <aside className="animate-rise rounded-[14px] bg-panel px-5 py-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <div className="text-[13px] text-muted">Your report</div>
            <div className="num mt-1 text-sm font-semibold">
              {Math.min(scored, answered.current.size)} of {answered.current.size} answers scored
            </div>
            <div className="mt-3 flex gap-[3px]" aria-hidden>
              {Array.from({ length: answered.current.size }, (_, i) => (
                <span key={i} className={clsx("h-2 flex-1 rounded-[2px]", i < scored ? "bg-blue" : "bg-white/[0.08]")} />
              ))}
            </div>
          </aside>
        ) : (
          <aside className="animate-rise rounded-[14px] bg-panel px-5 py-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            {qSlide ? (
              <>
                <div className="text-[13px] text-muted">About your slide</div>
                <SlideView slide={qSlide} presentationId={p.presentationId} className="mt-2.5 w-full rounded-[5px] shadow-[0_0_0_1px_var(--color-line-strong)]" />
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Mark size={30} live={phase === "asking"} />
                <div className="text-sm font-semibold">
                  {persona.name}, {persona.title}
                </div>
              </div>
            )}
            {q && (
              <p className="mt-3 text-[13px] leading-normal text-muted">
                {press ? `${persona.name} asked again. One more chance, then the next question.` : `${persona.name} will ask again if ${q.pressIf.replace(/^if\s+/i, "").replace(/\.$/, "")}.`}
              </p>
            )}
          </aside>
        )}
      </main>

      <section aria-label={phase === "asking" ? `${persona.name} is speaking` : "Your answer so far"} className="shrink-0 px-10">
        <div className="flex items-baseline justify-between pb-3.5 pl-20">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold">{phase === "asking" ? persona.name : "You"}</span>
            <span className={clsx("text-[13px]", phase === "error" ? "text-red-soft" : "text-muted")} role={phase === "error" ? "alert" : undefined}>
              {tip}
            </span>
          </div>
          {phase !== "ready" && phase !== "preparing" && (
            <div className={clsx("num text-[clamp(26px,3.8vh,34px)] font-semibold tracking-[-0.02em]", (phase === "asking" || phase === "finishing") && "text-dim")} aria-live="off">
              {mmss(shownSec)}
            </div>
          )}
        </div>
        <div className="ml-20 rounded-2xl bg-panel px-6 pb-3.5 pt-[clamp(14px,2.4vh,22px)] shadow-[inset_0_0_0_1px_var(--color-line)]">
          <div aria-hidden className="flex h-[clamp(64px,12vh,112px)] items-center justify-between">
            {phase === "asking"
              ? SPEAKER_BARS.map((v, i) => (
                  <span key={i} className="w-[3px] animate-wave rounded-full bg-white/78" style={{ height: `max(4px, ${Math.round(v * 100)}%)`, animationDelay: `${-((i * 0.137) % 1.3).toFixed(2)}s` }} />
                ))
              : Array.from({ length: BARS }, (_, i) => {
                  const v = phase === "ready" || phase === "preparing" ? null : i < mic.bars.length ? mic.bars[i] : i === mic.bars.length && phase === "answering" ? mic.level : null;
                  return v == null ? (
                    <span key={i} className="h-0.5 w-[3px] rounded-full bg-white/12" />
                  ) : (
                    <span key={i} className={clsx("w-[3px] rounded-full", i >= mic.bars.length - 8 && phase === "answering" ? "bg-blue" : "bg-wave")} style={{ height: `max(4px, ${Math.round(v * 100)}%)` }} />
                  );
                })}
          </div>
          <div className="mt-4">
            <TargetRail totalSec={totalSec} nowSec={phase === "ready" || phase === "preparing" ? 0 : shownSec} target={target} />
          </div>
        </div>
        <div className="mb-[clamp(16px,3.3vh,30px)] ml-20 mt-[clamp(12px,2.2vh,20px)] flex items-center justify-between gap-6">
          <span className="text-[13px] text-muted">
            {phase === "asking" ? (
              "Your answer starts when the question ends, or press Start answering."
            ) : phase === "answering" || phase === "paused" ? (
              <>
                Press <kbd className="rounded-md bg-panel-2 px-[7px] py-0.5 font-sans text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]">Space</kbd> to finish your answer
              </>
            ) : phase === "thinking" ? (
              `${persona.name} may ask again, or move on.`
            ) : (
              ""
            )}
          </span>
          <div className="flex gap-2.5">
            {phase === "ready" || phase === "preparing" ? (
              <Button variant="primary" className="px-[26px]" onClick={() => void start()} disabled={phase === "preparing"}>
                <Icon name="mic" size={17} strokeWidth={2} />
                {phase === "preparing" ? "Preparing questions…" : "Start Q&A"}
              </Button>
            ) : phase === "thinking" || phase === "finishing" ? (
              <Button variant="primary" className="px-[26px]" disabled>
                {phase === "thinking" ? "One moment…" : "Writing your report…"}
              </Button>
            ) : phase === "error" ? (
              problem?.stage === "mic" ? (
                <>
                  <Link href={`/mic-check?next=${encodeURIComponent(`/qa/${p.presentationId}`)}`} className={buttonClass("secondary", "md")}>
                    Check your microphone
                  </Link>
                  <Button variant="primary" className="px-[26px]" onClick={() => {
                      setProblem(null);
                      if (begun.current) void ask(press?.question ?? q?.text ?? "", "start");
                      else void start();
                    }}>
                    <Icon name="mic" size={17} strokeWidth={2} />
                    Try again
                  </Button>
                </>
              ) : problem?.stage === "finish" ? (
                <Button variant="primary" className="px-[26px]" onClick={() => void finishAll()}>
                  <Icon name="repeat" size={17} strokeWidth={1.9} />
                  Try again
                </Button>
              ) : problem?.stage === "start" ? (
                <Button
                  variant="primary"
                  className="px-[26px]"
                  onClick={() => {
                    setProblem(null);
                    setPhase("ready");
                    prepare(style);
                  }}
                >
                  Try again
                </Button>
              ) : (
                <>
                  <Button onClick={moveOn}>Skip this question</Button>
                  <Button
                    variant="primary"
                    className="px-[26px]"
                    onClick={() => {
                      setProblem(null);
                      void ask(press?.question ?? q?.text ?? "", "start");
                    }}
                  >
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
    </div>
  );
}
