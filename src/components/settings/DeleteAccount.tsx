"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { browserData } from "@/lib/browser/owner";
import { DELETE_ACCOUNT_PHRASE } from "@/lib/data/confirm";

const DANGER = "inline-flex h-[38px] items-center rounded-[9px] bg-red px-4 text-sm font-semibold text-booth hover:bg-red-soft disabled:pointer-events-none disabled:opacity-50";
const FIELD = "mt-1.5 h-[38px] w-full max-w-[280px] rounded-[9px] bg-panel-2 px-3 text-sm text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]";

/**
 * "Delete my account": everything "Delete all my data" removes, then the
 * account itself and every device it is signed in on. Separate from deleting
 * data, with its own phrase to type, and the password again where the account
 * has one.
 */
export function DeleteAccount({ userId, hasPassword }: { userId?: string; hasPassword: boolean }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const ready = typed.trim().toLowerCase() === DELETE_ACCOUNT_PHRASE && (!hasPassword || password.length > 0);

  const remove = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: typed, ...(hasPassword ? { password } : {}) }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        setProblem(body.message ?? "That didn’t work. Nothing has been deleted. Try again.");
        return;
      }
      // What this browser holds for the person goes too, then they are taken to the public home page, signed out.
      browserData.forget(userId);
      browserData.release(userId);
      window.location.assign("/?deleted=1");
    } catch {
      setProblem("That didn’t work. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[13px] font-semibold text-red-soft underline-offset-2 hover:underline">
        I want to delete my account
      </button>
    );
  }

  return (
    <div data-testid="delete-account" className="rounded-[12px] bg-red/10 px-4 py-4 shadow-[inset_0_0_0_1px_rgb(255_92_97/0.3)]">
      <h3 className="text-sm font-semibold text-red-soft">Delete my account</h3>
      <p className="mt-1 text-[13px] leading-normal text-muted">
        This deletes everything “Delete all my data” does, then your account itself. You are signed out on every device, and your email address and sign-in are removed. It can’t be undone. If you might want
        a copy of your data, download it first.
      </p>
      <label htmlFor="confirm-account-phrase" className="mt-3 block text-[13px] font-semibold">
        Type <b>{DELETE_ACCOUNT_PHRASE}</b> to confirm
      </label>
      <input id="confirm-account-phrase" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className={FIELD} />
      {hasPassword && (
        <>
          <label htmlFor="confirm-account-password" className="mt-3 block text-[13px] font-semibold">
            Your password
          </label>
          <input id="confirm-account-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" maxLength={128} className={FIELD} />
        </>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={() => void remove()} disabled={!ready || busy} className={DANGER}>
          {busy ? "Deleting…" : "Delete my account"}
        </button>
        <Button
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setTyped("");
            setPassword("");
            setProblem(null);
          }}
        >
          Cancel
        </Button>
      </div>
      <p role="alert" className="mt-2 text-[13px] text-red-soft">
        {problem}
      </p>
    </div>
  );
}
