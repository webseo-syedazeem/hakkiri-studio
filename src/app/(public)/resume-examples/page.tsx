import type { Metadata } from "next";
import { ExamplesIndex } from "@/components/marketing/ExamplePage";

export const metadata: Metadata = {
  title: "Resume examples with cover letters, by industry | Hakkiri",
  description: "Example resumes and cover letters for US jobs, by industry. Each one passes the same checks as your own: spelling, plain wording and a clean read by screening software.",
  alternates: { canonical: "/resume-examples", languages: { "en-GB": "/cv-examples", "en-US": "/resume-examples" } },
};

export default function ResumeExamplesPage() {
  return <ExamplesIndex region="us" />;
}
