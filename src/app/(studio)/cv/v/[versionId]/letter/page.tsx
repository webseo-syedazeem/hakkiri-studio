import type { Metadata } from "next";
import { LetterScreen } from "@/components/cv/Letter";

export const metadata: Metadata = { title: "Cover letter" };

export default function LetterPage() {
  return <LetterScreen />;
}
