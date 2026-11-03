"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonClass } from "@/components/ui";

type Retention = 30 | 90 | 365 | 0;
const OPTIONS: { value: Retention; label: string }[] = [
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 365, label: "1 year" },
  { value: 0, label: "Until I delete them" },
];

/** "Keep recordings for": older recordings are deleted as soon as you shorten it. */
export function RetentionSetting({ initial }: { initial: Retention }) {
  const [value, setValue] = useState<Retention>(initial);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const change = async (v: Retention) => {
    setValue(v);
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ retentionDays: v }) });
      if (!res.ok) throw new Error();
      const { removed } = (await res.json()) as { removed: number };
      setNote(removed ? `Saved. ${removed} older recording${removed === 1 ? " was" : "s were"} deleted.` : "Saved.");
      router.refresh();
    } catch {
      setNote("That didn’t save. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label htmlFor="retention" className="text-[13px] font-semibold">
        Keep recordings of your answers for
      </label>
      <div className="mt-2 flex items-center gap-3">
        <select
          id="retention"
          value={value}
          disabled={busy}
          onChange={(e) => void change(Number(e.target.value) as Retention)}
          className="h-[38px] rounded-[9px] bg-panel-2 px-3 text-sm text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span role="status" className="text-[13px] text-muted">
          {note}
        </span>
      </div>
      <p className="mt-2 text-[13px] leading-normal text-muted">Only the audio is deleted. Your transcripts, scores and reports stay until you delete them.</p>
    </div>
  );
}

const DANGER_OUTLINE =
  "inline-flex h-[42px] items-center rounded-[10px] px-[18px] text-sm font-semibold text-red-soft shadow-[inset_0_0_0_1px_rgb(255_92_97/0.45)] hover:bg-red/10 disabled:pointer-events-none disabled:opacity-50";
const DANGER = "inline-flex h-[38px] items-center rounded-[9px] bg-red px-4 text-sm font-semibold text-booth hover:bg-red-soft disabled:pointer-events-none disabled:opacity-50";

/** Download a copy of everything, or delete everything (typed confirmation). */
export function DataButtons({ hasData }: { hasData: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [state, setState] = useState<"idle" | "deleting" | "done" | "failed">("idle");
  const router = useRouter();

  const remove = async () => {
    setState("deleting");
    try {
      const res = await fetch("/api/data/delete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm: "delete" }) });
      if (!res.ok) throw new Error();
      setState("done");
      setConfirming(false);
      setTyped("");
      router.refresh();
    } catch {
      setState("failed");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5">
        <a href="/api/data/export" download className={buttonClass("secondary", "md")}>
          Download my data
        </a>
        {!confirming && (
          <button type="button" onClick={() => setConfirming(true)} disabled={!hasData} className={DANGER_OUTLINE}>
            Delete all my data
          </button>
        )}
      </div>
      <p className="mt-2 text-[13px] text-muted">The download is a zip: your interviews, answers, scores and presentations as one file, plus your recordings.</p>
      {confirming && (
        <div className="mt-4 rounded-[12px] bg-red/10 px-4 py-4 shadow-[inset_0_0_0_1px_rgb(255_92_97/0.3)]">
          <p className="text-sm font-semibold text-red-soft">This deletes everything and can’t be undone.</p>
          <p className="mt-1 text-[13px] text-muted">Your interviews, CV and job spec text, questions, answers, recordings, reports, stories and presentations. Download a copy first if you might want it.</p>
          <label htmlFor="confirm-delete" className="mt-3 block text-[13px] font-semibold">
            Type <b>delete</b> to confirm
          </label>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <input
              id="confirm-delete"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className="h-[38px] w-[180px] rounded-[9px] bg-panel-2 px-3 text-sm text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
            />
            <button type="button" onClick={() => void remove()} disabled={typed.trim().toLowerCase() !== "delete" || state === "deleting"} className={DANGER}>
              {state === "deleting" ? "Deleting…" : "Delete everything"}
            </button>
            <Button variant="ghost" onClick={() => (setConfirming(false), setTyped(""))}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      <p role="status" className="mt-2 text-[13px]">
        {state === "done" && <span className="text-blue-soft">All your data is deleted.</span>}
        {state === "failed" && <span className="text-red-soft">That didn’t work. Nothing was deleted. Try again.</span>}
      </p>
    </div>
  );
}
