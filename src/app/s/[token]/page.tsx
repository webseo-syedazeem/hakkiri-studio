import type { Metadata } from "next";
import { SharedCv } from "@/components/cv/SharedCv";
import { sharedDoc } from "@/lib/cv/share";
import { getShare } from "@/lib/cv/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const share = await getShare((await params).token);
  const name = share?.cv.contact.fullName.trim();
  const word = share?.cv.region === "us" ? "Resume" : "CV";
  return { title: share ? (name ? `${name} · ${word}` : word) : "Link not available", robots: { index: false, follow: false } };
}

/**
 * A CV someone has shared, read-only. Turning sharing off removes the link at
 * once; a CV that has been deleted takes its link with it.
 */
export default async function SharedCvPage({ params }: { params: Promise<{ token: string }> }) {
  const share = await getShare((await params).token);
  if (!share) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-semibold">This link is no longer available.</h1>
        <p className="mt-3 text-mk-slate">The person who shared it may have turned sharing off.</p>
      </div>
    );
  }
  return <SharedCv cv={sharedDoc(share)} publishedAt={share.publishedAt} />;
}
