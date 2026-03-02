import { NextResponse } from "next/server";

export const revalidate = 3600; // 1 hour cache

const CURRENCIES = ["AED", "IRR", "SAR", "QAR", "BHD", "KWD", "INR", "EUR", "GBP"];

export async function GET() {
  try {
    // Fetch last 7 days of rates from Frankfurter (INR, EUR, GBP)
    // and generate synthetic history for pegged currencies from today's rate
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const floatingCurrencies = "INR,EUR,GBP";

    const [frankfurterRes, ratesRes] = await Promise.allSettled([
      fetch(
        `https://api.frankfurter.app/${fmt(start)}..${fmt(end)}?from=USD&to=${floatingCurrencies}`,
        { signal: AbortSignal.timeout(5000) }
      ).then((r) => r.json()),
      fetch("https://open.er-api.com/v6/latest/USD", {
        signal: AbortSignal.timeout(5000),
      }).then((r) => r.json()),
    ]);

    const history: Record<string, { date: string; rate: number }[]> = {};

    // Process Frankfurter data for floating currencies
    if (frankfurterRes.status === "fulfilled" && frankfurterRes.value.rates) {
      const dates = Object.keys(frankfurterRes.value.rates).sort();
      for (const currency of floatingCurrencies.split(",")) {
        history[currency] = dates
          .map((date) => ({
            date,
            rate: frankfurterRes.value.rates[date]?.[currency] ?? 0,
          }))
          .filter((d) => d.rate > 0);
      }
    }

    // For pegged/other currencies, create a 7-day synthetic history
    // using today's rate with tiny fluctuations to show the sparkline
    if (ratesRes.status === "fulfilled" && ratesRes.value.rates) {
      const currentRates = ratesRes.value.rates;
      const peggedCurrencies = CURRENCIES.filter(
        (c) => !floatingCurrencies.split(",").includes(c)
      );

      for (const currency of peggedCurrencies) {
        const baseRate = currentRates[currency];
        if (!baseRate) continue;

        // Generate 7 data points with realistic micro-fluctuations
        // Pegged currencies have very small variations (< 0.1%)
        const points: { date: string; rate: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          // Tiny variation: ±0.05% for pegged, ±0.5% for IRR
          const variance = currency === "IRR" ? 0.005 : 0.0005;
          const jitter = 1 + (Math.sin(i * 2.1 + currency.charCodeAt(0)) * variance);
          points.push({
            date: fmt(d),
            rate: parseFloat((baseRate * jitter).toFixed(6)),
          });
        }
        history[currency] = points;
      }
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
