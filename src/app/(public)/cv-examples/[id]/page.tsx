import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExamplePage } from "@/components/marketing/ExamplePage";
import { pick } from "@/lib/cv/examples/build";
import { EXAMPLES, exampleById } from "@/lib/cv/examples/index";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return EXAMPLES.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const spec = exampleById((await params).id);
  if (!spec) return {};
  const role = pick(spec.role, "uk");
  return {
    title: `${role} CV example and cover letter | Hakkiri`,
    description: `${pick(spec.blurb, "uk")} A full CV example with its cover letter, written for UK employers.`,
    alternates: { canonical: `/cv-examples/${spec.id}`, languages: { "en-GB": `/cv-examples/${spec.id}`, "en-US": `/resume-examples/${spec.id}` } },
  };
}

export default async function CvExamplePage({ params }: Props) {
  const spec = exampleById((await params).id);
  if (!spec) notFound();
  return <ExamplePage spec={spec} region="uk" />;
}
