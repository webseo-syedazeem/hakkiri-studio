"use client";

import { useEffect, useState } from "react";
import type { CvDoc } from "@/lib/cv/schema";
import { api, messageOf } from "./client";
import { Dialog } from "./Dialog";
import { Btn, Field } from "./ui";

interface ShareState {
  share: { path: string; rev: number; publishedAt: string; current: boolean } | null;
  rev: number;
}

/**
 * "Share a link": off until the person turns it on. On, it makes a read-only
 * link to the CV as it is now; later changes are not shared until the person
 * chooses to share them. Off, the link stops working at once.
 */
export function ShareDialog({ cv, word, saved, flush, onClose, say }: { cv: CvDoc; word: string; saved: boolean; flush: () => Promise<unknown>; onClose: () => void; say: (s: string) => void }) {
  const [state, setState] = useState<ShareState | null>(null);
  const [busy, setBusy] = useState<"" | "on" | "off">("");
  const [problem, setProblem] = useState("");
  const [copied, setCopied] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    api<ShareState>(`/api/cv/versions/${cv.id}/share`)
      .then(setState)
      .catch((err) => setProblem(messageOf(err)));
  }, [cv.id]);

  async function share() {
    setProblem("");
    setCopied("");
    setBusy("on");
    try {
      // What is shared is what is saved: the latest typing first.
      await flush();
      const next = await api<ShareState>(`/api/cv/versions/${cv.id}/share`, { method: "POST", json: {} });
      setState(next);
      say(state?.share ? "The link now shows your current version." : "Link created. Anyone with it can view this version.");
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  }
  async function stop() {
    setProblem("");
    setCopied("");
    setBusy("off");
    try {
      setState(await api<ShareState>(`/api/cv/versions/${cv.id}/share`, { method: "DELETE" }));
      say("Sharing is off. The link no longer works.");
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  }
  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied("Link copied");
    } catch {
      setCopied("Couldn’t copy the link. Select and copy it.");
    }
  }

  const link = state?.share ? `${origin}${state.share.path}` : "";
  const current = !!state?.share && state.share.rev === cv.rev && saved;
  const when = state?.share ? new Date(state.share.publishedAt).toLocaleString(cv.region === "us" ? "en-US" : "en-GB", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <Dialog title="Share a link" onClose={onClose}>
      <div className="cv-stack" data-testid="share-dialog">
        <p style={{ margin: 0 }}>Anyone with the link can view; you can turn it off at any time.</p>
        <label className="cv-row cv-sharetoggle">
          <input type="checkbox" role="switch" checked={busy === "on" ? true : busy === "off" ? false : !!state?.share} disabled={!state || !!busy} onChange={(e) => void (e.target.checked ? share() : stop())} />
          <span>Share a read-only version</span>
        </label>
        <p role="status" className="cv-small" style={{ margin: 0 }}>
          {busy === "on" ? "Creating link" : busy === "off" ? "Turning sharing off" : state && !state.share ? "Sharing is off" : ""}
        </p>
        {state?.share && (
          <>
            <Field label="Read-only link" value={link} onChange={() => {}} readOnly onFocus={(e) => e.currentTarget.select()} data-testid="share-link" />
            <div className="cv-row">
              <Btn kind="primary" onClick={() => void copy(link)}>
                Copy link
              </Btn>
              <a className="cv-btn" href={state.share.path} target="_blank" rel="noopener noreferrer">
                Preview read-only page
              </a>
            </div>
            {copied && (
              <p role="status" className="cv-small" style={{ margin: 0 }}>
                {copied}
              </p>
            )}
            <p className="cv-small" style={{ margin: 0 }} data-testid="share-version">
              {current ? `The link shows your ${word} as it is now, shared ${when}.` : `The link shows your ${word} as it was when you shared it, ${when}. Changes since then are not shared until you choose to share them.`}
            </p>
            {!current && (
              <Btn onClick={() => void share()} disabled={!!busy}>
                Share the current version
              </Btn>
            )}
            <p className="cv-small cv-muted" style={{ margin: 0 }}>
              Only what is on the page is shared: not the job advert, your notes, your cover letter, or anything you have switched off. The person viewing can’t edit it or see anything else in your account.
            </p>
          </>
        )}
        {problem && (
          <p className="cv-error-text" role="alert" style={{ margin: 0 }}>
            {problem}
          </p>
        )}
      </div>
    </Dialog>
  );
}
