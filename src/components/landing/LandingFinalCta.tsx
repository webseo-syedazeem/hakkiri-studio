"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";

export function LandingFinalCta() {
  const { user } = useAuth();
  const isLoggedIn = !!user?.id;
  return (
    <section aria-labelledby="final-h" className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 flex flex-col items-center text-center">
        <div className="transition-transform duration-500 hover:scale-110">
          <svg aria-label="Hakkiri" height="52" role="img" viewBox="0 0 64 64" width="52">
            <path d="M49.9 17.2 A24 24 0 1 0 50.4 46.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5.6"></path>
            <path d="M49.9 17.2 A24 24 0 0 1 54.6 27.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2"></path>
            <path d="M6.0 22.9 A26.6 26.6 0 0 1 37.9 6.3" fill="none" opacity="0.7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2"></path>
            <rect fill="currentColor" height="3.6" rx="1.75" width="3.5" x="13.75" y="30.2"></rect>
            <rect fill="currentColor" height="10" rx="1.75" width="3.5" x="18.75" y="27"></rect>
            <rect fill="currentColor" height="17" rx="1.75" width="3.5" x="23.75" y="23.5"></rect>
            <rect fill="currentColor" height="27" rx="1.75" width="3.5" x="28.75" y="18.5"></rect>
            <rect fill="currentColor" height="19" rx="1.75" width="3.5" x="33.75" y="22.5"></rect>
            <rect fill="currentColor" height="11" rx="1.75" width="3.5" x="38.75" y="26.5"></rect>
            <circle cx="55.8" cy="33.6" fill="var(--color-red)" r="3.9"></circle>
          </svg>
        </div>
        <h2
          className="text-[26px] font-bold leading-[1.12] tracking-[-0.025em] [text-wrap:balance] sm:text-[34px] lg:text-[38px] mt-4 max-w-[820px]"
          id="final-h"
        >
          Your interview is coming. Walk in ready.
        </h2>
        <p className="text-[19px] leading-[1.5] text-mk-slate [text-wrap:pretty] sm:text-[21px] mt-5 max-w-[600px]">
          Practice it tonight, out loud, with an AI interviewer who follows up.
        </p>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-mk-cta font-medium text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] hover:bg-mk-cta-hover hover:shadow-lg hover:shadow-mk-cta/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-cta px-6 py-2.5 text-[15px] font-semibold mt-5"
          href={isLoggedIn ? "/dashboard" : "/signup"}
        >
          {isLoggedIn ? "Go to Studio" : "Sign up free"}
        </Link>
        <p className="text-[14px] text-mk-slate mt-4">
          Free AI interview practice for a limited time. No card. Takes about two minutes.
        </p>
      </div>
    </section>
  );
}
