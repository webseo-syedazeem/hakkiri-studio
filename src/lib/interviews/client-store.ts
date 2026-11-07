"use client";

export interface ClientInterviewSummary {
  id: string;
  company: string;
  companyInitial: string;
  role: string;
  date?: string;
  time?: string;
  format?: string;
  settings?: {
    difficulty: string;
    minutes: number;
    preset: string;
  };
  stages?: Array<{
    id: string;
    name: string;
    date: string;
    time: string;
    format: string;
    interviewer: string;
    status: string;
  }>;
  createdAt: string;
  verdict?: "ready" | "nearly" | "not-yet";
  freshCount: number;
}

const STORAGE_KEY = "hk_custom_interviews";

export function loadClientInterviews(): ClientInterviewSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveClientInterview(interview: ClientInterviewSummary): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadClientInterviews();
    const filtered = current.filter((it) => it.id !== interview.id);
    const updated = [interview, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Clear the draft since the interview is now finalized & built
    localStorage.removeItem("hk_interview_wizard_draft");
    window.dispatchEvent(new Event("hk_interviews_updated"));
    window.dispatchEvent(new Event("hk_draft_updated"));
  } catch {}
}

export function deleteClientInterview(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadClientInterviews();
    const updated = current.filter((it) => it.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("hk_interviews_updated"));
  } catch {}
}
