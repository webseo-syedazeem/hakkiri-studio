import type { Metadata } from "next";
import { listUploadedMediaAsync } from "@/lib/storage/upload";
import { AdminMediaClient } from "./AdminMediaClient";

export const metadata: Metadata = {
  title: "Media Library | Hakkiri Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  const files = await listUploadedMediaAsync();

  return <AdminMediaClient initialFiles={files} />;
}
