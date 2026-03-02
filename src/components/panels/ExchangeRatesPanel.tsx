"use client";

import { useEffect, useState, useCallback, useRef } from "react";

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
  { code: "AED", flag: "\u{1F1E6}\u{1F1EA}", name: "UAE Dirham" },
  { code: "IRR", flag: "\u{1F1EE}\u{1F1F7}", name: "Iranian Rial" },
  { code: "SAR", flag: "\u{1F1F8}\u{1F1E6}", name: "Saudi Riyal" },
  { code: "QAR", flag: "\u{1F1F6}\u{1F1E6}", name: "Qatari Riyal" },
  { code: "BHD", flag: "\u{1F1E7}\u{1F1ED}", name: "Bahraini Dinar" },
  { code: "KWD", flag: "\u{1F1F0}\u{1F1FC}", name: "Kuwaiti Dinar" },
  { code: "INR", flag: "\u{1F1EE}\u{1F1F3}", name: "Indian Rupee" },
  { code: "EUR", flag: "\u{1F1EA}\u{1F1FA}", name: "Euro" },
  { code: "GBP", flag: "\u{1F1EC}\u{1F1E7}", name: "British Pound" },
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

// Canvas sparkline component
function Sparkline({ data, width, height, color }: { data: number[]; width: number; height: number; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width * 2; // retina
    canvas.height = height * 2;
    ctx.scale(2, 2);
    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 2;

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.lineJoin = "round";

    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * (width - pad * 2) + pad;
      const y = height - pad - ((data[i] - min) / range) * (height - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill gradient under the line
    const lastX = width - pad;
    const lastY = height - pad - ((data[data.length - 1] - min) / range) * (height - pad * 2);
    ctx.lineTo(lastX, height);
    ctx.lineTo(pad, height);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, color.replace(")", ",0.15)").replace("rgb", "rgba"));
    grad.addColorStop(1, color.replace(")", ",0)").replace("rgb", "rgba"));
    ctx.fillStyle = grad;
    ctx.fill();

    // End dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }, [data, width, height, color]);

  if (data.length < 2) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: "block" }}
    />
  );
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
  const [history, setHistory] = useState<Record<string, { date: string; rate: number }[]>>({});
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch("/api/rates");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: RatesData = await res.json();
      setRates(data.rates ?? {});
      setUpdatedAt(new Date().toLocaleTimeString());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/currency-history");
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.history ?? {});
    } catch {
      // silently fail — sparklines are supplementary
    }
  }, []);

  useEffect(() => {
    fetchRates();
    fetchHistory();
  }, [fetchRates, fetchHistory]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#94a3b8]">vs. USD</span>
        {updatedAt && !loading && (
          <span className="text-xs text-[#475569]">as of {updatedAt}</span>
        )}
      </div>

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
                const historyData = (history[code] ?? []).map((d) => d.rate);

                // Determine trend color
                let trendColor = "rgb(100,116,139)"; // neutral grey
                if (historyData.length >= 2) {
                  const first = historyData[0];
                  const last = historyData[historyData.length - 1];
                  if (last > first) trendColor = "rgb(239,68,68)"; // red = currency weakened vs USD
                  else if (last < first) trendColor = "rgb(34,197,94)"; // green = currency strengthened
                }

                return (
                  <div
                    key={code}
                    className="bg-[#1a2234] rounded-lg p-2.5 border border-[#1e293b]/60 hover:border-[#1e293b] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm leading-none">{flag}</span>
                        <span className="text-xs font-bold text-[#f1f5f9] tracking-wide">
                          {code}
                        </span>
                      </div>
                      {/* Sparkline */}
                      {historyData.length >= 2 && (
                        <Sparkline
                          data={historyData}
                          width={50}
                          height={18}
                          color={trendColor}
                        />
                      )}
                    </div>
                    <p
                      className={`text-sm font-semibold font-mono ${
                        hasRate ? "text-[#f1f5f9]" : "text-[#475569]"
                      }`}
                    >
                      {formatRate(code, rate)}
                    </p>
                    <p className="text-[9px] text-[#475569] mt-0.5 truncate">
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
