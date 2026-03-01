"use client";

interface QuickLink {
  label: string;
  href: string;
}

interface LinkSection {
  heading: string;
  links: QuickLink[];
}

const SECTIONS: LinkSection[] = [
  {
    heading: "Flights",
    links: [
      { label: "FlightRadar24", href: "https://www.flightradar24.com" },
      { label: "ADS-B Exchange", href: "https://globe.adsbexchange.com" },
      { label: "Safe Airspace", href: "https://safeairspace.net" },
      { label: "IntelSky", href: "https://www.intelsky.io" },
    ],
  },
  {
    heading: "Maps & OSINT",
    links: [
      { label: "LiveUAMap", href: "https://liveuamap.com" },
      { label: "ISW / CTP", href: "https://www.understandingwar.org/iswreports" },
      { label: "GeoConfirmed", href: "https://geoconfirmed.com" },
      { label: "Bellingcat", href: "https://www.bellingcat.com" },
    ],
  },
  {
    heading: "News",
    links: [
      { label: "Al Jazeera", href: "https://www.aljazeera.com" },
      { label: "The War Zone", href: "https://www.thedrive.com/the-war-zone" },
      { label: "Reuters ME", href: "https://www.reuters.com/world/middle-east/" },
      { label: "Iran International", href: "https://www.iranintl.com/en" },
    ],
  },
  {
    heading: "Maritime",
    links: [
      { label: "MarineTraffic", href: "https://www.marinetraffic.com" },
      { label: "UKMTO", href: "https://www.ukmto.org" },
      { label: "VesselFinder", href: "https://www.vesselfinder.com" },
    ],
  },
  {
    heading: "Dashboards",
    links: [
      { label: "IranMonitor", href: "https://iranmonitor.com" },
      { label: "WarScan", href: "https://warscan.net" },
      { label: "WorldMonitor", href: "https://www.worldmonitor.com" },
      { label: "SignalCockpit", href: "https://signalcockpit.com" },
    ],
  },
  {
    heading: "Safety",
    links: [
      { label: "NCEMA UAE", href: "https://www.ncema.gov.ae" },
      { label: "US Embassy UAE", href: "https://ae.usembassy.gov" },
      { label: "UK FCDO", href: "https://www.gov.uk/foreign-travel-advice/iran" },
      {
        label: "EASA CZIBs",
        href: "https://www.easa.europa.eu/en/domains/air-operations/conflict-zones",
      },
    ],
  },
];

function ExternalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-3 h-3 shrink-0"
      aria-hidden="true"
    >
      <path d="M2.5 9.5 9.5 2.5M9.5 2.5H4M9.5 2.5V8" />
    </svg>
  );
}

export default function QuickLinksPanel() {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e293b]">
        <div className="space-y-5">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              {/* Section heading */}
              <p className="text-xs uppercase tracking-wider text-[#94a3b8] mb-2 font-medium">
                {section.heading}
              </p>

              {/* Links — wrap into rows of 2 */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                {section.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[#94a3b8] hover:text-[#06b6d4] transition-colors truncate"
                  >
                    <span className="truncate">{link.label}</span>
                    <ExternalIcon />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
