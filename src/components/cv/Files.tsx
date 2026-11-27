"use client";

import { useState } from "react";
import { fileBaseName, fileName } from "@/lib/cv/render/filename";
import { cannotDrawAdvice } from "@/lib/cv/render/fonts";
import { cvIsEmpty } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { ApiError, api, messageOf } from "./client";
import { Dialog, usePanel } from "./Dialog";
import { Downloads } from "./Software";
import { Btn, BtnLink, Field, Panel } from "./ui";
import { type FileCheck, type FileChecks, useWorkspace } from "./Workspace";

type Format = "pdf" | "docx";
const FORMAT_NAME: Record<Format, string> = { pdf: "PDF", docx: "Word" };

/** What a file's line says: the truth about the last check, and whether it still applies. */
function statusOf(check: FileCheck | undefined, checks: FileChecks | null, current: boolean, busy: boolean): { word: string; tone: "good" | "bad" | "plain" } {
  if (busy) return { word: "Checking…", tone: "plain" };
  if (!checks || !check) return { word: "Unchecked", tone: "plain" };
  if (!current) return { word: "Out of date", tone: "plain" };
  if (check.status === "checked") return { word: "Checked", tone: "good" };
  if (check.status === "loss") return { word: "Loss found", tone: "bad" };
  return { word: "Check failed", tone: "bad" };
}

/**
 * The files: each is made, read back and compared with the CV word for word
 * before it is downloaded, and a file that doesn't match is not sent. Shown on
 * the Finish tab and in the Download dialog, from the same state, so a check
 * made in one is the check shown in the other.
 */
