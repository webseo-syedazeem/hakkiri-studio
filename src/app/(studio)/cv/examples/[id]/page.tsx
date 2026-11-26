import type { Metadata } from "next";
import { ExampleDetail } from "@/components/cv/ExampleDetail";

export const metadata: Metadata = { title: "Example" };

export default async function ExamplePage({ params }: { params: Promise<{ id: string }> }) {
  return <ExampleDetail id={(await params).id} />;
}
