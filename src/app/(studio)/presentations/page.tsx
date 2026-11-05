import Link from "next/link";
import clsx from "clsx";
import { ButtonLink, Icon, Panel } from "@/components/ui";
import { SlideView } from "@/components/pitch/SlideView";
import { listPresentations, listQa, listRuns } from "@/lib/pitch/store";
import { pitchReadiness } from "@/lib/pitch/plan";
import { AUDIENCE_LABEL } from "@/lib/pitch/labels";
import { londonToday } from "@/lib/dates";
import { clock, daysBetween, longDay } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Your presentations and pitches, soonest first. */
export default function PresentationsPage() {
  const all = listPresentations();
  return (
    <div className="flex grow flex-col">
      <header className="flex animate-rise items-end justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Presentations and pitches</h1>
          <p className="mt-1 text-[15px] text-muted">Rehearse with your slides, slide by slide, then take questions from the audience you’ll face.</p>
        </div>
        <ButtonLink href="/presentations/new" variant="primary">
          <Icon name="plus" size={16} strokeWidth={2} />
          New presentation
        </ButtonLink>
      </header>

      {all.length === 0 && (
        <Panel className="mt-6 max-w-[620px] animate-rise px-6 py-6">
          <h2 className="text-[15px] font-semibold">No presentations yet</h2>
          <p className="mt-1.5 text-sm text-muted">Add your slides and how long you have. Rehearse slide by slide, then take questions from the audience you’ll face.</p>
          <ButtonLink href="/presentations/new" variant="primary" className="mt-4">
            Add a presentation
          </ButtonLink>
        </Panel>
      )}

      <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-5">
        {all.map((p, i) => {
          const runs = listRuns(p.id);
          const r = pitchReadiness(p, runs, listQa(p.id));
          const days = daysBetween(londonToday(), p.date);
          return (
            <Link key={p.id} href={`/presentations/${p.id}`} className="group block animate-rise" style={{ animationDelay: `${0.05 * i}s` }}>
              <Panel className="flex gap-5 p-5 transition-shadow group-hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
                <SlideView slide={p.slides[0]} presentationId={p.id} className="w-[168px] shrink-0 self-start rounded-[6px] shadow-[0_0_0_1px_var(--color-line-strong)]" showNumber={false} />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold tracking-[-0.01em]">{p.title}</h2>
                  <div className="mt-0.5 whitespace-nowrap text-[13px] text-muted">
                    {AUDIENCE_LABEL[p.audience]} · {Math.round(p.timeLimitSec / 60)} min · {p.slides.length} slides
                  </div>
                  <div className="mt-3 text-sm">
                    {longDay(p.date)}, {clock(p.date)}{" "}
                    <span className="text-muted">{days < 0 ? "(done)" : days === 0 ? "(today)" : days === 1 ? "(tomorrow)" : `(in ${days} days)`}</span>
                  </div>
                  <div className={clsx("mt-2 text-[13px] font-semibold", r.statusTone === "red" ? "text-red-soft" : "text-lilac")}>
                    {r.status}
                    {runs.length > 0 && <span className="font-normal text-muted"> · {runs.length} run{runs.length === 1 ? "" : "s"}</span>}
                  </div>
                </div>
              </Panel>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
