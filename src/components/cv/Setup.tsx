"use client";

import { useRouter } from "next/navigation";
import { type DragEvent, useEffect, useRef, useState } from "react";
import { TEMPLATES, templateLabel } from "@/lib/cv/render/templates";
import { CV_TEMPLATES, type TemplateId } from "@/lib/cv/schema";
import { ApiError, api, messageOf } from "./client";
import { ACCEPT, type UploadStage, sendUpload } from "./upload";
import { Announce, Bar, Btn, CvScreen, Field } from "./ui";

/** Upload limit, as the server enforces it. */
const MAX_BYTES = 5 * 1024 * 1024;
const OK_TYPE = /\.(pdf|docx)$/i;

type Other = "paste" | "linkedin" | "three" | "talk" | "blank" | null;

/** Upload problems, in the words of design spec v3 §01. */
type UploadProblem = "wrong-type" | "too-big" | "scanned" | "failed";
const PROBLEM: Record<UploadProblem, { title: string; body: string }> = {
  "wrong-type": { title: "That file type is not supported.", body: "Choose a PDF or Word file up to 5 MB." },
  "too-big": { title: "This file is over 5 MB.", body: "Choose a PDF or Word file up to 5 MB." },
  scanned: { title: "We couldn’t read any text from this PDF.", body: "It may be a scanned image. Upload a text-based file or paste the text instead." },
  failed: { title: "We couldn’t read your CV.", body: "Try the upload again or paste the text instead." },
};

/** ?start= on the address opens a way to start directly (the CV home's "Build with the assistant" sends ?start=talk). */
const START: Record<string, "talk" | "blank" | "three" | "paste" | "linkedin"> = { talk: "talk", blank: "blank", notes: "three", paste: "paste", linkedin: "linkedin" };

/**
 * New CV, upload first (design spec v3 §01): no questions before the file.
 * The CV's name, UK or US and level are read from it afterwards, and only
 * the details we couldn't place confidently are shown for checking. Six other
 * ways to start sit underneath.
 */
