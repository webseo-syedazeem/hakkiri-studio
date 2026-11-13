import { Crumbs } from "@/components/ui";
import { PitchSetup } from "@/components/pitch/PitchSetup";
import { addDays, londonToday } from "@/lib/dates";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic"; // the default date moves with the calendar

/** New presentation (design screen 11). */
export default async function NewPresentationPage() {
  await requirePageUser();
  return (
    <div className="flex min-h-[calc(100vh-56px)] grow flex-col">
      <header className="animate-rise pb-2">
        <Crumbs items={[{ label: "Presentations", href: "/presentations" }, { label: "New presentation" }]} />
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em] text-white">Set up your presentation</h1>
        <p className="mt-1 text-[14.5px] text-[#9394a5]">Upload your slides, tell us about your audience and practise with AI feedback and realistic questions.</p>
      </header>
      <div className="mt-4 flex min-h-0 grow flex-col border-t border-white/[0.08] pt-5">
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
