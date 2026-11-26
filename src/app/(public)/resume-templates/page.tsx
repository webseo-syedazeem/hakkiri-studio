import type { Metadata } from "next";
import { TemplateGallery } from "@/components/marketing/TemplateGallery";
import { galleryItems } from "@/lib/cv/templates/gallery";

export const metadata: Metadata = {
  title: "Resume templates: 45 ATS-friendly designs | Hakkiri",
  description: "45 resume templates, each one column of real text that applicant tracking systems read correctly. Choose one, then change the fonts, color and spacing. Download as PDF or Word.",
  alternates: { canonical: "/resume-templates", languages: { "en-GB": "/cv-templates", "en-US": "/resume-templates" } },
};

export default function ResumeTemplatesPage() {
  return <TemplateGallery kind="resume" items={galleryItems("us")} />;
}
