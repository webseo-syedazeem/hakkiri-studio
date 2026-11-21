import type { Metadata } from "next";
import { getHomepageContentAsync } from "@/lib/site/site-content";
import { AdminSiteClient } from "./AdminSiteClient";

export const metadata: Metadata = {
  title: "Homepage & Site CMS | Hakkiri Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSitePage() {
  const content = await getHomepageContentAsync();

  return <AdminSiteClient initialContent={content} />;
}
