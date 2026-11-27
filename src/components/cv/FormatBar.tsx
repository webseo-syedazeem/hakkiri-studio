"use client";

import Link from "next/link";
import { useState } from "react";
import { FAMILIES } from "@/lib/cv/render/fonts";
import { marginPt } from "@/lib/cv/render/fit";
import { ACCENTS, PAIRINGS, TEMPLATES, type TemplateDef, templateLabel, templateSlug } from "@/lib/cv/render/templates";
import { type AccentId, CV_ACCENTS, CV_BULLETS, CV_DENSITIES, type CvDoc, type Density, type Design, type TemplateId } from "@/lib/cv/schema";
import { Dialog } from "./Dialog";
import type { Paper } from "./usePaper";
import { Btn } from "./ui";

export const pairLabel = (f: TemplateDef["fonts"]) => (f.heading === f.body ? FAMILIES[f.heading] : `${FAMILIES[f.heading]} headings, ${FAMILIES[f.body]} text`);
/** The font pairings on offer: each template's own, without repeats. */
export const FONT_CHOICES = PAIRINGS.map((p) => ({ id: p.id, label: pairLabel(p.fonts) })).filter((p, i, all) => all.findIndex((x) => x.label === p.label) === i);

const SPACING: Record<Density, string> = { tighter: "Tighter", default: "Default", looser: "Looser" };
const LINE_SPACING = [0.85, 1, 1.15, 1.3];
const SIZES = [9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5];
const BULLET_LABEL: Record<(typeof CV_BULLETS)[number], string> = { disc: "Disc", dash: "Dash", arrow: "Arrow", none: "None" };
const MARGINS: { label: string; value: Design["margin"] }[] = [
  { label: "Narrow", value: "compact" },
  { label: "Normal", value: "normal" },
  { label: "Wide", value: "relaxed" },
];

/** Lines of the CV that fall past the pages it is meant to fit on. */
export function linesOver(paper: Paper | null, target: number): number {
  if (!paper) return 0;
  return paper.layout.blocks.reduce((n, b) => n + b.lines.filter((l) => l.page >= target).length, 0);
}

/**
 * The design row above the page (design spec v3 §02): one slim row of 34 px
 * controls — template, font, text size, colour — and More design options for
 * the rest. Every control changes the design only, never the words. In the
 * phone Design dialog the same controls stack, with Fit to one page, which on
 * desktop sits once in the document toolbar instead.
 */
