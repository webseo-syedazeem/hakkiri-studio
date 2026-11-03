"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button, Icon, Panel } from "@/components/ui";
import { Segmented } from "@/components/ui/Segmented";
import { pastedDocument, readDocument, type ReadDoc } from "./read-docs";
import { londonIso } from "@/lib/dates";
import type { InterviewFormat } from "@/lib/types";
import { SettingsPicker } from "./SettingsPicker";
import { allocate, CATEGORY_ORDER, categoryLabel, DEFAULT_SETTINGS, isTechRole, mixQuestionCount, settingsLine, totalQuestionCount, type SessionSettings } from "@/lib/interviews/settings";

const field = "flex h-[46px] items-center gap-3 rounded-[10px] bg-panel-2 px-3.5 text-sm shadow-[inset_0_0_0_1px_var(--color-line-strong)]";
const input = "min-w-0 grow bg-transparent outline-none placeholder:text-dim";

type LinkState = { status: "idle" } | { status: "reading" } | { status: "ok"; host: string; words: number; text: string; title: string | null } | { status: "fail"; message: string };

const looksLikeUrl = (s: string) => /^\s*(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?\s*$/i.test(s);
const wordsIn = (s: string) => s.split(/\s+/).filter(Boolean).length;

function Section({ label, htmlFor, hint, children }: { label: React.ReactNode; htmlFor?: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-t border-line py-3 first:border-t-0 first:pt-0">
      <label htmlFor={htmlFor} className="mb-2 block text-[13px] font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="mt-2 text-[13px] text-muted">{hint}</p>}
    </div>
  );
}

function Status({ state }: { state: "ok" | "reading" | "fail" | "empty"; children?: React.ReactNode }) {
  if (state === "ok") return <Icon name="check" size={16} strokeWidth={2.4} className="shrink-0 text-blue-soft" />;
  if (state === "reading") return <span className="h-2 w-2 shrink-0 animate-rec rounded-full bg-blue" aria-label="Reading" />;
  if (state === "fail") return <Icon name="flag" size={15} strokeWidth={2} className="shrink-0 text-red-soft" />;
  return <span className="h-2 w-2 shrink-0 rounded-full bg-white/15" />;
}

/** A CV or cover letter: choose a file (PDF, Word, text) or paste the text. */
export function DocField({ id, label, doc, setDoc, optional, onProblem }: { id: string; label: string; doc: ReadDoc | null; setDoc: (d: ReadDoc | null) => void; optional?: boolean; onProblem: (m: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [text, setText] = useState("");
  const pick = async (f: File) => {
    onProblem(null);
    setReading(true);
    try {
      setDoc(await readDocument(f, { minWords: optional ? 20 : 40 }));
    } catch (err) {
      onProblem(err instanceof Error ? `${label}: ${err.message}` : `${label} couldn’t be read.`);
    } finally {
      setReading(false);
    }
  };
  return (
    <div className="min-w-0">
      <div
        className={field}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) void pick(f);
        }}
      >
        <Icon name="doc" size={18} className="shrink-0 text-muted" />
        {reading ? (
          <span className="text-muted">Reading…</span>
        ) : doc ? (
          <>
            <span className="truncate font-semibold">{doc.name}</span>
            <span className="shrink-0 text-muted">{doc.detail}</span>
          </>
        ) : (
          <span className="truncate text-dim">{optional ? `${label} (optional)` : label}</span>
        )}
        <span className="grow" />
        {doc && <Status state="ok" />}
        <button type="button" onClick={() => ref.current?.click()} aria-label={`${doc ? "Replace" : "Choose file"}: ${label}`} className="shrink-0 text-[13px] font-semibold text-blue-soft hover:underline">
          {doc ? "Replace" : "Choose file"}
        </button>
        {!doc && (
          <button type="button" onClick={() => setPasting(!pasting)} aria-label={`Paste: ${label}`} aria-expanded={pasting} className="shrink-0 text-[13px] font-semibold text-blue-soft hover:underline">
            Paste
          </button>
        )}
        {doc && (
          <button type="button" aria-label={`Remove ${label}`} onClick={() => setDoc(null)} className="shrink-0 text-muted hover:text-ink">
            <Icon name="x" size={14} strokeWidth={2} />
          </button>
        )}
        <input
          id={id}
          ref={ref}
          type="file"
          aria-label={optional ? `${label} (optional)` : label}
          accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void pick(f);
          }}
        />
      </div>
      {pasting && !doc && (
        <div className="mt-2 rounded-[10px] bg-panel-2 p-3 shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
          <textarea aria-label={`${label} text`} value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={`Paste your ${label.toLowerCase()} here`} className="w-full resize-y bg-transparent text-sm leading-relaxed outline-none placeholder:text-dim" />
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="primary"
              disabled={wordsIn(text) < (optional ? 20 : 40)}
              onClick={() => {
                setDoc(pastedDocument(`${label}, pasted`, text));
                setPasting(false);
              }}
            >
              Use this text
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPasting(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Interview set-up (design screen 2), built around the company: its name and
 * website, the job title and spec (a link, pasted text or a file), your CV
 * and cover letter, then how hard and how long, and the question mix. Files
 * and links are read as you add them; Build reads them all and has Claude
 * work out the job and write your first interview's questions, then opens
 * the interview, ready to start. The date is optional.
 */
export function InterviewSetup() {
  const router = useRouter();
  const jobFileRef = useRef<HTMLInputElement>(null);
  const [company, setCompany] = useState({ name: "", url: "" });
  const [site, setSite] = useState<LinkState>({ status: "idle" });
  const [jobTitle, setJobTitle] = useState("");
  const [jobInput, setJobInput] = useState("");
  const [jobLink, setJobLink] = useState<LinkState>({ status: "idle" });
  const [jobDoc, setJobDoc] = useState<ReadDoc | null>(null);
  const [cv, setCv] = useState<ReadDoc | null>(null);
  const [cover, setCover] = useState<ReadDoc | null>(null);
  const [when, setWhen] = useState({ date: "", time: "" });
  const [format, setFormat] = useState<InterviewFormat>("video");
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SETTINGS);
  const [problem, setProblem] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const [buildSec, setBuildSec] = useState(0);
  const readSeq = useRef({ company: 0, job: 0 });

  const jobIsLink = looksLikeUrl(jobInput);
  const jobPasted = !jobIsLink && wordsIn(jobInput) >= 30 ? jobInput.trim() : "";

  async function read(kind: "company" | "job", url: string) {
    const seq = ++readSeq.current[kind];
    const set = kind === "company" ? setSite : setJobLink;
    if (!url.trim()) return set({ status: "idle" });
    set({ status: "reading" });
    try {
      const res = await fetch("/api/interviews/read-link", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, kind }) });
      const json = (await res.json()) as { ok: boolean; message?: string; host?: string; words?: number; text?: string; title?: string | null; job?: { title: string | null; company: string | null } | null };
      if (seq !== readSeq.current[kind]) return;
      if (json.ok) {
        set({ status: "ok", host: json.host!, words: json.words!, text: json.text!, title: json.title ?? null });
        if (kind === "job") {
          if (json.job?.title) setJobTitle((t) => t || json.job!.title!);
          if (json.job?.company) setCompany((c) => (c.name ? c : { ...c, name: json.job!.company! }));
        }
      } else set({ status: "fail", message: json.message ?? "Couldn’t read that page." });
    } catch {
      if (seq === readSeq.current[kind]) set({ status: "fail", message: "Couldn’t reach that page." });
    }
  }

  useEffect(() => {
    if (!building) return;
    const t = setInterval(() => setBuildSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [building]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    if (!company.name.trim()) return setProblem("Add the company’s name.");
    if (!jobTitle.trim() && !jobPasted && !jobDoc && jobLink.status !== "ok") return setProblem("Add the job title, or the job spec.");
    if (!cv) return setProblem("Add your CV: choose the file, or paste the text.");
    if (when.time && !when.date) return setProblem("Add the date too, or clear the time.");
    setBuilding(true);
    setBuildSec(0);
    const jobText = jobDoc?.text ?? (jobPasted || (jobLink.status === "ok" ? jobLink.text : undefined));
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          company: { name: company.name.trim(), url: company.url.trim() || undefined, siteText: site.status === "ok" ? site.text : undefined },
          job: {
            title: jobTitle.trim(),
            text: jobText,
            url: jobIsLink ? jobInput.trim() : undefined,
            label: jobDoc?.name ?? (jobPasted ? "Pasted job description" : jobLink.status === "ok" ? jobLink.host : undefined),
          },
          cv: { text: cv.text, label: cv.name },
          coverLetter: cover ? { text: cover.text, label: cover.name } : undefined,
          date: when.date ? londonIso(when.date, when.time || "09:00") : undefined,
          format,
          settings,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!res.ok || !json.id) throw new Error(json.message ?? "Your interview couldn’t be built. Try again.");
      router.push(`/interviews/${json.id}?new=1`);
      router.refresh();
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Your interview couldn’t be built. Try again.");
      setBuilding(false);
    }
  }

  const alloc = allocate(settings.mix, mixQuestionCount(settings.minutes, settings.difficulty));
  const total = totalQuestionCount(settings.minutes, settings.difficulty);
  const technicalLabel = jobTitle && !isTechRole(jobTitle) ? "Role knowledge" : "Technical";
  const name = company.name.trim() || "the company";
  const jobState: "ok" | "reading" | "fail" | "empty" = jobDoc || jobPasted || jobLink.status === "ok" ? "ok" : jobLink.status === "reading" ? "reading" : jobLink.status === "fail" ? "fail" : "empty";
  const steps = [
    { at: 0, label: jobState === "ok" ? "Reading the job spec" : "Working from the job title" },
    { at: 4, label: company.url ? `Reading ${name}’s website` : `Thinking about ${name}` },
    { at: 10, label: "Working out what the job really needs" },
    { at: 18, label: "Finding your stories, and what they’ll ask about your CV" },
    { at: 28, label: `Writing your questions, plus spares` },
    { at: 50, label: "Checking every question fits the job" },
  ];

  return (
    <form onSubmit={submit} className="grid grow grid-cols-[minmax(0,1fr)_440px] gap-7">
      <div className="flex animate-rise flex-col">
        <Section label="The company" htmlFor="company" hint="Hakkiri reads their website for questions about them, your “why us” answers and your prep sheet.">
          <div className="flex gap-2.5">
            <div className={`${field} w-[260px] shrink-0`}>
              <Icon name="brief" size={17} className="shrink-0 text-muted" />
              <input id="company" className={`${input} font-semibold`} value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} placeholder="Company name" maxLength={80} autoComplete="organization" />
            </div>
            <div className={`${field} min-w-0 grow`}>
              <Icon name="globe" size={17} className="shrink-0 text-muted" />
              <input
                aria-label="Company website"
                className={input}
                value={company.url}
                onChange={(e) => setCompany({ ...company, url: e.target.value })}
                onBlur={() => void read("company", company.url)}
                placeholder="Website, e.g. halden.com"
                maxLength={300}
                inputMode="url"
              />
              <Status state={site.status === "ok" ? "ok" : site.status === "reading" ? "reading" : site.status === "fail" ? "fail" : "empty"} />
            </div>
          </div>
        </Section>

        <Section
          label="The job"
          htmlFor="job-title"
          hint={
            <>
              Paste a link or the full job description, or{" "}
              <button type="button" onClick={() => jobFileRef.current?.click()} className="font-semibold text-blue-soft hover:underline">
                choose a file
              </button>
              . No job spec? The title is enough.
            </>
          }
        >
          <div className="flex gap-2.5">
            <div className={`${field} w-[260px] shrink-0`}>
              <input id="job-title" className={`${input} font-semibold`} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job title" maxLength={120} />
            </div>
            <div className={`${field} min-w-0 grow`}>
              <Icon name={jobDoc ? "doc" : "link"} size={17} className="shrink-0 text-muted" />
              {jobDoc ? (
                <>
                  <span className="truncate font-semibold">{jobDoc.name}</span>
                  <span className="shrink-0 text-muted">{jobDoc.detail}</span>
                  <span className="grow" />
                  <button type="button" aria-label="Remove the job spec file" onClick={() => setJobDoc(null)} className="shrink-0 text-muted hover:text-ink">
                    <Icon name="x" size={14} strokeWidth={2} />
                  </button>
                </>
              ) : jobPasted ? (
                <>
                  <span className="truncate font-semibold">Job description pasted</span>
                  <span className="shrink-0 text-muted">{wordsIn(jobPasted)} words</span>
                  <span className="grow" />
                  <button type="button" onClick={() => setJobInput("")} className="shrink-0 text-[13px] font-semibold text-blue-soft hover:underline">
                    Clear
                  </button>
                </>
              ) : (
                <input
                  aria-label="Job spec: a link or the job description"
                  className={input}
                  value={jobInput}
                  onChange={(e) => {
                    setJobInput(e.target.value);
                    if (jobLink.status !== "idle") setJobLink({ status: "idle" });
                  }}
                  onBlur={() => jobIsLink && void read("job", jobInput)}
                  onPaste={(e) => {
                    const t = e.clipboardData.getData("text");
                    if (looksLikeUrl(t)) setTimeout(() => void read("job", t), 0);
                  }}
                  placeholder="Link or job description"
                />
              )}
              <Status state={jobState} />
              <input
                ref={jobFileRef}
                type="file"
                aria-label="Job spec file"
                accept=".pdf,.docx,.txt,.md"
                className="sr-only"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  try {
                    setJobDoc(await readDocument(f, { minWords: 30 }));
                    setProblem(null);
                  } catch (err) {
                    setProblem(err instanceof Error ? `Job spec: ${err.message}` : "The job spec couldn’t be read.");
                  }
                }}
              />
            </div>
          </div>
          {jobLink.status === "fail" && <p className="mt-2 text-[13px] text-red-soft">{jobLink.message}</p>}
        </Section>

        <Section label="Your CV and cover letter" htmlFor="cv">
          <div className="grid grid-cols-2 gap-2.5">
            <DocField id="cv" label="Your CV" doc={cv} setDoc={setCv} onProblem={setProblem} />
            <DocField id="cover" label="Cover letter" doc={cover} setDoc={setCover} optional onProblem={setProblem} />
          </div>
        </Section>

        <Section label="Your interview" hint="Most people keep these. You can change them before every interview.">
          <SettingsPicker value={settings} onChange={setSettings} technicalLabel={technicalLabel} collapsible />
        </Section>

        <Section label={<>When is it? <span className="font-normal text-muted">Optional</span></>} htmlFor="date">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`${field} w-[210px]`}>
              <Icon name="cal" size={17} className="text-muted" />
              <input id="date" type="date" className={`${input} num [color-scheme:dark]`} value={when.date} onChange={(e) => setWhen({ ...when, date: e.target.value })} />
            </div>
            <div className={`${field} w-[136px]`}>
              <input aria-label="Time" type="time" className={`${input} num [color-scheme:dark]`} value={when.time} onChange={(e) => setWhen({ ...when, time: e.target.value })} />
            </div>
            <Segmented
              label="Format"
              value={format}
              onChange={setFormat}
              options={[
                { value: "in-person", label: "In person" },
                { value: "video", label: "Video call" },
                { value: "phone", label: "Phone" },
              ]}
            />
          </div>
        </Section>

        <div className="grow" />
        {problem && (
          <p role="alert" className="mb-3 rounded-[10px] bg-red/10 px-3.5 py-2.5 text-[13px] text-red-soft">
            {problem}
          </p>
        )}
        <div className="flex items-center gap-2.5 border-t border-line pt-3.5">
          <Button type="submit" variant="primary" size="lg" disabled={building}>
            {building ? "Building your interview…" : "Build my interview"}
          </Button>
          <Button size="lg" onClick={() => router.push("/interviews")} disabled={building}>
            Cancel
          </Button>
        </div>
      </div>

      <Panel aria-label="What Hakkiri found" className="flex animate-rise flex-col px-6 py-[22px] [animation-delay:0.08s]">
        <h2 className="text-[15px] font-semibold">{building ? `Building your ${name} interview` : "What Hakkiri found"}</h2>
        <div className="mt-0.5 text-[13px] text-muted">{building ? "This takes up to a minute." : "Updated as you add things"}</div>

        {building ? (
          <ol className="mt-5 space-y-3" role="status">
            {steps.map((s, i) => {
              const next = steps[i + 1]?.at ?? Infinity;
              const state = buildSec >= next ? "done" : buildSec >= s.at ? "now" : "later";
              return (
                <li key={s.label} className={clsx("flex items-center gap-3 text-sm", state === "later" ? "text-dim" : "text-ink")}>
                  {state === "done" ? <Icon name="check" size={16} strokeWidth={2.4} className="text-blue-soft" /> : <span className={clsx("ml-1 h-2 w-2 rounded-full", state === "now" ? "animate-rec bg-blue" : "bg-white/15")} />}
                  {s.label}
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="mt-4 space-y-2">
            {[
              {
                label: "Company",
                state: site.status === "ok" ? "ok" : site.status === "reading" ? "reading" : site.status === "fail" ? "fail" : company.name ? "ok" : "empty",
                text:
                  site.status === "ok"
                    ? `${company.name || site.host}: read ${site.words} words from ${site.host}`
                    : site.status === "reading"
                      ? "Reading their website…"
                      : site.status === "fail"
                        ? site.message
                        : company.name
                          ? `${company.name}. Add their website for questions about them.`
                          : "Add the company’s name and website.",
              },
              {
                label: "Job spec",
                state: jobState === "empty" && jobTitle ? "ok" : jobState,
                text: jobDoc
                  ? `${jobDoc.name}, ${jobDoc.detail}`
                  : jobPasted
                    ? `Job description, ${wordsIn(jobPasted)} words`
                    : jobLink.status === "ok"
                      ? `Read ${jobLink.words} words from ${jobLink.host}${jobLink.title ? `: ${jobLink.title}` : ""}`
                      : jobLink.status === "reading"
                        ? "Reading the job link…"
                        : jobLink.status === "fail"
                          ? "Couldn’t read the link. Paste the description instead."
                          : jobTitle
                            ? `${jobTitle}. A job spec makes the technical questions specific.`
                            : "Add the job title, and the spec if you have it.",
              },
              { label: "CV", state: cv ? "ok" : "empty", text: cv ? `${cv.name}, ${cv.detail}` : "Add your CV. Questions about your experience come from it." },
              { label: "Cover letter", state: cover ? "ok" : "empty", text: cover ? `${cover.name}, ${cover.detail}` : "Optional. It helps with “why us” answers." },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3 rounded-[9px] bg-panel-2 px-3 py-[9px] text-sm">
                <span className="mt-[3px]">
                  <Status state={row.state as "ok" | "reading" | "fail" | "empty"} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] text-muted">{row.label}</span>
                  <span className={clsx("block leading-snug", row.state === "fail" && "text-red-soft")}>{row.text}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-baseline justify-between text-[13px] text-muted">
          <span>Your first interview</span>
          <span className="num">{settingsLine(settings)}</span>
        </div>
        <div className="mt-2">
          {CATEGORY_ORDER.map((g) => (
            <div key={g} className="grid grid-cols-[1fr_140px_28px] items-center gap-3 py-1.5 text-sm">
              <span className={settings.mix[g] ? "" : "text-dim"}>{categoryLabel(g, technicalLabel)}</span>
              <div className="flex gap-0.5" aria-hidden>
                {Array.from({ length: 6 }, (_, k) => (
                  <span key={k} className={`h-2 flex-1 rounded-[2px] ${k < alloc[g] ? "bg-blue" : "bg-white/[0.07]"}`} />
                ))}
              </div>
              <span className="num text-right text-muted">{alloc[g]}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[13px] leading-normal text-muted">
          About {total} questions with “Tell me about yourself” to open. You won’t see them first: Sam asks them out loud, as in the real thing.
        </p>
        <div className="grow" />
        <div className="mt-4 flex items-start gap-2.5 border-t border-line pt-3.5 text-[13px] leading-normal text-muted">
          <Icon name="lock" size={16} className="mt-0.5 shrink-0" />
          Your CV, cover letter and recordings stay on this computer and are only sent to the AI to build and score your practice. Delete an interview to delete them.
        </div>
      </Panel>
    </form>
  );
}
