import type { Metadata } from "next";
import { FromCheck } from "@/components/cv/FromCheck";

export const metadata: Metadata = { title: "Opening your CV in the builder" };

/** "Open in CV Builder" on a free check: starts a CV from the text that was checked. */
export default async function FromCheckPage({ params, searchParams }: { params: Promise<{ auditId: string }>; searchParams: Promise<{ then?: string }> }) {
  const { auditId } = await params;
  const { then } = await searchParams;
  return <FromCheck auditId={auditId} then={then === "tailor" || then === "letter" || then === "findings" ? then : undefined} />;
}
