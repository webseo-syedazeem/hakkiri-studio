"use client";

import Link from "next/link";
import { type FormEvent, type KeyboardEvent, type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { type Change, type Op, applyOps } from "@/lib/cv/agent/ops";
import { nextStep, stageOf, stagesFor } from "@/lib/cv/agent/plan";
import { swapMessage } from "@/lib/cv/agent/style";
import { type Locator, isEntrySection } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { api, messageOf } from "./client";
import { scoreLabel } from "./Findings";
import { PaperView } from "./Paper";
import { Announce, Bar, Btn, CvScreen, Skeleton } from "./ui";
import { SAVE_WORDS } from "./useCv";
import { useHandsFree } from "./useHandsFree";
import { useWorkspace } from "./Workspace";

/**
 * Building a CV by talking it through. The person says or types what they
 * did; the assistant edits the CV beside them as they go and asks for the
 * next thing it needs. Every edit has been checked against their own words
 * before it arrives (see `lib/cv/agent`), each reply's edits are one step of
 * Undo, and every change is listed under the reply that made it.
 *
 * Layout: the conversation and the page side by side, each scrolling on its
 * own, with the message box always at the bottom of the conversation. On
 * narrower screens, Chat and Paper are tabs.
 *
 * The conversation is kept on this device only. The CV keeps what matters
 * from it: each line it added carries the words it was made from.
 */

interface Left {
  what: string;
  why: string;
}
interface Tip {
  word: string;
  plainer: string;
}
interface Turn {
  id: string;
  who: "you" | "assistant";
  text: string;
  spoken?: boolean;
  /** The first message: what is about to happen. */
  intro?: boolean;
  ask?: string;
  changes?: Change[];
  left?: Left[];
  tips?: Tip[];
  note?: string;
  undone?: boolean;
  /** The turn couldn't be answered: the message to send again. */
  retry?: { text: string; spoken: boolean };
}
interface Kept {
  turns: Turn[];
  about?: string;
  step?: string;
  skipped: string[];
}
interface Reply {
  by: "ai" | "rules";
  say: string;
  ask: string;
  ops: Op[];
  left: Left[];
  tips: Tip[];
  about?: string;
  step: string;
  skipped: string[];
  note?: string;
}

const keyFor = (id: string) => `hakkiri.cv.talk.${id}`;
const VOICE_KEY = "hakkiri.cv.talk.voice";
const turnId = () => Math.random().toString(36).slice(2, 10);

function readKept(id: string): Kept | null {
  try {
    const kept = JSON.parse(localStorage.getItem(keyFor(id)) ?? "null") as Kept | null;
    return kept && Array.isArray(kept.turns) ? kept : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------- icons */

const PATHS = {
  wave: "M3 10v4m4-8v12m5-16v20m5-16v12m4-8v4",
  mic: "M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3ZM5 10v1a7 7 0 0 0 14 0v-1M12 18v4m-4 0h8",
  mute: "M9 3.5A3 3 0 0 1 15 5v5M3 3l18 18M5 10v1a7 7 0 0 0 11.4 5.4M12 18v4m-4 0h8",
  stop: "M7 7h10v10H7z",
  check: "m5 12 4 4L19 6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  edit: "m14 5 5 5M4 20l4-1 12-12-4-4L4 15z",
  person: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-1a8 8 0 0 1 16 0v1",
  tag: "M3 12V4h8l10 10-8 8L3 12Zm5-4h.01",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-3h.01",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8m-8 4h8",
  move: "M12 5v14m-5-9 5-5 5 5",
  chev: "m9 18 6-6-6-6",
  back: "m15 18-6-6 6-6",
  send: "M12 19V5m-6 6 6-6 6 6",
  undo: "M9 10 4 5m0 0v7m0-7h7M4 5h9a7 7 0 0 1 0 14h-3",
  shield: "m12 2 8 4v6c0 5-4 8-8 10-4-2-8-5-8-10V6l8-4Zm-3 10 2 2 4-4",
  bulb: "M9 18h6m-5 4h4M8 15a6 6 0 1 1 8 0l-1 2H9l-1-2Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  chat: "M21 11a8 8 0 0 1-8 8H8l-5 3v-5a8 8 0 1 1 18-6Z",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-10v5m0-8h.01",
  down: "M12 5v14m-6-6 6 6 6-6",
} as const;
type IconName = keyof typeof PATHS;
const Icon = ({ name, className }: { name: IconName; className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className ? `cv-ico ${className}` : "cv-ico"}>
    <path d={PATHS[name]} />
  </svg>
);
const KIND_ICON: Record<string, IconName> = { Added: "plus", Reworded: "edit", "Switched off": "minus", "Switched on": "plus", Contact: "person", Skills: "tag", "Target job": "target", "Job advert": "doc", Profile: "doc", Updated: "edit", "Moved to top": "move", "Moved to bottom": "move" };

/** "What did you do as X? Say it as you would to a friend…": the question, and the rest as a hint beneath it. */
function splitAsk(ask: string): { question: string; hint: string } {
  const at = ask.indexOf("?");
  if (at < 0 || at === ask.length - 1) return { question: ask, hint: "" };
  return { question: ask.slice(0, at + 1), hint: ask.slice(at + 1).trim() };
}

/** Fits the screen to the window below the app's own header, so the conversation and the page scroll on their own and the message box stays in view. */
function useFill(ref: React.RefObject<HTMLElement | null>, ready: boolean) {
  const [height, setHeight] = useState<number | undefined>();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const main = el.closest("main");
      // The app's own padding below, less any the screen takes back (a phone has no gutters).
      const pad = (main ? parseFloat(getComputedStyle(main).paddingBottom) || 0 : 0) + (parseFloat(getComputedStyle(el).marginBottom) || 0);
      const view = window.visualViewport?.height ?? window.innerHeight;
      setHeight(Math.max(480, Math.floor(view - top - pad)));
    };
    fit();
    window.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("resize", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("resize", fit);
    };
  }, [ref, ready]);
  return height;
}

