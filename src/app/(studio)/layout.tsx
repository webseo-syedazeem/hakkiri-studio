import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Rail } from "@/components/shell/Rail";
import { PhoneNotice } from "@/components/shell/PhoneNotice";
import { DesktopHeader } from "@/components/shell/DesktopHeader";
import { isBeta } from "@/lib/launch";
import { getAuthenticatedUser } from "@/lib/auth/users";

/** Screens with the left rail: home, set-up, workspace, feedback, story bank. */
export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const authed = jar.get("hk_auth")?.value === "1";

  if (!authed) {
    redirect("/login");
  }

  const activeUser = getAuthenticatedUser(jar);

  return (
    <div className="flex min-h-screen bg-booth text-ink selection:bg-blue selection:text-white">
      <Rail initials={activeUser.initials} beta={isBeta()} />
      <main className="flex min-w-0 grow flex-col px-9 pb-8 pt-7 print:p-0">
        <div className="mx-auto w-full max-w-[1780px]">
          <DesktopHeader firstName={activeUser.firstName} initials={activeUser.initials} />
          {children}
        </div>
      </main>
      <PhoneNotice />
    </div>
  );
}
