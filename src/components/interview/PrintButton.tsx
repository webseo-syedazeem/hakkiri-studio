"use client";

import { Button, Icon } from "@/components/ui";

/** Opens the browser's print dialog, where "Save as PDF" is one of the printers. */
export function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <Button variant="primary" onClick={() => window.print()}>
      <Icon name="doc" size={16} />
      {label}
    </Button>
  );
}