export function FormatBar({ cv, update, onFit, fitBusy }: { cv: CvDoc; paper?: Paper | null; update: (patch: Partial<CvDoc>) => void; base?: string; say?: (s: string) => void; onFit?: () => void; fitBusy?: boolean }) {
  const design = cv.design;
  const template = TEMPLATES[design.template] ?? TEMPLATES.standard;
  const set = (changes: Partial<Design>) => update({ design: { ...design, ...changes } });
  const fonts = design.fonts ?? template.id;
  const fontChoice = design.headingFont || design.bodyFont ? "own" : (FONT_CHOICES.find((c) => pairLabel(TEMPLATES[c.id].fonts) === pairLabel(TEMPLATES[fonts].fonts))?.id ?? template.id);
  const size = design.fontSize ?? 10.5;
  const accent: AccentId = design.accent ?? template.accent;
  const colourWord = cv.region === "us" ? "Color" : "Colour";
  const [more, setMore] = useState(false);

  return (
    <div className="cv-formatbar cv-formatbar-v3" role="group" aria-label="Design" data-testid="format-bar">
      <Link className="cv-btn cv-fb-control cv-fb-template" href={`/cv/templates/${templateSlug(template)}?cv=${cv.id}`} aria-label={`Template: ${templateLabel(template)}. Change template`}>
        {templateLabel(template)}
      </Link>
      <label className="cv-fb-inline">
        <span className="sr-only">Font</span>
        <select className="cv-input cv-fb-control" value={fontChoice} onChange={(e) => e.target.value !== "own" && set({ fonts: e.target.value as TemplateId, headingFont: undefined, bodyFont: undefined })}>
          {fontChoice === "own" && <option value="own">Your own choice</option>}
          {FONT_CHOICES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="cv-fb-inline">
        <span className="sr-only">Text size</span>
        <select className="cv-input cv-fb-control" value={String(size)} onChange={(e) => set({ fontSize: Number(e.target.value) })}>
          {(SIZES.includes(size) ? SIZES : [...SIZES, size].sort((a, b) => a - b)).map((v) => (
            <option key={v} value={String(v)}>
              {v} pt
            </option>
          ))}
        </select>
      </label>
      <label className="cv-fb-inline">
        <span className="sr-only">{colourWord}</span>
        <select className="cv-input cv-fb-control" value={design.customAccent ? "own" : accent} onChange={(e) => e.target.value !== "own" && set({ accent: e.target.value as AccentId, customAccent: undefined })}>
          {design.customAccent && <option value="own">Your own {colourWord.toLowerCase()}</option>}
          {CV_ACCENTS.map((a) => (
            <option key={a} value={a}>
              {ACCENTS[a].name}
            </option>
          ))}
        </select>
      </label>
      {onFit && (
        <Btn onClick={onFit} busy={fitBusy} className="cv-fb-fitbtn">
          Fit to {design.pageTarget === 1 ? "one page" : "two pages"}
        </Btn>
      )}
      <Btn className="cv-push" onClick={() => setMore(true)} data-testid="more-design">
        More design options
      </Btn>

      {more && (
        <Dialog title="More design options" onClose={() => setMore(false)} actions={<Btn kind="primary" onClick={() => setMore(false)}>Done</Btn>}>
          <p className="cv-muted" style={{ marginTop: 0 }}>These change the design only. Your words stay exactly as they are.</p>
          <div className="cv-design-grid">
            <label>
              <span className="cv-label">Line spacing</span>
              <select className="cv-input" value={String(design.lineSpacing ?? 1)} onChange={(e) => set({ lineSpacing: Number(e.target.value) })}>
                {(LINE_SPACING.includes(design.lineSpacing ?? 1) ? LINE_SPACING : [...LINE_SPACING, design.lineSpacing ?? 1].sort()).map((v) => (
                  <option key={v} value={String(v)}>{v.toFixed(2)}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="cv-label">Section spacing</span>
              <select className="cv-input" value={design.density} onChange={(e) => set({ density: e.target.value as Density })}>
                {CV_DENSITIES.map((d) => (
                  <option key={d} value={d}>{SPACING[d]}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="cv-label">Page size</span>
              <select className="cv-input" value={design.pageSize} onChange={(e) => set({ pageSize: e.target.value as Design["pageSize"] })}>
                <option value="a4">A4</option>
                <option value="letter">US Letter</option>
              </select>
            </label>
            <label>
              <span className="cv-label">Margins</span>
              <select
                className="cv-input"
                value={typeof design.margin === "number" ? "own" : (design.margin ?? "normal")}
                onChange={(e) => e.target.value !== "own" && set({ margin: e.target.value as Design["margin"] })}
              >
                {typeof design.margin === "number" && <option value="own">{Math.round(marginPt(design) * (25.4 / 72))} mm (from Fit to one page)</option>}
                {MARGINS.map((m) => (
                  <option key={m.label} value={String(m.value)}>{m.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="cv-label">Dividers</span>
              <select className="cv-input" value={design.dividerStyle ?? "solid"} onChange={(e) => set({ dividerStyle: e.target.value as Design["dividerStyle"] })}>
                <option value="solid">Line</option>
                <option value="dashed">Dashed line</option>
                <option value="dots">Dots</option>
                <option value="accent-bar">Accent bar</option>
                <option value="none">None</option>
              </select>
            </label>
            <label>
              <span className="cv-label">Bullets</span>
              <select className="cv-input" value={design.bullet ?? template.bullet ?? "disc"} onChange={(e) => set({ bullet: e.target.value as Design["bullet"] })}>
                {CV_BULLETS.map((b) => (
                  <option key={b} value={b}>{BULLET_LABEL[b]}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="cv-label">Indentation</span>
              <select className="cv-input" value={String(design.indentation ?? 13)} onChange={(e) => set({ indentation: Number(e.target.value) })}>
                {[0, 6, 9, 13, 18, 24].map((v) => (
                  <option key={v} value={String(v)}>{v === 0 ? "None" : `${v} pt`}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="cv-label">Name size</span>
              <select className="cv-input" value={String(design.nameSize ?? "")} onChange={(e) => set({ nameSize: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">Template’s own</option>
                {[18, 20, 22, 24, 26, 28, 32].map((v) => (
                  <option key={v} value={String(v)}>{v} pt</option>
                ))}
              </select>
            </label>
            <label>
              <span className="cv-label">Header style</span>
              <select className="cv-input" value={design.header ?? "plain"} onChange={(e) => set({ header: e.target.value as Design["header"] })}>
                <option value="plain">Plain</option>
                <option value="band">Coloured band</option>
              </select>
            </label>
          </div>
          <p className="cv-small" style={{ marginBottom: 0 }}>
            Section order, fonts one at a time and the file name are on the{" "}
            <Link className="cv-link" href={`/cv/v/${cv.id}/edit/finish`} onClick={() => setMore(false)}>
              Finish
            </Link>{" "}
            step.
          </p>
        </Dialog>
      )}
    </div>
  );
}
