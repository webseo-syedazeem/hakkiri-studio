"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { type CvDoc, type CvSummary, LEVEL_LABELS } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { api, messageOf } from "./client";
import { Dialog, usePanel } from "./Dialog";
import { Announce, Bar, Btn, BtnLink, CvScreen, Field, Panel, Skeleton, Toolbar } from "./ui";

const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/**
 * The person's CVs: each base CV with its tailored versions beneath it. A new
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

  const chosen = cvs?.find((c) => c.id === item);
  // The rename box starts with the current name each time it opens.
  useEffect(() => {
    if (panel === "rename" && chosen) setName(chosen.name);
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

  const bases = (cvs ?? []).filter((c) => c.kind === "base" || !cvs?.some((p) => p.id === c.parentId));
  const tailored = (id: string) => (cvs ?? []).filter((c) => c.kind === "tailored" && c.parentId === id);

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters" }]} />
      <div className="cv-area">
        <Toolbar title="CVs and letters" subtitle="Build a CV from your own words, check it, and tailor a version for each job.">
          <BtnLink href="/cv/bank">Achievements</BtnLink>
          <BtnLink kind="primary" href="/cv/new">
            New CV
          </BtnLink>
        </Toolbar>

        {error && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>Couldn’t load your CVs</strong>
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
            <div className="cv-pad cv-stack" style={{ padding: "36px 24px", textAlign: "center" }}>
              <h2>You have no CVs yet</h2>
              <p className="cv-muted" style={{ maxWidth: "52ch", margin: "8px auto 0" }}>
                Start a new CV, or upload the one you have. A new CV starts empty: everything on it will be what you put there.
              </p>
              <div className="cv-row" style={{ justifyContent: "center", marginTop: 18 }}>
                <BtnLink kind="primary" href="/cv/new">
                  New CV
                </BtnLink>
                <BtnLink href="/cv-audit">Free CV audit</BtnLink>
              </div>
            </div>
          </Panel>
        )}

        {cvs && cvs.length > 0 && (
          <Panel aria-label="Your CVs">
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {bases.map((cv) => (
                <li key={cv.id}>
                  <Row cv={cv} onAction={(what) => open(what, { item: cv.id })} />
                  {tailored(cv.id).map((t) => (
                    <Row key={t.id} cv={t} indent onAction={(what) => open(what, { item: t.id })} />
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
      {panel && ["rename", "duplicate", "delete-version"].includes(panel) && cvs && !chosen && (
        <Dialog title="CV not found" onClose={close}>
          <p>That CV is no longer in your list.</p>
        </Dialog>
      )}
    </CvScreen>
  );
}

function Row({ cv, indent, onAction }: { cv: CvSummary; indent?: boolean; onAction: (what: "rename" | "duplicate" | "delete-version") => void }) {
  const href = cv.pendingImportId ? `/cv/import/${cv.pendingImportId}` : `/cv/v/${cv.id}/edit/contact`;
  const target = [cv.targetTitle, cv.targetEmployer].filter(Boolean).join(" · ");
  return (
    <div className="cv-pick" style={indent ? { paddingLeft: 44 } : undefined}>
      <div className="min-w-0 grow">
        <Link href={href} className="font-semibold hover:underline" style={{ overflowWrap: "anywhere" }}>
          {cv.name}
        </Link>
        <small style={{ display: "block", marginTop: 3 }}>
          {indent ? "Tailored version" : `Base ${docWord(cv.region)}`} · {LEVEL_LABELS[cv.level]} · {cv.region.toUpperCase()}
          {target ? ` · ${target}` : ""} · Edited {when(cv.updatedAt)}
        </small>
      </div>
      {cv.pendingImportId ? <span className="cv-chip cv-link" style={{ textDecoration: "none" }}>Upload to check</span> : cv.empty ? <span className="cv-chip">Empty</span> : null}
      <span className="cv-controls">
        <Btn kind="quiet" onClick={() => onAction("rename")} aria-label={`Rename ${cv.name}`}>
          Rename
        </Btn>
        <Btn kind="quiet" onClick={() => onAction("duplicate")} aria-label={`Duplicate ${cv.name}`}>
          Duplicate
        </Btn>
        <Btn kind="quiet" onClick={() => onAction("delete-version")} aria-label={`Delete ${cv.name}`}>
          Delete
        </Btn>
        <BtnLink href={href}>{cv.pendingImportId ? "Check upload" : "Open"}</BtnLink>
      </span>
    </div>
  );
}
