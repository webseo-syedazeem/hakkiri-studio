import { notFound } from "next/navigation";
import { AudienceQA } from "@/components/pitch/AudienceQA";
import { getPresentation, listQa } from "@/lib/pitch/store";
import { AUDIENCE_TO, QA_QUESTIONS } from "@/lib/pitch/labels";
import { DEMO_PRESENTATION_ID } from "@/lib/pitch/demo";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

/** /qa/{id}: audience Q&A for a presentation (design screen 14). ?style=technical picks the audience. */
export default async function QaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ style?: string }> }) {
  const user = await requirePageUser();
  const { id } = await params;
  const { style } = await searchParams;
  const p = getPresentation(id, user.id);
  if (!p) notFound();
  const styles = ["curious", "sceptical", "time-pressed", "technical"] as const;
  const chosen = styles.find((s) => s === style) ?? p.qaStyle ?? "sceptical";
  const demo = p.id === DEMO_PRESENTATION_ID ? listQa(p.id, user.id)[0] : undefined;
  return (
    <AudienceQA
      presentationId={p.id}
      heading={`${p.title}, ${AUDIENCE_TO[p.audience].replace(/^the /, "")}`}
      audience={p.audience}
      defaultStyle={chosen}
      slides={p.slides}
      questionCount={QA_QUESTIONS}
      demoReportHref={demo ? `/presentations/${p.id}/qa/${demo.id}` : null}
    />
  );
}
