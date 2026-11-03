"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button, Icon, Panel } from "@/components/ui";
import { Segmented } from "@/components/ui/Segmented";
import { DocField } from "./InterviewSetup";
import type { ReadDoc } from "./read-docs";
import type { QuestionGroup, RoleUnderstanding } from "@/lib/types";
import { CATEGORY_ORDER, categoryLabel } from "@/lib/interviews/settings";

type Rethought = { before: RoleUnderstanding; after: RoleUnderstanding; rules: string[]; by: "model" | "rules"; attempt: number };

const input = "w-full rounded-[9px] bg-panel-2 px-3 py-2 text-sm outline-none shadow-[inset_0_0_0_1px_var(--color-line-strong)] placeholder:text-dim focus:shadow-[inset_0_0_0_1px_var(--color-blue)]";

function Row({ label, was, isChanged, showWas, children }: { label: string; was: string; isChanged: boolean; showWas: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-4 border-t border-line py-3 first-of-type:border-t-0">
      <div className="pt-2 text-[13px] font-semibold">
        {label}
        {isChanged && <span className="ml-2 rounded-[5px] bg-blue/20 px-1.5 py-0.5 text-[11px] font-bold text-blue-soft">Changed</span>}
      </div>
      <div className="min-w-0">
        {children}
        {isChanged && showWas && <div className="mt-1 text-xs text-dim line-through decoration-white/30">Before: {was}</div>}
      </div>
    </div>
  );
}

/**
 * The rebuild loop after "Something's wrong" (and "Not right? Edit it"):
 * 1. Hakkiri rereads your documents with your feedback,
 * 2. shows what changed in its understanding, which you confirm or edit,
 * 3. rebuilds the questions with your feedback as rules, and
 * 4. starts a fresh interview with your full time.
 * On a second rebuild it asks you to check your documents, with a way out:
 * the standard questions for your job title while you sort them.
 */
