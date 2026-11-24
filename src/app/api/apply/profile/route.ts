import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";
import { getProfile, saveProfile } from "@/lib/apply/db";
import { emptyProfile, profileCompleteness, withoutSeededProfile } from "@/lib/apply/own-data";
import { ProfileEducationSchema, ProfileExtraSchema, ProfileRoleSchema, ProfileSkillSchema, type Profile } from "@/lib/apply/schema";

/**
 * The person's own career profile. A new account's profile is empty apart
 * from the account's name and email: no headline, role, degree, skill, phone
 * number or salary is written in for them. The sample profile an earlier
 * build saved into every account is removed here, part by part, wherever it
 * is still exactly as it was written.
 */
export async function GET() {
  try {
    const user = await requireUser();
    const stored = await getProfile(user.id);
    if (!stored) return NextResponse.json(emptyProfile(user, new Date().toISOString()));
    const { profile, changed } = withoutSeededProfile(stored);
    if (changed) await saveProfile({ ...profile, updatedAt: new Date().toISOString() });
    return NextResponse.json(profile);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/profile GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to load profile." }, { status: 500 });
  }
}

const text = (max: number) => z.string().max(max);
/** What a person can change in their profile. Each part is checked; anything else that is sent is ignored. */
const Patch = z
  .object({
    region: z.enum(["uk", "us"]),
    contact: z.object({ name: text(120), email: text(200), phone: text(40), location: text(120), links: z.array(text(300)).max(10) }),
    headline: text(200),
    summary: text(4000),
    roles: z.array(ProfileRoleSchema).max(40),
    education: z.array(ProfileEducationSchema).max(20),
    skills: z.array(ProfileSkillSchema).max(100),
    extras: z.array(ProfileExtraSchema).max(40),
    screening: z.object({
      rightToWork: text(120),
      noticePeriod: text(60),
      salaryMin: z.number().min(0).max(10_000_000),
      salaryCurrency: text(8),
      relocate: z.boolean(),
      remote: z.enum(["any", "remote", "hybrid", "onsite"]),
      visaNeeded: z.boolean(),
      custom: z.array(z.object({ question: text(300), answer: text(1000) })).max(30),
    }),
    sourceCvText: text(40_000),
  })
  .partial();

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const read = await readJson(req, Patch, { max: 300_000, message: "Your profile couldn’t be saved. Check what you entered and try again." });
    if (!read.ok) return read.response;

    const now = new Date().toISOString();
    const stored = await getProfile(user.id);
    const base = stored ? withoutSeededProfile(stored).profile : emptyProfile(user, now);
    const merged: Profile = { ...base, ...read.data, userId: user.id, updatedAt: now };
    const updated: Profile = { ...merged, completeness: profileCompleteness(merged) };

    await saveProfile(updated);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/profile PATCH] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to update profile." }, { status: 500 });
  }
}
