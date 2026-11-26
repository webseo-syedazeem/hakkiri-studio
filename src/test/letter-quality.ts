import { reviewLetter } from "@/lib/cv/letter/check";
import { layoutLetter, letterFit } from "@/lib/cv/letter/flow";
import { aiTells } from "@/lib/cv/agent/style";
import { readBackDocx, readBackPdf } from "@/lib/cv/render/readback";
import { writeDocx } from "@/lib/cv/render/docx";
import { writePdf } from "@/lib/cv/render/pdf";
import { loadAllFonts } from "@/lib/cv/render/testing";
import { wrongRegionSpelling } from "@/lib/cv/score/detect";
import type { CvDoc } from "@/lib/cv/schema";
import { grammarSlips, misspelled } from "./cv-quality";

/**
 * The bar for an example cover letter, on top of the CV's own: every sentence
 * passes the app's letter check (what it says about the person is on their CV
 * or in their reason, what it says about the employer is in the advert),
 * spelled for its region, plain grammar, no AI-sounding words, one page, a
 * length a recruiter reads (200 to 400 words), and both files read back word
 * for word.
 */
export interface LetterAudit {
  unsupported: string[];
  spelling: string[];
  otherRegion: string[];
  grammar: string[];
  aiWords: string[];
  words: number;
  pages: number;
  files: string;
}

const fonts = loadAllFonts();

export async function auditLetter(cv: CvDoc, now = new Date("2026-11-26T12:00:00Z"), extra: Iterable<string> = []): Promise<LetterAudit> {
  const review = reviewLetter(cv, now);
  const texts = (cv.letter?.paragraphs ?? []).flatMap((p) => p.sentences.map((s) => s.text));
  const { flow, layout, style } = layoutLetter(cv, fonts, "2026-11-26");
  const info = { title: flow.title, lang: flow.lang, created: now };
  const pdf = await readBackPdf(writePdf(layout, flow, fonts, info), flow);
  const docx = await readBackDocx(await writeDocx(flow, style, info), flow);
  return {
    unsupported: review.open.map((s) => `${s.text.slice(0, 70)} → ${s.problems.map((p) => p.say).join(" ").slice(0, 160)}`),
    spelling: misspelled(texts, cv.region, extra),
    otherRegion: texts.flatMap((t) => wrongRegionSpelling(t, cv.region, cv.accepted).filter((h) => !h.isTypo).map((h) => `${h.text} → ${h.suggest}`)),
    grammar: grammarSlips(texts),
    aiWords: [...new Set(texts.flatMap(aiTells))],
    words: review.words,
    pages: letterFit(layout).pages,
    files: pdf.status === "checked" && docx.status === "checked" ? "" : `pdf ${pdf.status}, docx ${docx.status}`,
  };
}
