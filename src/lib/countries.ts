/** Shared country config for Travel Advisories & Airline Status panels */

export interface CountryConfig {
  name: string;
  flag: string;
  advisorySource: string; // query param value for /api/travel-advisories
  airlines: AirlineEntry[];
}

export interface AirlineEntry {
  name: string;
  status: "suspended" | "rerouting" | "operating";
  detail: string;
  updated: string;
  url: string;
}

export const COUNTRIES: Record<string, CountryConfig> = {
  US: {
    name: "USA",
    flag: "\u{1F1FA}\u{1F1F8}",
    advisorySource: "US",
    airlines: [
      { name: "American Airlines", status: "suspended", detail: "All Middle East routes suspended", updated: "2 Mar 2026", url: "https://www.aa.com/" },
      { name: "Delta Air Lines", status: "suspended", detail: "All Middle East routes suspended", updated: "2 Mar 2026", url: "https://www.delta.com/" },
      { name: "United Airlines", status: "rerouting", detail: "Rerouting, avoiding Iran/Iraq airspace", updated: "1 Mar 2026", url: "https://www.united.com/" },
      { name: "Southwest Airlines", status: "operating", detail: "No Middle East routes operated", updated: "28 Feb 2026", url: "https://www.southwest.com/" },
      { name: "JetBlue Airways", status: "operating", detail: "No Middle East routes operated", updated: "28 Feb 2026", url: "https://www.jetblue.com/" },
    ],
  },
  GB: {
    name: "UK",
    flag: "\u{1F1EC}\u{1F1E7}",
    advisorySource: "UK",
    airlines: [
      { name: "British Airways", status: "suspended", detail: "All Middle East routes suspended", updated: "2 Mar 2026", url: "https://www.britishairways.com/" },
      { name: "Virgin Atlantic", status: "suspended", detail: "Dubai and Tel Aviv suspended", updated: "1 Mar 2026", url: "https://www.virginatlantic.com/" },
      { name: "easyJet", status: "rerouting", detail: "Rerouting, avoiding Iran/Iraq airspace", updated: "1 Mar 2026", url: "https://www.easyjet.com/" },
    ],
  },
  AE: {
    name: "UAE",
    flag: "\u{1F1E6}\u{1F1EA}",
    advisorySource: "aggregated",
    airlines: [
      { name: "Emirates", status: "rerouting", detail: "Rerouting, avoiding Iran/Iraq airspace", updated: "2 Mar 2026", url: "https://www.emirates.com/" },
      { name: "Etihad Airways", status: "rerouting", detail: "Rerouting, avoiding Iran/Iraq airspace", updated: "2 Mar 2026", url: "https://www.etihad.com/" },
      { name: "FlyDubai", status: "suspended", detail: "All Iraq/Iran routes suspended", updated: "1 Mar 2026", url: "https://www.flydubai.com/" },
      { name: "Air Arabia", status: "rerouting", detail: "Rerouting via southern corridors", updated: "1 Mar 2026", url: "https://www.airarabia.com/" },
    ],
  },
  IN: {
    name: "India",
    flag: "\u{1F1EE}\u{1F1F3}",
    advisorySource: "aggregated",
    airlines: [
      { name: "Air India", status: "rerouting", detail: "Rerouting, avoiding Iran/Iraq airspace", updated: "2 Mar 2026", url: "https://www.airindia.com/" },
      { name: "IndiGo", status: "suspended", detail: "Dubai and Doha routes suspended", updated: "1 Mar 2026", url: "https://www.goindigo.in/" },
      { name: "SpiceJet", status: "suspended", detail: "All Middle East routes suspended", updated: "1 Mar 2026", url: "https://www.spicejet.com/" },
      { name: "Vistara", status: "rerouting", detail: "Rerouting via southern corridors", updated: "28 Feb 2026", url: "https://www.airvistara.com/" },
    ],
  },
  CA: {
    name: "Canada",
    flag: "\u{1F1E8}\u{1F1E6}",
    advisorySource: "CA",
    airlines: [
      { name: "Air Canada", status: "suspended", detail: "All Middle East routes suspended", updated: "2 Mar 2026", url: "https://www.aircanada.com/" },
      { name: "WestJet", status: "operating", detail: "No Middle East routes operated", updated: "28 Feb 2026", url: "https://www.westjet.com/" },
    ],
  },
  AU: {
    name: "Australia",
    flag: "\u{1F1E6}\u{1F1FA}",
    advisorySource: "AU",
    airlines: [
      { name: "Qantas", status: "rerouting", detail: "Rerouting all flights avoiding Iran/Iraq airspace", updated: "2 Mar 2026", url: "https://www.qantas.com/" },
      { name: "Virgin Australia", status: "operating", detail: "No Middle East routes operated", updated: "28 Feb 2026", url: "https://www.virginaustralia.com/" },
    ],
  },
  DE: {
    name: "Germany",
    flag: "\u{1F1E9}\u{1F1EA}",
    advisorySource: "aggregated",
    airlines: [
      { name: "Lufthansa", status: "suspended", detail: "All Iran/Iraq/Israel routes suspended", updated: "2 Mar 2026", url: "https://www.lufthansa.com/" },
      { name: "Eurowings", status: "rerouting", detail: "Rerouting, avoiding Iran/Iraq airspace", updated: "1 Mar 2026", url: "https://www.eurowings.com/" },
    ],
  },
  QA: {
    name: "Qatar",
    flag: "\u{1F1F6}\u{1F1E6}",
    advisorySource: "aggregated",
    airlines: [
      { name: "Qatar Airways", status: "rerouting", detail: "Rerouting, avoiding Iran/Iraq airspace", updated: "2 Mar 2026", url: "https://www.qatarairways.com/" },
    ],
  },
  TR: {
    name: "Turkey",
    flag: "\u{1F1F9}\u{1F1F7}",
    advisorySource: "aggregated",
    airlines: [
      { name: "Turkish Airlines", status: "rerouting", detail: "Rerouting, avoiding Iran/Iraq airspace", updated: "2 Mar 2026", url: "https://www.turkishairlines.com/" },
      { name: "Pegasus Airlines", status: "suspended", detail: "All Iraq/Iran routes suspended", updated: "1 Mar 2026", url: "https://www.flypgs.com/" },
    ],
  },
};

