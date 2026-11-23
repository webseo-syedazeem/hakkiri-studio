"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { bulletAt } from "@/lib/cv/edit";
import { type SentenceReview, acceptSources, letterIsEmpty, paragraphText, recordSources, reflow, reviewLetter } from "@/lib/cv/letter/check";
import { blankParagraphs, defaultSignoff, greeting, insertEvidence, lineSentence, shortenings } from "@/lib/cv/letter/draft";
import { isoDate, layoutLetter, letterFit, longDate } from "@/lib/cv/letter/flow";
import { type PoolSource, evidenceLines, sameAt, strength } from "@/lib/cv/letter/sources";
import { fileName } from "@/lib/cv/render/filename";
import { textWidth } from "@/lib/cv/render/layout";
import { type Achievement, type Letter, type LetterParagraph, type LetterSentence, type LetterSource, type Locator, cvIsEmpty, emptyLetter, newId } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { assess } from "@/lib/cv/tailor/fit";
import { mergeRequirements } from "@/lib/cv/tailor/propose";
import { extractRequirements } from "@/lib/cv/tailor/requirements";
import { oneLine, terms } from "@/lib/cv/write/facts";
import { ApiError, api, messageOf } from "./client";
import { Dialog, usePanel } from "./Dialog";
import { PaperView } from "./Paper";
import { Downloads } from "./Software";
import { Announce, Bar, Btn, BtnLink, CvScreen, Field, Panel, Skeleton, Toolbar } from "./ui";
import { SAVE_WORDS } from "./useCv";
import { useDictation } from "./useDictation";
import { useLetterPaper } from "./usePaper";
import { type FileCheck, useWorkspace } from "./Workspace";

type Format = "pdf" | "docx";
const FORMAT_NAME: Record<Format, string> = { pdf: "PDF", docx: "Word" };
const STATE_WORD = { sourced: "Sourced", plain: "No source needed", unsupported: "Needs a source", review: "Review source" } as const;
const ROLE_WORD = { opening: "Opening", evidence: "Evidence", close: "Close" } as const;
const KIND_WORD: Record<LetterSource["kind"], string> = { cv: "Your CV", reason: "Your reason for applying", note: "Your note", advert: "The advert", job: "The job" };
const EMPTY = emptyLetter();
/** Colours drawn on the paper itself, which is always light. */
const ON_PAPER = { unsupported: "#c9343b", review: "#a8650a", selected: "#4a5af0" };

