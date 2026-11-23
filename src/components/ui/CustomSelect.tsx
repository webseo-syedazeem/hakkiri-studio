"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "./index";

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: IconName;
  badge?: string;
  dotColor?: string;
  description?: string;
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
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  size?: "sm" | "md";
  align?: "left" | "right";
  autoWidth?: boolean;
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
  disabled = false,
  className,
  triggerClassName,
  menuClassName,
  size = "md",
  align = "left",
  autoWidth = false,
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
    if (disabled) return;

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
    <div
      className={clsx(
        "relative space-y-1.5",
        autoWidth ? "inline-block w-auto" : "w-full",
        className
      )}
      ref={containerRef}
    >
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
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={clsx(
          "group relative flex items-center justify-between gap-2.5 rounded-2xl bg-panel-2 text-xs transition-all duration-200 outline-none border",
          autoWidth ? "w-auto" : "w-full",
          size === "sm" ? "px-3 py-1.5 min-h-[34px]" : "px-3.5 py-2.5 min-h-[40px]",
          disabled
            ? "opacity-50 cursor-not-allowed border-line text-muted"
            : isOpen
            ? "border-blue-500/80 bg-panel shadow-[0_0_0_2px_rgba(59,130,246,0.35),0_8px_24px_rgba(0,0,0,0.6)] text-ink"
            : "border-line text-ink hover:border-line-strong hover:bg-panel cursor-pointer shadow-sm active:scale-[0.98]",
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2 min-w-0 pr-1">
          {selectedOption?.dotColor ? (
            <span
              className={clsx(
                "h-2.5 w-2.5 rounded-full shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110",
                selectedOption.dotColor
              )}
            />
          ) : icon ? (
            <span
              className={clsx(
                "shrink-0 transition-colors duration-200",
                isOpen || selectedOption ? "text-blue" : "text-muted group-hover:text-ink"
              )}
            >
              <Icon name={icon} size={14} />
            </span>
          ) : null}

          <span
            className={clsx(
              "truncate font-bold tracking-tight text-xs",
              selectedOption ? "text-ink" : "text-muted"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Animated Chevron Arrow */}
        <div
          className={clsx(
            "shrink-0 text-muted transition-transform duration-250 ease-out",
            isOpen && "rotate-180 text-blue"
          )}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* Animated Glassmorphic Dropdown Menu */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className={clsx(
            "absolute top-[calc(100%+6px)] z-[100] min-w-[220px] max-h-72 overflow-y-auto rounded-2xl bg-[#0c0e1c]/95 backdrop-blur-2xl border border-white/15 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)] origin-top animate-dropdown",
            align === "right" ? "right-0 left-auto" : "left-0",
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
                  "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer select-none active:scale-[0.98]",
                  isSelected
                    ? "bg-blue/20 text-white font-bold border border-blue/40 shadow-sm"
                    : isFocused
                    ? "bg-white/[0.09] text-white"
                    : "text-muted hover:text-ink hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {opt.dotColor && (
                    <span
                      className={clsx(
                        "h-2.5 w-2.5 rounded-full shrink-0 shadow-sm transition-transform duration-150",
                        isSelected && "scale-110",
                        opt.dotColor
                      )}
                    />
                  )}
                  {opt.icon && (
                    <Icon
                      name={opt.icon}
                      size={13}
                      className={clsx(isSelected ? "text-blue" : "text-muted")}
                    />
                  )}
                  <div className="truncate">
                    <span className="truncate block font-semibold">{opt.label}</span>
                    {opt.description && (
                      <span className="text-[10px] text-muted block truncate font-normal mt-0.5">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {opt.badge && (
                    <span
                      className={clsx(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-mono",
                        isSelected
                          ? "bg-blue/30 text-blue-200 border border-blue/40"
                          : "bg-white/[0.08] text-muted border border-white/5"
                      )}
                    >
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <span className="text-blue font-black text-xs animate-scaleIn">
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
