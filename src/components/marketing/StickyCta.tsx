"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";

/**
 * On phones, once the top of the page has scrolled away, the main button
 * stays in reach at the bottom of the screen. Hidden while the hero's own
 * button is on screen, so it never shows twice.
 */
export function StickyCta({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero-h")?.closest("section");
    if (!hero || typeof IntersectionObserver === "undefined") return setShow(true);
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <div aria-hidden className="h-20 sm:hidden" />
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-white/85 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-300 sm:hidden",
          show ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
        aria-hidden={!show}
      >
        <Link
          href="/signup"
          tabIndex={show ? 0 : -1}
          className="inline-flex w-full items-center justify-center rounded-full bg-mk-cta px-5 py-3 text-[16px] font-medium text-white transition-colors hover:bg-mk-cta-hover"
        >
          {label}
        </Link>
      </div>
    </>
  );
}
