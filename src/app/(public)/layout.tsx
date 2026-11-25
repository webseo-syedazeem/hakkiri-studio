import Link from "next/link";
import { Mark } from "@/components/brand/Mark";
import { SiteNav } from "@/components/marketing/SiteNav";

/** Public pages (landing, presenters, privacy, terms): white, readable on any screen, no rail. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mk flex min-h-screen flex-col bg-white text-mk-ink w-full max-w-full overflow-x-hidden">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/85 backdrop-blur-xl backdrop-saturate-150 w-full">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.01em] shrink-0">
            <span className="transition-transform duration-300 group-hover:scale-110">
              <Mark size={28} />
            </span>
            Hakkiri
          </Link>
          <SiteNav />
        </div>
      </header>
      <main id="main" className="flex grow flex-col w-full max-w-full overflow-x-hidden">
        {children}
      </main>
      <footer className="bg-mk-mist">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-3 border-t border-mk-line/70 px-4 py-6 text-[12px] text-mk-slate sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="font-medium text-mk-slate">
            © {new Date().getFullYear()} Hakkiri Studio · A trading name of Happy Cheeks Ltd (company no. 15146182).
          </span>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/" className="hover:text-mk-ink transition-colors font-medium">
              Interview practice
            </Link>
            <Link href="/interview-questions" className="hover:text-mk-ink transition-colors font-medium">
              Interview questions
            </Link>
            <Link href="/present" className="hover:text-mk-ink transition-colors font-medium">
              For presenters
            </Link>
            <Link href="/about" className="hover:text-mk-ink transition-colors font-medium">
              About us
            </Link>
            <Link href="/blog" className="hover:text-mk-ink transition-colors font-medium">
              Blog
            </Link>
            <Link href="/privacy" className="hover:text-mk-ink transition-colors font-medium">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:text-mk-ink transition-colors font-medium">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
