const FAQS = [
  {
    q: "How do I start?",
    a: "Sign up with email or Google, paste the job description and add your CV. Your first mock interview starts in about two minutes.",
  },
  {
    q: "Is it really free? For how long?",
    a: "Yes. Hakkiri is free for everyone while the beta runs, with 10 hours of practice a month, which is about twenty 30-minute interviews. No card is needed.",
  },
  {
    q: "Why is it free?",
    a: "Hakkiri is in beta. It is free while we test it with real users, and the one thing we ask is that you tell us where it is wrong.",
  },
  {
    q: "What makes Hakkiri different from other interview practice?",
    a: "Most tools give you a list of questions or score a recording afterwards. Hakkiri runs a live mock interview built from your job description and CV, asks out loud, follows up on what you actually said, and rewrites every answer into a stronger version in your own words.",
  },
  {
    q: "Is the interviewer a real person?",
    a: "No. The interviewer is AI. It speaks in a natural voice, listens to your answers and asks follow-up questions the way a hiring manager would.",
  },
  {
    q: "What does the beta include?",
    a: "Everything: mock interviews with follow-ups, a report after every interview, feedback on every answer, focused practice, the story bank, your prep sheet, the stages tracker, and presentations with audience Q&A.",
  },
  {
    q: "Which kinds of interview does it cover?",
    a: "Any interview you add a job description for, including behavioral, strengths, competency, technical, situational and motivational questions, public sector values-based interviews, salary questions, and interview presentations. You can practice every stage, from the screening call to the final round.",
  },
  {
    q: "Does it judge my accent?",
    a: "No. Hakkiri scores what you say and how you structure it, never how you sound.",
  },
  {
    q: "Can I use it for presentations and pitches?",
    a: "Yes. Add your slides to rehearse interview presentations, sales pitches, investor pitches, team updates and conference talks. Every slide is timed, and an AI audience asks questions at the end.",
  },
  {
    q: "Can I practice for a specific job?",
    a: "Yes. That is what Hakkiri is built for. Paste the job description for the role you applied for, and every question is written for that job and your CV.",
  },
  {
    q: "What is an AI mock interview?",
    a: "An AI mock interview is a practice interview run by an AI interviewer instead of a person. You answer out loud, the AI asks follow-up questions, and you get feedback on every answer before the real interview.",
  },
  {
    q: "Is Hakkiri the same as Hakkiri.io?",
    a: "No. Hakkiri (hakkiri.studio) is an AI interview practice platform. It is not connected to Hakkiri.io, which is project management software.",
  },
];

export function LandingFaq() {
  return (
    <section aria-labelledby="faq-h" className="scroll-mt-14 bg-mk-mist py-10 sm:py-14" id="faq">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 max-w-[820px]">
        <h2
          className="text-[26px] font-bold leading-[1.12] tracking-[-0.025em] [text-wrap:balance] sm:text-[34px] lg:text-[38px] text-center"
          id="faq-h"
        >
          AI interview practice: your questions, answered.
        </h2>
        <div className="mt-7 divide-y divide-mk-line/80 border-y border-mk-line/80">
          {FAQS.map((faq, idx) => (
            <details key={idx} className="group py-3.5 transition-colors duration-150">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 transition-colors duration-150 hover:text-mk-blue [&::-webkit-details-marker]:hidden">
                <h3 className="text-[15px] sm:text-[16px] font-semibold tracking-[-0.01em]">
                  {faq.q}
                </h3>
                <svg
                  aria-hidden="true"
                  className="shrink-0 text-mk-slate transition-transform duration-300 group-open:rotate-45"
                  fill="none"
                  height="20"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                  width="20"
                >
                  <path d="M12 5v14 M5 12h14"></path>
                </svg>
              </summary>
              <p className="mt-3 max-w-[680px] text-[16px] sm:text-[17px] leading-relaxed text-mk-slate">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
