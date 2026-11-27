import nspell from "nspell";
import ukDictionary from "dictionary-en-gb";
import usDictionary from "dictionary-en";
import { aiTells } from "@/lib/cv/agent/style";
import { type CvDoc, type CvRegion, cvStrings, isEntrySection } from "@/lib/cv/schema";
import { doubledWords, firstPerson, unexplainedAcronyms, wrongRegionSpelling } from "@/lib/cv/score/detect";
import { type Score, scoreCv } from "@/lib/cv/score/score";
import { writeDocx } from "@/lib/cv/render/docx";
import { layoutCv } from "@/lib/cv/render/layout";
import { writePdf } from "@/lib/cv/render/pdf";
import { readBackDocx, readBackPdf } from "@/lib/cv/render/readback";
import { loadAllFonts } from "@/lib/cv/render/testing";

/**
 * The bar every CV the app ships (example CVs, industry examples, sample
 * content in the template gallery) must clear before it is shown to anyone:
 * spelled correctly for its region (real UK and US dictionaries), no
 * spelling from the other region, plain grammar, no AI-sounding words, no
 * "I", no unexplained abbreviations, and the app's own CV score good enough
 * to apply with. Test-only: the dictionaries are development dependencies.
 */

const spell = { uk: nspell(ukDictionary), us: nspell(usDictionary) };

/**
 * Words a general dictionary doesn't know that are correct on a CV: names of
 * tools, standards, qualifications and the fictional people and employers in
 * the examples. Kept short and reviewed: a word only goes here when it is
 * spelled the way its owner spells it.
 */
export const LEXICON = new Set(
  `
  agile ansible api apis aws azure bigquery bootstrap ci cd cms crm css datadog dbt devops django docker
  dynamodb elasticsearch etl figma firebase gcp git github gitlab graphql grafana hadoop hubspot html hris
  javascript jenkins jira json jest kafka kanban kotlin kpi kpis kubernetes linux looker mailchimp microservices
  mongodb mysql nextjs nginx nodejs nosql okr okrs onboarding powerbi postgres postgresql prometheus pytorch
  python redis redux salesforce sass scikit seo serverless sharepoint slack snowflake splunk sql ssis tableau
  terraform tensorflow typescript ui ux vue webpack workday xero zendesk saas fintech healthtech edtech
  b2b b2c roi ctr cpc cpa ppc ga4 crm semrush ahrefs hootsuite canva wordpress shopify gdpr iso nhs nmc cqc
  epr ehr emis systmone dbs qts sen sendco senco pgce gcse gcses ofsted acca aca cima cfa cpa frs ifrs gaap
  vba sap oracle netsuite quickbooks sage excel powerpoint outlook xlookup vlookup pivot siem soc nist cissp
  ceh oscp comptia owasp pentest pentesting mitre splunk crowdstrike wireshark nessus burp sentinel defender
  sso mfa iam vpn ec2 s3 lambda rds eks gke aks cloudformation helm argocd jenkinsfile prometheus pagerduty
  sre sla slas mttr cicd rest restful grpc webhooks backend frontend fullstack microservice
  bsc msc ba ma js uptime readmissions linkedin visio cyber diem endpoints codebase codebases schemas rollout
  lifecycle scalable repo runbook runbooks roadmap roadmaps subnet airside airframe powerplant upselling
  renewables cybersecurity virtualisation virtualization prioritisation prioritization
  `.split(/\s+/).filter(Boolean),
);

