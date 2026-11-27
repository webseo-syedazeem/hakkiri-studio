"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Band, CheckReport as Report, CvFinding, CvReport, JobReport } from "@/lib/cv/check/report";
import type { LetterCheck } from "@/lib/cv/letter/score";
import { bandOf } from "@/lib/cv/score/band";
import { api, messageOf } from "./client";
import { ScoreRing } from "./ScoreRing";
import { Bar, Btn, BtnLink, CvScreen, Panel, Skeleton, Toolbar } from "./ui";

interface Loaded {
  id: string;
  createdAt: string;
  expiresAt: string;
  report: Report;
}

const STATE_WORDS: Record<LetterCheck["state"], string> = { ok: "OK", review: "To review", "not-checked": "Not checked" };
const dateWords = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function ScoreBox({ title, shown, band, parts, testId }: { title: string; shown: number; band: Band; parts: { id: string; name: string; points: number; earned: number; pending: number }[]; testId: string }) {
  return (
    <Panel title={title} data-testid={testId}>
      <div className="cv-pad cv-stack">
        <ScoreRing score={shown} label={title} size={126} />
        <ul className="cv-score-parts">
          {parts.map((p) => {
            const unchecked = p.pending >= p.points;
            const partly = !unchecked && p.pending > 0;
            const pct = unchecked ? 0 : Math.round((p.earned / p.points) * 100);
            const partBand = unchecked ? undefined : bandOf(pct).key;
            return (
              <li key={p.id} data-band={partBand}>
                <span className="cv-row" style={{ justifyContent: "space-between", gap: 8 }}>
                  <span>{p.name}</span>
                  <b style={partBand ? { color: "var(--ring)" } : undefined}>{unchecked ? "Not checked" : `${Math.round(p.earned)}/${p.points}`}</b>
                </span>
                <span className="cv-meter" data-band={partBand} aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </span>
                {partly && <span className="cv-small cv-muted">{Math.round(p.pending)} of these points not checked</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}

const PART_NAMES: Record<string, string> = { evidence: "Evidence", clarity: "Clarity", structure: "Structure", software: "Readable by software", relevance: "Relevance" };

function Findings({ findings, base, label }: { findings: { quote: string; why: string; todo: string; severity?: string; part?: string }[]; base: string | null; label: string }) {
  const [all, setAll] = useState(false);
  const shown = all ? findings : findings.slice(0, 8);
  return (
    <Panel title="Top fixes" data-testid={`${label}-fixes`}>
      <div className="cv-pad cv-stack">
        {findings.length ? (
          <>
            <p className="cv-small cv-muted" style={{ margin: 0 }}>
              In priority order. Review the evidence before changing the document.
            </p>
            <ol className="cv-fixlist">
              {shown.map((f, i) => (
                <li key={i} className="cv-fix" data-testid="finding">
                  <span className="cv-fix-head">
                    <b>
                      {i + 1}
                      {f.part && PART_NAMES[f.part] ? ` · ${PART_NAMES[f.part]}` : ""}
                    </b>
                    <span className="cv-chip" data-status={f.severity === "issue" ? "missing" : "partly"}>
                      {f.severity === "issue" ? "To fix" : "To review"}
                    </span>
                  </span>
                  {f.quote && <q className="cv-fix-quote">{f.quote}</q>}
                  <p>
                    <b>Why:</b> {f.why}
                  </p>
                  <p>
                    <b>What to do:</b> {f.todo}
                  </p>
                  {base && (
                    <Link className="cv-link cv-fix-link" href={base}>
                      Fix this in the builder
                    </Link>
                  )}
                </li>
              ))}
            </ol>
            {findings.length > 8 && (
              <Btn className="cv-wide-btn" onClick={() => setAll(!all)}>
                {all ? "Show fewer" : `Show all ${findings.length}`}
              </Btn>
            )}
          </>
        ) : (
          <>
            <p style={{ margin: 0 }}>No fixes found in this check.</p>
            {base && <BtnLink href={base}>Open in the builder</BtnLink>}
          </>
        )}
      </div>
    </Panel>
  );
}

function ReadBack({ cv }: { cv: CvReport }) {
  const read = cv.read;
  if (!read) {
    return (
      <Panel title="How software reads it" data-testid="read-back">
        <div className="cv-pad cv-stack">
          <ul className="cv-readrows">
            <li>
              <span className="min-w-0">
                <b>Your file</b>
                <span className="cv-small cv-muted">Pasted text has no file to read. Upload the PDF or Word file you send to employers to see what software reads from it.</span>
              </span>
              <span className="cv-chip">Not checked</span>
            </li>
          </ul>
          <BtnLink href="/cv/check?method=upload" style={{ justifySelf: "start" }}>
            Check file
          </BtnLink>
        </div>
      </Panel>
    );
  }
  const rows: [string, string, boolean][] = [
    ["Name and contact details", read.contact.length ? read.contact.join(", ") : "None found", read.contact.includes("Name") && (read.contact.includes("Email") || read.contact.includes("Phone"))],
    ["Section headings", read.sections.length ? read.sections.join(", ") : "None recognised", read.sections.length >= 2],
    ["Words read", `${read.words} words from ${read.pages} ${read.pages === 1 ? "page" : "pages"}`, read.words > 0],
    ["Lines it couldn’t place", read.unplaced.length ? String(read.unplaced.length) : "None", read.unplaced.length === 0],
  ];
  return (
    <Panel title="How software reads it" data-testid="read-back">
      <div className="cv-pad cv-stack">
        <p className="cv-small" style={{ margin: 0 }}>
          What the reader took from <b>{read.name}</b> ({read.kind === "pdf" ? "PDF" : "Word"}), as an applicant tracking system would read it. Systems differ: this shows what one careful reader found, not a promise about every system.
        </p>
        <ul className="cv-readrows">
          {rows.map(([k, v, ok]) => (
            <li key={k}>
              <span className="min-w-0">
                <b>{k}</b>
                <span className="cv-small cv-muted">{v}</span>
              </span>
              <span className="cv-chip" data-status={ok ? "ok" : "partly"}>
                {ok ? "Read" : "To review"}
              </span>
            </li>
          ))}
        </ul>
        {read.unplaced.length > 0 && (
          <details>
            <summary>Lines it couldn’t place</summary>
            <ul className="cv-small">
              {read.unplaced.map((u, i) => (
                <li key={i}>{u}</li>
              ))}
            </ul>
          </details>
        )}
        {read.omitted.length > 0 && (
          <details>
            <summary>Left out on purpose</summary>
            <ul className="cv-small">
              {read.omitted.map((o, i) => (
                <li key={i}>
                  {o.text}: {o.reason}
                </li>
              ))}
            </ul>
          </details>
        )}
        {read.doubts.length > 0 && (
          <details>
            <summary>Things to check</summary>
            <ul className="cv-small">
              {read.doubts.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </details>
        )}
        {!read.unplaced.length && !read.doubts.length && <p className="cv-small" style={{ margin: 0 }}>No missing or reordered text found in this check.</p>}
      </div>
    </Panel>
  );
}

function JobMatch({ job, id }: { job: JobReport; id: string }) {
  const aimed = [job.title, job.employer].filter(Boolean).join(", ") || "the job advert";
  return (
    <Panel className="cv-jobmatch" data-testid="job-match">
      <div className="cv-pad cv-stack">
        <div className="cv-row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div className="min-w-0">
            <p className="cv-eyebrow" style={{ margin: 0 }}>
              Aimed at
            </p>
            <h2 style={{ margin: "4px 0 4px", fontSize: 17 }}>{aimed}</h2>
            <p className="cv-small cv-muted" style={{ margin: 0 }}>
              {job.shown} of {job.total} requirements shown{job.partly ? ` · ${job.partly} partly shown` : ""}
            </p>
          </div>
          <div className="cv-matchbox" data-band={job.score != null ? bandOf(job.score).key : undefined} role="img" aria-label={job.score === null ? "Match score: not measured" : `Match score: ${job.score} out of 100`}>
            <span className="cv-small cv-muted">Match score</span>
            <b style={job.score != null ? { color: "var(--ring)" } : undefined}>
              {job.score ?? "–"}
              <small> / 100</small>
            </b>
          </div>
        </div>
        <div className="cv-row">
          <BtnLink kind="primary" href={`/cv/from-check/${id}?then=tailor`}>
            Tailor a copy for this job
          </BtnLink>
          <BtnLink href={`/cv/from-check/${id}?then=letter`}>Write the cover letter for this job</BtnLink>
        </div>
        <p className="cv-small cv-muted" style={{ margin: 0 }}>
          Required counts twice and preferred once; partly shown counts half. No evidence on the page is not proof that you don’t have the skill: if you have it, add it in your own words.
        </p>
        <table className="cv-matchtable">
          <thead>
            <tr>
              <th scope="col">What the advert asks for</th>
              <th scope="col">Evidence in your CV</th>
              <th scope="col">Match</th>
            </tr>
          </thead>
          <tbody>
            {job.rows.map((r, i) => (
              <tr key={i} data-testid="match-row">
                <td data-label="What the advert asks for">
                  <b className="cv-req">{r.requirement}</b>
                  <span className="cv-small cv-muted">
                    {r.priority === "required" ? "Required" : "Preferred"}
                    {r.quote && r.quote.replace(/[.\s]+$/, "") !== r.requirement.replace(/[.\s]+$/, "") ? ` · ${r.quote}` : ""}
                  </span>
                </td>
                <td data-label="Evidence in your CV">{r.evidence ? <q>{r.evidence}</q> : <span className="cv-muted">No evidence found</span>}</td>
                <td data-label="Match">
                  <span className="cv-chip" data-status={r.status === "Shown" ? undefined : r.status === "Missing" ? "missing" : "partly"}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function LetterChecks({ checks }: { checks: LetterCheck[] }) {
  return (
    <Panel title="Cover letter checks" data-testid="letter-checks">
      <div className="cv-pad">
        <ul className="cv-lettercheck">
          {checks.map((c) => (
            <li key={c.id}>
              <span className="cv-readrow-head">
                <span className="min-w-0">
                  <b>{c.name}</b>
                  <span className="cv-small cv-muted">{c.detail}</span>
                </span>
                <span className="cv-chip" data-status={c.state === "review" ? "partly" : c.state === "ok" ? "ok" : undefined}>
                  {STATE_WORDS[c.state]}
                </span>
              </span>
              {c.items.length > 0 && c.id !== "greeting" && (
                <ul className="cv-small">
                  {c.items.slice(0, 6).map((t, i) => (
                    <li key={i}>
                      <q>{t}</q>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

/** The report for one check: the audit, and the job match when an advert was given. */
export function CheckReport({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<Loaded | null>(null);
  const [problem, setProblem] = useState("");
  const [tab, setTab] = useState<"cv" | "letter">("cv");
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(() => {
    setProblem("");
    api<Loaded>(`/api/cv/check/${id}`)
      .then((d) => {
        setData(d);
        setTab(d.report.cv ? "cv" : "letter");
      })
      .catch((err) => setProblem(messageOf(err)));
  }, [id]);
  useEffect(load, [load]);

  const crumbs = [{ label: "CVs and letters", href: "/cv" }, { label: "Check your document", href: "/cv/check" }, { label: "Report" }];
  if (problem) {
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area">
          <Toolbar title="We couldn’t complete your report. Try again." subtitle={problem}>
            <Btn kind="primary" onClick={load}>
              Try again
            </Btn>
            <BtnLink href="/cv/check">Check another document</BtnLink>
          </Toolbar>
        </div>
      </CvScreen>
    );
  }
  if (!data) {
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area" aria-busy="true">
          <Toolbar title="Checking your document" />
          <Skeleton height={260} />
        </div>
      </CvScreen>
    );
  }
  const { report } = data;
  const cv = report.cv;
  const letter = report.letter;
  const job = report.job;
  const builder = cv ? `/cv/from-check/${id}` : letter ? `/cv/from-check/${id}?then=letter` : null;
  const showing = tab === "cv" && cv ? "cv" : "letter";
  const cvWord = report.region === "us" ? "resume" : "CV";

  return (
    <CvScreen>
      <Bar crumbs={crumbs} />
      <div className="cv-area">
        <Toolbar title={job ? "Job match report" : "Audit report"} subtitle={job ? "Your document checked against the selected job advert." : "Your score, software read-back and highest-priority fixes."}>
          {builder && (
            <BtnLink kind="primary" href={builder}>
              Fix this in the builder
            </BtnLink>
          )}
        </Toolbar>

        {cv && letter && (
          <span className="cv-seg" role="group" aria-label="Which document" style={{ marginBottom: 14 }}>
            <button type="button" aria-pressed={showing === "cv"} onClick={() => setTab("cv")}>
              {report.region === "us" ? "Resume" : "CV"}
            </button>
            <button type="button" aria-pressed={showing === "letter"} onClick={() => setTab("letter")}>
              Cover letter
            </button>
          </span>
        )}

        {showing === "cv" && job && <JobMatch job={job} id={id} />}

        {showing === "cv" && cv ? (
          <div className="cv-reportgrid">
            <div className="cv-stack cv-report-main">
              {cv.thin && (
                <p className="cv-note" style={{ margin: 0 }}>
                  There is not much here to score yet: {cv.thin.have === 1 ? "1 line" : `${cv.thin.have} lines`} saying what you did, where a {cvWord} needs at least {cv.thin.need}.
                </p>
              )}
              <Findings findings={cv.findings} base={builder} label="cv" />
              <ReadBack cv={cv} />
            </div>
            <div className="cv-stack cv-report-side">
              <ScoreBox title={report.region === "us" ? "Resume score" : "CV score"} shown={cv.shown} band={cv.band} parts={cv.parts} testId="cv-score" />
              <NextSteps hasJob={!!job} docType={report.docType} builder={builder} />
            </div>
          </div>
        ) : letter ? (
          <div className="cv-reportgrid">
            <div className="cv-stack cv-report-main">
              <LetterChecks checks={letter.checks} />
              <Findings findings={letter.findings.map((f) => ({ ...f, severity: "suggestion" }))} base={builder} label="letter" />
            </div>
            <div className="cv-stack cv-report-side">
              <ScoreBox title="Cover letter score" shown={letter.shown} band={letter.band} parts={letter.parts} testId="letter-score" />
              {letter.parts.some((p) => p.pending > 0) && (
                <p className="cv-small cv-muted cv-score-note" style={{ margin: 0 }}>
                  The score is out of what could be checked. {!job ? "Add the job advert to check relevance to it." : ""} {report.docType === "cover" ? `Add your ${cvWord} to check each claim against it.` : ""}
                </p>
              )}
              <NextSteps hasJob={!!job} docType={report.docType} builder={builder} />
            </div>
          </div>
        ) : null}

        <p className="cv-small cv-muted" style={{ marginTop: 18 }}>
          This check is kept with your account until {dateWords(data.expiresAt)}, then deleted.{" "}
          <button
            type="button"
            className="cv-link"
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              try {
                await api(`/api/cv/check/${id}`, { method: "DELETE" });
                router.push("/cv");
              } catch (err) {
                setDeleting(false);
                setProblem(messageOf(err));
              }
            }}
          >
            Delete this check now
          </button>
        </p>
      </div>
    </CvScreen>
  );
}

function NextSteps({ hasJob, docType, builder }: { hasJob: boolean; docType: Report["docType"]; builder: string | null }) {
  return (
    <Panel title="Next steps" className="cv-nextpanel">
      <div className="cv-pad cv-nextsteps">
        {builder && (
          <BtnLink kind="primary" href={builder}>
            Fix this in the builder
          </BtnLink>
        )}
        {!hasJob && <BtnLink href={`/cv/check?job=1${docType === "cv" ? "" : `&type=${docType}`}`}>Check against a job</BtnLink>}
        {docType === "cover" && <BtnLink href="/cv/check?type=both">Check it with your CV</BtnLink>}
        <BtnLink kind="quiet" href="/cv">
          Back to your documents
        </BtnLink>
      </div>
    </Panel>
  );
}

export type { CvFinding };
