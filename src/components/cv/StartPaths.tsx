"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The four ways into the CV section, the same on the CV home and on New CV:
 * check a document, check it against a job, build with the assistant, or start
 * from an example or template. Every path ends in the person's own document
 * in the editor.
 */
export type PathId = "check" | "job" | "assistant" | "find";

const ICONS: Record<PathId, ReactNode> = {
  check: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 15l2 2 4-4" />,
  job: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01" />,
  assistant: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12zM8.5 11h7M8.5 14h4.5" />,
  find: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
};

export const PATHS: { id: PathId; title: string; line: string; href: string }[] = [
  { id: "check", title: "Check my CV or cover letter", line: "Find the lines to fix first, with a score and software read-back.", href: "/cv/check" },
  { id: "job", title: "Check against a job", line: "See what the advert asks for and what your document shows.", href: "/cv/check?job=1" },
  { id: "assistant", title: "Build with the assistant", line: "Speak or type, one question at a time. See your page take shape.", href: "/cv/new?start=talk" },
  { id: "find", title: "Find an example or template", line: "Choose written content or a design, then make it your own.", href: "/cv/examples" },
];

function Card({ id, title, line, selected }: { id: PathId; title: string; line: string; selected?: boolean }) {
  return (
    <>
      <span className="cv-path-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="cv-ico">
          {ICONS[id]}
        </svg>
      </span>
      <span className="cv-path-words">
        <b>{title}</b>
        <small>{line}</small>
      </span>
      <span className="cv-path-arrow" aria-hidden="true">
        {selected ? "✓" : "→"}
      </span>
    </>
  );
}

/**
 * The four cards. On New CV, the assistant is chosen on the page itself
 * (`onPick`), so its card is a button; elsewhere each card is a link.
 */
export function StartPaths({ onPick, picked, label = "Start here" }: { onPick?: Partial<Record<PathId, () => void>>; picked?: PathId | null; label?: string }) {
  return (
    <section aria-labelledby="start-here">
      <h2 id="start-here" className="cv-section-title">
        {label}
      </h2>
      <ul className="cv-paths">
        {PATHS.map((p) => {
          const act = onPick?.[p.id];
          return (
            <li key={p.id}>
              {act ? (
                <button type="button" className="cv-path" aria-pressed={picked === p.id} onClick={act} data-testid={`path-${p.id}`}>
                  <Card {...p} selected={picked === p.id} />
                </button>
              ) : (
                <Link className="cv-path" href={p.href} data-testid={`path-${p.id}`}>
                  <Card {...p} />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
