import { exampleCv, exampleSections, pick } from "@/lib/cv/examples/build";
import { EXAMPLES, exampleById } from "@/lib/cv/examples/index";
import { industryById } from "@/lib/cv/examples/industries";
import type { ExampleSpec } from "@/lib/cv/examples/types";
import { type CvDoc, type CvLevel, type CvRegion, LEVEL_LABELS, type Section } from "@/lib/cv/schema";

/**
 * The example CVs as the gallery and the "Start from an example" option list
 * them. The examples themselves live in `lib/cv/examples`, written once for
 * the UK and the US and checked in both (see `examples.test.ts`); this file
 * only shapes them for the screens.
 */
export interface ExampleTemplate {
  id: string;
  title: string;
  role: string;
  level: CvLevel;
  region: CvRegion;
  /** Both: every example has a UK CV and a US resume. */
  regions: CvRegion[];
  category: string;
  badge: string;
  description: string;
  summary: string;
  stats: {
    experienceYears: string;
    skillsCount: number;
    rolesCount: number;
  };
  getSections: () => Section[];
  /** The example's cover letter, as it reads on the page. */
  letter?: { job: string; employer: string; greeting: string; paragraphs: string[]; signoff: string; name: string };
}

/** Years from the earliest job to now, as "9+ years". */
function years(spec: ExampleSpec, now = new Date()): string {
  if (spec.level === "student") return "Student";
  const starts = spec.experience.map((e) => e.start).filter((s): s is string => !!s).sort();
  if (!starts.length) return "New";
  const n = now.getFullYear() - Number(starts[0].slice(0, 4));
  return `${n}+ years`;
}

/** The examples, worded for one region. */
export function examplesFor(region: CvRegion): ExampleTemplate[] {
  return EXAMPLES.map((spec) => ({
    id: spec.id,
    title: pick(spec.role, region),
    role: pick(spec.role, region),
    level: spec.level,
    region,
    regions: ["uk", "us"],
    category: pick(industryById(spec.industry).name, region),
    badge: LEVEL_LABELS[spec.level],
    description: pick(spec.blurb, region),
    summary: pick(spec.profile, region),
    stats: { experienceYears: years(spec), skillsCount: spec.skills.length, rolesCount: spec.experience.length },
    getSections: () => exampleSections(spec, region),
    letter: spec.letter && {
      job: pick(spec.letter.job.title, region),
      employer: pick(spec.letter.job.employer, region),
      greeting: `Dear ${spec.letter.recipient ? pick(spec.letter.recipient, region) : "Hiring Manager"},`,
      paragraphs: spec.letter.paragraphs.map((p) => pick(p, region)),
      // The usual sign-off for the region and the greeting, as the letter screen uses.
      signoff: region === "us" ? "Sincerely," : spec.letter.recipient ? "Yours sincerely," : "Yours faithfully,",
      name: spec.person.name,
    },
  }));
}

/** The UK wording. Pick a region with `examplesFor`. */
export const EXAMPLE_TEMPLATES: ExampleTemplate[] = examplesFor("uk");

/** A CV of the person's own, made from an example in the region they chose; with its cover letter, and the job that is for, when asked. */
export function instantiateTemplate(template: Pick<ExampleTemplate, "id" | "title" | "region">, userId: string, customName?: string, region?: CvRegion, opts: { letter?: boolean } = {}): CvDoc {
  const spec = exampleById(template.id);
  if (!spec) throw new Error(`No example called ${template.id}`);
  const r = region ?? template.region;
  return exampleCv(spec, r, userId, customName || `${pick(spec.role, r)} (Example)`, new Date(), opts);
}
