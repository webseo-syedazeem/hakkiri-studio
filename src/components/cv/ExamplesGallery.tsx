"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type CvRegion, type Section, isEntrySection, isListSection } from "@/lib/cv/schema";
import { formatDates, sectionHeading } from "@/lib/cv/sections";
import { type ExampleTemplate, examplesFor } from "@/lib/cv/templates/examples";
import { api, messageOf } from "./client";
import { Dialog } from "./Dialog";
import { Bar, Btn, BtnLink, CvScreen, Panel, Toolbar } from "./ui";

/** One section of an example, as plain text: what it says, not how it is laid out. */
function SectionText({ s, region }: { s: Section; region: CvRegion }) {
  return (
    <section>
      <h4 className="cv-label" style={{ margin: "0 0 6px" }}>
        {sectionHeading(s, region)}
      </h4>
      {s.kind === "summary" && <p style={{ margin: 0 }}>{s.text}</p>}
      {s.kind === "skills" && <p style={{ margin: 0 }}>{s.groups.flatMap((g) => g.skills.map((k) => k.name)).join(", ")}</p>}
      {isListSection(s) && <p style={{ margin: 0 }}>{s.items.map((i) => (i.level ? `${i.name} (${i.level})` : i.name)).join(", ")}</p>}
      {isEntrySection(s) &&
        s.entries.map((e) => (
          <div key={e.id} style={{ marginBottom: 10 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{[e.title, e.subject && e.subject !== e.title ? e.subject : "", e.org].filter(Boolean).join(" · ")}</p>
            <p className="cv-small" style={{ margin: "0 0 4px" }}>
              {[formatDates(e), e.location, e.grade].filter(Boolean).join(" · ")}
            </p>
            {e.bullets.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {e.bullets.map((b) => (
                  <li key={b.id}>{b.text}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
    </section>
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
  useEffect(() => {
    if (/^en-US$/i.test(navigator.language)) setRegion("us");
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
          {view === "cv" || !reading.letter ? (
            reading.getSections().map((s) => <SectionText key={s.id} s={s} region={region} />)
          ) : (
            <div data-testid="example-letter" style={{ display: "flex", flexDirection: "column", gap: 14, lineHeight: 1.55 }}>
              <p className="cv-small" style={{ margin: 0 }}>
                For the role of {reading.letter.job} at {reading.letter.employer}, a made-up employer. Every sentence about the person is on their {word}.
              </p>
              <p style={{ margin: 0 }}>{reading.letter.greeting}</p>
              {reading.letter.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} style={{ margin: 0 }}>
                  {p}
                </p>
              ))}
              <p style={{ margin: 0 }}>
                {reading.letter.signoff}
                <br />
                {reading.letter.name}
              </p>
            </div>
          )}
        </Dialog>
      )}
    </CvScreen>
  );
}
