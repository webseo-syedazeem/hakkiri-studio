import type { CvRegion, Entry, EntryKind, SectionKind } from "./schema";

/**
 * What each kind of section is called, which fields its entries use and the
 * rule shown beside it. The forms, the upload reader, the page layout and the
 * score all read from here, so a section means the same thing everywhere.
 */

export type EntryField = "title" | "org" | "orgInfo" | "location" | "start" | "end" | "subject" | "grade" | "link";

export interface FieldDef {
  field: EntryField;
  label: string;
  /** Shown under the field. */
  hint?: string;
  /** "year" shows a year box; "month" shows month and year. */
  date?: "month" | "year";
}

export interface SectionDef {
  kind: SectionKind;
  /** Heading on the page, by region. */
  heading: Record<CvRegion, string>;
  /** One core section of each kind is always offered; the rest are added from a menu. */
  core: boolean;
  /** For entry sections: the fields, in form order. */
  fields?: FieldDef[];
  /** What one entry is called on buttons: "Add a role". */
  entryNoun?: string;
  /** Whether entries carry bullets, and what they are for. */
  bullets?: { label: string; hint: string };
  /** The rule beside the section, as a number where there is one. */
  rule: Record<CvRegion, string>;
}

const both = (s: string): Record<CvRegion, string> => ({ uk: s, us: s });
const month = "month" as const;

export const SECTION_DEFS: Record<SectionKind, SectionDef> = {
  summary: {
    kind: "summary",
    heading: { uk: "Profile", us: "Summary" },
    core: true,
    rule: both("3 to 4 sentences, without “I”. Your job title, years of experience, three or four skills and one result. Write it last."),
  },
  experience: {
    kind: "experience",
    heading: { uk: "Experience", us: "Experience" },
    core: true,
    entryNoun: "role",
    fields: [
      { field: "title", label: "Job title" },
      { field: "org", label: "Employer" },
      { field: "orgInfo", label: "Employer context", hint: "Optional. One line: what the employer does and how big it is." },
      { field: "location", label: "Location", hint: "Town or city." },
      { field: "start", label: "Start", date: month },
      { field: "end", label: "End", date: month },
    ],
    bullets: { label: "What you did", hint: "3 to 6 bullets a role. Say what you did and what changed, with a number where you have one." },
    rule: both("Your 3 to 5 most relevant roles, about the last 10 years. Several roles at one employer are separate entries."),
  },
  education: {
    kind: "education",
    heading: both("Education"),
    core: true,
    entryNoun: "qualification",
    fields: [
      { field: "org", label: "Institution" },
      { field: "title", label: "Qualification", hint: "Such as “BSc (Hons)” or “A-Levels”." },
      { field: "subject", label: "Subject" },
      { field: "location", label: "Location" },
      { field: "start", label: "Start", date: "year" },
      { field: "end", label: "Finished", date: "year" },
      { field: "grade", label: "Grade" },
    ],
    bullets: { label: "Details", hint: "Optional: modules, dissertation, prizes. Shrink this as your experience grows." },
    rule: {
      uk: "Most recent first. Give the degree class or grade only if it helps you.",
      us: "Most recent first. Give your GPA only if it is 3.5 or above.",
    },
  },
  skills: {
    kind: "skills",
    heading: both("Skills"),
    core: true,
    rule: both("8 to 10 skills, hard skills first, grouped. Only list what you could explain in an interview."),
  },
  projects: {
    kind: "projects",
    heading: both("Projects"),
    core: false,
    entryNoun: "project",
    fields: [
      { field: "title", label: "Project name" },
      { field: "org", label: "Organisation", hint: "Optional." },
      { field: "link", label: "Link" },
      { field: "start", label: "Start", date: month },
      { field: "end", label: "End", date: month },
    ],
    bullets: { label: "What you did", hint: "2 or 3 bullets. Make your own part clear in group work." },
    rule: both("2 to 5 projects."),
  },
  volunteering: {
    kind: "volunteering",
    heading: { uk: "Volunteering", us: "Volunteer experience" },
    core: false,
    entryNoun: "role",
    fields: [
      { field: "title", label: "Role" },
      { field: "org", label: "Organisation" },
      { field: "location", label: "Location" },
      { field: "start", label: "Start", date: month },
      { field: "end", label: "End", date: month },
    ],
    bullets: { label: "What you did", hint: "1 to 3 bullets." },
    rule: both("1 to 5 entries from the last 10 years."),
  },
  certificates: {
    kind: "certificates",
    heading: { uk: "Certificates", us: "Certifications" },
    core: false,
    entryNoun: "certificate",
    fields: [
      { field: "title", label: "Name" },
      { field: "org", label: "Issuing body" },
      { field: "end", label: "Year", date: "year" },
    ],
    rule: both("Only current and relevant ones."),
  },
  awards: {
    kind: "awards",
    heading: both("Awards"),
    core: false,
    entryNoun: "award",
    fields: [
      { field: "title", label: "Award" },
      { field: "org", label: "Awarded by" },
      { field: "end", label: "Year", date: "year" },
    ],
    rule: both("Recent awards that an employer would recognise."),
  },
  publications: {
    kind: "publications",
    heading: both("Publications"),
    core: false,
    entryNoun: "publication",
    fields: [
      { field: "title", label: "Title" },
      { field: "org", label: "Publisher or journal" },
      { field: "end", label: "Year", date: "year" },
      { field: "link", label: "Link" },
    ],
    rule: both("The few most relevant to the job."),
  },
  courses: {
    kind: "courses",
    heading: { uk: "Courses", us: "Coursework" },
    core: false,
    entryNoun: "course",
    fields: [
      { field: "title", label: "Course" },
      { field: "org", label: "Provider" },
      { field: "end", label: "Year", date: "year" },
    ],
    rule: both("3 or 4 courses. Most useful for students and career changers."),
  },
  languages: { kind: "languages", heading: both("Languages"), core: false, rule: both("Each language with your level.") },
  interests: { kind: "interests", heading: both("Interests"), core: false, rule: both("A short list. Leave it out if space is tight.") },
  achievements: {
    kind: "achievements",
    heading: both("Selected achievements"),
    core: false,
    entryNoun: "group",
    fields: [{ field: "title", label: "Heading", hint: "Optional." }],
    bullets: { label: "Achievements", hint: "3 to 5 of your strongest results, each with what changed." },
    rule: both("A short list near the top for senior roles. Each one should also appear under the role it came from."),
  },
  custom: {
    kind: "custom",
    heading: both("Additional information"),
    core: false,
    entryNoun: "item",
    fields: [{ field: "title", label: "Heading", hint: "Optional." }],
    bullets: { label: "Lines", hint: "One point per line." },
    rule: both("Anything that doesn’t fit elsewhere. Keep it short."),
  },
};

