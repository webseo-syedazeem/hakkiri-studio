"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Achievement, ChangeRecord } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { jobFit } from "@/lib/cv/tailor/fit";
import { type Proposal, applyProposals, effectOf, proposeChanges } from "@/lib/cv/tailor/propose";
import { api } from "./client";
import { Bar, Btn, BtnLink, CvScreen, Panel, Skeleton, Toolbar } from "./ui";
import { useWorkspace } from "./Workspace";

const KINDS: { kind: ChangeRecord["kind"]; title: string }[] = [
  { kind: "included", title: "Included" },
  { kind: "off", title: "Switched off" },
  { kind: "moved", title: "Moved" },
  { kind: "reworded", title: "Reworded" },
];
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Sides({ before, after }: { before: string; after: string }) {
  const lines = (t: string) => (t ? t.split("\n").map((l, i) => <p key={i}>{l}</p>) : <p className="cv-muted">Nothing</p>);
  return (
    <div className="cv-compare">
      <div>
        <div>
          <span className="cv-eyebrow">Before</span>
          {lines(before)}
        </div>
        <div>
          <span className="cv-eyebrow">After</span>
          {lines(after)}
        </div>
      </div>
    </div>
  );
}

/**
 * What changed, and why. "Proposed": changes offered for this job, each with
 * its reason and what they would do to job fit; nothing is applied until the
 * person chooses. "Report": the changes that were made to this version.
 */
