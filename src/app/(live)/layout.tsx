import { PhoneNotice } from "@/components/shell/PhoneNotice";

/** Full-screen practice screens: no rail, nothing to distract. */
export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
      <PhoneNotice />
    </div>
  );
}
