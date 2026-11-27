"use client";

import { useState } from "react";
import { bulletAt, changeBullet, switchOff } from "@/lib/cv/edit";
import { type HonestFit, type OverLine, fitChanges, fitHonestly, marginPt, mmOf, overTarget, textPt } from "@/lib/cv/render/fit";
import type { CvDoc, Locator } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { Dialog } from "./Dialog";
import type { Paper } from "./usePaper";
import { Btn, Field } from "./ui";

const pagesWord = (n: number) => (n === 1 ? "1 page" : `${n} pages`);

/**
 * Fit to one page, in the toolbar above the page (DESIGN-SPEC-v3 §03). It changes only the formatting, in
 * order: spacing, then text down to 10 pt, then margins down to 12 mm, measured each time with the same
 * layout as the PDF. The result sits right above the page and says what it did from the real numbers.
 * What still runs over is listed, line by line, with Switch off and Shorten. Undo fit puts every format
 * setting back as it was.
 */
export function FitControl({ cv, paper, update, say, onShorten }: { cv: CvDoc; paper: Paper | null; update: (patch: Partial<CvDoc>) => void; say: (s: string) => void; onShorten: (at: Locator) => void }) {
  const target = cv.design.pageTarget;
  const live = paper ? overTarget(paper.layout, target) : { over: [], lines: 0 };
  const [ran, setRan] = useState<{ before: CvDoc["design"]; fit: HonestFit } | null>(null);
  const [busy, setBusy] = useState(false);
  const word = docWord(cv.region);

  function fit() {
    if (!paper || busy) return;
    setBusy(true);
    // Measured after the "Measuring…" state has been drawn: the work is real, and takes a moment on a long CV.
    setTimeout(() => {
      try {
        const before = cv.design;
        const f = fitHonestly(cv, paper.fonts, target);
        if (f.design !== before) update({ design: f.design });
        setRan({ before, fit: f });
        const changes = fitChanges(f);
        say(f.fits ? `Fits on ${pagesWord(target)}${changes ? `: ${changes}` : ""}. Your words haven’t changed.` : `${f.overLines} ${f.overLines === 1 ? "line still runs" : "lines still run"} onto page ${target + 1}. No change made to your words.`);
      } finally {
        setBusy(false);
      }
    }, 0);
  }

  function undoFit() {
    if (!ran) return;
    update({ design: { ...cv.design, density: ran.before.density, fontSize: ran.before.fontSize, margin: ran.before.margin } });
    setRan(null);
    say("Fit undone: the spacing, text size and margins are back as they were.");
  }

  const fitsNow = !!paper && paper.layout.pages <= target;
  return (
    <>
      <span className="cv-fitcontrol">
        <Btn onClick={fit} disabled={!paper || busy} busy={busy}>
          {busy ? "Measuring…" : `Fit to ${target === 1 ? "one page" : "two pages"}`}
        </Btn>
        <span className="cv-small" role="status" data-testid="fit-status">
          {!paper ? "" : busy ? "Measuring…" : fitsNow ? `Fits on ${pagesWord(target)}` : `${live.lines} ${live.lines === 1 ? "line" : "lines"} over`}
        </span>
      </span>
      {ran && paper && (
        <div className="cv-fitresult" data-testid="fit-result" data-fits={fitsNow || undefined}>
          {fitsNow ? (
            <div className="cv-fitresult-head">
              <span>
                <b>{fitChanges(ran.fit) ? `Fits on ${pagesWord(target)}: ${fitChanges(ran.fit)}.` : `Fits on ${pagesWord(target)}. Nothing needed to change.`}</b>
                <span className="cv-small cv-muted">Your words haven’t changed.</span>
              </span>
              <span className="cv-row cv-push">
                {fitChanges(ran.fit) && <Btn onClick={undoFit}>Undo fit</Btn>}
                <Btn kind="quiet" onClick={() => setRan(null)}>
                  Close
                </Btn>
              </span>
            </div>
          ) : (
            <>
              <div className="cv-fitresult-head">
                <span>
                  <b>{live.lines > 0 ? `${live.lines} ${live.lines === 1 ? "line still runs" : "lines still run"} onto page ${target + 1}.` : `Some content still runs onto page ${target + 1}.`}</b>
                  <span className="cv-small cv-muted">
                    Text is at {textPt(cv.design)} pt, margins at {mmOf(marginPt(cv.design))} mm. No change made to your words.
                  </span>
                </span>
                <span className="cv-row cv-push">
                  {fitChanges({ changed: { spacing: cv.design.density !== ran.before.density, text: textPt(cv.design) !== textPt(ran.before), margins: marginPt(cv.design) !== marginPt(ran.before) }, design: cv.design }) && <Btn onClick={undoFit}>Undo fit</Btn>}
                  <Btn kind="quiet" onClick={() => setRan(null)}>
                    Close
                  </Btn>
                </span>
              </div>
              <OverList cv={cv} over={live.over} update={update} say={say} onShorten={onShorten} word={word} />
            </>
          )}
        </div>
      )}
    </>
  );
}

