import { NextResponse } from "next/server";
import { isMongoConfigured, testMongoConnection } from "@/lib/storage/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isMongoConfigured()) {
    return NextResponse.json({
      status: "unconfigured",
      message: "MONGODB_URI is not configured in environment variables.",
    });
  }

  const result = await testMongoConnection();
  return NextResponse.json(
    {
      status: result.ok ? "connected" : "error",
      message: result.message,
    },
    { status: result.ok ? 200 : 500 },
  );
}
