"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { stateAt } from "@/lib/cv/edit";
import { type Finding, GOOD_ENOUGH, GROUPS, type GroupId, type Score } from "@/lib/cv/score/score";
import { docWord, formatDate } from "@/lib/cv/sections";
import { Dialog, usePanel } from "./Dialog";
import { Bar, Btn, BtnLink, CvScreen, Panel, Skeleton, Toolbar } from "./ui";
import { useWorkspace } from "./Workspace";

const pts = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** The words a finding is about, with the phrase itself marked where it is known. */
export function Excerpt({ f, text }: { f: Finding; text?: string }) {
  const full = text ?? f.excerpt;
  if (!full) return null;
  if (!f.span || !text) return <q className="cv-excerpt">{full}</q>;
  const [a, b] = f.span;
  return (
    <q className="cv-excerpt">
      {text.slice(0, a)}
      <mark className="cv-underline" data-kind={f.severity}>
        {text.slice(a, b)}
      </mark>
      {text.slice(b)}
    </q>
  );
}

/** One line of the score for the builder's bar: the number, or what is needed before there is one. */
export function scoreLabel(score: Score | null, word: string): string {
  if (!score) return `${word.charAt(0).toUpperCase() + word.slice(1)} score`;
  if (score.empty) return "Add content to score";
  return `${word === "CV" ? "CV" : "Resume"} score ${score.shown}`;
}

/**
 * The CV score and what it is made of: one number, four groups, and every
 * finding with the line it is about. Each finding opens its line in the
 * builder. Fixing one moves it to Fixed and the number moves with it.
 */
