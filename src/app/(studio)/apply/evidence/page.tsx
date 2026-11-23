"use client";

import { useEffect, useState } from "react";
import type { Evidence, EvidenceSourceKind } from "@/lib/apply/schema";

export default function EvidenceBankPage() {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSource, setFilterSource] = useState<string>("all");
  const [search, setSearch] = useState("");

  // New evidence form
  const [newText, setNewText] = useState("");
  const [newSourceKind, setNewSourceKind] = useState<EvidenceSourceKind>("typed-note");
  const [creating, setCreating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/apply/evidence");
        const data = res.ok ? await res.json() : [];
        setEvidenceList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Using fallback evidence list:", err);
        setEvidenceList([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/apply/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newText,
          sourceKind: newSourceKind,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEvidenceList([data, ...evidenceList]);
        setNewText("");
        setShowAddModal(false);
      }
    } catch (err) {
      console.error("Error creating evidence:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this evidence item?")) return;
    try {
      const res = await fetch(`/api/apply/evidence/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvidenceList(evidenceList.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("Error deleting evidence:", err);
    }
  };

  const filtered = evidenceList.filter((item) => {
    const matchesSource = filterSource === "all" || item.sourceKind === filterSource;
    const matchesSearch =
      search === "" ||
      item.text.toLowerCase().includes(search.toLowerCase()) ||
      item.skillTags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      item.numbers.some((n) => n.toLowerCase().includes(search.toLowerCase()));
    return matchesSource && matchesSearch;
  });

  return (
    <div className="max-w-5xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">Hakkiri Apply</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Evidence Bank ({evidenceList.length})
          </h1>
          <p className="text-xs text-muted mt-1">
            The confirmed store of career facts, numbers, and stories. The AI generator is strictly prohibited from inventing anything outside this bank.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover transition"
        >
          + Add New Evidence
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "cv-bullet", "story", "typed-note", "spoken-note", "practice-answer"].map((src) => (
            <button
              key={src}
              onClick={() => setFilterSource(src)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                filterSource === src
                  ? "bg-accent text-white"
                  : "bg-card border border-line text-muted hover:text-white"
              }`}
            >
              {src.replace("-", " ")}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facts, numbers, skills..."
            className="w-full rounded-xl border border-line bg-canvas px-3.5 py-1.5 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-booth p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Add Career Fact or Story
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddEvidence} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Source Type</label>
                <select
                  value={newSourceKind}
                  onChange={(e) => setNewSourceKind(e.target.value as EvidenceSourceKind)}
                  className="w-full rounded-xl border border-line bg-canvas p-2.5 text-xs text-ink focus:border-accent focus:outline-none"
                >
                  <option value="typed-note">Typed Note</option>
                  <option value="story">STAR Story</option>
                  <option value="spoken-note">Spoken Note Transcript</option>
                  <option value="cv-bullet">CV Experience Bullet</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted block mb-1">
                  What did you achieve? (Include numbers, team size, tools, or outcome)
                </label>
                <textarea
                  rows={4}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g., Reduced AWS RDS latency by 45% by optimizing indexed queries and implementing Redis caching for 250k daily active users."
                  required
                  className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-line bg-card px-4 py-2 text-xs font-medium text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-accent-hover transition disabled:opacity-50"
                >
                  {creating ? "Saving..." : "Save Evidence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence List Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center text-muted">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-12 text-center text-muted">
          <p className="text-sm">No evidence found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-line bg-booth p-5 space-y-3 hover:border-line-hover transition relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                  {item.sourceKind.replace("-", " ")}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-rose-400 text-xs transition"
                  title="Delete evidence"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-ink/90 leading-relaxed font-sans">
                {item.text}
              </p>

              {/* Tagged Numbers & Skills */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-line/60">
                {item.numbers.map((num, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                  >
                    #{num}
                  </span>
                ))}
                {item.skillTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium text-muted bg-card px-2 py-0.5 rounded border border-line"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
