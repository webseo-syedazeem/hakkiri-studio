import "server-only";
import type { CvDoc } from "../schema";
import { IMPORT_ERRORS, ImportError, MAX_PASTE_CHARS, MAX_UPLOAD_BYTES, readCvFile, readCvText } from "./index";
import { type CvImport, importFromFailure, importFromRead } from "./record";

/**
 * Reads what the person sent (a file, or pasted text) into an upload record.
 * A file that cannot be read still gives a record, in the "failed" state with
 * the reason, so the screen can offer the right way forward and their set-up
 * answers are not lost. The file is read in memory and is not kept.
 */
export async function readUpload(base: Pick<CvImport, "id" | "userId" | "versionId" | "createdAt">, cv: Pick<CvDoc, "level">, input: { file?: File | null; text?: string | null }, now: string): Promise<CvImport> {
  const fileName = input.file?.name ?? (input.text ? "Pasted text" : "");
  try {
    if (input.file && input.file.size > 0) {
      if (input.file.size > MAX_UPLOAD_BYTES) throw new ImportError("too-big", "The file is over 5 MB.");
      return importFromRead(base, await readCvFile(new Uint8Array(await input.file.arrayBuffer())), fileName, now);
    }
    if (input.text && input.text.trim()) return importFromRead(base, readCvText(input.text.slice(0, MAX_PASTE_CHARS)), fileName, now);
    throw new ImportError("empty", "Nothing was sent.");
  } catch (err) {
    if (!(err instanceof ImportError)) console.error("[cv/import] A file could not be read:", err);
    const code = err instanceof ImportError ? err.code : "unreadable";
    return importFromFailure(base, cv, code, IMPORT_ERRORS[code].message, fileName, now);
  }
}

/** Uploads are capped at 5 MB; a request far larger than that is refused before it is read. */
export const tooLarge = (req: Request) => Number(req.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES + 512 * 1024;
