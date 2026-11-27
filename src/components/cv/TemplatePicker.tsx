"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { exampleCv } from "@/lib/cv/examples/build";
import { exampleForTemplate } from "@/lib/cv/examples/search";
import { COLUMNS_NOTE, FAMILY_NAMES, galleryTemplates, templateBySlug, templateLabel, templatePreview, templateSlug } from "@/lib/cv/render/templates";
import type { CvDoc, CvRegion } from "@/lib/cv/schema";
import { ApiError, api, messageOf } from "./client";
import { PaperView } from "./Paper";
import { usePaper } from "./usePaper";
import { Bar, Btn, CvScreen, Panel, Toolbar } from "./ui";

/**
 * One design, shown with the person's own CV when they came from it (?cv=…),
 * or with an example otherwise. "Use this design" changes the design only:
 * every word, section and setting of the CV stays as it is.
 */
export function TemplatePicker({ slug }: { slug: string }) {
  const router = useRouter();
  const t = templateBySlug(slug);
  const [cvId, setCvId] = useState("");
  const [region, setRegion] = useState<CvRegion>("uk");
  const [mine, setMine] = useState<CvDoc | null>(null);
  const [loadProblem, setLoadProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setCvId(p.get("cv") ?? "");
    const r = p.get("region");
    setRegion(r === "us" || r === "uk" ? r : /^en-US$/i.test(navigator.language) ? "us" : "uk");
  }, []);
  useEffect(() => {
    if (!cvId) return;
    api<{ cv: CvDoc }>(`/api/cv/versions/${cvId}`)
      .then((r) => setMine(r.cv))
      .catch((e) => setLoadProblem(messageOf(e)));
  }, [cvId]);
  const sample = useMemo(() => (t ? exampleCv(exampleForTemplate(t), region, "example") : null), [t, region]);
  const shown = useMemo(() => {
    const doc = mine ?? sample;
    return doc && t ? { ...doc, design: { ...doc.design, template: t.id } } : null;
  }, [mine, sample, t]);
  const { paper, state, retry } = usePaper(shown);

  if (!t || !shown) {
    return (
      <CvScreen>
        <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Examples and templates", href: "/cv/examples?show=templates" }]} />
        <div className="cv-area">
          <Toolbar title="No templates found." subtitle="That design isn’t available. Choose another." />
          <Link className="cv-btn cv-btn-primary" href="/cv/examples?show=templates">
            See all templates
          </Link>
        </div>
      </CvScreen>
    );
  }
  const word = (mine?.region ?? region) === "us" ? "resume" : "CV";
  const keep = cvId ? `?cv=${cvId}` : `?region=${region}`;
  const others = galleryTemplates()
    .filter((x) => x.id !== t.id)
    .sort((a, b) => Number(b.family === t.family) - Number(a.family === t.family) || a.no - b.no)
    .slice(0, 9);

  async function use() {
    setBusy(true);
    setProblem("");
    try {
      if (!cvId || !mine) {
        router.push(`/cv/new?template=${t!.id}`);
        return;
      }
      // Only the design changes; the save names the revision it was made on, so nothing newer is overwritten.
      const { cv } = await api<{ cv: CvDoc }>(`/api/cv/versions/${cvId}`);
      await api(`/api/cv/versions/${cvId}`, { method: "PATCH", json: { rev: cv.rev, saveId: `tpl${Date.now().toString(36)}`, design: { ...cv.design, template: t!.id } } });
      router.push(`/cv/v/${cvId}/edit/finish`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      setProblem(`We couldn’t apply this design. Your content is unchanged. ${messageOf(err)}`);
      setBusy(false);
    }
  }

  return (
    <CvScreen>
      <Bar
        crumbs={[
          { label: "CVs and letters", href: "/cv" },
          cvId && mine ? { label: mine.name, href: `/cv/v/${cvId}/edit/finish` } : { label: "Examples and templates", href: `/cv/examples?show=templates&region=${region}` },
          { label: templateLabel(t) },
        ]}
      />
      <div className="cv-area">
        <Toolbar title={templateLabel(t)} subtitle={mine ? "Preview with your current content. Choose a design without changing your words." : "Preview with example content. Choose a design without changing your words."}>
          <Btn kind="primary" busy={busy} onClick={() => void use()}>
            {busy ? "Applying design…" : "Use this design"}
          </Btn>
        </Toolbar>
        {loadProblem && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 14 }}>
            <strong>We couldn’t load your {word}</strong>
            <span>{loadProblem} Showing an example instead.</span>
          </div>
        )}
        {problem && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 14 }}>
            <strong>That didn’t work</strong>
            <span>{problem}</span>
          </div>
        )}
        <div className="cv-detail">
          <div className="cv-surround min-w-0">
            <PaperView paper={paper} state={state} retry={retry} cv={shown} focus={null} word={word} />
          </div>
          <div className="cv-stack">
            <Panel title="About this design">
              <div className="cv-pad cv-stack">
                <p style={{ margin: 0 }}>
                  {FAMILY_NAMES[t.family]}. Good for {t.suits.charAt(0).toLowerCase() + t.suits.slice(1)}.
                </p>
                <p className="cv-muted" style={{ margin: 0 }}>
                  Change fonts, spacing, colour and every section in the editor.
                </p>
                {t.grid && (
                  <p className="cv-small" style={{ margin: 0 }} data-testid="columns-note">
                    {COLUMNS_NOTE}
                  </p>
                )}
              </div>
            </Panel>
            <Panel title="Choose a different template">
              <div className="cv-pad">
                <ul className="cv-design-choices">
                  {others.map((o) => (
                    <li key={o.id}>
                      <Link className="cv-design-choice" href={`/cv/templates/${templateSlug(o)}${keep}`}>
                        <span className="cv-thumb">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={templatePreview(o, "small")} alt="" width={550} height={777} loading="lazy" />
                        </span>
                        <small>{templateLabel(o)}</small>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link className="cv-link" href={`/cv/examples?show=templates&region=${region}`} style={{ display: "inline-block", marginTop: 10 }}>
                  See all templates
                </Link>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </CvScreen>
  );
}
