"use client";

import { type ReactNode, createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { Locator } from "@/lib/cv/schema";
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
  };

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
  const value = useMemo(
    () => ({ ...c, ...paper, versionId, focus, setFocus, openEntry, setOpenEntry, view, setView, wanted, checks, setChecks, inspect, setInspect, previewProfile, setPreviewProfile }),
    [c, paper, versionId, focus, openEntry, setOpenEntry, view, checks, inspect, previewProfile],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace(): Workspace {
  const w = useContext(Ctx);
  if (!w) throw new Error("This screen must be inside a CV workspace.");
  return w;
}
