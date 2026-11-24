"use client";

import { humaniseSpeechText } from "./speech-humaniser";

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
export type SpeakOptions = { rate?: number; voice?: VoiceName; onStart?: () => void };
type Speech = { done: Promise<void>; cancel: () => void };

/** Once the server says there's no natural voice, stop asking for this page's life. */
let natural: "unknown" | "on" | "off" = "unknown";
let failures = 0;
/** Generous wait time so cloud voice synthesis completes reliably without prematurely aborting. */
const NATURAL_WAIT_MS = 9000;

/** In-memory object URL cache for prefetched question audio. */
const audioBlobCache = new Map<string, string>();

/** Prefetches voice synthesis in the background so it plays instantly when the question begins. */
export function prefetchVoice(text: string, voice: VoiceName = "medium") {
  if (typeof window === "undefined" || !text.trim() || natural === "off") return;
  const spokenText = humaniseSpeechText(text).trim();
  const key = `${voice}|${spokenText}`;
  if (audioBlobCache.has(key)) return;

  fetch("/api/voice", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: spokenText, voice }),
  })
    .then((res) => {
      if (res.ok) return res.blob();
      return null;
    })
    .then((blob) => {
      if (blob) {
        audioBlobCache.set(key, URL.createObjectURL(blob));
      }
    })
    .catch(() => {});
}

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
  return true;
}

let cachedBrowserVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== "undefined" && window.speechSynthesis) {
  const updateVoices = () => {
    cachedBrowserVoices = window.speechSynthesis.getVoices();
  };
  updateVoices();
  window.speechSynthesis.onvoiceschanged = updateVoices;
}

function getBestBrowserVoice(voiceType?: VoiceName): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = cachedBrowserVoices.length ? cachedBrowserVoices : window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const isFemale = voiceType === "easy";

  // 1. Natural / Neural UK English voice (Edge, Chrome, Safari)
  const naturalUK = voices.find((v) => {
    const isUK = v.lang === "en-GB" || v.lang === "en_GB";
    const isNatural = /natural|neural|online|google|siri|enhanced/i.test(v.name);
    const genderMatch = isFemale ? /female|sonia|serena|stephanie/i.test(v.name) : /male|ryan|daniel|oliver|george/i.test(v.name);
    return isUK && isNatural && genderMatch;
  }) ?? voices.find((v) => (v.lang === "en-GB" || v.lang === "en_GB") && /natural|neural|online|google|siri|enhanced/i.test(v.name));
  if (naturalUK) return naturalUK;

  // 2. Standard UK voice with gender preference
  const standardUK = voices.find((v) => {
    const isUK = v.lang === "en-GB" || v.lang === "en_GB";
    return isUK && (isFemale ? /female|hazel|susan/i.test(v.name) : /male|daniel|george|arthur/i.test(v.name));
  }) ?? voices.find((v) => v.lang === "en-GB" || v.lang === "en_GB");
  if (standardUK) return standardUK;

  // 3. Any Natural English voice
  const anyNatural = voices.find((v) => v.lang.startsWith("en") && /natural|neural|online|google/i.test(v.name));
  if (anyNatural) return anyNatural;

  // 4. Any English voice
  return voices.find((v) => v.lang.startsWith("en")) ?? null;
}

function browserSpeak(text: string, opts: SpeakOptions, finish: () => void, setCancel: (c: () => void) => void) {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!synth) {
    // No speech in this browser: give the reader a moment, then carry on.
    opts.onStart?.();
    const timer = setTimeout(finish, Math.min(4000, 60 * text.length));
    setCancel(() => {
      clearTimeout(timer);
      finish();
    });
    return;
  }
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = getBestBrowserVoice(opts.voice);
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang || "en-GB";
  } else {
    u.lang = "en-GB";
  }

  // Interviewers speak deliberately and calmly with natural conversational inflection
  u.rate = opts.rate ?? (opts.voice === "hard" ? 0.95 : opts.voice === "easy" ? 0.93 : 0.94);
  u.pitch = opts.voice === "hard" ? 0.97 : opts.voice === "easy" ? 1.02 : 1.01;
  u.onstart = () => opts.onStart?.();
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
  const spoken = humaniseSpeechText(text).trim();
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
    browserSpeak(spoken, opts, finish, setCancel);
    return { done, cancel: () => cancel() };
  }

  const voiceKey = `${opts.voice ?? "medium"}|${spoken}`;
  const preloadedUrl = audioBlobCache.get(voiceKey);
  if (preloadedUrl) {
    const audio = sharedPlayer();
    audio.pause();
    audio.src = preloadedUrl;
    audio.playbackRate = opts.rate ?? 1;
    let stuck: ReturnType<typeof setTimeout> | undefined;
    const end = () => {
      clearTimeout(stuck);
      finish();
    };
    audio.onplay = () => opts.onStart?.();
    audio.onended = end;
    audio.onerror = end;
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) stuck = setTimeout(end, (audio.duration / audio.playbackRate) * 1000 + 3000);
    };
    setCancel(() => {
      audio.pause();
      end();
    });
    void audio.play().catch(() => {
      browserSpeak(spoken, opts, finish, setCancel);
    });
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
      const res = await fetch("/api/voice", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: spoken, voice: opts.voice ?? "medium" }), signal: controller.signal });
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
      audio.onplay = () => opts.onStart?.();
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
      // If natural voice was delayed or failed for this single line, smoothly fallback to browser voice for this line
      // without permanently muting the natural interviewer for the entire session.
      if (!finished) browserSpeak(spoken, opts, finish, setCancel);
    }
  })();
  return { done, cancel: () => cancel() };
}

/** Interviewer style → the voice for that difficulty. */
export function voiceFor(style: "friendly" | "realistic" | "tough"): VoiceName {
  return style === "friendly" ? "easy" : style === "tough" ? "hard" : "medium";
}