export function Changes({ mode }: { mode: "proposed" | "report" }) {
  const router = useRouter();
  const w = useWorkspace();
  const { cv, load, update, flush } = w;
  const [bank, setBank] = useState<Achievement[] | null>(null);
  const [chosen, setChosen] = useState<Set<string> | null>(null);
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    api<{ achievements: Achievement[] }>("/api/cv/bank")
      .then((r) => setBank(r.achievements))
      .catch(() => setBank([]));
  }, []);
  const proposals = useMemo(() => (cv && bank ? proposeChanges(cv, bank) : null), [cv, bank]);
  // What is recommended starts ticked; switching content off is the person's call.
  useEffect(() => {
    if (proposals && chosen === null) setChosen(new Set(proposals.filter((p) => p.recommended).map((p) => p.id)));
  }, [proposals, chosen]);

  const crumbs = [{ label: "CVs and letters", href: "/cv" }, { label: cv?.name ?? "CV", href: `/cv/v/${w.versionId}/tailor` }, { label: mode === "report" ? "What changed" : "Proposed changes" }];
  if (load === "loading" || (load === "ready" && mode === "proposed" && (!proposals || !chosen)))
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area" aria-busy="true" aria-label="Working out the changes">
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

  const word = docWord(cv.region);
  const base = `/cv/v/${cv.id}`;
  const quoteOf = (id?: string) => cv.requirements.find((r) => r.id === id)?.quote;

  if (mode === "report") {
    const fit = jobFit(cv);
    return (
      <CvScreen>
        <Bar crumbs={crumbs}>
          <BtnLink href={`${base}/tailor`}>Back to tailoring</BtnLink>
        </Bar>
        <div className="cv-area">
          <Toolbar title="What changed" subtitle={`Every change made to this version while tailoring, with the reason.${fit.score !== null ? ` Job fit is now ${fit.score}.` : ""}`}>
            <BtnLink kind="primary" href={`${base}/edit/finish#files`}>
              Export tailored {word === "CV" ? "CV" : "resume"}
            </BtnLink>
          </Toolbar>
          {cv.changes.length === 0 ? (
            <Panel>
              <div className="cv-pad cv-stack">
                <h2>No changes recorded</h2>
                <p className="cv-muted">Nothing has been changed for this job yet.</p>
                <div className="cv-row">
                  <BtnLink href={`${base}/tailor`}>Return to tailoring</BtnLink>
                  <BtnLink href={`${base}/edit/finish#files`}>Export current version</BtnLink>
                </div>
              </div>
            </Panel>
          ) : (
            <div className="cv-stack">
              {KINDS.map(({ kind, title }) => {
                const list = cv.changes.filter((c) => c.kind === kind).reverse();
                if (!list.length) return null;
                return (
                  <Panel key={kind} title={`${title} (${list.length})`} data-part={title}>
                    <ul className="cv-plainlist">
                      {list.map((c) => (
                        <li key={c.id} className="cv-change">
                          <div className="cv-row" style={{ gap: 8 }}>
                            <b>{c.where}</b>
                            <small className="cv-push">{when(c.at)}</small>
                          </div>
                          <Sides before={c.before} after={c.after} />
                          <p className="cv-small" style={{ marginTop: 6 }}>
                            Why: {c.reason}
                            {quoteOf(c.requirementId) ? ` The advert says: “${quoteOf(c.requirementId)}”` : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                );
              })}
            </div>
          )}
        </div>
      </CvScreen>
    );
  }

  const list = proposals!;
  const picked = list.filter((p) => chosen!.has(p.id));
  const effect = effectOf(cv, picked, now);
  const toggle = (id: string) => setChosen((c) => new Set([...(c ?? [])].includes(id) ? [...(c ?? [])].filter((x) => x !== id) : [...(c ?? []), id]));
  const apply = async () => {
    const out = applyProposals(cv, picked, new Date());
    update({ sections: out.sections, changes: [...cv.changes, ...out.records].slice(-200) });
    await flush();
    router.push(`${base}/changes/report`);
  };
  return (
    <CvScreen>
      <Bar crumbs={crumbs}>
        <BtnLink href={`${base}/tailor`}>Back to tailoring</BtnLink>
      </Bar>
      <div className="cv-area">
        <Toolbar title="Proposed changes" subtitle={`Arranging what you already have for this job, before any rewording. Nothing changes until you apply it, and your base ${word} is never touched.`}>
          <Btn kind="primary" disabled={!picked.length} onClick={() => void apply()}>
            Apply {picked.length || ""} selected {picked.length === 1 ? "change" : "changes"}
          </Btn>
        </Toolbar>

        {list.length === 0 ? (
          <Panel>
            <div className="cv-pad cv-stack">
              <h2>No changes to propose</h2>
              <p className="cv-muted">The lines that show what the advert asks for are already first in their roles, and no saved achievement shows something this version is missing.</p>
              <div className="cv-row">
                <BtnLink href={`${base}/tailor`}>Return to tailoring</BtnLink>
                <BtnLink href={`${base}/edit/finish#files`}>Export current version</BtnLink>
              </div>
            </div>
          </Panel>
        ) : (
          <div className="cv-stack">
            <div className={effect.worse.length ? "cv-issue" : "cv-note"} data-testid="effect" style={{ display: "block" }}>
              {effect.before.score === null ? (
                "These changes arrange your CV; there is no job fit to move yet."
              ) : (
                <>
                  Job fit with the selected changes: <b>{effect.before.score}</b> → <b>{effect.after.score}</b>.
                </>
              )}
              {effect.worse.map((r) => (
                <p key={r.id} style={{ marginTop: 6 }}>
                  <strong>Side effect:</strong> these changes take away the only line showing “{r.text || r.quote}”.
                </p>
              ))}
            </div>
            {KINDS.map(({ kind, title }) => {
              const part = list.filter((p) => p.kind === kind);
              if (!part.length) return null;
              return (
                <Panel key={kind} title={`${title} (${part.length})`} data-part={title}>
                  <ul className="cv-plainlist">
                    {part.map((p: Proposal) => (
                      <li key={p.id} className="cv-change" data-proposal={p.kind}>
                        <label className="cv-row" style={{ gap: 8 }}>
                          <input type="checkbox" checked={chosen!.has(p.id)} onChange={() => toggle(p.id)} />
                          <b>{p.where}</b>
                          {!p.recommended && <small>Your call: not selected for you</small>}
                        </label>
                        <Sides before={p.before} after={p.after} />
                        <p className="cv-small" style={{ marginTop: 6 }}>
                          Why: {p.reason}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Panel>
              );
            })}
          </div>
        )}
      </div>
    </CvScreen>
  );
}