export const CORE_KINDS = (Object.keys(SECTION_DEFS) as SectionKind[]).filter((k) => SECTION_DEFS[k].core);
export const OPTIONAL_KINDS = (Object.keys(SECTION_DEFS) as SectionKind[]).filter((k) => !SECTION_DEFS[k].core);

/** The heading printed for a section: the person's own, or the standard one for the region. */
export function sectionHeading(section: { kind: SectionKind; title: string }, region: CvRegion): string {
  return section.title.trim() || SECTION_DEFS[section.kind].heading[region];
}

/** What the document itself is called. */
export const docWord = (region: CvRegion) => (region === "us" ? "resume" : "CV");

/** The grade label for the region. */
export function fieldLabel(kind: EntryKind, def: FieldDef, region: CvRegion): string {
  if (kind === "education" && def.field === "grade") return region === "us" ? "GPA or honors" : "Degree class or grade";
  return def.label;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2021-03" → "Mar 2021"; "2021" → "2021". */
export function formatDate(d: string): string {
  if (!d) return "";
  const [y, m] = d.split("-");
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

/** The dates line of an entry: "Mar 2021 – Present", "2016 – 2019", "2020". */
export function formatDates(e: Pick<Entry, "start" | "end" | "current">): string {
  const start = formatDate(e.start);
  const end = e.current ? "Present" : formatDate(e.end);
  if (start && end) return start === end ? start : `${start} – ${end}`;
  return start || end;
}
