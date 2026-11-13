"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui";

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: IconName;
  badge?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (CustomSelectOption | string)[];
  placeholder?: string;
  icon?: IconName;
  label?: string;
  tooltip?: string;
  required?: boolean;
  className?: string;
  menuClassName?: string;
  size?: "sm" | "md";
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  icon,
  label,
  tooltip,
  required,
  className,
  menuClassName,
  size = "md",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard events (Escape, Arrow Up/Down, Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        const idx = normalizedOptions.findIndex((o) => o.value === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % normalizedOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + normalizedOptions.length) % normalizedOptions.length);
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      const chosen = normalizedOptions[focusedIndex];
      if (chosen) {
        onChange(chosen.value);
        setIsOpen(false);
      }
    }
  };

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && listRef.current && focusedIndex >= 0) {
      const items = listRef.current.querySelectorAll<HTMLElement>("[data-select-item]");
      items[focusedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex, isOpen]);

  return (
    <div className={clsx("relative w-full space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="flex items-center gap-1 text-xs font-semibold text-white">
          <span>{label}</span>
          {required && <span className="text-rose-400">*</span>}
          {tooltip && (
            <span className="text-dim text-[11px] cursor-help" title={tooltip}>
              ⓘ
            </span>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={clsx(
          "group relative flex w-full items-center justify-between rounded-[12px] bg-panel-2 text-xs transition-all duration-200 cursor-pointer outline-none border",
          size === "sm" ? "px-3 py-1.5 min-h-[34px]" : "px-3.5 py-2.5 min-h-[42px]",
          isOpen
            ? "border-indigo-500 bg-[#252838] shadow-[0_0_0_2px_rgba(99,102,241,0.25),0_8px_20px_rgba(0,0,0,0.4)] text-white"
            : "border-line text-ink hover:border-line-strong hover:bg-panel-2/90"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {icon && (
            <span
              className={clsx(
                "shrink-0 transition-colors duration-200",
                isOpen || selectedOption ? "text-indigo-400" : "text-muted group-hover:text-ink"
              )}
            >
              <Icon name={icon} size={14} />
            </span>
          )}

          <span
            className={clsx(
              "truncate font-medium",
              selectedOption ? "text-ink" : "text-muted"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Animated Chevron Arrow */}
        <div
          className={clsx(
            "shrink-0 text-muted transition-transform duration-200 ease-out",
            isOpen && "rotate-180 text-indigo-400"
          )}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className={clsx(
            "absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[200px] max-h-64 overflow-y-auto rounded-[14px] bg-[#161826]/95 backdrop-blur-xl border border-white/12 p-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.65),0_2px_10px_rgba(0,0,0,0.45)] origin-top animate-scale-in",
            menuClassName
          )}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.2) transparent",
          }}
        >
          {normalizedOptions.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused = idx === focusedIndex;

            return (
              <div
                key={opt.value}
                data-select-item
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={clsx(
                  "flex items-center justify-between w-full px-3 py-2 rounded-[9px] text-xs font-medium transition-all duration-150 cursor-pointer select-none",
                  isSelected
                    ? "bg-indigo-600/20 text-indigo-200 font-semibold shadow-[inset_0_0_0_1px_rgba(99,102,241,0.35)]"
                    : isFocused
                    ? "bg-white/[0.08] text-white"
                    : "text-muted hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && (
                    <Icon
                      name={opt.icon}
                      size={13}
                      className={clsx(isSelected ? "text-indigo-400" : "text-muted")}
                    />
                  )}
                  <span className="truncate">{opt.label}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {opt.badge && (
                    <span className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-muted">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <span className="text-indigo-400 font-bold text-xs animate-fade-in">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
