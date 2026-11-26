import type { CSSProperties } from "react";
import { BANDS, bandOf } from "@/lib/cv/score/band";

/** The gap between the scale's coloured parts, as a share of the ring. */
const GAP = 0.012;

/**
 * The score as a ring. Faintly around it, the whole scale in its colours:
 * Poor in red, Average in orange, Good in lime, Strong in green. Over it, the
 * score itself in the colour of its label. Beside it, the label, how far it is
 * to the next one, and the key. The number is text, so it can be read, copied
 * and enlarged; the ring is a picture of it.
 */
export function ScoreRing({ score, label, size = 132 }: { score: number; label: string; size?: number }) {
  const stroke = 10;
  const r = (size - stroke) / 2 - 1;
  const c = 2 * Math.PI * r;
  const shown = Math.max(0, Math.min(100, Math.round(score)));
  const centre = size / 2;
  const current = bandOf(shown);
  const at = BANDS.findIndex((b) => b.key === current.key);
  const next = BANDS[at + 1];
  const segment = (from: number, to: number) => ({ dash: `${Math.max(0, (to - from) / 100 - GAP) * c} ${c}`, turn: (from / 100) * 360 - 90 + (GAP / 2) * 360 });
  return (
    <div className="cv-scorering" data-band={current.key} role="img" aria-label={`${label}: ${shown} out of 100, ${current.name}`}>
      <div className="cv-ring" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
          {BANDS.map((b, i) => {
            const s = segment(b.from, BANDS[i + 1]?.from ?? 100);
            return <circle key={b.key} className="cv-ring-scale" data-band={b.key} cx={centre} cy={centre} r={r} fill="none" strokeWidth={stroke} strokeDasharray={s.dash} transform={`rotate(${s.turn} ${centre} ${centre})`} />;
          })}
          {shown > 0 && (
            <circle
              className="cv-ring-arc"
              cx={centre}
              cy={centre}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${(shown / 100) * c} ${c}`}
              transform={`rotate(-90 ${centre} ${centre})`}
              style={{ "--ring-length": `${c}` } as CSSProperties}
            />
          )}
        </svg>
        <span className="cv-ring-number" aria-hidden="true">
          <b>{shown}</b>
          <small>/ 100</small>
        </span>
      </div>
      <div className="cv-ring-words" aria-hidden="true">
        <b className="cv-ring-band">{current.name}</b>
        <span className="cv-small">{next ? `${next.from - shown} ${next.from - shown === 1 ? "point" : "points"} to ${next.name}` : "The top band"}</span>
        <span className="cv-ring-key">
          {BANDS.map((b, i) => (
            <span key={b.key} data-band={b.key}>
              {b.name} {b.from}
              {BANDS[i + 1] ? `–${BANDS[i + 1].from - 1}` : "+"}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
