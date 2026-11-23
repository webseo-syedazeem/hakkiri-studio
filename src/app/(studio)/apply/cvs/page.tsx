"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Panel } from "@/components/ui";
import type { Cv } from "@/lib/apply/schema";

/** Your CVs. A new account has none, and nothing is shown that you did not write. */
export default function CvsListPage() {
  const router = useRouter();
  const [cvs, setCvs] = useState<Cv[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/apply/cvs")
      .then(async (res) => {
        if (!res.ok) throw new Error("Your CVs could not be loaded. Please refresh the page.");
        setCvs(await res.json());
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  async function createCv() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/apply/cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "My CV" }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) throw new Error(data.message || "The CV could not be created.");
      router.push(`/apply/cvs/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The CV could not be created.");
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Your CVs</h1>
          <p className="mt-1 text-sm text-muted">Build a CV from your own words, check it, and download it as PDF or Word.</p>
        </div>
        <Button variant="primary" onClick={createCv} disabled={creating}>
          {creating ? "Creating…" : "New CV"}
        </Button>
      </header>

      {error && (
        <p role="alert" className="rounded-xl bg-red/15 px-4 py-3 text-sm text-red-soft">
          {error}
        </p>
      )}

      {cvs === null && !error && <p className="text-sm text-muted">Loading your CVs…</p>}

      {cvs?.length === 0 && (
        <Panel className="p-8 text-center">
          <h2 className="text-lg font-semibold text-ink">No CVs yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Start a new CV. It begins empty: everything on it will be what you put there.
          </p>
        </Panel>
      )}

      {cvs && cvs.length > 0 && (
        <ul className="space-y-3">
          {cvs.map((cv) => (
            <li key={cv.id}>
              <Panel className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link href={`/apply/cvs/${cv.id}`} className="font-semibold text-ink hover:text-blue-soft">
                    {cv.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {cv.kind === "tailored" ? "Tailored version" : "Base CV"} · {cv.bullets.length} bullet{cv.bullets.length === 1 ? "" : "s"} · edited{" "}
                    {new Date(cv.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Link href={`/apply/cvs/${cv.id}`} className="text-sm font-semibold text-blue-soft hover:underline">
                  Open
                </Link>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
