"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

/** Delete an interview (or a presentation) and everything in it, with a second click to confirm (no pop-ups). */
export function DeleteInterview({ id, company, kind = "interview" }: { id: string; company: string; kind?: "interview" | "presentation" }) {
  const isTalk = kind === "presentation";
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  if (!asking) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setAsking(true)}>
        {isTalk ? "Delete presentation" : "Delete interview"}
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2 text-[13px]" role="group" aria-label="Confirm delete">
      <span className={problem ? "text-red-soft" : "text-muted"}>{problem ?? (isTalk ? `Delete ${company}, its slides and every run?` : `Delete ${company}, your CV text and every answer?`)}</span>
      <Button
        size="sm"
        disabled={busy}
        className="text-red-soft"
        onClick={async () => {
          setBusy(true);
          const res = await fetch(`/api/${isTalk ? "presentations" : "interviews"}/${id}`, { method: "DELETE" }).catch(() => null);
          if (res?.ok) {
            router.push(isTalk ? "/presentations" : "/interviews");
            router.refresh();
          } else {
            setProblem("That couldn’t be deleted. Try again.");
            setBusy(false);
          }
        }}
      >
        Yes, delete
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setAsking(false)}>
        Keep it
      </Button>
    </div>
  );
}
