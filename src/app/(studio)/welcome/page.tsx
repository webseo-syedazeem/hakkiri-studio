import Link from "next/link";
import { Mark } from "@/components/brand/Mark";
import { MiniWave } from "@/components/audio/MiniWave";
import { buttonClass, Icon } from "@/components/ui";
import { user } from "@/lib/mock-data";

const PLANNED = [30, 60, 45, 60, 60, 60, 60, 30, 45, 45, 45, 60];
const ACTUAL = [32, 75, 40, 160, 70, 65, 50, 25, 50, 55, 48, 10];

function MiniSlide({ title, dark = false, drop = 0 }: { title: string; dark?: boolean; drop?: number }) {
  return (
    <div
      className={`flex h-[84px] w-[150px] flex-col justify-between rounded-lg p-2.5 shadow-md ${dark ? "bg-halden text-white border border-emerald-500/20" : "bg-[#fbfbf8] text-[#16201d] border border-gray-200"}`}
      style={{ transform: `translateY(${drop}px)` }}
    >
      <span className="text-[10px] font-bold leading-tight">{title}</span>
      <span className={`h-1.5 w-2/3 rounded-full ${dark ? "bg-white/30" : "bg-[#e3eeea]"}`} />
    </div>
  );
}

function Choice({ href, title, body, cta, children, delay }: { href: string; title: string; body: string; cta: string; children: React.ReactNode; delay: string }) {
  return (
    <Link
      href={href}
      className="group flex animate-rise flex-col rounded-2xl border border-white/[0.08] bg-panel/90 p-6 text-ink shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-blue/40 hover:shadow-2xl hover:scale-[1.01]"
      style={{ animationDelay: delay }}
    >
      <div className="h-[186px] rounded-xl bg-booth/90 p-5 shadow-inner border border-white/[0.04] flex flex-col justify-between">{children}</div>
      <h2 className="mt-5 text-[22px] font-bold tracking-tight group-hover:text-blue-soft transition-colors">{title}</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">{body}</p>
      <div className="grow" />
      <span className={buttonClass("primary", "md", "mt-6 self-start flex items-center gap-2")}>
        <span>{cta}</span>
        <Icon name="arrowRight" size={14} />
      </span>
    </Link>
  );
}

export default function WelcomePage() {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] grow flex-col justify-center py-6">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-blue/15 px-3 py-1 text-xs font-semibold text-blue-soft border border-blue/20">
          Executive Practice Suite
        </span>
        <span className="text-xs text-muted">Welcome to Hakkiri Studio, {user.firstName}</span>
      </div>

      <h1 className="mt-2 animate-rise text-[36px] font-extrabold tracking-tight sm:text-[44px]">
        What are you preparing for today?
      </h1>
      <p className="mt-1 text-[16px] text-muted">
        Choose your practice track below or explore the active studio environment.
      </p>

      <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Choice
          href="/welcome/start?next=/interviews/new"
          title="A job interview"
          body="Add your CV and the job spec. Practise realistic questions with an adaptive AI hiring manager who listens, challenges, and gives immediate actionable feedback."
          cta="Set up an interview"
          delay="0.1s"
        >
          <div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-muted">
              <Mark size={20} />
              Sam, hiring manager, asks
            </div>
            <div className="mt-2.5 text-[18px] font-semibold leading-snug tracking-tight text-ink">
              “Why do you want to work here, rather than somewhere bigger?”
            </div>
          </div>
          <MiniWave bars={64} played={38} className="mt-3 h-[32px]" />
        </Choice>

        <Choice
          href="/welcome/start?next=/presentations/new"
          title="A presentation or pitch"
          body="Add your slides. Rehearse against the clock, pinpoint where you run long, and face simulated tough questions from the room."
          cta="Set up a presentation"
          delay="0.2s"
        >
          <div className="flex justify-center gap-2.5 pt-1">
            <MiniSlide title="Q1 roadmap" dark />
            <MiniSlide title="Three bets for Q1" drop={6} />
            <MiniSlide title="Approve roadmap" />
          </div>
          <div>
            <div className="flex gap-[3px]" aria-hidden>
              {PLANNED.map((p, i) => (
                <span key={i} className={`h-2 rounded-[2px] ${ACTUAL[i] > p + 15 ? "bg-red" : "bg-blue"}`} style={{ flex: p }} />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-muted">
              <span>Time per slide</span>
              <span className="text-red-soft font-medium">Slide 4 ran long</span>
            </div>
          </div>
        </Choice>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-panel/70 px-5 py-4 text-sm shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Icon name="check" size={16} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-semibold text-ink">Your free trial is ready:</span>{" "}
            <span className="text-muted">10 minutes of interview practice & 5 minutes of pitch rehearsal with complete analytics.</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Icon name="shield" size={14} className="text-blue-soft" />
          <span>Accent-neutral speech AI</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Link href="/welcome/start?next=/" className="flex items-center gap-2 text-sm font-semibold text-blue-soft hover:underline">
          <span>Look around the studio demo first</span>
          <Icon name="arrowRight" size={14} />
        </Link>
        <Link href="/mic-check" className="text-xs text-muted hover:text-ink">
          Test microphone setup →
        </Link>
      </div>
    </div>
  );
}
