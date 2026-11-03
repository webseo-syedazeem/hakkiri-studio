import clsx from "clsx";
import type { CSSProperties } from "react";
import type { Slide } from "@/lib/pitch/types";

/**
 * One slide, drawn at any size (design screens 11 to 14): the big slide while
 * you rehearse, and the small thumbnails in the plan and the run report.
 * Sizes are in container units, so a thumbnail is an exact miniature.
 *
 * A PDF page is shown as its picture. PowerPoint slides and pasted notes are
 * drawn from their text in Hakkiri's slide style, with any picture beside it.
 */

const INK = "#16201D";
const MUTED = "#5D6B66";
const ACCENT = "#1F3A34";
const SOFT = "#E3EEEA";
const PAPER = "#FBFBF8";

/** Pixels on a 960-wide slide, as container units. */
const u = (px: number) => `${(px / 9.6).toFixed(3)}cqw`;

export type SlideLike = Pick<Slide, "n" | "title" | "lines" | "layout" | "image">;

export function slideImageSrc(presentationId: string, file: string) {
  return `/api/presentations/${presentationId}/slides/${file}`;
}

function Title({ children }: { children: string }) {
  return <div style={{ fontSize: u(30), fontWeight: 700, letterSpacing: "-0.02em", color: INK, lineHeight: 1.15 }}>{children}</div>;
}

function Bullets({ lines, size = 22 }: { lines: string[]; size?: number }) {
  return (
    <div style={{ marginTop: u(34) }}>
      {lines.slice(0, 8).map((l, i) => (
        <div key={i} style={{ display: "flex", gap: u(14), alignItems: "baseline", padding: `${u(13)} 0`, borderTop: i ? `${u(1.5)} solid #E4E8E4` : undefined, fontSize: u(size), color: INK, lineHeight: 1.3 }}>
          <span style={{ width: u(7), height: u(7), borderRadius: "50%", background: ACCENT, flexShrink: 0, transform: `translateY(-${u(4)})` }} />
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}

function Body({ slide, imageSrc }: { slide: SlideLike; imageSrc: string | null }) {
  const lines = slide.lines;
  switch (slide.layout) {
    case "title":
      return (
        <div style={{ position: "absolute", left: u(56), right: u(56), bottom: u(56) }}>
          <div style={{ fontSize: u(64), fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.02, color: "#FFFFFF" }}>{slide.title}</div>
          {lines[0] && <div style={{ fontSize: u(22), marginTop: u(16), color: "#BFD9D0" }}>{lines[0]}</div>}
        </div>
      );
    case "stat": {
      const [from, to] = (lines[0] ?? "").split(/\s*→\s*/);
      return (
        <>
          <Title>{slide.title}</Title>
          <div style={{ display: "flex", alignItems: "center", gap: u(36), marginTop: u(60) }}>
            {to ? (
              <>
                <div style={{ fontSize: u(110), fontWeight: 700, letterSpacing: "-0.04em", color: MUTED, lineHeight: 1 }}>{from}</div>
                <div style={{ fontSize: u(50), color: "#2F6B5C" }}>→</div>
                <div style={{ fontSize: u(110), fontWeight: 700, letterSpacing: "-0.04em", color: ACCENT, lineHeight: 1 }}>{to}</div>
              </>
            ) : (
              <div style={{ fontSize: u(110), fontWeight: 700, letterSpacing: "-0.04em", color: ACCENT, lineHeight: 1 }}>{from}</div>
            )}
          </div>
          {lines[1] && <div style={{ fontSize: u(20), color: MUTED, marginTop: u(14) }}>{lines[1]}</div>}
        </>
      );
    }
    case "quote":
      return (
        <>
          <Title>{slide.title}</Title>
          <div style={{ fontSize: u(44), fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.2, color: ACCENT, marginTop: u(48), maxWidth: u(720) }}>{lines[0]}</div>
          {lines[1] && <div style={{ fontSize: u(18), color: MUTED, marginTop: u(18) }}>{lines[1]}</div>}
        </>
      );
    case "cards":
      return (
        <>
          <Title>{slide.title}</Title>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, lines.length))}, 1fr)`, gap: u(24), marginTop: u(56) }}>
            {lines.slice(0, 4).map((l, i) => (
              <div key={i} style={{ background: SOFT, borderRadius: u(12), padding: `${u(26)} ${u(22)}`, height: u(190), boxSizing: "border-box" }}>
                <div style={{ width: u(44), height: u(44), borderRadius: "50%", background: ACCENT, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: u(20), fontWeight: 700 }}>{i + 1}</div>
                <div style={{ fontSize: u(24), fontWeight: 700, color: INK, marginTop: u(22), lineHeight: 1.2 }}>{l}</div>
              </div>
            ))}
          </div>
        </>
      );
    case "chart": {
      const bars = lines.slice(1).map((l) => {
        const m = l.match(/^(.*?)\s+(-?\d+(?:\.\d+)?)$/);
        return m ? { label: m[1], value: Number(m[2]) } : { label: l, value: 0 };
      });
      const max = Math.max(1, ...bars.map((b) => b.value));
      return (
        <>
          <Title>{slide.title}</Title>
          <div style={{ display: "flex", alignItems: "flex-end", gap: u(22), height: u(270), marginTop: u(40) }}>
            {bars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ fontSize: u(18), fontWeight: 700, color: i === bars.length - 1 ? ACCENT : MUTED, marginBottom: u(8) }}>{b.value}</div>
                <div style={{ width: "100%", height: `${(b.value / max) * 82}%`, borderRadius: `${u(6)} ${u(6)} 0 0`, background: i === bars.length - 1 ? ACCENT : SOFT }} />
                <div style={{ fontSize: u(16), color: MUTED, marginTop: u(8) }}>{b.label}</div>
              </div>
            ))}
          </div>
          {lines[0] && <div style={{ fontSize: u(16), color: MUTED, marginTop: u(12) }}>{lines[0]}</div>}
        </>
      );
    }
    case "timeline": {
      const steps = lines.map((l) => {
        const [when, ...rest] = l.split(":");
        return { when: rest.length ? when.trim() : "", what: (rest.length ? rest.join(":") : l).trim() };
      });
      return (
        <>
          <Title>{slide.title}</Title>
          <div style={{ position: "relative", marginTop: u(110), height: u(4), background: SOFT, borderRadius: u(2) }}>
            {steps.map((_, i) => (
              <span key={i} style={{ position: "absolute", top: `-${u(7)}`, left: `${(i / Math.max(1, steps.length)) * 100}%`, width: u(18), height: u(18), borderRadius: "50%", background: ACCENT }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length || 1}, 1fr)`, gap: u(20), marginTop: u(26) }}>
            {steps.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: u(24), fontWeight: 700, color: INK }}>{s.when || `Step ${i + 1}`}</div>
                <div style={{ fontSize: u(18), color: MUTED, marginTop: u(8), lineHeight: 1.35 }}>{s.what}</div>
              </div>
            ))}
          </div>
        </>
      );
    }
    case "ask":
      return (
        <>
          <Title>{slide.title}</Title>
          <div style={{ fontSize: u(50), fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.12, color: ACCENT, marginTop: u(48), maxWidth: u(760) }}>{lines[0]}</div>
          {lines.slice(1).map((l, i) => (
            <div key={i} style={{ fontSize: u(20), color: MUTED, marginTop: u(14) }}>
              {l}
            </div>
          ))}
        </>
      );
    default:
      return (
        <div style={{ display: "flex", gap: u(36), height: "100%" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title>{slide.title}</Title>
            <Bullets lines={lines} size={lines.join(" ").length > 260 ? 17 : 22} />
          </div>
          {imageSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt="" style={{ width: "40%", height: "100%", objectFit: "contain", alignSelf: "center" }} />
          )}
        </div>
      );
  }
}

