"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { exampleCv, pick } from "@/lib/cv/examples/build";
import { exampleById } from "@/lib/cv/examples/index";
import { findTemplates } from "@/lib/cv/examples/search";
import { isoDate } from "@/lib/cv/letter/flow";
import { TEMPLATES, templateLabel } from "@/lib/cv/render/templates";
import type { CvDoc, CvRegion, TemplateId } from "@/lib/cv/schema";
import { api, messageOf } from "./client";
import { PaperPage, PaperView } from "./Paper";
import { useLetterPaper, usePaper } from "./usePaper";
import { Bar, Btn, CvScreen, Panel, Toolbar } from "./ui";

/** The example as it prints: a white page in the chosen design, by the same renderer as the editor and the downloads. */
function ExamplePaper({ cv, view, word }: { cv: CvDoc; view: "cv" | "letter"; word: string }) {
  const today = useMemo(() => isoDate(new Date()), []);
  const cvPaper = usePaper(view === "cv" ? cv : null);
  const letterPaper = useLetterPaper(view === "letter" ? cv : null, today);
  const shown = view === "cv" ? cvPaper : letterPaper;
  return (
    <div data-testid={view === "letter" ? "example-letter" : "example-cv"}>
      <PaperView paper={shown.paper} state={shown.state} retry={shown.retry} cv={cv} focus={null} word={view === "letter" ? "letter" : word} />
    </div>
  );
}

/** The same example in another design, drawn small: one choice in "Try a different design". */
function DesignChoice({ cv, template, chosen, onChoose }: { cv: CvDoc; template: TemplateId; chosen: boolean; onChoose: () => void }) {
  const dressed = useMemo(() => ({ ...cv, design: { ...cv.design, template } }), [cv, template]);
  const { paper } = usePaper(dressed);
  const label = templateLabel(TEMPLATES[template]);
  return (
    <button type="button" className="cv-design-choice" aria-pressed={chosen} onClick={onChoose} aria-label={`Show it in ${label}`}>
      {/* The button says what it shows; the small page inside is a picture of it. */}
      <span className="cv-thumb cv-thumb-live" aria-hidden="true">
        {paper ? <PaperPage paper={paper} cv={dressed} label={label} /> : <span className="cv-thumb-wait" />}
      </span>
      <small>{label}</small>
    </button>
  );
}

/**
 * One written example: its CV or cover letter as a real page, for the UK or
 * the US, in its own design or another, and the way to start from it. The
 * person, employers and numbers are made up; starting from it makes a copy
 * that is the person's own to change.
 */
