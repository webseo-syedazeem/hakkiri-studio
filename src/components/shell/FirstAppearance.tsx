"use client";

import { useEffect, useRef, useState } from "react";
import { applyAppearance, saveAppearance, savedAppearance, type Appearance } from "@/lib/theme";

/**
 * First sign-in (design spec v3 §07): a one-time, explicit appearance choice,
 * so moving from the light public site into the dark workspace is never an
 * unexplained jump. Shown only when no preference is saved; once chosen it is
 * applied at once, saved, and never asked again. Until then the rest of the
 * welcome screen waits behind it.
 */
export function FirstAppearance({ children }: { children: React.ReactNode }) {
  // null until the browser has been read, so the server render never flashes the choice at someone who has made it.
  const [needed, setNeeded] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setNeeded(savedAppearance() === null);
  }, []);

  useEffect(() => {
    if (needed) heading.current?.focus();
  }, [needed]);

  function choose(theme: Appearance) {
    applyAppearance(theme);
    if (saveAppearance(theme)) {
      setNeeded(false);
      return;
    }
    // The choice still applies now; only remembering it failed.
    setFailed(true);
  }

  if (needed === null) return null;
  if (!needed) return <>{children}</>;

  return (
    <div className="mx-auto w-full max-w-[840px] py-2" data-testid="first-appearance">
      <h1 ref={heading} tabIndex={-1} className="text-[25px] font-bold tracking-[-0.02em] outline-none sm:text-[30px]">
        Welcome to Hakkiri
      </h1>
      <p className="mt-1.5 text-[15px] text-muted">Choose how your workspace looks.</p>

      <section aria-labelledby="appearance-title" className="mt-6 rounded-[14px] bg-panel p-4 shadow-[inset_0_0_0_1px_var(--color-line)] sm:p-8">
        <h2 id="appearance-title" className="text-[17px] font-semibold">
          Appearance
        </h2>
        <p className="mt-1.5 text-[14px] text-ink">Hakkiri opens in dark. Switch to light any time under Appearance.</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ThemeOption theme="light" label="Use light" primary onChoose={choose} />
          <ThemeOption theme="dark" label="Keep dark" onChoose={choose} />
        </div>

        {failed ? (
          <p role="alert" className="mt-4 text-[13px] text-red-soft">
            Your choice is applied, but this browser wouldn’t save it, so you may be asked again next time. You can still change it under Appearance.{" "}
            <button type="button" className="font-semibold text-blue-soft underline" onClick={() => setNeeded(false)}>
              Continue
            </button>
          </p>
        ) : (
          <p className="mt-4 text-[13px] text-muted">You can change this preference any time.</p>
        )}
      </section>
    </div>
  );
}

/** One appearance: a small picture of the workspace in it, and the button that chooses it. */
function ThemeOption({ theme, label, primary = false, onChoose }: { theme: Appearance; label: string; primary?: boolean; onChoose: (t: Appearance) => void }) {
  const light = theme === "light";
  return (
    <div className="flex flex-col gap-3 rounded-[12px] p-3 shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
      <div aria-hidden className={`grid h-[120px] grid-cols-[1fr_3fr] gap-2 rounded-[9px] p-2.5 ${light ? "bg-[#f5f7fa]" : "bg-[#16171e]"}`}>
        <div className={`rounded-md ${light ? "bg-white shadow-[inset_0_0_0_1px_#d7dee8]" : "bg-[#22232c]"}`} />
        <div className="grid grid-rows-[1fr_1fr] gap-2">
          <div className={`rounded-md ${light ? "bg-white shadow-[inset_0_0_0_1px_#d7dee8]" : "bg-[#22232c]"}`} />
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded-md ${light ? "bg-white shadow-[inset_0_0_0_1px_#d7dee8]" : "bg-[#22232c]"}`} />
            <div className={`rounded-md ${light ? "bg-white shadow-[inset_0_0_0_1px_#d7dee8]" : "bg-[#22232c]"}`} />
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChoose(theme)}
        className={
          primary
            ? "min-h-[44px] rounded-[11px] bg-blue-fill px-4 text-[14px] font-semibold text-white transition-colors hover:bg-blue-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue"
            : "min-h-[44px] rounded-[11px] bg-panel-2 px-4 text-[14px] font-semibold text-ink shadow-[inset_0_0_0_1px_#777d95] transition-colors hover:bg-[#292b37] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue"
        }
      >
        {label}
      </button>
    </div>
  );
}
