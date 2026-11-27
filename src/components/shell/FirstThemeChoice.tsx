"use client";

import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui";

const KEY = "hk_theme";

/** Applies a theme the way the Appearance switch in the sidebar does: the class, the "dark" class and data-theme together. */
function apply(mode: "light" | "dark") {
  const h = document.documentElement;
  h.classList.toggle("dark", mode === "dark");
  h.classList.toggle("mk", mode === "light");
  h.dataset.theme = mode;
}

/** A small picture of the workspace in one theme. Decoration only: the buttons say the choice in words. */
function Preview({ mode }: { mode: "light" | "dark" }) {
  const dark = mode === "dark";
  return (
    <div aria-hidden="true" className={`rounded-xl p-3 shadow-[inset_0_0_0_1px_var(--color-line)] ${dark ? "bg-[#0d1220]" : "bg-[#f4f6fa]"}`}>
      <div className="flex gap-2">
        <div className={`w-8 rounded-md ${dark ? "bg-[#151c2e]" : "bg-white"}`} />
        <div className="grid grow gap-1.5">
          <div className={`h-2.5 w-1/2 rounded ${dark ? "bg-[#2a3350]" : "bg-[#d9dee8]"}`} />
          <div className={`h-16 rounded-md ${dark ? "bg-[#151c2e]" : "bg-white"} p-2`}>
            <div className="mx-auto h-full w-2/3 rounded-sm bg-white shadow-[0_0_0_1px_#d9dee8]" />
          </div>
        </div>
      </div>
      <p className={`mt-2 text-[12px] font-semibold ${dark ? "text-[#c9d1e6]" : "text-[#2b3245]"}`}>{dark ? "Dark" : "Light"}</p>
    </div>
  );
}

/**
 * The first time someone signs in (DESIGN-SPEC-v3 §07): Hakkiri opens in dark, and says so, with a choice.
 * Shown only when no appearance has been saved on this device; once chosen it is saved and not asked
 * again. Nothing is chosen for the person, and a choice that can't be saved still applies.
 */
export function FirstThemeChoice() {
  const [show, setShow] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  useEffect(() => {
    try {
      // A high-contrast or forced-colours setting is the person's own: it is not asked about over it.
      if (window.matchMedia?.("(forced-colors: active)").matches) return;
      if (localStorage.getItem(KEY) === null) setShow(true);
    } catch {
      /* no storage: nothing can be remembered, so nothing is asked */
    }
  }, []);
  if (!show) return null;
  function choose(mode: "light" | "dark") {
    apply(mode);
    try {
      localStorage.setItem(KEY, mode);
      setShow(false);
    } catch {
      setUnsaved(true);
    }
  }
  return (
    <section aria-labelledby="first-theme-h" className="mx-auto mb-6 w-full max-w-[840px] rounded-[18px] bg-panel p-4 text-ink shadow-[inset_0_0_0_1px_var(--color-line)] sm:p-8" data-testid="first-theme">
      <h2 id="first-theme-h" className="text-[22px] font-semibold tracking-[-0.02em]">
        Welcome to Hakkiri
      </h2>
      <p className="mt-1 text-[15px] text-muted">Choose how your workspace looks.</p>
      <h3 className="mt-5 text-[15px] font-semibold">Appearance</h3>
      <p className="mt-1 text-[14px] text-muted">Hakkiri opens in dark. Switch to light any time under Appearance.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Preview mode="light" />
        <Preview mode="dark" />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" className={buttonClass("primary", "md")} onClick={() => choose("light")}>
          Use light
        </button>
        <button type="button" className={buttonClass("secondary", "md")} onClick={() => choose("dark")}>
          Keep dark
        </button>
      </div>
      <p className="mt-3 text-[13px] text-muted" role={unsaved ? "alert" : undefined}>
        {unsaved ? "This device didn’t let us save your choice, so it applies until you close Hakkiri. You can change it any time under Appearance." : "You can change this preference any time."}
      </p>
    </section>
  );
}
