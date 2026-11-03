"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { newAudioContext, recorderFor, recordingType, resumeContext } from "./browser-audio";

export type MicState = "idle" | "requesting" | "live" | "paused" | "stopped" | "demo";

export interface MicOptions {
  /** Seconds of audio each waveform bar stands for. */
  barSec: number;
  /** How often the level is sampled, in ms. */
  sampleMs?: number;
}

/**
 * Microphone capture for live practice.
 * - Records the answer with MediaRecorder (getRecording) for upload to speech-to-text.
 * - Turns the live input level into waveform bars, one per `barSec`.
 * - Falls back to a clearly labelled demo waveform if the mic isn't available,
 *   so the screen still works in previews.
 */
export function useMicrophone({ barSec, sampleMs = 80 }: MicOptions) {
  const [state, setState] = useState<MicState>("idle");
  const [bars, setBars] = useState<number[]>([]);
  const [level, setLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stream = useRef<MediaStream | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<number | null>(null);
  const acc = useRef({ max: 0, sinceBar: 0 });
  const lastTick = useRef(0);
  const demoT = useRef(0);
  const stateRef = useRef<MicState>("idle");
  stateRef.current = state;

  const tick = useCallback(() => {
    const now = performance.now();
    const dt = (now - lastTick.current) / 1000;
    lastTick.current = now;
    if (stateRef.current !== "live" && stateRef.current !== "demo") return;

    let lvl: number;
    if (analyser.current) {
      const buf = new Float32Array(analyser.current.fftSize);
      analyser.current.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      const rms = Math.sqrt(sum / buf.length);
      lvl = Math.min(1, Math.pow(rms * 7, 0.75));
    } else {
      // Demo: speech-like phrases with breaths between them.
      demoT.current += dt;
      const t = demoT.current;
      const phrase = Math.max(0, Math.sin(t * 0.9) * 0.6 + 0.5);
      lvl = Math.min(1, phrase * (0.45 + 0.55 * Math.abs(Math.sin(t * 9.1) * Math.sin(t * 3.7))));
    }

    setLevel(lvl);
    setElapsed((e) => e + dt);
    const w = acc.current;
    w.max = Math.max(w.max, lvl);
    w.sinceBar += dt;
    if (w.sinceBar >= barSec) {
      const value = w.max;
      setBars((b) => [...b, value]);
      w.max = 0;
      w.sinceBar -= barSec;
    }
  }, [barSec]);

  const startTimer = useCallback(() => {
    lastTick.current = performance.now();
    if (timer.current == null) timer.current = globalThis.setInterval(tick, sampleMs) as unknown as number;
  }, [tick, sampleMs]);

  /**
   * Asks for the microphone up front (before the interviewer speaks), so the
   * browser's permission prompt never interrupts a question. True if allowed.
   */
  const prime = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }, []);

  /** Starts recording. Resolves true when the real microphone is live, false if it fell back to the demo waveform. */
  const start = useCallback(async (): Promise<boolean> => {
    setError(null);
    setBars([]);
    setElapsed(0);
    chunks.current = [];
    acc.current = { max: 0, sinceBar: 0 };
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser can’t use the microphone, so you’re seeing a demo waveform.");
      setState("demo");
      startTimer();
      return false;
    }
    setState("requesting");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.current = s;
      const ac = newAudioContext();
      await resumeContext(ac);
      const node = ac.createAnalyser();
      node.fftSize = 1024;
      ac.createMediaStreamSource(s).connect(node);
      ctx.current = ac;
      analyser.current = node;
      if (typeof MediaRecorder !== "undefined") {
        const rec = recorderFor(s);
        rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
        rec.start(1000);
        recorder.current = rec;
      }
      setState("live");
      startTimer();
      return true;
    } catch {
      setError("Microphone access was blocked, so you’re seeing a demo waveform. Allow the mic in your browser to practise for real.");
      setState("demo");
      startTimer();
      return false;
    }
  }, [startTimer]);

  const pause = useCallback(() => {
    if (stateRef.current === "live") recorder.current?.pause();
    setState((s) => (s === "live" || s === "demo" ? "paused" : s));
  }, []);

  const resume = useCallback(() => {
    if (recorder.current?.state === "paused") recorder.current.resume();
    lastTick.current = performance.now();
    setState(analyser.current ? "live" : "demo");
  }, []);

  /** Turn the mic off and free the audio graph (safe to call twice). */
  function releaseAudio() {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (ctx.current && ctx.current.state !== "closed") void ctx.current.close();
    ctx.current = null;
    analyser.current = null;
  }

  /** The recorded answer so far, ready to send to speech-to-text. */
  const getRecording = useCallback(() => (chunks.current.length ? new Blob(chunks.current, { type: recordingType(chunks.current, recorder.current) }) : null), []);

  /**
   * Stops recording and resolves with the whole answer as one audio file
   * (null in demo mode). Waits for the recorder's last chunk before building it.
   */
  const stop = useCallback(async (): Promise<Blob | null> => {
    if (timer.current != null) clearInterval(timer.current);
    timer.current = null;
    const rec = recorder.current;
    if (rec && rec.state !== "inactive") {
      await new Promise<void>((resolve) => {
        rec.addEventListener("stop", () => resolve(), { once: true });
        rec.stop();
      });
    }
    recorder.current = null;
    releaseAudio();
    setState("stopped");
    return getRecording();
  }, [getRecording]);

  useEffect(
    () => () => {
      if (timer.current != null) clearInterval(timer.current);
      releaseAudio();
    },
    [],
  );

  return { state, bars, level, elapsed, error, prime, start, pause, resume, stop, getRecording };
}
