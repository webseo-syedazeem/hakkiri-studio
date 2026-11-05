import { NextResponse } from "next/server";
import { aiConfig } from "@/lib/ai/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = aiConfig.geminiKey;
  if (!key) {
    return NextResponse.json({ error: "no-key", message: "Gemini API key is not configured." });
  }

  const results: Record<string, unknown> = {
    keyLength: key.length,
    keyPrefix: key.slice(0, 6) + "...",
  };

  for (const ver of ["v1beta", "v1"]) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${ver}/models?key=${key}`);
      const body = await res.json().catch(() => null);
      results[ver] = {
        status: res.status,
        models: Array.isArray(body?.models)
          ? body.models.map((m: { name: string; supportedGenerationMethods?: string[] }) => ({
              name: m.name,
              methods: m.supportedGenerationMethods,
            }))
          : body,
      };
    } catch (err) {
      results[ver] = { error: err instanceof Error ? err.message : String(err) };
    }
  }

  return NextResponse.json(results);
}
