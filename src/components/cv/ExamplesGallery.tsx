"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXAMPLE_TEMPLATES, type ExampleTemplate } from "@/lib/cv/templates/examples";
import { api, messageOf } from "./client";
import { Bar, Btn, BtnLink, CvScreen, Panel, Toolbar } from "./ui";

export function ExamplesGallery() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [previewTemplate, setPreviewTemplate] = useState<ExampleTemplate | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const categories = ["All", "Technology", "Product", "Healthcare", "Marketing", "Finance"];

  const filtered =
    selectedCategory === "All"
      ? EXAMPLE_TEMPLATES
      : EXAMPLE_TEMPLATES.filter((t) => t.category === selectedCategory);

  async function useTemplate(t: ExampleTemplate) {
    setBusyId(t.id);
    setError("");
    try {
      const res = await api<{ id: string }>("/api/cv/templates", {
        method: "POST",
        json: { templateId: t.id, name: t.title },
      });
      router.push(`/cv/v/${res.id}/edit/contact`);
    } catch (err) {
      setError(messageOf(err));
      setBusyId(null);
    }
  }

  return (
    <CvScreen>
      <Bar crumbs={[{ label: "CVs and letters", href: "/cv" }, { label: "Example Resumes" }]}>
        <BtnLink kind="primary" href="/cv/new">
          + New Blank CV
        </BtnLink>
      </Bar>

      <div className="cv-area">
        <Toolbar
          title="Example Resumes & Templates"
          subtitle="Explore verified, high-scoring ATS resume templates across top careers. Learn from winning bullet structures or clone any template directly to start your CV."
        />

        {error && (
          <div className="cv-issue" role="alert" style={{ marginBottom: 18 }}>
            <strong>Could not use template</strong>
            <span>{error}</span>
          </div>
        )}

        {/* Category Pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className="cv-chip"
              style={{
                cursor: "pointer",
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 9999,
                background: selectedCategory === cat ? "#2563eb" : "var(--cv-card, #ffffff)",
                color: selectedCategory === cat ? "#ffffff" : "var(--cv-ink, #0f172a)",
                borderColor: selectedCategory === cat ? "#2563eb" : "var(--cv-line, #cbd5e1)",
                transition: "all 0.15s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
          {filtered.map((tpl) => (
            <Panel key={tpl.id}>
              <div className="cv-pad cv-stack" style={{ padding: 22, height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <div>
                    <span className="cv-chip" style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", background: "rgba(37, 99, 235, 0.08)", borderColor: "rgba(37, 99, 235, 0.2)" }}>
                      {tpl.badge}
                    </span>
                    <h3 style={{ margin: "8px 0 2px", fontSize: 16, fontWeight: 700, color: "var(--cv-ink, #0f172a)" }}>
                      {tpl.title}
                    </h3>
                    <small style={{ color: "var(--cv-muted, #64748b)" }}>
                      {tpl.category} · {tpl.level.toUpperCase()} · {tpl.region.toUpperCase()} Format
                    </small>
                  </div>
                </div>

                <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--cv-muted, #475569)", margin: "8px 0 14px", flexGrow: 1 }}>
                  {tpl.description}
                </p>

                {/* Metric stats */}
                <div style={{ display: "flex", gap: 12, padding: "8px 12px", background: "var(--cv-bg, #f8fafc)", borderRadius: 8, border: "1px solid var(--cv-line, #e2e8f0)", marginBottom: 16, fontSize: 11, fontWeight: 600 }}>
                  <span>⏳ {tpl.stats.experienceYears}</span>
                  <span>💼 {tpl.stats.rolesCount} Roles</span>
                  <span>⚡ {tpl.stats.skillsCount} Key Skills</span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
                  <Btn
                    kind="primary"
                    busy={busyId === tpl.id}
                    onClick={() => void useTemplate(tpl)}
                    style={{ flexGrow: 1 }}
                  >
                    {busyId === tpl.id ? "Cloning CV…" : "Use this template"}
                  </Btn>
                  <Btn
                    kind="quiet"
                    onClick={() => setPreviewTemplate(tpl)}
                  >
                    View details
                  </Btn>
                </div>
              </div>
            </Panel>
          ))}
        </div>

        {/* Modal / Preview Dialog */}
        {previewTemplate && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setPreviewTemplate(null)}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: 20,
                maxWidth: 680,
                width: "100%",
                maxHeight: "85vh",
                overflowY: "auto",
                padding: 28,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <span className="cv-chip" style={{ fontSize: 11, fontWeight: 700, color: "#2563eb" }}>
                    {previewTemplate.badge}
                  </span>
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: "6px 0 2px" }}>{previewTemplate.title}</h2>
                  <small style={{ color: "#64748b" }}>
                    {previewTemplate.category} · {previewTemplate.stats.experienceYears} experience
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, marginTop: 8 }}>
                <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", margin: "0 0 6px" }}>
                  Summary Excerpt
                </h4>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "#334155", background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                  {previewTemplate.summary}
                </p>

                <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", margin: "16px 0 8px" }}>
                  Included Sections & Structure
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                  <li><strong>Contact Information:</strong> Phone, email, UK/US location, and LinkedIn link.</li>
                  <li><strong>Professional Experience:</strong> {previewTemplate.stats.rolesCount} chronologically structured roles with quantified ATS action bullets.</li>
                  <li><strong>Education & Certifications:</strong> Degree, institution, and honors details.</li>
                  <li><strong>Skills Breakdown:</strong> {previewTemplate.stats.skillsCount} industry-specific competencies and tooling proficiencies.</li>
                </ul>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                <Btn kind="quiet" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Btn>
                <Btn
                  kind="primary"
                  busy={busyId === previewTemplate.id}
                  onClick={() => void useTemplate(previewTemplate)}
                >
                  {busyId === previewTemplate.id ? "Cloning CV…" : "Use this template"}
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </CvScreen>
  );
}
