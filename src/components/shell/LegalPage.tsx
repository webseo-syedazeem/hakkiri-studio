"use client";

import Link from "next/link";

interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  title: string;
  updated: string;
  draft: boolean;
  intro: React.ReactNode;
  sections: LegalSection[];
}

/**
 * Executive Legal Document Page (Privacy Policy, Terms of Service).
 * Fully responsive, crisp typography, official company trading headers, zero dark variable bugs.
 */
export function LegalPage({
  title,
  updated,
  draft,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <div className="w-full bg-white text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      <article className="mx-auto w-full max-w-[820px] px-4 py-10 sm:px-6 sm:py-16">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span>←</span> Back to Hakkiri Studio
          </Link>
        </div>

        {/* Draft Notice (only if draft is explicitly true) */}
        {draft && (
          <div
            role="note"
            className="mb-8 rounded-2xl bg-amber-50 border border-amber-200/80 p-4 text-xs font-medium text-amber-800 shadow-xs"
          >
            <b className="font-bold">Notice:</b> Draft legal version under review.
          </div>
        )}

        {/* Official Trading Status Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 mb-4 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          Official Legal Document · Happy Cheeks Ltd (Co. 15146182)
        </div>

        {/* Document Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
          {title}
        </h1>

        {/* Document Metadata Strip */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
          <span>Last updated: {updated}</span>
          <span className="text-slate-300">•</span>
          <span>Registered in England & Wales</span>
          <span className="text-slate-300">•</span>
          <span>Company No. 15146182</span>
        </div>

        {/* Executive Summary / Introduction Card */}
        <div className="legal mt-8 text-[15px] leading-relaxed text-slate-700 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          {intro}
        </div>

        {/* Table of Contents Box */}
        <nav
          aria-label="Contents"
          className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Document Outline & Sections ({sections.length})
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">Jump to section</span>
          </div>

          <ol className="mt-4 grid list-decimal gap-x-8 gap-y-2 pl-5 text-sm sm:grid-cols-2 font-medium text-slate-700">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors leading-snug"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Numbered Legal Sections */}
        <div className="space-y-12 mt-12">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-h`}
              className="pt-8 border-t border-slate-200/80 scroll-mt-20"
            >
              <h2
                id={`${s.id}-h`}
                className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-baseline gap-2"
              >
                <span className="text-blue-600 font-mono text-lg">{i + 1}.</span>
                <span>{s.title}</span>
              </h2>

              <div className="legal mt-4 text-[15px] leading-relaxed text-slate-700">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        {/* Help & Support Footer Banner */}
        <div className="mt-16 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-6 sm:p-8 text-center text-sm text-slate-600 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base">
            Questions regarding our terms or privacy practices?
          </h3>
          <p className="mt-1 text-slate-500 text-xs max-w-[500px] mx-auto">
            Hakkiri Studio is a trading name of Happy Cheeks Ltd. Our data and compliance team is available to answer any questions or process data requests.
          </p>
          <div className="mt-4">
            <a
              href="mailto:support@hakkiri.studio"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
            >
              <span>✉️</span> Contact Support (support@hakkiri.studio)
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
