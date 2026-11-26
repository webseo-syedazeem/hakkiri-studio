import type { CSSProperties } from "react";

type Band = "Needs work" | "Good" | "Strong";
const BAND_KEY: Record<Band, "low" | "good" | "strong"> = { "Needs work": "low", Good: "good", Strong: "strong" };
/** Where each label starts, marked on the ring so the label can be read off it. */
const MARKS = [60, 80];

/**
 * The score as a ring: the arc is the score out of 100, coloured by its label,
 * with small marks where "Good" (60) and "Strong" (80) begin. Beside it, the
 * label and how far it is to the next one. The number is text, so it can be
 * read, copied and enlarged; the ring itself is a picture of it.
 */
export function ScoreRing({ score, band, label, size = 132 }: { score: number; band: Band; label: string; size?: number }) {
  const stroke = 9;
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const shown = Math.max(0, Math.min(100, Math.round(score)));
  const centre = size / 2;
  const next = shown < 60 ? { name: "Good", at: 60 } : shown < 80 ? { name: "Strong", at: 80 } : null;
  return (
    <div className="cv-scorering" data-band={BAND_KEY[band]} role="img" aria-label={`${label}: ${shown} out of 100, ${band}`}>
      <div className="cv-ring" style={{ width: size, height: size } as CSSProperties}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
          <circle className="cv-ring-track" cx={centre} cy={centre} r={r} fill="none" strokeWidth={stroke} />
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
          {MARKS.map((m) => {
            const a = (m / 100) * 2 * Math.PI - Math.PI / 2;
            const inner = r - stroke / 2 - 3;
            const outer = r + stroke / 2 + 3;
            return <line key={m} className="cv-ring-mark" x1={centre + inner * Math.cos(a)} y1={centre + inner * Math.sin(a)} x2={centre + outer * Math.cos(a)} y2={centre + outer * Math.sin(a)} strokeWidth={2} strokeLinecap="round" />;
          })}
        </svg>
        <span className="cv-ring-number" aria-hidden="true">
          <b>{shown}</b>
          <small>/ 100</small>
        </span>
      </div>
      <div className="cv-ring-words" aria-hidden="true">
        <b className="cv-ring-band">{band}</b>
        <span className="cv-small">{next ? `${next.at - shown} ${next.at - shown === 1 ? "point" : "points"} to ${next.name}` : "Top band"}</span>
        <span className="cv-small cv-muted">Good from 60 · Strong from 80</span>
      </div>
    </div>
  );
}
