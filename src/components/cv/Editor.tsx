"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { bulletAt, changeBullet, diffParts, fieldFor, formTabs, itemCount, snapshotOf, stateAt, switchOff, tabFor } from "@/lib/cv/edit";
import type { Finding } from "@/lib/cv/score/score";
import { fitToPages } from "@/lib/cv/render/layout";
import { type HonestFit, fitHonestly, fitSummary, marginMm } from "@/lib/cv/render/fit";
import { BODY_SIZE } from "@/lib/cv/render/templates";
import { type Design } from "@/lib/cv/schema";
import { type CvSummary, type CvLevel, type Locator, type Section, type SectionKind, CV_LEVELS, LEVEL_LABELS, cvIsEmpty, emptySection, isEntrySection } from "@/lib/cv/schema";
import { OPTIONAL_KINDS, SECTION_DEFS, docWord, sectionHeading } from "@/lib/cv/sections";
import { Switch } from "./Arrange";
import { BulletHelp } from "./Assist";
import { api, messageOf } from "./client";
import { Dialog, usePanel } from "./Dialog";
import { scoreLabel } from "./Findings";
import { Finish } from "./Finish";
import { FilesPanel } from "./Files";
import { FormatBar, linesOver } from "./FormatBar";
import { ShareDialog } from "./ShareDialog";
import { JobPanel } from "./JobPanel";
import { cvClaims } from "@/lib/cv/claims";
import { Menu } from "./Menu";
import { PaperView } from "./Paper";
import { ScoreLine, ScorePanel } from "./ScorePanel";
import { ContactForm, type FieldHooks, SectionForm } from "./SectionForms";
import { ACCEPT, STAGE_WORDS, type UploadStage, sendUpload } from "./upload";
import { jobFit } from "@/lib/cv/tailor/fit";
import { fitLabel } from "./Tailor";
import { Announce, Bar, Btn, BtnLink, Crumbs, CvScreen, CvSelect, Field, Fixed, Note, Panel, Skeleton, Toolbar } from "./ui";
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
  /** Editing fields hidden, so the paper can be read at full size (also chosen by 100%). Desktop only. */
  const [folded, setFolded] = useState(false);
  /** The last Fit to one page: its result and the design before it, for Undo fit. */
  const [fitResult, setFitResult] = useState<{ fit: HonestFit; before: Design } | null>(null);
  const [fitBusy, setFitBusy] = useState(false);
  /** A file was downloaded in this visit: the download dialog then offers practice, never forces it. */
  const [downloaded, setDownloaded] = useState(false);
  /** A message about an action that couldn't be done (practice couldn't start, say), shown until dismissed. */
  const [notice, setNotice] = useState("");
  const [shorten, setShorten] = useState<{ at: Locator; original: string } | null>(null);
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
    onPractise: (_entry, bullet) => {
      void (async () => {
        try {
          await flush();
          const { href } = await api<{ href: string }>("/api/practice/cv", { method: "POST", json: { cv: cv.id, claims: [bullet] } });
          router.push(href);
        } catch (err) {
          say(messageOf(err));
          setNotice(messageOf(err));
        }
      })();
    },
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
  /** Fit to one page (design spec v3 §03): spacing, then text down to 10 pt, then margins down to 12 mm. Never the words. */
  const runFit = () => {
    if (!paper || fitBusy) return;
    setFitBusy(true);
    // Measured just after this render, so the busy state shows while the real page is laid out again.
    setTimeout(() => {
      try {
        const before = cv.design;
        const fit = fitHonestly(cv, paper.fonts, cv.design.pageTarget);
        if (fit.status !== "already") update({ design: fit.design });
        setFitResult({ fit, before });
        say(fitSummary(fit, cv.design.pageTarget));
      } catch {
        setFitResult(null);
        say("The page couldn’t be measured, so nothing was changed. Try again.");
      } finally {
        setFitBusy(false);
      }
    }, 0);
  };
  const liveOver = paper ? linesOver(paper, cv.design.pageTarget) : 0;
  const overLines = paper && fitResult
    ? paper.layout.blocks.flatMap((b) => b.lines.filter((l) => l.page >= cv.design.pageTarget).map((l) => ({ at: b.at, text: l.runs.map((x) => x.text).join("").trim() }))).filter((l) => l.text)
    : [];

  const chosenEntry = panel === "choose-achievement" ? cv.sections.flatMap((s) => (isEntrySection(s) ? s.entries.map((e) => ({ entry: e, sectionId: s.id })) : [])).find((x) => x.entry.id === item) : undefined;
  const fit = panel === "page-overflow" && paper ? fitToPages(cv, paper.fonts, cv.design.pageTarget) : null;
  const diff = panel === "save-conflict" && w.other ? diffParts(snapshotOf(cv), snapshotOf(w.other)) : [];

  return (
    <CvScreen>
      <header className="cv-bar cv-edhead">
        <div className="cv-edhead-id min-w-0">
          <Crumbs crumbs={crumbs} />
          <p className="cv-edhead-name">{cv.name}</p>
          <div className="cv-row cv-edhead-meta">
            <span className="cv-chip">{cv.kind === "base" ? `Base ${word}` : "Tailored copy"}</span>
            <button
              type="button"
              onClick={() => {
                const nextRegion = cv.region === "uk" ? "us" : "uk";
                update({ region: nextRegion, design: { ...cv.design, pageSize: nextRegion === "uk" ? "a4" : "letter" } });
                say(`Switched to ${nextRegion === "uk" ? "UK English on A4" : "US English on US Letter"}.`);
              }}
              className="cv-chip cv-region-toggle"
              title="Switch between UK (A4, UK spelling) and US (Letter, US spelling)"
              aria-label={`Region and paper: ${cv.region === "uk" ? "UK · A4" : "US · Letter"}. Switch to ${cv.region === "uk" ? "US · Letter" : "UK · A4"}`}
              data-testid="spelling-toggle"
            >
              <span>{cv.region === "uk" ? "UK · A4" : "US · Letter"}</span>
              <span aria-hidden="true">⇄</span>
            </button>
            <label className="cv-chip cv-level-chip">
              <span className="sr-only">Level</span>
              <select value={cv.level} onChange={(e) => update({ level: e.target.value as CvLevel })} data-testid="level-chip">
                {CV_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_LABELS[l]}
                  </option>
                ))}
              </select>
            </label>
            <small role="status" data-testid="save-state" data-save={save}>
              {SAVE_WORDS[save]}
            </small>
            {(save === "failed" || save === "device") && <Btn onClick={retry}>Retry</Btn>}
          </div>
        </div>
        <div className="cv-edhead-actions">
          {w.fromFindings && (
            <BtnLink className="cv-notphone" href={`/cv/v/${cv.id}/findings`} onClick={() => void flush()}>
              Back to findings
            </BtnLink>
          )}
          <Btn kind="primary" className="cv-edhead-download" onClick={() => openPanel("download")} data-testid="download-button">
            Download
          </Btn>
          <Btn onClick={() => openPanel("share")} data-testid="share-button">
            Share
          </Btn>
          <Menu
            label="More actions"
            trigger="More"
            testId="more-button"
            items={[
              { label: "Talk it through", onSelect: () => void flush().then(() => router.push(`/cv/v/${cv.id}/talk`)) },
              { label: scoreLabel(w.score, word), onSelect: () => void flush().then(() => router.push(`/cv/v/${cv.id}/findings`)) },
              { label: "Tailor to a job", onSelect: () => void flush().then(() => router.push(`/cv/v/${cv.id}/tailor`)) },
              { label: "Cover letter", onSelect: () => void flush().then(() => router.push(`/cv/v/${cv.id}/letter`)) },
              { label: "Questions your CV will get", onSelect: () => void flush().then(() => router.push(`/cv/v/${cv.id}/questions`)) },
              { label: "Rename", divide: true, onSelect: () => openPanel("rename") },
              { label: "Design", onSelect: () => openPanel("design") },
              { label: "Undo", divide: true, disabled: !canUndo, onSelect: doUndo },
              { label: "Redo", disabled: !canRedo, onSelect: doRedo },
            ]}
          />
          <span className="cv-edhead-history cv-notphone" role="group" aria-label="History">
            <button type="button" className="cv-btn cv-iconbtn" onClick={doUndo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl+Z)" aria-keyshortcuts="Control+Z Meta+Z">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>
            </button>
            <button type="button" className="cv-btn cv-iconbtn" onClick={doRedo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)" aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 14 5-5-5-5" /><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" /></svg>
            </button>
          </span>
        </div>
      </header>
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
        {w.saveNote && (
          <div className="cv-note" role="status" style={{ marginBottom: 18 }} data-testid="save-note">
            {w.saveNote}
          </div>
        )}
        {(save === "device" || save === "failed" || (save === "saving" && w.troubled)) && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }} data-testid="save-trouble">
            <strong>{save === "saving" ? "Trying again…" : SAVE_WORDS[save]}</strong>
            <span>{save === "saving" ? "Sending your changes again." : save === "device" ? "Your changes couldn’t reach us, so they are kept on this device. They will be saved when you’re back online." : (w.saveError ? `${w.saveError} What you typed is still here.` : "Your changes couldn’t be saved. Check you’re online and press Retry.")}</span>
          </div>
        )}
        {notice && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }} data-testid="editor-notice">
            <strong>That didn’t work</strong>
            <span>{notice}</span>
            <Btn className="cv-push" onClick={() => setNotice("")}>Dismiss</Btn>
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
          <a href={`/cv/v/${cv.id}/talk`} onClick={(e) => { e.preventDefault(); void flush().then(() => router.push(`/cv/v/${cv.id}/talk`)); }}>
            Talk it through
          </a>
          <a href={`/cv/v/${cv.id}/letter`} onClick={(e) => { e.preventDefault(); void flush().then(() => router.push(`/cv/v/${cv.id}/letter`)); }}>
            Cover letter
          </a>
          <button className="cv-push" onClick={() => openPanel("add-section")}>
            + Add section
          </button>
        </nav>
        <div className="cv-phone cv-row" style={{ marginBottom: 14, alignItems: "flex-end" }}>
          <div className="min-w-0 grow">
            <label className="cv-label" htmlFor="cv-section-picker">
              Section
            </label>
            <CvSelect
              id="cv-section-picker"
              value={tab.key}
              onChange={(val) => go(val)}
              options={tabs.map((t) => ({
                value: t.key,
                label: t.label,
                badge: t.section && !t.section.visible ? "off" : undefined,
              }))}
            />
          </div>
          <Btn onClick={() => openPanel("add-section")}>+ Add section</Btn>
        </div>

        <ScoreLine score={w.score} word={word} base={`/cv/v/${cv.id}`} />
        {!isFinish && (
          <div className="cv-scorestrip cv-midonly" data-testid="score-strip">
            <b>{w.score && !w.score.empty ? `${word === "CV" ? "CV" : "Resume"} score ${w.score.shown}/100` : `${word === "CV" ? "CV" : "Resume"} score: Not checked yet`}</b>
            {w.score && !w.score.empty && <span className="cv-ring-inline" data-band={w.score.shown < 40 ? "poor" : w.score.shown < 60 ? "average" : w.score.shown < 80 ? "good" : "strong"}>{w.score.shown < 40 ? "Poor" : w.score.shown < 60 ? "Average" : w.score.shown < 80 ? "Good" : "Strong"}</span>}
            <span className="cv-push cv-row" style={{ gap: 6 }}>
              <Btn onClick={() => openPanel("insights")} data-testid="insights-button">Score &amp; job keywords</Btn>
              {cvClaims(cv).length > 0 && <BtnLink href={`/cv/v/${cv.id}/questions`} onClick={() => void flush()}>Practise</BtnLink>}
            </span>
          </div>
        )}
        <div className="cv-narrow cv-viewbar">
          <div className="cv-seg" role="group" aria-label="Show">
            <button type="button" aria-pressed={view === "paper"} onClick={() => setView("paper")}>
              Page
            </button>
            <button type="button" aria-pressed={view === "edit"} onClick={() => setView("edit")}>
              Editing fields
            </button>
          </div>
          {!isFinish && (
            <Btn onClick={() => openPanel("design")} data-testid="design-button">
              Design
            </Btn>
          )}
        </div>

        {!isFinish && (
          <div className="cv-doctools cv-notnarrow" role="toolbar" aria-label="Document">
            <Btn aria-pressed={folded} onClick={() => setFolded((v) => !v)} data-testid="fold-fields">
              {folded ? "Show editing fields" : "Hide editing fields"}
            </Btn>
            <Btn onClick={runFit} busy={fitBusy} disabled={!paper} data-testid="fit-button-doc">
              {fitBusy ? "Measuring…" : `Fit to ${cv.design.pageTarget === 1 ? "one page" : "two pages"}`}
            </Btn>
            <span className="cv-small cv-push">
              Document · {cv.design.pageSize === "letter" ? "US Letter" : "A4"}
              {paper ? ` · ${paper.layout.pages} ${paper.layout.pages === 1 ? "page" : "pages"}` : ""}
            </span>
          </div>
        )}
        <div className={isFinish ? "cv-layout" : folded ? "cv-layout cv-workbench cv-folded" : "cv-layout cv-workbench"} style={isFinish ? { gridTemplateColumns: "minmax(0, 0.94fr) minmax(0, 1.16fr)" } : undefined}>
          <div key={tab.key} className={view === "edit" ? "min-w-0 cv-tab-content" : "min-w-0 cv-wide cv-tab-content"} onBlur={() => void flush()}>
            {empty && !pending && !isFinish && (
              <Panel style={{ marginBottom: 18 }}>
                <div className="cv-pad cv-stack">
                  <h2>Your {word} is empty</h2>
                  <p className="cv-muted">Start with your contact details. You can add work, education or projects in any order.</p>
                  <p className="cv-muted">Or talk it through: tell the assistant about your work, and it fills this in as you go.</p>
                  <input ref={fileRef} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-label="CV file" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
                  <div className="cv-row">
                    <BtnLink kind="primary" href={`/cv/v/${cv.id}/talk`} onClick={() => void flush()}>
                      Talk it through
                    </BtnLink>
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
              <Finish onOverflow={runFit} say={say} />
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
                    <BtnLink href={`/cv/v/${cv.id}/talk`} onClick={() => void flush()}>
                      Talk it through
                    </BtnLink>
                    <small>Answer three questions about one role, or talk through all of your work with the assistant. Typed or spoken.</small>
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
            <>
            {!isFinish && (
              <div className="cv-notnarrow">
                <FormatBar cv={cv} paper={paper} update={update} base={base} say={say} />
              </div>
            )}
            {fitResult && (
              <FitResultPanel
                result={fitResult.fit}
                target={cv.design.pageTarget}
                liveOver={liveOver}
                lines={overLines}
                textPt={cv.design.fontSize ?? BODY_SIZE}
                marginMm={marginMm(cv.design)}
                onUndo={() => {
                  update({ design: fitResult.before });
                  setFitResult(null);
                  say("Fit undone. Your previous design is back.");
                }}
                onClose={() => setFitResult(null)}
                onSwitchOff={(at) => {
                  const off = switchOff(cv.sections, at);
                  if (off) {
                    update({ sections: off.sections });
                    say(`Switched off for this version. It stays in your ${word} and can be switched back on.`);
                  }
                }}
                canSwitchOff={(at) => Boolean(switchOff(cv.sections, at))}
                onShorten={(at, text) => {
                  const b = bulletAt(cv.sections, at);
                  if (b) setShorten({ at, original: b.bullet.text });
                  else pick(at);
                  void text;
                }}
              />
            )}
            <PaperView paper={paper} state={w.state} retry={w.retryPaper} cv={cv} focus={isFinish ? null : focus} onPick={pick} word={word} onZoom={(z) => z === 1 && setFolded(true)}>
              {w.previewProfile !== null && (
                <div className="cv-note" style={{ marginBottom: 10 }} data-testid="profile-preview">
                  Preview of your profile. It isn’t in your {word} yet.
                </div>
              )}
              {over && !fitResult && (
                <div className="cv-note cv-row" style={{ marginBottom: 10 }} data-testid="over-target">
                  <span>
                    This runs to {pages} pages. Your target is {cv.design.pageTarget === 1 ? "one page" : "two pages"}.
                  </span>
                  <Btn className="cv-push" onClick={runFit}>
                    Fit to {cv.design.pageTarget === 1 ? "one page" : "two pages"}
                  </Btn>
                </div>
              )}
            </PaperView>
            </>
            )}
          </aside>
          {!isFinish && (
            <aside className={view === "paper" ? "cv-insights min-w-0" : "cv-insights min-w-0 cv-wide"} aria-label="Score and job keywords">
              <ScorePanel score={w.score} word={word} base={`/cv/v/${cv.id}`} onShow={pick} claims={cvClaims(cv).length} />
              <JobPanel cv={cv} update={update} word={word} onShow={pick} say={say} />
            </aside>
          )}
        </div>
        <Announce>{said || (save === "failed" || save === "device" || save === "conflict" ? SAVE_WORDS[save] : "")}</Announce>
      </div>

      {panel === "download" && (
        <Dialog title="Download" onClose={closePanel} wide>
          <p style={{ marginTop: 0 }}>Download your current {word} as PDF or Word. Each file is read back and compared with your {word} before it is downloaded.</p>
          <FilesPanel say={say} inDialog onDownloaded={() => setDownloaded(true)} />
          {downloaded && cvClaims(cv).length > 0 && (
            <div className="cv-practice-card" data-testid="download-practice" style={{ marginTop: 14 }}>
              <b>Your {word} is ready. Practise the questions it will get you.</b>
              <span className="cv-small">We’ll build questions from the claims on your {word}.</span>
              <span className="cv-row" style={{ gap: 8 }}>
                <BtnLink kind="primary" href={`/cv/v/${cv.id}/questions`} onClick={() => void flush()}>
                  Questions your {word} will get
                </BtnLink>
                <Btn onClick={closePanel}>Back to editor</Btn>
              </span>
            </div>
          )}
        </Dialog>
      )}
      {shorten && (
        <ShortenDialog
          original={shorten.original}
          word={word}
          onClose={() => setShorten(null)}
          onApprove={(text) => {
            update({ sections: changeBullet(cv.sections, shorten.at, { text }) });
            setShorten(null);
            say("Your wording is added. The page has been measured again.");
          }}
        />
      )}
      {panel === "insights" && (
        <Dialog title="Score & job keywords" onClose={closePanel} wide>
          <div className="cv-stack">
            <ScorePanel score={w.score} word={word} base={`/cv/v/${cv.id}`} onShow={(at) => { closePanel(); pick(at); }} claims={cvClaims(cv).length} />
            <JobPanel cv={cv} update={update} word={word} onShow={(at) => { closePanel(); pick(at); }} say={say} />
          </div>
        </Dialog>
      )}
      {panel === "rename" && <RenameDialog name={cv.name} onClose={closePanel} onSave={(name) => { update({ name }); say("Renamed."); closePanel(); }} />}
      {panel === "share" && <ShareDialog cv={cv} word={word} saved={save === "saved"} flush={flush} onClose={closePanel} say={say} />}
      {panel === "design" && (
        <Dialog title="Design" onClose={closePanel} wide>
          <FormatBar cv={cv} paper={paper} update={update} base={base} say={say} onFit={runFit} fitBusy={fitBusy} />
          {fitResult && <p className="cv-small" role="status" style={{ marginBottom: 0 }}>{fitSummary(fitResult.fit, cv.design.pageTarget)} Your words haven’t changed.</p>}
        </Dialog>
      )}
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

