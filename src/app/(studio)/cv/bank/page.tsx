import type { Metadata } from "next";
import { Bank } from "@/components/cv/Bank";

export const metadata: Metadata = { title: "Achievements" };

export default function BankPage() {
  return <Bank />;
}
