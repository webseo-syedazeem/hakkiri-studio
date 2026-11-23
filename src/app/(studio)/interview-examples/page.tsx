import { requirePageUser } from "@/lib/auth/require";
import { londonToday } from "@/lib/dates";
import { storyBank } from "@/lib/stories/bank";
import { InterviewExamplesView, type LibraryStory } from "@/components/examples/InterviewExamplesView";

export const dynamic = "force-dynamic";

export default async function InterviewExamplesPage() {
  const user = await requirePageUser();
  // The stories held on the person's own interviews: found in their CV at set-up, or built with the story
  // builder. While they have no interview of their own, the bank holds the demo's stories: those are not
  // theirs and are not shown here.
  const bank = storyBank(londonToday(), user.id);
  const stories: LibraryStory[] = bank.demo
    ? []
    : bank.stories.map((s) => ({
        key: s.key,
        title: s.title,
        source: s.source,
        text: s.text ?? "",
        skill: s.skill ?? "",
        interviews: s.interviews,
        missing: s.missing,
        practiseHref: s.practise ? `/mock/${s.practise.interviewId}?q=${encodeURIComponent(s.practise.questionId)}` : null,
      }));
  return <InterviewExamplesView stories={stories} />;
}
