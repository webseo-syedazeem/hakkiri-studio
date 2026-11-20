/**
 * The official Hakkiri mark:
 * - 42.1-radius outer arc in navy (#18345B)
 * - 5 vertical audio bars in near-black (#18191C) with rx=3.45
 * - coral dot (#F06D65) at cx=91.6, cy=50
 *
 * When displayed on dark backgrounds, setting `badge={true}` nests the mark inside
 * the official white circular pill (#FFFFFF) matching `hakkiri-logo-reversed.svg`.
 * `live` animates the audio bars during live speaking / listening.
 */
export interface MarkProps {
  size?: number;
  color?: string;
  badge?: boolean;
  badgeShape?: "circle" | "squircle";
  live?: boolean;
  className?: string;
}

const BARS = [
  { x: 26.35, y: 42.5, w: 6.9, h: 15 },
  { x: 35.95, y: 34.5, w: 6.9, h: 31 },
  { x: 45.55, y: 26.25, w: 6.9, h: 47.5 },
  { x: 55.15, y: 34.5, w: 6.9, h: 31 },
  { x: 64.75, y: 42.5, w: 6.9, h: 15 },
] as const;

export function Mark({
  size = 28,
  color,
  badge = false,
  badgeShape = "circle",
  live = false,
  className,
}: MarkProps) {
  const arcStroke = color ?? "#18345B";
  const barFill = color ?? "#18191C";
  const dotFill = "#F06D65";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Hakkiri"
      className={className}
    >
      {badge &&
        (badgeShape === "squircle" ? (
          <rect width="100" height="100" rx="22" fill="#FFFFFF" />
        ) : (
          <circle cx="50" cy="50" r="50" fill="#FFFFFF" />
        ))}
      <path
        d="M87.011 69.113A42.1 42.1 0 1 1 87.011 30.887"
        fill="none"
        stroke={badge && !color ? "#18345B" : arcStroke}
        strokeWidth="9.2"
        strokeLinecap="round"
      />
      {BARS.map((b, k) => (
        <rect
          key={b.x}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx="3.45"
          fill={badge && !color ? "#18191C" : barFill}
          className={live ? "animate-wave" : undefined}
          style={
            live
              ? {
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  animationDelay: `${-k * 0.18}s`,
                }
              : undefined
          }
        />
      ))}
      <circle cx="91.6" cy="50" r="7.55" fill={dotFill} />
    </svg>
  );
}
