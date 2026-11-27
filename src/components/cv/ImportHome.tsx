"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IMPORT_ERRORS, type ImportErrorCode } from "@/lib/cv/import/errors";
import { type CvImport, openFlags, reviewSteps } from "@/lib/cv/import/record";
import type { CvDoc } from "@/lib/cv/schema";
import { SECTION_DEFS, sectionHeading } from "@/lib/cv/sections";
import { api, messageOf } from "./client";
import { afterImport } from "./upload";
import { Dialog, usePanel } from "./Dialog";
import { ReplaceFileDialog } from "./ReplaceFile";
import { Bar, Btn, BtnLink, CvScreen, Panel, Skeleton, Toolbar } from "./ui";
import { useImport } from "./useImport";

/** The name of a step of the check, as shown to the person. */
export function stepName(imp: CvImport, cv: CvDoc, key: string): string {
  if (key === "contact") return "Contact";
  if (key === "unassigned") return "Unassigned text";
  const s = imp.draft.sections.find((x) => x.id === key || x.kind === key);
  return s ? sectionHeading(s, cv.region) : key;
}

const SOURCE_WORDS = { pdf: "PDF", docx: "Word file", "linkedin-pdf": "LinkedIn PDF", text: "Pasted text" } as const;

/**
 * An upload: where it stands and how to carry on. A file that could not be
 * read shows why, with the way forward for that reason. A file that was read
 * lists its sections to check, so the check can be left and picked up later.
 */