/** A small menu of links and actions behind a "More" button. Closes on a choice, Escape or a click elsewhere. */
function More({ children, label = "More options" }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div className="cv-talk-more" ref={box}>
      <button type="button" className="cv-talk-iconbtn" aria-label={label} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="more" />
      </button>
      {open && (
        <div className="cv-talk-menu" onClick={(e) => (e.target as HTMLElement).closest("a,button") && setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

export function Talk() {
  const w = useWorkspace();
  const { cv, load, save, update, settle, current, undo, canUndo, paper, view, setView } = w;
  const word = docWord(cv?.region ?? "uk");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [about, setAbout] = useState<string | undefined>();
  const [step, setStep] = useState<string | undefined>();
  const [skipped, setSkipped] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [queued, setQueued] = useState<string[]>([]);
  const [mode, setMode] = useState<"ai" | "rules" | "off" | "">("");
  /** The passage marked on the page: one the person chose, or the newest change for a few seconds. */
  const [chosen, setChosen] = useState<{ turn: string; index: number; at: Locator } | null>(null);
  const [fresh, setFresh] = useState<Locator | null>(null);
  const [said, setSaid] = useState("");
  const [readAloud, setReadAloud] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [newBelow, setNewBelow] = useState(false);
  const queue = useRef<{ text: string; spoken: boolean }[]>([]);
  const running = useRef(false);
  const cvRef = useRef(cv);
  cvRef.current = cv;
  // The conversation as of the last reply. Messages queued behind one another each need the one before's answer,
  // before React has drawn it, so these are kept here as well as in state.
  const now = useRef<Kept>({ turns: [], skipped: [] });
  const setLog = useCallback((change: (all: Turn[]) => Turn[]) => {
    now.current = { ...now.current, turns: change(now.current.turns) };
    setTurns(now.current.turns);
  }, []);
  const setThread = useCallback((next: { about?: string; step?: string; skipped: string[] }) => {
    now.current = { ...now.current, ...next };
    setAbout(next.about);
    setStep(next.step);
    setSkipped(next.skipped);
  }, []);
  const page = useRef<HTMLDivElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  const atEnd = useRef(true);
  const input = useRef<HTMLTextAreaElement>(null);
  const started = useRef(false);
  const height = useFill(page, load === "ready");

  // The conversation so far, from this device; or a first question worked out from what the CV already has.
  useEffect(() => {
    if (!cv || started.current) return;
    started.current = true;
    const kept = readKept(cv.id);
    if (kept?.turns.length) {
      setLog(() => kept.turns);
      setThread({ about: kept.about, step: kept.step, skipped: kept.skipped ?? [] });
      return;
    }
    const first = nextStep(cv);
    setThread({ about: first.about, step: first.key, skipped: [] });
    setLog(() => [{ id: turnId(), who: "assistant", intro: true, text: "", ask: first.ask }]);
  }, [cv, setLog, setThread]);

  useEffect(() => {
    if (!cv || !started.current) return;
    try {
      localStorage.setItem(keyFor(cv.id), JSON.stringify({ turns: turns.slice(-80), about, step, skipped } satisfies Kept));
    } catch {
      /* kept on screen only */
    }
  }, [cv, turns, about, step, skipped]);

  useEffect(() => {
    if (!cv) return;
    api<{ mode: "ai" | "rules" | "off" }>(`/api/cv/versions/${cv.id}/talk`)
      .then((r) => setMode(r.mode))
      .catch(() => setMode(""));
  }, [cv?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      setReadAloud(localStorage.getItem(VOICE_KEY) === "1");
    } catch {
      /* off */
    }
  }, []);

  // The newest message comes into view, unless the person has scrolled up to read: then a button says there is more below.
  const toEnd = useCallback(() => {
    const el = thread.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    atEnd.current = true;
    setNewBelow(false);
  }, []);
  useEffect(() => {
    if (atEnd.current) toEnd();
    else setNewBelow(true);
  }, [turns, busy, toEnd]);
  const onScroll = () => {
    const el = thread.current;
    if (!el) return;
    atEnd.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    if (atEnd.current) setNewBelow(false);
  };

  // A new change is marked on the page for a few seconds; one the person chose stays marked.
  useEffect(() => {
    if (!fresh) return;
    const t = setTimeout(() => setFresh(null), 3000);
    return () => clearTimeout(t);
  }, [fresh]);

  /** Reads a reply aloud, in the interviewer's voice where it is available, otherwise the browser's own. */
  const speak = useCallback(async (text: string) => {
    if (!text) return;
    setSpeaking(true);
    try {
      const res = await fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text.slice(0, 1400), voice: "medium" }) });
      if (res.ok) {
        const url = URL.createObjectURL(await res.blob());
        await new Promise<void>((done) => {
          const audio = new Audio(url);
          audio.onended = audio.onerror = () => done();
          void audio.play().catch(() => done());
        });
        URL.revokeObjectURL(url);
      } else if (typeof window !== "undefined" && window.speechSynthesis) {
        await new Promise<void>((done) => {
          const u = new SpeechSynthesisUtterance(text);
          u.onend = u.onerror = () => done();
          window.speechSynthesis.speak(u);
        });
      }
    } catch {
      /* the reply is on screen */
    } finally {
      setSpeaking(false);
    }
  }, []);

  const send = useCallback(
    async (text: string, spoken: boolean) => {
      const doc = current() ?? cvRef.current;
      if (!doc) return;
      const { about: a, step: s, skipped: k, turns: before } = now.current;
      const words = before.filter((t) => t.who === "you").map((t) => t.text);
      const history = before.slice(-12).map((t) => ({ who: t.who, text: t.who === "assistant" ? [t.text, t.ask].filter(Boolean).join(" ") : t.text }));
      // A message sent again takes the place of the failed one: it isn't shown twice.
      setLog((all) => {
        const failed = all.findIndex((t) => t.retry && t.retry.text === text);
        return failed >= 0 ? all.filter((_, i) => i !== failed) : [...all, { id: turnId(), who: "you", text, spoken }];
      });
      atEnd.current = true;
      setBusy(true);
      try {
        // The assistant reads the CV as saved, so what is on screen is saved first.
        if (!(await settle())) throw new Error(`Your last change to this ${word} hasn’t saved yet, so I can’t add to it. Check you’re online, then send that again.`);
        const reply = await api<Reply>(`/api/cv/versions/${doc.id}/talk`, { method: "POST", json: { message: text, spoken, words, history, about: a, step: s, skipped: k } });
        // Applied to the CV as it is now, with the edits of any reply before this one that the screen hasn't drawn yet.
        const applied = applyOps(current() ?? doc, reply.ops, { spoken });
        if (applied.changes.length) update({ contact: applied.contact, sections: applied.sections, target: applied.target }, { step: true });
        const left = [...reply.left, ...applied.skipped.map((x) => ({ what: "one change", why: x.why }))];
        // The next question is worked out again here, from the CV as it now is: the server's copy of a new entry has
        // a different id from the one just made on screen, and the question names the entry by id.
        const nextAbout = reply.about ? (applied.refs[reply.about] ?? reply.about) : a;
        const local = nextStep({ ...(cvRef.current ?? doc), contact: applied.contact, sections: applied.sections, target: applied.target }, { skipped: reply.skipped, about: nextAbout });
        setThread({ about: nextAbout, step: local.key, skipped: reply.skipped });
        setLog((all) => [...all, { id: turnId(), who: "assistant", text: reply.say, ask: reply.ask, changes: applied.changes, left, tips: reply.tips, note: reply.note }]);
        const last = applied.changes[applied.changes.length - 1];
        if (last) {
          setChosen(null);
          setFresh(last.at);
        }
        const summary = applied.changes.length ? `${applied.changes.length === 1 ? "One change" : `${applied.changes.length} changes`}: ${applied.changes.map((c) => c.say).join(". ")}.` : reply.say;
        setSaid([summary, left.length ? `Left out: ${left.map((l) => `${l.what}. ${l.why}`).join(" ")}` : "", reply.ask].filter(Boolean).join(" "));
        if (readAloud) void speak([applied.changes.length ? `I made ${applied.changes.length === 1 ? "one change" : `${applied.changes.length} changes`}.` : reply.say, reply.ask].join(" "));
      } catch (err) {
        setLog((all) => [...all, { id: turnId(), who: "assistant", text: `${messageOf(err)} Nothing on your ${word} has changed.`, retry: { text, spoken } }]);
        setSaid(`Not sent. ${messageOf(err)}`);
      } finally {
        setBusy(false);
      }
    },
    [settle, update, current, word, readAloud, speak, setLog, setThread],
  );

  // One message at a time, in the order they were said: phrases spoken while a reply is on its way wait their turn.
  const say = useCallback(
    async (text: string, spoken: boolean) => {
      const t = text.trim();
      if (!t) return;
      queue.current.push({ text: t, spoken });
      setQueued(running.current ? queue.current.map((q) => q.text) : []);
      if (running.current) return;
      running.current = true;
      try {
        while (queue.current.length) {
          const next = queue.current.shift()!;
          setQueued(queue.current.map((q) => q.text));
          await send(next.text, next.spoken);
        }
      } finally {
        running.current = false;
        setQueued([]);
      }
    },
    [send],
  );

  const mic = useHandsFree(cv?.region ?? "uk", (text) => void say(text, true), speaking);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!draft.trim()) return;
    void say(draft, false);
    setDraft("");
    if (input.current) input.current.style.height = "";
  }
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }
  function grow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight + 2, 112)}px`;
  }

  const lastWithChanges = [...turns].reverse().find((t) => t.who === "assistant" && !t.retry && t.changes?.length);
  function undoTurn(t: Turn) {
    if (!undo()) return;
    setLog((all) => all.map((x) => (x.id === t.id ? { ...x, undone: true } : x)));
    setChosen(null);
    setFresh(null);
    setSaid(`Undone. Your ${word} is back to how it was before that reply.`);
  }
  function settleTip(t: Turn, tip: Tip, use: boolean) {
    setLog((all) => all.map((x) => (x.id === t.id ? { ...x, tips: (x.tips ?? []).filter((y) => y.word !== tip.word) } : x)));
    if (use) void say(swapMessage(tip.plainer, tip.word), false);
  }
  function startAgain() {
    if (!window.confirm(`Start a new conversation? Everything on your ${word} stays as it is.`)) return;
    mic.stop();
    queue.current = [];
    setQueued([]);
    if (!cv) return;
    const first = nextStep(current() ?? cv);
    setThread({ about: first.about, step: first.key, skipped: [] });
    setLog(() => [{ id: turnId(), who: "assistant", intro: true, text: "", ask: first.ask }]);
    setChosen(null);
  }
  function showChange(t: Turn, index: number, c: Change) {
    setChosen({ turn: t.id, index, at: { ...c.at } });
    setFresh(null);
    if (window.matchMedia("(max-width: 1099px)").matches) setView("paper");
  }
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  function onTabKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next = view === "paper" ? "edit" : "paper";
    setView(next);
    tabs.current[next === "paper" ? 1 : 0]?.focus();
  }

  const crumbs = [{ label: "CVs and letters", href: "/cv" }, { label: cv?.name ?? word, href: cv ? `/cv/v/${cv.id}/edit/contact` : undefined }, { label: "Talk it through" }];
  if (load === "loading" || !cv)
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area" aria-busy={load === "loading"} aria-label={`Loading your ${word}`}>
          {load === "loading" ? <Skeleton height={420} /> : <p className="cv-issue" role="alert">This {word} couldn’t be loaded.</p>}
        </div>
      </CvScreen>
    );

  /* ----------------------------------------------------------- what to show */

  const stages = stagesFor(cv);
  const stageKey = stageOf(step ?? "target");
  const done = stageKey === "done";
  const stageIndex = done ? stages.length : Math.max(0, stages.findIndex((x) => x.key === stageKey));
  const stageName = done ? "All steps covered" : (stages[stageIndex]?.name ?? "");
  const lines = cv.sections.reduce((n, s) => n + (s.visible && isEntrySection(s) ? s.entries.reduce((m, e) => m + (e.visible ? e.bullets.filter((b) => b.visible && b.text.trim()).length : 0), 0) : 0), 0);
  const marked = chosen?.at ?? fresh;
  const saveWords = save === "saved" ? "Saved" : SAVE_WORDS[save];

  const micUnavailable = mic.unavailable || (mic.state === "off" && !!mic.note);
  const dock: { title: string; caption: string; status: string; icon: IconName; tone: string } = speaking
    ? { title: "Reading the reply aloud", caption: "Listening starts again when it finishes.", status: "Paused", icon: "stop", tone: "on" }
    : mic.state === "asking"
      ? { title: "Allow microphone access", caption: "Choose Allow in your browser.", status: "Waiting", icon: "clock", tone: "warn" }
      : mic.state === "hearing"
        ? { title: "Hearing you", caption: "Keep talking. Pause and I’ll take what you said.", status: "", icon: "stop", tone: "on" }
        : mic.state === "working"
          ? { title: "Writing it down", caption: "Turning what you said into text.", status: "On", icon: "stop", tone: "on" }
          : mic.state === "listening"
            ? { title: "Listening", caption: "Speak naturally. Pause and I’ll take what you said.", status: "On", icon: "stop", tone: "on" }
            : micUnavailable
              ? { title: "Microphone unavailable", caption: mic.note || "You can still type your answer.", status: "Off", icon: "mute", tone: "warn" }
              : { title: "Talk hands-free", caption: "Speak instead of typing. Pause and I’ll take what you said.", status: "Off", icon: "mic", tone: "off" };
  const bars = [0.35, 0.7, 1, 0.55, 0.95, 0.75, 0.4].map((k) => 4 + Math.round(k * Math.min(1, mic.level * 9) * 22));

  const intro = (
    <div className="cv-talk-intro">
      <h3>Build your {word} by talking</h3>
      <p>One question at a time. Your {word} takes shape beside you as you answer.</p>
      <ul>
        <li>
          <Icon name="mic" /> Speak or type your answers
        </li>
        <li>
          <Icon name="shield" /> Only what you tell me goes on it. I ask for a number rather than guess one.
        </li>
        <li>
          <Icon name="undo" /> Every change is listed, and you can undo it
        </li>
      </ul>
    </div>
  );

  const question = (ask: string) => {
    const { question: q, hint } = splitAsk(ask);
    return (
      <div className="cv-talk-question">
        <span className="cv-talk-qlabel">Next question</span>
        <p className="cv-talk-q">{q}</p>
        {hint && <p className="cv-talk-hint">{hint}</p>}
      </div>
    );
  };

  const assistantTurn = (t: Turn) => {
    if (t.intro)
      return (
        <li key={t.id} className="cv-talk-assistant" data-testid="msg-assistant">
          <span className="sr-only">Assistant: </span>
          {intro}
          {t.ask && question(t.ask)}
        </li>
      );
    if (t.retry)
      return (
        <li key={t.id} className="cv-talk-failed" data-testid="msg-assistant">
          <p role="alert">
            <strong>Not sent.</strong> {t.text}
          </p>
          {t === turns[turns.length - 1] && (
            <Btn className="cv-talk-retry" onClick={() => void say(t.retry!.text, t.retry!.spoken)} disabled={busy}>
              <Icon name="undo" /> Send again
            </Btn>
          )}
        </li>
      );
    const changes = t.changes ?? [];
    const n = changes.length;
    return (
      <li key={t.id} className="cv-talk-assistant" data-testid="msg-assistant">
        <div className="cv-talk-label">
          <Icon name="wave" /> <span>CV assistant</span>
        </div>
        <div className="cv-talk-reply" data-undone={t.undone ? "true" : undefined}>
          {t.note && (
            <p className="cv-talk-callout" data-tone="note">
              <Icon name="info" /> {t.note}
            </p>
          )}
          {n > 0 ? (
            <>
              <div className="cv-talk-changeshead">
                <span>
                  <Icon name={t.undone ? "undo" : "check"} /> {n === 1 ? "1 change" : `${n} changes`} {t.undone ? "undone" : "made"}
                </span>
                {!t.undone && <span className="cv-talk-subtle">Select one to see it on the page</span>}
              </div>
              <ul className="cv-talk-changes" aria-label="Changes made">
                {changes.map((c, i) => (
                  <li key={i}>
                    <button type="button" className="cv-talk-change" aria-current={chosen?.turn === t.id && chosen.index === i ? "true" : undefined} disabled={t.undone} onClick={() => showChange(t, i, c)}>
                      <Icon name={KIND_ICON[c.kind] ?? "plus"} className="cv-talk-kind" />
                      <span className="cv-talk-changetext">
                        <b>
                          {c.kind}
                          {c.where ? ` · ${c.where}` : ""}
                        </b>
                        <span>{c.text}</span>
                      </span>
                      {!t.undone && <Icon name="chev" className="cv-talk-chev" />}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>{t.text}</p>
          )}
          {!!t.left?.length && (
            <div className="cv-talk-callout" data-tone="warn">
              <strong>
                <Icon name="shield" /> Left out · {t.left.length === 1 ? "1 detail" : `${t.left.length} details`}
              </strong>
              <ul>
                {t.left.map((l, i) => (
                  <li key={i}>
                    {l.what}: {l.why}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!t.undone &&
            t.tips?.map((tip) => (
              <div key={tip.word} className="cv-talk-callout" data-tone="note">
                <strong>
                  <Icon name="bulb" /> Plain-word tip
                </strong>
                <span>
                  You said “{tip.word}”. A plainer word is “{tip.plainer}”: screening software and recruiters read plain words best. Your word stays unless you choose.
                </span>
                <span className="cv-row" style={{ gap: 8 }}>
                  <Btn onClick={() => settleTip(t, tip, true)} disabled={busy}>
                    Use “{tip.plainer}”
                  </Btn>
                  <Btn kind="quiet" onClick={() => settleTip(t, tip, false)}>
                    Keep mine
                  </Btn>
                </span>
              </div>
            ))}
          {n > 0 && (
            <div className="cv-talk-replyfoot">
              {t.undone ? (
                <p className="cv-talk-subtle" role="status">
                  <Icon name="undo" /> Undone. Your {word} is back to how it was before this reply. What you said is still here.
                </p>
              ) : t === lastWithChanges && canUndo ? (
                <Btn kind="quiet" onClick={() => undoTurn(t)} disabled={busy}>
                  <Icon name="undo" /> Undo these changes
                </Btn>
              ) : (
                <span />
              )}
              {!t.undone && <span className="cv-talk-subtle">On your {word}</span>}
            </div>
          )}
        </div>
        {t.ask && question(t.ask)}
      </li>
    );
  };

  const moreItems = (
    <>
      <Link href={`/cv/v/${cv.id}/edit/contact`} className="cv-talk-phoneonly">
        Open the form
      </Link>
      <Link href={`/cv/v/${cv.id}/findings`} className="cv-talk-phoneonly">
        {scoreLabel(w.score, word)}
      </Link>
      <Link href={`/cv/v/${cv.id}/software/pdf`}>See what screening software reads</Link>
      <Link href={`/cv/v/${cv.id}/edit/finish`}>Check and download</Link>
      <button type="button" className="cv-talk-phoneonly" onClick={startAgain} disabled={busy}>
        Start again
      </button>
    </>
  );

  return (
    <CvScreen>
      <div className="cv-talk-page" ref={page} style={height ? { height } : undefined}>
        <div className="cv-talk-desktopbar">
          <Bar crumbs={crumbs}>
            <small role="status" data-testid="save-state" data-save={save}>
              {saveWords}
            </small>
            {w.score && !w.score.empty && (
              <Link className="cv-talk-score" href={`/cv/v/${cv.id}/findings`}>
                {scoreLabel(w.score, word)}
              </Link>
            )}
            <Link className="cv-btn" href={`/cv/v/${cv.id}/edit/contact`}>
              Open the form
            </Link>
            <More>{moreItems}</More>
          </Bar>
        </div>
        <header className="cv-talk-phonebar">
          <Link href="/cv" className="cv-talk-iconbtn" aria-label="Back to your CVs and letters">
            <Icon name="back" />
          </Link>
          <div className="cv-talk-phonetitle">
            <b>Talk it through</b>
            <span>{cv.name}</span>
          </div>
          <small className="cv-talk-saved" aria-hidden="true">
            {save === "saved" && <Icon name="check" />}
              {saveWords}
          </small>
          <More>{moreItems}</More>
        </header>
        <h1 className="sr-only">Talk it through: {cv.name}</h1>
        <Announce>{said}</Announce>

        <div className="cv-talk-tabs" role="tablist" aria-label="Show" onKeyDown={onTabKey}>
          <button type="button" role="tab" id="talk-tab-chat" aria-controls="talk-chat" aria-selected={view !== "paper"} tabIndex={view !== "paper" ? 0 : -1} onClick={() => setView("edit")} ref={(el) => void (tabs.current[0] = el)}>
            <Icon name="chat" /> Chat
          </button>
          <button type="button" role="tab" id="talk-tab-paper" aria-controls="talk-paper" aria-selected={view === "paper"} tabIndex={view === "paper" ? 0 : -1} onClick={() => setView("paper")} ref={(el) => void (tabs.current[1] = el)}>
            <Icon name="doc" /> Paper
            {lines > 0 && <span className="cv-talk-count">{lines === 1 ? "1 line" : `${lines} lines`}</span>}
          </button>
        </div>

        <div className="cv-talk-split" data-tab={view === "paper" ? "paper" : "chat"}>
          <section className="cv-talk-chat" id="talk-chat" aria-label="Conversation">
            <div className="cv-talk-head">
              <div className="cv-talk-headrow">
                <span className="cv-talk-mark" aria-hidden="true">
                  <Icon name="wave" />
                </span>
                <div className="grow min-w-0">
                  <h2>Talk it through</h2>
                  <p className="cv-talk-subtle">
                    {mode === "ai"
                      ? `Your ${word} assistant. Every edit is checked against what you said.`
                      : mode === "rules"
                        ? "Test mode: lines are made from your own sentences, by rule."
                        : mode === "off"
                          ? "The AI service isn’t set up here, so lines are made from your own sentences, by rule."
                          : `Your ${word} assistant`}
                  </p>
                </div>
                <Btn kind="quiet" onClick={startAgain} disabled={busy}>
                  <Icon name="undo" /> Start again
                </Btn>
              </div>
              <div className="cv-talk-step">
                <span>{done ? "Done" : `Step ${stageIndex + 1} of ${stages.length}`}</span>
                <b>{stageName}</b>
                <span className="cv-talk-progress" role="img" aria-label={done ? "All steps covered" : `Step ${stageIndex + 1} of ${stages.length}: ${stageName}`}>
                  {stages.map((x, i) => (
                    <span key={x.key} data-done={i < stageIndex + (done ? 0 : 1) ? "true" : undefined} />
                  ))}
                </span>
              </div>
            </div>

            <div className="cv-talk-thread" ref={thread} onScroll={onScroll} tabIndex={0} aria-label="Conversation history">
              <ol aria-label="Messages" data-testid="talk-log">
                {turns.map((t) =>
                  t.who === "you" ? (
                    <li key={t.id} className="cv-talk-person" data-testid="msg-you">
                      <span className="sr-only">You said: </span>
                      {t.text}
                      {t.spoken && <small> · spoken</small>}
                    </li>
                  ) : (
                    assistantTurn(t)
                  ),
                )}
                {busy && (
                  <li className="cv-talk-working" aria-busy="true">
                    <span className="cv-talk-dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    Writing your {word}…
                  </li>
                )}
              </ol>
              {newBelow && (
                <button type="button" className="cv-talk-newreply" onClick={toEnd}>
                  <Icon name="down" /> New reply
                </button>
              )}
            </div>

            <form className="cv-talk-composer" onSubmit={submit}>
              {queued.map((q, i) => (
                <p key={i} className="cv-talk-queued" role="status">
                  <Icon name="clock" /> Waiting to send: “{q}”
                </p>
              ))}
              <div className="cv-talk-voice" data-tone={dock.tone}>
                <button
                  type="button"
                  className="cv-talk-mic"
                  aria-pressed={mic.on}
                  aria-label={mic.on ? "Stop hands-free" : "Start hands-free"}
                  disabled={mic.state === "asking" || mic.unavailable}
                  onClick={() => (mic.on ? mic.stop() : void mic.start())}
                  data-testid="talk-mic"
                >
                  <Icon name={dock.icon} />
                </button>
                <div className="cv-talk-voicecopy" role="status">
                  <b>{dock.title}</b>
                  <span>{dock.caption}</span>
                </div>
                {mic.state === "hearing" && !speaking ? (
                  <span className="cv-talk-meter" role="img" aria-label="Speech detected">
                    {bars.map((h, i) => (
                      <i key={i} style={{ height: h }} />
                    ))}
                  </span>
                ) : (
                  <span className="cv-talk-voicestatus">{dock.status}</span>
                )}
              </div>
              <div className="cv-talk-inputrow">
                <label className="sr-only" htmlFor="cv-talk-input">
                  Your answer
                </label>
                <textarea
                  id="cv-talk-input"
                  ref={input}
                  rows={1}
                  maxLength={20000}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    grow(e.target);
                  }}
                  onKeyDown={onKey}
                  placeholder={mic.on ? "Talking hands-free. You can type here too." : "Type your answer…"}
                />
                <button type="submit" className="cv-talk-send" aria-label="Send answer" disabled={!draft.trim()}>
                  <Icon name="send" />
                </button>
              </div>
              <div className="cv-talk-foot">
                <span className="cv-talk-keyhint">Enter to send · Shift + Enter for a new line</span>
                <label className="cv-talk-check">
                  <input
                    type="checkbox"
                    checked={readAloud}
                    onChange={(e) => {
                      setReadAloud(e.target.checked);
                      try {
                        localStorage.setItem(VOICE_KEY, e.target.checked ? "1" : "0");
                      } catch {
                        /* this visit only */
                      }
                    }}
                  />
                  Read replies aloud
                </label>
              </div>
            </form>
          </section>

          <section className="cv-talk-preview" id="talk-paper" aria-label={`Your ${word} on paper`}>
            <div className="cv-talk-previewhead">
              <h2>
                <Icon name="doc" /> Live {word} <span className="cv-talk-subtle">· {cv.design.pageSize === "letter" ? "Letter" : "A4"}</span>
              </h2>
              <span className="cv-talk-saved">
                {save === "saved" ? (
                  <>
                    <Icon name="check" /> Up to date
                  </>
                ) : (
                  SAVE_WORDS[save]
                )}
              </span>
            </div>
            <div className="cv-talk-paper">
              <PaperView paper={paper} state={w.state} retry={w.retryPaper} cv={cv} focus={marked} word={word}>
                {w.score && !w.score.empty && w.score.missing.length > 0 && (
                  <p className="cv-talk-callout" data-tone="note" style={{ marginBottom: 10 }}>
                    <Icon name="info" /> Still needed: {w.score.missing.slice(0, 3).join("; ")}.
                  </p>
                )}
              </PaperView>
            </div>
          </section>
        </div>
      </div>
    </CvScreen>
  );
}
