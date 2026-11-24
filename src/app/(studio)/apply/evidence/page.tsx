"use client";

import { useEffect, useState } from "react";
import { CustomSelect, type CustomSelectOption } from "@/components/ui";
import type { Evidence, EvidenceSourceKind } from "@/lib/apply/schema";

const EVIDENCE_SOURCE_OPTIONS: CustomSelectOption[] = [
  { value: "typed-note", label: "Typed Note", dotColor: "bg-blue", description: "Directly typed metric or outcome" },
  { value: "cv-bullet", label: "Existing CV Bullet", dotColor: "bg-emerald-400", description: "Extracted from prior resume" },
  { value: "story", label: "Career Story", dotColor: "bg-purple-400", description: "Structured STAR narrative" },
  { value: "spoken-note", label: "Spoken / Audio Note", dotColor: "bg-amber-400", description: "Dictated audio transcript" },
  { value: "practice-answer", label: "Practice Answer", dotColor: "bg-cyan-400", description: "From mock interview session" },
];

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

  const safeList = Array.isArray(evidenceList) ? evidenceList : [];

  const filtered = safeList.filter((item) => {
    const matchesSource = filterSource === "all" || item.sourceKind === filterSource;
    const matchesSearch =
      search === "" ||
      item.text.toLowerCase().includes(search.toLowerCase()) ||
      item.skillTags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      item.numbers.some((n) => n.toLowerCase().includes(search.toLowerCase()));
    return matchesSource && matchesSearch;
  });

  const totalMetrics = safeList.reduce((acc, curr) => acc + (curr.numbers?.length || 0), 0);
  const totalSkills = new Set(safeList.flatMap((e) => e.skillTags || [])).size;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      {/* Hero Header - Full Width */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-r from-panel via-panel-2 to-panel p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue/15 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue/10 border border-blue/20 text-blue text-[11px] font-bold tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
              Hakkiri Apply Suite · Truth Repository
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-ink tracking-tight">
              Evidence Bank ({safeList.length})
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
              The confirmed store of career facts, numbers, and stories. The AI generator is strictly prohibited from inventing anything outside this bank.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-2xl bg-gradient-to-r from-blue-fill to-blue-hover px-5 py-3 text-xs font-bold text-white shadow-xl shadow-blue-fill/25 hover:shadow-blue-fill/40 hover:scale-[1.02] active:scale-[0.98] transition self-start md:self-auto"
          >
            + Add New Evidence
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-line/60">
          <div className="p-4 rounded-2xl bg-booth/70 border border-line/80 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Confirmed facts</span>
            <div className="text-2xl font-black text-ink mt-0.5">{safeList.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-booth/70 border border-line/80 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Quantified Metrics</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{totalMetrics}</div>
          </div>
          <div className="p-4 rounded-2xl bg-booth/70 border border-line/80 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Unique Skills</span>
            <div className="text-2xl font-black text-blue-soft mt-0.5">{totalSkills}</div>
          </div>
          <div className="p-4 rounded-2xl bg-booth/70 border border-line/80 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">What is in here</span>
            <div className="text-sm font-black text-purple-300 mt-1.5">Only what you add</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-panel border border-line w-full sm:w-auto flex-wrap">
          {["all", "cv-bullet", "story", "typed-note", "spoken-note", "practice-answer"].map((src) => (
            <button
              key={src}
              onClick={() => setFilterSource(src)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                filterSource === src
                  ? "bg-panel-2 text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              {src.replace("-", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search keywords, metrics, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-panel border border-line px-4 py-2.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-blue transition shadow-sm"
          />
        </div>
      </div>

      {/* Main Grid: Full Width Multi-Column */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-60 rounded-3xl border border-line bg-panel p-6 animate-pulse space-y-4" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-line bg-panel p-12 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 text-blue text-xl font-bold">
            🔒
          </div>
          <h3 className="text-lg font-bold text-ink">No evidence items match</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Add real career achievements, metrics, and outcomes to feed the AI generator.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-blue-fill px-4 py-2 text-xs font-bold text-white hover:bg-blue-hover transition"
          >
            + Add Evidence Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-3xl border border-line bg-panel/90 p-6 space-y-4 hover:border-blue/50 hover:bg-panel transition-all duration-300 shadow-xl hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7),0_0_25px_rgba(123,136,255,0.2)] hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue bg-blue/10 border border-blue/20 px-2.5 py-0.5 rounded-full">
                    {item.sourceKind.replace("-", " ")}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-muted hover:text-rose-400 text-xs transition p-1"
                    title="Delete evidence"
                  >
                    🗑️
                  </button>
                </div>

                <p className="text-xs text-ink leading-relaxed font-sans">{item.text}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-line/60">
                {/* Numbers & Metrics */}
                {item.numbers && item.numbers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-bold text-muted">Metrics:</span>
                    {item.numbers.map((num, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                )}

                {/* Skill Tags */}
                {item.skillTags && item.skillTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.skillTags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold text-muted bg-panel-2 border border-line px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-muted font-mono pt-1">
                  Confirmed: {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Evidence Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-extrabold text-ink">
                  Add Confirmed Evidence Fact
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Numbers and skills will be automatically extracted and tagged.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted hover:text-ink text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvidence} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">Source Kind</label>
                <CustomSelect
                  value={newSourceKind}
                  onChange={(val) => setNewSourceKind(val as EvidenceSourceKind)}
                  options={EVIDENCE_SOURCE_OPTIONS}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">
                  Achievement or Fact (Include metrics, £/$, scale, timeframes)
                </label>
                <textarea
                  rows={4}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g., Reduced server latency by 42% through distributed caching, improving response time to under 80ms."
                  required
                  className="w-full rounded-2xl border border-line bg-panel-2 p-3.5 text-xs text-ink placeholder:text-muted focus:border-blue focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-xs font-bold text-muted hover:text-ink transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-blue-fill px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-hover transition disabled:opacity-50 shadow-lg shadow-blue-fill/25"
                >
                  {creating ? "Saving Fact..." : "Confirm & Save Fact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
