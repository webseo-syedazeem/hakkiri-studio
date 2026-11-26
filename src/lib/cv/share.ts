import crypto from "node:crypto";
import { z } from "zod";
import { CV_LEVELS, CV_REGIONS, ContactSchema, type CvDoc, DesignSchema, SectionSchema, sectionIsEmpty } from "./schema";

/**
 * A read-only link to a CV. Off until the person turns it on. It shows the CV
 * as it was when it was shared, not the working draft: sharing again is a
 * choice the person makes. The token is random and says nothing about the
 * person or the CV; turning sharing off deletes it, and the link stops working
 * at once. What is shared is what is on the page and nothing else: no job
 * advert, no notes, no letter, no record of where a line came from, nothing
 * that is switched off.
 */

export const SHARE_TOKEN = /^[A-Za-z0-9_-]{32}$/;
export const isShareToken = (t: unknown): t is string => typeof t === "string" && SHARE_TOKEN.test(t);
export const newShareToken = () => crypto.randomBytes(24).toString("base64url");

export const SharedCvSchema = z.object({
  level: z.enum(CV_LEVELS),
  region: z.enum(CV_REGIONS),
  contact: ContactSchema,
  sections: z.array(SectionSchema).max(24),
  design: DesignSchema,
});
export type SharedCv = z.infer<typeof SharedCvSchema>;

export const ShareSchema = z.object({
  id: z.string().regex(SHARE_TOKEN),
  userId: z.string().min(1),
  versionId: z.string().min(1),
  /** The revision of the CV that was shared. */
  rev: z.number().int().min(1),
  cv: SharedCvSchema,
  /** When this revision was shared. */
  publishedAt: z.string(),
  createdAt: z.string(),
});
export type Share = z.infer<typeof ShareSchema>;

/** Only what is on the page: sections, entries, lines, skills and items that are switched off are left out. */
export function shareable(cv: Pick<CvDoc, "level" | "region" | "contact" | "sections" | "design">): SharedCv {
  const sections = cv.sections
    .filter((s) => s.visible && !sectionIsEmpty(s))
    .map((s) => {
      if (s.kind === "summary") return s;
      if (s.kind === "skills") return { ...s, groups: s.groups.filter((g) => g.visible).map((g) => ({ ...g, skills: g.skills.filter((k) => k.visible) })) };
      if ("entries" in s) return { ...s, entries: s.entries.filter((e) => e.visible).map((e) => ({ ...e, bullets: e.bullets.filter((b) => b.visible).map(({ bankId: _bank, ...b }) => ({ ...b, sources: [] })) })) };
      return { ...s, items: s.items.filter((i) => i.visible) };
    });
  return SharedCvSchema.parse({ level: cv.level, region: cv.region, contact: cv.contact, sections, design: { ...cv.design, fileName: "" } });
}

/** The shared CV as a document the paper can be drawn from. It carries nothing that was not shared. */
export function sharedDoc(share: Pick<Share, "rev" | "cv" | "publishedAt">): CvDoc {
  return {
    id: "shared",
    userId: "",
    rev: share.rev,
    name: "",
    kind: "base",
    level: share.cv.level,
    region: share.cv.region,
    contact: share.cv.contact,
    sections: share.cv.sections,
    design: share.cv.design,
    accepted: [],
    requirements: [],
    changes: [],
    createdAt: share.publishedAt,
    updatedAt: share.publishedAt,
  };
}
