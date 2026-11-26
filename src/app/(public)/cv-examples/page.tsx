import type { Metadata } from "next";
import { ExamplesIndex } from "@/components/marketing/ExamplePage";

export const metadata: Metadata = {
  title: "CV examples with cover letters, by industry | Hakkiri",
  description: "Example CVs and cover letters for UK jobs, by industry. Each one passes the same checks as your own: spelling, plain wording and a clean read by screening software.",
  alternates: { canonical: "/cv-examples", languages: { "en-GB": "/cv-examples", "en-US": "/resume-examples" } },
};

export default function CvExamplesPage() {
  return <ExamplesIndex region="uk" />;
}
