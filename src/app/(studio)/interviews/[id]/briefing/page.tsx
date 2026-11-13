import { redirect } from "next/navigation";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

/** The company briefing is now part of the interview overview and the prep sheet. */
export default async function BriefingPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageUser();
  const { id } = await params;
  redirect(`/interviews/${id}`);
}
