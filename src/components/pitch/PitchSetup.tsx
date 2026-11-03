"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button, Icon, Panel } from "@/components/ui";
import { Segmented } from "@/components/ui/Segmented";
import { SlideView } from "./SlideView";
import { parseNotes, parsePdf, parsePptx, suggestTitle, type ParsedSlide } from "./parse-slides";
import { AUDIENCE_LABEL, AUDIENCES, QA_STYLE_HINT, QA_STYLE_LABEL, QA_STYLES } from "@/lib/pitch/labels";
import { fitToLimit, stepFor } from "@/lib/pitch/timing";
import { londonIso } from "@/lib/dates";
import { mmss } from "@/lib/format";
import type { Audience, Presentation, QaStyle, SlideLayout } from "@/lib/pitch/types";

const field = "flex h-[46px] items-center gap-3 rounded-[10px] bg-panel-2 px-3.5 text-sm shadow-[inset_0_0_0_1px_var(--color-line-strong)]";
const input = "min-w-0 grow bg-transparent outline-none placeholder:text-dim";
const LIMITS = [3, 5, 8, 10, 12, 15, 20, 30, 45, 60];

export interface EditableSlide {
  title: string;
  lines: string[];
  notes?: string;
  layout?: SlideLayout;
  /** An existing stored picture (file), or a new one read in the browser (blob). */
  image: { kind: "page" | "picture"; file?: string; blob?: Blob; url: string } | null;
  plannedSec: number;
  point: string;
}

export interface SetupInitial {
  id?: string;
  title: string;
  audience: Audience;
  ask: string;
  date: string;
  time: string;
  limitMin: number;
  qaStyle: QaStyle | null;
  source: Presentation["source"] | null;
  slides: EditableSlide[];
  askSlide: number;
  warnings: string[];
  planBy: Presentation["planBy"];
}

