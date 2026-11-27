import type { Metadata } from "next";
import { TemplateGallery } from "@/components/marketing/TemplateGallery";
import { galleryItems } from "@/lib/cv/templates/gallery";

export const metadata: Metadata = {
  title: "Resume templates: 20 ATS-friendly designs | Hakkiri",
  description: "20 resume templates of real text with standard headings, written in reading order so applicant tracking systems read them correctly. Choose one, then change the fonts, color and spacing. Download as PDF or Word.",
  alternates: { canonical: "/resume-templates", languages: { "en-GB": "/cv-templates", "en-US": "/resume-templates" } },
};

export default function ResumeTemplatesPage() {
  return <TemplateGallery kind="resume" items={galleryItems("us")} />;
}
