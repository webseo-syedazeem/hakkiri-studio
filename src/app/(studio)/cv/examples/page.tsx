import type { Metadata } from "next";
import { ExamplesGallery } from "@/components/cv/ExamplesGallery";

export const metadata: Metadata = {
  title: "Example CVs and cover letters",
  description: "Example CVs, resumes and cover letters by industry, for the UK and the US, to read or start from.",
};

export default function ExamplesPage() {
  return <ExamplesGallery />;
}
