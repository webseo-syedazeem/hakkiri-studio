"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/AuthContext";

/** The public site's top links matching the beta landing navigation. */
export function SiteNav() {
  const path = usePathname();
  const { user } = useAuth();
  const isPresent = path === "/present";
  const base = isPresent ? "/present" : "";
  const links: [string, string, boolean][] = [
    ["/", "Interviews", path === "/" || path === "/landing"],
    ["/present", "Presentations", isPresent],
    ["/cv-audit", "Free CV Audit", path.startsWith("/cv-audit")],
    ["/about", "About", path === "/about"],
    ["/blog", "Blog", path.startsWith("/blog")],
    [`${base}#how`, "How it works", false],
    [`${base}#beta`, "Beta", false],
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
      {user ? (
        <div className="flex items-center gap-1.5">
          {user.email === "admin@hakkiri.com" && (
            <Link
              href="/admin"
              className="rounded-full bg-purple-600 hover:bg-purple-500 px-3.5 py-1.5 font-bold text-xs text-white shadow-md shadow-purple-600/30 transition-all hover:scale-[1.04]"
            >
              Admin Portal
            </Link>
          )}
          <Link
            href="/dashboard"
            className="ml-1 rounded-full bg-mk-cta px-4 py-1.5 font-medium text-white transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] hover:bg-mk-cta-hover hover:shadow-md hover:shadow-mk-cta/25"
          >
            Open Studio ({user.initials})
          </Link>
        </div>
      ) : (
        <>
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-1.5 text-mk-ink/70 transition-all duration-150 hover:text-mk-ink hover:bg-black/[0.03] sm:inline"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="ml-1 rounded-full bg-mk-cta px-4 py-1.5 font-medium text-white transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] hover:bg-mk-cta-hover hover:shadow-md hover:shadow-mk-cta/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-cta"
          >
            Sign up free
          </Link>
        </>
      )}
    </nav>
  );
}
