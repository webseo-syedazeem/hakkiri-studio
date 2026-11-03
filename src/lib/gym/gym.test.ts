import { describe, expect, it } from "vitest";
import { ACTIVITIES, PROMPTS, ROADMAP_WEEKS } from "./catalog";
import { evaluateSpeechFeedback } from "./evaluator";

describe("Communication Gym Catalog", () => {
  it("includes all 7 MVP agility activities from Hakiri", () => {
    expect(ACTIVITIES.length).toBe(7);
    const slugs = ACTIVITIES.map((a) => a.slug);
    expect(slugs).toContain("think_fast");
    expect(slugs).toContain("cut_it_in_half");
    expect(slugs).toContain("one_minute_expert");
    expect(slugs).toContain("explain_it_simply");
    expect(slugs).toContain("storytelling_gym");
    expect(slugs).toContain("connect_the_dots");
    expect(slugs).toContain("debate_me");
  });

  it("includes high-stakes prompts for activities", () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(7);
    const thinkFastPrompt = PROMPTS.find((p) => p.activitySlug === "think_fast");
    expect(thinkFastPrompt).toBeDefined();
    expect(thinkFastPrompt?.objective).toBeTruthy();
  });

  it("includes the 4-week progression roadmap", () => {
    expect(ROADMAP_WEEKS.length).toBe(4);
    expect(ROADMAP_WEEKS[0].title).toContain("Week 1");
    expect(ROADMAP_WEEKS[0].focus1).toContain("Answer first");
  });
});

describe("4-Pillar Speech Evaluator Service", () => {
  it("evaluates a response and flags corporate crutches", () => {
    const prompt = PROMPTS[0];
    const feedback = evaluateSpeechFeedback({
      prompt,
      transcript: "I would basically tell the stakeholder that, you know, we need more time, if that makes sense.",
      durationSeconds: 30,
    });

    expect(feedback.overallScore).toBeGreaterThanOrEqual(1);
    expect(feedback.overallScore).toBeLessThanOrEqual(5);
    expect(feedback.pillars.crutchCount).toBeGreaterThan(0);
    expect(feedback.pillars.detectedCrutches).toContain("basically");
    expect(feedback.oneSpecificImprovement).toContain("Eliminate the crutch phrase");
    expect(feedback.highlightedPhrase.critique).toBeTruthy();
  });

  it("awards high presence score for deliberate power pauses with zero crutches", () => {
    const prompt = PROMPTS[0];
    const feedback = evaluateSpeechFeedback({
      prompt,
      transcript: "Our delivery date protects transactional stability. I propose we review the critical path deliverables together after this briefing to align on priority tradeoffs.",
      durationSeconds: 40,
    });

    expect(feedback.pillars.crutchCount).toBe(0);
    expect(feedback.pillars.executiveScore).toBe(5);
    expect(feedback.oneStrength).toContain("deliberate silent pauses");
  });
});
