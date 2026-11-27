"use client";

import Link from "next/link";
import type { Locator } from "@/lib/cv/schema";
import { band, bandOf } from "@/lib/cv/score/band";
import type { Score } from "@/lib/cv/score/score";
import { ScoreRing } from "./ScoreRing";
import { Btn, Panel } from "./ui";

/** The plain label beside a score: always with the number and its reasons, never instead of them. */
export const scoreBand = (shown: number) => band(shown);

/**
 * The next thing to fix: the first problem in the words, else the first
 * suggestion, in the order the score lists them. That the files haven't been
 * checked since the last change is true after every edit, so it comes only
 * when nothing in the words is left to fix.
 */
export function fixNext(score: Score) {
  const words = score.findings.filter((f) => f.at.section !== "finish");
  return words.find((f) => f.severity === "issue") ?? words.find((f) => f.severity === "suggestion") ?? score.findings.find((f) => f.at.section === "finish") ?? null;
}

/**
 * The score beside the page while editing: the number, a plain label, its
 * four parts and the one thing to fix next, with "Show me" to go straight to
 * that line. It is worked out in code as the person types; nothing about it
 * is a sample.
 */
export function ScorePanel({ score, word, base, onShow, fitLabel, onLeave, inDrawer }: { score: Score | null; word: string; base: string; onShow: (at: Locator) => void; fitLabel?: string; onLeave?: () => void; inDrawer?: boolean }) {
  // Tailor to a job and Cover letter, as two equal buttons (DESIGN-SPEC-v3 §02). Only one panel carries the test ids.
  const ways = fitLabel ? (
    <div className="cv-panelways">
      <Link className="cv-btn" href={`${base}/tailor`} onClick={onLeave} data-testid={inDrawer ? undefined : "fit-button"}>
        {fitLabel}
      </Link>
      <Link className="cv-btn" href={`${base}/letter`} onClick={onLeave}>
        Cover letter
      </Link>
    </div>
  ) : null;
  const title = word === "CV" ? "CV score" : "Resume score";
  if (!score) {
    return (
      <Panel title={title} data-testid="score-panel">
        <div className="cv-pad">
          <p className="cv-muted" style={{ margin: 0 }}>
            Checking changes…
          </p>
        </div>
      </Panel>
    );
  }
  if (score.empty) {
    return (
      <Panel title={title} data-testid="score-panel">
        <div className="cv-pad">
          <p className="cv-muted" style={{ margin: 0 }}>
            Not checked yet. Add your experience and the score appears here, with what to fix first.
          </p>
          <Link className="cv-link" href={`${base}/findings`} style={{ display: "inline-block", marginTop: 8 }}>
            How the score works
          </Link>
          {ways}
        </div>
      </Panel>
    );
  }
  const next = fixNext(score);
  return (
    <Panel title={title} data-testid="score-panel">
      <div className="cv-pad cv-stack">
        <div className="cv-score-panel-ring">
          <ScoreRing score={score.shown} label={title} size={94} />
        </div>
        <ul className="cv-score-parts">
          {score.groups.map((g) => {
            const unchecked = g.pending >= g.points;
            const pct = unchecked ? 0 : Math.round((g.earned / g.points) * 100);
            const partBand = unchecked ? undefined : bandOf(pct).key;
            return (
              <li key={g.id} data-band={partBand}>
                <span className="cv-row" style={{ justifyContent: "space-between", gap: 8 }}>
                  <span>{g.name}</span>
                  <b style={partBand ? { color: "var(--ring-text)" } : undefined}>{unchecked ? "Not checked" : `${Math.round(g.earned)}/${g.points}`}</b>
                </span>
                <span className="cv-meter" data-band={partBand} aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </span>
              </li>
            );
          })}
        </ul>
        {next ? (
          <div className="cv-fixnext" data-testid="fix-next">
            <b>Fix next</b>
            <p>{next.reason}</p>
            <p className="cv-muted">{next.action}</p>
            {next.at.section === "finish" ? (
              <Link className="cv-btn" href={`${base}/edit/finish`}>
                Go to Finish
              </Link>
            ) : (
              <Btn onClick={() => onShow(next.at)}>Show me</Btn>
            )}
          </div>
        ) : (
          <p className="cv-muted" style={{ margin: 0 }}>
            No outstanding fixes from this check.
          </p>
        )}
        <Link className="cv-link" href={`${base}/findings`}>
          See all findings
        </Link>
        {/* The step after a good CV: the questions it will get you, from its own lines. */}
        <div className="cv-practisecard" data-testid="practise-card">
          <b>{score.goodEnough ? `Your ${word} is ready. Practise the questions it will get you.` : `Practise the questions your ${word} will get you.`}</b>
          <span className="cv-small cv-muted">Questions built from your own {word}.</span>
          <Link className="cv-btn cv-btn-primary" href={`${base}/questions`}>
            Questions your {word} will get
          </Link>
        </div>
        {ways}
      </div>
    </Panel>
  );
}

/** Below 1440 px the score panel doesn't fit beside the page: one line stands in for it, and opens it with the job keywords. */
export function ScoreLine({ score, word, onOpen }: { score: Score | null; word: string; onOpen: () => void }) {
  if (!score) return null;
  return (
    <div className="cv-scoreline cv-belowwide" data-testid="score-line">
      {score.empty ? (
        <span className="cv-muted">{word === "CV" ? "CV" : "Resume"} score: not checked yet</span>
      ) : (
        <>
          <b>
            {word === "CV" ? "CV" : "Resume"} score {score.shown}/100
          </b>
          <span className="cv-ring-inline" data-band={bandOf(score.shown).key}>
            {scoreBand(score.shown)}
          </span>
        </>
      )}
      <button type="button" className="cv-link cv-push" onClick={onOpen}>
        Score and job keywords
      </button>
    </div>
  );
}
