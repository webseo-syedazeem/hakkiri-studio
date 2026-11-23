import type { Metadata } from "next";
import { Suspense } from "react";
import { ImportHome } from "@/components/cv/ImportHome";

export const metadata: Metadata = { title: "Check your upload" };

export default async function ImportPage({ params }: { params: Promise<{ importId: string }> }) {
  const { importId } = await params;
  return (
    <Suspense>
      <ImportHome importId={importId} />
    </Suspense>
  );
}
