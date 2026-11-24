import { NextResponse } from "next/server";
import { z } from "zod";
import { badInput, failure, notFound, requireUserId } from "@/lib/cv/access";
import { draftLetter, shortenParagraph } from "@/lib/cv/letter/assist";
import { letterIsEmpty, reviewLetter } from "@/lib/cv/letter/check";
import { isoDate } from "@/lib/cv/letter/flow";
import { evidenceLines, sameAt } from "@/lib/cv/letter/sources";
import { type PrivateLine, privateInLetter, privateLines, privateMessage, withoutPrivate } from "@/lib/cv/privacy";
import { type ExportFormat, exportLetter } from "@/lib/cv/render/server";
import { type CvDoc, cvIsEmpty, newId } from "@/lib/cv/schema";
import { getOwnCv, listOwnAchievements, saveExport } from "@/lib/cv/store";
import { writingMode } from "@/lib/cv/write/assist";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string; tool: string }> };

const DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
/** The date to print when the letter has none of its own: the person's own "today" if their browser sent it, else the server's. */
const todayFrom = (url: URL, now: Date) => {
  const sent = url.searchParams.get("today") ?? "";
  return DAY.test(sent) ? sent : isoDate(now);
};

/** Why a letter cannot be made into a file yet, or null when it can. */
function held(cv: CvDoc, withCv: boolean, now: Date, kept: PrivateLine[]): { status: number; body: Record<string, unknown> } | null {
  if (letterIsEmpty(cv.letter)) return { status: 409, body: { error: "empty", message: "There is no letter to download yet." } };
  if (withCv && cvIsEmpty(cv)) return { status: 409, body: { error: "empty", message: "The CV has nothing in it yet, so it can’t go in the same file." } };
  // A line from an achievement marked private stays out of what is sent: in the letter, and in the CV when it goes in the same file.
  const lines = withCv ? kept : privateInLetter(cv, kept, now);
  if (lines.length) return { status: 409, body: { error: "private", message: privateMessage(lines, withCv ? "letter and CV" : "letter"), lines } };
  const review = reviewLetter(cv, now);
  if (review.open.length) {
    const n = review.open.length;
    return {
      status: 409,
      body: {
        error: "unsourced",
        message: `${n === 1 ? "One sentence needs" : `${n} sentences need`} a source before this letter can be downloaded.`,
        sentences: review.open.map((s) => ({ id: s.sentenceId, text: s.text, state: s.state, problems: s.problems.map((p) => p.say) })),
      },
    };
  }
  return null;
}

/**
 * POST /api/cv/versions/[id]/letter/draft: a draft of the letter from the
 * reason, the chosen lines and the advert saved with this version. Nothing is
 * written here: taking the draft is an ordinary save from the letter screen.
 *
 * POST …/letter/shorten { paragraphId }: a shorter wording of one paragraph
 * that keeps its sources, when the AI service can give one.
 *
 * POST …/letter/check: makes the PDF and the Word file of the letter (with
 * `?with=cv`, the letter followed by the CV), reads each back and says whether
 * it matches.
 */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id, tool } = await params;
    const cv = await getOwnCv(id, userId);
    if (!cv) return notFound();
    const now = new Date();
    const url = new URL(req.url);

    if (tool === "check") {
      const limited = guard(req, "read");
      if (limited) return limited;
      const withCv = url.searchParams.get("with") === "cv";
      const stop = held(cv, withCv, now, privateLines(cv, await listOwnAchievements(userId)));
      if (stop) return NextResponse.json(stop.body, { status: stop.status });
      const results: Record<string, unknown> = {};
      for (const format of ["pdf", "docx"] as const) {
        try {
          const out = await exportLetter(cv, format, { withCv, now, today: todayFrom(url, now) });
          results[format] = out.check
            ? { status: out.check.status, name: out.name, pages: out.pages, words: out.check.words, missing: out.check.missing, unexpected: out.check.unexpected, unsupported: out.missing, size: out.bytes.length }
            : { status: "failed", made: true, name: out.name };
        } catch (err) {
          console.error(`[api/cv letter check] ${format} failed:`, err);
          results[format] = { status: "failed" };
        }
      }
      return NextResponse.json({ rev: cv.rev, withCv, checkedAt: now.toISOString(), ...results });
    }

    if (tool !== "draft" && tool !== "shorten") return notFound("Tool");
    const limited = guard(req, "ai", { userId });
    if (limited) return limited;
    setUsageContext({ userId, feature: "cv writing" });

    if (tool === "draft") {
      const letter = cv.letter;
      const fields: Record<string, string> = {};
      if (!letter || letter.reason.split(/\s+/).filter(Boolean).length < 5) fields.reason = "Say why you want this role, in a sentence or two. The letter opens with it.";
      const lines = evidenceLines(withoutPrivate(cv, await listOwnAchievements(userId)), now);
      if (!letter?.evidence.some((at) => lines.some((l) => sameAt(l.at, at)))) fields.evidence = "Choose one or two lines of your CV for the letter to use.";
      if (!cv.target?.title.trim() && !cv.target?.employer.trim()) fields.job = "Say which job this letter is for.";
      if (Object.keys(fields).length) return badInput("A letter needs your reason and at least one line of your CV.", fields);
      // A line from an achievement marked private is not something a letter may be drafted from.
      return NextResponse.json({ ...(await draftLetter(withoutPrivate(cv, await listOwnAchievements(userId)), now)), mode: writingMode() });
    }

    const body = z.object({ paragraphId: z.string().max(40) }).strict().safeParse(await req.json().catch(() => null));
    const paragraph = body.success ? cv.letter?.paragraphs.find((p) => p.id === body.data.paragraphId) : undefined;
    if (!paragraph) return badInput("That paragraph could not be found.");
    const sentences = await shortenParagraph(cv, paragraph, now);
    return NextResponse.json({ sentences, mode: writingMode() });
  } catch (err) {
    return failure("api/cv/versions/[id]/letter POST", err, "The letter could not be worked on.");
  }
}

