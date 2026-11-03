"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * For a modal dialog: focus moves into it when it opens, Tab stays inside it,
 * and focus goes back to whatever opened it when it closes.
 */
export function useDialogFocus<T extends HTMLElement>(active = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const box = ref.current;
    if (!active || !box) return;
    const before = document.activeElement as HTMLElement | null;
    const items = () => [...box.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    (box.querySelector<HTMLElement>("[data-autofocus]") ?? items()[0])?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = items();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!box.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      if (before && document.contains(before)) before.focus();
    };
  }, [active]);
  return ref;
}
