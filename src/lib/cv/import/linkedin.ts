/**
 * "Import from LinkedIn", honestly. LinkedIn does not allow its profile pages
 * to be read by other sites, and a profile page fetched from a server is a
 * sign-in wall, so nothing is fetched. The person gives us their profile in
 * one of the two ways LinkedIn itself supports: the PDF from "More, then Save
 * to PDF" (read like any upload), or the text of their profile, pasted here.
 * Nothing is filled in for them: a profile we could not read is said to be so.
 */

/** The profile link as a short contact link ("linkedin.com/in/name"), or "" when it is not a LinkedIn profile link. */
export function cleanLinkedInUrl(url: string): string {
  const trimmed = url.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const match = trimmed.match(/^(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[\p{L}\p{N}_%-]+/iu);
  return match ? match[0].replace(/^[a-z]{2,3}\.(?=linkedin\.com)/i, "") : "";
}

/** Fewest characters of pasted profile worth reading: about one line of a role. */
export const LINKEDIN_TEXT_MIN = 40;

/**
 * The text to read for a LinkedIn import: what the person pasted, with their
 * profile link on its own line so it is read as a contact link. Null when
 * nothing was pasted, so the person is asked for the PDF or the text.
 */
export function linkedInText(url: string, pasted: string): string | null {
  const text = pasted.trim();
  if (text.length < LINKEDIN_TEXT_MIN) return null;
  const link = cleanLinkedInUrl(url);
  return link && !text.toLowerCase().includes(link.toLowerCase()) ? `${link}\n\n${text}` : text;
}

export const LINKEDIN_HOW =
  "We don’t read LinkedIn pages directly. In LinkedIn, open your profile, choose More, then Save to PDF, and upload that file. Or copy your About, Experience and Education sections and paste them here.";
