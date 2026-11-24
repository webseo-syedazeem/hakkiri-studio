"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { CV_LEVELS, type CvLevel, type CvRegion, LEVEL_LABELS } from "@/lib/cv/schema";
import { ApiError, api, messageOf } from "./client";
import { ACCEPT, STAGE_WORDS, UPLOAD_HELP, type UploadStage, sendUpload } from "./upload";
import { Announce, Bar, Btn, CvScreen, Field, Panel, Toolbar } from "./ui";

const LEVEL_HELP: Record<CvLevel, string> = {
  student: "Studying, or looking for a first professional role.",
  early: "Up to about three years of work.",
  experienced: "Several years in your field.",
  senior: "Leading a function, a department or an organisation.",
};

type Method = "empty" | "notes" | "upload" | "paste";

/**
 * Set-up: four questions before any CV exists. What it is called, the level,
 * UK or US, and (optionally) the job it is aimed at. Then how to start: empty,
 * or from a CV the person already has. Nothing is pre-filled.
 */
export function Setup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<CvLevel | "">("");
  const [region, setRegion] = useState<CvRegion | "">("");
  const [showTarget, setShowTarget] = useState(false);
  const [targetTitle, setTargetTitle] = useState("");
  const [targetEmployer, setTargetEmployer] = useState("");
  const [targetAdvert, setTargetAdvert] = useState("");
  const [method, setMethod] = useState<Method>("empty");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState("");
  const [stage, setStage] = useState<UploadStage | "creating" | "">("");
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function check(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Give your CV a name.";
    if (!level) e.level = "Choose the level that fits you best.";
    if (!region) e.region = "Choose UK or US.";
    if (method === "upload" && !file) e.file = "Choose the file to upload.";
    if (method === "paste" && text.trim().length < 40) e.text = "Paste the text of your CV.";
    return e;
  }

  /** Shows the problems and moves to the first field that has one. */
  function showErrors(e: Record<string, string>) {
    setErrors(e);
    const first = ["name", "level", "region", "file", "text"].find((k) => e[k]);
    if (first) requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"] input, [data-field="${first}"] textarea, [data-field="${first}"] button`)?.focus());
  }

  async function submit(ev?: FormEvent, chosen?: File) {
    ev?.preventDefault();
    if (stage) return;
    const useFile = chosen ?? file;
    const found = check();
    if (chosen) delete found.file;
    setProblem("");
    if (Object.keys(found).length) return showErrors(found);
    setErrors({});
    const setup = { name: name.trim(), level, region, targetTitle, targetEmployer, targetAdvert };
    try {
      if (method === "empty" || method === "notes") {
        setStage("creating");
        const { id } = await api<{ id: string }>("/api/cv/versions", { method: "POST", json: setup });
        // From notes: straight to the three questions about one role. The CV itself still starts empty.
        router.push(method === "notes" ? `/cv/v/${id}/capture/new` : `/cv/v/${id}/edit/contact`);
        return;
      }
      const form = new FormData();
      for (const [k, v] of Object.entries(setup)) form.set(k, v);
      if (method === "upload" && useFile) form.set("file", useFile);
      else form.set("text", text);
      const made = await sendUpload<{ importId: string }>("/api/cv/imports", form, setStage);
      router.push(`/cv/import/${made.importId}`);
    } catch (err) {
      setStage("");
      if (err instanceof ApiError && Object.keys(err.fields).length) showErrors(err.fields);
      else setProblem(messageOf(err));
    }
  }

  const busy = stage !== "";
  const action = method === "empty" ? "Create CV" : method === "notes" ? "Start with notes" : method === "paste" ? "Read this text" : file ? `Upload ${file.name}` : "Choose file";

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "New CV" }]} />
      <form ref={formRef} className="cv-area" onSubmit={submit} noValidate>
        <Toolbar title="New CV" subtitle="Four questions, then you choose how to start." />
        {problem && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>That didn’t work</strong>
            <span>{problem} Your answers are still here.</span>
          </div>
        )}
        <div className="cv-layout" style={{ gridTemplateColumns: "minmax(0, 640fr) minmax(0, 528fr)" }}>
          <Panel title="About this CV">
            <div className="cv-pad cv-stack">
              <div data-field="name">
                <Field label="CV name" rule="For you, so you can tell versions apart. Your name and the job you’re aiming for works well." value={name} onChange={setName} error={errors.name} maxLength={120} />
              </div>

              <fieldset data-field="level" aria-describedby={errors.level ? "level-error" : undefined}>
                <legend className="cv-label">
                  Your level<span className="cv-rule">This sets the page count and what comes first. It never changes your words.</span>
                </legend>
                <div className="cv-pair" style={{ marginTop: 6 }}>
                  {CV_LEVELS.map((l) => (
                    <label key={l} className="cv-choice">
                      <input type="radio" name="level" value={l} checked={level === l} onChange={() => setLevel(l)} />
                      <span>
                        <b style={{ display: "block", fontWeight: 600 }}>{LEVEL_LABELS[l]}</b>
                        <small>{LEVEL_HELP[l]}</small>
                      </span>
                    </label>
                  ))}
                </div>
                {errors.level && (
                  <p className="cv-error-text" id="level-error">
                    {errors.level}
                  </p>
                )}
              </fieldset>

              <fieldset data-field="region" aria-describedby={errors.region ? "region-error" : undefined}>
                <legend className="cv-label">
                  Where you’re applying<span className="cv-rule">Sets “CV” or “resume”, the paper size, spelling and how grades are written.</span>
                </legend>
                <div className="cv-pair" style={{ marginTop: 6 }}>
                  <label className="cv-choice">
                    <input type="radio" name="region" value="uk" checked={region === "uk"} onChange={() => setRegion("uk")} />
                    <span>
                      <b style={{ display: "block", fontWeight: 600 }}>UK</b>
                      <small>A CV on A4, UK spelling.</small>
                    </span>
                  </label>
                  <label className="cv-choice">
                    <input type="radio" name="region" value="us" checked={region === "us"} onChange={() => setRegion("us")} />
                    <span>
                      <b style={{ display: "block", fontWeight: 600 }}>US</b>
                      <small>A resume on Letter, US spelling.</small>
                    </span>
                  </label>
                </div>
                {errors.region && (
                  <p className="cv-error-text" id="region-error">
                    {errors.region}
                  </p>
                )}
              </fieldset>

              <div>
                <Btn kind="quiet" aria-expanded={showTarget} aria-controls="target-job" onClick={() => setShowTarget((v) => !v)}>
                  {showTarget ? "− Hide the target job" : "+ Add a target job (optional)"}
                </Btn>
                {showTarget && (
                  <div id="target-job" className="cv-stack" style={{ marginTop: 10 }}>
                    <div className="cv-pair">
                      <Field label="Job title" value={targetTitle} onChange={setTargetTitle} maxLength={160} />
                      <Field label="Employer" value={targetEmployer} onChange={setTargetEmployer} maxLength={160} />
                    </div>
                    <Field label="Job advert" rule="Paste the whole advert. It is kept word for word and used when you tailor this CV." multiline rows={6} value={targetAdvert} onChange={setTargetAdvert} maxLength={20000} />
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="How do you want to start?">
            <div className="cv-pad cv-stack">
              <label className="cv-choice">
                <input type="radio" name="method" checked={method === "empty"} onChange={() => setMethod("empty")} />
                <span>
                  <b style={{ display: "block", fontWeight: 600 }}>Start empty</b>
                  <small>Fill it in section by section. Nothing is written for you.</small>
                </span>
              </label>
              <label className="cv-choice">
                <input type="radio" name="method" checked={method === "upload" || method === "paste"} onChange={() => setMethod("upload")} />
                <span>
                  <b style={{ display: "block", fontWeight: 600 }}>Upload a CV</b>
                  <small>We read your CV into sections and you check each one before it is used.</small>
                </span>
              </label>

              <label className="cv-choice">
                <input type="radio" name="method" checked={method === "notes"} onChange={() => setMethod("notes")} />
                <span>
                  <b style={{ display: "block", fontWeight: 600 }}>Speak or type</b>
                  <small>Answer three questions about a role in your own words. Your bullets are written from what you say.</small>
                </span>
              </label>

              {(method === "upload" || method === "paste") && (
                <div className="cv-stack" data-field={method === "paste" ? "text" : "file"}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPT}
                    className="sr-only"
                    tabIndex={-1}
                    aria-label="CV file"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      // A file with nothing in it is not kept as the chosen file: it is said at once, by name.
                      if (f && f.size === 0) {
                        setFile(null);
                        setErrors((x) => ({ ...x, file: `“${f.name}” is empty: there is nothing in it to read. Choose another file, or paste the text of your CV.` }));
                        e.target.value = "";
                        return;
                      }
                      setFile(f);
                      setErrors((x) => ({ ...x, file: "" }));
                      if (f) {
                        setMethod("upload");
                        void submit(undefined, f);
                      }
                    }}
                  />
                  {method === "upload" ? (
                    <>
                      <span className="cv-help" id="upload-help">{UPLOAD_HELP}</span>
                      {file && (
                        <p className="cv-row">
                          <span className="cv-chip">{file.name}</span>
                          <Btn kind="quiet" onClick={() => fileRef.current?.click()} disabled={busy}>
                            Choose a different file
                          </Btn>
                        </p>
                      )}
                      {errors.file && <p className="cv-error-text">{errors.file}</p>}
                      <Btn kind="quiet" onClick={() => setMethod("paste")} disabled={busy}>
                        Paste the text instead
                      </Btn>
                    </>
                  ) : (
                    <>
                      <Field label="The text of your CV" rule="Copy everything from your CV and paste it here." multiline rows={9} value={text} onChange={setText} error={errors.text} maxLength={60000} />
                      <Btn kind="quiet" onClick={() => setMethod("upload")} disabled={busy}>
                        Upload a file instead
                      </Btn>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="cv-panelfoot">
              <small aria-hidden={!busy}>{stage === "creating" ? "Creating your CV…" : stage ? STAGE_WORDS[stage] : ""}</small>
              {method === "upload" && !file ? (
                <Btn kind="primary" busy={busy} aria-describedby="upload-help" onClick={() => fileRef.current?.click()}>
                  {busy ? "Working…" : action}
                </Btn>
              ) : (
                <Btn kind="primary" type="submit" busy={busy}>
                  {busy ? "Working…" : action}
                </Btn>
              )}
            </div>
          </Panel>
        </div>
        <Announce>{stage === "creating" ? "Creating your CV" : stage ? STAGE_WORDS[stage] : problem}</Announce>
      </form>
    </CvScreen>
  );
}
