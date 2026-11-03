import { MicCheck } from "@/components/setup/MicCheck";

/** Mic check (onboarding screen 13): hear yourself before the first session. */
export default async function MicCheckPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return <MicCheck next={safe} />;
}