export function Setup() {
  const router = useRouter();
  const [drag, setDrag] = useState(false);
  const [problem, setProblem] = useState<UploadProblem | null>(null);
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState<UploadStage | "creating" | "">("");
  const [fileName, setFileName] = useState("");
  const [showOther, setShowOther] = useState(false);
  const [other, setOther] = useState<Other>(null);
  const [text, setText] = useState("");
  const [textError, setTextError] = useState("");
  const [design, setDesign] = useState<TemplateId | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const linkedinRef = useRef<HTMLInputElement>(null);
  const otherRef = useRef<HTMLDivElement>(null);
  /** A CV is only ever created once per visit, however often effects or clicks run. */
  const creating = useRef(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("template");
    if (t && (CV_TEMPLATES as readonly string[]).includes(t)) setDesign(t as TemplateId);
    // A way to start named in the address opens that option here; nothing is created until the person chooses to go on.
    const start = START[q.get("start") ?? ""];
    if (start) {
      setShowOther(true);
      setOther(start);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const busy = stage !== "";

  /** Checks the file here first, so a wrong type or size is said at once, then sends it to be read. */
  async function upload(file: File) {
    if (busy) return;
    setProblem(null);
    setMessage("");
    if (!OK_TYPE.test(file.name)) return setProblem("wrong-type");
    if (file.size > MAX_BYTES) return setProblem("too-big");
    if (file.size === 0) return setProblem("failed");
    setFileName(file.name);
    const form = new FormData();
    form.set("file", file);
    if (design) form.set("template", design);
    await send(form);
  }

  async function send(form: FormData) {
    try {
      const made = await sendUpload<{ importId: string; versionId: string; status: string; error?: { code: string } }>("/api/cv/imports", form, setStage);
      if (made.status === "failed") {
        // Nothing was read, so nothing is kept: the empty CV made for it goes too, and the person can try again here.
        await api(`/api/cv/versions/${made.versionId}`, { method: "DELETE" }).catch(() => {});
        setStage("");
        const code = made.error?.code;
        setProblem(code === "scanned" || code === "empty" ? "scanned" : code === "too-big" ? "too-big" : code === "not-supported" || code === "old-word" ? "wrong-type" : "failed");
        return;
      }
      router.push(`/cv/import/${made.importId}`);
    } catch (err) {
      setStage("");
      if (err instanceof ApiError && err.code === "too_big") setProblem("too-big");
      else {
        setProblem("failed");
        setMessage(messageOf(err));
      }
    }
  }

  /** Pasted text (or a pasted LinkedIn profile) is read the same way as a file; the text is kept until it is read. */
  async function sendText() {
    if (text.trim().length < 40) return setTextError("Paste the text of your CV: there isn’t enough here to read yet.");
    setTextError("");
    setProblem(null);
    setFileName(other === "linkedin" ? "Your LinkedIn profile" : "Your pasted text");
    const form = new FormData();
    form.set("text", text);
    if (design) form.set("template", design);
    await send(form);
  }

  /** A blank page, three questions or the assistant: an empty CV in UK · A4 until the person changes it in the editor. */
  async function create(kind: "blank" | "three" | "talk") {
    if (busy || creating.current) return;
    creating.current = true;
    setStage("creating");
    try {
      const { id } = await api<{ id: string }>("/api/cv/versions", { method: "POST", json: { name: "Untitled CV", level: "experienced", region: "uk", ...(design ? { template: design } : {}) } });
      router.push(kind === "three" ? `/cv/v/${id}/capture/new` : kind === "talk" ? `/cv/v/${id}/talk` : `/cv/v/${id}/edit/contact`);
    } catch (err) {
      creating.current = false;
      setStage("");
      setProblem("failed");
      setMessage(messageOf(err));
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void upload(f);
  }

  function pickOther(o: Exclude<Other, null>) {
    setOther(o);
    setTextError("");
    requestAnimationFrame(() => otherRef.current?.querySelector<HTMLElement>("textarea, button.cv-btn-primary")?.focus());
  }

  const reading = stage === "uploading" || stage === "reading";

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "New CV" }]} />
      <div className="cv-area cv-start">
        <ol className="cv-steps" aria-label="Steps">
          <li aria-current="step"><span className="cv-steps-dot">1</span>Upload</li>
          <li><span className="cv-steps-dot">2</span>Check flagged details</li>
          <li><span className="cv-steps-dot">3</span>Editor</li>
        </ol>

        {reading ? (
          <>
          <h1 className="cv-start-title">Reading your CV</h1>
          <p className="cv-start-sub">We’ll show what we find as we read your file.</p>
          <section className="cv-start-card" aria-busy="true" data-testid="reading">
            <ul className="cv-readrows" style={{ marginTop: 0 }}>
              <li><b>{fileName || "Your file"}</b><span className="cv-chip">{stage === "uploading" ? "Uploading…" : "Reading…"}</span></li>
              {["Name and contact details", "Experience", "UK or US", "Level", "Document name"].map((row) => (
                <li key={row}><span>{row}</span><span className="cv-chip">Reading…</span></li>
              ))}
            </ul>
          </section>
          </>
        ) : (
          <>
          <h1 id="start-title" className="cv-start-title">Start your CV</h1>
          <p className="cv-start-sub">Upload your CV. We’ll read it into editable sections.</p>
          <section className="cv-start-card" aria-labelledby="start-title">

            {design && (
              <p className="cv-start-design">
                Design: <b>{templateLabel(TEMPLATES[design])}</b>. Your CV starts in it; change it any time.{" "}
                <button type="button" className="cv-link" onClick={() => setDesign(null)}>Don’t use this design</button>
              </p>
            )}

            <div
              className="cv-drop"
              style={{ marginTop: design ? 14 : 0 }}
              data-drag={drag || undefined}
              data-error={problem ? true : undefined}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
            >
              <span className="cv-drop-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
              </span>
              {drag ? (
                <b className="cv-drop-title">Drop the file here</b>
              ) : (
                <>
                  <b className="cv-drop-title">Upload your CV</b>
                  <span className="cv-drop-meta">PDF, DOCX · Up to 5 MB</span>
                  <Btn kind="primary" onClick={() => fileRef.current?.click()} aria-describedby="drop-help">
                    Choose file
                  </Btn>
                  <span className="cv-drop-meta">Or drag and drop your file here</span>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT}
                className="sr-only"
                tabIndex={-1}
                aria-label="CV file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void upload(f);
                }}
              />
            </div>

            {problem ? (
              <div className="cv-start-problem" role="alert">
                <b>{PROBLEM[problem].title}</b>
                <span>{PROBLEM[problem].body}</span>
                {message && problem === "failed" && <span className="cv-small">{message}</span>}
                <span className="cv-row">
                  <Btn onClick={() => fileRef.current?.click()}>Try again</Btn>
                  <Btn
                    kind="quiet"
                    onClick={() => {
                      setShowOther(true);
                      pickOther("paste");
                    }}
                  >
                    Paste text instead
                  </Btn>
                </span>
              </div>
            ) : (
              <p id="drop-help" className="cv-start-help">Choose a PDF or Word file up to 5 MB. We read your words; nothing is added to your CV without your approval.</p>
            )}

            <div className="cv-start-other">
              <button type="button" className="cv-disclose" aria-expanded={showOther} aria-controls="other-ways" onClick={() => setShowOther((v) => !v)}>
                <span aria-hidden className="cv-disclose-mark">›</span> Other ways to start
              </button>
              {showOther && (
                <div id="other-ways" className="cv-start-ways">
                  <WayCard title="Paste text" body="Paste the text from your existing CV." pressed={other === "paste"} onClick={() => pickOther("paste")} />
                  <WayCard title="LinkedIn" body="Upload the PDF LinkedIn makes, or paste your profile." pressed={other === "linkedin"} onClick={() => pickOther("linkedin")} />
                  <WayCard title="Start from an example" body="Choose a written example and replace the sample facts." onClick={() => router.push("/cv/examples?view=examples")} />
                  <WayCard title="Start with a blank page" body="Fill in the sections yourself." pressed={other === "blank"} onClick={() => pickOther("blank")} />
                  <WayCard title="Answer three questions" body="Tell us about one job in your own words." pressed={other === "three"} onClick={() => pickOther("three")} />
                  <WayCard title="Talk it through" body="Work through the CV with the assistant." pressed={other === "talk"} onClick={() => pickOther("talk")} />
                  <p className="cv-small" style={{ gridColumn: "1 / -1", margin: 0 }}>A blank page, three questions and Talk it through start as a UK CV on A4. Change it to US · Letter, and set your level, at the top of the editor.</p>
                </div>
              )}

              {showOther && other && (
                <div ref={otherRef} className="cv-start-panel">
                  {other === "paste" && (
                    <>
                      <h2 className="cv-start-h2">Paste your CV</h2>
                      <Field label="Your text" multiline rows={9} value={text} onChange={setText} error={textError} maxLength={60000} />
                      <span className="cv-row">
                        <Btn kind="primary" busy={busy} onClick={() => void sendText()}>Open editor</Btn>
                      </span>
                    </>
                  )}
                  {other === "linkedin" && (
                    <>
                      <h2 className="cv-start-h2">Bring your LinkedIn profile</h2>
                      <p className="cv-muted" style={{ margin: 0 }}>Hakkiri never reads LinkedIn pages itself. Upload the PDF LinkedIn makes, or paste the profile.</p>
                      <span className="cv-row">
                        <Btn onClick={() => linkedinRef.current?.click()}>Choose LinkedIn PDF</Btn>
                      </span>
                      <input
                        ref={linkedinRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        className="sr-only"
                        tabIndex={-1}
                        aria-label="LinkedIn PDF"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void upload(f);
                        }}
                      />
                      <Field label="Your text" multiline rows={7} value={text} onChange={setText} error={textError} maxLength={60000} />
                      <span className="cv-row">
                        <Btn kind="primary" busy={busy} onClick={() => void sendText()}>Open editor</Btn>
                      </span>
                    </>
                  )}
                  {other === "talk" && (
                    <>
                      <h2 className="cv-start-h2">Talk it through</h2>
                      <p className="cv-muted" style={{ margin: 0 }}>The assistant asks one question at a time and writes your CV on the page beside you as you answer. Speak or type. Nothing is invented, and every change can be undone.</p>
                      <span className="cv-row">
                        <Btn kind="primary" busy={stage === "creating"} onClick={() => void create("talk")} data-testid="start-talking">Start talking</Btn>
                      </span>
                    </>
                  )}
                  {other === "blank" && (
                    <>
                      <h2 className="cv-start-h2">Start with a blank page</h2>
                      <p className="cv-muted" style={{ margin: 0 }}>Fill in each section yourself. Nothing is written for you.</p>
                      <span className="cv-row">
                        <Btn kind="primary" busy={stage === "creating"} onClick={() => void create("blank")}>Create a blank CV</Btn>
                      </span>
                    </>
                  )}
                  {other === "three" && (
                    <>
                      <h2 className="cv-start-h2">Tell me what you did</h2>
                      <ol className="cv-start-three">
                        <li>What were you responsible for?</li>
                        <li>What changed because of your work?</li>
                        <li>Is there a number you can stand behind?</li>
                      </ol>
                      <p className="cv-muted" style={{ margin: 0 }}>You answer about one job, then review your words. Only the lines you approve are added.</p>
                      <span className="cv-row">
                        <Btn kind="primary" busy={stage === "creating"} onClick={() => void create("three")}>Review your words</Btn>
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
          </>
        )}
        <Announce>{reading ? "Reading your CV" : stage === "creating" ? "Creating your CV" : problem ? PROBLEM[problem].title : ""}</Announce>
      </div>
    </CvScreen>
  );
}

function WayCard({ title, body, pressed, onClick }: { title: string; body: string; pressed?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="cv-way" aria-pressed={pressed === undefined ? undefined : pressed} onClick={onClick}>
      <b>{title}</b>
      <span>{body}</span>
    </button>
  );
}
