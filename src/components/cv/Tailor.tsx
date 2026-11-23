"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addBullets } from "@/lib/cv/edit";
import { type Locator, type Requirement, newBullet, newId } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { type Assessed, cvLines, fitMaths, jobFit, keywords } from "@/lib/cv/tailor/fit";
import { bestRoleFor, mergeRequirements } from "@/lib/cv/tailor/propose";
import { extractRequirements, manualRequirement, readingNote } from "@/lib/cv/tailor/requirements";
import { asBullet } from "@/lib/cv/write/draft";
import { api, messageOf } from "./client";
import { Dialog, usePanel } from "./Dialog";
import { PaperView } from "./Paper";
import { Bar, Btn, BtnLink, CvScreen, Field, Panel, Skeleton, Toolbar } from "./ui";
import { useWorkspace } from "./Workspace";

const STATUS = { met: "Met", partly: "Partly met", missing: "Missing" } as const;
const same = (a: Locator, b: Locator) => a.section === b.section && (a.entry ?? "") === (b.entry ?? "") && (a.field ?? "") === (b.field ?? "");

/** Job fit as it is said on screen: the number, or why there is none. */
export function fitLabel(score: number | null | undefined): string {
  return score === null || score === undefined ? "Tailor to a job" : `Job fit ${score}`;
}

/**
 * Tailoring: what the advert asks for, row by row, each with the line of the
 * CV that shows it. Job fit is worked out from those rows and nothing else.
 * A requirement the CV does not show is asked about ("Do you have this?"):
 * yes means saying what was done and where; no records the gap.
 */