function Section({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: React.ReactNode; children: React.ReactNode }) {
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

type PlanReply = { slides: { plannedSec: number; point: string }[]; askSlide: number; warnings: string[]; planBy: "model" | "estimate" };

/**
 * Set up a presentation (design screen 11). Your slides are read in the
 * browser; Hakkiri then suggests timing for each one and the point each
 * needs to land, which you can change. Start first run saves it and opens
 * the rehearsal. Also used to edit a presentation.
 */
export function PitchSetup({ initial }: { initial: SetupInitial }) {
  const router = useRouter();
  const editing = Boolean(initial.id);
  const fileRef = useRef<HTMLInputElement>(null);
  const [slides, setSlides] = useState<EditableSlide[]>(initial.slides);
  const [source, setSource] = useState(initial.source);
  const [title, setTitle] = useState(initial.title);
  const [audience, setAudience] = useState<Audience>(initial.audience);
  const [ask, setAsk] = useState(initial.ask);
  const [when, setWhen] = useState({ date: initial.date, time: initial.time });
  const [limitMin, setLimitMin] = useState(initial.limitMin);
  const [qa, setQa] = useState<QaStyle | "none">(initial.qaStyle ?? "none");
  const [askSlide, setAskSlide] = useState(initial.askSlide);
  const [warnings, setWarnings] = useState(initial.warnings);
  const [planBy, setPlanBy] = useState(initial.planBy);
  const [selected, setSelected] = useState<number | null>(null);
  const [reading, setReading] = useState<{ done: number; total: number } | null>(null);
  const [planning, setPlanning] = useState(false);
  const [notesOpen, setNotesOpen] = useState(initial.source?.kind === "notes" && !initial.slides.length);
  const [notes, setNotes] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const plannedAsk = useRef(initial.ask);
  const planSeq = useRef(0);

  const limitSec = limitMin * 60;
  const total = slides.reduce((a, s) => a + s.plannedSec, 0);
  const step = stepFor(slides.length, limitSec);

  /** Ask for suggested timing and points for these slides. */
  const plan = useCallback(
    async (deck: EditableSlide[], opts?: { ask?: string; audience?: Audience; limitSec?: number; title?: string }) => {
      if (!deck.length) return;
      const seq = ++planSeq.current;
      setPlanning(true);
      const a = opts?.ask ?? ask;
      plannedAsk.current = a;
      try {
        const res = await fetch("/api/presentations/plan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: opts?.title ?? title,
            audience: opts?.audience ?? audience,
            ask: a,
            limitSec: opts?.limitSec ?? limitSec,
            slides: deck.map((s) => ({ title: s.title, lines: s.lines, ...(s.notes ? { notes: s.notes } : {}) })),
          }),
        });
        const json = (await res.json()) as PlanReply;
        if (seq !== planSeq.current || !res.ok) return;
        setSlides((cur) => cur.map((s, i) => ({ ...s, plannedSec: json.slides[i]?.plannedSec ?? s.plannedSec, point: json.slides[i]?.point ?? s.point })));
        setAskSlide(json.askSlide);
        setWarnings(json.warnings);
        setPlanBy(json.planBy);
      } catch {
        if (seq === planSeq.current) setProblem("Couldn’t work out the timing. Check your connection, then press Suggest again.");
      } finally {
        if (seq === planSeq.current) setPlanning(false);
      }
    },
    [ask, audience, limitSec, title],
  );

  /** New slides in: show them straight away with an even split, then ask for a proper plan. */
  const takeSlides = useCallback(
    (parsed: ParsedSlide[], src: Presentation["source"]) => {
      const even = fitToLimit(parsed.map(() => 1), limitSec);
      const deck: EditableSlide[] = parsed.map((s, i) => ({ title: s.title, lines: s.lines, notes: s.notes, layout: s.layout, image: s.image ?? null, plannedSec: even[i], point: "" }));
      for (const s of slides) if (s.image?.blob) URL.revokeObjectURL(s.image.url);
      setSlides(deck);
      setSource(src);
      setSelected(null);
      setWarnings([]);
      const name = editing ? title : suggestTitle(src.fileName ?? null, parsed);
      setTitle(name);
      void plan(deck, { title: name });
    },
    [limitSec, slides, editing, title, plan],
  );

  const readFile = useCallback(
    async (file: File) => {
      setProblem(null);
      const ext = file.name.toLowerCase().split(".").pop() ?? "";
      if (!["pdf", "pptx"].includes(ext)) {
        setProblem(ext === "ppt" || ext === "key" ? "Save it as a .pptx or PDF first, then choose it again." : "Choose a PowerPoint (.pptx) or PDF file.");
        return;
      }
      setReading({ done: 0, total: 0 });
      try {
        const parsed = ext === "pdf" ? await parsePdf(file, (done, t) => setReading({ done, total: t })) : await parsePptx(file, (done, t) => setReading({ done, total: t }));
        takeSlides(parsed, { kind: ext as "pdf" | "pptx", fileName: file.name });
        setNotesOpen(false);
      } catch (err) {
        setProblem(err instanceof Error && err.message.length < 160 ? err.message : "That file couldn’t be read. Try exporting it again as PDF.");
      } finally {
        setReading(null);
      }
    },
    [takeSlides],
  );

  const changeLimit = (min: number) => {
    setLimitMin(min);
    if (slides.length) {
      const secs = fitToLimit(
        slides.map((s) => s.plannedSec),
        min * 60,
      );
      setSlides(slides.map((s, i) => ({ ...s, plannedSec: secs[i] })));
    }
  };

  const fit = () => {
    const secs = fitToLimit(
      slides.map((s) => s.plannedSec),
      limitSec,
    );
    setSlides(slides.map((s, i) => ({ ...s, plannedSec: secs[i] })));
  };

  const editSlide = (i: number, patch: Partial<EditableSlide>) => {
    setSlides(slides.map((s, k) => (k === i ? { ...s, ...patch } : s)));
    setPlanBy("you");
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    if (!slides.length) return setProblem("Add your slides or notes first.");
    if (!when.date || !when.time) return setProblem("Add the date and time of your talk.");
    setSaving(true);
    const form = new FormData();
    const data = {
      title: title.trim() || "My presentation",
      audience,
      ask: ask.trim(),
      date: londonIso(when.date, when.time),
      timeLimitSec: limitSec,
      qaStyle: qa === "none" ? null : qa,
      source: source ?? { kind: "notes" as const },
      slides: slides.map((s, i) => ({
        title: s.title,
        lines: s.lines,
        ...(s.notes ? { notes: s.notes } : {}),
        ...(s.layout ? { layout: s.layout } : {}),
        plannedSec: s.plannedSec,
        point: s.point.trim() || s.title,
        image: s.image ? (s.image.blob ? { kind: s.image.kind, field: `img-${i}` } : { kind: s.image.kind, file: s.image.file }) : null,
      })),
      askSlide: Math.min(askSlide, slides.length),
      warnings,
      planBy,
    };
    slides.forEach((s, i) => s.image?.blob && form.append(`img-${i}`, s.image.blob, `slide-${i + 1}.jpg`));
    form.append("data", JSON.stringify(data));
    try {
      const res = await fetch(editing ? `/api/presentations/${initial.id}` : "/api/presentations", { method: editing ? "PUT" : "POST", body: form });
      const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!res.ok || !json.id) throw new Error(json.message ?? "That couldn’t be saved. Try again.");
      if (editing) router.push(`/presentations/${json.id}`);
      else router.push(document.cookie.includes("hk_mic_ok=1") ? `/rehearse/${json.id}` : `/mic-check?next=${encodeURIComponent(`/rehearse/${json.id}`)}`);
      router.refresh();
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "That couldn’t be saved. Try again.");
      setSaving(false);
    }
  }

  const sel = selected != null ? slides[selected] : null;
  const fileLine = source?.kind === "notes" ? "Your notes" : (source?.fileName ?? (source?.kind === "demo" ? "Demo deck" : "Your slides"));

  return (
    <form onSubmit={submit} className="grid min-h-0 grow grid-cols-[minmax(0,1fr)_600px] gap-7">
      <div className="flex animate-rise flex-col">
        <Section
          label="Slides"
          htmlFor="slides-file"
          hint={
            <>
              PowerPoint or PDF. From Google Slides, use File › Download › PDF. No slides?{" "}
              <button type="button" className="font-semibold text-blue-soft hover:underline" onClick={() => setNotesOpen(true)}>
                Paste your notes instead
              </button>
              .
            </>
          }
        >
          <div
            className={clsx(field, dragging && "shadow-[inset_0_0_0_1.5px_var(--color-blue-soft)]")}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void readFile(f);
            }}
          >
            <Icon name="doc" size={18} className="text-muted" />
            {reading ? (
              <span className="text-muted" role="status">
                Reading your slides{reading.total ? `… ${reading.done} of ${reading.total}` : "…"}
              </span>
            ) : slides.length ? (
              <>
                <span className="truncate font-semibold">{fileLine}</span>
                <span className="num shrink-0 text-muted">
                  {slides.length} {source?.kind === "notes" ? "sections" : "slides"}
                </span>
                <span className="grow" />
                <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-blue-soft">
                  <Icon name="check" size={16} strokeWidth={2.4} />
                  Read
                </span>
              </>
            ) : (
              <span className="text-muted">Drop your slides here, or choose a file</span>
            )}
            {!slides.length && <span className="grow" />}
            <button type="button" onClick={() => fileRef.current?.click()} className="ml-2 shrink-0 text-[13px] font-semibold text-blue-soft hover:underline" disabled={Boolean(reading)}>
              {slides.length ? "Replace" : "Choose file"}
            </button>
            <input
              id="slides-file"
              ref={fileRef}
              type="file"
              accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void readFile(f);
              }}
            />
          </div>
          {notesOpen && (
            <div className="mt-2.5 rounded-[10px] bg-panel-2 p-3 shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
              <textarea
                aria-label="Your notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder={"One section per paragraph. The first line of each is its title.\n\nOpening\nWhy this matters to the team this quarter\n\nThe plan\nThree changes we’ll make…"}
                className="w-full resize-y bg-transparent text-sm leading-relaxed outline-none placeholder:text-dim"
              />
              <div className="mt-2 flex items-center gap-2.5">
                <Button
                  size="sm"
                  variant="primary"
                  disabled={!notes.trim()}
                  onClick={() => {
                    const parsed = parseNotes(notes);
                    if (!parsed.length) return setProblem("Those notes look empty.");
                    takeSlides(parsed, { kind: "notes" });
                    setNotesOpen(false);
                  }}
                >
                  Use these notes
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setNotesOpen(false)}>
                  Cancel
                </Button>
                <span className="text-xs text-dim">Each section becomes a part of your talk, timed like a slide.</span>
              </div>
            </div>
          )}
        </Section>

        <Section label="Name" htmlFor="title">
          <div className={field}>
            <input id="title" className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Filled in from your slides" maxLength={120} />
          </div>
        </Section>

        <Section label="Who’s listening?">
          <Segmented label="Audience" value={audience} onChange={setAudience} options={AUDIENCES.map((a) => ({ value: a, label: AUDIENCE_LABEL[a] }))} />
        </Section>

        <Section label="What do you want them to do?" htmlFor="ask" hint="Hakkiri checks that your ask is clear and that the talk builds towards it.">
          <div className={field}>
            <input
              id="ask"
              className={input}
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              onBlur={() => {
                if (slides.length && ask.trim() !== plannedAsk.current.trim() && planBy !== "you") void plan(slides);
              }}
              placeholder="For example: approve the budget for two new hires"
              maxLength={240}
            />
          </div>
        </Section>

        <Section label="Time limit and date" htmlFor="limit">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`${field} w-[150px]`}>
              <select id="limit" className={`${input} cursor-pointer [color-scheme:dark]`} value={limitMin} onChange={(e) => changeLimit(Number(e.target.value))}>
                {[...new Set([...LIMITS, limitMin])]
                  .sort((a, b) => a - b)
                  .map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
              </select>
            </div>
            <div className={`${field} w-[210px]`}>
              <Icon name="cal" size={17} className="text-muted" />
              <input aria-label="Date" type="date" className={`${input} num [color-scheme:dark]`} value={when.date} onChange={(e) => setWhen({ ...when, date: e.target.value })} required />
            </div>
            <div className={`${field} w-[124px]`}>
              <input aria-label="Time" type="time" className={`${input} num [color-scheme:dark]`} value={when.time} onChange={(e) => setWhen({ ...when, time: e.target.value })} required />
            </div>
          </div>
        </Section>

        <Section label="Questions afterwards" hint={QA_STYLE_HINT[qa]}>
          <Segmented label="Questions afterwards" value={qa} onChange={setQa} options={[{ value: "none" as const, label: "None" }, ...QA_STYLES.map((s) => ({ value: s, label: QA_STYLE_LABEL[s] }))]} />
        </Section>

        <div className="grow" />
        {problem && (
          <p role="alert" className="mb-3 rounded-[10px] bg-red/10 px-3.5 py-2.5 text-[13px] text-red-soft">
            {problem}
          </p>
        )}
        <div className="flex items-center gap-2.5 border-t border-line pt-3.5">
          <Button type="submit" variant="primary" size="lg" disabled={saving || Boolean(reading)}>
            {!editing && <Icon name="mic" size={17} strokeWidth={2} />}
            {saving ? "Saving…" : editing ? "Save changes" : "Start first run"}
          </Button>
          <Button size="lg" onClick={() => router.push(editing ? `/presentations/${initial.id}` : "/presentations")}>
            Cancel
          </Button>
        </div>
      </div>

      <Panel aria-label="Suggested timing" className="flex min-h-0 animate-rise flex-col px-6 py-5 [animation-delay:0.08s]">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[15px] font-semibold">Suggested timing</h2>
          {slides.length > 0 && (
            <span className={clsx("num text-[13px]", total === limitSec ? "text-muted" : "font-semibold text-red-soft")}>
              {slides.length} slides, {mmss(total)}
              {total !== limitSec && ` of ${mmss(limitSec)}`}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[13px] text-muted">
          {!slides.length
            ? "Your slides appear here with a time for each, and the point each one needs to land."
            : planning
              ? "Working out where your time should go…"
              : planBy === "estimate"
                ? "Estimated from how much is on each slide. Pick a slide to change its time or point."
                : "More time where the slide carries your argument. Pick a slide to change it."}
          {slides.length > 0 && !planning && (
            <>
              {" "}
              <button type="button" onClick={() => void plan(slides)} className="font-semibold text-blue-soft hover:underline">
                Suggest again
              </button>
            </>
          )}
        </p>

        {!slides.length ? (
          <div className="mt-5 grid grid-cols-4 gap-3" aria-hidden>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="aspect-video rounded-[5px] shadow-[inset_0_0_0_1px_var(--color-line)]" style={{ opacity: 1 - i * 0.1 }} />
            ))}
          </div>
        ) : (
          <div className="mt-4 grid min-h-0 grid-cols-4 content-start gap-x-3 gap-y-3.5 overflow-auto pr-1">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={selected === i}
                onClick={() => setSelected(selected === i ? null : i)}
                className={clsx("flex flex-col gap-1.5 rounded-[6px] text-left outline-offset-4", planning && "animate-pulse")}
              >
                <span aria-hidden="true" className="block w-full">
                  <SlideView
                    slide={{ ...s, n: i + 1, image: s.image ? { kind: s.image.kind, file: s.image.file ?? "" } : null }}
                    imageSrc={s.image?.url ?? null}
                    className={clsx("w-full rounded-[4px]", selected === i ? "shadow-[0_0_0_2px_var(--color-blue)]" : "shadow-[0_0_0_1px_var(--color-line-strong)]")}
                  />
                </span>
                <span className="flex justify-between gap-1.5 text-xs">
                  <span className="truncate text-muted">
                    <span className="sr-only">Slide {i + 1}, </span>
                    {s.title}
                  </span>
                  <span className={clsx("num shrink-0 font-semibold", i + 1 === askSlide ? "text-blue-soft" : "text-ink")} title={i + 1 === askSlide ? "The slide that makes your ask" : undefined}>
                    {mmss(s.plannedSec)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="grow" />
        {sel && selected != null && (
          <div className="mt-4 rounded-[10px] bg-panel-2 px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 truncate text-sm font-semibold">
                <span className="num text-muted">{selected + 1}</span> {sel.title}
                {selected + 1 === askSlide && <span className="ml-2 text-xs font-semibold text-blue-soft">Your ask</span>}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button size="sm" aria-label="Less time" onClick={() => editSlide(selected, { plannedSec: Math.max(step, sel.plannedSec - step) })}>
                  −
                </Button>
                <span className="num w-12 text-center text-sm font-semibold">{mmss(sel.plannedSec)}</span>
                <Button size="sm" aria-label="More time" onClick={() => editSlide(selected, { plannedSec: sel.plannedSec + step })}>
                  +
                </Button>
              </div>
            </div>
            <label className="mt-3 block text-xs text-muted" htmlFor="point">
              The point this slide needs to land
            </label>
            <input id="point" className="mt-1 w-full rounded-lg bg-panel px-3 py-2 text-sm outline-none shadow-[inset_0_0_0_1px_var(--color-line-strong)] focus:shadow-[inset_0_0_0_1px_var(--color-blue-soft)]" value={sel.point} onChange={(e) => editSlide(selected, { point: e.target.value })} maxLength={160} placeholder="One sentence the audience should take away" />
            {selected + 1 !== askSlide && (
              <button type="button" onClick={() => setAskSlide(selected + 1)} className="mt-2 text-xs font-semibold text-blue-soft hover:underline">
                This slide makes the ask
              </button>
            )}
          </div>
        )}
        {slides.length > 0 && total !== limitSec && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-[10px] bg-red/10 px-4 py-3 text-[13px]">
            <span className="text-red-soft">
              Planned {mmss(total)}, {total > limitSec ? `${mmss(total - limitSec)} over` : `${mmss(limitSec - total)} under`} your {mmss(limitSec)}.
            </span>
            <Button size="sm" onClick={fit}>
              Fit to {mmss(limitSec)}
            </Button>
          </div>
        )}
        {warnings.slice(0, sel ? 1 : 2).map((w) => {
          const [head, ...rest] = w.split(/(?<=\.)\s+/);
          return (
            <div key={w} className="mt-3 flex items-start gap-2.5 rounded-[10px] bg-panel-2 px-4 py-3.5 text-sm leading-normal">
              <Icon name="flag" size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-red-soft" />
              <span>
                <span className="font-semibold">{head}</span> <span className="text-muted">{rest.join(" ")}</span>
              </span>
            </div>
          );
        })}
      </Panel>
    </form>
  );
}
