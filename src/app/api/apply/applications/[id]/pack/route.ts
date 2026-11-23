import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { getApplication, getJob, getProfile, listOutputs, listEvidence } from "@/lib/apply/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const userId = user.id || "usr_guest";
    const { id } = await params;
    const application = await getApplication(id);

    if (!application || application.userId !== userId) {
      return NextResponse.json({ error: "not_found", message: "Application not found." }, { status: 404 });
    }

    const job = await getJob(application.jobId);
    const profile = await getProfile(userId);
    const outputs = await listOutputs(application.id);
    const evidence = await listEvidence(userId);

    const letterOutput = outputs.find((o) => o.kind === "letter");
    const letterText = letterOutput?.versions?.[0]?.text || "";

    const candidateName = profile?.contact.name || [user.firstName, user.lastName].filter(Boolean).join(" ") || "Candidate";

    const pack = {
      applicationId: application.id,
      job: {
        title: job?.title || "Role",
        employer: job?.employer || "Employer",
        location: job?.location || "Remote",
        applyUrl: job?.applyUrl || job?.url || "",
      },
      candidate: {
        name: candidateName,
        email: profile?.contact.email || user.email || "",
        phone: profile?.contact.phone || "+44 7700 900123",
        location: profile?.contact.location || "London, UK",
        screening: profile?.screening || {},
      },
      coverLetter: letterText,
      answers: outputs
        .filter((o) => o.kind === "answer")
        .map((o) => ({
          questionId: o.questionId,
          text: o.versions?.[0]?.text || "",
          wordCount: o.versions?.[0]?.text.split(/\s+/).length || 0,
        })),
      verifiedEvidenceSnippets: evidence.slice(0, 5).map((e) => e.text),
      exportedAt: new Date().toISOString(),
    };

    return NextResponse.json(pack);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/applications/[id]/pack GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to build pack." }, { status: 500 });
  }
}
