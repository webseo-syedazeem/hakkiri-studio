"use client";

import { useEffect, useRef, useState } from "react";

const Q1 = "Tell me about a time you had to change a plan under pressure.";
const Q2 = "You said “we agreed to pause onboarding”. What was your part in that decision?";
const A = 41;
const T_ANSWER = 3600;
const T_WRITE = T_ANSWER + A * 150;
const T_FOLLOW = T_WRITE + 1600;
const T_SCORE = T_FOLLOW + 4200;
const T_LOOP = T_SCORE + 4200;

// Precomputed 44 wave heights
const SEED: number[] = [];
for (let i = 0; i < 44; i++) {
  SEED.push(0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));
}

type Phase = "ask" | "answer" | "write" | "follow" | "score";

function ph(t: number): Phase {
  if (t < T_ANSWER) return "ask";
  if (t < T_WRITE) return "answer";
  if (t < T_FOLLOW) return "write";
  if (t < T_SCORE) return "follow";
  return "score";
}

export function LiveDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setTime(T_FOLLOW + 100);
      return;
    }

    let rafId: number;
    let t0 = 0;

    const frame = (now: number) => {
      if (!t0) t0 = now;
      const t = (now - t0) % T_LOOP;
      setTime(t);
      rafId = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          rafId = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.25 },
    );

    io.observe(el);

    return () => {
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const t = started ? time : 0;
  const p = ph(t);
  const rec = p === "answer" || (p === "follow" && t - T_FOLLOW > 1500);
  const secs =
    p === "ask"
      ? 0
      : p === "answer"
      ? Math.min(A, (t - T_ANSWER) / 150)
      : p === "write" || p === "score"
      ? A
      : Math.max(0, Math.min(12, (t - T_FOLLOW - 1500) / 220));

  const fu = p === "follow" || p === "score";
  const q = fu ? Q2 : Q1;
  const clock = `${Math.floor(secs / 60)}:${("0" + Math.floor(secs % 60)).slice(-2)}`;
  const head = Math.min(100, (secs / 180) * 100);

  return (
    <div
      ref={containerRef}
      aria-label="Hakkiri AI mock interview screen asking a behavioral question, with a timer and a live recording"
      role="img"
      className="w-full max-w-full overflow-hidden rounded-[20px] bg-mk-bezel p-[3px] xs:p-[5px] shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_60px_120px_-40px_rgb(23_28_80/0.45)] sm:rounded-[26px] sm:p-[9px]"
    >
      <div className="relative w-full max-w-full overflow-hidden rounded-[13px] xs:rounded-[15px] bg-mk-stage px-3 py-3.5 text-left text-white sm:rounded-[18px] sm:px-6 sm:py-5">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-white/55 sm:text-[12px] min-w-0">
          <span className="flex min-w-0 items-center gap-1.5 sm:gap-2 truncate">
            <span className="font-semibold text-white shrink-0">Hakkiri</span>
            <span className="text-white/25 shrink-0">|</span>
            <span className="truncate">Interview · Senior Product Manager</span>
          </span>
          <span aria-hidden="true" className="hidden items-center gap-1 sm:flex shrink-0">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <span
                key={i}
                className={`h-[3px] w-6 rounded-full ${
                  i < 2 ? "bg-white/70" : i === 2 ? "bg-[#7b88ff]" : "bg-white/15"
                }`}
              />
            ))}
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="whitespace-nowrap hidden xs:inline sm:inline">Question 3 of 8</span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 font-medium transition-colors duration-300 ${
                rec ? "bg-[#ff5c5c]/15 text-[#ff8a8a]" : "bg-white/[0.06] text-white/45"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  rec ? "animate-rec bg-[#ff5c5c]" : "bg-white/30"
                }`}
              />
              {rec ? "Recording" : "Ready"}
            </span>
          </span>
        </div>

        {/* Question + planned grid */}
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] min-w-0">
          <div className="rounded-2xl bg-white/[0.05] p-3.5 sm:px-5 sm:py-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)] min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
              <span className="flex items-center gap-1.5 sm:gap-2 text-[12px] text-white/60">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4a5af0]/30 text-[10px] font-semibold text-[#c7ccff]">
                  S
                </span>
                <span className="truncate">
                  <span className="font-medium text-white/85">Sam</span> · hiring manager asks:
                </span>
              </span>
              <span className="flex flex-wrap gap-1 sm:gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] transition-colors duration-500 ${
                    fu ? "bg-[#4a5af0]/30 text-[#c7ccff]" : "bg-white/[0.08] text-white/60"
                  }`}
                >
                  {fu ? "Follow-up 1 of 2" : "Behavioural"}
                </span>
                <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] sm:text-[11px] text-white/60 whitespace-nowrap">
                  Target 1:00–1:30
                </span>
              </span>
            </div>
            <div className="relative mt-3 min-h-[64px] sm:min-h-[84px]">
              <p className="text-[15px] sm:text-[17px] md:text-[19px] font-semibold leading-snug tracking-[-0.01em] break-words">
                {q}
              </p>
            </div>
            <div className="mt-3 flex min-h-5 flex-wrap items-center gap-2 text-[12px] text-white/55">
              {p === "ask" || (p === "follow" && t - T_FOLLOW <= 1500) ? (
                <>
                  <span className="flex h-4 items-center gap-[2px]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        style={{ animationDelay: `${i * 0.12}s`, height: "100%" }}
                        className="w-[3px] origin-center rounded-full animate-wave bg-[#aeb6ff]"
                      />
                    ))}
                  </span>
                  <span>Asking out loud</span>
                </>
              ) : p === "write" ? (
                <>
                  <span
                    style={{ animationDelay: "0s" }}
                    className="inline-block h-1.5 w-1.5 animate-bounce-subtle rounded-full bg-white/60"
                  />
                  <span
                    style={{ animationDelay: "0.2s" }}
                    className="inline-block h-1.5 w-1.5 animate-bounce-subtle rounded-full bg-white/60"
                  />
                  <span
                    style={{ animationDelay: "0.4s" }}
                    className="inline-block h-1.5 w-1.5 animate-bounce-subtle rounded-full bg-white/60"
                  />
                  <span className="ml-1">Writing the next question from what you said</span>
                </>
              ) : p === "score" ? (
                <span className="flex flex-wrap gap-1.5">
                  {["Content 4.2", "Structure 3.9", "Point arrived 0:41", "Fillers 2"].map(
                    (c, j) => (
                      <span
                        key={j}
                        style={{ animationDelay: `${j * 110}ms` }}
                        className="animate-scale-in rounded-full bg-[#4a5af0]/25 px-2 py-0.5 text-[11px] font-medium text-[#c7ccff] shadow-[inset_0_0_0_1px_rgb(123_136_255/0.35)]"
                      >
                        {c}
                      </span>
                    ),
                  )}
                </span>
              ) : (
                <>
                  <span className="flex h-4 items-center gap-[2px]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        style={{
                          animationDelay: `${i * 0.12}s`,
                          height: `${35 + (i % 3) * 15}%`,
                        }}
                        className="w-[3px] origin-center rounded-full bg-white/30"
                      />
                    ))}
                  </span>
                  <span>Listening</span>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.05] px-4 py-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)]">
            <p className="text-[12px] font-medium text-white/60">Current question</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-white/60">On this question</p>
                <p className="num mt-1 text-[24px] font-semibold leading-none tabular-nums">
                  {clock}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-white/60">Planned</p>
                <p className="num mt-1 text-[24px] font-semibold leading-none text-white/50">
                  1:30
                </p>
              </div>
            </div>
            <p className="mt-4 truncate text-[11px] text-white/60">
              → Next: {fu ? "Why this role, and why now?" : "a follow-up on your answer"}
            </p>
          </div>
        </div>

        {/* Audio response bar */}
        <div className="mt-3 rounded-2xl bg-white/[0.05] p-3 sm:px-5 sm:py-3 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)] min-w-0">
          <div className="flex items-center justify-between text-[11px] sm:text-[12px] gap-2 min-w-0">
            <span className="min-w-0 truncate">
              <span className="font-medium text-white/85 shrink-0">You</span>
              <span className="ml-2 text-white/60 truncate hidden sm:inline">
                Pauses are fine. Take a breath before your result.
              </span>
              <span className="ml-1.5 text-white/60 truncate sm:hidden">
                Pauses are fine.
              </span>
            </span>
            <span className="num tabular-nums text-white/70 shrink-0 font-mono">{clock}</span>
          </div>
          <div className="mt-3 flex h-8 sm:h-9 items-end gap-[1.5px] sm:gap-[3px] overflow-hidden">
            {SEED.map((v, i) => {
              const reached =
                p === "ask"
                  ? false
                  : p === "write" || p === "score"
                  ? true
                  : i / SEED.length < secs / A;
              const live = rec && Math.abs(i / SEED.length - secs / A) < 0.08;
              return (
                <span
                  key={i}
                  style={{
                    height: `${Math.round(v * 100)}%`,
                    animationDelay: `${(i % 7) * 0.13}s`,
                  }}
                  className={`flex-1 min-w-[2px] max-w-[6px] origin-bottom rounded-full transition-colors duration-300 ${
                    reached ? "bg-[#9aa4ff]" : "bg-white/[0.12]"
                  }${live ? " animate-wave" : ""}`}
                />
              );
            })}
          </div>
          <div className="relative mt-2 h-[3px] rounded-full bg-white/[0.12]">
            <span className="absolute inset-y-0 left-[33%] w-[17%] rounded-full bg-[#4a5af0]/50" />
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-white/70"
              style={{ width: `${head}%` }}
            />
            <span
              className="absolute top-1/2 h-2.5 w-2.5 sm:h-3 sm:w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
              style={{ left: `${head}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-white/60">
            <span>0:00</span>
            <span className="hidden sm:inline">0:30</span>
            <span className="text-[#aeb6ff]">Target 1:00–1:30</span>
            <span className="hidden sm:inline">2:00</span>
            <span className="hidden sm:inline">2:30</span>
            <span>3:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