export function ImportHome({ importId }: { importId: string }) {
  const router = useRouter();
  const { imp, cv, load, reload } = useImport(importId);
  const { panel, item, open, close } = usePanel();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  if (load === "loading")
    return (
      <CvScreen>
        <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Upload" }]} />
        <div className="cv-area cv-stack" aria-busy="true" aria-label="Loading your upload">
          <Skeleton height={36} width="40%" />
          <Skeleton height={160} />
        </div>
      </CvScreen>
    );
  if (load !== "ready" || !imp || !cv)
    return (
      <CvScreen>
        <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Upload" }]} />
        <div className="cv-area">
          <Toolbar title={load === "missing" ? "Upload not found" : "This upload couldn’t be loaded"} subtitle={load === "missing" ? "It may have been discarded, or it belongs to another account." : "Check you’re online, then try again."}>
            {load === "error" && <Btn onClick={() => void reload()}>Retry</Btn>}
            <BtnLink href="/cv">Back to your CVs</BtnLink>
          </Toolbar>
        </div>
      </CvScreen>
    );

  const steps = reviewSteps(imp);
  const next = steps.find((s) => !imp.reviewed.includes(s.key)) ?? steps[steps.length - 1];
  const toCheck = steps.reduce((n, s) => n + openFlags(imp, s), 0);
  const failed = imp.status === "failed";
  const offer = failed ? (IMPORT_ERRORS[imp.error?.code as ImportErrorCode]?.offer ?? ["replace", "paste"]) : [];

  async function discard() {
    setBusy(true);
    setProblem("");
    try {
      await api(`/api/cv/imports/${importId}`, { method: "DELETE" });
      router.replace(`/cv/v/${cv!.id}/edit/contact`);
    } catch (err) {
      setBusy(false);
      setProblem(messageOf(err));
    }
  }

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: cv.name }, { label: "Upload" }]} />
      <div className="cv-area">
        {failed ? (
          <>
            <Toolbar eyebrow={cv.name} title="We couldn’t read that file" subtitle={imp.fileName ? `File: ${imp.fileName}` : undefined} />
            <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
              <strong>Not read</strong>
              <span style={{ maxWidth: "70ch" }}>{imp.error?.message}</span>
            </div>
            <Panel title="What you can do">
              <div className="cv-pad cv-stack">
                <p className="cv-muted">Your set-up answers are saved. Nothing has been added to your CV.</p>
                <div className="cv-row">
                  {offer.map((o, i) =>
                    o === "paste" ? (
                      <Btn key={o} kind={i === 0 ? "primary" : "default"} onClick={() => open("replace-file", { item: "paste" })}>
                        Paste the text
                      </Btn>
                    ) : (
                      <Btn key={o} kind={i === 0 ? "primary" : "default"} onClick={() => open("replace-file", { item: "file" })}>
                        Choose another file
                      </Btn>
                    ),
                  )}
                  <Btn kind="quiet" busy={busy} onClick={() => void discard()}>
                    Start empty instead
                  </Btn>
                </div>
                {problem && (
                  <p className="cv-error-text" role="alert">
                    {problem}
                  </p>
                )}
              </div>
            </Panel>
          </>
        ) : imp.status === "confirmed" ? (
          <>
            <Toolbar eyebrow={cv.name} title="This upload is in your CV" subtitle="You checked it and opened it in the builder.">
              <BtnLink kind="primary" href={`/cv/v/${cv.id}/edit/contact`}>
                Open in builder
              </BtnLink>
            </Toolbar>
          </>
        ) : (
          <>
            <Toolbar eyebrow={cv.name} title="Check what we read" subtitle={`${imp.fileName || "Your file"} · ${SOURCE_WORDS[imp.source ?? "pdf"]}${imp.pages ? ` · ${imp.pages} page${imp.pages === 1 ? "" : "s"}` : ""}`}>
              {toCheck === 0 ? (
                <>
                  <Btn
                    kind="primary"
                    busy={busy}
                    onClick={async () => {
                      setBusy(true);
                      setProblem("");
                      try {
                        const { versionId, next } = await api<{ versionId: string; next?: string }>(`/api/cv/imports/${importId}/confirm`, { method: "POST" });
                        router.push(afterImport(versionId, next));
                      } catch (err) {
                        setBusy(false);
                        setProblem(messageOf(err));
                      }
                    }}
                  >
                    Open in builder
                  </Btn>
                  <BtnLink kind="quiet" href={`/cv/import/${importId}/review/${steps[0].key}`}>
                    Review section by section
                  </BtnLink>
                </>
              ) : (
                <>
                  {/* Stopped part-way and come back: carry on where they left off. */}
                  {imp.reviewed.length > 0 && (
                    <BtnLink kind="primary" href={`/cv/import/${importId}/review/${next.key}`}>
                      Carry on checking
                    </BtnLink>
                  )}
                  <BtnLink kind={imp.reviewed.length > 0 ? "default" : "primary"} href={`/cv/import/${importId}/review/${(steps.find((s) => openFlags(imp, s) > 0) ?? next).key}?flagged=true`}>
                    {`Review flagged sections (${toCheck} to check)`}
                  </BtnLink>
                  <BtnLink kind="quiet" href={`/cv/import/${importId}/review/${steps[0].key}`}>
                    Review all sections
                  </BtnLink>
                </>
              )}
            </Toolbar>
            <div className="cv-layout" style={{ gridTemplateColumns: "minmax(0, 720fr) minmax(0, 448fr)" }}>
              <Panel title="Sections to confirm" aside={<small>{toCheck === 0 ? "Nothing flagged" : `${toCheck} thing${toCheck === 1 ? "" : "s"} to check`}</small>}>
                <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {steps.map((s, i) => {
                    const n = openFlags(imp, s);
                    const done = imp.reviewed.includes(s.key);
                    const kind = imp.draft.sections.find((x) => x.id === s.sectionId)?.kind;
                    return (
                      <li key={s.key} className="cv-pick">
                        <span className="cv-step-badge" aria-hidden="true">
                          {i + 1}
                        </span>
                        <div className="min-w-0 grow">
                          <Link href={`/cv/import/${importId}/review/${s.key}`} className="font-semibold hover:underline">
                            <span className="sr-only">{i + 1}. </span>
                            {stepName(imp, cv, s.key)}
                          </Link>
                          <small style={{ display: "block", marginTop: 3 }}>{s.key === "unassigned" ? "Text from your file that we couldn’t place" : s.key === "contact" ? "Name, email, phone, town and links" : kind ? SECTION_DEFS[kind].rule[cv.region] : ""}</small>
                        </div>
                        {n > 0 ? <span className="cv-chip cv-link" style={{ textDecoration: "none" }}>{n} to check</span> : done ? <span className="cv-chip cv-good">✓ Confirmed</span> : <span className="cv-chip">Not checked yet</span>}
                      </li>
                    );
                  })}
                </ol>
              </Panel>
              <Panel title="This upload">
                <div className="cv-pad cv-stack">
                  <p className="cv-muted">Nothing is added to your CV until you open it in the builder. You can stop and come back: your corrections are saved as you go.</p>
                  <div className="cv-row">
                    <Btn onClick={() => open("replace-file", { item: "file" })}>Replace file</Btn>
                    <Btn onClick={() => open("replace-file", { item: "paste" })}>Paste text instead</Btn>
                  </div>
                  <Btn kind="danger" style={{ width: "100%" }} onClick={() => open("discard-import")}>
                    Discard upload
                  </Btn>
                </div>
              </Panel>
            </div>
          </>
        )}
      </div>

      {panel === "replace-file" && (
        <ReplaceFileDialog
          importId={importId}
          start={item === "paste" ? "paste" : "file"}
          onClose={close}
          onDone={() => {
            close();
            void reload();
          }}
        />
      )}
      {panel === "discard-import" && (
        <Dialog
          title="Discard this upload?"
          onClose={close}
          actions={
            <>
              <Btn onClick={close}>Keep it</Btn>
              <Btn kind="danger" busy={busy} onClick={() => void discard()}>
                Discard upload
              </Btn>
            </>
          }
        >
          <p>What we read from “{imp.fileName || "your file"}” and your corrections will be deleted. Your CV “{cv.name}” stays, empty, and you can fill it in yourself.</p>
          {problem && (
            <p className="cv-error-text" role="alert">
              {problem}
            </p>
          )}
        </Dialog>
      )}
    </CvScreen>
  );
}
