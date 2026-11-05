import { NextResponse } from "next/server";
import { aiConfig } from "@/lib/ai/config";
import { callGemini } from "@/lib/ai/providers/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = aiConfig.geminiKey;
  if (!key) {
    return NextResponse.json({ error: "no-key", message: "Gemini API key is not configured." });
  }

  try {
    const text = await callGemini(
      {
        model: "gemini-2.5-flash",
        system: "You are a helpful assistant.",
        user: "Respond with valid JSON: {\"status\": \"ok\", \"model\": \"gemini-2.5-flash\"}",
        maxTokens: 100,
        temperature: 0,
        timeoutMs: 10000,
        label: "test-gemini",
      },
      { apiKey: key },
    );

    return NextResponse.json({ success: true, response: text });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
