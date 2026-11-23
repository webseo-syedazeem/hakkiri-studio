"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CvDoc } from "@/lib/cv/schema";
import { ApiError, api } from "./client";

/** What the save indicator says. It reports what actually happened, never a hopeful guess. */
export type SaveState = "saved" | "saving" | "device" | "failed" | "conflict";

type Editable = Pick<CvDoc, "name" | "level" | "region" | "target" | "contact" | "sections" | "design">;
const KEYS: (keyof Editable)[] = ["name", "level", "region", "target", "contact", "sections", "design"];
const IDLE_MS = 800;
const draftKey = (id: string) => `hakkiri.cv.unsaved.${id}`;

/**
 * One CV, loaded and kept saved. Changes show at once and are saved after
 * 800ms without typing, and when the page is left. If a save fails, the
 * unsaved copy is kept on this device and offered back; if the CV was changed
 * in another tab, nothing is overwritten.
 */
export function useCv(id: string) {
  const [cv, setCv] = useState<CvDoc | null>(null);
  const [load, setLoad] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [save, setSave] = useState<SaveState>("saved");
  const latest = useRef<CvDoc | null>(null);
  const dirty = useRef(new Set<keyof Editable>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef(false);

  useEffect(() => {
    let live = true;
    setLoad("loading");
    api<{ cv: CvDoc }>(`/api/cv/versions/${id}`)
      .then(({ cv: loaded }) => {
        if (!live) return;
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

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const doc = latest.current;
    if (!doc || saving.current || dirty.current.size === 0) return;
    saving.current = true;
    setSave("saving");
    const sending = [...dirty.current];
    dirty.current.clear();
    const changes: Record<string, unknown> = {};
    for (const k of sending) changes[k] = k === "target" ? (doc.target ?? null) : doc[k];
    try {
      const { cv: saved } = await api<{ cv: CvDoc }>(`/api/cv/versions/${id}`, { method: "PATCH", json: { rev: doc.rev, saveId: crypto.randomUUID().slice(0, 36), ...changes }, keepalive: true });
      // Keep anything typed while the save was in flight; take the new revision.
      const now = latest.current!;
      const merged = { ...saved } as CvDoc;
      for (const k of dirty.current) (merged as unknown as Record<string, unknown>)[k] = now[k];
      latest.current = merged;
      setCv(merged);
      saving.current = false;
      if (dirty.current.size) schedule(IDLE_MS);
      else {
        localStorage.removeItem(draftKey(id));
        setSave("saved");
      }
    } catch (err) {
      saving.current = false;
      for (const k of sending) dirty.current.add(k);
      if (err instanceof ApiError && err.status === 409) {
        setSave("conflict");
        return;
      }
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

  /** Changes the CV. The screen updates at once; the save follows. */
  const update = useCallback(
    (changes: Partial<Editable>) => {
      const doc = latest.current;
      if (!doc) return;
      const next = { ...doc, ...changes } as CvDoc;
      latest.current = next;
      for (const k of KEYS) if (k in changes) dirty.current.add(k);
      setCv(next);
      setSave((s) => (s === "conflict" ? s : "saving"));
      schedule(IDLE_MS);
    },
    [schedule],
  );

  // Save when the tab is hidden or the page is left, without waiting for the pause.
  useEffect(() => {
    const now = () => void flush();
    const onVisibility = () => document.visibilityState === "hidden" && now();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", now);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", now);
      now();
    };
  }, [flush]);

  return { cv, load, save, update, flush, retry: () => schedule(0) };
}

export const SAVE_WORDS: Record<SaveState, string> = {
  saved: "Saved",
  saving: "Saving…",
  device: "Saved on this device",
  failed: "Couldn’t save",
  conflict: "Changed in another tab",
};
