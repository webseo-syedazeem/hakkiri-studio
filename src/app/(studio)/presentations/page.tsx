import { ButtonLink, Icon, Panel } from "@/components/ui";
import { PresentationsGrid, type SerializedPresentation } from "@/components/pitch/PresentationsGrid";
import { isDemoPresentation, listPresentations, listQa, listRuns } from "@/lib/pitch/store";
import { pitchReadiness } from "@/lib/pitch/plan";
import { londonToday } from "@/lib/dates";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

/** Your presentations and pitches, soonest first. */
export default async function PresentationsPage() {
  const user = await requirePageUser();
  const all = listPresentations(user.id);
  const today = londonToday();

  const own = all.filter((p) => !isDemoPresentation(p.id));

  const serialized: SerializedPresentation[] = all.map((p) => {
    const runs = listRuns(p.id, user.id);
    const r = pitchReadiness(p, runs, listQa(p.id, user.id));
    return {
      presentation: p,
      runsCount: runs.length,
      readiness: {
        status: r.status,
        statusTone: r.statusTone,
      },
      isDemo: isDemoPresentation(p.id),
    };
  });

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

      {own.length === 0 && (
        <Panel className="mt-6 max-w-[620px] animate-rise px-6 py-6">
          <h2 className="text-[15px] font-semibold">No presentations yet</h2>
          <p className="mt-1.5 text-sm text-muted">Add your slides and how long you have. Rehearse slide by slide, then take questions from the audience you’ll face.</p>
          <ButtonLink href="/presentations/new" variant="primary" className="mt-4">
            Add a presentation
          </ButtonLink>
        </Panel>
      )}

      <PresentationsGrid initialPresentations={serialized} today={today} />
    </div>
  );
}
