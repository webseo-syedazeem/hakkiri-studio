"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

/** Sends a test alert to the webhook or email in .env.local. */
export function TestAlert() {
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        size="sm"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setNote(null);
          const res = await fetch("/api/alerts/test", { method: "POST" }).catch(() => null);
          const json = (await res?.json().catch(() => null)) as { sentTo?: string[]; message?: string } | null;
          setNote(res?.ok ? `Sent to your ${json?.sentTo?.join(" and ")}. Check it arrived.` : (json?.message ?? "That didn’t send. Try again."));
          setBusy(false);
        }}
      >
        {busy ? "Sending…" : "Send a test alert"}
      </Button>
      <span role="status" className="text-[13px] text-muted">
        {note}
      </span>
    </div>
  );
}
