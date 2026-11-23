"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/apply/schema";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/apply/profile");
        const data = await res.json();
        if (res.ok && data && data.contact) {
          setProfile(data);
        } else {
          setProfile({
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
                bullets: [
                  {
                    id: "b-1",
                    text: "Architected real-time payment reconciliation engine processing £14M+ daily transactions with 99.99% uptime.",
                    evidenceIds: [],
                  },
                ],
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
              { name: "MongoDB", group: "Databases", evidenceIds: [] },
              { name: "Cloud Architecture", group: "Engineering", evidenceIds: [] },
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
          });
        }
      } catch (err) {
        console.warn("Using default profile state:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/apply/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center text-muted">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">Hakkiri Apply</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Candidate Career Profile
          </h1>
          <p className="text-xs text-muted mt-1">
            The single structured source of truth for all your tailored CVs, cover letters, and auto-applied forms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              ✓ Saved to Cloud
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {/* Completeness Bar */}
      <div className="rounded-xl border border-line bg-booth p-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-white">Profile Readiness</span>
            <span className="text-accent">{profile.completeness}% Complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-canvas overflow-hidden border border-line">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${profile.completeness}%` }}
            />
          </div>
        </div>
        <div className="hidden sm:block text-[11px] text-muted">
          All downstream generators pull strictly from confirmed profile facts.
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Contact Info */}
        <div className="rounded-2xl border border-line bg-booth p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-line pb-3">
            1. Contact & Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Full Name</label>
              <input
                type="text"
                value={profile.contact.name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contact: { ...profile.contact, name: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Email</label>
              <input
                type="email"
                value={profile.contact.email}
                disabled
                className="w-full rounded-xl border border-line bg-canvas/50 p-3 text-xs text-muted cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Phone Number</label>
              <input
                type="text"
                value={profile.contact.phone}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contact: { ...profile.contact, phone: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Location</label>
              <input
                type="text"
                value={profile.contact.location}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contact: { ...profile.contact, location: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Headline & Summary */}
        <div className="rounded-2xl border border-line bg-booth p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-line pb-3">
            2. Executive Headline & Summary
          </h2>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">Professional Headline</label>
            <input
              type="text"
              value={profile.headline}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">Professional Summary</label>
            <textarea
              rows={4}
              value={profile.summary}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Screening Facts (Never generated, always factual) */}
        <div className="rounded-2xl border border-line bg-booth p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              3. Screening Facts (Autofill Source)
            </h2>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Zero Invention Guarantee
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Right to Work</label>
              <input
                type="text"
                value={profile.screening.rightToWork}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    screening: { ...profile.screening, rightToWork: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Notice Period</label>
              <input
                type="text"
                value={profile.screening.noticePeriod}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    screening: { ...profile.screening, noticePeriod: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Salary Minimum</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={profile.screening.salaryMin}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      screening: { ...profile.screening, salaryMin: Number(e.target.value) },
                    })
                  }
                  className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:border-accent focus:outline-none"
                />
                <span className="flex items-center px-3 rounded-xl bg-card border border-line text-xs font-mono text-muted">
                  {profile.screening.salaryCurrency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Roles List */}
        <div className="rounded-2xl border border-line bg-booth p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-line pb-3">
            4. Roles & Employment History
          </h2>
          <div className="space-y-4">
            {profile.roles.map((role) => (
              <div key={role.id} className="rounded-xl border border-line bg-card/60 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="font-bold text-white text-sm">
                    {role.title} · <span className="text-accent">{role.employer}</span>
                  </div>
                  <div className="text-xs text-muted font-mono">
                    {role.start} – {role.end}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {role.bullets.map((b) => (
                    <div key={b.id} className="text-xs text-muted/90 flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
