"use client";

import clsx from "clsx";
import { useId } from "react";

/** A segmented choice (radio group) styled like the designs. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-0.5 rounded-[10px] bg-panel-2 p-[3px] shadow-[inset_0_0_0_1px_var(--color-line)]">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <label
            key={o.value}
            className={clsx(
              "cursor-pointer whitespace-nowrap rounded-[7px] px-[13px] py-2 text-[13px] font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue",
              on ? "bg-blue-fill text-white" : "text-muted hover:text-ink",
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
