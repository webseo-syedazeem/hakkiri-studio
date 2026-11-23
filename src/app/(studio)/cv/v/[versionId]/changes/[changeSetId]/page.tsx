import type { Metadata } from "next";
import { Changes } from "@/components/cv/Changes";

export const metadata: Metadata = { title: "What changed" };

export default async function ChangesPage({ params }: { params: Promise<{ changeSetId: string }> }) {
  return <Changes mode={(await params).changeSetId === "report" ? "report" : "proposed"} />;
}
