"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { forgetCheck } from "@/lib/cv/carry";
import { api, messageOf } from "./client";
import { Bar, BtnLink, CvScreen, Skeleton, Toolbar } from "./ui";

/**
 * Where "Open in CV Builder" on a free check leads. It starts a CV from the
 * text that was checked and moves straight on to the screen where the person
 * confirms what was read. Nothing is typed or pasted again.
 */
export function FromCheck({ auditId }: { auditId: string }) {
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const started = useRef(false);

  useEffect(() => {
    // Once only: the screen is drawn twice in development, and the server would answer the same both times anyway.
    if (started.current) return;
    started.current = true;
    api<{ importId: string; versionId: string; status: string }>("/api/cv/imports/from-check", { method: "POST", json: { auditId } })
      .then((made) => {
        forgetCheck();
        // Already checked and opened before: straight to the score. Otherwise to the check of what was read.
        router.replace(made.status === "confirmed" ? `/cv/v/${made.versionId}/findings` : `/cv/import/${made.importId}`);
      })
      .catch((err) => {
        forgetCheck();
        setProblem(messageOf(err));
      });
  }, [auditId, router]);

  const crumbs = [{ label: "CVs and letters", href: "/cv" }, { label: "From your free check" }];
  return (
    <CvScreen>
      <Bar crumbs={crumbs} />
      <div className="cv-area">
        {problem ? (
          <>
            <Toolbar title="We couldn’t open your check in the builder" subtitle={problem}>
              <BtnLink kind="primary" href="/cv/new">
                Paste the text of your CV
              </BtnLink>
              <BtnLink href="/cv">Back to your CVs</BtnLink>
            </Toolbar>
          </>
        ) : (
          <div aria-busy="true" aria-live="polite">
            <Toolbar title="Opening your CV in the builder" subtitle="Reading the text you checked and sorting it into sections. You will be asked to check what was read." />
            <Skeleton height={240} />
          </div>
        )}
      </div>
    </CvScreen>
  );
}
