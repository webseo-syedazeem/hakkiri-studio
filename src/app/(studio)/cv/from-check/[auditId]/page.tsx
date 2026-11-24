import type { Metadata } from "next";
import { FromCheck } from "@/components/cv/FromCheck";

export const metadata: Metadata = { title: "Opening your CV in the builder" };

/** "Open in CV Builder" on a free check: starts a CV from the text that was checked. */
export default async function FromCheckPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = await params;
  return <FromCheck auditId={auditId} />;
}
