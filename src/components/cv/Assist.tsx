"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bulletAt, changeBullet } from "@/lib/cv/edit";
import type { Bullet, Excerpt } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { api, messageOf } from "./client";
import { Dialog, usePanel } from "./Dialog";
import { Btn, Field, Fixed } from "./ui";
import { useWorkspace } from "./Workspace";

/**
 * Help with one bullet, shown in place of the paper: where its words came
 * from, and the three things that can be done with it. Every draft is shown
 * beside the original for the person to accept, change or leave. Nothing is
 * put in the CV until they say so.
 */

const ORIGIN: Record<Bullet["origin"], string> = {
  typed: "You typed this.",
  upload: "From the file you uploaded.",
  spoken: "From what you said.",
  assisted: "Drafted from your own words, and approved by you.",
};
const EXCERPT: Record<Excerpt["kind"], string> = { typed: "You typed", upload: "In your file", spoken: "You said", story: "From your story" };

type Rewrite = { status: "ready"; proposed: string; by: "ai" | "rules" } | { status: "unchanged" } | { status: "refused"; message: string } | { status: "unavailable"; message: string };
interface Draft {
  original: string;
  proposed: string;
  by: "ai" | "rules";
  /** A detail the person supplied, when the draft is their bullet with it added. */
  detail?: string;
}

