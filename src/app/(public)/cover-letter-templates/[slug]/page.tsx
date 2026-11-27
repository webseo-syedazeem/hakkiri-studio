import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateDetail } from "@/components/marketing/TemplateDetail";
import { allTemplates, templateBySlug, templateMeta, templateSlug } from "@/lib/cv/render/templates";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  // Every design keeps its page, offered or not, so existing links and search results still open.
  return allTemplates().map((t) => ({ slug: templateSlug(t) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = templateBySlug((await params).slug);
  return t ? templateMeta(t, "letter") : {};
}

export default async function CoverLetterTemplatePage({ params }: Props) {
  const t = templateBySlug((await params).slug);
  if (!t) notFound();
  return <TemplateDetail t={t} kind="letter" />;
}
