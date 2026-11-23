import type { Metadata } from "next";
import { Setup } from "@/components/cv/Setup";

export const metadata: Metadata = { title: "New CV" };

export default function NewCvPage() {
  return <Setup />;
}
