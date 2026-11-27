"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type DragEvent, useEffect, useRef, useState } from "react";
import { TEMPLATES, templateLabel } from "@/lib/cv/render/templates";
import { CV_TEMPLATES, type TemplateId } from "@/lib/cv/schema";
import { ApiError, api, messageOf } from "./client";
import { ACCEPT, STAGE_WORDS, type UploadStage, sendUpload } from "./upload";
import { Announce, Bar, Btn, CvScreen, Field, Note, Toolbar } from "./ui";

/** The most a file can be: the same limit the server keeps. */
const MAX_BYTES = 5 * 1024 * 1024;
const OK_TYPE = /\.(pdf|docx)$/i;

/** What the drop area is showing (DESIGN-SPEC-v3 §01). */
type DropState = "initial" | "wrong-type" | "too-big" | "scanned" | "failed" | "empty-file";

const PROBLEM: Record<Exclude<DropState, "initial">, { title: string; body: string }> = {
  "wrong-type": { title: "That file type is not supported.", body: "Choose a PDF or Word file up to 5 MB." },
  "too-big": { title: "This file is over 5 MB.", body: "Choose a PDF or Word file up to 5 MB." },
  scanned: { title: "We couldn’t read any text from this PDF.", body: "It may be a scanned image. Upload a text-based file or paste the text instead." },
  failed: { title: "We couldn’t read your CV.", body: "Try the upload again or paste the text instead." },
  "empty-file": { title: "There is nothing in that file to read.", body: "Choose another file, or paste the text of your CV." },
};

/** The server's reasons, as the start screen says them. A reason not listed here is the general one, with its own words kept. */
const FROM_SERVER: Record<string, DropState> = { too_big: "too-big", "too-big": "too-big", "not-supported": "wrong-type", "old-word": "wrong-type", scanned: "scanned", empty: "scanned" };

type Other = "paste" | "linkedin" | "empty" | "notes" | "talk";

/** ?start= on the address opens one of the other ways: the CV home's "Build with the assistant" sends ?start=talk. */
const START: Record<string, Other> = { talk: "talk", paste: "paste", linkedin: "linkedin", blank: "empty", notes: "notes" };

const OTHER: { key: Other | "example"; title: string; body: string }[] = [
  { key: "paste", title: "Paste text", body: "Copy the text of your CV and paste it in." },
  { key: "linkedin", title: "LinkedIn", body: "Upload the PDF LinkedIn makes, or paste your profile." },
  { key: "example", title: "Start from an example", body: "A written CV for your kind of job, to make your own." },
  { key: "empty", title: "Start with a blank page", body: "Fill it in section by section. Nothing is written for you." },
  { key: "notes", title: "Answer three questions", body: "About one job: what you did, what changed and a number." },
  { key: "talk", title: "Talk it through", body: "The assistant asks one question at a time and writes as you answer." },
];

/** Where a CV started without a file opens. */
const OPENS: Record<"empty" | "notes" | "talk", (id: string) => string> = {
  empty: (id) => `/cv/v/${id}/edit/contact`,
  notes: (id) => `/cv/v/${id}/capture/new`,
  talk: (id) => `/cv/v/${id}/talk`,
};

/**
 * Start your CV, in three steps: upload, check only what was flagged, edit. Nothing is asked first: the
 * CV's name, UK or US and the level come from the file, and what it doesn't show is "Not known yet" in
 * the editor until the person sets it. The other ways to start sit below the upload.
 */
