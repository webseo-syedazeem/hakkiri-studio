import Link from "next/link";
import { exampleCv, pick, pickList } from "@/lib/cv/examples/build";
import { EXAMPLES } from "@/lib/cv/examples/index";
import { INDUSTRIES, industryById } from "@/lib/cv/examples/industries";
import type { ExampleSpec } from "@/lib/cv/examples/types";
import { longDate } from "@/lib/cv/letter/flow";
import { type CvDoc, type CvRegion, LEVEL_LABELS, isEntrySection, isListSection } from "@/lib/cv/schema";
import { formatDates, sectionHeading } from "@/lib/cv/sections";

/** The UK pages say CV, the US pages resume. */
export const EXAMPLE_PAGES: Record<CvRegion, { word: string; base: string; other: string; title: string }> = {
  uk: { word: "CV", base: "/cv-examples", other: "/resume-examples", title: "CV examples" },
  us: { word: "resume", base: "/resume-examples", other: "/cv-examples", title: "Resume examples" },
};

const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";

/** The example as a person would read the page: name and contact, then each section in order. */
function CvText({ cv }: { cv: CvDoc }) {
  const c = cv.contact;
  return (
    <article aria-label={`${c.fullName}: example ${cv.region === "us" ? "resume" : "CV"}`} className={`${card} p-6 text-[15px] leading-relaxed text-slate-800 sm:p-10`}>
      <p className="text-2xl font-bold text-slate-900">{c.fullName}</p>
      <p className="mt-1 text-sm text-slate-600">{[c.location, c.email, c.phone, ...c.links].filter(Boolean).join(" · ")}</p>
      {cv.sections.map((s) => (
        <section key={s.id} className="mt-6">
          <h3 className="border-b border-slate-200 pb-1 text-sm font-bold uppercase tracking-wide text-slate-900">{sectionHeading(s, cv.region)}</h3>
          {s.kind === "summary" && <p className="mt-2">{s.text}</p>}
          {s.kind === "skills" && <p className="mt-2">{s.groups.flatMap((g) => g.skills.map((k) => k.name)).join(", ")}</p>}
          {isListSection(s) && <p className="mt-2">{s.items.map((i) => (i.level ? `${i.name} (${i.level})` : i.name)).join(", ")}</p>}
          {isEntrySection(s) &&
            s.entries.map((e) => (
              <div key={e.id} className="mt-3">
                <p className="font-semibold text-slate-900">{[e.title, e.subject && e.subject !== e.title ? e.subject : "", e.org].filter(Boolean).join(" · ")}</p>
                <p className="text-sm text-slate-600">{[formatDates(e), e.location, e.grade].filter(Boolean).join(" · ")}</p>
                {e.bullets.length > 0 && (
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {e.bullets.map((b) => (
                      <li key={b.id}>{b.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </section>
      ))}
    </article>
  );
}

/** The cover letter as it is printed: date, who it is to, greeting, paragraphs, sign-off. */
function LetterText({ cv }: { cv: CvDoc }) {
  const l = cv.letter;
  if (!l) return null;
  const signoff = cv.region === "us" ? "Sincerely," : l.recipient ? "Yours sincerely," : "Yours faithfully,";
  return (
    <article aria-label={`${cv.contact.fullName}: example cover letter`} className={`${card} space-y-4 p-6 text-[15px] leading-relaxed text-slate-800 sm:p-10`}>
      <p>{longDate("2026-11-26", cv.region)}</p>
      <p>
        {l.recipient && (
          <>
            {l.recipient}
            <br />
          </>
        )}
        {cv.target?.employer}
      </p>
      <p>Dear {l.recipient || "Hiring Manager"},</p>
      {l.paragraphs.map((p) => (
        <p key={p.id}>{p.sentences.map((s) => s.text).join(" ")}</p>
      ))}
      <p>
        {signoff}
        <br />
        {cv.contact.fullName}
      </p>
    </article>
  );
}

/** One example: the CV, its cover letter and what employers in its industry look for. */
export function ExamplePage({ spec, region }: { spec: ExampleSpec; region: CvRegion }) {
  const { word, base, other, title } = EXAMPLE_PAGES[region];
  const cv = exampleCv(spec, region, "example", undefined, new Date("2026-11-26T12:00:00Z"), { letter: true });
  const industry = industryById(spec.industry);
  const role = pick(spec.role, region);
  const credentials = pickList(industry.credentials, region);
  const keywords = pickList(industry.keywords, region);
  const more = EXAMPLES.filter((e) => e.industry === spec.industry && e.id !== spec.id);
  return (
    <div className="w-full bg-[#fafbfc]">
      <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600">
          <Link href={base} className="font-medium text-[#3d4bd8] hover:underline">
            {title}
          </Link>{" "}
          / <span>{pick(industry.name, region)}</span> / <span aria-current="page">{role}</span>
        </nav>
        <header className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            {pick(industry.name, region)} · {LEVEL_LABELS[spec.level]}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {role} {word} example
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-700">
            {pick(spec.blurb, region)} The person and employers are made up. The {word} and its cover letter pass every check the app runs on your own: spelling, plain wording, a clean read by screening software, and every sentence of the letter traced back to the {word}.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/cv/examples/${spec.id}?region=${region}`} className="inline-flex min-h-[48px] items-center rounded-full bg-[#3d4bd8] px-6 text-base font-semibold text-white hover:bg-[#2e3ab8] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3d4bd8]">
              Start from this example
            </Link>
            <Link href={`${other}/${spec.id}`} className="inline-flex min-h-[48px] items-center rounded-full border border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 hover:border-slate-400">
              {region === "us" ? "See the UK CV version" : "See the US resume version"}
            </Link>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-10">
            <section aria-labelledby="the-cv">
              <h2 id="the-cv" className="mb-3 text-xl font-bold text-slate-900">
                The {word}
              </h2>
              <CvText cv={cv} />
            </section>
            {cv.letter && (
              <section aria-labelledby="the-letter">
                <h2 id="the-letter" className="mb-1 text-xl font-bold text-slate-900">
                  Its cover letter
                </h2>
                <p className="mb-3 text-sm text-slate-600">
                  For the role of {cv.target?.title} at {cv.target?.employer}. Each sentence about {cv.contact.fullName.split(" ")[0]} is on the {word}; each sentence about the employer is in the job advert.
                </p>
                <LetterText cv={cv} />
              </section>
            )}
          </div>
          <aside className="space-y-6">
            <section className={`${card} p-5`} aria-labelledby="look-for">
              <h2 id="look-for" className="text-base font-bold text-slate-900">
                What {pick(industry.name, region).toLowerCase()} employers look for
              </h2>
              {credentials.length > 0 && (
                <>
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">Credentials to list, if you hold them</h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {credentials.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </>
              )}
              <h3 className="mt-3 text-sm font-semibold text-slate-900">Words adverts use</h3>
              <p className="mt-1 text-sm text-slate-700">{keywords.join(", ")}</p>
              <p className="mt-3 text-xs text-slate-600">Use them only where they are true of you, in your own lines.</p>
            </section>
            {more.length > 0 && (
              <section className={`${card} p-5`} aria-labelledby="more-examples">
                <h2 id="more-examples" className="text-base font-bold text-slate-900">
                  More {pick(industry.name, region).toLowerCase()} examples
                </h2>
                <ul className="mt-2 space-y-1 text-sm">
                  {more.map((m) => (
                    <li key={m.id}>
                      <Link href={`${base}/${m.id}`} className="font-medium text-[#3d4bd8] hover:underline">
                        {pick(m.role, region)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section className={`${card} p-5`} aria-labelledby="design">
              <h2 id="design" className="text-base font-bold text-slate-900">
                Want a different look?
              </h2>
              <p className="mt-1 text-sm text-slate-700">
                Any example works in any of the{" "}
                <Link href={region === "us" ? "/resume-templates" : "/cv-templates"} className="font-medium text-[#3d4bd8] underline">
                  20 templates
                </Link>
                , with a{" "}
                <Link href="/cover-letter-templates" className="font-medium text-[#3d4bd8] underline">
                  cover letter to match
                </Link>
                .
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

/** Every example, by industry. */
export function ExamplesIndex({ region }: { region: CvRegion }) {
  const { word, base, other, title } = EXAMPLE_PAGES[region];
  const groups = INDUSTRIES.map((ind) => ({ ind, list: EXAMPLES.filter((e) => e.industry === ind.id) })).filter((g) => g.list.length);
  return (
    <div className="w-full bg-[#fafbfc]">
      <section className="border-b border-black/[0.06] bg-white px-4 pt-12 pb-10 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {EXAMPLES.length} example {word}s with cover letters, across {groups.length} industries. Read one for your kind of job, then start from it and make it yours.
          </p>
          <p className="text-sm text-slate-600">
            {region === "us" ? "Applying in the UK? " : "Applying in the US? "}
            <Link href={other} className="font-medium text-[#3d4bd8] underline">
              {region === "us" ? "See the UK CV examples" : "See the US resume examples"}
            </Link>
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-[1120px] space-y-10 px-4 py-10 sm:px-6">
        {groups.map(({ ind, list }) => (
          <section key={ind.id} aria-labelledby={`ind-${ind.id}`}>
            <h2 id={`ind-${ind.id}`} className="mb-4 text-xl font-bold text-slate-900">
              {pick(ind.name, region)}
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((e) => (
                <li key={e.id}>
                  <Link href={`${base}/${e.id}`} className={`${card} block h-full p-5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4bd8]`}>
                    <span className="block text-sm text-slate-600">{LEVEL_LABELS[e.level]}</span>
                    <span className="mt-1 block text-base font-semibold text-slate-900">
                      {pick(e.role, region)} {word}
                    </span>
                    <span className="mt-1 block text-sm text-slate-700">{pick(e.blurb, region)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
