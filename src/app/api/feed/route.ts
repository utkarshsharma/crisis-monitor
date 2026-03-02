import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Public API endpoint for Telegram bots (and other consumers) to poll crisis data.
// Usage: GET /api/feed?channels=news,alerts,earthquakes,rates&format=text

const VALID_CHANNELS = ["news", "alerts", "earthquakes", "rates", "flights"];

function formatTextBlock(title: string, items: string[]): string {
  if (items.length === 0) return "";
  return `\n📌 *${title}*\n${items.join("\n")}\n`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const channelsParam = searchParams.get("channels") || "news,alerts";
    const format = searchParams.get("format") || "json";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    const channels = channelsParam
      .split(",")
      .map((c) => c.trim().toLowerCase())
      .filter((c) => VALID_CHANNELS.includes(c));

    const result: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      channels,
    };

    const textBlocks: string[] = [];
    textBlocks.push("🚨 *CrisisMonitor — Situation Update*");
    textBlocks.push(`🕐 ${new Date().toUTCString()}`);

    // Fetch requested channels in parallel
    const baseUrl = req.nextUrl.origin;

    const fetches: Promise<void>[] = [];

    if (channels.includes("news")) {
      fetches.push(
        fetch(`${baseUrl}/api/news`)
          .then((r) => r.json())
          .then((data) => {
            const articles = (data.articles ?? []).slice(0, limit);
            result.news = articles;
            textBlocks.push(
              formatTextBlock(
                "Latest News",
                articles.map(
                  (a: { title: string; source: string; url: string }) =>
                    `• [${a.source}] ${a.title}\n  ${a.url}`
                )
              )
            );
          })
          .catch(() => {
            result.news = [];
          })
      );
    }

    if (channels.includes("alerts")) {
      const alerts = [
        "🔴 UAE: NCEMA emergency alerts active. Shelter-in-place guidance issued.",
        "🔴 US Embassy UAE: Shelter-in-place advisory Feb 28, 2026.",
        "🟡 EASA CZIB: All altitudes restricted over Iran, Iraq, UAE + 8 states.",
        "🟡 UKMTO: IRGC claiming Strait of Hormuz 'closed' on VHF Ch.16.",
        "🟢 Register with your embassy: STEP (US), ROCA (CA), MADAD (IN), Smartraveller (AU).",
      ];
      result.alerts = alerts;
      textBlocks.push(formatTextBlock("Safety Alerts", alerts));
    }

    if (channels.includes("earthquakes")) {
      fetches.push(
        fetch(`${baseUrl}/api/earthquakes`)
          .then((r) => r.json())
          .then((data) => {
            const quakes = (data.earthquakes ?? []).slice(0, limit);
            result.earthquakes = quakes;
            textBlocks.push(
              formatTextBlock(
                "Seismic Activity",
                quakes.map(
                  (q: { magnitude: number; place: string }) =>
                    `• M${q.magnitude.toFixed(1)} — ${q.place}`
                )
              )
            );
          })
          .catch(() => {
            result.earthquakes = [];
          })
      );
    }

    if (channels.includes("rates")) {
      fetches.push(
        fetch(`${baseUrl}/api/rates`)
          .then((r) => r.json())
          .then((data) => {
            result.rates = data.rates ?? {};
            const rateLines = Object.entries(data.rates ?? {}).map(
              ([k, v]) => `• ${k}: ${v}`
            );
            textBlocks.push(formatTextBlock("Exchange Rates (USD)", rateLines));
          })
          .catch(() => {
            result.rates = {};
          })
      );
    }

    if (channels.includes("flights")) {
      fetches.push(
        fetch(`${baseUrl}/api/flights`)
          .then((r) => r.json())
          .then((data) => {
            const count = (data.aircraft ?? []).length;
            result.flights = { count, timestamp: data.timestamp };
            textBlocks.push(
              formatTextBlock("Flight Tracker", [
                `• ${count} aircraft currently tracked over Middle East`,
              ])
            );
          })
          .catch(() => {
            result.flights = { count: 0 };
          })
      );
    }

    await Promise.allSettled(fetches);

    if (format === "text") {
      const text = textBlocks.join("\n");
      return new NextResponse(text, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Feed error", details: message },
      { status: 500 }
    );
  }
}
