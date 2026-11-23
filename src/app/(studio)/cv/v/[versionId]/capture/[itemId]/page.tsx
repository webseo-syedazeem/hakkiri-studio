import type { Metadata } from "next";
import { Capture } from "@/components/cv/Capture";

export const metadata: Metadata = { title: "Tell me what you did" };

export default async function CapturePage({ params }: { params: Promise<{ itemId: string }> }) {
  return <Capture itemId={(await params).itemId} />;
}
