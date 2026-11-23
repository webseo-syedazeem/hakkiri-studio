import type { Metadata } from "next";
import { Editor } from "@/components/cv/Editor";

export const metadata: Metadata = { title: "Edit CV" };

export default async function EditCvPage({ params }: { params: Promise<{ versionId: string; section: string }> }) {
  const { versionId, section } = await params;
  return <Editor versionId={versionId} sectionKey={section} />;
}
