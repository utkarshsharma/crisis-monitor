import { NextRequest, NextResponse } from "next/server";
import { isAuthorized, sendTelegram, formatTextBlock, escapeHtml } from "@/lib/telegram";

export const dynamic = "force-dynamic";

// 2-minute window: slight overlap with the 1-min cron interval
// to avoid missing items right at the boundary.
const WINDOW_MS = 2 * 60 * 1000;

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  datetime: string;
}

interface Earthquake {
  magnitude: number;
  place: string;
  time: number;
  url: string;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const since = now - WINDOW_MS;
  const baseUrl = req.nextUrl.origin;

  try {
    const [newsRes, quakesRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/news`, { signal: AbortSignal.timeout(8000) })
        .then((r) => r.json())
        .then((data) => {
          const articles: NewsArticle[] = data.articles ?? [];
          return articles.filter((a) => {
            const t = new Date(a.datetime).getTime();
            // Include if published recently, or if we can't parse the date (avoid false negatives)
            return isNaN(t) || t >= since;
          });
        }),
      fetch(`${baseUrl}/api/earthquakes`, { signal: AbortSignal.timeout(8000) })
        .then((r) => r.json())
        .then((data) => {
          const quakes: Earthquake[] = data.earthquakes ?? [];
          return quakes.filter((q) => q.time >= since && q.magnitude >= 4.0);
        }),
    ]);

    const recentNews = newsRes.status === "fulfilled" ? newsRes.value : [];
    const recentQuakes = quakesRes.status === "fulfilled" ? quakesRes.value : [];

    // Nothing new — skip silently
    if (recentNews.length === 0 && recentQuakes.length === 0) {
      return NextResponse.json(
        { sent: false, reason: "no_new_content" },
        { status: 200 }
      );
    }

    const blocks: string[] = [];
    blocks.push("🚨 <b>CrisisMonitor — Real-Time Alert</b>");
    blocks.push(`🕐 ${new Date(now).toUTCString()}`);

    if (recentNews.length > 0) {
      blocks.push(
        formatTextBlock(
          "Breaking News",
          recentNews
            .slice(0, 10)
            .map((a) => `• [${escapeHtml(a.source)}] ${escapeHtml(a.title)}\n  ${a.url}`)
        )
      );
    }

    if (recentQuakes.length > 0) {
      blocks.push(
        formatTextBlock(
          "Seismic Alert",
          recentQuakes.map(
            (q) => `• M${q.magnitude.toFixed(1)} — ${escapeHtml(q.place)}\n  ${q.url}`
          )
        )
      );
    }

    await sendTelegram(blocks.join("\n"));

    return NextResponse.json({
      sent: true,
      newsCount: recentNews.length,
      quakeCount: recentQuakes.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Alert cron failed", details: message },
      { status: 500 }
    );
  }
}
