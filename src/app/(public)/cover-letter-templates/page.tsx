import type { Metadata } from "next";
import { TemplateGallery } from "@/components/marketing/TemplateGallery";
import { galleryItems } from "@/lib/cv/templates/gallery";

export const metadata: Metadata = {
  title: "Cover letter templates: 20 designs that match your CV | Hakkiri",
  description: "20 cover letter templates, each matching a CV template, with every sentence checked against your CV. One page, PDF or Word.",
  alternates: { canonical: "/cover-letter-templates" },
};

export default function CoverLetterTemplatesPage() {
  return <TemplateGallery kind="letter" items={galleryItems("uk")} />;
}
