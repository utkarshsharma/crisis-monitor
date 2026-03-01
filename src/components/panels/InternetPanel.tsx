"use client";

const STATUS = {
  level: "critical" as const,
  label: "SEVERELY DISRUPTED",
  description: "Near-total internet blackout detected across Iran",
};

const STATS = [
  {
    label: "IPv6 Traffic",
    value: "Down 98.5%",
    color: "text-[#ef4444]",
  },
  {
    label: "Internet Status",
    value: "Near Total Shutdown",
    color: "text-[#ef4444]",
  },
  {
    label: "Duration",
    value: "Since Feb 28, 2026",
    color: "text-[#f59e0b]",
  },
  {
    label: "Cause",
    value: "Government-ordered blackout",
    color: "text-[#f1f5f9]",
  },
];

const SOURCES = [
  { label: "Cloudflare Radar" },
  { label: "NetBlocks" },
  { label: "OONI" },
  { label: "IODA Georgia Tech" },
];

function StatusCircle({ level }: { level: "critical" | "degraded" | "operational" }) {
  const colorMap = {
    critical: "bg-[#ef4444]",
    degraded: "bg-[#f59e0b]",
    operational: "bg-[#22c55e]",
  };
  const ringMap = {
    critical: "ring-[#ef4444]/30",
    degraded: "ring-[#f59e0b]/30",
    operational: "ring-[#22c55e]/30",
  };
  return (
    <span
      className={`inline-block w-4 h-4 rounded-full ${colorMap[level]} ring-4 ${ringMap[level]} shrink-0`}
    />
  );
}

export default function InternetPanel() {
  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e293b]">
      {/* Status indicator */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-950/30 border border-red-900/40">
        <StatusCircle level={STATUS.level} />
        <div>
          <p className="text-base font-bold tracking-widest text-[#ef4444] uppercase leading-tight">
            {STATUS.label}
          </p>
          <p className="text-xs text-[#94a3b8] mt-0.5">{STATUS.description}</p>
        </div>
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

      {/* Monitoring sources */}
      <div>
        <p className="text-xs text-[#475569] uppercase tracking-widest mb-2">
          Monitoring Sources
        </p>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((src) => (
            <span
              key={src.label}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1e293b] text-[#94a3b8] border border-[#2d3f57]"
            >
              {src.label}
            </span>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-[#334155] leading-relaxed mt-auto">
        Data based on public reports. Last major disruption detected Feb 28, 2026.
      </p>
    </div>
  );
}
