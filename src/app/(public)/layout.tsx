import Link from "next/link";
import { Mark } from "@/components/brand/Mark";
import { SiteNav } from "@/components/marketing/SiteNav";

/** Public pages (landing, presenters, privacy, terms): white, readable on any screen, no rail. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mk flex min-h-screen flex-col bg-white text-mk-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em]">
            <Mark size={26} />
            Hakkiri
          </Link>
          <SiteNav />
        </div>
      </header>
      <main id="main" className="flex grow flex-col">
        {children}
      </main>
      <footer className="bg-mk-mist">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-3 border-t border-mk-line/70 px-4 py-6 text-[12px] text-mk-slate sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} Hakkiri Ltd. Hakkiri never judges your accent.</span>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/" className="hover:text-mk-ink">
              Interview practice
            </Link>
            <Link href="/present" className="hover:text-mk-ink">
              For presenters
            </Link>
            <Link href="/privacy" className="hover:text-mk-ink">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:text-mk-ink">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
