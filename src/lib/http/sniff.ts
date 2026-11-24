/**
 * What a file is, read from its first bytes. The type a browser sends with an
 * upload is only what the sender says it is, so anything that will be stored
 * and served back is checked here instead.
 */

const at = (b: Uint8Array, offset: number, text: string) => text.split("").every((c, i) => b[offset + i] === c.charCodeAt(0));

/**
 * The audio type of a recording (as browsers make them: WebM, Ogg, MP4/M4A,
 * WAV, MP3, FLAC), or null when it is not audio we know.
 */
export function audioType(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return "audio/webm"; // Matroska / WebM
  if (at(bytes, 0, "OggS")) return "audio/ogg";
  if (at(bytes, 4, "ftyp")) return "audio/mp4";
  if (at(bytes, 0, "RIFF") && at(bytes, 8, "WAVE")) return "audio/wav";
  if (at(bytes, 0, "fLaC")) return "audio/flac";
  if (at(bytes, 0, "ID3") || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) return "audio/mpeg";
  return null;
}

/** The audio type of an uploaded recording, from its own first bytes, or null. */
export async function sniffAudio(file: Blob): Promise<string | null> {
  return audioType(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
}

/** Types a saved recording may be served as. Anything else is served as plain WebM audio, never as a page. */
const SERVABLE = new Set(["audio/webm", "audio/ogg", "audio/mp4", "audio/wav", "audio/flac", "audio/mpeg", "audio/x-m4a", "audio/aac", "audio/mp3"]);
export const servableAudioType = (type: string | undefined) => {
  const base = (type ?? "").split(";")[0].trim().toLowerCase();
  return SERVABLE.has(base) ? base : "audio/webm";
};