/** "pre-op", "co-led", "non-urgent": a prefix before a hyphen is not a word of its own. */
const PREFIXES = new Set(["pre", "post", "co", "re", "non", "multi", "cross", "sub", "inter", "intra", "semi", "anti", "mid", "self", "e"]);
const WORD = /[\p{L}][\p{L}'’-]*[\p{L}]|[\p{L}]/gu;

/** Words not in the region's dictionary (or the lexicon), each once. */
export function misspelled(texts: string[], region: CvRegion, extra: Iterable<string> = []): string[] {
  const allowed = new Set([...LEXICON, ...[...extra].map((w) => w.toLowerCase())]);
  const out = new Set<string>();
  for (const text of texts) {
    // Links, email addresses and file names are not words.
    const clean = text.replace(/\S+@\S+|\b(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|org|io|dev|co\.uk|uk|net)(?:\/\S*)?/gi, " ");
    for (const m of clean.matchAll(WORD)) {
      // "18th", "2nd": the letters after a number are part of it.
      if (m.index && /\d/.test(clean[m.index - 1])) continue;
      const whole = m[0].replace(/[’']s$/i, "");
      if (whole.includes("-") && (allowed.has(whole.toLowerCase()) || spell[region].correct(whole) || spell[region].correct(whole.toLowerCase()))) continue;
      for (const part of whole.split("-").filter((p, i, all) => !(i < all.length - 1 && PREFIXES.has(p.toLowerCase())))) {
        const w = part.replace(/[’']/g, "'");
        if (!w || allowed.has(w.toLowerCase())) continue;
        // An abbreviation in capitals is judged by the abbreviation check, not the dictionary.
        if (/^[A-Z0-9]{2,}s?$/.test(w)) continue;
        if (spell[region].correct(w) || spell[region].correct(w.toLowerCase())) continue;
        out.add(w);
      }
    }
  }
  return [...out];
}

const VOWEL_SOUND_LETTERS = /^[AEFHILMNORSX][A-Z0-9]*$/; // an MBA, an SQL… (said "em", "ess"…)
const AN_EXCEPTIONS = /^(?:hour|hours|honest|honour|honor|heir|herb)/i;
const A_EXCEPTIONS = /^(?:one|once|uni|use|user|usual|euro|eu\b|union|unique|unit|united|universal|university|utility|ui\b|ux\b|us\b)/i;

/** Grammar slips a rule can catch: a doubled word, "a" or "an" before the wrong sound, spacing, a lower-case "i". */
export function grammarSlips(texts: string[]): string[] {
  const out: string[] = [];
  for (const t of texts) {
    const d = doubledWords(t);
    if (d) out.push(`doubled word “${d.text}” in “${t.slice(0, 60)}”`);
    for (const m of t.matchAll(/\b(a|an)\s+([\p{L}\d][\p{L}\d'’-]*)/giu)) {
      const [, article, next] = m;
      const acronym = /^[A-Z0-9]{2,}$/.test(next) && !/^\d/.test(next);
      // A figure goes by how it is said: "an 8-week" (eight), "an 11-month" (eleven), "an 18-month", "a 100-day".
      const vowelSound = /^\d/.test(next) ? /^8|^1[18](?![\d.])/.test(next) : acronym ? VOWEL_SOUND_LETTERS.test(next) : (/^[aeiou]/i.test(next) && !A_EXCEPTIONS.test(next)) || AN_EXCEPTIONS.test(next);
      if (article.toLowerCase() === "a" && vowelSound) out.push(`“a ${next}” should be “an ${next}”`);
      if (article.toLowerCase() === "an" && !vowelSound) out.push(`“an ${next}” should be “a ${next}”`);
    }
    if (/ {2,}/.test(t)) out.push(`double space in “${t.slice(0, 60)}”`);
    if (/\s[,.;:!?]/.test(t)) out.push(`space before punctuation in “${t.slice(0, 60)}”`);
    if (/[,;:](?=[\p{L}])/u.test(t.replace(/https?:\/\/\S+/g, ""))) out.push(`no space after punctuation in “${t.slice(0, 60)}”`);
    if (/(?<![\p{L}'’])i(?![\p{L}'’])/u.test(t)) out.push(`lower-case “i” in “${t.slice(0, 60)}”`);
  }
  return out;
}

const fonts = loadAllFonts();

/** The CV score as the builder shows it once the page is laid out and both files have been made and read back. */
export async function fullScore(cv: CvDoc, now: Date): Promise<{ score: Score; pages: number; pdf: string; docx: string }> {
  const { layout, flow, style } = layoutCv(cv, fonts);
  // As the export does: a design with text beside text (TEMPLATES-v3) is read back in the order it was written.
  const pdf = await readBackPdf(writePdf(layout, flow, fonts, { title: flow.title, lang: flow.lang, created: now }), flow, { inWrittenOrder: !!style.template.grid });
  const docx = await readBackDocx(await writeDocx(flow, style, { title: flow.title, lang: flow.lang, created: now }), flow);
  const score = scoreCv({ cv, pages: layout.pages, missingGlyphs: layout.missing, files: { pdf: pdf.status, docx: docx.status }, now });
  return { score, pages: layout.pages, pdf: pdf.status, docx: docx.status };
}

export interface Audit {
  spelling: string[];
  otherRegion: string[];
  grammar: string[];
  aiWords: string[];
  firstPerson: string[];
  acronyms: string[];
  bulletEnds: string[];
  score: number;
  goodEnough: boolean;
  pages: number;
  files: string;
  issues: string[];
  suggestions: string[];
  missing: string[];
}

/** Everything wrong with a CV by the standard above. A clean CV has every list empty and goodEnough true. */
export async function audit(cv: CvDoc, now = new Date("2026-11-26T12:00:00Z"), extra: Iterable<string> = []): Promise<Audit> {
  const texts = cvStrings(cv);
  const lines = cv.sections.flatMap((s) => (isEntrySection(s) ? s.entries.flatMap((e) => e.bullets.map((b) => b.text)) : []));
  const prose = cv.sections.flatMap((s) => (s.kind === "summary" ? [s.text] : []));
  const { score, pages, pdf, docx } = await fullScore(cv, now);
  return {
    spelling: misspelled(texts, cv.region, extra),
    otherRegion: texts.flatMap((t) => wrongRegionSpelling(t, cv.region, cv.accepted).map((h) => `${h.text} → ${h.suggest}`)),
    grammar: grammarSlips(texts),
    aiWords: [...new Set(texts.flatMap(aiTells))],
    firstPerson: [...lines, ...prose].flatMap((t) => (firstPerson(t) ? [`“${firstPerson(t)!.text}” in “${t.slice(0, 60)}”`] : [])),
    acronyms: unexplainedAcronyms([...lines, ...prose], cv.accepted).map((a) => a.hit.text),
    bulletEnds: lines.filter((l) => /[.;,]\s*$/.test(l)).map((l) => l.slice(-40)),
    score: score.shown,
    goodEnough: score.goodEnough,
    pages,
    files: pdf === "checked" && docx === "checked" ? "" : `pdf ${pdf}, docx ${docx}`,
    issues: score.findings.filter((f) => f.severity === "issue").map((f) => `${f.rule}: ${f.excerpt.slice(0, 50)} (${f.reason.slice(0, 80)})`),
    suggestions: score.findings.filter((f) => f.severity === "suggestion").map((f) => `${f.rule}: ${f.excerpt.slice(0, 40)}`),
    missing: score.missing,
  };
}
