"use client";

import { useEffect, useState } from "react";
import type { ApplySettings } from "@/lib/apply/schema";

export default function ApplySettingsPage() {
  const [settings, setSettings] = useState<ApplySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/apply/settings");
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Error loading settings:", err);
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

  const handleTogglePause = () => {
    if (!settings) return;
    const isCurrentlyPaused = Boolean(settings.pausedAt);
    const updated: ApplySettings = {
      ...settings,
      pausedAt: isCurrentlyPaused ? undefined : new Date().toISOString(),
    };
    handleSave(updated);
  };

  if (loading || !settings) {
    return (
      <div className="flex h-64 items-center justify-center text-muted">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const isPaused = Boolean(settings.pausedAt);

  return (
    <div className="max-w-4xl space-y-8 animate-fadeIn w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">Hakkiri Apply</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Auto-Apply Settings & Safety Limits
          </h1>
          <p className="text-xs text-muted mt-1">
            Configure search titles, safety caps, and emergency pause controls. You approve everything that leaves.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-semibold text-emerald-400">
              ✓ Settings saved
            </span>
          )}
          <button
            onClick={() => handleSave(settings)}
            disabled={saving}
            className="rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-accent-hover transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Emergency Pause Box (As specified in spec) */}
      <div
        className={`rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
          isPaused
            ? "border-rose-500/50 bg-rose-500/10 text-rose-300"
            : "border-line bg-booth text-ink"
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{isPaused ? "🛑" : "🟢"}</span>
            <h3 className="text-sm font-bold text-white">
              {isPaused ? "Auto-Apply is PAUSED" : "Auto-Apply Status: Active"}
            </h3>
          </div>
          <p className="text-xs text-muted mt-1">
            {isPaused
              ? `Paused at ${new Date(settings.pausedAt!).toLocaleTimeString()}. No tokens will be issued and nothing will be sent to employers.`
              : "Pause means stop. Pressing pause halts all queued applications and cancels approval tokens immediately."}
          </p>
        </div>

        <button
          onClick={handleTogglePause}
          className={`rounded-xl px-5 py-2.5 text-xs font-extrabold transition shadow ${
            isPaused
              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
              : "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20"
          }`}
        >
          {isPaused ? "Resume Auto-Apply" : "Emergency Pause All Sends"}
        </button>
      </div>

      {/* Limits & Controls */}
      <div className="rounded-2xl border border-line bg-booth p-6 space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-line pb-3">
          Safety Caps & Quality Thresholds
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Daily Cap */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-white">Daily Applications Cap</span>
              <span className="text-accent font-bold">{settings.dailyCap} per day</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={settings.dailyCap}
              onChange={(e) => setSettings({ ...settings, dailyCap: Number(e.target.value) })}
              className="w-full accent-accent"
            />
            <p className="text-[11px] text-muted mt-1">
              Focussed quality beats mass spam. Default is 3 tailored applications per day.
            </p>
          </div>

          {/* Min Fit Score */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-white">Minimum Match Fit Threshold</span>
              <span className="text-emerald-400 font-bold">{settings.minFit}% minimum</span>
            </div>
            <input
              type="range"
              min={60}
              max={90}
              step={5}
              value={settings.minFit}
              onChange={(e) => setSettings({ ...settings, minFit: Number(e.target.value) })}
              className="w-full accent-accent"
            />
            <p className="text-[11px] text-muted mt-1">
              Jobs with Gap Map scores below {settings.minFit}% will not be queued for sending.
            </p>
          </div>

          {/* Salary Minimum */}
          <div>
            <label className="text-xs font-semibold text-white block mb-1">
              Minimum Base Salary Floor (£)
            </label>
            <input
              type="number"
              value={settings.salaryMin}
              onChange={(e) => setSettings({ ...settings, salaryMin: Number(e.target.value) })}
              className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:border-accent focus:outline-none"
            />
          </div>

          {/* Remote Preference */}
          <div>
            <label className="text-xs font-semibold text-white block mb-1">
              Remote Work Filter
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="remote-opt"
                checked={settings.remote}
                onChange={(e) => setSettings({ ...settings, remote: e.target.checked })}
                className="rounded border-line"
              />
              <label htmlFor="remote-opt" className="text-xs text-ink cursor-pointer">
                Include remote and hybrid listings
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
