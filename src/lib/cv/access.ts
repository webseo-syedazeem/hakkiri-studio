import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require";
import { type CvDoc, CV_LEVELS, CV_REGIONS, ContactSchema, DesignSchema, ExcerptSchema, SectionSchema, TargetSchema, coreSections, emptyContact, newId } from "./schema";

/** The signed-in person's id. Throws the same 401 response as requireUser when signed out. */
export async function requireUserId(): Promise<string> {
  const user = await requireUser();
  return user.id as string;
}

/** Someone else's CV and a CV that does not exist get the same answer. */
export const notFound = (what = "CV") => NextResponse.json({ error: "not_found", message: `${what} not found.` }, { status: 404 });

export const badInput = (message: string, fields: Record<string, string> = {}) => NextResponse.json({ error: "invalid_input", message, fields }, { status: 400 });

/** Turns a thrown value into a response: the 401 from requireUser passes through; anything else is logged and hidden. */
export function failure(where: string, err: unknown, message: string) {
  if (err instanceof Response) return err;
  console.error(`[${where}]`, err);
  return NextResponse.json({ error: "server_error", message }, { status: 500 });
}

const oneLine = (max: number) => z.string().max(max * 2).transform((s) => s.replace(/\s+/g, " ").trim().slice(0, max));

/** The set-up form: what the CV is called, who it is for, and (optionally) the job it is aimed at. */
export const SetupSchema = z.object({
  name: oneLine(120).refine((s) => s.length > 0, "Give your CV a name."),
  level: z.enum(CV_LEVELS, "Choose the level that fits you best."),
  region: z.enum(CV_REGIONS, "Choose UK or US."),
  targetTitle: oneLine(160).default(""),
  targetEmployer: oneLine(160).default(""),
  targetAdvert: z.string().max(40000).default("").transform((s) => s.replace(/\r/g, "").trim().slice(0, 20000)),
});
export type Setup = z.infer<typeof SetupSchema>;

/** Field-by-field messages from a failed check, for the form to show beside each field. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * What the browser may change about a CV. The owner, the id and the dates are
 * never taken from the browser.
 */
export const EditableSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    level: z.enum(CV_LEVELS).optional(),
    region: z.enum(CV_REGIONS).optional(),
    target: TargetSchema.nullable().optional(),
    contact: ContactSchema.optional(),
    sections: z.array(SectionSchema).max(24).optional(),
    design: DesignSchema.optional(),
    accepted: z.array(oneLine(60)).max(200).optional(),
  })
  .strict();

/** Every section id in a change must be different. */
export const sectionIdsDiffer = (sections: { id: string }[] = []) => new Set(sections.map((s) => s.id)).size === sections.length;

/** What the browser may set on a saved achievement. The owner, the id and the dates are never taken from it. */
export const AchievementInput = z
  .object({
    text: oneLine(600),
    original: z.string().max(8000).default(""),
    sources: z.array(ExcerptSchema).max(8).default([]),
    role: oneLine(160).default(""),
    org: oneLine(160).default(""),
    skills: z.array(oneLine(80)).max(12).default([]),
    private: z.boolean().default(false),
  })
  .strict();

export const newCvId = () => newId("cv_").slice(0, 19);

/**
 * A new, empty CV from the set-up answers. Nothing is filled in for the
 * person: the sections are there, with nothing in them. UK CVs default to A4,
 * US resumes to Letter; a student or graduate starts with education first.
 */
export function newCv(userId: string, setup: Setup, now: string): CvDoc {
  const hasTarget = setup.targetTitle || setup.targetEmployer || setup.targetAdvert;
  return {
    id: newCvId(),
    userId,
    rev: 1,
    name: setup.name,
    kind: "base",
    level: setup.level,
    region: setup.region,
    target: hasTarget ? { title: setup.targetTitle, employer: setup.targetEmployer, advert: setup.targetAdvert } : undefined,
    contact: emptyContact(),
    sections: coreSections(setup.level),
    accepted: [],
    // One page for students, graduates and early career; up to two for experienced and senior.
    design: { template: setup.level === "student" ? "graduate" : "standard", pageSize: setup.region === "us" ? "letter" : "a4", density: "default", pageTarget: setup.level === "student" || setup.level === "early" ? 1 : 2 },
    createdAt: now,
    updatedAt: now,
  };
}