export function BulletHelp({ say, onEdit }: { say: (text: string) => void; onEdit: () => void }) {
  const w = useWorkspace();
  const { update, setInspect, inspect } = w;
  const cv = w.cv!;
  const { panel, open, close } = usePanel();
  const found = bulletAt(cv.sections, inspect);
  const [busy, setBusy] = useState("");
  const [status, setStatus] = useState("");
  const [refusal, setRefusal] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [edited, setEdited] = useState("");
  const [detail, setDetail] = useState("");
  const [problem, setProblem] = useState("");
  const [question, setQuestion] = useState("");
  const text = found?.bullet.text ?? "";

  // A different bullet: start clean.
  useEffect(() => {
    setStatus("");
    setRefusal("");
    setDraft(null);
    setProblem("");
    setQuestion("");
  }, [inspect?.field]);

  if (!found || !inspect) {
    return (
      <div className="cv-panel cv-pad cv-stack">
        <p>That bullet is no longer in your {docWord(cv.region)}.</p>
        <Btn onClick={() => setInspect(null)}>Back to paper</Btn>
      </div>
    );
  }
  const { bullet, entry } = found;
  const tool = `/api/cv/versions/${cv.id}/write`;
  const clear = () => {
    setStatus("");
    setRefusal("");
    setProblem("");
  };

  async function rewrite() {
    clear();
    setBusy("rewrite");
    try {
      const r = await api<Rewrite>(`${tool}/rewrite`, { method: "POST", json: { text } });
      if (r.status === "ready") {
        setDraft({ original: text, proposed: r.proposed, by: r.by });
        setEdited(r.proposed);
        open("review-draft");
      } else if (r.status === "unchanged") setStatus("This bullet is already tight. There is nothing to change.");
      else if (r.status === "refused") setRefusal(r.message);
      else setStatus(r.message);
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  }

  async function useDetail() {
    if (!detail.trim()) return setProblem("Type the detail, or choose “I don’t know”.");
    setProblem("");
    setBusy("number");
    try {
      const r = await api<{ proposed: string; by: "ai" | "rules" }>(`${tool}/number`, { method: "POST", json: { text, detail } });
      setDraft({ original: text, proposed: r.proposed, by: r.by, detail: detail.trim() });
      setEdited(r.proposed);
      open("review-draft");
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  }

  function accept() {
    if (!draft || !edited.trim()) return;
    // The wording as it was, and any detail the person gave, are kept with the bullet as its sources.
    const keep: Excerpt[] = [...bullet.sources];
    const add = (e: Excerpt) => !keep.some((k) => k.text === e.text) && keep.length < 6 && keep.push(e);
    if (!bullet.sources.length) add({ kind: bullet.origin === "spoken" ? "spoken" : "typed", ref: "before-rewrite", text: draft.original });
    if (draft.detail) add({ kind: "typed", ref: "detail", text: draft.detail });
    update({ sections: changeBullet(cv.sections, inspect!, { text: edited.replace(/\s+/g, " ").trim(), origin: draft.by === "ai" ? "assisted" : bullet.origin, sources: keep }) });
    setDraft(null);
    setDetail("");
    close();
    setStatus("Bullet updated. Undo puts the old wording back.");
    say("Bullet updated.");
  }

  async function practise() {
    clear();
    open("practise-claim");
    try {
      setQuestion((await api<{ question: string }>(`${tool}/question`, { method: "POST", json: { text } })).question);
    } catch {
      setQuestion("What was your part in this work?");
    }
  }

  async function saveToBank() {
    clear();
    setBusy("bank");
    try {
      const original = bullet.sources.map((s) => s.text).join("\n") || text;
      const made = await api<{ achievement: { id: string } }>("/api/cv/bank", { method: "POST", json: { text, original, sources: bullet.sources, role: entry.title, org: entry.org } });
      update({ sections: changeBullet(cv.sections, inspect!, { bankId: made.achievement.id }) });
      setStatus("Saved to your achievements. You can use it again in any CV.");
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="cv-panel" data-testid="bullet-help">
      <div className="cv-panelhead">
        <h2>Help with this bullet</h2>
        <Btn onClick={() => setInspect(null)}>Back to paper</Btn>
      </div>
      <div className="cv-pad cv-stack">
        <blockquote className="cv-quote" style={{ marginTop: 0 }} data-testid="help-bullet">
          {text || <span className="cv-muted">This bullet is empty. Type what you did first.</span>}
        </blockquote>

        <div>
          <h3>Where it came from</h3>
          <p className="cv-small" style={{ marginTop: 4 }}>
            {ORIGIN[bullet.origin]}
          </p>
          {bullet.sources.length > 0 && (
            <ul className="cv-plainlist" aria-label="Your own words this bullet was made from" style={{ marginTop: 6 }}>
              {bullet.sources.map((s, i) => (
                <li key={i}>
                  <span className="cv-eyebrow">
                    {EXCERPT[s.kind]}
                    {s.page ? `, page ${s.page}` : ""}
                  </span>
                  <br />
                  {s.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {text.trim() && (
          <div className="cv-row">
            <Btn onClick={() => (clear(), setDetail(""), open("add-number"))}>Add the number</Btn>
            <Btn busy={busy === "rewrite"} disabled={!!busy} onClick={() => void rewrite()}>
              {busy === "rewrite" ? "Rewriting…" : "Rewrite"}
            </Btn>
            <Btn onClick={() => void practise()}>Practise this claim</Btn>
            {bullet.bankId ? (
              <Link className="cv-link cv-small" href="/cv/bank">
                In your achievements
              </Link>
            ) : (
              <Btn busy={busy === "bank"} disabled={!!busy} onClick={() => void saveToBank()}>
                Save to achievements
              </Btn>
            )}
          </div>
        )}

        {refusal && (
          <div className="cv-issue" role="alert" style={{ display: "block" }}>
            <p data-testid="refusal">{refusal}</p>
            <div className="cv-row" style={{ marginTop: 10 }}>
              <Btn onClick={() => setRefusal("")}>Keep original</Btn>
              <Btn
                onClick={() => {
                  setRefusal("");
                  onEdit();
                }}
              >
                Clarify my notes
              </Btn>
            </div>
          </div>
        )}
        {status && (
          <div role="status" data-testid="help-status">
            {/updated|Saved/.test(status) ? <Fixed>{status}</Fixed> : <p className="cv-note">{status}</p>}
          </div>
        )}
        {problem && panel !== "add-number" && (
          <p className="cv-error-text" role="alert">
            {problem}
          </p>
        )}
        <small style={{ display: "block" }}>Drafts are made only from your own words, and checked against them: no new numbers, nothing dropped, and “helped” never becomes “led”. You decide what goes in.</small>
      </div>

      {panel === "add-number" && (
        <Dialog
          title="Add the number"
          onClose={close}
          actions={
            <>
              <Btn
                onClick={() => {
                  close();
                  setStatus("Left as it is. A clear result can stand without a number.");
                }}
              >
                I don’t know
              </Btn>
              <Btn kind="primary" busy={busy === "number"} onClick={() => void useDetail()}>
                Use this detail
              </Btn>
            </>
          }
        >
          <blockquote className="cv-quote" style={{ marginTop: 0 }}>
            {text}
          </blockquote>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void useDetail();
            }}
          >
            <Field label="Roughly how many? How much? How long?" rule="Use a figure you can explain. If it’s an estimate, say so: “about 40”, “up to £2,000”." maxLength={300} value={detail} onChange={setDetail} error={problem} autoFocus />
          </form>
          <small style={{ display: "block" }}>We never suggest a number. Only you know it.</small>
        </Dialog>
      )}

      {panel === "review-draft" && (
        <Dialog
          title="Review the new wording"
          onClose={close}
          wide
          actions={
            draft ? (
              <>
                <Btn onClick={close}>Keep original</Btn>
                <Btn kind="primary" onClick={accept} disabled={!edited.trim()}>
                  Use this wording
                </Btn>
              </>
            ) : undefined
          }
        >
          {!draft ? (
            <p>There is no draft to review. Ask for a rewrite, or add a number, from “Help with this bullet”.</p>
          ) : (
            <>
              <div className="cv-compare">
                <div>
                  <div>
                    <span className="cv-eyebrow">Your bullet now</span>
                    <p data-testid="draft-original">{draft.original}</p>
                  </div>
                  <div>
                    <span className="cv-eyebrow">Proposed</span>
                    <p data-testid="draft-proposed">{draft.proposed}</p>
                  </div>
                </div>
              </div>
              {draft.detail && (
                <p className="cv-small">
                  With the detail you gave: <b>{draft.detail}</b>
                </p>
              )}
              <Field label="Wording to use" rule="Change anything you like. It is your claim." multiline rows={3} maxLength={600} value={edited} onChange={setEdited} />
              <small style={{ display: "block" }}>
                {draft.by === "ai" ? "Drafted by AI from your words" : "Put together by rule from your words"}, then checked: every number, the result and your share of the work are as you wrote them.
              </small>
            </>
          )}
        </Dialog>
      )}

      {panel === "practise-claim" && (
        <Dialog title="Practise this claim" onClose={close}>
          <blockquote className="cv-quote" style={{ marginTop: 0 }}>
            {text}
          </blockquote>
          <div>
            <span className="cv-eyebrow">A question you may be asked</span>
            <p style={{ marginTop: 4, fontWeight: 600 }} data-testid="practice-question">
              {question || "…"}
            </p>
          </div>
          <p className="cv-small">Say your answer out loud before an interviewer asks. If you can’t back the line up, change the line.</p>
          <div className="cv-row">
            <Link
              className="cv-btn cv-btn-primary"
              href={`/practice?claim=${encodeURIComponent(text)}&question=${encodeURIComponent(question)}&returnTo=${encodeURIComponent(`/cv/${cv.id}?inspect=${encodeURIComponent(JSON.stringify(inspect))}`)}`}
            >
              Open the Practice Hub
            </Link>
            <Btn onClick={() => void navigator.clipboard?.writeText(question).then(() => say("Question copied."))} disabled={!question}>
              Copy the question
            </Btn>
          </div>
        </Dialog>
      )}
    </div>
  );
}
