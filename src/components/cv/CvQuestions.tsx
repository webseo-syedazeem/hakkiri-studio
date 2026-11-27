"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { CvClaim } from "@/lib/cv/claims";
import { api, messageOf } from "./client";
import { Announce, Bar, Btn, BtnLink, CvScreen, Skeleton } from "./ui";
import { useWorkspace } from "./Workspace";

type Practised = Record<string, { state: "practised" | "stale"; score: number }>;

/**
 * Questions your CV will get (design spec v3 §04): the strongest claims on
 * this CV, quoted exactly, each with the question an interviewer is likely to
 * ask and a way to practise it. A claim is marked Practised only after a real
 * session answered it, and only while the line still says the same thing.
 */
export function CvQuestions() {
  const router = useRouter();
  const w = useWorkspace();
  const versionId = w.versionId;
  const [data, setData] = useState<{ name: string; claims: CvClaim[]; practised: Practised } | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [starting, setStarting] = useState<string>("");
  const [problem, setProblem] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    try {
      await w.flush();
      const got = await api<{ name: string; claims: CvClaim[]; practised: Practised }>(`/api/practice/cv?cv=${encodeURIComponent(versionId)}`);
      setData(got);
      setState("ready");
    } catch {
      setState("failed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionId]);
  useEffect(() => void load(), [load]);

  async function practise(claims: string[] | null) {
    const key = claims ? claims[0] : "all";
    setStarting(key);
    setProblem("");
    try {
      const { href } = await api<{ href: string }>("/api/practice/cv", { method: "POST", json: { cv: versionId, ...(claims ? { claims } : {}) } });
      router.push(href);
    } catch (err) {
      setStarting("");
      setProblem(messageOf(err));
    }
  }

  const word = w.cv?.region === "us" ? "resume" : "CV";
  const Word = word === "CV" ? "CV" : "Resume";
  const editor = `/cv/v/${versionId}/edit/experience`;

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: `Questions your ${word} will get` }]} />
      <div className="cv-area cv-questions">
        <div className="cv-questions-head">
          <div className="min-w-0">
            <h1 className="cv-start-title">Questions your {word} will get</h1>
            <p className="cv-start-sub">These questions come from your own {word}. Practise explaining the numbers, decisions and results you’ve included.</p>
          </div>
          {state === "ready" && data && data.claims.length > 0 && (
            <Btn kind="primary" busy={starting === "all"} disabled={!!starting} onClick={() => void practise(null)} data-testid="practise-all">
              {starting === "all" ? "Preparing questions…" : "Practise all"}
            </Btn>
          )}
        </div>

        {state === "ready" && data && (
          <div className="cv-questions-meta">
            <span className="cv-small">
              {data.name} · {data.claims.length} {data.claims.length === 1 ? "claim" : "claims"}
            </span>
            <BtnLink kind="quiet" href={editor}>Back to editor</BtnLink>
          </div>
        )}

        {problem && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 14 }}>
            <strong>That didn’t work</strong>
            <span>{problem}</span>
            <Btn className="cv-push" onClick={() => setProblem("")}>Dismiss</Btn>
          </div>
        )}

        {state === "loading" && (
          <div className="cv-stack" aria-busy="true" aria-label="Preparing questions">
            <span className="cv-small">Preparing questions…</span>
            <Skeleton height={110} />
            <Skeleton height={110} />
          </div>
        )}

        {state === "failed" && (
          <div className="cv-issue" role="alert">
            <strong>The questions couldn’t be prepared</strong>
            <span>Your {word} is unchanged. Check you’re online and try again.</span>
            <Btn className="cv-push" onClick={() => void load()}>Try again</Btn>
          </div>
        )}

        {state === "ready" && data && data.claims.length === 0 && (
          <section className="cv-start-card" data-testid="no-questions">
            <h2 className="cv-start-h2">No questions to show yet</h2>
            <p className="cv-muted">Questions come from the claims on your {word}: a line that says what you did and what changed, with a number where you have one. Add one to a role and its question appears here.</p>
            <BtnLink href={editor}>Back to editor</BtnLink>
          </section>
        )}

        {state === "ready" && data && data.claims.length > 0 && (
          <ol className="cv-qlist" data-testid="cv-questions">
            {data.claims.map((c, i) => {
              const p = data.practised[c.id];
              const low = p?.state === "practised" && p.score < 3;
              return (
                <li key={c.id} className="cv-qrow">
                  <span className="cv-qnum" aria-hidden>{i + 1}</span>
                  <div className="cv-qbody">
                    <span className="cv-small">{c.topic}</span>
                    <blockquote className="cv-qclaim">“{c.text}”</blockquote>
                    <p className="cv-qtext">{c.question}</p>
                    {p?.state === "practised" && <p className="cv-qdone">✓ Practised</p>}
                    {p?.state === "stale" && <p className="cv-small">Practised before this line changed. Practise it again to check your answer still fits.</p>}
                    {low && (
                      <BtnLink kind="quiet" href={editor} onClick={() => w.setOpenEntry(c.at.section, c.at.entry ?? "")}>
                        Change the line
                      </BtnLink>
                    )}
                  </div>
                  <div className="cv-qaction">
                    <Btn busy={starting === c.id} disabled={!!starting} onClick={() => void practise([c.id])} aria-label={`Practise question ${i + 1}: ${c.question}`}>
                      {starting === c.id ? "Preparing…" : "Practise"}
                    </Btn>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <p className="cv-small" style={{ marginTop: 14 }}>
          {Word} lines are quoted exactly. The questions use only what your {word} says, so they never assume something it doesn’t.
        </p>
        <Announce>{state === "loading" ? "Preparing questions" : starting ? "Preparing your practice" : problem}</Announce>
      </div>
    </CvScreen>
  );
}
