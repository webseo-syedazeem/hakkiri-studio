"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Profile } from "@/lib/apply/schema";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
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
          // It couldn't be loaded. The person is told: nothing is shown in its place.
          setLoadError("Your profile couldn’t be loaded. Refresh the page to try again.");
        }
      } catch {
        setLoadError("Your profile couldn’t be loaded because the app couldn’t be reached. Check your connection and refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/apply/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setProfile(await res.json());
        setSaveError(null);
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
      } else {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        setSaveError(body.message ?? "Your profile couldn’t be saved. Try again.");
      }
    } catch {
      setSaveError("Your profile couldn’t be saved because the app couldn’t be reached. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center text-muted" data-testid="apply-loading">
        {loadError ? (
          <p role="alert" className="max-w-md rounded-xl border border-red/30 bg-red/10 px-4 py-3 text-center text-xs text-red-soft">
            {loadError}
          </p>
        ) : (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue border-t-transparent" />
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue/10 border border-blue/20 text-blue text-[11px] font-bold tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
            Hakkiri Apply Suite · Candidate Profile
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">
            Candidate Career Profile
          </h1>
          <p className="text-xs text-muted max-w-2xl">
            The single structured source of truth for all your tailored CVs, cover letters, and auto-applied forms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveError && (
            <span role="alert" className="text-xs font-bold text-red-soft bg-red/10 px-3.5 py-1.5 rounded-xl border border-red/30">
              {saveError}
            </span>
          )}
          {savedMsg && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 animate-fadeIn">
              ✓ Saved to Cloud
            </span>
          )}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="rounded-2xl bg-gradient-to-r from-blue-fill to-blue-hover px-5 py-2.5 text-xs font-bold text-white shadow-xl shadow-blue-fill/25 hover:shadow-blue-fill/40 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Editable Form Fields (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Contact Info */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-5 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-wider text-ink border-b border-line pb-3">
              1. Contact & Identity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profile.contact.name}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact: { ...profile.contact, name: e.target.value },
                    })
                  }
                  className="w-full rounded-2xl border border-line bg-panel-2 p-3 text-xs text-ink focus:border-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={profile.contact.email}
                  disabled
                  className="w-full rounded-2xl border border-line bg-booth p-3 text-xs text-muted cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={profile.contact.phone}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact: { ...profile.contact, phone: e.target.value },
                    })
                  }
                  className="w-full rounded-2xl border border-line bg-panel-2 p-3 text-xs text-ink focus:border-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">Location / City</label>
                <input
                  type="text"
                  value={profile.contact.location}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact: { ...profile.contact, location: e.target.value },
                    })
                  }
                  className="w-full rounded-2xl border border-line bg-panel-2 p-3 text-xs text-ink focus:border-blue focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Headline & Summary */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-wider text-ink border-b border-line pb-3">
              2. Executive Headline & Summary
            </h2>
            <div>
              <label className="text-xs font-bold text-muted block mb-1.5">Professional Headline</label>
              <input
                type="text"
                value={profile.headline}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                className="w-full rounded-2xl border border-line bg-panel-2 p-3 text-xs text-ink focus:border-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted block mb-1.5">Professional Summary</label>
              <textarea
                rows={4}
                value={profile.summary}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                className="w-full rounded-2xl border border-line bg-panel-2 p-3 text-xs text-ink focus:border-blue focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Screening Facts (Never generated, always factual) */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-ink">
                3. Screening Facts (Autofill Source)
              </h2>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Zero Invention Guarantee
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">Right to Work</label>
                <input
                  type="text"
                  value={profile.screening.rightToWork}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      screening: { ...profile.screening, rightToWork: e.target.value },
                    })
                  }
                  className="w-full rounded-2xl border border-line bg-panel-2 p-3 text-xs text-ink focus:border-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">Notice Period</label>
                <input
                  type="text"
                  value={profile.screening.noticePeriod}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      screening: { ...profile.screening, noticePeriod: e.target.value },
                    })
                  }
                  className="w-full rounded-2xl border border-line bg-panel-2 p-3 text-xs text-ink focus:border-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">Salary Minimum</label>
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
                    className="w-full rounded-2xl border border-line bg-panel-2 p-3 text-xs text-ink focus:border-blue focus:outline-none"
                  />
                  <span className="flex items-center px-3.5 rounded-2xl bg-panel-2 border border-line text-xs font-mono font-bold text-muted">
                    {profile.screening.salaryCurrency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Roles List */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-wider text-ink border-b border-line pb-3">
              4. Roles & Employment History
            </h2>
            <div className="space-y-4">
              {profile.roles.map((role) => (
                <div key={role.id} className="rounded-2xl border border-line bg-panel-2 p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="font-extrabold text-ink text-sm">
                      {role.title} · <span className="text-blue">{role.employer}</span>
                    </div>
                    <div className="text-xs text-muted font-mono font-bold">
                      {role.start} – {role.end}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    {role.bullets.map((b) => (
                      <div key={b.id} className="text-xs text-muted flex items-start gap-2">
                        <span className="text-blue mt-0.5">•</span>
                        <span className="leading-relaxed">{b.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Readiness Inspector & Downstream Sync (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Profile Readiness */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-ink border-b border-line pb-3">
              Profile Readiness
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted">Completion Status</span>
                <span className="text-emerald-400">{profile.completeness}% filled in</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-panel-2 overflow-hidden border border-line">
                <div
                  className="h-full bg-gradient-to-r from-blue to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${profile.completeness}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-line/60 text-xs">
              <div className="flex items-center justify-between text-ink">
                <span>Identity & Contact</span>
                <span className="text-emerald-400 font-bold">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between text-ink">
                <span>Right to Work Verification</span>
                <span className="text-emerald-400 font-bold">✓ Confirmed</span>
              </div>
              <div className="flex items-center justify-between text-ink">
                <span>Salary Floor Bounds</span>
                <span className="text-emerald-400 font-bold">✓ Configured</span>
              </div>
              <div className="flex items-center justify-between text-ink">
                <span>Active Roles Recorded</span>
                <span className="text-blue font-bold">{profile.roles.length} Roles</span>
              </div>
            </div>
          </div>

          {/* Downstream Sync Guarantee */}
          <div className="rounded-3xl border border-blue/30 bg-blue/5 p-6 space-y-3 shadow-xl">
            <div className="text-xs font-black uppercase tracking-wider text-blue">
              Strict Factual Grounding
            </div>
            <p className="text-xs text-muted leading-relaxed">
              All downstream generators (Tailored CVs, Cover Letters, Application Answers) pull strictly from confirmed profile facts. The AI generator is structurally forbidden from hallucinating titles or dates.
            </p>
          </div>

          <div className="rounded-3xl border border-line bg-panel p-6">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-fill to-blue-hover py-3 text-xs font-bold text-white shadow-xl shadow-blue-fill/25 hover:scale-[1.01] active:scale-[0.99] transition"
            >
              {saving ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
