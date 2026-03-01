"use client";

import { useEffect, useState, useCallback } from "react";

interface Earthquake {
  magnitude: number;
  place: string;
  time: number;
  url: string;
  coordinates: [number, number, number];
}

interface EarthquakeResponse {
  earthquakes: Earthquake[];
}

function timeAgo(timestampMs: number): string {
  const diff = Math.floor((Date.now() - timestampMs) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getMagColor(mag: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (mag >= 6)
    return {
      bg: "bg-red-950/60",
      text: "text-[#ef4444]",
      border: "border-red-700/50",
    };
  if (mag >= 4.5)
    return {
      bg: "bg-amber-950/60",
      text: "text-[#f59e0b]",
      border: "border-amber-700/50",
    };
  return {
    bg: "bg-green-950/60",
    text: "text-[#22c55e]",
    border: "border-green-800/50",
  };
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#1e293b] animate-pulse">
      <div className="w-10 h-10 rounded-full bg-[#1e293b] shrink-0" />
      <div className="flex-1">
        <div className="h-3.5 bg-[#1e293b] rounded w-3/4 mb-2" />
        <div className="h-3 bg-[#1e293b] rounded w-1/3" />
      </div>
    </div>
  );
}

export default function SeismicPanel() {
  const [quakes, setQuakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuakes = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/earthquakes");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: EarthquakeResponse = await res.json();
      const sorted = [...(data.earthquakes ?? [])].sort(
        (a, b) => b.magnitude - a.magnitude
      );
      setQuakes(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuakes();
    const interval = setInterval(fetchQuakes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchQuakes]);

  const significant = quakes.filter((q) => q.magnitude >= 4.5).length;

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header stats */}
      <div className="flex items-center gap-3 mb-3 text-xs text-[#94a3b8]">
        {!loading && (
          <>
            <span>{quakes.length} events</span>
            {significant > 0 && (
              <>
                <span className="text-[#1e293b]">·</span>
                <span className="text-[#f59e0b]">
                  {significant} significant (M4.5+)
                </span>
              </>
            )}
          </>
        )}
      </div>

      {error && (
        <div className="mb-2 px-3 py-2 rounded bg-red-950/40 border border-red-900/50 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e293b]">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          : quakes.length === 0
          ? (
            <p className="text-sm text-[#475569] text-center py-8">
              No recent seismic events.
            </p>
          )
          : quakes.map((quake, i) => {
            const mag = quake.magnitude;
            const colors = getMagColor(mag);
            return (
              <a
                key={`${quake.url}-${i}`}
                href={quake.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-3 border-b border-[#1e293b] hover:bg-[#1a2234] -mx-1 px-1 rounded transition-colors group"
              >
                {/* Magnitude badge */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}
                >
                  {mag.toFixed(1)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f1f5f9] leading-snug truncate group-hover:text-white transition-colors">
                    {quake.place}
                  </p>
                  <p className="text-xs text-[#475569] mt-0.5">
                    {timeAgo(quake.time)}
                  </p>
                </div>

                {/* Arrow */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3 h-3 text-[#475569] group-hover:text-[#06b6d4] shrink-0 transition-colors"
                >
                  <path d="M2.5 9.5 9.5 2.5M9.5 2.5H4M9.5 2.5V8" />
                </svg>
              </a>
            );
          })}
      </div>
    </div>
  );
}
