import { fernCv } from "../render/testing";
import { type CvDoc, type EntrySection, type Letter, type Locator, emptyLetter } from "../schema";
import { extractRequirements } from "../tailor/requirements";

/** A job advert for the sample CV: used by the letter's tests only. */
export const ADVERT = `Collections Officer
Lantern Atlas, York

About us
We are a small museum of maps with big plans. We offer 28 days holiday and a pension.

The role
You will catalogue new acquisitions and answer enquiries from researchers.

Essential
- Experience cataloguing paper collections
- Knowledge of condition reporting
- Experience training volunteers
- A degree in history or equivalent experience

Desirable
- Experience with Spectrum
- Fluent French`;

export const REASON = "I've loved maps since I was a child, and I want to work somewhere that opens its collection to the public.";
export const NOW = new Date("2026-11-23T12:00:00Z");

export const experience = (cv: Pick<CvDoc, "sections">) => cv.sections.find((s) => s.kind === "experience") as EntrySection;
/** Points at a bullet of the experience section: role `r`, line `b`. */
export const lineAt = (cv: Pick<CvDoc, "sections">, r: number, b: number): Locator => {
  const exp = experience(cv);
  return { section: exp.id, entry: exp.entries[r].id, field: exp.entries[r].bullets[b].id };
};

/** The sample CV, tailored to the advert, with a letter's inputs filled in and nothing drafted yet. */
export function letterCv(letter: Partial<Letter> = {}, region: "uk" | "us" = "uk"): CvDoc {
  const base = fernCv({}, region) as CvDoc;
  return {
    ...base,
    id: "cv_0000000000000001",
    userId: "usr_test",
    rev: 1,
    name: "Fern – Lantern Atlas",
    kind: "tailored",
    accepted: [],
    changes: [],
    requirements: extractRequirements(ADVERT),
    target: { title: "Collections officer", employer: "Lantern Atlas", advert: ADVERT },
    letter: { ...emptyLetter(), reason: REASON, evidence: [lineAt(base, 0, 1), lineAt(base, 1, 1)], ...letter },
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
  };
}
