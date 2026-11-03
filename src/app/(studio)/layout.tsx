import { Rail } from "@/components/shell/Rail";
import { PhoneNotice } from "@/components/shell/PhoneNotice";
import { DesktopHeader } from "@/components/shell/DesktopHeader";
import { user } from "@/lib/mock-data";
import { isBeta } from "@/lib/launch";

/** Screens with the left rail: home, set-up, workspace, feedback, story bank. */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-booth text-ink selection:bg-blue selection:text-white">
      <Rail initials={user.initials} beta={isBeta()} />
      <main className="flex min-w-0 grow flex-col px-9 pb-8 pt-7 print:p-0">
        <div className="mx-auto w-full max-w-[1780px]">
          <DesktopHeader firstName={user.firstName} initials={user.initials} />
          {children}
        </div>
      </main>
      <PhoneNotice />
    </div>
  );
}
