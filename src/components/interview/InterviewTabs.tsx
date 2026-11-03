import Link from "next/link";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui";

const TABS: {
  key: "overview" | "mocks" | "prep";
  label: string;
  icon: IconName;
  href: (id: string) => string;
}[] = [
  { key: "overview", label: "Pipeline Overview", icon: "doc", href: (id: string) => `/interviews/${id}` },
  { key: "mocks", label: "Evaluation History", icon: "repeat", href: (id: string) => `/interviews/${id}/mocks` },
  { key: "prep", label: "Executive Prep Sheet", icon: "book", href: (id: string) => `/interviews/${id}/prep` },
];

/** The tabs under an interview's header. */
export function InterviewTabs({
  id,
  current,
  prepReady = true,
}: {
  id: string;
  current: "overview" | "mocks" | "prep";
  prepReady?: boolean;
}) {
  return (
    <nav aria-label="Interview sections" className="mt-6 flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3">
      {TABS.map((t) => {
        const active = t.key === current;
        return (
          <Link
            key={t.key}
            href={t.href(id)}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200",
              active
                ? "bg-blue/15 text-blue-soft border border-blue/30 shadow-sm"
                : "text-muted hover:bg-panel-2 hover:text-ink"
            )}
          >
            <Icon name={t.icon} size={15} className={active ? "text-blue-soft" : "text-muted"} />
            <span>{t.label}</span>
            {t.key === "prep" && !prepReady && (
              <span className="flex items-center gap-1 rounded bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-muted">
                <Icon name="lock" size={11} className="text-dim" />
                <span>Locked</span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
