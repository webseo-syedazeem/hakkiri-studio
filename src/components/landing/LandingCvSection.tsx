import Link from "next/link";

/**
 * The CVs and letters section of the homepage (design spec v3 §06): one
 * section under the interview hero, in the public light style. The page and
 * the check beside it are a labelled sample, not anyone's result. The free
 * check works before sign-up; building a CV goes through the existing account
 * flow and comes back to the builder.
 */

const BENEFITS: { icon: "check" | "doc" | "mic"; title: string; body: string }[] = [
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

function Glyph({ name }: { name: "check" | "doc" | "mic" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "doc")
    return (
      <svg {...common}>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
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
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

/** A still ring: the sample's score, with its band in words. No counting animation. */
function SampleRing({ score }: { score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" role="img" aria-label={`Sample CV score ${score} out of 100, Strong`}>
      <circle cx="42" cy="42" r={r} fill="none" stroke="#e2e7f1" strokeWidth="8" />
      <circle cx="42" cy="42" r={r} fill="none" stroke="#15803d" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} transform="rotate(-90 42 42)" />
      <text x="42" y="47" textAnchor="middle" fontSize="20" fontWeight="700" fill="#17181f">
        {score}
      </text>
    </svg>
  );
}

export function LandingCvSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const build = isLoggedIn ? "/cv/new" : `/signup?next=${encodeURIComponent("/cv/new")}`;
  return (
    <section id="cvs" aria-labelledby="cvs-h" className="scroll-mt-14 bg-white py-[42px] text-mk-ink sm:py-20">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[46fr_54fr] lg:gap-10">
        <div className="min-w-0">
          <span className="text-[15px] font-semibold text-mk-blue">CVs &amp; cover letters · Free beta</span>
          <h2 id="cvs-h" className="mt-2 text-[30px] font-bold leading-[1.1] tracking-[-0.025em] sm:text-[40px]">
            Build a CV you can stand behind.
          </h2>
          <p className="mt-4 text-[16px] leading-[1.55] text-mk-slate sm:text-[18px]">Build and check your CV and cover letter, free. Then prepare for the interview your CV gets you.</p>
          <ul className="mt-7 grid gap-5">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#eceefe] text-mk-blue">
                  <Glyph name={b.icon} />
                </span>
                <span>
                  <strong className="block text-[16px] font-semibold">{b.title}</strong>
                  <span className="mt-0.5 block text-[15px] leading-[1.5] text-mk-slate">{b.body}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={build} className="inline-flex min-h-[44px] items-center justify-center rounded-[11px] bg-mk-cta px-6 text-[15px] font-semibold text-white transition-colors hover:bg-mk-cta-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mk-blue">
              Build my CV free
            </Link>
            <Link href="/cv-audit" className="inline-flex min-h-[44px] items-center justify-center rounded-[11px] bg-white px-6 text-[15px] font-semibold text-mk-ink shadow-[inset_0_0_0_1px_#68758a] transition-colors hover:bg-[#eef1f6] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mk-blue">
              Check my CV
            </Link>
          </div>
          <p className="mt-3 text-[13px] text-mk-slate">Free CV check · No sign-up needed.</p>
        </div>

        <figure className="min-w-0" aria-label="A sample CV and its check">
          <figcaption className="mb-2 text-[12px] font-medium text-mk-slate">Sample CV and check</figcaption>
          <div className="grid grid-cols-1 gap-4 rounded-[16px] bg-[#e9ecf1] p-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:p-4">
            <div className="aspect-[210/297] min-w-0 overflow-hidden bg-white p-[7%] text-[#141821] shadow-[0_3px_12px_#0002]" aria-hidden="true">
              <p className="text-[clamp(14px,2.2vw,22px)] font-bold leading-tight text-[#34429f]">Chloe Bennett</p>
              <p className="mt-1 text-[clamp(8px,1vw,11px)] font-semibold">Head of Growth</p>
              <p className="mt-1 text-[clamp(6px,0.8vw,9px)] text-[#48566a]">Brighton · chloe.bennett@example.com · 07700 900672</p>
              <div className="mt-[4%] border-t border-[#34429f]" />
              {[
                ["Profile", ["Marketing manager with nine years in consumer brands that sell online."]],
                ["Experience", ["Manage a £1.5 million yearly budget, returning £4.10 for every £1 spent", "Grew qualified leads by 52% in a year by rebuilding 6 landing pages", "Lead a team of 3 marketers and 2 agencies"]],
                ["Skills", ["Google Ads, Meta Ads, Klaviyo, Google Analytics"]],
              ].map(([h, lines]) => (
                <div key={h as string} className="mt-[5%]">
                  <p className="text-[clamp(7px,0.9vw,10px)] font-bold text-[#34429f]">{h}</p>
                  {(lines as string[]).map((l) => (
                    <p key={l} className="mt-[1.5%] text-[clamp(6px,0.75vw,9px)] leading-snug">
                      {h === "Experience" ? "• " : ""}
                      {l}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <div className="grid content-start gap-3">
              <div className="rounded-[12px] bg-white p-3.5 shadow-[inset_0_0_0_1px_#d7dee8]">
                <p className="text-[13px] font-semibold">CV score</p>
                <div className="mt-2 flex items-center gap-3">
                  <SampleRing score={94} />
                  <div>
                    <p className="text-[14px] font-bold text-[#166534]">Strong</p>
                    <p className="text-[12px] text-mk-slate">The top band</p>
                  </div>
                </div>
                {[
                  ["Evidence", "45/45", 100],
                  ["Clarity", "20/20", 100],
                  ["Structure", "20/20", 100],
                  ["Readable by software", "9/15", 60],
                ].map(([n, v, pct]) => (
                  <div key={n as string} className="mt-2">
                    <div className="flex justify-between text-[12px]">
                      <span>{n}</span>
                      <strong>{v}</strong>
                    </div>
                    <div className="mt-1 h-[5px] rounded-full bg-[#e2e7f1]">
                      <div className="h-full rounded-full bg-[#3d4bd8]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-[12px] bg-white p-3.5 shadow-[inset_0_0_0_1px_#d7dee8]">
                <p className="text-[13px] font-semibold">How software reads it</p>
                <p className="text-[12px] text-mk-slate">Sample file check</p>
                {[
                  ["Name and contact details", "Read"],
                  ["Section headings", "Read"],
                  ["Words read", "To review"],
                  ["Lines it couldn’t place", "To review"],
                ].map(([n, v]) => (
                  <div key={n} className="mt-2 flex justify-between gap-2 border-t border-[#e2e7f1] pt-2 text-[12px]">
                    <span>{n}</span>
                    <strong className={v === "Read" ? "text-[#196448]" : "text-[#80510d]"}>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </figure>
      </div>

      <ol className="mx-auto mt-12 grid w-full max-w-[1200px] grid-cols-1 gap-0 px-4 sm:px-6 md:grid-cols-3">
        {STEPS.map(([n, t, b]) => (
          <li key={n} className="border-t border-mk-line py-5 md:border-l md:border-t-0 md:px-6 md:first:border-l-0 md:first:pl-0">
            <strong className="text-[16px]">
              <span className="text-mk-blue">{n}</span> · {t}
            </strong>
            <p className="mt-1 text-[15px] text-mk-slate">{b}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
