"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type History, SNAPSHOT_KEYS, type Snapshot, emptyHistory, record, redo as redoStep, snapshotOf, undo as undoStep } from "@/lib/cv/edit";
import type { CvDoc, StoredFileCheck } from "@/lib/cv/schema";
import { ApiError, api } from "./client";

/** What the save indicator says. It reports what actually happened, never a hopeful guess. */
export type SaveState = "saved" | "saving" | "device" | "failed" | "conflict";

type Editable = Snapshot;
const KEYS = SNAPSHOT_KEYS;
const IDLE_MS = 800;
/** Browsers refuse a keepalive request over about 64 KB. Larger changes are sent the ordinary way. */
export const KEEPALIVE_MAX = 60_000;
/** The server answered and said no for a reason that trying again will not change. */
export const isRefusal = (status: number) => status === 400 || status === 413 || status === 422;
/** True when two values differ only in spacing: what the server tidies without changing what is said. */
const unspaced = (v: unknown) => JSON.stringify(v ?? null, (_k, x) => (typeof x === "string" ? x.replace(/\s+/g, "") : x));
export const sameButSpacing = (a: unknown, b: unknown) => unspaced(a) === unspaced(b);
/** True when the copy on the server was made by one of our own saves whose answer never arrived. */
export const isOwnSave = (lastSaveId: string | undefined, unanswered: ReadonlySet<string>) => !!lastSaveId && unanswered.has(lastSaveId);
const draftKey = (id: string) => `hakkiri.cv.unsaved.${id}`;

/** The field being typed in, if any: typing in one field is one step of Undo. */
function typingKey(): string {
  const el = typeof document === "undefined" ? null : document.activeElement;
  if (el instanceof HTMLTextAreaElement) return el.id || "textarea";
  if (el instanceof HTMLInputElement && !["checkbox", "radio", "button", "file", "range", "color"].includes(el.type)) return el.id || "input";
  return "";
}

/**
 * One CV, loaded and kept saved. Changes show at once and are saved after
 * 800ms without typing, when a field is left, and when the page is left. If a
 * save fails, the unsaved copy is kept on this device and offered back. If the
 * CV was changed somewhere else, nothing is overwritten: both copies are kept
 * until the person chooses. Every change can be undone and redone.
 */
