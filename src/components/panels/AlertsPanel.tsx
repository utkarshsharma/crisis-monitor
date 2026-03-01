"use client";

interface Alert {
  severity: "red" | "amber" | "green";
  title: string;
  body: string;
  linkLabel: string;
  href: string;
}

const ALERTS: Alert[] = [
  {
    severity: "red",
    title: "UAE — NCEMA Emergency Alerts Active",
    body: "UAE National Emergency Crisis and Disasters Management Authority: emergency alerts active. Shelter-in-place guidance issued for affected areas.",
    linkLabel: "ncema.gov.ae",
    href: "https://www.ncema.gov.ae",
  },
  {
    severity: "red",
    title: "US Embassy UAE — Shelter-in-Place Advisory",
    body: "The US Embassy in Abu Dhabi issued a shelter-in-place advisory on Feb 28. All US citizens in the UAE should review guidance and monitor official channels.",
    linkLabel: "ae.usembassy.gov",
    href: "https://ae.usembassy.gov",
  },
  {
    severity: "amber",
    title: "EASA CZIB — Airspace Restrictions",
    body: "EASA Conflict Zone Information Bulletin: All altitudes restricted over Iran, Iraq, UAE, and 8 other states. Operators urged to review conflict zone assessments before flight.",
    linkLabel: "EASA Conflict Zones",
    href: "https://www.easa.europa.eu/en/domains/air-operations/conflict-zones",
  },
  {
    severity: "amber",
    title: "UKMTO — Strait of Hormuz",
    body: "IRGC claiming Strait of Hormuz 'closed' on VHF Channel 16. Masters and owners advised to exercise extreme caution and report to UKMTO. Verify all contacts.",
    linkLabel: "ukmto.org",
    href: "https://www.ukmto.org",
  },
  {
    severity: "green",
    title: "Embassy Registration — Register Now",
    body: "All travelers are urged to register with their home embassy: STEP (US citizens), ROCA (Canadians), MADAD (Indian nationals), Smartraveller (Australians).",
    linkLabel: "View registration links",
    href: "https://step.state.gov",
  },
];

const BORDER_COLOR: Record<Alert["severity"], string> = {
  red: "border-[#ef4444]",
  amber: "border-[#f59e0b]",
  green: "border-[#22c55e]",
};

const BADGE_COLOR: Record<Alert["severity"], string> = {
  red: "bg-red-950/60 text-[#ef4444] border-red-800/50",
  amber: "bg-amber-950/60 text-[#f59e0b] border-amber-800/50",
  green: "bg-green-950/60 text-[#22c55e] border-green-900/50",
};

const BADGE_LABEL: Record<Alert["severity"], string> = {
  red: "CRITICAL",
  amber: "WARNING",
  green: "INFO",
};

const LINK_COLOR: Record<Alert["severity"], string> = {
  red: "text-[#ef4444] hover:text-red-300",
  amber: "text-[#f59e0b] hover:text-amber-300",
  green: "text-[#22c55e] hover:text-green-300",
};

function ExternalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-3 h-3 inline-block ml-0.5 -mt-0.5"
    >
      <path d="M2.5 9.5 9.5 2.5M9.5 2.5H4M9.5 2.5V8" />
    </svg>
  );
}

export default function AlertsPanel() {
  return (
    <div className="flex flex-col h-full p-4">
      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]" />
        </span>
        <span className="text-xs text-[#94a3b8]">
          {ALERTS.filter((a) => a.severity === "red").length} critical &middot;{" "}
          {ALERTS.filter((a) => a.severity === "amber").length} warnings
        </span>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e293b]">
        {ALERTS.map((alert, i) => (
          <div
            key={i}
            className={`bg-[#1a2234] rounded-lg p-3 border-l-4 ${BORDER_COLOR[alert.severity]}`}
          >
            {/* Badge + title row */}
            <div className="flex items-start gap-2 mb-1.5">
              <span
                className={`shrink-0 mt-0.5 text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border ${BADGE_COLOR[alert.severity]}`}
              >
                {BADGE_LABEL[alert.severity]}
              </span>
              <p className="text-sm font-medium text-[#f1f5f9] leading-snug">
                {alert.title}
              </p>
            </div>

            {/* Body */}
            <p className="text-xs text-[#94a3b8] leading-relaxed mb-2">
              {alert.body}
            </p>

            {/* Link */}
            <a
              href={alert.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs font-medium transition-colors ${LINK_COLOR[alert.severity]}`}
            >
              {alert.linkLabel}
              <ExternalIcon />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
