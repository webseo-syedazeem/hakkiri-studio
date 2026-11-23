import "server-only";
import type { CvDoc } from "../schema";
import { IMPORT_ERRORS, ImportError, MAX_PASTE_CHARS, MAX_UPLOAD_BYTES, readCvFile, readCvText } from "./index";
import { fitRead } from "./fit";
import { type CvImport, CvImportSchema, importFromFailure, importFromRead } from "./record";

/**
 * Reads what the person sent (a file, or pasted text) into an upload record.
 * A file that cannot be read still gives a record, in the "failed" state with
 * the reason, so the screen can offer the right way forward and their set-up
 * answers are not lost. The file is read in memory and is not kept.
 */
export async function readUpload(base: Pick<CvImport, "id" | "userId" | "versionId" | "createdAt">, cv: Pick<CvDoc, "level">, input: { file?: File | null; text?: string | null }, now: string): Promise<CvImport> {
  const fileName = input.file?.name ?? (input.text ? "Pasted text" : "");
  try {
    let read;
    if (input.file && input.file.size > 0) {
      if (input.file.size > MAX_UPLOAD_BYTES) throw new ImportError("too-big", "The file is over 5 MB.");
      read = await readCvFile(new Uint8Array(await input.file.arrayBuffer()));
    } else if (input.text && input.text.trim()) read = readCvText(input.text.slice(0, MAX_PASTE_CHARS));
    else throw new ImportError("empty", "Nothing was sent.");
    // What was read is made to fit what a CV holds; what does not fit is kept under "not placed", never dropped.
    const record = importFromRead(base, fitRead(read), fileName, now);
    // The record is checked here, where a problem can still be answered with a reason, and not at the moment it is saved.
    const checked = CvImportSchema.safeParse(record);
    if (!checked.success) {
      console.error("[cv/import] What was read did not fit an upload record:", checked.error.issues.slice(0, 5));
      throw new ImportError("unreadable", "What was read could not be stored.");
    }
    return record;
  } catch (err) {
    if (!(err instanceof ImportError)) console.error("[cv/import] A file could not be read:", err);
    const code = err instanceof ImportError ? err.code : "unreadable";
    return importFromFailure(base, cv, code, IMPORT_ERRORS[code].message, fileName, now);
  }
}

/** The most a request carrying an upload may hold: the 5 MB file and the form around it. */
export const MAX_REQUEST_BYTES = MAX_UPLOAD_BYTES + 512 * 1024;
/** Uploads are capped at 5 MB; a request that says it is far larger than that is refused before it is read. */
export const tooLarge = (req: Request) => Number(req.headers.get("content-length") ?? 0) > MAX_REQUEST_BYTES;

/**
 * Reads the form a file or pasted text was sent in. The size a request claims
 * is not trusted (it can be left out, or be wrong): the bytes are counted as
 * they arrive, and reading stops as soon as there are more than an upload may
 * hold. Returns "too-big" for that, and null for a body that is not a form.
 */
export async function readForm(req: Request): Promise<FormData | "too-big" | null> {
  if (tooLarge(req)) return "too-big";
  if (!req.body) return null;
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_REQUEST_BYTES) {
      await reader.cancel().catch(() => {});
      return "too-big";
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    body.set(c, at);
    at += c.byteLength;
  }
  try {
    return await new Request("http://upload.local/", { method: "POST", headers: { "content-type": req.headers.get("content-type") ?? "" }, body }).formData();
  } catch {
    return null;
  }
}
