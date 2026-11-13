import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Rail } from "@/components/shell/Rail";
import { PhoneNotice } from "@/components/shell/PhoneNotice";
import { isBeta } from "@/lib/launch";
import { getCurrentUser } from "@/lib/auth/require";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/** Screens with the left rail: home, set-up, workspace, feedback, story bank. */
export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const initials = currentUser.initials || "HA";

  return (
    <div className="flex min-h-screen">
      <Rail initials={initials} beta={isBeta()} />
      <main className="flex min-w-0 grow flex-col px-9 pb-7 pt-7 print:p-0">
        {children}
      </main>
      <PhoneNotice />
    </div>
  );
}
