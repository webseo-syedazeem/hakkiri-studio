"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon, Panel } from "@/components/ui";
import { Segmented } from "@/components/ui/Segmented";
import { useDialogFocus } from "@/components/ui/useDialogFocus";
import type { QuestionGroup } from "@/lib/types";

const GROUPS: { value: QuestionGroup; label: string }[] = [
  { value: "cv", label: "Experience" },
  { value: "competency", label: "Skills" },
  { value: "technical", label: "Technical" },
  { value: "motivation", label: "Motivation" },
  { value: "curveball", label: "Situational" },
];

/** "Add your own question": a question you expect, added to your plan so you can practise it. */
export function AddQuestion({ interviewId }: { interviewId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [group, setGroup] = useState<QuestionGroup>("competency");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialog = useDialogFocus<HTMLElement>(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/questions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ interviewId, text, group }) }).catch(() => null);
    const json = (await res?.json().catch(() => ({}))) as { message?: string } | undefined;
    setBusy(false);
    if (!res?.ok) return setError(json?.message ?? "That question couldn’t be added. Try again.");
    setOpen(false);
    setText("");
    router.refresh();
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-[13px] font-semibold text-blue-soft hover:underline">
        Add your own question
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-6" onClick={() => setOpen(false)}>
          <Panel ref={dialog} role="dialog" aria-modal="true" aria-label="Add your own question" className="w-full max-w-[560px] animate-rise bg-panel px-6 py-5" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={add}>
              <h2 className="text-lg font-semibold tracking-[-0.01em]">Add your own question</h2>
              <p className="mt-1 text-sm text-muted">A question you expect, or one a recruiter mentioned. Your next interview includes it, in its category.</p>
              <label htmlFor="q-text" className="mt-4 block text-[13px] font-semibold">
                The question
              </label>
              <textarea
                id="q-text"
                autoFocus
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="For example: Tell me about a time you had to say no to a senior stakeholder."
                className="mt-2 w-full resize-none rounded-[10px] bg-panel-2 px-3.5 py-3 text-sm outline-none shadow-[inset_0_0_0_1px_var(--color-line-strong)] placeholder:text-dim focus:shadow-[inset_0_0_0_1px_var(--color-blue)]"
              />
              <div className="mt-4 text-[13px] font-semibold">Which category?</div>
              <div className="mt-2">
                <Segmented label="Question category" value={group} onChange={setGroup} options={GROUPS} />
              </div>
              <p className="mt-2 text-[13px] text-muted">The category sets how it’s scored: a skills question expects a full example, a technical one gets thinking time.</p>
              {error && (
                <p role="alert" className="mt-3 text-[13px] text-red-soft">
                  {error}
                </p>
              )}
              <div className="mt-5 flex gap-2.5">
                <Button type="submit" variant="primary" disabled={busy || text.trim().length < 8}>
                  <Icon name="plus" size={16} strokeWidth={2} />
                  {busy ? "Adding…" : "Add it"}
                </Button>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </>
  );
}

/** Removes a question you added. */
export function RemoveQuestion({ interviewId, id }: { interviewId: string; id: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Remove this question"
      title="Remove this question"
      onClick={async () => {
        await fetch(`/api/questions?interviewId=${encodeURIComponent(interviewId)}&id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => null);
        router.refresh();
      }}
      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-dim hover:bg-white/[0.06] hover:text-ink"
    >
      <Icon name="x" size={14} strokeWidth={2} />
    </button>
  );
}
