"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Button, Icon } from "@/components/ui";
import { useDialogFocus } from "@/components/ui/useDialogFocus";
import { feedbackPrompt } from "@/lib/feedback/prompts";

type Mood = "good" | "ok" | "bad";
const MOODS: { id: Mood; label: string; face: string }[] = [
  { id: "good", label: "Yes", face: "😊" },
  { id: "ok", label: "Partly", face: "😐" },
  { id: "bad", label: "No", face: "😞" },
];

/** The beta's Feedback button: a question about this screen, a yes/partly/no, and a note, sent to the team. */
export function FeedbackButton({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<Mood | null>(null);
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );
  const box = useDialogFocus<HTMLDivElement>(open);
  const prompt = feedbackPrompt(pathname);

  const close = () => {
    setOpen(false);
    if (state === "sent") {
      setMood(null);
      setText("");
      setState("idle");
    }
  };

  const send = async () => {
    if (!mood || !text.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          page: pathname,
          mood,
          text,
          screen: prompt.screen,
          lead: prompt.lead,
        }),
      });
      setState(res.ok ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        title="Send feedback"
        className={clsx(
          "flex h-11 w-11 items-center justify-center rounded-xl text-muted transition-colors hover:bg-panel-2",
          className,
        )}
      >
        <Icon name="flag" size={20} />
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
            onClick={close}
          >
            <div
              ref={box}
              role="dialog"
              aria-modal="true"
              aria-labelledby="fb-h"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === "Escape" && close()}
              className="w-full max-w-[440px] rounded-[16px] bg-panel p-6 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.5),inset_0_0_0_1px_var(--color-line)]"
            >
              {state === "sent" ? (
                <>
                  <h2 id="fb-h" className="text-[18px] font-semibold">
                    Thank you
                  </h2>
                  <p className="mt-2 text-[15px] text-muted">
                    We read every note during the beta. It helps more than you’d
                    think.
                  </p>
                  <div className="mt-5 flex justify-end">
                    <Button variant="primary" onClick={close} data-autofocus>
                      Done
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                    {prompt.screen}
                  </p>
                  <h2 id="fb-h" className="mt-1 text-[18px] font-semibold">
                    {prompt.lead}
                  </h2>
                  <div
                    role="radiogroup"
                    aria-label={prompt.lead}
                    className="mt-4 flex gap-2"
                  >
                    {MOODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={mood === m.id}
                        onClick={() => setMood(m.id)}
                        className={clsx(
                          "flex grow items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[14px] transition-colors",
                          mood === m.id
                            ? "bg-panel-2 text-ink shadow-[inset_0_0_0_1.5px_var(--color-blue-fill)]"
                            : "text-muted shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-panel-2",
                        )}
                      >
                        <span aria-hidden="true">{m.face}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <ul className="mt-4 flex flex-col gap-1.5 text-[14px] text-ink/85">
                    {prompt.asks.map((a) => (
                      <li key={a} className="flex gap-2">
                        <span aria-hidden="true" className="text-muted">
                          –
                        </span>
                        {a}
                      </li>
                    ))}
                  </ul>
                  <label className="mt-3 block">
                    <span className="sr-only">Your answers</span>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={5}
                      maxLength={2000}
                      data-autofocus
                      placeholder="Answer whichever of those you can. Specific beats polite."
                      className="w-full resize-none rounded-xl bg-panel-2 px-3.5 py-3 text-[15px] text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-blue-fill"
                    />
                  </label>
                  {state === "failed" && (
                    <p className="mt-2 text-[14px] text-red-500">
                      That didn’t send. Check your connection and try again.
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-[12px] text-muted">
                      We get the page you’re on, and your note. Nothing else.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={close}>Cancel</Button>
                      <Button
                        variant="primary"
                        onClick={send}
                        disabled={!mood || !text.trim() || state === "sending"}
                      >
                        {state === "sending" ? "Sending…" : "Send"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
