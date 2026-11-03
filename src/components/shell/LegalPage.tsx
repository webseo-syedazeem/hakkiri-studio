/**
 * A legal page (privacy policy, terms): readable column, a draft notice until
 * a solicitor has approved the wording, and a contents list.
 */
export function LegalPage({ title, updated, draft, sections, intro }: { title: string; updated: string; draft: boolean; intro: React.ReactNode; sections: { id: string; title: string; body: React.ReactNode }[] }) {
  return (
    <article className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6 sm:py-14">
      {draft && (
        <div role="note" className="mb-8 rounded-[12px] bg-red/10 px-4 py-3 text-sm text-red-soft shadow-[inset_0_0_0_1px_rgb(255_92_97/0.3)]">
          <b className="font-semibold">Draft for review by a solicitor.</b> Not yet in force. Anything in [square brackets] still needs filling in or checking.
        </div>
      )}
      <h1 className="text-[32px] font-semibold tracking-[-0.025em]">{title}</h1>
      <p className="mt-1 text-sm text-muted">Last updated {updated}</p>
      <div className="legal mt-6 text-[15px] leading-relaxed text-ink/90">{intro}</div>
      <nav aria-label="Contents" className="mt-8 rounded-[12px] bg-panel px-5 py-4 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <h2 className="text-[13px] font-semibold text-muted">Contents</h2>
        <ol className="mt-2 grid list-decimal gap-x-8 gap-y-1 pl-5 text-sm sm:grid-cols-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-blue-soft underline-offset-2 hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {sections.map((s, i) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-10 scroll-mt-6">
          <h2 id={`${s.id}-h`} className="text-xl font-semibold tracking-[-0.015em]">
            {i + 1}. {s.title}
          </h2>
          <div className="legal mt-3 text-[15px] leading-relaxed text-ink/90">{s.body}</div>
        </section>
      ))}
    </article>
  );
}