/**
 * GET /api/cv/versions/[id]/letter/export?format=pdf|docx[&with=cv]: the
 * letter as a file, on its own or followed by the CV.
 *
 * A letter with a sentence that has no source is not made into a file. The
 * file is read straight back and compared with the letter, exactly as a CV
 * is: only a file that says what the letter says is sent, and a record of the
 * download is kept with the letter, the CV and the advert as they were.
 */
export async function GET(req: Request, { params }: Ctx) {
  const limited = guard(req, "read");
  if (limited) return limited;
  try {
    const userId = await requireUserId();
    const { id, tool } = await params;
    const cv = await getOwnCv(id, userId);
    if (!cv) return notFound();
    if (tool !== "export") return notFound("Tool");
    const url = new URL(req.url);
    const format = url.searchParams.get("format") as ExportFormat | null;
    if (format !== "pdf" && format !== "docx") return NextResponse.json({ error: "invalid_input", message: "Choose PDF or Word." }, { status: 400 });
    const withCv = url.searchParams.get("with") === "cv";
    const now = new Date();
    const stop = held(cv, withCv, now, privateLines(cv, await listOwnAchievements(userId)));
    if (stop) return NextResponse.json(stop.body, { status: stop.status });
    // The date is fixed here, so the record can make the same file again.
    const letter = { ...cv.letter!, date: cv.letter!.date || todayFrom(url, now) };
    const dated = { ...cv, letter };
    const out = await exportLetter(dated, format, { withCv, now });
    const remember = async (checked: boolean) => {
      const exportId = newId("exp_").slice(0, 20);
      await saveExport({ id: exportId, userId, versionId: cv.id, rev: cv.rev, format, what: withCv ? "both" : "letter", name: out.name, at: now.toISOString(), checked, pages: out.pages, cv: { name: cv.name, level: cv.level, region: cv.region, target: cv.target, contact: cv.contact, sections: cv.sections, design: cv.design, letter } });
      return exportId;
    };
    const headers = { ...out.headers, "x-cv-pages": String(out.pages), "x-cv-letter-pages": String(out.letterPages), "x-cv-rev": String(cv.rev) };
    if (!out.check) {
      if (url.searchParams.get("unchecked") !== "1") return NextResponse.json({ error: "check_failed", message: "The file was made, but it could not be read back to check it." }, { status: 503 });
      return new Response(out.bytes as unknown as BodyInit, { headers: { ...headers, "x-cv-check": "unchecked", "x-cv-export": await remember(false) } });
    }
    if (out.check.status !== "checked") {
      return NextResponse.json({ error: "loss", message: "The file did not read back the same as your letter, so it has not been sent.", check: out.check, unsupported: out.missing }, { status: 409 });
    }
    return new Response(out.bytes as unknown as BodyInit, { headers: { ...headers, "x-cv-check": "checked", "x-cv-export": await remember(true) } });
  } catch (err) {
    return failure("api/cv/versions/[id]/letter GET", err, "The file could not be made.");
  }
}
