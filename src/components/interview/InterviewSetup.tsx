"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { Button, Crumbs, Icon, Panel } from "@/components/ui";
import { pastedDocument, readDocument, type ReadDoc } from "./read-docs";
import { CalendarPopup, TimePickerPopup } from "./DatePicker";
import { DraftStorageModal } from "./DraftStorageModal";
import { buildRequest, focusMix, hasDraftContent, mixLine, roundsSelected as existingRounds, setupProblems, type SetupForm } from "@/lib/interviews/setup-form";
import { FOCUS_CATEGORIES, getSuggestedWeights, weightsLine, type FocusCategoryKey } from "@/lib/interviews/settings";
import { formatStageDate } from "@/lib/format";

/* ------------------------------------------------------------------ DocField (exported for RebuildFlow) */
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

  // Step 1: Job Details State (starts empty for new interview setup)
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [cvDoc, setCvDoc] = useState<{ name: string; uploaded: boolean; text?: string; detail?: string } | null>(null);
  const [jobDoc, setJobDoc] = useState<{ name: string; uploaded: boolean; text?: string; detail?: string } | null>(null);
  const [coverDoc, setCoverDoc] = useState<{ name: string; uploaded: boolean; text?: string; detail?: string } | null>(null);

  // Job description 3 modes: "attach" | "link" | "paste"
  const [jobMode, setJobMode] = useState<"attach" | "link" | "paste">("attach");
  const [jobUrl, setJobUrl] = useState("");
  const [jobLinkLoading, setJobLinkLoading] = useState(false);
  const [jobLinkSuccess, setJobLinkSuccess] = useState<string | null>(null);
  const [jobLinkError, setJobLinkError] = useState<string | null>(null);
  const [jobPastedText, setJobPastedText] = useState("");

  // CV modes: "attach" | "paste" | "my-cvs"
  const [cvMode, setCvMode] = useState<"attach" | "paste" | "my-cvs">("attach");
  const [cvPastedText, setCvPastedText] = useState("");
  const [myCvs, setMyCvs] = useState<Array<{ id: string; name: string; targetTitle?: string; targetEmployer?: string; score?: number; updatedAt: string }>>([]);
  const [loadingMyCvs, setLoadingMyCvs] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);

  const loadMyCvs = async () => {
    setLoadingMyCvs(true);
    try {
      const res = await fetch("/api/cv/versions");
      if (res.ok) {
        const data = await res.json();
        setMyCvs(data.cvs || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMyCvs(false);
    }
  };

  const selectCv = async (id: string) => {
    setSelectedCvId(id);
    try {
      const res = await fetch(`/api/cv/versions/${id}`);
      if (res.ok) {
        const { cv } = await res.json();
        let parts: string[] = [];
        if (cv.contact?.fullName) parts.push(cv.contact.fullName);
        if (cv.contact?.email || cv.contact?.phone) parts.push([cv.contact.email, cv.contact.phone].filter(Boolean).join(" | "));
        if (cv.sections) {
          for (const s of cv.sections) {
            parts.push(`\n## ${s.title}`);
            for (const e of s.entries || []) {
              parts.push(`\n### ${e.title || ""} ${e.org ? `at ${e.org}` : ""} ${e.period ? `(${e.period})` : ""}`);
              for (const b of e.bullets || []) {
                if (b.text) parts.push(`• ${b.text}`);
              }
            }
          }
        }
        const fullText = parts.join("\n");
        setCvDoc({
          name: cv.name || "Built CV",
          uploaded: true,
          text: fullText,
          detail: `${cv.name} · Score ${cv.score !== undefined ? `${cv.score}/100` : "unscored"}`,
        });
        if (cv.target) {
          if (cv.target.employer && !companyName) setCompanyName(cv.target.employer);
          if (cv.target.title && !jobTitle) setJobTitle(cv.target.title);
          if (cv.target.advert && !jobPastedText) {
            setJobPastedText(cv.target.advert);
            setJobMode("paste");
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cvInputRef = useRef<HTMLInputElement>(null);
  const jobInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Why a chosen file wasn't accepted. A file that can't be read is refused with the reason and a way forward:
  // nothing is ever put in place of the text it should have held.
  const [cvError, setCvError] = useState<string | null>(null);
  const [jobFileError, setJobFileError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const cantRead = (file: File, err: unknown) => `“${file.name}” couldn’t be used. ${err instanceof Error && err.message ? err.message : "It couldn’t be read. Paste the text instead."}`;

  const handleCvFile = async (file: File) => {
    setCvError(null);
    try {
      const doc = await readDocument(file, { minWords: 15 });
      setCvDoc({ name: doc.name, uploaded: true, text: doc.text, detail: doc.detail });
    } catch (err) {
      setCvDoc(null);
      setCvError(cantRead(file, err));
    }
  };

  const handleJobFile = async (file: File) => {
    setJobFileError(null);
    try {
      const doc = await readDocument(file, { minWords: 15 });
      setJobDoc({ name: doc.name, uploaded: true, text: doc.text, detail: doc.detail });
    } catch (err) {
      setJobDoc(null);
      setJobFileError(cantRead(file, err));
    }
  };

  const handleCoverFile = async (file: File) => {
    setCoverError(null);
    try {
      const doc = await readDocument(file, { minWords: 15 });
      setCoverDoc({ name: doc.name, uploaded: true, text: doc.text, detail: doc.detail });
    } catch (err) {
      setCoverDoc(null);
      setCoverError(cantRead(file, err));
    }
  };

  const handleFetchJobLink = async (targetUrl?: string) => {
    const rawUrl = (targetUrl ?? jobUrl).trim();
    if (!rawUrl) return;
    setJobLinkLoading(true);
    setJobLinkError(null);
    setJobLinkSuccess(null);
    try {
      const res = await fetch("/api/interviews/read-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: rawUrl, kind: "job" }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok && data.text) {
        const wordsCount = data.text.split(/\s+/).filter(Boolean).length;
        let domain = rawUrl;
        try {
          domain = new URL(rawUrl).hostname.replace(/^www\./, "");
        } catch {}
        setJobDoc({
          name: domain,
          uploaded: true,
          text: data.text,
          detail: `${wordsCount} words extracted`,
        });
        setJobLinkSuccess(`Read ${wordsCount} words from ${domain}`);
      } else {
        // The link couldn't be read, so nothing is attached. The address is still sent with the build, where the
        // server tries once more and says so on the interview if it fails again.
        setJobLinkError(data.message || "This link couldn’t be read, so nothing has been attached from it. Paste the job description instead.");
        setJobDoc(null);
      }
    } catch {
      setJobLinkError("The link couldn’t be checked because the app couldn’t be reached. Paste the job description instead.");
      setJobDoc(null);
    } finally {
      setJobLinkLoading(false);
    }
  };

  const handleJobPasteChange = (val: string) => {
    setJobPastedText(val);
    const wordsCount = val.split(/\s+/).filter(Boolean).length;
    if (val.trim()) {
      setJobDoc({
        name: "Pasted job description",
        uploaded: true,
        text: val.trim(),
        detail: `${wordsCount} words`,
      });
    } else {
      setJobDoc(null);
    }
  };

  const handleCvPasteChange = (val: string) => {
    setCvPastedText(val);
    const wordsCount = val.split(/\s+/).filter(Boolean).length;
    if (val.trim()) {
      setCvDoc({
        name: "Pasted CV",
        uploaded: true,
        text: val.trim(),
        detail: `${wordsCount} words`,
      });
    } else {
      setCvDoc(null);
    }
  };

  // Step 2: Stages State (dates, times and interviewers are completely optional)
  const [stagesExpectation, setStagesExpectation] = useState<"single" | "multiple" | "practice">("single");
  const [stages, setStages] = useState<StageItem[]>([
    {
      id: "1",
      name: "Interview stage 1",
      date: "",
      time: "",
      format: "Video call",
      interviewer: "",
      status: "next",
      icon: "code",
    },
  ]);

  // Drag and drop tracking
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeDatePickerId, setActiveDatePickerId] = useState<string | null>(null);
  const [activeTimePickerId, setActiveTimePickerId] = useState<string | null>(null);
  const [activeFormatDropdownId, setActiveFormatDropdownId] = useState<string | null>(null);
  const [activeStatusDropdownId, setActiveStatusDropdownId] = useState<string | null>(null);

  // Stage update helper
  const updateStage = (id: string, updates: Partial<StageItem>) => {
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== id) {
          // If setting this one to "next", clear next from others to keep only one next stage
          if (updates.status === "next" && s.status === "next") {
            return { ...s, status: "not_scheduled" };
          }
          return s;
        }
        return { ...s, ...updates };
      })
    );
  };

  const handleAddStage = () => {
    const num = stages.length + 1;
    const newStage: StageItem = {
      id: `stage-${Date.now()}`,
      name: stagesExpectation === "practice" ? `Practice Round ${num}` : `Interview Stage ${num}`,
      date: "",
      time: "",
      format: "Video call",
      interviewer: "",
      status: stagesExpectation === "practice" ? "next" : "not_scheduled",
      icon: "code",
    };
    setStages((prev) => [...prev, newStage]);
    setSelectedRounds((prev) => [...prev, newStage.id]);
  };

  const handleRemoveStage = (id: string) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
    setSelectedRounds((prev) => prev.filter((x) => x !== id));
  };

  const handleSelectExpectation = (opt: "single" | "multiple" | "practice") => {
    setStagesExpectation(opt);
    if (opt === "single") {
      if (stages.length > 1) {
        const single = {
          ...stages[0],
          name: stages[0].name.toLowerCase().includes("recruiter") ? "Single stage interview" : stages[0].name,
        };
        setStages([single]);
        setSelectedRounds([single.id]);
      } else if (stages.length === 0) {
        const single: StageItem = {
          id: "1",
          name: "Single stage interview",
          date: "",
          time: "",
          format: "Video call",
          interviewer: "",
          status: "next",
          icon: "code",
        };
        setStages([single]);
        setSelectedRounds([single.id]);
      }
    } else if (opt === "multiple") {
      if (stages.length <= 1) {
        const defaultMulti: StageItem[] = [
          {
            id: "1",
            name: "Recruiter screen",
            date: "",
            time: "",
            format: "Video call",
            interviewer: "",
            status: "next",
            icon: "phone",
          },
          {
            id: "2",
            name: "Hiring manager interview",
            date: "",
            time: "",
            format: "Video call",
            interviewer: "",
            status: "not_scheduled",
            icon: "code",
          },
          {
            id: "3",
            name: "Technical round",
            date: "",
            time: "",
            format: "Video call",
            interviewer: "",
            status: "not_scheduled",
            icon: "present",
          },
          {
            id: "4",
            name: "Final panel",
            date: "",
            time: "",
            format: "Video call",
            interviewer: "",
            status: "not_scheduled",
            icon: "users",
          },
        ];
        setStages(defaultMulti);
        setSelectedRounds(["1", "2"]);
      }
    } else if (opt === "practice") {
      if (stages.length <= 1) {
        const practiceStages: StageItem[] = [
          {
            id: "p1",
            name: "General interview practice",
            date: "",
            time: "",
            format: "Video call",
            interviewer: "",
            status: "next",
            icon: "phone",
          },
          {
            id: "p2",
            name: "Technical & role practice",
            date: "",
            time: "",
            format: "Video call",
            interviewer: "",
            status: "not_scheduled",
            icon: "code",
          },
          {
            id: "p3",
            name: "Behavioral & situational questions",
            date: "",
            time: "",
            format: "Video call",
            interviewer: "",
            status: "not_scheduled",
            icon: "users",
          },
        ];
        setStages(practiceStages);
        setSelectedRounds(["p1", "p2", "p3"]);
      } else {
        setSelectedRounds(stages.map((s) => s.id));
      }
    }
  };

  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    const newStages = [...stages];
    const [draggedItem] = newStages.splice(draggedIndex, 1);
    newStages.splice(targetIdx, 0, draggedItem);
    setDraggedIndex(targetIdx);
    setStages(newStages);
  };

  // Step 3: Practice Setup State
  const [selectedRounds, setSelectedRounds] = useState<string[]>(["1"]); // the one stage a new form starts with
  const [interviewStyle, setInterviewStyle] = useState<"recommended" | "custom">("recommended");
  const [categoryWeights, setCategoryWeights] = useState<Record<FocusCategoryKey, number>>(() =>
    getSuggestedWeights(jobTitle, jobDoc?.text || jobPastedText)
  );
  const [techFocus, setTechFocus] = useState(50);
  const [skillsFocus, setSkillsFocus] = useState(30);
  const [expFocus, setExpFocus] = useState(20);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [duration, setDuration] = useState<10 | 20 | 30 | 45>(30);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Keep suggested categories in sync with job advert when on recommended style
  useEffect(() => {
    if (interviewStyle === "recommended") {
      setCategoryWeights(getSuggestedWeights(jobTitle, jobDoc?.text || jobPastedText));
    }
  }, [jobTitle, jobDoc, jobPastedText, interviewStyle]);

  // Loading & Submission State
  const [isBuilding, setIsBuilding] = useState(false);
  /** Why the interview couldn't be built, from the form's own checks or from the server. */
  const [buildError, setBuildError] = useState<string | null>(null);
  const [step1Errors, setStep1Errors] = useState<{ company?: string; title?: string; job?: string; cv?: string }>({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  /** True once a saved draft (if any) has been read back, so an empty form never overwrites it. */
  const [draftRead, setDraftRead] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftToast, setDraftToast] = useState<{ title: string; subtitle: string } | null>(null);
  const [draftRestoredBanner, setDraftRestoredBanner] = useState<string | null>(null);

  // Restore saved draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hk_interview_wizard_draft");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.companyName) setCompanyName(parsed.companyName);
        if (parsed.jobTitle) setJobTitle(parsed.jobTitle);
        if (parsed.companyWebsite) setCompanyWebsite(parsed.companyWebsite);
        if (parsed.cvDoc) setCvDoc(parsed.cvDoc);
        if (parsed.jobDoc) setJobDoc(parsed.jobDoc);
        if (parsed.coverDoc !== undefined) setCoverDoc(parsed.coverDoc);
        if (parsed.stagesExpectation) {
          if (parsed.stagesExpectation === "unsure") {
            setStagesExpectation("practice");
          } else {
            setStagesExpectation(parsed.stagesExpectation);
          }
        }
        if (parsed.stages && Array.isArray(parsed.stages) && parsed.stages.length > 0) setStages(parsed.stages);
        if (parsed.selectedRounds) setSelectedRounds(parsed.selectedRounds);
        if (parsed.interviewStyle) setInterviewStyle(parsed.interviewStyle);
        if (parsed.categoryWeights) setCategoryWeights(parsed.categoryWeights);
        if (parsed.techFocus !== undefined) setTechFocus(parsed.techFocus);
        if (parsed.skillsFocus !== undefined) setSkillsFocus(parsed.skillsFocus);
        if (parsed.expFocus !== undefined) setExpFocus(parsed.expFocus);
        if (parsed.difficulty) setDifficulty(parsed.difficulty);
        if (parsed.duration) setDuration(parsed.duration);
        if (parsed.step) setStep(parsed.step);
        if (parsed.jobMode) setJobMode(parsed.jobMode);
        if (parsed.jobUrl) setJobUrl(parsed.jobUrl);
        if (parsed.jobPastedText) setJobPastedText(parsed.jobPastedText);
        if (parsed.cvMode) setCvMode(parsed.cvMode);
        if (parsed.cvPastedText) setCvPastedText(parsed.cvPastedText);
        if (parsed.savedAt) {
          setLastSavedTime(parsed.savedAt);
          setDraftRestoredBanner(`Continuing your saved draft${parsed.jobTitle ? ` for ${parsed.jobTitle}` : ""}${parsed.companyName ? ` at ${parsed.companyName}` : ""}`);
        }
      }
    } catch {}
    setDraftRead(true);
  }, []);

  // What the form holds, in the shape its rules use.
  const form: SetupForm = {
    company: companyName,
    title: jobTitle,
    website: companyWebsite,
    jobText: jobDoc?.text?.trim() || jobPastedText.trim(),
    jobUrl: jobUrl,
    jobLabel: jobDoc?.name ?? "",
    cvText: cvDoc?.text?.trim() || cvPastedText.trim(),
    cvLabel: cvDoc?.name ?? "",
    coverText: coverDoc?.text?.trim() ?? "",
    coverLabel: coverDoc?.name ?? "",
    stages,
    difficulty,
    minutes: duration,
    focus: { technical: techFocus, skills: skillsFocus, experience: expFocus, categories: categoryWeights },
  };
  const problems = setupProblems(form);
  const mixToSend = focusMix(form.focus);
  const rounds = existingRounds(selectedRounds, stages);
  const missing = (field: "company" | "job" | "cv") => problems.some((p) => p.field === field);

  const totalCategoryWeight = Object.values(categoryWeights).reduce((a, b) => a + b, 0);

  const toggleCategory = (key: FocusCategoryKey) => {
    setCategoryWeights((prev) => {
      const currentVal = prev[key] || 0;
      if (currentVal > 0) {
        return { ...prev, [key]: 0 };
      }
      const currentSum = Object.values(prev).reduce((a, b) => a + b, 0);
      const remaining = Math.max(5, 100 - currentSum);
      const add = Math.min(20, Math.max(5, remaining));
      return { ...prev, [key]: add };
    });
    setInterviewStyle("custom");
  };

  const adjustCategory = (key: FocusCategoryKey, delta: number) => {
    setCategoryWeights((prev) => {
      const currentVal = prev[key] || 0;
      const nextVal = Math.max(5, Math.min(100, currentVal + delta));
      return { ...prev, [key]: nextVal };
    });
    setInterviewStyle("custom");
  };

  const validateStep1 = (): boolean => {
    const errs: { company?: string; title?: string; job?: string; cv?: string } = {};
    if (!companyName.trim()) {
      errs.company = "Enter the employer or company name.";
    }
    if (!jobTitle.trim()) {
      errs.title = "Enter the job title.";
    }
    const jobWords = (form.jobText || "").trim().split(/\s+/).filter(Boolean).length;
    if (!form.jobText.trim() && !form.jobUrl.trim()) {
      errs.job = "Add a job advert or description.";
    } else if (!form.jobText.trim() && form.jobUrl.trim()) {
      errs.job = "Job link hasn't been read yet. Click Read URL or paste description text.";
    } else if (jobWords < 40) {
      errs.job = "Job description needs at least 40 words to write relevant questions.";
    }

    const cvWords = (form.cvText || "").trim().split(/\s+/).filter(Boolean).length;
    if (!form.cvText.trim()) {
      errs.cv = "Upload your CV or paste its text.";
    } else if (cvWords < 40) {
      errs.cv = "Your CV needs at least 40 words to pull relevant experience.";
    }

    setStep1Errors(errs);
    if (Object.keys(errs).length > 0) {
      setBuildError("Please complete the required fields in Step 1 before continuing.");
      return false;
    }
    setBuildError(null);
    return true;
  };

  /** Writes the draft to this browser. Returns the time it was saved, or null when it couldn't be. */
  const writeDraft = (): string | null => {
    const timeStr = `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const draftData = {
      companyName,
      jobTitle,
      companyWebsite,
      cvDoc,
      jobDoc,
      coverDoc,
      jobMode,
      jobUrl,
      jobPastedText,
      cvMode,
      cvPastedText,
      stagesExpectation,
      stages,
      selectedRounds,
      interviewStyle,
      categoryWeights,
      techFocus,
      skillsFocus,
      expFocus,
      difficulty,
      duration,
      step,
      savedAt: timeStr,
    };
    try {
      localStorage.setItem("hk_interview_wizard_draft", JSON.stringify(draftData));
      window.dispatchEvent(new Event("hk_draft_updated"));
      return timeStr;
    } catch {
      return null;
    }
  };

  // The draft is saved as the person goes, once there is something to save, so a refresh brings it back.
  // "Draft saved" is only ever shown after it really has been.
  const draftSnapshot = JSON.stringify([companyName, jobTitle, companyWebsite, cvDoc, jobDoc, coverDoc, jobMode, jobUrl, jobPastedText, cvMode, cvPastedText, stagesExpectation, stages, selectedRounds, interviewStyle, categoryWeights, techFocus, skillsFocus, expFocus, difficulty, duration, step]);
  useEffect(() => {
    if (!draftRead || isBuilding || !hasDraftContent(form)) return;
    const timer = setTimeout(() => {
      const saved = writeDraft();
      if (saved) setLastSavedTime(saved);
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftSnapshot, draftRead, isBuilding]);

  const saveDraft = () => {
    const saved = writeDraft();
    if (!saved) {
      setDraftToast({ title: "The draft couldn’t be saved", subtitle: "This browser’s storage is full or switched off, so nothing was kept." });
      setTimeout(() => setDraftToast(null), 4500);
      return;
    }
    setLastSavedTime(saved);
    setDraftToast({
      title: "Draft saved in this browser",
      subtitle: `${[companyName.trim(), jobTitle.trim()].filter(Boolean).join(" · ") || "Your set-up"} (step ${step} of 4). It is kept on this device only, until you build the interview or discard the draft.`,
    });
    setTimeout(() => setDraftToast(null), 4500);
  };

  const handleDiscardDraft = () => {
    if (confirm("Are you sure you want to discard this saved draft and start fresh?")) {
      try {
        localStorage.removeItem("hk_interview_wizard_draft");
        window.dispatchEvent(new Event("hk_draft_updated"));
      } catch {}
      // Back to an empty form: nothing is filled in.
      setCompanyName("");
      setJobTitle("");
      setCompanyWebsite("");
      setCvDoc(null);
      setJobDoc(null);
      setCoverDoc(null);
      setJobUrl("");
      setJobPastedText("");
      setCvPastedText("");
      setStep(1);
      setLastSavedTime(null);
      setShowDraftModal(false);
      setDraftRestoredBanner(null);
    }
  };

  /**
   * Builds the interview on the server from exactly what the form holds. If something is missing the person is
   * told what, and nothing is sent. If the server can't build it, its message is shown and the form stays as it
   * is: no interview is made up in its place.
   */
  const handleBuildInterview = async () => {
    setBuildError(null);
    const body = buildRequest(form);
    if (!body) {
      setBuildError(problems.map((p) => p.message).join(" "));
      setStep(1);
      return;
    }
    setIsBuilding(true);
    try {
      const res = await fetch("/api/interviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!res.ok || !data.id) {
        setBuildError(data.message ?? "The interview couldn’t be built. Nothing was saved: check the form and try again.");
        setIsBuilding(false);
        return;
      }
    } catch {
      setBuildError("The interview couldn’t be built because the app couldn’t be reached. Your set-up is still here: check your connection and try again.");
      setIsBuilding(false);
      return;
    }

    // Built and saved on the server: the draft has done its job.
    try {
      localStorage.removeItem("hk_interview_wizard_draft");
      window.dispatchEvent(new Event("hk_draft_updated"));
    } catch {}
    router.push("/interviews");
    router.refresh();
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Crumbs
            items={[
              { label: "Interviews", href: "/interviews" },
              { label: "New interview" },
            ]}
          />

          {/* Live Draft Saved Indicator */}
          <button
            type="button"
            onClick={() => setShowDraftModal(true)}
            title="Click to view where and how your draft is saved"
            className="group flex items-center gap-2 rounded-full bg-panel-2 px-3 py-1 text-xs text-muted border border-line hover:border-blue-soft hover:text-ink transition-all cursor-pointer shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10b981]" />
            </span>
            <span data-testid="draft-status">{lastSavedTime ? `Draft saved in this browser (${lastSavedTime})` : "Nothing to save yet"}</span>
            <span className="text-[10px] font-semibold text-blue-soft group-hover:underline">Where it’s kept</span>
          </button>
        </div>

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
                    onClick={() => {
                      if (s.num > 1 && !validateStep1()) return;
                      setStep(s.num as 1 | 2 | 3 | 4);
                    }}
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

      {buildError && step !== 4 && (
        <p role="alert" data-testid="build-error" className="rounded-xl border border-red/30 bg-red/10 px-4 py-3 text-xs leading-relaxed text-red-soft">
          {buildError}
        </p>
      )}

      {/* Restored Draft Banner if draft exists */}
      {draftRestoredBanner && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-[#171d32] to-[#1c2444] px-4 py-3 text-xs text-ink border border-line shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-soft/20 text-blue-soft">
              <Icon name="doc" size={15} />
            </div>
            <div className="truncate">
              <span className="font-bold text-white">Draft in progress: </span>
              <span className="text-muted">{draftRestoredBanner}. It was kept in this browser.</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowDraftModal(true)}
              className="text-xs font-semibold text-blue-soft hover:underline cursor-pointer"
            >
              Draft details
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="text-xs text-muted hover:text-red-soft hover:underline cursor-pointer"
            >
              Start fresh
            </button>
          </div>
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
                    <div className={clsx("flex h-[46px] items-center gap-3 rounded-[12px] bg-panel-2 px-3.5 shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all focus-within:shadow-[inset_0_0_0_1.5px_var(--color-blue)]", step1Errors.company && "border border-red-500/50")}>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          if (step1Errors.company) setStep1Errors((prev) => ({ ...prev, company: undefined }));
                        }}
                        placeholder="e.g. HMRC, Monzo, Google"
                        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-dim"
                      />
                    </div>
                    {step1Errors.company && <p className="mt-1.5 text-xs text-red-soft" role="alert">{step1Errors.company}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-ink">
                      Job title <span className="text-red-soft">*</span>
                    </label>
                    <div className={clsx("flex h-[46px] items-center gap-3 rounded-[12px] bg-panel-2 px-3.5 shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all focus-within:shadow-[inset_0_0_0_1.5px_var(--color-blue)]", step1Errors.title && "border border-red-500/50")}>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => {
                          setJobTitle(e.target.value);
                          if (step1Errors.title) setStep1Errors((prev) => ({ ...prev, title: undefined }));
                        }}
                        placeholder="e.g. Associate Product Manager"
                        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-dim"
                      />
                    </div>
                    {step1Errors.title && <p className="mt-1.5 text-xs text-red-soft" role="alert">{step1Errors.title}</p>}
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
                      placeholder="https://example.com (optional)"
                      className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-dim"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    Hakkiri can use the company&apos;s website to help tailor your preparation.
                  </p>
                </div>

                {/* Box 2: Your Documents */}
                <div className="border-t border-line pt-5 space-y-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-ink">Your documents</h3>
                    <p className="mt-0.5 text-xs text-muted">
                      Upload your CV and job description, insert a link, or paste the text instead.
                    </p>
                  </div>

                  {/* 1. Job Description Card (with 3 options: Attach Docs, Insert Link, Paste) */}
                  <div className="rounded-[16px] bg-panel-2/70 p-4 border border-line/80 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                        <Icon name="doc" size={15} className="text-blue-soft" />
                        <span>Job description</span>
                        {jobDoc?.uploaded && (
                          <span className="rounded-full bg-[#10b981]/15 px-2 py-0.5 text-[10px] font-semibold text-[#10b981] flex items-center gap-1">
                            <Icon name="check" size={11} strokeWidth={2.5} />
                            <span>{jobDoc.detail || "Ready"}</span>
                          </span>
                        )}
                      </div>

                      {/* 3 Mode Selector Pills */}
                      <div className="flex items-center rounded-lg bg-[#141620] p-0.5 border border-line/60 text-xs">
                        <button
                          type="button"
                          onClick={() => setJobMode("attach")}
                          className={clsx(
                            "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                            jobMode === "attach" ? "bg-blue-fill text-white shadow-sm" : "text-muted hover:text-ink"
                          )}
                        >
                          Attach Docs
                        </button>
                        <button
                          type="button"
                          onClick={() => setJobMode("link")}
                          className={clsx(
                            "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                            jobMode === "link" ? "bg-blue-fill text-white shadow-sm" : "text-muted hover:text-ink"
                          )}
                        >
                          Insert Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setJobMode("paste")}
                          className={clsx(
                            "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                            jobMode === "paste" ? "bg-blue-fill text-white shadow-sm" : "text-muted hover:text-ink"
                          )}
                        >
                          Paste Job Description
                        </button>
                      </div>
                    </div>

                    {jobMode === "attach" && (
                      <div
                        onClick={() => jobInputRef.current?.click()}
                        className="group flex items-center justify-between gap-3 rounded-[12px] bg-[#141620] p-3 border border-line/60 hover:border-blue-soft transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-fill/15 text-blue-soft">
                            <Icon name="doc" size={16} />
                          </div>
                          <div className="min-w-0">
                            <span className="block truncate text-xs font-semibold text-ink group-hover:text-blue-soft transition-colors">
                              {jobDoc?.name || "Upload job description"}
                            </span>
                            <span className="text-[11px] text-muted">
                              {jobDoc?.detail || "PDF, DOCX or TXT · Click to browse"}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] px-3 py-1.5 text-xs font-semibold text-ink transition-colors"
                        >
                          Browse file
                        </button>
                        <input
                          ref={jobInputRef}
                          type="file"
                          accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleJobFile(file);
                          }}
                        />
                      </div>
                    )}

                    {jobMode === "link" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={jobUrl}
                            onChange={(e) => {
                              setJobUrl(e.target.value);
                              setJobLinkError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleFetchJobLink();
                              }
                            }}
                            placeholder="e.g. https://app.beapplied.com/apply/fyx8yxrzfg or careers URL"
                            className="w-full rounded-[10px] bg-[#141620] px-3.5 py-2.5 text-xs text-ink outline-none border border-line/80 focus:border-blue-fill placeholder:text-dim"
                          />
                          <button
                            type="button"
                            disabled={jobLinkLoading || !jobUrl.trim()}
                            onClick={() => void handleFetchJobLink()}
                            className="shrink-0 rounded-[10px] bg-blue-fill hover:bg-blue-hover disabled:opacity-50 px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
                          >
                            {jobLinkLoading ? "Extracting..." : "Fetch spec"}
                          </button>
                        </div>
                        {jobLinkSuccess && (
                          <p className="text-[11px] font-medium text-[#10b981] flex items-center gap-1.5">
                            <Icon name="check" size={13} strokeWidth={2.5} />
                            <span>{jobLinkSuccess}</span>
                          </p>
                        )}
                        {jobLinkError && (
                          <p className="text-[11px] font-medium text-amber-400 flex items-center gap-1.5">
                            <span>⚠</span>
                            <span>{jobLinkError}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {jobMode === "paste" && (
                      <div className="space-y-1.5">
                        <textarea
                          rows={4}
                          value={jobPastedText}
                          onChange={(e) => handleJobPasteChange(e.target.value)}
                          placeholder="Paste the full job description or core responsibilities here..."
                          className="w-full resize-y rounded-[10px] bg-[#141620] p-3 text-xs leading-relaxed text-ink outline-none border border-line/80 focus:border-blue-fill placeholder:text-dim"
                        />
                        <div className="flex justify-between items-center text-[11px] text-muted">
                          <span>Hakkiri calibrates your interview questions around this text.</span>
                          <span>{jobPastedText.split(/\s+/).filter(Boolean).length} words</span>
                        </div>
                      </div>
                    )}
                    {step1Errors.job && (
                      <p className="mt-2.5 text-xs text-red-soft" role="alert">
                        {step1Errors.job}
                      </p>
                    )}
                  </div>

                  {/* 2. CV & Optional Cover Letter Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* CV Card */}
                    <div className={clsx("rounded-[16px] bg-panel-2/70 p-4 border shadow-sm", step1Errors.cv ? "border-red-500/50" : "border-line/80")}>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                          <Icon name="doc" size={15} className="text-blue-soft" />
                          <span>Your CV</span>
                          {cvDoc?.uploaded && cvDoc.text?.trim() && (
                            <span className="rounded-full bg-[#10b981]/15 px-2 py-0.5 text-[10px] font-semibold text-[#10b981] flex items-center gap-1">
                              <Icon name="check" size={11} strokeWidth={2.5} />
                              <span>{cvDoc.detail || "Ready"}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center rounded-lg bg-[#141620] p-0.5 border border-line/60 text-xs">
                          <button
                            type="button"
                            onClick={() => setCvMode("attach")}
                            className={clsx(
                              "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer",
                              cvMode === "attach" ? "bg-blue-fill text-white" : "text-muted hover:text-ink"
                            )}
                          >
                            Attach Docs
                          </button>
                          <button
                            type="button"
                            onClick={() => setCvMode("paste")}
                            className={clsx(
                              "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer",
                              cvMode === "paste" ? "bg-blue-fill text-white" : "text-muted hover:text-ink"
                            )}
                          >
                            Paste Text
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCvMode("my-cvs");
                              void loadMyCvs();
                            }}
                            className={clsx(
                              "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer",
                              cvMode === "my-cvs" ? "bg-blue-fill text-white" : "text-muted hover:text-ink"
                            )}
                          >
                            Use My CV
                          </button>
                        </div>
                      </div>

                      {cvMode === "attach" ? (
                        <div
                          onClick={() => cvInputRef.current?.click()}
                          className="group flex items-center justify-between gap-2 rounded-[12px] bg-[#141620] p-3 border border-line/60 hover:border-blue-soft transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-fill/15 text-blue-soft">
                              <Icon name="doc" size={14} />
                            </div>
                            <div className="min-w-0">
                              <span className="block truncate text-xs font-semibold text-ink group-hover:text-blue-soft transition-colors">
                                {cvDoc?.name || "Upload your CV"}
                              </span>
                              <span className="text-[10px] text-muted">{cvDoc?.detail || "Click to upload / browse"}</span>
                            </div>
                          </div>
                          {cvDoc?.uploaded && cvDoc.text?.trim() ? (
                            <Icon name="check" size={14} strokeWidth={2.5} className="text-[#10b981] shrink-0" />
                          ) : (
                            <Icon name="cloudUpload" size={14} className="text-muted shrink-0" />
                          )}
                          <input
                            ref={cvInputRef}
                            type="file"
                            accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void handleCvFile(file);
                            }}
                          />
                        </div>
                      ) : cvMode === "paste" ? (
                        <div className="space-y-1">
                          <textarea
                            rows={3}
                            value={cvPastedText}
                            onChange={(e) => handleCvPasteChange(e.target.value)}
                            placeholder="Paste your CV / resume text here..."
                            className="w-full resize-y rounded-[10px] bg-[#141620] p-2.5 text-xs text-ink outline-none border border-line/80 focus:border-blue-fill placeholder:text-dim"
                          />
                          <div className="text-right text-[10px] text-muted">
                            {cvPastedText.split(/\s+/).filter(Boolean).length} words
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {loadingMyCvs ? (
                            <div className="p-3 text-center text-xs text-muted">Loading your CVs…</div>
                          ) : myCvs.length === 0 ? (
                            <div className="p-3 text-center text-xs text-muted bg-[#141620] rounded-[10px] border border-line/60">
                              No saved CVs found. <Link href="/cv/new" className="text-blue-soft underline">Create a CV</Link> or attach a file above.
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {myCvs.map((cv) => {
                                const isSelected = selectedCvId === cv.id;
                                return (
                                  <div
                                    key={cv.id}
                                    onClick={() => void selectCv(cv.id)}
                                    className={clsx(
                                      "p-2.5 rounded-[10px] border cursor-pointer transition-all flex items-center justify-between text-xs",
                                      isSelected
                                        ? "bg-blue-fill/15 border-blue-soft text-white"
                                        : "bg-[#141620] border-line/60 text-ink hover:border-line"
                                    )}
                                  >
                                    <div className="min-w-0">
                                      <div className="font-semibold truncate">{cv.name}</div>
                                      <div className="text-[10px] text-muted flex items-center gap-2 mt-0.5">
                                        <span>{cv.targetTitle || "General CV"}</span>
                                        <span>•</span>
                                        <span>{new Date(cv.updatedAt).toLocaleDateString()}</span>
                                        {cv.score !== undefined && (
                                          <span className="text-blue-soft font-semibold">Score: {cv.score}/100</span>
                                        )}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <Icon name="check" size={14} className="text-[#10b981] shrink-0 ml-2" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {selectedCvId && (
                            <div className="pt-1 text-right">
                              <Link
                                href={`/cv/${selectedCvId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-soft hover:underline inline-flex items-center gap-1"
                              >
                                <span>Open this CV in the builder</span>
                                <span>↗</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                      {step1Errors.cv && (
                        <p className="mt-2 text-xs text-red-soft" role="alert">
                          {step1Errors.cv}
                        </p>
                      )}
                    </div>

                    {/* Cover Letter Card */}
                    <div className="rounded-[16px] bg-panel-2/70 p-4 border border-line/80 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink mb-3">
                        <Icon name="doc" size={15} className="text-dim" />
                        <span>Cover letter <span className="text-muted font-normal">(optional)</span></span>
                      </div>
                      <div
                        onClick={() => coverInputRef.current?.click()}
                        className="group flex items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-white/20 py-3.5 text-xs font-semibold text-muted hover:border-blue-soft hover:text-ink hover:bg-blue/10 transition-colors cursor-pointer"
                      >
                        <Icon name="plus" size={13} strokeWidth={2.2} />
                        <span className="truncate">{coverDoc ? coverDoc.name : "+ Add cover letter file"}</span>
                      </div>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleCoverFile(file);
                          e.target.value = "";
                        }}
                      />
                      {coverError && (
                        <p role="alert" data-testid="cover-error" className="mt-2 text-[11px] leading-relaxed text-red-soft">
                          {coverError}
                        </p>
                      )}
                    </div>
                  </div>

                  {cvError && (
                    <p role="alert" data-testid="cv-error" className="rounded-[10px] border border-red/30 bg-red/10 px-3 py-2 text-xs leading-relaxed text-red-soft">
                      {cvError}{" "}
                      <button type="button" onClick={() => setCvMode("paste")} className="font-semibold underline">
                        Paste your CV’s text
                      </button>
                    </p>
                  )}
                  {jobFileError && (
                    <p role="alert" data-testid="job-error" className="rounded-[10px] border border-red/30 bg-red/10 px-3 py-2 text-xs leading-relaxed text-red-soft">
                      {jobFileError}{" "}
                      <button type="button" onClick={() => setJobMode("paste")} className="font-semibold underline">
                        Paste the job description
                      </button>
                    </p>
                  )}
                  <p className="text-[11px] text-muted">
                    Accepted files: PDF, Word (.docx) or plain text. Only the text is read from them, in this browser, and sent to write your questions. A scanned PDF has no text to read: paste it instead.
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
                  <button
                    type="button"
                    onClick={() => {
                      if (companyName || jobTitle || form.jobText || form.cvText) {
                        setShowCancelModal(true);
                      } else {
                        router.push("/interviews");
                      }
                    }}
                    className="inline-flex h-[42px] items-center justify-center rounded-[11px] bg-panel-2 px-5 text-sm font-semibold text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink transition-all cursor-pointer"
                  >
                    Cancel
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
                      onClick={() => {
                        if (validateStep1()) setStep(2);
                      }}
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
        {/* STEP 2: INTERVIEW STAGES (FULLY INTERACTIVE & EDITABLE) */}
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
                    { key: "practice", label: "Just Practice" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectExpectation(opt.key as "single" | "multiple" | "practice")}
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

                {stagesExpectation === "practice" && (
                  <div className="mt-3.5 flex items-start gap-3 rounded-[12px] border border-blue-fill/30 bg-blue-fill/10 p-3 text-xs animate-fade-in">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-fill/25 text-blue-soft mt-0.5">
                      <Icon name="target" size={14} />
                    </div>
                    <div>
                      <span className="font-semibold text-ink">Just Practice Mode</span>
                      <p className="mt-0.5 text-muted leading-relaxed">
                        Dates, times, and interviewers are hidden so you can focus directly on practicing questions tailored to your profile.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stages List */}
              <div className="mt-6 border-t border-line pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-[14px] font-bold text-ink">
                    Your interview stages ({stages.length})
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1.5"><Icon name="drag" size={13} /> Drag to reorder</span>
                    <span className="flex items-center gap-1.5"><Icon name="edit" size={13} /> Click to edit</span>
                    <span className="flex items-center gap-1.5"><Icon name="trash" size={13} /> Delete</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {stages.map((stg, idx) => {
                    const isNext = stg.status === "next";
                    return (
                      <div
                        key={stg.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        className={clsx(
                          "group relative flex flex-wrap items-center justify-between gap-3 rounded-[14px] p-3.5 transition-all duration-200",
                          stagesExpectation !== "practice" && isNext
                            ? "bg-[#1c2237] shadow-[inset_0_0_0_1.5px_#6366f1,0_4px_20px_rgba(99,102,241,0.2)]"
                            : "bg-panel-2 shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
                        )}
                      >
                        {/* Drag Handle & Squircle Icon & Editable Name Input */}
                        <div className="flex items-center gap-2.5 min-w-[220px] grow">
                          <span
                            title="Drag to reorder"
                            className="cursor-grab active:cursor-grabbing p-1 text-dim hover:text-ink transition-colors"
                          >
                            <Icon name="drag" size={16} />
                          </span>

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

                          {/* Editable Stage Name Input */}
                          <div className="relative flex items-center gap-1.5 rounded-lg bg-[#141620] px-3 py-1.5 border border-line/80 focus-within:border-blue-fill min-w-[180px] max-w-[240px] grow transition-all">
                            <input
                              type="text"
                              value={stg.name}
                              onChange={(e) => updateStage(stg.id, { name: e.target.value })}
                              placeholder="Stage name"
                              className="w-full bg-transparent text-xs font-semibold text-ink outline-none"
                            />
                            <Icon name="edit" size={12} className="text-muted shrink-0 pointer-events-none" />
                          </div>
                        </div>

                        {/* Editable Date, Time, Format, Interviewer, and Status */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {stagesExpectation !== "practice" && (
                            <>
                              {/* Date Field with Interactive Calendar Popup */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDatePickerId(activeDatePickerId === stg.id ? null : stg.id);
                                    setActiveTimePickerId(null);
                                    setActiveFormatDropdownId(null);
                                    setActiveStatusDropdownId(null);
                                  }}
                                  className={clsx(
                                    "flex items-center gap-1.5 rounded-lg bg-[#141620] px-2.5 py-1.5 text-muted border transition-all cursor-pointer",
                                    activeDatePickerId === stg.id
                                      ? "border-blue-fill text-ink shadow-[0_0_12px_rgba(74,90,240,0.4)]"
                                      : "border-line/80 hover:border-line hover:text-ink"
                                  )}
                                >
                                  <span className="text-[10px] text-dim font-medium uppercase tracking-wider">Date</span>
                                  <Icon name="cal" size={13} className={stg.date ? "text-blue-soft shrink-0" : "text-muted/60 shrink-0"} />
                                  <span className={clsx("text-xs whitespace-nowrap", stg.date ? "font-semibold text-ink" : "text-muted/70 font-normal")}>
                                    {stg.date ? formatStageDate(stg.date) : "Date (optional)"}
                                  </span>
                                </button>

                                {activeDatePickerId === stg.id && (
                                  <CalendarPopup
                                    value={stg.date}
                                    onChange={(newDate) => updateStage(stg.id, { date: newDate })}
                                    onClose={() => setActiveDatePickerId(null)}
                                  />
                                )}
                              </div>

                              {/* Time Field with Interactive Time Picker Popup */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTimePickerId(activeTimePickerId === stg.id ? null : stg.id);
                                    setActiveDatePickerId(null);
                                    setActiveFormatDropdownId(null);
                                    setActiveStatusDropdownId(null);
                                  }}
                                  className={clsx(
                                    "flex items-center gap-1.5 rounded-lg bg-[#141620] px-2.5 py-1.5 text-muted border transition-all cursor-pointer",
                                    activeTimePickerId === stg.id
                                      ? "border-blue-fill text-ink shadow-[0_0_12px_rgba(74,90,240,0.4)]"
                                      : "border-line/80 hover:border-line hover:text-ink"
                                  )}
                                >
                                  <span className="text-[10px] text-dim font-medium uppercase tracking-wider">Time</span>
                                  <Icon name="clock" size={13} className={stg.time ? "text-blue-soft shrink-0" : "text-muted/60 shrink-0"} />
                                  <span className={clsx("text-xs whitespace-nowrap", stg.time ? "font-semibold text-ink" : "text-muted/70 font-normal")}>
                                    {stg.time || "Time (optional)"}
                                  </span>
                                </button>

                                {activeTimePickerId === stg.id && (
                                  <TimePickerPopup
                                    value={stg.time}
                                    onChange={(newTime) => updateStage(stg.id, { time: newTime })}
                                    onClose={() => setActiveTimePickerId(null)}
                                  />
                                )}
                              </div>
                            </>
                          )}

                          {/* Format Dropdown with Custom Dark Studio Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveFormatDropdownId(activeFormatDropdownId === stg.id ? null : stg.id);
                                setActiveDatePickerId(null);
                                setActiveTimePickerId(null);
                                setActiveStatusDropdownId(null);
                              }}
                              className={clsx(
                                "flex items-center gap-1.5 rounded-lg bg-[#141620] px-2.5 py-1.5 text-muted border transition-all cursor-pointer group",
                                activeFormatDropdownId === stg.id
                                  ? "border-blue-fill text-ink shadow-[0_0_12px_rgba(74,90,240,0.4)]"
                                  : "border-line/80 hover:border-line hover:text-ink"
                              )}
                            >
                              <span className="text-[10px] text-dim font-medium uppercase tracking-wider">Format</span>
                              {stg.format === "Video call" && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-soft shrink-0">
                                  <polygon points="23 7 16 12 23 17 23 7" />
                                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                </svg>
                              )}
                              {stg.format === "In person" && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lilac shrink-0">
                                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                                </svg>
                              )}
                              {stg.format === "Phone call" && (
                                <Icon name="phone" size={11} className="text-emerald-400 shrink-0" />
                              )}
                              <span className="text-xs font-semibold text-ink whitespace-nowrap">{stg.format}</span>
                              <span className={clsx("text-[9px] text-dim transition-transform duration-200", activeFormatDropdownId === stg.id && "rotate-180")}>▾</span>
                            </button>

                            {activeFormatDropdownId === stg.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-full left-0 z-50 mt-1.5 w-56 rounded-xl border border-line bg-[#151824] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(99,102,241,0.25)] backdrop-blur-md animate-scale-in"
                              >
                                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-dim border-b border-line/50 mb-1 flex items-center justify-between">
                                  <span>Select Format</span>
                                  <span className="text-[9px] lowercase text-dim font-normal">3 options</span>
                                </div>
                                {[
                                  {
                                    id: "Video call",
                                    label: "Video call",
                                    desc: "Online meeting via video",
                                    icon: (
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-soft">
                                        <polygon points="23 7 16 12 23 17 23 7" />
                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                      </svg>
                                    ),
                                  },
                                  {
                                    id: "In person",
                                    label: "In person",
                                    desc: "On-site at company office",
                                    icon: (
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lilac">
                                        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                                        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                                        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                                      </svg>
                                    ),
                                  },
                                  {
                                    id: "Phone call",
                                    label: "Phone call",
                                    desc: "Direct voice phone screening",
                                    icon: <Icon name="phone" size={12} className="text-emerald-400" />,
                                  },
                                ].map((fmt) => {
                                  const isSelected = stg.format === fmt.id;
                                  return (
                                    <button
                                      key={fmt.id}
                                      type="button"
                                      onClick={() => {
                                        updateStage(stg.id, { format: fmt.id });
                                        setActiveFormatDropdownId(null);
                                      }}
                                      className={clsx(
                                        "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-all cursor-pointer group/item",
                                        isSelected
                                          ? "bg-blue-fill/15 text-white"
                                          : "hover:bg-panel-2 text-ink/80 hover:text-ink"
                                      )}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div
                                          className={clsx(
                                            "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
                                            isSelected
                                              ? "bg-blue-fill/20 border-blue-fill/50"
                                              : "bg-panel-2 border-line/60 group-hover/item:border-line"
                                          )}
                                        >
                                          {fmt.icon}
                                        </div>
                                        <div>
                                          <div className={clsx("text-xs font-semibold leading-tight", isSelected ? "text-ink" : "text-ink/90")}>
                                            {fmt.label}
                                          </div>
                                          <div className="text-[10px] text-muted">{fmt.desc}</div>
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <span className="text-blue-soft text-xs font-bold pl-2">✓</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {stagesExpectation !== "practice" && (
                            /* Interviewer Field */
                            <div className="flex items-center gap-1.5 rounded-lg bg-[#141620] px-2.5 py-1.5 text-muted border border-line/80 focus-within:border-blue-fill">
                              <span className="text-[10px] text-dim font-medium uppercase tracking-wider">Interviewer</span>
                              <input
                                type="text"
                                value={stg.interviewer}
                                onChange={(e) => updateStage(stg.id, { interviewer: e.target.value })}
                                placeholder="Interviewer (optional)"
                                className="w-[125px] bg-transparent text-xs font-medium text-ink outline-none placeholder:text-muted/60"
                              />
                            </div>
                          )}

                          {stagesExpectation !== "practice" ? (
                            /* Status Dropdown with Custom Dark Studio Pill & Menu */
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveStatusDropdownId(activeStatusDropdownId === stg.id ? null : stg.id);
                                  setActiveDatePickerId(null);
                                  setActiveTimePickerId(null);
                                  setActiveFormatDropdownId(null);
                                }}
                                className={clsx(
                                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition-all cursor-pointer",
                                  stg.status === "completed" && "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/25 hover:border-[#10b981]/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
                                  stg.status === "next" && "bg-blue-fill/20 text-blue-soft border-blue-fill/40 hover:bg-blue-fill/30 hover:border-blue-fill/60 shadow-[0_0_12px_rgba(74,90,240,0.25)]",
                                  stg.status === "not_scheduled" && "bg-white/[0.06] text-muted border-white/[0.12] hover:bg-white/[0.1] hover:border-white/[0.2]",
                                  activeStatusDropdownId === stg.id && "ring-2 ring-blue-fill/40"
                                )}
                              >
                                <span
                                  className={clsx(
                                    "h-1.5 w-1.5 rounded-full shrink-0",
                                    stg.status === "completed" && "bg-[#10b981] shadow-[0_0_6px_#10b981]",
                                    stg.status === "next" && "bg-blue-soft shadow-[0_0_6px_#4f5df4] animate-pulse",
                                    stg.status === "not_scheduled" && "bg-dim"
                                  )}
                                />
                                <span className="capitalize">
                                  {stg.status === "completed" ? "Completed" : stg.status === "next" ? "Next stage" : "Not scheduled"}
                                </span>
                                <span className={clsx("text-[9px] opacity-70 transition-transform duration-200", activeStatusDropdownId === stg.id && "rotate-180")}>▾</span>
                              </button>

                              {activeStatusDropdownId === stg.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute top-full right-0 z-50 mt-1.5 w-56 rounded-xl border border-line bg-[#151824] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(99,102,241,0.25)] backdrop-blur-md animate-scale-in"
                                >
                                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-dim border-b border-line/50 mb-1 flex items-center justify-between">
                                    <span>Stage Status</span>
                                    <span className="text-[9px] lowercase text-dim font-normal">workflow</span>
                                  </div>
                                  {[
                                    {
                                      id: "completed",
                                      label: "Completed",
                                      desc: "Stage finished & passed",
                                      badgeColor: "text-[#10b981]",
                                      bgColor: "hover:bg-[#10b981]/10",
                                      indicator: (
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10b981]/20 text-[#10b981] font-bold text-xs border border-[#10b981]/30">
                                          ✓
                                        </div>
                                      ),
                                    },
                                    {
                                      id: "next",
                                      label: "Next stage",
                                      desc: "Upcoming interview focus",
                                      badgeColor: "text-blue-soft",
                                      bgColor: "hover:bg-blue-fill/15",
                                      indicator: (
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-fill/25 text-blue-soft text-xs border border-blue-fill/40">
                                          <span className="h-2 w-2 rounded-full bg-blue-soft animate-ping" />
                                        </div>
                                      ),
                                    },
                                    {
                                      id: "not_scheduled",
                                      label: "Not scheduled",
                                      desc: "Date yet to be confirmed",
                                      badgeColor: "text-muted",
                                      bgColor: "hover:bg-panel-2",
                                      indicator: (
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-dim text-xs border border-white/[0.1]">
                                          ○
                                        </div>
                                      ),
                                    },
                                  ].map((st) => {
                                    const isSelected = stg.status === st.id;
                                    return (
                                      <button
                                        key={st.id}
                                        type="button"
                                        onClick={() => {
                                          updateStage(stg.id, {
                                            status: st.id as "completed" | "next" | "not_scheduled",
                                          });
                                          setActiveStatusDropdownId(null);
                                        }}
                                        className={clsx(
                                          "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-all cursor-pointer group/stg",
                                          isSelected ? "bg-white/[0.08]" : st.bgColor
                                        )}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          {st.indicator}
                                          <div>
                                            <div className={clsx("text-xs font-semibold leading-tight", st.badgeColor)}>
                                              {st.label}
                                            </div>
                                            <div className="text-[10px] text-muted">{st.desc}</div>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <span className={clsx("text-xs font-bold pl-2", st.badgeColor)}>✓</span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Practice Round Badge */
                            <div className="flex items-center gap-1.5 rounded-full bg-blue-soft/10 px-3 py-1.5 text-[11px] font-semibold text-blue-soft border border-blue-fill/30 shadow-[0_0_12px_rgba(74,90,240,0.15)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-soft shadow-[0_0_6px_#4f5df4] animate-pulse" />
                              <span>Practice Round</span>
                            </div>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveStage(stg.id)}
                            className="p-1.5 text-dim hover:text-red-soft hover:bg-red-soft/10 rounded-lg transition-colors cursor-pointer"
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
                  onClick={handleAddStage}
                  className="mt-4 flex items-center gap-1.5 rounded-[10px] bg-panel-2 px-4 py-2 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2b2d38] transition-colors cursor-pointer active:scale-95"
                >
                  <Icon name="plus" size={14} strokeWidth={2.2} />
                  <span>{stagesExpectation === "practice" ? "+ Add another practice round" : "+ Add another stage"}</span>
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
        {/* STEP 3: PRACTICE SETUP (INTERACTIVE SLIDERS & ROUND SELECTION) */}
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
                    Tick the rounds you plan to practise. One set of questions is written for the whole job, and you choose the round each time you start a session.
                  </p>
                </div>
              </div>

              {/* Selectable Round Cards */}
              <div
                className={clsx(
                  "mt-5 grid grid-cols-1 gap-3",
                  stages.length === 1 && "sm:grid-cols-1 max-w-md",
                  stages.length === 2 && "sm:grid-cols-2",
                  stages.length === 3 && "sm:grid-cols-3",
                  stages.length >= 4 && "sm:grid-cols-2 lg:grid-cols-4"
                )}
              >
                {(stages.length > 0
                  ? stages.map((stg, idx) => ({
                      id: stg.id,
                      title: stg.name,
                      subtitle:
                        stagesExpectation === "practice"
                          ? `Practice round ${idx + 1} (${stg.format})`
                          : stg.interviewer
                            ? `With ${stg.interviewer} · ${stg.format}`
                            : `${stg.format} stage`,
                    }))
                  : [
                      { id: "1", title: "Recruiter screen", subtitle: "Background, motivation and fit." },
                      { id: "2", title: "Hiring manager round", subtitle: "Role, scope and impact." },
                      { id: "3", title: "Technical round", subtitle: "Product, technical depth and trade-offs." },
                      { id: "4", title: "Final panel", subtitle: "Cross-functional and leadership questions." },
                    ]
                ).map((rnd) => {
                  const isChecked = selectedRounds.includes(rnd.id);
                  return (
                    <button
                      key={rnd.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          if (selectedRounds.length > 1) {
                            setSelectedRounds(selectedRounds.filter((id) => id !== rnd.id));
                          }
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
                        <span className="text-sm font-semibold text-ink truncate">{rnd.title}</span>
                      </div>
                      <p className="mt-2 text-xs text-muted pl-7 leading-relaxed">{rnd.subtitle}</p>
                    </button>
                  );
                })}
              </div>

              {/* Summary Pill */}
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-panel-2 px-3.5 py-2.5 text-xs text-muted">
                <span className="rounded bg-[#1e2544] px-2 py-0.5 font-semibold text-[#818cf8]">
                  {rounds.length} {rounds.length === 1 ? "round" : "rounds"} selected
                </span>
                <span className="truncate">
                  {rounds.map((id) => stages.find((s) => s.id === id)?.name || "Round").join(", ") || "None"}
                </span>
              </div>

              {/* Interview style (Client Image 6) */}
              <div className="mt-6 border-t border-line pt-5">
                <h3 className="text-[14px] font-bold text-ink">Interview style</h3>
                <div className="mt-3 flex flex-col gap-2">
                  <label className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-panel-2/60 p-3.5 hover:border-white/20 transition-all cursor-pointer">
                    <input
                      type="radio"
                      name="interviewStyle"
                      value="recommended"
                      checked={interviewStyle === "recommended"}
                      onChange={() => {
                        setInterviewStyle("recommended");
                        setCategoryWeights(getSuggestedWeights(jobTitle, jobDoc?.text || jobPastedText));
                      }}
                      className="mt-0.5 h-4 w-4 text-indigo-500 accent-indigo-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-semibold text-ink">
                        Recommended from job description
                      </span>
                      <span className="text-xs text-muted"> — Hakkiri chooses the relevant categories.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-panel-2/60 p-3.5 hover:border-white/20 transition-all cursor-pointer">
                    <input
                      type="radio"
                      name="interviewStyle"
                      value="custom"
                      checked={interviewStyle === "custom"}
                      onChange={() => setInterviewStyle("custom")}
                      className="mt-0.5 h-4 w-4 text-indigo-500 accent-indigo-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-semibold text-ink">Custom</span>
                      <span className="text-xs text-muted"> — Choose your own categories and weighting.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Question Focus - 10 Categories with Checkboxes & Weighting (Client Image 7) */}
              <div className="mt-6 border-t border-line pt-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[14px] font-bold text-ink">Question focus</h3>
                  <p className="text-xs text-muted">
                    Choose the types of questions to include in your mock interview.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                  <span className="text-xs text-muted truncate">
                    {interviewStyle === "recommended"
                      ? `Suggested for ${jobTitle.trim() || companyName.trim() || "Associate Product Manager"}`
                      : "Customised question weighting"}
                  </span>
                  <span
                    className={clsx(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-tight border transition-colors",
                      totalCategoryWeight === 100
                        ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-400"
                        : "bg-amber-950/80 border-amber-500/40 text-amber-300"
                    )}
                  >
                    {totalCategoryWeight}% of 100%
                  </span>
                </div>

                {/* 10 Category Checklist & Weighting Adjusters */}
                <div className="mt-2 divide-y divide-white/[0.06]">
                  {FOCUS_CATEGORIES.map((cat) => {
                    const weight = categoryWeights[cat.key] || 0;
                    const isChecked = weight > 0;
                    return (
                      <div key={cat.key} className="py-2.5 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-3">
                          {/* Round Checkbox + Category Name */}
                          <button
                            type="button"
                            onClick={() => toggleCategory(cat.key)}
                            className="flex items-center gap-3 text-left group cursor-pointer"
                          >
                            <div
                              className={clsx(
                                "h-5 w-5 rounded-full flex items-center justify-center border transition-all shrink-0",
                                isChecked
                                  ? "bg-white text-black border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                  : "border-white/30 bg-transparent group-hover:border-white/60"
                              )}
                            >
                              {isChecked && (
                                <Icon name="check" size={12} strokeWidth={3} className="text-slate-950" />
                              )}
                            </div>
                            <span
                              className={clsx(
                                "text-xs font-semibold transition-colors",
                                isChecked ? "text-ink" : "text-muted group-hover:text-ink"
                              )}
                            >
                              {cat.label}
                            </span>
                          </button>

                          {/* Adjuster [-] XX% [+] */}
                          {isChecked ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                disabled={weight <= 5}
                                onClick={() => adjustCategory(cat.key, -5)}
                                aria-label={`Decrease ${cat.label} weighting`}
                                className="h-6 w-6 rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:scale-95 text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs transition-all cursor-pointer"
                              >
                                −
                              </button>
                              <span className="w-9 text-center font-bold text-xs text-ink num">
                                {weight}%
                              </span>
                              <button
                                type="button"
                                disabled={weight >= 100}
                                onClick={() => adjustCategory(cat.key, 5)}
                                aria-label={`Increase ${cat.label} weighting`}
                                className="h-6 w-6 rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:scale-95 text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs transition-all cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted/60 select-none">Off</span>
                          )}
                        </div>

                        {/* Progress Bar Track */}
                        {isChecked && (
                          <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden ml-8 max-w-[calc(100%-32px)]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-150"
                              style={{ width: `${Math.min(100, weight)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-xs text-ink pt-2 border-t border-white/[0.06]" data-testid="mix-sent">
                  Your questions will be: <b className="font-semibold">{weightsLine(categoryWeights)}</b>
                </p>
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
                    <Icon name={missing("cv") ? "x" : "check"} size={14} className={missing("cv") ? "text-red-soft" : "text-[#10b981]"} /> {form.cvLabel || "CV"}
                  </span>
                  <span className={missing("cv") ? "text-red-soft font-semibold" : "text-[#10b981] font-semibold"} data-testid="review-cv">{missing("cv") ? "Needed: not added yet" : cvDoc?.detail || `${form.cvText.split(/\s+/).filter(Boolean).length} words`}</span>
                </div>
                <div className="flex items-center justify-between rounded-[10px] bg-panel-2 px-3 py-2 text-xs">
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <Icon name="check" size={14} className={form.jobText ? "text-[#10b981]" : "text-muted"} /> {form.jobText ? form.jobLabel || "Job description" : "Job description"}
                  </span>
                  <span className={form.jobText ? "text-[#10b981] font-semibold" : "text-muted"} data-testid="review-job">{form.jobText ? jobDoc?.detail || `${form.jobText.split(/\s+/).filter(Boolean).length} words` : form.jobUrl.trim() ? "Link only: not read yet" : "Not provided"}</span>
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
                    <h3 className="text-sm font-bold text-ink">
                      {stagesExpectation === "practice" ? "Practice rounds" : "Interview stages"} ({stages.length})
                    </h3>
                    <p className="text-xs text-muted">
                      {stagesExpectation === "practice" ? "The practice sessions configured for this interview." : "The stages of your interview, in order."}
                    </p>
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
                      {stagesExpectation === "practice" ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-fill/20 text-blue-soft text-[10px] font-bold">
                          {i + 1}
                        </div>
                      ) : stg.status === "completed" ? (
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
                      {stagesExpectation === "practice" ? (
                        <span className="rounded-full bg-blue-soft/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-soft border border-blue-fill/30">
                          {stg.format}
                        </span>
                      ) : (
                        <>
                          {stg.status === "completed" && (
                            <span className="rounded-full bg-[#10b981]/15 px-2 py-0.5 text-[11px] font-semibold text-[#10b981]">
                              Completed
                            </span>
                          )}
                          {stg.status === "next" && (
                            <span className="text-muted font-medium">
                              {formatStageDate(stg.date, stg.time) || "No date yet"}
                            </span>
                          )}
                          {stg.status === "not_scheduled" && (
                            <span className="text-muted">Not scheduled</span>
                          )}
                        </>
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
                    {rounds.map((id) => stages.find((s) => s.id === id)?.name || "Stage").join(", ") || "None"}
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
              <p className="mt-0.5 text-xs text-muted truncate">{[companyName.trim(), jobTitle.trim()].filter(Boolean).join(" · ") || "No company or job title yet"}</p>
              <div className="mt-4 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">CV</span>
                  {missing("cv") ? (
                    <span className="text-dim" data-testid="side-cv">Not added yet</span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-[#10b981]" data-testid="side-cv">
                      Added <Icon name="check" size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">Job description</span>
                  {form.jobText ? (
                    <span className="flex items-center gap-1 font-semibold text-[#10b981]" data-testid="side-job">
                      Added <Icon name="check" size={12} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="text-dim" data-testid="side-job">{form.jobUrl.trim() ? "Link only: not read yet" : "Not added yet"}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Cover letter</span>
                  <span className="text-dim">{form.coverText ? "Added ✓" : "Not added yet"}</span>
                </div>
              </div>
            </Panel>
          )}

          {step === 2 && (
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h3 className="text-[15px] font-bold text-ink">Interview overview</h3>
              <p className="mt-0.5 text-xs text-muted truncate">{[companyName.trim(), jobTitle.trim()].filter(Boolean).join(" · ") || "No company or job title yet"}</p>
              <div className="mt-4 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">CV</span>
                  {missing("cv") ? (
                    <span className="text-dim" data-testid="side-cv">Not added yet</span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-[#10b981]" data-testid="side-cv">
                      Added <Icon name="check" size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">Job description</span>
                  {form.jobText ? (
                    <span className="flex items-center gap-1 font-semibold text-[#10b981]" data-testid="side-job">
                      Added <Icon name="check" size={12} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="text-dim" data-testid="side-job">{form.jobUrl.trim() ? "Link only: not read yet" : "Not added yet"}</span>
                  )}
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
              <p className="mt-0.5 text-xs text-muted">
                {companyName.trim() || "No company yet"} · {stages.length} {stages.length === 1 ? "stage" : "stages"}
              </p>

              <div className="mt-4 flex flex-col gap-3 text-xs">
                <div className="border-b border-line pb-2.5">
                  <span className="text-muted block mb-1.5">Stages ({rounds.length})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rounds.map((id) => {
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
                  <div className="text-[11px] text-ink">
                    {categoryWeights && Object.values(categoryWeights).some((v) => v > 0)
                      ? weightsLine(categoryWeights)
                      : mixLine(mixToSend)}
                  </div>
                </div>

                <p className="text-[11px] text-muted">
                  One set of questions is written for the whole job. You choose which round to practise each time you start a session.
                </p>
              </div>
            </Panel>
          )}

          {step === 4 && (
            <Panel className="rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h3 className="text-[16px] font-bold text-ink">Ready to build?</h3>
              <p className="mt-0.5 text-xs text-muted">
                {problems.length ? "Something is still needed before your questions can be written." : "Everything needed is here. You can add more stages and sessions later."}
              </p>

              <div className="mt-4 flex flex-col gap-2 text-xs" data-testid="build-checks">
                <div className="flex items-center justify-between py-1 text-ink">
                  <span>Company and job</span>
                  {missing("company") || missing("job") ? <span className="font-semibold text-red-soft">Missing</span> : <Icon name="check" size={13} strokeWidth={3} className="text-[#10b981]" />}
                </div>
                <div className="flex items-center justify-between py-1 text-ink">
                  <span>Your CV</span>
                  {missing("cv") ? <span className="font-semibold text-red-soft">Missing</span> : <Icon name="check" size={13} strokeWidth={3} className="text-[#10b981]" />}
                </div>
                <div className="flex items-center justify-between py-1 text-ink">
                  <span>{stages.length} interview stage{stages.length === 1 ? "" : "s"}</span>
                  <Icon name="check" size={13} strokeWidth={3} className="text-[#10b981]" />
                </div>
                <div className="flex items-center justify-between py-1 text-ink">
                  <span>Practice setup</span>
                  <Icon name="check" size={13} strokeWidth={3} className="text-[#10b981]" />
                </div>
              </div>

              {buildError && (
                <p role="alert" data-testid="build-error" className="mt-4 rounded-[10px] border border-red/30 bg-red/10 px-3 py-2 text-xs leading-relaxed text-red-soft">
                  {buildError}
                </p>
              )}

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
              <h3 className="text-sm font-bold text-ink">
                {stagesExpectation === "practice" ? "Practice mode tips" : "Good to know"}
              </h3>
              <div className="mt-3.5 flex flex-col gap-3.5 text-xs text-muted">
                {stagesExpectation === "practice" ? (
                  <>
                    <div className="flex items-start gap-2.5">
                      <Icon name="target" size={14} className="text-blue-soft shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-ink block">No dates needed</span>
                        <span>Practice on your own schedule without worrying about calendar dates or interviewer contacts.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Icon name="edit" size={14} className="text-ink shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-ink block">Customize rounds</span>
                        <span>Rename each round to focus on technical, behavioral, or case study practice.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Icon name="plus" size={14} className="text-ink shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-ink block">Add more rounds</span>
                        <span>Add as many practice rounds as you need to build confidence.</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
              <h3 className="text-sm font-bold text-ink">
                {stagesExpectation === "practice" ? "Practice mode ready" : "Add later (optional)"}
              </h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                {stagesExpectation === "practice"
                  ? "Dates and interviewers aren't required. You can jump straight into high-yield mock practice whenever you're ready."
                  : "Dates for later rounds and interviewer details can be added whenever you know them."}
              </p>
            </Panel>
          )}
        </div>
      </div>

      {/* Click outside backdrop for open calendar, timepicker, format or status dropdown */}
      {(activeDatePickerId || activeTimePickerId || activeFormatDropdownId || activeStatusDropdownId) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setActiveDatePickerId(null);
            setActiveTimePickerId(null);
            setActiveFormatDropdownId(null);
            setActiveStatusDropdownId(null);
          }}
        />
      )}

      {/* Floating Animated Toast on Save Draft */}
      {draftToast && (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-[420px] items-start gap-3 rounded-2xl border border-line bg-[#151824] p-4 text-xs text-ink shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(99,102,241,0.25)] animate-rise">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#10b981]/20 text-[#10b981]">
            <Icon name="check" size={16} strokeWidth={2.6} />
          </div>
          <div className="min-w-0 grow">
            <div className="font-bold text-white text-sm">{draftToast.title}</div>
            <p className="mt-0.5 text-xs text-muted leading-relaxed">{draftToast.subtitle}</p>
            <div className="mt-2.5 flex items-center gap-3">
              <Link
                href="/interviews"
                className="font-semibold text-blue-soft hover:underline"
              >
                View in Interviews list →
              </Link>
              <button
                type="button"
                onClick={() => setShowDraftModal(true)}
                className="text-muted hover:text-ink cursor-pointer"
              >
                Storage details
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDraftToast(null)}
            className="p-1 text-muted hover:text-ink cursor-pointer"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      )}

      {/* Draft Storage Details Modal */}
      <DraftStorageModal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        initialDraft={{
          companyName,
          jobTitle,
          companyWebsite,
          cvDoc,
          jobDoc,
          coverDoc,
          stagesExpectation,
          stages,
          selectedRounds,
          techFocus,
          skillsFocus,
          expFocus,
          difficulty,
          duration,
          step,
          savedAt: lastSavedTime ?? "",
        }}
        onDraftDiscarded={handleDiscardDraft}
      />

      {/* Cancel Confirmation Modal (UX-5) */}
      {showCancelModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="cancel-draft-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-panel border border-white/15 p-6 shadow-2xl">
            <h3 id="cancel-draft-title" className="text-lg font-bold text-white">Keep this draft?</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              You can keep your progress to carry on later, or discard it to start fresh.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem("hk_interview_wizard_draft");
                  } catch {}
                  setShowCancelModal(false);
                  router.push("/interviews");
                }}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                Discard draft
              </button>
              <button
                type="button"
                onClick={() => {
                  saveDraft();
                  setShowCancelModal(false);
                  router.push("/interviews");
                }}
                className="rounded-xl bg-blue-fill px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-hover transition-all cursor-pointer"
              >
                Keep draft
              </button>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="rounded-xl border border-line px-4 py-2.5 text-xs font-medium text-muted hover:text-white transition-all cursor-pointer"
              >
                Carry on
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
