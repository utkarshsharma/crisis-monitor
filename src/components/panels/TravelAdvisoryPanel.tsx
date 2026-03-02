"use client";

import { useState, useEffect } from "react";
import { COUNTRIES, COUNTRY_CODES, detectCountry } from "@/lib/countries";
import { useSmartPoll } from "@/lib/useSmartPoll";

/* ── Types ── */
interface Advisory {
  country: string;
  code: string;
  level: number;
  label: string;
  summary: string;
  updated: string;
  url: string;
}

type Severity = "red" | "amber" | "cyan" | "green";

function levelToSeverity(level: number): Severity {
  if (level >= 4) return "red";
  if (level >= 3) return "amber";
  if (level >= 2) return "cyan";
  return "green";
}

/* ── Color maps ── */
const BORDER_COLOR: Record<Severity, string> = {
  red: "border-[#ef4444]",
  amber: "border-[#f59e0b]",
  cyan: "border-[#06b6d4]",
  green: "border-[#22c55e]",
};

const BADGE_COLOR: Record<Severity, string> = {
  red: "bg-red-950/60 text-[#ef4444] border-red-800/50",
  amber: "bg-amber-950/60 text-[#f59e0b] border-amber-800/50",
  cyan: "bg-cyan-950/60 text-[#06b6d4] border-cyan-800/50",
  green: "bg-green-950/60 text-[#22c55e] border-green-900/50",
};

const BADGE_LABEL: Record<Severity, string> = {
  red: "DO NOT TRAVEL",
  amber: "RECONSIDER",
  cyan: "CAUTION",
  green: "NORMAL",
};

const LINK_COLOR: Record<Severity, string> = {
  red: "text-[#ef4444] hover:text-red-300",
  amber: "text-[#f59e0b] hover:text-amber-300",
  cyan: "text-[#06b6d4] hover:text-cyan-300",
  green: "text-[#22c55e] hover:text-green-300",
};

/* ── External link icon ── */
function ExternalIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      className="w-3 h-3 inline-block ml-0.5 -mt-0.5">
      <path d="M2.5 9.5 9.5 2.5M9.5 2.5H4M9.5 2.5V8" />
    </svg>
  );
}

/* ── Skeleton row ── */
function SkeletonCard() {
  return (
    <div className="bg-[#1a2234] rounded-lg p-3 border-l-4 border-[#1e293b] animate-pulse">
      <div className="flex items-start gap-2 mb-1.5">
        <div className="w-16 h-4 bg-[#1e293b] rounded shrink-0" />
        <div className="h-4 bg-[#1e293b] rounded w-2/3" />
      </div>
      <div className="h-3 bg-[#1e293b] rounded w-full mb-2" />
      <div className="h-3 bg-[#1e293b] rounded w-1/3" />
    </div>
  );
}

/* ── Transform ── */
const transformAdvisories = (raw: unknown) => {
  const data = raw as { advisories?: Advisory[] };
  return data.advisories ?? [];
};

/* ── Main component ── */
export default function TravelAdvisoryPanel() {
  const [countryCode, setCountryCode] = useState("US");

  // Detect user's country on mount
  useEffect(() => {
    setCountryCode(detectCountry());
  }, []);

  const source = COUNTRIES[countryCode]?.advisorySource ?? "US";
  const { data, loading, error } = useSmartPoll<Advisory[]>(
    `/api/travel-advisories?source=${source}`,
    300_000, // 5-minute polling
    transformAdvisories,
  );
  const advisories = data ?? [];

  const criticalCount = advisories.filter((a) => a.level >= 4).length;
  const warningCount = advisories.filter((a) => a.level === 3).length;

  /* ── Country dropdown (rendered via headerRight-like internal placement) ── */
  const dropdown = (
    <select
      value={countryCode}
      onChange={(e) => setCountryCode(e.target.value)}
      className="bg-[#1e293b] text-[#94a3b8] border border-[#2d3f57] rounded text-xs px-2 py-1 focus:outline-none"
    >
      {COUNTRY_CODES.map((code) => {
        const c = COUNTRIES[code];
        return (
          <option key={code} value={code}>
            {c.flag} {c.name}
          </option>
        );
      })}
    </select>
  );

  return (
    <div className="flex flex-col h-full p-4 gap-3 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e293b]">
      {/* Top bar: live indicator + dropdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]" />
          </span>
          <span className="text-xs text-[#94a3b8]">
            {criticalCount} critical &middot; {warningCount} warnings
          </span>
        </div>
        {dropdown}
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-2 rounded bg-red-950/40 border border-red-900/50 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Advisory cards */}
      <div className="flex-1 space-y-2.5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : advisories.length === 0 ? (
          <p className="text-sm text-[#475569] text-center py-8">No advisories available.</p>
        ) : (
          advisories.map((adv) => {
            const sev = levelToSeverity(adv.level);
            return (
              <a
                key={adv.code}
                href={adv.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block bg-[#1a2234] rounded-lg p-3 border-l-4 ${BORDER_COLOR[sev]} hover:bg-[#263348] transition-colors`}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <span className={`shrink-0 mt-0.5 text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border ${BADGE_COLOR[sev]}`}>
                    {BADGE_LABEL[sev]}
                  </span>
                  <p className="text-sm font-medium text-[#f1f5f9] leading-snug">{adv.country}</p>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed mb-2 line-clamp-2">{adv.summary}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${LINK_COLOR[sev]}`}>
                    View advisory<ExternalIcon />
                  </span>
                  {adv.updated && (
                    <span className="text-[10px] text-[#475569]">{adv.updated}</span>
                  )}
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}
