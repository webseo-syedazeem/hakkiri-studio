"use client";

import { useState } from "react";
import type { UploadedMedia } from "@/lib/storage/upload";

export function AdminMediaClient({ initialFiles }: { initialFiles: UploadedMedia[] }) {
  const [files, setFiles] = useState<UploadedMedia[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const newMedia: UploadedMedia = {
        id: `upload-${Date.now()}`,
        filename: data.filename,
        contentType: "image/png",
        size: data.size,
        dataUrl: data.url,
        createdAt: new Date().toISOString(),
      };

      setFiles((prev) => [newMedia, ...prev]);
      showToast("✅ Image uploaded from your PC successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      showToast("❌ Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = (url: string, id: string) => {
    if (typeof window !== "undefined") {
      const fullUrl = url.startsWith("http") || url.startsWith("data:") ? url : `${window.location.origin}${url}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      showToast("📋 Image URL copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 border border-slate-700/80 px-4 py-3 text-sm font-medium text-white shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-400">
            Assets & Media
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Media Library & PC Uploads
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Upload images from your computer to use across blogs, authors, and the homepage.
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-95 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>{isUploading ? "Uploading..." : "Upload from PC"}</span>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleUpload}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="rounded-2xl border-2 border-dashed border-white/15 bg-[#141520] p-8 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/20 text-purple-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Upload Images from Computer</p>
          <p className="text-xs text-slate-400 mt-0.5">Supports PNG, JPEG, WebP, SVG, and GIF</p>
        </div>
        <div>
          <label className="inline-block cursor-pointer rounded-xl border border-white/15 bg-[#1c1d27] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-[#252634] transition">
            Browse files on your PC
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleUpload}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* Grid of uploaded images */}
      <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Uploaded Assets ({files.length})
        </h2>

        {files.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No images uploaded yet. Upload your first image above!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="group rounded-xl border border-white/10 bg-[#1c1d27] overflow-hidden flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-sm"
              >
                <div className="h-32 w-full bg-slate-900 overflow-hidden relative">
                  <img src={file.dataUrl} alt={file.filename} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-[11px] font-mono text-slate-300 truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{(file.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(file.dataUrl, file.id)}
                      className="rounded bg-white/10 hover:bg-purple-600 text-slate-200 hover:text-white px-2 py-0.5 font-semibold transition-colors"
                    >
                      {copiedId === file.id ? "Copied!" : "Copy URL"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
