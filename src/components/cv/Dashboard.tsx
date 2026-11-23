"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { type CvSummary, LEVEL_LABELS } from "@/lib/cv/schema";
import { docWord } from "@/lib/cv/sections";
import { api, messageOf } from "./client";
import { Bar, Btn, BtnLink, CvScreen, Panel, Skeleton, Toolbar } from "./ui";

const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/**
 * The person's CVs: each base CV with its tailored versions beneath it. A new
 * account sees no rows at all, only how to start. Nothing here is an example.
 */
export function Dashboard() {
  const [cvs, setCvs] = useState<CvSummary[] | null>(null);
  const [error, setError] = useState("");
  const [synced, setSynced] = useState("");

  const load = useCallback(() => {
    setError("");
    api<{ cvs: CvSummary[] }>("/api/cv/versions")
      .then((r) => {
        setCvs(r.cvs);
        setSynced(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      })
      .catch((e) => setError(messageOf(e)));
  }, []);
  useEffect(load, [load]);

  const bases = (cvs ?? []).filter((c) => c.kind === "base" || !cvs?.some((p) => p.id === c.parentId));
  const tailored = (id: string) => (cvs ?? []).filter((c) => c.kind === "tailored" && c.parentId === id);

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters" }]} />
      <div className="cv-area">
        <Toolbar title="CVs and letters" subtitle="Build a CV from your own words, check it, and tailor a version for each job.">
          <BtnLink kind="primary" href="/cv/new">
            New CV
          </BtnLink>
        </Toolbar>

        {error && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>Couldn’t load your CVs</strong>
            <span>
              {error}
              {cvs && synced ? ` Showing what was loaded at ${synced}.` : ""}
            </span>
            <Btn className="cv-push" onClick={load}>
              Retry
            </Btn>
          </div>
        )}

        {cvs === null && !error && (
          <Panel aria-busy="true" aria-label="Loading your CVs">
            {[0, 1, 2].map((i) => (
              <div className="cv-pick" key={i}>
                <div className="grow cv-stack">
                  <Skeleton width="40%" />
                  <Skeleton width="60%" height={12} />
                </div>
              </div>
            ))}
          </Panel>
        )}

        {cvs?.length === 0 && (
          <Panel>
            <div className="cv-pad cv-stack" style={{ padding: "36px 24px", textAlign: "center" }}>
              <h2>You have no CVs yet</h2>
              <p className="cv-muted" style={{ maxWidth: "52ch", margin: "8px auto 0" }}>
                Start a new CV, or upload the one you have. A new CV starts empty: everything on it will be what you put there.
              </p>
              <div className="cv-row" style={{ justifyContent: "center", marginTop: 18 }}>
                <BtnLink kind="primary" href="/cv/new">
                  New CV
                </BtnLink>
                <BtnLink href="/cv-audit">Free CV audit</BtnLink>
              </div>
            </div>
          </Panel>
        )}

        {cvs && cvs.length > 0 && (
          <Panel aria-label="Your CVs">
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {bases.map((cv) => (
                <li key={cv.id}>
                  <Row cv={cv} />
                  {tailored(cv.id).map((t) => (
                    <Row key={t.id} cv={t} indent />
                  ))}
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </CvScreen>
  );
}

function Row({ cv, indent }: { cv: CvSummary; indent?: boolean }) {
  const href = cv.pendingImportId ? `/cv/import/${cv.pendingImportId}` : `/cv/v/${cv.id}/edit/contact`;
  const target = [cv.targetTitle, cv.targetEmployer].filter(Boolean).join(" · ");
  return (
    <div className="cv-pick" style={indent ? { paddingLeft: 44 } : undefined}>
      <div className="min-w-0 grow">
        <Link href={href} className="font-semibold hover:underline" style={{ overflowWrap: "anywhere" }}>
          {cv.name}
        </Link>
        <small style={{ display: "block", marginTop: 3 }}>
          {indent ? "Tailored version" : `Base ${docWord(cv.region)}`} · {LEVEL_LABELS[cv.level]} · {cv.region.toUpperCase()}
          {target ? ` · ${target}` : ""} · Edited {when(cv.updatedAt)}
        </small>
      </div>
      {cv.pendingImportId ? <span className="cv-chip cv-link" style={{ textDecoration: "none" }}>Upload to check</span> : cv.empty ? <span className="cv-chip">Empty</span> : null}
      <BtnLink href={href}>{cv.pendingImportId ? "Check upload" : "Open"}</BtnLink>
    </div>
  );
}
