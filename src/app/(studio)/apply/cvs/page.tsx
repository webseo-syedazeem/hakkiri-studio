"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Cv } from "@/lib/apply/schema";

export default function CvsListPage() {
  const router = useRouter();
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/apply/cvs");
        const data = await res.json();
        setCvs(data);
      } catch (err) {
        console.error("Error loading CVs:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCreateNew = async (kind: "base" | "tailored") => {
    setCreating(true);
    try {
      const res = await fetch("/api/apply/cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: kind === "base" ? "Master Base CV" : "Tailored Role CV",
          kind,
          templateId: "standard",
        }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/apply/cvs/${data.id}`);
      }
    } catch (err) {
      console.error("Error creating CV:", err);
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">Hakkiri Apply</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            CV & Resume Builder ({cvs.length})
          </h1>
          <p className="text-xs text-muted mt-1">
            Build and tailor ATS-compliant resumes with real-time audit scoring, instant keyword matching, and section on/off controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleCreateNew("base")}
            disabled={creating}
            className="rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover transition disabled:opacity-50"
          >
            {creating ? "Creating..." : "+ New Base CV"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-muted">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cvs.map((cv) => (
            <div
              key={cv.id}
              className="rounded-2xl border border-line bg-booth p-6 space-y-4 hover:border-line-hover transition relative group shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-0.5 rounded border border-accent/20">
                    {cv.kind} CV · {cv.templateId} template
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{cv.name}</h3>
                  <div className="text-[11px] text-muted">
                    {cv.bullets.filter((b) => b.visible !== false).length} active experience bullets
                  </div>
                </div>

                {/* Score Badge */}
                <div className="text-right">
                  <div
                    className={`text-2xl font-black ${
                      (cv.score?.total || 75) >= 85
                        ? "text-emerald-400"
                        : (cv.score?.total || 75) >= 70
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    {cv.score?.total || 75}
                    <span className="text-xs font-normal text-muted">/100</span>
                  </div>
                  <div className="text-[10px] text-muted">ATS Quality Score</div>
                </div>
              </div>

              {/* Subscores mini preview */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-line text-center text-[10px]">
                <div className="bg-canvas p-2 rounded-lg border border-line">
                  <div className="text-muted">Evidence</div>
                  <div className="font-bold text-ink mt-0.5">{cv.score?.parts?.evidence || 85}%</div>
                </div>
                <div className="bg-canvas p-2 rounded-lg border border-line">
                  <div className="text-muted">Clarity</div>
                  <div className="font-bold text-ink mt-0.5">{cv.score?.parts?.clarity || 80}%</div>
                </div>
                <div className="bg-canvas p-2 rounded-lg border border-line">
                  <div className="text-muted">Structure</div>
                  <div className="font-bold text-ink mt-0.5">{cv.score?.parts?.structure || 85}%</div>
                </div>
                <div className="bg-canvas p-2 rounded-lg border border-line">
                  <div className="text-muted">Software</div>
                  <div className="font-bold text-ink mt-0.5">{cv.score?.parts?.software || 90}%</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href={`/apply/cvs/${cv.id}`}
                  className="rounded-xl bg-card border border-line px-4 py-2 text-xs font-bold text-white hover:bg-line transition"
                >
                  Edit & Live Preview →
                </Link>

                <span className="text-[11px] text-muted font-mono">
                  Updated {new Date(cv.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
