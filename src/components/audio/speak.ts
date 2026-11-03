"use client";

/**
 * The interviewer's voice. speak(text) resolves when the voice finishes;
 * cancel() stops it and resolves straight away, so "Start answering" can cut
 * the interviewer off.
 *
 * With an ElevenLabs key on the server it uses a natural voice (one per
 * difficulty, from /api/voice). Without one, if it fails, or if you chose
 * "Browser voice" in Settings, it uses the browser's own speech, and if the
 * browser has none it pauses for a moment so you can read the question.
 */

export type VoiceName = "easy" | "medium" | "hard";
export type SpeakOptions = { rate?: number; voice?: VoiceName };
type Speech = { done: Promise<void>; cancel: () => void };

/** Once the server says there's no natural voice (or it fails twice running), stop asking for this page's life. */
let natural: "unknown" | "on" | "off" = "unknown";
let failures = 0;
/** If the natural voice hasn't arrived by then, the browser speaks instead: a question must never hang. */
const NATURAL_WAIT_MS = 8000;

/**
 * Safari only lets a page play sound from an element that has already played
 * during a click or key press. The interviewer speaks after a network request,
 * outside the click, so one shared element is "unlocked" with a moment of
 * silence on the first click or key press, then reused for every line.
 */
const SILENCE = "data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="; // 50 ms of silence
let player: HTMLAudioElement | null = null;
function sharedPlayer(): HTMLAudioElement {
  return (player ??= new Audio());
}
if (typeof window !== "undefined") {
  const unlock = () => {
    const p = sharedPlayer();
    if (!p.src || p.src === SILENCE) {
      p.src = SILENCE;
      void p.play().catch(() => {});
    }
    // Safari's speech can need the same nudge.
    try {
      if (window.speechSynthesis && !window.speechSynthesis.speaking) window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    } catch {
      // no speech in this browser
    }
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
}

function wantsNatural(): boolean {
  if (typeof document === "undefined" || natural === "off") return false;
  if (document.querySelector('meta[name="hk-natural-voice"]')?.getAttribute("content") === "off") return false;
  return !/(?:^|;\s*)hk_voice=browser/.test(document.cookie);
}

function browserSpeak(text: string, opts: SpeakOptions, finish: () => void, setCancel: (c: () => void) => void) {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!synth) {
    // No speech in this browser: give the reader a moment, then carry on.
    const timer = setTimeout(finish, Math.min(4000, 60 * text.length));
    setCancel(() => {
      clearTimeout(timer);
      finish();
    });
    return;
  }
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  u.voice = voices.find((v) => v.lang === "en-GB" && /male|daniel|arthur|george/i.test(v.name)) ?? voices.find((v) => v.lang === "en-GB") ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
  u.lang = "en-GB";
  u.rate = opts.rate ?? 1;
  u.onend = () => finish();
  u.onerror = () => finish();
  // Some browsers never fire onend if speech is blocked; don't hang the interview.
  const fallback = setTimeout(finish, 2000 + 90 * text.length);
  setCancel(() => {
    clearTimeout(fallback);
    synth.cancel();
    finish();
  });
  synth.speak(u);
}

export function speak(text: string, opts: SpeakOptions = {}): Speech {
  let finished = false;
  let resolve: () => void = () => {};
  const done = new Promise<void>((r) => (resolve = r));
  const finish = () => {
    if (finished) return;
    finished = true;
    resolve();
  };
  let cancel: () => void = finish;
  const setCancel = (c: () => void) => (cancel = c);

  if (!wantsNatural()) {
    browserSpeak(text, opts, finish, setCancel);
    return { done, cancel: () => cancel() };
  }

  const controller = new AbortController();
  let cancelled = false;
  setCancel(() => {
    cancelled = true;
    controller.abort();
    finish();
  });
  const slow = setTimeout(() => controller.abort(), NATURAL_WAIT_MS);
  void (async () => {
    try {
      const res = await fetch("/api/voice", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, voice: opts.voice ?? "medium" }), signal: controller.signal });
      if (res.status === 501) natural = "off";
      if (!res.ok) throw new Error(`voice ${res.status}`);
      const blob = await res.blob();
      clearTimeout(slow);
      const url = URL.createObjectURL(blob);
      if (finished) return URL.revokeObjectURL(url);
      natural = "on";
      failures = 0;
      const audio = sharedPlayer();
      audio.pause();
      audio.src = url;
      audio.playbackRate = opts.rate ?? 1;
      let stuck: ReturnType<typeof setTimeout> | undefined;
      const end = () => {
        clearTimeout(stuck);
        URL.revokeObjectURL(url);
        finish();
      };
      audio.onended = end;
      audio.onerror = end;
      // If playback stalls and never ends, don't hang the interview.
      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration)) stuck = setTimeout(end, (audio.duration / audio.playbackRate) * 1000 + 3000);
      };
      setCancel(() => {
        audio.pause();
        end();
      });
      await audio.play();
    } catch {
      clearTimeout(slow);
      if (cancelled) return;
      // No natural voice, too slow, or it failed: the browser speaks instead.
      if (natural !== "off" && ++failures >= 2) natural = "off";
      if (!finished) browserSpeak(text, opts, finish, setCancel);
    }
  })();
  return { done, cancel: () => cancel() };
}

/** Interviewer style → the voice for that difficulty. */
export function voiceFor(style: "friendly" | "realistic" | "tough"): VoiceName {
  return style === "friendly" ? "easy" : style === "tough" ? "hard" : "medium";
}
