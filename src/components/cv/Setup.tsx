"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { TEMPLATES, templateLabel } from "@/lib/cv/render/templates";
import { CV_LEVELS, CV_TEMPLATES, type CvLevel, type CvRegion, LEVEL_LABELS, type TemplateId } from "@/lib/cv/schema";
import { ApiError, api, messageOf } from "./client";
import { StartPaths } from "./StartPaths";
import { ACCEPT, STAGE_WORDS, UPLOAD_HELP, type UploadStage, sendUpload } from "./upload";
import { Announce, Bar, Btn, CvScreen, Field, Note, Panel, Toolbar } from "./ui";

const LEVEL_HELP: Record<CvLevel, string> = {
  student: "Studying, or looking for a first professional role.",
  early: "Up to about three years of work.",
  experienced: "Several years in your field.",
  senior: "Leading a function, a department or an organisation.",
};

type Method = "empty" | "linkedin" | "upload" | "paste" | "notes" | "talk";

/** What each way to start is called above its own panel. */
const METHOD_TITLE: Record<Method, string> = {
  talk: "Build with the assistant",
  linkedin: "Import from LinkedIn",
  upload: "Upload your CV",
  paste: "Paste your CV",
  empty: "Start with a blank page",
  notes: "Answer three questions about one job",
};
/** ?start= on the address picks a way to start: the CV home's "Build with the assistant" sends ?start=talk. */
const START: Record<string, Method> = { talk: "talk", upload: "upload", paste: "paste", linkedin: "linkedin", blank: "empty", notes: "notes" };

