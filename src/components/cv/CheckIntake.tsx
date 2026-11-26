"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ApiError, messageOf } from "./client";
import { ACCEPT, sendUpload } from "./upload";
import { Bar, Btn, CvScreen, Field, Panel, Toolbar } from "./ui";

type DocType = "cv" | "cover" | "both";
type Method = "paste" | "upload";
type Region = "uk" | "us";

const MAX_BYTES = 5 * 1024 * 1024;
const MISSING_TEXT = "Add your document text before checking.";
const MISSING_JOB = "Add the job advert or turn off the job check.";
const WRONG_FILE = "Choose a PDF or Word file up to 5 MB.";

/** What the check looks at, by what is being checked. */
function checksFor(docType: DocType, job: boolean): { heading?: string; items: string[] }[] {
  const cv = { heading: docType === "both" ? "CV" : undefined, items: ["Evidence and impact", "Clarity and writing", "Structure and sections", "PDF and Word read-back"] };
  const letter = { heading: docType === "both" ? "Cover letter" : undefined, items: ["Length and one-page layout", "Greeting and sign-off", "Claims and evidence", "Copied or AI-sounding phrases"] };
  const groups = docType === "cv" ? [cv] : docType === "cover" ? [letter] : [cv, letter];
  if (job) groups.push({ heading: docType === "cv" ? undefined : "Job", items: ["Job requirements and missing evidence"] });
  return groups;
}

