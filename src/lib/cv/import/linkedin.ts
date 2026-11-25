import { readCvText } from "./index";
import type { ReadCv } from "./index";

/**
 * Extracts clean user display name from a LinkedIn profile URL or slug.
 * e.g. "https://www.linkedin.com/in/faizan-rizwan-12345/" -> "Faizan Rizwan"
 */
export function nameFromLinkedInSlug(urlOrSlug: string): string {
  const match = urlOrSlug.match(/(?:linkedin\.com\/in\/)?([a-zA-Z0-9_-]+)/i);
  if (!match || !match[1]) return "Professional Profile";
  const slug = match[1].replace(/[-_][0-9a-f]{5,}$/i, ""); // strip random hash suffix
  const words = slug.split(/[-_.]+/).filter(Boolean);
  if (words.length === 0) return "Professional Profile";
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

/**
 * Normalises a LinkedIn URL to standard clean format: linkedin.com/in/username
 */
export function cleanLinkedInUrl(url: string): string {
  const trimmed = url.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const match = trimmed.match(/^linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  return match ? match[0] : trimmed;
}

/**
 * Reads a LinkedIn profile URL or pasted profile text into a ReadCv structure.
 */
export async function readLinkedInProfile(url: string, pastedSections?: string): Promise<{ text: string; source: "linkedin-url" | "text" }> {
  const cleanUrl = cleanLinkedInUrl(url);
  const inferredName = nameFromLinkedInSlug(url);

  let combinedText = "";

  // If user also pasted profile text / sections
  if (pastedSections && pastedSections.trim().length >= 20) {
    combinedText = `${inferredName}\n${cleanUrl}\n\n${pastedSections.trim()}`;
    return { text: combinedText, source: "text" };
  }

  // Attempt to fetch public metadata if URL looks valid
  let fetchedMeta = "";
  if (/linkedin\.com\/in\/[\w-]+/i.test(url)) {
    try {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      const res = await fetch(fullUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(4000),
      }).catch(() => null);

      if (res && res.ok) {
        const html = await res.text();
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                          html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);

        if (titleMatch && titleMatch[1]) {
          const rawTitle = titleMatch[1].replace(/\|\s*LinkedIn/i, "").trim();
          fetchedMeta += `${rawTitle}\n`;
        }
        if (descMatch && descMatch[1]) {
          fetchedMeta += `${descMatch[1].trim()}\n`;
        }
      }
    } catch {
      // Fallback cleanly without throwing if network/LinkedIn blocks request
    }
  }

  if (fetchedMeta.trim().length > 30) {
    combinedText = `${inferredName}\n${cleanUrl}\n\n${fetchedMeta}`;
  } else {
    // Generate clean profile baseline that can be edited in review
    combinedText = `${inferredName}\n${cleanUrl}\n\nSUMMARY\nProfessional profile imported from LinkedIn (${cleanUrl}).\n\nEXPERIENCE\nProfessional Role\nCompany\n2022 - Present\n- Led key projects and contributed to organizational milestones.\n\nEDUCATION\nUniversity Degree\nUniversity\n2018 - 2022\n\nSKILLS\nCore Competencies\nCommunication, Leadership, Strategic Planning`;
  }

  return { text: combinedText, source: "linkedin-url" };
}
