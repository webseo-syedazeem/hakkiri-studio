"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { INDUSTRIES } from "@/lib/cv/examples/industries";
import { exampleCard, findExamples, findTemplates } from "@/lib/cv/examples/search";
import type { IndustryId } from "@/lib/cv/examples/types";
import { pick } from "@/lib/cv/examples/build";
import { FAMILY_NAMES, TEMPLATE_FAMILIES, type TemplateFamily, templateLabel, templatePreview, templateSlug } from "@/lib/cv/render/templates";
import { CV_LEVELS, type CvLevel, type CvRegion, LEVEL_LABELS } from "@/lib/cv/schema";
import { Bar, Btn, CvScreen, Panel, Toolbar } from "./ui";

type Show = "all" | "examples" | "templates";

/** An example's first page, drawn in its own design (scripts/template-previews.cjs examples). */
export const examplePreview = (id: string, region: CvRegion) => `/example-previews/${id}-${region}.webp`;

/**
 * Find an example or template: one search by job or industry across the
 * written examples (each a CV and cover letter, for the UK and the US) and
 * the 45 designs. Examples are content; templates are designs; any example
 * can wear any design.
 */
export function Catalogue() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState<IndustryId | "">("");
  const [level, setLevel] = useState<CvLevel | "">("");
  const [region, setRegion] = useState<CvRegion>("uk");
  const [look, setLook] = useState<TemplateFamily | "">("");
  const [show, setShow] = useState<Show>("all");

  // The search lives in the address, so it can be shared and Back returns to it.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    // An old link to one example (?example=chef&region=us) goes to that example's own page.
    const example = p.get("example");
    if (example) {
      router.replace(`/cv/examples/${encodeURIComponent(example)}${p.get("region") === "us" ? "?region=us" : ""}`);
      return;
    }
    setQ(p.get("q") ?? "");
    setIndustry((p.get("industry") as IndustryId) || "");
    setLevel((p.get("level") as CvLevel) || "");
    setLook((p.get("look") as TemplateFamily) || "");
    setShow((p.get("show") as Show) || "all");
    const r = p.get("region");
    setRegion(r === "us" || r === "uk" ? r : /^en-US$/i.test(navigator.language) ? "us" : "uk");
  }, [router]);
  useEffect(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (industry) p.set("industry", industry);
    if (level) p.set("level", level);
    if (look) p.set("look", look);
    if (show !== "all") p.set("show", show);
    p.set("region", region);
    window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
  }, [q, industry, level, look, show, region]);

  const query = { q, industry, level, look };
  const examples = useMemo(() => findExamples(query).map((e) => exampleCard(e, region)), [q, industry, level, region]); // eslint-disable-line react-hooks/exhaustive-deps
  const templates = useMemo(() => findTemplates(query), [q, industry, level, look]); // eslint-disable-line react-hooks/exhaustive-deps
  const word = region === "us" ? "resume" : "CV";
  const filtered = !!(q.trim() || industry || level || look || show !== "all");
  const clear = () => {
    setQ("");
    setIndustry("");
    setLevel("");
    setLook("");
    setShow("all");
  };

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Examples and templates" }]} />
      <div className="cv-area">
        <Toolbar title="Find an example or template" subtitle="Examples are written content. Templates are designs. Any example can use any design." />

        <Panel className="cv-find">
          <form className="cv-pad cv-stack" role="search" onSubmit={(e) => e.preventDefault()}>
            <div className="cv-find-search">
              <label className="sr-only" htmlFor="find-q">
                Search by job or industry
              </label>
              <input id="find-q" className="cv-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by job or industry" autoComplete="off" />
              <Btn kind="primary" type="submit">
                Search
              </Btn>
            </div>
            <div className="cv-find-filters">
              <label>
                <span className="cv-label">Industry</span>
                <select className="cv-input" value={industry} onChange={(e) => setIndustry(e.target.value as IndustryId | "")}>
                  <option value="">All industries</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i.id} value={i.id}>
                      {pick(i.name, region)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="cv-label">Level</span>
                <select className="cv-input" value={level} onChange={(e) => setLevel(e.target.value as CvLevel | "")}>
                  <option value="">All levels</option>
                  {CV_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {LEVEL_LABELS[l]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="cv-label">Country</span>
                <select className="cv-input" value={region} onChange={(e) => setRegion(e.target.value as CvRegion)}>
                  <option value="uk">UK · CV on A4</option>
                  <option value="us">US · resume on Letter</option>
                </select>
              </label>
              <label>
                <span className="cv-label">Look</span>
                <select className="cv-input" value={look} onChange={(e) => setLook(e.target.value as TemplateFamily | "")}>
                  <option value="">All looks</option>
                  {TEMPLATE_FAMILIES.map((f) => (
                    <option key={f} value={f}>
                      {FAMILY_NAMES[f]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </form>
        </Panel>

        <div className="cv-row" style={{ justifyContent: "space-between", margin: "16px 0 18px" }}>
          <div className="cv-seg" role="group" aria-label="Show">
            {(["all", "examples", "templates"] as const).map((s) => (
              <button key={s} type="button" aria-pressed={show === s} onClick={() => setShow(s)}>
                {s === "all" ? "All" : s === "examples" ? "Examples" : "Templates"}
              </button>
            ))}
          </div>
          {filtered && (
            <Btn kind="quiet" onClick={clear}>
              Clear filters
            </Btn>
          )}
        </div>

        {show !== "templates" && (
          <section aria-labelledby="written-examples" className="cv-find-group">
            <h2 id="written-examples" className="cv-section-title">
              Written examples <small className="cv-muted">{examples.length} shown</small>
            </h2>
            {examples.length ? (
              <ul className="cv-cards">
                {examples.map((e) => (
                  <li key={e.id}>
                    <Link className="cv-card" href={`/cv/examples/${e.id}?region=${region}`} data-testid="example-card">
                      <span className="cv-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={examplePreview(e.id, region)} alt="" width={550} height={777} loading="lazy" />
                      </span>
                      <span className="cv-card-body">
                        <b>{e.role}</b>
                        <small>
                          {e.industry} · {LEVEL_LABELS[e.level]}
                        </small>
                        <small>
                          {word === "CV" ? "CV" : "Resume"}
                          {e.letter ? " + cover letter" : ""} · UK and US
                        </small>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="cv-find-empty" role="status">
                <b>No examples found</b>
                <p>Try a different job, industry or level.</p>
                <Btn onClick={clear}>Clear filters</Btn>
              </div>
            )}
          </section>
        )}

        {show !== "examples" && (
          <section aria-labelledby="templates-found" className="cv-find-group">
            <h2 id="templates-found" className="cv-section-title">
              Templates <small className="cv-muted">{templates.length} shown</small>
            </h2>
            {templates.length ? (
              <ul className="cv-cards">
                {templates.map((t) => (
                  <li key={t.id}>
                    <Link className="cv-card" href={`/cv/templates/${templateSlug(t)}?region=${region}`} data-testid="template-card">
                      <span className="cv-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={templatePreview(t, "small")} alt="" width={550} height={777} loading="lazy" />
                      </span>
                      <span className="cv-card-body">
                        <b>{templateLabel(t)}</b>
                        <small>Good for {t.suits.charAt(0).toLowerCase() + t.suits.slice(1)}</small>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="cv-find-empty" role="status">
                <b>No designs match these filters.</b>
                <Btn onClick={clear}>Clear filters</Btn>
              </div>
            )}
          </section>
        )}
      </div>
    </CvScreen>
  );
}
