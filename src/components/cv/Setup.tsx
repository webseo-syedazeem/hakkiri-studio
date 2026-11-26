"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { CV_LEVELS, type CvLevel, type CvRegion, LEVEL_LABELS } from "@/lib/cv/schema";
import { EXAMPLE_TEMPLATES } from "@/lib/cv/templates/examples";
import { ApiError, api, messageOf } from "./client";
import { ACCEPT, STAGE_WORDS, UPLOAD_HELP, type UploadStage, sendUpload } from "./upload";
import { Announce, Bar, Btn, CvScreen, Field, Panel, Toolbar } from "./ui";

const LEVEL_HELP: Record<CvLevel, string> = {
  student: "Studying, or looking for a first professional role.",
  early: "Up to about three years of work.",
  experienced: "Several years in your field.",
  senior: "Leading a function, a department or an organisation.",
};

type Method = "empty" | "example" | "linkedin" | "upload" | "paste" | "notes" | "talk";

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
  const [selectedTemplateId, setSelectedTemplateId] = useState("software-engineer");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
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
    if (method === "linkedin" && !linkedinUrl.trim()) e.linkedin = "Enter your LinkedIn profile link or username.";
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
    if (stage) return;
    const useFile = chosen ?? file;
    const found = check();
    if (chosen) delete found.file;
    setProblem("");
    if (Object.keys(found).length) return showErrors(found);
    setErrors({});
    const setup = { name: name.trim(), level, region, targetTitle, targetEmployer, targetAdvert };
    try {
      if (method === "example") {
        setStage("creating");
        const res = await api<{ id: string }>("/api/cv/templates", {
          method: "POST",
          json: { templateId: selectedTemplateId, name: name.trim(), region },
        });
        router.push(`/cv/v/${res.id}/edit/contact`);
        return;
      }
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
        form.set("linkedinUrl", linkedinUrl.trim());
        if (linkedinText.trim()) form.set("linkedinText", linkedinText.trim());
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
    method === "empty"
      ? "Create CV"
      : method === "example"
      ? "Use this example template"
      : method === "linkedin"
      ? "Import from LinkedIn"
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
              <label className="cv-choice cv-choice-feature">
                <input type="radio" name="method" checked={method === "talk"} onChange={() => setMethod("talk")} data-testid="method-talk" />
                <span>
                  <span className="cv-feature-top">
                    <span className="cv-feature-mark" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="cv-ico">
                        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3ZM5 10v1a7 7 0 0 0 14 0v-1M12 18v4m-4 0h8" />
                      </svg>
                    </span>
                    <span>
                      <b style={{ display: "block", fontWeight: 600 }}>Talk it through with the CV assistant</b>
                      <small>Build your CV by answering one question at a time.</small>
                    </span>
                  </span>
                  <span className="cv-feature-points">
                    <span>Speak or type your answers</span>
                    <span>See your CV take shape as you go</span>
                    <span>Nothing invented. Undo any change.</span>
                  </span>
                </span>
              </label>

              <label className="cv-choice">
                <input type="radio" name="method" checked={method === "example"} onChange={() => setMethod("example")} />
                <span>
                  <b style={{ display: "block", fontWeight: 600 }}>Start from an example template</b>
                  <small>Choose a verified, ATS-optimised example CV and customize it with your own details.</small>
                </span>
              </label>

              {method === "example" && (
                <div className="cv-stack" style={{ padding: "12px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span className="cv-label" style={{ margin: 0, color: "#f1f1f4" }}>
                      Choose an industry template ({EXAMPLE_TEMPLATES.length} ATS templates available)
                    </span>
                    <a href="/cv/examples" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#93c5fd", textDecoration: "underline" }}>
                      View all in gallery ↗
                    </a>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
                    {EXAMPLE_TEMPLATES.map((tpl) => {
                      const isSelected = selectedTemplateId === tpl.id;
                      return (
                        <div
                          key={tpl.id}
                          className="cv-tpl-card"
                          data-selected={isSelected}
                          style={{
                            background: isSelected
                              ? "linear-gradient(135deg, rgba(74, 90, 240, 0.22) 0%, rgba(74, 90, 240, 0.08) 100%)"
                              : "#181922",
                            borderColor: isSelected ? "#7b88ff" : "rgba(255, 255, 255, 0.12)",
                            color: "#f1f1f4",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setSelectedTemplateId(tpl.id);
                            if (!name.trim()) setName(tpl.title);
                            if (!level) setLevel(tpl.level);
                            if (!region) setRegion(tpl.region);
                          }}
                        >
                          <div className="cv-tpl-card-header">
                            <span className="cv-tpl-card-title" style={{ color: isSelected ? "#ffffff" : "#f1f1f4", fontWeight: isSelected ? 700 : 600 }}>
                              {tpl.title}
                            </span>
                            <span
                              className="cv-chip"
                              style={{
                                background: isSelected ? "rgba(123, 136, 255, 0.25)" : "rgba(255, 255, 255, 0.08)",
                                color: "#ffffff",
                                borderColor: isSelected ? "rgba(123, 136, 255, 0.5)" : "rgba(255, 255, 255, 0.15)",
                              }}
                            >
                              {tpl.badge}
                            </span>
                          </div>
                          <p className="cv-tpl-card-desc" style={{ color: isSelected ? "#c9ccd6" : "#9a9ba7" }}>
                            {tpl.description}
                          </p>
                          <div className="cv-tpl-card-stats" style={{ color: isSelected ? "#bfdbfe" : "#93c5fd" }}>
                            <span>⏱ {tpl.stats.experienceYears}</span>
                            <span>• {tpl.stats.rolesCount} Roles</span>
                            <span>• {tpl.stats.skillsCount} Skills</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <label className="cv-choice">
                <input type="radio" name="method" checked={method === "linkedin"} onChange={() => setMethod("linkedin")} />
                <span>
                  <b style={{ display: "block", fontWeight: 600, color: "#f1f1f4" }}>Import from LinkedIn</b>
                  <small style={{ color: "#9a9ba7" }}>Paste your LinkedIn profile address or profile sections to auto-populate your CV.</small>
                </span>
              </label>

              {method === "linkedin" && (
                <div
                  data-field="linkedin"
                  className="cv-linkedin-box"
                  style={{
                    background: "linear-gradient(180deg, rgba(10, 102, 194, 0.16) 0%, rgba(10, 102, 194, 0.05) 100%)",
                    borderColor: "rgba(123, 136, 255, 0.35)",
                    color: "#f1f1f4",
                  }}
                >
                  {/* LinkedIn Brand Header */}
                  <div className="cv-linkedin-header" style={{ borderBottomColor: "rgba(255, 255, 255, 0.08)" }}>
                    <div className="cv-linkedin-brand">
                      <div className="cv-linkedin-icon" style={{ background: "#0a66c2", color: "#ffffff" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                        </svg>
                      </div>
                      <div>
                        <h4 style={{ color: "#ffffff", fontWeight: 700 }}>LinkedIn Profile Sync</h4>
                        <p style={{ color: "#9a9ba7" }}>Auto-extract your professional experience, education, and skills.</p>
                      </div>
                    </div>
                    <span
                      className="cv-linkedin-badge"
                      style={{
                        background: "rgba(10, 102, 194, 0.35)",
                        color: "#93c5fd",
                        borderColor: "rgba(147, 197, 253, 0.4)",
                      }}
                    >
                      Instant Import
                    </span>
                  </div>

                  {/* Field 1: LinkedIn URL */}
                  <div className="cv-linkedin-field">
                    <label htmlFor="linkedin-url-input" style={{ color: "#f1f1f4", fontWeight: 600 }}>
                      LinkedIn Profile URL or Handle
                    </label>
                    <p className="cv-linkedin-hint" style={{ color: "#9a9ba7" }}>
                      Paste your public link, e.g. <code style={{ color: "#93c5fd", background: "rgba(255, 255, 255, 0.08)" }}>linkedin.com/in/username</code> or your full web address.
                    </p>
                    <input
                      id="linkedin-url-input"
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://www.linkedin.com/in/yourname"
                      className="cv-input"
                      style={{
                        background: "#13141b",
                        color: "#f1f1f4",
                        borderColor: "rgba(255, 255, 255, 0.18)",
                      }}
                    />
                    {errors.linkedin && (
                      <p className="cv-error-text" style={{ marginTop: "6px" }}>
                        {errors.linkedin}
                      </p>
                    )}
                  </div>

                  {/* Field 2: Profile Content (Optional) */}
                  <div className="cv-linkedin-field">
                    <div className="cv-linkedin-label-row">
                      <label htmlFor="linkedin-text-input" style={{ color: "#f1f1f4", fontWeight: 600 }}>
                        Profile Content &amp; Experience Text
                      </label>
                      <span className="cv-linkedin-optional" style={{ color: "#9a9ba7" }}>(Optional)</span>
                    </div>
                    <p className="cv-linkedin-hint" style={{ color: "#9a9ba7" }}>
                      If your LinkedIn profile requires a sign-in or has restricted visibility, copy &amp; paste your About, Experience, or Education sections here.
                    </p>
                    <textarea
                      id="linkedin-text-input"
                      rows={4}
                      value={linkedinText}
                      onChange={(e) => setLinkedinText(e.target.value)}
                      placeholder="Paste your LinkedIn summary, job roles, or qualifications here..."
                      className="cv-input"
                      style={{
                        background: "#13141b",
                        color: "#f1f1f4",
                        borderColor: "rgba(255, 255, 255, 0.18)",
                      }}
                    />
                  </div>

                  {/* Pro-Tip Box */}
                  <div
                    className="cv-linkedin-tip"
                    style={{
                      background: "rgba(255, 255, 255, 0.035)",
                      borderColor: "rgba(255, 255, 255, 0.18)",
                      color: "#9a9ba7",
                    }}
                  >
                    <span>💡</span>
                    <span>
                      <strong style={{ color: "#f1f1f4" }}>Pro tip:</strong> You can also export your complete LinkedIn profile as a PDF (open LinkedIn &gt; <em>More</em> &gt; <em>Save to PDF</em>) and use the <strong>Upload a CV</strong> option above for 100% fidelity.
                    </span>
                  </div>
                </div>
              )}

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
                  <b style={{ display: "block", fontWeight: 600 }}>Answer three questions about one job</b>
                  <small>Say or type what you did, what changed and a number you stand behind. You choose which of the drafted lines to keep.</small>
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
