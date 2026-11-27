"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TemplateId } from "@/lib/cv/schema";
import { FAMILY_NAMES, GALLERIES, type GalleryKind, TEMPLATE_FAMILIES, type TemplateFamily, templateLabel, templatePreview, templateSlug } from "@/lib/cv/render/templates";

/** What the gallery needs of a template: no functions, so it can be handed from the server. */
export interface GalleryItem {
  id: TemplateId;
  no: number;
  name: string;
  family: TemplateFamily;
  suits: string;
  tags: string[];
}

/**
 * The template gallery: every template as the renderer draws it, by number,
 * with filters by family and a search by name, number or tag. Shared by the
 * UK (CV), US (resume) and cover letter pages.
 */
export function TemplateGallery({ items, kind }: { items: GalleryItem[]; kind: GalleryKind }) {
  const { word, base, title, region } = GALLERIES[kind];
  const [family, setFamily] = useState<TemplateFamily | "all">("all");
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^no\.?\s*/, "");
    const matches = (t: GalleryItem) => (/^\d+$/.test(q) ? t.no === Number(q) : t.name.toLowerCase().includes(q) || t.tags.some((g) => g.includes(q)) || t.suits.toLowerCase().includes(q) || FAMILY_NAMES[t.family].toLowerCase().includes(q));
    return items.filter((t) => (family === "all" || t.family === family) && (!q || matches(t)));
  }, [items, family, query]);

  return (
    <div className="w-full bg-[#fafbfc]">
      <section className="border-b border-black/[0.06] bg-white px-4 pt-12 pb-10 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {kind === "letter"
              ? `${items.length} cover letter templates, each matching the CV template with the same number, so your letter and CV look like a pair. Every sentence is checked against your CV before you send it.`
              : `${items.length} templates of real text with standard headings, written in reading order so screening software reads them the way a person does. Pick one, then change the fonts, ${region === "us" ? "color" : "colour"}, spacing and more.`}
          </p>
          <label className="relative mt-2 w-full max-w-lg">
            <span className="sr-only">Search templates by name, number or style</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: header band, 07, serif, healthcare…"
              className="h-12 w-full rounded-full border border-slate-300 bg-white px-5 text-base text-slate-800 placeholder-slate-500 shadow-sm focus:border-[#3d4bd8] focus:outline-none focus:ring-2 focus:ring-[#3d4bd8]/30"
            />
          </label>
        </div>
      </section>

      <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6">
        <div role="group" aria-label="Families" className="mb-6 flex flex-wrap gap-2">
          {(["all", ...TEMPLATE_FAMILIES] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={family === f}
              onClick={() => setFamily(f)}
              className={`min-h-[44px] rounded-full border px-4 text-sm font-semibold transition-colors ${family === f ? "border-[#3d4bd8] bg-[#3d4bd8] text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"}`}
            >
              {f === "all" ? "All" : FAMILY_NAMES[f]}
            </button>
          ))}
        </div>
        <p className="mb-4 text-sm text-slate-600" role="status">
          {shown.length === items.length ? `All ${items.length} templates` : `${shown.length} of ${items.length} templates`}
        </p>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((t) => (
            <li key={t.id}>
              <Link href={`${base}/${templateSlug(t)}`} className="group block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4bd8]">
                <span className="block overflow-hidden rounded-lg border border-slate-100 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={templatePreview(t, "small", kind)} srcSet={`${templatePreview(t, "small", kind)} 550w, ${templatePreview(t, "large", kind)} 1098w`} sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 92vw" alt={`${templateLabel(t)}: the first page of an example ${word}`} width={550} height={777} loading="lazy" className="block h-auto w-full" />
                </span>
                <span className="mt-3 block text-base font-semibold text-slate-900">{templateLabel(t)}</span>
                <span className="block text-sm text-slate-600">Good for: {t.suits.charAt(0).toLowerCase() + t.suits.slice(1)}</span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">{FAMILY_NAMES[t.family]}</span>
                  {t.tags.map((g) => (
                    <span key={g} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {g}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {!shown.length && <p className="py-12 text-center text-slate-600">No template matches that. Try another word, or show all families.</p>}
      </div>
    </div>
  );
}