export function Findings() {
  const router = useRouter();
  const w = useWorkspace();
  const { cv, load, score, cleared, locate, setFromFindings } = w;
  const { panel, open, close } = usePanel();
  const [group, setGroup] = useState<GroupId | "all">("all");

  useEffect(() => setFromFindings(false), [setFromFindings]);

  const crumbs = [{ label: "CVs and letters", href: "/cv" }, { label: cv?.name ?? "CV", href: `/cv/v/${w.versionId}/edit/contact` }, { label: "Score" }];
  if (load === "loading" || (load === "ready" && !score))
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area" aria-busy="true" aria-label="Working out your score">
          <Skeleton height={320} />
        </div>
      </CvScreen>
    );
  if (load !== "ready" || !cv || !score)
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
  const go = (f: Finding) => {
    setFromFindings(true);
    router.push(f.fix === "files" ? `${base}/software/${f.rule === "docx-readback" ? "docx" : "pdf"}` : `${base}/edit/${locate(f.at)}`);
  };
  const shown = score.findings.filter((f) => group === "all" || f.group === group);
  const issues = shown.filter((f) => f.severity === "issue");
  const suggestions = shown.filter((f) => f.severity === "suggestion");
  const past = cleared.filter((f) => group === "all" || f.group === group).map((f) => ({ f, state: stateAt(cv.sections, f.at) }));
  const fixed = past.filter((p) => p.state === "on");
  const excluded = past.filter((p) => p.state === "off");
  const fileIssue = score.groups.find((g) => g.id === "software")!.checks.find((c) => (c.id === "pdf-readback" || c.id === "docx-readback") && c.state === "scored" && c.earned === 0);
  const next = score.findings.find((f) => f.fix !== "files" && f.fix !== "finish") ?? score.findings[0];
  /** The text of the field a finding is about, so the phrase can be marked in it. */
  const textAt = (f: Finding) => {
    const s = cv.sections.find((x) => x.id === f.at.section);
    if (!s) return undefined;
    if (s.kind === "summary") return s.text;
    if ("entries" in s) return s.entries.find((e) => e.id === f.at.entry)?.bullets.find((b) => b.id === f.at.field)?.text;
    return undefined;
  };
  const row = (f: Finding, state?: "fixed" | "excluded") => (
    <li key={f.id} className="cv-finding" data-kind={state ?? f.severity} data-rule={f.rule}>
      <div className="min-w-0 grow">
        <span className="cv-finding-label">{state === "fixed" ? "✓ Fixed" : state === "excluded" ? "Excluded from this version" : f.severity === "issue" ? "Issue" : "Suggestion"}</span>
        {!state && <Excerpt f={f} text={textAt(f)} />}
        <p>
          {state ? <s>{f.reason}</s> : f.reason} {!state && <span className="cv-muted">{f.action}</span>}
        </p>
      </div>
      {!state && (
        <span className="cv-controls">
          {f.points >= 0.1 && <small>{score.groups.flatMap((g) => g.checks).find((c) => c.id === f.rule)?.state === "pending" ? `${pts(f.points)} pending` : `+${pts(f.points)}`}</small>}
          <Btn onClick={() => go(f)} aria-label={`Go to this line: ${f.reason}`}>
            {f.fix === "files" ? "Check the file" : f.fix === "finish" ? "Open Finish" : "Go to this line"}
          </Btn>
        </span>
      )}
    </li>
  );

  return (
    <CvScreen>
      <Bar crumbs={crumbs}>
        <BtnLink href={`${base}/edit/contact`}>Back to the builder</BtnLink>
      </Bar>
      <div className="cv-area">
        <h1 className="sr-only">
          {word === "CV" ? "CV" : "Resume"} score: {cv.name}
        </h1>
        <div className="cv-layout" style={{ gridTemplateColumns: "minmax(0, 320fr) minmax(0, 848fr)" }}>
          <div className="cv-stack cv-sticky">
            <Panel>
              <div className="cv-pad cv-stack">
                {score.empty ? (
                  <>
                    <h2>Add content to score</h2>
                    <p className="cv-muted">There is nothing to score yet. Add your details and what you did, and the score will follow.</p>
                    <BtnLink kind="primary" href={`${base}/edit/contact`}>
                      Add contact details
                    </BtnLink>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="cv-eyebrow">{word === "CV" ? "CV" : "Resume"} score</span>
                      <p className="cv-scorebig" data-testid="score">
                        {score.shown}
                        <small> / 100</small>
                      </p>
                      {score.pending > 0 && (
                        <small style={{ display: "block" }} data-testid="score-pending">
                          {pts(score.total)} points confirmed · {pts(score.pending)} pending
                        </small>
                      )}
                    </div>
                    <ul className="cv-plainlist" aria-label="The four parts of the score">
                      {score.groups.map((g) => (
                        <li key={g.id} className="cv-row" style={{ gap: 8 }} data-group={g.id}>
                          <span className="grow">{g.name}</span>
                          <b>
                            {pts(g.earned)} / {g.points}
                          </b>
                        </li>
                      ))}
                    </ul>
                    {score.goodEnough ? (
                      <div className="cv-note" data-testid="good-enough">
                        {fileIssue ? (
                          <>
                            Your writing is ready. {fileIssue.findings[0]?.reason} Fix the file before you send it.
                            <div className="cv-row" style={{ marginTop: 8 }}>
                              <BtnLink kind="primary" href={`${base}/software/${fileIssue.id === "docx-readback" ? "docx" : "pdf"}`}>
                                Review the {fileIssue.id === "docx-readback" ? "Word file" : "PDF"}
                              </BtnLink>
                            </div>
                          </>
                        ) : (
                          <>
                            Your {word} is good enough to apply. Stop polishing and send it when you’re ready.
                            <div className="cv-row" style={{ marginTop: 8 }}>
                              <BtnLink kind="primary" href={`${base}/edit/finish#files`}>
                                Export {word === "CV" ? "CV" : "resume"}
                              </BtnLink>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      next && (
                        <Btn kind="primary" onClick={() => go(next)}>
                          Fix next {next.severity === "issue" ? "issue" : "suggestion"}
                        </Btn>
                      )
                    )}
                    <Btn onClick={() => open("score-method")}>How this is scored</Btn>
                    <small style={{ display: "block" }}>Worked out in code from your {word} as it is now. {GOOD_ENOUGH} is good enough to apply; nothing here stops you downloading.</small>
                  </>
                )}
              </div>
            </Panel>
            {score.gaps.map((g) => (
              <Panel key={g.from} title="Be ready to explain this" data-testid="gap">
                <div className="cv-pad cv-stack">
                  <p>
                    {formatDate(g.from)} to {formatDate(g.to)}: {g.months} months that your dates don’t cover.
                  </p>
                  <small style={{ display: "block" }}>This costs no points, and you don’t have to put it on your {word}. Have an answer ready in case you are asked.</small>
                  <div className="cv-row">
                    <Link className="cv-btn" href="/practice">
                      Practise an answer
                    </Link>
                  </div>
                </div>
              </Panel>
            ))}
          </div>

          <div className="cv-stack">
            {!score.empty && (
              <div className="cv-seg" role="group" aria-label="Show findings for">
                {[{ id: "all" as const, name: "All" }, ...GROUPS].map((g) => (
                  <button key={g.id} type="button" aria-pressed={group === g.id} onClick={() => setGroup(g.id)}>
                    {g.name}
                  </button>
                ))}
              </div>
            )}
            {!score.empty && shown.length === 0 && (
              <Panel>
                <p className="cv-pad">Nothing to fix here.</p>
              </Panel>
            )}
            {[
              { title: "Issues", list: issues.map((f) => row(f)) },
              { title: "Suggestions", list: suggestions.map((f) => row(f)) },
              { title: "Fixed", list: fixed.map((p) => row(p.f, "fixed")) },
              { title: "Excluded from this version", list: excluded.map((p) => row(p.f, "excluded")) },
            ].map(
              (part) =>
                part.list.length > 0 && (
                  <Panel key={part.title} title={`${part.title} (${part.list.length})`} data-part={part.title}>
                    <ul className="cv-plainlist">{part.list}</ul>
                  </Panel>
                ),
            )}
          </div>
        </div>
      </div>

      {panel === "score-method" && (
        <Dialog title="How this is scored" onClose={close} wide readable>
          <p>
            One score out of 100, from 35 checks in four groups. Every check is worked out in code from your {word}: no AI, and no guessing. A check that doesn’t apply to you hands its points to the rest of its group.
          </p>
          {score.groups.map((g) => (
            <div key={g.id}>
              <h3>
                {g.name}: {pts(g.earned)} of {g.points}
              </h3>
              <table className="cv-method">
                <thead>
                  <tr>
                    <th scope="col">Check</th>
                    <th scope="col">Result</th>
                    <th scope="col">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {g.checks.map((c) => (
                    <tr key={c.id} data-check={c.id}>
                      <th scope="row">{c.title}</th>
                      <td>{c.state === "na" ? "Doesn’t apply" : c.state === "pending" ? "Not checked yet" : c.unit ? `${c.passed} of ${c.total} ${c.unit}` : c.passed ? "Yes" : "No"}</td>
                      <td>{c.state === "na" ? "–" : c.state === "pending" ? `${pts(c.points)} pending` : `${pts(c.earned)} of ${pts(c.points)}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <small style={{ display: "block" }}>Evidence carries 45 points and punctuation one, so the score can’t be raised with full stops. Gaps in work are never scored.</small>
        </Dialog>
      )}
    </CvScreen>
  );
}
