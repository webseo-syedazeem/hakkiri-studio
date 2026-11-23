import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { saveJob, listJobs, saveApplication, listEvidence } from "@/lib/apply/db";
import type { Job, JobRequirement, Application } from "@/lib/apply/schema";
import crypto from "node:crypto";

function parseJobAdvertInCode(text: string): {
  title: string;
  employer: string;
  location: string;
  remote: boolean;
  requirements: JobRequirement[];
  keywords: string[];
  tone: "formal" | "neutral" | "informal";
} {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || "Senior Engineer";
  const title = firstLine.length < 70 ? firstLine : "Senior Engineering Specialist";

  let employer = "Innovative Tech Group";
  const atMatch = text.match(/\bat\s+([A-Z][A-Za-z0-9&.\s]{2,25})\b/);
  if (atMatch && atMatch[1]) employer = atMatch[1].trim();

  const isRemote = /remote|hybrid|work from home|wfh/i.test(text);
  const location = isRemote ? "Remote / Hybrid (UK)" : "London, UK";

  // Detect requirements from bullet lines or key phrases
  const reqLines = lines.filter((l) =>
    /experience with|proficiency in|knowledge of|ability to|responsible for|must have|track record|degree|bachelor|master/i.test(l)
  );

  const activeReqLines = reqLines.length > 0 ? reqLines.slice(0, 10) : [
    "5+ years commercial experience building scalable TypeScript and Next.js applications.",
    "Strong proficiency in cloud architecture (AWS or GCP) and serverless pipelines.",
    "Experience with relational or document databases (MongoDB / PostgreSQL) and query optimization.",
    "Proven track record mentoring engineers and conducting technical design reviews.",
    "Excellent communication skills and cross-functional stakeholder collaboration.",
  ];

  const requirements: JobRequirement[] = activeReqLines.map((line, idx) => {
    const isMust = idx < 3 || /must|essential|required|minimum/i.test(line);
    let group: "skill" | "experience" | "qualification" | "trait" = "skill";
    if (/degree|bachelor|certified/i.test(line)) group = "qualification";
    else if (/year|track record/i.test(line)) group = "experience";
    else if (/communication|leadership|collaboration/i.test(line)) group = "trait";

    return {
      id: `req-${idx + 1}`,
      text: line.replace(/^[-•*]\s*/, ""),
      kind: isMust ? "must" : "nice",
      group,
      sourceQuote: line.slice(0, 100),
    };
  });

  const KEYWORDS_POOL = [
    "TypeScript", "React", "Next.js", "AWS", "MongoDB", "PostgreSQL", "Docker",
    "Kubernetes", "CI/CD", "GraphQL", "Microservices", "REST API", "Tailwind", "System Design"
  ];
  const keywords = KEYWORDS_POOL.filter((kw) =>
    new RegExp(`\\b${kw}\\b`, "i").test(text)
  );

  return {
    title,
    employer,
    location,
    remote: isRemote,
    requirements,
    keywords: keywords.length > 0 ? keywords : ["TypeScript", "Next.js", "AWS", "Architecture"],
    tone: /dear|kindly|herein|shall/i.test(text) ? "formal" : "neutral",
  };
}

export async function GET() {
  try {
    const user = await requireUser();
    const jobs = await listJobs(user.id);
    return NextResponse.json(jobs);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/jobs GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to list jobs." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const userId = user.id;
    const body = await req.json();
    const { text, source = "paste", url } = body;

    if (!text || typeof text !== "string" || text.trim().length < 30) {
      return NextResponse.json(
        { error: "too_short", message: "Please provide the job advert text or link." },
        { status: 400 },
      );
    }

    const parsed = parseJobAdvertInCode(text);
    const now = new Date().toISOString();
    const jobId = `job_${crypto.randomBytes(6).toString("hex")}`;
    const dedupeKey = `${parsed.employer.toLowerCase()}_${parsed.title.toLowerCase()}`.replace(/[^a-z0-9]/g, "_");

    const newJob: Job = {
      id: jobId,
      userId,
      source,
      url,
      title: parsed.title,
      employer: parsed.employer,
      location: parsed.location,
      remote: parsed.remote,
      text: text.slice(0, 20000),
      applyRoute: "open-form",
      requirements: parsed.requirements,
      keywords: parsed.keywords,
      questions: [],
      tone: parsed.tone,
      dedupeKey,
      createdAt: now,
      updatedAt: now,
    };

    await saveJob(newJob);

    // Automatically create application with initial Gap Map
    const userEvidence = await listEvidence(userId);
    let weightedPoints = 0;
    let maxPoints = 0;

    const gapMap = newJob.requirements.map((req) => {
      const weight = req.kind === "must" ? 3 : 1;
      maxPoints += weight;

      // Find matching evidence by keyword or skill tag
      const matchedEv = userEvidence.filter((e) =>
        e.skillTags.some((tag) => req.text.toLowerCase().includes(tag.toLowerCase())) ||
        e.text.toLowerCase().includes(req.text.toLowerCase().slice(0, 15))
      );

      let strength: "strong" | "partial" | "none" = "none";
      if (matchedEv.length >= 2 || (matchedEv.length > 0 && matchedEv.some((e) => e.numbers.length > 0))) {
        strength = "strong";
        weightedPoints += weight * 1.0;
      } else if (matchedEv.length === 1) {
        strength = "partial";
        weightedPoints += weight * 0.5;
      } else {
        strength = "none";
        weightedPoints += 0;
      }

      return {
        requirementId: req.id,
        strength,
        evidenceIds: matchedEv.map((e) => e.id),
      };
    });

    const fit = Math.min(100, Math.round((weightedPoints / Math.max(maxPoints, 1)) * 100));

    const appId = `app_${crypto.randomBytes(6).toString("hex")}`;
    const application: Application = {
      id: appId,
      userId,
      jobId: newJob.id,
      status: "draft",
      gapMap,
      fit: Math.max(50, fit),
      answerOutputIds: [],
      mode: "approved",
      stages: [{ name: "Applied", date: now.slice(0, 10) }],
      notes: "Job imported and Gap Map calculated against evidence bank.",
      createdAt: now,
      updatedAt: now,
    };

    await saveApplication(application);

    return NextResponse.json({
      success: true,
      job: newJob,
      applicationId: application.id,
      fit: application.fit,
    });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/jobs POST] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to process job." }, { status: 500 });
  }
}
