import { Crumbs } from "@/components/ui";
import { PitchSetup } from "@/components/pitch/PitchSetup";
import { addDays, londonToday } from "@/lib/dates";

export const dynamic = "force-dynamic"; // the default date moves with the calendar

/** New presentation (design screen 11). */
export default function NewPresentationPage() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] grow flex-col">
      <header className="animate-rise">
        <Crumbs items={[{ label: "Presentations", href: "/presentations" }, { label: "New presentation" }]} />
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">Set up your presentation</h1>
        <p className="mt-1 text-[15px] text-muted">Hakkiri reads your slides, suggests timing for each one, and finds the point each slide needs to land.</p>
      </header>
      <div className="mt-5 flex min-h-0 grow flex-col border-t border-line pt-4">
        <PitchSetup
          initial={{
            title: "",
            audience: "leadership",
            ask: "",
            date: addDays(londonToday(), 7),
            time: "09:30",
            limitMin: 10,
            qaStyle: "sceptical",
            source: null,
            slides: [],
            askSlide: 1,
            warnings: [],
            planBy: "estimate",
          }}
        />
      </div>
    </div>
  );
}
