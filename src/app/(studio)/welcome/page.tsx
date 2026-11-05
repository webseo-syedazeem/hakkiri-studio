import Link from "next/link";
import { Mark } from "@/components/brand/Mark";
import { MiniWave } from "@/components/audio/MiniWave";
import { buttonClass } from "@/components/ui";
import { user } from "@/lib/mock-data";

const PLANNED = [30, 60, 45, 60, 60, 60, 60, 30, 45, 45, 45, 60];
const ACTUAL = [32, 75, 40, 160, 70, 65, 50, 25, 50, 55, 48, 10];

function MiniSlide({ title, dark = false, drop = 0 }: { title: string; dark?: boolean; drop?: number }) {
  return (
    <div
      className={`flex h-[84px] w-[150px] flex-col justify-between rounded-md p-2.5 shadow-[0_0_0_1px_var(--color-line-strong)] ${dark ? "bg-halden text-white" : "bg-[#fbfbf8] text-[#16201d]"}`}
      style={{ transform: `translateY(${drop}px)` }}
    >
      <span className="text-[9px] font-bold leading-tight">{title}</span>
      <span className={`h-1 w-2/3 rounded ${dark ? "bg-white/30" : "bg-[#e3eeea]"}`} />
    </div>
  );
}

function Choice({ href, title, body, cta, children, delay }: { href: string; title: string; body: string; cta: string; children: React.ReactNode; delay: string }) {
  return (
    <Link
      href={href}
      className="flex animate-rise flex-col rounded-[18px] bg-panel p-[22px] text-ink shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
      style={{ animationDelay: delay }}
    >
      <div className="h-[186px] rounded-xl bg-booth p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">{children}</div>
      <h2 className="mt-[22px] text-[22px] font-semibold tracking-[-0.02em]">{title}</h2>
      <p className="mt-1.5 text-[15px] leading-normal text-muted">{body}</p>
      <div className="grow" />
      <span className={buttonClass("primary", "md", "mt-5 self-start")}>{cta}</span>
    </Link>
  );
}

export default function WelcomePage() {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] grow flex-col justify-center">
      <div className="text-[15px] text-muted">Welcome to Hakkiri Studio, {user.firstName}</div>
      <h1 className="mt-1.5 animate-rise text-[40px] font-semibold tracking-[-0.03em]">What are you preparing for?</h1>
      <div className="mt-[30px] grid grid-cols-2 gap-[22px]">
        <Choice
          href="/welcome/start?next=/interviews/new"
          title="A job interview"
          body="Add your CV and the job spec. Practise the questions you’re likely to get, with an interviewer who follows up."
          cta="Set up an interview"
          delay="0.1s"
        >
          <div className="flex items-center gap-2.5 text-xs text-muted">
            <Mark size={22} />
            Sam, hiring manager, asks
          </div>
          <div className="mt-2.5 text-[19px] font-semibold leading-tight tracking-[-0.015em]">Why do you want to work here, rather than somewhere bigger?</div>
          <MiniWave bars={70} played={40} className="mt-4 h-[34px]" />
        </Choice>
        <Choice
          href="/welcome/start?next=/presentations/new"
          title="A presentation or pitch"
          body="Add your slides. Rehearse against the clock, see where you run long, and face tough questions from the room."
          cta="Set up a presentation"
          delay="0.2s"
        >
          <div className="flex justify-center gap-2.5">
            <MiniSlide title="Q1 roadmap" dark />
            <MiniSlide title="Three bets for Q1" drop={8} />
            <MiniSlide title="Approve the Q1 roadmap and two hires." />
          </div>
          <div className="mt-[22px] flex gap-[3px]" aria-hidden>
            {PLANNED.map((p, i) => (
              <span key={i} className={`h-2.5 rounded-[2px] ${ACTUAL[i] > p + 15 ? "bg-red" : "bg-blue"}`} style={{ flex: p }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>Time per slide</span>
            <span className="text-red-soft">Slide 4 ran long</span>
          </div>
        </Choice>
      </div>
      <div className="mt-[22px] flex items-center justify-between rounded-xl bg-panel px-5 py-4 text-sm shadow-[inset_0_0_0_1px_var(--color-line)]">
        <span>
          <b className="font-semibold">Your free trial:</b>{" "}
          <span className="text-muted">10 minutes of interview practice and 5 minutes of pitch rehearsal, with full feedback.</span>
        </span>
        <span className="text-muted">We never judge your accent.</span>
      </div>
      <Link href="/welcome/start?next=/" className="mt-4 self-start text-sm font-semibold text-blue-soft hover:underline">
        Look around the demo first
      </Link>
    </div>
  );
}