export function SlideView({
  slide,
  presentationId,
  imageSrc,
  className,
  style,
  showNumber = true,
}: {
  slide: SlideLike;
  presentationId?: string;
  /** A local picture, before the presentation is saved. */
  imageSrc?: string | null;
  className?: string;
  style?: CSSProperties;
  showNumber?: boolean;
}) {
  const src = imageSrc ?? (slide.image && presentationId ? slideImageSrc(presentationId, slide.image.file) : null);
  const label = `Slide ${slide.n}: ${slide.title || "untitled"}`;
  if (slide.image?.kind === "page" && src) {
    return (
      <div role="img" aria-label={label} className={clsx("@container relative aspect-video overflow-hidden bg-white", className)} style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-contain" />
      </div>
    );
  }
  const title = slide.layout === "title";
  return (
    <div role="img" aria-label={label} className={clsx("@container relative aspect-video overflow-hidden", className)} style={{ background: title ? ACCENT : PAPER, ...style }}>
      <div style={{ position: "absolute", inset: 0, padding: `${u(48)} ${u(56)}`, boxSizing: "border-box", fontFamily: "var(--font-sans)" }}>
        <Body slide={slide} imageSrc={src} />
      </div>
      {showNumber && !title && <div style={{ position: "absolute", right: u(56), bottom: u(28), fontSize: u(13), color: MUTED }}>{slide.n}</div>}
    </div>
  );
}
