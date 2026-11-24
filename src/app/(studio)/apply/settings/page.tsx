"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ApplySettings } from "@/lib/apply/schema";

export default function ApplySettingsPage() {
  const [settings, setSettings] = useState<ApplySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newExcluded, setNewExcluded] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/apply/settings");
        const data = await res.json();
        if (res.ok && data && data.dailyCap) {
          setSettings(data);
        } else {
          // It couldn't be loaded. The person is told: nothing is shown in its place.
          setLoadError("Your job preferences couldn’t be loaded. Refresh the page to try again.");
        }
      } catch {
        setLoadError("Your job preferences couldn’t be loaded because the app couldn’t be reached. Check your connection and refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (updated: ApplySettings) => {
    setSettings(updated);
    setSaving(true);
    try {
      const res = await fetch("/api/apply/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 2500);
      }
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTitle = () => {
    if (!settings || !newTitle.trim()) return;
    if (settings.titles.includes(newTitle.trim())) return;
    const updated = {
      ...settings,
      titles: [...settings.titles, newTitle.trim()],
    };
    setNewTitle("");
    handleSave(updated);
  };

  const handleRemoveTitle = (t: string) => {
    if (!settings) return;
    const updated = {
      ...settings,
      titles: settings.titles.filter((item) => item !== t),
    };
    handleSave(updated);
  };

  const handleAddExcluded = () => {
    if (!settings || !newExcluded.trim()) return;
    const updated = {
      ...settings,
      excludeEmployers: [...settings.excludeEmployers, newExcluded.trim()],
    };
    setNewExcluded("");
    handleSave(updated);
  };

  const handleRemoveExcluded = (e: string) => {
    if (!settings) return;
    const updated = {
      ...settings,
      excludeEmployers: settings.excludeEmployers.filter((item) => item !== e),
    };
    handleSave(updated);
  };

  if (loading || !settings) {
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
            Hakkiri Apply Suite · Safety & Governance
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">
            Job preferences and limits
          </h1>
          <p className="text-xs text-muted max-w-2xl">
            The job titles, places and limits you want kept with your applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 animate-fadeIn">
              ✓ Settings saved
            </span>
          )}
          <button
            onClick={() => handleSave(settings)}
            disabled={saving}
            className="rounded-2xl bg-gradient-to-r from-blue-fill to-blue-hover px-5 py-2.5 text-xs font-bold text-white shadow-xl shadow-blue-fill/25 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* What happens today: nothing is sent, so there is nothing to pause. */}
      <div className="rounded-3xl border border-line bg-panel p-6 shadow-xl" data-testid="apply-not-sending">
        <h3 className="text-base font-extrabold text-ink">Hakkiri doesn’t send applications for you</h3>
        <p className="mt-1 text-xs text-muted max-w-3xl leading-relaxed">
          Nothing is queued, filled in or submitted to an employer from here. The preferences below are only what you enter, and are kept for your own use.
        </p>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Limits, Caps, and Role Criteria (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Safety Caps & Quality Thresholds */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-6 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-wider text-ink border-b border-line pb-3">
              Safety Caps & Quality Thresholds
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Daily Cap */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted">Daily Applications Cap</span>
                  <span className="text-blue font-extrabold">{settings.dailyCap} per day</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={settings.dailyCap}
                  onChange={(e) => setSettings({ ...settings, dailyCap: Number(e.target.value) })}
                  className="w-full accent-blue cursor-pointer"
                />
                <p className="text-[11px] text-muted">
                  Focussed quality beats spam. Recommended default is 3 to 5 tailored applications daily.
                </p>
              </div>

              {/* Min Fit Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted">Minimum Match Fit Threshold</span>
                  <span className="text-emerald-400 font-extrabold">{settings.minFit}% minimum</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={90}
                  step={5}
                  value={settings.minFit}
                  onChange={(e) => setSettings({ ...settings, minFit: Number(e.target.value) })}
                  className="w-full accent-blue cursor-pointer"
                />
                <p className="text-[11px] text-muted">
                  Roles with Gap Map scores below {settings.minFit}% will not be queued for sending.
                </p>
              </div>

              {/* Salary Minimum */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink block">
                  Minimum Base Salary Floor (£)
                </label>
                <input
                  type="number"
                  value={settings.salaryMin}
                  onChange={(e) => setSettings({ ...settings, salaryMin: Number(e.target.value) })}
                  className="w-full rounded-2xl border border-line bg-panel-2 p-3 text-xs text-ink focus:border-blue focus:outline-none"
                />
              </div>

              {/* Remote Preference */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink block">
                  Remote Work Filter
                </label>
                <div className="flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="remote-opt"
                    checked={settings.remote}
                    onChange={(e) => setSettings({ ...settings, remote: e.target.checked })}
                    className="h-4 w-4 rounded border-line accent-blue"
                  />
                  <label htmlFor="remote-opt" className="text-xs font-bold text-ink cursor-pointer">
                    Include remote and hybrid vacancy adverts
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Search Target Titles */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-wider text-ink border-b border-line pb-3">
              Target Job Titles ({settings.titles.length}/8)
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Staff Engineer, Lead Architect"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTitle())}
                className="flex-1 rounded-2xl border border-line bg-panel-2 px-4 py-2.5 text-xs text-ink placeholder:text-muted focus:border-blue focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTitle}
                className="rounded-2xl bg-panel-2 border border-line-strong px-4 py-2.5 text-xs font-bold text-ink hover:bg-blue-fill hover:text-white transition"
              >
                Add Title
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {settings.titles.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 rounded-full border border-blue/30 bg-blue/10 px-3.5 py-1 text-xs font-bold text-blue"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTitle(t)}
                    className="text-blue/60 hover:text-white text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Excluded Employers */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-wider text-rose-400 border-b border-line pb-3">
              Excluded Employers & Scam Filter
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Unverified Agency Ltd"
                value={newExcluded}
                onChange={(e) => setNewExcluded(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddExcluded())}
                className="flex-1 rounded-2xl border border-line bg-panel-2 px-4 py-2.5 text-xs text-ink placeholder:text-muted focus:border-rose-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddExcluded}
                className="rounded-2xl bg-rose-500/20 border border-rose-500/30 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500 hover:text-white transition"
              >
                Block
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {settings.excludeEmployers.map((e, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-bold text-rose-300"
                >
                  {e}
                  <button
                    type="button"
                    onClick={() => handleRemoveExcluded(e)}
                    className="text-rose-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Governance Rules & ATS Adapters (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          {/* What these settings do today */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-3 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-ink border-b border-line pb-3">What these settings do</h3>
            <ul className="space-y-2.5 text-xs text-muted leading-relaxed">
              <li className="flex items-start gap-2">
                <span aria-hidden className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong className="text-ink">Nothing is sent for you.</strong> Hakkiri doesn’t submit applications to employers. You send each one yourself.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong className="text-ink">They are yours.</strong> The job titles, places, salary and employers here are only the ones you enter. A new account has none.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
