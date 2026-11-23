import { redirect } from "next/navigation";

/** A CV's own address opens its builder. */
export default async function VersionPage({ params }: { params: Promise<{ versionId: string }> }) {
  redirect(`/cv/v/${(await params).versionId}/edit/contact`);
}
