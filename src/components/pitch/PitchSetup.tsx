"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button, Icon, type IconName } from "@/components/ui";
import { SlideView } from "./SlideView";
import { parseNotes, parsePdf, parsePptx, suggestTitle, type ParsedSlide } from "./parse-slides";
import { fitToLimit, stepFor } from "@/lib/pitch/timing";
import { londonIso } from "@/lib/dates";
import { mmss } from "@/lib/format";
import type { Audience, Presentation, QaStyle, SlideLayout } from "@/lib/pitch/types";

export interface EditableSlide {
  title: string;
  lines: string[];
  notes?: string;
  layout?: SlideLayout;
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

export const PRESENTATION_TYPES = [
  { id: "job-interview", label: "Job interview presentation", icon: "brief" as IconName },
  { id: "leadership-update", label: "Leadership update", icon: "users" as IconName },
  { id: "client-presentation", label: "Client presentation", icon: "user" as IconName },
  { id: "investor-pitch", label: "Investor pitch", icon: "chart" as IconName },
  { id: "team-update", label: "Team update", icon: "users" as IconName },
  { id: "conference-talk", label: "Conference talk", icon: "mic" as IconName },
  { id: "training-workshop", label: "Training or workshop", icon: "graduationCap" as IconName },
  { id: "board-presentation", label: "Board presentation", icon: "bank" as IconName },
  { id: "sales-pitch", label: "Sales pitch", icon: "megaphone" as IconName },
  { id: "other", label: "Other", icon: "moreHorizontal" as IconName },
] as const;

export const AUDIENCE_OPTIONS: { id: Audience | "other"; label: string; icon: IconName }[] = [
  { id: "investors", label: "Investors", icon: "chart" },
  { id: "leadership", label: "Leadership team", icon: "users" },
  { id: "client", label: "Clients", icon: "brief" },
  { id: "team", label: "My team", icon: "users" },
  { id: "other", label: "Other", icon: "moreHorizontal" },
];

export const AUDIENCE_SIZES = ["1 - 4 people", "5 - 10 people", "10 - 25 people", "25 - 50 people", "50+ people"];

export const DEFAULT_DEMO_SLIDES: EditableSlide[] = [
  {
    title: "Introduction",
    lines: ["Q1 Product Roadmap & Strategic Initiatives"],
    plannedSec: 45,
    point: "Set the context and objective",
    image: null,
  },
  {
    title: "Current performance",
    lines: ["Strong engagement and user retention growth across core features"],
    plannedSec: 90,
    point: "Summarise key results and insights",
    image: null,
  },
  {
    title: "Q1 roadmap",
    lines: ["Core deliverables: checkout optimization, automated risk signals"],
    plannedSec: 180,
    point: "Outline the proposed roadmap",
    image: null,
  },
  {
    title: "Impact & investment",
    lines: ["Resource allocation and revenue projections for the upcoming quarter"],
    plannedSec: 120,
    point: "Show expected benefits and costs",
    image: null,
  },
  {
    title: "Next steps",
    lines: ["Team milestones, sign-off schedule and key review dates"],
    plannedSec: 75,
    point: "Confirm the ask and timeline",
    image: null,
  },
];

const LIMITS = [3, 5, 8, 10, 12, 15, 20, 30, 45, 60];

export function PitchSetup({ initial }: { initial: SetupInitial }) {
  const router = useRouter();
  const editing = Boolean(initial.id);
  const fileRef = useRef<HTMLInputElement>(null);

  // Core state
  const [slides, setSlides] = useState<EditableSlide[]>(initial.slides.length > 0 ? initial.slides : DEFAULT_DEMO_SLIDES);
  const [hasCustomSlides, setHasCustomSlides] = useState(initial.slides.length > 0);
  const [source, setSource] = useState(initial.source);
  const [title, setTitle] = useState(initial.title || "Q1 product roadmap");
  const [presentationType, setPresentationType] = useState<string>("Job interview (case study)");
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [audience, setAudience] = useState<Audience | "other">(initial.audience || "leadership");
  const [audienceSize, setAudienceSize] = useState("5 - 10 people");
  const [keyMessage, setKeyMessage] = useState("A proposal for the Q1 product roadmap and investment");
  const [ask, setAsk] = useState(initial.ask || "Approve the roadmap and required resources");
  const [when, setWhen] = useState({ date: initial.date || "2026-11-16", time: initial.time || "09:30" });
  const [limitMin, setLimitMin] = useState(initial.limitMin || 10);
  const [qa, setQa] = useState<QaStyle | "none">(initial.qaStyle ?? "sceptical");
  const [specificQuestions, setSpecificQuestions] = useState("");
  const [askSlide, setAskSlide] = useState(initial.askSlide || 1);
  const [warnings, setWarnings] = useState(initial.warnings || []);
  const [planBy, setPlanBy] = useState(initial.planBy);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [editingTiming, setEditingTiming] = useState(false);

  const [reading, setReading] = useState<{ done: number; total: number } | null>(null);
  const [planning, setPlanning] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [additionalSettingsOpen, setAdditionalSettingsOpen] = useState(false);

  const limitSec = limitMin * 60;
  const totalSec = slides.reduce((a, s) => a + s.plannedSec, 0);

  /** Ask for suggested timing and points for uploaded slides. */
  const plan = useCallback(
    async (deck: EditableSlide[], opts?: { ask?: string; audience?: Audience; limitSec?: number; title?: string }) => {
      if (!deck.length) return;
      setPlanning(true);
      try {
        const res = await fetch("/api/presentations/plan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: opts?.title ?? title,
            audience: opts?.audience ?? (audience === "other" ? "leadership" : audience),
            ask: opts?.ask ?? ask,
            limitSec: opts?.limitSec ?? limitSec,
            slides: deck.map((s) => ({ title: s.title, lines: s.lines, ...(s.notes ? { notes: s.notes } : {}) })),
          }),
        });
        const json = await res.json();
        if (!res.ok) return;
        setSlides((cur) => cur.map((s, i) => ({ ...s, plannedSec: json.slides[i]?.plannedSec ?? s.plannedSec, point: json.slides[i]?.point ?? s.point })));
        setAskSlide(json.askSlide ?? 1);
        setWarnings(json.warnings ?? []);
        setPlanBy(json.planBy ?? "model");
      } catch {
        setProblem("Couldn’t work out the timing. You can adjust the times manually below.");
      } finally {
        setPlanning(false);
      }
    },
    [ask, audience, limitSec, title],
  );

  const takeSlides = useCallback(
    (parsed: ParsedSlide[], src: Presentation["source"]) => {
      const even = fitToLimit(parsed.map(() => 1), limitSec);
      const deck: EditableSlide[] = parsed.map((s, i) => ({
        title: s.title,
        lines: s.lines,
        notes: s.notes,
        layout: s.layout,
        image: s.image ?? null,
        plannedSec: even[i],
        point: "",
      }));
      setSlides(deck);
      setHasCustomSlides(true);
      setSource(src);
      setActiveSlideIndex(0);
      setWarnings([]);
      const name = editing ? title : suggestTitle(src.fileName ?? null, parsed);
      setTitle(name);
      void plan(deck, { title: name });
    },
    [limitSec, editing, title, plan],
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    setSaving(true);
    const form = new FormData();
    const effectiveAudience: Audience = audience === "other" ? "leadership" : audience;
    const data = {
      title: title.trim() || "My presentation",
      audience: effectiveAudience,
      ask: ask.trim() || keyMessage.trim(),
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

  const currentPreviewSlide = slides[activeSlideIndex] ?? slides[0];

  return (
    <form onSubmit={submit} className="grid grid-cols-1 xl:grid-cols-[1.28fr_0.82fr] gap-6 items-start pb-16">
      {/* LEFT COLUMN: Setup Form Sections 1, 2, 3 */}
      <div className="flex flex-col gap-5">
        {/* SECTION 1: Presentation details */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl">
          <div className="flex items-center gap-2.5 pb-5 border-b border-white/[0.07]">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue text-xs font-bold text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]">
              1
            </span>
            <h2 className="text-base font-semibold text-white tracking-tight">Presentation details</h2>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Presentation Name */}
            <div>
              <label htmlFor="p-name" className="block text-xs font-semibold text-muted mb-2">
                Presentation name *
              </label>
              <div className="relative">
                <input
                  id="p-name"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q1 product roadmap"
                  className="w-full h-11 rounded-xl bg-[#141326] border border-white/10 px-3.5 text-sm text-white placeholder:text-muted/50 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue transition-all"
                  required
                />
              </div>
            </div>

            {/* Presentation Type Dropdown */}
            <div className="relative">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted mb-2">
                Presentation type *
                <Icon name="info" size={13} className="text-muted hover:text-white cursor-pointer" />
              </label>
              <button
                type="button"
                onClick={() => setTypeDropdownOpen((o) => !o)}
                className="w-full h-11 rounded-xl bg-[#141326] border border-white/10 px-3.5 text-sm text-white flex items-center justify-between hover:border-white/20 transition-all text-left"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon name="brief" size={16} className="text-blue-soft shrink-0" />
                  <span className="truncate">{presentationType}</span>
                </div>
                <Icon name="chevronDown" size={15} className={clsx("text-muted shrink-0 transition-transform", typeDropdownOpen && "rotate-180")} />
              </button>

              {/* Exact 10 options matching mockup */}
              {typeDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1.5 py-1.5 rounded-xl bg-[#16152b] border border-white/15 shadow-2xl backdrop-blur-md max-h-72 overflow-y-auto">
                  {PRESENTATION_TYPES.map((pt) => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => {
                        setPresentationType(pt.label);
                        setTypeDropdownOpen(false);
                      }}
                      className={clsx(
                        "w-full px-3.5 py-2.5 flex items-center gap-3 text-sm text-left transition-colors",
                        presentationType === pt.label ? "bg-blue/20 text-white font-medium" : "text-[#c9cad3] hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      <Icon name={pt.icon} size={16} className={presentationType === pt.label ? "text-blue-soft" : "text-muted"} />
                      <span>{pt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upload Slides Dropzone */}
          <div className="mt-5">
            <div
              className={clsx(
                "rounded-xl border-2 border-dashed p-6 transition-all flex flex-col sm:flex-row items-center justify-between gap-4",
                dragging ? "border-blue bg-blue/10" : "border-white/15 bg-[#121124]/60 hover:border-white/25"
              )}
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
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue/15 text-blue-soft border border-blue/30 shadow-inner">
                  <Icon name="cloudUpload" size={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Upload your slides</div>
                  <div className="text-xs text-muted mt-0.5">PowerPoint (.pptx) or PDF (up to 50 MB)</div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={Boolean(reading)}
                  className="pro-btn-glow px-4"
                >
                  {reading ? "Reading..." : hasCustomSlides ? "Replace file" : "Choose file"}
                </Button>
                <span className="text-xs text-muted font-medium">Or</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setNotesOpen((o) => !o)}
                  className="border border-white/10 hover:bg-white/[0.05] text-white flex items-center gap-1.5"
                >
                  <Icon name="doc" size={14} className="text-muted" />
                  Paste notes
                </Button>
              </div>

              <input
                id="slides-file-input"
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

            {/* Pasted notes area */}
            {notesOpen && (
              <div className="mt-3.5 rounded-xl bg-[#141326] p-4 border border-white/10 animate-rise">
                <textarea
                  aria-label="Your notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder={"Paste presentation notes or outline here.\nOne slide per paragraph. The first line of each becomes its title."}
                  className="w-full resize-y bg-transparent text-sm leading-relaxed outline-none text-white placeholder:text-muted/60"
                />
                <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.08] pt-3">
                  <Button
                    type="button"
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
                  <Button type="button" size="sm" variant="ghost" onClick={() => setNotesOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Audience & message */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl">
          <div className="flex items-center gap-2.5 pb-5 border-b border-white/[0.07]">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue text-xs font-bold text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]">
              2
            </span>
            <h2 className="text-base font-semibold text-white tracking-tight">Audience & message</h2>
          </div>

          <div className="mt-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-2.5">
                  Who are you presenting to? *
                </label>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCE_OPTIONS.map((opt) => {
                    const active = audience === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAudience(opt.id)}
                        className={clsx(
                          "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border",
                          active
                            ? "bg-blue border-blue-soft text-white shadow-[0_0_16px_rgba(79,70,229,0.4)]"
                            : "bg-[#141326] border-white/10 text-muted hover:text-white hover:border-white/20"
                        )}
                      >
                        <Icon name={opt.icon} size={14} className={active ? "text-white" : "text-muted"} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audience size */}
              <div className="lg:w-48 shrink-0">
                <label className="block text-xs font-semibold text-muted mb-2">
                  Audience size (optional)
                </label>
                <select
                  value={audienceSize}
                  onChange={(e) => setAudienceSize(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#141326] border border-white/10 px-3 text-xs text-white [color-scheme:dark] focus:border-blue focus:outline-none"
                >
                  {AUDIENCE_SIZES.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key message */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted mb-2">
                  What&apos;s your key message? *
                  <Icon name="info" size={13} className="text-muted hover:text-white cursor-pointer" />
                </label>
                <input
                  type="text"
                  value={keyMessage}
                  onChange={(e) => setKeyMessage(e.target.value)}
                  placeholder="e.g. A proposal for the Q1 product roadmap"
                  className="w-full h-11 rounded-xl bg-[#141326] border border-white/10 px-3.5 text-sm text-white placeholder:text-muted/50 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue transition-all"
                  required
                />
              </div>

              {/* What do you want them to do? */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted mb-2">
                  What do you want them to do? *
                  <Icon name="info" size={13} className="text-muted hover:text-white cursor-pointer" />
                </label>
                <input
                  type="text"
                  value={ask}
                  onChange={(e) => setAsk(e.target.value)}
                  placeholder="e.g. Approve the roadmap and required resources"
                  className="w-full h-11 rounded-xl bg-[#141326] border border-white/10 px-3.5 text-sm text-white placeholder:text-muted/50 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue transition-all"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Rehearsal settings */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl">
          <div className="flex items-center gap-2.5 pb-5 border-b border-white/[0.07]">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue text-xs font-bold text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]">
              3
            </span>
            <h2 className="text-base font-semibold text-white tracking-tight">Rehearsal settings</h2>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Presentation length */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-2">
                Presentation length *
              </label>
              <div className="relative">
                <select
                  value={limitMin}
                  onChange={(e) => setLimitMin(Number(e.target.value))}
                  className="w-full h-11 rounded-xl bg-[#141326] border border-white/10 pl-9 pr-8 text-sm text-white [color-scheme:dark] focus:border-blue focus:outline-none"
                >
                  {LIMITS.map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </select>
                <Icon name="clock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>

            {/* Q&A style */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted mb-2">
                Q&A style *
                <Icon name="info" size={13} className="text-muted hover:text-white cursor-pointer" />
              </label>
              <div className="relative">
                <select
                  value={qa}
                  onChange={(e) => setQa(e.target.value as QaStyle | "none")}
                  className="w-full h-11 rounded-xl bg-[#141326] border border-white/10 pl-9 pr-8 text-sm text-white [color-scheme:dark] focus:border-blue focus:outline-none"
                >
                  <option value="sceptical">Challenging</option>
                  <option value="probing">Realistic</option>
                  <option value="supportive">Friendly</option>
                  <option value="none">None</option>
                </select>
                <Icon name="chart" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>

            {/* Specific questions */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-2">
                Include specific questions (optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={specificQuestions}
                  onChange={(e) => setSpecificQuestions(e.target.value)}
                  placeholder="e.g. How did you prioritise these initiatives?"
                  className="w-full h-11 rounded-xl bg-[#141326] border border-white/10 pl-9 pr-3.5 text-sm text-white placeholder:text-muted/50 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue transition-all"
                />
                <Icon name="chat" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-2">
                Date (optional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={when.date}
                  onChange={(e) => setWhen({ ...when, date: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#141326] border border-white/10 pl-9 pr-3.5 text-sm text-white [color-scheme:dark] focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue transition-all"
                />
                <Icon name="cal" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Additional settings */}
          <div className="mt-4 border-t border-white/[0.06] pt-3">
            <button
              type="button"
              onClick={() => setAdditionalSettingsOpen((o) => !o)}
              className="text-xs font-medium text-muted hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>Additional settings</span>
              <Icon name="chevronDown" size={14} className={clsx("transition-transform", additionalSettingsOpen && "rotate-180")} />
            </button>
            {additionalSettingsOpen && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#141326] border border-white/10 text-xs text-muted leading-relaxed animate-rise">
                Rehearsal feedback includes pacing alerts, filler word counts, and an audience persona score calibrated to {audience}.
              </div>
            )}
          </div>
        </div>

        {/* Start Rehearsal Button */}
        {problem && (
          <p role="alert" className="rounded-xl bg-red/10 border border-red/20 px-4 py-2.5 text-xs text-red-soft">
            {problem}
          </p>
        )}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={saving || Boolean(reading)}
            className="pro-btn-glow w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2.5 shadow-xl hover:scale-[1.01] transition-transform"
          >
            <Icon name="mic" size={18} />
            <span>{saving ? "Setting up..." : "Start rehearsal →"}</span>
          </Button>
        </div>
      </div>

      {/* RIGHT COLUMN: Slide plan & suggested timing + How Hakkiri will help you */}
      <div className="flex flex-col gap-5">
        {/* Card 1: Slide plan & suggested timing */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl">
          <div className="flex items-center gap-2.5 pb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue/15 text-blue-soft">
              <Icon name="present" size={16} />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">Slide plan & suggested timing</h3>
          </div>
          <p className="text-xs text-muted leading-relaxed pb-4 border-b border-white/[0.07]">
            Based on your slides, here&apos;s a suggested structure. You can adjust this after upload.
          </p>

          {/* Carousel Preview */}
          <div className="mt-4 flex items-center justify-between gap-3 p-3 rounded-xl bg-[#141326] border border-white/10">
            <button
              type="button"
              onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
              disabled={activeSlideIndex === 0}
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/[0.07] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <Icon name="chevronRight" size={16} className="rotate-180" />
            </button>

            {/* Thumbnail */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-24 h-16 shrink-0 rounded-lg bg-white overflow-hidden shadow-md flex flex-col justify-between p-1.5 border border-white/20">
                <div className="text-[8px] font-bold text-gray-900 leading-tight">Q1 Product Roadmap</div>
                <div className="h-4 w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-sm opacity-80" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  Slide {activeSlideIndex + 1}: {currentPreviewSlide?.title}
                </div>
                <div className="text-[11px] text-muted truncate mt-0.5">{currentPreviewSlide?.point}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted num font-medium whitespace-nowrap">
                {activeSlideIndex + 1} of {slides.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
                disabled={activeSlideIndex === slides.length - 1}
                className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/[0.07] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <Icon name="chevronRight" size={16} />
              </button>
            </div>
          </div>

          {/* Slides Table */}
          <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.08]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141326] text-muted border-b border-white/[0.08]">
                <tr>
                  <th className="py-2.5 px-3 font-medium w-8">#</th>
                  <th className="py-2.5 px-3 font-medium">Slide title</th>
                  <th className="py-2.5 px-3 font-medium">Key message</th>
                  <th className="py-2.5 px-3 font-medium text-right w-16">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-[#c9cad3]">
                {slides.map((s, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={clsx(
                      "cursor-pointer hover:bg-white/[0.03] transition-colors",
                      activeSlideIndex === idx && "bg-blue/10 text-white"
                    )}
                  >
                    <td className="py-2.5 px-3 num text-muted">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-white truncate max-w-[110px]">{s.title}</td>
                    <td className="py-2.5 px-3 text-muted truncate max-w-[140px]">{s.point || s.lines[0]}</td>
                    <td className="py-2.5 px-3 num text-right text-muted">{mmss(s.plannedSec)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit timing link */}
          <div className="mt-3.5 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setEditingTiming((e) => !e)}
              className="text-muted hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Icon name="edit" size={13} />
              <span>Edit timing</span>
            </button>
            <span className="num text-muted">
              Total: {mmss(totalSec)} / {limitMin}:00
            </span>
          </div>

          {editingTiming && (
            <div className="mt-3 p-3 rounded-xl bg-[#141326] border border-white/10 space-y-2 text-xs">
              {slides.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <span className="truncate text-white max-w-[180px]">{idx + 1}. {s.title}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={10}
                      step={5}
                      value={s.plannedSec}
                      onChange={(e) => {
                        const sec = Math.max(10, Number(e.target.value));
                        setSlides((cur) => cur.map((item, i) => (i === idx ? { ...item, plannedSec: sec } : item)));
                      }}
                      className="w-16 h-7 rounded bg-[#1f1e35] px-2 text-right num text-white border border-white/10"
                    />
                    <span className="text-muted">sec</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: How Hakkiri will help you */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl">
          <div className="flex items-center gap-2 pb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue/15 text-blue-soft">
              <Icon name="sparkle" size={15} />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-tight">How Hakkiri will help you</h3>
          </div>

          <div className="space-y-3 mt-1">
            <div className="flex items-start gap-2.5 text-xs text-[#c9cad3] leading-relaxed">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mt-0.5">
                <Icon name="check" size={11} strokeWidth={2.6} />
              </div>
              <div>
                <strong className="text-white font-medium">Prepare</strong> — turn your slides into a clear, focused story.
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-[#c9cad3] leading-relaxed">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mt-0.5">
                <Icon name="check" size={11} strokeWidth={2.6} />
              </div>
              <div>
                <strong className="text-white font-medium">Practise</strong> — rehearse your delivery with real-time feedback.
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-[#c9cad3] leading-relaxed">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mt-0.5">
                <Icon name="check" size={11} strokeWidth={2.6} />
              </div>
              <div>
                <strong className="text-white font-medium">Improve</strong> — get personalised advice on structure, clarity and pacing.
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-[#c9cad3] leading-relaxed">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mt-0.5">
                <Icon name="check" size={11} strokeWidth={2.6} />
              </div>
              <div>
                <strong className="text-white font-medium">Prepare for questions</strong> — practise a realistic Q&A with your chosen audience.
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
