"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { diffParts, fieldFor, formTabs, itemCount, snapshotOf, stateAt, switchOff, tabFor } from "@/lib/cv/edit";
import type { Finding } from "@/lib/cv/score/score";
import { fitToPages } from "@/lib/cv/render/layout";
import { type CvSummary, type Locator, type Section, type SectionKind, cvIsEmpty, emptySection, isEntrySection } from "@/lib/cv/schema";
import { OPTIONAL_KINDS, SECTION_DEFS, docWord, sectionHeading } from "@/lib/cv/sections";
import { Switch } from "./Arrange";
import { BulletHelp } from "./Assist";
import { api, messageOf } from "./client";
import { Dialog, usePanel } from "./Dialog";
import { scoreLabel } from "./Findings";
import { Finish } from "./Finish";
import { PaperView } from "./Paper";
import { ContactForm, type FieldHooks, SectionForm } from "./SectionForms";
import { ACCEPT, STAGE_WORDS, type UploadStage, sendUpload } from "./upload";
import { jobFit } from "@/lib/cv/tailor/fit";
import { fitLabel } from "./Tailor";
import { Announce, Bar, Btn, BtnLink, CvScreen, Field, Fixed, Note, Panel, Skeleton, Toolbar } from "./ui";
import { SAVE_WORDS } from "./useCv";
import { useWorkspace } from "./Workspace";
import { ChooseAchievement, ProfileChooser, SkillSuggestions } from "./Writing";

/**
 * The builder: the form on the left, the paper on the right. One section at a
 * time, saved as you type, with the page redrawn at once. A new CV is empty
 * and says so; nothing is written into it for the person.
 */
