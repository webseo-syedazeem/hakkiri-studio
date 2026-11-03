"use client";

/**
 * Small differences between browsers' audio, in one place.
 *
 * - Safari and Firefox start an AudioContext "suspended" when it's created
 *   outside a click (ours is created after the microphone prompt), so the
 *   level meter would read silence. resumeContext() wakes it up.
 * - MediaRecorder formats differ: Chrome and Edge record WebM (Opus),
 *   Firefox records Ogg or WebM (Opus), Safari records MP4 (AAC).
 *   recorderFor() asks for the best format the browser supports.
 */

type AudioContextCtor = typeof AudioContext;

export function newAudioContext(): AudioContext {
  const Ctor = (window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext) as AudioContextCtor;
  return new Ctor();
}

export async function resumeContext(ac: AudioContext): Promise<void> {
  if (ac.state === "suspended") await ac.resume().catch(() => {});
}

/** In order of preference; Deepgram reads all of them. */
const FORMATS = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"];

export function recordingFormat(): string | undefined {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return undefined;
  return FORMATS.find((f) => MediaRecorder.isTypeSupported(f));
}

export function recorderFor(stream: MediaStream): MediaRecorder {
  const mimeType = recordingFormat();
  try {
    return mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  } catch {
    return new MediaRecorder(stream);
  }
}

/** The type to label a finished recording with, when the chunks don't say. */
export function recordingType(chunks: Blob[], recorder?: MediaRecorder | null): string {
  return chunks[0]?.type || recorder?.mimeType || recordingFormat() || "audio/webm";
}
