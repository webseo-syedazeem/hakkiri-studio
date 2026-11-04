"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui";

const PLANS = [
  {
    id: "free",
    name: "Free",
    subtitle: "Try a short interview for one job.",
    price: "£0",
    period: "",
    rate: "",
    badge: null,
    cta: "Start free",
    primary: false,
    features: [
      "One 10-minute interview",
      "Built from your CV and the job spec",
      "Your report and feedback on every answer",
      "Or a 10-minute run of your slides",
    ],
  },
  {
    id: "job-search",
    name: "Job search",
    subtitle: "About as long as most job searches take.",
    price: "£34.99",
    period: "for 3 months",
    rate: "£11.66 a month, paid once. Save 22%",
    badge: "Best for a job search",
    cta: "Get 3 months",
    primary: true,
    features: [
      "30 hours of practice, to use any time in 3 months",
      "Interviews from 10 to 60 minutes, for any number of jobs",
      "Natural interviewer voice",
      "Drills, re-runs and practice talking about pay",
      "Your prep sheet and story bank",
      "Presentations and audience Q&A",
      "Paid once. It doesn't renew",
    ],
  },
  {
    id: "monthly",
    name: "Monthly",
    subtitle: "For presentations, pitches, or month by month.",
    price: "£14.99",
    period: "a month",
    rate: "",
    badge: null,
    cta: "Start monthly",
    primary: false,
    features: [
      "10 hours of practice a month",
      "Everything in Job search",
      "Cancel any time",
    ],
  },
];

const PROMISES = [
  "No card needed for the free interview",
  "Cancel Monthly any time",
  "3 months is paid once and never renews",
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("job-search");
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const handleSelectPlan = (planId: string, planName: string) => {
    setSelectedPlan(planId);
    if (planId === "free") {
      setActiveNotification("Free plan active: You have 1 free 10-minute rehearsal session.");
    } else {
      setActiveNotification(
        `Selected ${planName} plan. Checkout integration with Stripe will process live transactions once production keys are connected.`
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl py-4 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="rounded-full bg-blue/15 px-3 py-1 text-xs font-extrabold text-blue-soft border border-blue/20 uppercase tracking-wider">
          Membership & Plans
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
          Less than one hour with a coach.
        </h1>
        <p className="text-sm md:text-base text-muted max-w-2xl mx-auto">
          Start with a free interview. Take 3 months for your job search, or go month by month. Every paid plan includes presentations and pitches too.
        </p>
      </div>

      {activeNotification && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm text-emerald-400 font-semibold animate-slide-up flex items-center justify-center gap-2">
          <Icon name="check" size={16} />
          <span>{activeNotification}</span>
        </div>
      )}

      {/* 3 Pricing Cards matching Image 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-3">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id, plan.name)}
              className={clsx(
                "cursor-pointer rounded-3xl p-7 border transition-all duration-300 flex flex-col justify-between relative bg-panel/90 backdrop-blur-sm",
                plan.primary
                  ? "border-blue-fill shadow-2xl ring-2 ring-blue-fill/50 -translate-y-2 bg-[#171829]"
                  : isSelected
                  ? "border-white/40 ring-1 ring-white/20"
                  : "border-white/[0.08] hover:border-white/20"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-fill px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted min-h-[32px]">{plan.subtitle}</p>

                <div className="mt-5 flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-4xl md:text-5xl font-black text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm font-medium text-muted">{plan.period}</span>
                  )}
                </div>

                {plan.rate && (
                  <p className="mt-1 text-xs font-semibold text-blue-soft">{plan.rate}</p>
                )}

                <div className="mt-6 space-y-3 border-t border-white/[0.08] pt-5">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-ink/90 leading-relaxed">
                      <Icon name="check" size={14} className="text-blue-soft shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan.id, plan.name);
                  }}
                  className={clsx(
                    "w-full rounded-full py-3 text-xs font-bold transition-all duration-200 cursor-pointer shadow-md",
                    plan.primary
                      ? "bg-blue-fill text-white hover:bg-blue-hover shadow-blue-fill/30"
                      : "bg-white/[0.06] text-white border border-white/20 hover:bg-white/10"
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Promises Bar from Image 2 */}
      <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-muted font-medium pt-2">
        {PROMISES.map((p) => (
          <li key={p} className="flex items-center gap-2">
            <Icon name="check" size={14} className="text-blue-soft" />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      {/* Zero Accent Bias Guarantee Box */}
      <div className="rounded-2xl border border-white/[0.08] bg-booth p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue/15 text-blue-soft">
            <Icon name="shield" size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Zero Accent Bias Guarantee</h4>
            <p className="text-xs text-muted">
              We never penalize natural accents or voice pitches. Feedback is strictly on structure, answers, and clarity.
            </p>
          </div>
        </div>

        <Link
          href="/studio"
          className="text-xs font-semibold text-blue-soft hover:underline shrink-0"
        >
          Return to Studio Home →
        </Link>
      </div>
    </div>
  );
}