export function ExampleDetail({ id }: { id: string }) {
  const router = useRouter();
  const spec = exampleById(id);
  const [region, setRegion] = useState<CvRegion>("uk");
  const [view, setView] = useState<"cv" | "letter">("cv");
  const [design, setDesign] = useState<TemplateId | null>(null);
  const [busy, setBusy] = useState("");
  const [problem, setProblem] = useState("");
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("region");
    setRegion(r === "us" || r === "uk" ? r : /^en-US$/i.test(navigator.language) ? "us" : "uk");
  }, []);
  const base = useMemo(() => (spec ? exampleCv(spec, region, "example", undefined, new Date(), { letter: true }) : null), [spec, region]);
  const own = spec?.template ?? "standard";
  const template = design ?? own;
  const cv = useMemo(() => (base ? { ...base, design: { ...base.design, template } } : null), [base, template]);
  // Three other designs that suit the job, besides its own.
  const others = useMemo(() => (spec ? findTemplates({ q: "", industry: spec.industry, level: spec.level }).map((t) => t.id).filter((t) => t !== own).slice(0, 3) : []), [spec, own]);

  if (!spec || !cv || !base) {
    return (
      <CvScreen>
        <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Examples and templates", href: "/cv/examples" }]} />
        <div className="cv-area">
          <Toolbar title="This example isn’t available" subtitle="It may have been renamed. Choose another from the list." />
          <Link className="cv-btn cv-btn-primary" href="/cv/examples">
            See all examples
          </Link>
        </div>
      </CvScreen>
    );
  }
  const role = pick(spec.role, region);
  const word = region === "us" ? "resume" : "CV";

  async function start(letter: boolean) {
    setBusy(letter ? "letter" : "cv");
    setProblem("");
    try {
      const res = await api<{ id: string }>("/api/cv/templates", { method: "POST", json: { templateId: spec!.id, name: `${role} (example)`, region, letter, ...(design ? { template: design } : {}) } });
      router.push(letter ? `/cv/v/${res.id}/letter` : `/cv/v/${res.id}/edit/contact`);
    } catch (err) {
      setProblem(`We couldn’t create your copy. ${messageOf(err)}`);
      setBusy("");
    }
  }

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Examples and templates", href: `/cv/examples?region=${region}` }, { label: role }]} />
      <div className="cv-area">
        <Toolbar title={`${role} example`} subtitle="Written example content, not your own experience. The person and employers are made up." />
        <div className="cv-detail">
          <div className="cv-stack min-w-0">
            <div className="cv-row" style={{ gap: 10 }}>
              {spec.letter && (
                <div className="cv-seg" role="group" aria-label="Show">
                  <button type="button" aria-pressed={view === "cv"} onClick={() => setView("cv")}>
                    {region === "us" ? "Resume" : "CV"}
                  </button>
                  <button type="button" aria-pressed={view === "letter"} onClick={() => setView("letter")}>
                    Cover letter
                  </button>
                </div>
              )}
              <div className="cv-seg" role="group" aria-label="Country">
                <button type="button" aria-pressed={region === "uk"} onClick={() => setRegion("uk")}>
                  UK · A4
                </button>
                <button type="button" aria-pressed={region === "us"} onClick={() => setRegion("us")}>
                  US · Letter
                </button>
              </div>
            </div>
            {view === "letter" && base.target && (
              <p className="cv-small" style={{ margin: 0 }}>
                For the role of {base.target.title} at {base.target.employer}, a made-up employer. Every sentence about the person is on their {word}.
              </p>
            )}
            <div className="cv-surround">
              <ExamplePaper cv={cv} view={view} word={word} />
            </div>
          </div>

          <div className="cv-stack">
            <Panel title="Make it your own">
              <div className="cv-pad cv-stack">
                <p style={{ margin: 0 }}>Every word and every part of the design can be changed.</p>
                {problem && (
                  <p className="cv-error-text" role="alert" style={{ margin: 0 }}>
                    {problem}
                  </p>
                )}
                <Btn kind="primary" busy={busy === "cv"} disabled={!!busy} onClick={() => void start(false)}>
                  {busy === "cv" ? "Creating your copy…" : "Start from this example"}
                </Btn>
                {spec.letter && (
                  <Btn busy={busy === "letter"} disabled={!!busy} onClick={() => void start(true)}>
                    {busy === "letter" ? "Creating your copy…" : "Start from this, with the letter"}
                  </Btn>
                )}
                <small className="cv-muted">Replace the sample achievements and details with your own before applying.</small>
              </div>
            </Panel>
            <Panel title="Try a different design">
              <div className="cv-pad cv-stack">
                <p className="cv-muted" style={{ margin: 0 }}>
                  Same content, different layout. Now showing {templateLabel(TEMPLATES[template])}.
                </p>
                <div className="cv-design-choices">
                  <DesignChoice cv={base} template={own} chosen={template === own} onChoose={() => setDesign(null)} />
                  {others.map((t) => (
                    <DesignChoice key={t} cv={base} template={t} chosen={template === t} onChoose={() => setDesign(t)} />
                  ))}
                </div>
                <Link className="cv-link" href={`/cv/examples?show=templates&region=${region}`}>
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
