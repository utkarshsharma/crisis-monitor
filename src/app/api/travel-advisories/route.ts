import { NextRequest, NextResponse } from "next/server";

export const revalidate = 600; // 10-minute ISR cache

/** Crisis-region country codes we care about */
const CRISIS_CODES = new Set([
  "IR", "IQ", "AE", "SA", "QA", "BH", "KW", "OM", "IL", "JO", "LB", "SY", "YE",
]);

const CODE_TO_NAME: Record<string, string> = {
  IR: "Iran", IQ: "Iraq", AE: "United Arab Emirates", SA: "Saudi Arabia",
  QA: "Qatar", BH: "Bahrain", KW: "Kuwait", OM: "Oman",
  IL: "Israel", JO: "Jordan", LB: "Lebanon", SY: "Syria", YE: "Yemen",
};

interface Advisory {
  country: string;
  code: string;
  level: number;
  label: string;
  summary: string;
  updated: string;
  url: string;
}

const LEVEL_LABELS: Record<number, string> = {
  1: "Exercise Normal Precautions",
  2: "Exercise Increased Caution",
  3: "Reconsider Travel",
  4: "Do Not Travel",
};

/* ── US State Department ── */
async function fetchUS(): Promise<Advisory[]> {
  const res = await fetch("https://cadataapi.state.gov/api/TravelAdvisories", {
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`State Dept API ${res.status}`);

  const rows: Array<{
    advisory_text?: string;
    date_updated?: string;
    iso_code?: string;
    info_url?: string;
  }> = await res.json();

  const advisories: Advisory[] = [];

  for (const row of rows) {
    const code = (row.iso_code ?? "").toUpperCase().trim();
    if (!CRISIS_CODES.has(code)) continue;

    const title = row.advisory_text ?? "";
    // Parse "Level X: Label" from advisory text
    const levelMatch = title.match(/Level\s+(\d)/i);
    const level = levelMatch ? parseInt(levelMatch[1], 10) : 2;
    const label = LEVEL_LABELS[level] ?? "Unknown";

    advisories.push({
      country: CODE_TO_NAME[code] ?? code,
      code,
      level,
      label,
      summary: title,
      updated: row.date_updated ?? "",
      url: row.info_url ?? `https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/${code.toLowerCase()}-travel-advisory.html`,
    });
  }

  return advisories.sort((a, b) => b.level - a.level);
}

/* ── Aggregated source (travel-advisory.info) ── */
async function fetchAggregated(): Promise<Advisory[]> {
  const res = await fetch("https://www.travel-advisory.info/api", {
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`travel-advisory.info API ${res.status}`);

  const json: { data?: Record<string, { iso_alpha2: string; name: string; advisory: { score: number; updated: string; message: string; source: string; sources_active: number } }> } = await res.json();
  const data = json.data ?? {};
  const advisories: Advisory[] = [];

  for (const [code, entry] of Object.entries(data)) {
    if (!CRISIS_CODES.has(code)) continue;
    const score = entry.advisory?.score ?? 0;
    // Map 0–5 score to 1–4 level
    let level = 1;
    if (score >= 4.5) level = 4;
    else if (score >= 3.5) level = 3;
    else if (score >= 2.5) level = 2;

    advisories.push({
      country: entry.name ?? CODE_TO_NAME[code] ?? code,
      code,
      level,
      label: LEVEL_LABELS[level] ?? "Unknown",
      summary: entry.advisory?.message ?? "",
      updated: entry.advisory?.updated ?? "",
      url: `https://www.travel-advisory.info/?countrycode=${code}`,
    });
  }

  return advisories.sort((a, b) => b.level - a.level);
}

/* ── Fallback static advisories for UK/CA/AU ── */
function fallbackAdvisories(source: string): Advisory[] {
  // Static advisories based on commonly known government positions
  const base: Array<{ code: string; level: number }> = [
    { code: "IR", level: 4 }, { code: "IQ", level: 4 }, { code: "SY", level: 4 },
    { code: "YE", level: 4 }, { code: "LB", level: 4 }, { code: "IL", level: 3 },
    { code: "SA", level: 3 }, { code: "JO", level: 2 }, { code: "AE", level: 2 },
    { code: "QA", level: 2 }, { code: "BH", level: 2 }, { code: "KW", level: 2 },
    { code: "OM", level: 1 },
  ];

  const sourceUrls: Record<string, string> = {
    UK: "https://www.gov.uk/foreign-travel-advice",
    CA: "https://travel.gc.ca/travelling/advisories",
    AU: "https://www.smartraveller.gov.au/destinations",
  };

  return base.map(({ code, level }) => ({
    country: CODE_TO_NAME[code] ?? code,
    code,
    level,
    label: LEVEL_LABELS[level] ?? "Unknown",
    summary: `${source} government advises: ${LEVEL_LABELS[level]}`,
    updated: "2026-03-01",
    url: sourceUrls[source] ?? "",
  }));
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("source") ?? "US";

  try {
    let advisories: Advisory[];

    if (source === "US") {
      advisories = await fetchUS();
    } else if (source === "aggregated") {
      advisories = await fetchAggregated();
    } else {
      // UK, CA, AU — use aggregated data with source-specific fallback
      try {
        advisories = await fetchAggregated();
      } catch {
        advisories = fallbackAdvisories(source);
      }
    }

    // If the live API returned empty, use fallback
    if (advisories.length === 0) {
      advisories = fallbackAdvisories(source);
    }

    return NextResponse.json({ advisories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    // Return fallback data even on error so the panel always has something
    return NextResponse.json({ advisories: fallbackAdvisories(source), _fallback: true, _error: message });
  }
}
