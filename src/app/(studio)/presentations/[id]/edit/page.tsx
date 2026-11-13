import { notFound } from "next/navigation";
import { Crumbs } from "@/components/ui";
import { PitchSetup } from "@/components/pitch/PitchSetup";
import { slideImageSrc } from "@/components/pitch/SlideView";
import { getPresentation, getPresentationAsync } from "@/lib/pitch/store";
import { clock } from "@/lib/format";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

/** Change a presentation's slides, plan, audience, ask or date (design screen 11 again). */
export default async function EditPresentationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser();
  const { id } = await params;
  const p = (await getPresentationAsync(id, user.id)) ?? getPresentation(id, user.id);
  if (!p) notFound();
  return (
    <div className="flex min-h-[calc(100vh-56px)] grow flex-col">
      <header className="animate-rise">
        <Crumbs items={[{ label: "Presentations", href: "/presentations" }, { label: p.title, href: `/presentations/${p.id}` }, { label: "Set-up" }]} />
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">Change your presentation</h1>
        <p className="mt-1 text-[15px] text-muted">Change the plan, the audience or the date. Runs you’ve done keep the plan they were scored against.</p>
      </header>
      <div className="mt-5 flex min-h-0 grow flex-col border-t border-line pt-4">
        <PitchSetup
          initial={{
            id: p.id,
            title: p.title,
            audience: p.audience,
            ask: p.ask,
            date: new Date(p.date).toLocaleDateString("en-CA", { timeZone: "Europe/London" }),
            time: clock(p.date),
            limitMin: Math.round(p.timeLimitSec / 60),
            qaStyle: p.qaStyle,
            source: p.source,
            slides: p.slides.map((s) => ({
              title: s.title,
              lines: s.lines,
              notes: s.notes,
              layout: s.layout,
              image: s.image ? { kind: s.image.kind, file: s.image.file, url: slideImageSrc(p.id, s.image.file) } : null,
              plannedSec: s.plannedSec,
              point: s.point,
            })),
            askSlide: p.askSlide,
            warnings: p.warnings,
            planBy: p.planBy,
          }}
        />
      </div>
    </div>
  );
}
