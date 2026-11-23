"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useCallback, useEffect } from "react";
import { useDialogFocus } from "@/components/ui/useDialogFocus";
import { Btn } from "./ui";

/**
 * Dialogs live in the address (?panel=name), on the screen that owns them.
 * Opening one adds a history entry, so Back closes it; focus returns to
 * whatever opened it.
 */
export function usePanel() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const panel = params.get("panel") ?? "";
  const open = useCallback(
    (name: string, extra: Record<string, string> = {}) => {
      const next = new URLSearchParams(params.toString());
      next.set("panel", name);
      for (const [k, v] of Object.entries(extra)) next.set(k, v);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, params],
  );
  const close = useCallback(() => {
    const next = new URLSearchParams(params.toString());
    for (const k of ["panel", "item"]) next.delete(k);
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [router, pathname, params]);
  return { panel, item: params.get("item") ?? "", open, close };
}

export function Dialog({ title, onClose, children, actions, wide, readable }: { title: string; onClose: () => void; children: ReactNode; actions?: ReactNode; wide?: boolean; /** A long dialog with nothing in it to tab to: its body can then be focused, so it can be scrolled from the keyboard. */ readable?: boolean }) {
  const ref = useDialogFocus<HTMLDivElement>(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="cv fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="cv-panel flex max-h-[92vh] w-full flex-col sm:rounded-[10px]" style={{ maxWidth: wide ? 720 : 520, borderRadius: undefined }}>
        <div className="cv-panelhead">
          <h2>{title}</h2>
          <Btn kind="quiet" onClick={onClose} aria-label="Close">
            Close
          </Btn>
        </div>
        <div className="cv-pad cv-stack overflow-y-auto" {...(readable ? { tabIndex: 0, role: "region", "aria-label": `${title}: details` } : {})}>
          {children}
        </div>
        {actions && <div className="cv-panelfoot">{actions}</div>}
      </div>
    </div>
  );
}
