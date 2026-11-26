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
const NATURAL_WAIT_MS = 22000;

/** In-memory object URL cache for prefetched question audio. */
const audioBlobCache = new Map<string, string>();
const pendingPrefetches = new Map<string, Promise<string | null>>();

/** Prefetches voice synthesis in the background so it plays instantly when the question begins. */
export function prefetchVoice(text: string, voice: VoiceName = "medium"): Promise<string | null> {
  if (typeof window === "undefined" || !text.trim() || natural === "off") return Promise.resolve(null);
  const spokenText = humaniseSpeechText(text).trim();
  const key = `${voice}|${spokenText}`;
  if (audioBlobCache.has(key)) return Promise.resolve(audioBlobCache.get(key)!);
  if (pendingPrefetches.has(key)) return pendingPrefetches.get(key)!;

  const promise = fetch("/api/voice", {
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
        const url = URL.createObjectURL(blob);
        audioBlobCache.set(key, url);
        return url;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      pendingPrefetches.delete(key);
    });

  pendingPrefetches.set(key, promise);
  return promise;
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

  const isFemale = voiceType !== "hard";

  const isExplicitMale = (name: string) =>
    /male|david|george|mark|ryan|daniel|oliver|guy|richard|james|arthur|zeus|helios|sam|ben|tom|dan|mike|dave|matt|chris|alex|john|william/i.test(name);
  const isExplicitFemale = (name: string) =>
    /female|woman|sarah|sonia|serena|stephanie|hazel|susan|zira|samantha|karen|victoria|fiona|moira|tessa|jenny|athena|emma/i.test(name);

  // Filter out opposing gender completely
  const candidates = voices.filter((v) => {
    if (!v.lang.startsWith("en")) return false;
    return isFemale ? !isExplicitMale(v.name) : !isExplicitFemale(v.name);
  });
  const pool = candidates.length ? candidates : voices;

  // 1. Natural / Neural UK voice matching gender
  const naturalUK = pool.find((v) => {
    const isUK = v.lang === "en-GB" || v.lang === "en_GB";
    const isNatural = /natural|neural|online|enhanced/i.test(v.name);
    return isUK && isNatural && (isFemale ? isExplicitFemale(v.name) : isExplicitMale(v.name));
  });
  if (naturalUK) return naturalUK;

  // 2. Any UK voice matching gender
  const standardUK = pool.find((v) => {
    const isUK = v.lang === "en-GB" || v.lang === "en_GB";
    return isUK && (isFemale ? isExplicitFemale(v.name) : isExplicitMale(v.name));
  });
  if (standardUK) return standardUK;

  // 3. Any UK voice in candidate pool
  const anyUK = pool.find((v) => v.lang === "en-GB" || v.lang === "en_GB");
  if (anyUK) return anyUK;

  // 4. Any Natural English voice in candidate pool
  const naturalEnglish = pool.find((v) => /natural|neural|online|google|siri|enhanced/i.test(v.name));
  if (naturalEnglish) return naturalEnglish;

  // 5. Any English voice in candidate pool
  return pool.find((v) => v.lang.startsWith("en")) ?? pool[0] ?? null;
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
  // Generous fallback so real speech is never prematurely cut off mid-sentence
  const fallback = setTimeout(finish, 20000 + 200 * text.length);
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
    try {
      audio.currentTime = 0;
    } catch {}
    audio.src = preloadedUrl;
    audio.load();
    audio.playbackRate = opts.rate ?? 1;
    let stuck: ReturnType<typeof setTimeout> | undefined;
    const resetWatchdog = () => {
      clearTimeout(stuck);
      // Generous watchdog: only triggers if audio has completely frozen/stalled for 30 seconds
      stuck = setTimeout(end, 30000);
    };
    const end = () => {
      clearTimeout(stuck);
      finish();
    };
    audio.onplay = () => {
      opts.onStart?.();
      resetWatchdog();
    };
    audio.ontimeupdate = () => {
      // Actively advancing playback: never cut off mid-speech
      resetWatchdog();
    };
    audio.onpause = () => {
      clearTimeout(stuck);
    };
    audio.onended = end;
    audio.onerror = end;
    audio.onloadedmetadata = () => {
      resetWatchdog();
    };
    setCancel(() => {
      audio.pause();
      end();
    });
    void audio.play().catch((err: any) => {
      if (err?.name === "AbortError") return;
      browserSpeak(spoken, opts, finish, setCancel);
    });
    return { done, cancel: () => cancel() };
  }

  const pending = pendingPrefetches.get(voiceKey);
  if (pending) {
    void pending.then((url) => {
      if (finished) return;
      if (url) {
        const audio = sharedPlayer();
        audio.pause();
        try {
          audio.currentTime = 0;
        } catch {}
        audio.src = url;
        audio.load();
        audio.playbackRate = opts.rate ?? 1;
        let stuck: ReturnType<typeof setTimeout> | undefined;
        const resetWatchdog = () => {
          clearTimeout(stuck);
          stuck = setTimeout(end, 30000);
        };
        const end = () => {
          clearTimeout(stuck);
          finish();
        };
        audio.onplay = () => {
          opts.onStart?.();
          resetWatchdog();
        };
        audio.ontimeupdate = () => {
          resetWatchdog();
        };
        audio.onpause = () => {
          clearTimeout(stuck);
        };
        audio.onended = end;
        audio.onerror = end;
        audio.onloadedmetadata = () => {
          resetWatchdog();
        };
        setCancel(() => {
          audio.pause();
          end();
        });
        void audio.play().catch((err: any) => {
          if (err?.name === "AbortError") return;
          browserSpeak(spoken, opts, finish, setCancel);
        });
      } else {
        browserSpeak(spoken, opts, finish, setCancel);
      }
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
      try {
        audio.currentTime = 0;
      } catch {}
      audio.src = url;
      audio.load();
      audio.playbackRate = opts.rate ?? 1;
      let stuck: ReturnType<typeof setTimeout> | undefined;
      const resetWatchdog = () => {
        clearTimeout(stuck);
        stuck = setTimeout(end, 30000);
      };
      const end = () => {
        clearTimeout(stuck);
        URL.revokeObjectURL(url);
        finish();
      };
      audio.onplay = () => {
        opts.onStart?.();
        resetWatchdog();
      };
      audio.ontimeupdate = () => {
        resetWatchdog();
      };
      audio.onpause = () => {
        clearTimeout(stuck);
      };
      audio.onended = end;
      audio.onerror = end;
      audio.onloadedmetadata = () => {
        resetWatchdog();
      };
      setCancel(() => {
        audio.pause();
        end();
      });
      await audio.play();
    } catch (err: any) {
      clearTimeout(slow);
      if (cancelled || err?.name === "AbortError") return;
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
