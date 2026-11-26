import type { InterviewerStyle } from "@/lib/types";

/**
 * Prepares raw question text for speech synthesis with natural, human cadence.
 *
 * 1. Expands common tech / business acronyms and symbols for accurate pronunciation
 *    (e.g. "HMRC" -> "H.M.R.C.", "GDS" -> "G.D.S.", "STAR" -> "Star").
 * 2. Injects conversational micro-pauses (`...`, ` — `) at natural clause boundaries
 *    so the interviewer does not speak monotonically like an audiobook.
 * 3. Smooths punctuation and conversational connectors.
 */
export function humaniseSpeechText(text: string): string {
  if (!text) return "";
  let s = text.trim();

  // 1. Acronym and symbol pronunciation normalisation
  s = s
    .replace(/\bHMRC\b/g, "H.M.R.C.")
    .replace(/\bNHS\b/g, "N.H.S.")
    .replace(/\bGDS\b/g, "G.D.S.")
    .replace(/\bSTAR\b/g, "Star")
    .replace(/\bCVs\b/g, "C.V.s")
    .replace(/\bCV\b/g, "C.V.")
    .replace(/\bWCAG\b/g, "W-C-A-G")
    .replace(/\bATS\b/g, "A.T.S.")
    .replace(/\bGOV\.UK\b/gi, "Gov U.K.")
    .replace(/\bUK\b/g, "U.K.")
    .replace(/\bUS\b/g, "U.S.")
    .replace(/\bKPIs\b/g, "K.P.I.s")
    .replace(/\bKPI\b/g, "K.P.I.")
    .replace(/\bOKRs\b/g, "O.K.R.s")
    .replace(/\bOKR\b/g, "O.K.R.")
    .replace(/\bAPIs\b/g, "A.P.I.s")
    .replace(/\bAPI\b/g, "A.P.I.")
    .replace(/\bMVPs\b/g, "M.V.P.s")
    .replace(/\bMVP\b/g, "M.V.P.")
    .replace(/\bB2B\b/gi, "B to B")
    .replace(/\bB2C\b/gi, "B to C")
    .replace(/\bAI\b/g, "A.I.")
    .replace(/\bROI\b/g, "R.O.I.")
    .replace(/\bPR\b/g, "P.R.")
    .replace(/£(\d+)/g, "$1 pounds")
    .replace(/\$(\d+)/g, "$1 dollars")
    .replace(/(\d+)%/g, "$1 percent")
    .replace(/\be\.g\.,?\s*/gi, "for example, ")
    .replace(/\bi\.e\.,?\s*/gi, "that is, ")
    .replace(/\betc\.?\b/gi, "and so on")
    .replace(/\bw\/\b/gi, "with")
    .replace(/\bvs\.?\b/gi, "versus")
    .replace(/\s+&\s+/g, " and ")
    // Convert slashes between words to " or " (e.g. "product/service" -> "product or service")
    .replace(/([a-zA-Z])\/([a-zA-Z])/g, "$1 or ");

  // 2. Natural clause pacing and conversational commas (never inject artificial '...' mid-sentence)
  s = s
    .replace(/,\s+and how you\b/gi, ", and how you")
    .replace(/,\s+and what you\b/gi, ", and what you")
    .replace(/,\s+and why you\b/gi, ", and why you")
    .replace(/\band what the outcome was\b/gi, ", and what the outcome was")
    .replace(/\band what was the outcome\b/gi, ", and what was the outcome")
    .replace(/\band how did you resolve it\b/gi, ", and how did you resolve it")
    .replace(/\band what did you learn\b/gi, ", and what did you learn")
    .replace(/\s+in order to\b/gi, ", in order to")
    .replace(/\s+especially when\b/gi, ", especially when")
    .replace(/\s+rather than\b/gi, ", rather than")
    .replace(/\s+instead of\b/gi, ", instead of");

  // 3. Conversational openers: use natural comma pauses instead of artificial hesitation dots
  s = s.replace(/^(Right|Okay|So|Now|Well|Great|Sure|Lovely|Understood),?\s+/i, "$1, ");

  // 4. Remove any artificial ellipsis strings that cause TTS models to hesitate or cut off
  s = s.replace(/\.{2,}/g, ".").replace(/\s*—\s*/g, ", ");

  return s;
}

/**
 * Returns a natural, conversational bridge between interview questions
 * so questions sound like an authentic human dialogue rather than an automated reader.
 */
export function getConversationalBridge(
  qIndex: number,
  style: InterviewerStyle = "realistic",
  slot?: "opening" | "closing" | null,
): string {
  if (slot === "closing") {
    return "Right, we're coming towards the end of our time today, so I have one final question for you. ";
  }

  const realisticBridges = [
    "Thanks for walking through that. Moving on to our next question, ",
    "Great, thank you. That makes complete sense. Turning to another area now, ",
    "Understood, that gives really helpful context. Let's explore something a bit different. ",
    "Thanks for breaking that down. Next up, ",
    "Right, thank you. Looking at our next question here, ",
    "Got it, that's very clear. Moving forward to our next scenario, ",
    "Fair enough, appreciate you sharing that. Turning now to the next area, ",
    "Understood. Thanks for talking through that experience. Let's move on. ",
    "Right, that's very helpful background. Now, looking at the next area, ",
    "Thanks for that thorough answer. Turning to our next topic, ",
    "Thank you. Following on from that, ",
    "That's very clear context. Looking at another aspect of the role, ",
  ];

  const friendlyBridges = [
    "Brilliant, thank you! That was really insightful. Let's move on to our next question, ",
    "Great, thanks for walking me through that! Looking at another part of the role, ",
    "Lovely, thank you. That really highlights your approach. Moving on to our next question, ",
    "Right, thanks so much for sharing that! Let's touch on our next topic, ",
    "Understood, that's super helpful. Exploring our next area now, ",
    "Wonderful, thank you. That's very clear. Turning now to our next scenario, ",
    "Thanks a lot for that detail! Moving forward to our next question, ",
  ];

  const toughBridges = [
    "Right, understood. Moving directly to the next scenario, ",
    "Okay. Let's look at the next challenge. ",
    "Understood. Turning now to our next question, ",
    "Right. Let's examine another area, ",
    "Moving along to our next evaluation point, ",
    "Understood. Shifting focus now, ",
  ];

  const pool = style === "friendly" ? friendlyBridges : style === "tough" ? toughBridges : realisticBridges;
  return pool[qIndex % pool.length];
}

