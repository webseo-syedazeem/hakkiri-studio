"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Panel } from "@/components/ui";
import type { Cv, CvBullet } from "@/lib/apply/schema";

/**
 * Interim CV editor. It shows only what is stored in this person's CV: there
 * is no sample career, no fixed score breakdown and no keyword button. The
 * full editor (sections, templates, export, score) replaces this page.
 */
export default function CvEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [cv, setCv] = useState<Cv | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [newBullet, setNewBullet] = useState("");

  useEffect(() => {
    fetch(`/api/apply/cvs/${id}`)
      .then(async (res) => {
        if (res.status === 404) return setState("missing");
        if (!res.ok) return setState("error");
        const data = await res.json();
        setCv(data.cv);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [id]);

  async function save(patch: Partial<Pick<Cv, "name" | "sections" | "bullets">>) {
    if (!cv) return;
    setCv({ ...cv, ...patch });
    setSaving("saving");
    try {
      const res = await fetch(`/api/apply/cvs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setCv(await res.json());
      setSaving("saved");
    } catch {
      setSaving("failed");
    }
  }

  if (state === "loading") return <p className="p-6 text-sm text-muted">Loading your CV…</p>;
  if (state === "missing" || state === "error" || !cv) {
    return (
      <Panel className="mx-auto mt-10 max-w-lg p-8 text-center">
        <h1 className="text-lg font-semibold text-ink">{state === "missing" ? "CV not found" : "This CV could not be loaded"}</h1>
        <p className="mt-2 text-sm text-muted">
          {state === "missing" ? "It may have been deleted, or it belongs to another account." : "Please refresh the page to try again."}
        </p>
        <Link href="/apply/cvs" className="mt-4 inline-block text-sm font-semibold text-blue-soft hover:underline">
          Back to your CVs
        </Link>
      </Panel>
    );
  }

  const summary = cv.sections.find((s) => s.type === "summary")?.text ?? "";
  const setSummary = (text: string) =>
    cv.sections.some((s) => s.type === "summary")
      ? cv.sections.map((s) => (s.type === "summary" ? { ...s, text } : s))
      : [...cv.sections, { type: "summary", order: cv.sections.length + 1, visible: true, text }];
  const updateBullet = (bid: string, change: Partial<CvBullet>) => cv.bullets.map((b) => (b.id === bid ? { ...b, ...change } : b));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <Link href="/apply/cvs" className="text-sm text-muted hover:text-ink">
          ← Your CVs
        </Link>
        <span aria-live="polite" className="text-xs text-muted">
          {saving === "saving" ? "Saving…" : saving === "saved" ? "Saved" : saving === "failed" ? "Not saved. Check your connection and try again." : ""}
        </span>
      </div>

      <Panel className="space-y-2 p-5">
        <label htmlFor="cv-name" className="text-xs font-semibold uppercase tracking-wide text-muted">
          CV name
        </label>
        <input
          id="cv-name"
          defaultValue={cv.name}
          onBlur={(e) => e.target.value.trim() && e.target.value !== cv.name && save({ name: e.target.value.trim() })}
          className="w-full rounded-lg bg-panel-2 px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-blue"
        />
      </Panel>

      <Panel className="space-y-2 p-5">
        <label htmlFor="cv-summary" className="text-xs font-semibold uppercase tracking-wide text-muted">
          Profile
        </label>
        <textarea
          id="cv-summary"
          defaultValue={summary}
          rows={4}
          placeholder="Three or four sentences about you, written last."
          onBlur={(e) => e.target.value !== summary && save({ sections: setSummary(e.target.value) })}
          className="w-full rounded-lg bg-panel-2 px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-blue"
        />
      </Panel>

      <Panel className="space-y-3 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Bullets</h2>
        {cv.bullets.length === 0 && <p className="text-sm text-muted">No bullets yet. Add one below in your own words.</p>}
        <ul className="space-y-2">
          {cv.bullets.map((b) => (
            <li key={b.id} className="flex items-start gap-2">
              <textarea
                aria-label="Bullet text"
                defaultValue={b.text}
                rows={2}
                onBlur={(e) => e.target.value.trim() !== b.text && save({ bullets: updateBullet(b.id, { text: e.target.value.trim() }) })}
                className={`flex-1 rounded-lg bg-panel-2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue ${b.visible === false ? "text-dim line-through" : "text-ink"}`}
              />
              <Button size="sm" variant="ghost" onClick={() => save({ bullets: updateBullet(b.id, { visible: b.visible === false }) })}>
                {b.visible === false ? "Show" : "Hide"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => save({ bullets: cv.bullets.filter((x) => x.id !== b.id) })}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const text = newBullet.trim();
            if (!text) return;
            save({ bullets: [...cv.bullets, { id: `b_${Date.now().toString(36)}`, roleId: "role-1", text, evidenceIds: [], origin: "person", visible: true }] });
            setNewBullet("");
          }}
        >
          <input
            aria-label="New bullet"
            value={newBullet}
            onChange={(e) => setNewBullet(e.target.value)}
            placeholder="What did you do, and what changed because of it?"
            className="flex-1 rounded-lg bg-panel-2 px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-blue"
          />
          <Button type="submit" variant="secondary" size="md" disabled={!newBullet.trim()}>
            Add
          </Button>
        </form>
      </Panel>
    </div>
  );
}
