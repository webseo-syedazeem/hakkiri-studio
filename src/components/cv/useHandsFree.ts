"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Listening = "off" | "asking" | "listening" | "hearing" | "working";

/** Quiet this long after speech ends a phrase, and it is sent. */
const PAUSE_MS = 1300;
/** Speech shorter than this is a cough or a click, not a phrase. */
const MIN_SPEECH_MS = 300;
/** A phrase is cut here even if the person keeps talking, so the CV keeps up with them. */
const MAX_PHRASE_MS = 40_000;
/** Silence is thrown away after this long, so a recording never grows while nobody speaks. */
const MAX_SILENCE_MS = 12_000;
const TICK_MS = 80;

/**
 * Talking hands-free: the microphone stays on, and each time the person
 * pauses, what they said since the last pause is turned into text and handed
 * over, while they carry on talking. Nothing is ever put in for them: what
 * is handed over is what speech-to-text heard, shown to them as their own
 * message, and where speech-to-text isn't available they are told to type.
 *
 * `paused` stops phrases being taken (while the assistant's reply is read
 * aloud, so it doesn't hear itself).
 */
export function useHandsFree(region: "uk" | "us", onText: (text: string) => void, paused: boolean) {
  const [state, setState] = useState<Listening>("off");
  const [level, setLevel] = useState(0);
  const [note, setNote] = useState("");
  /** Speech can't be used here: the button is no longer offered. */
  const [unavailable, setUnavailable] = useState(false);
  const deliver = useRef(onText);
  deliver.current = onText;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const live = useRef<{ stream: MediaStream; audio: AudioContext; timer: ReturnType<typeof setInterval>; recorder: MediaRecorder | null } | null>(null);
  const phrase = useRef({ started: 0, speech: 0, lastLoud: 0, heard: false });
  const sending = useRef(0);
  /** The state once nothing new is being heard: still listening, waiting for text, or off. */
  const settle = () => setState(sending.current ? "working" : live.current ? "listening" : "off");

  const transcribe = useCallback(
    async (blob: Blob) => {
      sending.current++;
      setState("working");
      try {
        const form = new FormData();
        form.set("audio", blob);
        form.set("region", region);
        const res = await fetch("/api/cv/transcribe", { method: "POST", body: form });
        const body = (await res.json().catch(() => ({}))) as { text?: string; message?: string };
        if (res.status === 501) {
          setUnavailable(true);
          setNote(body.message ?? "Speech-to-text isn’t switched on here. Type instead.");
          stopAll();
          return;
        }
        // Nothing heard in a phrase is not worth telling anyone about.
        if (res.status === 422) return;
        if (!res.ok || !body.text) {
          setNote(body.message ?? "That phrase couldn’t be turned into text. Say it again, or type it.");
          return;
        }
        setNote("");
        deliver.current(body.text);
      } catch {
        setNote("That phrase couldn’t be sent. Check you’re online, then say it again or type it.");
      } finally {
        sending.current--;
        settle();
      }
    },
    // stopAll is stable: it only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [region],
  );

  /** Starts a new recording for the next phrase, on the stream that is already open. */
  const record = useCallback(() => {
    const l = live.current;
    if (!l) return;
    const chunks: Blob[] = [];
    const r = new MediaRecorder(l.stream);
    const started = Date.now();
    phrase.current = { started, speech: 0, lastLoud: 0, heard: false };
    r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    r.onstop = () => {
      const heard = (r as MediaRecorder & { heard?: boolean }).heard;
      if (heard && chunks.length) void transcribe(new Blob(chunks, { type: r.mimeType || "audio/webm" }));
    };
    l.recorder = r;
    r.start(250);
  }, [transcribe]);

  /** Ends the current phrase. With `send`, what was said in it goes for transcription. A new phrase starts if still listening. */
  const cut = useCallback(
    (send: boolean) => {
      const l = live.current;
      const r = l?.recorder;
      if (!l || !r) return;
      (r as MediaRecorder & { heard?: boolean }).heard = send && phrase.current.heard;
      l.recorder = null;
      if (r.state !== "inactive") r.stop();
      if (!send) settle();
      record();
    },
    [record],
  );

  function stopAll() {
    const l = live.current;
    live.current = null;
    if (!l) return;
    clearInterval(l.timer);
    const r = l.recorder;
    if (r && r.state !== "inactive") {
      (r as MediaRecorder & { heard?: boolean }).heard = phrase.current.heard && !pausedRef.current;
      r.stop();
    }
    l.stream.getTracks().forEach((t) => t.stop());
    void l.audio.close().catch(() => {});
    setLevel(0);
    settle();
  }

  const start = useCallback(async () => {
    setNote("");
    if (live.current) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined" || typeof AudioContext === "undefined") {
      setUnavailable(true);
      return setNote("This browser can’t record. Type instead.");
    }
    setState("asking");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch {
      setState("off");
      return setNote("The microphone isn’t available, so type instead. You can allow the microphone in your browser’s settings.");
    }
    const audio = new AudioContext();
    const analyser = audio.createAnalyser();
    analyser.fftSize = 1024;
    audio.createMediaStreamSource(stream).connect(analyser);
    const buf = new Float32Array(analyser.fftSize);
    // The room's own noise, learned as it goes: speech is a good deal louder than it.
    let floor = 0.01;
    let shown = 0;
    const timer = setInterval(() => {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      const rms = Math.sqrt(sum / buf.length);
      const now = Date.now();
      const loud = rms > Math.max(0.02, floor * 3);
      if (!loud) floor = floor * 0.97 + rms * 0.03;
      if (Math.abs(rms - shown) > 0.01) setLevel((shown = rms));
      const p = phrase.current;
      if (pausedRef.current) {
        // While the reply is read aloud, nothing is taken: what was being recorded is dropped.
        if (p.heard || now - p.started > 2000) cut(false);
        return;
      }
      if (loud) {
        p.speech += TICK_MS;
        p.lastLoud = now;
        if (p.speech >= MIN_SPEECH_MS && !p.heard) {
          p.heard = true;
          setState("hearing");
        }
      }
      if (p.heard && now - p.lastLoud > PAUSE_MS) cut(true);
      else if (p.heard && now - p.started > MAX_PHRASE_MS) cut(true);
      else if (!p.heard && now - p.started > MAX_SILENCE_MS) cut(false);
    }, TICK_MS);
    live.current = { stream, audio, timer, recorder: null };
    record();
    setState("listening");
  }, [cut, record]);

  const stop = useCallback(() => stopAll(), []);

  useEffect(() => () => stopAll(), []);

  return { state, level, note, unavailable, start, stop, on: state !== "off" };
}
