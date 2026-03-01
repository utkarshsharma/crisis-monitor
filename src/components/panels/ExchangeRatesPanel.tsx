"use client";

import { useEffect, useState, useCallback } from "react";

interface RatesData {
  rates: Record<string, number>;
  base?: string;
  timestamp?: number;
}

interface CurrencyConfig {
  code: string;
  flag: string;
  name: string;
}

const CURRENCIES: CurrencyConfig[] = [
  { code: "AED", flag: "🇦🇪", name: "UAE Dirham" },
  { code: "IRR", flag: "🇮🇷", name: "Iranian Rial" },
  { code: "SAR", flag: "🇸🇦", name: "Saudi Riyal" },
  { code: "QAR", flag: "🇶🇦", name: "Qatari Riyal" },
  { code: "BHD", flag: "🇧🇭", name: "Bahraini Dinar" },
  { code: "KWD", flag: "🇰🇼", name: "Kuwaiti Dinar" },
  { code: "INR", flag: "🇮🇳", name: "Indian Rupee" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound" },
];

function formatRate(code: string, rate: number | undefined): string {
  if (rate === undefined || rate === null) return "N/A";
  if (code === "IRR") {
    if (rate >= 1000) return rate.toLocaleString("en-US", { maximumFractionDigits: 0 });
    return rate.toFixed(2);
  }
  if (rate >= 100) return rate.toFixed(0);
  if (rate < 0.01) return rate.toFixed(6);
  return rate.toFixed(4);
}

function SkeletonCard() {
  return (
    <div className="bg-[#1a2234] rounded-lg p-3 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-4 bg-[#1e293b] rounded" />
        <div className="w-10 h-4 bg-[#1e293b] rounded" />
      </div>
      <div className="w-20 h-5 bg-[#1e293b] rounded" />
      <div className="w-16 h-3 bg-[#1e293b] rounded mt-1" />
    </div>
  );
}

export default function ExchangeRatesPanel() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/rates");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: RatesData = await res.json();
      setRates(data.rates ?? {});
      if (data.timestamp) {
        setUpdatedAt(new Date(data.timestamp * 1000).toLocaleTimeString());
      } else {
        setUpdatedAt(new Date().toLocaleTimeString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#94a3b8]">vs. USD</span>
        {updatedAt && !loading && (
          <span className="text-xs text-[#475569]">as of {updatedAt}</span>
        )}
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 rounded bg-red-950/40 border border-red-900/50 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e293b]">
        <div className="grid grid-cols-2 gap-2">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : CURRENCIES.map(({ code, flag, name }) => {
                const rate = rates[code];
                const hasRate = rate !== undefined;

                return (
                  <div
                    key={code}
                    className="bg-[#1a2234] rounded-lg p-3 border border-[#1e293b]/60 hover:border-[#1e293b] transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-base leading-none">{flag}</span>
                      <span className="text-xs font-bold text-[#f1f5f9] tracking-wide">
                        {code}
                      </span>
                    </div>
                    <p
                      className={`text-sm font-semibold font-mono ${
                        hasRate ? "text-[#f1f5f9]" : "text-[#475569]"
                      }`}
                    >
                      {formatRate(code, rate)}
                    </p>
                    <p className="text-[10px] text-[#475569] mt-0.5 truncate">
                      {name}
                    </p>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
