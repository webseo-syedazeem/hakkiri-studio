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
          className={clsx(
            "hidden rounded-full px-3 py-1.5 transition-all duration-150 md:inline",
            current
              ? "text-mk-ink font-semibold bg-black/[0.04]"
              : "text-mk-ink/70 hover:text-mk-ink hover:bg-black/[0.03]",
          )}
        >
          {label}
        </Link>
      ))}
      <Link
        href="/"
        className="hidden rounded-full px-3 py-1.5 text-mk-ink/70 transition-all duration-150 hover:text-mk-ink hover:bg-black/[0.03] sm:inline"
      >
        Open Hakkiri
      </Link>
      <Link
        href="/"
        className="ml-1 rounded-full bg-mk-cta px-4 py-1.5 font-medium text-white transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] hover:bg-mk-cta-hover hover:shadow-md hover:shadow-mk-cta/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-cta"
      >
        Start free
      </Link>
    </nav>
  );
}
