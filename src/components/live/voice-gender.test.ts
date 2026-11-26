import { describe, expect, it } from "vitest";
import { isExplicitlyMale, resolveInterviewerVoice } from "./LiveInterview";

describe("Interviewer Voice Gender Resolution", () => {
  it("resolves Sam and other male interviewers to male voice ('hard')", () => {
    expect(isExplicitlyMale("Sam")).toBe(true);
    expect(isExplicitlyMale("Sam - hiring manager")).toBe(true);
    expect(isExplicitlyMale("Ben")).toBe(true);
    expect(isExplicitlyMale("Daniel")).toBe(true);
    expect(isExplicitlyMale("David")).toBe(true);
    expect(isExplicitlyMale("George")).toBe(true);

    // Regardless of difficulty/style, male interviewers must speak with male voice ("hard")
    expect(resolveInterviewerVoice("Sam", "friendly")).toBe("hard");
    expect(resolveInterviewerVoice("Sam", "realistic")).toBe("hard");
    expect(resolveInterviewerVoice("Sam", "tough")).toBe("hard");
    expect(resolveInterviewerVoice("Ben", "realistic")).toBe("hard");
  });

  it("resolves female interviewers to female voice ('medium' or 'easy')", () => {
    expect(isExplicitlyMale("Sarah")).toBe(false);
    expect(isExplicitlyMale("Sister Sarah Jenkins")).toBe(false);
    expect(isExplicitlyMale("Samantha")).toBe(false);
    expect(isExplicitlyMale("Emma")).toBe(false);

    expect(resolveInterviewerVoice("Sarah", "friendly")).toBe("easy");
    expect(resolveInterviewerVoice("Sarah", "realistic")).toBe("medium");
    expect(resolveInterviewerVoice("Sister Sarah Jenkins", "realistic")).toBe("medium");
    expect(resolveInterviewerVoice("Samantha", "realistic")).toBe("medium");
  });
});