/** Rename, from More: the CV's own name, for telling versions apart. */
function RenameDialog({ name, onClose, onSave }: { name: string; onClose: () => void; onSave: (name: string) => void }) {
  const [value, setValue] = useState(name);
  const ok = value.trim().length > 0;
  return (
    <Dialog
      title="Rename"
      onClose={onClose}
      actions={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn kind="primary" disabled={!ok} onClick={() => onSave(value.trim())}>
            Save name
          </Btn>
        </>
      }
    >
      <Field label="Name" rule="For you, so you can tell versions apart." value={value} onChange={setValue} maxLength={120} error={ok ? undefined : "Give it a name."} />
    </Dialog>
  );
}

/**
 * The result of Fit to one page, just above the paper (design spec v3 §03): the actual outcome, never
 * a quality score. When formatting alone can't do it, each line still over is quoted with Switch off and
 * Shorten, so the person decides; nothing is cut for them.
 */
function FitResultPanel({ result, target, liveOver, lines, textPt, marginMm, onUndo, onClose, onSwitchOff, canSwitchOff, onShorten }: {
  result: HonestFit;
  target: number;
  liveOver: number;
  lines: { at: Locator; text: string }[];
  textPt: number;
  marginMm: number;
  onUndo: () => void;
  onClose: () => void;
  onSwitchOff: (at: Locator) => void;
  canSwitchOff: (at: Locator) => boolean;
  onShorten: (at: Locator, text: string) => void;
}) {
  // Always measured against the page as it is now: a fit that held can stop holding after an edit, and the other way round.
  const nowOver = liveOver > 0;
  const nowFits = result.status === "over" && !nowOver;
  return (
    <section className="cv-fitresult" aria-label="Fit to one page result" data-testid="fit-result" data-status={nowFits ? "fits" : result.status}>
      <div className="cv-fitresult-head">
        <div className="min-w-0">
          <p className="cv-fitresult-title" role="status">
            {nowOver ? `${liveOver} ${liveOver === 1 ? "line runs" : "lines run"} onto page ${target + 1} now.` : nowFits ? `Fits on ${target === 1 ? "1 page" : `${target} pages`} now.` : fitSummary(result, target)}
          </p>
          <p className="cv-small" style={{ margin: "2px 0 0" }}>
            {nowOver ? `Text is at ${textPt} pt, margins at ${marginMm} mm. No change made to your words.${result.status !== "over" ? " Run Fit again to try once more." : ""}` : "Your words haven’t changed."}
          </p>
        </div>
        <span className="cv-row" style={{ gap: 6 }}>
          {result.status !== "already" && <Btn onClick={onUndo}>Undo fit</Btn>}
          <Btn kind="quiet" onClick={onClose} aria-label="Close the fit result">Close</Btn>
        </span>
      </div>
      {nowOver && lines.length > 0 && (
        <ul className="cv-fitresult-lines">
          {lines.slice(0, 12).map((l, i) => (
            <li key={`${i}-${l.text}`}>
              <q className="min-w-0">{l.text}</q>
              <span className="cv-row" style={{ gap: 6 }}>
                {canSwitchOff(l.at) && <Btn onClick={() => onSwitchOff(l.at)} aria-label={`Switch off: ${l.text.slice(0, 60)}`}>Switch off</Btn>}
                <Btn onClick={() => onShorten(l.at, l.text)} aria-label={`Shorten: ${l.text.slice(0, 60)}`}>Shorten</Btn>
              </span>
            </li>
          ))}
          {lines.length > 12 && <li className="cv-small">And {lines.length - 12} more {lines.length - 12 === 1 ? "line" : "lines"} on page {target + 1}.</li>}
        </ul>
      )}
    </section>
  );
}