export function Tailor() {
  const router = useRouter();
  const w = useWorkspace();
  const { cv, load, update, flush, paper } = w;
  const { panel, item, open, close } = usePanel();
  const [selected, setSelected] = useState("");
  const [pane, setPane] = useState<"advert" | "paper">("advert");
  const [term, setTerm] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  // The forms inside the dialogs.
  const [job, setJob] = useState({ title: "", employer: "", advert: "" });
  const [draft, setDraft] = useState({ text: "", priority: "required" as Requirement["priority"] });
  const [links, setLinks] = useState<{ evidence: Locator[]; judged: "met" | "partly"; uncovered: string }>({ evidence: [], judged: "met", uncovered: "" });
  const [line, setLine] = useState("");
  const [roleId, setRoleId] = useState("");

  const fit = useMemo(() => (cv ? jobFit(cv) : null), [cv]);
  const terms = useMemo(() => (cv ? keywords(cv) : []), [cv]);
  const lines = useMemo(() => (cv ? cvLines(cv) : []), [cv]);
  const row = fit?.rows.find((r) => r.requirement.id === (item || selected)) ?? null;
  const req = row?.requirement;

  // Each dialog opens with the current values.
  const reqId = req?.id;
  useEffect(() => {
    setProblem("");
    if (!cv) return;
    if (panel === "edit-advert") setJob({ title: cv.target?.title ?? "", employer: cv.target?.employer ?? "", advert: cv.target?.advert ?? "" });
    if (panel === "edit-requirement") setDraft(req ? { text: req.text, priority: req.priority } : { text: "", priority: "required" });
    if (panel === "link-evidence" && req) setLinks({ evidence: req.evidence.filter((at) => lines.some((l) => same(l.at, at))), judged: req.judged ?? "met", uncovered: req.uncovered });
    if (panel === "confirm-experience" && req) {
      setLine("");
      setRoleId(bestRoleFor(cv, req.text || req.quote)?.entryId ?? "");
    }
    // Only when a dialog opens or its subject changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel, reqId]);

  const crumbs = [{ label: "CVs and letters", href: "/cv" }, { label: cv?.name ?? "CV", href: `/cv/v/${w.versionId}/edit/contact` }, { label: "Tailor" }];
  if (load === "loading")
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area" aria-busy="true" aria-label="Loading your CV">
          <Skeleton height={320} />
        </div>
      </CvScreen>
    );
  if (load !== "ready" || !cv || !fit)
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
  const base = `/cv/v/${cv.id}`;
  const advert = cv.target?.advert ?? "";
  // Where a new line can go: a role, a project, volunteering or a qualification. Someone with no jobs yet has the last three.
  const roles = cv.sections.flatMap((s) => (s.visible && "entries" in s && (s.kind === "experience" || s.kind === "projects" || s.kind === "volunteering" || s.kind === "education") ? s.entries.filter((e) => e.visible && (e.title.trim() || e.org.trim())).map((e) => ({ e, s })) : []));
  const setReq = (id: string, change: Partial<Requirement>) => update({ requirements: cv.requirements.map((r) => (r.id === id ? { ...r, ...change } : r)) });
  const pick = (r: Assessed) => {
    setSelected(r.requirement.id);
    setTerm("");
    if (r.lines[0]) w.setFocus(r.lines[0].at);
  };

  function saveAdvert() {
    const text = job.advert.replace(/\r/g, "").trim();
    if (!job.title.trim() && !job.employer.trim()) return setProblem("Give the job title or the employer.");
    if (text.replace(/\s/g, "").length < 40) return setProblem("Paste the job advert.");
    // Requirements whose words are still in the advert keep everything done with them.
    update({ target: { title: job.title.trim(), employer: job.employer.trim(), advert: text }, requirements: mergeRequirements(cv!.requirements, extractRequirements(text), text) });
    close();
  }

  async function makeVersion() {
    setBusy(true);
    setProblem("");
    try {
      await flush();
      const made = await api<{ id: string }>(`/api/cv/versions/${cv!.id}/tailor`, { method: "POST", json: { title: cv!.target?.title ?? "", employer: cv!.target?.employer ?? "", advert } });
      router.push(`/cv/v/${made.id}/tailor`);
    } catch (err) {
      setProblem(messageOf(err));
      setBusy(false);
    }
  }

  function saveRequirement() {
    const text = draft.text.replace(/\s+/g, " ").trim();
    if (text.split(" ").length < 2) return setProblem("Say what the advert asks for, in a few words.");
    if (req) setReq(req.id, { text, priority: draft.priority });
    else {
      const made = manualRequirement(text, draft.priority);
      update({ requirements: [...cv!.requirements, made] });
      setSelected(made.id);
    }
    close();
  }

  function split() {
    if (!req) return;
    const parts = draft.text.split(/\s*;\s*|\s+and\s+|\s*,\s*(?:and\s+)?/i).map((p) => p.trim()).filter((p) => p.split(" ").length >= 2);
    if (parts.length < 2) return setProblem("There is nothing to split: this reads as one thing.");
    const at = cv!.requirements.findIndex((r) => r.id === req.id);
    const made = parts.map((p, i) => (i === 0 ? { ...req, text: p, priority: draft.priority } : { ...manualRequirement(p, draft.priority), quote: req.quote, text: p }));
    update({ requirements: [...cv!.requirements.slice(0, at), ...made, ...cv!.requirements.slice(at + 1)].slice(0, 40) });
    close();
  }

  function saveLinks() {
    if (!req) return;
    if (links.evidence.length && links.judged === "partly" && !links.uncovered.trim()) return setProblem("Say which part your evidence doesn’t cover.");
    setReq(req.id, links.evidence.length ? { evidence: links.evidence, judged: links.judged, uncovered: links.judged === "partly" ? links.uncovered.trim() : "", gap: false } : { evidence: [], judged: undefined, uncovered: "" });
    close();
  }

  function confirmExperience() {
    if (!req) return;
    const text = asBullet(line);
    if (text.split(" ").length < 3) return setProblem("Say what you did and where, in one line. “Yes” alone can’t go on a CV.");
    // The list shows its first entry as chosen until another is picked: that is the one used.
    const home = roles.find((r) => r.e.id === roleId) ?? roles[0];
    if (!home) return setProblem("Add a role, a project or a qualification to your CV first, so this line has somewhere to go. What you typed is kept here until you close this.");
    const bullet = { ...newBullet(text), sources: [{ kind: "typed" as const, ref: "requirement", text: line.trim() }] };
    const out = addBullets(cv!.sections, home.s.id, home.e.id, [bullet]);
    update({
      sections: out.sections,
      requirements: cv!.requirements.map((r) => (r.id === req.id ? { ...r, evidence: [{ section: home.s.id, entry: home.e.id, field: bullet.id }], judged: "met" as const, uncovered: "", gap: false } : r)),
      changes: [...cv!.changes, { id: newId("c_"), at: new Date().toISOString(), kind: "included" as const, where: [home.e.title, home.e.org].filter(Boolean).join(" · "), before: "", after: text, reason: `You said you have this, and where: “${(req.text || req.quote).slice(0, 120)}”.`, requirementId: req.id }].slice(-200),
    });
    close();
  }

  const none = !advert.trim();
  const shown = row && lines.find((l) => row.lines[0] && same(l.at, row.lines[0].at));
  return (
    <CvScreen>
      <Bar crumbs={crumbs}>
        <BtnLink href={`${base}/edit/contact`} onClick={() => void flush()}>
          Back to the builder
        </BtnLink>
      </Bar>
      <div className="cv-area">
        <Toolbar eyebrow={[cv.target?.title, cv.target?.employer].filter(Boolean).join(" · ") || cv.name} title="Tailor to this job" subtitle={`What the advert asks for, and where your ${word} shows it.`}>
          <Btn onClick={() => open("edit-advert")}>{none ? "Paste the advert" : "Edit advert"}</Btn>
          {!none && (
            <BtnLink href={`${base}/letter`} onClick={() => void flush()}>
              Cover letter
            </BtnLink>
          )}
          {!none && (
            <BtnLink kind="primary" href={`${base}/changes/proposed`} onClick={() => void flush()}>
              Review proposed changes
            </BtnLink>
          )}
        </Toolbar>

        {cv.kind === "base" && !none && (
          <div className="cv-note cv-row" style={{ marginBottom: 18 }} data-testid="base-note">
            <span className="min-w-0 grow">This is your base {word}. Tailoring is best done on a copy, so your base keeps everything.</span>
            <Btn busy={busy} onClick={() => void makeVersion()}>
              Make a tailored version
            </Btn>
          </div>
        )}
        {problem && !panel && (
          <p className="cv-error-text" role="alert" style={{ marginBottom: 12 }}>
            {problem}
          </p>
        )}

        {none ? (
          <Panel>
            <div className="cv-pad cv-stack" style={{ padding: "36px 24px", textAlign: "center" }}>
              <h2>Paste the job advert</h2>
              <p className="cv-muted" style={{ maxWidth: "56ch", margin: "8px auto 0" }}>
                Tailoring starts from the advert’s own words. We read what it asks for, you correct the reading, and each requirement is matched to a line of your {word}.
              </p>
              <div className="cv-row" style={{ justifyContent: "center", marginTop: 14 }}>
                <Btn kind="primary" onClick={() => open("edit-advert")}>
                  Paste the advert
                </Btn>
              </div>
            </div>
          </Panel>
        ) : (
          <div className="cv-layout" style={{ gridTemplateColumns: "minmax(0, 720fr) minmax(0, 448fr)" }}>
            <div className="cv-stack min-w-0">
              <Panel>
                <div className="cv-pad cv-stack" data-testid="fit">
                  {fit.score === null ? (
                    <>
                      <h2>No job fit yet</h2>
                      <p className="cv-muted">We couldn’t find anything in this advert that can be checked against a {word}. Add a requirement from its text, and fit is worked out from that.</p>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="cv-eyebrow">Job fit</span>
                        <p className="cv-scorebig" data-testid="fit-score">
                          {fit.score}
                          <small> / 100</small>
                        </p>
                        <small style={{ display: "block" }}>Evidence in this {word} for this advert</small>
                      </div>
                      <p data-testid="fit-words">
                        This {word} evidences {fit.counts.met} {fit.counts.met === 1 ? "requirement" : "requirements"} fully and {fit.counts.partly} partly. {fit.counts.missing} {fit.counts.missing === 1 ? "has" : "have"} no supporting {word} line.
                      </p>
                      <small style={{ display: "block" }} data-testid="fit-maths">
                        {fitMaths(fit)}. Required counts 2, preferred 1; met earns it all, partly met half. There is no minimum, and a low fit never stops a download.
                      </small>
                    </>
                  )}
                </div>
              </Panel>

              <Panel
                title={`What the advert asks for (${fit.rows.length})`}
                aside={
                  <Btn kind="quiet" onClick={() => (setSelected(""), open("edit-requirement"))}>
                    + Add a requirement
                  </Btn>
                }
              >
                {readingNote(advert, fit.rows.length) && (
                  <p className="cv-note" style={{ margin: "12px 18px 0" }} data-testid="reading-note">
                    {readingNote(advert, fit.rows.length)}
                  </p>
                )}
                {fit.rows.length === 0 && <p className="cv-pad cv-muted">Nothing found to check. Use “Add a requirement” with words from the advert.</p>}
                <ul className="cv-plainlist">
                  {fit.rows.map((r) => {
                    const q = r.requirement;
                    const isSel = q.id === selected;
                    return (
                      <li key={q.id} className="cv-req" data-status={r.status} data-selected={isSel || undefined} data-req={q.text}>
                        <div className="cv-row" style={{ gap: 8 }}>
                          <span className="cv-chip cv-status" data-status={r.status}>
                            {STATUS[r.status]}
                          </span>
                          <label className="cv-row" style={{ gap: 6, fontSize: 12 }}>
                            <span className="sr-only">Priority of: {q.text}</span>
                            <select className="cv-mini" value={q.priority} onChange={(e) => setReq(q.id, { priority: e.target.value as Requirement["priority"] })}>
                              <option value="required">Required (2)</option>
                              <option value="preferred">Preferred or not stated (1)</option>
                            </select>
                          </label>
                          <small className="cv-push">
                            {r.earned} of {r.weight}
                          </small>
                        </div>
                        <button type="button" className="cv-text-passage cv-req-quote" onClick={() => pick(r)} aria-pressed={isSel}>
                          “{q.quote}”
                        </button>
                        {q.text !== q.quote.replace(/[.]$/, "") && <small style={{ display: "block" }}>Read as: {q.text}</small>}
                        {r.lines.map((l) => (
                          <p key={`${l.at.entry}${l.at.field}`} className="cv-req-line">
                            <span className="cv-eyebrow">{l.by === "you" ? "You linked" : l.kind === "skill" ? "Listed skill" : "Shown by"}</span> {l.text}
                          </p>
                        ))}
                        {r.note && <p className={r.status === "missing" ? "cv-small cv-warn" : "cv-small"}>{r.note}</p>}
                        <div className="cv-row" style={{ gap: 8, marginTop: 8 }}>
                          {q.gap ? (
                            <Btn onClick={() => setReq(q.id, { gap: false })}>I do have this</Btn>
                          ) : (
                            r.status !== "met" && (
                              <>
                                <span className="cv-small">Do you have this?</span>
                                <Btn onClick={() => (setSelected(q.id), open("confirm-experience", { item: q.id }))}>Yes, add my experience</Btn>
                                <Btn onClick={() => setReq(q.id, { gap: true, evidence: [], judged: undefined, uncovered: "" })}>No, record the gap</Btn>
                              </>
                            )
                          )}
                          <Btn kind="quiet" className="cv-push" onClick={() => (setSelected(q.id), open("link-evidence", { item: q.id }))}>
                            Link evidence
                          </Btn>
                          <Btn kind="quiet" onClick={() => (setSelected(q.id), open("edit-requirement", { item: q.id }))} aria-label={`Edit requirement: ${q.text}`}>
                            Edit
                          </Btn>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Panel>

              {terms.length > 0 && (
                <Panel title="The advert’s own terms" data-testid="terms">
                  <div className="cv-pad cv-stack">
                    <div>
                      <h3>On your {word}</h3>
                      <div className="cv-row" style={{ gap: 6, marginTop: 6 }}>
                        {terms.filter((t) => t.matched).map((t) => (
                          <button key={t.term} type="button" className="cv-chip cv-skillchip" aria-pressed={term === t.term} onClick={() => (setTerm(term === t.term ? "" : t.term), setPane("paper"))}>
                            ✓ {t.term}
                          </button>
                        ))}
                        {!terms.some((t) => t.matched) && <small>None yet.</small>}
                      </div>
                    </div>
                    <div>
                      <h3>Not on your {word}</h3>
                      <div className="cv-row" style={{ gap: 6, marginTop: 6 }}>
                        {terms.filter((t) => !t.matched).map((t) => (
                          <span key={t.term} className="cv-chip">
                            {t.term}
                          </span>
                        ))}
                        {terms.every((t) => t.matched) && <small>None.</small>}
                      </div>
                    </div>
                    <small style={{ display: "block" }}>A guide to wording, not the score. Press a term to see where it is on the page. Saying it more than once earns nothing, and words are never hidden in the file.</small>
                  </div>
                </Panel>
              )}
            </div>

            <aside className="cv-sticky min-w-0" aria-label="The advert and the page">
              <div className="cv-seg" role="group" aria-label="Show" style={{ marginBottom: 10 }}>
                <button type="button" aria-pressed={pane === "advert"} onClick={() => setPane("advert")}>
                  Advert
                </button>
                <button type="button" aria-pressed={pane === "paper"} onClick={() => setPane("paper")}>
                  Paper
                </button>
              </div>
              {pane === "advert" ? (
                <Panel title="The advert" data-testid="advert">
                  <div className="cv-source cv-pad" style={{ whiteSpace: "pre-wrap" }} tabIndex={0} role="region" aria-label="The advert, word for word">
                    {(() => {
                      const at = req ? advert.indexOf(req.quote) : -1;
                      if (at < 0 || !req) return advert;
                      return (
                        <>
                          {advert.slice(0, at)}
                          <mark className="cv-mark">{req.quote}</mark>
                          {advert.slice(at + req.quote.length)}
                        </>
                      );
                    })()}
                  </div>
                  {shown && (
                    <div className="cv-pad" style={{ borderTop: "1px solid var(--color-line)" }}>
                      <span className="cv-eyebrow">On your {word}</span>
                      <p style={{ marginTop: 4 }}>{shown.text}</p>
                    </div>
                  )}
                </Panel>
              ) : (
                <PaperView paper={paper} state={w.state} retry={w.retryPaper} cv={cv} focus={row?.lines[0]?.at ?? null} word={word} highlight={term} />
              )}
            </aside>
          </div>
        )}
      </div>

      {panel === "edit-advert" && (
        <Dialog
          title={none ? "Paste the job advert" : "Edit advert"}
          onClose={close}
          wide
          actions={
            <>
              <Btn onClick={close}>Cancel</Btn>
              <Btn kind="primary" onClick={saveAdvert}>
                Save and read requirements
              </Btn>
            </>
          }
        >
          <div className="cv-pair">
            <Field label="Job title" value={job.title} onChange={(title) => setJob({ ...job, title })} maxLength={160} />
            <Field label="Employer" value={job.employer} onChange={(employer) => setJob({ ...job, employer })} maxLength={160} />
          </div>
          <Field label="The advert" rule="Paste all of it. It is kept word for word." multiline rows={10} maxLength={20000} value={job.advert} onChange={(a) => setJob({ ...job, advert: a })} error={problem} />
          <small style={{ display: "block" }}>Requirements you have already worked on are kept while their words are still in the advert.</small>
        </Dialog>
      )}

      {panel === "edit-requirement" && (
        <Dialog
          title={req ? "Edit requirement" : "Add a requirement"}
          onClose={close}
          actions={
            <>
              {req && (
                <Btn
                  kind="danger"
                  onClick={() => {
                    update({ requirements: cv.requirements.filter((r) => r.id !== req.id) });
                    close();
                  }}
                >
                  Remove
                </Btn>
              )}
              {req && <Btn onClick={split}>Split into separate requirements</Btn>}
              <Btn kind="primary" onClick={saveRequirement}>
                Save
              </Btn>
            </>
          }
        >
          {req && (
            <blockquote className="cv-quote" style={{ marginTop: 0 }}>
              {req.quote}
            </blockquote>
          )}
          <Field label={req ? "What it asks for" : "Words from the advert"} rule={req ? "Your reading of the advert’s words. The advert’s own wording above is kept." : "Copy the words from the advert that say what is wanted."} multiline rows={2} maxLength={300} value={draft.text} onChange={(text) => setDraft({ ...draft, text })} error={problem} />
          <div>
            <label className="cv-label" htmlFor="cv-req-priority">
              Priority
            </label>
            <select id="cv-req-priority" className="cv-input" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Requirement["priority"] })}>
              <option value="required">Required (counts 2)</option>
              <option value="preferred">Preferred or not stated (counts 1)</option>
            </select>
          </div>
        </Dialog>
      )}

      {panel === "link-evidence" && req && (
        <Dialog
          title="Link evidence"
          onClose={close}
          wide
          actions={
            <>
              <Btn onClick={close}>Cancel</Btn>
              <Btn kind="primary" onClick={saveLinks}>
                Save
              </Btn>
            </>
          }
        >
          <blockquote className="cv-quote" style={{ marginTop: 0 }}>
            {req.quote}
          </blockquote>
          <fieldset>
            <legend className="cv-label">Which lines of your {word} show this?</legend>
            <span className="cv-rule">Different words from the advert’s are fine, if the line shows the same thing.</span>
            <div className="cv-linklist">
              {lines
                .filter((l) => l.kind === "bullet" || l.kind === "profile" || l.kind === "item")
                .map((l) => {
                  const on = links.evidence.some((at) => same(at, l.at));
                  return (
                    <label key={`${l.at.section}${l.at.entry}${l.at.field}`} className="cv-row" style={{ gap: 8, alignItems: "flex-start", flexWrap: "nowrap" }}>
                      <input type="checkbox" checked={on} disabled={!on && links.evidence.length >= 8} onChange={() => setLinks({ ...links, evidence: on ? links.evidence.filter((at) => !same(at, l.at)) : [...links.evidence, l.at] })} style={{ marginTop: 4 }} />
                      <span>{l.text}</span>
                    </label>
                  );
                })}
            </div>
          </fieldset>
          {links.evidence.length > 0 && (
            <fieldset>
              <legend className="cv-label">How much of it do they show?</legend>
              <div className="cv-seg" style={{ marginTop: 6 }}>
                {(["met", "partly"] as const).map((j) => (
                  <label key={j}>
                    <input type="radio" name="judged" className="sr-only" checked={links.judged === j} onChange={() => setLinks({ ...links, judged: j })} />
                    <span>{j === "met" ? "All of it" : "Part of it"}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {links.evidence.length > 0 && links.judged === "partly" && <Field label="Which part is not covered?" rule="It is shown beside the requirement, and it earns half." value={links.uncovered} onChange={(uncovered) => setLinks({ ...links, uncovered })} maxLength={300} error={problem} />}
        </Dialog>
      )}

      {panel === "confirm-experience" && req && (
        <Dialog
          title="Do you have this?"
          onClose={close}
          wide
          actions={
            <>
              <Btn onClick={close}>Cancel</Btn>
              <Btn kind="primary" onClick={confirmExperience}>
                Add to my {word}
              </Btn>
            </>
          }
        >
          <p>
            The advert asks for <b>“{req.text || req.quote}”</b>. If you’ve done it, tell us what you did and where.
          </p>
          <Field label="What you did, in one line" rule="In your own words. This becomes a bullet on your CV, so say only what you could explain in an interview." multiline rows={2} maxLength={600} value={line} onChange={setLine} error={problem} />
          {roles.length === 0 ? (
            <p className="cv-note">Add a role, a project or a qualification to your {word} first, so this line has somewhere to go.</p>
          ) : (
            <div>
              <label className="cv-label" htmlFor="cv-req-role">
                Put it under
              </label>
              <select id="cv-req-role" className="cv-input" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                {roles.map(({ e }) => (
                  <option key={e.id} value={e.id}>
                    {[e.title, e.org].filter(Boolean).join(" · ")}
                    {bestRoleFor(cv, req.text || req.quote)?.entryId === e.id ? " (suggested)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          {line.trim() && (
            <div>
              <span className="cv-eyebrow">It will read</span>
              <p className="cv-quote" data-testid="experience-preview">
                {asBullet(line)}
              </p>
            </div>
          )}
          <small style={{ display: "block" }}>Nothing is added until you press “Add to my {word}”. We never write this line for you.</small>
        </Dialog>
      )}
    </CvScreen>
  );
}
