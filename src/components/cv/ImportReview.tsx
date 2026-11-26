"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { whereKey } from "@/lib/cv/import/parse";
import { type CvImport, type ImportDraft, type ImportFlag, openFlags, reviewSteps } from "@/lib/cv/import/record";
import { type Contact, type Entry, type Section, isEntrySection, newBullet, newId } from "@/lib/cv/schema";
import { SECTION_DEFS, sectionHeading } from "@/lib/cv/sections";
import { api, messageOf } from "./client";
import { afterImport } from "./upload";
import { Dialog, usePanel } from "./Dialog";
import { stepName } from "./ImportHome";
import { ReplaceFileDialog } from "./ReplaceFile";
import { ContactForm, type FieldHooks, SectionForm, entryLabel } from "./SectionForms";
import { Announce, Bar, Btn, BtnLink, CvScreen, CvSelect, Fixed, Note, Panel, Skeleton, Toolbar } from "./ui";
import { useImport } from "./useImport";

const RESOLVED_WORDS = { confirmed: "Confirmed", edited: "Changed by you", blank: "Left blank" } as const;

/** The file's own text. The lines the selected field was read from are marked and brought into view. */
function SourcePane({ imp, marked, title }: { imp: CvImport; marked: number[]; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const first = marked[0];
  useEffect(() => {
    const el = first === undefined ? null : box.current?.querySelector<HTMLElement>(`[data-line="${first}"]`);
    if (el && box.current) box.current.scrollTo({ top: Math.max(0, el.offsetTop - box.current.offsetTop - box.current.clientHeight / 3), behavior: "smooth" });
  }, [first]);
  const set = new Set(marked);
  let page = 0;
  return (
    <Panel title={title} aside={<small>{imp.fileName || "Pasted text"}</small>}>
      <div className="cv-source" ref={box} tabIndex={0} role="region" aria-label="The text of your file">
        {imp.lines.length === 0 && <p className="cv-pad cv-muted">No text found.</p>}
        {imp.lines.map((l, i) => {
          const newPage = imp.pages > 1 && l.page !== page;
          page = l.page;
          return (
            <span key={i}>
              {newPage && <span className="cv-source-page" style={{ display: "block" }}>Page {l.page}</span>}
              <span className="cv-source-line" data-line={i} data-marked={set.has(i)} data-heading={l.heading} data-bullet={l.bullet}>
                {l.text}
              </span>
            </span>
          );
        })}
      </div>
    </Panel>
  );
}

/** Where a leftover line can go: under a role or other entry, into skills, or into the profile. */
function AssignDialog({ text, draft, region, onAssign, onClose }: { text: string; draft: ImportDraft; region: "uk" | "us"; onAssign: (draft: ImportDraft) => void; onClose: () => void }) {
  const options = useMemo(() => {
    const out: { value: string; label: string }[] = [];
    for (const s of draft.sections) {
      if (isEntrySection(s) && SECTION_DEFS[s.kind].bullets) for (const e of s.entries) out.push({ value: `entry:${s.id}:${e.id}`, label: `${sectionHeading(s, region)}: a bullet under “${entryLabel(e, "this entry")}”` });
      if (s.kind === "skills") out.push({ value: `skills:${s.id}`, label: "Skills: as a skill" });
      if (s.kind === "summary") out.push({ value: `summary:${s.id}`, label: `${sectionHeading(s, region)}: added to the end` });
    }
    return out;
  }, [draft, region]);
  const [to, setTo] = useState(options[0]?.value ?? "");
  const [words, setWords] = useState(text);

  function apply() {
    const [kind, sectionId, entryId] = to.split(":");
    const value = words.trim();
    if (!value) return;
    const sections = draft.sections.map((s): Section => {
      if (s.id !== sectionId) return s;
      if (kind === "entry" && isEntrySection(s)) return { ...s, entries: s.entries.map((e) => (e.id === entryId ? { ...e, bullets: [...e.bullets, newBullet(value, "upload", [{ kind: "upload", text }])] } : e)) };
      if (kind === "skills" && s.kind === "skills") {
        const groups = s.groups.length ? s.groups : [{ id: newId("g_"), name: "", visible: true, skills: [] }];
        return { ...s, groups: groups.map((g, i) => (i === groups.length - 1 ? { ...g, skills: [...g.skills, { id: newId("k_"), name: value.slice(0, 80), visible: true }] } : g)) };
      }
      if (kind === "summary" && s.kind === "summary") return { ...s, text: s.text ? `${s.text}\n${value}` : value };
      return s;
    });
    onAssign({ ...draft, sections });
  }

  return (
    <Dialog
      title="Add this text to your CV"
      onClose={onClose}
      actions={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn kind="primary" onClick={apply} disabled={!to || !words.trim()}>
            Add to my CV
          </Btn>
        </>
      }
    >
      <div>
        <label className="cv-label" htmlFor="assign-text">
          The text<span className="cv-rule">From your file. Change it here if you need to.</span>
        </label>
        <textarea id="assign-text" className="cv-input" rows={3} value={words} onChange={(e) => setWords(e.target.value)} data-autofocus />
      </div>
      <div>
        <label className="cv-label" htmlFor="assign-to">
          Where it goes
        </label>
        <CvSelect id="assign-to" value={to} onChange={(val) => setTo(val)} options={options} />
        {options.length === 0 && <p className="cv-error-text">There is no role or section to add it to yet. You can add it in the builder.</p>}
      </div>
    </Dialog>
  );
}

/**
 * One step of the check: the file's text on the left, one section's fields on
 * the right. Anything the reader was unsure of is marked on its field with
 * the reason, and can be confirmed, corrected or left blank. The last step is
 * the text that could not be placed, which is shown even when there is none.
 */
export function ImportReview({ importId, stepKey }: { importId: string; stepKey: string }) {
  const router = useRouter();
  const { imp, cv, load, save, change, flush, reload } = useImport(importId);
  const { panel, item, open, close } = usePanel();
  const [focus, setFocus] = useState<{ entry: string; field: string } | null>(null);
  const [pane, setPane] = useState<"fields" | "original">("fields");
  const [nudge, setNudge] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const fields = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const flaggedOnly = searchParams?.get("flagged") === "true";
  const allSteps = imp ? reviewSteps(imp) : [];
  const steps = imp && flaggedOnly ? allSteps.filter((s) => openFlags(imp, s) > 0 || s.key === stepKey) : allSteps;
  const index = steps.findIndex((s) => s.key === stepKey);
  const step = steps[index];

  // An address for a step that isn't there (or a file that wasn't read) goes back to the upload's own page.
  useEffect(() => {
    if (load === "ready" && imp && (imp.status !== "needs-review" || !step)) router.replace(`/cv/import/${importId}`);
  }, [load, imp, step, importId, router]);
  useEffect(() => {
    setFocus(null);
    setNudge("");
    setPane("fields");
  }, [stepKey]);

  if (load === "loading" || (load === "ready" && (!imp || !cv || !step || imp.status !== "needs-review")))
    return (
      <CvScreen>
        <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Check upload" }]} />
        <div className="cv-area cv-stack" aria-busy="true" aria-label="Loading your upload">
          <Skeleton height={36} width="40%" />
          <Skeleton height={320} />
        </div>
      </CvScreen>
    );
  if (load !== "ready" || !imp || !cv || !step)
    return (
      <CvScreen>
        <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Check upload" }]} />
        <div className="cv-area">
          <Toolbar title={load === "missing" ? "Upload not found" : "This upload couldn’t be loaded"} subtitle={load === "missing" ? "It may have been discarded, or it belongs to another account." : "Check you’re online, then try again."}>
            {load === "error" && <Btn onClick={() => void reload()}>Retry</Btn>}
            <BtnLink href="/cv">Back to your CVs</BtnLink>
          </Toolbar>
        </div>
      </CvScreen>
    );

  const region = cv.region;
  const sectionKey = step.key === "contact" ? "contact" : (step.sectionId ?? "");
  const section = imp.draft.sections.find((s) => s.id === step.sectionId);
  const isLast = index === steps.length - 1;
  const open_ = openFlags(imp, step);
  const flagsAt = (entry: string, field: string) => imp.flags.filter((f) => f.at.section === sectionKey && (f.at.entry ?? "") === entry && (f.at.field ?? "") === field);

  const setDraft = (draft: ImportDraft, flags?: { id: string; state: ImportFlag["state"] }[]) => change({ draft, flags });
  const setSection = (next: Section) => setDraft({ ...imp.draft, sections: imp.draft.sections.map((s) => (s.id === next.id ? next : s)) });

  /** Empties the field a doubt is about, when the person chooses to leave it blank. */
  function blank(flag: ImportFlag) {
    const field = flag.at.field ?? "";
    let draft = imp!.draft;
    if (flag.at.section === "contact") {
      draft = { ...draft, contact: { ...draft.contact, [field]: field === "links" ? [] : "" } as Contact };
    } else {
      draft = {
        ...draft,
        sections: draft.sections.map((s): Section => {
          if (s.id !== flag.at.section) return s;
          if (isEntrySection(s))
            return {
              ...s,
              entries: s.entries.map((e): Entry => {
                if (e.id !== flag.at.entry) return e;
                if (field === "start" || field === "end") return { ...e, start: "", end: "", current: false };
                return field in e ? ({ ...e, [field]: "" } as Entry) : e;
              }),
            };
          if (s.kind === "skills") return { ...s, groups: s.groups.map((g) => ({ ...g, skills: g.skills.filter((k) => k.id !== field) })) };
          return s;
        }),
      };
    }
    setDraft(draft, [{ id: flag.id, state: "blank" }]);
  }

  function flagNote(flags: ImportFlag[], canBlank: boolean): ReactNode {
    if (!flags.length) return undefined;
    return flags.map((f) => {
      if (f.state !== "open") return <Fixed key={f.id}>{RESOLVED_WORDS[f.state]}</Fixed>;
      const found = f.lines.length ? imp!.lines[f.lines[0]]?.text : "";
      return (
        <Note
          key={f.id}
          label="Check this"
          actions={
            <>
              <Btn onClick={() => change({ flags: [{ id: f.id, state: "confirmed" }] })}>{f.code.startsWith("no-") ? "Leave as it is" : "This is right"}</Btn>
              {canBlank && !f.code.startsWith("no-") && <Btn onClick={() => blank(f)}>Leave blank</Btn>}
              {f.lines.length > 0 && (
                <Btn
                  kind="quiet"
                  className="cv-narrow"
                  onClick={() => {
                    setFocus({ entry: f.at.entry ?? "", field: f.at.field ?? "" });
                    setPane("original");
                  }}
                >
                  See it in your file
                </Btn>
              )}
            </>
          }
        >
          {f.message}
          {found ? ` We found “${found.length > 140 ? `${found.slice(0, 140)}…` : found}”.` : ""}
        </Note>
      );
    });
  }

  const hooks: FieldHooks = {
    uncertain: (entry, field) => flagsAt(entry, field).some((f) => f.state === "open"),
    note: (entry, field) => flagNote(flagsAt(entry, field), true),
    onFocus: (entry, field) => setFocus({ entry, field }),
    onEdit: (entry, field) => {
      const hit = flagsAt(entry, field === "end" ? "start" : field).concat(flagsAt(entry, field)).filter((f) => f.state === "open");
      if (hit.length) change({ flags: hit.map((f) => ({ id: f.id, state: "edited" as const })) });
    },
  };

  // The lines to mark: the focused field's, or everything this step was read from.
  let marked: number[];
  if (step.key === "unassigned") marked = imp.unassigned.filter((u) => (focus ? u.id === focus.field : u.state === "open")).map((u) => u.line);
  else if (focus) marked = imp.where[whereKey(sectionKey, focus.entry, focus.field)] ?? imp.where[whereKey(sectionKey, focus.entry, "")] ?? [];
  else marked = Object.entries(imp.where).filter(([k]) => k.startsWith(`${sectionKey}/`)).flatMap(([, v]) => v);
  marked = [...new Set(marked)].sort((a, b) => a - b);

  async function next() {
    if (open_ > 0) {
      const what = step!.key === "unassigned" ? "Decide what to do with each piece of text first: add it to your CV, or say it’s not needed." : `Check ${open_ === 1 ? "the marked field" : `the ${open_} marked fields`} first: confirm, correct or leave blank.`;
      setNudge(what);
      setPane("fields");
      requestAnimationFrame(() => fields.current?.querySelector<HTMLElement>(".cv-note button, [data-open-text] button")?.focus());
      return;
    }
    setBusy(true);
    setProblem("");
    change({ reviewed: [...new Set([...imp!.reviewed, step!.key])] });
    if (!(await flush())) {
      setBusy(false);
      return setProblem("Your changes couldn’t be saved. Check you’re online and try again.");
    }
    if (!isLast) return router.push(`/cv/import/${importId}/review/${steps[index + 1].key}${flaggedOnly ? "?flagged=true" : ""}`);
    try {
      const { versionId, next } = await api<{ versionId: string; next?: string }>(`/api/cv/imports/${importId}/confirm`, { method: "POST" });
      router.push(afterImport(versionId, next));
    } catch (err) {
      setBusy(false);
      setProblem(messageOf(err));
    }
  }

  const title = stepName(imp, cv, step.key);
  const sectionFlags = imp.flags.filter((f) => f.at.section === sectionKey && !f.at.entry && !f.at.field);
  const assigning = panel === "assign-text" ? imp.unassigned.find((u) => u.id === item) : undefined;

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: cv.name, href: `/cv/import/${importId}` }, { label: "Check upload" }]}>
        <small aria-hidden="true">{save === "saving" ? "Saving…" : save === "failed" ? "Couldn’t save" : "Saved"}</small>
        <Btn onClick={() => open("replace-file", { item: "file" })}>Replace file</Btn>
      </Bar>
      <div className="cv-area">
        <Toolbar eyebrow={`${cv.name} · Step ${index + 1} of ${steps.length}`} title={title} subtitle={step.key === "unassigned" ? "Text from your file that we couldn’t place. Nothing is dropped without you seeing it." : "Compare each field with your file. Correct anything that’s wrong."}>
          <BtnLink href={index > 0 ? `/cv/import/${importId}/review/${steps[index - 1].key}` : `/cv/import/${importId}`}>Back</BtnLink>
          <Btn kind="primary" busy={busy} onClick={() => void next()}>
            {busy ? "Saving…" : isLast ? "Open in builder" : "Confirm and continue"}
          </Btn>
        </Toolbar>

        <nav className="cv-tabs" aria-label="Sections to check">
          {steps.map((s) => (
            <a key={s.key} href={`/cv/import/${importId}/review/${s.key}`} aria-current={s.key === step.key ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                void flush().then(() => router.push(`/cv/import/${importId}/review/${s.key}`));
              }}
            >
              {stepName(imp, cv, s.key)}
              {openFlags(imp, s) > 0 ? <span className="cv-dot" title="Something to check" /> : imp.reviewed.includes(s.key) ? <span className="cv-good" aria-label="confirmed">✓</span> : null}
            </a>
          ))}
        </nav>

        <div className="cv-tabs cv-narrow" role="tablist" aria-label="Fields or original">
          <button role="tab" aria-selected={pane === "fields"} onClick={() => setPane("fields")}>
            Fields
          </button>
          <button role="tab" aria-selected={pane === "original"} onClick={() => setPane("original")}>
            Original
          </button>
        </div>

        {(nudge || problem) && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>{problem ? "Not saved" : "Before you continue"}</strong>
            <span>{problem || nudge}</span>
          </div>
        )}

        <div className="cv-layout" style={{ gridTemplateColumns: "minmax(0, 584fr) minmax(0, 584fr)" }}>
          <div className={pane === "original" ? "cv-sticky" : "cv-sticky cv-wide"}>
            <SourcePane imp={imp} marked={marked} title="Your file" />
            {pane === "original" && (
              <Btn className="cv-narrow" style={{ marginTop: 12 }} onClick={() => setPane("fields")}>
                Back to the fields
              </Btn>
            )}
          </div>

          <div ref={fields} className={pane === "fields" ? "" : "cv-wide"}>
            {step.key === "contact" && (
              <Panel title="Contact" aside={<small>{open_ ? `${open_} to check` : "Nothing flagged"}</small>}>
                <div className="cv-pad">
                  <ContactForm value={imp.draft.contact} onChange={(contact) => setDraft({ ...imp.draft, contact })} hooks={hooks} />
                </div>
              </Panel>
            )}

            {section && (
              <Panel title={title} aside={<small>{open_ ? `${open_} to check` : "Nothing flagged"}</small>}>
                {sectionFlags.length > 0 && <div className="cv-pad" style={{ paddingBottom: 0 }}>{flagNote(sectionFlags, false)}</div>}
                <SectionForm section={section} onChange={setSection} region={region} hooks={hooks} expandAll entryNote={(entryId) => flagNote(flagsAt(entryId, ""), false)} />
              </Panel>
            )}

            {step.key === "unassigned" && (
              <>
                <Panel title="Unassigned text" aside={<small>{imp.unassigned.length === 0 ? "Nothing left over" : `${open_} of ${imp.unassigned.length} to decide`}</small>}>
                  {imp.unassigned.length === 0 && (
                    <div className="cv-pad">
                      <Fixed>Every line of your file was placed in a section. Nothing was left over.</Fixed>
                    </div>
                  )}
                  {imp.unassigned.map((u) => (
                    <div key={u.id} className="cv-pick" data-open-text={u.state === "open" || undefined} onMouseEnter={() => setFocus({ entry: "", field: u.id })} onFocus={() => setFocus({ entry: "", field: u.id })}>
                      <p className="min-w-0 grow" style={{ overflowWrap: "anywhere" }}>
                        “{u.text}”
                      </p>
                      {u.state === "open" ? (
                        <span className="cv-row">
                          <Btn onClick={() => open("assign-text", { item: u.id })}>Add to my CV</Btn>
                          <Btn onClick={() => change({ unassigned: [{ id: u.id, state: "dismissed" }] })}>Not needed</Btn>
                        </span>
                      ) : (
                        <span className="cv-row">
                          <span className="cv-chip cv-good">{u.state === "assigned" ? "✓ Added" : "✓ Not needed"}</span>
                          {u.state === "dismissed" && (
                            <Btn kind="quiet" onClick={() => change({ unassigned: [{ id: u.id, state: "open" }] })}>
                              Undo
                            </Btn>
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                </Panel>
                {imp.omitted.length > 0 && (
                  <Panel title="Left out on purpose" style={{ marginTop: 18 }}>
                    {imp.omitted.map((o, i) => (
                      <div key={i} className="cv-pick">
                        <div className="min-w-0">
                          <p style={{ overflowWrap: "anywhere" }}>“{o.text}”</p>
                          <small>{o.reason}</small>
                        </div>
                      </div>
                    ))}
                  </Panel>
                )}
              </>
            )}

            <div className="cv-row" style={{ marginTop: 18 }}>
              <small>
                Step {index + 1} of {steps.length}
              </small>
              <Btn kind="primary" className="cv-push" busy={busy} onClick={() => void next()}>
                {busy ? "Saving…" : isLast ? "Open in builder" : "Confirm and continue"}
              </Btn>
            </div>
          </div>
        </div>
        <Announce>{problem || nudge || (save === "failed" ? "Your changes couldn’t be saved." : "")}</Announce>
      </div>

      {panel === "replace-file" && (
        <ReplaceFileDialog
          importId={importId}
          start={item === "paste" ? "paste" : "file"}
          onClose={close}
          onDone={() => router.replace(`/cv/import/${importId}`)}
        />
      )}
      {assigning && (
        <AssignDialog
          text={assigning.text}
          draft={imp.draft}
          region={region}
          onClose={close}
          onAssign={(draft) => {
            change({ draft, unassigned: [{ id: assigning.id, state: "assigned" }] });
            close();
          }}
        />
      )}
    </CvScreen>
  );
}
