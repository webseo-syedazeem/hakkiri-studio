"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button, ButtonLink, Icon, Panel } from "@/components/ui";
import type { Story } from "@/lib/types";

const PROMPTS = [
  { key: "situation", label: "What was happening?", hint: "Where you were and what the problem was. One or two sentences.", placeholder: "Our biggest client was threatening to leave after two late deliveries." },
  { key: "task", label: "What did you need to achieve?", hint: "Your part in it, not the team’s.", placeholder: "I had to keep the account and agree a delivery plan within a week." },
  { key: "action", label: "What did you do?", hint: "Say “I”: what you decided, said or built. This is the part interviewers care about most.", placeholder: "I called their operations lead, admitted the miss, and proposed weekly check-ins…" },
  { key: "result", label: "What changed?", hint: "The outcome, with a number if you have one. It’s fine if it isn’t perfect.", placeholder: "They renewed for two years, and late deliveries dropped from 6 to 1 a quarter." },
] as const;

type Parts = Record<(typeof PROMPTS)[number]["key"], string>;

const field = "w-full resize-none rounded-[10px] bg-panel-2 px-3.5 py-3 text-sm outline-none shadow-[inset_0_0_0_1px_var(--color-line-strong)] placeholder:text-dim focus:shadow-[inset_0_0_0_1px_var(--color-blue)]";

/**
 * The story builder: four quick prompts, then Hakkiri drafts the story in
 * your words (result first, about 90 seconds spoken). You say it once to the
 * interviewer, and it's saved to your stories and your prep sheet.
 */
export function StoryBuilder({ interviewId, skill, question, micOk, backHref }: { interviewId: string; skill: string; question: string; micOk: boolean; backHref?: string }) {
  const router = useRouter();
  const [parts, setParts] = useState<Parts>({ situation: "", task: "", action: "", result: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ story: Story; practiseHref: string } | null>(null);

  async function draft() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/stories`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ skill, question, parts }) });
      const json = (await res.json().catch(() => ({}))) as { story?: Story; practiseHref?: string; message?: string };
      if (!res.ok || !json.story || !json.practiseHref) throw new Error(json.message ?? "Your story couldn’t be drafted. Try again.");
      setDone({ story: json.story, practiseHref: json.practiseHref });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your story couldn’t be drafted.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const say = micOk ? done.practiseHref : `/mic-check?next=${encodeURIComponent(done.practiseHref)}`;
    return (
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-5">
        <Panel aria-label="Your story" className="animate-rise px-6 py-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-blue-soft">
            <Icon name="check" size={14} strokeWidth={2.6} />
            Saved to your stories and your prep sheet
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.015em]">{done.story.title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed">{done.story.text}</p>
          {done.story.useFor && done.story.useFor.length > 0 && <p className="mt-3 text-[13px] text-muted">Use it for: {done.story.useFor.join("; ")}</p>}
        </Panel>
        <Panel className="animate-rise px-6 py-5 [animation-delay:0.05s]">
          <h2 className="text-[15px] font-semibold">Now say it once</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">The interviewer asks “{question}” and you tell this story out loud, in your own words. You don’t need it word for word.</p>
          <Button variant="primary" size="lg" className="mt-4 w-full" onClick={() => router.push(say)}>
            <Icon name="mic" size={17} strokeWidth={2} />
            Say it once
          </Button>
          <ButtonLink href={backHref ?? `/interviews/${interviewId}`} className="mt-2 w-full">
            Later
          </ButtonLink>
        </Panel>
      </div>
    );
  }

  const ready = parts.action.trim().length >= 10;
  return (
    <div className="mt-5 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-5">
      <Panel aria-label="Four quick prompts" className="animate-rise px-6 py-5">
        {PROMPTS.map((p, k) => (
          <div key={p.key} className={clsx("grid grid-cols-[30px_minmax(0,1fr)] gap-3 py-3.5", k > 0 && "border-t border-line")}>
            <span className="num flex h-[26px] w-[26px] items-center justify-center rounded-full bg-panel-2 text-[13px] font-semibold shadow-[inset_0_0_0_1px_var(--color-line-strong)]">{k + 1}</span>
            <div className="min-w-0">
              <label htmlFor={`story-${p.key}`} className="text-[15px] font-semibold">
                {p.label}
              </label>
              <p className="mt-0.5 text-[13px] text-muted">{p.hint}</p>
              <textarea id={`story-${p.key}`} rows={2} maxLength={800} className={clsx(field, "mt-2")} placeholder={p.placeholder} value={parts[p.key]} onChange={(e) => setParts({ ...parts, [p.key]: e.target.value })} />
            </div>
          </div>
        ))}
      </Panel>
      <Panel className="animate-rise px-6 py-5 [animation-delay:0.05s]">
        <h2 className="text-[15px] font-semibold">The question it answers</h2>
        <p className="mt-1 text-[15px] leading-relaxed">“{question}”</p>
        <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-muted">
          Hakkiri puts your four answers in the order interviewers want: the result first, then how you got there. Only your facts: nothing is added.
        </p>
        {error && (
          <p role="alert" className="mt-2 text-[13px] text-red-soft">
            {error}
          </p>
        )}
        <Button variant="primary" size="lg" className="mt-4 w-full" disabled={!ready || busy} onClick={() => void draft()}>
          {busy ? "Drafting your story…" : "Draft my story"}
        </Button>
        {!ready && <p className="mt-2 text-xs text-dim">Fill in what you did, at least.</p>}
      </Panel>
    </div>
  );
}
