import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PhoneNotice } from "@/components/shell/PhoneNotice";
import { getCurrentUser } from "@/lib/auth/require";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/** Full-screen practice screens: no rail, nothing to distract. */
export default async function LiveLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      {children}
      <PhoneNotice />
    </div>
  );
}
