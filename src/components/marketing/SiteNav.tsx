"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

/** The public site's top links. Pricing and questions stay on the page you're on (presenters or interviews). */
export function SiteNav() {
  const path = usePathname();
  const base = path === "/present" ? "/present" : "/landing";
  const links: [string, string, boolean][] = [
    ["/landing", "Interviews", path === "/landing"],
    ["/present", "Presentations", path === "/present"],
    [`${base}#pricing`, "Pricing", false],
    [`${base}#faq`, "Questions", false],
  ];
  return (
    <nav aria-label="Main" className="flex items-center gap-1 text-[13px] sm:gap-2">
      {links.map(([href, label, current]) => (
        <Link
          key={label}
          href={href}
          aria-current={current ? "page" : undefined}
          className={clsx("hidden rounded-full px-3 py-1.5 transition-colors md:inline", current ? "text-mk-ink" : "text-mk-ink/70 hover:text-mk-ink")}
        >
          {label}
        </Link>
      ))}
      <Link href="/" className="hidden px-3 py-1.5 text-mk-ink/70 hover:text-mk-ink sm:inline">
        Open Hakkiri
      </Link>
      <Link href="/" className="ml-1 rounded-full bg-mk-cta px-4 py-1.5 font-medium text-white transition-colors hover:bg-mk-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-cta">
        Start free
      </Link>
    </nav>
  );
}
