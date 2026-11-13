import { redirect } from "next/navigation";
import { requirePageUser } from "@/lib/auth/require";

export default async function StoryBankRedirect() {
  await requirePageUser();
  redirect("/interview-examples");
}
