import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Crumbs } from "@/components/ui";
import { StoryBuilder } from "@/components/interview/StoryBuilder";
import { getInterview } from "@/lib/interviews/store";
import { skillInSentence } from "@/lib/interviews/plan";

export const dynamic = "force-dynamic";

/** /interviews/{id}/story?skill=…&question=…  Build a story for a skill none of yours covers yet. */
export default async function StoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ skill?: string; question?: string; from?: string }> }) {
  const { id } = await params;
  const { skill, question, from } = await searchParams;
  const interview = getInterview(id);
  if (!interview) notFound();
  const gap = (interview.gaps ?? []).find((g) => g.skill === skill) ?? (interview.gaps ?? [])[0];
  const s = (skill || gap?.skill || "").trim();
  const q = (question || gap?.question || "").trim();
  if (!s || q.length < 8) redirect(`/interviews/${interview.id}`);
  const micOk = (await cookies()).get("hk_mic_ok")?.value === "1";
  const back = from === "bank" ? { label: "Story bank", href: "/story-bank" } : { label: `${interview.company} interview`, href: `/interviews/${interview.id}` };

  return (
    <div className="flex grow flex-col">
      <header className="animate-rise">
        <Crumbs items={[back, { label: "Build a story" }]} />
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">A story about {skillInSentence(s)}</h1>
        <p className="mt-1 max-w-[760px] text-sm text-muted">
          {from === "bank" && !(interview.gaps ?? []).some((g) => g.skill === s) ? "Interviews nearly always ask about this, and none of your stories covers it yet." : "The job asks for it, and none of your stories shows it yet."} Answer four quick prompts in a sentence or two each. Think of a time at work, study or anywhere else.
        </p>
      </header>
      <StoryBuilder interviewId={interview.id} skill={s} question={q} micOk={micOk} backHref={back.href} />
    </div>
  );
}
