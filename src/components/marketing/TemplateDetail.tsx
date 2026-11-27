import Link from "next/link";
import { FAMILIES } from "@/lib/cv/render/fonts";
import { ACCENTS, FAMILY_NAMES, GALLERIES, type GalleryKind, type TemplateDef, COLUMNS_NOTE, catalogue, templateLabel, templatePreview, templateSlug } from "@/lib/cv/render/templates";
import { templateWords } from "@/lib/cv/templates/gallery";

/** One template: a large preview, what it suits, what it's made of, and the way into the builder with it. */
export function TemplateDetail({ t, kind }: { t: TemplateDef; kind: GalleryKind }) {
  const { word, base, title, region } = GALLERIES[kind];
  const letter = kind === "letter";
  const words = templateWords(t, region);
  const others = catalogue().filter((x) => x.family === t.family && x.id !== t.id);
  const fontsBase = t.fonts.heading === t.fonts.body ? FAMILIES[t.fonts.heading] : `${FAMILIES[t.fonts.heading]} headings, ${FAMILIES[t.fonts.body]} text`;
  const fonts = t.titleFont && t.titleFont !== t.fonts.heading ? `${FAMILIES[t.titleFont]} name, ${fontsBase}` : fontsBase;
  const colour = region === "us" ? "color" : "colour";
  return (
    <div className="w-full bg-[#fafbfc]">
      <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600">
          <Link href={base} className="font-medium text-[#3d4bd8] hover:underline">
            {title}
          </Link>{" "}
          / <span aria-current="page">{templateLabel(t)}</span>
        </nav>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={templatePreview(t, "large", kind)} alt={`${templateLabel(t)}: an example ${word}, drawn exactly as the download is`} width={1098} height={1552} className="block h-auto w-full" />
          </div>
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{FAMILY_NAMES[t.family]}</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {templateLabel(t)} {word} template
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-700">Good for: {words.suits.charAt(0).toLowerCase() + words.suits.slice(1)}.</p>
              {t.grid && !letter && (
                <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-700" data-testid="columns-note">
                  {COLUMNS_NOTE}
                </p>
              )}
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="font-semibold text-slate-900">Fonts</dt>
              <dd className="text-slate-700">{fonts}</dd>
              <dt className="font-semibold text-slate-900">{region === "us" ? "Color" : "Colour"}</dt>
              <dd className="text-slate-700">
                <span aria-hidden="true" className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ background: ACCENTS[t.accent].hex }} />
                {ACCENTS[t.accent].name}, or any of 12 others, or your own
              </dd>
              <dt className="font-semibold text-slate-900">Style</dt>
              <dd className="text-slate-700">{words.tags.join(", ")}</dd>
              <dt className="font-semibold text-slate-900">Paper</dt>
              <dd className="text-slate-700">{letter ? "A4 or US Letter, one page" : `${region === "us" ? "US Letter" : "A4"}, one or two pages`}</dd>
            </dl>
            {letter ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Matches the {templateLabel(t)} CV template: the same name, fonts, {colour} and spacing, so the two look like a pair.</li>
                <li>Every sentence is checked against your CV and the job advert, so the letter never claims anything your CV doesn’t.</li>
                <li>Download as PDF or Word, on its own or with your CV in one file. Both are read back before you get them.</li>
              </ul>
            ) : (
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>{t.grid && !letter ? "Real text with standard headings, written in reading order: the side column is read after the main text." : "One column of real text with standard headings, read the same way by screening software and people."}</li>
                <li>Download as PDF or Word. Both files are read back before you get them, to check nothing is lost.</li>
                <li>Change the fonts, {colour}, name size, bullets, dividers, spacing and indents, or save your look to use again.</li>
              </ul>
            )}
            <div className="flex flex-wrap gap-3">
              <Link href={`/cv/new?template=${t.id}`} className="inline-flex min-h-[48px] items-center rounded-full bg-[#3d4bd8] px-6 text-base font-semibold text-white hover:bg-[#2e3ab8] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3d4bd8]">
                Use this template
              </Link>
              <Link href={letter ? `/cv-templates/${templateSlug(t)}` : base} className="inline-flex min-h-[48px] items-center rounded-full border border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 hover:border-slate-400">
                {letter ? "See the matching CV" : "See all templates"}
              </Link>
            </div>
            {letter && <p className="text-sm text-slate-600">A cover letter is written from your CV, so you start with the CV in this design. The letter is a click away once it has your experience in it.</p>}
            {!letter && (
              <p className="text-sm text-slate-600">
                Writing a cover letter too?{" "}
                <Link href={`/cover-letter-templates/${templateSlug(t)}`} className="font-medium text-[#3d4bd8] underline">
                  See the matching cover letter
                </Link>
                .
              </p>
            )}
          </div>
        </div>
        {others.length > 0 && (
          <section className="mt-12" aria-labelledby="more">
            <h2 id="more" className="mb-4 text-xl font-bold text-slate-900">
              More {FAMILY_NAMES[t.family].toLowerCase()} templates
            </h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {others.map((o) => (
                <li key={o.id}>
                  <Link href={`${base}/${templateSlug(o)}`} className="block rounded-xl border border-slate-200 bg-white p-2 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4bd8]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={templatePreview(o, "small", kind)} alt="" width={550} height={777} loading="lazy" className="block h-auto w-full rounded" />
                    <span className="mt-2 block text-sm font-semibold text-slate-900">{templateLabel(o)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
