import type { Metadata } from "next";
import { ExportRecordView } from "@/components/cv/Software";

export const metadata: Metadata = { title: "What you sent" };

export default async function ExportRecordPage({ params }: { params: Promise<{ exportId: string }> }) {
  return <ExportRecordView exportId={(await params).exportId} />;
}
