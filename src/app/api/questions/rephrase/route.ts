import { NextResponse } from "next/server";
import { z } from "zod";
import { aiConfig } from "@/lib/ai/config";
import { callClaude, extractJson } from "@/lib/ai/providers/claude";
import { callGemini } from "@/lib/ai/providers/gemini";
import { mockAiEnabled } from "@/lib/ai/mock";

export const runtime = "nodejs";

const Body = z.object({
  question: z.string().trim().min(3).max(400),
  group: z.string().optional(),
  hint: z.string().optional(),
});

function fallbackRephrase(q: string): string {
  const lower = q.toLowerCase();

  // 1. Accessibility, Inclusion & Digital Literacy
  if (lower.includes("accessib") || lower.includes("digital literacy") || lower.includes("low digital")) {
    return "What practical design choices and user-support methods would you put in place so people who struggle with technology can still easily use our public services?";
  }
  if (lower.includes("gds") || lower.includes("service standard") || lower.includes("wcag")) {
    return "In simple terms, how do you design features that follow government design standards and ensure everyone can navigate them without barriers?";
  }

  // 2. Background & "Tell me about yourself"
  if (lower.includes("tell me about yourself") || (lower.includes("background in") && lower.includes("product"))) {
    return "In a nutshell: what is your career story so far, and what key achievements make you a strong fit for this position?";
  }
  if (lower.includes("walk me through your cv") || lower.includes("experience to date")) {
    return "Can you give a brief executive summary of your career milestones, what you've delivered, and why this move makes sense for you now?";
  }

  // 3. Civil Service Behaviours & Strengths
  if (lower.includes("different viewpoints") || lower.includes("viewpoint")) {
    return "How do you collaborate and find common ground when teammates or stakeholders see things very differently from you?";
  }
  if (lower.includes("never encountered") || lower.includes("novel problem") || lower.includes("unfamiliar problem")) {
    return "What is your thought process when you're handed an issue you've never dealt with before — how do you break it down?";
  }
  if (lower.includes("under pressure") || lower.includes("tight deadline")) {
    return "What keeps you focused, calm and motivated when dealing with high stakes or heavy workloads?";
  }
  if (lower.includes("independently or collaboratively")) {
    return "Reflecting on how you work: do you feel most energised solving problems on your own, or brainstorming with others?";
  }
  if (lower.includes("challenges your ideas") || lower.includes("disagreed")) {
    return "How do you handle it when someone pushes back on your proposal, and how do you decide whether to defend it or adapt?";
  }
  if (lower.includes("improving how an organisation works") || lower.includes("quality of a service")) {
    return "What is your approach to spotting inefficiencies in how a team operates and putting a better process in place?";
  }
  if (lower.includes("influenced senior stakeholders") || lower.includes("conflicting priorities")) {
    return "How do you bring people together and build consensus when influential stakeholders disagree on what comes first?";
  }
  if (lower.includes("incomplete or conflicting evidence") || lower.includes("difficult recommendation")) {
    return "How do you make sound decisions and advise leadership when you don't have all the facts or data available?";
  }
  if (lower.includes("delivered a complex piece of work") || lower.includes("delivering at pace")) {
    return "Can you share how you prioritise your workload and keep momentum going when delivering under tight deadlines?";
  }
  if (lower.includes("aligned a programme") || lower.includes("seeing the big picture")) {
    return "How do you make sure the daily work you do directly supports broader organisational goals and citizen outcomes?";
  }
  if (lower.includes("challenged an established approach") || lower.includes("changing and improving")) {
    return "Can you share an example of when you questioned the status quo and introduced a simpler, more effective way of working?";
  }
  if (lower.includes("led others through uncertainty") || lower.includes("leadership")) {
    return "How do you guide and support teammates when goals are shifting and there isn't a clear roadmap?";
  }
  if (lower.includes("brought together different teams") || lower.includes("working together")) {
    return "How do you get cross-functional teams or external partners to align and pull together toward a single goal?";
  }

  // 4. Clinical & Healthcare Scenarios
  if (lower.includes("abcde") || lower.includes("unwell patient")) {
    return "Walk me through how you systematically assess an unwell patient to catch critical issues before they escalate.";
  }
  if (lower.includes("news2") || lower.includes("deteriorat")) {
    return "When a patient's vital signs start slipping, what are your immediate clinical actions and who do you notify first?";
  }
  if (lower.includes("short-staffed") || (lower.includes("ward") && lower.includes("prioriti"))) {
    return "When you have too many acutely dependent patients and limited resources, how do you decide who gets care first?";
  }
  if (lower.includes("medication") && (lower.includes("6 rights") || lower.includes("safe"))) {
    return "What strict safety checks do you perform before administering drugs to prevent errors on a busy ward?";
  }

  // 5. PM, Technical & Commercial Trade-offs
  if (lower.includes("metric drop") || (lower.includes("drops 15%") || lower.includes("activation"))) {
    return "What is your diagnostic sequence: what data slices or system logs do you check in the first hour to find the root cause?";
  }
  if (lower.includes("build or buy") || lower.includes("fraud-detection")) {
    return "What commercial, operational and engineering criteria do you weigh before deciding to build internally versus buying third-party software?";
  }
  if (lower.includes("authorisation") && lower.includes("settlement")) {
    return "In simple everyday language: what is the difference between reserving customer funds and actually transferring the money?";
  }
  if (lower.includes("idempotency") || lower.includes("latency") || lower.includes("architecture")) {
    return "How do you design payments architecture so network hiccups or retry attempts don't double-charge customers or drop data?";
  }
  if (lower.includes("fraud") && lower.includes("conversion")) {
    return "How do you balance making checkout frictionless for real customers while keeping fraud loss limits under tight control?";
  }

  // 6. Motivation & Experience
  if (lower.includes("why do you want") || lower.includes("why this role") || lower.includes("why us") || lower.includes("why halden") || lower.includes("why hmrc")) {
    return "What specifically drew you to this team and mission, and why is this the natural next step in your career?";
  }
  if (lower.includes("things did not go to plan") || lower.includes("learned from it") || lower.includes("failed")) {
    return "Tell us about a project that ran into unexpected trouble: how did you handle the reality, and what did you learn?";
  }
  if (lower.includes("qualitative or quantitative data") || lower.includes("data to make")) {
    return "Can you share a specific situation where metrics, analytics or user research directly steered your final decision?";
  }
  if (lower.includes("what would your last manager say") || lower.includes("need to work on")) {
    return "What is an honest skill or area of your craft you have been actively sharpening over the past year?";
  }

  // 7. General Structural Rephrasers (Guaranteed NOT to repeat original verbatim)
  if (/^how would you ensure /i.test(q)) {
    const topic = q.replace(/^how would you ensure /i, "").replace(/\?$/, "");
    return `What concrete steps, design patterns and safeguards would you use to ensure ${topic}?`;
  }
  if (/^tell (me|us) about a time /i.test(q)) {
    const action = q.replace(/^tell (me|us) about a time (when )?you /i, "").replace(/\?$/, "");
    return `Can you share a real-world story from your past where you ${action}, and what the final result was?`;
  }
  if (/^describe a (situation|time) /i.test(q)) {
    const action = q.replace(/^describe a (situation|time) (where|when) you /i, "").replace(/\?$/, "");
    return `Walk us through an actual situation where you ${action}: what was your personal role and outcome?`;
  }
  if (/^how do you /i.test(q)) {
    const action = q.replace(/^how do you /i, "").replace(/\?$/, "");
    return `In your everyday workflow, what is your step-by-step approach to ${action}?`;
  }
  if (/^what (would you|do you) /i.test(q)) {
    const action = q.replace(/^what (would you|do you) /i, "").replace(/\?$/, "");
    return `If put in this situation, what would be your initial decision and reasoning regarding ${action}?`;
  }

  // Fallback for short or unconventional phrases: extract essence
  const cleaned = q.replace(/[?.!]+$/, "").trim();
  return `The interviewer wants to understand your mindset and approach to this: how would you address ${cleaned.toLowerCase()} in your own words?`;
}