/**
 * New CV: first how to start (the same four paths as the CV home, then "I
 * have a CV already" and a blank page), then four questions before any CV
 * exists: what it is called, the level, UK or US, and (optionally) the job it
 * is aimed at. Nothing is pre-filled.
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
  const [method, setMethod] = useState<Method | null>(null);
  const formTop = useRef<HTMLDivElement>(null);
  /** Chooses a way to start and brings its questions into view. */
  function pick(m: Method) {
    setMethod(m);
    setErrors({});
    setProblem("");
    requestAnimationFrame(() => formTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState("");
  const [stage, setStage] = useState<UploadStage | "creating" | "">("");
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // A design chosen in the template gallery (/cv/new?template=harbour) comes along; it can be dropped here or changed later.
  const [design, setDesign] = useState<TemplateId | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("template");
    if (t && (CV_TEMPLATES as readonly string[]).includes(t)) setDesign(t as TemplateId);
    // A way to start named in the address; a design chosen in the gallery starts a blank CV in it unless another is named.
    const start = START[q.get("start") ?? ""];
    if (start) setMethod(start);
    else if (t) setMethod("empty");
  }, []);

  function check(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Give your CV a name.";
    if (!level) e.level = "Choose the level that fits you best.";
    if (!region) e.region = "Choose UK or US.";
    if (method === "upload" && !file) e.file = "Choose the file to upload.";
    if (method === "paste" && text.trim().length < 40) e.text = "Paste the text of your CV.";
    if (method === "linkedin" && linkedinText.trim().length < 40) e.linkedin = "Paste your profile’s About, Experience and Education, or upload the PDF LinkedIn makes for you.";
    return e;
  }

  /** Shows the problems and moves to the first field that has one. */
  function showErrors(e: Record<string, string>) {
    setErrors(e);
    const first = ["name", "level", "region", "file", "text", "linkedin"].find((k) => e[k]);
    if (first) requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"] input, [data-field="${first}"] textarea, [data-field="${first}"] button`)?.focus());
  }

  async function submit(ev?: FormEvent, chosen?: File) {
    ev?.preventDefault();
    if (stage || !method) return;
    const useFile = chosen ?? file;
    const found = check();
    if (chosen) delete found.file;
    setProblem("");
    if (Object.keys(found).length) return showErrors(found);
    setErrors({});
    const setup = { name: name.trim(), level, region, targetTitle, targetEmployer, targetAdvert, ...(design ? { template: design } : {}) };
    try {
      if (method === "empty" || method === "notes" || method === "talk") {
        setStage("creating");
        const { id } = await api<{ id: string }>("/api/cv/versions", { method: "POST", json: setup });
        // From notes: straight to the three questions about one role. Talking: straight to the assistant. The CV itself still starts empty.
        router.push(method === "notes" ? `/cv/v/${id}/capture/new` : method === "talk" ? `/cv/v/${id}/talk` : `/cv/v/${id}/edit/contact`);
        return;
      }
      const form = new FormData();
      for (const [k, v] of Object.entries(setup)) form.set(k, v);
      if (method === "upload" && useFile) form.set("file", useFile);
      else if (method === "linkedin") {
        if (linkedinUrl.trim()) form.set("linkedinUrl", linkedinUrl.trim());
        form.set("linkedinText", linkedinText.trim());
      } else form.set("text", text);
      const made = await sendUpload<{ importId: string }>("/api/cv/imports", form, setStage);
      router.push(`/cv/import/${made.importId}`);
    } catch (err) {
      setStage("");
      if (err instanceof ApiError && Object.keys(err.fields).length) showErrors(err.fields);
      else setProblem(messageOf(err));
    }
  }

  const busy = stage !== "";
  const action =
    method === null
      ? ""
      : method === "empty"
      ? "Create CV"
      : method === "linkedin"
      ? "Read my profile"
      : method === "notes"
      ? "Start with notes"
      : method === "talk"
      ? "Start talking"
      : method === "paste"
      ? "Read this text"
      : file
      ? `Upload ${file.name}`
      : "Choose file";

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "New CV" }]} />
      <form ref={formRef} className="cv-area" onSubmit={submit} noValidate>
        <Toolbar title="New CV" subtitle="Choose one of four ways to create your CV." />
        {problem && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>That didn’t work</strong>
            <span>{problem} Your answers are still here.</span>
          </div>
        )}
        <StartPaths label="How would you like to start?" picked={method === "talk" ? "assistant" : null} onPick={{ assistant: () => pick("talk") }} />
        <div className="cv-starts">
          <Panel title="I have a CV already">
            <div className="cv-pad">
              <p className="cv-muted" style={{ margin: 0 }}>Bring your existing content into the editor, or check it first.</p>
              <div className="cv-starts-buttons" role="group" aria-label="I have a CV already">
                <Btn aria-pressed={method === "upload"} onClick={() => pick("upload")}>
                  Upload PDF or Word
                </Btn>
                <Btn aria-pressed={method === "paste"} onClick={() => pick("paste")}>
                  Paste text
                </Btn>
                <Btn aria-pressed={method === "linkedin"} onClick={() => pick("linkedin")}>
                  Import from LinkedIn
                </Btn>
              </div>
              <div className="cv-starts-self" role="group" aria-label="Write it yourself">
                <span className="cv-muted">Prefer to write it yourself?</span>
                <span className="cv-row" style={{ gap: 4 }}>
                  <Btn kind="quiet" aria-pressed={method === "empty"} onClick={() => pick("empty")}>
                    Start with a blank page
                  </Btn>
                  <Btn kind="quiet" aria-pressed={method === "notes"} onClick={() => pick("notes")}>
                    Answer three questions about one job
                  </Btn>
                </span>
              </div>
            </div>
          </Panel>
        </div>

        {method && (
        <div ref={formTop} className="cv-layout" style={{ gridTemplateColumns: "minmax(0, 640fr) minmax(0, 528fr)", scrollMarginTop: 16 }} data-testid="setup-form">
          <Panel title="About this CV">
            <div className="cv-pad cv-stack">
              {design && (
                <Note label={`Design: ${templateLabel(TEMPLATES[design])}`} actions={<Btn onClick={() => setDesign(null)}>Don’t use this design</Btn>}>
                  Chosen in the template gallery. Your CV starts in it, and you can change it at any time on the Finish step.
                </Note>
              )}
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

          <Panel title={METHOD_TITLE[method]}>
            <div className="cv-pad cv-stack">
              {method === "talk" && (
                <div className="cv-stack">
                  <p style={{ margin: 0 }}>The assistant asks one question at a time and writes your CV as you answer, on the page beside you.</p>
                  <span className="cv-feature-points">
                    <span>Speak or type your answers</span>
                    <span>See your CV take shape as you go</span>
                    <span>Nothing invented. Undo any change.</span>
                  </span>
                </div>
              )}
              {method === "empty" && <p style={{ margin: 0 }}>Fill it in section by section. Nothing is written for you.</p>}
              {method === "notes" && <p style={{ margin: 0 }}>Say or type what you did, what changed and a number you stand behind. You choose which of the drafted lines to keep.</p>}

              {method === "linkedin" && (
                <div className="cv-stack" data-field="linkedin">
                  <p style={{ margin: 0 }}>
                    The fullest import is the PDF LinkedIn makes for you: on your profile choose <b>More</b>, then <b>Save to PDF</b>, and upload it.{" "}
                    <button type="button" className="cv-link" style={{ fontSize: "inherit" }} onClick={() => pick("upload")}>
                      Upload LinkedIn’s PDF
                    </button>
                  </p>
                  <Field
                    label="Or paste your profile"
                    rule="Copy your About, Experience and Education sections from LinkedIn. We don’t read LinkedIn pages ourselves, and nothing is filled in for you."
                    multiline
                    rows={6}
                    value={linkedinText}
                    onChange={setLinkedinText}
                    error={errors.linkedin}
                    maxLength={60000}
                  />
                  <Field label="Profile link (optional)" rule="Added to your contact links, for example linkedin.com/in/yourname." value={linkedinUrl} onChange={setLinkedinUrl} maxLength={300} />
                </div>
              )}

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
              <Btn kind="quiet" onClick={() => setMethod(null)} disabled={busy}>
                Choose a different way to start
              </Btn>
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
        )}
        <Announce>{stage === "creating" ? "Creating your CV" : stage ? STAGE_WORDS[stage] : problem}</Announce>
      </form>
    </CvScreen>
  );
}
