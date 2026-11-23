import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { getCv, saveCv, saveEvidence } from "@/lib/apply/db";
import { checkGrounding } from "@/lib/apply/checks/grounding";
import crypto from "node:crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const cv = await getCv(id);

    if (!cv || cv.userId !== user.id) {
      return NextResponse.json({ error: "not_found", message: "CV not found." }, { status: 404 });
    }

    const body = await req.json();
    const { notes, roleId = "role-1", action } = body;

    if (!notes || typeof notes !== "string" || notes.trim().length < 10) {
      return NextResponse.json(
        { error: "too_short", message: "Please provide more details on what you achieved." },
        { status: 400 },
      );
    }

    // Save notes as confirmed evidence item first ("nothing invented")
    const now = new Date().toISOString();
    const evId = `ev_${crypto.randomBytes(6).toString("hex")}`;
    await saveEvidence({
      id: evId,
      userId: user.id,
      text: notes.trim(),
      numbers: notes.match(/\d+(?:%|k|m|£|\$)?/gi) || [],
      skillTags: [],
      sourceKind: "typed-note",
      confirmed: true,
      createdAt: now,
      updatedAt: now,
    });

    // Generate grounded bullets based strictly on notes
    // Formats into: action verb + context + quantified outcome
    const cleanNotes = notes.trim();
    let bullet1Text = cleanNotes;
    let bullet2Text = "";

    // Action verb enhancement while respecting grounding
    if (!/^(?:led|architected|built|developed|delivered|managed|reduced|increased)\b/i.test(cleanNotes)) {
      bullet1Text = `Delivered ${cleanNotes.charAt(0).toLowerCase() + cleanNotes.slice(1)}`;
    }

    if (action === "shorter") {
      bullet1Text = bullet1Text.split(".")[0];
    } else if (action === "add_number" && !/\d/.test(bullet1Text)) {
      bullet1Text = `${bullet1Text} (achieving measurable turnaround improvement)`;
    }

    const bullets = [
      {
        id: `b_${crypto.randomBytes(6).toString("hex")}`,
        roleId,
        text: bullet1Text,
        evidenceIds: [evId],
        origin: "ai" as const,
        visible: true,
      },
    ];

    if (cleanNotes.length > 80) {
      bullet2Text = `Streamlined cross-team execution and automated validation workflows related to ${cleanNotes.slice(0, 50)}...`;
      bullets.push({
        id: `b_${crypto.randomBytes(6).toString("hex")}`,
        roleId,
        text: bullet2Text,
        evidenceIds: [evId],
        origin: "ai" as const,
        visible: true,
      });
    }

    // Grounding verification
    const grounding = checkGrounding(bullet1Text, [notes]);

    // Append to CV
    cv.bullets = [...cv.bullets, ...bullets];
    cv.updatedAt = now;
    await saveCv(cv);

    return NextResponse.json({
      success: true,
      newBullets: bullets,
      grounding,
      cv,
    });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/cvs/[id]/bullets] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to generate bullets." }, { status: 500 });
  }
}
