import "server-only";
import type { Interview, Story } from "@/lib/types";
import { aiConfig } from "@/lib/ai/config";
import { ask } from "@/lib/ai/ask";
import { mockAiEnabled } from "@/lib/ai/mock";
import { buildStoryPrompt, checkStory, StorySchema, type StoryInput } from "@/lib/ai/interview/questions";
import { shortTitle } from "@/lib/questions/store";
import { normText } from "@/lib/ai/interview/build-plan";
import { getInterview, updateInterview } from "./store";
import { skillInSentence, toQuestions } from "./plan";

/**
 * The story builder: four quick prompts become one story you can tell in
 * about 90 seconds, in your words, saved to the interview (and the prep
 * sheet), with the question that tests it ready to practise.
 */

const sentence = (s: string) => {
  const t = s.trim().replace(/\s+/g, " ");
  return t ? (/[.!?]$/.test(t) ? t : `${t}.`) : "";
};

/** Without a model: your four answers in story order, result first. */
export function templateStory(input: StoryInput): { title: string; text: string; useFor: string[] } {
  const p = input.parts;
  const lead = sentence(p.result).split(/(?<=[.!?])\s/)[0];
  const text = [lead, sentence(p.situation), sentence(p.task), sentence(p.action), lead === sentence(p.result) ? "" : sentence(p.result)].filter(Boolean).join(" ");
  // A title from what you did: "Rebuilt the SQL checks".
  const did = sentence(p.action).replace(/^I\s+/i, "").split(/[,.;]| and /)[0].trim();
  // Long actions are cut to their first few words, without a dangling "with" or "the".
  const words = did.split(/\s+/).filter(Boolean).slice(0, 7);
  while (words.length > 2 && /^(a|an|the|with|their|my|our|to|of|and|for|in|on|at)$/i.test(words[words.length - 1])) words.pop();
  const short = words.join(" ");
  const title = short.length >= 8 ? short.charAt(0).toUpperCase() + short.slice(1) : input.skill.charAt(0).toUpperCase() + input.skill.slice(1);
  return { title, text, useFor: [`Questions on ${skillInSentence(input.skill)}`, shortTitle(input.question)] };
}

/** Your four answers as one story in your words: Claude when there's a key, otherwise in order, result first. */
export async function draftStory(input: StoryInput): Promise<{ title: string; text: string; useFor: string[] }> {
  if (!mockAiEnabled() && aiConfig.anthropicKey) {
    const { system, user } = buildStoryPrompt(input);
    const drafted = await ask({ model: aiConfig.mainModel, system, user, maxTokens: 900, temperature: 0.3, timeoutMs: 45_000, schema: StorySchema, check: (r) => checkStory(r, input), label: "story" });
    if (drafted) return drafted;
  }
  return templateStory(input);
}

export async function buildStory(interviewId: string, input: StoryInput): Promise<{ story: Story; questionId: string }> {
  const interview = getInterview(interviewId);
  if (!interview) throw new Error("not-found");
  const drafted = await draftStory(input);

  const p = input.parts;
  let questionId = interview.questions.find((q) => normText(q.text) === normText(input.question))?.id;
  let story: Story | null = null;
  updateInterview(interviewId, (i: Interview) => {
    const stories = i.stories ?? [];
    story = {
      id: `s${stories.reduce((n, s) => Math.max(n, Number(s.id.slice(1)) || 0), 0) + 1}`,
      title: drafted.title,
      source: "Built in Hakkiri",
      parts: { situation: Boolean(p.situation.trim()), task: Boolean(p.task.trim()), action: Boolean(p.action.trim()), result: Boolean(p.result.trim()) },
      fits: Math.max(1, drafted.useFor.length),
      useFor: drafted.useFor,
      text: drafted.text,
      skill: input.skill,
    };
    let questions = i.questions;
    if (!questionId) {
      // The question that tests this skill joins your Skills questions, ready to practise.
      const [q] = toQuestions([{ group: "competency", type: "competency", text: input.question, short: shortTitle(input.question) }], { motivation: 0, competency: 1, technical: 0, cv: 0, curveball: 0 }, i.questions);
      if (q) {
        questionId = q.id;
        const closing = questions.filter((x) => x.slot === "closing");
        questions = [...questions.filter((x) => x.slot !== "closing"), { ...q, addedAt: new Date().toISOString() }, ...closing];
      }
    }
    return { ...i, stories: [...stories, story], questions };
  });
  return { story: story!, questionId: questionId! };
}
