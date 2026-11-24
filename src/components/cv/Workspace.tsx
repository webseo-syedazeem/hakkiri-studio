"use client";

import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fieldFor, tabFor } from "@/lib/cv/edit";
import type { Locator } from "@/lib/cv/schema";
import { type Finding, type Score, scoreCv } from "@/lib/cv/score/score";
import { useCv } from "./useCv";
import { usePaper } from "./usePaper";

/** One file's check: what the read-back found. */
export interface FileCheck {
  status: "checked" | "loss" | "failed";
  /** With "failed": the file was made; it was the reading back that failed. It can be downloaded, labelled as unchecked. */
  made?: boolean;
  name?: string;
  pages?: number;
  words?: number;
  size?: number;
  missing?: string[];
  unexpected?: string[];
  unsupported?: string[];
}
export interface FileChecks {
  /** The revision of the CV the files were made from. A later change makes the result out of date. */
  rev: number;
  pdf?: FileCheck;
  docx?: FileCheck;
}

type Workspace = ReturnType<typeof useCv> &
  ReturnType<typeof usePaper> & {
    versionId: string;
    /** The field the cursor is in: its passage is marked on the paper. */
    focus: Locator | null;
    setFocus: (at: Locator | null) => void;
    /** Which entry is open in each section: one at a time. */
    openEntry: Record<string, string>;
    setOpenEntry: (sectionId: string, entryId: string) => void;
    /** On a narrow screen: the form or the paper. */
    view: "edit" | "paper";
    setView: (v: "edit" | "paper") => void;
    /** A field to focus once its tab is showing (after a click on the paper). */
    wanted: React.RefObject<{ entry: string; field: string } | null>;
    checks: FileChecks | null;
    setChecks: (c: FileChecks | null | ((c: FileChecks | null) => FileChecks | null)) => void;
    /** The bullet whose helper is open in place of the paper. */
    inspect: Locator | null;
    setInspect: (at: Locator | null) => void;
    /** A profile being tried on the paper before it is put in the CV. Never saved from here. */
    previewProfile: string | null;
    setPreviewProfile: (text: string | null) => void;
    /** The CV score, worked out in code 400ms after the last change. Null until the CV has loaded. */
    score: Score | null;
    /** Findings seen in this visit that are no longer found: fixed, or their line was switched off or removed. */
    cleared: Finding[];
    /** Points the tab for a place in the CV, opens its entry and queues its field for focus. Returns the tab to show. */
    locate: (at: Locator) => string;
    /** Set when the person came to the builder from the findings list, so they can go straight back. */
    fromFindings: boolean;
    setFromFindings: (v: boolean) => void;
  };

/** A value that follows another after it has stopped changing for a moment. */
function useSettled<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return settled;
}

const Ctx = createContext<Workspace | null>(null);

/**
 * Everything the screens of one CV share: the CV itself with its save state
 * and undo history, the paper, and where the person is working. It sits above
 * the tabs, so moving between them keeps all of it.
 */
export function CvWorkspace({ versionId, children }: { versionId: string; children: ReactNode }) {
  const c = useCv(versionId);
  const [inspect, setInspect] = useState<Locator | null>(null);
  const [previewProfile, setPreviewProfile] = useState<string | null>(null);
  // The paper shows the CV as it is, or with a profile the person is trying out.
  const shown = useMemo(() => (c.cv && previewProfile !== null ? { ...c.cv, sections: c.cv.sections.map((s) => (s.kind === "summary" ? { ...s, text: previewProfile, visible: true } : s)) } : c.cv), [c.cv, previewProfile]);
  const paper = usePaper(shown);
  const [focus, setFocus] = useState<Locator | null>(null);
  const [openEntry, setOpen] = useState<Record<string, string>>({});
  const [view, setView] = useState<"edit" | "paper">("edit");
  const [checks, setChecks] = useState<FileChecks | null>(null);
  const wanted = useRef<{ entry: string; field: string } | null>(null);
  const setOpenEntry = useCallback((sectionId: string, entryId: string) => setOpen((o) => ({ ...o, [sectionId]: entryId })), []);
  const [fromFindings, setFromFindings] = useState(false);

  // The checks run in code, 400ms after the last change. File checks count only for the CV exactly as it is now.
  const settled = useSettled(c.cv, 400);
  const now = useRef(new Date()).current;
  const pages = paper.paper?.layout.blocks.length ? paper.paper.layout.pages : undefined;
  const glyphs = paper.paper?.layout.missing;
  const current = !!checks && !!c.cv && checks.rev === c.cv.rev && c.save === "saved";
  const pdf = current ? checks?.pdf?.status : undefined;
  const docx = current ? checks?.docx?.status : undefined;
  const score = useMemo(() => (settled ? scoreCv({ cv: settled, pages, missingGlyphs: glyphs, files: { pdf, docx }, now }) : null), [settled, pages, glyphs, pdf, docx, now]);
  const seen = useRef(new Map<string, Finding>());
  const [cleared, setCleared] = useState<Finding[]>([]);
  useEffect(() => {
    if (!score) return;
    const live = new Set(score.findings.map((f) => f.id));
    for (const f of score.findings) seen.current.set(f.id, f);
    setCleared([...seen.current.values()].filter((f) => !live.has(f.id)));
  }, [score]);

  const cvNow = c.cv;
  const locate = useCallback(
    (at: Locator) => {
      if (!cvNow || at.section === "finish") return "finish";
      const field = fieldFor(cvNow, at);
      if (at.section !== "contact" && field.entry) setOpen((o) => ({ ...o, [at.section]: field.entry }));
      wanted.current = field;
      setView("edit");
      setFocus({ ...at });
      return tabFor(cvNow, at);
    },
    [cvNow],
  );
  const value = useMemo(
    () => ({ ...c, ...paper, versionId, focus, setFocus, openEntry, setOpenEntry, view, setView, wanted, checks, setChecks, inspect, setInspect, previewProfile, setPreviewProfile, score, cleared, locate, fromFindings, setFromFindings }),
    [c, paper, versionId, focus, openEntry, setOpenEntry, view, checks, inspect, previewProfile, score, cleared, locate, fromFindings],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace(): Workspace {
  const w = useContext(Ctx);
  if (!w) throw new Error("This screen must be inside a CV workspace.");
  return w;
}
