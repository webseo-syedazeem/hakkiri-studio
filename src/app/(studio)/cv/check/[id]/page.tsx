import type { Metadata } from "next";
import { CheckReport } from "@/components/cv/CheckReport";

export const metadata: Metadata = { title: "Your report" };

/** The report for one check: the audit, the cover letter's checks and the job match. */
export default async function CheckReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CheckReport id={id} />;
}
