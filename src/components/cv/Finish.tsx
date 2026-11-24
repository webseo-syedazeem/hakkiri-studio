"use client";

import { useState } from "react";
import { fileBaseName, fileName } from "@/lib/cv/render/filename";
import { cannotDrawAdvice } from "@/lib/cv/render/fonts";
import { paperOrder } from "@/lib/cv/render/flow";
import { FAMILIES } from "@/lib/cv/render/fonts";
import { fitToPages } from "@/lib/cv/render/layout";
import { ACCENTS, PAIRINGS, TEMPLATES, type TemplateDef } from "@/lib/cv/render/templates";
import { type AccentId, CV_ACCENTS, CV_DENSITIES, CV_TEMPLATES, type Design, type TemplateId, cvIsEmpty, sectionIsEmpty } from "@/lib/cv/schema";
import { docWord, sectionHeading } from "@/lib/cv/sections";
import { Grip, ItemControls, useDragOrder } from "./Arrange";
import { ApiError, api, messageOf } from "./client";
import { Dialog, usePanel } from "./Dialog";
import { Downloads } from "./Software";
import { Btn, BtnLink, Field, Panel } from "./ui";
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
  const word = docWord(cv.region);
  const template = TEMPLATES[design.template];
  const accent = design.accent ?? template.accent;
  const fonts = design.fonts ?? template.id;
  const fontChoice = FONT_CHOICES.find((c) => pairLabel(TEMPLATES[c.id].fonts) === pairLabel(TEMPLATES[fonts].fonts))?.id ?? template.id;
  const set = (changes: Partial<Design>) => update({ design: { ...design, ...changes } });
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
      <Panel title="Template">
        <fieldset>
          <legend className="sr-only">Template</legend>
          <div className="cv-pad">
          <div className="cv-templates">
            {CV_TEMPLATES.map((id) => {
              const t = TEMPLATES[id];
              return (
                <label key={id} className="cv-choice cv-template">
                  <input type="radio" name="template" className="sr-only" checked={design.template === id} onChange={() => set({ template: id })} />
                  <TemplateThumb def={t} accent={ACCENTS[design.accent ?? t.accent].hex} />
                  <span className="min-w-0">
                    <b>{t.name}</b>
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
              Fonts
            </label>
            <select id="cv-fonts" className="cv-input" value={fontChoice} onChange={(e) => set({ fonts: e.target.value as TemplateId })}>
              {FONT_CHOICES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                  {c.id === template.id || pairLabel(TEMPLATES[c.id].fonts) === pairLabel(template.fonts) ? ` (${template.name}’s own)` : ""}
                </option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="cv-label">Colour</legend>
            <div className="cv-row" style={{ gap: 8, marginTop: 6 }}>
              {CV_ACCENTS.map((id: AccentId) => (
                <label key={id} className="cv-swatch" title={ACCENTS[id].name}>
                  <input type="radio" name="accent" className="sr-only" checked={accent === id} onChange={() => set({ accent: id })} />
                  <span style={{ background: ACCENTS[id].hex }} aria-hidden="true" />
                  <span className="sr-only">{ACCENTS[id].name}</span>
                </label>
              ))}
            </div>
            <small style={{ display: "block", marginTop: 6 }}>{ACCENTS[accent].name}. Used for headings and rules only; body text stays black.</small>
          </fieldset>
        </div>
      </Panel>

      <Panel title="Pages and spacing">
        <div className="cv-pad cv-stack">
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
          <fieldset>
            <legend className="cv-label">Spacing</legend>
            <span className="cv-rule">Changes the space between lines and sections. The type stays the same size.</span>
            <div className="cv-seg" style={{ marginTop: 6 }}>
              {CV_DENSITIES.map((d) => (
                <label key={d}>
                  <input type="radio" name="density" className="sr-only" checked={design.density === d} onChange={() => set({ density: d })} />
                  <span>{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                </label>
              ))}
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

      <Panel
        title="Order on the page"
        aside={
          design.order?.length ? (
            <Btn kind="quiet" onClick={() => set({ order: undefined })}>
              Use {template.name}’s order
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
