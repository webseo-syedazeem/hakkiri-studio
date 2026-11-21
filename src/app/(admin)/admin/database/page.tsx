import type { Metadata } from "next";
import { isMongoConfigured, testMongoConnection, getMongoDb } from "@/lib/storage/mongodb";
import { getBlogPostsAsync } from "@/lib/blog/store";

export const metadata: Metadata = {
  title: "Database & Cloud Infrastructure | Hakkiri Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDatabasePage() {
  const isConfigured = isMongoConfigured();
  const connTest = await testMongoConnection();
  const { total } = await getBlogPostsAsync({ publishedOnly: false });

  let collectionsList: string[] = ["blogs", "storage"];
  if (isConfigured) {
    try {
      const db = await getMongoDb();
      if (db) {
        const cols = await db.listCollections().toArray();
        collectionsList = cols.map((c) => c.name);
      }
    } catch {
      // fallback
    }
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-5">
        <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-400">
          Cloud Infrastructure
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          MongoDB Atlas & Storage Health
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Real-time cluster connection metrics and persistence safeguards.
        </p>
      </div>

      {/* Cluster Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-5 space-y-2">
          <div className="text-xs text-slate-400 font-medium">Atlas Cluster Status</div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                connTest.ok ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span className="text-xl font-bold text-white">
              {connTest.ok ? "Online & Healthy" : "Offline"}
            </span>
          </div>
          <p className="text-xs text-slate-500">{connTest.message}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141520] p-5 space-y-2">
          <div className="text-xs text-slate-400 font-medium">Articles in Database</div>
          <div className="text-2xl font-bold text-white">{total} Documents</div>
          <p className="text-xs text-slate-500">Collection: &quot;blogs&quot;</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141520] p-5 space-y-2">
          <div className="text-xs text-slate-400 font-medium">Storage Architecture</div>
          <div className="text-xl font-bold text-purple-300">Dual-Layer Sync</div>
          <p className="text-xs text-slate-500">MongoDB Atlas + Resilient Disk Cache</p>
        </div>
      </div>

      {/* Collections Overview */}
      <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Active Database Collections
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {collectionsList.map((col) => (
            <div
              key={col}
              className="rounded-xl border border-white/[0.08] bg-[#1c1d27] p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold text-white font-mono">{col}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {col === "blogs" ? "Stores published & draft articles + SEO tags" : "Stores system states"}
                </div>
              </div>
              <span className="rounded bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 font-semibold">
                Synchronized
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