/** The pieces that run past the page target, each quoted, with Switch off and Shorten. Nothing is removed. */
export function OverList({ cv, over, update, say, onShorten, word, max = 14 }: { cv: CvDoc; over: OverLine[]; update: (patch: Partial<CvDoc>) => void; say: (s: string) => void; onShorten: (at: Locator) => void; word: string; max?: number }) {
  return (
    <>
      <ul className="cv-overlist" data-testid="over-list">
        {over.slice(0, max).map((o, i) => {
          const off = switchOff(cv.sections, o.at);
          return (
            <li key={`${o.at.section}-${o.at.entry ?? ""}-${o.at.field ?? ""}-${i}`}>
              <span className="min-w-0 grow" style={{ overflowWrap: "anywhere" }}>
                {o.text}
              </span>
              {off && (
                <Btn
                  onClick={() => {
                    update({ sections: off.sections });
                    say(`Switched off for this version. It stays in your ${word} and can be switched back on.`);
                  }}
                  aria-label={`Switch off this ${off.what}: ${o.text.slice(0, 60)}`}
                >
                  Switch off
                </Btn>
              )}
              <Btn onClick={() => onShorten(o.at)} aria-label={`Shorten: ${o.text.slice(0, 60)}`}>
                Shorten
              </Btn>
            </li>
          );
        })}
      </ul>
      {over.length > max && <small>And {over.length - max} more.</small>}
    </>
  );
}

/**
 * Shorten one line: the person writes the shorter wording, reviews it and approves it. Nothing is
 * written for them and nothing is added before they approve. A line that isn't a bullet opens in its field.
 */
export function ShortenDialog({ cv, at, update, say, onClose, onField }: { cv: CvDoc; at: Locator; update: (patch: Partial<CvDoc>) => void; say: (s: string) => void; onClose: () => void; onField: (at: Locator) => void }) {
  const found = bulletAt(cv.sections, at);
  const original = found?.bullet.text ?? "";
  const [text, setText] = useState(original);
  const [review, setReview] = useState(false);
  const word = docWord(cv.region);
  if (!found)
    return (
      <Dialog title="Shorten this line" onClose={onClose} actions={<Btn kind="primary" onClick={() => onField(at)}>Open the field</Btn>}>
        <p style={{ marginTop: 0 }}>This line is edited in its own field. Keep the facts and change only the wording.</p>
      </Dialog>
    );
  const same = text.replace(/\s+/g, " ").trim() === original.replace(/\s+/g, " ").trim();
  return (
    <Dialog
      title="Shorten this line"
      onClose={onClose}
      wide
      actions={
        review ? (
          <>
            <Btn onClick={() => setReview(false)}>Edit wording</Btn>
            <Btn
              kind="primary"
              onClick={() => {
                update({ sections: changeBullet(cv.sections, at, { text: text.trim() }) });
                say(`Your wording was added to your ${word}. Undo puts the old line back.`);
                onClose();
              }}
            >
              Approve and add
            </Btn>
          </>
        ) : (
          <>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn kind="primary" disabled={same || !text.trim()} onClick={() => setReview(true)}>
              Review your line
            </Btn>
          </>
        )
      }
    >
      <div className="cv-stack">
        <div className="cv-stack" style={{ gap: 6 }}>
          <span className="cv-eyebrow">Your line now</span>
          <q className="cv-fix-quote">{original}</q>
        </div>
        {review ? (
          <div className="cv-stack" style={{ gap: 6 }} data-testid="shorten-review">
            <span className="cv-eyebrow">Your revised line</span>
            <q className="cv-fix-quote">{text.trim()}</q>
            <p className="cv-small cv-muted" style={{ margin: 0 }}>
              Approve your wording before it is added to your {word}.
            </p>
          </div>
        ) : (
          <>
            <p className="cv-small" style={{ margin: 0 }}>
              Keep the facts. Change only the wording you approve.
            </p>
            <Field label="Your revised words" multiline rows={3} value={text} onChange={setText} maxLength={600} />
          </>
        )}
      </div>
    </Dialog>
  );
}