/** Where each sentence sits on the page: boxes in the page's own points. A screen overlay only. */
interface Mark {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A paragraph's text box. It keeps what is typed exactly as typed (a space after a full stop included) while the letter stores the sentences. */
function ParagraphBox({ id, value, onChange, onFocus, describedBy, invalid }: { id: string; value: string; onChange: (text: string) => void; onFocus: () => void; describedBy?: string; invalid?: boolean }) {
  const [text, setText] = useState(value);
  const area = useRef<HTMLTextAreaElement>(null);
  // Changed from outside (undo, a rewrite, a removed sentence): take the new text. While typing here, the two already agree.
  useEffect(() => {
    setText((t) => (oneLine(t) === value ? t : value));
  }, [value]);
  useLayoutEffect(() => {
    const el = area.current;
    if (!el || (typeof CSS !== "undefined" && CSS.supports("field-sizing", "content"))) return;
    el.style.height = "auto";
    if (el.scrollHeight > 0) el.style.height = `${el.scrollHeight + 2}px`;
  }, [text]);
  return (
    <textarea
      ref={area}
      id={id}
      className="cv-input"
      rows={3}
      style={{ minHeight: "calc(3 * 1.4em + 16px)" }}
      value={text}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      maxLength={4000}
      onFocus={onFocus}
      onBlur={() => setText(value)}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
}

/** One thing a sentence rests on. */
function SourceLine({ source, label, onOpen }: { source: LetterSource; label?: string; onOpen?: () => void }) {
  return (
    <li className="cv-lsource" data-kind={source.kind}>
      <span className="cv-eyebrow">
        {KIND_WORD[source.kind]}
        {label && source.kind === "cv" ? ` · ${label}` : ""}
      </span>
      <q className="cv-excerpt">{source.text}</q>
      {onOpen && (
        <button type="button" className="cv-link" onClick={onOpen}>
          Open in the builder
        </button>
      )}
    </li>
  );
}

/**
 * The cover letter for one version. On the left, what it is written from (the
 * job, the person's reason, the lines of their CV to use) or the letter's
 * paragraphs; on the right, the letter on its page. Every sentence is checked
 * against the CV, the reason, the notes and the advert, whoever wrote it, and
 * a letter with a sentence that has no source cannot be downloaded.
 */
export function LetterScreen() {
  const router = useRouter();
  const w = useWorkspace();
  const { cv, load, update, flush, settle, save, retry, undo, redo, canUndo, canRedo, view, setView } = w;
  const { panel, item, open, close } = usePanel();
  const now = useRef(new Date()).current;
  const today = useMemo(() => isoDate(now), [now]);
  const lp = useLetterPaper(cv, today);
  const [tabChoice, setTab] = useState<"" | "inputs" | "letter">("");
  const [selected, setSelected] = useState("");
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [focusPara, setFocusPara] = useState("");
  const [busy, setBusy] = useState<"" | "drafting" | "checking" | "check" | "shorten" | Format>("");
  const [problem, setProblem] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [draftNotes, setDraftNotes] = useState<string[]>([]);
  const [said, setSaid] = useState("");
  const [mode, setMode] = useState("");
  const [privateIds, setPrivateIds] = useState<Set<string>>(new Set());
  const [allLines, setAllLines] = useState(false);
  const [withCv, setWithCv] = useState(false);
  const [checks, setChecks] = useState<{ rev: number; withCv: boolean; pdf?: FileCheck; docx?: FileCheck } | null>(null);
  const [downloads, setDownloads] = useState(0);
  const [job, setJob] = useState({ title: "", employer: "", advert: "" });
  const [noteText, setNoteText] = useState("");
  const [pickLine, setPickLine] = useState("");
  const [shorter, setShorter] = useState<LetterSentence[] | null>(null);

  const say = useCallback((text: string) => {
    setSaid("");
    requestAnimationFrame(() => setSaid(text));
  }, []);

  const versionId = w.versionId;
  useEffect(() => {
    api<{ mode: string }>(`/api/cv/versions/${versionId}/write/status`)
      .then((r) => setMode(r.mode))
      .catch(() => setMode(""));
    api<{ achievements: Achievement[] }>("/api/cv/bank")
      .then((r) => setPrivateIds(new Set(r.achievements.filter((a) => a.private).map((a) => a.id))))
      .catch(() => undefined);
  }, [versionId]);

  // Ctrl or Cmd + Z undoes the last step; with Shift (or Ctrl + Y) it redoes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey && canUndo) {
        e.preventDefault();
        if (undo()) say("Undone.");
      } else if (((k === "z" && e.shiftKey) || k === "y") && canRedo) {
        e.preventDefault();
        if (redo()) say("Redone.");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [canUndo, canRedo, undo, redo, say]);

  const letter = cv?.letter ?? EMPTY;
  const review = useMemo(() => (cv ? reviewLetter(cv, now) : null), [cv, now]);
  const sections = cv?.sections;
  const lines = useMemo(() => {
    if (!cv) return [] as (PoolSource & { shows?: string })[];
    const rows = assess(cv).filter((r) => r.status !== "missing");
    return evidenceLines(cv, now)
      .filter((l) => {
        const b = bulletAt(cv.sections, l.at ?? null);
        return !(b?.bullet.bankId && privateIds.has(b.bullet.bankId));
      })
      .map((l) => ({ ...l, shows: rows.find((r) => r.lines.some((x) => sameAt(x.at, l.at)))?.requirement.text }))
      .sort((a, b) => Number(!!b.shows) - Number(!!a.shows) || strength(b.text) - strength(a.text));
    // The lines only change with the CV's sections and its requirements.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, cv?.requirements, cv?.contact, privateIds, now]);
  const hidden = useMemo(() => (cv ? evidenceLines(cv, now).length - lines.length : 0), [cv, lines, now]);

  // Where each sentence sits on the page, for marking and for clicking.
  const paper = lp.paper;
  const marks = useMemo(() => {
    const out: Mark[] = [];
    if (!paper) return out;
    for (const p of letter.paragraphs) {
      const block = paper.layout.blocks.find((b) => b.at.section === "letter" && b.at.entry === p.id);
      if (!block) continue;
      const full = paragraphText(p).trim();
      const ranges: { id: string; from: number; to: number }[] = [];
      let pos = 0;
      for (const s of p.sentences) {
        ranges.push({ id: s.id, from: pos, to: pos + s.text.length });
        pos += s.text.length + 1;
      }
      let cursor = 0;
      for (const line of block.lines) {
        const run = line.runs[0];
        const text = line.runs.map((r) => r.text).join("");
        const at = full.indexOf(text, cursor);
        if (!run || at < 0) continue;
        cursor = at + text.length;
        for (const r of ranges) {
          const a = Math.max(r.from, at) - at;
          const b = Math.min(r.to, at + text.length) - at;
          if (b <= a) continue;
          const x = run.x + textWidth(paper.fonts, run.font, text.slice(0, a), run.size, run.tracking);
          out.push({ id: r.id, page: line.page, x, y: line.top, width: textWidth(paper.fonts, run.font, text.slice(a, b), run.size, run.tracking), height: line.height });
        }
      }
    }
    return out;
  }, [paper, letter.paragraphs]);
  const fit = useMemo(() => (paper ? letterFit(paper.layout) : null), [paper]);

  const subject = panel === "review-letter-claim" ? (review?.sentences.find((s) => s.sentenceId === item) ?? null) : null;
  const overPara = letter.paragraphs.find((p) => p.id === fit?.over?.entry) ?? null;
  const options = useMemo(() => {
    if (panel !== "page-overflow" || !overPara || !cv || !paper || !review) return [];
    const proposals = [...shortenings(overPara, review.sentences), ...(shorter ? [{ id: "ai", label: "A shorter wording", paragraph: { ...overPara, sentences: shorter }, saves: paragraphText(overPara).split(/\s+/).length - shorter.map((s) => s.text).join(" ").split(/\s+/).length }] : [])];
    return proposals.map((o) => {
      const next = { ...letter, paragraphs: letter.paragraphs.map((p) => (p.id === o.paragraph.id ? o.paragraph : p)) };
      return { ...o, fits: letterFit(layoutLetter({ ...cv, letter: next }, paper.fonts, today).layout).fits };
    });
  }, [panel, overPara, cv, paper, review, shorter, letter, today]);

  // Each dialog opens with a clean form.
  useEffect(() => {
    setProblem("");
    setNoteText("");
    setPickLine("");
    setShorter(null);
    if (panel === "edit-job" && cv) setJob({ title: cv.target?.title ?? "", employer: cv.target?.employer ?? "", advert: cv.target?.advert ?? "" });
    // Only when a dialog opens or its subject changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel, item]);

  const dictation = useDictation(cv?.region ?? "uk", (text) => {
    if (!cv) return;
    const l = cv.letter ?? EMPTY;
    update({ letter: { ...l, reason: [l.reason.trim(), text].filter(Boolean).join(" ") } });
  });

  const crumbs = [{ label: "CVs and letters", href: "/cv" }, { label: cv?.name ?? "CV", href: `/cv/v/${versionId}/edit/contact` }, { label: "Cover letter" }];
  if (load === "loading")
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area" aria-busy="true" aria-label="Loading your letter">
          <Skeleton height={320} />
        </div>
      </CvScreen>
    );
  if (load !== "ready" || !cv || !review)
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area">
          <Toolbar title="CV not found" subtitle="It may have been deleted, or it belongs to another account.">
            <BtnLink href="/cv">Back to your CVs</BtnLink>
          </Toolbar>
        </div>
      </CvScreen>
    );

  const word = docWord(cv.region);
  const base = `/cv/v/${cv.id}`;
  const tab = tabChoice || (letter.started ? "letter" : "inputs");
  const empty = letterIsEmpty(cv.letter);
  const hasJob = !!(cv.target?.title.trim() || cv.target?.employer.trim());
  const advert = cv.target?.advert.trim() ?? "";
  const chosen = letter.evidence.filter((at) => lines.some((l) => sameAt(l.at, at)));
  const byId = new Map(review.sentences.map((s) => [s.sentenceId, s]));
  const open1 = review.open;
  const unsaved = "Your latest changes haven’t been saved yet, so this can’t be done from them. Check the save status at the top, then try again.";

  /** Saves the letter, noting for each new or changed sentence the lines it passed against. */
  const setLetter = (next: Letter) => update({ letter: recordSources(next, { ...cv, letter: next }, now) });
  const setParagraphs = (paragraphs: LetterParagraph[]) => setLetter({ ...letter, paragraphs });
  const editParagraph = (id: string, text: string) => setParagraphs(letter.paragraphs.map((p) => (p.id === id ? { ...p, sentences: reflow(p.sentences, text) } : p)));
  const focusBox = (paragraphId: string) => requestAnimationFrame(() => document.getElementById(`letter-p-${paragraphId}`)?.focus());

  function pickSentence(id: string, focus = true) {
    const s = byId.get(id);
    if (!s) return;
    setTab("letter");
    setView("edit");
    setSelected(id);
    setShown((o) => ({ ...o, [s.paragraphId]: true }));
    if (focus)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const el = document.getElementById(`ls-${id}`);
          el?.focus({ preventScroll: true });
          el?.scrollIntoView({ block: "nearest" });
        }),
      );
  }

  function onPaperPick(at: Locator) {
    if (at.section === "contact") {
      void flush();
      return router.push(`${base}/edit/contact`);
    }
    if (at.section !== "letter") return;
    setTab("letter");
    setView("edit");
    if (at.entry) {
      const first = review!.sentences.find((s) => s.paragraphId === at.entry && (s.state === "unsupported" || s.state === "review")) ?? review!.sentences.find((s) => s.paragraphId === at.entry);
      return first ? pickSentence(first.sentenceId) : focusBox(at.entry);
    }
    const id = at.field === "date" ? "letter-date" : at.field === "signoff" ? "letter-signoff" : at.field === "name" ? "" : "letter-recipient";
    if (id) requestAnimationFrame(() => document.getElementById(id)?.focus());
  }