/** Shorten a line (design spec v3 §03): the person rewrites it; nothing is added until they approve their own wording. */
function ShortenDialog({ original, word, onClose, onApprove }: { original: string; word: string; onClose: () => void; onApprove: (text: string) => void }) {
  const [text, setText] = useState(original);
  const [review, setReview] = useState(false);
  const changed = text.trim() && text.trim() !== original.trim();
  return (
    <Dialog
      title={review ? "Review your line" : "Shorten this line"}
      onClose={onClose}
      wide
      actions={
        review ? (
          <>
            <Btn onClick={() => setReview(false)}>Edit wording</Btn>
            <Btn kind="primary" onClick={() => onApprove(text.trim())}>
              Approve and add
            </Btn>
          </>
        ) : (
          <>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn kind="primary" disabled={!changed} onClick={() => setReview(true)}>
              Review your line
            </Btn>
          </>
        )
      }
    >
      {review ? (
        <>
          <blockquote className="cv-quote">{text.trim()}</blockquote>
          <p className="cv-muted" style={{ marginBottom: 0 }}>Approve your wording before it is added to your {word}.</p>
        </>
      ) : (
        <>
          <span className="cv-label">Your line now</span>
          <blockquote className="cv-quote">{original}</blockquote>
          <p className="cv-muted">Keep the facts. Change only the wording you approve.</p>
          <Field label="Your revised words" multiline rows={3} value={text} onChange={setText} maxLength={600} />
        </>
      )}
    </Dialog>
  );
}
