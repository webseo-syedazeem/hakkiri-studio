"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Icon } from "@/components/ui";
import { speak, type VoiceName } from "@/components/audio/speak";

const PREVIEW: { voice: VoiceName; label: string; who: string; role: string; line: string }[] = [
  {
    voice: "easy",
    label: "Easy",
    who: "Sarah",
    role: "Supportive HR Lead",
    line: "Hi, thanks for coming in today. To start us off, tell me a little about yourself and what drew you to this role.",
  },
  {
    voice: "medium",
    label: "Medium",
    who: "George",
    role: "Senior Engineering Manager",
    line: "Tell me about a time you had to win round someone who strongly disagreed with your technical decision.",
  },
  {
    voice: "hard",
    label: "Hard",
    who: "Daniel",
    role: "Executive Director",
    line: "You said the project was a major success. How exactly do you know? Walk me through the specific metrics.",
  },
];

/** Interviewer voice: what it is on this server (a natural voice, or the browser's own), with a preview of each interviewer. */
export function VoiceSetting({
  naturalAvailable,
  unavailableNote,
}: {
  initial?: "natural" | "browser";
  naturalAvailable?: boolean;
  unavailableNote?: string | null;
}) {
  const [playing, setPlaying] = useState<VoiceName | null>(null);
  const current = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => {
    // Ensure cookie is set to natural voice
    document.cookie = `hk_voice=natural; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    return () => current.current?.cancel();
  }, []);

  const preview = async (v: (typeof PREVIEW)[number]) => {
    current.current?.cancel();
    if (playing === v.voice) return setPlaying(null);
    setPlaying(v.voice);
    const s = speak(v.line, { voice: v.voice });
    current.current = s;
    await s.done;
    if (current.current === s) {
      current.current = null;
      setPlaying(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-line/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={clsx("h-2 w-2 rounded-full", naturalAvailable ? "bg-emerald-400" : "bg-muted")} />
            <span className="text-sm font-bold text-ink">{naturalAvailable ? "Natural interviewer voice" : "Your browser’s voice"}</span>
          </div>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            {naturalAvailable
              ? "Questions are read out in a natural voice. Easy, Medium and Hard each have their own interviewer."
              : "Questions are read out by the voice built into your browser, so all three interviewers may sound the same."}
          </p>
        </div>
        <span
          data-testid="voice-status"
          className={clsx(
            "rounded-full border px-2.5 py-1 text-[11px] font-bold",
            naturalAvailable ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-panel-2 border-line text-muted",
          )}
        >
          {naturalAvailable ? "On" : "Browser voice"}
        </span>
      </div>

      {unavailableNote && (
        <p className="text-xs text-dim bg-panel-2 p-3 rounded-xl border border-line">
          {unavailableNote}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {PREVIEW.map((v) => (
          <button
            key={v.voice}
            type="button"
            onClick={() => void preview(v)}
            aria-pressed={playing === v.voice}
            className={clsx(
              "flex flex-col gap-2 rounded-2xl p-4 text-left border transition-all cursor-pointer",
              playing === v.voice
                ? "bg-blue/15 border-blue text-ink shadow-md"
                : "bg-panel-2 border-line hover:border-line-strong hover:bg-panel text-ink"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                {v.label} Tier
              </span>
              <Icon
                name={playing === v.voice ? "pause" : "speaker"}
                size={16}
                strokeWidth={2}
                className="shrink-0 text-blue-soft"
              />
            </div>
            <div>
              <span className="block text-sm font-black text-ink">{v.who}</span>
              <span className="block text-[11px] text-muted truncate">{v.role}</span>
            </div>
            <div className="text-[11px] font-medium text-blue-soft pt-1">
              {playing === v.voice ? "Playing preview…" : "Click to hear voice →"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