  function toggleEvidence(at: Locator) {
    const on = letter.evidence.some((x) => sameAt(x, at));
    setFields((f) => ({ ...f, evidence: "" }));
    setLetter({ ...letter, evidence: on ? letter.evidence.filter((x) => !sameAt(x, at)) : [...chosen, at].slice(0, 2) });
  }

  function saveJob() {
    const text = job.advert.replace(/\r/g, "").trim();
    if (!job.title.trim() && !job.employer.trim()) return setProblem("Give the job title or the employer.");
    if (text && text.replace(/\s/g, "").length < 40) return setProblem("That is too short to be an advert. Paste the whole advert, or leave it empty.");
    update({ target: { title: job.title.trim(), employer: job.employer.trim(), advert: text }, requirements: text ? mergeRequirements(cv!.requirements, extractRequirements(text), text) : cv!.requirements });
    setFields((f) => ({ ...f, job: "" }));
    close();
  }

  async function draft() {
    setProblem("");
    setFields({});
    setDraftNotes([]);
    const missing: Record<string, string> = {};
    if (!hasJob) missing.job = "Say which job this letter is for.";
    if (letter.reason.split(/\s+/).filter(Boolean).length < 5) missing.reason = "Say why you want this role, in a sentence or two. The letter opens with it.";
    if (!chosen.length) missing.evidence = "Choose one or two lines of your CV for the letter to use.";
    if (Object.keys(missing).length) {
      setFields(missing);
      return setProblem("A letter needs the job, your reason and at least one line of your CV.");
    }
    setBusy("drafting");
    try {
      if (!(await settle())) throw new Error(unsaved);
      const out = await api<{ by: "ai" | "rules"; paragraphs: LetterParagraph[]; signoff: string; notes: string[] }>(`/api/cv/versions/${cv!.id}/letter/draft`, { method: "POST", json: {} });
      // The draft is put through the same check a typed sentence gets before any of it is shown.
      setBusy("checking");
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const next = recordSources({ ...letter, paragraphs: out.paragraphs, signoff: letter.signoff || out.signoff, started: true }, { ...cv!, letter: { ...letter, paragraphs: out.paragraphs } }, now);
      const checked = reviewLetter({ ...cv!, letter: next }, now);
      update({ letter: next });
      setDraftNotes([out.by === "ai" ? "Drafted with AI from your reason and the lines you chose, then checked sentence by sentence." : "Assembled from your own words: your reason, and the lines you chose.", ...out.notes]);
      setTab("letter");
      setSelected("");
      say(`Draft ready. ${checked.sentences.length} sentences, ${checked.open.length ? `${checked.open.length} to review` : "each checked against its source"}.`);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setFields(err.fields);
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  }

  function startBlank() {
    setLetter({ ...letter, paragraphs: letter.paragraphs.length ? letter.paragraphs : blankParagraphs(), started: true });
    setTab("letter");
    setDraftNotes([]);
    say("An empty letter to write in. Each sentence is checked as you type.");
  }

  function moveParagraph(id: string, by: number) {
    const from = letter.paragraphs.findIndex((p) => p.id === id);
    const to = from + by;
    if (from < 0 || to < 0 || to >= letter.paragraphs.length) return;
    const next = [...letter.paragraphs];
    next.splice(to, 0, next.splice(from, 1)[0]);
    setParagraphs(next);
  }

  function removeSentence(id: string) {
    setParagraphs(letter.paragraphs.map((p) => ({ ...p, sentences: p.sentences.filter((s) => s.id !== id) })));
    setSelected("");
    close();
    say("Sentence removed. Undo brings it back.");
  }

  function useLine() {
    const line = lines.find((l) => `${l.at?.entry}:${l.at?.field}` === pickLine);
    const text = line?.at ? lineSentence(cv!, line.at) : null;
    if (!subject || !text) return setProblem("Choose a line of your CV.");
    const made: LetterSentence = { id: newId("ls_"), text, origin: "drafted", sources: [] };
    setParagraphs(letter.paragraphs.map((p) => ({ ...p, sentences: p.sentences.map((s) => (s.id === subject.sentenceId ? made : s)) })));
    setSelected(made.id);
    close();
    say("Sentence rewritten from your CV line.");
  }

  function addNote() {
    const text = noteText.replace(/\s+/g, " ").trim();
    if (text.split(" ").length < 3) return setProblem("Say what backs this up, in a sentence of your own.");
    if (letter.notes.length >= 20) return setProblem("You have 20 notes on this letter. Remove one you no longer need first.");
    // The sentence is checked again with the note in place: its old record of sources is cleared so the new one is noted.
    const next = { ...letter, notes: [...letter.notes, { id: newId("ln_"), text }], paragraphs: letter.paragraphs.map((p) => ({ ...p, sentences: p.sentences.map((s) => (s.id === subject?.sentenceId ? { ...s, sources: [] } : s)) })) };
    setLetter(next);
    setNoteText("");
    setProblem("");
    const after = reviewLetter({ ...cv!, letter: next }, now).sentences.find((s) => s.sentenceId === subject?.sentenceId);
    say(after && after.state !== "unsupported" ? "Note added. The sentence now has a source." : "Note added. The sentence still says something the note doesn’t.");
  }

  function stillHolds() {
    if (!subject) return;
    const next = acceptSources(letter, subject.sentenceId, cv!, now);
    if (!next) return setProblem("It no longer holds as written: see what is listed above.");
    update({ letter: next });
    close();
    say("Kept. The sentence now rests on the line as it reads today.");
  }

  async function suggestShorter() {
    if (!overPara) return;
    setProblem("");
    setBusy("shorten");
    try {
      if (!(await settle())) throw new Error(unsaved);
      const out = await api<{ sentences: LetterSentence[] | null }>(`/api/cv/versions/${cv!.id}/letter/shorten`, { method: "POST", json: { paragraphId: overPara.id } });
      if (out.sentences) setShorter(out.sentences);
      else setProblem("No shorter wording passed the source check. Use one of the options above, or edit the paragraph yourself.");
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  }

  const current = !!checks && checks.rev === cv.rev && checks.withCv === withCv && save === "saved";
  const query = `${withCv ? "&with=cv" : ""}&today=${today}`;

  async function check() {
    setProblem("");
    setBusy("check");
    try {
      if (!(await settle())) throw new Error(unsaved);
      const result = await api<{ rev: number; withCv: boolean; pdf?: FileCheck; docx?: FileCheck }>(`/api/cv/versions/${cv!.id}/letter/check?x=1${query}`, { method: "POST", json: {} });
      setChecks({ rev: result.rev, withCv: result.withCv, pdf: result.pdf, docx: result.docx });
      const bad = (["pdf", "docx"] as const).filter((f) => result[f]?.status !== "checked");
      say(bad.length ? `${bad.map((f) => FORMAT_NAME[f]).join(" and ")}: the check found a problem.` : "Both files checked. Each reads back the same as your letter.");
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
      if (!(await settle())) throw new Error(unsaved);
      let res: Response;
      try {
        res = await fetch(`/api/cv/versions/${cv!.id}/letter/export?format=${format}${query}${unchecked ? "&unchecked=1" : ""}`);
      } catch {
        throw new ApiError(0, "No connection. Check you’re online and try again.");
      }
      const rev = Number(res.headers.get("x-cv-rev")) || cv!.rev;
      const keep = (c: typeof checks, mine: FileCheck) => ({ ...(c && c.rev === rev && c.withCv === withCv ? c : {}), rev, withCv, [format]: mine });
      if (res.ok) {
        // The bytes saved are the bytes that were read back and matched.
        const blob = await res.blob();
        const named = /filename\*=UTF-8''([^;]+)/.exec(res.headers.get("content-disposition") ?? "");
        const name = named ? decodeURIComponent(named[1]) : fileName(cv!, format, withCv ? "both" : "letter");
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
          say(`${name} downloaded. It was checked first: it reads back the same as your letter${withCv ? ` and ${word}` : ""}.`);
        } else say(`${name} downloaded without a check. Open it and read it through before you send it.`);
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string; check?: { missing?: string[]; unexpected?: string[] }; unsupported?: string[] };
      if (body.error === "loss") {
        setChecks((c) => keep(c, { status: "loss", missing: body.check?.missing ?? [], unexpected: body.check?.unexpected ?? [], unsupported: body.unsupported ?? [] }));
        return setProblem(`The ${FORMAT_NAME[format]} file did not read back the same as your letter, so it has not been downloaded. What differs is listed below.`);
      }
      if (res.status !== 409) setChecks((c) => keep(c, { status: "failed", made: body.error === "check_failed" }));
      setProblem(body.error === "check_failed" ? `The ${FORMAT_NAME[format]} file was made, but we couldn’t read it back to check it. You can try again, or download it unchecked and read it through yourself.` : (body.message ?? "The file could not be made."));
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  }

  const statusOf = (f: Format) => {
    const c = current ? checks?.[f] : undefined;
    if (busy === "check" || busy === f) return "Checking…";
    if (!c) return "Not checked yet";
    return c.status === "checked" ? "✓ Checked: reads back the same" : c.status === "loss" ? "✗ Doesn’t match the letter" : "Couldn’t be checked";
  };
  const lost = current ? (["pdf", "docx"] as const).filter((f) => checks?.[f]?.status === "loss") : [];
  const uncheckable = current ? (["pdf", "docx"] as const).filter((f) => checks?.[f]?.status === "failed" && checks?.[f]?.made) : [];

  /** Marks drawn over the page: a line under each sentence that needs attention, and the selected sentence. */
  const overlay = (page: number): ReactNode =>
    marks
      .filter((m) => m.page === page)
      .map((m, i) => {
        const s = byId.get(m.id);
        const state = s?.state ?? "plain";
        const flag = state === "unsupported" || state === "review";
        return (
          <g key={`${m.id}-${i}`} className="cv-lmark" data-sentence={m.id} data-state={state}>
            {m.id === selected && <rect x={m.x - 1} y={m.y} width={m.width + 2} height={m.height} rx={2} fill={ON_PAPER.selected} opacity={0.16} />}
            {flag && <rect x={m.x} y={m.y + m.height - 2.4} width={m.width} height={1.3} fill={ON_PAPER[state]} />}
            <rect x={m.x} y={m.y} width={m.width} height={m.height} fill="transparent" style={{ cursor: "pointer" }} onClick={() => pickSentence(m.id)}>
              <title>{`${STATE_WORD[state]}: select to see what this sentence rests on`}</title>
            </rect>
          </g>
        );
      });
  const selectedPage = marks.find((m) => m.id === selected)?.page;

  const sentenceRow = (s: LetterSentence) => {
    const r = byId.get(s.id);
    if (!r) return null;
    const isSel = selected === s.id;
    const flag = r.state === "unsupported" || r.state === "review";
    return (
      <li key={s.id} className="cv-lsent" data-state={r.state} data-selected={isSel || undefined}>
        <button type="button" id={`ls-${s.id}`} className="cv-text-passage" aria-expanded={isSel} onClick={() => (isSel ? setSelected("") : pickSentence(s.id, false))}>
          <span className="cv-lstate" data-state={r.state}>
            {STATE_WORD[r.state]}
          </span>{" "}
          {s.text}
        </button>
        {isSel && (
          <div className="cv-lsources" data-testid="sentence-sources">
            {r.state === "plain" && <p className="cv-small">This sentence makes no claim about you or the employer, so it needs no source.</p>}
            {r.state === "review" && (
              <p>
                <b>Something this sentence rests on has changed.</b> Check that it still says what is true.
              </p>
            )}
            {r.problems.length > 0 && (
              <ul className="cv-plainlist cv-lproblems">
                {r.problems.map((p) => (
                  <li key={p.say}>{p.say}</li>
                ))}
              </ul>
            )}
            {r.sources.length > 0 && (
              <>
                <span className="cv-small">It rests on:</span>
                <ul className="cv-plainlist">
                  {r.sources.map((x, i) => (
                    <SourceLine
                      key={i}
                      source={x}
                      label={x.label}
                      onOpen={
                        x.kind === "cv" && x.at
                          ? () => {
                              void flush();
                              router.push(`${base}/edit/${w.locate(x.at!)}`);
                            }
                          : undefined
                      }
                    />
                  ))}
                </ul>
              </>
            )}
            {flag && (
              <div className="cv-row" style={{ marginTop: 8 }}>
                <Btn kind="primary" onClick={() => open("review-letter-claim", { item: s.id })}>
                  {r.state === "review" ? "Review source" : "Review this sentence"}
                </Btn>
              </div>
            )}
          </div>
        )}
      </li>
    );
  };

  const jobLine = [cv.target?.title, cv.target?.employer].map((x) => x?.trim()).filter(Boolean).join(" · ");
  const shownLines = allLines ? lines : lines.filter((l, i) => i < 6 || letter.evidence.some((x) => sameAt(x, l.at)));

  const inputs = (
    <Panel title="What your letter is written from">
      <div className="cv-pad cv-stack" data-testid="letter-inputs">
        <div>
          <h3>The job</h3>
          {hasJob ? (
            <p data-testid="letter-job">
              {jobLine}
              <small style={{ display: "block" }}>{advert ? `The advert is saved with this version: ${cv.requirements.length} ${cv.requirements.length === 1 ? "thing" : "things"} it asks for.` : "No advert saved. With one, the letter can answer what it asks for."}</small>
            </p>
          ) : (
            <p className="cv-muted">A cover letter is written for one job. Say which.</p>
          )}
          {fields.job && (
            <p className="cv-error-text" role="alert">
              {fields.job}
            </p>
          )}
          <div className="cv-row" style={{ marginTop: 8 }}>
            <Btn onClick={() => open("edit-job")}>{hasJob ? (advert ? "Edit the job and advert" : "Paste the advert") : "Add the job"}</Btn>
            {cv.kind === "base" && hasJob && <small>This letter is kept with your base {word}. For another job, tailor a version: each has its own letter.</small>}
          </div>
        </div>

        <div>
          <Field
            id="letter-reason"
            label="Why do you want this role?"
            rule="In your own words: two or three sentences. The letter opens with them, as you wrote them."
            multiline
            rows={4}
            maxLength={3000}
            value={letter.reason}
            error={fields.reason}
            onChange={(reason) => (setFields((f) => ({ ...f, reason: "" })), setLetter({ ...letter, reason }))}
          />
          {!dictation.off && (
            <div className="cv-row" style={{ marginTop: 8 }}>
              <Btn onClick={() => void dictation.toggle()} busy={dictation.state === "asking" || dictation.state === "transcribing"}>
                {dictation.label}
              </Btn>
              {dictation.state === "recording" && (
                <small role="status">
                  <span className="cv-dot" style={{ background: "var(--color-red)" }} aria-hidden="true" /> Recording
                </small>
              )}
            </div>
          )}
          {dictation.note && (
            <p className="cv-small" role="status" style={{ marginTop: 6 }}>
              {dictation.note}
            </p>
          )}
        </div>

        <fieldset className="cv-lfield" data-testid="evidence-list">
          <legend className="cv-label">Evidence to use</legend>
          <span className="cv-rule">Choose one or two lines of your {word}. Each becomes a paragraph that says the same thing, in the first person.</span>
          {lines.length === 0 && (
            <p className="cv-muted" style={{ marginTop: 6 }}>
              Your {word} has no lines to use yet. Add what you did under a role in the builder first.
            </p>
          )}
          <div className="cv-stack" style={{ gap: 8, marginTop: 8 }}>
            {shownLines.map((l) => {
              const on = letter.evidence.some((x) => sameAt(x, l.at));
              return (
                <label key={`${l.at?.entry}:${l.at?.field}`} className="cv-choice">
                  <input type="checkbox" checked={on} disabled={!on && chosen.length >= 2} onChange={() => toggleEvidence(l.at!)} />
                  <span className="min-w-0">
                    {l.text}
                    <small style={{ display: "block" }}>
                      {l.label}
                      {l.shows ? ` · Shows what the advert asks for: “${l.shows}”` : ""}
                    </small>
                  </span>
                </label>
              );
            })}
          </div>
          {lines.length > shownLines.length && (
            <Btn kind="quiet" onClick={() => setAllLines(true)} style={{ marginTop: 6 }}>
              Show all {lines.length} lines
            </Btn>
          )}
          {chosen.length >= 2 && <small style={{ display: "block", marginTop: 6 }}>Two is the most a one-page letter carries. Untick one to choose another.</small>}
          {hidden > 0 && (
            <small style={{ display: "block", marginTop: 6 }}>
              {hidden} {hidden === 1 ? "line comes" : "lines come"} from achievements you marked private, and {hidden === 1 ? "is" : "are"} not offered here.
            </small>
          )}
          {fields.evidence && (
            <p className="cv-error-text" role="alert">
              {fields.evidence}
            </p>
          )}
        </fieldset>

        <Field
          id="letter-voice"
          label="Something you wrote (optional)"
          rule="An email or message in your own style. It guides the tone only: nothing in it is used as a fact."
          multiline
          rows={3}
          maxLength={3000}
          value={letter.voice}
          onChange={(voice) => setLetter({ ...letter, voice })}
        />

        {problem && !panel && tab === "inputs" && (
          <p className="cv-error-text" role="alert">
            {problem}
          </p>
        )}
        <div className="cv-row">
          <Btn kind="primary" busy={busy === "drafting" || busy === "checking"} onClick={() => void draft()}>
            {letter.started && !empty ? "Draft again" : "Draft letter"}
          </Btn>
          {!letter.started && <Btn onClick={startBlank}>Write it myself</Btn>}
          {(busy === "drafting" || busy === "checking") && (
            <small role="status" data-testid="draft-status">
              {busy === "drafting" ? "Drafting…" : "Checking sources…"}
            </small>
          )}
        </div>
        {letter.started && !empty && <small>Drafting again replaces the letter’s paragraphs. Undo brings them back.</small>}
        {mode === "off" && <small data-testid="ai-off">AI drafting isn’t available right now. “Draft letter” assembles the letter from your own words instead, and you can write it yourself: the source check, page fit and downloads all work.</small>}
      </div>
    </Panel>
  );

  const editor = (
    <>
      {draftNotes.length > 0 && (
        <div className="cv-note" data-testid="draft-notes">
          {draftNotes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
      )}
      <Panel title="Your letter" aside={<small data-testid="letter-count">{review.words} words</small>}>
        <div className="cv-pad cv-stack" data-testid="letter-editor">
          <div className="cv-pair">
            <Field id="letter-recipient" label="Who it is to" rule={`Empty gives “${greeting("")}”`} maxLength={120} value={letter.recipient} onChange={(recipient) => setLetter({ ...letter, recipient })} />
            <div>
              <label className="cv-label" htmlFor="letter-date">
                Date on the letter
              </label>
              <span className="cv-rule" id="letter-date-rule">
                Empty uses the day you download it: {longDate(today, cv.region)}
              </span>
              <input id="letter-date" type="date" className="cv-input" aria-describedby="letter-date-rule" value={letter.date} onChange={(e) => setLetter({ ...letter, date: /^\d{4}-\d{2}-\d{2}$/.test(e.target.value) ? e.target.value : "" })} />
            </div>
          </div>

          {letter.paragraphs.map((p, i) => {
            const rows = p.sentences.map((s) => byId.get(s.id)).filter((r): r is SentenceReview => !!r);
            const flagged = rows.filter((r) => r.state === "unsupported" || r.state === "review").length;
            const isOpen = shown[p.id] ?? flagged > 0;
            const name = `${ROLE_WORD[p.role]} paragraph${letter.paragraphs.filter((x) => x.role === p.role).length > 1 ? ` ${letter.paragraphs.filter((x) => x.role === p.role).indexOf(p) + 1}` : ""}`;
            return (
              <div key={p.id} className="cv-lpara" data-para={p.id} data-role={p.role} data-over={fit?.over?.entry === p.id || undefined}>
                <div className="cv-row" style={{ gap: 6 }}>
                  <label className="cv-label" htmlFor={`letter-p-${p.id}`} style={{ marginBottom: 0 }}>
                    {name}
                  </label>
                  <span className="cv-push" />
                  <Btn kind="quiet" aria-label={`Move ${name} up`} disabled={i === 0} onClick={() => moveParagraph(p.id, -1)}>
                    ↑
                  </Btn>
                  <Btn kind="quiet" aria-label={`Move ${name} down`} disabled={i === letter.paragraphs.length - 1} onClick={() => moveParagraph(p.id, 1)}>
                    ↓
                  </Btn>
                  <Btn kind="quiet" aria-label={`Remove ${name}`} onClick={() => (setParagraphs(letter.paragraphs.filter((x) => x.id !== p.id)), say("Paragraph removed. Undo brings it back."))}>
                    Remove
                  </Btn>
                </div>
                <ParagraphBox id={`letter-p-${p.id}`} value={paragraphText(p)} onChange={(text) => editParagraph(p.id, text)} onFocus={() => setFocusPara(p.id)} describedBy={`letter-ps-${p.id}`} invalid={flagged > 0} />
                <div className="cv-row" style={{ marginTop: 6, gap: 8 }} id={`letter-ps-${p.id}`}>
                  <small className={flagged ? "cv-warn" : undefined} data-testid="para-status">
                    {rows.length === 0 ? "Nothing written yet." : flagged ? `${flagged} of ${rows.length} ${rows.length === 1 ? "sentence" : "sentences"} ${flagged === 1 ? "needs" : "need"} attention.` : `${rows.length} ${rows.length === 1 ? "sentence" : "sentences"}, each sourced or needing no source.`}
                  </small>
                  {rows.length > 0 && (
                    <Btn kind="quiet" className="cv-push" aria-expanded={isOpen} onClick={() => setShown((o) => ({ ...o, [p.id]: !isOpen }))}>
                      {isOpen ? "Hide sources" : "Show sources"}
                    </Btn>
                  )}
                </div>
                {isOpen && rows.length > 0 && <ul className="cv-plainlist cv-lsents">{p.sentences.map(sentenceRow)}</ul>}
              </div>
            );
          })}

          <div className="cv-row">
            <Btn onClick={() => (setParagraphs([...letter.paragraphs, { id: newId("lp_"), role: "evidence" as const, sentences: [] }].slice(0, 8)), say("Paragraph added."))} disabled={letter.paragraphs.length >= 8}>
              + Add a paragraph
            </Btn>
            <Btn onClick={() => open("choose-evidence")} disabled={!lines.length}>
              Insert a line from my {word}
            </Btn>
          </div>

          <Field id="letter-signoff" label="Sign-off" rule={`Empty uses “${defaultSignoff(cv.region, letter.recipient)}”. Your name follows it.`} maxLength={60} value={letter.signoff} onChange={(signoff) => setLetter({ ...letter, signoff })} />
        </div>
      </Panel>

      {letter.notes.length > 0 && (
        <Panel title="Your notes" aside={<small>What you added to back a sentence</small>}>
          <ul className="cv-plainlist" data-testid="letter-notes">
            {letter.notes.map((n) => (
              <li key={n.id} className="cv-row" style={{ padding: "10px 18px", alignItems: "flex-start" }}>
                <q className="cv-excerpt min-w-0 grow" style={{ marginTop: 0 }}>
                  {n.text}
                </q>
                <Btn kind="quiet" aria-label={`Remove note: ${n.text.slice(0, 40)}`} onClick={() => (setLetter({ ...letter, notes: letter.notes.filter((x) => x.id !== n.id) }), say("Note removed. Sentences that rested on it are marked for review."))}>
                  Remove
                </Btn>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="Download">
        <div className="cv-pad cv-stack" id="files">
          <p data-testid="letter-review" data-open={open1.length}>
            {empty ? (
              "There is nothing in the letter yet."
            ) : open1.length ? (
              <>
                <b className="cv-warn">
                  {open1.length === 1 ? "One sentence needs" : `${open1.length} sentences need`} attention before this letter can be downloaded.
                </b>{" "}
                Each one is marked on the page and listed under its paragraph.
              </>
            ) : (
              `All ${review.sentences.length} sentences are sourced, or make no claim that needs one.`
            )}
          </p>
          {open1.length > 0 && (
            <ul className="cv-plainlist" data-testid="letter-open">
              {open1.map((s) => (
                <li key={s.sentenceId}>
                  <button type="button" className="cv-text-passage" onClick={() => pickSentence(s.sentenceId)}>
                    <span className="cv-lstate" data-state={s.state}>
                      {STATE_WORD[s.state]}
                    </span>{" "}
                    {s.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="cv-seg" role="group" aria-label="What to put in the file" data-testid="letter-with">
            <button type="button" aria-pressed={!withCv} onClick={() => setWithCv(false)}>
              Letter only
            </button>
            <button type="button" aria-pressed={withCv} onClick={() => setWithCv(true)} disabled={cvIsEmpty(cv)}>
              Letter and {word} in one file
            </button>
          </div>
          <small style={{ display: "block" }}>
            File name: <span data-testid="letter-filename">{fileName(cv, "pdf", withCv ? "both" : "letter").replace(/\.pdf$/, "")}</span>
          </small>
          <ul className="cv-plainlist cv-filelist">
            {(["pdf", "docx"] as const).map((f) => (
              <li key={f} className="cv-row">
                <span className="min-w-0 grow">
                  <b>{FORMAT_NAME[f]}</b>
                  <small style={{ display: "block" }} data-testid={`letter-status-${f}`}>
                    {statusOf(f)}
                  </small>
                </span>
                <Btn kind={f === "pdf" ? "primary" : "default"} busy={busy === f} disabled={empty || open1.length > 0 || (!!busy && busy !== f)} onClick={() => void download(f)}>
                  Download {FORMAT_NAME[f]}
                </Btn>
              </li>
            ))}
          </ul>
          <div className="cv-row">
            <Btn busy={busy === "check"} disabled={empty || open1.length > 0 || (!!busy && busy !== "check")} onClick={() => void check()}>
              Check both files
            </Btn>
            <small>Each file is made, read back and compared with your letter before it is sent.</small>
          </div>
          {problem && !panel && tab === "letter" && (
            <p className="cv-error-text" role="alert">
              {problem}
            </p>
          )}
          {lost.map((f) => (
            <div key={f} className="cv-issue" role="alert" data-testid="letter-loss">
              <strong>The {FORMAT_NAME[f]} file doesn’t match</strong>
              <span>
                {checks?.[f]?.missing?.length ? `Missing or out of place: ${checks[f]!.missing!.slice(0, 3).join(" · ")}. ` : ""}
                {checks?.[f]?.unsupported?.length ? `Characters the fonts can’t draw: ${checks[f]!.unsupported!.join(" ")}. ` : ""}
                Nothing was downloaded.
              </span>
            </div>
          ))}
          {uncheckable.map((f) => (
            <div key={f} className="cv-row">
              <small>The {FORMAT_NAME[f]} file was made but couldn’t be read back.</small>
              <Btn onClick={() => void download(f, true)}>Download unchecked {FORMAT_NAME[f]} file</Btn>
            </div>
          ))}
          <Downloads versionId={cv.id} refresh={downloads} />
        </div>
      </Panel>
    </>
  );

  const suggestions = subject
    ? (() => {
        const want = new Set(terms(subject.text).map((t) => t.stem));
        return lines
          .map((l) => ({ l, n: terms(l.text).filter((t) => want.has(t.stem)).length }))
          .sort((a, b) => b.n - a.n || strength(b.l.text) - strength(a.l.text))
          .slice(0, 5)
          .map((x) => x.l);
      })()
    : [];
  const picked = lines.find((l) => `${l.at?.entry}:${l.at?.field}` === pickLine);
  const pickedText = picked?.at ? lineSentence(cv, picked.at) : null;

  return (
    <CvScreen>
      <Bar crumbs={crumbs}>
        <span className="cv-chip">{cv.kind === "base" ? `Base ${word}` : cv.target?.employer || "Tailored version"}</span>
        <BtnLink href={`${base}/edit/contact`} onClick={() => void flush()}>
          Back to the builder
        </BtnLink>
        <small role="status" data-testid="save-state">
          {SAVE_WORDS[save]}
        </small>
        {(save === "failed" || save === "device") && <Btn onClick={retry}>Retry</Btn>}
        <Btn onClick={() => undo() && say("Undone.")} disabled={!canUndo} aria-keyshortcuts="Control+Z Meta+Z">
          Undo
        </Btn>
        <Btn onClick={() => redo() && say("Redone.")} disabled={!canRedo} aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z">
          Redo
        </Btn>
      </Bar>
      <div className="cv-area">
        <Toolbar eyebrow={jobLine || cv.name} title="Cover letter" subtitle={`Written from your ${word}, the advert and your own reason. Every sentence is checked against where it comes from.`}>
          {letter.started && (
            <div className="cv-seg" role="group" aria-label="Show">
              <button type="button" aria-pressed={tab === "letter"} onClick={() => setTab("letter")}>
                Letter
              </button>
              <button type="button" aria-pressed={tab === "inputs"} onClick={() => setTab("inputs")}>
                What it’s written from
              </button>
            </div>
          )}
        </Toolbar>

        {save === "conflict" && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>Changed somewhere else</strong>
            <span>This {word} was saved in another tab or on another device after you opened it here. Nothing has been overwritten.</span>
            <BtnLink className="cv-push" href={`${base}/edit/contact?panel=save-conflict`}>
              Compare and choose
            </BtnLink>
          </div>
        )}
        {(save === "device" || save === "failed") && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>{SAVE_WORDS[save]}</strong>
            <span>{save === "device" ? "Your changes couldn’t reach us, so they are kept on this device. They will be saved when you’re back online." : "Your changes couldn’t be saved. Check you’re online and press Retry."}</span>
          </div>
        )}

        <div className="cv-seg cv-narrow" role="group" aria-label="Show">
          <button type="button" aria-pressed={view === "edit"} onClick={() => setView("edit")}>
            Edit
          </button>
          <button type="button" aria-pressed={view === "paper"} onClick={() => setView("paper")}>
            Paper
          </button>
        </div>

        <div className="cv-layout" style={{ gridTemplateColumns: "minmax(0, 552fr) minmax(0, 616fr)" }}>
          <div className={view === "edit" ? "cv-stack min-w-0" : "cv-stack min-w-0 cv-wide"} onBlur={() => void flush()}>
            {tab === "inputs" ? inputs : editor}
          </div>
          <div className={view === "paper" ? "min-w-0 cv-sticky" : "min-w-0 cv-sticky cv-wide"}>
            <PaperView paper={paper} state={lp.state} retry={lp.retry} cv={cv} focus={focusPara ? { section: "letter", entry: focusPara } : null} onPick={onPaperPick} word="letter" overlay={overlay} showPage={selectedPage}>
              {!empty && fit && !fit.fits && (
                <div className="cv-issue" role="alert" style={{ margin: "0 0 12px" }} data-testid="letter-overflow">
                  <strong>Runs onto a second page</strong>
                  <span>
                    A cover letter is one page. {fit.linesOver} {fit.linesOver === 1 ? "line is" : "lines are"} over.
                  </span>
                  <Btn className="cv-push" onClick={() => open("page-overflow")}>
                    Fix the overflow
                  </Btn>
                </div>
              )}
              {!empty && fit?.fits && (
                <p className="cv-small" style={{ margin: "0 0 8px" }} data-testid="letter-fit">
                  One page, in your {word}’s own type, colour and margins. Select a sentence on the page to see what it rests on.
                </p>
              )}
            </PaperView>
          </div>
        </div>
        <Announce>{said || (save === "failed" || save === "device" || save === "conflict" ? SAVE_WORDS[save] : "")}</Announce>
      </div>

      {panel === "edit-job" && (
        <Dialog
          title="The job this letter is for"
          onClose={close}
          actions={
            <>
              <Btn onClick={close}>Cancel</Btn>
              <Btn kind="primary" onClick={saveJob}>
                Save
              </Btn>
            </>
          }
        >
          <div className="cv-stack">
            <div className="cv-pair">
              <Field label="Job title" maxLength={160} value={job.title} onChange={(title) => setJob({ ...job, title })} />
              <Field label="Employer" maxLength={160} value={job.employer} onChange={(employer) => setJob({ ...job, employer })} />
            </div>
            <Field label="The advert" rule="Paste it whole. The letter can then say what it asks for, in its own words, and nothing about the employer that isn’t in it." multiline rows={8} maxLength={20000} value={job.advert} onChange={(a) => setJob({ ...job, advert: a })} />
            {problem && (
              <p className="cv-error-text" role="alert">
                {problem}
              </p>
            )}
          </div>
        </Dialog>
      )}

      {panel === "choose-evidence" && (
        <Dialog
          title={`Insert a line from your ${word}`}
          onClose={close}
          actions={
            <>
              <Btn onClick={close}>Cancel</Btn>
              <Btn
                kind="primary"
                disabled={!picked}
                onClick={() => {
                  const next = picked?.at ? insertEvidence(letter, cv, picked.at, now) : null;
                  if (!next) return setProblem("Choose a line.");
                  setLetter({ ...next, started: true });
                  close();
                  say("Sentence added to the letter.");
                }}
              >
                Insert
              </Btn>
            </>
          }
        >
          <div className="cv-stack">
            <p className="cv-muted">The line goes into the letter as a sentence that says the same thing, in the first person.</p>
            <div className="cv-stack" style={{ gap: 8 }} role="radiogroup" aria-label={`Lines of your ${word}`}>
              {lines.map((l) => (
                <label key={`${l.at?.entry}:${l.at?.field}`} className="cv-choice">
                  <input type="radio" name="letter-line" checked={pickLine === `${l.at?.entry}:${l.at?.field}`} onChange={() => setPickLine(`${l.at?.entry}:${l.at?.field}`)} />
                  <span className="min-w-0">
                    {l.text}
                    <small style={{ display: "block" }}>{l.label}</small>
                  </span>
                </label>
              ))}
            </div>
            {pickedText && (
              <p data-testid="line-preview">
                <span className="cv-small">It will read:</span> {pickedText}
              </p>
            )}
            {problem && (
              <p className="cv-error-text" role="alert">
                {problem}
              </p>
            )}
          </div>
        </Dialog>
      )}

      {panel === "review-letter-claim" && (
        <Dialog title={subject?.state === "review" ? "Review source" : "Review this sentence"} onClose={close} readable actions={<Btn onClick={close}>{subject && (subject.state === "unsupported" || subject.state === "review") ? "Not now" : "Done"}</Btn>}>
          {!subject ? (
            <p className="cv-muted">That sentence is no longer in the letter.</p>
          ) : (
            <div className="cv-stack" data-testid="claim-review" data-state={subject.state}>
              <blockquote className="cv-quote">{subject.text}</blockquote>

              {(subject.state === "sourced" || subject.state === "plain") && (
                <p data-testid="claim-ok">
                  <b>{subject.state === "sourced" ? "This sentence now has a source." : "This sentence makes no claim that needs a source."}</b>
                </p>
              )}

              {subject.changed.map((c, i) => (
                <div key={i} className="cv-compare" data-testid="source-change">
                  <span className="cv-eyebrow">{KIND_WORD[c.was.kind]}</span>
                  <div>
                    <div>
                      <small>When this sentence was checked</small>
                      <p>{c.was.text}</p>
                    </div>
                    <div>
                      <small>Now</small>
                      <p>{c.state === "changed" ? c.now : c.state === "off" ? `Switched off in this version of your ${word}.` : c.was.kind === "cv" ? `No longer in your ${word}.` : c.was.kind === "advert" ? "No longer in the advert." : c.was.kind === "note" ? "The note was removed." : "No longer in your reason."}</p>
                    </div>
                  </div>
                </div>
              ))}

              {subject.problems.length > 0 && (
                <div>
                  <h3>What has no source</h3>
                  <ul className="cv-plainlist cv-lproblems" data-testid="claim-problems">
                    {subject.problems.map((p) => (
                      <li key={p.say}>{p.say}</li>
                    ))}
                  </ul>
                </div>
              )}
              {subject.sources.length > 0 && (
                <div>
                  <h3>What it rests on now</h3>
                  <ul className="cv-plainlist">
                    {subject.sources.map((x, i) => (
                      <SourceLine key={i} source={x} label={x.label} />
                    ))}
                  </ul>
                </div>
              )}

              {subject.state === "review" && subject.problems.length === 0 && (
                <div className="cv-row">
                  <Btn kind="primary" onClick={stillHolds}>
                    It still holds: keep the sentence
                  </Btn>
                  <small>The sentence is checked against the line as it reads now.</small>
                </div>
              )}

              {(subject.state === "unsupported" || subject.state === "review") && (
                <>
                  <div>
                    <h3>Rewrite it from a line of your {word}</h3>
                    <p className="cv-small">The sentence is replaced by one that says what the line says.</p>
                    <div className="cv-stack" style={{ gap: 8, marginTop: 8 }} role="radiogroup" aria-label={`Lines of your ${word}`}>
                      {suggestions.map((l) => (
                        <label key={`${l.at?.entry}:${l.at?.field}`} className="cv-choice">
                          <input type="radio" name="claim-line" checked={pickLine === `${l.at?.entry}:${l.at?.field}`} onChange={() => setPickLine(`${l.at?.entry}:${l.at?.field}`)} />
                          <span className="min-w-0">
                            {l.text}
                            <small style={{ display: "block" }}>{l.label}</small>
                          </span>
                        </label>
                      ))}
                      {suggestions.length === 0 && <p className="cv-muted">Your {word} has no lines to use yet.</p>}
                    </div>
                    {pickedText && (
                      <p style={{ marginTop: 8 }} data-testid="line-preview">
                        <span className="cv-small">It will read:</span> {pickedText}
                      </p>
                    )}
                    <div className="cv-row" style={{ marginTop: 8 }}>
                      <Btn disabled={!pickedText} onClick={useLine}>
                        Use this sentence
                      </Btn>
                    </div>
                  </div>

                  <div>
                    <Field
                      label="Back it with a note"
                      rule="Say what backs this up, in your own words. A note backs what you say about yourself; what you say about the employer has to be in the advert."
                      multiline
                      rows={2}
                      maxLength={1200}
                      value={noteText}
                      onChange={setNoteText}
                    />
                    <div className="cv-row" style={{ marginTop: 8 }}>
                      <Btn onClick={addNote}>Add this note</Btn>
                    </div>
                  </div>

                  {problem && (
                    <p className="cv-error-text" role="alert">
                      {problem}
                    </p>
                  )}

                  <div className="cv-row">
                    <Btn
                      onClick={() => {
                        close();
                        focusBox(subject.paragraphId);
                      }}
                    >
                      Edit it myself
                    </Btn>
                    <Btn kind="danger" onClick={() => removeSentence(subject.sentenceId)}>
                      Remove the sentence
                    </Btn>
                  </div>
                </>
              )}
            </div>
          )}
        </Dialog>
      )}

      {panel === "page-overflow" && (
        <Dialog title="Your letter runs onto a second page" onClose={close} readable actions={<Btn onClick={close}>{fit?.fits ? "Done" : "Not now"}</Btn>}>
          {fit?.fits || !overPara ? (
            <p data-testid="overflow-fixed">
              <b>The letter now fits on one page.</b>
            </p>
          ) : (
            <div className="cv-stack" data-testid="overflow">
              <p>
                A cover letter is one page. Yours is {fit?.linesOver} {fit?.linesOver === 1 ? "line" : "lines"} over. This is the paragraph that crosses onto the second page:
              </p>
              <blockquote className="cv-quote">{paragraphText(overPara)}</blockquote>
              <h3>Shorten it and keep its sources</h3>
              <ul className="cv-plainlist cv-overlist">
                {options.map((o) => (
                  <li key={o.id} className="cv-row" data-testid="shortening" style={{ alignItems: "flex-start" }}>
                    <span className="min-w-0 grow">
                      {o.label}
                      <small style={{ display: "block" }}>
                        Saves {o.saves} {o.saves === 1 ? "word" : "words"}. {o.fits ? "The letter then fits on one page." : "The letter is still over one page after this."}
                      </small>
                      {o.id === "ai" && <q className="cv-excerpt">{o.paragraph.sentences.map((s) => s.text).join(" ")}</q>}
                    </span>
                    <Btn
                      onClick={() => {
                        setParagraphs(letter.paragraphs.map((p) => (p.id === o.paragraph.id ? o.paragraph : p)));
                        setShorter(null);
                        say(o.fits ? "Done. The letter fits on one page." : "Done. The letter is still over one page.");
                      }}
                    >
                      Use this
                    </Btn>
                  </li>
                ))}
                {options.length === 0 && <li className="cv-muted">There is nothing here that can be cut without changing what it says. Edit the paragraph yourself, or remove one.</li>}
              </ul>
              {mode === "ai" && (
                <div className="cv-row">
                  <Btn busy={busy === "shorten"} onClick={() => void suggestShorter()}>
                    Suggest a shorter wording
                  </Btn>
                  <small>It is checked against the same sources before you see it.</small>
                </div>
              )}
              {problem && (
                <p className="cv-error-text" role="alert">
                  {problem}
                </p>
              )}
              <div className="cv-row">
                <Btn
                  onClick={() => {
                    close();
                    setTab("letter");
                    setView("edit");
                    focusBox(overPara.id);
                  }}
                >
                  Edit it myself
                </Btn>
              </div>
            </div>
          )}
        </Dialog>
      )}
    </CvScreen>
  );
}