export function Setup() {
  const router = useRouter();
  const [drop, setDrop] = useState<DropState>("initial");
  const [serverWords, setServerWords] = useState("");
  const [over, setOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [stage, setStage] = useState<UploadStage | "creating" | "">("");
  const [other, setOther] = useState<Other | null>(null);
  const [text, setText] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const otherRef = useRef<HTMLDivElement>(null);
  // A design chosen in the template gallery (/cv/new?template=harbour) comes along; it can be dropped here or changed later.
  const [design, setDesign] = useState<TemplateId | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("template");
    if (t && (CV_TEMPLATES as readonly string[]).includes(t)) setDesign(t as TemplateId);
    const start = START[q.get("start") ?? ""];
    if (start) {
      setOther(start);
      requestAnimationFrame(() => otherRef.current?.scrollIntoView({ block: "start" }));
    }
  }, []);

  const busy = stage !== "";
  const reading = stage === "uploading" || stage === "reading";

  function chooseAnother() {
    setDrop("initial");
    setServerWords("");
    fileRef.current?.click();
  }
  function pasteInstead() {
    setOther("paste");
    requestAnimationFrame(() => {
      otherRef.current?.scrollIntoView({ block: "start" });
      otherRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus();
    });
  }

  /** Reads a file, or pasted text, into a new CV. Nothing is kept if it can't be read: the screen says why. */
  async function read(input: { file: File } | { text: string } | { linkedinText: string; linkedinUrl: string }) {
    if (busy) return;
    setProblem("");
    setErrors({});
    if ("file" in input) {
      const f = input.file;
      setFileName(f.name);
      setServerWords("");
      if (!OK_TYPE.test(f.name)) return setDrop("wrong-type");
      if (f.size > MAX_BYTES) return setDrop("too-big");
      if (f.size === 0) return setDrop("empty-file");
      setDrop("initial");
    }
    const form = new FormData();
    form.set("quick", "1");
    if (design) form.set("template", design);
    if ("file" in input) form.set("file", input.file);
    else if ("text" in input) form.set("text", input.text);
    else {
      if (input.linkedinUrl.trim()) form.set("linkedinUrl", input.linkedinUrl.trim());
      form.set("linkedinText", input.linkedinText.trim());
    }
    try {
      const made = await sendUpload<{ importId: string }>("/api/cv/imports", form, setStage);
      router.push(`/cv/import/${made.importId}`);
    } catch (err) {
      setStage("");
      const code = err instanceof ApiError ? err.code : "";
      if ("file" in input && err instanceof ApiError && err.status !== 0 && !Object.keys(err.fields).length) {
        const state = FROM_SERVER[code] ?? "failed";
        setDrop(state);
        // Our own words for the common reasons; the server's for the rest (a password, too many pages).
        setServerWords(state === "failed" ? err.message : "");
        return;
      }
      if (err instanceof ApiError && Object.keys(err.fields).length) setErrors(err.fields);
      else setProblem(messageOf(err));
    }
  }

  /** A blank page, three questions or the assistant: made at once, nothing asked. */
  async function startWithout(kind: "empty" | "notes" | "talk") {
    if (busy) return;
    setProblem("");
    setStage("creating");
    try {
      const { id } = await api<{ id: string }>("/api/cv/versions", { method: "POST", json: { quick: true, ...(design ? { template: design } : {}) } });
      router.push(OPENS[kind](id));
    } catch (err) {
      setStage("");
      setProblem(messageOf(err));
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void read({ file: f });
  }

  const shown = drop === "initial" ? null : PROBLEM[drop];

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Start your CV" }]} />
      <div className="cv-area cv-start3">
        <Toolbar title="Start your CV" subtitle="Upload your CV. We’ll read it into editable sections." />
        <StartSteps at={1} />
        {design && (
          <div style={{ marginBottom: 14 }}>
            <Note label={`Design: ${templateLabel(TEMPLATES[design])}`} actions={<Btn onClick={() => setDesign(null)}>Don’t use this design</Btn>}>
              Chosen in the template gallery. Your CV starts in it, and you can change it at any time.
            </Note>
          </div>
        )}
        {problem && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 14 }}>
            <strong>That didn’t work</strong>
            <span>{problem} What you entered is still here.</span>
          </div>
        )}

        <section className="cv-start3-card" aria-labelledby="upload-title">
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
              if (f) void read({ file: f });
            }}
          />
          <div
            className="cv-drop3"
            data-state={reading ? "reading" : over ? "over" : drop}
            data-testid="drop-area"
            onDragEnter={(e) => {
              e.preventDefault();
              if (!busy) setOver(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
            }}
            onDrop={onDrop}
          >
            {reading ? (
              <div className="cv-drop3-body" role="status">
                <h2 id="upload-title">Reading your CV</h2>
                <p className="cv-muted">We’ll show what we find as we read your file.</p>
                <ul className="cv-drop3-rows">
                  <li>
                    <span>{fileName || "Your file"}</span>
                    <span className="cv-muted">{stage === "uploading" ? "Uploading…" : "Received"}</span>
                  </li>
                  <li>
                    <span>Sections</span>
                    <span className="cv-muted">{stage === "reading" ? "Reading…" : "Waiting"}</span>
                  </li>
                </ul>
              </div>
            ) : over ? (
              <div className="cv-drop3-body">
                <h2 id="upload-title">Drop the file here</h2>
                <p className="cv-muted">PDF, DOCX · Up to 5 MB</p>
              </div>
            ) : shown ? (
              <div className="cv-drop3-body" role="alert" data-testid="drop-problem">
                <h2 id="upload-title">{shown.title}</h2>
                <p className="cv-muted">{serverWords || shown.body}</p>
                {fileName && <span className="cv-chip">{fileName}</span>}
                <div className="cv-row" style={{ justifyContent: "center" }}>
                  <Btn kind="primary" onClick={chooseAnother}>
                    Try again
                  </Btn>
                  <Btn onClick={pasteInstead}>Paste text instead</Btn>
                </div>
              </div>
            ) : (
              <div className="cv-drop3-body">
                <h2 id="upload-title">Upload your CV</h2>
                <p className="cv-muted">PDF, DOCX · Up to 5 MB</p>
                <Btn kind="primary" busy={busy} onClick={() => fileRef.current?.click()} data-testid="choose-file">
                  Choose file
                </Btn>
                <p className="cv-small cv-muted cv-notphone">Or drag and drop your file here</p>
              </div>
            )}
          </div>
          <p className="cv-small cv-muted" style={{ margin: "12px 0 0" }}>
            Nothing is asked first: the CV’s name, UK or US and your level come from the file, and you can change them in the editor. We read the text and don’t keep the file.
          </p>
        </section>

        <section className="cv-start3-other" aria-labelledby="other-title" ref={otherRef} style={{ scrollMarginTop: 16 }}>
          <h2 id="other-title" className="cv-start3-h">
            Other ways to start
          </h2>
          <div className="cv-start3-grid" role="group" aria-labelledby="other-title">
            {OTHER.map((o) =>
              o.key === "example" ? (
                <Link key={o.key} href="/cv/examples" className="cv-start3-way">
                  <b>{o.title}</b>
                  <span>{o.body}</span>
                </Link>
              ) : (
                <button key={o.key} type="button" className="cv-start3-way" aria-pressed={other === o.key} aria-expanded={other === o.key} onClick={() => setOther(other === o.key ? null : (o.key as Other))}>
                  <b>{o.title}</b>
                  <span>{o.body}</span>
                </button>
              ),
            )}
          </div>

          {other && (
            <div className="cv-start3-open" data-testid="other-open">
              {other === "paste" && (
                <form
                  className="cv-stack"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (text.trim().length < 40) return setErrors({ text: "Paste the text of your CV." });
                    void read({ text });
                  }}
                >
                  <Field label="The text of your CV" rule="Copy everything from your CV and paste it here. It’s kept as you pasted it until it is sorted into sections." multiline rows={9} value={text} onChange={setText} error={errors.text} maxLength={60000} />
                  <div className="cv-row">
                    <Btn kind="primary" type="submit" busy={busy}>
                      {busy ? "Reading…" : "Read this text"}
                    </Btn>
                  </div>
                </form>
              )}
              {other === "linkedin" && (
                <form
                  className="cv-stack"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (linkedinText.trim().length < 40) return setErrors({ linkedin: "Paste your profile’s About, Experience and Education, or upload the PDF LinkedIn makes for you." });
                    void read({ linkedinText, linkedinUrl });
                  }}
                >
                  <p style={{ margin: 0 }}>
                    Upload the PDF LinkedIn makes, or paste your profile. On your profile choose <b>More</b>, then <b>Save to PDF</b>.{" "}
                    <button type="button" className="cv-link" style={{ fontSize: "inherit" }} onClick={() => fileRef.current?.click()}>
                      Upload LinkedIn’s PDF
                    </button>
                  </p>
                  <p className="cv-small cv-muted" style={{ margin: 0 }}>
                    Hakkiri never reads LinkedIn pages itself.
                  </p>
                  <Field label="Or paste your profile" rule="Copy your About, Experience and Education sections from LinkedIn. Nothing is filled in for you." multiline rows={6} value={linkedinText} onChange={setLinkedinText} error={errors.linkedin} maxLength={60000} />
                  <Field label="Profile link (optional)" rule="Added to your contact links, for example linkedin.com/in/yourname." value={linkedinUrl} onChange={setLinkedinUrl} maxLength={300} />
                  <div className="cv-row">
                    <Btn kind="primary" type="submit" busy={busy}>
                      {busy ? "Reading…" : "Read my profile"}
                    </Btn>
                  </div>
                </form>
              )}
              {(other === "empty" || other === "notes" || other === "talk") && (
                <div className="cv-stack">
                  {other === "empty" && <p style={{ margin: 0 }}>Fill it in section by section. Nothing is written for you.</p>}
                  {other === "notes" && (
                    <div className="cv-stack" style={{ gap: 6 }}>
                      <p style={{ margin: 0 }}>Three questions about one job. You choose which of the drafted lines to keep.</p>
                      <ol className="cv-small" style={{ margin: 0, paddingLeft: 20 }}>
                        <li>What were you responsible for?</li>
                        <li>What changed because of your work?</li>
                        <li>Is there a number you can stand behind?</li>
                      </ol>
                      <p className="cv-small cv-muted" style={{ margin: 0 }}>
                        Then review your words. Only the lines you approve are added.
                      </p>
                    </div>
                  )}
                  {other === "talk" && (
                    <div className="cv-stack" style={{ gap: 6 }}>
                      <p style={{ margin: 0 }}>The assistant asks one question at a time and writes your CV as you answer, on the page beside you.</p>
                      <span className="cv-feature-points">
                        <span>Speak or type your answers</span>
                        <span>See your CV take shape as you go</span>
                        <span>Nothing invented. Undo any change.</span>
                      </span>
                    </div>
                  )}
                  <div className="cv-row">
                    <Btn kind="primary" busy={stage === "creating"} onClick={() => void startWithout(other)}>
                      {stage === "creating" ? "Creating your CV…" : other === "empty" ? "Start with a blank page" : other === "notes" ? "Start the three questions" : "Start talking"}
                    </Btn>
                  </div>
                  <p className="cv-small cv-muted" style={{ margin: 0 }}>
                    Your CV starts as “My CV”. UK or US and your level show as “Not known yet” until you choose them in the editor.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
        <Announce>{stage === "creating" ? "Creating your CV" : stage ? STAGE_WORDS[stage] : shown ? shown.title : problem}</Announce>
      </div>
    </CvScreen>
  );
}

/** Upload, Check, Edit: where the person is in starting a CV. */
export function StartSteps({ at }: { at: 1 | 2 | 3 }) {
  const steps = ["Upload", "Check", "Edit"];
  return (
    <ol className="cv-steps3" aria-label="Starting your CV">
      {steps.map((s, i) => (
        <li key={s} data-state={i + 1 < at ? "done" : i + 1 === at ? "current" : "next"} aria-current={i + 1 === at ? "step" : undefined}>
          <span className="cv-steps3-n" aria-hidden="true">
            {i + 1 < at ? "✓" : i + 1}
          </span>
          <span>
            <span className="sr-only">Step {i + 1}: </span>
            {s}
            {i + 1 < at && <span className="sr-only"> (done)</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
