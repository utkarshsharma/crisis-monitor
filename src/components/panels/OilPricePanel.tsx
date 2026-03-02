"use client";

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

const TABS = [
  { id: "oil", label: "Oil (WTI)", symbol: "TVC:USOIL" },
  { id: "vix", label: "VIX (VIXY)", symbol: "AMEX:VIXY" },
  { id: "btc", label: "BTC", symbol: "BITSTAMP:BTCUSD" },
  { id: "sp500", label: "S&P 500 (SPY)", symbol: "AMEX:SPY" },
  { id: "gold", label: "Gold", symbol: "TVC:GOLD" },
];

const WIDGET_CONFIG_BASE: Record<string, unknown> = {
  interval: "D",
  timezone: "Etc/UTC",
  theme: "dark",
  style: "1",
  locale: "en",
  enable_publishing: false,
  allow_symbol_change: false,
  hide_side_toolbar: false,
  withdateranges: true,
  details: true,
  calendar: false,
  autosize: true,
  backgroundColor: "#111827",
  gridColor: "#1e293b",
  toolbar_bg: "#111827",
  studies: ["MASimple@tv-basicstudies"],
  overrides: {
    "paneProperties.background": "#111827",
    "paneProperties.backgroundType": "solid",
    "scalesProperties.backgroundColor": "#111827",
    "mainSeriesProperties.candleStyle.upColor": "#22c55e",
    "mainSeriesProperties.candleStyle.downColor": "#ef4444",
    "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e",
    "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
  },
};

export default function OilPricePanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("oil");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);

  // Load TradingView script once
  useEffect(() => {
    if (window.TradingView) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Create/recreate widget when tab changes or script loads
  const initWidget = useCallback(
    (symbol: string) => {
      if (!scriptLoaded || !window.TradingView || !containerRef.current) return;
      const containerId = "tradingview-market-chart";
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = "";
      setWidgetReady(false);

      new window.TradingView.widget({
        ...WIDGET_CONFIG_BASE,
        symbol,
        container_id: containerId,
      });
      // Small delay for iframe to render
      setTimeout(() => setWidgetReady(true), 300);
    },
    [scriptLoaded]
  );

  useEffect(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (tab) initWidget(tab.symbol);
  }, [activeTab, initWidget]);

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[#1e293b] flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wide transition-all duration-150 ${
              activeTab === tab.id
                ? "bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/30"
                : "text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1a2234] border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="relative flex-1 min-h-0">
        {!widgetReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111827] z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-2 border-[#334155] border-t-[#06b6d4] rounded-full animate-spin" />
              <span className="text-[10px] text-[#64748b] tracking-wide">
                Loading {TABS.find((t) => t.id === activeTab)?.label} chart...
              </span>
            </div>
          </div>
        )}
        <div
          id="tradingview-market-chart"
          ref={containerRef}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