export function useCv(id: string) {
  const [cv, setCv] = useState<CvDoc | null>(null);
  const [load, setLoad] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [save, setSave] = useState<SaveState>("saved");
  /** The copy saved somewhere else, while the person decides which to keep. */
  const [other, setOther] = useState<CvDoc | null>(null);
  const [steps, setSteps] = useState({ undo: 0, redo: 0 });
  /** Why the last save was refused, in the server's words. Empty when it was not. */
  const [saveError, setSaveError] = useState("");
  /** Said once after a save that stored something other than what was typed. */
  const [saveNote, setSaveNote] = useState("");
  /** A save has failed and none has succeeded since: the warning stays up while the next try is on its way. */
  const [troubled, setTroubled] = useState(false);
  /** How the CV's files read back when last checked, as loaded with the CV. Only for the revision it names. */
  const [files, setFiles] = useState<{ rev: number; pdf?: StoredFileCheck; docx?: StoredFileCheck } | null>(null);
  /** The last change sent and its name: the same change sent again keeps the name, so the server applies it once. */
  const lastTry = useRef<{ id: string; body: string } | null>(null);
  /** Saves whose answer never arrived. One of them may have reached the server. */
  const unanswered = useRef(new Set<string>());
  const latest = useRef<CvDoc | null>(null);
  const dirty = useRef(new Set<keyof Editable>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef(false);
  /** True while the person is choosing between this copy and one saved somewhere else: no save is tried until they choose. */
  const conflicted = useRef(false);
  const history = useRef<History>(emptyHistory());
  const setHistory = (h: History) => {
    history.current = h;
    setSteps({ undo: h.past.length, redo: h.future.length });
  };

  useEffect(() => {
    let live = true;
    setLoad("loading");
    api<{ cv: CvDoc; files?: { rev: number; pdf?: StoredFileCheck; docx?: StoredFileCheck } }>(`/api/cv/versions/${id}`)
      .then(({ cv: loaded, files: checked }) => {
        if (!live) return;
        setFiles(checked ?? null);
        // Edits that never reached the server last time are put back, if they were made on this revision.
        try {
          const kept = JSON.parse(localStorage.getItem(draftKey(id)) ?? "null") as { rev: number; changes: Partial<Editable> } | null;
          if (kept && kept.rev === loaded.rev) {
            loaded = { ...loaded, ...kept.changes };
            for (const k of Object.keys(kept.changes) as (keyof Editable)[]) dirty.current.add(k);
          } else localStorage.removeItem(draftKey(id));
        } catch {
          /* no stored copy */
        }
        latest.current = loaded;
        setCv(loaded);
        setLoad("ready");
        if (dirty.current.size) schedule(0);
      })
      .catch((err) => live && setLoad(err instanceof ApiError && err.status === 404 ? "missing" : "error"));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const flush = useCallback(async (opts?: { /** The page is being left: the request must outlive it. */ leaving?: boolean }) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const doc = latest.current;
    if (!doc || saving.current || conflicted.current || dirty.current.size === 0) return;
    saving.current = true;
    setSave("saving");
    const sending = [...dirty.current];
    dirty.current.clear();
    const changes: Record<string, unknown> = {};
    for (const k of sending) changes[k] = k === "target" || k === "letter" ? (doc[k] ?? null) : doc[k];
    const body = JSON.stringify(changes);
    const saveId = lastTry.current?.body === body ? lastTry.current.id : crypto.randomUUID().slice(0, 36);
    lastTry.current = { id: saveId, body };
    try {
      // A request that must outlive the page ("keepalive") is refused by the browser above about 64 KB, without
      // ever being sent. It is used only as the page is left, and only for a change small enough to go.
      const { cv: saved } = await api<{ cv: CvDoc }>(`/api/cv/versions/${id}`, { method: "PATCH", json: { rev: doc.rev, saveId, ...changes }, keepalive: opts?.leaving === true && body.length < KEEPALIVE_MAX });
      lastTry.current = null;
      unanswered.current.clear();
      setSaveError("");
      // Take the new revision, and leave what is on screen exactly as it was typed. The server tidies what it
      // stores (it trims a trailing space, say); putting that back mid-sentence would eat the space under the cursor.
      // But where what was stored differs from what was sent by more than spacing, the screen shows what was
      // stored: "Saved" must never sit beside text that is not what was saved.
      const now = latest.current!;
      const merged = { ...saved } as CvDoc;
      let adjusted = false;
      for (const k of KEYS) {
        const untouched = now[k] === doc[k];
        if (sending.includes(k) && untouched && !sameButSpacing(now[k], saved[k])) adjusted = true;
        else (merged as unknown as Record<string, unknown>)[k] = now[k];
      }
      latest.current = merged;
      setCv(merged);
      setSaveNote(adjusted ? "Some of what you typed could not be kept exactly as typed. The page now shows what was saved." : "");
      saving.current = false;
      setTroubled(false);
      if (dirty.current.size) schedule(IDLE_MS);
      else {
        localStorage.removeItem(draftKey(id));
        setSave("saved");
      }
    } catch (err) {
      saving.current = false;
      for (const k of sending) dirty.current.add(k);
      if (err instanceof ApiError && err.status === 409) {
        const theirs = (err.body.cv as CvDoc | undefined) ?? null;
        // The copy on the server is our own earlier save, whose answer was lost on the way back. Nothing was
        // changed somewhere else: carry on from its revision and send what has been typed since.
        if (theirs && isOwnSave(theirs.lastSaveId, unanswered.current)) {
          unanswered.current.clear();
          lastTry.current = null;
          latest.current = { ...latest.current!, rev: theirs.rev };
          setCv(latest.current);
          schedule(0);
          return;
        }
        conflicted.current = true;
        setOther(theirs);
        setSave("conflict");
        return;
      }
      setTroubled(true);
      // Signed out (the session ended, or cookies were cleared). Saving again will not work until they sign in.
      if (err instanceof ApiError && err.status === 401) {
        try {
          const now = latest.current!;
          const kept: Record<string, unknown> = {};
          for (const k of dirty.current) kept[k] = now[k];
          localStorage.setItem(draftKey(id), JSON.stringify({ rev: now.rev, changes: kept }));
        } catch {
          /* the screen still holds it */
        }
        setSaveError("You’ve been signed out. Sign in again to save. What you typed is kept on this device and will be offered back.");
        setSave("failed");
        return;
      }
      // The server read the change and refused it (too long, too many). Trying again will not help, so the person
      // is told why. What they typed stays on the screen and on this device.
      if (err instanceof ApiError && isRefusal(err.status)) {
        try {
          const now = latest.current!;
          const kept: Record<string, unknown> = {};
          for (const k of dirty.current) kept[k] = now[k];
          localStorage.setItem(draftKey(id), JSON.stringify({ rev: now.rev, changes: kept }));
        } catch {
          /* the screen still holds it */
        }
        setSaveError(err.message);
        setSave("failed");
        return;
      }
      // No answer at all: the change may or may not have arrived.
      if (err instanceof ApiError && err.status === 0) unanswered.current.add(saveId);
      // Nothing is lost: the unsaved changes stay on this device until a save goes through.
      const now = latest.current!;
      const kept: Record<string, unknown> = {};
      for (const k of dirty.current) kept[k] = now[k];
      try {
        localStorage.setItem(draftKey(id), JSON.stringify({ rev: now.rev, changes: kept }));
        setSave("device");
      } catch {
        setSave("failed");
      }
    }
  }, [id]);

  const schedule = useCallback(
    (ms: number) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), ms);
    },
    [flush],
  );

  /** Puts a set of values in place, marks what changed for saving, and shows it at once. */
  const put = useCallback(
    (values: Partial<Editable>) => {
      const doc = latest.current;
      if (!doc) return;
      const next = { ...doc, ...values } as CvDoc;
      for (const k of KEYS) if (k in values && values[k] !== doc[k]) dirty.current.add(k);
      latest.current = next;
      setCv(next);
      setSave((s) => (s === "conflict" ? s : "saving"));
      schedule(IDLE_MS);
    },
    [schedule],
  );

  /** Changes the CV. The screen updates at once; the save follows. Each change is a step that can be undone. */
  const update = useCallback(
    (changes: Partial<Editable>) => {
      const doc = latest.current;
      if (!doc) return;
      setHistory(record(history.current, doc, typingKey(), Date.now()));
      put(changes);
    },
    [put],
  );

  const undo = useCallback(() => {
    const doc = latest.current;
    const step = doc && undoStep(history.current, doc);
    if (!step) return false;
    setHistory(step.history);
    put(step.snapshot);
    return true;
  }, [put]);

  const redo = useCallback(() => {
    const doc = latest.current;
    const step = doc && redoStep(history.current, doc);
    if (!step) return false;
    setHistory(step.history);
    put(step.snapshot);
    return true;
  }, [put]);

  /** The CV was changed somewhere else: keep this copy. Only what was changed here replaces the other copy. */
  const keepMine = useCallback(() => {
    const doc = latest.current;
    if (!doc || !other) return;
    const merged = { ...other } as CvDoc;
    for (const k of dirty.current) (merged as unknown as Record<string, unknown>)[k] = doc[k];
    latest.current = merged;
    setCv(merged);
    setOther(null);
    conflicted.current = false;
    setSave("saving");
    schedule(0);
  }, [other, schedule]);

  /** The CV was changed somewhere else: take that copy and drop the changes made here. */
  const takeTheirs = useCallback(() => {
    if (!other) return;
    dirty.current.clear();
    conflicted.current = false;
    latest.current = other;
    setCv(other);
    setOther(null);
    setHistory(emptyHistory());
    try {
      localStorage.removeItem(draftKey(id));
    } catch {
      /* nothing stored */
    }
    setSave("saved");
  }, [other, id]);

  /** The CV was changed somewhere else: keep this copy as a new CV of its own, and leave the other as it is. Returns the new CV's id. */
  const saveSeparate = useCallback(async () => {
    const doc = latest.current;
    if (!doc || !other) return "";
    const mine = snapshotOf(doc);
    const changes: Record<string, unknown> = {};
    for (const k of dirty.current) changes[k] = k === "target" || k === "letter" ? (mine[k] ?? null) : mine[k];
    const made = await api<{ id: string }>(`/api/cv/versions/${id}/duplicate`, { method: "POST", json: { changes } });
    takeTheirs();
    return made.id;
  }, [other, id, takeTheirs]);

  /**
   * Waits until everything typed has reached the server. Resolves false if it
   * cannot be saved (offline, or changed somewhere else): a file must never be
   * made from an older copy than the one on screen.
   */
  const settle = useCallback(async () => {
    for (let i = 0; i < 80; i++) {
      await flush();
      if (!saving.current && dirty.current.size === 0) return true;
      if (!saving.current) return false;
      await new Promise((r) => setTimeout(r, 100));
    }
    return false;
  }, [flush]);

  // Save when the tab is hidden or the page is left, without waiting for the pause. And as soon as the
  // connection comes back, send what was kept on this device while it was away.
  useEffect(() => {
    const now = () => void flush({ leaving: true });
    const onVisibility = () => document.visibilityState === "hidden" && now();
    const onOnline = () => void flush();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", now);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", now);
      window.removeEventListener("online", onOnline);
      now();
    };
  }, [flush]);

  return { cv, load, save, saveError, saveNote, troubled, files, update, flush, settle, retry: () => schedule(0), undo, redo, canUndo: steps.undo > 0, canRedo: steps.redo > 0, other, keepMine, takeTheirs, saveSeparate };
}

export const SAVE_WORDS: Record<SaveState, string> = {
  saved: "Saved",
  saving: "Saving…",
  device: "Saved on this device",
  failed: "Couldn’t save",
  conflict: "Changed somewhere else",
};
