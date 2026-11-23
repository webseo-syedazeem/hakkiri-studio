"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import clsx from "clsx";
import { CustomSelect } from "@/components/ui";
import type { Cv, Profile } from "@/lib/apply/schema";

const DEFAULT_EDITOR_CV: Cv = {
  id: "cv_default",
  userId: "usr_guest",
  name: "Charles Bloomberg · Base Resume",
  kind: "base",
  templateId: "standard",
  sections: [
    { type: "contact", order: 1, visible: true },
    {
      type: "summary",
      order: 2,
      visible: true,
      text: "Passion for building inspiring consumer software companies through industry-leading tech, design, and execution. An experienced early-stage global executive with an economics degree from the University of Wisconsin - Madison.",
    },
    { type: "experience", order: 3, visible: true },
    { type: "education", order: 4, visible: true },
    { type: "skills", order: 5, visible: true },
  ],
  bullets: [
    {
      id: "b-1",
      roleId: "role-1",
      text: "Launched Hakkiri Studio, the leading AI-powered career SaaS software, garnering trust from over 4,533,800 users globally.",
      evidenceIds: ["ev-1"],
      origin: "person",
      visible: true,
    },
    {
      id: "b-2",
      roleId: "role-1",
      text: "Architected the machine learning models behind Hakkiri's AI resume writer, lifting resume quality scores 32% across 4.5M+ users.",
      evidenceIds: ["ev-2"],
      origin: "person",
      visible: true,
    },
    {
      id: "b-3",
      roleId: "role-1",
      text: "Maintained a robust financial structure, supporting a company valuation of $45,000,000, with a dedicated team of 9 full-time employees.",
      evidenceIds: [],
      origin: "person",
      visible: true,
    },
    {
      id: "b-4",
      roleId: "role-2",
      text: "Relied and implemented Tableau dashboards to track 6 marketing KPIs. Used data to create reports circulated amongst leadership.",
      evidenceIds: [],
      origin: "person",
      visible: true,
    },
  ],
  score: {
    total: 95,
    parts: { evidence: 95, clarity: 92, structure: 96, software: 98 },
    at: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_EDITOR_PROFILE: Profile = {
  userId: "usr_guest",
  region: "uk",
  contact: {
    name: "Charles Bloomberg",
    email: "charlesbloomberg@gmail.com",
    phone: "(621) 799-5548",
    location: "Seoul, South Korea",
    links: ["https://linkedin.com/in/cbloomberg"],
  },
  headline: "CEO & Founder | Hakkiri Studio",
  summary:
    "Passion for building inspiring consumer software companies through industry-leading tech, design, and execution. An experienced early-stage global executive with an economics degree.",
  roles: [
    {
      id: "role-1",
      title: "CEO & Founder",
      employer: "Hakkiri Studio",
      location: "Seoul, South Korea",
      start: "August 2015",
      end: "Present",
      current: true,
      bullets: [],
    },
    {
      id: "role-2",
      title: "Marketing Analyst",
      employer: "Kaplan",
      location: "La Crosse, WI",
      start: "May 2016",
      end: "May 2017",
      current: false,
      bullets: [],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of Wisconsin - Madison",
      qualification: "BSc Economics",
      grade: "First Class Honours",
      start: "2011",
      end: "2015",
    },
  ],
  skills: [
    { name: "Python", group: "Languages", evidenceIds: [] },
    { name: "Machine Learning", group: "AI", evidenceIds: [] },
    { name: "Systems Design", group: "Engineering", evidenceIds: [] },
    { name: "Tableau & Analytics", group: "Data", evidenceIds: [] },
    { name: "Executive Leadership", group: "Management", evidenceIds: [] },
    { name: "Cloud Architecture", group: "Infrastructure", evidenceIds: [] },
  ],
  extras: [],
  screening: {
    rightToWork: "Yes",
    noticePeriod: "Immediate",
    salaryMin: 120000,
    salaryCurrency: "USD",
    relocate: false,
    remote: "hybrid",
    visaNeeded: false,
    custom: [],
  },
  completeness: 95,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const RESUME_SWITCHER_OPTIONS = [
  { value: "cv_master_base", label: "Standard Professional Resume", badge: "Master · 95", dotColor: "bg-emerald-400", description: "100% ATS Parser Safe · Executive Gold Standard" },
  { value: "cv_fintech_lead", label: "FinTech Scaleup Tech Lead", badge: "92% Fit", dotColor: "bg-blue-400", description: "Tailored with cloud reconciliation metrics" },
  { value: "cv_cloud_architect", label: "Staff Cloud Systems Architect", badge: "88% Fit", dotColor: "bg-purple-400", description: "Targeted on AWS & high-uptime systems" },
  { value: "cv_exec_lead", label: "Engineering Director / VP", badge: "Exec 94%", dotColor: "bg-amber-400", description: "People leadership, budgeting & OKR focus" },
];

const TEMPLATE_OPTIONS = [
  { value: "standard", label: "Standard (1-Col ATS)", badge: "100% ATS", dotColor: "bg-blue-400", description: "Highest parse rate across Workday, Greenhouse & Ashby" },
  { value: "compact", label: "Compact Technical", badge: "Engineering", dotColor: "bg-emerald-400", description: "Dense layout for seniors with 5+ years experience" },
  { value: "executive", label: "Executive Leadership", badge: "Leadership", dotColor: "bg-purple-400", description: "Clean serif header with prominent career summary" },
  { value: "graduate", label: "Graduate / Early Career", badge: "Entry-Level", dotColor: "bg-amber-400", description: "Education & project sections emphasized first" },
];

const DOWNLOAD_OPTIONS = [
  { value: "pdf-ats", label: "Download ATS PDF", badge: "Recommended", dotColor: "bg-emerald-400", description: "Standard single-page vector PDF optimized for ATS parsers" },
  { value: "pdf-print", label: "Print / Save as PDF", badge: "Vector Print", dotColor: "bg-blue-400", description: "High-resolution clean vector print with custom margins" },
  { value: "txt", label: "Export Plain Text (.txt)", badge: "Raw ATS", dotColor: "bg-zinc-400", description: "Unformatted text for web forms & parse audits" },
  { value: "json", label: "Export Candidate JSON (.json)", badge: "Full Backup", dotColor: "bg-purple-400", description: "Complete machine-readable JSON candidate file" },
];

const FONT_OPTIONS = [
  { value: "merriweather", label: "Merriweather", badge: "Serif", description: "Classic serif with high editorial readability" },
  { value: "inter", label: "Inter (Sans)", badge: "Tech Modern", description: "Silicon Valley standard clean geometric sans-serif" },
  { value: "garamond", label: "EB Garamond", badge: "Executive", description: "Refined executive serif for leadership & finance" },
  { value: "calibri", label: "Calibri", badge: "Corporate", description: "Microsoft & Corporate ATS universal default" },
  { value: "roboto", label: "Roboto", badge: "Clean Sans", description: "Crisp modern sans engineered for maximum screen clarity" },
  { value: "lora", label: "Lora", badge: "Contemporary", description: "Contemporary serif with balanced proportions" },
  { value: "arial", label: "Arial", badge: "Universal", description: "Universal clean sans · High ATS compatibility" },
];

const LINE_SPACING_OPTIONS = [
  { value: "1.15", label: "1.15 Tight", badge: "1-Page Fit", description: "Maximum density to guarantee 1-page fit" },
  { value: "1.3", label: "1.30 Compact", badge: "Balanced", description: "Compact professional spacing" },
  { value: "1.5", label: "1.50 Normal", badge: "Recommended", description: "Optimal readability recommended by recruiters" },
  { value: "1.75", label: "1.75 Relaxed", badge: "Spacious", description: "Generous whitespace for executive format" },
  { value: "2.0", label: "2.00 Double", badge: "Draft", description: "Draft review & proofreading layout" },
];

const MARGIN_OPTIONS = [
  { value: "compact", label: "0.75\" Compact", badge: "Max Area", description: "0.75in margins to maximize text area" },
  { value: "normal", label: "1.00\" Standard", badge: "ATS Standard", description: "1.00in balanced margin on all sides" },
  { value: "medium", label: "1.25\" Medium", badge: "Clean", description: "1.25in clean spacious margins" },
  { value: "spacious", label: "1.50\" Spacious", badge: "Executive", description: "1.50in breathable executive layout" },
];

const PAGE_SIZE_OPTIONS = [
  { value: "letter", label: "Letter (US)", badge: "8.5 × 11 in", description: "Standard for US, Canada, and multinational portals" },
  { value: "a4", label: "A4 (UK & Global)", badge: "210 × 297 mm", description: "Standard for UK, Europe, Commonwealth & global roles" },
  { value: "legal", label: "Legal (Extended)", badge: "8.5 × 14 in", description: "Extended length format" },
];

const ACCENT_COLOR_OPTIONS = [
  { value: "#1e293b", label: "Classic Slate", dotColor: "bg-slate-700", badge: "Neutral", description: "Executive monochrome slate" },
  { value: "#1e3a8a", label: "Navy Blue", dotColor: "bg-blue-900", badge: "Corporate", description: "Traditional corporate finance & legal" },
  { value: "#065f46", label: "Forest Emerald", dotColor: "bg-emerald-800", badge: "Fintech", description: "Fintech, biotech & sustainability" },
  { value: "#4c1d95", label: "Royal Purple", dotColor: "bg-purple-900", badge: "Tech Lead", description: "Modern product & engineering leadership" },
  { value: "#831843", label: "Burgundy Wine", dotColor: "bg-pink-900", badge: "Executive", description: "Prestigious executive & consulting" },
  { value: "#09090b", label: "Jet Onyx", dotColor: "bg-zinc-950", badge: "100% ATS", description: "Pure dark monochrome ATS safe" },
  { value: "#2563eb", label: "Cobalt Blue", dotColor: "bg-blue-600", badge: "Modern", description: "High-contrast modern tech blue" },
  { value: "#b45309", label: "Warm Amber", dotColor: "bg-amber-700", badge: "Product", description: "Product management & design leadership" },
  { value: "#be123c", label: "Crimson Red", dotColor: "bg-rose-700", badge: "Bold", description: "Bold visionary tech leadership" },
];

export default function CvBuilderEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [cv, setCv] = useState<Cv | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ATS Subnavigation Section Tabs (Screenshot 1)
  const [activeTab, setActiveTab] = useState<
    "contact" | "experience" | "project" | "education" | "skills" | "summary"
  >("experience");

  // ATS Formatting Controls (Screenshot 1)
  const [fontFamily, setFontFamily] = useState<string>("merriweather");
  const [fontSize, setFontSize] = useState<number>(11);
  const [lineSpacing, setLineSpacing] = useState<string>("1.5");
  const [marginSpacing, setMarginSpacing] = useState<string>("normal");
  const [pageSize, setPageSize] = useState<string>("letter");
  const [accentColor, setAccentColor] = useState<string>("#1e293b");
  const [templateId, setTemplateId] = useState<string>("standard");
  const [showDividers, setShowDividers] = useState<boolean>(true);
  const [showProfilePic, setShowProfilePic] = useState<boolean>(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // ATS Score Drawer (Screenshot 1, 3)
  const [exploreScoreOpen, setExploreScoreOpen] = useState(false);

  // AI Keyword Targeting (Screenshot 1, 4)
  const MISSING_KEYWORDS = [
    "Systems Design",
    "Distributed Caching",
    "Kubernetes & Cloud",
    "Microservices Architecture",
    "API Gateway Performance",
  ];
  const [keywordIndex, setKeywordIndex] = useState(0);
  const targetKeyword = MISSING_KEYWORDS[keywordIndex % MISSING_KEYWORDS.length];
  const [keywordAdded, setKeywordAdded] = useState(false);

  // "Tell me what you did" bullet generator modal
  const [showBulletModal, setShowBulletModal] = useState(false);
  const [bulletNotes, setBulletNotes] = useState("");
  const [bulletRole, setBulletRole] = useState("role-1");
  const [generatingBullet, setGeneratingBullet] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleTemplateChange = (tmpl: string) => {
    setTemplateId(tmpl);
    if (cv) {
      const validTemplate: "standard" | "graduate" = tmpl === "graduate" ? "graduate" : "standard";
      handleSaveCv({ ...cv, templateId: validTemplate });
      showToast(`Applied ${tmpl.toUpperCase()} template!`);
    }
  };

  const handleSwitchCv = (cvId: string) => {
    const selected = RESUME_SWITCHER_OPTIONS.find((r) => r.value === cvId);
    if (selected && cv) {
      setCv({ ...cv, name: selected.label });
      showToast(`Switched to: ${selected.label}`);
    }
  };

  const handleExportFormat = (format: string) => {
    if (format === "pdf-ats" || format === "pdf-print") {
      handleExport();
    } else if (format === "txt") {
      const bulletsText = (cv?.bullets || [])
        .filter((b) => b.visible !== false)
        .map((b) => `• ${b.text}`)
        .join("\n");
      const plainText = `${cv?.name || "Resume"}\n${profile?.headline || ""}\n\nSUMMARY:\n${profile?.summary || ""}\n\nEXPERIENCE:\n${bulletsText}\n\nSKILLS:\n${(profile?.skills || []).map((s) => s.name).join(", ")}`;
      const blob = new Blob([plainText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cv?.name || "Resume"}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Exported plain text (.txt) for ATS audits!");
    } else if (format === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ cv, profile }, null, 2));
      const a = document.createElement("a");
      a.href = dataStr;
      a.download = `${cv?.name || "Resume"}-backup.json`;
      a.click();
      showToast("Exported JSON candidate backup!");
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/apply/cvs/${id}`);
        if (!res.ok) throw new Error("Failed to fetch CV");
        const data = await res.json();
        if (data.cv) {
          setCv(data.cv);
          setProfile(data.profile || DEFAULT_EDITOR_PROFILE);
        } else {
          throw new Error("CV object missing");
        }
      } catch (err) {
        console.warn("Using default CV state:", err);
        setCv({ ...DEFAULT_EDITOR_CV, id });
        setProfile(DEFAULT_EDITOR_PROFILE);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSaveCv = async (updatedCv: Cv) => {
    setCv(updatedCv);
    setSaving(true);
    try {
      const res = await fetch(`/api/apply/cvs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCv),
      });
      const data = await res.json();
      if (res.ok) {
        setCv(data);
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 2000);
      }
    } catch {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const toggleBulletVisibility = (bulletId: string) => {
    if (!cv) return;
    const updatedBullets = (cv.bullets || []).map((b) =>
      b.id === bulletId ? { ...b, visible: b.visible === false ? true : false } : b
    );
    handleSaveCv({ ...cv, bullets: updatedBullets });
  };

  const handleAddKeywordBullet = () => {
    if (!cv) return;
    const newBullet = {
      id: `b-kw-${Date.now()}`,
      roleId: "role-1",
      text: `Spearheaded ${targetKeyword} practices across core microservices, increasing architecture resilience and scaling throughput by 35%.`,
      evidenceIds: [],
      origin: "person" as const,
      visible: true,
    };
    const updated = { ...cv, bullets: [...(cv.bullets || []), newBullet] };
    handleSaveCv(updated);
    setKeywordAdded(true);
    showToast(`✓ Added bullet with keyword "${targetKeyword}"!`);
    setTimeout(() => {
      setKeywordIndex((idx) => idx + 1);
      setKeywordAdded(false);
    }, 1500);
  };

  const handleGenerateBullet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletNotes.trim() || !cv) return;
    setGeneratingBullet(true);
    try {
      const res = await fetch(`/api/apply/cvs/${id}/bullets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: bulletNotes, roleId: bulletRole }),
      });
      const data = await res.json();
      if (res.ok && data.cv) {
        setCv(data.cv);
        setBulletNotes("");
        setShowBulletModal(false);
        showToast("✓ Bullet generated from verified facts!");
        return;
      }
      const newBullet = {
        id: `b-${Date.now()}`,
        roleId: bulletRole,
        text: bulletNotes.trim(),
        evidenceIds: [],
        origin: "person" as const,
        visible: true,
      };
      const updatedBullets = [...(cv.bullets || []), newBullet];
      handleSaveCv({ ...cv, bullets: updatedBullets });
      setBulletNotes("");
      setShowBulletModal(false);
      showToast("✓ Bullet created!");
    } catch {
      const newBullet = {
        id: `b-${Date.now()}`,
        roleId: bulletRole,
        text: bulletNotes.trim(),
        evidenceIds: [],
        origin: "person" as const,
        visible: true,
      };
      handleSaveCv({ ...cv, bullets: [...(cv.bullets || []), newBullet] });
      setBulletNotes("");
      setShowBulletModal(false);
      showToast("✓ Bullet created!");
    } finally {
      setGeneratingBullet(false);
    }
  };

  const handleAutoAdjust = () => {
    setFontSize(10.5);
    setLineSpacing("1.5");
    setMarginSpacing("normal");
    showToast("✦ Auto-adjusted margins and typography for optimal 1-page ATS fit!");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("🔗 Resume link copied to clipboard!");
    }
  };

  const handleExport = () => {
    window.print();
  };

  if (loading || !cv) {
    return (
      <div className="flex h-96 items-center justify-center text-muted">
        <div className="space-y-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue border-t-transparent mx-auto" />
          <p className="text-xs text-muted">Loading ATS CV Builder...</p>
        </div>
      </div>
    );
  }

  const activeBullets = (cv.bullets || []).filter((b) => b.visible !== false);
  const scoreTotal = cv.score?.total || 95;

  const displayRoles =
    profile?.roles && profile.roles.length > 0
      ? profile.roles
      : [
          {
            id: "role-1",
            title: "CEO & Founder",
            employer: "Hakkiri Studio",
            location: "Seoul, South Korea",
            start: "August 2015",
            end: "Present",
            current: true,
            bullets: [],
          },
        ];

  // Font family styles for paper
  const fontClass =
    fontFamily === "merriweather" || fontFamily === "garamond" || fontFamily === "lora"
      ? "font-serif"
      : fontFamily === "roboto"
      ? "font-sans tracking-wide"
      : "font-sans";

  return (
    <div className="space-y-5 animate-fadeIn w-full max-w-none pb-16 print:space-y-0 print:pb-0 print:m-0 print:p-0">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 border border-slate-700/80 px-4 py-3 text-sm font-medium text-white shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toast}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. ATS TOP SUBNAV TABS (Screenshot 1)                               */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-line bg-panel p-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 print:hidden print-hide">
        {/* Left: Resume Selector & Section Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Professional Resume Switcher Dropdown */}
          <div className="w-56 sm:w-64 mr-1">
            <CustomSelect
              value={cv.id || "cv_master_base"}
              onChange={(val) => handleSwitchCv(val)}
              options={RESUME_SWITCHER_OPTIONS}
              size="sm"
              triggerClassName="rounded-xl min-h-[34px] py-1 px-3 font-extrabold text-xs bg-panel-2 border-line text-ink"
            />
          </div>

          {[
            { id: "contact", label: "CONTACT" },
            { id: "experience", label: "EXPERIENCE" },
            { id: "project", label: "PROJECT" },
            { id: "education", label: "EDUCATION" },
            { id: "skills", label: "SKILLS" },
            { id: "summary", label: "SUMMARY" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={clsx(
                "rounded-xl px-3 py-1.5 text-xs font-extrabold tracking-wider transition-all",
                activeTab === tab.id
                  ? "bg-blue text-white shadow-sm"
                  : "text-muted hover:text-ink hover:bg-panel-2"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl bg-gradient-to-r from-blue to-indigo-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md hover:brightness-110 active:scale-95 transition"
          >
            FINISH UP & PREVIEW
          </button>
          <Link
            href="/apply/applications"
            className="rounded-xl border border-line bg-panel-2 px-3 py-1.5 text-xs font-bold text-muted hover:text-ink hover:bg-line transition"
          >
            AI COVER LETTER
          </Link>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. ATS DOCUMENT ACTION TOOLBAR & FORMATTING BAR (Screenshot 1)     */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-line bg-panel p-3 shadow-md flex flex-wrap items-center justify-between gap-3 print:hidden print-hide">
        {/* Quick Document Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoAdjust}
            className="rounded-xl border border-line bg-panel-2 px-3 py-1.5 text-xs font-bold text-ink hover:bg-line transition flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Auto-adjust margins and spacing for 1-page fit"
          >
            <span>✦</span>
            <span>AUTO-ADJUST</span>
          </button>

          {/* Template Switcher Dropdown */}
          <div className="w-52">
            <CustomSelect
              value={templateId}
              onChange={(val) => handleTemplateChange(val)}
              options={TEMPLATE_OPTIONS}
              size="sm"
              triggerClassName="rounded-xl min-h-[32px] py-1 px-2.5 font-bold text-xs"
            />
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="rounded-xl border border-line bg-panel-2 px-3 py-1.5 text-xs font-bold text-muted hover:text-ink hover:bg-line transition flex items-center gap-1.5"
          >
            <span>🔗</span>
            <span>SHARE</span>
          </button>

          {/* Download & Export Formats Dropdown */}
          <div className="w-48">
            <CustomSelect
              value="pdf-ats"
              onChange={(val) => handleExportFormat(val)}
              options={DOWNLOAD_OPTIONS}
              size="sm"
              triggerClassName="rounded-xl min-h-[32px] py-1 px-3 font-bold text-xs bg-blue text-white border-blue hover:bg-blue-600 shadow-sm"
            />
          </div>
        </div>

        {/* Formatting Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Font Selector */}
          <div className="w-44">
            <CustomSelect
              value={fontFamily}
              onChange={(val) => setFontFamily(val)}
              options={FONT_OPTIONS}
              size="sm"
              triggerClassName="rounded-xl min-h-[32px] py-1 px-2.5 font-bold text-xs"
            />
          </div>

          {/* Font Size Increment */}
          <div className="flex items-center rounded-xl bg-panel-2 border border-line px-2 py-1 gap-1.5 h-[32px]">
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.max(9, s - 0.5))}
              className="text-muted hover:text-ink font-bold px-1"
            >
              –
            </button>
            <span className="font-mono text-ink font-bold text-xs">{fontSize}</span>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.min(14, s + 0.5))}
              className="text-muted hover:text-ink font-bold px-1"
            >
              +
            </button>
          </div>

          {/* Line Spacing */}
          <div className="w-36">
            <CustomSelect
              value={lineSpacing}
              onChange={(val) => setLineSpacing(val)}
              options={LINE_SPACING_OPTIONS}
              size="sm"
              triggerClassName="rounded-xl min-h-[32px] py-1 px-2.5 font-bold text-xs"
            />
          </div>

          {/* Margins */}
          <div className="w-36">
            <CustomSelect
              value={marginSpacing}
              onChange={(val) => setMarginSpacing(val)}
              options={MARGIN_OPTIONS}
              size="sm"
              triggerClassName="rounded-xl min-h-[32px] py-1 px-2.5 font-bold text-xs"
            />
          </div>

          {/* Page Format */}
          <div className="w-36">
            <CustomSelect
              value={pageSize}
              onChange={(val) => setPageSize(val)}
              options={PAGE_SIZE_OPTIONS}
              size="sm"
              triggerClassName="rounded-xl min-h-[32px] py-1 px-2.5 font-bold text-xs"
            />
          </div>

          {/* Accent Color */}
          <div className="w-40">
            <CustomSelect
              value={accentColor}
              onChange={(val) => setAccentColor(val)}
              options={ACCENT_COLOR_OPTIONS}
              size="sm"
              triggerClassName="rounded-xl min-h-[32px] py-1 px-2.5 font-bold text-xs"
            />
          </div>

          {/* Dividers Toggle */}
          <button
            type="button"
            onClick={() => setShowDividers(!showDividers)}
            className={clsx(
              "rounded-xl px-2.5 py-1 text-xs font-bold border transition",
              showDividers
                ? "bg-blue/15 text-blue border-blue/30"
                : "bg-panel-2 text-muted border-line"
            )}
          >
            {showDividers ? "Dividers ON" : "Dividers OFF"}
          </button>

          {/* Profile Photo Toggle & Upload Input */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowProfilePic(!showProfilePic)}
              className={clsx(
                "rounded-xl px-2.5 py-1 text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer",
                showProfilePic
                  ? "bg-blue/15 text-blue border-blue/30"
                  : "bg-panel-2 text-muted border-line"
              )}
              title="Toggle profile photo on CV header"
            >
              <span>👤</span>
              <span>{showProfilePic ? "Photo ON" : "Photo OFF"}</span>
            </button>

            {showProfilePic && (
              <label
                htmlFor="builder-photo-upload"
                className="rounded-xl px-2.5 py-1 text-xs font-bold border border-line bg-panel-2 hover:bg-line text-blue-soft transition flex items-center gap-1 cursor-pointer animate-fadeIn"
                title="Upload custom photo"
              >
                <span>📷</span>
                <span>{userPhoto ? "Change Pic" : "Upload Your Pic"}</span>
              </label>
            )}
            <input
              id="builder-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setUserPhoto(ev.target?.result as string);
                    setShowProfilePic(true);
                    showToast("✓ Custom profile photo applied to CV!");
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. 3-COLUMN ATS WORKSPACE: EDITOR | ATS PAPER | ATS SCORE + TARGET */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full print:block print:w-full print:m-0 print:p-0">
        {/* Left Column: Section & Bullet Editor (4 cols) */}
        <div className="xl:col-span-4 space-y-4 print:hidden print-hide">
          <div className="rounded-3xl border border-line bg-panel p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-ink">
                  {activeTab.toUpperCase()} SECTION CONTROLS
                </h3>
                <span className="text-[11px] text-muted">
                  Curate active bullets strictly grounded in verified facts
                </span>
              </div>
            </div>

            {/* Summary Editor */}
            {activeTab === "summary" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink">Executive Summary</label>
                  <span className="text-[10px] text-muted font-mono">Live Sync</span>
                </div>
                <textarea
                  rows={4}
                  value={cv.sections?.find((s) => s.type === "summary")?.text || ""}
                  onChange={(e) => {
                    const updatedSections = (cv.sections || []).map((s) =>
                      s.type === "summary" ? { ...s, text: e.target.value } : s
                    );
                    setCv({ ...cv, sections: updatedSections });
                  }}
                  onBlur={() => handleSaveCv(cv)}
                  className="w-full rounded-2xl border border-line bg-panel-2 p-3 text-xs text-ink focus:border-blue focus:outline-none leading-relaxed"
                />
              </div>
            )}

            {/* Contact Details */}
            {activeTab === "contact" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile?.contact.name || ""}
                    onChange={(e) =>
                      profile && setProfile({ ...profile, contact: { ...profile.contact, name: e.target.value } })
                    }
                    className="w-full rounded-xl border border-line bg-panel-2 p-2.5 text-xs text-ink focus:border-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Email</label>
                  <input
                    type="email"
                    value={profile?.contact.email || ""}
                    onChange={(e) =>
                      profile && setProfile({ ...profile, contact: { ...profile.contact, email: e.target.value } })
                    }
                    className="w-full rounded-xl border border-line bg-panel-2 p-2.5 text-xs text-ink focus:border-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Phone & Location</label>
                  <input
                    type="text"
                    value={`${profile?.contact.phone || ""} • ${profile?.contact.location || ""}`}
                    disabled
                    className="w-full rounded-xl border border-line bg-panel-2/50 p-2.5 text-xs text-muted"
                  />
                </div>
              </div>
            )}

            {/* Experience Bullets Editor */}
            {activeTab === "experience" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink">
                    Experience Bullets ({activeBullets.length} of {(cv.bullets || []).length} active)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowBulletModal(true)}
                    className="text-[11px] font-bold text-blue hover:text-blue-soft transition"
                  >
                    + Add Bullet
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {(cv.bullets || []).map((b) => (
                    <div
                      key={b.id}
                      className={clsx(
                        "rounded-2xl border p-3 text-xs transition-all duration-200",
                        b.visible !== false
                          ? "border-line bg-panel-2 text-ink shadow-sm"
                          : "border-line/40 bg-booth/40 text-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="flex-1 font-sans leading-relaxed text-xs">{b.text}</p>
                        <button
                          type="button"
                          onClick={() => toggleBulletVisibility(b.id)}
                          className={clsx(
                            "text-[10px] font-extrabold px-2.5 py-1 rounded-full transition flex-shrink-0",
                            b.visible !== false
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-panel text-muted border border-line"
                          )}
                        >
                          {b.visible !== false ? "Active" : "Hidden"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-line/40 text-[10px] text-muted">
                        <span>Origin: {b.origin}</span>
                        {b.evidenceIds && b.evidenceIds.length > 0 && (
                          <span className="text-blue font-semibold">✓ Grounded in Evidence</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Education tabs fallback view */}
            {(activeTab === "skills" || activeTab === "education" || activeTab === "project") && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-400 leading-relaxed">
                  Managing {activeTab} section items. Items are synced automatically with your verified Evidence Bank.
                </p>
                <div className="p-3 rounded-2xl bg-panel-2 border border-line">
                  <span className="text-xs font-bold text-ink block mb-1">Active {activeTab} entries:</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(profile?.skills || []).map((s) => (
                      <span key={s.name} className="px-2.5 py-1 rounded-lg bg-panel border border-line text-[11px] text-slate-300">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Live Formatted ATS Paper (5 cols) */}
        <div className="xl:col-span-5 print:w-full space-y-3 print:space-y-0 print:m-0 print:p-0">
          <div className="flex items-center justify-between px-2 text-xs text-muted print:hidden print-hide">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-ink">ATS Paper Preview</span>
              <span className="text-[10px] bg-panel-2 px-2.5 py-0.5 rounded-full border border-line font-mono">
                {pageSize.toUpperCase()} · 100% Readable
              </span>
            </div>
            <button
              onClick={handleExport}
              className="font-bold text-blue hover:text-blue-soft transition flex items-center gap-1 cursor-pointer"
            >
              <span>Export PDF / Print</span>
              <span>↗</span>
            </button>
          </div>

          <div
            className={clsx(
              "rounded-3xl border border-line bg-booth/90 p-4 sm:p-6 shadow-2xl flex justify-center backdrop-blur-sm min-h-[820px] print:rounded-none print:border-none print:bg-white print:p-0 print:m-0 print:shadow-none print:backdrop-blur-none print:min-h-0 print:block"
            )}
          >
            <div
              className={clsx(
                "w-full rounded-2xl bg-white text-zinc-900 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] leading-relaxed select-none print:shadow-none print:rounded-none print:p-0 print:m-0 print:max-w-full print-sheet",
                fontClass
              )}
              style={{
                fontSize: `${fontSize}pt`,
                lineHeight: lineSpacing,
              }}
            >
              {/* CV Header */}
              <div className="flex items-center justify-center gap-4 pb-4 mb-4">
                {showProfilePic && (
                  <div
                    onClick={() => document.getElementById("builder-photo-upload")?.click()}
                    className="relative w-16 h-16 shrink-0 rounded-full overflow-hidden shadow-md ring-2 ring-offset-2 transition-all duration-300 animate-fadeIn cursor-pointer group"
                    style={{
                      outline: `2.5px solid ${accentColor}`,
                      outlineOffset: "2px",
                    }}
                    title="Click to upload your own picture"
                  >
                    <img
                      src={userPhoto || "/sam.jpg"}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition">
                      📷 Change
                    </div>
                  </div>
                )}
                <div className={clsx(showProfilePic ? "text-left" : "text-center")}>
                  <h1
                    className="text-2xl font-black tracking-tight"
                    style={{ color: accentColor }}
                  >
                    {profile?.contact.name || "Charles Bloomberg"}
                  </h1>
                  <div className="text-[10.5px] text-zinc-600 mt-1 space-x-2 font-sans">
                    <span>{profile?.contact.location || "Seoul, South Korea"}</span>
                    <span>•</span>
                    <span>{profile?.contact.email || "charlesbloomberg@gmail.com"}</span>
                    <span>•</span>
                    <span>{profile?.contact.phone || "(621) 799-5548"}</span>
                    <span>•</span>
                    <span>in/bloomberg</span>
                  </div>
                </div>
              </div>

              {showDividers && <hr className="border-zinc-300 my-3" />}

              {/* Summary */}
              <div className="mb-4">
                <h2
                  className="text-[11px] font-extrabold uppercase tracking-wider border-b border-zinc-300 pb-0.5 mb-1.5"
                  style={{ color: accentColor }}
                >
                  SUMMARY
                </h2>
                <p className="text-[10.5px] text-zinc-800 leading-relaxed">
                  {cv.sections?.find((s) => s.type === "summary")?.text || profile?.summary}
                </p>
              </div>

              {showDividers && <hr className="border-zinc-300 my-3" />}

              {/* Experience */}
              <div className="mb-4">
                <h2
                  className="text-[11px] font-extrabold uppercase tracking-wider border-b border-zinc-300 pb-0.5 mb-2"
                  style={{ color: accentColor }}
                >
                  EXPERIENCE
                </h2>
                {displayRoles.map((role) => (
                  <div key={role.id} className="mb-3.5">
                    <div className="flex justify-between font-bold text-[11px]">
                      <div>
                        <span className="text-zinc-950 font-black">{role.title}</span>
                        <div className="text-zinc-700 font-normal italic">{role.employer}</div>
                      </div>
                      <div className="text-zinc-600 text-[10px] font-mono text-right">
                        {role.start} – {role.end}
                        <div className="font-normal text-zinc-500">{role.location}</div>
                      </div>
                    </div>

                    <ul className="list-disc list-inside mt-1.5 space-y-1.5 text-[10px] text-zinc-800 leading-normal">
                      {activeBullets
                        .filter((b) => b.roleId === role.id || activeBullets.length <= 4)
                        .map((b) => (
                          <li key={b.id} className="leading-normal">
                            {b.text.includes("machine learning") ? (
                              <>
                                Architected the{" "}
                                <span className="bg-emerald-100 text-emerald-900 px-1 rounded font-semibold underline decoration-emerald-500">
                                  machine learning
                                </span>{" "}
                                models behind Hakkiri&apos;s AI resume writer, lifting quality scores 32% across 4.5M+ users.
                              </>
                            ) : (
                              b.text
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>

              {showDividers && <hr className="border-zinc-300 my-3" />}

              {/* Education */}
              <div className="mb-4">
                <h2
                  className="text-[11px] font-extrabold uppercase tracking-wider border-b border-zinc-300 pb-0.5 mb-1.5"
                  style={{ color: accentColor }}
                >
                  EDUCATION
                </h2>
                {(profile?.education || [
                  {
                    id: "edu-1",
                    institution: "University of Wisconsin - Madison",
                    qualification: "BSc Economics",
                    grade: "First Class Honours",
                    start: "2011",
                    end: "2015",
                  },
                ]).map((edu) => (
                  <div key={edu.id} className="flex justify-between text-[10.5px] mb-1">
                    <div>
                      <span className="font-bold">{edu.qualification}</span>, {edu.institution}
                      {edu.grade && <span className="text-zinc-600"> ({edu.grade})</span>}
                    </div>
                    <div className="text-zinc-600 text-[10px] font-mono">
                      {edu.start} – {edu.end}
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div>
                <h2
                  className="text-[11px] font-extrabold uppercase tracking-wider border-b border-zinc-300 pb-0.5 mb-1.5"
                  style={{ color: accentColor }}
                >
                  SKILLS & COMPETENCIES
                </h2>
                <p className="text-[10px] text-zinc-800 leading-relaxed font-sans">
                  {(profile?.skills || []).map((s) => s.name).join(" • ") ||
                    "Python • Machine Learning • Systems Design • Cloud Architecture • MongoDB • Leadership"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: ATS Score Gauge & AI Keyword Targeting (3 cols, Screenshot 1) */}
        <div className="xl:col-span-3 space-y-4 print:hidden print-hide">
          {/* Card 1: ATS Score Speedometer Gauge */}
          <div className="rounded-3xl border border-line bg-panel p-5 shadow-xl space-y-4">
            <div className="text-center">
              <div className="relative w-36 h-20 mx-auto overflow-hidden">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="8"
                  />
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="url(#hakkiriEditorScoreGrad)"
                    strokeWidth="8"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 * (1 - scoreTotal / 100)}
                  />
                  <defs>
                    <linearGradient id="hakkiriEditorScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="35%" stopColor="#f59e0b" />
                      <stop offset="70%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                  <span className="text-2xl font-black text-white">{scoreTotal}</span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {scoreTotal >= 85 ? "Excellent" : "Needs Work"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-muted px-4 mt-0.5 font-mono">
                <span>0</span>
                <span>100</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExploreScoreOpen(!exploreScoreOpen)}
              className="w-full rounded-xl border border-line bg-panel-2 py-2 text-xs font-bold text-ink hover:bg-line transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>✦</span>
              <span>EXPLORE YOUR ATS SCORE</span>
              <span className="text-xs">{exploreScoreOpen ? "▲" : "▼"}</span>
            </button>

            {/* Expandable Score Breakdown (Screenshot 3) */}
            {exploreScoreOpen && (
              <div className="border-t border-line/60 pt-3 space-y-2 text-xs animate-fadeIn">
                {[
                  { label: "Content", score: 95, color: "text-emerald-400 bg-emerald-500/20" },
                  { label: "Format", score: 92, color: "text-emerald-400 bg-emerald-500/20" },
                  { label: "Optimization", score: 88, color: "text-blue bg-blue/20" },
                  { label: "Best Practices", score: 95, color: "text-emerald-400 bg-emerald-500/20" },
                  { label: "Application Ready", score: 90, color: "text-emerald-400 bg-emerald-500/20" },
                ].map((cat) => (
                  <div key={cat.label} className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className={clsx("h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold", cat.color)}>
                        {cat.score}
                      </span>
                      <span>{cat.label}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">Passed</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: AI Keyword Targeting (Screenshot 1, 4) */}
          <div className="rounded-3xl border border-line bg-panel p-5 shadow-xl space-y-3.5">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink">
                AI Keyword Targeting
              </h4>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                Is this missing keyword relevant to your experience?
              </p>
            </div>

            <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 text-center">
              <span className="text-xs font-extrabold text-teal-300">
                {targetKeyword}
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAddKeywordBullet}
                className="w-full rounded-xl bg-blue hover:bg-blue-600 py-2.5 text-xs font-extrabold text-white shadow-md shadow-blue/20 transition flex items-center justify-center gap-1.5"
              >
                <span>👍</span>
                <span>{keywordAdded ? "BULLET ADDED!" : "YES, ADD BULLET POINT"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setKeywordIndex((idx) => idx + 1);
                  setKeywordAdded(false);
                  showToast("Skipped to next missing keyword!");
                }}
                className="w-full rounded-xl border border-line bg-panel-2 py-2 text-xs font-bold text-muted hover:text-ink transition cursor-pointer"
              >
                👎 SKIP, NOT RELEVANT
              </button>
            </div>

            <div className="border-t border-line/60 pt-3 space-y-2">
              <span className="text-[10.5px] text-muted font-medium block">
                Great work! You&apos;re ranking well for these keywords in the job description:
              </span>
              <div className="space-y-1 text-xs">
                {["Python", "Machine Learning", "Cloud Architecture"].map((kw) => (
                  <div key={kw} className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span>{kw}</span>
                    <span className="text-emerald-400 text-xs font-bold">✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bullet Writer Modal ("Tell Me What You Did") */}
      {showBulletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-extrabold text-ink">
                  &quot;Tell Me What You Did&quot; Bullet Generator
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Type what happened. The AI shapes quantified action bullets strictly from your facts.
                </p>
              </div>
              <button
                onClick={() => setShowBulletModal(false)}
                className="text-muted hover:text-ink text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateBullet} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">Select Role</label>
                <CustomSelect
                  value={bulletRole}
                  onChange={(val) => setBulletRole(val)}
                  options={displayRoles.map((r) => ({
                    value: r.id,
                    label: `${r.title} @ ${r.employer}`,
                    dotColor: "bg-blue",
                  }))}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1.5">
                  What did you achieve? (Include numbers, scale, and outcomes)
                </label>
                <textarea
                  rows={4}
                  value={bulletNotes}
                  onChange={(e) => setBulletNotes(e.target.value)}
                  placeholder="e.g. Architected the machine learning models behind our AI writer, lifting resume quality scores 32% across 4.5M+ users."
                  required
                  className="w-full rounded-2xl border border-line bg-panel-2 p-3.5 text-xs text-ink placeholder:text-muted focus:border-blue focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulletModal(false)}
                  className="rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-xs font-bold text-muted hover:text-ink transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingBullet}
                  className="rounded-xl bg-blue px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-600 transition disabled:opacity-50 shadow-lg shadow-blue/25"
                >
                  {generatingBullet ? "Generating Grounded Bullets..." : "Generate Bullets"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
