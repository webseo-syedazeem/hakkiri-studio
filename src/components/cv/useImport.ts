"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CvImport } from "@/lib/cv/import/record";
import type { CvDoc } from "@/lib/cv/schema";
import { ApiError, api } from "./client";

type Change = Partial<Pick<CvImport, "draft" | "reviewed">> & { flags?: { id: string; state: CvImport["flags"][number]["state"] }[]; unassigned?: { id: string; state: CvImport["unassigned"][number]["state"] }[] };

/**
 * One upload being checked, with the CV it is for. Corrections show at once
 * and are saved after a short pause; `flush` saves straight away, before
 * moving to the next step.
 */
export function useImport(id: string) {
  const [imp, setImp] = useState<CvImport | null>(null);
  const [cv, setCv] = useState<CvDoc | null>(null);
  const [load, setLoad] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [save, setSave] = useState<"saved" | "saving" | "failed">("saved");
  const latest = useRef<CvImport | null>(null);
  const pending = useRef<Change>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reload = useCallback(async () => {
    try {
      const { import: loaded } = await api<{ import: CvImport }>(`/api/cv/imports/${id}`);
      const { cv: doc } = await api<{ cv: CvDoc }>(`/api/cv/versions/${loaded.versionId}`);
      latest.current = loaded;
      setImp(loaded);
      setCv(doc);
      setLoad("ready");
    } catch (err) {
      setLoad(err instanceof ApiError && err.status === 404 ? "missing" : "error");
    }
  }, [id]);
  useEffect(() => void reload(), [reload]);

  const flush = useCallback(async (): Promise<boolean> => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const sending = pending.current;
    if (Object.keys(sending).length === 0) return true;
    pending.current = {};
    setSave("saving");
    try {
      await api(`/api/cv/imports/${id}`, { method: "PATCH", json: sending });
      if (Object.keys(pending.current).length === 0) setSave("saved");
      return true;
    } catch {
      // Put the unsent changes back so the next save carries them.
      pending.current = { ...sending, ...pending.current, flags: [...(sending.flags ?? []), ...(pending.current.flags ?? [])], unassigned: [...(sending.unassigned ?? []), ...(pending.current.unassigned ?? [])] };
      setSave("failed");
      return false;
    }
  }, [id]);

  const change = useCallback(
    (c: Change) => {
      const cur = latest.current;
      if (!cur) return;
      const flagState = new Map((c.flags ?? []).map((f) => [f.id, f.state]));
      const textState = new Map((c.unassigned ?? []).map((u) => [u.id, u.state]));
      const next: CvImport = {
        ...cur,
        draft: c.draft ?? cur.draft,
        reviewed: c.reviewed ?? cur.reviewed,
        flags: cur.flags.map((f) => ({ ...f, state: flagState.get(f.id) ?? f.state })),
        unassigned: cur.unassigned.map((u) => ({ ...u, state: textState.get(u.id) ?? u.state })),
      };
      latest.current = next;
      setImp(next);
      const p = pending.current;
      pending.current = { ...p, ...(c.draft ? { draft: c.draft } : {}), ...(c.reviewed ? { reviewed: c.reviewed } : {}), flags: [...(p.flags ?? []).filter((f) => !flagState.has(f.id)), ...(c.flags ?? [])], unassigned: [...(p.unassigned ?? []).filter((u) => !textState.has(u.id)), ...(c.unassigned ?? [])] };
      setSave("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 600);
    },
    [flush],
  );

  useEffect(() => () => void flush(), [flush]);

  return { imp, cv, load, save, change, flush, reload };
}
