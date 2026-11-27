"use client";

import { useRouter } from "next/navigation";
import { probedClaims } from "@/lib/cv/questions";
import { docWord } from "@/lib/cv/sections";
import { Bar, BtnLink, Btn, CvScreen, Panel, Skeleton, Toolbar } from "./ui";
import { useWorkspace } from "./Workspace";

const enc = encodeURIComponent;

/**
 * "Questions your CV will get": the five lines on the CV an interviewer is most
 * likely to ask about, each quoted as written, with the question it invites and
 * a way to practise it. Picked by rule from the person's own lines; nothing here
 * is scored, and nothing is said about the person that the CV doesn't say.
 */
export function Questions() {
  const router = useRouter();
  const w = useWorkspace();
  const { cv, load, flush, locate } = w;
  if (load === "loading" || !cv)
    return (
      <CvScreen>
        <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Questions your CV will get" }]} />
        <div className="cv-area" aria-busy="true">
          <Skeleton height={320} />
        </div>
      </CvScreen>
    );
  const word = docWord(cv.region);
  const base = `/cv/v/${cv.id}`;
  const here = `${base}/questions`;
  const claims = probedClaims(cv);
  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: cv.name, href: `${base}/edit/contact` }, { label: "Questions your CV will get" }]} />
      <div className="cv-area">
        <Toolbar title={`Questions your ${word} will get`} subtitle={`These come from your own ${word}: the numbers, the people you led and the results you claim. Practise explaining them before an interviewer asks.`}>
          {claims.length > 0 && (
            <BtnLink kind="primary" href={`/practice?type=experience&returnTo=${enc(here)}`} data-testid="practise-all">
              Practise all
            </BtnLink>
          )}
          <BtnLink href={`${base}/edit/experience`}>Back to the editor</BtnLink>
        </Toolbar>

        {claims.length ? (
          <ol className="cv-qlist" data-testid="cv-questions" aria-label={`Questions your ${word} will get`}>
            {claims.map((c, i) => (
              <li key={`${c.at.entry}-${c.at.field}`} className="cv-q" data-testid="cv-question">
                <span className="cv-q-n" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="cv-q-body">
                  <span className="cv-eyebrow">{c.label}</span>
                  <q className="cv-fix-quote">{c.text}</q>
                  <p className="cv-q-ask">{c.question}</p>
                  {c.role && <small className="cv-muted">{c.role}</small>}
                </div>
                <div className="cv-q-actions">
                  <BtnLink href={`/practice?claim=${enc(c.text)}&question=${enc(c.question)}&returnTo=${enc(here)}`} aria-label={`Practise question ${i + 1}`}>
                    Practise
                  </BtnLink>
                  <Btn
                    kind="quiet"
                    onClick={() => {
                      void flush();
                      router.push(`${base}/edit/${locate(c.at)}`);
                    }}
                  >
                    Show on my {word}
                  </Btn>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <Panel>
            <div className="cv-pad cv-stack">
              <h2 style={{ margin: 0 }}>No questions yet</h2>
              <p className="cv-muted" style={{ margin: 0 }}>
                Add what you did in your roles, with a number where you have one. The lines an interviewer is most likely to ask about will show here.
              </p>
              <BtnLink kind="primary" href={`${base}/edit/experience`} style={{ justifySelf: "start" }}>
                Add your experience
              </BtnLink>
            </div>
          </Panel>
        )}
        <p className="cv-small cv-muted" style={{ marginTop: 16 }}>
          Picked by rule from the lines on your {word}: a number, people you led, money or a result. Nothing is scored until you practise.
        </p>
      </div>
    </CvScreen>
  );
}
