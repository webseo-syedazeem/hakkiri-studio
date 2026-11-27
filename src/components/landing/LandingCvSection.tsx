import Image from "next/image";
import Link from "next/link";

/**
 * CVs and cover letters, on the interview-led homepage (DESIGN-SPEC-v3 §06): one section, right after
 * the hero, in the public light style. The page beside the copy is a labelled sample: a real example CV
 * from the gallery, with a sample score and a sample of what software reads. Nothing on it is a result.
 */

const POINTS: { icon: "check" | "doc" | "mic"; title: string; body: string }[] = [
  { icon: "check", title: "Your words. Nothing invented.", body: "AI helps with wording, but cannot add experience you haven’t confirmed." },
  { icon: "doc", title: "See what applicant software actually reads.", body: "Check your PDF or Word file and see the words and sections it reads back." },
  { icon: "check", title: "Every download checked word for word.", body: "Your file is read back and compared with your document before it is downloaded." },
  { icon: "mic", title: "Practise the questions your CV will get.", body: "Rehearse questions about your own achievements, numbers and decisions." },
];

const STEPS = [
  ["01", "Build or upload", "Start with your own CV or your own words."],
  ["02", "Check", "See the lines to improve and what software reads."],
  ["03", "Practise", "Answer questions about the claims on your CV."],
] as const;

const PARTS = [
  ["Evidence", "41/45", 91],
  ["Clarity", "18/20", 90],
  ["Structure", "19/20", 95],
  ["Readable by software", "12/15", 80],
] as const;

const READS = [
  ["Name and contact details", "Read"],
  ["Section headings", "Read"],
  ["Words read", "To review"],
  ["Lines it couldn’t place", "To review"],
] as const;

function Icon({ name }: { name: "check" | "doc" | "mic" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "doc")
    return (
      <svg {...common}>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
    );
  if (name === "mic")
    return (
      <svg {...common}>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** A static score ring: the sample's own number, never animated. */
function SampleRing({ score }: { score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" role="img" aria-label={`Sample CV score: ${score} out of 100, Strong`}>
      <circle cx="42" cy="42" r={r} fill="none" stroke="#e6e8ee" strokeWidth="8" />
      <circle cx="42" cy="42" r={r} fill="none" stroke="#2f855a" strokeWidth="8" strokeDasharray={`${(score / 100) * c} ${c}`} strokeLinecap="round" transform="rotate(-90 42 42)" />
      <text x="42" y="48" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1d1d1f">
        {score}
      </text>
    </svg>
  );
}

export function LandingCvSection() {
  return (
    <section id="cvs" aria-labelledby="cvs-h" className="scroll-mt-14 bg-white py-[42px] sm:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-[46fr_54fr] lg:gap-10">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mk-cta">CVs &amp; cover letters · Free beta</p>
            <h2 id="cvs-h" className="mt-3 text-[30px] font-bold leading-[1.1] tracking-[-0.025em] [text-wrap:balance] sm:text-[40px]">
              Build a CV you can stand behind.
            </h2>
            <p className="mt-4 max-w-[34rem] text-[16px] leading-relaxed text-mk-slate sm:text-[18px]">Build and check your CV and cover letter, free. Then prepare for the interview your CV gets you.</p>
            <ul className="mt-6 grid gap-4">
              {POINTS.map((p) => (
                <li key={p.title} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-[9px] border border-[#d9dce6] text-mk-cta">
                    <Icon name={p.icon} />
                  </span>
                  <span>
                    <strong className="block text-[15px] font-semibold text-mk-ink">{p.title}</strong>
                    <span className="mt-0.5 block text-[14px] leading-relaxed text-mk-slate">{p.body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cv/new"
                className="inline-flex items-center justify-center rounded-full bg-mk-cta px-6 py-3 text-[16px] font-medium text-white transition-colors hover:bg-mk-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-cta"
                data-testid="home-build-cv"
              >
                Build my CV free
              </Link>
              <Link
                href="/cv-audit"
                className="inline-flex items-center justify-center rounded-full border border-[#c9cdd8] bg-white px-6 py-3 text-[16px] font-medium text-mk-ink transition-colors hover:border-mk-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-cta"
                data-testid="home-check-cv"
              >
                Check my CV
              </Link>
            </div>
            <p className="mt-3 text-[13px] text-mk-slate">Free CV check · No sign-up needed.</p>
          </div>

          <div className="rounded-[20px] border border-[#e2e5ec] bg-[#e9ecf1] p-4 sm:p-6" aria-label="Sample CV and check">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#4b5160]">Sample CV and check</p>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative aspect-[550/777] overflow-hidden rounded-[6px] bg-white shadow-[0_1px_3px_rgb(0_0_0/0.12)]">
                <Image src="/example-previews/marketing-lead-uk.webp" alt="Sample CV: a marketing lead’s CV on one white A4 page" fill sizes="(min-width: 1024px) 380px, 90vw" className="object-contain" />
              </div>
              <div className="grid content-start gap-3">
                <div className="rounded-[12px] border border-[#e2e5ec] bg-white p-3.5">
                  <p className="text-[14px] font-semibold text-mk-ink">CV score</p>
                  <div className="mt-2 flex items-center gap-3">
                    <SampleRing score={91} />
                    <div>
                      <p className="text-[14px] font-semibold text-[#166534]">● Strong</p>
                      <p className="text-[12px] text-mk-slate">Sample score</p>
                    </div>
                  </div>
                  {PARTS.map(([label, value, pct]) => (
                    <div key={label} className="mt-2">
                      <div className="flex justify-between text-[12px] text-mk-ink">
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-[#e6e8ee]">
                        <span className="block h-1.5 rounded-full bg-mk-cta" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-[12px] border border-[#e2e5ec] bg-white p-3.5">
                  <p className="text-[14px] font-semibold text-mk-ink">How software reads it</p>
                  <p className="text-[12px] text-mk-slate">Sample file check</p>
                  <ul className="mt-2 grid gap-1.5">
                    {READS.map(([label, state]) => (
                      <li key={label} className="flex justify-between gap-2 text-[12px] text-mk-ink">
                        <span>{label}</span>
                        <strong className={state === "Read" ? "text-[#196448]" : "text-[#80510d]"}>{state}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ol className="mt-10 grid border-t border-[#e2e5ec] sm:grid-cols-3">
          {STEPS.map(([n, title, body]) => (
            <li key={n} className="border-b border-[#e2e5ec] py-4 sm:border-b-0 sm:py-5 sm:pr-6 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:pl-6">
              <strong className="text-[15px] font-semibold text-mk-ink">
                <span className="text-mk-cta-hover">{n}</span> · {title}
              </strong>
              <p className="mt-1 text-[14px] text-mk-slate">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
