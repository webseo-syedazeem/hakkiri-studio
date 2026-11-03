import type { Metadata } from "next";
import { isLaunch } from "@/lib/launch";
import { PRESENTER_PLANS } from "@/lib/pricing";
import { COMMON_FAQ, Compare, Device, DraftNote, Faq, Feature, FinalCta, Hero, Pricing, Privacy, PRIVACY_POINTS, Stage, Statement, Steps, StickyCta, TextLink, Tiles } from "@/components/marketing/parts";

export const dynamic = "force-dynamic"; // the draft notes depend on HAKKIRI_LAUNCH at run time

export const metadata: Metadata = {
  title: "Hakkiri · Rehearse your presentation before you give it",
  description: "Add your slides, rehearse out loud against the clock, see exactly where to cut, then take questions from a curious, sceptical, time-pressed or technical audience. Your first 10-minute run is free.",
};

const CTA = "Rehearse your talk free";
const REASSURE = "10 minutes free. No card needed.";

const FAQ: { q: string; a: string }[] = [
  { q: "Does it work with my PowerPoint?", a: "Yes. Add a PowerPoint (.pptx) or a PDF, or paste your notes. From Google Slides or Keynote, download your slides as a PDF first." },
  { q: "Who asks the questions?", a: "An AI audience you choose: curious, sceptical, time-pressed or technical. The questions come from your slides and your last run. Dodge one and they ask again, and a time-pressed exec cuts in after a minute." },
  { q: "What do I get for free?", a: "One 10-minute run of your slides, with the time on every slide, where to cut and your report. No card needed." },
  { q: "Can I use a clicker?", a: "Yes. Change slides with the arrow keys or a presentation clicker. Every slide change is timed." },
  COMMON_FAQ.accent,
  { q: "I’m presenting as part of a job interview. Does it help?", a: "Yes. Rehearse the presentation and take questions on it, then practise the interview itself, built from the job description and your CV. Every paid plan covers both." },
  COMMON_FAQ.needs,
  { q: "What happens to my slides and recordings?", a: "They’re used only to run your practice. Recordings are deleted after the time you choose, and you can download or delete everything from Settings at any time. Your slides are never shared or used to train AI." },
  COMMON_FAQ.hours,
  COMMON_FAQ.renew,
];

