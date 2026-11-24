"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { CustomSelect, Icon, Panel } from "@/components/ui";
import {
  loadExamples,
  toggleExampleFavorite,
  updateExample,
  deleteExample,
  type InterviewExample,
} from "@/lib/examples/store";

/** A story held on one of the person's own interviews (from their CV at set-up, or built with the story builder). */
export interface LibraryStory {
  key: string;
  title: string;
  source: string;
  text: string;
  skill: string;
  interviews: { id: string; company: string }[];
  /** The parts (situation, task, action, result) it doesn't yet have. */
  missing: string[];
  practiseHref: string | null;
}

export function InterviewExamplesView({ stories = [] }: { stories?: LibraryStory[] }) {
  const [examples, setExamples] = useState<InterviewExample[]>([]);
  const [tab, setTab] = useState<"all" | "competency" | "role" | "favourites">("all");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit response state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editInterviewType, setEditInterviewType] = useState("");
  const [editCompetency, setEditCompetency] = useState("");

  const startEditing = (ex: InterviewExample, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(ex.id);
    setEditQuestion(ex.question);
    setEditAnswer(ex.answer);
    setEditRole(ex.role);
    setEditInterviewType(ex.interviewType);
    setEditCompetency(ex.competency);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleSaveEdit = (id: string, e: React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    updateExample(id, {
      question: editQuestion.trim(),
      answer: editAnswer.trim(),
      // Saved as entered: an empty box stays empty, and nothing is chosen for the person.
      role: editRole.trim(),
      interviewType: editInterviewType.trim(),
      competency: editCompetency.trim(),
    });
    setEditingId(null);
    setToastMessage("Example updated.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteExample = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteExample(id);
    if (expandedId === id) setExpandedId(null);
    if (editingId === id) setEditingId(null);
    setToastMessage("Example removed.");
    setTimeout(() => setToastMessage(null), 3000);
  };

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
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2.5 text-xs font-semibold text-emerald-300 shadow-2xl animate-rise flex items-center gap-2 backdrop-blur-md">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-rise">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Experience Library</h1>
          <p className="mt-1 text-xs text-muted max-w-[680px]">
            Your own bank of examples to use in interviews: ones you write, and stronger versions you save from your practice feedback.
          </p>
          <p className="mt-1 text-[11px] text-muted max-w-[680px]" data-testid="library-where">
            Kept in this browser only. It is not part of your account, so it is not in your data download and won’t appear on another device.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">

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

      {stories.length > 0 && (
        <section aria-labelledby="library-stories" className="mt-6" data-testid="library-stories">
          <h2 id="library-stories" className="text-sm font-bold text-white">
            Stories from your interviews ({stories.length})
          </h2>
          <p className="mt-1 text-[11px] text-muted">Found in your CV when you set an interview up, or built with the story builder. These are saved to your account.</p>
          <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {stories.map((s) => (
              <li key={s.key}>
                <Panel className="h-full p-4 space-y-1.5 text-xs">
                  <div className="font-bold text-white">{s.title}</div>
                  <div className="text-[11px] text-dim">
                    {s.source}
                    {s.interviews.length ? ` · ${s.interviews.map((i) => i.company).join(", ")}` : ""}
                  </div>
                  {s.text ? <p className="text-[#c9cad8] leading-relaxed whitespace-pre-line">{s.text}</p> : <p className="text-muted">Only its outline is saved. {s.missing.length ? `Still missing: ${s.missing.join(", ")}.` : ""}</p>}
                  {s.practiseHref ? (
                    <Link href={s.practiseHref} className="inline-block font-semibold text-blue-soft hover:underline">
                      Practise it on a question →
                    </Link>
                  ) : null}
                </Panel>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Main 2-Column Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-6 items-start">
        {/* Left Column: Examples List */}
        <div className="space-y-3">
          {examples.length === 0 ? (
            <Panel className="p-8 text-center text-xs text-muted" data-testid="library-empty">
              <p className="font-semibold text-white">Your library is empty</p>
              <p className="mt-1 text-dim max-w-md mx-auto">Nothing is added here for you. Write an example of your own, or save a stronger version from the feedback on one of your practice answers.</p>
              <Link href="/interview-examples/new" className="mt-4 inline-flex items-center rounded-xl bg-blue-fill hover:bg-blue-hover px-4 py-2 text-xs font-semibold text-white">
                Add your first example
              </Link>
            </Panel>
          ) : filteredExamples.length === 0 ? (
            <Panel className="p-8 text-center text-xs text-muted">
              <p className="font-semibold text-white">No examples match</p>
              <p className="mt-1 text-dim">Change the search or the tag filter to see the rest.</p>
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
                        <h2 className="text-sm font-semibold text-white leading-snug">{ex.title}</h2>

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

                  {/* Expandable STAR Details & Edit Response */}
                  {isExpanded && (
                    <div
                      className="mt-4 pt-3.5 border-t border-line/70 space-y-3.5 text-xs animate-fade-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editingId === ex.id ? (
                        <form onSubmit={(e) => handleSaveEdit(ex.id, e)} className="space-y-3.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                              Question it answers
                            </label>
                            <input
                              type="text"
                              required
                              value={editQuestion}
                              onChange={(e) => setEditQuestion(e.target.value)}
                              className="w-full rounded-xl bg-[#111320] px-3.5 py-2 text-xs text-white border border-indigo-500/50 outline-none focus:border-indigo-400"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                              Example Answer / Response (STAR)
                            </label>
                            <textarea
                              rows={5}
                              required
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              className="w-full rounded-xl bg-[#111320] p-3.5 text-xs text-white leading-relaxed border border-indigo-500/50 outline-none focus:border-indigo-400"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-muted mb-1">Role (free text)</label>
                              <input
                                type="text"
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                placeholder="e.g. Associate Product Manager"
                                className="w-full rounded-lg bg-[#111320] px-3 py-1.5 text-xs text-white border border-white/10 outline-none focus:border-indigo-400"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-muted mb-1">Interview type (free text)</label>
                              <input
                                type="text"
                                value={editInterviewType}
                                onChange={(e) => setEditInterviewType(e.target.value)}
                                placeholder="e.g. Competency, Case interview"
                                className="w-full rounded-lg bg-[#111320] px-3 py-1.5 text-xs text-white border border-white/10 outline-none focus:border-indigo-400"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-muted mb-1">Competency</label>
                              <input
                                type="text"
                                value={editCompetency}
                                onChange={(e) => setEditCompetency(e.target.value)}
                                placeholder="e.g. Leadership, Analytical"
                                className="w-full rounded-lg bg-[#111320] px-3 py-1.5 text-xs text-white border border-white/10 outline-none focus:border-indigo-400"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:text-white transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
                            >
                              <Icon name="check" size={12} strokeWidth={2.5} />
                              <span>Save response</span>
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="rounded-xl bg-[#111320] p-3.5 border border-white/[0.05]">
                            <span className="font-semibold text-indigo-300 block mb-1 text-[11px] uppercase tracking-wider">
                              Question it answers:
                            </span>
                            <p className="text-white font-medium">{ex.question}</p>
                          </div>

                          <div className="rounded-xl bg-[#111320] p-3.5 border border-white/[0.05]">
                            <span className="font-semibold text-muted block mb-1 text-[11px] uppercase tracking-wider">
                              Example Answer (STAR):
                            </span>
                            <p className="text-[#c9cad8] leading-relaxed whitespace-pre-line">{ex.answer}</p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] text-muted">
                            <div className="flex flex-wrap items-center gap-4">
                              <span>Role: <b className="text-white font-medium">{ex.role || "Not set"}</b></span>
                              <span>Competency: <b className="text-white font-medium">{ex.competency || "Not set"}</b></span>
                              <span>Type: <b className="text-white font-medium">{ex.interviewType || "Not set"}</b></span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => startEditing(ex, e)}
                                className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300 transition-colors cursor-pointer"
                              >
                                <Icon name="edit" size={11} />
                                <span>Edit response</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleDeleteExample(ex.id, e)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-300 transition-colors cursor-pointer"
                              >
                                <Icon name="trash" size={11} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
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
                      Practice Hub
                    </h3>
                    <p className="text-[11px] text-muted">Practise the questions written for your interviews</p>
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
                      Add an example
                    </h3>
                    <p className="text-[11px] text-muted">Write a question and your own answer to it</p>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-dim group-hover:text-white transition-colors" />
              </Link>
            </div>
          </Panel>
        </div>
      </div>


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
