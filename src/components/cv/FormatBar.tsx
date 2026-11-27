"use client";

import Link from "next/link";
import { FAMILIES } from "@/lib/cv/render/fonts";
import { ACCENTS, PAIRINGS, TEMPLATES, type TemplateDef, templateLabel, templateSlug } from "@/lib/cv/render/templates";
import { type AccentId, CV_ACCENTS, CV_DENSITIES, type CvDoc, type Density, type Design, type TemplateId } from "@/lib/cv/schema";
import type { Paper } from "./usePaper";
import { Btn } from "./ui";

export const pairLabel = (f: TemplateDef["fonts"]) => (f.heading === f.body ? FAMILIES[f.heading] : `${FAMILIES[f.heading]} headings, ${FAMILIES[f.body]} text`);
/** The font pairings on offer: each template's own, without repeats. */
export const FONT_CHOICES = PAIRINGS.map((p) => ({ id: p.id, label: pairLabel(p.fonts) })).filter((p, i, all) => all.findIndex((x) => x.label === p.label) === i);

const SPACING: Record<Density, string> = { tighter: "Tighter", default: "Default", looser: "Looser" };
const LINE_SPACING = [0.85, 1, 1.15, 1.3];
const SIZES = { min: 9, max: 12.5, step: 0.5 };

/**
 * The design controls most changed, directly above the page while editing:
 * template, fonts, size, spacing, dividers, paper size, colour and "Fit to
 * one page". Every one acts on the real page, drawn by the same renderer as
 * the PDF; the rest of the design options are one click away.
 */
/**
 * With `slim`, the one row above the page (template, font, size, colour, then More design options).
 * Without it, every design control, in the Design dialog.
 */
export function FormatBar({ cv, paper, update, base, say, slim, onMore }: { cv: CvDoc; paper: Paper | null; update: (patch: Partial<CvDoc>) => void; base: string; say: (s: string) => void; slim?: boolean; onMore?: () => void }) {
  const design = cv.design;
  const template = TEMPLATES[design.template];
  const set = (changes: Partial<Design>) => update({ design: { ...design, ...changes } });
  const fonts = design.fonts ?? template.id;
  const fontChoice = design.headingFont || design.bodyFont ? "own" : (FONT_CHOICES.find((c) => pairLabel(TEMPLATES[c.id].fonts) === pairLabel(TEMPLATES[fonts].fonts))?.id ?? template.id);
  const size = design.fontSize ?? 10.5;
  const line = design.lineSpacing ?? 1;
  const accent: AccentId = design.accent ?? template.accent;
  return (
    <div className={slim ? "cv-formatbar cv-formatbar-slim" : "cv-formatbar"} role="group" aria-label="Design" data-testid="format-bar">
      <div className="cv-fb-item cv-fb-wide">
        <span className="cv-fb-label">Template</span>
        <Link className="cv-btn cv-fb-control" href={`/cv/templates/${templateSlug(template)}?cv=${cv.id}`}>
          {templateLabel(template)}
        </Link>
      </div>
      <label className="cv-fb-item cv-fb-wide">
        <span className="cv-fb-label">Font</span>
        <select className="cv-input cv-fb-control" value={fontChoice} onChange={(e) => e.target.value !== "own" && set({ fonts: e.target.value as TemplateId, headingFont: undefined, bodyFont: undefined })}>
          {fontChoice === "own" && <option value="own">Your own choice</option>}
          {FONT_CHOICES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      {slim ? (
        <label className="cv-fb-item">
          <span className="cv-fb-label">Text size</span>
          <select className="cv-input cv-fb-control" value={String(size)} onChange={(e) => set({ fontSize: Number(e.target.value) })}>
            {sizeSteps(size).map((v) => (
              <option key={v} value={String(v)}>
                {v} pt
              </option>
            ))}
          </select>
        </label>
      ) : (
      <div className="cv-fb-item">
        <span className="cv-fb-label" id="fb-size">
          Text size
        </span>
        <span className="cv-fb-stepper" role="group" aria-labelledby="fb-size">
          <Btn aria-label="Smaller text" disabled={size <= SIZES.min} onClick={() => set({ fontSize: Math.max(SIZES.min, size - SIZES.step) })}>
            −
          </Btn>
          <output aria-live="polite">{size}</output>
          <Btn aria-label="Larger text" disabled={size >= SIZES.max} onClick={() => set({ fontSize: Math.min(SIZES.max, size + SIZES.step) })}>
            +
          </Btn>
        </span>
      </div>
      )}
      {!slim && (
      <>
      <label className="cv-fb-item">
        <span className="cv-fb-label">Line spacing</span>
        <select className="cv-input cv-fb-control" value={String(line)} onChange={(e) => set({ lineSpacing: Number(e.target.value) })}>
          {(LINE_SPACING.includes(line) ? LINE_SPACING : [...LINE_SPACING, line].sort()).map((v) => (
            <option key={v} value={String(v)}>
              {v.toFixed(2)}
            </option>
          ))}
        </select>
      </label>
      <label className="cv-fb-item">
        <span className="cv-fb-label">Section spacing</span>
        <select className="cv-input cv-fb-control" value={design.density} onChange={(e) => set({ density: e.target.value as Density })}>
          {CV_DENSITIES.map((d) => (
            <option key={d} value={d}>
              {SPACING[d]}
            </option>
          ))}
        </select>
      </label>
      <div className="cv-fb-item">
        <span className="cv-fb-label" id="fb-dividers">
          Dividers
        </span>
        <span className="cv-seg cv-fb-seg" role="group" aria-labelledby="fb-dividers">
          <button type="button" aria-pressed={design.dividerStyle !== "none"} onClick={() => set({ dividerStyle: "solid" })}>
            On
          </button>
          <button type="button" aria-pressed={design.dividerStyle === "none"} onClick={() => set({ dividerStyle: "none" })}>
            Off
          </button>
        </span>
      </div>
      <label className="cv-fb-item">
        <span className="cv-fb-label">Page size</span>
        <select className="cv-input cv-fb-control" value={design.pageSize} onChange={(e) => set({ pageSize: e.target.value as Design["pageSize"] })}>
          <option value="a4">A4</option>
          <option value="letter">US Letter</option>
        </select>
      </label>
      </>
      )}
      <label className="cv-fb-item">
        <span className="cv-fb-label">{cv.region === "us" ? "Color" : "Colour"}</span>
        <select className="cv-input cv-fb-control" value={design.customAccent ? "own" : accent} onChange={(e) => e.target.value !== "own" && set({ accent: e.target.value as AccentId, customAccent: undefined })}>
          {design.customAccent && <option value="own">Your own {cv.region === "us" ? "color" : "colour"}</option>}
          {CV_ACCENTS.map((a) => (
            <option key={a} value={a}>
              {ACCENTS[a].name}
            </option>
          ))}
        </select>
      </label>
      {slim ? (
        <Btn className="cv-fb-more" onClick={onMore}>
          More design options
        </Btn>
      ) : (
        <div className="cv-fb-fit">
          <Link className="cv-link cv-push" href={`${base}/finish`}>
            All design and file options
          </Link>
        </div>
      )}
    </div>
  );
}

/** "Fit to one page" (or two): the loosest spacing that keeps the CV to its page target, and what it did. */
/** Every text size the stepper can reach, and the CV's own if it is between steps. */
function sizeSteps(current: number): number[] {
  const out: number[] = [];
  for (let v = SIZES.min; v <= SIZES.max + 1e-9; v += SIZES.step) out.push(Math.round(v * 10) / 10);
  return out.includes(current) ? out : [...out, current].sort((a, b) => a - b);
}
