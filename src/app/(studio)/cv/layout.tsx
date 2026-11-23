import type { Metadata } from "next";
import "@/components/cv/cv.css";

export const metadata: Metadata = { title: "CVs and letters" };

/** The CV and cover letter section. */
export default function CvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
