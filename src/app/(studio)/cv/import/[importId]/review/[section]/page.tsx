import type { Metadata } from "next";
import { Suspense } from "react";
import { ImportReview } from "@/components/cv/ImportReview";

export const metadata: Metadata = { title: "Check your upload" };

export default async function ImportReviewPage({ params }: { params: Promise<{ importId: string; section: string }> }) {
  const { importId, section } = await params;
  return (
    <Suspense>
      <ImportReview importId={importId} stepKey={section} />
    </Suspense>
  );
}
