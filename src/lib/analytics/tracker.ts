import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getMongoDb, isMongoConfigured } from "@/lib/storage/mongodb";

export interface AnalyticsEvent {
  id: string;
  path: string;
  referrer: string;
  channel: string;
  userAgent: string;
  device: "mobile" | "desktop" | "tablet";
  visitorId: string;
  timestamp: Date;
  date: string; // YYYY-MM-DD
}

export interface AnalyticsSummary {
  totalPageviews: number;
  uniqueVisitors: number;
  activeNow: number;
  todayPageviews: number;
  todayVisitors: number;
  /** Not measured: null. (They used to be fixed numbers.) */
  avgDurationSeconds: number | null;
  bounceRatePercent: number | null;
  dailyStats: { date: string; visitors: number; pageviews: number; organic: number }[];
  topPages: { path: string; views: number; uniqueVisitors: number }[];
  devices: { device: string; count: number; percentage: number }[];
  channels: { name: string; count: number; percentage: number; color: string }[];
  isLive: boolean;
  dbConnected: boolean;
  lastUpdated: string;
}

function resolveStorageDirectory(): string {
  if (process.env.HAKKIRI_DATA_DIR) {
    return process.env.HAKKIRI_DATA_DIR;
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "hakkiri-data");
  }
  return path.join(process.cwd(), ".hakkiri-data");
}

const LOCAL_DATA_FILE = path.join(resolveStorageDirectory(), "analytics_events.json");

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadLocalEvents(): AnalyticsEvent[] {
  try {
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const raw = fs.readFileSync(LOCAL_DATA_FILE, "utf-8");
      return JSON.parse(raw) as AnalyticsEvent[];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalEvents(events: AnalyticsEvent[]): void {
  try {
    ensureDir(LOCAL_DATA_FILE);
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(events.slice(-5000), null, 2), "utf-8");
  } catch {
    // ignore
  }
}

function parseDevice(userAgent = ""): "mobile" | "desktop" | "tablet" {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function parseChannel(referrer = ""): string {
  const ref = referrer.toLowerCase();
  if (!ref) return "Direct Navigation";
  if (ref.includes("google.")) return "Google Organic Search";
  if (ref.includes("linkedin.")) return "LinkedIn";
  if (ref.includes("reddit.")) return "Reddit & Forums";
  if (ref.includes("t.co") || ref.includes("twitter.") || ref.includes("x.com")) return "Twitter/X";
  if (ref.includes("hakkiri")) return "Internal Referral";
  return "Referral Link";
}

/**
 * Record a real page view into MongoDB Atlas and local disk.
 */
export async function recordPageView(params: {
  path: string;
  referrer?: string;
  userAgent?: string;
  visitorId?: string;
}): Promise<void> {
  const rawPath = String(params.path || "/").split("?")[0].slice(0, 300);
  if (!rawPath.startsWith("/")) return;
  // Ignore static assets, internal next endpoints, and health checks
  if (
    rawPath.startsWith("/_next") ||
    rawPath.startsWith("/api/") ||
    rawPath.includes("favicon") ||
    rawPath.includes(".png") ||
    rawPath.includes(".jpg") ||
    rawPath.includes(".ico") ||
    rawPath.includes(".txt") ||
    rawPath.includes(".xml")
  ) {
    return;
  }

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const device = parseDevice(params.userAgent);
  const channel = parseChannel(params.referrer);
  // A visitor id is the random one the page made for itself; anything else sent in its place is not kept.
  const visitorId = typeof params.visitorId === "string" && /^[A-Za-z0-9_-]{6,64}$/.test(params.visitorId) ? params.visitorId : `v_${Math.random().toString(36).substring(2, 10)}`;

  const event: AnalyticsEvent = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    path: rawPath,
    referrer: String(params.referrer || "").slice(0, 500),
    channel,
    userAgent: String(params.userAgent || "").slice(0, 300),
    device,
    visitorId,
    timestamp: now,
    date: dateStr,
  };

  // 1. Save to MongoDB Atlas collection "analytics_events"
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection("analytics_events");
        await col.insertOne(event);
      }
    } catch (err) {
      console.warn("[analytics] Mongo insert error:", err);
    }
  }

  // 2. Fallback append to local cache
  const local = loadLocalEvents();
  local.push(event);
  saveLocalEvents(local);
}

/**
 * An earlier build wrote about 2,000 made-up page views into the database the
 * first time the dashboard was opened ("a realistic historical foundation"),
 * so every figure on it was partly invented. Nothing is made up any more, and
 * those rows (their ids start with "seed_") are removed the next time the
 * dashboard is opened. Returns how many went.
 */
const isSeeded = (e: { id?: unknown }) => typeof e.id === "string" && e.id.startsWith("seed_");
export async function removeSeededEvents(): Promise<number> {
  let removed = 0;
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) removed += (await db.collection("analytics_events").deleteMany({ id: { $regex: "^seed_" } })).deletedCount ?? 0;
    } catch (err) {
      console.warn("[analytics] couldn't remove the invented events:", err);
    }
  }
  const local = loadLocalEvents();
  const real = local.filter((e) => !isSeeded(e));
  if (real.length !== local.length) {
    saveLocalEvents(real);
    removed += local.length - real.length;
  }
  return removed;
}

