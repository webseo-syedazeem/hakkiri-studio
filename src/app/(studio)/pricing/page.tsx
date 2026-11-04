"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui";

const TIERS = [
  {
    id: "annual",
    name: "Annual Professional",
    popular: true,
    price: "£69.99",
    period: "/ year",
    subtext: "Equivalent to £5.83 / month · 7-day free trial included",
    savings: "SAVE 41%",
    cta: "Start 7-Day Free Trial",
    features: [
      "Full access to all 7 Communication Gym workstations",
      "Unlimited adaptive AI mock interviews with follow-up probing",
      "Slide-by-slide rehearsal timing & pacing detection",
      "Full 4-Pillar Executive Speech Scorecard after every session",
      "Instant filler word & crutch detection with coached retries",
      "Zero Accent Bias acoustic evaluation guarantee",
      "Private local recording retention & GDPR export controls",
    ],
  },
  {
    id: "monthly",
    name: "Monthly Flexible",
    popular: false,
    price: "£9.99",
    period: "/ month",
    subtext: "Billed monthly · Cancel anytime with 1 click",
    cta: "Subscribe Monthly",
    features: [
      "Access to all 7 Communication Gym workstations",
      "Adaptive AI mock interviews & slide decks",
      "4-Pillar Executive Speech Scorecard",
      "Filler word & crutch phrase detection",
      "Standard studio acoustic engine",
    ],
  },
];

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<string>("annual");
  const [activated, setActivated] = useState<boolean>(false);

  return (
    <div className="mx-auto max-w-5xl py-6 space-y-10 animate-fade-in">
      <div className="text-center space-y-3">
        <span className="rounded-full bg-blue/15 px-3 py-1 text-xs font-extrabold text-blue-soft border border-blue/20 uppercase tracking-wider">
          Membership & Upgrades
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
          Unlock Full Executive Agility.
        </h1>
        <p className="text-base md:text-lg text-muted max-w-2xl mx-auto">
          Master high-stakes interviews, executive pitch decks, and daily articulation drills with accent-neutral AI evaluation.
        </p>
      </div>

      {activated && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center text-emerald-400 font-bold">
          ✓ Your 7-day free trial is now active! You have full unlimited access to all features.
        </div>
      )}

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {TIERS.map((tier) => {
          const isSelected = selectedTier === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={clsx(
                "cursor-pointer rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between relative",
                isSelected
                  ? "border-blue bg-[#161726] shadow-2xl ring-2 ring-blue/40 -translate-y-1"
                  : "border-white/[0.08] bg-panel/90 hover:border-white/20"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-fill px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
                  Most Popular · 7-Day Free Trial
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  {tier.savings && (
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      {tier.savings}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-black text-white">{tier.price}</span>
                  <span className="text-sm font-semibold text-muted">{tier.period}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{tier.subtext}</p>

                <div className="mt-8 space-y-3.5 border-t border-white/[0.08] pt-6">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-ink/90">
                      <Icon name="check" size={16} className="text-blue-soft shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTier(tier.id);
                    setActivated(true);
                  }}
                  className={clsx(
                    "w-full rounded-xl py-3.5 text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] cursor-pointer",
                    isSelected
                      ? "bg-blue-fill text-white hover:bg-blue-hover"
                      : "bg-panel-2 text-ink border border-white/10 hover:bg-[#282a35]"
                  )}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="rounded-2xl border border-white/[0.06] bg-booth p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue-soft">
            <Icon name="shield" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Zero Accent Bias Guarantee</h4>
            <p className="text-xs text-muted">
              We never penalize natural accents or voice pitches. 100% money-back guarantee within 14 days.
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
