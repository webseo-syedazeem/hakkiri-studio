"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { forgetCheck, fromCheckPath, rememberedCheck } from "@/lib/cv/carry";
import { type CvDoc, type CvSummary, LEVEL_LABELS } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { ApiError, api, messageOf } from "./client";
import { Dialog, usePanel } from "./Dialog";
import { StartPaths } from "./StartPaths";
import { Announce, Bar, Btn, BtnLink, CvScreen, Field, Panel, Skeleton, Toolbar } from "./ui";

const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/**
 * The CV home: the four ways in first ("Start here"), then the person's CVs,
 * each base CV with its tailored versions and cover letters beneath it. A new
 * account sees no rows at all, only how to start. Nothing here is an example.
 */
export function Dashboard() {
  const [cvs, setCvs] = useState<CvSummary[] | null>(null);
  const [error, setError] = useState("");
  const [synced, setSynced] = useState("");
  const { panel, item, open, close } = usePanel();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [said, setSaid] = useState("");
  const router = useRouter();
  const [job, setJob] = useState({ title: "", employer: "", advert: "" });
  const [fields, setFields] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    setError("");
    api<{ cvs: CvSummary[] }>("/api/cv/versions")
      .then((r) => {
        setCvs(r.cvs);
        setSynced(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      })
      .catch((e) => setError(messageOf(e)));
  }, []);
  useEffect(load, [load]);
  // A free check the person asked to open in the builder before they were signed in, if they arrived here another way.
  const [waiting, setWaiting] = useState<string | null>(null);
  useEffect(() => setWaiting(rememberedCheck()), []);

  const chosen = cvs?.find((c) => c.id === item);
  // The rename box starts with the current name each time it opens.
  useEffect(() => {
    if (panel === "rename" && chosen) setName(chosen.name);
    if (panel === "tailor") setJob({ title: "", employer: "", advert: "" });
    setFields({});
    setProblem("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel, item, chosen?.name]);

  /** Runs one change to a CV, then reloads the list. The dialog stays open with the reason if it fails. */
  async function act(run: () => Promise<string>) {
    setBusy(true);
    setProblem("");
    try {
      const done = await run();
      close();
      load();
      setSaid(done);
    } catch (e) {
      setProblem(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  const rename = () =>
    act(async () => {
      const next = name.replace(/\s+/g, " ").trim();
      if (!next) throw new Error("Give your CV a name.");
      // The save names the revision it was made on, so it cannot overwrite a change made elsewhere.
      const { cv } = await api<{ cv: CvDoc }>(`/api/cv/versions/${item}`);
      await api(`/api/cv/versions/${item}`, { method: "PATCH", json: { rev: cv.rev, name: next } });
      return `Renamed to ${next}.`;
    });
  const duplicate = () =>
    act(async () => {
      const made = await api<{ name: string }>(`/api/cv/versions/${item}/duplicate`, { method: "POST", json: {} });
      return `${made.name} created.`;
    });
  const remove = () =>
    act(async () => {
      await api(`/api/cv/versions/${item}`, { method: "DELETE" });
      return `${chosen?.name ?? "CV"} deleted.`;
    });

  /** A tailored version: a copy for one job, opened straight on its tailoring screen. */
  async function tailor() {
    setBusy(true);
    setProblem("");
    setFields({});
    try {
      const made = await api<{ id: string }>(`/api/cv/versions/${item}/tailor`, { method: "POST", json: job });
      router.push(`/cv/v/${made.id}/tailor`);
    } catch (e) {
      if (e instanceof ApiError) setFields(e.fields);
      setProblem(messageOf(e));
      setBusy(false);
    }
  }

  const bases = (cvs ?? []).filter((c) => c.kind === "base" || !cvs?.some((p) => p.id === c.parentId));
  const tailored = (id: string) => (cvs ?? []).filter((c) => c.kind === "tailored" && c.parentId === id);

  return (
    <CvScreen>
      <div className="cv-area">
        <Toolbar title="CVs and letters" subtitle="Create, check and tailor your documents for your next job.">
          <BtnLink href="/cv/bank">Achievements</BtnLink>
          <BtnLink kind="primary" href="/cv/new">
            New CV
          </BtnLink>
        </Toolbar>

        {waiting && (
          <div className="cv-note" style={{ marginBottom: 18 }} data-testid="waiting-check">
            You checked a CV before you signed in. Open that text in the builder to fix what the check found: you won’t need to paste it again.
            <div className="cv-row" style={{ marginTop: 8 }}>
              <BtnLink kind="primary" href={fromCheckPath(waiting)}>
                Open it in the builder
              </BtnLink>
              <Btn
                kind="quiet"
                onClick={() => {
                  forgetCheck();
                  setWaiting(null);
                }}
              >
                Not now
              </Btn>
            </div>
          </div>
        )}
        <StartPaths />

        <h2 className="cv-section-title">Your CVs and letters</h2>
        {error && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>We couldn’t load your documents</strong>
            <span>
              {error}
              {cvs && synced ? ` Showing what was loaded at ${synced}.` : ""}
            </span>
            <Btn className="cv-push" onClick={load}>
              Retry
            </Btn>
          </div>
        )}

        {cvs === null && !error && (
          <Panel aria-busy="true" aria-label="Loading your CVs">
            {[0, 1, 2].map((i) => (
              <div className="cv-pick" key={i}>
                <div className="grow cv-stack">
                  <Skeleton width="40%" />
                  <Skeleton width="60%" height={12} />
                </div>
              </div>
            ))}
          </Panel>
        )}

        {cvs?.length === 0 && (
          <Panel>
            <div className="cv-pad cv-stack" style={{ padding: "30px 24px", textAlign: "center" }}>
              <h3>No CVs yet</h3>
              <p className="cv-muted" style={{ maxWidth: "52ch", margin: "6px auto 0" }}>
                Choose a starting point above to create or check your first CV.
              </p>
              <div className="cv-row" style={{ justifyContent: "center", marginTop: 14 }}>
                <BtnLink kind="primary" href="/cv/new">
                  New CV
                </BtnLink>
              </div>
            </div>
          </Panel>
        )}

        {cvs && cvs.length > 0 && (
          <Panel aria-label="Your CVs">
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {bases.map((cv) => (
                <li key={cv.id}>
                  <Row cv={cv} copies={tailored(cv.id).length} onAction={(what) => open(what, { item: cv.id })} />
                  {cv.letter && <LetterRow cv={cv} />}
                  {tailored(cv.id).map((t) => (
                    <div key={t.id}>
                      <Row cv={t} indent onAction={(what) => open(what, { item: t.id })} />
                      {t.letter && <LetterRow cv={t} />}
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </Panel>
        )}
        <Announce>{said}</Announce>
      </div>

      {panel === "rename" && chosen && (
        <Dialog
          title="Rename"
          onClose={close}
          actions={
            <>
              <Btn onClick={close}>Cancel</Btn>
              <Btn kind="primary" busy={busy} onClick={() => void rename()}>
                Save name
              </Btn>
            </>
          }
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void rename();
            }}
          >
            <Field label="CV name" rule="Only you see this name. It is not printed on the CV." maxLength={120} value={name} onChange={setName} error={problem} autoFocus />
          </form>
        </Dialog>
      )}
      {panel === "duplicate" && chosen && (
        <Dialog
          title="Duplicate"
          onClose={close}
          actions={
            <>
              <Btn onClick={close}>Cancel</Btn>
              <Btn kind="primary" busy={busy} onClick={() => void duplicate()}>
                Duplicate
              </Btn>
            </>
          }
        >
          <p>
            Make a copy of <b>{chosen.name}</b>? The copy is a separate {docWord(chosen.region)}: changing one never changes the other.
          </p>
          {problem && (
            <p className="cv-error-text" role="alert">
              {problem}
            </p>
          )}
        </Dialog>
      )}
      {panel === "delete-version" && chosen && (
        <Dialog
          title="Delete"
          onClose={close}
          actions={
            <>
              <Btn onClick={close}>Cancel</Btn>
              <Btn kind="danger" busy={busy} onClick={() => void remove()}>
                Delete {docWord(chosen.region)}
              </Btn>
            </>
          }
        >
          <p>
            Delete <b>{chosen.name}</b>? The {docWord(chosen.region)} and any file uploaded for it are removed. This can’t be undone.
          </p>
          {tailored(chosen.id).length > 0 && <p className="cv-muted">Its tailored versions are kept and will be listed on their own.</p>}
          {problem && (
            <p className="cv-error-text" role="alert">
              {problem}
            </p>
          )}
        </Dialog>
      )}
      {panel === "tailor" && chosen && (
        <Dialog
          title="Tailor to a job"
          onClose={close}
          wide
          actions={
            <>
              <Btn onClick={close}>Cancel</Btn>
              <Btn kind="primary" busy={busy} onClick={() => void tailor()}>
                Make tailored version
              </Btn>
            </>
          }
        >
          <p>
            This makes a copy of <b>{chosen.name}</b> for one job. You tailor the copy; your base {docWord(chosen.region)} keeps everything.
          </p>
          <div className="cv-pair">
            <Field label="Job title" value={job.title} onChange={(title) => setJob({ ...job, title })} maxLength={160} error={fields.title} />
            <Field label="Employer" value={job.employer} onChange={(employer) => setJob({ ...job, employer })} maxLength={160} />
          </div>
          <Field label="The advert" rule="Paste all of it. It is kept word for word, and what it asks for is read from it." multiline rows={8} maxLength={20000} value={job.advert} onChange={(advert) => setJob({ ...job, advert })} error={fields.advert} />
          {problem && !fields.title && !fields.advert && (
            <p className="cv-error-text" role="alert">
              {problem}
            </p>
          )}
        </Dialog>
      )}
      {panel && ["rename", "duplicate", "delete-version", "tailor"].includes(panel) && cvs && !chosen && (
        <Dialog title="CV not found" onClose={close}>
          <p>That CV is no longer in your list.</p>
        </Dialog>
      )}
    </CvScreen>
  );
}

/** A cover letter, listed under the version it was written for. */
function LetterRow({ cv }: { cv: CvSummary }) {
  const href = `/cv/v/${cv.id}/letter`;
  return (
    <div className="cv-pick cv-dashboard-row" data-child data-letter style={{ paddingLeft: 48 }}>
      <div className="cv-dashboard-main">
        <div className="cv-doc-avatar" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16v12H4z" />
            <path d="M4 7l8 6 8-6" />
          </svg>
        </div>
        <div className="min-w-0 grow">
          <Link href={href} className="cv-dashboard-title hover:underline" style={{ overflowWrap: "anywhere" }}>
            Cover letter{cv.targetEmployer ? ` · ${cv.targetEmployer}` : ""}
          </Link>
          <small style={{ display: "block", marginTop: 4 }}>For {cv.name}</small>
        </div>
      </div>
      <div className="cv-dashboard-actions">
        <div className="cv-slot-open">
          <BtnLink href={href} aria-label={`Open the cover letter for ${cv.name}`}>
            Open
          </BtnLink>
        </div>
      </div>
    </div>
  );
}

function Row({ cv, indent, copies = 0, onAction }: { cv: CvSummary; indent?: boolean; copies?: number; onAction: (what: "rename" | "duplicate" | "delete-version" | "tailor") => void }) {
  const href = cv.pendingImportId ? `/cv/import/${cv.pendingImportId}` : indent && cv.fit !== undefined ? `/cv/v/${cv.id}/tailor` : `/cv/v/${cv.id}/edit/contact`;
  const target = [cv.targetTitle, cv.targetEmployer].filter(Boolean).join(" · ");
  return (
    <div className="cv-pick cv-dashboard-row" data-child={indent || undefined} style={indent ? { paddingLeft: 48 } : undefined}>
      <div className="cv-dashboard-main">
        <div className="cv-doc-avatar" data-tailored={cv.kind === "tailored" || undefined} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="13" y2="17" />
          </svg>
        </div>
        <div className="min-w-0 grow">
          <div className="cv-row" style={{ gap: 10 }}>
            <Link href={href} className="cv-dashboard-title hover:underline" style={{ overflowWrap: "anywhere" }}>
              {cv.name}
            </Link>
            {cv.pendingImportId ? (
              <span className="cv-chip cv-link" style={{ textDecoration: "none" }} data-testid="row-upload">
                {cv.importFailed ? "Upload not read" : "Upload to check"}
              </span>
            ) : cv.empty ? (
              <span className="cv-chip">Empty</span>
            ) : null}
            {cv.score !== undefined && !cv.pendingImportId && (
              <span className="cv-chip cv-chip-score" data-testid="row-score">
                Score {cv.score}/100
              </span>
            )}
            {cv.fit !== undefined && (
              <span className="cv-chip cv-chip-score" data-testid="row-fit">
                Job fit {cv.fit}
              </span>
            )}
          </div>
          <small style={{ display: "block", marginTop: 4 }} title={[LEVEL_LABELS[cv.level], cv.region.toUpperCase(), target].filter(Boolean).join(" · ")}>
            {cv.kind === "tailored" ? (indent ? "Tailored copy" : `Tailored copy (its base ${docWord(cv.region)} was deleted)`) : `Base ${docWord(cv.region)}`}
            {target ? ` · ${target}` : ""} · Changed {when(cv.updatedAt)}
            {copies > 0 ? ` · ${copies} tailored ${copies === 1 ? "copy" : "copies"}` : ""}
          </small>
        </div>
      </div>

      <div className="cv-dashboard-actions">
        <div className="cv-dashboard-action-slots">
          <div className="cv-slot-tailor">
            {!indent && !cv.empty && !cv.pendingImportId ? (
              <Btn kind="quiet" onClick={() => onAction("tailor")} aria-label={`Tailor ${cv.name} to a job`}>
                Tailor to a job
              </Btn>
            ) : null}
          </div>
          <div className="cv-slot-letter">
            {!cv.empty && !cv.pendingImportId ? (
              <BtnLink kind="quiet" href={`/cv/v/${cv.id}/letter`} aria-label={`${cv.letter ? "Open the cover letter for" : "Write a cover letter for"} ${cv.name}`} data-testid="row-letter">
                {cv.letter ? "Letter" : "Write letter"}
              </BtnLink>
            ) : null}
          </div>
          <div className="cv-slot-rename">
            <Btn kind="quiet" onClick={() => onAction("rename")} aria-label={`Rename ${cv.name}`}>
              Rename
            </Btn>
          </div>
          <div className="cv-slot-duplicate">
            <Btn kind="quiet" onClick={() => onAction("duplicate")} aria-label={`Duplicate ${cv.name}`}>
              Duplicate
            </Btn>
          </div>
          <div className="cv-slot-delete">
            <Btn kind="quiet" className="cv-btn-danger" onClick={() => onAction("delete-version")} aria-label={`Delete ${cv.name}`}>
              Delete
            </Btn>
          </div>
        </div>
        {!cv.empty && !cv.pendingImportId && (
          <div className="cv-slot-download">
            <BtnLink href={`/cv/v/${cv.id}/edit/contact?panel=download`} aria-label={`Download ${cv.name}`}>
              Download
            </BtnLink>
          </div>
        )}
        <div className="cv-slot-open">
          <BtnLink kind="primary" href={href}>
            {cv.pendingImportId ? (cv.importFailed ? "Try again" : "Check upload") : "Open"}
          </BtnLink>
        </div>
      </div>
    </div>
  );
}
