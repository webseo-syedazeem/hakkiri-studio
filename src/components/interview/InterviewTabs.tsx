import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui";

const TABS = [
  { key: "overview", label: "Overview", href: (id: string) => `/interviews/${id}` },
  { key: "mocks", label: "Past interviews", href: (id: string) => `/interviews/${id}/mocks` },
  { key: "prep", label: "Prep sheet", href: (id: string) => `/interviews/${id}/prep` },
] as const;

/** The tabs under an interview's header. The prep sheet shows a lock until your first interview. */
/** Shown on a built-in sample interview, so nobody takes it for a job they saved. */
export function SampleNote() {
  return (
    <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-ink" data-testid="sample-interview-note">
      <span className="font-semibold text-amber-600 dark:text-amber-400">Sample interview.</span> A made-up example so you can try practice; it isn’t one of your jobs.{" "}
      <Link href="/interviews/new" className="font-semibold text-blue-fill hover:underline">
        Add your own job
      </Link>{" "}
      to practise for your real interview.
    </p>
  );
}

export function InterviewTabs({ id, current, prepReady = true, sample = false }: { id: string; current: (typeof TABS)[number]["key"]; prepReady?: boolean; sample?: boolean }) {
  return (
    <>
    {sample && <SampleNote />}
    <nav aria-label="Interview sections" className="mt-6 flex gap-7 border-b border-line">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href(id)}
          aria-current={t.key === current ? "page" : undefined}
          className={clsx("-mb-px flex items-center gap-1.5 border-b-2 pb-3 text-sm font-semibold", t.key === current ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink")}
        >
          {t.label}
          {t.key === "prep" && !prepReady && <Icon name="lock" size={13} className="text-dim" />}
        </Link>
      ))}
    </nav>
    </>
  );
}
