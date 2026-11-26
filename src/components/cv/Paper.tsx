"use client";

import { type ReactNode, useEffect, useState } from "react";
import { samePassage } from "@/lib/cv/edit";
import type { Flow, FlowNode } from "@/lib/cv/render/flow";
import type { Block, Layout } from "@/lib/cv/render/layout";
import type { CvDoc, Locator } from "@/lib/cv/schema";
import { Btn, Skeleton } from "./ui";
import { type Paper, cssFamily } from "./usePaper";

/**
 * The paper: the CV as it will print, drawn from the same layout the PDF is
 * written from. Clicking a passage opens its field. Nothing drawn here that is
 * not on the page is ever exported.
 */

const PAPER = "#fbfbfd";
const MARK = "#e6e8ff";
/** A point is 1/72 inch; a CSS pixel 1/96. */
const PX_PER_PT = 96 / 72;
const ZOOMS = [0.75, 1, 1.25, 1.5, 2];

/** Where a block (or, on the contact line, one item of it) came from. */
function origin(flow: Flow, b: Block, item?: number): Locator {
  const node = flow.nodes[b.node];
  if (node?.kind === "contact" && item !== undefined && node.items[item]) return node.items[item].at;
  return b.at;
}

/** Where a term appears in a line of the page, as boxes to draw behind it. A screen overlay only: it is never in a file. */
function termBoxes(layout: Layout, page: number, term: string): { x: number; y: number; width: number; height: number }[] {
  const want = term.trim().toLowerCase();
  if (want.length < 2) return [];
  const out: { x: number; y: number; width: number; height: number }[] = [];
  for (const b of layout.blocks)
    for (const l of b.lines) {
      if (l.page !== page) continue;
      for (const r of l.runs) {
        const text = r.text.toLowerCase();
        for (let at = text.indexOf(want); at >= 0; at = text.indexOf(want, at + want.length)) {
          const edge = (i: number) => !/[\p{L}\p{N}]/u.test(text[i] ?? " ");
          if (!edge(at - 1) || !edge(at + want.length)) continue;
          const per = r.width / Math.max(1, r.text.length);
          out.push({ x: r.x + at * per - 1, y: l.top, width: want.length * per + 2, height: l.height });
        }
      }
    }
  return out;
}

function Page({
  layout,
  flow,
  page,
  margin,
  cv,
  accent,
  titleAlign,
  focus,
  onPick,
  label,
  highlight,
  overlay,
}: {
  layout: Layout;
  flow: Flow;
  page: number;
  margin: number;
  cv: Pick<CvDoc, "sections"> & { contact?: CvDoc["contact"] };
  accent?: string;
  titleAlign?: "left" | "center" | "right";
  focus: Locator | null;
  onPick?: (at: Locator) => void;
  label: string;
  highlight?: string;
  overlay?: (page: number) => ReactNode;
}) {
  const photo = page === 0 ? cv.contact?.photo : undefined;
  const photoShape = cv.contact?.photoShape ?? "circle";
  const photoSize = 52;
  const photoRx = photoShape === "circle" ? photoSize / 2 : photoShape === "rounded" ? 10 : 3;
  const photoX = titleAlign === "right" ? margin : layout.width - margin - photoSize;
  const photoY = 38;
  return (
    <svg className="cv-paper" viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label={label} style={{ fontKerning: "none", fontVariantLigatures: "none" }}>
      <rect width={layout.width} height={layout.height} fill={PAPER} />
      {photo && (
        <g
          className="cv-paper-photo"
          style={{ cursor: onPick ? "pointer" : undefined }}
          onClick={onPick && (() => onPick({ section: "contact", field: "fullName" }))}
        >
          <defs>
            <clipPath id="cv-photo-clip">
              <rect x={photoX} y={photoY} width={photoSize} height={photoSize} rx={photoRx} />
            </clipPath>
          </defs>
          <image
            href={photo}
            x={photoX}
            y={photoY}
            width={photoSize}
            height={photoSize}
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#cv-photo-clip)"
          />
          <rect
            x={photoX}
            y={photoY}
            width={photoSize}
            height={photoSize}
            rx={photoRx}
            fill="none"
            stroke={accent || "#3D4BD8"}
            strokeWidth={1.4}
          />
        </g>
      )}
      {layout.rules.filter((r) => r.page === page).map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} fill={r.color} />
      ))}
      {highlight && termBoxes(layout, page, highlight).map((b, i) => <rect key={`h${i}`} className="cv-termmark" x={b.x} y={b.y} width={b.width} height={b.height} rx={2} fill="#ffe58a" />)}
      {layout.blocks.map((b) => {
        const lines = b.lines.filter((l) => l.page === page);
        if (!lines.length) return null;
        const top = lines[0].top;
        const last = lines[lines.length - 1];
        const marked = samePassage(cv, b.at, focus);
        return (
          <g key={b.node} className="cv-passage" data-marked={marked || undefined} data-kind={b.kind}>
            <rect x={margin - 6} y={top - 1} width={layout.width - 2 * margin + 12} height={last.top + last.height - top + 2} rx={2} fill={marked ? MARK : "transparent"} onClick={onPick && (() => onPick(b.at))} />
            {b.mark && lines[0] === b.lines[0] && (
              <text x={b.mark.x} y={lines[0].baseline} fontFamily={cssFamily(b.mark.font)} fontSize={b.mark.size} fill={b.mark.color} pointerEvents="none">
                {b.mark.text}
              </text>
            )}
            {lines.map((l, li) =>
              l.runs.map((r, ri) => (
                <text
                  key={`${li}-${ri}`}
                  x={r.x}
                  y={l.baseline}
                  fontFamily={cssFamily(r.font)}
                  fontSize={r.size}
                  fill={r.color}
                  letterSpacing={r.tracking || undefined}
                  textLength={r.width > 0 && r.text.length > 1 ? r.width : undefined}
                  lengthAdjust="spacing"
                  xmlSpace="preserve"
                  style={{ whiteSpace: "pre" }}
                  onClick={onPick && (() => onPick(origin(flow, b, r.item)))}
                >
                  {r.text}
                </text>
              )),
            )}
          </g>
        );
      })}
      {overlay?.(page)}
    </svg>
  );
}

