import type { Metadata } from "next";
import { isLaunch } from "@/lib/launch";
import { PLANS } from "@/lib/pricing";
import { COMMON_FAQ, Compare, Device, DraftNote, Faq, Feature, FinalCta, Hero, PRESENTATION_USES, Pricing, Privacy, PRIVACY_POINTS, PROMISES, Stage, Statement, Steps, StickyCta, Tiles } from "@/components/marketing/parts";

export const dynamic = "force-dynamic"; // the draft notes depend on HAKKIRI_LAUNCH at run time

export const metadata: Metadata = {
  title: "Hakkiri · Practise for the interview you actually have",
  description: "Add the job description and your CV, practise out loud with an interviewer who follows up, and find out exactly what to fix before the real thing. Your first 10-minute interview is free. Feedback on what you say, never your accent.",
};

const CTA = "Start your free interview";
const REASSURE = "10 minutes free. No card needed.";

const FAQ: { q: string; a: string }[] = [
  { q: "Is the interviewer a real person?", a: "No. Hakkiri’s interviewer is AI. It asks questions written for your job, listens to your answer and follows up on what you actually said, the way a hiring manager would." },
  { q: "What do I get for free?", a: "One 10-minute interview for one job, built from your CV and the job description, with your report and feedback on every answer. No card needed." },
  COMMON_FAQ.accent,
  { q: "Can I use it for presentations and pitches?", a: "Yes, on every paid plan. Add your slides as a PowerPoint or PDF, or paste your notes. Hakkiri times every slide against your plan, checks your key points landed, rewrites your opening from your own words, and then an audience asks you questions: curious, sceptical, time-pressed or technical." },
  COMMON_FAQ.needs,
  { q: "What happens to my CV and recordings?", a: "They’re used only to run your practice. Recordings are deleted after the time you choose, and you can download or delete everything from Settings at any time. Your data is never shared with employers or used to train AI." },
  COMMON_FAQ.hours,
  COMMON_FAQ.renew,
  { q: "Will it get me the job?", a: "No tool can promise that. Hakkiri helps you practise the questions you’re likely to get, hear where your answers fall short, and walk in prepared." },
];

