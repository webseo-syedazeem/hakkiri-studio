"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { type CvSummary, type Section, type SectionKind, cvIsEmpty, emptySection } from "@/lib/cv/schema";
import { OPTIONAL_KINDS, SECTION_DEFS, docWord, sectionHeading } from "@/lib/cv/sections";
import { api, messageOf } from "./client";
import { ContactForm, SectionForm } from "./SectionForms";
import { ACCEPT, STAGE_WORDS, type UploadStage, sendUpload } from "./upload";
import { Announce, Bar, Btn, BtnLink, CvScreen, Panel, Skeleton, Toolbar } from "./ui";
import { SAVE_WORDS, useCv } from "./useCv";

/** The form's own order: contact, the work, then the profile, which is written last. */
const FORM_ORDER: SectionKind[] = ["experience", "education", "skills"];

interface Tab {
  key: string;
  label: string;
  section?: Section;
}

/**
 * The builder: one section of the CV at a time, saved as you type. A new CV is
 * empty and says so; nothing is written into it for the person.
 */
export function Editor({ versionId, sectionKey }: { versionId: string; sectionKey: string }) {
  const router = useRouter();
  const { cv, load, save, update, flush, retry } = useCv(versionId);
  const [pending, setPending] = useState("");
  const [adding, setAdding] = useState(false);
  const [stage, setStage] = useState<UploadStage | "">("");
  const [problem, setProblem] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // An upload for this CV that hasn't been checked yet.
  useEffect(() => {
    api<{ cvs: CvSummary[] }>("/api/cv/versions")
      .then((r) => setPending(r.cvs.find((c) => c.id === versionId)?.pendingImportId ?? ""))
      .catch(() => {});
  }, [versionId]);

  const crumbs = [{ label: "CVs and letters", href: "/cv" }, { label: cv?.name ?? "CV" }];
  if (load === "loading")
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area cv-stack" aria-busy="true" aria-label="Loading your CV">
          <Skeleton height={36} width="40%" />
          <Skeleton height={320} />
        </div>
      </CvScreen>
    );
  if (load !== "ready" || !cv)
    return (
      <CvScreen>
        <Bar crumbs={crumbs} />
        <div className="cv-area">
          <Toolbar title={load === "missing" ? "CV not found" : "This CV couldn’t be loaded"} subtitle={load === "missing" ? "It may have been deleted, or it belongs to another account." : "Check you’re online, then refresh the page."}>
            <BtnLink href="/cv">Back to your CVs</BtnLink>
          </Toolbar>
        </div>
      </CvScreen>
    );

  const region = cv.region;
  const find = (kind: SectionKind) => cv.sections.find((s) => s.kind === kind);
  const core = FORM_ORDER.map(find).filter((s): s is Section => !!s);
  const extra = cv.sections.filter((s) => s.kind !== "summary" && !FORM_ORDER.includes(s.kind));
  const summary = find("summary");
  const tabs: Tab[] = [
    { key: "contact", label: "Contact" },
    ...core.map((s) => ({ key: s.kind, label: sectionHeading(s, region), section: s })),
    ...extra.map((s) => ({ key: s.kind === "custom" ? s.id : s.kind, label: sectionHeading(s, region), section: s })),
    ...(summary ? [{ key: "profile", label: sectionHeading(summary, region), section: summary }] : []),
  ];
  const index = Math.max(0, tabs.findIndex((t) => t.key === sectionKey));
  const tab = tabs[index];
  const nextTab = tabs[index + 1];
  const empty = cvIsEmpty(cv);
  const missing = OPTIONAL_KINDS.filter((k) => k === "custom" || !cv.sections.some((s) => s.kind === k));
  const base = `/cv/v/${cv.id}/edit`;

  const go = (key: string) => void flush().then(() => router.push(`${base}/${key}`));
  const setSection = (next: Section) => update({ sections: cv.sections.map((s) => (s.id === next.id ? next : s)) });

  function addSection(kind: SectionKind) {
    const s = emptySection(kind);
    // Added sections sit before the profile, which stays last.
    const at = cv!.sections.findIndex((x) => x.kind === "summary");
    const sections = [...cv!.sections];
    sections.splice(at >= 0 ? at : sections.length, 0, s);
    update({ sections });
    setAdding(false);
    go(kind === "custom" ? s.id : kind);
  }

  async function upload(file: File) {
    setProblem("");
    try {
      const form = new FormData();
      form.set("versionId", cv!.id);
      form.set("file", file);
      const made = await sendUpload<{ importId: string }>("/api/cv/imports", form, setStage);
      router.push(`/cv/import/${made.importId}`);
    } catch (err) {
      setStage("");
      setProblem(messageOf(err));
    }
  }

  return (
    <CvScreen>
      <Bar crumbs={crumbs}>
        <small role="status">{SAVE_WORDS[save]}</small>
        {(save === "failed" || save === "device") && <Btn onClick={retry}>Retry</Btn>}
        {save === "conflict" && <Btn onClick={() => window.location.reload()}>Load the latest</Btn>}
      </Bar>
      <div className="cv-area" style={{ maxWidth: 840 }}>
        <Toolbar eyebrow={`${cv.name} · ${cv.kind === "base" ? `Base ${docWord(region)}` : "Tailored version"}`} title={`Edit ${docWord(region)}`}>
          {nextTab && (
            <Btn kind="primary" onClick={() => go(nextTab.key)}>
              Continue to {nextTab.label}
            </Btn>
          )}
        </Toolbar>

        {save === "conflict" && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>Changed in another tab</strong>
            <span>This CV was saved somewhere else after you opened it here. Nothing has been overwritten. Load the latest to carry on.</span>
          </div>
        )}
        {(save === "device" || save === "failed") && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>{SAVE_WORDS[save]}</strong>
            <span>{save === "device" ? "Your changes couldn’t reach us, so they are kept on this device. They will be saved when you’re back online." : "Your changes couldn’t be saved. Check you’re online and press Retry."}</span>
          </div>
        )}
        {pending && (
          <div className="cv-note" style={{ marginBottom: 18 }}>
            You uploaded a file for this CV and haven’t finished checking it. <Link className="cv-link" href={`/cv/import/${pending}`}>Carry on checking</Link>
          </div>
        )}

        {empty && !pending && (
          <Panel style={{ marginBottom: 18 }}>
            <div className="cv-pad cv-stack">
              <h2>Your {docWord(region)} is empty</h2>
              <p className="cv-muted">Start with your contact details. You can add work, education or projects in any order.</p>
              <input ref={fileRef} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-label="CV file" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
              <div className="cv-row">
                {tab.key !== "contact" && <Btn onClick={() => go("contact")}>Add contact details</Btn>}
                <Btn busy={!!stage} onClick={() => fileRef.current?.click()}>
                  {stage ? "Working…" : `Upload a ${docWord(region)}`}
                </Btn>
                {stage && <small>{STAGE_WORDS[stage]}</small>}
              </div>
              {problem && (
                <p className="cv-error-text" role="alert">
                  {problem}
                </p>
              )}
            </div>
          </Panel>
        )}

        <nav className="cv-tabs" aria-label="Sections">
          {tabs.map((t) => (
            <a
              key={t.key}
              href={`${base}/${t.key}`}
              aria-current={t.key === tab.key ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(t.key);
              }}
            >
              {t.label}
            </a>
          ))}
          <button className="cv-push" aria-expanded={adding} aria-controls="add-section" onClick={() => setAdding((v) => !v)}>
            + Add section
          </button>
        </nav>

        {adding && (
          <Panel id="add-section" title="Add a section" style={{ marginBottom: 18 }}>
            <div className="cv-pad cv-row">
              {missing.map((k) => (
                <Btn key={k} onClick={() => addSection(k)}>
                  {SECTION_DEFS[k].heading[region]}
                </Btn>
              ))}
            </div>
          </Panel>
        )}

        {tab.key === "contact" ? (
          <Panel title="Contact">
            <div className="cv-pad">
              <ContactForm value={cv.contact} onChange={(contact) => update({ contact })} />
            </div>
          </Panel>
        ) : tab.section ? (
          <Panel title={tab.label}>
            <SectionForm key={tab.section.id} section={tab.section} onChange={setSection} region={region} />
          </Panel>
        ) : null}

        {nextTab && (
          <div className="cv-row" style={{ marginTop: 18 }}>
            <Btn kind="primary" className="cv-push" onClick={() => go(nextTab.key)}>
              Continue to {nextTab.label}
            </Btn>
          </div>
        )}
        <Announce>{save === "failed" || save === "device" || save === "conflict" ? SAVE_WORDS[save] : ""}</Announce>
      </div>
    </CvScreen>
  );
}
