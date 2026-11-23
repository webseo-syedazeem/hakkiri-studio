import { type Contact, emptyContact } from "../schema";
import { findDates } from "./dates";
import { knownHeading } from "./headings";
import { PRIVATE_DETAIL, TITLE_WORD, looksLikePlace, looksLikeStreetAddress, townIn } from "./lexicon";
import { type DocLine, isAllCaps, plain, titleCase, wordCount } from "./lines";

/** Something the person should check, pointing at one place in the CV and at the lines of the file it came from. */
export interface FlagDraft {
  section: string;
  entry?: string;
  field?: string;
  code: string;
  message: string;
  lines?: number[];
}

/** Which lines of the file each field came from, keyed by "entry/field" (or just the field, for contact details). */
export type Sources = Record<string, number[]>;

export interface ContactResult {
  contact: Contact;
  /** Sentences found among the contact lines: a profile written without a heading. */
  summary: DocLine[];
  flags: FlagDraft[];
  omitted: { text: string; reason: string; line: number }[];
  sources: Sources;
}

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const TLD = "com|co\\.uk|org\\.uk|ac\\.uk|org|net|io|dev|me|uk|co|ai|app|edu|gov|info|design|tech|xyz|studio|page|site|blog|us|ca|de|fr|es|it|eu|in|au|ie|nl|se|no|ch|be|pt|nz|sg|za";
export const URL_PATTERN = new RegExp(`(?<![@\\w.-])(?:https?:\\/\\/)?(?:www\\.)?[a-z0-9][a-z0-9-]*(?:\\.[a-z0-9-]+)*\\.(?:${TLD})(?![a-z0-9-])(?:\\/[^\\s,;|<>()]*)?`, "i");
const PHONE = /(?:\+|00)?\(?\d[\d\s().\-–/]{6,20}\d(?:\s*(?:x|ext\.?)\s*\d{1,5})?/;
const LABEL = /^(?:(?:e-?mail|email address|phone|telephone|tel|mobile|mob|cell|contact(?: number)?|address|location|based in|linkedin|website|web|portfolio|github|twitter|url)\s*(?::|\.(?=\s))|[emtpawl]\s*:)\s*/i;
/** Separators between items on a contact line. */
const SPLIT = /\t|\s+[|·•●▪◦∙⋅‧]\s+|\s{2,}|\s+[–—]\s+|\s*[|•●▪◦∙⋅]\s*/;
const PRIVATE_REASON = "Personal details such as date of birth or nationality are not needed on a CV.";

/** A web address as it should be printed: no "https://", "www." or trailing slash. */
export const tidyUrl = (u: string) => u.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/[?#].*$/, "").replace(/[/.,;:)]+$/, "");

const digits = (s: string) => s.replace(/\D/g, "").length;
const NAME = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.'’-]*(?:\s+(?:[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.'’-]*|[A-Z]\.?)){1,4}(?:,\s*[A-Za-z .]{2,20})?$/;
const PARTICLE = /^(?:de|del|della|der|van|von|bin|ibn|al|el|la|le|da|dos|du|of|y|ap)$/i;

function looksLikeName(s: string): boolean {
  if (!NAME.test(s) || wordCount(s) > 5 || s.length > 50) return false;
  if (knownHeading(s) || TITLE_WORD.test(s) || looksLikePlace(s)) return false;
  // A name is capitalised: "Maya Chen" or "MAYA CHEN", allowing particles such as "de" and "van".
  return s.split(/\s+/).every((w) => /^[A-ZÀ-Þ]/.test(w) || PARTICLE.test(w));
}

/**
 * Reads the name and contact details from the lines above the first heading
 * (and any under a "Contact" heading). Each piece of text is kept as written
 * and only sorted into its box. A full postal address is cut to the town, and
 * details that do not belong on a CV (date of birth and the like) are left out
 * and reported, not silently dropped. Anything it cannot place is left for the
 * caller's lost-text check, so it reaches the person as unassigned text.
 */
