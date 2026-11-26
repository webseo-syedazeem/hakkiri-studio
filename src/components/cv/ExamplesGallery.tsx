"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { exampleCv } from "@/lib/cv/examples/build";
import { exampleById } from "@/lib/cv/examples/index";
import { isoDate } from "@/lib/cv/letter/flow";
import type { CvRegion } from "@/lib/cv/schema";
import { type ExampleTemplate, examplesFor } from "@/lib/cv/templates/examples";
import { api, messageOf } from "./client";
import { Dialog } from "./Dialog";
import { PaperView } from "./Paper";
import { useLetterPaper, usePaper } from "./usePaper";
import { Bar, Btn, BtnLink, CvScreen, Panel, Toolbar } from "./ui";

/**
 * The example drawn as it prints: a white page in its own template, by the
 * same renderer as the editor and the downloads. The CV, or its cover letter.
 */
function ExamplePaper({ id, region, view, word }: { id: string; region: CvRegion; view: "cv" | "letter"; word: string }) {
  const cv = useMemo(() => {
    const spec = exampleById(id);
    return spec ? exampleCv(spec, region, "example", undefined, new Date(), { letter: true }) : null;
  }, [id, region]);
  const today = useMemo(() => isoDate(new Date()), []);
  const cvPaper = usePaper(view === "cv" ? cv : null);
  const letterPaper = useLetterPaper(view === "letter" ? cv : null, today);
  const shown = view === "cv" ? cvPaper : letterPaper;
  if (!cv) return null;
  return (
    <div data-testid={view === "letter" ? "example-letter" : "example-cv"}>
      <PaperView paper={shown.paper} state={shown.state} retry={shown.retry} cv={cv} focus={null} word={view === "letter" ? "letter" : word} />
    </div>
  );
}

/**
 * Example CVs and their cover letters, by industry, each written for the UK
 * (a CV, A4) and the US (a resume, US Letter). Each one clears the app's own
 * checks: spelling for its region, both files read back word for word, and
 * every sentence of its letter traced to the CV or the advert. They can be
 * read here, or copied to start a CV of one's own.
 */
export function ExamplesGallery() {
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState<ExampleTemplate | null>(null);
  const [view, setView] = useState<"cv" | "letter">("cv");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [region, setRegion] = useState<CvRegion>("uk");
  // Starts on the visitor's likely region, once the page is in the browser (the server can't know it).
  // A link from a public example page (?example=chef&region=us) opens that example.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const r = q.get("region");
    const start: CvRegion = r === "us" || r === "uk" ? r : /^en-US$/i.test(navigator.language) ? "us" : "uk";
    setRegion(start);
    const asked = examplesFor(start).find((t) => t.id === q.get("example"));
    if (asked) setOpen(asked);
  }, []);
  const all = useMemo(() => examplesFor(region), [region]);
  const categories = ["All", ...[...new Set(all.map((t) => t.category))].sort()];
  const shown = category === "All" || !categories.includes(category) ? all : all.filter((t) => t.category === category);
  const word = region === "us" ? "resume" : "CV";
  // The open example in the chosen region's wording.
  const reading = open ? all.find((t) => t.id === open.id) ?? open : null;

  async function use(t: ExampleTemplate, letter = false) {
    setBusy(`${t.id}${letter ? ":letter" : ""}`);
    setError("");
    try {
      const res = await api<{ id: string }>("/api/cv/templates", { method: "POST", json: { templateId: t.id, name: `${t.title} (example)`, region, letter } });
      router.push(letter ? `/cv/v/${res.id}/letter` : `/cv/v/${res.id}/edit/contact`);
    } catch (err) {
      setError(messageOf(err));
      setBusy("");
    }
  }

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Examples" }]}>
        <BtnLink kind="primary" href="/cv/new">
          New CV
        </BtnLink>
      </Bar>

      <div className="cv-area">
        <Toolbar
          title={`Example ${word}s and cover letters`}
          subtitle={`Read a strong ${word} and letter for your kind of job, or start from one and make it yours. The people and employers are made up.`}
        />

        {error && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>That didn’t work</strong>
            <span>{error}</span>
          </div>
        )}

        <div className="cv-row" style={{ flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
          <div className="cv-seg" role="group" aria-label="Country">
            <button type="button" aria-pressed={region === "uk"} onClick={() => setRegion("uk")}>
              UK CV
            </button>
            <button type="button" aria-pressed={region === "us"} onClick={() => setRegion("us")}>
              US resume
            </button>
          </div>
        </div>

        <div role="group" aria-label="Industry" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {categories.map((c) => (
            <button key={c} type="button" className="cv-chip cv-filter" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        <ul className="cv-examples" aria-label={`Example ${word}s`}>
          {shown.map((t) => (
            <li key={t.id}>
              <Panel className="cv-example">
                <div className="cv-pad cv-stack">
                  <div>
                    <p className="cv-small" style={{ margin: 0 }}>
                      {t.category} · {t.badge}
                    </p>
                    <h3 style={{ margin: "4px 0 0" }}>{t.title}</h3>
                  </div>
                  <p style={{ margin: 0 }}>{t.description}</p>
                  <p className="cv-small" style={{ margin: 0 }}>
                    {t.stats.experienceYears === "Student" ? "Student" : `${t.stats.experienceYears} of work`} · {t.stats.rolesCount} {t.stats.rolesCount === 1 ? "role" : "roles"} · {t.stats.skillsCount} skills{t.letter ? " · with a cover letter" : ""}
                  </p>
                  <div className="cv-row" style={{ gap: 8, marginTop: "auto" }}>
                    <Btn
                      onClick={() => {
                        setView("cv");
                        setOpen(t);
                      }}
                      aria-label={`Read the ${t.title} example`}
                    >
                      Read it
                    </Btn>
                    <Btn kind="primary" busy={busy === t.id} onClick={() => void use(t)} aria-label={`Start from the ${t.title} example`}>
                      {busy === t.id ? "Copying…" : "Start from this"}
                    </Btn>
                  </div>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      </div>

      {reading && (
        <Dialog
          title={`${reading.title}: example ${view === "cv" ? word : "cover letter"}`}
          onClose={() => setOpen(null)}
          wide
          actions={
            <>
              <Btn onClick={() => setOpen(null)}>Close</Btn>
              {reading.letter && (
                <Btn busy={busy === `${reading.id}:letter`} onClick={() => void use(reading, true)}>
                  Start from this, with the letter
                </Btn>
              )}
              <Btn kind="primary" busy={busy === reading.id} onClick={() => void use(reading)}>
                Start from this
              </Btn>
            </>
          }
        >
          <div className="cv-row" style={{ flexWrap: "wrap", gap: 10 }}>
            {reading.letter && (
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
                UK
              </button>
              <button type="button" aria-pressed={region === "us"} onClick={() => setRegion("us")}>
                US
              </button>
            </div>
          </div>
          {view === "letter" && reading.letter && (
            <p className="cv-small" style={{ margin: 0 }}>
              For the role of {reading.letter.job} at {reading.letter.employer}, a made-up employer. Every sentence about the person is on their {word}.
            </p>
          )}
          <ExamplePaper id={reading.id} region={region} view={view === "letter" && reading.letter ? "letter" : "cv"} word={word} />
        </Dialog>
      )}
    </CvScreen>
  );
}