/**
 * Prepends natural conversational follow-up openers with smooth cadence
 * to follow-up questions from the interviewer.
 */
export function humaniseFollowUp(
  questionText: string,
  followUpNumber = 1,
  style: InterviewerStyle = "realistic",
): string {
  const cleanQ = questionText.trim();
  // Don't double-prepend if already started conversationally
  if (/^(Right|Okay|Hmm|Got it|Understood|Interesting|Thanks)/i.test(cleanQ)) {
    return cleanQ;
  }

  const openersRealistic = [
    "Right, understood. Just following up on that, ",
    "Got it. Digging into that a little deeper, ",
    "Understood. Probing slightly further on that, ",
    "Thanks for that context. To explore that further, ",
    "Interesting point. Could you say a bit more about that, ",
    "Right, thank you. Looking closely at that, ",
  ];

  const openersFriendly = [
    "Right, thank you! Following up on that, ",
    "Interesting! Could you expand a little on that, ",
    "Got it. Digging into that a bit more, ",
    "Thanks for walking me through that. Exploring slightly deeper, ",
    "Understood, that's really helpful. Looking further into that, ",
  ];

  const openersTough = [
    "Understood. Probing further on that decision, ",
    "Right, to be clear on that, ",
    "Looking closely at the reasoning there, ",
    "Digging into the specific trade-offs there, ",
    "Right, and what was the measurable outcome of that, ",
  ];

  const pool = style === "friendly" ? openersFriendly : style === "tough" ? openersTough : openersRealistic;
  const opener = pool[(followUpNumber - 1) % pool.length];
  return `${opener}${cleanQ}`;
}

export interface FullInterviewIntroParams {
  interviewerName: string;
  interviewerTitle?: string;
  heading?: string;
  minutes?: number;
  style?: InterviewerStyle;
  firstQuestionText: string;
}

export interface FullInterviewIntroResult {
  /** The full speech script spoken by the interviewer out loud */
  spoken: string;
  /** Short greeting line displayed on screen */
  greeting: string;
  /** Summary of what the interview covers */
  agenda: string;
  /** The natural bridge leading into question 1 */
  bridge: string;
}

/**
 * Builds a warm, humanised self-introduction and session overview for FULL interview practice.
 * Sam (or the assigned hiring manager) introduces himself/herself, explains the agenda
 * and time allocation, and bridges seamlessly into the first question.
 */
export function getFullInterviewIntro(params: FullInterviewIntroParams): FullInterviewIntroResult {
  const {
    interviewerName,
    interviewerTitle,
    heading,
    minutes = 20,
    style = "realistic",
    firstQuestionText,
  } = params;

  // Extract clean company/org name if present in title or heading
  let orgName = "";
  if (interviewerTitle && /\bat\b/i.test(interviewerTitle)) {
    orgName = interviewerTitle.split(/\bat\b/i)[1].trim();
  } else if (heading && heading.includes("·")) {
    const parts = heading.split("·").map((s) => s.trim());
    orgName = parts[1] || parts[0];
  }

  // Self-introduction greeting
  let greeting = "";
  if (interviewerTitle && interviewerTitle.trim()) {
    greeting = `Hello, welcome! I'm ${interviewerName}, ${interviewerTitle}. It's really great to meet you today.`;
  } else if (orgName) {
    greeting = `Hello, welcome! I'm ${interviewerName}, your interviewer from ${orgName}. It's great to meet you today.`;
  } else {
    greeting = `Hello, welcome! I'm ${interviewerName}, and I'll be leading your interview today. It's really great to meet you.`;
  }

  if (style === "friendly") {
    greeting = `Hi there, a very warm welcome! I'm ${interviewerName}, ${interviewerTitle || "your interviewer today"}. It's fantastic to meet you.`;
  } else if (style === "tough") {
    greeting = `Good day, and welcome. I'm ${interviewerName}, ${interviewerTitle || "your interviewer today"}.`;
  }

  // Session overview and expectations
  let agenda = "";
  if (style === "friendly") {
    agenda = `In this session, we'll spend about ${minutes} minutes walking through your background, discussing key scenarios for the role, and hearing about your experiences. We want this to feel like an open, natural conversation, so please feel free to pause and gather your thoughts before each answer.`;
  } else if (style === "tough") {
    agenda = `Today we have ${minutes} minutes to explore your relevant experience, core competencies, and critical decision-making for this role. We'll be looking for specific examples and measurable impact.`;
  } else {
    agenda = `In this session, we'll be spending about ${minutes} minutes exploring your background, key competencies, and practical scenarios for this role. We want this to feel like a relaxed, two-way conversation, so please take your time with your answers.`;
  }

  // Natural bridge to question 1
  const bridge = "To kick things off, ";

  // Combine spoken text smoothly without synthetic pause artifacts
  const spoken = `${greeting} ${agenda} ${bridge}${firstQuestionText}`;

  return {
    spoken,
    greeting,
    agenda,
    bridge,
  };
}
