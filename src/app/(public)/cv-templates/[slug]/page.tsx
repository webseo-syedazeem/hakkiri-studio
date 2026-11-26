import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateDetail } from "@/components/marketing/TemplateDetail";
import { catalogue, templateBySlug, templateMeta, templateSlug } from "@/lib/cv/render/templates";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return catalogue().map((t) => ({ slug: templateSlug(t) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = templateBySlug((await params).slug);
  return t ? templateMeta(t, "cv") : {};
}

export default async function CvTemplatePage({ params }: Props) {
  const t = templateBySlug((await params).slug);
  if (!t) notFound();
  return <TemplateDetail t={t} kind="cv" />;
}
