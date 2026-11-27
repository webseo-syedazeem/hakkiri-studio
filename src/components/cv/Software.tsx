"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { SoftwareView } from "@/lib/cv/render/software";
import { COLUMNS_NOTE, TEMPLATES } from "@/lib/cv/render/templates";
import type { ExportRecord } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { ApiError, api, messageOf } from "./client";
import { PaperView } from "./Paper";
import { Bar, Btn, BtnLink, CvScreen, Panel, Skeleton, Toolbar } from "./ui";
import { useLetterPaper, usePaper } from "./usePaper";
import { useWorkspace } from "./Workspace";

type Format = "pdf" | "docx";
const NAME: Record<Format, string> = { pdf: "PDF", docx: "Word file" };
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Saves a file the server sent, under the name it gave. */
async function saveFile(url: string, fallback: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new ApiError(0, "No connection. Check you’re online and try again.");
  }
  if (!res.ok) throw new ApiError(res.status, ((await res.json().catch(() => ({}))) as { message?: string }).message ?? "The file could not be made.");
  const named = /filename\*=UTF-8''([^;]+)/.exec(res.headers.get("content-disposition") ?? "");
  const name = named ? decodeURIComponent(named[1]) : fallback;
  const href = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 30000);
  return name;
}

/**
 * The Software view: what a program reads from the finished file, beside what
 * the CV says. The file read is the real one. "ATS-ready" is shown only when
 * that file earns it; otherwise the reasons are.
 */
