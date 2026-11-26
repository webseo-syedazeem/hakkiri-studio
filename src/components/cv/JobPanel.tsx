"use client";

import { useMemo, useState } from "react";
import { type CvDoc, type Locator, type Requirement } from "@/lib/cv/schema";
import { confirmExperience, homesFor } from "@/lib/cv/tailor/confirm";
import { jobFit } from "@/lib/cv/tailor/fit";
import { extractRequirements } from "@/lib/cv/tailor/requirements";
import { asBullet } from "@/lib/cv/write/draft";
import { Dialog } from "./Dialog";
import { Btn, CvSelect, Field, Panel } from "./ui";

type Update = (patch: Partial<CvDoc>) => void;

/**
 * The job keywords beside the page, when the CV is aimed at a job: how many
 * of the things the advert asks for the CV shows, then the ones it doesn't,
 * one at a time. "Yes, I've done this" asks where and how, in the person's
 * own words, and adds that line only once they approve it; "Not relevant"
 * puts it aside; "I don't have this" records the gap. Nothing is written for
 * the person, and nothing is marked as shown because they said yes.
 */
export function JobPanel({ cv, update, word, onShow, say }: { cv: CvDoc; update: Update; word: string; onShow: (at: Locator) => void; say: (s: string) => void }) {
  const [aiming, setAiming] = useState(false);
  const [job, setJob] = useState({ title: "", employer: "", advert: "" });
  const [problem, setProblem] = useState("");
  const [adding, setAdding] = useState<Requirement | null>(null);
  const [words, setWords] = useState("");
  const [home, setHome] = useState("");
  const [reviewing, setReviewing] = useState(false);
  // A CV made from an example is aimed at its job before anything has been compared: read the advert's
  // requirements here, and save them only once the person acts on one.
  const advert = cv.target?.advert ?? "";
  const derived = useMemo(() => (advert.trim().length >= 40 ? extractRequirements(advert) : []), [advert]);
  const doc = useMemo(() => (cv.requirements.length || !derived.length ? cv : { ...cv, requirements: derived }), [cv, derived]);
  const fit = useMemo(() => (doc.requirements.length ? jobFit(doc) : null), [doc]);
  const homes = homesFor(doc);
  const setReq = (id: string, change: Partial<Requirement>) => update({ requirements: doc.requirements.map((r) => (r.id === id ? { ...r, ...change } : r)) });

  function openAim() {
    setJob({ title: cv.target?.title ?? "", employer: cv.target?.employer ?? "", advert: cv.target?.advert ?? "" });
    setProblem("");
    setAiming(true);
  }
  function aim() {
    if (!job.title.trim() || job.advert.trim().length < 40) return setProblem("Add the job title and the advert.");
    const requirements = extractRequirements(job.advert);
    if (!requirements.length) return setProblem("We couldn’t identify requirements in this advert. Check the text.");
    // Aiming at a job never changes the words of the CV: only what it is compared with.
    update({ target: { title: job.title.trim(), employer: job.employer.trim(), advert: job.advert.trim() }, requirements });
    setAiming(false);
    say(`Now aimed at ${job.title.trim()}${job.employer.trim() ? `, ${job.employer.trim()}` : ""}.`);
  }
  function startAdding(r: Requirement) {
    setAdding(r);
    setWords("");
    setHome(homes[0]?.e.id ?? "");
    setReviewing(false);
    setProblem("");
  }
  function review() {
    if (!words.trim()) return setProblem("Describe your own experience first.");
    if (asBullet(words).split(" ").length < 3) return setProblem("Say what you did and where, in a sentence or two. “Yes” alone can’t go on a CV.");
    if (!homes.length) return setProblem(`Add a role, a project or a qualification to your ${word} first, so this line has somewhere to go.`);
    setProblem("");
    setReviewing(true);
  }
  function approve() {
    if (!adding) return;
    const done = confirmExperience(doc, adding.id, words, home);
    if (!done.ok) return setProblem(done.problem);
    update(done.patch);
    setAdding(null);
    say("Your approved line was added.");
  }

  if (!fit || !cv.target) {
    return (
      <Panel title="Job keywords" data-testid="job-panel">
        <div className="cv-pad cv-stack">
          <p className="cv-muted" style={{ margin: 0 }}>
            No job selected. Add an advert to compare what it asks for with your {word}.
          </p>
          <Btn onClick={openAim}>Add a job advert</Btn>
        </div>
        {aiming && <AimDialog job={job} setJob={setJob} problem={problem} onClose={() => setAiming(false)} onSave={aim} />}
      </Panel>
    );
  }

  const queue = fit.rows.filter((r) => r.status !== "met" && !r.requirement.gap && !r.requirement.dismissed);
  const shown = fit.rows.filter((r) => r.status === "met");
  const gaps = fit.rows.filter((r) => r.requirement.gap);
  const next = queue[0];
  return (
    <Panel title="Job keywords" data-testid="job-panel">
      <div className="cv-pad cv-stack">
        <div>
          <p className="cv-muted" style={{ margin: 0 }}>
            Aimed at: {[cv.target.title, cv.target.employer].filter(Boolean).join(", ")}
          </p>
          <div className="cv-row" style={{ gap: 10 }}>
            <button type="button" className="cv-link" onClick={openAim}>
              Change
            </button>
            <button type="button" className="cv-link" onClick={() => update({ target: undefined, requirements: [] })}>
              Remove
            </button>
          </div>
        </div>
        <div>
          <b>
            {fit.counts.met} of {fit.rows.length} things the advert asks for are on your {word}
          </b>
          <span className="cv-meter" aria-hidden="true" style={{ marginTop: 8 }}>
            <span style={{ width: `${Math.round((fit.counts.met / Math.max(1, fit.rows.length)) * 100)}%` }} />
          </span>
        </div>
        {next ? (
          <div className="cv-keyword" data-testid="keyword-next">
            <div className="cv-row" style={{ justifyContent: "space-between" }}>
              <span className="cv-chip" data-status={next.status}>
                {next.status === "partly" ? "Partly shown" : "Missing"}
              </span>
              <small className="cv-muted">{queue.length} to review</small>
            </div>
            <b>{next.requirement.text || next.requirement.quote}</b>
            {next.requirement.quote && next.requirement.quote !== next.requirement.text && <p className="cv-quote">{next.requirement.quote}</p>}
            <div className="cv-stack" style={{ gap: 8 }}>
              <Btn kind="primary" onClick={() => startAdding(next.requirement)}>
                Yes, I’ve done this
              </Btn>
              <Btn onClick={() => setReq(next.requirement.id, { dismissed: true })}>Not relevant</Btn>
              <Btn
                onClick={() => {
                  setReq(next.requirement.id, { gap: true, evidence: [], judged: undefined, uncovered: "" });
                  say("Gap recorded.");
                }}
              >
                I don’t have this
              </Btn>
            </div>
          </div>
        ) : (
          <p className="cv-muted" style={{ margin: 0 }}>
            All current requirements reviewed.
          </p>
        )}
        <div>
          <b>Already on your {word}</b>
          {shown.length ? (
            <ul className="cv-keyword-list">
              {shown.map((r) => (
                <li key={r.requirement.id}>
                  <button type="button" className="cv-chip cv-chip-ok" onClick={() => r.lines[0] && onShow(r.lines[0].at)} disabled={!r.lines[0]}>
                    ✓ {r.requirement.text || r.requirement.quote}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cv-muted" style={{ margin: "4px 0 0" }}>
              No confirmed keywords yet.
            </p>
          )}
        </div>
        {gaps.length > 0 && (
          <p className="cv-muted" style={{ margin: 0 }}>
            Recorded gaps: {gaps.map((g) => g.requirement.text || g.requirement.quote).join("; ")}
          </p>
        )}
      </div>

      {aiming && <AimDialog job={job} setJob={setJob} problem={problem} onClose={() => setAiming(false)} onSave={aim} />}
      {adding && (
        <Dialog
          title={reviewing ? "Review your line" : "Add your experience"}
          onClose={() => setAdding(null)}
          wide
          actions={
            reviewing ? (
              <>
                <Btn onClick={() => setReviewing(false)}>Edit wording</Btn>
                <Btn kind="primary" onClick={approve}>
                  Approve and add
                </Btn>
              </>
            ) : (
              <>
                <Btn onClick={() => setAdding(null)}>Cancel</Btn>
                <Btn kind="primary" onClick={review}>
                  Review suggested line
                </Btn>
              </>
            )
          }
        >
          <p>
            The advert asks for <b>“{adding.text || adding.quote}”</b>.
          </p>
          {reviewing ? (
            <>
              <p className="cv-muted">Approve your wording before it is added to your experience.</p>
              <p className="cv-quote" data-testid="approve-line">
                {asBullet(words)}
              </p>
              <p className="cv-small">Under: {(() => { const h = homes.find((x) => x.e.id === home) ?? homes[0]; return h ? [h.e.title, h.e.org].filter(Boolean).join(" · ") : ""; })()}</p>
              {problem && (
                <p className="cv-error-text" role="alert">
                  {problem}
                </p>
              )}
            </>
          ) : (
            <>
              <Field label="Where and how? One or two sentences in your own words" rule="Describe what you actually did. This becomes a line on your CV, so say only what you could explain in an interview." multiline rows={3} maxLength={600} value={words} onChange={setWords} error={problem} />
              {homes.length > 0 && (
                <div>
                  <label className="cv-label" htmlFor="cv-kw-home">
                    Add under
                  </label>
                  <CvSelect id="cv-kw-home" value={home} onChange={setHome} options={homes.map(({ e }) => ({ value: e.id, label: [e.title, e.org].filter(Boolean).join(" · ") }))} />
                </div>
              )}
            </>
          )}
        </Dialog>
      )}
    </Panel>
  );
}

function AimDialog({ job, setJob, problem, onClose, onSave }: { job: { title: string; employer: string; advert: string }; setJob: (j: { title: string; employer: string; advert: string }) => void; problem: string; onClose: () => void; onSave: () => void }) {
  return (
    <Dialog
      title="Aim at a job"
      onClose={onClose}
      wide
      actions={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn kind="primary" onClick={onSave}>
            Set job
          </Btn>
        </>
      }
    >
      <div className="cv-pair">
        <Field label="Job title" maxLength={160} value={job.title} onChange={(title) => setJob({ ...job, title })} />
        <Field label="Employer" maxLength={160} value={job.employer} onChange={(employer) => setJob({ ...job, employer })} />
      </div>
      <Field label="Job advert" rule="Paste all of it. What it asks for is read from it, word for word." multiline rows={8} maxLength={20000} value={job.advert} onChange={(advert) => setJob({ ...job, advert })} error={problem} />
    </Dialog>
  );
}
