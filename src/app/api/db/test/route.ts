import { NextResponse } from "next/server";
import { isMongoConfigured, testMongoConnection, getMongoDb } from "@/lib/storage/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isMongoConfigured()) {
    return NextResponse.json({
      status: "unconfigured",
      message: "MONGODB_URI is not configured in environment variables.",
    });
  }

  const result = await testMongoConnection();
  if (!result.ok) {
    return NextResponse.json(
      {
        status: "error",
        message: result.message,
      },
      { status: 500 },
    );
  }

  // Quick stats
  try {
    const db = await getMongoDb();
    const collections = db ? (await db.listCollections().toArray()).map((c) => c.name) : [];
    return NextResponse.json({
      status: "connected",
      message: "Connected to MongoDB Atlas successfully!",
      database: db?.databaseName ?? "hakkiri_studio",
      collections,
    });
  } catch (err) {
    return NextResponse.json({
      status: "connected",
      message: result.message,
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
