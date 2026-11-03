/**
 * The Hakkiri mark: a brush arc around voice bars, with the red dot.
 * Geometry matches the mobile app's logo. `live` animates the bars
 * (used when the interviewer is listening or speaking).
 */
const CX = 31;
const CY = 32;
const R = 24;
const pt = (deg: number, r = R) => [CX + r * Math.cos((deg * Math.PI) / 180), CY + r * Math.sin((deg * Math.PI) / 180)] as const;
const f = (n: number) => n.toFixed(1);

const [x0, y0] = pt(-38);
const [x1, y1] = pt(36);
const [tx1, ty1] = pt(-10);
const [fx0, fy0] = pt(-160, 26.6);
const [fx1, fy1] = pt(-75, 26.6);
const [dx, dy] = pt(4, 22.5);
const BARS = [
  [15.5, 3.6],
  [20.5, 10],
  [25.5, 17],
  [30.5, 27],
  [35.5, 19],
  [40.5, 11],
] as const;

export function Mark({ size = 28, color = "currentColor", live = false }: { size?: number; color?: string; live?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Hakkiri">
      <path d={`M${f(x0)} ${f(y0)} A${R} ${R} 0 1 0 ${f(x1)} ${f(y1)}`} fill="none" stroke={color} strokeWidth="5.6" strokeLinecap="round" />
      <path d={`M${f(x0)} ${f(y0)} A${R} ${R} 0 0 1 ${f(tx1)} ${f(ty1)}`} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M${f(fx0)} ${f(fy0)} A26.6 26.6 0 0 1 ${f(fx1)} ${f(fy1)}`} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      {BARS.map(([x, h], k) => (
        <rect
          key={x}
          x={x - 1.75}
          y={CY - h / 2}
          width="3.5"
          height={h}
          rx="1.75"
          fill={color}
          className={live ? "animate-wave" : undefined}
          style={live ? { transformBox: "fill-box", transformOrigin: "center", animationDelay: `${-k * 0.21}s` } : undefined}
        />
      ))}
      <circle cx={f(dx + 2.4)} cy={f(dy)} r="3.9" fill="var(--color-red)" />
    </svg>
  );
}
