import { redirect } from "next/navigation";

/** The company briefing is now part of the interview overview and the prep sheet. */
export default async function BriefingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/interviews/${id}`);
}
