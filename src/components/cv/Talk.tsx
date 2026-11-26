"use client";

import { type FormEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { type Change, type Op, applyOps } from "@/lib/cv/agent/ops";
import { nextStep } from "@/lib/cv/agent/plan";
import type { Locator } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { api, messageOf } from "./client";
import { scoreLabel } from "./Findings";
import { PaperView } from "./Paper";
import { Announce, Bar, Btn, BtnLink, CvScreen, Skeleton } from "./ui";
import { SAVE_WORDS } from "./useCv";
import { useHandsFree } from "./useHandsFree";
import { useWorkspace } from "./Workspace";

/**
 * Building a CV by talking it through. The person says or types what they
 * did; the assistant edits the CV beside them as they go and asks for the
 * next thing it needs. Every edit has been checked against their own words
 * before it arrives (see `lib/cv/agent`), each turn's edits are one step of
 * Undo, and every change is listed under the reply that made it.
 *
 * The conversation is kept on this device only. The CV keeps what matters
 * from it: each line it added carries the words it was made from.
 */

interface Left {
  what: string;
  why: string;
}
interface Turn {
  id: string;
  who: "you" | "assistant";
  text: string;
  spoken?: boolean;
  ask?: string;
  changes?: Change[];
  left?: Left[];
  tips?: string[];
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
  tips: string[];
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
  const [mode, setMode] = useState<"ai" | "rules" | "off" | "">("");
  const [focusAt, setFocusAt] = useState<Locator | null>(null);
  const [said, setSaid] = useState("");
  const [readAloud, setReadAloud] = useState(false);
  const [speaking, setSpeaking] = useState(false);
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
  const log = useRef<HTMLOListElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const started = useRef(false);

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
    setLog(() => [
      {
        id: turnId(),
        who: "assistant",
        text: `I’ll build your ${word} with you as you talk. Everything I write comes from what you tell me: I’ll ask for a number or a detail rather than guess one, and you can undo any change.`,
        ask: first.ask,
      },
    ]);
  }, [cv, word, setLog, setThread]);

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

  // The newest message is kept in view, inside the conversation's own scrolling area.
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, busy]);

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
      setLog((all) => [...all.filter((t) => !t.retry || t.retry.text !== text), { id: turnId(), who: "you", text, spoken }]);
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
        if (last) setFocusAt(last.at);
        setSaid([reply.say, ...applied.changes.map((c) => `${c.say}.`), reply.ask].join(" "));
        if (readAloud) void speak(`${reply.say} ${reply.ask}`);
      } catch (err) {
        setLog((all) => [...all, { id: turnId(), who: "assistant", text: `${messageOf(err)} Nothing on your ${word} has changed.`, retry: { text, spoken } }]);
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
      if (running.current) return;
      running.current = true;
      try {
        while (queue.current.length) {
          const next = queue.current.shift()!;
          await send(next.text, next.spoken);
        }
      } finally {
        running.current = false;
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
  }
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  const lastWithChanges = [...turns].reverse().find((t) => t.who === "assistant" && t.changes?.length);
  function undoTurn(t: Turn) {
    if (!undo()) return;
    setLog((all) => all.map((x) => (x.id === t.id ? { ...x, undone: true } : x)));
    setSaid("Undone. Those changes are off your CV.");
  }
  function startAgain() {
    mic.stop();
    queue.current = [];
    if (!cv) return;
    const first = nextStep(cv);
    setThread({ about: first.about, step: first.key, skipped: [] });
    setLog(() => [{ id: turnId(), who: "assistant", text: `Starting a new conversation. Everything already on your ${word} stays.`, ask: first.ask }]);
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

  const micLabel = mic.state === "asking" ? "Asking for the microphone…" : mic.on ? "Stop listening" : "Talk hands-free";
  const micStatus = speaking ? "Reading the reply aloud…" : mic.state === "hearing" ? "Hearing you…" : mic.state === "working" ? "Writing down what you said…" : mic.state === "listening" ? "Listening. Pause and I’ll take what you said." : "";

  return (
    <CvScreen>
      <Bar crumbs={crumbs}>
        <small role="status" data-testid="save-state" data-save={save}>
          {SAVE_WORDS[save]}
        </small>
        {w.score && !w.score.empty && (
          <BtnLink kind="quiet" href={`/cv/v/${cv.id}/findings`}>
            {scoreLabel(w.score, word)}
          </BtnLink>
        )}
        <BtnLink href={`/cv/v/${cv.id}/edit/contact`}>Open the form</BtnLink>
      </Bar>
      <div className="cv-area">
        <h1 className="sr-only">Talk it through: {cv.name}</h1>
        <Announce>{said}</Announce>

        <div className="cv-seg cv-narrow" role="group" aria-label="Show">
          <button type="button" aria-pressed={view === "edit"} onClick={() => setView("edit")}>
            Chat
          </button>
          <button type="button" aria-pressed={view === "paper"} onClick={() => setView("paper")}>
            Paper
          </button>
        </div>

        <div className="cv-layout" style={{ gridTemplateColumns: "minmax(0, 560fr) minmax(0, 608fr)" }}>
          <section className={view === "edit" ? "min-w-0 cv-talk" : "min-w-0 cv-talk cv-wide"} aria-label="Conversation">
            <div className="cv-talk-head">
              <div>
                <h2>Talk it through</h2>
                <p className="cv-muted">
                  {mode === "ai"
                    ? "Writes in plain words for screening software and recruiters. Every edit is checked against what you said."
                    : mode === "rules"
                      ? "Test mode: lines are made from your own sentences, by rule."
                      : mode === "off"
                        ? "The AI service isn’t set up here, so lines are made from your own sentences, by rule."
                        : "Every edit is checked against what you said."}
                </p>
              </div>
              <Btn kind="quiet" onClick={startAgain} disabled={busy}>
                Start again
              </Btn>
            </div>

            <ol ref={log} className="cv-talk-log" aria-label="Messages" data-testid="talk-log" tabIndex={0}>
              {turns.map((t) => (
                <li key={t.id} className="cv-msg" data-who={t.who} data-testid={t.who === "you" ? "msg-you" : "msg-assistant"}>
                  <span className="sr-only">{t.who === "you" ? "You said" : "Assistant"}: </span>
                  {t.who === "you" ? (
                    <p>
                      {t.text}
                      {t.spoken && <small className="cv-msg-tag"> · spoken</small>}
                    </p>
                  ) : (
                    <>
                      {t.note && <p className="cv-msg-note">{t.note}</p>}
                      <p>{t.text}</p>
                      {!!t.changes?.length && (
                        <ul className="cv-msg-changes" aria-label="Changes made" data-undone={t.undone ? "true" : undefined}>
                          {t.changes.map((c, i) => (
                            <li key={i}>
                              <button type="button" className="cv-link" onClick={() => (setFocusAt({ ...c.at }), setView("paper"))} disabled={t.undone}>
                                {c.say}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {t.undone && <p className="cv-muted">Undone.</p>}
                      {!!t.left?.length && (
                        <details className="cv-msg-left">
                          <summary>Left out ({t.left.length})</summary>
                          <ul>
                            {t.left.map((l, i) => (
                              <li key={i}>
                                {l.what}: {l.why}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                      {t.tips?.map((tip, i) => (
                        <p key={i} className="cv-msg-note">
                          {tip}
                        </p>
                      ))}
                      {t.ask && <p className="cv-msg-ask">{t.ask}</p>}
                      <div className="cv-row" style={{ gap: 8 }}>
                        {t === lastWithChanges && !t.undone && canUndo && (
                          <Btn onClick={() => undoTurn(t)} disabled={busy}>
                            Undo these changes
                          </Btn>
                        )}
                        {t.retry && t === turns[turns.length - 1] && (
                          <Btn onClick={() => void say(t.retry!.text, t.retry!.spoken)} disabled={busy}>
                            Send again
                          </Btn>
                        )}
                      </div>
                    </>
                  )}
                </li>
              ))}
              {busy && (
                <li className="cv-msg cv-msg-busy" data-who="assistant" aria-busy="true">
                  <span className="sr-only">The assistant is </span>writing…
                </li>
              )}
            </ol>

            <form className="cv-talk-compose" onSubmit={submit}>
              <label className="sr-only" htmlFor="cv-talk-input">
                Your message
              </label>
              <textarea
                id="cv-talk-input"
                ref={input}
                className="cv-input"
                rows={3}
                maxLength={20000}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                placeholder={mic.on ? "Talking hands-free. You can type here too." : "Type what you did, in your own words. Enter sends."}
              />
              <div className="cv-row" style={{ gap: 8 }}>
                <Btn kind="primary" type="submit" disabled={!draft.trim()}>
                  Send
                </Btn>
                {!mic.unavailable && (
                  <Btn onClick={() => (mic.on ? mic.stop() : void mic.start())} aria-pressed={mic.on} disabled={mic.state === "asking"} data-testid="talk-mic">
                    {micLabel}
                  </Btn>
                )}
                {mic.on && (
                  <span className="cv-level" aria-hidden="true">
                    <span style={{ transform: `scaleX(${Math.min(1, mic.level * 8)})` }} />
                  </span>
                )}
                <label className="cv-check cv-push">
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
                  />{" "}
                  Read replies aloud
                </label>
              </div>
              {(micStatus || mic.note) && (
                <p className={mic.note ? "cv-note" : "cv-muted"} role="status">
                  {mic.note || micStatus}
                </p>
              )}
            </form>
          </section>

          <aside className={view === "paper" ? "cv-sticky min-w-0" : "cv-sticky min-w-0 cv-wide"} aria-label="Paper">
            <PaperView paper={paper} state={w.state} retry={w.retryPaper} cv={cv} focus={focusAt} word={word}>
              {w.score && !w.score.empty && w.score.missing.length > 0 && (
                <div className="cv-note" style={{ marginBottom: 10 }}>
                  Still needed: {w.score.missing.slice(0, 3).join("; ")}.
                </div>
              )}
            </PaperView>
            <div className="cv-row" style={{ marginTop: 12, gap: 8 }}>
              <BtnLink href={`/cv/v/${cv.id}/software/pdf`}>See what screening software reads</BtnLink>
              <BtnLink href={`/cv/v/${cv.id}/edit/finish`}>Check and download</BtnLink>
            </div>
          </aside>
        </div>
      </div>
    </CvScreen>
  );
}
