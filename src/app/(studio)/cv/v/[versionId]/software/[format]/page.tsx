import type { Metadata } from "next";
import { Software } from "@/components/cv/Software";

export const metadata: Metadata = { title: "Software view" };

export default async function SoftwarePage({ params }: { params: Promise<{ format: string }> }) {
  return <Software format={(await params).format === "docx" ? "docx" : "pdf"} />;
}