/** Ordered list of country codes for dropdown */
export const COUNTRY_CODES = ["US", "GB", "AE", "IN", "CA", "AU", "DE", "QA", "TR"] as const;

/**
 * Detect the user's likely country from browser locale / timezone.
 * Returns a key from COUNTRIES, defaulting to "US".
 */
export function detectCountry(): string {
  if (typeof navigator === "undefined") return "US";

  // Try language tag first (e.g. "en-US" → "US", "en-GB" → "GB")
  const lang = navigator.language ?? "";
  const regionMatch = lang.match(/-([A-Z]{2})$/i);
  if (regionMatch) {
    const code = regionMatch[1].toUpperCase();
    if (code in COUNTRIES) return code;
  }

  // Fall back to timezone heuristic
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    const tzLower = tz.toLowerCase();
    if (tzLower.includes("london") || tzLower.includes("europe/london")) return "GB";
    if (tzLower.includes("dubai") || tzLower.includes("asia/dubai")) return "AE";
    if (tzLower.includes("kolkata") || tzLower.includes("asia/kolkata") || tzLower.includes("calcutta")) return "IN";
    if (tzLower.includes("toronto") || tzLower.includes("vancouver") || tzLower.includes("america/toronto")) return "CA";
    if (tzLower.includes("sydney") || tzLower.includes("melbourne") || tzLower.includes("australia")) return "AU";
    if (tzLower.includes("berlin") || tzLower.includes("europe/berlin")) return "DE";
    if (tzLower.includes("istanbul")) return "TR";
    if (tzLower.includes("qatar") || tzLower.includes("asia/qatar")) return "QA";
    if (tzLower.includes("america/")) return "US";
  } catch {
    // Intl may not be available
  }

  return "US";
}
