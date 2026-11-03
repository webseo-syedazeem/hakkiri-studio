"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Icon } from "@/components/ui";
import { Segmented } from "@/components/ui/Segmented";
import { speak, type VoiceName } from "@/components/audio/speak";

type Choice = "natural" | "browser";

const PREVIEW: { voice: VoiceName; label: string; who: string; line: string }[] = [
  { voice: "easy", label: "Easy", who: "Sarah", line: "Hi, thanks for coming in. To start us off, tell me a little about yourself." },
  { voice: "medium", label: "Medium", who: "George", line: "Tell me about a time you had to win round someone who disagreed with you." },
  { voice: "hard", label: "Hard", who: "Daniel", line: "You said the project was a success. How do you know? Give me a number." },
];

/** Interviewer voice: natural (ElevenLabs) or the browser's own, with a preview of each difficulty. */
export function VoiceSetting({ initial, naturalAvailable, unavailableNote }: { initial: Choice; naturalAvailable: boolean; unavailableNote: string | null }) {
  const [choice, setChoice] = useState<Choice>(initial);
  const [playing, setPlaying] = useState<VoiceName | null>(null);
  const current = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => () => current.current?.cancel(), []);

  const pick = (c: Choice) => {
    setChoice(c);
    document.cookie = `hk_voice=${c}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  };

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
    <div>
      {naturalAvailable && (
        <Segmented<Choice>
          label="Interviewer voice"
          value={choice}
          onChange={pick}
          options={[
            { value: "natural", label: "Natural voice" },
            { value: "browser", label: "Browser voice" },
          ]}
        />
      )}
      <p className="mt-2.5 text-[13px] leading-normal text-muted">
        {naturalAvailable && choice === "natural"
          ? "A natural, human-sounding voice. Easy, Medium and Hard each have their own interviewer."
          : "Your browser’s built-in voice. It works offline and costs nothing, but sounds more robotic."}
      </p>
      {unavailableNote && <p className="mt-1.5 text-[13px] text-dim">{unavailableNote}</p>}
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {PREVIEW.map((v) => (
          <button
            key={v.voice}
            type="button"
            onClick={() => void preview(v)}
            aria-pressed={playing === v.voice}
            className={clsx(
              "flex items-center gap-2.5 rounded-[10px] px-3.5 py-3 text-left shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors hover:bg-panel-2",
              playing === v.voice && "bg-panel-2",
            )}
          >
            <Icon name={playing === v.voice ? "pause" : "speaker"} size={16} strokeWidth={2} className="shrink-0 text-blue-soft" />
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold">{playing === v.voice ? "Stop" : `Hear ${v.label}`}</span>
              <span className="block text-[12px] text-muted">{naturalAvailable && choice === "natural" ? v.who : "Browser voice"}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
