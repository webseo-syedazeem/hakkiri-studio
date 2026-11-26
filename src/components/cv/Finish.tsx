"use client";

import { useEffect, useRef, useState } from "react";
import { fileBaseName, fileName } from "@/lib/cv/render/filename";
import { cannotDrawAdvice } from "@/lib/cv/render/fonts";
import { paperOrder } from "@/lib/cv/render/flow";
import { FAMILIES } from "@/lib/cv/render/fonts";
import { fitToPages } from "@/lib/cv/render/layout";
import { ACCENTS, PAIRINGS, TEMPLATES, type TemplateDef, contrastRatioOnWhite, templateLabel } from "@/lib/cv/render/templates";
import { type AccentId, CHANGE_KEYS, CV_ACCENTS, CV_BULLETS, CV_DENSITIES, CV_FONT_FAMILIES, CV_SEPARATORS, CV_TEMPLATES, type Design, type FontFamilyId, type SavedStyle, type TemplateId, cvIsEmpty, sectionIsEmpty } from "@/lib/cv/schema";
import { docWord, sectionHeading } from "@/lib/cv/sections";
import { Grip, ItemControls, useDragOrder } from "./Arrange";
import { ApiError, api, messageOf } from "./client";
import { Dialog, usePanel } from "./Dialog";
import { Downloads } from "./Software";
import { Btn, BtnLink, CvSelect, Field, Panel } from "./ui";
import { type FileCheck, type FileChecks, useWorkspace } from "./Workspace";

type Format = "pdf" | "docx";
const FORMAT_NAME: Record<Format, string> = { pdf: "PDF", docx: "Word" };

const pairLabel = (f: TemplateDef["fonts"]) => (f.heading === f.body ? FAMILIES[f.heading] : `${FAMILIES[f.heading]} headings, ${FAMILIES[f.body]} text`);
/** The font pairings on offer: each template's own, without repeats. */
const FONT_CHOICES = PAIRINGS.map((p) => ({ id: p.id, label: pairLabel(p.fonts) })).filter((p, i, all) => all.findIndex((x) => x.label === p.label) === i);

