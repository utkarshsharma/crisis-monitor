"use client";

const STATS = [
  {
    label: "Ship Traffic",
    value: "Down ~70%",
    color: "text-[#ef4444]",
  },
  {
    label: "Oil Transit",
    value: "~21M barrels/day normally",
    color: "text-[#f59e0b]",
  },
  {
    label: "Chokepoint Width",
    value: "21 nautical miles",
    color: "text-[#f1f5f9]",
  },
  {
    label: "IRGC Claims",
    value: "Closure on VHF Ch.16",
    color: "text-[#ef4444]",
  },
];

const KEY_EVENTS = [
  {
    id: 1,
    time: "Mar 01, 2026",
    text: "UKMTO Advisory 003-26: Vessels advised to maintain caution in Strait of Hormuz",
  },
  {
    id: 2,
    time: "Feb 28, 2026",
    text: "Maersk suspended Gulf transit operations pending security assessment",
  },
  {
    id: 3,
    time: "Feb 28, 2026",
    text: "Iran IRGC broadcasting Hormuz closure on VHF Channel 16",
  },
  {
    id: 4,
    time: "Feb 27, 2026",
    text: "Lloyd's JWC war risk premiums up 60%+ for Gulf transits",
  },
];

const MONITORING_SOURCES = [
  { label: "MarineTraffic", href: "https://www.marinetraffic.com/en/ais/home/centerx/56.3/centery/26.5/zoom/8" },
  { label: "VesselFinder", href: "https://www.vesselfinder.com/?zoom=8&lat=26.5&lng=56.3" },
  { label: "UKMTO", href: "https://www.ukmto.org/" },
  { label: "MARAD", href: "https://www.maritime.dot.gov/msci/maritime-advisories" },
];

export default function MaritimePanel() {
  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e293b]">
      {/* Status bar */}
      <div className="px-4 py-3 rounded-lg bg-amber-950/30 border border-amber-800/40">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ef4444] ring-4 ring-[#ef4444]/25 shrink-0" />
          <span className="text-xs font-semibold tracking-widest text-[#f59e0b] uppercase">
            Strait of Hormuz
          </span>
        </div>
        <p className="text-base font-bold tracking-wide text-[#ef4444] uppercase leading-tight">
          Traffic Disrupted
        </p>
        <p className="text-xs text-[#94a3b8] mt-1">
          Major shipping disruption. IRGC asserting closure. Global energy markets impacted.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 px-3 py-2.5 rounded-lg bg-[#111827] border border-[#1e293b]"
          >
            <span className="text-xs text-[#475569] uppercase tracking-wide leading-none">
              {stat.label}
            </span>
            <span className={`text-sm font-semibold leading-snug ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Key events */}
      <div>
        <p className="text-xs text-[#475569] uppercase tracking-widest mb-2">
          Key Events
        </p>
        <div className="flex flex-col gap-1.5">
          {KEY_EVENTS.map((event) => (
            <div
              key={event.id}
              className="flex gap-3 px-3 py-2.5 rounded-lg bg-[#111827] border border-[#1e293b]"
            >
              <div className="flex flex-col items-center pt-0.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mt-1" />
                <span className="w-px flex-1 bg-[#1e293b] mt-1" />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-xs text-[#475569] mb-0.5">{event.time}</p>
                <p className="text-sm text-[#f1f5f9] leading-snug">{event.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monitoring sources */}
      <div>
        <p className="text-xs text-[#475569] uppercase tracking-widest mb-2">
          Live Monitoring Sources
        </p>
        <div className="flex flex-wrap gap-2">
          {MONITORING_SOURCES.map((src) => (
            <a
              key={src.label}
              href={src.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1e293b] text-[#06b6d4] border border-[#2d3f57] hover:bg-[#263348] hover:text-[#f1f5f9] transition-colors"
            >
              {src.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
