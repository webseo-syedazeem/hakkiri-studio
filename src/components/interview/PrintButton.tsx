"use client";

import { Button, Icon } from "@/components/ui";

/** Opens the browser's print dialog, where "Save as PDF" is one of the printers. */
export function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <Button
      variant="secondary"
      size="md"
      onClick={() => window.print()}
      className="gap-2 text-xs font-semibold px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-white/90 hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <Icon name="doc" size={14} />
      <span>{label}</span>
    </Button>
  );
}
