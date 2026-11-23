"use client";

import { ApiError } from "./client";

export type UploadStage = "uploading" | "reading";

/**
 * Sends a file or pasted text to be read. Uploading and reading are reported
 * as separate stages, so the screen can say which one is happening.
 */
export function sendUpload<T>(url: string, form: FormData, onStage: (stage: UploadStage) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";
    onStage("uploading");
    xhr.upload.onload = () => onStage("reading");
    xhr.onerror = () => reject(new ApiError(0, "No connection. Check you’re online and try again.", "offline"));
    xhr.onload = () => {
      const body = (xhr.response ?? {}) as Record<string, unknown>;
      if (xhr.status >= 200 && xhr.status < 300) resolve(body as T);
      else reject(new ApiError(xhr.status, typeof body.message === "string" ? body.message : "The file could not be uploaded. Please try again.", typeof body.error === "string" ? body.error : "", (body.fields as Record<string, string>) ?? {}, body));
    };
    xhr.send(form);
  });
}

export const STAGE_WORDS: Record<UploadStage, string> = {
  uploading: "Uploading your file…",
  reading: "Reading the text and sorting it into sections…",
};

export const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const UPLOAD_HELP = "A PDF or Word (.docx) file, up to 5 MB. LinkedIn’s “Save to PDF” file works too. We read the text and don’t keep the file.";
