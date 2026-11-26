"use client";

import type { CvDoc } from "@/lib/cv/schema";
import { PaperView } from "./Paper";
import { usePaper } from "./usePaper";

/** The shared page itself, drawn by the same renderer as the PDF, with nothing to edit. */
export function SharedCv({ cv, publishedAt }: { cv: CvDoc; publishedAt: string }) {
  const { paper, state, retry } = usePaper(cv);
  const word = cv.region === "us" ? "resume" : "CV";
  const name = cv.contact.fullName.trim();
  const date = new Date(publishedAt).toLocaleDateString(cv.region === "us" ? "en-US" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="cv" data-theme="light" data-testid="shared-cv">
      <h1 className="sr-only">{name ? `${name}: ${word}` : `Shared ${word}`}</h1>
      <p className="cv-small cv-muted" style={{ margin: "0 0 12px" }}>
        A read-only {word}, shared on {date}.
      </p>
      <div className="cv-surround">
        <PaperView paper={paper} state={state} retry={retry} cv={cv} focus={null} word={word} />
      </div>
    </div>
  );
}
