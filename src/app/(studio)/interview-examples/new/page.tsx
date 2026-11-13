"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { Icon, Panel } from "@/components/ui";
import { saveExample } from "@/lib/examples/store";

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

export default function AddInterviewExamplePage() {
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

          {/* Row 1: 3 Select Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Competency Dropdown */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-xs font-semibold text-white">
                <span>Competency</span>
                <span className="text-dim text-[11px]" title="The core skill or behavior assessed">ⓘ</span>
              </label>
              <div className="relative">
                <select
                  value={competency}
                  onChange={(e) => setCompetency(e.target.value)}
                  className="w-full appearance-none rounded-[12px] bg-panel-2 px-3 py-2.5 pl-8 text-xs text-ink outline-none border border-line focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="">Select competency</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Problem-solving">Problem-solving</option>
                  <option value="Influencing">Influencing</option>
                  <option value="Communication">Communication</option>
                  <option value="Continuous improvement">Continuous improvement</option>
                  <option value="Strategic thinking">Strategic thinking</option>
                  <option value="Analytical thinking">Analytical thinking</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Delivery">Delivery</option>
                </select>
                <div className="pointer-events-none absolute left-2.5 top-3 text-muted">
                  <Icon name="target" size={14} />
                </div>
                <div className="pointer-events-none absolute right-3 top-3.5 text-[10px] text-muted">
                  ▾
                </div>
              </div>
            </div>

            {/* 2. Role Dropdown */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-xs font-semibold text-white">
                <span>Role</span>
                <span className="text-dim text-[11px]" title="Role or job category this example belongs to">ⓘ</span>
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full appearance-none rounded-[12px] bg-panel-2 px-3 py-2.5 pl-8 text-xs text-ink outline-none border border-line focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="">Select role</option>
                  <option value="Senior Adviser, Policy & Strategy">Senior Adviser, Policy & Strategy</option>
                  <option value="Senior Product Manager">Senior Product Manager</option>
                  <option value="Operations / Delivery Lead">Operations / Delivery Lead</option>
                  <option value="General / Universal">General / Universal</option>
                </select>
                <div className="pointer-events-none absolute left-2.5 top-3 text-muted">
                  <Icon name="user" size={14} />
                </div>
                <div className="pointer-events-none absolute right-3 top-3.5 text-[10px] text-muted">
                  ▾
                </div>
              </div>
            </div>

            {/* 3. Interview Type Dropdown */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-xs font-semibold text-white">
                <span>Interview type</span>
                <span className="text-dim text-[11px]" title="Which interview stage or format this fits best">ⓘ</span>
              </label>
              <div className="relative">
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full appearance-none rounded-[12px] bg-panel-2 px-3 py-2.5 pl-8 text-xs text-ink outline-none border border-line focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="">Select interview type</option>
                  <option value="Competency">Competency round</option>
                  <option value="Hiring manager">Hiring manager interview</option>
                  <option value="Technical">Technical round</option>
                  <option value="Final panel">Final panel</option>
                  <option value="Recruiter screen">Recruiter screen</option>
                </select>
                <div className="pointer-events-none absolute left-2.5 top-3 text-muted">
                  <Icon name="layers" size={14} />
                </div>
                <div className="pointer-events-none absolute right-3 top-3.5 text-[10px] text-muted">
                  ▾
                </div>
              </div>
            </div>
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
