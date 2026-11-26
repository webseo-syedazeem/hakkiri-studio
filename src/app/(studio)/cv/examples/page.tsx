import type { Metadata } from "next";
import { Catalogue } from "@/components/cv/Catalogue";

export const metadata: Metadata = {
  title: "Find an example or template",
  description: "Example CVs, resumes and cover letters by job and industry, for the UK and the US, and 45 designs to put them in.",
};

export default function ExamplesPage() {
  return <Catalogue />;
}