/** The CV as plain, readable text in reading order: for small screens and screen readers. Each passage opens its field. */
function TextView({ flow, onPick }: { flow: Flow; onPick?: (at: Locator) => void }) {
  const out: ReactNode[] = [];
  const passage = (text: string, at: Locator, key: string | number) =>
    onPick ? (
      <button type="button" key={key} className="cv-text-passage" onClick={() => onPick(at)}>
        {text}
      </button>
    ) : (
      <span key={key}>{text}</span>
    );
  const text = (n: Exclude<FlowNode, { kind: "contact" }>) => ("runs" in n ? n.runs.map((r) => r.text).join("") : n.text);
  let bullets: ReactNode[] = [];
  const flushBullets = (key: number) => {
    if (bullets.length) out.push(<ul key={`ul-${key}`}>{bullets}</ul>);
    bullets = [];
  };
  flow.nodes.forEach((n, i) => {
    if (n.kind === "bullet") {
      bullets.push(<li key={i}>{passage(n.text, n.at, i)}</li>);
      return;
    }
    flushBullets(i);
    if (n.kind === "name") out.push(<p key={i} className="cv-text-name">{passage(n.text, n.at, i)}</p>);
    else if (n.kind === "contact")
      out.push(
        <p key={i} className="cv-text-contact">
          {n.items.map((item, k) => passage(item.text, item.at, k))}
        </p>,
      );
    else if (n.kind === "heading") out.push(<h3 key={i}>{passage(n.text, n.at, i)}</h3>);
    else if (n.kind === "entry") out.push(<h4 key={i}>{passage(text(n), n.at, i)}</h4>);
    else out.push(<p key={i} data-role={n.role}>{passage(text(n), n.at, i)}</p>);
  });
  flushBullets(flow.nodes.length);
  return <div className="cv-textview">{out}</div>;
}

export interface PaperViewProps {
  paper: Paper | null;
  state: "loading" | "ready" | "failed";
  retry: () => void;
  cv: Pick<CvDoc, "sections" | "region"> & { contact?: CvDoc["contact"] };
  focus: Locator | null;
  onPick?: (at: Locator) => void;
  /** What the document is called: "CV" or "resume". */
  word: string;
  /** Shown above the page: a note about the page count, say. */
  children?: ReactNode;
  /** A term to mark wherever it appears on the page (a matched word from the advert). On screen only. */
  highlight?: string;
  /** Marks drawn over a page, in the page's own points (a letter's sentences). On screen only: never in a file. */
  overlay?: (page: number) => ReactNode;
  /** The page to show, when something outside the paper asks for one (a sentence was selected). */
  showPage?: number;
}

