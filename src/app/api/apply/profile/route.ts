import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { getProfile, saveProfile } from "@/lib/apply/db";
import type { Profile } from "@/lib/apply/schema";

export async function GET() {
  try {
    const user = await requireUser();
    const userId = user.id || "usr_guest";
    const candidateName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email?.split("@")[0] || "Candidate";
    const userEmail = user.email || "candidate@example.com";
    let profile = await getProfile(userId);

    if (!profile) {
      const now = new Date().toISOString();
      const defaultProfile: Profile = {
        userId,
        region: "uk",
        contact: {
          name: candidateName,
          email: userEmail,
          phone: "+44 7700 900123",
          location: "London, UK",
          links: ["https://linkedin.com"],
        },
        headline: "Senior Software Engineer & Tech Lead",
        summary: "Results-driven engineering leader with 8+ years building scalable distributed cloud systems.",
        roles: [
          {
            id: "role-1",
            title: "Senior Full Stack Engineer",
            employer: "FinTech Scaleup",
            location: "London, UK",
            start: "2023",
            end: "Present",
            current: true,
            bullets: [
              {
                id: "b-1",
                text: "Architected real-time payment reconciliation engine processing £14M+ daily transactions with 99.99% uptime.",
                evidenceIds: [],
              },
              {
                id: "b-2",
                text: "Mentored 5 junior engineers and introduced TypeScript/Next.js best practices across 3 cross-functional teams.",
                evidenceIds: [],
              },
            ],
          },
        ],
        education: [
          {
            id: "edu-1",
            institution: "University of Manchester",
            qualification: "BSc Computer Science",
            grade: "First Class Honours",
            start: "2016",
            end: "2019",
          },
        ],
        skills: [
          { name: "TypeScript", group: "Languages", evidenceIds: [] },
          { name: "Next.js", group: "Frameworks", evidenceIds: [] },
          { name: "MongoDB", group: "Databases", evidenceIds: [] },
          { name: "Cloud Architecture", group: "Engineering", evidenceIds: [] },
        ],
        extras: [
          { kind: "certificate", title: "AWS Certified Solutions Architect", detail: "Amazon Web Services" },
        ],
        screening: {
          rightToWork: "Yes (UK Citizen)",
          noticePeriod: "1 month",
          salaryMin: 85000,
          salaryCurrency: "GBP",
          relocate: false,
          remote: "hybrid",
          visaNeeded: false,
          custom: [],
        },
        completeness: 85,
        createdAt: now,
        updatedAt: now,
      };
      await saveProfile(defaultProfile);
      profile = defaultProfile;
    }

    return NextResponse.json(profile);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/profile GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to load profile." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const userId = user.id || "usr_guest";
    const candidateName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email?.split("@")[0] || "Candidate";
    const userEmail = user.email || "candidate@example.com";
    const existing = await getProfile(userId);
    const body = await req.json();

    const now = new Date().toISOString();
    const updated: Profile = {
      ...(existing || {
        userId,
        region: "uk",
        contact: { name: candidateName, email: userEmail, phone: "", location: "", links: [] },
        headline: "",
        summary: "",
        roles: [],
        education: [],
        skills: [],
        extras: [],
        screening: {
          rightToWork: "Yes",
          noticePeriod: "1 month",
          salaryMin: 50000,
          salaryCurrency: "GBP",
          relocate: false,
          remote: "hybrid",
          visaNeeded: false,
          custom: [],
        },
        completeness: 70,
        createdAt: now,
        updatedAt: now,
      }),
      ...body,
      userId, // Immutable
      updatedAt: now,
    };

    await saveProfile(updated);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/profile PATCH] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to update profile." }, { status: 500 });
  }
}
