import { z } from "zod";

/* --------------------------------------------------------------------------
   PEOPLE & PROFILE SCHEMAS
-------------------------------------------------------------------------- */

export const LeadSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstAuditId: z.string(),
  consent: z.object({
    marketing: z.boolean().default(false),
    at: z.string(),
    wording: z.string(),
    version: z.string(),
  }),
  userId: z.string().optional(),
  magicTokenHash: z.string().optional(),
  magicExpiresAt: z.string().optional(),
  source: z.string().default("audit"),
  utm: z.record(z.string(), z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const ScreeningFactsSchema = z.object({
  rightToWork: z.string().default("Yes"),
  noticePeriod: z.string().default("1 month"),
  salaryMin: z.number().default(50000),
  salaryCurrency: z.string().default("GBP"),
  relocate: z.boolean().default(false),
  remote: z.enum(["any", "remote", "hybrid", "onsite"]).default("hybrid"),
  visaNeeded: z.boolean().default(false),
  custom: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
});
export type ScreeningFacts = z.infer<typeof ScreeningFactsSchema>;

export const ProfileRoleBulletSchema = z.object({
  id: z.string(),
  text: z.string(),
  evidenceIds: z.array(z.string()).default([]),
});
export type ProfileRoleBullet = z.infer<typeof ProfileRoleBulletSchema>;

export const ProfileRoleSchema = z.object({
  id: z.string(),
  title: z.string(),
  employer: z.string(),
  location: z.string().default(""),
  start: z.string(),
  end: z.string().default("Present"),
  current: z.boolean().default(false),
  bullets: z.array(ProfileRoleBulletSchema).default([]),
});
export type ProfileRole = z.infer<typeof ProfileRoleSchema>;

export const ProfileEducationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  qualification: z.string(),
  grade: z.string().optional(),
  start: z.string(),
  end: z.string(),
});
export type ProfileEducation = z.infer<typeof ProfileEducationSchema>;

export const ProfileSkillSchema = z.object({
  name: z.string(),
  group: z.string().default("Core"),
  evidenceIds: z.array(z.string()).default([]),
});
export type ProfileSkill = z.infer<typeof ProfileSkillSchema>;

export const ProfileExtraSchema = z.object({
  kind: z.string(),
  title: z.string(),
  detail: z.string().default(""),
});
export type ProfileExtra = z.infer<typeof ProfileExtraSchema>;

