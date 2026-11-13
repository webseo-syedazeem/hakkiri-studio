import { notFound } from "next/navigation";
import { RunReportView } from "@/components/pitch/RunReportView";
import { getPresentation, getPresentationAsync, getRun, getRunAsync } from "@/lib/pitch/store";
import { demoRuns } from "@/lib/pitch/demo";
import { whenSaid } from "@/lib/format";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

/** Run report: how a rehearsal went, slide by slide, and recommendations for the next run. */
export default async function RunReportPage({ params }: { params: Promise<{ id: string; runId: string }> }) {
  const user = await requirePageUser();
  const { id, runId } = await params;
  const p = (await getPresentationAsync(id, user.id)) ?? getPresentation(id, user.id);
  let run = (await getRunAsync(runId, user.id)) ?? getRun(runId, user.id);
  if (!run && (p?.id === "q1-roadmap" || id === "q1-roadmap")) {
    const lastDemo = demoRuns[demoRuns.length - 1];
    run = { ...lastDemo, id: runId };
  }
  if (!p || !run || run.presentationId !== p.id) notFound();

  return (
    <div className="flex grow flex-col">
      <RunReportView presentation={p} run={run} whenFormatted={whenSaid(run.startedAt)} />
    </div>
  );
}
