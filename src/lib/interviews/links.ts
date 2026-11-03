/**
 * Reading a company website or a job link for interview set-up.
 * Pages are fetched by the app's server (on your computer), turned into
 * plain text, and only that text is used. Job pages often carry the posting
 * as structured data (schema.org JobPosting), which is read first because
 * it's cleaner than the page around it.
 */

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const MAX_LINK_TEXT = 15_000;

/** True for addresses on this computer or a private network (IPv4 and IPv6). */
export function isPrivateAddress(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) return /^(0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|22[4-9]\.|2[3-5]\d\.)/.test(ip);
  if (v === 6) {
    const a = ip.toLowerCase();
    if (a === "::1" || a === "::") return true;
    if (a.startsWith("::ffff:")) return isPrivateAddress(a.slice(7));
    return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(a);
  }
  return true;
}

/** Looks the host up and refuses it if any address it points to is private (e.g. a name made to point at 127.0.0.1). */
async function publicHost(url: URL): Promise<boolean> {
  try {
    const addrs = await lookup(url.hostname, { all: true });
    return addrs.length > 0 && addrs.every((a) => !isPrivateAddress(a.address));
  } catch {
    return false;
  }
}

/** Reads at most `max` bytes of a reply, so a huge page can't fill the server's memory. */
async function readCapped(res: Response, max: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < max) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  const all = new Uint8Array(Math.min(size, max));
  let at = 0;
  for (const c of chunks) {
    const part = c.subarray(0, Math.max(0, all.length - at));
    all.set(part, at);
    at += part.byteLength;
  }
  return new TextDecoder().decode(all);
}

/** "halden.com/careers" → https URL. Only public http(s) addresses; never this computer or a private network. */
export function normaliseUrl(input: string): URL | null {
  const raw = input.trim();
  if (!raw || /\s/.test(raw)) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  if (!host.includes(".") || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return null;
  if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) || host.startsWith("[") || /^\d+$/.test(host)) return null;
  return url;
}

/** "https://www.halden.com/about" → "halden.com" */
export function displayHost(url: URL | string): string {
  const u = typeof url === "string" ? normaliseUrl(url) : url;
  return u ? u.hostname.replace(/^www\./, "") : String(url);
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…", pound: "£", euro: "€" };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Readable text from HTML: no scripts, styles or navigation chrome; one line per block. */
export function htmlToText(html: string): string {
  const body = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe|head)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(nav|footer)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|li|h[1-6]|tr|ul|ol|header|main|dd|dt|blockquote)>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(body)
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 1)
    .filter((l, i, all) => all.indexOf(l) === i) // menus repeat
    .join("\n");
}

export function pageTitle(html: string): string | null {
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return t ? decodeEntities(t).replace(/\s+/g, " ").trim() || null : null;
}

export function metaDescription(html: string): string | null {
  const m = html.match(/<meta[^>]+(?:name|property)=["'](?:og:)?description["'][^>]*>/i)?.[0];
  const c = m?.match(/content=["']([^"']*)["']/i)?.[1];
  return c ? decodeEntities(c).trim() || null : null;
}

export interface JobPosting {
  title: string | null;
  company: string | null;
  description: string;
}

/** The job posting a page declares for search engines (schema.org JobPosting), if any. */
export function jobPostingFrom(html: string): JobPosting | null {
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let data: unknown;
    try {
      data = JSON.parse(m[1].trim());
    } catch {
      continue;
    }
    const items = (Array.isArray(data) ? data : [data, ...(((data as { "@graph"?: unknown[] })?.["@graph"]) ?? [])]) as Record<string, unknown>[];
    const job = items.find((x) => x && (x["@type"] === "JobPosting" || (Array.isArray(x["@type"]) && (x["@type"] as string[]).includes("JobPosting"))));
    if (!job || typeof job.description !== "string") continue;
    const org = job.hiringOrganization as { name?: string } | string | undefined;
    return {
      title: typeof job.title === "string" ? decodeEntities(job.title).trim() : null,
      company: typeof org === "string" ? org : (org?.name ?? null),
      description: htmlToText(decodeEntities(job.description)),
    };
  }
  return null;
}

export const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

export type LinkResult =
  | { ok: true; url: string; host: string; title: string | null; text: string; words: number; job: { title: string | null; company: string | null } | null }
  | { ok: false; message: string };

/** Fetches a page and returns its readable text. Never throws. */
export async function readLink(input: string, kind: "company" | "job"): Promise<LinkResult> {
  const url = normaliseUrl(input);
  if (!url) return { ok: false, message: "That doesn’t look like a web address. Try something like halden.com." };
  // Redirects are followed one at a time, and every stop must be a public address.
  const get = async (start: URL) => {
    let u: URL | null = start;
    for (let hop = 0; hop < 5 && u; hop++) {
      if (!(await publicHost(u))) throw new Error("private address");
      const res: Response = await fetch(u, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; HakkiriStudio/0.1; interview practice)", accept: "text/html,application/xhtml+xml,text/plain;q=0.9" },
        redirect: "manual",
        signal: AbortSignal.timeout(10_000),
      });
      if (res.status >= 300 && res.status < 400) {
        const to = res.headers.get("location");
        await res.body?.cancel().catch(() => {});
        u = to ? normaliseUrl(new URL(to, u).toString()) : null;
        continue;
      }
      if (!res.ok) throw new Error(`status ${res.status}`);
      const type = res.headers.get("content-type") ?? "";
      if (!/html|text\/plain/.test(type)) throw new Error(`type ${type}`);
      return readCapped(res, 2_000_000);
    }
    throw new Error("too many redirects");
  };
  try {
    const html = await get(url);
    const posting = kind === "job" ? jobPostingFrom(html) : null;
    let text = posting?.description ?? htmlToText(html);
    const description = metaDescription(html);
    if (description && !text.includes(description)) text = `${description}\n${text}`;
    // A thin homepage: try the About page too.
    if (kind === "company" && wordCount(text) < 150) {
      for (const path of ["/about", "/about-us"]) {
        try {
          const more = htmlToText(await get(new URL(path, url.origin)));
          if (wordCount(more) > 60) {
            text = `${text}\n${more}`;
            break;
          }
        } catch {
          // no About page; carry on with what there is
        }
      }
    }
    text = text.slice(0, MAX_LINK_TEXT);
    const words = wordCount(text);
    if (words < (kind === "job" ? 80 : 30)) {
      return {
        ok: false,
        message:
          kind === "job"
            ? "That page didn’t have a readable job description (some job sites need a login or block apps). Paste the job description instead."
            : "That site didn’t have much readable text. Hakkiri will use the job spec to learn about the company instead.",
      };
    }
    return { ok: true, url: url.toString(), host: displayHost(url), title: posting?.title ?? pageTitle(html), text, words, job: posting ? { title: posting.title, company: posting.company } : null };
  } catch (err) {
    const why = err instanceof Error ? err.message : "";
    return {
      ok: false,
      message:
        kind === "company"
          ? /status 404/.test(why)
            ? "That page wasn’t found. Check the address, or leave it out: Hakkiri will use the job spec instead."
            : "Couldn’t read that site (some block apps). Check the address, or leave it out: Hakkiri will use the job spec instead."
          : /status 40[13]|status 429/.test(why)
            ? "That job site blocks apps from reading it. Paste the job description instead."
            : /status 404/.test(why)
              ? "That page wasn’t found. Check the link."
              : "Couldn’t reach that page. Check the link, or paste the job description instead.",
    };
  }
}
