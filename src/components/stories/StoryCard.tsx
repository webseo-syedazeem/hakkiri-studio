"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button, ButtonLink, Icon, Panel } from "@/components/ui";
import type { BankStory } from "@/lib/stories/bank";
import { PART_ORDER, THEMES, type Part } from "@/lib/stories/themes";

const PART_LABEL: Record<Part, string> = { situation: "Situation", task: "Task", action: "Action", result: "Result" };
const PART_PROMPT: Record<Part, string> = {
  situation: "What was happening? Where you were and what the problem was.",
  task: "What did you need to achieve? Your part, not the team’s.",
  action: "What did you do? Say “I”: what you decided, said or built.",
  result: "What changed? The outcome, with a number if you have one.",
};

const field = "w-full resize-none rounded-[10px] bg-panel-2 px-3.5 py-2.5 text-sm outline-none shadow-[inset_0_0_0_1px_var(--color-line-strong)] placeholder:text-dim focus:shadow-[inset_0_0_0_1px_var(--color-blue)]";

/** One story in the bank: its parts, what it covers, how often you use it, and fill in the gaps or practise it. */
export function StoryCard({ story, answers, micOk, delay }: { story: BankStory; answers: number; micOk: boolean; delay: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [parts, setParts] = useState<Record<Part, string>>({ situation: "", task: "", action: "", result: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lean = story.uses >= 3 && answers > 0 && story.uses / answers >= 0.4;
  const practiseHref = story.practise ? `/mock/${story.practise.interviewId}?q=${story.practise.questionId}` : null;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stories", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: story.key, parts }) });
      const json = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(json.message ?? "Your story couldn’t be saved. Try again.");
      setOpen(false);
      setParts({ situation: "", task: "", action: "", result: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your story couldn’t be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel aria-label={story.title} className="animate-rise px-6 py-5" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold leading-snug tracking-[-0.01em]">{story.title}</h2>
          <div className="mt-0.5 text-[13px] text-muted">
            {story.source}
            {story.interviews.length > 0 && <> · from {story.interviews.map((i) => i.company).join(", ")}</>}
          </div>
        </div>
        <div className="flex shrink-0 gap-1" aria-label={`Solid parts: ${PART_ORDER.filter((p) => story.parts[p]).join(", ") || "none"}`}>
          {PART_ORDER.map((p) => (
            <span
              key={p}
              title={`${PART_LABEL[p]}: ${story.parts[p] ? "solid" : "missing"}`}
              className={clsx("flex h-7 w-7 items-center justify-center rounded-[7px] text-xs font-bold", story.parts[p] ? "bg-blue/20 text-blue-soft" : "bg-red/12 text-red-soft shadow-[inset_0_0_0_1px_rgb(255_120_120/0.35)]")}
            >
              {PART_LABEL[p][0]}
            </span>
          ))}
        </div>
      </div>

      {story.themes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {story.themes.map((t) => (
            <span key={t} className="inline-flex h-[24px] items-center rounded-[7px] bg-panel-2 px-2.5 text-xs font-semibold text-lilac shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
              {THEMES.find((x) => x.id === t)?.label}
            </span>
          ))}
        </div>
      )}
      {story.useFor.length > 0 && <p className="mt-2.5 text-[13px] text-muted">Fits: {story.useFor.join("; ")}</p>}
      {story.text && <p className="mt-2.5 text-sm leading-relaxed">{story.text}</p>}

      {(story.missing.length > 0 || lean || story.uses > 0) && (
        <div className="mt-3 space-y-1.5">
          {story.missing.length > 0 && (
            <div className="flex items-start gap-2 text-[13px] text-red-soft">
              <Icon name="flag" size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
              <span>
                No {story.missing.map((p) => PART_LABEL[p].toLowerCase()).join(" or ")} yet.{" "}
                <span className="text-muted">{story.missing.includes("result") ? "Without a result, interviewers ask “so what happened?” and the story loses its point." : "Interviewers will ask for it, so have a line ready."}</span>
              </span>
            </div>
          )}
          {story.uses > 0 && (
            <div className={clsx("flex items-start gap-2 text-[13px]", lean ? "text-lilac" : "text-muted")}>
              <Icon name="repeat" size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
              <span>
                Seems to come up in {story.uses} of your {answers} answer{answers === 1 ? "" : "s"}.
                {lean && " You lean on this one: try a different story for some questions, so the interviewer hears your range."}
              </span>
            </div>
          )}
        </div>
      )}

      {open && (
        <div className="mt-4 space-y-3 rounded-[12px] bg-panel-2/60 p-4 shadow-[inset_0_0_0_1px_var(--color-line)]">
          {[...story.missing, ...PART_ORDER.filter((p) => !story.missing.includes(p))].map((p) => (
            <div key={p}>
              <label htmlFor={`${story.key}-${p}`} className="text-[13px] font-semibold">
                {PART_LABEL[p]}
                {story.parts[p] ? <span className="font-normal text-muted"> (in your CV already: add a line if you like)</span> : <span className="font-normal text-red-soft"> (missing)</span>}
              </label>
              <textarea id={`${story.key}-${p}`} rows={2} maxLength={800} className={clsx(field, "mt-1.5")} placeholder={PART_PROMPT[p]} value={parts[p]} onChange={(e) => setParts({ ...parts, [p]: e.target.value })} />
            </div>
          ))}
          {error && (
            <p role="alert" className="text-[13px] text-red-soft">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-dim">Hakkiri puts it in order, result first, using only your words.</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={() => void save()} disabled={busy || !Object.values(parts).some((v) => v.trim().length >= 5)}>
                {busy ? "Saving…" : "Save story"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!open && (
        <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-line pt-3.5">
          <Button size="sm" onClick={() => setOpen(true)}>
            {story.missing.length ? "Fill in the gaps" : "Improve it"}
          </Button>
          {practiseHref && (
            <ButtonLink href={micOk ? practiseHref : `/mic-check?next=${encodeURIComponent(practiseHref)}`} size="sm" variant="primary" title={story.practise?.text}>
              <Icon name="mic" size={15} strokeWidth={2} />
              Practise it
            </ButtonLink>
          )}
        </div>
      )}
    </Panel>
  );
}
