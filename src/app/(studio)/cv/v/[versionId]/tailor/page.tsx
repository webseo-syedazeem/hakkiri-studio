import type { Metadata } from "next";
import { Tailor } from "@/components/cv/Tailor";

export const metadata: Metadata = { title: "Tailor to a job" };

export default function TailorPage() {
  return <Tailor />;
}
