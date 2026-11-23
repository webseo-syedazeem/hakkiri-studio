"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { addBullets } from "@/lib/cv/edit";
import { type Bullet, type Excerpt, isEntrySection, newId } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { ApiError, api, messageOf } from "./client";
import { Bar, Btn, BtnLink, CvScreen, Field, Panel, Skeleton, Toolbar } from "./ui";
import { useWorkspace } from "./Workspace";

/**
 * "Tell me what you did": three questions about one role, answered in the
 * person's own words, typed or spoken. Their answers become proposed bullets,
 * each shown beside the exact words it came from. They choose which to keep.
 * With no answers there is nothing to draft from, and nothing is drafted.
 */

interface Proposed {
  text: string;
  quotes: string[];
  use: boolean;
}
type Answers = { did: string; changed: string; number: string };
const QUESTIONS: { key: keyof Answers; label: string; rule: string }[] = [
  { key: "did", label: "What were you responsible for?", rule: "Say it as you would to a friend. Full sentences help." },
  { key: "changed", label: "What changed because of your work?", rule: "What was different afterwards: for customers, the team, the numbers." },
  { key: "number", label: "Is there a number you can stand behind?", rule: "Roughly how many, how much, how long. Leave it empty if you don’t know: we never supply one." },
];
type Recording = "" | "asking" | "recording" | "transcribing";

