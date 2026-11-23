import type { CvDoc } from "../schema";

/** Characters a file name cannot hold on Windows, macOS or the web, and control characters. */
const BAD = /[<>:"/\\|?*\u0000-\u001f\u007f]/g;

/** A single piece of a file name: unsafe characters out, spaces tidied, no leading or trailing dots. */
export function cleanNamePart(s: string): string {
  return s.replace(BAD, " ").replace(/\s+/g, " ").replace(/^[\s.]+|[\s.]+$/g, "").slice(0, 80);
}

/**
 * The name a downloaded file is given: "[Name] - [Role] - CV", with "Resume"
 * for the US, "Cover Letter" for a letter and "Cover Letter and CV" for
 * the two in one file. Parts that are empty are left
 * out. If the person has typed their own file name, that is used instead.
 */
export function fileBaseName(cv: Pick<CvDoc, "contact" | "target" | "region" | "design">, kind: "cv" | "letter" | "both" = "cv"): string {
  const own = cleanNamePart(cv.design.fileName ?? "");
  if (own && kind === "cv") return own;
  const doc = cv.region === "us" ? "Resume" : "CV";
  const word = kind === "letter" ? "Cover Letter" : kind === "both" ? `Cover Letter and ${doc}` : doc;
  return [cleanNamePart(cv.contact.fullName), cleanNamePart(cv.target?.title ?? ""), word].filter(Boolean).join(" - ");
}

export const fileName = (cv: Parameters<typeof fileBaseName>[0], format: "pdf" | "docx", kind: "cv" | "letter" | "both" = "cv") => `${fileBaseName(cv, kind)}.${format}`;

/** The Content-Disposition header for a download: a plain-ASCII name for old browsers and the real one for the rest. */
export function contentDisposition(name: string): string {
  const ascii = name.normalize("NFKD").replace(/[^\x20-\x7e]/g, "").replace(/["\\]/g, "") || "download";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}