/**
 * Get aggregated live analytics summary directly from MongoDB Atlas.
 */
export async function getLiveAnalyticsSummary(): Promise<AnalyticsSummary> {
  const dbConnected = isMongoConfigured();
  await removeSeededEvents();

  let events: AnalyticsEvent[] = [];

  if (dbConnected) {
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection<AnalyticsEvent>("analytics_events");
        events = await col.find({}).sort({ timestamp: -1 }).limit(10000).toArray();
      }
    } catch (err) {
      console.warn("[analytics] Mongo fetch error:", err);
    }
  }

  if (events.length === 0) {
    events = loadLocalEvents();
  }
  events = events.filter((e) => !isSeeded(e));

  const totalPageviews = events.length;
  const uniqueVisitorIds = new Set(events.map((e) => e.visitorId));
  const uniqueVisitors = uniqueVisitorIds.size;

  // Active in the last 15 minutes
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  const activeEvents = events.filter((e) => new Date(e.timestamp) >= fifteenMinsAgo);
  // The real count: nobody browsing is 0, not "1 active".
  const activeNow = new Set(activeEvents.map((e) => e.visitorId)).size;

  // Today
  const todayStr = new Date().toISOString().split("T")[0];
  const todayEvents = events.filter((e) => e.date === todayStr);
  const todayPageviews = todayEvents.length;
  const todayVisitors = new Set(todayEvents.map((e) => e.visitorId)).size;

  // Group by date (past 7 days)
  const daysMap = new Map<string, { visitors: Set<string>; pageviews: number; organic: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    daysMap.set(d, { visitors: new Set(), pageviews: 0, organic: 0 });
  }

  events.forEach((e) => {
    if (daysMap.has(e.date)) {
      const slot = daysMap.get(e.date)!;
      slot.pageviews++;
      slot.visitors.add(e.visitorId);
      if (e.channel === "Google Organic Search") {
        slot.organic++;
      }
    }
  });

  const dailyStats = Array.from(daysMap.entries()).map(([dateStr, slot]) => {
    // Format "18 Nov"
    const dateObj = new Date(dateStr);
    const label = `${dateObj.getDate()} ${dateObj.toLocaleString("en-GB", { month: "short" })}`;
    return {
      date: label,
      visitors: slot.visitors.size,
      pageviews: slot.pageviews,
      organic: slot.organic,
    };
  });

  // Top Pages
  const pageMap = new Map<string, { views: number; visitors: Set<string> }>();
  events.forEach((e) => {
    if (!pageMap.has(e.path)) {
      pageMap.set(e.path, { views: 0, visitors: new Set() });
    }
    const p = pageMap.get(e.path)!;
    p.views++;
    p.visitors.add(e.visitorId);
  });

  const topPages = Array.from(pageMap.entries())
    .map(([pathName, val]) => ({
      path: pathName,
      views: val.views,
      uniqueVisitors: val.visitors.size,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  // Devices
  const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
  events.forEach((e) => {
    deviceCounts[e.device] = (deviceCounts[e.device] || 0) + 1;
  });

  const deviceTotal = totalPageviews || 1;
  const devices = [
    {
      device: "Mobile Phones (iOS & Android)",
      count: deviceCounts.mobile,
      percentage: Math.round((deviceCounts.mobile / deviceTotal) * 100),
    },
    {
      device: "Desktop & Laptops (Mac/Windows)",
      count: deviceCounts.desktop,
      percentage: Math.round((deviceCounts.desktop / deviceTotal) * 100),
    },
    {
      device: "Tablets (iPad/Android Tab)",
      count: deviceCounts.tablet,
      percentage: Math.round((deviceCounts.tablet / deviceTotal) * 100),
    },
  ];

  // Acquisition Channels
  const channelCounts: Record<string, number> = {};
  events.forEach((e) => {
    channelCounts[e.channel] = (channelCounts[e.channel] || 0) + 1;
  });

  const channelColors: Record<string, string> = {
    "Google Organic Search": "bg-emerald-500",
    "Direct Navigation": "bg-purple-500",
    LinkedIn: "bg-blue-500",
    "Reddit & Forums": "bg-amber-500",
    "Internal Referral": "bg-cyan-500",
    "Referral Link": "bg-slate-400",
  };

  const channels = Object.entries(channelCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / deviceTotal) * 100),
      color: channelColors[name] || "bg-indigo-500",
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalPageviews,
    uniqueVisitors,
    activeNow,
    todayPageviews,
    todayVisitors,
    // Neither is measured (only page views are recorded), so neither is given a number.
    avgDurationSeconds: null,
    bounceRatePercent: null,
    dailyStats,
    topPages,
    devices,
    channels,
    isLive: totalPageviews > 0,
    dbConnected,
    lastUpdated: new Date().toLocaleTimeString("en-GB"),
  };
}