function FilePick({ label, file, onFile, error, testId }: { label: string; file: File | null; onFile: (f: File | null, problem?: string) => void; error?: string; testId: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="cv-checkfile" data-testid={testId}>
      <label className="cv-label" htmlFor={`${testId}-input`}>
        {label}
      </label>
      <div className="cv-dropzone">
        <input
          ref={ref}
          id={`${testId}-input`}
          type="file"
          accept={ACCEPT}
          aria-describedby={`${testId}-help${error ? ` ${testId}-error` : ""}`}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            if (f && (f.size === 0 || f.size > MAX_BYTES || !/\.(pdf|docx)$/i.test(f.name))) {
              e.target.value = "";
              return onFile(null, f.size === 0 ? `“${f.name}” is empty. Choose another file or paste the text.` : WRONG_FILE);
            }
            onFile(f);
          }}
        />
        <span className="cv-small" id={`${testId}-help`}>
          PDF, DOCX · Up to 5 MB
        </span>
        {file && (
          <span className="cv-row" style={{ gap: 8 }}>
            <span className="cv-chip">
              {file.name} · {Math.max(1, Math.round(file.size / 1024))} KB
            </span>
            <Btn
              kind="quiet"
              onClick={() => {
                if (ref.current) ref.current.value = "";
                onFile(null);
              }}
            >
              Remove
            </Btn>
          </span>
        )}
      </div>
      {error && (
        <p className="cv-error-text" id={`${testId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * "Check my CV or cover letter": what is being checked, the document itself
 * (pasted or uploaded), where the person is applying, and an optional job
 * advert. Nothing is sent until "Check document" is pressed, and no AI is
 * called: the checks are the builder's own.
 */
export function CheckIntake({ start }: { start: { job: boolean; docType: DocType; method: Method } }) {
  const router = useRouter();
  const [docType, setDocType] = useState<DocType>(start.docType);
  const [method, setMethod] = useState<Method>(start.method);
  const [cvText, setCvText] = useState("");
  const [letterText, setLetterText] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [letterFile, setLetterFile] = useState<File | null>(null);
  const [region, setRegion] = useState<Region>("uk");
  const [jobOn, setJobOn] = useState(start.job);
  const [jobText, setJobText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [problem, setProblem] = useState("");
  const wantsCv = docType !== "cover";
  const wantsLetter = docType !== "cv";

  async function submit() {
    const e: Record<string, string> = {};
    if (wantsCv && (method === "upload" ? !cvFile : cvText.trim().length < 50)) e.cv = method === "upload" ? WRONG_FILE : MISSING_TEXT;
    if (wantsLetter && (method === "upload" ? !letterFile : letterText.trim().length < 50)) e.letter = method === "upload" ? WRONG_FILE : MISSING_TEXT;
    if (jobOn && jobText.trim().length < 40) e.job = MISSING_JOB;
    setErrors(e);
    setProblem("");
    if (Object.keys(e).length) {
      const first = document.querySelector<HTMLElement>(`[data-field="${Object.keys(e)[0]}"] textarea, [data-field="${Object.keys(e)[0]}"] input`);
      first?.focus();
      return;
    }
    const form = new FormData();
    form.set("docType", docType);
    form.set("region", region);
    if (wantsCv) method === "upload" && cvFile ? form.set("cvFile", cvFile) : form.set("cvText", cvText);
    if (wantsLetter) method === "upload" && letterFile ? form.set("letterFile", letterFile) : form.set("letterText", letterText);
    if (jobOn) {
      form.set("jobOn", "1");
      form.set("jobText", jobText);
    }
    setBusy(true);
    setStage(method === "upload" ? "Reading your file" : jobOn ? "Matching the job requirements" : "Checking your document");
    try {
      const made = await sendUpload<{ id: string }>("/api/cv/check", form, (s) => setStage(s === "uploading" ? (method === "upload" ? "Reading your file" : "Checking your document") : jobOn ? "Matching the job requirements" : "Checking your document"));
      router.push(`/cv/check/${made.id}`);
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError && Object.keys(err.fields).length) {
        setErrors(err.fields);
        setProblem(err.message);
      } else setProblem(err instanceof ApiError && err.status >= 500 ? "We couldn’t complete the check. Your text is still here." : messageOf(err));
    }
  }

  const label = docType === "cover" ? "cover letter" : docType === "both" ? "documents" : "CV";
  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Check your document" }]} />
      <div className="cv-area">
        <Toolbar title="Check your document" subtitle="See what is working and what to fix first." />
        <div className="cv-checkgrid">
          <Panel>
            <div className="cv-pad cv-checkform">
              <fieldset className="cv-checkstep">
                <legend>1. What are you checking?</legend>
                <span className="cv-seg" role="group" aria-label="What are you checking?">
                  {(
                    [
                      ["cv", "CV"],
                      ["cover", "Cover letter"],
                      ["both", "Both"],
                    ] as const
                  ).map(([id, name]) => (
                    <button key={id} type="button" aria-pressed={docType === id} onClick={() => setDocType(id)} disabled={busy}>
                      {name}
                    </button>
                  ))}
                </span>
              </fieldset>

              <fieldset className="cv-checkstep">
                <legend>2. Add your document</legend>
                <span className="cv-seg" role="group" aria-label="How to add it">
                  <button type="button" aria-pressed={method === "paste"} onClick={() => setMethod("paste")} disabled={busy}>
                    Paste text
                  </button>
                  <button type="button" aria-pressed={method === "upload"} onClick={() => setMethod("upload")} disabled={busy}>
                    Upload a file
                  </button>
                </span>
                {wantsCv && (
                  <div data-field="cv">
                    {method === "paste" ? (
                      <Field label="CV text" multiline rows={8} value={cvText} onChange={setCvText} placeholder="Paste your CV here" error={errors.cv} maxLength={25000} disabled={busy} />
                    ) : (
                      <FilePick
                        label={docType === "both" ? "Your CV: choose a PDF or Word file" : "Choose a PDF or Word file"}
                        file={cvFile}
                        testId="cv-file"
                        error={errors.cv}
                        onFile={(f, p) => {
                          setCvFile(f);
                          setErrors((x) => ({ ...x, cv: p ?? "" }));
                        }}
                      />
                    )}
                  </div>
                )}
                {wantsLetter && (
                  <div data-field="letter">
                    {method === "paste" ? (
                      <Field label="Cover letter text" multiline rows={8} value={letterText} onChange={setLetterText} placeholder="Paste your cover letter here" error={errors.letter} maxLength={12000} disabled={busy} />
                    ) : (
                      <FilePick
                        label={docType === "both" ? "Your cover letter: choose a PDF or Word file" : "Choose a PDF or Word file"}
                        file={letterFile}
                        testId="letter-file"
                        error={errors.letter}
                        onFile={(f, p) => {
                          setLetterFile(f);
                          setErrors((x) => ({ ...x, letter: p ?? "" }));
                        }}
                      />
                    )}
                  </div>
                )}
              </fieldset>

              <fieldset className="cv-checkstep">
                <legend>3. Where are you applying?</legend>
                <span className="cv-seg" role="group" aria-label="Where are you applying?">
                  <button type="button" aria-pressed={region === "uk"} onClick={() => setRegion("uk")} disabled={busy}>
                    UK · A4
                  </button>
                  <button type="button" aria-pressed={region === "us"} onClick={() => setRegion("us")} disabled={busy}>
                    US · Letter
                  </button>
                </span>
              </fieldset>

              <fieldset className="cv-checkstep">
                <legend>4. Check against a job (optional)</legend>
                <label className="cv-row" style={{ gap: 8 }}>
                  <input type="checkbox" checked={jobOn} onChange={(e) => setJobOn(e.target.checked)} disabled={busy} />
                  <span>Add job advert</span>
                </label>
                {jobOn && (
                  <div data-field="job">
                    <Field label="Job advert" multiline rows={7} value={jobText} onChange={setJobText} placeholder="Paste the job advert and requirements" error={errors.job} maxLength={20000} disabled={busy} />
                  </div>
                )}
              </fieldset>

              {problem && (
                <div className="cv-error-text" role="alert">
                  <p style={{ margin: 0 }}>{problem}</p>
                </div>
              )}
              <div className="cv-row">
                <Btn kind="primary" onClick={submit} busy={busy} disabled={busy} data-testid="check-submit">
                  {busy ? stage : jobOn ? "Check against this job" : "Check document"}
                </Btn>
                {problem && !busy && <Btn onClick={submit}>Try again</Btn>}
              </div>
              <p className="cv-small" style={{ margin: 0 }}>
                Your {label} is checked by the same rules as the builder. No AI reads it, and the file itself is not kept: the text is kept with your account for 30 days so you can open the report again.
              </p>
            </div>
          </Panel>
          <Panel title="What will be checked" className="cv-checkaside">
            <div className="cv-pad cv-stack">
              {checksFor(docType, jobOn).map((g, i) => (
                <div key={i}>
                  {g.heading && <h3 className="cv-small" style={{ margin: "0 0 6px", fontWeight: 600 }}>{g.heading}</h3>}
                  <ul className="cv-ticklist">
                    {g.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {docType === "both" && (
                <p className="cv-small" style={{ margin: 0 }}>
                  The cover letter is checked separately against letter-specific criteria.
                </p>
              )}
            </div>
          </Panel>
        </div>
        <div aria-live="polite" className="sr-only">
          {busy ? stage : ""}
        </div>
      </div>
    </CvScreen>
  );
}
