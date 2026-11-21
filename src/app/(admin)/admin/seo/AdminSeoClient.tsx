"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { BlogPost } from "@/lib/blog/types";
import { analyzeBlogSeo, slugify } from "@/lib/blog/seo";

export function AdminSeoClient({ posts }: { posts: BlogPost[] }) {
  const [testTitle, setTestTitle] = useState("NHS Band 5 Nursing Interview Preparation Guide 2026");
  const [testKeyword, setTestKeyword] = useState("NHS nursing interview");
  const [testDescription, setTestDescription] = useState(
    "Pass your upcoming NHS nursing interview with clinical scenarios, STAR method answers, and 6Cs guidance."
  );
  const [testContent, setTestContent] = useState(
    `Preparing for your **NHS nursing interview** requires an understanding of patient safety and clinical prioritization.\n\n## Clinical Prioritization and SBAR\n\nIn every NHS nursing interview, the panel will ask about clinical emergencies.\n\nAlways explain your actions using "I" instead of "we".`
  );

  const sandboxAnalysis = useMemo(() => {
    return analyzeBlogSeo({
      title: testTitle,
      slug: slugify(testTitle),
      content: testContent,
      excerpt: testDescription,
      seo: {
        focusKeyword: testKeyword,
        metaTitle: testTitle,
        metaDescription: testDescription,
      },
    });
  }, [testTitle, testKeyword, testDescription, testContent]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-5">
        <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-400">
          Executive SEO Suite
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          SEO Health & Google SERP Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Audit live article rankings, test custom keywords, and preview snippets before publishing.
        </p>
      </div>

      {/* Articles SEO Matrix */}
      <div className="rounded-2xl border border-white/10 bg-[#141520] p-5 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Current Live Articles Ranking Audit
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400">
                <th className="py-2 font-semibold">Article Title</th>
                <th className="py-2 font-semibold">Focus Keyword</th>
                <th className="py-2 font-semibold">Density</th>
                <th className="py-2 font-semibold">Score</th>
                <th className="py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {posts.map((post) => {
                const seo = analyzeBlogSeo({
                  title: post.title,
                  slug: post.slug,
                  content: post.content,
                  excerpt: post.excerpt,
                  seo: post.seo,
                });

                return (
                  <tr key={post.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 max-w-xs font-medium text-white truncate">
                      {post.title}
                    </td>
                    <td className="py-3 text-purple-300 font-mono">
                      &quot;{post.seo.focusKeyword || "None"}&quot;
                    </td>
                    <td className="py-3 text-slate-300">
                      {seo.keywordDensity}% ({seo.keywordOccurrences}x)
                    </td>
                    <td className="py-3">
                      <span
                        className={clsx(
                          "rounded-md px-2 py-0.5 text-[10px] font-bold border",
                          seo.score >= 80
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : seo.score >= 60
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        )}
                      >
                        {seo.score}/100 ({seo.grade})
                      </span>
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/admin/blog`}
                        className="text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Edit in Blog Manager &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Interactive Sandbox */}
      <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white">
            🧪 Real-Time Content SEO Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate how a draft will score against Google&apos;s ranking algorithm before saving.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Search Keyword</label>
              <input
                type="text"
                value={testKeyword}
                onChange={(e) => setTestKeyword(e.target.value)}
                className="w-full rounded-xl border border-purple-500/40 bg-[#1c1d27] px-3.5 py-2 text-xs font-semibold text-purple-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Proposed Title</label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Meta Description Snippet</label>
              <textarea
                rows={2}
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#1c1d27] p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Article Content (Markdown)</label>
              <textarea
                rows={8}
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#10111a] p-3 text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#1c1d27] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Sandbox Score</span>
                <span
                  className={clsx(
                    "flex items-center justify-center rounded-xl h-12 w-12 font-black text-lg border",
                    sandboxAnalysis.score >= 80
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  )}
                >
                  {sandboxAnalysis.score}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Rating: <strong className="text-white">{sandboxAnalysis.grade}</strong> • {sandboxAnalysis.wordCount} words
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1c1d27] p-4 space-y-2.5">
              <div className="text-xs font-bold text-white mb-2">Algorithm Checks</div>
              {sandboxAnalysis.checks.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04]">
                  <span className="text-slate-300">{c.label}</span>
                  <span
                    className={clsx(
                      "font-bold uppercase text-[10px] px-1.5 py-0.5 rounded",
                      c.status === "pass" && "text-emerald-400 bg-emerald-500/20",
                      c.status === "warn" && "text-amber-400 bg-amber-500/20",
                      c.status === "fail" && "text-rose-400 bg-rose-500/20"
                    )}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