export function Software({ format }: { format: Format }) {
  const w = useWorkspace();
  const { cv, load, save, settle, setChecks } = w;
  const [view, setView] = useState<SoftwareView | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [tab, setTab] = useState<"fields" | "order">("fields");
  const id = w.versionId;
  const ready = load === "ready";

  const check = useCallback(async () => {
    setBusy(true);
    setProblem("");
    try {
      if (!(await settle())) throw new Error("Your latest changes haven’t been saved yet, so the file can’t be made from them. Check the save status in the builder, then try again.");
      const v = await api<SoftwareView>(`/api/cv/versions/${id}/software?format=${format}`);
      setView(v);
      // The score's file check uses the same result.
      setChecks((c) => ({ ...(c && c.rev === v.rev ? c : {}), rev: v.rev, [format]: { status: v.status, name: v.name, pages: v.pages, missing: v.missing, unexpected: v.unexpected, unsupported: v.unsupported, made: v.status === "failed" } }));
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy(false);
    }
  }, [id, format, settle, setChecks]);

  useEffect(() => {
    if (ready) void check();
  }, [ready, check]);

  const crumbs = [{ label: "CVs and letters", href: "/cv" }, { label: cv?.name ?? "CV", href: `/cv/v/${id}/edit/contact` }, { label: "Software view" }];
  if (load === "loading")
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area" aria-busy="true" aria-label="Loading your CV">
          <Skeleton height={320} />
        </div>
      </CvScreen>
    );
  if (!ready || !cv)
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

  const word = docWord(cv.region);
  const stale = !!view && (view.rev !== cv.rev || save !== "saved");
  const status = busy ? "Checking…" : !view ? "Unchecked" : stale ? "Out of date" : view.status === "checked" ? "Checked" : view.status === "loss" ? "Loss found" : "Check failed";
  const wrong = view?.fields.filter((f) => !f.ok) ?? [];
  const first = wrong[0];
  return (
    <CvScreen>
      <Bar crumbs={crumbs}>
        {w.fromFindings && <BtnLink href={`/cv/v/${id}/findings`}>Back to findings</BtnLink>}
        <BtnLink href={`/cv/v/${id}/edit/finish#files`}>Back to Finish</BtnLink>
      </Bar>
      <div className="cv-area">
        <Toolbar eyebrow={view?.name ?? cv.name} title="Software view" subtitle={`What a program reads from your ${NAME[format]}, beside what your ${word} says. The file read is the real one you would download.`}>
          <nav className="cv-seg" aria-label="File">
            {(["pdf", "docx"] as const).map((f) => (
              <Link key={f} href={`/cv/v/${id}/software/${f}`} aria-current={f === format ? "page" : undefined} className={f === format ? "cv-seg-on" : undefined}>
                {f === "pdf" ? "PDF" : "Word"}
              </Link>
            ))}
          </nav>
          <Btn kind="primary" busy={busy} onClick={() => void check()}>
            {view ? "Check again" : "Check the file"}
          </Btn>
        </Toolbar>

        {problem && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>The file couldn’t be checked</strong>
            <span>{problem}</span>
          </div>
        )}

        <Panel style={{ marginBottom: 18 }}>
          <div className="cv-pad cv-row" data-testid="software-status">
            <span className={`cv-chip ${status === "Checked" ? "cv-good" : status === "Loss found" || status === "Check failed" ? "cv-warn" : ""}`} data-testid="file-status">
              {status === "Checked" ? "✓ " : ""}
              {status}
            </span>
            {view && !stale && view.atsReady && (
              <span className="cv-chip cv-good" data-testid="ats-ready">
                ✓ ATS-ready
              </span>
            )}
            {view && (
              <small>
                {view.pages === 1 ? "One page" : `${view.pages} pages`} · revision {view.rev} · checked {when(view.checkedAt)}
              </small>
            )}
            {stale && <span className="cv-small">Your {word} has changed since this check. Check again to see the file as it is now.</span>}
          </div>
          {view && !stale && !view.atsReady && (
            <div className="cv-pad" style={{ paddingTop: 0 }} data-testid="ats-why">
              <p className="cv-small">Not labelled ATS-ready, because:</p>
              <ul className="cv-plainlist">
                {view.why.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
          {view && !stale && view.atsReady && <p className="cv-pad cv-small" style={{ paddingTop: 0 }}>{TEMPLATES[cv.design.template]?.grid ? `This file is real text with standard headings, written in reading order, and it reads back word for word in that order. ${COLUMNS_NOTE}` : "This file is one column of real text with standard headings, and it reads back word for word with every field where a parser expects it."} No file can be promised to pass every employer’s system.</p>}
        </Panel>

        {view && first && !stale && (
          <div className="cv-issue" style={{ marginBottom: 18 }} data-testid="first-loss">
            <span className="min-w-0 grow">
              {first.read ? `The ${NAME[format]} reads ${first.label.toLowerCase()} as “${first.read.split("\n")[0]}”. Your ${word} says “${first.expected.split("\n")[0]}”.` : `A parser reading the ${NAME[format]} did not find ${/^[aeiou]/i.test(first.label) ? "an" : "a"} ${first.label.toLowerCase()}. Your ${word} says “${first.expected.split("\n")[0]}”. The words may still be in the file: compare the two.`}
            </span>
            <Btn onClick={() => (setTab("fields"), document.getElementById(`field-${wrong.indexOf(first)}`)?.scrollIntoView({ block: "center" }))}>Compare entry</Btn>
            <Btn onClick={() => void check()}>Rebuild {format === "pdf" ? "PDF" : "Word file"}</Btn>
          </div>
        )}

        {!view && busy && <Skeleton height={280} />}
        {view && (
          <>
            <div className="cv-seg" role="group" aria-label="Compare by" style={{ marginBottom: 14 }}>
              <button type="button" aria-pressed={tab === "fields"} onClick={() => setTab("fields")}>
                Fields
              </button>
              <button type="button" aria-pressed={tab === "order"} onClick={() => setTab("order")}>
                Reading order
              </button>
            </div>
            {tab === "fields" ? (
              <Panel aria-label="Fields">
                {view.fields.length === 0 ? (
                  <p className="cv-pad cv-muted">The file could not be sorted into fields.</p>
                ) : (
                  <table className="cv-method cv-fields">
                    <thead>
                      <tr>
                        <th scope="col">Field</th>
                        <th scope="col">Your {word} says</th>
                        <th scope="col">Read from the file</th>
                        <th scope="col">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {view.fields.map((f) => (
                        <tr key={f.label} data-ok={f.ok} id={f.ok ? undefined : `field-${wrong.indexOf(f)}`}>
                          <th scope="row">{f.label}</th>
                          <td style={{ whiteSpace: "pre-wrap" }}>{f.expected || <span className="cv-muted">Nothing</span>}</td>
                          <td style={{ whiteSpace: "pre-wrap" }}>{f.read || <span className="cv-muted">Nothing</span>}</td>
                          <td className={f.ok ? "cv-good" : "cv-warn"}>{f.ok ? "✓ Same" : "Differs"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Panel>
            ) : (
              <div className="cv-layout" style={{ gridTemplateColumns: "minmax(0, 584fr) minmax(0, 584fr)" }}>
                <Panel title={`Your ${word} says`}>
                  <ol className="cv-readlist" data-testid="expected-lines">
                    {view.expected.map((line, i) => (
                      <li key={i} data-missing={view.missing.includes(line) || undefined}>
                        {line}
                      </li>
                    ))}
                  </ol>
                </Panel>
                <Panel title="Read from the file">
                  <ol className="cv-readlist" data-testid="read-lines">
                    {view.read.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ol>
                  {view.read.length === 0 && <p className="cv-pad cv-muted">Nothing could be read from the file.</p>}
                </Panel>
              </div>
            )}
            {(view.missing.length > 0 || view.unexpected.length > 0) && (
              <Panel title="What differs" style={{ marginTop: 18 }}>
                <div className="cv-pad cv-stack">
                  {view.missing.length > 0 && (
                    <div>
                      <h3>In your {word}, not read back from the file</h3>
                      <ul className="cv-plainlist">
                        {view.missing.slice(0, 20).map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {view.unexpected.length > 0 && (
                    <div>
                      <h3>In the file, not in your {word}</h3>
                      <p className="cv-quote">{view.unexpected.slice(0, 80).join(" ")}</p>
                    </div>
                  )}
                </div>
              </Panel>
            )}
          </>
        )}
      </div>
    </CvScreen>
  );
}

type Stored = Omit<ExportRecord, "userId">;

/**
 * One remembered download: the CV exactly as it was when the file was made.
 * It can be read here and downloaded again, and it does not change when the
 * CV does.
 */
export function ExportRecordView({ exportId }: { exportId: string }) {
  const router = useRouter();
  const w = useWorkspace();
  const [record, setRecord] = useState<Stored | null>(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState("");
  const [problem, setProblem] = useState("");
  useEffect(() => {
    api<{ export: Stored }>(`/api/cv/exports/${exportId}`)
      .then((r) => setRecord(r.export))
      .catch(() => setMissing(true));
  }, [exportId]);
  const hasLetter = !!record && record.what !== "cv";
  const paper = usePaper(record && record.what !== "letter" ? record.cv : null);
  // A letter is shown with the date it was sent with, which was fixed when the file was made.
  const letterPaper = useLetterPaper(hasLetter ? record.cv : null, record?.at.slice(0, 10) ?? "");
  const back = hasLetter ? `/cv/v/${w.versionId}/letter` : `/cv/v/${w.versionId}/edit/finish#files`;
  const backWord = hasLetter ? "Back to the letter" : "Back to Finish";
  const crumbs = [{ label: "CVs and letters", href: "/cv" }, { label: w.cv?.name ?? record?.cv.name ?? "CV", href: back }, { label: "What you downloaded" }];

  if (missing)
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area">
          <Toolbar title="Download not found" subtitle="It may have been deleted, or it belongs to another account.">
            <BtnLink href={back}>{backWord}</BtnLink>
          </Toolbar>
        </div>
      </CvScreen>
    );
  if (!record)
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area" aria-busy="true" aria-label="Loading the download">
          <Skeleton height={320} />
        </div>
      </CvScreen>
    );

  const word = docWord(record.cv.region);
  const what = record.what === "letter" ? "cover letter" : record.what === "both" ? `cover letter and ${word}` : word;
  const changed = !!w.cv && w.cv.rev !== record.rev;
  const run = async (what: string, fn: () => Promise<void>) => {
    setBusy(what);
    setProblem("");
    try {
      await fn();
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  };
  return (
    <CvScreen>
      <Bar crumbs={crumbs}>
        <BtnLink href={back}>{backWord}</BtnLink>
      </Bar>
      <div className="cv-area">
        <Toolbar eyebrow={`Downloaded ${when(record.at)}`} title={record.name} subtitle={`Your ${what} exactly as ${record.what === "both" ? "they were" : "it was"} when this file was made.`}>
          <Btn kind="primary" busy={busy === "file"} onClick={() => void run("file", async () => void (await saveFile(`/api/cv/exports/${record.id}/file`, record.name)))}>
            Download this file again
          </Btn>
        </Toolbar>
        <div className="cv-layout" style={{ gridTemplateColumns: "minmax(0, 352fr) minmax(0, 816fr)" }}>
          <Panel title="About this file" data-testid="export-record">
            <div className="cv-pad cv-stack">
              <p className={record.checked ? "cv-good" : "cv-warn"}>{record.checked ? `✓ Checked when it was made: it read back the same as your ${what}.` : "Downloaded unchecked: the check could not be run at the time."}</p>
              <ul className="cv-plainlist">
                <li>{record.format === "pdf" ? "PDF" : "Word file"}{record.pages ? `, ${record.pages === 1 ? "one page" : `${record.pages} pages`}` : ""}</li>
                <li>Template: {record.cv.design.template}</li>
                {record.cv.target?.title && <li>For: {[record.cv.target.title, record.cv.target.employer].filter(Boolean).join(" · ")}</li>}
              </ul>
              <p className="cv-note" data-testid="record-changed">
                {changed ? `Your ${word}${hasLetter ? " or letter" : ""} has been changed since. This page shows what you downloaded, not what it says now.` : `Your ${word}${hasLetter ? " and letter have" : " has"} not changed since this download.`}
              </p>
              {problem && (
                <p className="cv-error-text" role="alert">
                  {problem}
                </p>
              )}
              <div className="cv-row">
                <Link className="cv-btn" href="/practice">
                  Practise from this
                </Link>
                <Btn
                  kind="danger"
                  busy={busy === "delete"}
                  onClick={() =>
                    void run("delete", async () => {
                      await api(`/api/cv/exports/${record.id}`, { method: "DELETE" });
                      router.push(back);
                    })
                  }
                >
                  Delete this record
                </Btn>
              </div>
              <small style={{ display: "block" }}>Deleting the record does not change your {word}.</small>
              {record.cv.target?.advert && (
                <details data-testid="record-advert">
                  <summary>The advert as it was</summary>
                  <p className="cv-small" style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
                    {record.cv.target.advert}
                  </p>
                </details>
              )}
            </div>
          </Panel>
          <div className="cv-stack min-w-0">
            {hasLetter && <PaperView paper={letterPaper.paper} state={letterPaper.state} retry={letterPaper.retry} cv={record.cv} focus={null} word="letter" />}
            {record.what !== "letter" && <PaperView paper={paper.paper} state={paper.state} retry={paper.retry} cv={record.cv} focus={null} word={word} />}
          </div>
        </div>
      </div>
    </CvScreen>
  );
}

/** The downloads remembered for a CV, newest first: shown on the Finish tab. */
export function Downloads({ versionId, refresh }: { versionId: string; refresh: number }) {
  const [list, setList] = useState<Omit<Stored, "cv">[] | null>(null);
  useEffect(() => {
    api<{ exports: Omit<Stored, "cv">[] }>(`/api/cv/versions/${versionId}/exports`)
      .then((r) => setList(r.exports))
      .catch(() => setList([]));
  }, [versionId, refresh]);
  if (!list?.length) return null;
  return (
    <div data-testid="downloads">
      <h3>What you have downloaded</h3>
      <ul className="cv-plainlist">
        {list.slice(0, 8).map((r) => (
          <li key={r.id}>
            <Link className="cv-link" href={`/cv/v/${versionId}/exports/${r.id}`}>
              {r.name}
            </Link>
            <small style={{ display: "block" }}>
              {when(r.at)} · {r.checked ? "checked" : "unchecked"}
            </small>
          </li>
        ))}
      </ul>
      <small style={{ display: "block", marginTop: 6 }}>Each one opens exactly what you downloaded, even after your CV changes.</small>
    </div>
  );
}
