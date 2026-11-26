import type { Metadata } from "next";
import { TemplateGallery } from "@/components/marketing/TemplateGallery";
import { galleryItems } from "@/lib/cv/templates/gallery";

export const metadata: Metadata = {
  title: "CV templates: 45 ATS-friendly designs | Hakkiri",
  description: "45 CV templates, each one column of real text that screening software reads correctly. Choose one, then change the fonts, colour and spacing. Download as PDF or Word.",
  alternates: { canonical: "/cv-templates", languages: { "en-GB": "/cv-templates", "en-US": "/resume-templates" } },
};

export default function CvTemplatesPage() {
  return <TemplateGallery region="uk" items={galleryItems("uk")} />;
}
