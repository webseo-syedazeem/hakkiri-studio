import type { Metadata } from "next";
import { Setup } from "@/components/cv/Setup";

export const metadata: Metadata = { title: "Start your CV" };

export default function NewCvPage() {
  return <Setup />;
}