export function parseContact(lines: DocLine[]): ContactResult {
  const contact = emptyContact();
  const flags: FlagDraft[] = [];
  const omitted: ContactResult["omitted"] = [];
  const summary: DocLine[] = [];
  const sources: Sources = {};
  const names: { text: string; line: DocLine }[] = [];
  const mark = (field: string, l: DocLine) => {
    if (!sources[field]?.includes(l.n)) (sources[field] ??= []).push(l.n);
  };

  const takeUrl = (raw: string, l: DocLine) => {
    const u = tidyUrl(raw);
    if (!u || contact.links.some((x) => x.toLowerCase() === u.toLowerCase())) return;
    if (contact.links.length < 4) {
      // LinkedIn first: it is the link employers look for.
      if (/linkedin\.com\//i.test(u)) contact.links.unshift(u);
      else contact.links.push(u);
      mark("links", l);
    }
  };

  lines.forEach((line, li) => {
    for (const target of line.links) {
      if (/^mailto:/i.test(target)) {
        if (!contact.email) mark("email", line);
        contact.email ||= target.replace(/^mailto:/i, "").split("?")[0];
      } else if (/^https?:/i.test(target)) takeUrl(target, line);
    }
    const whole = plain(line);
    if (PRIVATE_DETAIL.test(whole)) {
      omitted.push({ text: whole, reason: PRIVATE_REASON, line: line.n });
      return;
    }
    // A profile paragraph written above the first heading.
    if (!line.bullet && wordCount(whole) >= 14 && !EMAIL.test(whole) && !URL_PATTERN.test(whole)) {
      summary.push(line);
      return;
    }
    for (let piece of line.text.split(SPLIT)) {
      piece = piece.trim();
      if (!piece) continue;
      const labelled = piece.match(LABEL);
      const label = labelled ? labelled[0].toLowerCase() : "";
      if (labelled) piece = piece.slice(labelled[0].length).trim();
      if (!piece) continue;
      if (PRIVATE_DETAIL.test(piece)) {
        omitted.push({ text: piece, reason: PRIVATE_REASON, line: line.n });
        continue;
      }

      const email = piece.match(EMAIL);
      if (email) {
        if (!contact.email) {
          contact.email = email[0];
          mark("email", line);
        }
        piece = piece.replace(email[0], " ").trim();
      }
      let url = piece.match(URL_PATTERN);
      while (url) {
        takeUrl(url[0], line);
        piece = piece.replace(url[0], " ").replace(/\(\s*(?:linkedin|github|portfolio|website|personal|company|blog|other)?\s*\)/gi, " ").trim();
        url = piece.match(URL_PATTERN);
      }
      // A LinkedIn handle given without the site: "LinkedIn: in/maya-chen".
      if (label.startsWith("linkedin") && /^(?:in\/)?[\w-]{3,}$/.test(piece)) {
        takeUrl(`linkedin.com/in/${piece.replace(/^in\//, "")}`, line);
        continue;
      }
      const phone = piece.match(PHONE);
      if (phone && digits(phone[0]) >= 9 && digits(phone[0]) <= 15 && !findDates(phone[0]) && !/[A-Za-z]{3,}/.test(piece.replace(phone[0], "").replace(/\b(?:ext|mobile|tel|phone|cell|uk|us)\b/gi, ""))) {
        if (!contact.phone) {
          contact.phone = phone[0].trim();
          mark("phone", line);
        }
        piece = piece.replace(phone[0], " ").replace(/^[\s:–-]+|[\s:–-]+$/g, "").trim();
      }
      piece = piece.replace(/^[\s,;:()–-]+|[\s,;:(–-]+$/g, "").trim();
      if (!piece) continue;

      if (looksLikeStreetAddress(piece)) {
        const town = townIn(piece);
        if (!contact.location && town) {
          contact.location = town;
          mark("location", line);
          flags.push({ section: "contact", field: "location", code: "address", message: "We kept just the town from your address. A CV doesn’t need the full address.", lines: [line.n] });
        }
        omitted.push({ text: piece, reason: "A CV needs only your town or city, not your full address.", line: line.n });
        continue;
      }
      if (/^(?:address|location|based in)/.test(label) || looksLikePlace(piece)) {
        if (!contact.location) {
          contact.location = piece;
          mark("location", line);
          continue;
        }
        if (looksLikePlace(piece) && !contact.location.toLowerCase().includes(piece.toLowerCase()) && sources.location?.includes(line.n)) {
          contact.location = `${contact.location}, ${piece}`;
          continue;
        }
      }
      if (li < 8 && looksLikeName(piece)) names.push({ text: piece, line });
    }
  });

  // The name: a capitalised two-to-five word line near the top, preferring the largest text.
  const biggest = Math.max(0, ...names.map((t) => t.line.size));
  const nameAt = names.find((t) => t.line.size === biggest) ?? names[0];
  if (nameAt) {
    const caps = isAllCaps(nameAt.text);
    contact.fullName = caps ? titleCase(nameAt.text) : nameAt.text;
    mark("fullName", nameAt.line);
    if (caps) flags.push({ section: "contact", field: "fullName", code: "name-caps", message: "Your name was in capitals in the file. Check we’ve written it the way you do.", lines: [nameAt.line.n] });
  } else {
    flags.push({ section: "contact", field: "fullName", code: "no-name", message: "We couldn’t find your name. Please add it." });
  }
  if (!contact.email) flags.push({ section: "contact", field: "email", code: "no-email", message: "We couldn’t find an email address. Please add one." });

  return { contact, summary, flags, omitted, sources };
}
