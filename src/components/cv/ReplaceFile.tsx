"use client";

import { useRef, useState } from "react";
import { messageOf } from "./client";
import { Dialog } from "./Dialog";
import { ACCEPT, STAGE_WORDS, UPLOAD_HELP, type UploadStage, sendUpload } from "./upload";
import { Announce, Btn, Field } from "./ui";

/**
 * Replace the file of an upload, or paste the text in its place. This is the
 * way through for a scan, a locked PDF or an old Word file, and for a file
 * that read badly.
 */
export function ReplaceFileDialog({ importId, start, onClose, onDone }: { importId: string; start: "file" | "paste"; onClose: () => void; onDone: () => void }) {
  const [mode, setMode] = useState(start);
  const [text, setText] = useState("");
  const [stage, setStage] = useState<UploadStage | "">("");
  const [problem, setProblem] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function send(form: FormData) {
    setProblem("");
    try {
      await sendUpload(`/api/cv/imports/${importId}/file`, form, setStage);
      onDone();
    } catch (err) {
      setStage("");
      setProblem(messageOf(err));
    }
  }

  return (
    <Dialog title={mode === "file" ? "Choose another file" : "Paste the text of your CV"} onClose={onClose} wide={mode === "paste"}>
      <p className="cv-muted">This replaces what was read from the first file. Your set-up answers are kept.</p>
      {mode === "file" ? (
        <>
          <span className="cv-help" id="replace-help">{UPLOAD_HELP}</span>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-label="CV file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const form = new FormData();
              form.set("file", f);
              void send(form);
            }}
          />
          <div className="cv-row">
            <Btn kind="primary" data-autofocus busy={!!stage} aria-describedby="replace-help" onClick={() => fileRef.current?.click()}>
              {stage ? "Working…" : "Choose file"}
            </Btn>
            <Btn kind="quiet" onClick={() => setMode("paste")} disabled={!!stage}>
              Paste the text instead
            </Btn>
          </div>
        </>
      ) : (
        <>
          <Field label="The text of your CV" rule="Open your CV, select everything, copy it and paste it here." multiline rows={10} value={text} onChange={setText} maxLength={60000} data-autofocus />
          <div className="cv-row">
            <Btn
              kind="primary"
              busy={!!stage}
              onClick={() => {
                if (text.trim().length < 40) return setProblem("Paste the text of your CV first.");
                const form = new FormData();
                form.set("text", text);
                void send(form);
              }}
            >
              {stage ? "Working…" : "Read this text"}
            </Btn>
            <Btn kind="quiet" onClick={() => setMode("file")} disabled={!!stage}>
              Choose a file instead
            </Btn>
          </div>
        </>
      )}
      {stage && <small>{STAGE_WORDS[stage]}</small>}
      {problem && (
        <p className="cv-error-text" role="alert">
          {problem}
        </p>
      )}
      <Announce>{stage ? STAGE_WORDS[stage] : ""}</Announce>
    </Dialog>
  );
}