export function Capture({ itemId }: { itemId: string }) {
  const router = useRouter();
  const w = useWorkspace();
  const { cv, load, update, flush, setOpenEntry } = w;
  const [answers, setAnswers] = useState<Answers>({ did: "", changed: "", number: "" });
  const [title, setTitle] = useState("");
  const [org, setOrg] = useState("");
  const [mode, setMode] = useState<"type" | "speak">("type");
  const [spoken, setSpoken] = useState(false);
  const [rec, setRec] = useState<{ key: keyof Answers; state: Recording } | null>(null);
  const [voiceNote, setVoiceNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [proposed, setProposed] = useState<Proposed[] | null>(null);
  const [by, setBy] = useState<"ai" | "rules">("rules");
  const [note, setNote] = useState("");
  const [toBank, setToBank] = useState(true);
  const recorder = useRef<MediaRecorder | null>(null);
  const key = `hakkiri.cv.capture.${w.versionId}.${itemId}`;

  // Notes are kept on this device until they are used, so a failed draft or a closed tab loses nothing.
  useEffect(() => {
    try {
      const kept = JSON.parse(localStorage.getItem(key) ?? "null") as (Answers & { title?: string; org?: string }) | null;
      if (kept) {
        setAnswers({ did: kept.did ?? "", changed: kept.changed ?? "", number: kept.number ?? "" });
        setTitle(kept.title ?? "");
        setOrg(kept.org ?? "");
      }
    } catch {
      /* nothing kept */
    }
  }, [key]);
  useEffect(() => {
    try {
      if (answers.did || answers.changed || answers.number || title || org) localStorage.setItem(key, JSON.stringify({ ...answers, title, org }));
    } catch {
      /* not kept */
    }
  }, [answers, title, org, key]);
  useEffect(() => () => recorder.current?.stream.getTracks().forEach((t) => t.stop()), []);

  const crumbs = [{ label: "CVs and letters", href: "/cv" }, { label: cv?.name ?? "CV", href: `/cv/v/${w.versionId}/edit/experience` }, { label: "Tell me what you did" }];
  if (load === "loading")
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area" aria-busy="true" aria-label="Loading your CV">
          <Skeleton height={320} />
        </div>
      </CvScreen>
    );
  if (load !== "ready" || !cv)
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area">
          <Toolbar title="CV not found" subtitle="It may have been deleted, or it belongs to another account.">
            <BtnLink href="/cv">Back to your CVs</BtnLink>
          </Toolbar>
        </div>
      </CvScreen>
    );

  const home = cv.sections.find((s) => isEntrySection(s) && s.entries.some((e) => e.id === itemId));
  const entry = home && isEntrySection(home) ? home.entries.find((e) => e.id === itemId) : undefined;
  const isNew = itemId === "new";
  const section = home ?? cv.sections.find((s) => s.kind === "experience");
  const back = `/cv/v/${cv.id}/edit/${section?.kind === "experience" || !section ? "experience" : section.kind === "custom" ? section.id : section.kind}`;
  if (!isNew && !entry)
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area">
          <Toolbar title="That entry isn’t in this CV" subtitle="It may have been removed.">
            <BtnLink href={back}>Back to the builder</BtnLink>
          </Toolbar>
        </div>
      </CvScreen>
    );
  const role = { title: entry?.title ?? title, org: entry?.org ?? org };
  const set = (k: keyof Answers, v: string) => setAnswers((a) => ({ ...a, [k]: v }));
  const hasNotes = !!(answers.did.trim() || answers.changed.trim());

  async function record(k: keyof Answers) {
    setVoiceNote("");
    if (rec?.state === "recording") return recorder.current?.stop();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMode("type");
      return setVoiceNote("This browser can’t record. Type your answer instead.");
    }
    setRec({ key: k, state: "asking" });
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setRec(null);
      setMode("type");
      return setVoiceNote("The microphone isn’t available, so type your answer instead. You can allow the microphone in your browser’s settings.");
    }
    const chunks: Blob[] = [];
    const r = new MediaRecorder(stream);
    recorder.current = r;
    r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    r.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      setRec({ key: k, state: "transcribing" });
      try {
        const form = new FormData();
        form.set("audio", new Blob(chunks, { type: r.mimeType || "audio/webm" }));
        form.set("region", cv!.region);
        const res = await fetch("/api/cv/transcribe", { method: "POST", body: form });
        const body = (await res.json().catch(() => ({}))) as { text?: string; message?: string };
        if (!res.ok || !body.text) throw new ApiError(res.status, body.message ?? "The recording couldn’t be turned into text. Try again, or type your answer.");
        // What was said is added to the answer for the person to read and correct. Nothing is drafted until they have.
        setAnswers((a) => ({ ...a, [k]: [a[k].trim(), body.text].filter(Boolean).join(" ") }));
        setSpoken(true);
        setVoiceNote("Here is what we heard. Read it and correct anything that’s wrong before you carry on.");
      } catch (err) {
        if (err instanceof ApiError && err.status === 501) setMode("type");
        setVoiceNote(messageOf(err));
      } finally {
        setRec(null);
      }
    };
    r.start();
    setRec({ key: k, state: "recording" });
  }

  async function draft() {
    setProblem("");
    setNote("");
    if (!hasNotes) return setProblem("Answer at least one of the first two questions. There is nothing to write from yet.");
    if (isNew && !title.trim()) return setProblem("Add the job title this is about.");
    setBusy(true);
    try {
      const r = await api<{ by: "ai" | "rules"; bullets: { text: string; quotes: string[] }[]; note?: string }>(`/api/cv/versions/${cv!.id}/write/bullets`, { method: "POST", json: { ...answers, title: role.title, org: role.org } });
      setProposed(r.bullets.map((b) => ({ ...b, use: true })));
      setBy(r.by);
      setNote(r.note ?? "");
      if (!r.bullets.length) setProblem("We couldn’t find a full sentence to make a bullet from. Add a little more to your answers.");
    } catch (err) {
      // The answers stay exactly as they are.
      setProblem(messageOf(err));
    } finally {
      setBusy(false);
    }
  }

  async function accept() {
    const chosen = (proposed ?? []).filter((p) => p.use && p.text.trim());
    if (!chosen.length || !section) return;
    setBusy(true);
    setProblem("");
    try {
      const kind: Excerpt["kind"] = spoken ? "spoken" : "typed";
      const bullets: Bullet[] = [];
      for (const p of chosen) {
        const text = p.text.replace(/\s+/g, " ").trim();
        const sources: Excerpt[] = p.quotes.slice(0, 6).map((q) => ({ kind, ref: "notes", text: q }));
        let bankId: string | undefined;
        if (toBank) bankId = (await api<{ achievement: { id: string } }>("/api/cv/bank", { method: "POST", json: { text, original: p.quotes.join("\n"), sources, role: role.title, org: role.org } })).achievement.id;
        bullets.push({ id: newId("b_"), text, visible: true, origin: by === "ai" ? "assisted" : spoken ? "spoken" : "typed", sources, bankId });
      }
      const out = addBullets(cv!.sections, section.id, itemId, bullets, isNew ? { title: title.trim(), org: org.trim() } : undefined);
      update({ sections: out.sections });
      setOpenEntry(section.id, out.entryId);
      try {
        localStorage.removeItem(key);
      } catch {
        /* nothing kept */
      }
      await flush();
      router.push(back);
    } catch (err) {
      setProblem(messageOf(err));
      setBusy(false);
    }
  }

  const word = docWord(cv.region);
  const picked = (proposed ?? []).filter((p) => p.use && p.text.trim()).length;
  return (
    <CvScreen>
      <Bar crumbs={crumbs}>
        <BtnLink href={back}>Back to the builder</BtnLink>
      </Bar>
      <div className="cv-area">
        <Toolbar eyebrow={[role.title, role.org].filter(Boolean).join(" · ") || "A new role"} title="Tell me what you did" subtitle={`Three questions, answered in your own words. Your ${word} is written from what you say here, and from nothing else.`} />
        <div className="cv-layout" style={{ gridTemplateColumns: "minmax(0, 648fr) minmax(0, 520fr)" }}>
          <Panel title="Your answers" aside={
            <div className="cv-seg" role="group" aria-label="How to answer">
              <button type="button" aria-pressed={mode === "type"} onClick={() => setMode("type")}>
                Type
              </button>
              <button type="button" aria-pressed={mode === "speak"} onClick={() => (setMode("speak"), setVoiceNote(""))}>
                Speak
              </button>
            </div>
          }>
            <div className="cv-pad cv-stack">
              {isNew && (
                <div className="cv-pair">
                  <Field label="Job title" value={title} onChange={setTitle} maxLength={160} />
                  <Field label="Employer" value={org} onChange={setOrg} maxLength={160} />
                </div>
              )}
              {voiceNote && (
                <p className="cv-note" role="status" data-testid="voice-note">
                  {voiceNote}
                </p>
              )}
              {QUESTIONS.map((qn) => (
                <div key={qn.key}>
                  <Field label={qn.label} rule={qn.rule} multiline rows={qn.key === "number" ? 2 : 4} maxLength={qn.key === "number" ? 600 : 4000} value={answers[qn.key]} onChange={(v) => set(qn.key, v)} />
                  {mode === "speak" && (
                    <div className="cv-row" style={{ marginTop: 6 }}>
                      <Btn onClick={() => void record(qn.key)} disabled={!!rec && rec.key !== qn.key} busy={rec?.key === qn.key && rec.state !== "recording"} aria-label={`${rec?.key === qn.key && rec.state === "recording" ? "Stop recording" : "Record your answer"}: ${qn.label}`}>
                        {rec?.key !== qn.key ? "Record your answer" : rec.state === "recording" ? "Stop recording" : rec.state === "asking" ? "Asking for the microphone…" : "Turning it into text…"}
                      </Btn>
                      {rec?.key === qn.key && rec.state === "recording" && (
                        <small role="status">
                          <span className="cv-dot" style={{ background: "var(--color-red)" }} aria-hidden="true" /> Recording
                        </small>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {problem && (
                <p className="cv-error-text" role="alert">
                  {problem}
                </p>
              )}
              <div className="cv-row">
                <Btn kind={proposed?.length ? "default" : "primary"} busy={busy && !proposed?.length} disabled={busy} onClick={() => void draft()}>
                  {busy && !proposed?.length ? "Drafting…" : proposed ? "Draft again" : "Draft bullets"}
                </Btn>
                <small>Your answers are kept on this device until you use them.</small>
              </div>
            </div>
          </Panel>

          <Panel title="Proposed bullets" className="cv-sticky">
            {!proposed?.length ? (
              <p className="cv-pad cv-muted">Your answers will become bullets here, each beside the words it came from. Nothing appears until you have answered.</p>
            ) : (
              <>
                <ul className="cv-plainlist" aria-label="Proposed bullets" style={{ padding: "0 20px" }}>
                  {proposed.map((p, i) => (
                    <li key={i} style={{ padding: "14px 0" }} data-testid="proposed">
                      <label className="cv-row" style={{ gap: 8, fontSize: 13, marginBottom: 4 }}>
                        <input type="checkbox" checked={p.use} onChange={(e) => setProposed(proposed.map((x, k) => (k === i ? { ...x, use: e.target.checked } : x)))} />
                        Use bullet {i + 1}
                      </label>
                      <Field className="[&>label]:sr-only" label={`Proposed bullet ${i + 1}`} multiline rows={2} maxLength={600} value={p.text} onChange={(text) => setProposed(proposed.map((x, k) => (k === i ? { ...x, text } : x)))} />
                      <small style={{ display: "block", marginTop: 6 }}>
                        From your words:{" "}
                        {p.quotes.map((quote, k) => (
                          <mark key={k} className="cv-mark">
                            {quote}
                          </mark>
                        ))}
                      </small>
                    </li>
                  ))}
                </ul>
                <div className="cv-pad cv-stack" style={{ paddingTop: 0 }}>
                  <small style={{ display: "block" }}>
                    {note || (by === "ai" ? "Drafted by AI from your answers, then checked against them: no number, name or claim that you didn’t give." : "These are your own sentences, tidied by rule. Edit any of them before you use it.")}
                  </small>
                  <label className="cv-row" style={{ gap: 8, fontSize: 13 }}>
                    <input type="checkbox" checked={toBank} onChange={(e) => setToBank(e.target.checked)} />
                    Also save them to my achievements, to use in other CVs
                  </label>
                  <div className="cv-row">
                    <Btn kind="primary" busy={busy} disabled={!picked} onClick={() => void accept()}>
                      {picked === 1 ? "Use the selected bullet" : `Use the ${picked || ""} selected bullets`.replace("  ", " ")}
                    </Btn>
                  </div>
                </div>
              </>
            )}
          </Panel>
        </div>
      </div>
    </CvScreen>
  );
}