/** The marketing page: interviews first, presentations second, shown with real screens, then pricing. */
export default function LandingPage() {
  return (
    <div>
      <DraftNote show={!isLaunch()} />

      <Hero
        kicker="Interview practice, built around your job"
        title="Practise for the interview you actually have."
        body="Add the job description and your CV. Hakkiri’s interviewer asks your questions out loud, follows up on what you say, and shows you exactly what to fix before the real thing."
        cta={CTA}
        reassure={REASSURE}
        secondary={{ href: "#how", label: "See how it works" }}
      >
        <Device src="/landing/interview.webp" width={2880} height={1480} priority alt="A live Hakkiri interview: the interviewer asks “Tell me about yourself.” and your answer’s waveform runs against the target length." />
      </Hero>

      <Statement
        title="Question lists don’t ask follow-ups. Interviewers do."
        body="Reading answers off a list feels like preparation, until someone asks “What was your part in that?” Hakkiri builds the interview from your job and your CV, then pushes back the way a real interviewer would."
        points={[
          { icon: "doc", text: "Questions written from the job description and your CV" },
          { icon: "mic", text: "Follow-ups on what you actually said" },
          { icon: "flag", text: "Feedback on every answer, never your accent" },
        ]}
      />

      <Steps
        title="Ready in three steps."
        steps={[
          { title: "Add the job and your CV", body: "Paste the job description or a link, and add your CV. Hakkiri shows what it understood about the role, so you can correct it before you start." },
          { title: "Practise out loud", body: "A real-length interview with follow-up questions. Skip one that doesn’t fit you, or say something’s wrong and it rebuilds the interview." },
          { title: "Fix what matters most", body: "Ready, Nearly or Not yet, your top three fixes, and short focused practice for each. Then run it again and see the before and after." },
        ]}
        cta={CTA}
        reassure={REASSURE}
      />

      <Feature
        id="interviews"
        kicker="Your report"
        title="Ready, Nearly or Not yet. For this job."
        body="After each interview: a verdict for the level of this job, a score for every category, and the three changes that would raise your score most, each with short focused practice."
        points={["A score for each category", "Your top three fixes", "Focused practice for each fix", "Run it again and see the before and after"]}
        mist
        shot={<Device src="/landing/report-full.webp" width={2710} height={1445} alt="A Hakkiri report: Nearly ready at 3.5, a score for each category, the three changes that would raise the score most, and three focused practice options to train them." />}
      />

      <Feature
        kicker="Feedback on every answer"
        title="See exactly where an answer loses them."
        body="Every answer is marked up: where your main point arrived, where you hesitated, and a stronger version built from facts in your own CV."
        points={["When your point arrives, against when it should", "Fillers, pace and length, measured", "A stronger version you can listen to", "One fix to try next time"]}
        shot={<Device src="/landing/feedback.webp" width={2704} height={1180} alt="Feedback on one answer: the waveform with fillers and the late point marked, scores for content, structure and delivery, and the transcript." />}
      />

      <Tiles
        title="Everything you need for the day."
        big={[
          { title: "A story ready for every “Tell me about a time…”", body: "Hakkiri finds the real examples in your CV, shows what each one is missing, and which questions none of them covers yet.", shot: { src: "/landing/stories.webp", alt: "The story bank: stories with their situation, task, action and result, and the kinds of question they cover.", width: 2696, height: 1220 } },
          { title: "One page for the morning of the interview.", body: "Your best answers, which story for which question, what they’ll probe on your CV, and what to ask them.", shot: { src: "/landing/prep.webp", alt: "A one-page prep sheet: the company and the job, your best answers, which story for which question, and questions to ask.", width: 2080, height: 1448 } },
        ]}
        small={[
          { icon: "flag", title: "Talking about pay", body: "Practise “What are you looking for?” for your stage of the process." },
          { icon: "repeat", title: "Easy, Medium or Hard", body: "A friendly first run, a realistic one, or an interviewer who cuts in on long answers." },
          { icon: "speaker", title: "A natural voice", body: "Questions asked out loud, in a natural voice, so it feels like the real thing." },
          { icon: "globe", title: "Never your accent", body: "Scored on what you say and how you structure it, never on how you sound." },
        ]}
      />

      <Stage
        id="presentations"
        kicker="Presentations and pitches, included"
        title="Presenting at your interview? Rehearse it here too."
        body="Add your slides. Every slide is timed against your plan, you see exactly where to cut, then an audience asks the questions you’re dreading."
        uses={PRESENTATION_USES}
        main={<Device src="/landing/rehearse.webp" width={2880} height={1600} alt="Rehearsing a 12-slide Q1 roadmap: the current slide, total time 0:49 of 10:00, this slide’s timer against its plan, the point it needs to land, and time per slide." />}
        pair={[
          { caption: "Know exactly where to cut.", node: <Device src="/landing/run.webp" width={2710} height={2012} imgClass="aspect-[16/10] object-cover object-left-top" alt="A run report: 11:20 against a 10-minute limit, time on each of 12 slides with “1:40 over, cut here” on slide 4, and scores from opening to delivery." /> },
          { caption: "Then take the questions you’re dreading.", node: <Device src="/landing/qa.webp" width={2710} height={1502} imgClass="aspect-[16/10] object-cover object-left-top" fade alt="A Q&A report for a sceptical finance director: four questions with scores, one asked again, and a stronger version of the weakest answer." /> },
        ]}
        link={{ href: "/present", label: "See Hakkiri for presenters" }}
      />

      <Compare
        title="Better than a list of questions. A fraction of a coach."
        body="Practise the way the real interview will go, as often as you need, for less than one session with a coach."
        columns={["Hakkiri", "A list of questions", "A coach"]}
        rows={[
          { label: "Questions written for your job and CV", values: ["yes", "no", "yes"] },
          { label: "Follow-up questions on what you said", values: ["yes", "no", "yes"] },
          { label: "Feedback on every answer", values: ["yes", "no", "some"] },
          { label: "A stronger version, in your own words", values: ["yes", "no", "some"] },
          { label: "Practise tonight, as often as you need", values: ["yes", "yes", "no"] },
          { label: "Price", values: ["Free to start", "Free", "Paid by the session"] },
        ]}
      />

      <Pricing
        title="Less than one hour with a coach."
        intro="Start with a free interview. Take 3 months for your job search, or go month by month. Every paid plan includes presentations and pitches too."
        plans={PLANS}
        promises={PROMISES}
        hoursLine="An hour is about two 30-minute interviews, or six run-throughs of a 10-minute talk."
        hoursPoints={[
          "You choose each interview’s length, from 10 to 60 minutes.",
          "Hours count only while you practise: interviews, focused practice, rehearsals and Q&A.",
          "Reading your reports, feedback and prep sheet is free.",
          "Job search hours last all 3 months. Monthly hours reset each month.",
        ]}
      />

      <Privacy points={PRIVACY_POINTS} />
      <Faq items={FAQ} />
      <FinalCta title="Your interview is coming. Walk in ready." body="Practise it tonight, out loud, with an interviewer who follows up." cta={CTA} reassure={REASSURE} />
      <StickyCta label={CTA} />
    </div>
  );
}