export function RebuildFlow({
  interviewId,
  sessionId,
  current,
  rules: initialRules,
  attempt,
  micOk,
  company,
}: {
  interviewId: string;
  /** The stopped interview, after "Something's wrong"; absent when editing from the overview. */
  sessionId?: string;
  current: RoleUnderstanding;
  rules: string[];
  /** Which rebuild this is for the interview: 1 the first, 2 or more and Hakkiri asks you to check your documents. */
  attempt: number;
  micOk: boolean;
  company: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"reading" | "ready" | "rebuilding" | "error">(sessionId ? "reading" : "ready");
  const [before, setBefore] = useState<RoleUnderstanding>(current);
  const [u, setU] = useState<RoleUnderstanding>(current);
  const [rules, setRules] = useState<string[]>(initialRules);
  const [newRule, setNewRule] = useState("");
  const [by, setBy] = useState<"model" | "rules" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cv, setCv] = useState<ReadDoc | null>(null);
  const [job, setJob] = useState<ReadDoc | null>(null);
  const [docProblem, setDocProblem] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);
  const [tries, setTries] = useState(0);
  const checkDocs = Boolean(sessionId) && attempt >= 2;

  useEffect(() => {
    if (!sessionId) return;
    let live = true;
    (async () => {
      try {
        const res = await fetch(`/api/interviews/${interviewId}/rethink`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId }) });
        const json = (await res.json().catch(() => ({}))) as Partial<Rethought> & { message?: string };
        if (!res.ok || !json.after) throw new Error(json.message ?? "Hakkiri couldn’t reread the job. Try again.");
        if (!live) return;
        setBefore(json.before!);
        setU(json.after);
        setRules((r) => [...new Set([...r, ...(json.rules ?? [])])]);
        setBy(json.by ?? null);
        setPhase("ready");
      } catch (err) {
        if (!live) return;
        setError(err instanceof Error ? err.message : "Hakkiri couldn’t reread the job.");
        setPhase("error");
      }
    })();
    return () => {
      live = false;
    };
  }, [interviewId, sessionId, tries]);

  useEffect(() => {
    if (phase !== "rebuilding") return setSlow(false);
    const t = setTimeout(() => setSlow(true), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  const changed = (k: "role" | "level" | "field" | "technicalLabel") => before[k].trim() !== u[k].trim();
  const meaningChanged = (g: QuestionGroup) => before.meanings[g].trim() !== u.meanings[g].trim();
  const anyChange = (["role", "level", "field", "technicalLabel"] as const).some(changed) || CATEGORY_ORDER.some(meaningChanged);

  async function rebuild(opts: { start: boolean; templates?: boolean }) {
    setPhase("rebuilding");
    setError(null);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/rebuild`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          understanding: u,
          rules,
          start: opts.start,
          templates: opts.templates,
          cv: cv ? { text: cv.text, label: cv.name } : undefined,
          job: job ? { text: job.text, label: job.name } : undefined,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { href?: string; message?: string };
      if (!res.ok || !json.href) throw new Error(json.message ?? "Your questions couldn’t be rebuilt. Try again.");
      const go = json.href.startsWith("/mock/") && !micOk ? `/mic-check?next=${encodeURIComponent(json.href)}` : json.href;
      router.push(go);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your questions couldn’t be rebuilt.");
      setPhase("ready");
    }
  }

  if (phase === "reading") {
    return (
      <Panel className="mt-5 max-w-[760px] animate-rise px-6 py-6" aria-busy="true">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 animate-rec rounded-full bg-blue" />
          <h2 className="text-[15px] font-semibold">Rereading your documents with your feedback…</h2>
        </div>
        <p className="mt-1.5 pl-[22px] text-sm text-muted">Your CV, the job spec and {company}’s website, against what you said was wrong. This takes a few seconds.</p>
      </Panel>
    );
  }

  if (phase === "error") {
    return (
      <Panel className="mt-5 max-w-[760px] animate-rise px-6 py-5">
        <p role="alert" className="text-sm text-red-soft">
          {error}
        </p>
        <div className="mt-3 flex gap-2.5">
          <Button
            variant="primary"
            onClick={() => {
              setPhase("reading");
              setTries((n) => n + 1);
            }}
          >
            Try again
          </Button>
          <Button onClick={() => setPhase("ready")}>Edit it myself</Button>
        </div>
      </Panel>
    );
  }

  return (
    <div className="mt-5 grid grid-cols-[minmax(0,1fr)_400px] items-start gap-5">
      <Panel aria-label="What Hakkiri understood" className="animate-rise px-6 py-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[15px] font-semibold">{sessionId ? (anyChange ? "What Hakkiri changed" : "What Hakkiri understood") : "What Hakkiri understood"}</h2>
          <span className="text-[13px] text-muted">Edit anything that’s still wrong</span>
        </div>
        {sessionId && by === "rules" && <p className="mt-1 text-[13px] text-muted">Claude wasn’t available to reread the job, so check this yourself. Your feedback is saved as rules below.</p>}
        {sessionId && by === "model" && !anyChange && <p className="mt-1 text-[13px] text-muted">The job looks right, so the fix is in the questions: your feedback becomes rules for the new ones.</p>}
        <div className="mt-3">
          <Row label="Job title" was={before.role} isChanged={changed("role")} showWas={Boolean(sessionId)}>
            <input aria-label="Job title" className={input} value={u.role} onChange={(e) => setU({ ...u, role: e.target.value })} />
          </Row>
          <Row label="Level" was={before.level} isChanged={changed("level")} showWas={Boolean(sessionId)}>
            <input aria-label="Level" className={input} value={u.level} onChange={(e) => setU({ ...u, level: e.target.value })} />
          </Row>
          <Row label="The work" was={before.field} isChanged={changed("field")} showWas={Boolean(sessionId)}>
            <input aria-label="The work" className={input} value={u.field} onChange={(e) => setU({ ...u, field: e.target.value })} />
          </Row>
          <Row label="Kind of job" was={before.technicalLabel === "Technical" ? "Technical" : "Not technical"} isChanged={changed("technicalLabel")} showWas={Boolean(sessionId)}>
            <Segmented<RoleUnderstanding["technicalLabel"]>
              label="Kind of job"
              value={u.technicalLabel}
              onChange={(technicalLabel) => setU({ ...u, technicalLabel })}
              options={[
                { value: "Technical", label: "Technical job" },
                { value: "Role knowledge", label: "Not technical" },
              ]}
            />
            <p className="mt-1.5 text-xs text-muted">{u.technicalLabel === "Technical" ? "Questions on the tools and methods the job uses." : "“Role knowledge” instead: what this job needs you to know, like product, pricing or process."}</p>
          </Row>
          {CATEGORY_ORDER.map((g) => (
            <Row key={g} label={categoryLabel(g, u.technicalLabel)} was={before.meanings[g]} isChanged={meaningChanged(g)} showWas={Boolean(sessionId)}>
              <textarea aria-label={`What ${categoryLabel(g, u.technicalLabel)} means for this job`} rows={2} className={clsx(input, "resize-none")} value={u.meanings[g]} onChange={(e) => setU({ ...u, meanings: { ...u.meanings, [g]: e.target.value } })} />
            </Row>
          ))}
        </div>
      </Panel>

      <div className="flex flex-col gap-5">
        <Panel aria-label="Rules for the new questions" className="animate-rise px-6 py-5 [animation-delay:0.05s]">
          <h2 className="text-[15px] font-semibold">Rules for the new questions</h2>
          <p className="mt-0.5 text-[13px] text-muted">From your feedback. Every new question is checked against them.</p>
          {rules.length === 0 && <p className="mt-2 text-sm text-dim">No rules yet.</p>}
          <ul className="mt-2 space-y-1.5">
            {rules.map((r) => (
              <li key={r} className="relative rounded-[9px] bg-panel-2 py-2 pl-3 pr-9 text-sm">
                {r}
                <button type="button" aria-label={`Remove rule: ${r}`} onClick={() => setRules(rules.filter((x) => x !== r))} className="absolute right-2.5 top-2.5 text-muted hover:text-ink">
                  <Icon name="x" size={14} strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const r = newRule.trim();
              if (r.length >= 5 && !rules.includes(r)) setRules([...rules, r].slice(-8));
              setNewRule("");
            }}
          >
            <input aria-label="Add a rule" className={input} placeholder="Add a rule, e.g. No questions about managing people" value={newRule} onChange={(e) => setNewRule(e.target.value)} maxLength={200} />
            <Button type="submit" size="sm" disabled={newRule.trim().length < 5}>
              Add
            </Button>
          </form>
        </Panel>

        {checkDocs && (
          <Panel aria-label="Check your documents" className="animate-rise px-6 py-5 shadow-[inset_0_0_0_1px_rgb(255_120_120/0.35)] [animation-delay:0.08s]">
            <div className="flex items-center gap-2 text-[15px] font-semibold">
              <Icon name="flag" size={15} strokeWidth={2} className="text-red-soft" />
              Still wrong after a rebuild?
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">Most often the wrong file was uploaded, or the job link was misread. Replace either below, or use the standard questions for “{u.role}” while you sort them out.</p>
            <div className="mt-3 space-y-2">
              <DocField id="rebuild-cv" label="A new CV" doc={cv} setDoc={setCv} optional onProblem={setDocProblem} />
              <DocField id="rebuild-job" label="Job spec" doc={job} setDoc={setJob} optional onProblem={setDocProblem} />
            </div>
            {docProblem && (
              <p role="alert" className="mt-2 text-[13px] text-red-soft">
                {docProblem}
              </p>
            )}
            <Button size="sm" className="mt-3" disabled={phase === "rebuilding"} onClick={() => void rebuild({ start: true, templates: true })}>
              Use standard questions for now
            </Button>
          </Panel>
        )}

        <Panel className="animate-rise px-6 py-5 [animation-delay:0.1s]">
          <p className="text-[13px] leading-relaxed text-muted">
            Questions you haven’t heard are set aside and a fresh set is written. {sessionId ? "The interview you stopped isn’t scored, and you get your full time again." : "Questions you’ve already had stay in your history."}
          </p>
          {error && (
            <p role="alert" className="mt-2 text-[13px] text-red-soft">
              {error}
            </p>
          )}
          <Button variant="primary" size="lg" className="mt-3 w-full" disabled={phase === "rebuilding" || !u.role.trim()} onClick={() => void rebuild({ start: true })}>
            <Icon name="mic" size={17} strokeWidth={2} />
            {phase === "rebuilding" ? (slow ? "Writing new questions…" : "Rebuilding…") : "Rebuild and start"}
          </Button>
          {!sessionId && (
            <Button className="mt-2 w-full" disabled={phase === "rebuilding" || !u.role.trim()} onClick={() => void rebuild({ start: false })}>
              Rebuild, start later
            </Button>
          )}
        </Panel>
      </div>
    </div>
  );
}
