"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, messageOf } from "./client";

export type Dictation = "" | "asking" | "recording" | "transcribing";

/**
 * Speaking instead of typing: records an answer and hands back what was said
 * as text for the person to read and correct. Nothing is ever put in for them
 * that they did not say: where speech-to-text is not switched on, or the
 * microphone is not available, they are told to type instead.
 */
export function useDictation(region: "uk" | "us", onText: (text: string) => void) {
  const [state, setState] = useState<Dictation>("");
  const [note, setNote] = useState("");
  /** Speech can't be used here: the button is no longer offered. */
  const [off, setOff] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const deliver = useRef(onText);
  deliver.current = onText;

  useEffect(() => () => recorder.current?.stream.getTracks().forEach((t) => t.stop()), []);

  async function toggle() {
    setNote("");
    if (state === "recording") return recorder.current?.stop();
    if (state) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setOff(true);
      return setNote("This browser can’t record. Type your answer instead.");
    }
    setState("asking");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState("");
      return setNote("The microphone isn’t available, so type your answer instead. You can allow the microphone in your browser’s settings.");
    }
    const chunks: Blob[] = [];
    const r = new MediaRecorder(stream);
    recorder.current = r;
    r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    r.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      setState("transcribing");
      try {
        const form = new FormData();
        form.set("audio", new Blob(chunks, { type: r.mimeType || "audio/webm" }));
        form.set("region", region);
        const res = await fetch("/api/cv/transcribe", { method: "POST", body: form });
        const body = (await res.json().catch(() => ({}))) as { text?: string; message?: string };
        if (!res.ok || !body.text) throw new ApiError(res.status, body.message ?? "The recording couldn’t be turned into text. Try again, or type your answer.");
        deliver.current(body.text);
        setNote("Here is what we heard. Read it and correct anything that’s wrong.");
      } catch (err) {
        if (err instanceof ApiError && err.status === 501) setOff(true);
        setNote(messageOf(err));
      } finally {
        setState("");
      }
    };
    r.start();
    setState("recording");
  }

  const label = state === "recording" ? "Stop recording" : state === "asking" ? "Asking for the microphone…" : state === "transcribing" ? "Turning it into text…" : "Record your answer";
  return { state, note, off, toggle, label };
}
