import { NextResponse } from "next/server";

export const revalidate = 3600;

const ER_API_URL = "https://open.er-api.com/v6/latest/USD";

const RELEVANT_CURRENCIES = [
  "AED",
  "IRR",
  "SAR",
  "QAR",
  "BHD",
  "KWD",
  "OMR",
  "INR",
  "EUR",
  "GBP",
] as const;

type CurrencyCode = (typeof RELEVANT_CURRENCIES)[number];

interface ErApiResponse {
  base_code?: string;
  time_last_update_utc?: string;
  rates?: Record<string, number>;
}

export async function GET() {
  try {
    const response = await fetch(ER_API_URL, {
      next: { revalidate },
    });

    if (!response.ok) {
      throw new Error(`Exchange rate API responded with status ${response.status}`);
    }

    const data: ErApiResponse = await response.json();

    const allRates = data.rates ?? {};

    const filteredRates = RELEVANT_CURRENCIES.reduce<Record<CurrencyCode, number>>(
      (acc, currency) => {
        if (allRates[currency] !== undefined) {
          acc[currency] = allRates[currency];
        }
        return acc;
      },
      {} as Record<CurrencyCode, number>
    );

    return NextResponse.json({
      base: data.base_code ?? "USD",
      rates: filteredRates,
      lastUpdate: data.time_last_update_utc ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch exchange rates", details: message },
      { status: 500 }
    );
  }
}
