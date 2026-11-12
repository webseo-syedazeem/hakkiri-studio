/**
 * Plans and prices (launch prices, October 2026). The landing page shows
 * these, and Stripe will charge them. See the "Hakkiri pricing and cost per
 * user" doc for the reasoning.
 *
 * Paid plans are capped in practice hours, not interviews: interviews run
 * from 10 to 60 minutes, and cost follows time (about 1p a minute in AI
 * services, £0.63 an hour). Every minute in a session counts: interviews,
 * drills, rehearsals and Q&A. Reading reports, feedback and the prep sheet
 * doesn't.
 *
 * - Job search: 3 months paid once, 30 hours as one pool (interviews come in
 *   bursts, so the hours aren't split by month). Never renews by itself.
 * - Monthly: 10 hours a month, reset each month, cancel any time.
 * - Extra hours: a top-up on a paid plan, used after the plan's hours. Priced
 *   a little above the plans per hour, so the plans stay the better deal.
 */

export interface Plan {
  id: "free" | "jobsearch" | "monthly";
  name: string;
  /** Pounds, including VAT. */
  price: number;
  period: string;
  /** A line under the price, e.g. the monthly equivalent. */
  note?: string;
  blurb: string;
  features: string[];
  cta: string;
  /** Practice minutes included for the whole period. */
  minutes: number;
  /** True for a single payment that doesn't renew. */
  once?: boolean;
  featured?: boolean;
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "",
    blurb: "Try a short interview for one job.",
    features: ["One 10-minute interview", "Built from your CV and the job spec", "Your report and feedback on every answer", "Or a 10-minute run of your slides"],
    cta: "Start free",
    minutes: 10,
  },
  {
    id: "jobsearch",
    name: "Job search",
    price: 34.99,
    period: "for 3 months",
    note: "£11.66 a month, paid once. Save 22%",
    blurb: "About as long as most job searches take.",
    features: [
      "30 hours of practice, to use any time in 3 months",
      "Interviews from 10 to 60 minutes, for any number of jobs",
      "Natural interviewer voice",
      "Focused practice, re-runs and talking about pay",
      "Your prep sheet and story bank",
      "Presentations and audience Q&A",
      "Paid once. It doesn’t renew",
    ],
    cta: "Get 3 months",
    minutes: 1800,
    once: true,
    featured: true,
    badge: "Best for a job search",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 14.99,
    period: "a month",
    blurb: "For presentations, pitches, or month by month.",
    features: ["10 hours of practice a month", "Everything in Job search", "Cancel any time"],
    cta: "Start monthly",
    minutes: 600,
  },
];

/**
 * The same plans, worded for the page for presenters: Monthly leads (talks
 * come and go all year), and the 3-month plan isn't called "Job search".
 * Prices, hours and limits are identical.
 */
export const PRESENTER_PLANS: Plan[] = ["free", "monthly", "jobsearch"].map((id) => PLANS.find((p) => p.id === id)!).map((p): Plan => {
  if (p.id === "free")
    return { ...p, blurb: "Try one run of your talk.", features: ["A 10-minute run of your slides", "Time on every slide, and where to cut", "Your report and feedback", "Or a 10-minute interview"] };
  if (p.id === "monthly")
    return {
      ...p,
      blurb: "For talks, pitches and presentations all year.",
      features: [
        "10 hours of practice a month",
        "Any number of talks, from PowerPoint, PDF or notes",
        "Time per slide, where to cut, and your opening rewritten",
        "Audience Q&A: curious, sceptical, time-pressed or technical",
        "Natural voices for your audience",
        "Interview practice too",
        "Cancel any time",
      ],
      featured: true,
      badge: "Best for presenters",
    };
  return { ...p, name: "3 months", blurb: "For a run of talks, or a job search.", features: ["30 hours, to use any time in 3 months", "Everything in Monthly", "Paid once. It doesn’t renew"], featured: false, badge: undefined };
});

/** A top-up for a paid plan. */
export const EXTRA_HOURS = { hours: 5, price: 7.99 };

export const priceLabel = (p: number) => (p === 0 ? "£0" : `£${p.toFixed(2).replace(/\.00$/, "")}`);