export function Editor({ sectionKey }: { sectionKey: string }) {
  const router = useRouter();
  const w = useWorkspace();
  const { cv, load, save, update, flush, retry, undo, redo, canUndo, canRedo, paper, focus, setFocus, openEntry, setOpenEntry, view, setView, wanted } = w;
  const { panel, item, open: openPanel, close: closePanel } = usePanel();
  const [pending, setPending] = useState("");
  const [stage, setStage] = useState<UploadStage | "">("");
  const [problem, setProblem] = useState("");
  const [said, setSaid] = useState("");
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState("");
  const [moreFor, setMoreFor] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const versionId = w.versionId;

  // An upload for this CV that hasn't been checked yet.
  useEffect(() => {
    api<{ cvs: CvSummary[] }>("/api/cv/versions")
      .then((r) => setPending(r.cvs.find((c) => c.id === versionId)?.pendingImportId ?? ""))
      .catch(() => {});
  }, [versionId]);

  const say = useCallback((text: string) => {
    setSaid("");
    requestAnimationFrame(() => setSaid(text));
  }, []);

  const doUndo = useCallback(() => {
    if (undo()) say("Undone.");
    setRemoved(false);
  }, [undo, say]);
  const doRedo = useCallback(() => {
    if (redo()) say("Redone.");
  }, [redo, say]);

  // Ctrl or Cmd + Z undoes the last step in the CV; with Shift (or Ctrl + Y) it redoes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey && canUndo) {
        e.preventDefault();
        doUndo();
      } else if (((k === "z" && e.shiftKey) || k === "y") && canRedo) {
        e.preventDefault();
        doRedo();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [canUndo, canRedo, doUndo, doRedo]);

  // After a click on the paper: once the right tab and entry are showing, put the cursor in the field.
  useEffect(() => {
    const want = wanted.current;
    if (!want || !cv) return;
    const el = document.querySelector<HTMLElement>(`[data-cvf="${CSS.escape(`${want.entry}:${want.field}`)}"]`) ?? (want.entry ? document.querySelector<HTMLElement>(`[data-entry="${CSS.escape(want.entry)}"] :is(input, textarea)`) : null);
    if (!el) return;
    wanted.current = null;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  // The "Removed. Undo" line clears itself.
  useEffect(() => {
    if (!removed) return;
    const t = setTimeout(() => setRemoved(false), 9000);
    return () => clearTimeout(t);
  }, [removed]);

  const crumbs = [{ label: "CVs and letters", href: "/cv" }, { label: cv?.name ?? "CV" }];
  if (load === "loading")
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area cv-stack" aria-busy="true" aria-label="Loading your CV">
          <Skeleton height={36} width="40%" />
          <Skeleton height={320} />
        </div>
      </CvScreen>
    );
  if (load !== "ready" || !cv)
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area">
          <Toolbar title={load === "missing" ? "CV not found" : "This CV couldn’t be loaded"} subtitle={load === "missing" ? "It may have been deleted, or it belongs to another account." : "Check you’re online, then refresh the page."}>
            <BtnLink href="/cv">Back to your CVs</BtnLink>
          </Toolbar>
        </div>
      </CvScreen>
    );

  const region = cv.region;
  const word = docWord(region);
  const tabs = formTabs(cv);
  const index = Math.max(0, tabs.findIndex((t) => t.key === sectionKey));
  const tab = tabs[index];
  const nextTab = tabs[index + 1];
  const empty = cvIsEmpty(cv);
  const missing = OPTIONAL_KINDS.filter((k) => k === "custom" || !cv.sections.some((s) => s.kind === k));
  const base = `/cv/v/${cv.id}/edit`;
  const isFinish = tab.key === "finish";
  const pages = paper?.layout.pages ?? 0;
  const over = !!paper && paper.layout.blocks.length > 0 && pages > cv.design.pageTarget;

  const go = (key: string) => void flush().then(() => router.push(`${base}/${key}`));

  const setSection = (next: Section) => {
    const before = cv.sections.find((s) => s.id === next.id);
    if (before && itemCount(next) < itemCount(before)) setRemoved(true);
    update({ sections: cv.sections.map((s) => (s.id === next.id ? next : s)) });
  };

  /** A passage on the paper was clicked: show its tab, open its entry and focus its field. */
  const pick = (at: Locator) => {
    const key = tabFor(cv, at);
    const field = fieldFor(cv, at);
    if (at.section !== "contact" && field.entry) setOpenEntry(at.section, field.entry);
    wanted.current = field;
    setView("edit");
    if (key !== tab.key) go(key);
    else setFocus({ ...at });
  };

  function addSection(kind: SectionKind) {
    const s = emptySection(kind);
    // Added sections sit before the profile, which stays last.
    const at = cv!.sections.findIndex((x) => x.kind === "summary");
    const sections = [...cv!.sections];
    sections.splice(at >= 0 ? at : sections.length, 0, s);
    update({ sections });
    void flush().then(() => router.replace(`${base}/${kind === "custom" ? s.id : kind}`));
  }

  function removeSection(s: Section) {
    update({ sections: cv!.sections.filter((x) => x.id !== s.id), design: cv!.design.order ? { ...cv!.design, order: cv!.design.order.filter((id) => id !== s.id) } : cv!.design });
    setRemoved(true);
    go("contact");
  }

  async function upload(file: File) {
    setProblem("");
    try {
      const form = new FormData();
      form.set("versionId", cv!.id);
      form.set("file", file);
      const made = await sendUpload<{ importId: string }>("/api/cv/imports", form, setStage);
      router.push(`/cv/import/${made.importId}`);
    } catch (err) {
      setStage("");
      setProblem(messageOf(err));
    }
  }

  /** The findings for one field, shown under it while the cursor is there: the most important first, the rest on request. */
  const findingNote = (sectionId: string, entry: string, field: string) => {
    if (!focus || focus.section !== sectionId) return undefined;
    const section = cv.sections.find((s) => s.id === sectionId);
    // A skill is typed in its group's box: the note for it shows while the cursor is in that box.
    const here = section?.kind === "skills" ? section.groups.find((g) => g.skills.some((k) => k.id === field))?.id === focus.entry : (focus.entry ?? "") === entry && focus.field === field;
    if (!here) return undefined;
    const match = (f: Finding) => f.at.section === sectionId && f.at.field === field && (section?.kind === "skills" || (f.at.entry ?? "") === entry);
    // "Nothing here yet" is not said under a field while it is being filled in; that finding is in the list.
    const mine = (w.score?.findings ?? []).filter(match).filter((f) => !((f.rule === "name" || f.rule === "email") && !f.excerpt.trim()));
    if (!mine.length) return w.cleared.some((f) => match(f) && stateAt(cv.sections, f.at) === "on") ? <Fixed>Fixed</Fixed> : undefined;
    const [top, ...rest] = mine;
    const shown = moreFor === top.id ? mine : [top];
    return (
      <div data-testid="inline-finding">
        {shown.map((f) => (
          <Note
            key={f.id}
            kind={f.severity}
            label={f.severity === "issue" ? "Issue" : "Suggestion"}
            actions={
              <>
                {f.fix === "add-number" && (
                  <Btn
                    onClick={() => {
                      w.setInspect(f.at);
                      setView("paper");
                      openPanel("add-number");
                    }}
                  >
                    Add the number
                  </Btn>
                )}
                {f.fix === "accept" && f.word && <Btn onClick={() => update({ accepted: [...cv.accepted.filter((x) => x !== f.word), f.word!] })}>Accept “{f.word}”</Btn>}
                {f === top && rest.length > 0 && moreFor !== top.id && <Btn onClick={() => setMoreFor(top.id)}>View {rest.length} more</Btn>}
              </>
            }
          >
            {f.reason} {f.action}
          </Note>
        ))}
      </div>
    );
  };

  const hooks = (sectionId: string): FieldHooks => ({
    note: (entry, field) => findingNote(sectionId, entry, field),
    onFocus: (entry, field) => setFocus({ section: sectionId, entry: entry || undefined, field }),
    // The writing help for one bullet opens in place of the paper.
    onHelp: (entry, bullet) => {
      w.setInspect({ section: sectionId, entry, field: bullet });
      setView("paper");
    },
    entryTools: (entry) => (
      <div className="cv-row" style={{ gap: 8 }}>
        <BtnLink href={`/cv/v/${cv.id}/capture/${entry.id}`} onClick={() => void flush()}>
          Tell me what you did
        </BtnLink>
        <Btn onClick={() => openPanel("choose-achievement", { item: entry.id })}>Use a saved achievement</Btn>
      </div>
    ),
  });
  const chosenEntry = panel === "choose-achievement" ? cv.sections.flatMap((s) => (isEntrySection(s) ? s.entries.map((e) => ({ entry: e, sectionId: s.id })) : [])).find((x) => x.entry.id === item) : undefined;
  const fit = panel === "page-overflow" && paper ? fitToPages(cv, paper.fonts, cv.design.pageTarget) : null;
  const diff = panel === "save-conflict" && w.other ? diffParts(snapshotOf(cv), snapshotOf(w.other)) : [];

  return (
    <CvScreen>
      <Bar crumbs={crumbs}>
        {w.fromFindings && (
          <BtnLink href={`/cv/v/${cv.id}/findings`} onClick={() => void flush()}>
            Back to findings
          </BtnLink>
        )}
        <span className="cv-chip">{cv.kind === "base" ? `Base ${word}` : cv.target?.employer || "Tailored version"}</span>
        <BtnLink href={`/cv/v/${cv.id}/findings`} onClick={() => void flush()} data-testid="score-button">
          {scoreLabel(w.score, word)}
        </BtnLink>
        <BtnLink href={`/cv/v/${cv.id}/tailor`} onClick={() => void flush()} data-testid="fit-button">
          {fitLabel(cv.requirements.length ? jobFit(cv).score : null)}
        </BtnLink>
        <small role="status" data-testid="save-state">
          {SAVE_WORDS[save]}
        </small>
        {(save === "failed" || save === "device") && <Btn onClick={retry}>Retry</Btn>}
        <Btn onClick={doUndo} disabled={!canUndo} aria-keyshortcuts="Control+Z Meta+Z">
          Undo
        </Btn>
        <Btn onClick={doRedo} disabled={!canRedo} aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z">
          Redo
        </Btn>
      </Bar>
      <div className="cv-area">
        <h1 className="sr-only">
          Edit {word}: {cv.name}
        </h1>

        {save === "conflict" && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>Changed somewhere else</strong>
            <span>This {word} was saved in another tab or on another device after you opened it here. Nothing has been overwritten.</span>
            <Btn className="cv-push" onClick={() => openPanel("save-conflict")}>
              Compare and choose
            </Btn>
          </div>
        )}
        {(save === "device" || save === "failed") && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>{SAVE_WORDS[save]}</strong>
            <span>{save === "device" ? "Your changes couldn’t reach us, so they are kept on this device. They will be saved when you’re back online." : "Your changes couldn’t be saved. Check you’re online and press Retry."}</span>
          </div>
        )}
        {pending && (
          <div className="cv-note" style={{ marginBottom: 18 }}>
            You uploaded a file for this {word} and haven’t finished checking it. <Link className="cv-link" href={`/cv/import/${pending}`}>Carry on checking</Link>
          </div>
        )}

        <nav className="cv-tabs cv-notphone" aria-label="Sections">
          {tabs.map((t) => (
            <a
              key={t.key}
              href={`${base}/${t.key}`}
              aria-current={t.key === tab.key ? "page" : undefined}
              data-off={t.section && !t.section.visible ? "true" : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(t.key);
              }}
            >
              {t.label}
              {t.section && !t.section.visible && <span className="sr-only"> (off in this version)</span>}
            </a>
          ))}
          <button className="cv-push" onClick={() => openPanel("add-section")}>
            + Add section
          </button>
        </nav>
        <div className="cv-phone cv-row" style={{ marginBottom: 14, alignItems: "flex-end" }}>
          <div className="min-w-0 grow">
            <label className="cv-label" htmlFor="cv-section-picker">
              Section
            </label>
            <select id="cv-section-picker" className="cv-input" value={tab.key} onChange={(e) => go(e.target.value)}>
              {tabs.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                  {t.section && !t.section.visible ? " (off)" : ""}
                </option>
              ))}
            </select>
          </div>
          <Btn onClick={() => openPanel("add-section")}>+ Add section</Btn>
        </div>

        <div className="cv-seg cv-narrow" role="group" aria-label="Show">
          <button type="button" aria-pressed={view === "edit"} onClick={() => setView("edit")}>
            Edit
          </button>
          <button type="button" aria-pressed={view === "paper"} onClick={() => setView("paper")}>
            Paper
          </button>
        </div>

        <div className="cv-layout" style={{ gridTemplateColumns: isFinish ? "minmax(0, 352fr) minmax(0, 816fr)" : "minmax(0, 552fr) minmax(0, 616fr)" }}>
          <div className={view === "edit" ? "min-w-0" : "min-w-0 cv-wide"} onBlur={() => void flush()}>
            {empty && !pending && !isFinish && (
              <Panel style={{ marginBottom: 18 }}>
                <div className="cv-pad cv-stack">
                  <h2>Your {word} is empty</h2>
                  <p className="cv-muted">Start with your contact details. You can add work, education or projects in any order.</p>
                  <input ref={fileRef} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-label="CV file" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
                  <div className="cv-row">
                    {tab.key !== "contact" && <Btn onClick={() => go("contact")}>Add contact details</Btn>}
                    <Btn busy={!!stage} onClick={() => fileRef.current?.click()}>
                      {stage ? "Working…" : `Upload a ${word}`}
                    </Btn>
                    {stage && <small>{STAGE_WORDS[stage]}</small>}
                  </div>
                  {problem && (
                    <p className="cv-error-text" role="alert">
                      {problem}
                    </p>
                  )}
                </div>
              </Panel>
            )}

            {isFinish ? (
              <Finish onOverflow={() => openPanel("page-overflow")} say={say} />
            ) : tab.key === "contact" ? (
              <Panel title="Contact">
                <div className="cv-pad">
                  <ContactForm value={cv.contact} onChange={(contact) => update({ contact })} hooks={hooks("contact")} />
                </div>
              </Panel>
            ) : tab.section ? (
              <Panel
                title={tab.label}
                aside={
                  <span className="cv-controls">
                    {!tab.section.visible && <span className="cv-chip cv-off-chip">Off in this version</span>}
                    <Switch checked={tab.section.visible} onChange={(visible) => setSection({ ...tab.section!, visible })} label={`Include the ${tab.label} section in this version`} />
                    {!SECTION_DEFS[tab.section.kind].core && (
                      <Btn kind="quiet" onClick={() => removeSection(tab.section!)}>
                        Remove section
                      </Btn>
                    )}
                  </span>
                }
              >
                {tab.section.kind === "custom" && (
                  <div className="cv-pad" style={{ paddingBottom: 0 }}>
                    <Field label="Section heading" rule="What this section is called on the page." maxLength={60} value={tab.section.title} onChange={(title) => setSection({ ...tab.section!, title })} />
                  </div>
                )}
                <SectionForm key={tab.section.id} section={tab.section} onChange={setSection} region={region} hooks={hooks(tab.section.id)} arrange openId={openEntry[tab.section.id]} onOpen={(id) => setOpenEntry(tab.section!.id, id)} />
                {tab.section.kind === "experience" && (
                  <div className="cv-panelfoot" style={{ justifyContent: "flex-start" }}>
                    <BtnLink href={`/cv/v/${cv.id}/capture/new`} onClick={() => void flush()}>
                      Start a role from notes
                    </BtnLink>
                    <small>Answer three questions in your own words, typed or spoken, and choose which lines to keep.</small>
                  </div>
                )}
                {tab.section.kind === "summary" && <ProfileChooser section={tab.section} say={say} />}
              </Panel>
            ) : null}

            {tab.section?.kind === "skills" && <SkillSuggestions section={tab.section} onShow={pick} />}

            {removed && (
              <p className="cv-note cv-row" role="status" style={{ marginTop: 12 }}>
                Removed.
                <Btn onClick={doUndo}>Undo</Btn>
              </p>
            )}

            {nextTab && (
              <div className="cv-row" style={{ marginTop: 18 }}>
                <Btn kind="primary" className="cv-push" onClick={() => go(nextTab.key)}>
                  Continue to {nextTab.label}
                </Btn>
              </div>
            )}
          </div>

          <aside className={view === "paper" ? "cv-sticky min-w-0" : "cv-sticky min-w-0 cv-wide"} aria-label="Paper">
            {w.inspect && !isFinish ? (
              <BulletHelp
                say={say}
                onEdit={() => {
                  const at = w.inspect!;
                  w.setInspect(null);
                  pick(at);
                }}
              />
            ) : (
            <PaperView paper={paper} state={w.state} retry={w.retry} cv={cv} focus={isFinish ? null : focus} onPick={pick} word={word}>
              {w.previewProfile !== null && (
                <div className="cv-note" style={{ marginBottom: 10 }} data-testid="profile-preview">
                  Preview of your profile. It isn’t in your {word} yet.
                </div>
              )}
              {over && (
                <div className="cv-note cv-row" style={{ marginBottom: 10 }} data-testid="over-target">
                  <span>
                    This runs to {pages} pages. Your target is {cv.design.pageTarget === 1 ? "one page" : "two pages"}.
                  </span>
                  <Btn className="cv-push" onClick={() => openPanel("page-overflow")}>
                    See what runs over
                  </Btn>
                </div>
              )}
            </PaperView>
            )}
          </aside>
        </div>
        <Announce>{said || (save === "failed" || save === "device" || save === "conflict" ? SAVE_WORDS[save] : "")}</Announce>
      </div>

      {panel === "add-section" && (
        <Dialog title="Add a section" onClose={closePanel}>
          <p className="cv-muted">Add only what helps this application. A section with nothing in it is left off the page.</p>
          <div className="cv-row">
            {missing.map((k) => (
              <Btn key={k} onClick={() => addSection(k)}>
                {SECTION_DEFS[k].heading[region]}
              </Btn>
            ))}
          </div>
        </Dialog>
      )}

      {panel === "choose-achievement" && chosenEntry && <ChooseAchievement entry={chosenEntry.entry} sectionId={chosenEntry.sectionId} onClose={closePanel} say={say} />}

      {panel === "page-overflow" && (
        <Dialog title={`Fit to ${cv.design.pageTarget === 1 ? "one page" : "two pages"}`} onClose={closePanel} wide>
          {!fit || !over ? (
            <p>
              Your {word} fits on {pages === 1 ? "one page" : `${pages} pages`}. Nothing runs over.
            </p>
          ) : fit.fits ? (
            <>
              <p>
                Your {word} runs to {pages} pages. With {fit.density === "tighter" ? "tighter" : "default"} spacing it fits on {cv.design.pageTarget === 1 ? "one" : "two"}. Only the space between lines and sections changes: nothing is cut and the type stays the same size.
              </p>
              <div className="cv-row">
                <Btn
                  kind="primary"
                  onClick={() => {
                    update({ design: { ...cv.design, density: fit.density } });
                    say(`Spacing set to ${fit.density}.`);
                    closePanel();
                  }}
                >
                  Use {fit.density} spacing
                </Btn>
              </div>
            </>
          ) : (
            <>
              <p>
                Even at the tightest spacing your {word} runs to {fit.pages} pages. It is never cropped and the type is never made smaller, so something has to give. These lines are past page {cv.design.pageTarget}:
              </p>
              <ul className="cv-overlist">
                {fit.over.slice(0, 14).map((o, i) => {
                  const off = switchOff(cv.sections, o.at);
                  return (
                    <li key={i}>
                      <span className="min-w-0 grow" style={{ overflowWrap: "anywhere" }}>
                        {o.text}
                      </span>
                      <Btn
                        onClick={() => {
                          closePanel();
                          pick(o.at);
                        }}
                        aria-label={`Shorten: ${o.text.slice(0, 60)}`}
                      >
                        Shorten
                      </Btn>
                      {off && (
                        <Btn
                          onClick={() => {
                            update({ sections: off.sections });
                            say(`Switched off. It stays in your ${word} and can be switched back on.`);
                          }}
                          aria-label={`Switch off this ${off.what}: ${o.text.slice(0, 60)}`}
                        >
                          Switch off {off.what === "entry" ? "this entry" : ""}
                        </Btn>
                      )}
                    </li>
                  );
                })}
              </ul>
              {fit.over.length > 14 && <small>And {fit.over.length - 14} more lines.</small>}
              {cv.design.pageTarget === 1 && (
                <div className="cv-row">
                  <Btn
                    onClick={() => {
                      update({ design: { ...cv.design, pageTarget: 2 } });
                      closePanel();
                    }}
                  >
                    Use two pages instead
                  </Btn>
                </div>
              )}
            </>
          )}
        </Dialog>
      )}

      {panel === "save-conflict" && (
        <Dialog
          title="Two copies of this CV"
          onClose={closePanel}
          wide
          actions={
            w.other ? (
              <>
                <Btn
                  onClick={() => {
                    w.keepMine();
                    closePanel();
                  }}
                >
                  Keep this copy
                </Btn>
                <Btn
                  onClick={() => {
                    w.takeTheirs();
                    closePanel();
                  }}
                >
                  Use the other copy
                </Btn>
                <Btn
                  kind="primary"
                  busy={busy === "separate"}
                  onClick={async () => {
                    setBusy("separate");
                    try {
                      const id = await w.saveSeparate();
                      if (id) router.push(`/cv/v/${id}/edit/contact`);
                    } catch (err) {
                      setProblem(messageOf(err));
                    } finally {
                      setBusy("");
                    }
                  }}
                >
                  Save this copy as a separate version
                </Btn>
              </>
            ) : undefined
          }
        >
          {!w.other ? (
            <p>Both copies now match. There is nothing to choose.</p>
          ) : (
            <>
              <p>This {word} was saved somewhere else after you opened it here. Neither copy has been overwritten. Choose which to keep, or keep both.</p>
              {diff.length === 0 && <p className="cv-muted">The two copies say the same thing.</p>}
              {diff.map((d) => (
                <div key={d.label} className="cv-compare">
                  <h3>{d.label}</h3>
                  <div>
                    <div>
                      <span className="cv-eyebrow">This copy</span>
                      {d.mine.length ? d.mine.map((line, i) => <p key={i}>{line}</p>) : <p className="cv-muted">Empty</p>}
                    </div>
                    <div>
                      <span className="cv-eyebrow">The other copy</span>
                      {d.theirs.length ? d.theirs.map((line, i) => <p key={i}>{line}</p>) : <p className="cv-muted">Empty</p>}
                    </div>
                  </div>
                </div>
              ))}
              {problem && (
                <p className="cv-error-text" role="alert">
                  {problem}
                </p>
              )}
            </>
          )}
        </Dialog>
      )}
    </CvScreen>
  );
}
