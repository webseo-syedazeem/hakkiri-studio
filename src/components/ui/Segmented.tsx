"use client";

import clsx from "clsx";
import { useId } from "react";

/** A segmented choice (radio group) styled like the designs. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
  fullWidth = false,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  fullWidth?: boolean;
}) {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={clsx(
        "gap-0.5 rounded-[10px] bg-panel-2 p-[3px] shadow-[inset_0_0_0_1px_var(--color-line)]",
        fullWidth ? "flex w-full" : "inline-flex",
        className,
      )}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <label
            key={o.value}
            className={clsx(
              "cursor-pointer whitespace-nowrap rounded-[7px] text-[13px] font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue",
              fullWidth ? "flex-1 px-2 py-1.5 text-center flex items-center justify-center" : "px-[13px] py-2",
              on ? "bg-blue-fill text-white shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            <input type="radio" name={name} value={o.value} checked={on} onChange={() => onChange(o.value)} className="sr-only" />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}
