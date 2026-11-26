import type { Metadata } from "next";
import { TemplatePicker } from "@/components/cv/TemplatePicker";

export const metadata: Metadata = { title: "Template" };

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  return <TemplatePicker slug={(await params).slug} />;
}
