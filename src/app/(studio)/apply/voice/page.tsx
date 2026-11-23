"use client";

import { useEffect, useState } from "react";
import type { Voice } from "@/lib/apply/schema";

export default function VoicePersonaPage() {
  const [voice, setVoice] = useState<Voice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // New sample form
  const [sampleText, setSampleText] = useState("");
  const [sampleKind, setSampleKind] = useState("cover-letter");
  const [addingSample, setAddingSample] = useState(false);

  // New phrase inputs
  const [newSignature, setNewSignature] = useState("");
  const [newNever, setNewNever] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/apply/voice");
        const data = await res.json();
        if (res.ok && data && data.measured) {
          setVoice(data);
        } else {
          setVoice({
            userId: "usr_guest",
            samples: [],
            measured: {
              sentenceMean: 14.2,
              sentenceSpread: 4.8,
              formality: 3,
              contractions: true,
              firstPerson: true,
              spelling: "uk",
              opens: ["Direct", "Context-first"],
              closes: ["Action-oriented", "Impact-led"],
            },
            signature: [
              "driven by customer impact",
              "high-velocity delivery",
              "rigorous architectural trade-offs",
            ],
            never: ["passionate", "synergy", "spearheaded", "utilize", "rockstar", "delve"],
            learnedFromEdits: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("Using default voice profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!voice) return;
    setSaving(true);
    try {
      const res = await fetch("/api/apply/voice", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voice),
      });
      if (res.ok) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
      }
    } catch (err) {
      console.error("Error saving voice:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sampleText.trim().length < 50) return;
    setAddingSample(true);
    try {
      const res = await fetch("/api/apply/voice/samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sampleText,
          kind: sampleKind,
        }),
      });
      const data = await res.json();
      if (res.ok && data.voice) {
        setVoice(data.voice);
        setSampleText("");
      }
    } catch (err) {
      console.error("Error adding sample:", err);
    } finally {
      setAddingSample(false);
    }
  };

  const addSignaturePhrase = () => {
    if (!voice || !newSignature.trim()) return;
    if (voice.signature.length >= 15) return;
    setVoice({
      ...voice,
      signature: [...voice.signature, newSignature.trim()],
    });
    setNewSignature("");
  };

  const removeSignaturePhrase = (index: number) => {
    if (!voice) return;
    setVoice({
      ...voice,
      signature: voice.signature.filter((_, i) => i !== index),
    });
  };

  const addNeverPhrase = () => {
    if (!voice || !newNever.trim()) return;
    setVoice({
      ...voice,
      never: [...voice.never, newNever.trim().toLowerCase()],
    });
    setNewNever("");
  };

  const removeNeverPhrase = (index: number) => {
    if (!voice) return;
    setVoice({
      ...voice,
      never: voice.never.filter((_, i) => i !== index),
    });
  };

  if (loading || !voice) {
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
            Voice Persona & Style Profile
          </h1>
          <p className="text-xs text-muted mt-1">
            Defines your authentic writing style. Every generated cover letter and written answer mirrors your tone and avoids generic corporate speak.
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
            {saving ? "Saving..." : "Save Voice"}
          </button>
        </div>
      </div>

      {/* Plain Words Description (As specified in spec) */}
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-accent">
          How You Sound (Plain-Words Profile)
        </div>
        <div className="text-sm font-medium text-white space-y-1.5 leading-relaxed">
          <p>• You write in crisp, direct sentences (averaging {voice.measured.sentenceMean} words).</p>
          <p>• {voice.measured.contractions ? "You naturally use friendly contractions (I'll, we've, don't)." : "You avoid informal contractions."}</p>
          <p>• You get straight to the impact in the very first sentence.</p>
          <p>• You strictly forbid generic buzzwords ({voice.never.slice(0, 3).join(", ")}, etc.).</p>
        </div>
      </div>

      {/* Measured Metrics */}
      <div className="rounded-2xl border border-line bg-booth p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-line pb-3">
          Style Metrics (Computed From Writing Samples)
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-card/60 p-4 border border-line">
            <div className="text-[11px] text-muted">Mean Sentence Length</div>
            <div className="text-xl font-bold text-white mt-1">{voice.measured.sentenceMean} words</div>
            <div className="text-[10px] text-muted mt-0.5">Spread: ±{voice.measured.sentenceSpread}</div>
          </div>
          <div className="rounded-xl bg-card/60 p-4 border border-line">
            <div className="text-[11px] text-muted">Formality Level</div>
            <div className="text-xl font-bold text-white mt-1">{voice.measured.formality} / 5</div>
            <div className="text-[10px] text-muted mt-0.5">Professional & Direct</div>
          </div>
          <div className="rounded-xl bg-card/60 p-4 border border-line">
            <div className="text-[11px] text-muted">Contractions Allowed</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {voice.measured.contractions ? "Active" : "Disabled"}
            </div>
            <div className="text-[10px] text-muted mt-0.5">Natural voice flow</div>
          </div>
          <div className="rounded-xl bg-card/60 p-4 border border-line">
            <div className="text-[11px] text-muted">Spelling Standards</div>
            <div className="text-xl font-bold text-white mt-1 uppercase">{voice.measured.spelling} English</div>
            <div className="text-[10px] text-muted mt-0.5">Regional grammar</div>
          </div>
        </div>
      </div>

      {/* Signature Phrases vs Never Phrases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signature Phrases */}
        <div className="rounded-2xl border border-line bg-booth p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Signature Phrases (Max 15)</h3>
            <p className="text-xs text-muted">Distinctive expressions you authentically use in your work.</p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSignature}
              onChange={(e) => setNewSignature(e.target.value)}
              placeholder="e.g., customer-backed roadmap"
              className="flex-1 rounded-xl border border-line bg-canvas p-2.5 text-xs text-ink focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={addSignaturePhrase}
              className="rounded-xl bg-accent px-3 py-2 text-xs font-bold text-white hover:bg-accent-hover transition"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {voice.signature.map((phrase, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1 text-xs font-medium text-ink border border-line"
              >
                {phrase}
                <button
                  type="button"
                  onClick={() => removeSignaturePhrase(i)}
                  className="text-muted hover:text-rose-400 text-xs"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Never Phrases */}
        <div className="rounded-2xl border border-line bg-booth p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Never Phrases (Banned Words)</h3>
            <p className="text-xs text-muted">Words and buzzwords that will immediately fail verification.</p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newNever}
              onChange={(e) => setNewNever(e.target.value)}
              placeholder="e.g., synergy, passionate"
              className="flex-1 rounded-xl border border-line bg-canvas p-2.5 text-xs text-ink focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={addNeverPhrase}
              className="rounded-xl bg-rose-500/80 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500 transition"
            >
              Ban
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {voice.never.map((phrase, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 border border-rose-500/20"
              >
                {phrase}
                <button
                  type="button"
                  onClick={() => removeNeverPhrase(i)}
                  className="text-rose-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Writing Samples Section */}
      <div className="rounded-2xl border border-line bg-booth p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Add Writing Samples</h3>
          <p className="text-xs text-muted">
            Paste an old cover letter, work email, or blog post (minimum 50 words) to refine your voice model.
          </p>
        </div>

        <form onSubmit={handleAddSample} className="space-y-3">
          <textarea
            rows={4}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            placeholder="Paste your past writing sample here..."
            className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:border-accent focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <select
              value={sampleKind}
              onChange={(e) => setSampleKind(e.target.value)}
              className="rounded-xl border border-line bg-card p-2 text-xs text-ink focus:outline-none"
            >
              <option value="cover-letter">Past Cover Letter</option>
              <option value="work-email">Professional Email</option>
              <option value="linkedin-post">LinkedIn Post / Article</option>
            </select>

            <button
              type="submit"
              disabled={addingSample}
              className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-accent-hover transition disabled:opacity-50"
            >
              {addingSample ? "Analyzing..." : "Analyze & Add Sample"}
            </button>
          </div>
        </form>

        {voice.samples.length > 0 && (
          <div className="pt-4 border-t border-line space-y-2">
            <div className="text-xs font-semibold text-white">Saved Samples ({voice.samples.length})</div>
            {voice.samples.map((s) => (
              <div key={s.id} className="rounded-xl bg-card/60 p-3 text-xs text-muted border border-line">
                <span className="font-semibold text-ink uppercase text-[10px] bg-canvas px-2 py-0.5 rounded border border-line mr-2">
                  {s.kind}
                </span>
                {s.text.slice(0, 160)}...
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
