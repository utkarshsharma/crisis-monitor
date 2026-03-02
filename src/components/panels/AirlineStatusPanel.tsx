"use client";

import { useState, useEffect } from "react";
import { COUNTRIES, COUNTRY_CODES, detectCountry } from "@/lib/countries";
import type { AirlineEntry } from "@/lib/countries";

/* ── Color maps ── */
const STATUS_DOT: Record<AirlineEntry["status"], string> = {
  suspended: "bg-[#ef4444]",
  rerouting: "bg-[#f59e0b]",
  operating: "bg-[#22c55e]",
};

const STATUS_RING: Record<AirlineEntry["status"], string> = {
  suspended: "ring-[#ef4444]/25",
  rerouting: "ring-[#f59e0b]/25",
  operating: "ring-[#22c55e]/25",
};

const STATUS_TEXT: Record<AirlineEntry["status"], string> = {
  suspended: "text-[#ef4444]",
  rerouting: "text-[#f59e0b]",
  operating: "text-[#22c55e]",
};

const STATUS_LABEL: Record<AirlineEntry["status"], string> = {
  suspended: "SUSPENDED",
  rerouting: "REROUTING",
  operating: "OPERATING",
};

/* ── Source links ── */
const SOURCES = [
  { label: "FlightRadar24", href: "https://www.flightradar24.com/" },
  { label: "EASA Conflict Zones", href: "https://www.easa.europa.eu/en/domains/air-operations/czibs" },
  { label: "NOTAM Search", href: "https://www.notams.faa.gov/dinsQueryWeb/" },
  { label: "IATA Travel Centre", href: "https://www.iatatravelcentre.com/" },
];

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

/* ── Main component ── */
export default function AirlineStatusPanel() {
  const [countryCode, setCountryCode] = useState("US");

  useEffect(() => {
    setCountryCode(detectCountry());
  }, []);

  const country = COUNTRIES[countryCode];
  const airlines = country?.airlines ?? [];

  const suspended = airlines.filter((a) => a.status === "suspended").length;
  const rerouting = airlines.filter((a) => a.status === "rerouting").length;
  const operating = airlines.filter((a) => a.status === "operating").length;

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
      {/* Top: dropdown */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#475569] uppercase tracking-widest">
          {country?.flag} {country?.name} Airlines
        </span>
        {dropdown}
      </div>

      {/* Stats banner */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1 px-3 py-2.5 rounded-lg bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-[#475569] uppercase tracking-wide leading-none">Suspended</span>
          <span className="text-sm font-semibold leading-snug text-[#ef4444]">{suspended}</span>
        </div>
        <div className="flex flex-col gap-1 px-3 py-2.5 rounded-lg bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-[#475569] uppercase tracking-wide leading-none">Rerouting</span>
          <span className="text-sm font-semibold leading-snug text-[#f59e0b]">{rerouting}</span>
        </div>
        <div className="flex flex-col gap-1 px-3 py-2.5 rounded-lg bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-[#475569] uppercase tracking-wide leading-none">Operating</span>
          <span className="text-sm font-semibold leading-snug text-[#22c55e]">{operating}</span>
        </div>
      </div>

      {/* Airline rows */}
      <div className="flex-1 space-y-1.5">
        {airlines.map((airline) => (
          <a
            key={airline.name}
            href={airline.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1a2234] border border-[#1e293b] hover:bg-[#263348] transition-colors cursor-pointer"
          >
            {/* Status dot */}
            <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${STATUS_DOT[airline.status]} ring-4 ${STATUS_RING[airline.status]}`} />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[#f1f5f9] truncate">{airline.name}</p>
                <span className={`text-[9px] font-bold tracking-widest ${STATUS_TEXT[airline.status]}`}>
                  {STATUS_LABEL[airline.status]}
                </span>
                <ExternalIcon />
              </div>
              <p className="text-xs text-[#94a3b8] truncate">{airline.detail}</p>
            </div>

            {/* Updated */}
            <span className="text-[10px] text-[#475569] whitespace-nowrap shrink-0">{airline.updated}</span>
          </a>
        ))}
      </div>

      {/* Source pills */}
      <div>
        <p className="text-xs text-[#475569] uppercase tracking-widest mb-2">Sources</p>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((src) => (
            <a
              key={src.label}
              href={src.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1e293b] text-[#06b6d4] border border-[#2d3f57] hover:bg-[#263348] hover:text-[#f1f5f9] transition-colors"
            >
              {src.label} <ExternalIcon />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
