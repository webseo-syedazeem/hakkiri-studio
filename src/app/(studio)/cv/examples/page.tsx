import type { Metadata } from "next";
import { ExamplesGallery } from "@/components/cv/ExamplesGallery";

export const metadata: Metadata = {
  title: "Example Resumes & CV Templates | Hakkiri Studio",
  description: "Browse verified, high-scoring ATS resume templates across technology, product, healthcare, marketing, and finance.",
};

export default function ExamplesPage() {
  return <ExamplesGallery />;
}
