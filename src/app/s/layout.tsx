import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/brand/Mark";
import "@/components/cv/cv.css";

/** Shared links are for the people they were sent to: never in search results. */
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } } };

/** A shared CV, read-only: the page, and nothing of the app around it. */
export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mk flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-white text-mk-ink">
      <header className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-2.5 px-4 text-[15px] font-semibold">
          <Link href="/" className="flex items-center gap-2">
            <Mark size={24} />
            Hakkiri
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto flex w-full max-w-4xl grow flex-col px-4 py-6">
        {children}
      </main>
    </div>
  );
}
