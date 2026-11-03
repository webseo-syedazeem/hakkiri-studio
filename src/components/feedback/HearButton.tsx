"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { speak } from "@/components/audio/speak";

/** Reads the stronger version aloud so you can hear how it should sound. */
export function HearButton({ text, label = "Hear the stronger version" }: { text: string; label?: string }) {
  const [playing, setPlaying] = useState<{ cancel: () => void } | null>(null);
  return (
    <button
      type="button"
      onClick={async () => {
        if (playing) {
          playing.cancel();
          setPlaying(null);
          return;
        }
        const v = speak(text, { rate: 1.02 });
        setPlaying(v);
        await v.done;
        setPlaying(null);
      }}
      className="mt-2.5 flex items-center gap-1.5 text-[13px] font-semibold text-blue-soft hover:underline"
    >
      <Icon name="speaker" size={15} strokeWidth={2} />
      {playing ? "Stop" : label}
    </button>
  );
}
