import type { Metadata } from "next";
import { CheckIntake } from "@/components/cv/CheckIntake";

export const metadata: Metadata = { title: "Check your document", description: "Check a CV or cover letter: a score, how software reads it, and what to fix first. Optionally against a job advert." };

/** "Check my CV or cover letter" and "Check against a job": ?job=1 opens with the job check on; ?type=cover|both; ?method=upload. */
export default async function CheckPage({ searchParams }: { searchParams: Promise<{ job?: string; type?: string; method?: string }> }) {
  const q = await searchParams;
  const docType = q.type === "cover" || q.type === "both" ? q.type : "cv";
  return <CheckIntake start={{ job: q.job === "1", docType, method: q.method === "upload" ? "upload" : "paste" }} />;
}
