"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CustomSelect, type CustomSelectOption } from "@/components/ui";
import type { Voice } from "@/lib/apply/schema";

const SAMPLE_KIND_OPTIONS: CustomSelectOption[] = [
  { value: "cover-letter", label: "Cover Letter / Intro Note", dotColor: "bg-blue" },
  { value: "email", label: "Professional Email", dotColor: "bg-emerald-400" },
  { value: "slack", label: "Slack / Team Update", dotColor: "bg-purple-400" },
  { value: "blog", label: "Technical Article / Blog", dotColor: "bg-amber-400" },
  { value: "other", label: "Other Prose", dotColor: "bg-zinc-400" },
];

export default function VoicePersonaPage() {
  const [voice, setVoice] = useState<Voice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // New sample input
  const [sampleText, setSampleText] = useState("");
  const [sampleKind, setSampleKind] = useState<"cover-letter" | "email" | "slack" | "blog" | "other">("cover-letter");
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue border-t-transparent" />
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
            Hakkiri Apply Suite · Voice Profiler
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">
            Voice Persona & Style Profile
          </h1>
          <p className="text-xs text-muted max-w-2xl">
            Defines your authentic writing style. Every generated cover letter and written answer mirrors your tone and avoids generic corporate speak.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 animate-fadeIn">
              ✓ Saved to Cloud
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-gradient-to-r from-blue-fill to-blue-hover px-5 py-2.5 text-xs font-bold text-white shadow-xl shadow-blue-fill/25 hover:shadow-blue-fill/40 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Voice Persona"}
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Style Metrics, Plain Words, Samples (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          {/* Plain Words Description */}
          <div className="rounded-3xl border border-blue/30 bg-blue/5 p-6 space-y-3 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue">
                How You Sound (Plain-Words Profile)
              </span>
              <span className="text-[10px] font-mono text-muted">Active Model Persona</span>
            </div>
            <div className="text-xs sm:text-sm font-medium text-ink space-y-2 leading-relaxed">
              <p>• You write in crisp, direct sentences (averaging <span className="font-bold text-blue">{voice.measured.sentenceMean}</span> words per sentence).</p>
              <p>• {voice.measured.contractions ? "You naturally use friendly contractions (I'll, we've, don't) for approachable authenticity." : "You avoid informal contractions for executive formality."}</p>
              <p>• You lead with business impact and engineering outcomes in the very first sentence.</p>
              <p>• You strictly forbid AI clichés ({voice.never.slice(0, 3).join(", ")}, etc.).</p>
            </div>
          </div>

          {/* Measured Metrics Grid */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-wider text-ink border-b border-line pb-3">
              Style Metrics (Computed From Writing Samples)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="rounded-2xl bg-panel-2 p-4 border border-line">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Sentence Mean</span>
                <span className="text-xl font-black text-ink mt-1 block">{voice.measured.sentenceMean} words</span>
                <span className="text-[10px] text-muted block mt-0.5">Spread: ±{voice.measured.sentenceSpread}</span>
              </div>
              <div className="rounded-2xl bg-panel-2 p-4 border border-line">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Formality</span>
                <span className="text-xl font-black text-ink mt-1 block">{voice.measured.formality} / 5</span>
                <span className="text-[10px] text-muted block mt-0.5">Professional & Direct</span>
              </div>
              <div className="rounded-2xl bg-panel-2 p-4 border border-line">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Contractions</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">
                  {voice.measured.contractions ? "Active" : "Disabled"}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">Natural voice flow</span>
              </div>
              <div className="rounded-2xl bg-panel-2 p-4 border border-line">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Spelling</span>
                <span className="text-xl font-black text-ink mt-1 block uppercase">{voice.measured.spelling} English</span>
                <span className="text-[10px] text-muted block mt-0.5">Regional grammar</span>
              </div>
            </div>
          </div>

          {/* Add Writing Samples */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-ink">
                  Writing Samples ({voice.samples.length})
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Paste real emails, cover letters, or Slack messages you wrote. The system calibrates to your true rhythm.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddSample} className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-muted whitespace-nowrap">Sample Kind:</label>
                <div className="w-64">
                  <CustomSelect
                    value={sampleKind}
                    onChange={(val) => setSampleKind(val as any)}
                    options={SAMPLE_KIND_OPTIONS}
                    size="sm"
                  />
                </div>
              </div>

              <textarea
                rows={4}
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Paste an authentic paragraph you wrote here (at least 50 characters)..."
                className="w-full rounded-2xl border border-line bg-panel-2 p-4 text-xs text-ink placeholder:text-muted focus:border-blue focus:outline-none leading-relaxed"
                required
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted font-mono">{sampleText.length} characters</span>
                <button
                  type="submit"
                  disabled={addingSample || sampleText.length < 50}
                  className="rounded-xl bg-blue-fill px-4 py-2 text-xs font-bold text-white hover:bg-blue-hover transition disabled:opacity-40"
                >
                  {addingSample ? "Calibrating..." : "+ Add & Re-measure Voice"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Signature & Never Phrases (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Signature Phrases */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-ink">
                  Signature Phrases ({voice.signature.length}/15)
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Distinctive expressions you authentically use in your work.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., customer-backed roadmap"
                value={newSignature}
                onChange={(e) => setNewSignature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSignaturePhrase())}
                className="flex-1 rounded-xl border border-line bg-panel-2 px-3.5 py-2 text-xs text-ink placeholder:text-muted focus:border-blue focus:outline-none"
              />
              <button
                type="button"
                onClick={addSignaturePhrase}
                className="rounded-xl bg-panel-2 border border-line-strong px-4 py-2 text-xs font-bold text-ink hover:bg-blue-fill hover:text-white transition"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {voice.signature.map((phrase, i) => (
                <span
                  key={i}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-blue/30 bg-blue/10 px-3 py-1 text-xs font-bold text-blue transition"
                >
                  {phrase}
                  <button
                    type="button"
                    onClick={() => removeSignaturePhrase(i)}
                    className="text-blue/60 hover:text-white transition text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Never Phrases (Banned Clichés) */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-400">
                  Never Phrases (Banned AI Clichés)
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Words that will immediately fail verification checks.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., synergy, passionate"
                value={newNever}
                onChange={(e) => setNewNever(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNeverPhrase())}
                className="flex-1 rounded-xl border border-line bg-panel-2 px-3.5 py-2 text-xs text-ink placeholder:text-muted focus:border-rose-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addNeverPhrase}
                className="rounded-xl bg-rose-500/20 border border-rose-500/30 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500 hover:text-white transition"
              >
                Ban
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {voice.never.map((phrase, i) => (
                <span
                  key={i}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300 transition"
                >
                  {phrase}
                  <button
                    type="button"
                    onClick={() => removeNeverPhrase(i)}
                    className="text-rose-400 hover:text-white transition text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Verification Guard info */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-2">
            <div className="text-xs font-bold text-ink">Strict Model Enforcement</div>
            <p className="text-xs text-muted leading-relaxed">
              When tailoring cover letters or drafting interview answers, generated text is measured against your sentence mean (±4 spread) and rejected if any banned cliché appears.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
