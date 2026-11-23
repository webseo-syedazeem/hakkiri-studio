import { CvWorkspace } from "@/components/cv/Workspace";

/** One CV: its screens share the loaded CV, its save state, its undo history and its paper. */
export default async function VersionLayout({ children, params }: { children: React.ReactNode; params: Promise<{ versionId: string }> }) {
  return <CvWorkspace versionId={(await params).versionId}>{children}</CvWorkspace>;
}