/** A small drawing of a template's layout: where the name sits, how headings look. Bars stand for text; no words are shown. */
function TemplateThumb({ def, accent }: { def: TemplateDef; accent: string }) {
  const W = 64;
  const x = (align: string, width: number, pad = 6) => (align === "center" ? (W - width) / 2 : align === "right" ? W - pad - width : pad);
  const h = def.heading;
  const headWidth = h.caps ? 20 : 24;
  return (
    <svg viewBox="0 0 64 84" width="64" height="84" aria-hidden="true" className="cv-thumb">
      <rect width="64" height="84" rx="2" fill="#fbfbfd" />
      <rect x={x(def.title.align, 34)} y="7" width="34" height="5" rx="1" fill={def.title.accent ? accent : "#17181f"} />
      {def.title.ruleBelow && <rect x="6" y="14.5" width="52" height="1" fill={accent} />}
      <rect x={x(def.contact.align, 42)} y="17" width="42" height="2" rx="1" fill="#8a8c99" />
      {def.contact.ruleBelow && <rect x="6" y="21.5" width="52" height="0.6" fill="#c9ccdb" />}
      {[27, 46, 65].map((y) => {
        const hx = x(h.align, headWidth) + (h.rule === "bar-before" ? 4 : 0);
        const rule = h.ruleAccent ? accent : "#c9ccdb";
        return (
          <g key={y}>
            {h.rule === "short-above" && <rect x={hx} y={y - 2.4} width="9" height="1.2" fill={rule} />}
            {h.rule === "bar-before" && <rect x="6" y={y - 0.4} width="1.6" height="3.8" fill={rule} />}
            <rect x={hx} y={y} width={headWidth} height="3" rx="0.8" fill={h.accent ? accent : "#17181f"} />
            {h.rule === "hairline-below" && <rect x="6" y={y + 4.2} width="52" height="0.6" fill={rule} />}
            {h.rule === "short-below" && <rect x={h.align === "center" ? 27 : hx} y={y + 4.4} width="10" height="1" fill={rule} />}
            {[7.5, 10.7, 13.9].map((dy, i) => (
              <rect key={dy} x="6" y={y + dy} width={[52, 47, 38][i]} height="1.5" rx="0.7" fill="#c5c7d3" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/** What a file's line says: the truth about the last check, and whether it still applies. */
function statusOf(check: FileCheck | undefined, checks: FileChecks | null, current: boolean, busy: boolean): { word: string; tone: "good" | "bad" | "plain" } {
  if (busy) return { word: "Checking…", tone: "plain" };
  if (!checks || !check) return { word: "Unchecked", tone: "plain" };
  if (!current) return { word: "Out of date", tone: "plain" };
  if (check.status === "checked") return { word: "Checked", tone: "good" };
  if (check.status === "loss") return { word: "Loss found", tone: "bad" };
  return { word: "Check failed", tone: "bad" };
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const clean = /^#?([0-9A-Fa-f]{6})$/.exec(hex.trim());
  if (!clean) return { h: 230, s: 75, v: 85 };
  const n = parseInt(clean[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : Math.round((d / max) * 100);
  const v = Math.round(max * 100);
  return { h, s, v };
}

function hsvToHex(h: number, s: number, v: number): string {
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const vNorm = Math.max(0, Math.min(100, v)) / 100;
  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vNorm - c;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toHex = (val: number) => Math.round((val + m) * 255).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function darkenHexToPass(hex: string): string {
  const { h, s, v } = hexToHsv(hex);
  for (let newV = Math.min(v, 65); newV >= 15; newV -= 5) {
    const candidate = hsvToHex(h, Math.max(s, 65), newV);
    if (contrastRatioOnWhite(candidate) >= 4.5) return candidate;
  }
  return "#1F2937";
}

function CustomColorPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [hexInput, setHexInput] = useState(value.toUpperCase());
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexInput(value.toUpperCase());
    setHsv(hexToHsv(value));
  }, [value]);

  const updateFromHsv = (next: { h: number; s: number; v: number }) => {
    setHsv(next);
    const hex = hsvToHex(next.h, next.s, next.v);
    setHexInput(hex);
    onChange(hex);
  };

  const handlePointer = (clientX: number, clientY: number) => {
    const el = boxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const s = Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 100);
    const v = Math.round((1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))) * 100);
    updateFromHsv({ ...hsv, s, v });
  };

  return (
    <div className="cv-custom-color-card" data-testid="custom-color-picker">
      <div className="cv-row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <span className="cv-label" style={{ fontSize: 13 }}>Custom color</span>
        <span className="cv-chip" style={{ gap: 6, padding: "2px 9px" }}>
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: value, display: "inline-block", border: "1px solid rgba(255,255,255,0.35)" }} />
          <span style={{ fontFamily: "monospace", fontSize: 11.5 }}>{value.toUpperCase()}</span>
        </span>
      </div>

      {/* 2D Saturation / Value Gradient Canvas */}
      <div
        ref={boxRef}
        role="slider"
        aria-label="Color saturation and brightness"
        aria-valuetext={value}
        tabIndex={0}
        className="cv-color-sv-box"
        style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
        onMouseDown={(e) => {
          handlePointer(e.clientX, e.clientY);
          const onMove = (ev: MouseEvent) => handlePointer(ev.clientX, ev.clientY);
          const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
      >
        <div className="cv-color-sv-white" />
        <div className="cv-color-sv-black" />
        <span
          className="cv-color-sv-thumb"
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            backgroundColor: value,
          }}
        />
      </div>

      {/* Rainbow Hue Slider */}
      <div style={{ marginTop: 12 }}>
        <input
          type="range"
          min={0}
          max={360}
          value={hsv.h}
          aria-label="Color hue"
          className="cv-hue-slider"
          onChange={(e) => updateFromHsv({ ...hsv, h: Number(e.target.value) })}
        />
      </div>

      {/* HEX Input & Brightness Nudge Controls */}
      <div className="cv-color-hex-row">
        <span className="cv-eyebrow" style={{ fontSize: 10.5, letterSpacing: "0.08em" }}>HEX</span>
        <div className="cv-row" style={{ gap: 8, marginTop: 4, flexWrap: "nowrap" }}>
          <input
            type="text"
            aria-label="Custom color HEX code"
            className="cv-input cv-color-hex-input"
            maxLength={7}
            value={hexInput}
            onChange={(e) => {
              const raw = e.target.value;
              const formatted = raw.startsWith("#") ? raw : `#${raw}`;
              setHexInput(formatted.toUpperCase());
              if (/^#[0-9A-Fa-f]{6}$/.test(formatted)) {
                setHsv(hexToHsv(formatted));
                onChange(formatted.toUpperCase());
              }
            }}
          />
          <div className="cv-color-steppers">
            <button
              type="button"
              aria-label="Brighten custom color"
              title="Brighten"
              onClick={() => updateFromHsv({ ...hsv, v: Math.min(100, hsv.v + 6) })}
            >
              ▲
            </button>
            <button
              type="button"
              aria-label="Darken custom color"
              title="Darken"
              onClick={() => updateFromHsv({ ...hsv, v: Math.max(10, hsv.v - 6) })}
            >
              ▼
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The Finish tab: how the CV looks on the page, the order it is printed in,
 * and the files. Every choice here is one the template allows: the page stays
 * one column of real text whatever is picked.
 */
export function Finish({ onOverflow, say }: { onOverflow: () => void; say: (text: string) => void }) {
  const w = useWorkspace();
  const { update, settle, save, paper, checks, setChecks } = w;
  const cv = w.cv!;
  const { panel, item, open, close } = usePanel();
  const [busy, setBusy] = useState<"" | "check" | Format>("");
  const [problem, setProblem] = useState("");
  const [downloads, setDownloads] = useState(0);
  const design = cv.design;
  const [showCustomColor, setShowCustomColor] = useState(Boolean(design.customAccent));
  const word = docWord(cv.region);
  const template = TEMPLATES[design.template];
  const accent = design.accent ?? template.accent;
  const activeHex = design.customAccent ?? ACCENTS[accent].hex;
  const fonts = design.fonts ?? template.id;
  const fontChoice = FONT_CHOICES.find((c) => pairLabel(TEMPLATES[c.id].fonts) === pairLabel(TEMPLATES[fonts].fonts))?.id ?? template.id;
  const set = (changes: Partial<Design>) => update({ design: { ...design, ...changes } });
  const pairing = TEMPLATES[fonts]?.fonts ?? template.fonts;
  const headingFont = design.headingFont ?? pairing.heading;
  const bodyFont = design.bodyFont ?? pairing.body;
  /** What the person has changed from the template's own look. */
  // A value the same as the default is no change: the server fills these in when it saves.
  const DEFAULTS: Partial<Record<(typeof CHANGE_KEYS)[number], unknown>> = { density: "default", dividerStyle: "solid", fontSize: 10.5, lineSpacing: 1, margin: "normal", indentation: 13 };
  const changed = CHANGE_KEYS.filter((k) => design[k] !== undefined && design[k] !== DEFAULTS[k]);
  const reset = () => update({ design: { ...design, ...Object.fromEntries(CHANGE_KEYS.map((k) => [k, DEFAULTS[k]])) } });
  const [styles, setStyles] = useState<SavedStyle[] | null>(null);
  const [styleName, setStyleName] = useState("");
  const [styleProblem, setStyleProblem] = useState("");
  useEffect(() => {
    api<{ styles: SavedStyle[] }>("/api/cv/styles")
      .then((r) => setStyles(r.styles))
      .catch(() => setStyles([]));
  }, []);
  async function saveStyle() {
    setStyleProblem("");
    try {
      const { style } = await api<{ style: SavedStyle }>("/api/cv/styles", { method: "POST", json: { name: styleName.trim(), design } });
      setStyles((all) => [...(all ?? []), style]);
      setStyleName("");
      say(`Saved “${style.name}”. You can use it on any of your ${word}s.`);
    } catch (err) {
      setStyleProblem(messageOf(err));
    }
  }
  async function deleteStyle(st: SavedStyle) {
    setStyleProblem("");
    try {
      await api(`/api/cv/styles/${st.id}`, { method: "DELETE" });
      setStyles((all) => (all ?? []).filter((x) => x.id !== st.id));
      say(`Deleted “${st.name}”. ${word === "CV" ? "CVs" : "Resumes"} that use it keep their look.`);
    } catch (err) {
      setStyleProblem(messageOf(err));
    }
  }
  function useStyle(st: SavedStyle) {
    // The saved look replaces every change made here; the page size, page target, order and file name stay.
    update({ design: { ...design, ...Object.fromEntries(CHANGE_KEYS.map((k) => [k, undefined])), ...st.design } });
    say(`Now using “${st.name}”.`);
  }
  const empty = cvIsEmpty(cv);
  const pages = paper?.layout.pages ?? 0;
  const target = design.pageTarget;
  const over = !empty && pages > target;

  const ordered = paperOrder(cv, template);
  const drag = useDragOrder(ordered, (next) => set({ order: next.map((s) => s.id) }));

  function fit() {
    if (!paper) return;
    const f = fitToPages(cv, paper.fonts, target);
    if (!f.fits) return onOverflow();
    if (f.density !== design.density) set({ density: f.density });
    say(`Fits on ${f.pages === 1 ? "one page" : `${f.pages} pages`} with ${f.density} spacing.`);
  }

  const current = !!checks && checks.rev === cv.rev && save === "saved";

  async function check() {
    setProblem("");
    setBusy("check");
    try {
      if (!(await settle())) throw new Error("Your latest changes haven’t been saved yet, so a file can’t be made from them. Check the save status at the top, then try again.");
      const result = await api<FileChecks>(`/api/cv/versions/${cv.id}/check`, { method: "POST", json: {} });
      setChecks({ rev: result.rev, pdf: result.pdf, docx: result.docx });
      const bad = (["pdf", "docx"] as const).filter((f) => result[f]?.status !== "checked");
      say(bad.length ? `${bad.map((f) => FORMAT_NAME[f]).join(" and ")}: the check found a problem.` : "Both files checked. Each reads back the same as your CV.");
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  }

  async function download(format: Format, unchecked = false) {
    setProblem("");
    setBusy(format);
    try {
      if (!(await settle())) throw new Error("Your latest changes haven’t been saved yet, so a file can’t be made from them. Check the save status at the top, then try again.");
      let res: Response;
      try {
        res = await fetch(`/api/cv/versions/${cv.id}/export?format=${format}${unchecked ? "&unchecked=1" : ""}`);
      } catch {
        throw new ApiError(0, "No connection. Check you’re online and try again.");
      }
      const rev = Number(res.headers.get("x-cv-rev")) || cv.rev;
      const keep = (c: FileChecks | null, mine: FileCheck): FileChecks => ({ ...(c && c.rev === rev ? c : {}), rev, [format]: mine });
      if (res.ok) {
        // The bytes saved are the bytes that were read back and matched.
        const blob = await res.blob();
        const named = /filename\*=UTF-8''([^;]+)/.exec(res.headers.get("content-disposition") ?? "");
        const name = named ? decodeURIComponent(named[1]) : fileName(cv, format);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        setDownloads((n) => n + 1);
        if (res.headers.get("x-cv-check") === "checked") {
          setChecks((c) => keep(c, { status: "checked", name, pages: Number(res.headers.get("x-cv-pages")) || undefined, size: blob.size }));
          say(`${name} downloaded. It was checked first: it reads back the same as your ${word}.`);
        } else say(`${name} downloaded without a check. Open it and read it through before you send it.`);
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string; check?: { missing?: string[]; unexpected?: string[] }; unsupported?: string[] };
      if (body.error === "loss") {
        setChecks((c) => keep(c, { status: "loss", missing: body.check?.missing ?? [], unexpected: body.check?.unexpected ?? [], unsupported: body.unsupported ?? [] }));
        open("file-loss", { item: format });
        return;
      }
      if (res.status !== 409) setChecks((c) => keep(c, { status: "failed", made: body.error === "check_failed" }));
      setProblem(body.error === "check_failed" ? `The ${FORMAT_NAME[format]} file was made, but we couldn’t read it back to check it. You can try again, or download it unchecked and read it through yourself.` : (body.message ?? "The file could not be made."));
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  }

  const lost = panel === "file-loss" && (item === "pdf" || item === "docx") ? checks?.[item] : undefined;
  const other: Format = item === "pdf" ? "docx" : "pdf";

  return (
    <div className="cv-stack">
      <div className="cv-note cv-row" role="status" data-testid="design-base">
        <span>
          Based on <b>{templateLabel(template)}</b>
          {changed.length ? `, with ${changed.length === 1 ? "1 change" : `${changed.length} changes`} of your own` : ", as designed"}.
        </span>
        {changed.length > 0 && (
          <Btn className="cv-push" onClick={reset}>
            Reset to {templateLabel(template)}
          </Btn>
        )}
      </div>
      <Panel title="Template">
        <fieldset>
          <legend className="sr-only">Template</legend>
          <div className="cv-pad">
          <div className="cv-templates">
            {[...CV_TEMPLATES].sort((a, b) => TEMPLATES[a].no - TEMPLATES[b].no).map((id) => {
              const t = TEMPLATES[id];
              return (
                <label key={id} className="cv-choice cv-template">
                  <input type="radio" name="template" className="sr-only" checked={design.template === id} onChange={() => set({ template: id })} />
                  <TemplateThumb def={t} accent={design.customAccent ?? ACCENTS[design.accent ?? t.accent].hex} />
                  <span className="min-w-0">
                    <b>
                      {design.template === id && <span aria-hidden="true">✓ </span>}
                      {templateLabel(t)}
                    </b>
                    <small style={{ display: "block" }}>{t.suits}</small>
                  </span>
                </label>
              );
            })}
          </div>
          <small style={{ display: "block", marginTop: 10 }}>Every template is one column of real text with standard headings, so software reads it the way a person does.</small>
          </div>
        </fieldset>
      </Panel>

      <Panel title="Fonts and colour">
        <div className="cv-pad cv-stack">
          <div>
            <label className="cv-label" htmlFor="cv-fonts">
              Font pairing
            </label>
            <CvSelect
              id="cv-fonts"
              value={fontChoice}
              onChange={(val) => set({ fonts: val as TemplateId, headingFont: undefined, bodyFont: undefined })}
              options={FONT_CHOICES.map((c) => ({
                value: c.id,
                label: c.label,
                badge: c.id === template.id || pairLabel(TEMPLATES[c.id].fonts) === pairLabel(template.fonts) ? `${templateLabel(template)}’s own` : undefined,
              }))}
            />
          </div>
          <div className="cv-pair">
            <div>
              <label className="cv-label" htmlFor="cv-heading-font">
                Name and headings
              </label>
              <CvSelect
                id="cv-heading-font"
                value={headingFont}
                onChange={(val) => set({ headingFont: val as FontFamilyId })}
                options={CV_FONT_FAMILIES.map((f) => ({ value: f, label: FAMILIES[f], badge: f === template.fonts.heading ? "template" : undefined }))}
              />
            </div>
            <div>
              <label className="cv-label" htmlFor="cv-body-font">
                Body text
              </label>
              <CvSelect
                id="cv-body-font"
                value={bodyFont}
                onChange={(val) => set({ bodyFont: val as FontFamilyId })}
                options={CV_FONT_FAMILIES.filter((f) => f !== "mono").map((f) => ({ value: f, label: FAMILIES[f], badge: f === template.fonts.body ? "template" : undefined }))}
              />
            </div>
          </div>

          {/* Fine-grained Font Size Slider (Rezi audit: 6-16 pt) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label className="cv-label" htmlFor="cv-font-size" style={{ margin: 0 }}>
                Body font size
              </label>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent, #7b88ff)" }}>
                {design.fontSize ?? 10.5} pt
              </span>
            </div>
            <input
              id="cv-font-size"
              type="range"
              min="6"
              max="16"
              step="0.5"
              value={design.fontSize ?? 10.5}
              onChange={(e) => set({ fontSize: Number(e.target.value) })}
              className="cv-slider"
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "11px", color: "var(--text-muted, #9a9ba7)" }}>
              <button type="button" onClick={() => set({ fontSize: 9 })} className="cv-link" style={{ fontSize: "11px" }}>9 pt (Compact)</button>
              <button type="button" onClick={() => set({ fontSize: 10.5 })} className="cv-link" style={{ fontSize: "11px" }}>10.5 pt (Standard)</button>
              <button type="button" onClick={() => set({ fontSize: 12 })} className="cv-link" style={{ fontSize: "11px" }}>12 pt (Large)</button>
            </div>
          </div>

          <fieldset>
            <legend className="cv-label">Colour</legend>
            <div className="cv-row" style={{ gap: 8, marginTop: 8 }}>
              {CV_ACCENTS.map((id: AccentId) => (
                <label key={id} className="cv-swatch" title={ACCENTS[id].name}>
                  <input
                    type="radio"
                    name="accent"
                    className="sr-only"
                    checked={!design.customAccent && accent === id}
                    onChange={() => {
                      setShowCustomColor(false);
                      set({ accent: id, customAccent: undefined });
                    }}
                  />
                  <span style={{ background: ACCENTS[id].hex }} aria-hidden="true" />
                  <span className="sr-only">{ACCENTS[id].name}</span>
                </label>
              ))}
              <button
                type="button"
                title="Choose a custom colour"
                aria-label="Custom color"
                aria-pressed={showCustomColor || Boolean(design.customAccent)}
                onClick={() => {
                  const nextOpen = !showCustomColor;
                  setShowCustomColor(nextOpen);
                  if (nextOpen && !design.customAccent) {
                    set({ customAccent: activeHex });
                  }
                }}
                className="cv-swatch cv-swatch-custom"
                data-active={Boolean(design.customAccent) || undefined}
              >
                <span
                  aria-hidden="true"
                  style={
                    design.customAccent
                      ? { background: design.customAccent }
                      : { background: "conic-gradient(from 90deg, #ff4d4d, #f9cb28, #22c55e, #06b6d4, #4f52f8, #d946ef, #ff4d4d)" }
                  }
                >
                  {design.customAccent ? "✓" : "+"}
                </span>
              </button>
            </div>
            {(showCustomColor || Boolean(design.customAccent)) && (
              <CustomColorPicker
                value={activeHex}
                onChange={(hex) => set({ customAccent: hex })}
              />
            )}

            {/* Live Contrast Verification Check (Audit: contrast check for yellow/light accents on white) */}
            {(() => {
              const ratio = contrastRatioOnWhite(activeHex);
              const isPass = ratio >= 4.5;
              const isHeadingPass = ratio >= 3.0;
              return (
                <div
                  style={{
                    marginTop: 10,
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: isPass ? "rgba(131, 213, 180, 0.1)" : isHeadingPass ? "rgba(123, 136, 255, 0.1)" : "rgba(255, 92, 97, 0.12)",
                    border: `1px solid ${isPass ? "rgba(131, 213, 180, 0.3)" : isHeadingPass ? "rgba(123, 136, 255, 0.3)" : "rgba(255, 92, 97, 0.35)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    fontSize: 11.5,
                  }}
                >
                  <span style={{ color: isPass ? "var(--success)" : isHeadingPass ? "var(--accent)" : "var(--danger)", fontWeight: 500 }}>
                    {isPass
                      ? `✓ Contrast ${ratio}:1 on white paper (WCAG AA Compliant)`
                      : isHeadingPass
                      ? `ℹ️ Contrast ${ratio}:1 on white paper (Acceptable for headings)`
                      : `⚠️ Low contrast warning: ${ratio}:1 on white paper (headings may be hard to read)`}
                  </span>
                  {!isHeadingPass && (
                    <button
                      type="button"
                      onClick={() => set({ customAccent: darkenHexToPass(activeHex) })}
                      className="cv-btn cv-btn-subtle"
                      style={{ padding: "3px 8px", fontSize: 11, whiteSpace: "nowrap" }}
                    >
                      Auto-Darken
                    </button>
                  )}
                </div>
              );
            })()}

            <small style={{ display: "block", marginTop: 8 }}>
              {design.customAccent ? `Custom (${design.customAccent.toUpperCase()})` : ACCENTS[accent].name}. Used for headings and rules only; body text stays black.
            </small>
          </fieldset>
        </div>
      </Panel>

      <Panel title="Pages, spacing and margins">
        <div className="cv-pad cv-stack">
          {/* Region and Level controls (CV-6: Set-up choices can be changed on Finish) */}
          <fieldset>
            <legend className="cv-label">Where you’re applying</legend>
            <span className="cv-rule" style={{ display: "block", marginBottom: 6 }}>
              Sets “CV” or “resume”, standard paper size, spelling rules and how grades are presented.
            </span>
            <div className="cv-seg">
              <label>
                <input
                  type="radio"
                  name="cvRegion"
                  className="sr-only"
                  checked={cv.region === "uk"}
                  onChange={() => {
                    update({ region: "uk", design: { ...design, pageSize: "a4" } });
                    say("Switched to UK: A4 paper, UK spelling, and CV headings.");
                  }}
                />
                <span>UK (A4 · UK spelling)</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="cvRegion"
                  className="sr-only"
                  checked={cv.region === "us"}
                  onChange={() => {
                    update({ region: "us", design: { ...design, pageSize: "letter" } });
                    say("Switched to US: Letter paper, US spelling, and resume headings.");
                  }}
                />
                <span>US (Letter · US spelling)</span>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="cv-label">Career level</legend>
            <span className="cv-rule" style={{ display: "block", marginBottom: 6 }}>
              Adjusts the page target and lines needed for your stage of work. Keeps all your words.
            </span>
            <div className="cv-seg">
              {(["student", "early", "experienced", "senior"] as const).map((l) => (
                <label key={l}>
                  <input
                    type="radio"
                    name="cvLevel"
                    className="sr-only"
                    checked={cv.level === l}
                    onChange={() => {
                      const newTarget = l === "student" || l === "early" ? 1 : 2;
                      update({ level: l, design: { ...design, pageTarget: newTarget } });
                      say(`Updated level to ${l}. Target set to ${newTarget} page${newTarget === 1 ? "" : "s"}.`);
                    }}
                  />
                  <span style={{ textTransform: "capitalize" }}>{l}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="cv-label">Paper</legend>
            <div className="cv-seg" style={{ marginTop: 6 }}>
              {(["a4", "letter"] as const).map((size) => (
                <label key={size}>
                  <input type="radio" name="pageSize" className="sr-only" checked={design.pageSize === size} onChange={() => set({ pageSize: size })} />
                  <span>{size === "a4" ? "A4" : "US Letter"}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="cv-label">Page target</legend>
            <div className="cv-seg" style={{ marginTop: 6 }}>
              {([1, 2] as const).map((n) => (
                <label key={n}>
                  <input type="radio" name="pageTarget" className="sr-only" checked={target === n} onChange={() => set({ pageTarget: n })} />
                  <span>{n === 1 ? "One page" : "Two pages"}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Fine-grained Line Spacing Slider (Audit: range instead of 3 discrete steps) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label className="cv-label" htmlFor="cv-line-spacing" style={{ margin: 0 }}>
                Line spacing range
              </label>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent, #7b88ff)" }}>
                {(design.lineSpacing ?? (design.density === "tighter" ? 0.85 : design.density === "looser" ? 1.15 : 1.0)).toFixed(2)}×
              </span>
            </div>
            <input
              id="cv-line-spacing"
              type="range"
              min="0.75"
              max="1.50"
              step="0.05"
              value={design.lineSpacing ?? (design.density === "tighter" ? 0.85 : design.density === "looser" ? 1.15 : 1.0)}
              onChange={(e) => {
                const val = Number(e.target.value);
                set({
                  lineSpacing: val,
                  density: val < 0.95 ? "tighter" : val > 1.05 ? "looser" : "default",
                });
              }}
              className="cv-slider"
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "11px", color: "var(--text-muted, #9a9ba7)" }}>
              <button type="button" onClick={() => set({ lineSpacing: 0.85, density: "tighter" })} className="cv-link" style={{ fontSize: "11px" }}>0.85× (Tight)</button>
              <button type="button" onClick={() => set({ lineSpacing: 1.0, density: "default" })} className="cv-link" style={{ fontSize: "11px" }}>1.00× (Default)</button>
              <button type="button" onClick={() => set({ lineSpacing: 1.15, density: "looser" })} className="cv-link" style={{ fontSize: "11px" }}>1.15× (Relaxed)</button>
            </div>
          </div>

          {/* Margins Control (Audit: Fixed. No control) */}
          <fieldset>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <legend className="cv-label" style={{ margin: 0 }}>Margins</legend>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent, #7b88ff)" }}>
                {typeof design.margin === "number" ? `${design.margin} pt` : design.margin === "compact" ? "Compact (12mm)" : design.margin === "relaxed" ? "Relaxed (24mm)" : "Standard (18mm)"}
              </span>
            </div>
            <div className="cv-seg" style={{ marginTop: 6 }}>
              {(["compact", "normal", "relaxed"] as const).map((m) => (
                <label key={m}>
                  <input
                    type="radio"
                    name="margin"
                    className="sr-only"
                    checked={(design.margin ?? "normal") === m}
                    onChange={() => set({ margin: m })}
                  />
                  <span>{m === "compact" ? "Compact (12mm)" : m === "relaxed" ? "Relaxed (24mm)" : "Standard (18mm)"}</span>
                </label>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <input
                id="cv-margin-slider"
                type="range"
                min="24"
                max="68"
                step="2"
                aria-label="Fine margin slider"
                value={typeof design.margin === "number" ? design.margin : design.margin === "compact" ? 36 : design.margin === "relaxed" ? 64 : 50}
                onChange={(e) => set({ margin: Number(e.target.value) })}
                className="cv-slider"
                style={{ width: "100%" }}
              />
              <small style={{ display: "block", marginTop: 4, color: "var(--text-muted, #9a9ba7)" }}>
                Adjusts edge spacing across all pages for ATS scanners and standard printers.
              </small>
            </div>
          </fieldset>

          {!empty && paper && (
            <div className={over ? "cv-note cv-row" : "cv-row"} data-testid="page-status">
              <span className={over ? undefined : "cv-small"}>
                {pages === 1 ? "One page" : `${pages} pages`}. {over ? `Your target is ${target === 1 ? "one page" : "two pages"}.` : "Within your target."}
              </span>
              <Btn className="cv-push" onClick={fit}>
                Fit to {target === 1 ? "one page" : "two pages"}
              </Btn>
            </div>
          )}
        </div>
      </Panel>

      {/* Dividers, Icons and Indentation (Audit: Icons, indentation and section dividers missing on Finish tab) */}
      <Panel title="Name, headings and bullets">
        <div className="cv-pad cv-stack">
          <fieldset>
            <legend className="cv-label">Top of the page</legend>
            <div className="cv-seg" style={{ marginTop: 6, display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
              {(["plain", "band"] as const).map((h) => (
                <label key={h}>
                  <input type="radio" name="header" className="sr-only" checked={(design.header ?? template.header ?? "plain") === h} onChange={() => set({ header: h })} />
                  <span>{h === "plain" ? "Plain" : "Colour band"}</span>
                </label>
              ))}
            </div>
            {(design.header ?? template.header) === "band" && contrastRatioOnWhite(activeHex) < 4.5 && (
              <small className="cv-error-text" style={{ display: "block", marginTop: 6 }}>
                This colour is too pale for white text, so the name is shown plain. Choose a darker colour to use the band.
              </small>
            )}
          </fieldset>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label className="cv-label" htmlFor="cv-name-size" style={{ margin: 0 }}>
                Name size
              </label>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent, #7b88ff)" }}>{design.nameSize ?? template.title.size} pt</span>
            </div>
            <input id="cv-name-size" type="range" min="16" max="40" step="1" value={design.nameSize ?? template.title.size} onChange={(e) => set({ nameSize: Number(e.target.value) })} className="cv-slider" style={{ width: "100%" }} />
          </div>

          <label className="cv-choice" style={{ padding: "10px 14px" }}>
            <input type="checkbox" checked={design.headingCaps ?? Boolean(template.heading.caps)} onChange={(e) => set({ headingCaps: e.target.checked })} />
            <span>
              <b style={{ display: "block", fontSize: 13, fontWeight: 600 }}>Section headings in capitals</b>
              <small>Screening software reads headings the same either way.</small>
            </span>
          </label>

          <fieldset>
            <legend className="cv-label">Bullet mark</legend>
            <div className="cv-seg" style={{ marginTop: 6, display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
              {CV_BULLETS.map((b) => (
                <label key={b}>
                  <input type="radio" name="bullet" className="sr-only" checked={(design.bullet ?? template.bullet ?? "disc") === b} onChange={() => set({ bullet: b })} />
                  <span>{b === "disc" ? "• Dot" : b === "dash" ? "– Dash" : b === "arrow" ? "› Arrow" : "None"}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="cv-label">Between contact details</legend>
            <div className="cv-seg" style={{ marginTop: 6, display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
              {CV_SEPARATORS.map((sep) => (
                <label key={sep}>
                  <input type="radio" name="separator" className="sr-only" checked={(design.contactSeparator ?? template.separator ?? "dot") === sep} onChange={() => set({ contactSeparator: sep })} />
                  <span>{sep === "dot" ? "· Dot" : sep === "bar" ? "| Bar" : "• Bullet"}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label className="cv-label" htmlFor="cv-entry-indent" style={{ margin: 0 }}>
                Indent entries under headings
              </label>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent, #7b88ff)" }}>{design.entryIndent ?? template.entryIndent ?? 0} pt</span>
            </div>
            <input id="cv-entry-indent" type="range" min="0" max="24" step="1" value={design.entryIndent ?? template.entryIndent ?? 0} onChange={(e) => set({ entryIndent: Number(e.target.value) })} className="cv-slider" style={{ width: "100%" }} />
          </div>
          {/* Section divider style */}
          <fieldset>
            <legend className="cv-label">Section divider style</legend>
            <div className="cv-seg" style={{ marginTop: 6, display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
              {(["solid", "dashed", "dots", "accent-bar", "none"] as const).map((d) => (
                <label key={d}>
                  <input
                    type="radio"
                    name="dividerStyle"
                    className="sr-only"
                    checked={(design.dividerStyle ?? "solid") === d}
                    onChange={() => set({ dividerStyle: d })}
                  />
                  <span>{d === "accent-bar" ? "Accent Bar" : d.charAt(0).toUpperCase() + d.slice(1)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Bullet indentation */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label className="cv-label" htmlFor="cv-indent" style={{ margin: 0 }}>
                Bullet indentation
              </label>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent, #7b88ff)" }}>
                {design.indentation ?? 13} pt
              </span>
            </div>
            <input
              id="cv-indent"
              type="range"
              min="0"
              max="24"
              step="1"
              value={design.indentation ?? 13}
              onChange={(e) => set({ indentation: Number(e.target.value) })}
              className="cv-slider"
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "11px", color: "var(--text-muted, #9a9ba7)" }}>
              <button type="button" onClick={() => set({ indentation: 0 })} className="cv-link" style={{ fontSize: "11px" }}>0 pt (Flush)</button>
              <button type="button" onClick={() => set({ indentation: 13 })} className="cv-link" style={{ fontSize: "11px" }}>13 pt (Standard)</button>
              <button type="button" onClick={() => set({ indentation: 20 })} className="cv-link" style={{ fontSize: "11px" }}>20 pt (Deep)</button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Your styles">
        <div className="cv-pad cv-stack">
          <p className="cv-muted" style={{ margin: 0 }}>
            Save this look (template, fonts, colour, sizes and spacing) to use it again on any {word}.
          </p>
          {styles && styles.length > 0 && (
            <ul className="cv-plainlist" aria-label="Saved styles" style={{ display: "grid", gap: 8 }}>
              {styles.map((st) => (
                <li key={st.id} className="cv-row" style={{ gap: 8 }}>
                  <span className="grow min-w-0">
                    <b>{st.name}</b> <small className="cv-muted">· {templateLabel(TEMPLATES[st.design.template])}</small>
                  </span>
                  <Btn onClick={() => useStyle(st)}>Use</Btn>
                  <Btn kind="quiet" onClick={() => void deleteStyle(st)} aria-label={`Delete ${st.name}`}>
                    Delete
                  </Btn>
                </li>
              ))}
            </ul>
          )}
          <div className="cv-row" style={{ alignItems: "flex-end", gap: 8 }}>
            <div className="grow min-w-0">
              <Field label="Style name" value={styleName} onChange={setStyleName} maxLength={60} placeholder="For example: Two-page navy" />
            </div>
            <Btn onClick={() => void saveStyle()} disabled={!styleName.trim()}>
              Save this style
            </Btn>
          </div>
          {styleProblem && (
            <p className="cv-error-text" role="alert">
              {styleProblem}
            </p>
          )}
        </div>
      </Panel>

      <Panel
        title="Order on the page"
        aside={
          design.order?.length ? (
            <Btn kind="quiet" onClick={() => set({ order: undefined })}>
              Use {templateLabel(template)}’s order
            </Btn>
          ) : undefined
        }
      >
        <ul className="cv-orderlist" aria-label="Sections in the order they are printed">
          {ordered.map((s, i) => {
            const name = sectionHeading(s, cv.region);
            return (
              <li key={s.id} data-off={!s.visible || undefined} {...drag.row(s.id)}>
                <Grip {...drag.grip(s.id)} />
                <span className="min-w-0 grow">
                  {name}
                  {sectionIsEmpty(s) && <small style={{ display: "block" }}>Empty, so left off the page</small>}
                </span>
                <ItemControls name={`the ${name} section`} index={i} count={ordered.length} visible={s.visible} onVisible={(visible) => update({ sections: cv.sections.map((x) => (x.id === s.id ? { ...x, visible } : x)) })} onMove={(to) => drag.move(s.id, to)} />
              </li>
            );
          })}
        </ul>
        <p className="cv-pad cv-small" style={{ paddingTop: 0 }}>
          This is the order on the page. The form’s tabs keep their own order.
        </p>
      </Panel>

      <Panel title="Files" id="files">
        <div className="cv-pad cv-stack">
          <Field label="File name" rule="Without the ending. Leave empty for the standard name." placeholder={fileBaseName({ ...cv, design: { ...design, fileName: "" } })} maxLength={120} value={design.fileName ?? ""} onChange={(v) => set({ fileName: v })} />
          {empty ? (
            <p className="cv-muted">There is nothing to download yet. Add your details first.</p>
          ) : (
            <>
              <ul className="cv-filelist">
                {(["pdf", "docx"] as const).map((format) => {
                  const st = statusOf(checks?.[format], checks, current, busy === "check" || busy === format);
                  const c = checks?.[format];
                  return (
                    <li key={format} data-format={format}>
                      <span className="min-w-0 grow">
                        <b style={{ overflowWrap: "anywhere" }}>{fileName(cv, format)}</b>
                        <small style={{ display: "block" }} data-testid={`status-${format}`} className={st.tone === "good" ? "cv-good" : st.tone === "bad" ? "cv-warn" : undefined}>
                          {st.tone === "good" ? "✓ " : ""}
                          {st.word}
                          {st.word === "Checked" && c ? `: reads back the same as your ${word}${c.pages && format === "pdf" ? `, ${c.pages === 1 ? "one page" : `${c.pages} pages`}` : ""}` : ""}
                          {st.word === "Out of date" ? `: your ${word} has changed since the check` : ""}
                        </small>
                      </span>
                      {st.word === "Loss found" && <Btn onClick={() => open("file-loss", { item: format })}>See what was lost</Btn>}
                      {st.word === "Check failed" && c?.made && (
                        <Btn disabled={!!busy} onClick={() => void download(format, true)}>
                          Download unchecked file
                        </Btn>
                      )}
                      <Btn kind={format === "pdf" ? "primary" : "default"} busy={busy === format} disabled={!!busy} onClick={() => void download(format)}>
                        Download {FORMAT_NAME[format]}
                      </Btn>
                    </li>
                  );
                })}
              </ul>
              <div className="cv-row">
                <Btn busy={busy === "check"} disabled={!!busy} onClick={() => void check()}>
                  Check both files
                </Btn>
                <BtnLink href={`/cv/v/${cv.id}/software/pdf`}>See what software reads</BtnLink>
              </div>
              <small style={{ display: "block" }}>Each file is made, then read back and compared with your {word} word for word. A file that doesn’t match is not sent. The Word file names its fonts instead of carrying them, so its page breaks can differ on a computer without them.</small>
            </>
          )}
          {problem && (
            <p className="cv-error-text" role="alert">
              {problem}
            </p>
          )}
          <Downloads versionId={cv.id} refresh={downloads} />
        </div>
      </Panel>

      {panel === "file-loss" && (item === "pdf" || item === "docx") && (
        <Dialog
          title={`The ${FORMAT_NAME[item]} file doesn’t match your ${word}`}
          onClose={close}
          wide
          actions={
            <>
              <Btn
                onClick={() => {
                  close();
                  void download(item);
                }}
              >
                Rebuild the {FORMAT_NAME[item]} file
              </Btn>
              <Btn
                kind="primary"
                onClick={() => {
                  close();
                  void download(other);
                }}
              >
                Use the {FORMAT_NAME[other]} file instead
              </Btn>
            </>
          }
        >
          {!lost || lost.status !== "loss" ? (
            <p>This file hasn’t been checked since your last change. Download it again to check it.</p>
          ) : (
            <>
              <p>The file was made and read back, and it does not say exactly what your {word} says, so it has not been sent.</p>
              {!!lost.unsupported?.length && (
                <div className="cv-issue" style={{ display: "block" }}>
                  <strong>Characters these fonts can’t draw:</strong> <span data-testid="unsupported">{lost.unsupported.join(" ")}</span>
                  <p style={{ marginTop: 6 }} data-testid="unsupported-advice">
                    {cannotDrawAdvice(lost.unsupported)}
                  </p>
                </div>
              )}
              {!!lost.missing?.length && (
                <div>
                  <h3>In your {word}, not read back from the file</h3>
                  <ul className="cv-plainlist">
                    {lost.missing.slice(0, 12).map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!!lost.unexpected?.length && (
                <div>
                  <h3>In the file, not in your {word}</h3>
                  <p className="cv-quote">{lost.unexpected.slice(0, 60).join(" ")}</p>
                </div>
              )}
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}
