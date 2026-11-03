import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Crumbs } from "@/components/ui";
import { RebuildFlow } from "@/components/interview/RebuildFlow";
import { getInterview } from "@/lib/interviews/store";
import { understandingOf } from "@/lib/interviews/build";
import { findMock } from "@/lib/mocks/store";

export const dynamic = "force-dynamic";

/**
 * /interviews/{id}/rebuild?from={session}   after "Something's wrong": reread, confirm, rebuild, start
 * /interviews/{id}/rebuild?edit=1           "Not right? Edit it" from the overview
 */
export default async function RebuildPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string; edit?: string }> }) {
  const { id } = await params;
  const { from } = await searchParams;
  const interview = getInterview(id);
  if (!interview) notFound();
  const stopped = from ? findMock(from) : undefined;
  if (from && (!stopped || stopped.interviewId !== interview.id || stopped.status !== "stopped")) redirect(`/interviews/${interview.id}`);
  const micOk = (await cookies()).get("hk_mic_ok")?.value === "1";
  const attempt = (interview.rebuilds ?? 0) + 1;

  return (
    <div className="flex grow flex-col">
      <header className="animate-rise">
        <Crumbs items={[{ label: `${interview.company} interview`, href: `/interviews/${interview.id}` }, { label: from ? "Something’s wrong" : "What Hakkiri understood" }]} />
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">{from ? "Let’s fix your questions" : "Check what Hakkiri understood"}</h1>
        <p className="mt-1 max-w-[760px] text-sm text-muted">
          {from
            ? "Hakkiri rereads your documents with your feedback and shows you what it changed. Confirm or edit it, and a fresh interview starts with new questions."
            : "Change anything that’s wrong about the job. The questions you haven’t heard are rebuilt to match."}
        </p>
      </header>
      <RebuildFlow interviewId={interview.id} sessionId={stopped?.id} current={understandingOf(interview)} rules={interview.rules ?? []} attempt={attempt} micOk={micOk} company={interview.company} />
    </div>
  );
}
