"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { CustomSelect, Icon, Panel } from "@/components/ui";
import { ImportFromCvModal } from "@/components/examples/ImportFromCvModal";
import {
  loadExamples,
  toggleExampleFavorite,
  type InterviewExample,
} from "@/lib/examples/store";

export default function InterviewExamplesPage() {
  const [examples, setExamples] = useState<InterviewExample[]>([]);
  const [tab, setTab] = useState<"all" | "competency" | "role" | "favourites">("all");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setExamples(loadExamples());
    const onUpdate = () => setExamples(loadExamples());
    window.addEventListener("hk_examples_updated", onUpdate);
    return () => window.removeEventListener("hk_examples_updated", onUpdate);
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    examples.forEach((ex) => ex.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [examples]);

  const filteredExamples = useMemo(() => {
    return examples.filter((ex) => {
      // Tab filter
      if (tab === "favourites" && !ex.isFavorite) return false;
      // Tag filter
      if (selectedTag !== "all" && !ex.tags.includes(selectedTag)) return false;
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = ex.title.toLowerCase().includes(q);
        const matchQ = ex.question.toLowerCase().includes(q);
        const matchA = ex.answer.toLowerCase().includes(q);
        const matchTags = ex.tags.some((t) => t.toLowerCase().includes(q));
        const matchComp = ex.competency.toLowerCase().includes(q);
        if (!matchTitle && !matchQ && !matchA && !matchTags && !matchComp) return false;
      }
      return true;
    });
  }, [examples, tab, selectedTag, search]);

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExampleFavorite(id);
    setExamples(loadExamples());
  };

  return (
    <div className="flex grow flex-col pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-rise">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Interview examples</h1>
          <p className="mt-1 text-xs text-muted max-w-[680px]">
            Build a personal bank of real examples to use in interviews. Capture, organise and reuse your best experiences.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
          >
            <Icon name="download" size={13} className="rotate-180" />
            <span>Import from CV</span>
          </button>

          <Link
            href="/interview-examples/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-fill hover:bg-blue-hover px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(79,82,248,0.35)] hover:shadow-[0_6px_22px_rgba(79,82,248,0.55)] transition-all cursor-pointer"
          >
            <Icon name="code" size={13} className="rotate-45" />
            <span>+ Add example</span>
          </Link>
        </div>
      </div>

      {/* Tabs & Search / Filter Controls Row */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3 text-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={clsx(
              "font-medium transition-colors cursor-pointer relative pb-3 -mb-3",
              tab === "all" ? "text-white font-semibold border-b-2 border-indigo-500" : "text-muted hover:text-white"
            )}
          >
            All examples ({examples.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("competency")}
            className={clsx(
              "font-medium transition-colors cursor-pointer relative pb-3 -mb-3",
              tab === "competency" ? "text-white font-semibold border-b-2 border-indigo-500" : "text-muted hover:text-white"
            )}
          >
            By competency
          </button>
          <button
            type="button"
            onClick={() => setTab("role")}
            className={clsx(
              "font-medium transition-colors cursor-pointer relative pb-3 -mb-3",
              tab === "role" ? "text-white font-semibold border-b-2 border-indigo-500" : "text-muted hover:text-white"
            )}
          >
            By role
          </button>
          <button
            type="button"
            onClick={() => setTab("favourites")}
            className={clsx(
              "font-medium transition-colors cursor-pointer relative pb-3 -mb-3",
              tab === "favourites" ? "text-white font-semibold border-b-2 border-indigo-500" : "text-muted hover:text-white"
            )}
          >
            Favourites
          </button>
        </div>

        {/* Search & Tag Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search examples..."
              className="w-48 sm:w-60 rounded-xl bg-panel-2 px-3 py-1.5 pl-8 text-xs text-ink outline-none border border-line focus:border-blue-fill placeholder:text-dim"
            />
            <span className="absolute left-2.5 top-2 text-dim text-xs">🔍</span>
          </div>

          <div className="w-36">
            <CustomSelect
              size="sm"
              value={selectedTag}
              onChange={setSelectedTag}
              options={[
                { value: "all", label: "All tags" },
                ...allTags.map((t) => ({ value: t, label: t })),
              ]}
              menuClassName="right-0 left-auto w-44"
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-6 items-start">
        {/* Left Column: Examples List */}
        <div className="space-y-3">
          {filteredExamples.length === 0 ? (
            <Panel className="p-8 text-center text-xs text-muted">
              <p className="font-semibold text-white">No examples found</p>
              <p className="mt-1 text-dim">Try adjusting your search or tag filters, or add a new example.</p>
            </Panel>
          ) : (
            filteredExamples.map((ex) => {
              const isExpanded = expandedId === ex.id;
              return (
                <div
                  key={ex.id}
                  onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                  className={clsx(
                    "rounded-[16px] bg-panel-2/90 border border-line/80 p-4 transition-all duration-200 cursor-pointer hover:border-indigo-500/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]",
                    isExpanded && "border-indigo-500/50 bg-[#161a29]"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(ex.id, e)}
                        className="text-dim hover:text-amber-400 transition-colors mt-0.5 cursor-pointer shrink-0"
                      >
                        <span className={clsx("text-base leading-none", ex.isFavorite ? "text-amber-400" : "text-dim")}>
                          {ex.isFavorite ? "★" : "☆"}
                        </span>
                      </button>

                      <div className="min-w-0 space-y-2">
                        <h3 className="text-sm font-semibold text-white leading-snug">{ex.title}</h3>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {ex.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded-md bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-muted"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {ex.isStarStructure && (
                        <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-indigo-300">
                          STAR
                        </span>
                      )}
                      <Icon
                        name="chevronRight"
                        size={14}
                        className={clsx("text-muted transition-transform", isExpanded && "rotate-90 text-indigo-300")}
                      />
                    </div>
                  </div>

                  {/* Expandable STAR Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-3.5 border-t border-line/70 space-y-3 text-xs animate-fade-in">
                      <div>
                        <span className="font-semibold text-indigo-300 block mb-0.5">Question it answers:</span>
                        <p className="text-white font-medium">{ex.question}</p>
                      </div>

                      <div>
                        <span className="font-semibold text-muted block mb-0.5">Example Answer (STAR):</span>
                        <p className="text-muted leading-relaxed whitespace-pre-line">{ex.answer}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line/40 text-[11px] text-dim">
                        <span>Role: <b className="text-muted font-normal">{ex.role}</b></span>
                        <span>Competency: <b className="text-muted font-normal">{ex.competency}</b></span>
                        <span>Type: <b className="text-muted font-normal">{ex.interviewType}</b></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Tips & Quick Actions */}
        <div className="space-y-5">
          {/* Card 1: Get the most from your examples */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                <Icon name="sparkle" size={16} />
              </div>
              <h2 className="text-sm font-bold text-white">Get the most from your examples</h2>
            </div>

            <ul className="space-y-3 text-xs text-muted">
              <li className="flex items-start gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold mt-0.5">
                  ✓
                </div>
                <span>Use the STAR structure (Situation, Task, Action, Result).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold mt-0.5">
                  ✓
                </div>
                <span>Cover key areas like leadership, problem-solving and impact.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold mt-0.5">
                  ✓
                </div>
                <span>Keep examples concise, specific and results-focused.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold mt-0.5">
                  ✓
                </div>
                <span>Reuse and tailor examples for different roles and questions.</span>
              </li>
            </ul>
          </Panel>

          {/* Card 2: Quick actions */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2.5 pb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <Icon name="target" size={16} />
              </div>
              <h2 className="text-sm font-bold text-white">Quick actions</h2>
            </div>

            <div className="space-y-2">
              <Link
                href="/practice"
                className="group flex items-center justify-between gap-3 rounded-xl bg-panel-2 p-3 border border-line/70 hover:border-indigo-500/50 hover:bg-[#181d30] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-ink group-hover:text-indigo-300 transition-colors">
                    <Icon name="play" size={13} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      Practise with your examples
                    </h3>
                    <p className="text-[11px] text-muted">Turn your examples into interview practice</p>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-dim group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/interview-examples/new"
                className="group flex items-center justify-between gap-3 rounded-xl bg-panel-2 p-3 border border-line/70 hover:border-indigo-500/50 hover:bg-[#181d30] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-ink group-hover:text-indigo-300 transition-colors">
                    <Icon name="doc" size={13} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      Create from a prompt
                    </h3>
                    <p className="text-[11px] text-muted">Get guided help to write a new example</p>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-dim group-hover:text-white transition-colors" />
              </Link>
            </div>
          </Panel>
        </div>
      </div>

      {/* Import from CV Modal */}
      <ImportFromCvModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={(count) => {
          setToastMessage(`Successfully imported ${count} STAR examples from your CV!`);
          setTimeout(() => setToastMessage(null), 4500);
        }}
      />

      {/* Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-[#142328] border border-emerald-500/40 px-4 py-3 text-xs font-semibold text-emerald-200 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-md animate-slide-up">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-black text-[11px] font-bold">
            ✓
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
