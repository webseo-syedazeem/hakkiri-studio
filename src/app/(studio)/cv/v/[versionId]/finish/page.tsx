import { redirect } from "next/navigation";

/** Finish is a tab inside the editor workbench. */
export default async function FinishRedirectPage({ params }: { params: Promise<{ versionId: string }> }) {
  redirect(`/cv/v/${(await params).versionId}/edit/finish`);
}