/** POST /api/questions/rephrase: rephrases an interview question clearly and concisely */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad-request", message: "Question text is required." }, { status: 400 });
  }

  const { question } = parsed.data;

  // If AI is disabled or keys not configured, return smart rule-based rephrase
  if (mockAiEnabled() || (!aiConfig.anthropicKey && !aiConfig.geminiKey)) {
    return NextResponse.json({ rephrased: fallbackRephrase(question) });
  }

  const system =
    "You are an expert interview coach. A candidate asked you to rephrase or clarify an interview question. " +
    "CRITICAL RULE: Paraphrase using different, simpler words. NEVER repeat the question verbatim and NEVER prefix with 'In plain terms:'. " +
    "Explain what the interviewer is really looking for in 1 to 2 clear, accessible sentences. " +
    "Reply with a single JSON object: {\"rephrased\": \"...\"}";

  const userPrompt = `Rephrase this question using different and simpler words (do not repeat it):\n"${question}"`;

  try {
    let rawText = "";
    if (aiConfig.geminiKey) {
      rawText = await callGemini(
        {
          model: "gemini-2.5-flash",
          system,
          user: userPrompt,
          maxTokens: 300,
          temperature: 0.2,
          timeoutMs: 10_000,
        },
        { apiKey: aiConfig.geminiKey }
      );
    } else if (aiConfig.anthropicKey) {
      rawText = await callClaude(
        {
          model: aiConfig.mainModel || "claude-3-5-sonnet-20241022",
          system,
          user: userPrompt,
          maxTokens: 300,
          temperature: 0.2,
          timeoutMs: 10_000,
        },
        { apiKey: aiConfig.anthropicKey }
      );
    }

    const parsedJson = extractJson(rawText) as { rephrased?: string } | null;
    if (parsedJson?.rephrased && typeof parsedJson.rephrased === "string" && parsedJson.rephrased.length > 5) {
      const rep = parsedJson.rephrased.trim();
      // If AI simply repeated the question or used "In plain terms: <same question>", discard and use fallbackRephrase
      const repNorm = rep.toLowerCase().replace(/^in plain terms:\s*/i, "").replace(/[^a-z0-9]/g, "");
      const qNorm = question.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (repNorm !== qNorm && !rep.toLowerCase().startsWith("in plain terms:")) {
        return NextResponse.json({ rephrased: rep });
      }
    }
  } catch (err) {
    console.warn("[questions/rephrase] AI call failed, using fallback:", err);
  }

  return NextResponse.json({ rephrased: fallbackRephrase(question) });
}