export const ProfileSchema = z.object({
  userId: z.string(),
  region: z.enum(["uk", "us"]).default("uk"),
  contact: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().default(""),
    location: z.string().default(""),
    links: z.array(z.string()).default([]),
  }),
  headline: z.string().default(""),
  summary: z.string().default(""),
  roles: z.array(ProfileRoleSchema).default([]),
  education: z.array(ProfileEducationSchema).default([]),
  skills: z.array(ProfileSkillSchema).default([]),
  extras: z.array(ProfileExtraSchema).default([]),
  screening: ScreeningFactsSchema.default({
    rightToWork: "Yes",
    noticePeriod: "1 month",
    salaryMin: 50000,
    salaryCurrency: "GBP",
    relocate: false,
    remote: "hybrid",
    visaNeeded: false,
    custom: [],
  }),
  sourceCvText: z.string().optional(),
  completeness: z.number().default(70),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const VoiceSchema = z.object({
  userId: z.string(),
  samples: z.array(z.object({
    id: z.string(),
    text: z.string(),
    kind: z.string(),
    addedAt: z.string(),
  })).default([]),
  measured: z.object({
    sentenceMean: z.number().default(14),
    sentenceSpread: z.number().default(4),
    formality: z.number().min(1).max(5).default(3),
    contractions: z.boolean().default(true),
    firstPerson: z.boolean().default(true),
    spelling: z.enum(["uk", "us"]).default("uk"),
    opens: z.array(z.string()).default(["Direct", "Context-first"]),
    closes: z.array(z.string()).default(["Action-oriented"]),
  }).default({
    sentenceMean: 14,
    sentenceSpread: 4,
    formality: 3,
    contractions: true,
    firstPerson: true,
    spelling: "uk",
    opens: ["Direct", "Context-first"],
    closes: ["Action-oriented"],
  }),
  signature: z.array(z.string()).default([]),
  never: z.array(z.string()).default(["passionate", "synergy", "spearheaded", "utilize", "rockstar"]),
  learnedFromEdits: z.array(z.object({
    from: z.string(),
    to: z.string(),
    count: z.number().default(1),
  })).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Voice = z.infer<typeof VoiceSchema>;

export const EvidenceSourceKind = z.enum(["cv-bullet", "story", "typed-note", "spoken-note", "practice-answer"]);
export type EvidenceSourceKind = z.infer<typeof EvidenceSourceKind>;

export const EvidenceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  text: z.string(),
  numbers: z.array(z.string()).default([]),
  skillTags: z.array(z.string()).default([]),
  sourceKind: EvidenceSourceKind.default("typed-note"),
  sourceRef: z.string().optional(),
  confirmed: z.boolean().default(true),
  transcript: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

/* --------------------------------------------------------------------------
   DOCUMENT SCHEMAS (AUDITS, CVS, OUTPUTS)
-------------------------------------------------------------------------- */

export const FindingAreaSchema = z.enum(["evidence", "clarity", "structure", "software", "fit"]);
export const SeveritySchema = z.enum(["high", "medium", "low"]);

export const FindingSchema = z.object({
  id: z.string(),
  area: FindingAreaSchema,
  severity: SeveritySchema,
  quote: z.string(),
  problem: z.string(),
  fix: z.string(),
});
export type Finding = z.infer<typeof FindingSchema>;

export const InterviewerQuestionSchema = z.object({
  id: z.string(),
  quote: z.string(),
  question: z.string(),
  practiceTheme: z.string().optional(),
});
export type InterviewerQuestion = z.infer<typeof InterviewerQuestionSchema>;

export const AuditSchema = z.object({
  id: z.string(),
  docType: z.enum(["cv", "cover", "both"]).default("cv"),
  textHash: z.string(),
  text: z.string(),
  jobText: z.string().optional(),
  score: z.number().min(0).max(100),
  subscores: z.object({
    evidence: z.number().default(0),
    clarity: z.number().default(0),
    structure: z.number().default(0),
    software: z.number().default(0),
    fit: z.number().optional(),
  }),
  findings: z.array(FindingSchema).default([]),
  teaser: z.array(z.string()).default([]),
  interviewerQuestions: z.array(InterviewerQuestionSchema).default([]),
  unlockedBy: z.string().optional(),
  userId: z.string().optional(),
  region: z.enum(["uk", "us"]).default("uk"),
  expiresAt: z.string(),
  modelVersion: z.string().default("rubric-v2"),
  rubricVersion: z.string().default("2026.1"),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Audit = z.infer<typeof AuditSchema>;

export const CvSectionSchema = z.object({
  type: z.string(),
  order: z.number(),
  visible: z.boolean().default(true),
  itemIds: z.array(z.string()).optional(),
  text: z.string().optional(),
});
export type CvSection = z.infer<typeof CvSectionSchema>;

export const CvBulletSchema = z.object({
  id: z.string(),
  roleId: z.string(),
  text: z.string(),
  evidenceIds: z.array(z.string()).default([]),
  origin: z.enum(["person", "ai", "ai-edited"]).default("person"),
  visible: z.boolean().default(true),
});
export type CvBullet = z.infer<typeof CvBulletSchema>;

export const CvSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().default("Main Professional CV"),
  kind: z.enum(["base", "tailored"]).default("base"),
  applicationId: z.string().optional(),
  parentCvId: z.string().optional(),
  templateId: z.enum(["standard", "graduate"]).default("standard"),
  sections: z.array(CvSectionSchema).default([]),
  bullets: z.array(CvBulletSchema).default([]),
  score: z.object({
    total: z.number().default(75),
    parts: z.record(z.string(), z.number()).default({}),
    at: z.string().default(""),
  }).default({
    total: 75,
    parts: {},
    at: "",
  }),
  keywordCoverage: z.object({
    covered: z.array(z.string()).default([]),
    missing: z.array(z.string()).default([]),
    unsupported: z.array(z.string()).default([]),
  }).optional(),
  lockedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Cv = z.infer<typeof CvSchema>;

export const OutputSentenceSchema = z.object({
  text: z.string(),
  evidenceIds: z.array(z.string()).default([]),
  isConnective: z.boolean().default(false),
});
export type OutputSentence = z.infer<typeof OutputSentenceSchema>;

export const OutputUnsupportedSchema = z.object({
  text: z.string(),
  reason: z.string(),
});
export type OutputUnsupported = z.infer<typeof OutputUnsupportedSchema>;

export const OutputVersionSchema = z.object({
  id: z.string(),
  text: z.string(),
  notes: z.string().optional(),
  transcript: z.string().optional(),
  instruction: z.string().optional(),
  sentences: z.array(OutputSentenceSchema).default([]),
  unsupported: z.array(OutputUnsupportedSchema).default([]),
  voiceScore: z.number().default(85),
  banned: z.array(z.string()).default([]),
  createdAt: z.string(),
});
export type OutputVersion = z.infer<typeof OutputVersionSchema>;

export const OutputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  applicationId: z.string(),
  kind: z.enum(["letter", "answer", "statement", "note"]),
  questionId: z.string().optional(),
  versions: z.array(OutputVersionSchema).default([]),
  currentVersionId: z.string(),
  lockedVersionId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;

/* --------------------------------------------------------------------------
   JOBS & APPLICATIONS SCHEMAS
-------------------------------------------------------------------------- */

export const JobRequirementSchema = z.object({
  id: z.string(),
  text: z.string(),
  kind: z.enum(["must", "nice"]).default("must"),
  group: z.enum(["skill", "experience", "qualification", "trait"]).default("skill"),
  sourceQuote: z.string().default(""),
});
export type JobRequirement = z.infer<typeof JobRequirementSchema>;

export const JobQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  limit: z.number().optional(),
  unit: z.enum(["words", "chars"]).default("words"),
});
export type JobQuestion = z.infer<typeof JobQuestionSchema>;

export const JobSchema = z.object({
  id: z.string(),
  source: z.enum(["paste", "link", "extension", "feed"]).default("paste"),
  feedId: z.string().optional(),
  url: z.string().optional(),
  title: z.string(),
  employer: z.string(),
  location: z.string().default("Remote / Hybrid"),
  remote: z.boolean().default(true),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default("GBP"),
    period: z.enum(["yearly", "monthly", "hourly"]).default("yearly"),
  }).optional(),
  postedAt: z.string().optional(),
  closesAt: z.string().optional(),
  text: z.string(),
  applicationSystem: z.string().optional(),
  applyUrl: z.string().optional(),
  applyRoute: z.enum(["open-form", "account", "email", "pack", "not-automated", "unknown"]).default("open-form"),
  requirements: z.array(JobRequirementSchema).default([]),
  keywords: z.array(z.string()).default([]),
  questions: z.array(JobQuestionSchema).default([]),
  tone: z.enum(["formal", "neutral", "informal"]).default("neutral"),
  dedupeKey: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Job = z.infer<typeof JobSchema>;

export const MatchSchema = z.object({
  id: z.string(),
  userId: z.string(),
  jobId: z.string(),
  fit: z.number().min(0).max(100),
  reasons: z.array(z.string()).default([]),
  missing: z.array(z.string()).default([]),
  state: z.enum(["new", "saved", "dismissed", "queued"]).default("new"),
  seenAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Match = z.infer<typeof MatchSchema>;

export const ApplicationGapItemSchema = z.object({
  requirementId: z.string(),
  strength: z.enum(["strong", "partial", "none"]).default("partial"),
  evidenceIds: z.array(z.string()).default([]),
  note: z.string().optional(),
});
export type ApplicationGapItem = z.infer<typeof ApplicationGapItemSchema>;

export const ApplicationStatus = z.enum([
  "draft",
  "ready",
  "queued",
  "sending",
  "sent",
  "failed",
  "screen",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatus>;

export const ApplicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  jobId: z.string(),
  status: ApplicationStatus.default("draft"),
  gapMap: z.array(ApplicationGapItemSchema).default([]),
  fit: z.number().default(75),
  cvId: z.string().optional(),
  letterOutputId: z.string().optional(),
  answerOutputIds: z.array(z.string()).default([]),
  mode: z.enum(["manual", "assisted", "approved", "hands-off"]).default("approved"),
  approvedAt: z.string().optional(),
  sentAt: z.string().optional(),
  interviewId: z.string().optional(),
  stages: z.array(z.object({
    name: z.string(),
    date: z.string().optional(),
    outcome: z.string().optional(),
  })).default([]),
  notes: z.string().default(""),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Application = z.infer<typeof ApplicationSchema>;

export const SendFieldSchema = z.object({
  label: z.string(),
  value: z.string(),
  source: z.string(),
  filled: z.boolean().default(true),
});
export type SendField = z.infer<typeof SendFieldSchema>;

export const SendLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  applicationId: z.string(),
  adapter: z.string().default("greenhouse"),
  startedAt: z.string(),
  finishedAt: z.string().optional(),
  result: z.enum(["sent", "stopped", "failed"]).default("sent"),
  fields: z.array(SendFieldSchema).default([]),
  stoppedAt: z.object({ label: z.string(), reason: z.string() }).optional(),
  confirmation: z.object({ text: z.string(), url: z.string().optional() }).optional(),
  cvSnapshotId: z.string().optional(),
  extensionVersion: z.string().default("1.0.0"),
  createdAt: z.string(),
});
export type SendLog = z.infer<typeof SendLogSchema>;

export const ApplySettingsSchema = z.object({
  userId: z.string(),
  titles: z.array(z.string()).max(8).default(["Product Manager", "Lead Developer", "Operations Specialist"]),
  locations: z.array(z.string()).default(["London", "UK Remote"]),
  remote: z.boolean().default(true),
  salaryMin: z.number().default(60000),
  excludeEmployers: z.array(z.string()).default([]),
  minFit: z.number().min(60).max(90).default(75),
  dailyCap: z.number().min(1).max(10).default(3),
  perEmployerCap: z.number().default(2),
  handsOff: z.boolean().default(false),
  handsOffConfirmedAt: z.string().optional(),
  pausedAt: z.string().optional(),
  lastActiveCheckAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApplySettings = z.infer<typeof ApplySettingsSchema>;