export function FilesPanel({ say, inDialog = false, onDownloaded }: { say: (text: string) => void; inDialog?: boolean; /** Told once a file has really been downloaded. */ onDownloaded?: () => void }) {
  const w = useWorkspace();
  const { update, settle, save, checks, setChecks } = w;
  const cv = w.cv!;
  const design = cv.design;
  const word = docWord(cv.region);
  const set = (changes: Partial<typeof design>) => update({ design: { ...design, ...changes } });
  const empty = cvIsEmpty(cv);
  const { panel, item, open, close: closePanel } = usePanel();
  // In the Download dialog, what was lost is shown in the dialog itself; on the Finish tab, in a dialog of its own.
  const [inlineLoss, setInlineLoss] = useState<Format | null>(null);
  const lossItem: Format | null = inDialog ? inlineLoss : panel === "file-loss" && (item === "pdf" || item === "docx") ? item : null;
  const showLoss = (f: Format) => (inDialog ? setInlineLoss(f) : open("file-loss", { item: f }));
  const close = () => (inDialog ? setInlineLoss(null) : closePanel());
  const [busy, setBusy] = useState<"" | "check" | Format>("");
  const [problem, setProblem] = useState("");
  const [downloads, setDownloads] = useState(0);
  const current = !!checks && checks.rev === cv.rev && save === "saved";

  async function check() {
    setProblem("");
    setBusy("check");
    try {
      if (!(await settle())) throw new Error("Your latest changes haven’t been saved yet, so a file can’t be made from them. Check the save status at the top, then try again.");
      const result = await api<FileChecks>(`/api/cv/versions/${cv.id}/check`, {
        method: "POST",
        json: {},
      });
      setChecks({ rev: result.rev, pdf: result.pdf, docx: result.docx });
      const bad = (["pdf", "docx"] as const).filter((f) => result[f]?.status !== "checked");
      say(bad.length ? `${bad.map((f) => FORMAT_NAME[f]).join(" and ")}: the check found a problem.` : "Both files checked. Each reads back the same as your CV.");
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  }

  async function download(format: Format, unchecked = false) {
    setProblem("");
    setBusy(format);
    try {
      if (!(await settle())) throw new Error("Your latest changes haven’t been saved yet, so a file can’t be made from them. Check the save status at the top, then try again.");
      let res: Response;
      try {
        res = await fetch(`/api/cv/versions/${cv.id}/export?format=${format}${unchecked ? "&unchecked=1" : ""}`);
      } catch {
        throw new ApiError(0, "No connection. Check you’re online and try again.");
      }
      const rev = Number(res.headers.get("x-cv-rev")) || cv.rev;
      const keep = (c: FileChecks | null, mine: FileCheck): FileChecks => ({
        ...(c && c.rev === rev ? c : {}),
        rev,
        [format]: mine,
      });
      if (res.ok) {
        // The bytes saved are the bytes that were read back and matched.
        const blob = await res.blob();
        const named = /filename\*=UTF-8''([^;]+)/.exec(res.headers.get("content-disposition") ?? "");
        const name = named ? decodeURIComponent(named[1]) : fileName(cv, format);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        setDownloads((n) => n + 1);
        onDownloaded?.();
        if (res.headers.get("x-cv-check") === "checked") {
          setChecks((c) =>
            keep(c, {
              status: "checked",
              name,
              pages: Number(res.headers.get("x-cv-pages")) || undefined,
              size: blob.size,
            }),
          );
          say(`${name} downloaded. It was checked first: it reads back the same as your ${word}.`);
        } else say(`${name} downloaded without a check. Open it and read it through before you send it.`);
        return;
      }
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        check?: { missing?: string[]; unexpected?: string[] };
        unsupported?: string[];
      };
      if (body.error === "loss") {
        setChecks((c) =>
          keep(c, {
            status: "loss",
            missing: body.check?.missing ?? [],
            unexpected: body.check?.unexpected ?? [],
            unsupported: body.unsupported ?? [],
          }),
        );
        showLoss(format);
        return;
      }
      if (res.status !== 409) setChecks((c) => keep(c, { status: "failed", made: body.error === "check_failed" }));
      setProblem(
        body.error === "check_failed"
          ? `The ${FORMAT_NAME[format]} file was made, but we couldn’t read it back to check it. You can try again, or download it unchecked and read it through yourself.`
          : (body.message ?? "The file could not be made."),
      );
    } catch (err) {
      setProblem(messageOf(err));
    } finally {
      setBusy("");
    }
  }

  const lost = lossItem ? checks?.[lossItem] : undefined;
  const other: Format = lossItem === "pdf" ? "docx" : "pdf";

  return (
    <>
      <Panel title={inDialog ? undefined : "Files"} id={inDialog ? undefined : "files"}>
        <div className="cv-pad cv-stack">
          <Field
            label="File name"
            rule="Without the ending. Leave empty for the standard name."
            placeholder={fileBaseName({
              ...cv,
              design: { ...design, fileName: "" },
            })}
            maxLength={120}
            value={design.fileName ?? ""}
            onChange={(v) => set({ fileName: v })}
          />
          {empty ? (
            <p className="cv-muted">There is nothing to download yet. Add your details first.</p>
          ) : (
            <>
              <ul className="cv-filelist">
                {(["pdf", "docx"] as const).map((format) => {
                  const st = statusOf(checks?.[format], checks, current, busy === "check" || busy === format);
                  const c = checks?.[format];
                  return (
                    <li key={format} data-format={format}>
                      <span className="min-w-0 grow">
                        <b style={{ overflowWrap: "anywhere" }}>{fileName(cv, format)}</b>
                        <small style={{ display: "block" }} data-testid={`status-${format}`} className={st.tone === "good" ? "cv-good" : st.tone === "bad" ? "cv-warn" : undefined}>
                          {st.tone === "good" ? "✓ " : ""}
                          {st.word}
                          {st.word === "Checked" && c ? `: reads back the same as your ${word}${c.pages && format === "pdf" ? `, ${c.pages === 1 ? "one page" : `${c.pages} pages`}` : ""}` : ""}
                          {st.word === "Out of date" ? `: your ${word} has changed since the check` : ""}
                        </small>
                      </span>
                      {st.word === "Loss found" && <Btn onClick={() => showLoss(format)}>See what was lost</Btn>}
                      {st.word === "Check failed" && c?.made && (
                        <Btn disabled={!!busy} onClick={() => void download(format, true)}>
                          Download unchecked file
                        </Btn>
                      )}
                      <Btn kind={format === "pdf" ? "primary" : "default"} busy={busy === format} disabled={!!busy} onClick={() => void download(format)}>
                        Download {FORMAT_NAME[format]}
                      </Btn>
                    </li>
                  );
                })}
              </ul>
              <div className="cv-row">
                <Btn busy={busy === "check"} disabled={!!busy} onClick={() => void check()}>
                  Check both files
                </Btn>
                <BtnLink href={`/cv/v/${cv.id}/software/pdf`}>See what software reads</BtnLink>
              </div>
              <small style={{ display: "block" }}>
                Each file is made, then read back and compared with your {word} word for word. A file that doesn’t match is not sent. The Word file names its fonts instead of carrying them, so its page breaks can differ
                on a computer without them.
              </small>
            </>
          )}
          {problem && (
            <p className="cv-error-text" role="alert">
              {problem}
            </p>
          )}
          <Downloads versionId={cv.id} refresh={downloads} />
        </div>
      </Panel>

      {lossItem &&
        (inDialog ? (
          <section className="cv-stack cv-issue-box" aria-label={`The ${FORMAT_NAME[lossItem]} file doesn’t match your ${word}`} data-testid="file-loss">
            <h3 style={{ margin: 0 }}>
              The {FORMAT_NAME[lossItem]} file doesn’t match your {word}
            </h3>
            {!lost || lost.status !== "loss" ? (
              <p>This file hasn’t been checked since your last change. Download it again to check it.</p>
            ) : (
              <>
                <p>The file was made and read back, and it does not say exactly what your {word} says, so it has not been sent.</p>
                {!!lost.unsupported?.length && (
                  <div className="cv-issue" style={{ display: "block" }}>
                    <strong>Characters these fonts can’t draw:</strong> <span data-testid="unsupported">{lost.unsupported.join(" ")}</span>
                    <p style={{ marginTop: 6 }} data-testid="unsupported-advice">
                      {cannotDrawAdvice(lost.unsupported)}
                    </p>
                  </div>
                )}
                {!!lost.missing?.length && (
                  <div>
                    <h3>In your {word}, not read back from the file</h3>
                    <ul className="cv-plainlist">
                      {lost.missing.slice(0, 12).map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!!lost.unexpected?.length && (
                  <div>
                    <h3>In the file, not in your {word}</h3>
                    <p className="cv-quote">{lost.unexpected.slice(0, 60).join(" ")}</p>
                  </div>
                )}
              </>
            )}
            <div className="cv-row">
              <>
                <Btn
                  onClick={() => {
                    close();
                    void download(lossItem!);
                  }}
                >
                  Rebuild the {FORMAT_NAME[lossItem!]} file
                </Btn>
                <Btn
                  kind="primary"
                  onClick={() => {
                    close();
                    void download(other);
                  }}
                >
                  Use the {FORMAT_NAME[other]} file instead
                </Btn>
              </>
            </div>
          </section>
        ) : (
          <Dialog
            title={`The ${FORMAT_NAME[lossItem]} file doesn’t match your ${word}`}
            onClose={close}
            wide
            actions={
              <>
                <Btn
                  onClick={() => {
                    close();
                    void download(lossItem!);
                  }}
                >
                  Rebuild the {FORMAT_NAME[lossItem!]} file
                </Btn>
                <Btn
                  kind="primary"
                  onClick={() => {
                    close();
                    void download(other);
                  }}
                >
                  Use the {FORMAT_NAME[other]} file instead
                </Btn>
              </>
            }
          >
            {!lost || lost.status !== "loss" ? (
              <p>This file hasn’t been checked since your last change. Download it again to check it.</p>
            ) : (
              <>
                <p>The file was made and read back, and it does not say exactly what your {word} says, so it has not been sent.</p>
                {!!lost.unsupported?.length && (
                  <div className="cv-issue" style={{ display: "block" }}>
                    <strong>Characters these fonts can’t draw:</strong> <span data-testid="unsupported">{lost.unsupported.join(" ")}</span>
                    <p style={{ marginTop: 6 }} data-testid="unsupported-advice">
                      {cannotDrawAdvice(lost.unsupported)}
                    </p>
                  </div>
                )}
                {!!lost.missing?.length && (
                  <div>
                    <h3>In your {word}, not read back from the file</h3>
                    <ul className="cv-plainlist">
                      {lost.missing.slice(0, 12).map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!!lost.unexpected?.length && (
                  <div>
                    <h3>In the file, not in your {word}</h3>
                    <p className="cv-quote">{lost.unexpected.slice(0, 60).join(" ")}</p>
                  </div>
                )}
              </>
            )}
          </Dialog>
        ))}
    </>
  );
}
