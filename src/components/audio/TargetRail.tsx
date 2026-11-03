import { mmss } from "@/lib/format";

/**
 * The time rail under a live answer: elapsed time, with the target range
 * for this kind of question shaded (from the context profile).
 */
export function TargetRail({ totalSec, nowSec, target }: { totalSec: number; nowSec: number; target: [number, number] }) {
  const x = (s: number) => `${(Math.min(s, totalSec) / totalSec) * 100}%`;
  const ticks: number[] = [];
  // Leave out ticks under the target label, so they don't collide with it.
  for (let s = 0; s <= totalSec; s += 30) if (s < target[0] || s > target[1]) ticks.push(s);
  return (
    <div className="relative h-10" role="img" aria-label={`${mmss(nowSec)} so far. Target ${mmss(target[0])} to ${mmss(target[1])}`}>
      <span className="absolute inset-x-0 top-1.5 h-0.5 bg-white/14" />
      <span className="absolute top-0 h-3.5 rounded bg-blue/22" style={{ left: x(target[0]), width: `calc(${x(target[1])} - ${x(target[0])})` }} />
      <span className="num absolute top-[18px] whitespace-nowrap text-xs font-semibold text-blue-soft" style={{ left: x(target[0]) }}>
        Target {mmss(target[0])}–{mmss(target[1])}
      </span>
      <span className="absolute left-0 top-1.5 h-0.5 bg-white" style={{ width: x(nowSec) }} />
      <span className="absolute -top-px h-4 w-4 -translate-x-1/2 rounded-full bg-white shadow-[0_0_0_4px_var(--color-booth)]" style={{ left: x(nowSec) }} />
      {ticks.map((s) => (
        <span key={s} className="num absolute top-[18px] -translate-x-1/2 text-xs text-muted first:translate-x-0" style={{ left: x(s) }}>
          {mmss(s)}
        </span>
      ))}
    </div>
  );
}