/** The paper with its controls: which page, how large, and the Text view. */
export function PaperView({ paper, state, retry, cv, focus, onPick, word, children, highlight, overlay, showPage }: PaperViewProps) {
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState<number | "fit">("fit");
  const [asText, setAsText] = useState(false);
  const pages = paper?.layout.pages ?? 1;
  const current = Math.min(page, pages - 1);

  // The paper follows the field being edited onto its page.
  const layout = paper?.layout;
  useEffect(() => {
    if (!layout || !focus) return;
    const block = layout.blocks.find((b) => samePassage(cv, b.at, focus));
    const on = block?.lines[0]?.page;
    if (on !== undefined) setPage(on);
    // Only when the field changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.section, focus?.entry, focus?.field]);

  useEffect(() => {
    if (showPage !== undefined) setPage(showPage);
  }, [showPage]);

  // And onto the first page where a marked term appears.
  useEffect(() => {
    if (!layout || !highlight) return;
    for (let p = 0; p < layout.pages; p++)
      if (termBoxes(layout, p, highlight).length) {
        setPage(p);
        break;
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlight]);

  if (!paper)
    return (
      <div className="cv-paperpane" aria-busy={state === "loading"}>
        {state === "failed" ? (
          <div className="cv-issue" role="alert">
            <strong>The preview couldn’t load</strong>
            <span>Its fonts didn’t arrive. Your {word} is unaffected.</span>
            <Btn className="cv-push" onClick={retry}>
              Retry
            </Btn>
          </div>
        ) : (
          <Skeleton height={520} />
        )}
      </div>
    );

  const empty = paper.layout.blocks.length === 0 && !cv.contact?.photo;
  const zoomIndex = zoom === "fit" ? -1 : ZOOMS.indexOf(zoom);
  const widthPx = zoom === "fit" ? undefined : paper.layout.width * PX_PER_PT * zoom;
  return (
    <div className="cv-paperpane">
      <div className="cv-papertools" role="toolbar" aria-label="Paper">
        <div className="cv-row" style={{ gap: 4 }}>
          <Btn kind="quiet" aria-label="Previous page" disabled={asText || current === 0} onClick={() => setPage(current - 1)}>
            ‹
          </Btn>
          <span className="cv-small" aria-live="polite" data-testid="page-count">
            Page {current + 1} of {pages}
          </span>
          <Btn kind="quiet" aria-label="Next page" disabled={asText || current >= pages - 1} onClick={() => setPage(current + 1)}>
            ›
          </Btn>
        </div>
        <div className="cv-row cv-push" style={{ gap: 4 }}>
          {!asText && (
            <>
              <Btn kind="quiet" aria-label="Zoom out" disabled={zoom === "fit" || zoomIndex === 0} onClick={() => setZoom(ZOOMS[zoomIndex - 1])}>
                −
              </Btn>
              <Btn kind="quiet" aria-pressed={zoom === "fit"} onClick={() => setZoom("fit")}>
                {zoom === "fit" ? "Fit width" : `${Math.round(zoom * 100)}%`}
              </Btn>
              <Btn kind="quiet" aria-label="Zoom in" disabled={zoomIndex === ZOOMS.length - 1} onClick={() => setZoom(zoom === "fit" ? 1 : ZOOMS[zoomIndex + 1])}>
                +
              </Btn>
            </>
          )}
          <Btn kind="quiet" aria-pressed={asText} onClick={() => setAsText((v) => !v)}>
            Text view
          </Btn>
        </div>
      </div>
      {children}
      {asText ? (
        empty ? (
          <p className="cv-muted cv-pad">Nothing to read yet. Your {word} will appear here as you fill it in.</p>
        ) : (
          <TextView flow={paper.flow} onPick={onPick} />
        )
      ) : (
        <>
          <div className="cv-paperscroll" data-state={state} data-zoom={zoom === "fit" ? "fit" : "zoomed"} tabIndex={0} role="region" aria-label={`Your ${word} on paper`}>
            <div className="cv-papersheet" style={{ width: widthPx ?? "100%" }}>
              <Page
                layout={paper.layout}
                flow={paper.flow}
                page={current}
                margin={paper.style.page.marginX}
                cv={cv}
                accent={paper.style.accent}
                titleAlign={paper.style.template.title.align}
                focus={focus}
                onPick={onPick}
                highlight={highlight}
                overlay={overlay}
                label={empty ? `An empty page. Your ${word} will appear here as you fill it in.` : `Page ${current + 1} of ${pages} of your ${word}. Use Text view to read it.`}
              />
              {empty && <p className="cv-paperhint">Your {word} will appear here as you fill it in.</p>}
            </div>
          </div>
          <p className="cv-papercaption" aria-hidden="true">
            {paper.layout.width === 612 ? "US Letter" : "A4"} · Live paper preview
          </p>
        </>
      )}
    </div>
  );
}

/** One page drawn small, with nothing around it: for a thumbnail of the same CV in another design. */
export function PaperPage({ paper, cv, page = 0, label }: { paper: Paper; cv: PaperViewProps["cv"]; page?: number; label: string }) {
  return <Page layout={paper.layout} flow={paper.flow} page={page} margin={paper.style.page.marginX} cv={cv} accent={paper.style.accent} titleAlign={paper.style.template.title.align} focus={null} label={label} />;
}
