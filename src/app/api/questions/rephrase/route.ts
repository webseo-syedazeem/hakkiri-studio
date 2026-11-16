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

  // Known Civil Service / HMRC & GDS patterns
  if (lower.includes("gds") || lower.includes("accessibility")) {
    return "In simple terms, how do you design features that follow government design principles and make sure everyone can easily use them?";
  }
  if (lower.includes("complex topic") || lower.includes("simple terms")) {
    return "How do you break down technical concepts so colleagues who aren't technical can easily follow along?";
  }
  if (lower.includes("different viewpoints")) {
    return "How do you find common ground when working with people who see things differently from you?";
  }
  if (lower.includes("never encountered") || lower.includes("novel problem")) {
    return "What are the first steps you take when facing a completely new, unfamiliar challenge?";
  }
  if (lower.includes("under pressure")) {
    return "What keeps you focused and motivated when dealing with tight deadlines or high stakes?";
  }
  if (lower.includes("independently or collaboratively")) {
    return "Do you do your best work deciding on your own, or collaborating closely with others to reach a decision?";
  }
  if (lower.includes("challenges your ideas") || lower.includes("disagreed")) {
    return "How do you handle it when someone pushes back or disagrees with your proposal?";
  }
  if (lower.includes("improving how an organisation works") || lower.includes("quality of a service")) {
    return "What is your approach to spotting flaws in an existing process and making it better for users?";
  }
  if (lower.includes("influenced senior stakeholders") || lower.includes("conflicting priorities")) {
    return "How do you get key stakeholders on board when they have conflicting priorities or disagree with you?";
  }
  if (lower.includes("incomplete or conflicting evidence") || lower.includes("difficult recommendation")) {
    return "How do you make recommendations and advise leadership when you don't have all the facts?";
  }
  if (lower.includes("delivered a complex piece of work") || lower.includes("delivering at pace")) {
    return "Can you share how you prioritize and stay organized when delivering under significant time pressure?";
  }
  if (lower.includes("aligned a programme") || lower.includes("seeing the big picture")) {
    return "How do you make sure the project you're working on connects to wider departmental goals?";
  }
  if (lower.includes("challenged an established approach") || lower.includes("changing and improving")) {
    return "Can you describe a time you questioned the usual way of doing things and brought in a better method?";
  }
  if (lower.includes("led others through uncertainty") || lower.includes("leadership")) {
    return "How do you guide and support colleagues when things are shifting or the direction isn't fully clear?";
  }
  if (lower.includes("brought together different teams") || lower.includes("working together")) {
    return "How do you get separate teams or departments to collaborate smoothly toward a shared outcome?";
  }

  // General structural simplifications
  let cleaned = q.trim().replace(/^could you (please )?walk me through /i, "How do you ");
  cleaned = cleaned.replace(/^tell (me|us) about a time (when )?you /i, "Can you give a real example of how you ");
  cleaned = cleaned.replace(/^describe a (situation|time) where you /i, "Give an example of when you ");
  cleaned = cleaned.replace(/^explain /i, "In your own words, how would you explain ");

  if (cleaned.toLowerCase() === q.toLowerCase()) {
    return `In plain terms: ${q}`;
  }
  return cleaned;
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
    "Rephrase the question into clear, simple, conversational English (1 to 2 sentences). Keep the core intent, but make it straightforward and accessible. " +
    "Reply with a single JSON object: {\"rephrased\": \"...\"}";

  const userPrompt = `Rephrase this question simply:\n"${question}"`;

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
      return NextResponse.json({ rephrased: parsedJson.rephrased.trim() });
    }
  } catch (err) {
    console.warn("[questions/rephrase] AI call failed, using fallback:", err);
  }

  return NextResponse.json({ rephrased: fallbackRephrase(question) });
}
