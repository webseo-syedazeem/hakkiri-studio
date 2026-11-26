import type { CvLevel, CvRegion, Density, TemplateId } from "../schema";

/**
 * Example CVs, written once for both regions.
 *
 * A value is either the same in the UK and the US (a plain value, spelled
 * the UK way and respelled for the US by `respell`), or written for each
 * (`{ uk, us }`) where the difference is more than spelling: a job title
 * ("Staff Nurse" / "Registered Nurse"), a qualification ("2:1" / "GPA
 * 3.7"), a licence, or anything with money in it.
 *
 * Every example is fictional: the people, employers and numbers are made up
 * to show what a strong CV for the role looks like. They are labelled as
 * examples wherever they are shown.
 */
export type Regional<T> = T | { uk: T; us: T };

export type IndustryId =
  | "aviation"
  | "marketing"
  | "software"
  | "data"
  | "cyber"
  | "healthcare"
  | "care"
  | "education"
  | "finance"
  | "banking"
  | "sales"
  | "retail"
  | "hospitality"
  | "customer-service"
  | "admin"
  | "hr"
  | "legal"
  | "engineering"
  | "construction"
  | "logistics"
  | "manufacturing"
  | "projects"
  | "business"
  | "design"
  | "media"
  | "public-sector"
  | "science"
  | "energy"
  | "property"
  | "early-career";

export interface ExampleEntry {
  title: Regional<string>;
  org: Regional<string>;
  location?: Regional<string>;
  /** "2021-03" or "2021". */
  start?: string;
  end?: string;
  current?: boolean;
  subject?: Regional<string>;
  grade?: Regional<string>;
  bullets?: Regional<string>[];
}

export interface ExamplePerson {
  name: string;
  email: string;
  phone: Regional<string>;
  location: Regional<string>;
  links?: string[];
}

/**
 * A cover letter to go with the example: for a made-up job, at a made-up
 * employer, with its advert. Every sentence passes the app's own letter
 * check, so each thing it says about the person is on their CV (or in their
 * reason for applying) and each thing about the employer is in the advert.
 */
export interface ExampleLetter {
  job: { title: Regional<string>; employer: Regional<string>; advert: Regional<string> };
  /** Their answer to "Why do you want this role?". */
  reason: Regional<string>;
  /** Who it is to. Empty: "Dear Hiring Manager". */
  recipient?: Regional<string>;
  /** Three to five paragraphs: an opening, the evidence, a close. */
  paragraphs: Regional<string>[];
}

export interface ExampleSpec {
  /** Stable, used in web addresses: "first-officer". */
  id: string;
  industry: IndustryId;
  /** The job the example is for, as it is called in each region. */
  role: Regional<string>;
  level: CvLevel;
  /** The template the example is shown in first. Any template can be chosen. */
  template: TemplateId;
  /** Spacing, where the example needs it to fit its page (US Letter is shorter than A4). */
  density?: Regional<Density>;
  /** One line for the gallery card. */
  blurb: Regional<string>;
  person: ExamplePerson;
  profile: Regional<string>;
  experience: ExampleEntry[];
  education: ExampleEntry[];
  certificates?: ExampleEntry[];
  projects?: ExampleEntry[];
  volunteering?: ExampleEntry[];
  /** Eight to ten, each shown somewhere in the lines above. */
  skills: Regional<string>[];
  languages?: { name: string; level: Regional<string> }[];
  /** Names of the example's own fictional employers and products, so the spelling check knows them. */
  names?: string[];
  letter?: ExampleLetter;
}

export const REGIONS: CvRegion[] = ["uk", "us"];
