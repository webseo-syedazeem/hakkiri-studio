import { redirect } from "next/navigation";

/** Export lives on the Finish tab, beside the layout settings that decide what the file looks like. */
export default async function ExportPage({ params }: { params: Promise<{ versionId: string }> }) {
  redirect(`/cv/v/${(await params).versionId}/edit/finish#files`);
}
