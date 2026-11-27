import type { Metadata } from "next";
import { CvQuestions } from "@/components/cv/CvQuestions";

export const metadata: Metadata = { title: "Questions your CV will get" };

export default function CvQuestionsPage() {
  return <CvQuestions />;
}
