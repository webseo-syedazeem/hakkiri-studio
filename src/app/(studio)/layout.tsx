import { Rail } from "@/components/shell/Rail";
import { PhoneNotice } from "@/components/shell/PhoneNotice";
import { user } from "@/lib/mock-data";
import { isBeta } from "@/lib/launch";

/** Screens with the left rail: home, set-up, workspace, feedback, story bank. */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Rail initials={user.initials} beta={isBeta()} />
      <main className="flex min-w-0 grow flex-col px-9 pb-7 pt-7 print:p-0">
        {children}
      </main>
      <PhoneNotice />
    </div>
  );
}
