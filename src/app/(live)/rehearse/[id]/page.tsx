import { notFound } from "next/navigation";
import { Rehearsal } from "@/components/pitch/Rehearsal";
import { getPresentation, latestFullRun, nextRunNumber } from "@/lib/pitch/store";
import { AUDIENCE_TO } from "@/lib/pitch/labels";
import { DEMO_PRESENTATION_ID } from "@/lib/pitch/demo";
import type { RunMode } from "@/lib/pitch/types";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

/**
 * /rehearse/{id}                  full run, every slide
 * /rehearse/{id}?from=4&to=4      one section (here, slide 4)
 * /rehearse/{id}?mode=opening     the opening only: the first 60 seconds
 */
export default async function RehearsePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ mode?: string; from?: string; to?: string }> }) {
  const user = await requirePageUser();
  const { id } = await params;
  const sp = await searchParams;
  const p = getPresentation(id, user.id);
  if (!p) notFound();
  const n = p.slides.length;
  const clamp = (v: string | undefined, d: number) => Math.min(n, Math.max(1, Number.parseInt(v ?? "", 10) || d));
  let mode: RunMode = sp.mode === "opening" ? "opening" : sp.from || sp.to ? "section" : "full";
  let from = 1;
  let to = n;
  if (mode === "section") {
    from = clamp(sp.from, 1);
    to = Math.max(from, clamp(sp.to, from));
    if (from === 1 && to === n) mode = "full";
  }
  if (mode === "opening") to = Math.min(n, 3);
  const number = nextRunNumber(p.id, user.id);
  const label = mode === "full" ? "full run" : mode === "opening" ? "opening only" : from === to ? `slide ${from}` : `slides ${from} to ${to}`;
  const demoRun = p.id === DEMO_PRESENTATION_ID ? latestFullRun(p.id, user.id) : undefined;
  return (
    <Rehearsal
      presentationId={p.id}
      heading={`${p.title}, ${AUDIENCE_TO[p.audience].replace(/^the /, "")}`}
      runLabel={`Run ${number}, ${label}`}
      mode={mode}
      slides={p.slides}
      from={from}
      to={to}
      timeLimitSec={p.timeLimitSec}
      demoReportHref={demoRun ? `/presentations/${p.id}/runs/${demoRun.id}` : null}
    />
  );
}
