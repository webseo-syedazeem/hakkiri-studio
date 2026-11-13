"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { CustomSelect, Icon, Panel } from "@/components/ui";
import { saveExample } from "@/lib/examples/store";

const COMPETENCY_OPTIONS = [
  { value: "Leadership", label: "Leadership" },
  { value: "Problem-solving", label: "Problem-solving" },
  { value: "Influencing", label: "Influencing" },
  { value: "Communication", label: "Communication" },
  { value: "Continuous improvement", label: "Continuous improvement" },
  { value: "Strategic thinking", label: "Strategic thinking" },
  { value: "Analytical thinking", label: "Analytical thinking" },
  { value: "Collaboration", label: "Collaboration" },
  { value: "Delivery", label: "Delivery" },
  { value: "Stakeholder management", label: "Stakeholder management" },
  { value: "Risk management", label: "Risk management" },
  { value: "Decision-making", label: "Decision-making" },
];

const ROLE_OPTIONS = [
  { value: "Senior Adviser, Policy & Strategy", label: "Senior Adviser, Policy & Strategy" },
  { value: "Senior Product Manager", label: "Senior Product Manager" },
  { value: "Operations / Delivery Lead", label: "Operations / Delivery Lead" },
  { value: "Engineering / Technical Lead", label: "Engineering / Technical Lead" },
  { value: "General / Universal", label: "General / Universal" },
];

const INTERVIEW_TYPE_OPTIONS = [
  { value: "Competency", label: "Competency round" },
  { value: "Hiring manager", label: "Hiring manager interview" },
  { value: "Technical", label: "Technical round" },
  { value: "Final panel", label: "Final panel" },
  { value: "Recruiter screen", label: "Recruiter screen" },
  { value: "Case interview", label: "Case interview" },
];

const PRESET_TAGS = [
  "Leadership",
  "Stakeholder management",
  "Problem-solving",
  "Delivery",
  "Risk management",
  "Continuous improvement",
  "Influencing",
  "Collaboration",
  "Data-driven",
];

export function AddExampleView() {
  const router = useRouter();

  const [competency, setCompetency] = useState("");
  const [role, setRole] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Leadership"]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [showCustomTagField, setShowCustomTagField] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customTagInput.trim();
    if (clean && !selectedTags.includes(clean)) {
      setSelectedTags((prev) => [...prev, clean]);
      setCustomTagInput("");
      setShowCustomTagField(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError("Please provide an interview question.");
      return;
    }
    if (!answer.trim()) {
      setError("Please provide your example answer.");
      return;
    }

    const titleCandidate =
      answer
        .split(/[.\n]/)[0]
        ?.replace(/^(situation|task|action|result|in my role|i)\s*[:,-]?\s*/i, "")
        ?.trim() || question.trim();

    saveExample({
      title: titleCandidate.length > 70 ? `${titleCandidate.slice(0, 70)}...` : titleCandidate,
      question: question.trim(),
      answer: answer.trim(),
      competency: competency || "Leadership",
      role: role || "Senior Role",
      interviewType: interviewType || "Competency",
      tags: selectedTags.length > 0 ? selectedTags : ["Leadership"],
      isFavorite: false,
      isStarStructure: true,
    });

    router.push("/interview-examples");
  };

  return (
    <div className="flex w-full grow flex-col pb-12 animate-rise">
      {/* Back Link & Header */}
      <div className="mb-4">
        <Link
          href="/interview-examples"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-white transition-colors mb-2"
        >
          <Icon name="back" size={13} />
          <span>Interview examples</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">Add interview question example</h1>
        <p className="mt-1 text-xs text-muted">
          Save a question and your example answer to practise and reuse later.
        </p>
      </div>

      {/* Main Form Panel */}
      <Panel className="w-full p-6 sm:p-7 space-y-5 rounded-[20px] border border-line shadow-xl">
        <form onSubmit={handleSave} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Row 1: 3 Animated Custom Select Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CustomSelect
              label="Competency"
              tooltip="The core skill or behavior assessed"
              icon="target"
              placeholder="Select competency"
              value={competency}
              onChange={setCompetency}
              options={COMPETENCY_OPTIONS}
            />

            <CustomSelect
              label="Role"
              tooltip="Role or job category this example belongs to"
              icon="user"
              placeholder="Select role"
              value={role}
              onChange={setRole}
              options={ROLE_OPTIONS}
            />

            <CustomSelect
              label="Interview type"
              tooltip="Which interview stage or format this fits best"
              icon="layers"
              placeholder="Select interview type"
              value={interviewType}
              onChange={setInterviewType}
              options={INTERVIEW_TYPE_OPTIONS}
            />
          </div>

          {/* Field 2: Interview Question */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-white">
              Interview question <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Tell me about a time you led a project."
              className="w-full rounded-[12px] bg-panel-2 px-3.5 py-2.5 text-xs text-ink outline-none border border-line focus:border-indigo-500 transition-colors placeholder:text-dim"
            />
          </div>

          {/* Field 3: Your Example Answer */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-white">
              Your example answer <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <textarea
                required
                rows={5}
                maxLength={1000}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setError(null);
                }}
                placeholder="Write a concise answer using STAR (Situation, Task, Action, Result)."
                className="w-full resize-y rounded-[12px] bg-panel-2 p-3.5 pb-7 text-xs leading-relaxed text-ink outline-none border border-line focus:border-indigo-500 transition-colors placeholder:text-dim"
              />
              <span className="absolute right-3 bottom-2.5 text-[10px] text-dim num">
                {answer.length} / 1,000
              </span>
            </div>
          </div>

          {/* Field 4: Tags (optional) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white">
              Tags <span className="text-muted font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={clsx(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border",
                      active
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                        : "bg-panel-2 border-line text-muted hover:text-ink hover:border-line-strong"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}

              {showCustomTagField ? (
                <div className="inline-flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    placeholder="Tag name"
                    className="w-24 rounded-lg bg-panel-2 px-2.5 py-1 text-xs text-ink outline-none border border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomTag(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="rounded-lg bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomTagField(true)}
                  className="rounded-lg border border-dashed border-white/20 px-3 py-1.5 text-xs font-medium text-muted hover:text-white hover:border-white/40 transition-colors cursor-pointer"
                >
                  + Add tag
                </button>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
            <Link
              href="/interview-examples"
              className="rounded-xl px-4 py-2 text-xs font-semibold text-muted hover:text-white transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-fill hover:bg-blue-hover px-5 py-2 text-xs font-semibold text-white shadow-[0_4px_18px_rgba(79,82,248,0.35)] transition-all cursor-pointer"
            >
              <Icon name="check" size={13} strokeWidth={2.5} />
              <span>Save example</span>
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
