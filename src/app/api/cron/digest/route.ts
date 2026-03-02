import { NextRequest, NextResponse } from "next/server";
import { isAuthorized, sendTelegram, formatTextBlock, escapeHtml } from "@/lib/telegram";

export const dynamic = "force-dynamic";

const STATIC_ALERTS = [
  "🔴 UAE: NCEMA emergency alerts active. Shelter-in-place guidance issued.",
  "🔴 US Embassy UAE: Shelter-in-place advisory Feb 28, 2026.",
  "🟡 EASA CZIB: All altitudes restricted over Iran, Iraq, UAE + 8 states.",
  "🟡 UKMTO: IRGC claiming Strait of Hormuz 'closed' on VHF Ch.16.",
  "🟢 Register with your embassy: STEP (US), ROCA (CA), MADAD (IN), Smartraveller (AU).",
];

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = req.nextUrl.origin;

  try {
    const [newsRes, quakesRes, ratesRes, flightsRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/news`, { signal: AbortSignal.timeout(8000) })
        .then((r) => r.json()),
      fetch(`${baseUrl}/api/earthquakes`, { signal: AbortSignal.timeout(8000) })
        .then((r) => r.json()),
      fetch(`${baseUrl}/api/rates`, { signal: AbortSignal.timeout(8000) })
        .then((r) => r.json()),
      fetch(`${baseUrl}/api/flights`, { signal: AbortSignal.timeout(10000) })
        .then((r) => r.json()),
    ]);

    const blocks: string[] = [];
    blocks.push("📊 <b>CrisisMonitor — Daily Digest</b>");
    blocks.push(`🕐 ${new Date().toUTCString()}`);

    // News
    if (newsRes.status === "fulfilled") {
      const articles = (newsRes.value.articles ?? []).slice(0, 8);
      if (articles.length > 0) {
        blocks.push(
          formatTextBlock(
            "Latest News",
            articles.map(
              (a: { title: string; source: string; url: string }) =>
                `• [${escapeHtml(a.source)}] ${escapeHtml(a.title)}\n  ${a.url}`
            )
          )
        );
      }
    }

    // Alerts
    blocks.push(formatTextBlock("Safety Alerts", STATIC_ALERTS));

    // Earthquakes
    if (quakesRes.status === "fulfilled") {
      const quakes = (quakesRes.value.earthquakes ?? []).slice(0, 8);
      if (quakes.length > 0) {
        blocks.push(
          formatTextBlock(
            "Seismic Activity",
            quakes.map(
              (q: { magnitude: number; place: string }) =>
                `• M${q.magnitude.toFixed(1)} — ${escapeHtml(q.place)}`
            )
          )
        );
      }
    }

    // Exchange Rates
    if (ratesRes.status === "fulfilled") {
      const rates = ratesRes.value.rates ?? {};
      const rateLines = Object.entries(rates).map(([k, v]) => `• ${k}: ${v}`);
      if (rateLines.length > 0) {
        blocks.push(formatTextBlock("Exchange Rates (USD)", rateLines));
      }
    }

    // Flights
    if (flightsRes.status === "fulfilled") {
      const count = (flightsRes.value.aircraft ?? []).length;
      blocks.push(
        formatTextBlock("Flight Tracker", [
          `• ${count} aircraft currently tracked over Middle East`,
        ])
      );
    }

    const messageText = blocks.join("\n");
    await sendTelegram(messageText);

    return NextResponse.json({ sent: true, chars: messageText.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Digest cron failed", details: message },
      { status: 500 }
    );
  }
}
