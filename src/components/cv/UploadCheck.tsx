"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CvImport, ImportFlag } from "@/lib/cv/import/record";
import { reviewSteps } from "@/lib/cv/import/record";
import { type CvDoc, type CvLevel, type CvRegion, CV_LEVELS, LEVEL_LABELS, isEntrySection } from "@/lib/cv/schema";
import { sectionHeading } from "@/lib/cv/sections";
import { api, messageOf } from "./client";
import { afterImport } from "./upload";
import { Announce, Bar, Btn, BtnLink, CvScreen } from "./ui";

type Change = { draft?: CvImport["draft"]; flags?: { id: string; state: ImportFlag["state"] }[] };

const ENTRY_FIELDS = ["title", "org", "location", "start", "end"] as const;
const CONTACT_FIELDS = ["fullName", "email", "phone", "location"] as const;
const FIELD_LABEL: Record<string, string> = { title: "Job title", org: "Employer", location: "Location", start: "Start and end dates", end: "Start and end dates", fullName: "Name", email: "Email", phone: "Phone" };

/** "2021-05" ⇄ the month input's "2021-05"; a bare year is shown as January of it for editing. */
const toMonth = (d: string) => (/^\d{4}-\d{2}$/.test(d) ? d : /^\d{4}$/.test(d) ? `${d}-01` : "");

/**
 * After an upload-first start (design spec v3 §01): what we read, row by row,
 * with only the details we couldn't place confidently open for checking.
 * Nothing flagged opens the editor directly. UK or US and the level are set
 * here when the file didn't show them; nothing is guessed.
 */
