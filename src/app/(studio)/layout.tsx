import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Rail } from "@/components/shell/Rail";
import { PhoneNotice } from "@/components/shell/PhoneNotice";
import { BrowserOwner } from "@/components/shell/BrowserOwner";
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
    <div className="flex min-h-screen flex-col md:flex-row w-full max-w-full">
      {currentUser.id ? <BrowserOwner userId={currentUser.id} /> : null}
      <Rail initials={initials} beta={isBeta()} />
      <main className="flex min-w-0 grow flex-col px-4 py-4 sm:px-6 sm:py-6 md:px-9 md:py-7 print:p-0 w-full max-w-full overflow-x-clip">
        {children}
      </main>
      <PhoneNotice />
    </div>
  );
}
