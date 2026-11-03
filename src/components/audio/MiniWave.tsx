import clsx from "clsx";

/** Speech-like amplitude for a decorative waveform (deterministic, so server and client match). */
export function speechAmp(i: number, seed = 0): number {
  const rnd = (Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1;
  const phrase = 0.55 + 0.45 * Math.sin(i / 7 + seed) * Math.sin(i / 2.3 + seed * 2);
  const gap = i % 29 === 0 || i % 29 === 1 ? 0.12 : 1;
  return Math.max(0.08, Math.min(1, Math.abs(phrase) * (0.55 + 0.45 * Math.abs(rnd)) * gap));
}

/** A small decorative waveform: played bars, then a dotted line for what's left. */
export function MiniWave({ bars, played, className, seed = 4 }: { bars: number; played: number; className?: string; seed?: number }) {
  return (
    <div aria-hidden className={clsx("flex items-center gap-[3px]", className)}>
      {Array.from({ length: bars }, (_, i) =>
        i < played ? (
          <span key={i} className={clsx("w-[3px] shrink-0 rounded-full", i < played - 8 ? "bg-wave" : "bg-blue")} style={{ height: `${Math.round(speechAmp(i, seed) * 100)}%` }} />
        ) : (
          <span key={i} className="h-0.5 w-[3px] shrink-0 rounded-full bg-white/10" />
        ),
      )}
    </div>
  );
}
