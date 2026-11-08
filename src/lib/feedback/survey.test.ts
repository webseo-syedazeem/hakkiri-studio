import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/storage/disk", () => ({
  loadJson: () => [],
  saveJson: () => {},
  savingToDisk: false,
}));

const report = vi.fn(async (_input: unknown) => null);
vi.mock("@/lib/alerts/store", () => ({
  reportProblem: (input: unknown) => report(input),
}));

import { addSurveySubmission, clearSurveys, recentSurveys } from "./survey-store";

describe("beta interview survey (£15 Amazon voucher)", () => {
  beforeEach(() => {
    clearSurveys();
    report.mockClear();
  });

  it("stores a full interview survey and forwards an alert with all 7 answers and voucher email", async () => {
    const submission = await addSurveySubmission({
      interviewId: "halden",
      mockId: "mock-123",
      email: "candidate@example.com",
      q1_realism: "Very realistic follow-ups",
      q2_questions: "Spot on for product manager",
      q3_feedback: "Fair and helpful breakdown",
      q4_issues: "No issues, ran smoothly",
      q5_likes_dislikes: "Liked the real-time scoring, least liked 30s timer",
      q6_changes: "Add more technical case questions",
      q7_recommend: "Yes, definitely to anyone preparing for interviews",
    });

    expect(submission.id).toBeDefined();
    expect(submission.email).toBe("candidate@example.com");
    expect(submission.q1_realism).toBe("Very realistic follow-ups");
    expect(recentSurveys()).toHaveLength(1);

    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "feedback",
        where: "Beta Survey (£15 Voucher) · candidate@example.com",
        message: expect.stringContaining("£15 Amazon Voucher requested by candidate@example.com"),
      }),
    );
  });

  it("caps answer lengths and formats emails consistently", async () => {
    const submission = await addSurveySubmission({
      email: "  CANDIDATE@EXAMPLE.COM  ",
      q1_realism: "a".repeat(3000),
      q2_questions: "b".repeat(3000),
      q3_feedback: "c",
      q4_issues: "d",
      q5_likes_dislikes: "e",
      q6_changes: "f",
      q7_recommend: "g",
    });

    expect(submission.email).toBe("candidate@example.com");
    expect(submission.q1_realism).toHaveLength(2000);
    expect(submission.q2_questions).toHaveLength(2000);
  });
});
