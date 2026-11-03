import type { InterviewRound, InterviewerStyle, QuestionGroup } from "@/lib/types";

/** Category names (internal keys kept: cv is Experience, competency is Skills, curveball is Situational). */
export const GROUP_LABEL: Record<QuestionGroup, string> = {
  motivation: "Motivation",
  competency: "Skills",
  technical: "Technical",
  cv: "Experience",
  curveball: "Situational",
};

export const GROUP_ORDER: QuestionGroup[] = ["motivation", "competency", "technical", "cv", "curveball"];

/** A group's questions in a sentence: "Practise technical questions next". */
export const GROUP_QUESTIONS: Record<QuestionGroup, string> = {
  motivation: "motivation questions",
  competency: "skills questions",
  technical: "technical questions",
  cv: "experience questions",
  curveball: "situational questions",
};

export const ROUND_LABEL: Record<InterviewRound, string> = {
  screening: "Screening call",
  competency: "Competency",
  technical: "Technical",
  final: "Final",
  "not-sure": "Not sure",
};

/** What each round focuses on (spec: "Interview round"). */
export const ROUND_HINT: Record<InterviewRound, string> = {
  screening: "Screening calls cover “tell me about yourself”, motivation, fit, notice period and salary expectations.",
  competency: "Competency rounds are past examples, told as situation, task, action and result, matched to the job spec.",
  technical: "Technical rounds use questions specific to the job: talking through a past project or design, and solving a problem out loud.",
  final: "Final rounds mix “why us”, values and deeper questions about your CV and past decisions.",
  "not-sure": "Not sure? Hakkiri will practise a realistic mix of every kind of question.",
};

export const STYLE_HINT: Record<InterviewerStyle, string> = {
  friendly: "Friendly asks gently and gives you time. Follow-ups are rare.",
  realistic: "Realistic asks up to two follow-ups when an answer is vague, and won’t give hints.",
  tough: "Tough challenges more, presses on numbers, and may cut into a very long answer.",
};
