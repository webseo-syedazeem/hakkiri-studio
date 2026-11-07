"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { Button, Crumbs, Icon, Panel } from "@/components/ui";
import { pastedDocument, readDocument, type ReadDoc } from "./read-docs";

/* ------------------------------------------------------------------ DocField */
export function DocField({
  id,
  label,
  doc,
  setDoc,
  optional,
  onProblem,
}: {
  id: string;
  label: string;
  doc: ReadDoc | null;
  setDoc: (d: ReadDoc | null) => void;
  optional?: boolean;
  onProblem: (m: string | null) => void;
}) {
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
        className="flex h-[46px] items-center gap-3 rounded-[10px] bg-panel-2 px-3.5 text-sm shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
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
        {doc && <Icon name="check" size={16} strokeWidth={2.4} className="shrink-0 text-blue-soft" />}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          aria-label={`${doc ? "Replace" : "Choose file"}: ${label}`}
          className="shrink-0 text-[13px] font-semibold text-blue-soft hover:underline cursor-pointer"
        >
          {doc ? "Replace" : "Choose file"}
        </button>
        {!doc && (
          <button
            type="button"
            onClick={() => setPasting(!pasting)}
            aria-label={`Paste: ${label}`}
            aria-expanded={pasting}
            className="shrink-0 text-[13px] font-semibold text-blue-soft hover:underline cursor-pointer"
          >
            Paste
          </button>
        )}
        {doc && (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            onClick={() => setDoc(null)}
            className="shrink-0 text-muted hover:text-ink cursor-pointer"
          >
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
          <textarea
            aria-label={`${label} text`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder={`Paste your ${label.toLowerCase()} here`}
            className="w-full resize-y bg-transparent text-sm leading-relaxed outline-none placeholder:text-dim"
          />
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="primary"
              disabled={text.split(/\s+/).filter(Boolean).length < (optional ? 20 : 40)}
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

export interface StageItem {
  id: string;
  name: string;
  date: string;
  time: string;
  format: string;
  interviewer: string;
  status: "completed" | "next" | "not_scheduled";
  icon: "phone" | "code" | "present" | "users";
}

export function InterviewSetup() {
  const router = useRouter();

  // Wizard Step (1: Job details, 2: Stages, 3: Practice setup, 4: Review)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Job Details State
  const [companyName, setCompanyName] = useState("Halden");
  const [jobTitle, setJobTitle] = useState("Senior Product Manager, Payments");
  const [companyWebsite, setCompanyWebsite] = useState("https://halden.com");
  const [cvDoc, setCvDoc] = useState<{ name: string; uploaded: boolean }>({
    name: "Sazia_Aktar_CV.pdf",
    uploaded: true,
  });
  const [jobDoc, setJobDoc] = useState<{ name: string; uploaded: boolean }>({
    name: "Job_description.pdf",
    uploaded: true,
  });
  const [coverDoc, setCoverDoc] = useState<{ name: string; uploaded: boolean } | null>(null);

  const cvInputRef = useRef<HTMLInputElement>(null);
  const jobInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Stages State
  const [stagesExpectation, setStagesExpectation] = useState<"single" | "multiple" | "unsure">("multiple");
  const [stages, setStages] = useState<StageItem[]>([
    {
      id: "1",
      name: "Recruiter screen",
      date: "12 Nov 2026",
      time: "09:30",
      format: "Video call",
      interviewer: "Recruiter",
      status: "completed",
      icon: "phone",
    },
    {
      id: "2",
      name: "Hiring manager interview",
      date: "12 Nov 2026",
      time: "10:00",
      format: "Video call",
      interviewer: "Hiring manager",
      status: "next",
      icon: "code",
    },
    {
      id: "3",
      name: "Technical round",
      date: "13 Nov 2026",
      time: "11:00",
      format: "Video call",
      interviewer: "Tech lead",
      status: "not_scheduled",
      icon: "present",
    },
    {
      id: "4",
      name: "Final panel",
      date: "14 Nov 2026",
      time: "15:00",
      format: "Video call",
      interviewer: "Leadership",
      status: "not_scheduled",
      icon: "users",
    },
  ]);

  // Step 3: Practice Setup State
  const [selectedRounds, setSelectedRounds] = useState<string[]>(["1", "3"]); // Recruiter screen and Technical round
  const [techFocus, setTechFocus] = useState(50);
  const [skillsFocus, setSkillsFocus] = useState(30);
  const [expFocus, setExpFocus] = useState(20);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [duration, setDuration] = useState<10 | 20 | 30 | 45>(30);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Loading & Submission State
  const [isBuilding, setIsBuilding] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const saveDraft = () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  };

  const handleBuildInterview = async () => {
    setIsBuilding(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          company: { name: companyName.trim(), url: companyWebsite.trim() },
          job: {
            title: jobTitle.trim(),
            text: "Payments software, metrics, roadmap execution and fraud risk trade-offs.",
            label: jobDoc.name,
          },
          cv: { text: "CV text for " + companyName, label: cvDoc.name },
          format: "video",
          settings: {
            difficulty: difficulty.toLowerCase(),
            minutes: duration,
            preset: "balanced",
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string };
      const destId = data.id || "halden";
      router.push(`/interviews/${destId}?new=1`);
      router.refresh();
    } catch {
      router.push("/interviews/halden?new=1");
    }
  };

  // Stepper Items
  const STEPS = [
    { num: 1, label: "Job details" },
    { num: 2, label: "Interview stages" },
    { num: 3, label: "Practice setup" },
    { num: 4, label: "Review" },
  ];

  const headerTitle =
    step === 2
      ? "Set up your interview stages"
      : step === 3
        ? "Practice setup"
        : "Set up your interview";

  const headerSubtitle =
    step === 3
      ? "Choose how to practise for your interview rounds."
      : "Build personalised practice for every stage of your interview.";

  return (
    <div className="flex w-full grow flex-col gap-6">
      {/* Wizard Header with Breadcrumb and Step Stepper */}
      <div className="flex flex-col gap-4 border-b border-line pb-5">
        <Crumbs
          items={[
            { label: "Interviews", href: "/interviews" },
            { label: "New interview" },
          ]}
        />

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.025em] text-ink sm:text-[34px]">
              {headerTitle}
            </h1>
            <p className="mt-1 text-[14px] text-muted">{headerSubtitle}</p>
          </div>

          {/* Stepper with Circles and Labels Positioned Below */}
          <div className="flex items-start">
            {STEPS.map((s, idx) => {
              const isPast = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="flex items-center">
                  {idx > 0 && (
                    <div
                      className={clsx(
                        "h-[2px] w-6 sm:w-10 lg:w-14 -translate-y-3 transition-colors duration-300",
                        step >= s.num ? "bg-blue-fill" : "bg-white/[0.12]"
                      )}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setStep(s.num as 1 | 2 | 3 | 4)}
                    className="group flex flex-col items-center gap-1.5 cursor-pointer transition-transform active:scale-95 px-1"
                  >
                    <div
                      className={clsx(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                        isPast && "bg-blue-fill text-white shadow-[0_0_12px_rgba(74,90,240,0.5)]",
                        isCurrent && "bg-blue-fill text-white ring-4 ring-blue-fill/20 shadow-[0_0_14px_rgba(74,90,240,0.6)]",
                        !isPast && !isCurrent && "border border-white/20 bg-transparent text-muted"
                      )}
                    >
                      {isPast ? <Icon name="check" size={12} strokeWidth={3} /> : s.num}
                    </div>
                    <span
                      className={clsx(
                        "text-[11px] transition-colors whitespace-nowrap",
                        isCurrent ? "font-bold text-ink" : "text-muted group-hover:text-ink font-medium"
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {draftSaved && (
        <div className="animate-fade-in flex items-center gap-2 rounded-xl bg-blue/15 px-4 py-2.5 text-xs font-semibold text-blue-soft shadow-sm">
          <Icon name="check" size={14} strokeWidth={2.4} /> Draft saved successfully.
        </div>
      )}

      {/* Main Form Grid with Left Content and Right Overview Sidebar */}
      <div className="grid w-full grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ============================================================== */}
        {/* STEP 1: JOB DETAILS */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="flex animate-rise flex-col gap-6">
            <Panel className="rounded-[20px] p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
              {/* Box 1 Header */}
              <div className="flex items-start gap-3.5 border-b border-line pb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#1a2238] text-[#818cf8] shadow-sm">
                  <Icon name="brief" size={20} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-ink">Job details</h2>
                  <p className="mt-0.5 text-[13px] text-muted">
                    Tell us about the role. We&apos;ll use this to create tailored interview questions.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="mt-5 flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-ink">
                      Company name <span className="text-red-soft">*</span>
                    </label>
                    <div className="flex h-[46px] items-center gap-3 rounded-[12px] bg-panel-2 px-3.5 shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all focus-within:shadow-[inset_0_0_0_1.5px_var(--color-blue)]">
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Halden"
                        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-dim"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-ink">
                      Job title <span className="text-red-soft">*</span>
                    </label>
                    <div className="flex h-[46px] items-center gap-3 rounded-[12px] bg-panel-2 px-3.5 shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all focus-within:shadow-[inset_0_0_0_1.5px_var(--color-blue)]">
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Senior Product Manager, Payments"
                        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-dim"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-ink">
                    Company website <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <div className="flex h-[46px] items-center gap-3 rounded-[12px] bg-panel-2 px-3.5 shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all focus-within:shadow-[inset_0_0_0_1.5px_var(--color-blue)]">
                    <input
                      type="text"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://halden.com"
                      className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-dim"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    Hakkiri can use the company&apos;s website to help tailor your preparation.
                  </p>
                </div>

                {/* Box 2: Your Documents */}
                <div className="border-t border-line pt-5">
                  <h3 className="text-[15px] font-bold text-ink">Your documents</h3>
                  <p className="mt-0.5 text-xs text-muted">
                    Upload your CV and job description, or paste the text instead.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* CV Card */}
                    <div className="flex flex-col justify-between rounded-[14px] bg-panel-2 p-3.5 shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all hover:shadow-[inset_0_0_0_1px_var(--color-line)]">
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                        <Icon name="doc" size={15} className="text-blue-soft" />
                        <span>Your CV</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-[10px] bg-[#141620] px-3 py-2 border border-line/60">
                        <span className="truncate text-xs font-medium text-ink">
                          {cvDoc.name}
                        </span>
                        <Icon name="check" size={15} strokeWidth={2.5} className="text-[#10b981] shrink-0" />
                      </div>
                      <input
                        ref={cvInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setCvDoc({ name: file.name, uploaded: true });
                        }}
                      />
                    </div>

                    {/* Job Description Card */}
                    <div className="flex flex-col justify-between rounded-[14px] bg-panel-2 p-3.5 shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all hover:shadow-[inset_0_0_0_1px_var(--color-line)]">
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                        <Icon name="doc" size={15} className="text-blue-soft" />
                        <span>Job description</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-[10px] bg-[#141620] px-3 py-2 border border-line/60">
                        <span className="truncate text-xs font-medium text-ink">
                          {jobDoc.name}
                        </span>
                        <Icon name="check" size={15} strokeWidth={2.5} className="text-[#10b981] shrink-0" />
                      </div>
                      <input
                        ref={jobInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setJobDoc({ name: file.name, uploaded: true });
                        }}
                      />
                    </div>

                    {/* Cover Letter Card */}
                    <div className="flex flex-col justify-between rounded-[14px] bg-panel-2 p-3.5 shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all hover:shadow-[inset_0_0_0_1px_var(--color-line)]">
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                        <Icon name="doc" size={15} className="text-dim" />
                        <span>Cover letter (optional)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="mt-3 flex items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-white/20 py-2 text-xs font-semibold text-muted hover:border-blue-soft hover:text-ink hover:bg-blue/10 transition-colors cursor-pointer"
                      >
                        <Icon name="plus" size={13} strokeWidth={2.2} />
                        <span>{coverDoc ? coverDoc.name : "+ Add a file"}</span>
                      </button>
                      <input
                        ref={coverInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setCoverDoc({ name: file.name, uploaded: true });
                        }}
                      />
                    </div>
                  </div>
                  <p className="mt-2.5 text-[11px] text-muted">
                    Accepted formats: PDF, DOC or DOCX. You can replace documents later.
                  </p>
                </div>

                {/* Blue Info Callout Banner */}
                <div className="flex items-start gap-3 rounded-[14px] bg-[#171d32] p-4 text-xs shadow-[inset_0_0_0_1px_#2b3658]">
                  <Icon name="sparkle" size={17} className="text-blue-soft shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-ink">
                      You&apos;ll name your interview stages next, and you can practise one or more rounds after setup.
                    </div>
                    <div className="mt-1 text-muted">
                      For example, you might add a recruiter screen, a technical round or a final panel, then choose which round(s) to practise.
                    </div>
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-line pt-5">
                  <Link
                    href="/interviews"
                    className="inline-flex h-[42px] items-center justify-center rounded-[11px] bg-panel-2 px-5 text-sm font-semibold text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink transition-all"
                  >
                    Cancel
                  </Link>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={saveDraft}
                      className="inline-flex h-[42px] items-center justify-center rounded-[11px] bg-panel-2 px-5 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2b2d38] transition-all cursor-pointer active:scale-95"
                    >
                      Save draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="group/btn relative overflow-hidden inline-flex h-[42px] items-center justify-center gap-2 rounded-[11px] bg-blue-fill px-6 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(74,90,240,0.35)] hover:bg-blue-hover hover:shadow-[0_0_24px_rgba(90,105,255,0.6)] active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="relative z-10">Continue to stages →</span>
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                    </button>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: INTERVIEW STAGES */}
        {/* ============================================================== */}
        {step === 2 && (
          <div className="flex animate-rise flex-col gap-6">
            <Panel className="rounded-[20px] p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
              {/* Card Header */}
              <div className="flex items-start gap-3.5 border-b border-line pb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#221c38] text-[#c084fc] shadow-sm">
                  <Icon name="layers" size={20} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-ink">Interview stages</h2>
                  <p className="mt-0.5 text-[13px] text-muted">
                    Add, rename, reorder and configure the stages in your interview. You can change them later.
                  </p>
                </div>
              </div>

              {/* Stage Expectations Radios */}
              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold text-ink">
                  How many stages are you expecting?
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { key: "single", label: "Single stage" },
                    { key: "multiple", label: "Multiple stages" },
                    { key: "unsure", label: "Not sure yet" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setStagesExpectation(opt.key as "single" | "multiple" | "unsure")}
                      className={clsx(
                        "flex items-center gap-3 rounded-[12px] p-3.5 text-xs font-semibold transition-all cursor-pointer",
                        stagesExpectation === opt.key
                          ? "bg-[#1c2237] text-white shadow-[inset_0_0_0_1.5px_#818cf8]"
                          : "bg-panel-2 text-muted shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink"
                      )}
                    >
                      <div
                        className={clsx(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                          stagesExpectation === opt.key
                            ? "border-blue-fill bg-blue-fill text-white"
                            : "border-white/20 bg-transparent"
                        )}
                      >
                        {stagesExpectation === opt.key && <Icon name="check" size={10} strokeWidth={3} />}
                      </div>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stages List */}
              <div className="mt-6 border-t border-line pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-[14px] font-bold text-ink">
                    Your interview stages ({stages.length})
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1.5"><Icon name="drag" size={13} /> Drag to reorder</span>
                    <span className="flex items-center gap-1.5"><Icon name="edit" size={13} /> Rename</span>
                    <span className="flex items-center gap-1.5"><Icon name="trash" size={13} /> Delete</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {stages.map((stg) => {
                    const isNext = stg.status === "next";
                    return (
                      <div
                        key={stg.id}
                        className={clsx(
                          "flex flex-wrap items-center justify-between gap-3 rounded-[14px] p-3.5 transition-all duration-200",
                          isNext
                            ? "bg-[#1c2237] shadow-[inset_0_0_0_1.5px_#6366f1,0_4px_20px_rgba(99,102,241,0.2)]"
                            : "bg-panel-2 shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
                        )}
                      >
                        {/* Drag Handle & Icon & Name */}
                        <div className="flex items-center gap-2.5 min-w-[220px] grow">
                          <Icon name="drag" size={16} className="text-dim cursor-grab shrink-0" />
                          <div
                            className={clsx(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]",
                              stg.icon === "phone" && "bg-[#142825] text-[#34d399]",
                              stg.icon === "code" && "bg-[#1a2238] text-[#818cf8]",
                              stg.icon === "present" && "bg-[#142825] text-[#34d399]",
                              stg.icon === "users" && "bg-[#241e38] text-[#c084fc]"
                            )}
                          >
                            <Icon name={stg.icon} size={15} />
                          </div>
                          <span className="text-sm font-semibold text-ink truncate">{stg.name}</span>
                          <button
                            type="button"
                            title="Rename stage"
                            className="text-muted hover:text-ink transition-colors cursor-pointer"
                          >
                            <Icon name="edit" size={13} />
                          </button>
                        </div>

                        {/* Date, Time, Format, Interviewer fields */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <div className="flex items-center gap-1.5 rounded-lg bg-[#12141c] px-2.5 py-1.5 text-muted border border-line">
                            <span className="text-[11px] text-dim">Date</span>
                            <Icon name="cal" size={12} />
                            <span>{stg.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 rounded-lg bg-[#12141c] px-2.5 py-1.5 text-muted border border-line">
                            <span className="text-[11px] text-dim">Time</span>
                            <Icon name="clock" size={12} />
                            <span>{stg.time}</span>
                          </div>
                          <div className="flex items-center gap-1 rounded-lg bg-[#12141c] px-2.5 py-1.5 text-muted border border-line">
                            <span className="text-[11px] text-dim">Format</span>
                            <span>{stg.format} ▾</span>
                          </div>
                          <div className="flex items-center gap-1 rounded-lg bg-[#12141c] px-2.5 py-1.5 text-muted border border-line">
                            <span className="text-[11px] text-dim">Interviewer</span>
                            <span>{stg.interviewer}</span>
                          </div>

                          {/* Status Badge */}
                          {stg.status === "completed" && (
                            <span className="rounded-full bg-[#10b981]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#10b981]">
                              Completed
                            </span>
                          )}
                          {stg.status === "next" && (
                            <span className="rounded-full bg-blue-fill/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-soft">
                              Next stage
                            </span>
                          )}
                          {stg.status === "not_scheduled" && (
                            <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-muted">
                              Not scheduled
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setStages(stages.filter((s) => s.id !== stg.id))}
                            className="p-1 text-dim hover:text-red-soft transition-colors cursor-pointer"
                            title="Delete stage"
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Stage Button */}
                <button
                  type="button"
                  onClick={() => {
                    const newId = String(stages.length + 1);
                    setStages([
                      ...stages,
                      {
                        id: newId,
                        name: "Custom Round " + newId,
                        date: "15 Nov 2026",
                        time: "11:00",
                        format: "Video call",
                        interviewer: "Hiring Manager",
                        status: "not_scheduled",
                        icon: "code",
                      },
                    ]);
                  }}
                  className="mt-4 flex items-center gap-1.5 rounded-[10px] bg-panel-2 px-4 py-2 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2b2d38] transition-colors cursor-pointer"
                >
                  <Icon name="plus" size={14} strokeWidth={2.2} />
                  <span>Add another stage</span>
                </button>

                {/* Step 2 Actions */}
                <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex h-[42px] items-center justify-center rounded-[11px] bg-panel-2 px-5 text-sm font-semibold text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink transition-all cursor-pointer"
                  >
                    ← Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={saveDraft}
                      className="inline-flex h-[42px] items-center justify-center rounded-[11px] bg-panel-2 px-5 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2b2d38] transition-all cursor-pointer active:scale-95"
                    >
                      Save draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="group/btn relative overflow-hidden inline-flex h-[42px] items-center justify-center gap-2 rounded-[11px] bg-blue-fill px-6 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(74,90,240,0.35)] hover:bg-blue-hover hover:shadow-[0_0_24px_rgba(90,105,255,0.6)] active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="relative z-10">Continue to practice setup →</span>
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                    </button>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: PRACTICE SETUP */}
        {/* ============================================================== */}
        {step === 3 && (
          <div className="flex animate-rise flex-col gap-6">
            <Panel className="rounded-[20px] p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
              {/* Card Header */}
              <div className="flex items-start gap-3.5 border-b border-line pb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#1a2238] text-[#818cf8] shadow-sm">
                  <Icon name="target" size={20} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-ink">Stages to practise</h2>
                  <p className="mt-0.5 text-[13px] text-muted">
                    Select one or more interview rounds to include in this practice session.
                  </p>
                </div>
              </div>

              {/* 4 Selectable Round Cards in 4-Column Layout */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { id: "1", title: "Recruiter screen", subtitle: "Background, motivation and fit." },
                  { id: "2", title: "Hiring manager round", subtitle: "Role, scope and impact." },
                  { id: "3", title: "Technical round", subtitle: "Product, technical depth and trade-offs." },
                  { id: "4", title: "Final panel", subtitle: "Cross-functional and leadership questions." },
                ].map((rnd) => {
                  const isChecked = selectedRounds.includes(rnd.id);
                  return (
                    <button
                      key={rnd.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedRounds(selectedRounds.filter((id) => id !== rnd.id));
                        } else {
                          setSelectedRounds([...selectedRounds, rnd.id]);
                        }
                      }}
                      className={clsx(
                        "flex flex-col text-left rounded-[14px] p-4 transition-all duration-200 cursor-pointer",
                        isChecked
                          ? "bg-[#1c2237] shadow-[inset_0_0_0_1.5px_#6366f1,0_4px_16px_rgba(99,102,241,0.2)]"
                          : "bg-panel-2 shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={clsx(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors",
                            isChecked ? "bg-blue-fill text-white" : "border border-white/20 bg-transparent"
                          )}
                        >
                          {isChecked && <Icon name="check" size={11} strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-semibold text-ink">{rnd.title}</span>
                      </div>
                      <p className="mt-2 text-xs text-muted pl-7 leading-relaxed">{rnd.subtitle}</p>
                    </button>
                  );
                })}
              </div>

              {/* Summary Pill */}
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-panel-2 px-3.5 py-2.5 text-xs text-muted">
                <span className="rounded bg-[#1e2544] px-2 py-0.5 font-semibold text-[#818cf8]">
                  {selectedRounds.length} stages selected
                </span>
                <span>
                  {selectedRounds
                    .map((id) => stages.find((s) => s.id === id)?.name || "Stage")
                    .join(", ")}
                </span>
              </div>

              {/* Question Focus Sliders */}
              <div className="mt-6 border-t border-line pt-5">
                <h3 className="text-[14px] font-bold text-ink">Question focus</h3>
                <p className="mt-0.5 text-xs text-muted">
                  Set the question mix across your selected stages.
                </p>

                <div className="mt-4 flex flex-col gap-4">
                  {/* Technical Bar */}
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-xs font-semibold text-ink shrink-0">Technical</span>
                    <div className="relative h-2 grow rounded-full bg-[#171d32] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0.6)] transition-all duration-300"
                        style={{ width: `${techFocus}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-semibold text-ink num">{techFocus}%</span>
                  </div>

                  {/* Skills Bar */}
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-xs font-semibold text-ink shrink-0">Skills</span>
                    <div className="relative h-2 grow rounded-full bg-[#171d32] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0.6)] transition-all duration-300"
                        style={{ width: `${skillsFocus}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-semibold text-ink num">{skillsFocus}%</span>
                  </div>

                  {/* Experience Bar */}
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-xs font-semibold text-ink shrink-0">Experience</span>
                    <div className="relative h-2 grow rounded-full bg-[#171d32] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0.6)] transition-all duration-300"
                        style={{ width: `${expFocus}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-semibold text-ink num">{expFocus}%</span>
                  </div>
                </div>
              </div>

              {/* Controls Row: Difficulty & Duration */}
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 border-t border-line pt-5">
                {/* Difficulty */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-ink">Difficulty</label>
                  <div className="inline-flex rounded-xl bg-panel-2 p-1 shadow-[inset_0_0_0_1px_var(--color-line)]">
                    {(["Easy", "Medium", "Hard"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl)}
                        className={clsx(
                          "rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                          difficulty === lvl
                            ? "bg-blue-fill text-white shadow-sm"
                            : "text-muted hover:text-ink"
                        )}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-ink">Practice duration</label>
                  <div className="inline-flex rounded-xl bg-panel-2 p-1 shadow-[inset_0_0_0_1px_var(--color-line)]">
                    {([10, 20, 30, 45] as const).map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDuration(mins)}
                        className={clsx(
                          "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                          duration === mins
                            ? "bg-blue-fill text-white shadow-sm"
                            : "text-muted hover:text-ink"
                        )}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced Customisation Accordion */}
              <div className="mt-6 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen(!advancedOpen)}
                  className="flex w-full items-center justify-between text-xs text-muted hover:text-ink transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Icon name="gear" size={14} /> Advanced customisation — Edit the question mix, follow-ups and number of questions.
                  </span>
                  <span>{advancedOpen ? "▴" : "▾"}</span>
                </button>
                {advancedOpen && (
                  <div className="mt-3 rounded-xl bg-panel-2 p-3 text-xs text-muted animate-fade-in">
                    Follow-ups are enabled by default for maximum realism. Custom prompts and deep question adjustments will apply to your generated sessions.
                  </div>
                )}
              </div>

              {/* Step 3 Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex h-[42px] items-center justify-center rounded-[11px] bg-panel-2 px-5 text-sm font-semibold text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={saveDraft}
                    className="inline-flex h-[42px] items-center justify-center rounded-[11px] bg-panel-2 px-5 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2b2d38] transition-all cursor-pointer active:scale-95"
                  >
                    Save draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="group/btn relative overflow-hidden inline-flex h-[42px] items-center justify-center gap-2 rounded-[11px] bg-blue-fill px-6 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(74,90,240,0.35)] hover:bg-blue-hover hover:shadow-[0_0_24px_rgba(90,105,255,0.6)] active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="relative z-10">Continue to review →</span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                  </button>
                </div>
              </div>
            </Panel>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: REVIEW */}
        {/* ============================================================== */}
        {step === 4 && (
          <div className="flex animate-rise flex-col gap-4">
            {/* Card 1: Job details */}
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#1a2238] text-[#818cf8]">
                    <Icon name="brief" size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Job details</h3>
                    <p className="text-xs text-muted">{companyName} · {jobTitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-soft hover:underline cursor-pointer"
                >
                  <Icon name="edit" size={13} /> Edit
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-[12px] bg-panel-2 p-3 text-xs">
                <div>
                  <span className="text-dim block">Company</span>
                  <span className="font-semibold text-ink mt-0.5 block">{companyName}</span>
                </div>
                <div>
                  <span className="text-dim block">Job title</span>
                  <span className="font-semibold text-ink mt-0.5 block">{jobTitle}</span>
                </div>
              </div>
            </Panel>

            {/* Card 2: Your documents */}
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#142825] text-[#34d399]">
                    <Icon name="doc" size={17} />
                  </div>
                  <h3 className="text-sm font-bold text-ink">Your documents</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-soft hover:underline cursor-pointer"
                >
                  <Icon name="edit" size={13} /> Edit
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-[10px] bg-panel-2 px-3 py-2 text-xs">
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <Icon name="check" size={14} className="text-[#10b981]" /> {cvDoc.name}
                  </span>
                  <span className="text-[#10b981] font-semibold">Uploaded</span>
                </div>
                <div className="flex items-center justify-between rounded-[10px] bg-panel-2 px-3 py-2 text-xs">
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <Icon name="check" size={14} className="text-[#10b981]" /> {jobDoc.name}
                  </span>
                  <span className="text-[#10b981] font-semibold">Uploaded</span>
                </div>
              </div>
            </Panel>

            {/* Card 3: Interview stages */}
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#221c38] text-[#c084fc]">
                    <Icon name="layers" size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Interview stages ({stages.length})</h3>
                    <p className="text-xs text-muted">The stages of your interview, in order.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-soft hover:underline cursor-pointer"
                >
                  <Icon name="edit" size={13} /> Edit
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {stages.map((stg, i) => (
                  <div key={stg.id} className="flex items-center justify-between rounded-[10px] bg-panel-2 px-3 py-2 text-xs">
                    <div className="flex items-center gap-2.5 font-medium text-ink">
                      {stg.status === "completed" ? (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#10b981] text-black">
                          <Icon name="check" size={10} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-[10px]">
                          {i + 1}
                        </div>
                      )}
                      <span>{stg.name}</span>
                    </div>
                    <div>
                      {stg.status === "completed" && (
                        <span className="rounded-full bg-[#10b981]/15 px-2 py-0.5 text-[11px] font-semibold text-[#10b981]">
                          Completed
                        </span>
                      )}
                      {stg.status === "next" && (
                        <span className="text-muted font-medium">
                          Thu 12 Nov, 10:00
                        </span>
                      )}
                      {stg.status === "not_scheduled" && (
                        <span className="text-muted">Not scheduled</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Card 4: Practice setup */}
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#1a2238] text-[#818cf8]">
                    <Icon name="target" size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Practice setup</h3>
                    <p className="text-xs text-muted">Your practice plan for this interview.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-soft hover:underline cursor-pointer"
                >
                  <Icon name="edit" size={13} /> Edit
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-[12px] bg-panel-2 p-3 text-xs">
                <div>
                  <span className="text-dim block">Difficulty</span>
                  <span className="font-semibold text-ink mt-0.5 block">{difficulty}</span>
                </div>
                <div>
                  <span className="text-dim block">Total duration</span>
                  <span className="font-semibold text-ink mt-0.5 block">{duration} minutes</span>
                </div>
                <div>
                  <span className="text-dim block">Stages to practise</span>
                  <span className="font-semibold text-ink mt-0.5 truncate block">
                    {selectedRounds
                      .map((id) => stages.find((s) => s.id === id)?.name || "Stage")
                      .join(", ")}
                  </span>
                </div>
              </div>
            </Panel>
          </div>
        )}

        {/* ============================================================== */}
        {/* RIGHT SIDEBAR (PERSISTENT & ACCURATE PER STEP) */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-5">
          {/* Top Sidebar Card */}
          {step === 1 && (
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h3 className="text-[15px] font-bold text-ink">Interview overview</h3>
              <p className="mt-0.5 text-xs text-muted truncate">
                {companyName} · {jobTitle}
              </p>
              <div className="mt-4 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">CV</span>
                  <span className="flex items-center gap-1 font-semibold text-[#10b981]">
                    Uploaded <Icon name="check" size={12} strokeWidth={3} />
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">Job description</span>
                  <span className="flex items-center gap-1 font-semibold text-[#10b981]">
                    Uploaded <Icon name="check" size={12} strokeWidth={3} />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Cover letter</span>
                  <span className="text-dim">{coverDoc ? "Uploaded ✓" : "Not added yet"}</span>
                </div>
              </div>
            </Panel>
          )}

          {step === 2 && (
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h3 className="text-[15px] font-bold text-ink">Interview overview</h3>
              <p className="mt-0.5 text-xs text-muted truncate">
                {companyName} · {jobTitle}
              </p>
              <div className="mt-4 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">CV</span>
                  <span className="flex items-center gap-1 font-semibold text-[#10b981]">
                    Uploaded <Icon name="check" size={12} strokeWidth={3} />
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">Job description</span>
                  <span className="flex items-center gap-1 font-semibold text-[#10b981]">
                    Uploaded <Icon name="check" size={12} strokeWidth={3} />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Interview stages</span>
                  <span className="font-semibold text-ink">{stages.length} stages</span>
                </div>
              </div>
            </Panel>
          )}

          {step === 3 && (
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h3 className="text-[15px] font-bold text-ink">Practice preview</h3>
              <p className="mt-0.5 text-xs text-muted">{companyName} · Multiple rounds</p>

              <div className="mt-4 flex flex-col gap-3 text-xs">
                <div className="border-b border-line pb-2.5">
                  <span className="text-muted block mb-1.5">Stages ({selectedRounds.length})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRounds.map((id) => {
                      const stg = stages.find((s) => s.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded-full bg-[#1e2544] px-2.5 py-0.5 text-[11px] font-semibold text-[#818cf8]"
                        >
                          <Icon name={stg?.icon || "users"} size={11} /> {stg?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">Duration</span>
                  <span className="font-semibold text-ink">{duration} minutes</span>
                </div>

                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">Difficulty</span>
                  <span className="font-semibold text-ink">{difficulty}</span>
                </div>

                <div className="border-b border-line pb-2">
                  <span className="text-muted block mb-1">Question mix</span>
                  <div className="flex justify-between text-[11px] text-ink">
                    <span>Technical {techFocus}%</span>
                    <span>Skills {skillsFocus}%</span>
                    <span>Experience {expFocus}%</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted">
                  A single practice session that includes your selected rounds and their questions.
                </p>
              </div>
            </Panel>
          )}

          {step === 4 && (
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h3 className="text-[16px] font-bold text-ink">Ready to build?</h3>
              <p className="mt-0.5 text-xs text-muted">
                Your tailored interview practice is set up. You can add more stages and sessions later.
              </p>

              <div className="mt-4 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between py-1 text-ink">
                  <span>Job details</span>
                  <Icon name="check" size={13} strokeWidth={3} className="text-[#10b981]" />
                </div>
                <div className="flex items-center justify-between py-1 text-ink">
                  <span>CV and job description</span>
                  <Icon name="check" size={13} strokeWidth={3} className="text-[#10b981]" />
                </div>
                <div className="flex items-center justify-between py-1 text-ink">
                  <span>{stages.length} interview stages</span>
                  <Icon name="check" size={13} strokeWidth={3} className="text-[#10b981]" />
                </div>
                <div className="flex items-center justify-between py-1 text-ink">
                  <span>Practice setup</span>
                  <Icon name="check" size={13} strokeWidth={3} className="text-[#10b981]" />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <button
                  type="button"
                  disabled={isBuilding}
                  onClick={handleBuildInterview}
                  className="group/btn relative overflow-hidden flex h-[44px] w-full items-center justify-center gap-2 rounded-[11px] bg-blue-fill font-semibold text-white shadow-[0_4px_20px_rgba(74,90,240,0.4)] hover:bg-blue-hover hover:shadow-[0_0_28px_rgba(90,105,255,0.7)] active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  <span className="relative z-10">
                    {isBuilding ? "Building interview…" : "Build interview →"}
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                </button>
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex h-[40px] w-full items-center justify-center rounded-[11px] bg-panel-2 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2b2d38] transition-all cursor-pointer"
                >
                  Save draft
                </button>
              </div>
            </Panel>
          )}

          {/* Bottom Tips / Good to know Sidebar Card */}
          {step === 1 && (
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h3 className="text-sm font-bold text-ink">Good to know</h3>
              <div className="mt-3 flex flex-col gap-3 text-xs text-muted">
                <p>You can save your progress and update interview stages whenever you need.</p>
                <p>Your documents are used to tailor practice questions for this interview.</p>
              </div>
            </Panel>
          )}

          {step === 2 && (
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h3 className="text-sm font-bold text-ink">Good to know</h3>
              <div className="mt-3.5 flex flex-col gap-3.5 text-xs text-muted">
                <div className="flex items-start gap-2.5">
                  <Icon name="edit" size={14} className="text-ink shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-ink block">Rename stages</span>
                    <span>Click the pencil to give each stage a name that matches your process.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon name="drag" size={14} className="text-ink shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-ink block">Reorder anytime</span>
                    <span>Drag and drop stages to change the order of your interview.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon name="plus" size={14} className="text-ink shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-ink block">Add or remove stages</span>
                    <span>Keep it accurate to your real interview flow. You can add, edit or delete stages as needed.</span>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {step === 3 && (
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h3 className="text-sm font-bold text-ink">Tailored to your stages</h3>
              <p className="mt-2 text-xs text-muted">
                Your CV and job description help make the questions relevant to each selected round.
              </p>
            </Panel>
          )}

          {step === 4 && (
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h3 className="text-sm font-bold text-ink">Add later (optional)</h3>
              <p className="mt-2 text-xs text-muted">
                Dates for later rounds and interviewer details can be added whenever you know them.
              </p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
