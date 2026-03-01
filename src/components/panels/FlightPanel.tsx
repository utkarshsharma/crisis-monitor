"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const QUICK_LINKS = [
  {
    label: "ADS-B Exchange",
    href: "https://globe.adsbexchange.com/?lat=29.5&lon=51.5&zoom=5",
  },
  {
    label: "Safe Airspace",
    href: "https://www.safeairspace.net/",
  },
  {
    label: "EASA CZIBs",
    href: "https://www.easa.europa.eu/en/domains/air-operations/czibs",
  },
];

interface Aircraft {
  icao24: string;
  callsign: string;
  country: string;
  longitude: number;
  latitude: number;
  altitude: number | null;
  onGround: boolean;
  velocity: number | null;
  heading: number | null;
  squawk: string | null;
}

// Dynamically import the Leaflet map to avoid SSR issues
const FlightMapView = dynamic(() => import("./FlightMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0e17] animate-pulse flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="#06b6d4"
          className="opacity-40"
        >
          <path d="M12 2 L15.5 10 L22 10 L17 14 L19 22 L12 18 L5 22 L7 14 L2 10 L8.5 10 Z" />
        </svg>
        <span className="text-[#475569] text-xs tracking-wide">
          Loading flight map…
        </span>
      </div>
    </div>
  ),
});

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function FlightPanel() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFlights = useCallback(async () => {
    try {
      const res = await fetch("/api/flights");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.details ?? data.error);
      setAircraft(data.aircraft ?? []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch flights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 30_000);
    return () => clearInterval(interval);
  }, [fetchFlights]);

  return (
    <div className="relative flex flex-col w-full h-full">
      {/* Map area */}
      <div className="relative flex-1 min-h-0">
        {loading && aircraft.length === 0 ? (
          <div className="w-full h-full bg-[#0a0e17] animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="32"
                height="32"
                fill="#06b6d4"
                className="opacity-40"
              >
                <path d="M12 2 L15.5 10 L22 10 L17 14 L19 22 L12 18 L5 22 L7 14 L2 10 L8.5 10 Z" />
              </svg>
              <span className="text-[#475569] text-xs tracking-wide">
                Fetching live aircraft…
              </span>
            </div>
          </div>
        ) : error && aircraft.length === 0 ? (
          <div className="w-full h-full bg-[#0a0e17] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center px-6">
              <span className="text-[#ef4444] text-sm font-medium">
                Failed to load flight data
              </span>
              <span className="text-[#64748b] text-xs">{error}</span>
              <button
                onClick={fetchFlights}
                className="mt-2 px-3 py-1.5 rounded text-xs font-medium bg-[#1e293b] text-[#94a3b8] hover:bg-[#263348] hover:text-[#f1f5f9] border border-[#2d3f57] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <FlightMapView aircraft={aircraft} />
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-[#1e293b] bg-[#0d1117]">
        <span className="text-xs text-[#64748b]">
          {aircraft.length > 0 ? (
            <>
              <span className="text-[#06b6d4] font-semibold">
                {aircraft.length}
              </span>{" "}
              aircraft tracked
              {lastUpdated && (
                <>
                  {" · "}
                  <span className="text-[#475569]">
                    Last updated: {formatTime(lastUpdated)}
                  </span>
                </>
              )}
            </>
          ) : loading ? (
            <span className="text-[#475569]">Loading…</span>
          ) : (
            <span className="text-[#ef4444] text-xs">{error ?? "No data"}</span>
          )}
        </span>

        {error && aircraft.length > 0 && (
          <span className="text-[#f59e0b] text-xs">Stale data</span>
        )}
      </div>

      {/* Quick link pills */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-t border-[#1e293b]">
        {QUICK_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-0.5 rounded-full text-xs font-medium
                       bg-[#1e293b] text-[#94a3b8] hover:bg-[#263348] hover:text-[#f1f5f9]
                       border border-[#2d3f57] transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
