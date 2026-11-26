"use client";

import { Button, Icon } from "@/components/ui";

/** Opens the browser's print dialog, where "Save as PDF" is one of the printers. */
export function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <Button
      variant="secondary"
      size="md"
      onClick={() => window.print()}
      className="gap-2 text-xs font-semibold px-4 py-2 rounded-xl border border-line-strong bg-panel hover:bg-panel-2 hover:border-blue-fill/50 text-ink shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-white/90 dark:hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <Icon name="doc" size={14} />
      <span>{label}</span>
    </Button>
  );
}
