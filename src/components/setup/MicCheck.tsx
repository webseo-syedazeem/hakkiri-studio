"use client";

import Link from "next/link";
import { newAudioContext, recorderFor, recordingType, resumeContext } from "@/components/audio/browser-audio";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Mark } from "@/components/brand/Mark";
import { Button, buttonClass, Icon, Panel } from "@/components/ui";

type Step = "start" | "blocked" | "live" | "recording" | "recorded";
const TEST_SEC = 5;
const SEGMENTS = 28;

/**
 * Turns the mic on, shows your level live, records a five-second test and
 * plays it back, so the first real session doesn't start with a dead mic.
 */
export function MicCheck({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [device, setDevice] = useState<string | null>(null);
  const [left, setLeft] = useState(TEST_SEC);
  const [clip, setClip] = useState<string | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const raf = useRef<number | null>(null);
  const peakRef = useRef(0);

  function release() {
    if (raf.current) cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    if (ctx.current && ctx.current.state !== "closed") void ctx.current.close();
    stream.current = null;
    ctx.current = null;
  }
  useEffect(() => () => release(), []);
  useEffect(() => () => void (clip && URL.revokeObjectURL(clip)), [clip]);

  async function turnOn() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.current = s;
      setDevice(s.getAudioTracks()[0]?.label || null);
      const ac = newAudioContext();
      await resumeContext(ac);
      const node = ac.createAnalyser();
      node.fftSize = 1024;
      ac.createMediaStreamSource(s).connect(node);
      ctx.current = ac;
      const buf = new Float32Array(node.fftSize);
      const tick = () => {
        node.getFloatTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += v * v;
        const lvl = Math.min(1, Math.pow(Math.sqrt(sum / buf.length) * 7, 0.75));
        setLevel(lvl);
        peakRef.current = Math.max(peakRef.current, lvl);
        raf.current = requestAnimationFrame(tick);
      };
      tick();
      setStep("live");
    } catch {
      setStep("blocked");
    }
  }

  function recordTest() {
    if (!stream.current) return;
    const rec = recorderFor(stream.current);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      setClip(URL.createObjectURL(new Blob(chunks, { type: recordingType(chunks, rec) })));
      setPeak(peakRef.current);
      setStep("recorded");
    };
    peakRef.current = 0;
    setLeft(TEST_SEC);
    setStep("recording");
    rec.start();
    let t = TEST_SEC;
    const timer = setInterval(() => {
      t -= 1;
      setLeft(t);
      if (t <= 0) {
        clearInterval(timer);
        rec.stop();
      }
    }, 1000);
  }

  function done() {
    document.cookie = `hk_mic_ok=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    release();
    router.push(next);
  }

  const quiet = step === "recorded" && peak < 0.18;
  const lit = Math.round(level * SEGMENTS);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-[68px] shrink-0 items-center justify-between px-10">
        <div className="flex items-center gap-3.5">
          <Mark size={26} />
          <span className="text-sm font-semibold">Microphone check</span>
        </div>
        <Link href={next} className={buttonClass("secondary", "sm")}>
          Skip for now
        </Link>
      </header>
      <main className="flex grow items-center justify-center px-10 pb-16">
        <Panel className="w-full max-w-[640px] animate-rise px-9 py-8">
          <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Check your microphone</h1>
          <p className="mt-2 text-[15px] leading-normal text-muted">
            Hakkiri scores what you say from the recording, so it needs to hear you clearly. This takes ten seconds. Your test isn’t saved.
          </p>

          <div className="mt-6 rounded-xl bg-panel-2 px-5 py-4 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold">{step === "start" ? "Microphone off" : step === "blocked" ? "Microphone blocked" : step === "recording" ? `Recording… ${left}` : "Listening"}</span>
              <span className="truncate pl-4 text-muted">{device ?? ""}</span>
            </div>
            <div className="mt-3 flex gap-[3px]" role="img" aria-label={`Input level ${Math.round(level * 100)}%`}>
              {Array.from({ length: SEGMENTS }, (_, k) => (
                <span key={k} className={clsx("h-4 flex-1 rounded-[2px] transition-colors duration-75", k < lit && step !== "start" ? (k > SEGMENTS * 0.85 ? "bg-red" : "bg-blue") : "bg-white/[0.07]")} />
              ))}
            </div>
            {step !== "start" && step !== "blocked" && <p className="mt-3 text-[13px] text-muted">Say something, like “I’m practising for my interview.” The bar should move as you speak.</p>}
          </div>

          {step === "blocked" && (
            <p role="alert" className="mt-4 text-sm leading-normal text-red-soft">
              The microphone is blocked. Click the lock or mic icon in the address bar, allow the microphone, then press Try again.
            </p>
          )}
          {step === "recorded" && clip && (
            <div className="mt-4">
              <div className="text-[13px] font-semibold">Your test</div>
              <audio src={clip} controls className="mt-2 w-full" />
              <p className={clsx("mt-2 text-[13px] leading-normal", quiet ? "text-red-soft" : "text-muted")}>
                {quiet
                  ? "We could barely hear you. Move closer, speak up, or pick another microphone in your computer’s sound settings, then record again."
                  : "Sounds clear? You’re ready. Headphones help if your speakers echo."}
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-2.5">
            {step === "start" && (
              <Button variant="primary" onClick={() => void turnOn()}>
                <Icon name="mic" size={17} strokeWidth={2} />
                Turn on the microphone
              </Button>
            )}
            {step === "blocked" && (
              <Button variant="primary" onClick={() => void turnOn()}>
                Try again
              </Button>
            )}
            {step === "live" && (
              <Button variant="primary" onClick={recordTest}>
                <Icon name="mic" size={17} strokeWidth={2} />
                Record a {TEST_SEC}-second test
              </Button>
            )}
            {step === "recording" && (
              <Button variant="primary" disabled>
                Recording… {left}
              </Button>
            )}
            {step === "recorded" && (
              <>
                <Button variant={quiet ? "secondary" : "primary"} onClick={done}>
                  {quiet ? "Continue anyway" : "Sounds good, continue"}
                </Button>
                <Button variant={quiet ? "primary" : "secondary"} onClick={recordTest}>
                  <Icon name="repeat" size={16} strokeWidth={1.9} />
                  Record again
                </Button>
              </>
            )}
          </div>
        </Panel>
      </main>
    </div>
  );
}
