"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import type { Cv, Profile, CvBullet } from "@/lib/apply/schema";

export default function CvBuilderEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [cv, setCv] = useState<Cv | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // "Tell me what you did" modal
  const [showBulletModal, setShowBulletModal] = useState(false);
  const [bulletNotes, setBulletNotes] = useState("");
  const [bulletRole, setBulletRole] = useState("role-1");
  const [generatingBullet, setGeneratingBullet] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/apply/cvs/${id}`);
        const data = await res.json();
        setCv(data.cv);
        setProfile(data.profile);
      } catch (err) {
        console.error("Error loading CV:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSaveCv = async (updatedCv: Cv) => {
    setCv(updatedCv);
    setSaving(true);
    try {
      const res = await fetch(`/api/apply/cvs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCv),
      });
      const data = await res.json();
      if (res.ok) {
        setCv(data);
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 2000);
      }
    } catch (err) {
      console.error("Error saving CV:", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleBulletVisibility = (bulletId: string) => {
    if (!cv) return;
    const updatedBullets = cv.bullets.map((b) =>
      b.id === bulletId ? { ...b, visible: b.visible === false ? true : false } : b
    );
    handleSaveCv({ ...cv, bullets: updatedBullets });
  };

  const handleGenerateBullet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletNotes.trim()) return;
    setGeneratingBullet(true);
    try {
      const res = await fetch(`/api/apply/cvs/${id}/bullets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: bulletNotes, roleId: bulletRole }),
      });
      const data = await res.json();
      if (res.ok && data.cv) {
        setCv(data.cv);
        setBulletNotes("");
        setShowBulletModal(false);
      }
    } catch (err) {
      console.error("Error generating bullet:", err);
    } finally {
      setGeneratingBullet(false);
    }
  };

  const handleExport = (format: "pdf" | "docx") => {
    // Client-side printable export trigger
    window.print();
  };

  if (loading || !cv) {
    return (
      <div className="flex h-64 items-center justify-center text-muted">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const activeBullets = cv.bullets.filter((b) => b.visible !== false);

  return (
    <div className="space-y-6 animate-fadeIn w-full max-w-7xl mx-auto">
      {/* Top Bar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/apply/cvs"
            className="text-xs font-semibold text-muted hover:text-white transition"
          >
            ← Back to CVs
          </Link>
          <span className="text-line">|</span>
          <input
            type="text"
            value={cv.name}
            onChange={(e) => setCv({ ...cv, name: e.target.value })}
            onBlur={() => handleSaveCv(cv)}
            className="bg-transparent font-bold text-white text-base focus:bg-canvas focus:outline-none rounded px-2 py-0.5 border border-transparent focus:border-line"
          />
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-semibold text-emerald-400">
              ✓ Auto-saved
            </span>
          )}

          {/* Live Score Pill */}
          <div className="flex items-center gap-2 rounded-xl bg-card border border-line px-3 py-1.5">
            <span className="text-xs text-muted">Live ATS:</span>
            <span
              className={`text-sm font-extrabold ${
                (cv.score?.total || 75) >= 85
                  ? "text-emerald-400"
                  : (cv.score?.total || 75) >= 70
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {cv.score?.total || 75}/100
            </span>
          </div>

          <button
            onClick={() => handleExport("pdf")}
            className="rounded-xl border border-line bg-card px-3.5 py-1.5 text-xs font-bold text-ink hover:bg-line transition"
          >
            Export PDF
          </button>

          <button
            onClick={() => setShowBulletModal(true)}
            className="rounded-xl bg-accent px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover transition"
          >
            + AI Bullet Writer
          </button>
        </div>
      </div>

      {/* Bullet Writer Modal */}
      {showBulletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-booth p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  &quot;Tell Me What You Did&quot; Bullet Generator
                </h3>
                <p className="text-[11px] text-muted">
                  Type or describe what happened. The AI shapes action bullets from your exact facts.
                </p>
              </div>
              <button
                onClick={() => setShowBulletModal(false)}
                className="text-muted hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateBullet} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Select Role</label>
                <select
                  value={bulletRole}
                  onChange={(e) => setBulletRole(e.target.value)}
                  className="w-full rounded-xl border border-line bg-canvas p-2.5 text-xs text-ink focus:border-accent focus:outline-none"
                >
                  {profile?.roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} @ {r.employer}
                    </option>
                  )) || <option value="role-1">Recent Role</option>}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted block mb-1">
                  What did you achieve? Include metrics, tools, or changes.
                </label>
                <textarea
                  rows={4}
                  value={bulletNotes}
                  onChange={(e) => setBulletNotes(e.target.value)}
                  placeholder="e.g. Migrated our payment gateway to Stripe, reduced checkout drop-off by 18%, and handled £2.4M transactions without errors."
                  required
                  className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulletModal(false)}
                  className="rounded-xl border border-line bg-card px-4 py-2 text-xs font-medium text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingBullet}
                  className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-accent-hover transition disabled:opacity-50"
                >
                  {generatingBullet ? "Building Grounded Bullets..." : "Generate Bullets"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dual Pane Layout (Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Interactive Editor & Switches (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-line bg-booth p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Sections & Bullet Controls
              </h3>
              <span className="text-[10px] text-muted">
                Toggle switches on/off to tailor content
              </span>
            </div>

            {/* Template Switcher */}
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted">Format Layout:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSaveCv({ ...cv, templateId: "standard" })}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    cv.templateId === "standard"
                      ? "bg-accent text-white"
                      : "bg-card text-muted hover:text-white"
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCv({ ...cv, templateId: "graduate" })}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    cv.templateId === "graduate"
                      ? "bg-accent text-white"
                      : "bg-card text-muted hover:text-white"
                  }`}
                >
                  Graduate
                </button>
              </div>
            </div>

            {/* Summary Editor */}
            <div className="space-y-1.5 pt-2 border-t border-line">
              <label className="text-xs font-semibold text-white">Executive Summary</label>
              <textarea
                rows={3}
                value={cv.sections.find((s) => s.type === "summary")?.text || ""}
                onChange={(e) => {
                  const updatedSections = cv.sections.map((s) =>
                    s.type === "summary" ? { ...s, text: e.target.value } : s
                  );
                  setCv({ ...cv, sections: updatedSections });
                }}
                onBlur={() => handleSaveCv(cv)}
                className="w-full rounded-xl border border-line bg-canvas p-2.5 text-xs text-ink focus:border-accent focus:outline-none"
              />
            </div>

            {/* Bullets with On/Off Switches */}
            <div className="space-y-2 pt-2 border-t border-line">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white">
                  Experience Bullets ({activeBullets.length} of {cv.bullets.length} active)
                </label>
                <button
                  type="button"
                  onClick={() => setShowBulletModal(true)}
                  className="text-[11px] font-bold text-accent hover:underline"
                >
                  + Add Bullet
                </button>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {cv.bullets.map((b) => (
                  <div
                    key={b.id}
                    className={`rounded-xl border p-3 text-xs transition ${
                      b.visible !== false
                        ? "border-line bg-card/70 text-ink"
                        : "border-line/40 bg-canvas/40 text-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex-1 font-sans leading-relaxed">{b.text}</p>
                      <button
                        type="button"
                        onClick={() => toggleBulletVisibility(b.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                          b.visible !== false
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-canvas text-muted border border-line"
                        }`}
                      >
                        {b.visible !== false ? "Active" : "Hidden"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-line/40 text-[10px] text-muted">
                      <span>Origin: {b.origin}</span>
                      {b.evidenceIds.length > 0 && (
                        <span className="text-accent">✓ Linked to Evidence</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Live Page Preview (7 cols) */}
        <div className="lg:col-span-7 print:w-full">
          <div className="rounded-2xl border border-line bg-white text-zinc-900 p-8 shadow-2xl min-h-[700px] font-serif leading-relaxed text-xs">
            {/* CV Header */}
            <div className="text-center border-b border-zinc-200 pb-4 mb-4">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                {profile?.contact.name || "Candidate Name"}
              </h1>
              <div className="text-[11px] text-zinc-600 mt-1 space-x-2">
                <span>{profile?.contact.email || "email@domain.com"}</span>
                <span>•</span>
                <span>{profile?.contact.phone || "+44 7700 900123"}</span>
                <span>•</span>
                <span>{profile?.contact.location || "London, UK"}</span>
              </div>
              {profile?.headline && (
                <div className="text-xs font-semibold text-zinc-700 mt-1 italic">
                  {profile.headline}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="mb-4">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-1.5 font-sans">
                Professional Summary
              </h2>
              <p className="text-[11px] text-zinc-800 leading-normal">
                {cv.sections.find((s) => s.type === "summary")?.text || profile?.summary}
              </p>
            </div>

            {/* Graduate vs Standard Order: Education first if graduate */}
            {cv.templateId === "graduate" && (
              <div className="mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-1.5 font-sans">
                  Education & Qualifications
                </h2>
                {profile?.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between text-[11px] mb-1">
                    <div>
                      <span className="font-bold">{edu.qualification}</span> — {edu.institution}
                      {edu.grade && <span className="text-zinc-600"> ({edu.grade})</span>}
                    </div>
                    <div className="text-zinc-600 font-sans">{edu.start} – {edu.end}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Experience */}
            <div className="mb-4">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-1.5 font-sans">
                Professional Experience
              </h2>
              {profile?.roles.map((role) => (
                <div key={role.id} className="mb-3">
                  <div className="flex justify-between font-bold text-[11px]">
                    <div>
                      {role.title} — <span className="font-normal italic">{role.employer}</span>
                    </div>
                    <div className="text-zinc-600 font-sans text-[10px]">
                      {role.start} – {role.end}
                    </div>
                  </div>

                  <ul className="list-disc list-inside mt-1 space-y-1 text-[10.5px] text-zinc-800">
                    {activeBullets
                      .filter((b) => b.roleId === role.id || cv.bullets.length <= 4)
                      .map((b) => (
                        <li key={b.id} className="leading-snug">
                          {b.text}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Education (if Standard) */}
            {cv.templateId !== "graduate" && (
              <div className="mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-1.5 font-sans">
                  Education
                </h2>
                {profile?.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between text-[11px] mb-1">
                    <div>
                      <span className="font-bold">{edu.qualification}</span>, {edu.institution}
                      {edu.grade && <span className="text-zinc-600"> ({edu.grade})</span>}
                    </div>
                    <div className="text-zinc-600 font-sans text-[10px]">{edu.start} – {edu.end}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-1 font-sans">
                Technical & Core Skills
              </h2>
              <p className="text-[10.5px] text-zinc-800">
                {profile?.skills.map((s) => s.name).join(" • ") || "TypeScript • React • Next.js • Cloud Architecture • MongoDB"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