/** The page for presenters: the same app and plans, led by presentations and pitches. */
export default function PresentPage() {
  return (
    <div>
      <DraftNote show={!isLaunch()} />

      <Hero
        kicker="Presentation practice, built around your slides"
        title="Rehearse your presentation before you give it."
        body="Add your slides. Practise out loud against the clock, see exactly where to cut, then take the questions you’re dreading."
        cta={CTA}
        reassure={REASSURE}
        secondary={{ href: "#how", label: "See how it works" }}
      >
        <Device src="/landing/rehearse.webp" width={2880} height={1600} priority alt="Rehearsing a 12-slide Q1 roadmap: the current slide, total time 0:49 of 10:00, this slide’s timer against its plan, the point it needs to land, and time per slide." />
      </Hero>

      <Statement
        title="Most talks run long. Find out where before your audience does."
        body="Running it through in your head skips the hard parts: the slide that takes three minutes, the point that never lands, the question you can’t answer. Hakkiri times every slide and asks the questions out loud."
        points={[
          { icon: "play", text: "Every slide timed against your plan" },
          { icon: "flag", text: "The points you missed, and where to cut" },
          { icon: "mic", text: "Questions from the audience you’ll face" },
        ]}
      />

      <Steps
        title="Ready in three steps."
        steps={[
          { title: "Add your slides", body: "Drop in a PowerPoint or PDF, or paste your notes. Say who’s listening and what you want them to do. Hakkiri suggests a time for each slide and the point it needs to land." },
          { title: "Rehearse against the clock", body: "Give the talk out loud and change slides as you go. Every slide is timed, and the timers turn red when you run over." },
          { title: "Cut, fix, then take questions", body: "See where to cut and which points you missed, run it again, then answer questions from the kind of audience you’ll face." },
        ]}
        cta={CTA}
        reassure={REASSURE}
      />

      <Feature
        id="plan"
        kicker="Your plan"
        title="A time and a point for every slide."
        body="Hakkiri suggests how long each slide should take and the one point it needs to land, adding up to your time limit exactly. Change any of it before you start."
        points={["PowerPoint, PDF or your notes", "Who’s listening, and what you want them to do", "A warning when a slide will run long", "Pick who asks questions afterwards"]}
        mist
        shot={<Device src="/landing/plan.webp" width={2710} height={1702} alt="Setting up a talk: the slides, who’s listening, the ask, the time limit and date, the audience for questions, and a suggested time for each of 12 slides." />}
      />

      <Feature
        kicker="After every run"
        title="Know exactly where to cut."
        body="Time on every slide against your plan, the points you missed, scores for your opening, message and ask, and your opening rewritten from your own words."
        points={["“1:40 over, cut here” on the slide that ran long", "Each key point checked against what you said", "One fix for the next run", "Hear any slide back"]}
        shot={<Device src="/landing/run.webp" width={2710} height={2012} alt="A run report: 11:20 against a 10-minute limit, time on each of 12 slides with “1:40 over, cut here” on slide 4, scores from opening to delivery, one fix, and the opening rewritten." />}
      />

      <Feature
        kicker="Your readiness"
        title="Know when you’re ready."
        body="Each run is scored on your opening, your message and ask, your timing and your answers. Ready means two full runs in a row at 4 or more, inside your time limit."
        mist
        shot={<Device src="/landing/readiness.webp" width={2710} height={550} alt="A presentation after three runs: Not ready yet, with the opening ready, the message and ask nearly there, timing not yet, and Q&A nearly there." />}
      />

      <Stage
        kicker="Audience Q&A"
        title="Then take the questions you’re dreading."
        body="Pick the room. The questions come from your slides and your last run, and if you dodge one, they ask again. Every answer is scored, with a stronger version of your weakest."
        uses={["Curious", "Sceptical", "Time-pressed exec", "Technical expert"]}
        main={<Device src="/landing/qa.webp" width={2710} height={1502} fade alt="A Q&A report for a sceptical finance director: four questions with scores, one asked again, the first answer marked up, and a stronger version of the weakest answer." />}
      />

      <Tiles
        title="Built for the talks that matter."
        mist={false}
        small={[
          { icon: "mic", title: "Nail the first minute", body: "Practise just your opening. It’s scored on hook and relevance, and rewritten from your own words." },
          { icon: "repeat", title: "Fix one slide at a time", body: "Re-run the slide that ran long, without giving the whole talk again." },
          { icon: "present", title: "For every kind of talk", body: "Interview presentations, sales and investor pitches, team updates and reviews, conference talks." },
          { icon: "brief", title: "Presenting at an interview?", body: "Rehearse the presentation, then practise the interview itself. One plan covers both." },
        ]}
      />

      <Compare
        title="Better than running it in your head. A fraction of a coach."
        body="Rehearse out loud, against the clock, with an audience that asks back, as often as you need."
        columns={["Hakkiri", "Rehearsing alone", "A speaking coach"]}
        rows={[
          { label: "Every slide timed against your plan", values: ["yes", "no", "some"] },
          { label: "Where to cut, slide by slide", values: ["yes", "no", "yes"] },
          { label: "Questions from a sceptical audience", values: ["yes", "no", "yes"] },
          { label: "Your opening rewritten in your own words", values: ["yes", "no", "some"] },
          { label: "Rehearse tonight, as often as you need", values: ["yes", "yes", "no"] },
          { label: "Price", values: ["Free to start", "Free", "Paid by the session"] },
        ]}
      />

      <Pricing
        title="Less than one hour with a coach."
        intro="Start with a free run. Go month by month for talks all year, or take 3 months, paid once. Every paid plan includes interview practice too."
        plans={PRESENTER_PLANS}
        promises={["No card needed for the free run", "Cancel Monthly any time", "3 months is paid once and never renews"]}
        hoursLine="An hour is about six run-throughs of a 10-minute talk."
        hoursPoints={[
          "Hours count only while you practise: rehearsals, Q&A, interviews and drills.",
          "A full run takes as long as your talk. One slide or the opening takes a minute or two.",
          "Reading your reports and feedback is free.",
          "Monthly hours reset each month. 3-month hours last all 3 months.",
        ]}
      />

      <Privacy points={PRIVACY_POINTS} />
      <Faq items={FAQ} />
      <section aria-label="Interview practice" className="bg-mk-mist pb-16 text-center">
        <p className="text-[17px] text-mk-slate">
          Got a job interview coming up instead? <TextLink href="/landing">See interview practice</TextLink>
        </p>
      </section>
      <FinalCta title="Your talk is coming. Walk in ready." body="Rehearse it tonight, out loud, against the clock." cta={CTA} reassure={REASSURE} />
      <StickyCta label={CTA} />
    </div>
  );
}
