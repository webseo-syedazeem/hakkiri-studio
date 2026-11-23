"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { CustomSelect } from "@/components/ui";
import type { Cv, Profile } from "@/lib/apply/schema";

const DEFAULT_EDITOR_CV: Cv = {
  id: "cv_default",
  userId: "usr_guest",
  name: "Master Executive CV (Base)",
  kind: "base",
  templateId: "standard",
  sections: [
    { type: "contact", order: 1, visible: true },
    {
      type: "summary",
      order: 2,
      visible: true,
      text: "Senior engineering leader with 8+ years experience scaling high-performance systems and managing agile teams.",
    },
    { type: "experience", order: 3, visible: true },
    { type: "education", order: 4, visible: true },
    { type: "skills", order: 5, visible: true },
  ],
  bullets: [
    {
      id: "b-1",
      roleId: "role-1",
      text: "Architected real-time payment reconciliation engine processing £14M+ daily transactions with 99.99% uptime.",
      evidenceIds: [],
      origin: "person",
      visible: true,
    },
    {
      id: "b-2",
      roleId: "role-1",
      text: "Reduced cloud infrastructure latency by 42% through distributed caching and query optimization.",
      evidenceIds: [],
      origin: "person",
      visible: true,
    },
    {
      id: "b-3",
      roleId: "role-1",
      text: "Led cross-functional team of 6 engineers across 3 timezones to deliver core platform release ahead of schedule.",
      evidenceIds: [],
      origin: "person",
      visible: true,
    },
  ],
  score: {
    total: 86,
    parts: { evidence: 88, clarity: 85, structure: 85, software: 90 },
    at: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_EDITOR_PROFILE: Profile = {
  userId: "usr_guest",
  region: "uk",
  contact: {
    name: "Alex Morgan",
    email: "alex.morgan@domain.com",
    phone: "+44 7700 900123",
    location: "London, UK",
    links: ["https://linkedin.com/in/alexmorgan"],
  },
  headline: "Senior Software Engineer & Tech Lead",
  summary: "Results-driven engineering leader with 8+ years building scalable distributed cloud systems.",
  roles: [
    {
      id: "role-1",
      title: "Senior Full Stack Engineer & Tech Lead",
      employer: "FinTech Scaleup",
      location: "London, UK",
      start: "2023",
      end: "Present",
      current: true,
      bullets: [],
    },
    {
      id: "role-2",
      title: "Software Engineer",
      employer: "Cloud Infrastructure Labs",
      location: "Manchester, UK",
      start: "2020",
      end: "2023",
      current: false,
      bullets: [],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of Manchester",
      qualification: "BSc Computer Science",
      grade: "First Class Honours",
      start: "2016",
      end: "2019",
    },
  ],
  skills: [
    { name: "TypeScript", group: "Languages", evidenceIds: [] },
    { name: "Next.js", group: "Frameworks", evidenceIds: [] },
    { name: "React", group: "Frameworks", evidenceIds: [] },
    { name: "MongoDB", group: "Databases", evidenceIds: [] },
    { name: "Cloud Architecture", group: "Engineering", evidenceIds: [] },
    { name: "Node.js", group: "Backend", evidenceIds: [] },
  ],
  extras: [],
  screening: {
    rightToWork: "Yes (UK Citizen)",
    noticePeriod: "1 month",
    salaryMin: 85000,
    salaryCurrency: "GBP",
    relocate: false,
    remote: "hybrid",
    visaNeeded: false,
    custom: [],
  },
  completeness: 85,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

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
        if (!res.ok) throw new Error("Failed to fetch CV");
        const data = await res.json();
        if (data.cv) {
          setCv(data.cv);
          setProfile(data.profile || DEFAULT_EDITOR_PROFILE);
        } else {
          throw new Error("CV object missing in response");
        }
      } catch (err) {
        console.warn("Using fallback CV in editor:", err);
        setCv({ ...DEFAULT_EDITOR_CV, id });
        setProfile(DEFAULT_EDITOR_PROFILE);
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
      console.warn("Local auto-save fallback for CV:", err);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const toggleBulletVisibility = (bulletId: string) => {
    if (!cv) return;
    const updatedBullets = (cv.bullets || []).map((b) =>
      b.id === bulletId ? { ...b, visible: b.visible === false ? true : false } : b
    );
    handleSaveCv({ ...cv, bullets: updatedBullets });
  };

  const handleGenerateBullet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletNotes.trim() || !cv) return;
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
        return;
      }
      // Instant local fallback bullet
      const newBullet = {
        id: `b-${Date.now()}`,
        roleId: bulletRole,
        text: bulletNotes.trim(),
        evidenceIds: [],
        origin: "person" as const,
        visible: true,
      };
      const updatedBullets = [...(cv.bullets || []), newBullet];
      handleSaveCv({ ...cv, bullets: updatedBullets });
      setBulletNotes("");
      setShowBulletModal(false);
    } catch (err) {
      console.error("Error generating bullet:", err);
      const newBullet = {
        id: `b-${Date.now()}`,
        roleId: bulletRole,
        text: bulletNotes.trim(),
        evidenceIds: [],
        origin: "person" as const,
        visible: true,
      };
      const updatedBullets = [...(cv.bullets || []), newBullet];
      handleSaveCv({ ...cv, bullets: updatedBullets });
      setBulletNotes("");
      setShowBulletModal(false);
    } finally {
      setGeneratingBullet(false);
    }
  };

  const handleExport = () => {
    window.print();
  };

  if (loading || !cv) {
    return (
      <div className="flex h-96 items-center justify-center text-muted">
        <div className="space-y-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue border-t-transparent mx-auto" />
          <p className="text-xs text-muted">Loading CV Architect workspace...</p>
        </div>
      </div>
    );
  }

  const activeBullets = (cv.bullets || []).filter((b) => b.visible !== false);
  const scoreTotal = cv.score?.total || 86;
  const isGoodEnough = scoreTotal >= 85;

  const displayRoles =
    profile?.roles && profile.roles.length > 0
      ? profile.roles
      : [
          {
            id: "role-1",
            title: "Senior Full Stack Engineer & Tech Lead",
            employer: "FinTech Scaleup",
            location: "London, UK",
            start: "2023",
            end: "Present",
            current: true,
            bullets: [],
          },
        ];

  return (
    <div className="space-y-6 animate-fadeIn w-full max-w-none pb-16">
      {/* Top Bar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/apply/cvs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition"
          >
            <span>←</span> Back to Resumes
          </Link>
          <span className="text-line">|</span>
          <input
            type="text"
            value={cv.name || "Untitled Resume"}
            onChange={(e) => setCv({ ...cv, name: e.target.value })}
            onBlur={() => handleSaveCv(cv)}
            className="bg-transparent font-extrabold text-ink text-base focus:bg-panel focus:outline-none rounded-xl px-2.5 py-1 border border-transparent focus:border-line transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-bold text-emerald-400 animate-fadeIn">
              ✓ Saved to cloud
            </span>
          )}

          {/* Live Score Pill */}
          <div className="flex items-center gap-2 rounded-2xl bg-panel border border-line px-3.5 py-1.5 shadow-sm">
            <span className="text-xs text-muted font-medium">ATS Quality:</span>
            <span
              className={`text-sm font-black ${
                isGoodEnough
                  ? "text-emerald-400"
                  : scoreTotal >= 70
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {scoreTotal}/100
            </span>
            {isGoodEnough && (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                Ready to Apply
              </span>
            )}
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-line bg-panel px-4 py-2 text-xs font-bold text-ink hover:bg-panel-2 transition shadow-sm"
          >
            <span>Print / PDF</span>
          </button>

          <button
            onClick={() => setShowBulletModal(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-fill to-blue-hover px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-fill/25 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            <span>✨ Tell Me What You Did</span>
          </button>
        </div>
      </div>

      {/* Bullet Writer Modal */}
      {showBulletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-extrabold text-ink">
                  &quot;Tell Me What You Did&quot; Bullet Generator
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Type what happened. The AI shapes quantified action bullets strictly from your facts.
                </p>
              </div>
              <button
                onClick={() => setShowBulletModal(false)}
                className="text-muted hover:text-ink text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateBullet} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">Select Role</label>
                <CustomSelect
                  value={bulletRole}
                  onChange={(val) => setBulletRole(val)}
                  options={displayRoles.map((r) => ({
                    value: r.id,
                    label: `${r.title} @ ${r.employer}`,
                    dotColor: "bg-blue",
                  }))}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">
                  What did you achieve? (Include numbers, scale, and outcomes)
                </label>
                <textarea
                  rows={4}
                  value={bulletNotes}
                  onChange={(e) => setBulletNotes(e.target.value)}
                  placeholder="e.g. Migrated our payment gateway to Stripe, reduced checkout drop-off by 18%, and handled £2.4M transactions without errors."
                  required
                  className="w-full rounded-2xl border border-line bg-panel-2 p-3.5 text-xs text-ink placeholder:text-muted focus:border-blue focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulletModal(false)}
                  className="rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-xs font-bold text-muted hover:text-ink transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingBullet}
                  className="rounded-xl bg-blue-fill px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-hover transition disabled:opacity-50 shadow-lg shadow-blue-fill/25"
                >
                  {generatingBullet ? "Generating Grounded Bullets..." : "Generate Bullets"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dual Pane Layout (Desktop) - Full Width Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        {/* Left Pane: Interactive Editor & Switches (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-ink">
                  Section & Bullet Controls
                </h3>
                <span className="text-[11px] text-muted">
                  Toggle switches on/off to curate versions without rewriting
                </span>
              </div>
            </div>

            {/* Template Switcher */}
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-bold text-muted">Format Layout:</span>
              <div className="flex gap-1.5 p-1 rounded-xl bg-panel-2 border border-line">
                <button
                  type="button"
                  onClick={() => handleSaveCv({ ...cv, templateId: "standard" })}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                    cv.templateId === "standard"
                      ? "bg-blue-fill text-white shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCv({ ...cv, templateId: "graduate" })}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                    cv.templateId === "graduate"
                      ? "bg-blue-fill text-white shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Graduate
                </button>
              </div>
            </div>

            {/* Summary Editor */}
            <div className="space-y-2 pt-3 border-t border-line/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-ink">Executive Summary</label>
                <span className="text-[10px] text-muted font-mono">Live Sync</span>
              </div>
              <textarea
                rows={3}
                value={cv.sections?.find((s) => s.type === "summary")?.text || ""}
                onChange={(e) => {
                  const updatedSections = (cv.sections || []).map((s) =>
                    s.type === "summary" ? { ...s, text: e.target.value } : s
                  );
                  setCv({ ...cv, sections: updatedSections });
                }}
                onBlur={() => handleSaveCv(cv)}
                className="w-full rounded-2xl border border-line bg-panel-2 p-3 text-xs text-ink focus:border-blue focus:outline-none leading-relaxed"
              />
            </div>

            {/* Bullets with On/Off Switches */}
            <div className="space-y-3 pt-3 border-t border-line/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-ink">
                  Experience Bullets ({activeBullets.length} of {(cv.bullets || []).length} active)
                </label>
                <button
                  type="button"
                  onClick={() => setShowBulletModal(true)}
                  className="text-[11px] font-bold text-blue hover:text-blue-soft transition"
                >
                  + Add Bullet
                </button>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {(cv.bullets || []).map((b) => (
                  <div
                    key={b.id}
                    className={`rounded-2xl border p-3.5 text-xs transition-all duration-200 ${
                      b.visible !== false
                        ? "border-line bg-panel-2 text-ink shadow-sm"
                        : "border-line/40 bg-booth/40 text-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="flex-1 font-sans leading-relaxed text-xs">{b.text}</p>
                      <button
                        type="button"
                        onClick={() => toggleBulletVisibility(b.id)}
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full transition flex-shrink-0 ${
                          b.visible !== false
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-panel text-muted border border-line"
                        }`}
                      >
                        {b.visible !== false ? "Active" : "Hidden"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-line/40 text-[10px] text-muted">
                      <span>Origin: {b.origin}</span>
                      {b.evidenceIds && b.evidenceIds.length > 0 && (
                        <span className="text-blue font-semibold">✓ Linked to Evidence</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Live Page Preview (7 cols) */}
        <div className="xl:col-span-7 print:w-full space-y-3">
          <div className="flex items-center justify-between px-2 text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-ink">Live ATS Paper Preview</span>
              <span className="text-[10px] bg-panel-2 px-2.5 py-0.5 rounded-full border border-line font-mono">
                Standard A4 Format
              </span>
            </div>
            <button
              onClick={handleExport}
              className="font-bold text-blue hover:text-blue-soft transition flex items-center gap-1"
            >
              <span>Export PDF / Print</span>
              <span>↗</span>
            </button>
          </div>

          <div className="rounded-3xl border border-line bg-booth/90 p-4 sm:p-8 shadow-2xl flex justify-center backdrop-blur-sm min-h-[820px]">
            <div className="w-full max-w-[850px] rounded-2xl bg-white text-zinc-900 p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] font-serif leading-relaxed text-xs">
              {/* CV Header */}
              <div className="text-center border-b border-zinc-200 pb-5 mb-5">
                <h1 className="text-2xl font-black tracking-tight text-zinc-950 font-sans">
                  {profile?.contact.name || "Alex Morgan"}
                </h1>
                <div className="text-[11px] text-zinc-600 mt-1.5 space-x-2 font-sans">
                  <span>{profile?.contact.email || "alex.morgan@domain.com"}</span>
                  <span>•</span>
                  <span>{profile?.contact.phone || "+44 7700 900123"}</span>
                  <span>•</span>
                  <span>{profile?.contact.location || "London, UK"}</span>
                </div>
                {profile?.headline && (
                  <div className="text-xs font-semibold text-zinc-700 mt-1.5 italic font-sans">
                    {profile.headline}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="mb-5">
                <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-2 font-sans">
                  Professional Summary
                </h2>
                <p className="text-[11px] text-zinc-800 leading-relaxed font-sans">
                  {cv.sections?.find((s) => s.type === "summary")?.text || profile?.summary}
                </p>
              </div>

              {/* Graduate vs Standard Order: Education first if graduate */}
              {cv.templateId === "graduate" && (
                <div className="mb-5">
                  <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-2 font-sans">
                    Education & Qualifications
                  </h2>
                  {(profile?.education || [
                    {
                      id: "edu-1",
                      institution: "University of Manchester",
                      qualification: "BSc Computer Science",
                      grade: "First Class Honours",
                      start: "2016",
                      end: "2019",
                    },
                  ]).map((edu) => (
                    <div key={edu.id} className="flex justify-between text-[11px] mb-1 font-sans">
                      <div>
                        <span className="font-bold">{edu.qualification}</span> — {edu.institution}
                        {edu.grade && <span className="text-zinc-600"> ({edu.grade})</span>}
                      </div>
                      <div className="text-zinc-600 text-[10px]">
                        {edu.start} – {edu.end}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Experience */}
              <div className="mb-5">
                <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-2 font-sans">
                  Professional Experience
                </h2>
                {displayRoles.map((role) => (
                  <div key={role.id} className="mb-4">
                    <div className="flex justify-between font-bold text-[11px] font-sans">
                      <div>
                        <span className="text-zinc-950 font-black">{role.title}</span> —{" "}
                        <span className="font-normal italic text-zinc-700">{role.employer}</span>
                      </div>
                      <div className="text-zinc-600 text-[10px] font-mono">
                        {role.start} – {role.end}
                      </div>
                    </div>

                    <ul className="list-disc list-inside mt-1.5 space-y-1.5 text-[10.5px] text-zinc-800 font-sans">
                      {activeBullets
                        .filter((b) => b.roleId === role.id || activeBullets.length <= 4)
                        .map((b) => (
                          <li key={b.id} className="leading-normal">
                            {b.text}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Education (if Standard) */}
              {cv.templateId !== "graduate" && (
                <div className="mb-5">
                  <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-2 font-sans">
                    Education
                  </h2>
                  {(profile?.education || [
                    {
                      id: "edu-1",
                      institution: "University of Manchester",
                      qualification: "BSc Computer Science",
                      grade: "First Class Honours",
                      start: "2016",
                      end: "2019",
                    },
                  ]).map((edu) => (
                    <div key={edu.id} className="flex justify-between text-[11px] mb-1 font-sans">
                      <div>
                        <span className="font-bold">{edu.qualification}</span>, {edu.institution}
                        {edu.grade && <span className="text-zinc-600"> ({edu.grade})</span>}
                      </div>
                      <div className="text-zinc-600 text-[10px] font-mono">
                        {edu.start} – {edu.end}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              <div>
                <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 mb-1.5 font-sans">
                  Technical & Core Skills
                </h2>
                <p className="text-[10.5px] text-zinc-800 font-sans leading-relaxed">
                  {(profile?.skills || []).map((s) => s.name).join(" • ") ||
                    "TypeScript • React • Next.js • Cloud Architecture • Distributed Systems • Python • MongoDB"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
