import { type LetterScore, scoreLetter } from "../letter/score";
import type { CvDoc, CvRegion } from "../schema";
import { type Band, band } from "../score/band";
import { type GroupId, scoreCv } from "../score/score";
import { jobFit } from "../tailor/fit";
import { extractRequirements } from "../tailor/requirements";
import type { DocCheck, FileRead, LetterRead } from "./record";

/**
 * The report for one check: the CV's score with its findings and how
 * software read it, the cover letter's own score and checks, and how much of
 * the job advert the CV shows. Worked out from what was checked, every time
 * the report is opened: nothing in it is stored text that could go stale.
 */

export type { Band } from "../score/band";

export interface CvFinding {
  id: string;
  severity: "issue" | "suggestion";
  part: GroupId;
  /** The exact words it is about. */
  quote: string;
  why: string;
  todo: string;
}
export interface CvReport {
  shown: number;
  band: Band;
  parts: { id: GroupId; name: string; points: number; earned: number; pending: number }[];
  findings: CvFinding[];
  /** What software read from the uploaded file. Null when the text was pasted: nothing about a file was checked. */
  read: FileRead | null;
  /** Too little to score: how many lines say what was done, and how many a CV needs. */
  thin: { have: number; need: number } | null;
  missing: string[];
}
export interface JobRow {
  requirement: string;
  /** The advert's own line. */
  quote: string;
  priority: "required" | "preferred";
  status: "Shown" | "Partly shown" | "Missing";
  /** The CV line that shows it, as written. Null: no evidence found. */
  evidence: string | null;
  note: string;
}
export interface JobReport {
  title: string;
  employer: string;
  total: number;
  shown: number;
  partly: number;
  missing: number;
  /** Required counts twice, preferred once; partly shown counts half. Null when nothing could be assessed. */
  score: number | null;
  rows: JobRow[];
}
export interface CheckReport {
  docType: DocCheck["docType"];
  region: CvRegion;
  cv: CvReport | null;
  letter: (LetterScore & { band: Band; read: LetterRead | null }) | null;
  job: JobReport | null;
  /** The advert was given but no requirements could be found in it. */
  noRequirements: boolean;
}

/** The job's title and employer from the top of an advert, when it starts with them. */
export function advertHeading(advert: string): { title: string; employer: string } {
  const lines = advert.split("\n").map((l) => l.trim()).filter(Boolean);
  const sentence = (s: string) => s.length > 80 || s.split(/\s+/).length > 10 || (/[.!?]$/.test(s) && s.split(/\s+/).length > 6);
  const first = sentence(lines[0] ?? "") ? "" : (lines[0] ?? "").replace(/[:.]$/, "");
  const title = first;
  const second = lines[1] ?? "";
  const employer = title && second && !sentence(second) && second.length <= 80 ? (second.split(/\s*(?:,|\||\s[-–—]\s|\()\s*/)[0] ?? "").trim() : "";
  return { title, employer: /\p{L}/u.test(employer) ? employer : "" };
}

const STATUS: Record<"met" | "partly" | "missing", JobRow["status"]> = { met: "Shown", partly: "Partly shown", missing: "Missing" };

export function checkReport(check: DocCheck, now = new Date()): CheckReport {
  const region = check.region;
  const advert = check.jobText.trim();
  const requirements = advert ? extractRequirements(advert) : [];
  const heading = advert ? advertHeading(advert) : { title: "", employer: "" };
  const target = advert ? { title: heading.title, employer: heading.employer, advert } : undefined;

  let cv: CvReport | null = null;
  let job: JobReport | null = null;
  if (check.docType !== "cover" && check.cv) {
    const doc: Pick<CvDoc, "contact" | "sections" | "design" | "region" | "level" | "target" | "accepted" | "requirements"> = {
      contact: check.cv.contact,
      sections: check.cv.sections,
      design: { template: "standard", pageSize: region === "us" ? "letter" : "a4", density: "default", pageTarget: 2 },
      region,
      level: "experienced",
      target,
      accepted: [],
      requirements,
    };
    // The file was not made here, so how it is laid out is not known: those checks are left as not checked.
    const score = scoreCv({ cv: doc, now, ownFile: false });
    const findings = score.findings
      .filter((f) => f.fix !== "files" && f.rule !== "page-count" && f.at.section !== "finish")
      .map((f, i) => ({ id: `${f.rule}-${i + 1}`, severity: f.severity, part: f.group, quote: f.excerpt, why: f.reason, todo: f.action }));
    cv = {
      shown: score.shown,
      band: band(score.shown),
      parts: score.groups.map((g) => ({ id: g.id, name: g.name, points: g.points, earned: g.earned, pending: g.pending })),
      findings,
      read: check.cvRead ?? null,
      thin: score.thin,
      missing: score.missing,
    };
    if (requirements.length) {
      const fit = jobFit(doc);
      job = {
        title: heading.title,
        employer: heading.employer,
        total: fit.rows.length,
        shown: fit.counts.met,
        partly: fit.counts.partly,
        missing: fit.counts.missing,
        score: fit.score,
        rows: fit.rows.map((r) => ({
          requirement: r.requirement.text,
          quote: r.requirement.quote,
          priority: r.requirement.priority === "required" ? "required" : "preferred",
          status: STATUS[r.status],
          evidence: r.lines[0]?.text ?? null,
          note: r.note,
        })),
      };
    }
  }

  let letter: CheckReport["letter"] = null;
  if (check.docType !== "cv" && check.letterText.trim()) {
    const s = scoreLetter(check.letterText, { region, cvText: check.docType === "both" ? check.cvText : undefined, advert: advert || undefined, now });
    letter = { ...s, band: band(s.shown), read: check.letterRead ?? null };
  }
  return { docType: check.docType, region, cv, letter, job, noRequirements: !!advert && !requirements.length };
}
