import { NextResponse } from "next/server";

export const revalidate = 3600; // 1 hour cache

export async function GET() {
  try {
    // Last 7 days of history from frankfurter.app (free, no key)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const fmt = (d: Date) => d.toISOString().split("T")[0];
    // Frankfurter supports major currencies. Gulf pegged currencies (AED,SAR,QAR,BHD,KWD,OMR) are not available.
    const currencies = "INR,EUR,GBP";

    const url = `https://api.frankfurter.app/${fmt(start)}..${fmt(end)}?from=USD&to=${currencies}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Frankfurter API: ${res.status}`);
    const data = await res.json();

    // data.rates is { "2026-02-23": { AED: 3.67, ... }, "2026-02-24": { ... }, ... }
    // Transform into per-currency arrays: { AED: [{ date, rate }, ...], ... }
    const dates = Object.keys(data.rates).sort();
    const history: Record<string, { date: string; rate: number }[]> = {};

    for (const currency of currencies.split(",")) {
      history[currency] = dates.map((date) => ({
        date,
        rate: data.rates[date]?.[currency] ?? 0,
      })).filter((d) => d.rate > 0);
    }

    return NextResponse.json({ history });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch currency history", details: message },
      { status: 500 }
    );
  }
}
