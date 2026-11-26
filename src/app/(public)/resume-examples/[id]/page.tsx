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
  const role = pick(spec.role, "us");
  return {
    title: `${role} resume example and cover letter | Hakkiri`,
    description: `${pick(spec.blurb, "us")} A full resume example with its cover letter, written for US employers.`,
    alternates: { canonical: `/resume-examples/${spec.id}`, languages: { "en-GB": `/cv-examples/${spec.id}`, "en-US": `/resume-examples/${spec.id}` } },
  };
}

export default async function ResumeExamplePage({ params }: Props) {
  const spec = exampleById((await params).id);
  if (!spec) notFound();
  return <ExamplePage spec={spec} region="us" />;
}
