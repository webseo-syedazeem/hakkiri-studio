import type { Metadata } from "next";
import { Talk } from "@/components/cv/Talk";

export const metadata: Metadata = { title: "Talk it through" };

/** Building the CV by talking or typing to the assistant, with the paper beside the conversation. */
export default function TalkPage() {
  return <Talk />;
}
