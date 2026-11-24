import type { Metadata } from "next";
import { Findings } from "@/components/cv/Findings";

export const metadata: Metadata = { title: "CV score" };

export default function FindingsPage() {
  return <Findings />;
}
