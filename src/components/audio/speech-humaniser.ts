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

  // 2. Micro-pauses and conversational pacing for common interview prompts
  s = s
    .replace(/\bTell me about yourself and\b/gi, "Tell me about yourself... and")
    .replace(/\bTell me about yourself\b/gi, "Tell me about yourself... ")
    .replace(/\bTell me about a time when\b/gi, "Tell me about a time... when")
    .replace(/\bTell me about a time you\b/gi, "Tell me about a time... you")
    .replace(/\bTell me about a time\b/gi, "Tell me about a time... ")
    .replace(/\bTell us about a time when\b/gi, "Tell us about a time... when")
    .replace(/\bTell us about a time\b/gi, "Tell us about a time... ")
    .replace(/\bCan you give me an example of a time when\b/gi, "Can you give me an example... of a time when")
    .replace(/\bCan you give me an example of\b/gi, "Can you give me an example... of")
    .replace(/\bCan you give an example of\b/gi, "Can you give an example... of")
    .replace(/\bCan you describe a situation where\b/gi, "Can you describe a situation... where")
    .replace(/\bCan you describe a situation\b/gi, "Can you describe a situation... ")
    .replace(/\bDescribe a situation where\b/gi, "Describe a situation... where")
    .replace(/\bDescribe a situation in which\b/gi, "Describe a situation... in which")
    .replace(/\bDescribe a time when\b/gi, "Describe a time... when")
    .replace(/\bDescribe a time you\b/gi, "Describe a time... you")
    .replace(/\bWalk me through your experience with\b/gi, "Walk me through your experience... with")
    .replace(/\bWalk me through\b/gi, "Walk me through... ")
    .replace(/\bWhat would you say is\b/gi, "What would you say... is")
    .replace(/\bWhat would you say are\b/gi, "What would you say... are")
    .replace(/\bWhat would you do if\b/gi, "What would you do... if")
    .replace(/\bHow would you approach\b/gi, "How would you approach... ")
    .replace(/\bHow would you handle\b/gi, "How would you handle... ")
    .replace(/\bHow do you prioritize\b/gi, "How do you prioritize... ")
    .replace(/\bHow do you approach\b/gi, "How do you approach... ")
    .replace(/\bWhat motivates you to\b/gi, "What motivates you... to")
    .replace(/\bWhy do you want to join\b/gi, "Why do you want to join... ")
    .replace(/\bWhy are you interested in\b/gi, "Why are you interested in... ")
    .replace(/\bWhat is your biggest\b/gi, "What is your biggest... ")
    .replace(/\bWhat are your biggest\b/gi, "What are your biggest... ");

  // 3. Clause boundary pauses for natural breath rhythm
  s = s
    .replace(/,\s+and how you\b/gi, " — and how you")
    .replace(/,\s+and what you\b/gi, " — and what you")
    .replace(/,\s+and why you\b/gi, " — and why you")
    .replace(/\band what the outcome was\b/gi, " — and what the outcome was")
    .replace(/\band what was the outcome\b/gi, " — and what was the outcome")
    .replace(/\band how did you resolve it\b/gi, " — and how did you resolve it")
    .replace(/\band what did you learn\b/gi, " — and what did you learn")
    .replace(/\s+when you had to\b/gi, "... when you had to")
    .replace(/\s+where you had to\b/gi, "... where you had to")
    .replace(/\s+where you were faced with\b/gi, "... where you were faced with")
    .replace(/\s+in order to\b/gi, ", in order to")
    .replace(/\s+especially when\b/gi, ", especially when")
    .replace(/\s+rather than\b/gi, ", rather than")
    .replace(/\s+instead of\b/gi, ", instead of");

  // 4. Natural pause after conversational openers (e.g. "Right...", "Okay...")
  s = s.replace(/^(Right|Okay|So|Now|Well|Great|Sure|Lovely|Hmm),?\s+/i, "$1... ");

  // 5. Breathing space between distinct sentences
  s = s.replace(/([.?!])\s+(?=[A-Z0-9])/g, "$1 ... ");

  // 6. Breathing space around em-dashes
  s = s.replace(/\s*—\s*/g, " — ");

  // Clean up excessive punctuation clusters
  s = s.replace(/\.{4,}/g, "...").replace(/(\.\.\.\s*){2,}/g, "... ");

  return s;
}

/**
 * Returns a natural, conversational bridge between interview questions
 * so questions don't sound disconnected or abrupt.
 */
export function getConversationalBridge(
  qIndex: number,
  style: InterviewerStyle = "realistic",
  slot?: "opening" | "closing" | null,
): string {
  if (slot === "closing") {
    return "Right, okay... we're coming towards the end of our time today, so I have one final question for you — ";
  }

  const realisticBridges = [
    "Right, okay... thanks for walking through that. So, moving on to our next question — ",
    "Great, thank you. That makes complete sense. Now... turning to another aspect of the role — ",
    "Understood, that gives really helpful context. Um, let's explore something a bit different now — ",
    "Thanks for breaking that down. So... next up — ",
    "Right, lovely... looking at our next question here — ",
    "Got it, thank you. That's very clear. Now... moving forward to our next scenario — ",
    "Fair enough, appreciate you sharing that. So... turning now to — ",
    "Understood. Thanks for talking through that experience. Let's move on to — ",
    "Right, okay... that's very helpful. Now... looking at the next area — ",
    "Thanks for that thorough answer. So... turning to our next topic — ",
  ];

  const friendlyBridges = [
    "Brilliant, thank you! That was really insightful. So, let's move on to our next question — ",
    "Great, thanks for walking me through that! Now... looking at another part of the role — ",
    "Lovely, thank you. That really highlights your approach. Let's move on to the next question now — ",
    "Right, thanks so much for sharing that! So, let's touch on our next topic — ",
    "Understood, that's super helpful! Um, exploring our next area now — ",
    "Wonderful, thank you. That's very encouraging. Now... turning to — ",
    "Thanks a lot for that detail! So, moving forward to — ",
  ];

  const toughBridges = [
    "Right, understood. Moving directly to the next scenario — ",
    "Okay. Let's move on to the next challenge — ",
    "Understood. Turning now to our next question — ",
    "Right. Let's look at another area — ",
    "Moving along to our next evaluation point — ",
    "Understood. Shifting focus now to — ",
  ];

  const pool = style === "friendly" ? friendlyBridges : style === "tough" ? toughBridges : realisticBridges;
  return pool[qIndex % pool.length];
}

/**
 * Prepends natural conversational follow-up openers with cadence pauses
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
    "Right, okay... ",
    "Hmm, so looking at that — ",
    "Got it. Um, digging into that a little deeper — ",
    "Understood. So, just following up on that — ",
    "Thanks for that context. Now, to explore that further — ",
    "Interesting point. Um, could you say a bit more about that — ",
  ];

  const openersFriendly = [
    "Right, thank you! Following up on that — ",
    "Interesting! Could you expand on that — ",
    "Got it. Digging into that a little bit more — ",
    "Thanks for walking me through that. Let's dig slightly deeper — ",
    "Understood, that's really helpful. Looking further into that — ",
  ];

  const openersTough = [
    "Understood. Probing a bit further on that — ",
    "Right. To be clear on that — ",
    "Looking closely at that decision — ",
    "Digging into the specific trade-offs there — ",
    "Right. And what was the direct outcome of that — ",
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
  const bridge = "So, to kick things off... ";

  // Combine spoken text with breathing pauses
  const spoken = `${greeting} ... ${agenda} ... ${bridge}${firstQuestionText}`;

  return {
    spoken,
    greeting,
    agenda,
    bridge,
  };
}
