import { MicCheck } from "@/components/setup/MicCheck";
import { requirePageUser } from "@/lib/auth/require";

/** Mic check (onboarding screen 13): hear yourself before the first session. */
export default async function MicCheckPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  await requirePageUser();
  const { next } = await searchParams;
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return <MicCheck next={safe} />;
}