export function UploadCheck({ imp, cv, change, flush }: { imp: CvImport; cv: CvDoc; change: (c: Change) => void; flush: () => Promise<boolean> }) {
  const router = useRouter();
  const about = imp.about!;
  const [name, setName] = useState(about.name || cv.name);
  const [region, setRegion] = useState<CvRegion | null>(about.region);
  const [level, setLevel] = useState<CvLevel | null>(about.level);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  const open = imp.flags.filter((f) => f.state === "open");
  const loose = imp.unassigned.filter((u) => u.state === "open");
  const sectionOf = (id: string) => imp.draft.sections.find((s) => s.id === id);
  const exp = imp.draft.sections.find((s) => s.kind === "experience");
  const latest = exp && isEntrySection(exp) ? exp.entries.find((e) => e.title || e.org) : undefined;
  const contactFlags = open.filter((f) => f.at.section === "contact");
  const expFlags = open.filter((f) => exp && f.at.section === exp.id);
  const unknown = !about.region || !about.level;
  const flagged = open.length > 0 || loose.length > 0 || unknown;
  const ready = Boolean(region && level && name.trim());

  function stepKey(section: string): string {
    if (section === "contact") return "contact";
    return reviewSteps(imp).find((s) => s.sectionId === section)?.key ?? "contact";
  }

  /** Saves an inline correction to the field the flag is about, and marks the flag as edited. */
  function setField(flag: ImportFlag, field: string, value: string | boolean) {
    const draft = structuredClone(imp.draft);
    if (flag.at.section === "contact") {
      (draft.contact as Record<string, unknown>)[field] = value;
    } else {
      const s = draft.sections.find((x) => x.id === flag.at.section);
      if (s && isEntrySection(s)) {
        const e = s.entries.find((x) => x.id === flag.at.entry);
        if (e) (e as Record<string, unknown>)[field] = value;
      }
    }
    change({ draft, flags: [{ id: flag.id, state: "edited" }] });
  }

  async function openEditor() {
    if (!ready) return setProblem("Choose UK or US and your level first.");
    setBusy(true);
    setProblem("");
    try {
      // Flags the person looked at here count as confirmed; anything still open is left for the section check.
      const shown = open.filter((f) => inlineField(f));
      if (shown.length) change({ flags: shown.map((f) => ({ id: f.id, state: f.state === "open" ? "confirmed" : f.state })) });
      if (!(await flush())) throw new Error("Your corrections couldn’t be saved. Check you’re online and try again.");
      const { versionId, next } = await api<{ versionId: string; next?: string }>(`/api/cv/imports/${imp.id}/confirm`, { method: "POST", json: { name: name.trim(), region, level } });
      router.push(afterImport(versionId, next));
    } catch (err) {
      setBusy(false);
      setProblem(messageOf(err));
    }
  }

  /** The field a flag can be fixed in right here, or null when it needs the full section check. */
  function inlineField(f: ImportFlag): string | null {
    if (!f.at.field) return null;
    if (f.at.section === "contact") return (CONTACT_FIELDS as readonly string[]).includes(f.at.field) ? f.at.field : null;
    return f.at.entry && (ENTRY_FIELDS as readonly string[]).includes(f.at.field) ? f.at.field : null;
  }

  const blocking = open.filter((f) => !inlineField(f));

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "New CV" }]} />
      <div className="cv-area cv-start">
        <ol className="cv-steps" aria-label="Steps">
          <li data-done><span className="cv-steps-dot">✓</span>Upload</li>
          <li aria-current={flagged ? "step" : undefined}><span className="cv-steps-dot">2</span>Check flagged details</li>
          <li aria-current={flagged ? undefined : "step"}><span className="cv-steps-dot">3</span>Editor</li>
        </ol>
        <h1 className="cv-start-title">{flagged ? "Check what we read" : "Nothing flagged"}</h1>
        <p className="cv-start-sub">{flagged ? "Check only the details we couldn’t place confidently." : "Everything we read is ready to edit."}</p>

        <section className="cv-start-card" aria-label="What we read">
          <ul className="cv-readrows" style={{ marginTop: 0 }}>
            <li>
              <b>{imp.fileName || "Your file"}</b>
              <span className="cv-chip" data-state="read">Read</span>
            </li>
            <li>
              <div>
                <span>Name and contact details</span>
                <small>{[imp.draft.contact.fullName, imp.draft.contact.location].filter(Boolean).join(" · ") || "Not known yet"}</small>
              </div>
              <State review={contactFlags.length > 0 || !imp.draft.contact.fullName} />
            </li>
            <li>
              <div>
                <span>Experience</span>
                <small>{latest ? [latest.title, latest.org].filter(Boolean).join(" · ") : "No roles found"}</small>
              </div>
              <State review={expFlags.length > 0} />
            </li>
            <li>
              <div>
                <label htmlFor="about-region">UK or US</label>
                <small>{region ? (region === "uk" ? "UK · A4" : "US · Letter") : "Not known yet"}{about.why.region && !about.region ? ` · ${about.why.region}` : ""}</small>
              </div>
              <span className="cv-row" style={{ gap: 8 }}>
                <select id="about-region" className="cv-chipselect" value={region ?? ""} onChange={(e) => setRegion((e.target.value || null) as CvRegion | null)}>
                  <option value="">Not known yet</option>
                  <option value="uk">UK · A4</option>
                  <option value="us">US · Letter</option>
                </select>
                <State review={!region} />
              </span>
            </li>
            <li>
              <div>
                <label htmlFor="about-level">Level</label>
                <small>{level ? LEVEL_LABELS[level] : "Not known yet"}{about.why.level && !about.level ? ` · ${about.why.level}` : ""}</small>
              </div>
              <span className="cv-row" style={{ gap: 8 }}>
                <select id="about-level" className="cv-chipselect" value={level ?? ""} onChange={(e) => setLevel((e.target.value || null) as CvLevel | null)}>
                  <option value="">Not known yet</option>
                  {CV_LEVELS.map((l) => (
                    <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
                  ))}
                </select>
                <State review={!level} />
              </span>
            </li>
            <li>
              <div style={{ flex: 1 }}>
                <label htmlFor="about-name">Document name</label>
                <input id="about-name" className="cv-chipinput" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
              </div>
              <State review={!name.trim()} />
            </li>
          </ul>

          {open.filter((f) => inlineField(f)).map((f) => {
            const field = inlineField(f)!;
            const section = f.at.section === "contact" ? null : sectionOf(f.at.section);
            const entry = section && isEntrySection(section) ? section.entries.find((e) => e.id === f.at.entry) : undefined;
            const title = f.at.section === "contact" ? "Contact" : section ? sectionHeading(section, region ?? cv.region) : "Section";
            const value = f.at.section === "contact" ? String((imp.draft.contact as Record<string, unknown>)[field] ?? "") : String((entry as Record<string, unknown> | undefined)?.[field] ?? "");
            const passage = f.lines.map((n) => imp.lines[n]?.text).filter(Boolean);
            const dates = field === "start" || field === "end";
            return (
              <div key={f.id} className="cv-flag">
                <h2 className="cv-start-h2">{title} · {f.message}</h2>
                <div className="cv-flag-grid">
                  <div>
                    <span className="cv-small">Your file</span>
                    <blockquote className="cv-flag-source">{passage.length ? passage.map((t, i) => <span key={i}>{t}</span>) : <span>{entry ? [entry.title, entry.org].filter(Boolean).join(" · ") : "—"}</span>}</blockquote>
                  </div>
                  <div className="cv-stack" style={{ gap: 8 }}>
                    {dates && entry ? (
                      <fieldset className="cv-flag-dates">
                        <legend className="cv-label">Start and end dates</legend>
                        <label>Start <input type="month" className="cv-chipinput" value={toMonth(entry.start)} onChange={(e) => setField(f, "start", e.target.value)} /></label>
                        <label>End <input type="month" className="cv-chipinput" value={toMonth(entry.end)} disabled={entry.current} onChange={(e) => setField(f, "end", e.target.value)} /></label>
                        <label className="cv-row" style={{ gap: 6 }}><input type="checkbox" checked={entry.current} onChange={(e) => setField(f, "current", e.target.checked)} /> I still do this</label>
                      </fieldset>
                    ) : (
                      <label className="cv-stack" style={{ gap: 4 }}>
                        <span className="cv-label">{FIELD_LABEL[field] ?? field}</span>
                        <input className="cv-chipinput" value={value} maxLength={160} onChange={(e) => setField(f, field, e.target.value)} />
                      </label>
                    )}
                    <span className="cv-small">Confirm or correct this. Other sections are already read.</span>
                  </div>
                </div>
              </div>
            );
          })}

          {(blocking.length > 0 || loose.length > 0) && (
            <div className="cv-flag">
              <h2 className="cv-start-h2">Also to check</h2>
              <ul className="cv-readrows">
                {blocking.map((f) => (
                  <li key={f.id}>
                    <div>
                      <span>{f.at.section === "contact" ? "Contact" : (() => { const s = sectionOf(f.at.section); return s ? sectionHeading(s, region ?? cv.region) : "Section"; })()}</span>
                      <small>{f.message}</small>
                    </div>
                    <BtnLink href={`/cv/import/${imp.id}/review/${stepKey(f.at.section)}?flagged=true`}>Check this</BtnLink>
                  </li>
                ))}
                {loose.length > 0 && (
                  <li>
                    <div>
                      <span>Text we couldn’t place</span>
                      <small>{loose.length} line{loose.length === 1 ? "" : "s"} from your file</small>
                    </div>
                    <BtnLink href={`/cv/import/${imp.id}/review/unassigned`}>Check this</BtnLink>
                  </li>
                )}
              </ul>
            </div>
          )}

          {!flagged && <p className="cv-start-help" style={{ marginTop: 14 }}>No extra review step is needed.</p>}
          {problem && (
            <p className="cv-error-text" role="alert" style={{ marginTop: 12 }}>
              {problem}
            </p>
          )}
          <div className="cv-row" style={{ marginTop: 18 }}>
            {flagged && (
              <Btn
                disabled={busy}
                onClick={async () => {
                  // Going back starts again: what was read, and the empty CV made for it, are not left behind.
                  setBusy(true);
                  await api(`/api/cv/imports/${imp.id}`, { method: "DELETE" }).catch(() => {});
                  await api(`/api/cv/versions/${cv.id}`, { method: "DELETE" }).catch(() => {});
                  router.push("/cv/new");
                }}
              >
                Back
              </Btn>
            )}
            <Btn kind="primary" busy={busy} disabled={!ready} onClick={() => void openEditor()}>
              {flagged ? "Confirm and open editor" : "Open editor"}
            </Btn>
          </div>
        </section>
        <Announce>{busy ? "Opening the editor" : problem}</Announce>
      </div>
    </CvScreen>
  );
}

function State({ review }: { review: boolean }) {
  return review ? (
    <span className="cv-chip" data-state="review">To review</span>
  ) : (
    <span className="cv-chip" data-state="read">Read</span>
  );
}
