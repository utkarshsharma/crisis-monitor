import dynamic from "next/dynamic";
import Header from "@/components/Header";
import PanelCard from "@/components/PanelCard";
import NewsPanel from "@/components/panels/NewsPanel";
import ConflictMapPanel from "@/components/panels/ConflictMapPanel";
import FlightPanel from "@/components/panels/FlightPanel";
import MaritimePanel from "@/components/panels/MaritimePanel";
import WeatherPanel from "@/components/panels/WeatherPanel";
import InternetPanel from "@/components/panels/InternetPanel";
import SeismicPanel from "@/components/panels/SeismicPanel";
import ExchangeRatesPanel from "@/components/panels/ExchangeRatesPanel";
import AlertsPanel from "@/components/panels/AlertsPanel";
import QuickLinksPanel from "@/components/panels/QuickLinksPanel";
import TwitterPanel from "@/components/panels/TwitterPanel";
import TrendingImagesPanel from "@/components/panels/TrendingImagesPanel";
import OilPricePanel from "@/components/panels/OilPricePanel";

const WarOverlay = dynamic(() => import("@/components/WarOverlay"), { ssr: false });

/* ── Inline SVG icon helpers ── */
const IconNews = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
  </svg>
);

const IconMap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const IconPlane = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z" />
  </svg>
);

const IconShip = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
    <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" /><path d="M12 10v4" />
  </svg>
);

const IconWind = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>
);

const IconWifi = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

const IconSeismic = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconCurrency = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconOil = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
    <path d="M6 8h12" /><path d="M6 16h12" />
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconLink = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconTwitter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const IconImage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

/* ── Main Dashboard Page ── */
export default function DashboardPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0e17" }}>
      <WarOverlay />
      <Header />

      <main
        className="dashboard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gridAutoRows: "minmax(300px, auto)",
          gap: "1rem",
          padding: "1rem",
        }}
      >
        {/* Row 1: News + Twitter + Images + Conflict Map */}
        <PanelCard title="Live News Feed" icon={<IconNews />} colSpan={3} rowSpan={1} maxHeight={300}>
          <NewsPanel />
        </PanelCard>

        <PanelCard title="X / Twitter Feed" icon={<IconTwitter />} colSpan={3} rowSpan={1} maxHeight={300}>
          <TwitterPanel />
        </PanelCard>

        <PanelCard title="Conflict Map — Iran" icon={<IconMap />} colSpan={6} rowSpan={2} className="conflict-map-panel">
          <ConflictMapPanel />
        </PanelCard>

        <PanelCard title="Trending Images" icon={<IconImage />} colSpan={6} rowSpan={1}>
          <TrendingImagesPanel />
        </PanelCard>

        {/* Row 2: Oil Price (large) + Exchange Rates */}
        <PanelCard title="Markets" icon={<IconOil />} colSpan={8} rowSpan={2}>
          <OilPricePanel />
        </PanelCard>

        <PanelCard title="Exchange Rates (USD)" icon={<IconCurrency />} colSpan={4} rowSpan={2}>
          <ExchangeRatesPanel />
        </PanelCard>

        {/* Row 3: Flights + Maritime + Weather */}
        <PanelCard title="Flight Tracker" icon={<IconPlane />} colSpan={4}>
          <FlightPanel />
        </PanelCard>

        <PanelCard title="Maritime — Strait of Hormuz" icon={<IconShip />} colSpan={4}>
          <MaritimePanel />
        </PanelCard>

        <PanelCard title="Wind & Weather" icon={<IconWind />} colSpan={4}>
          <WeatherPanel />
        </PanelCard>

        {/* Row 4: Internet + Seismic */}
        <PanelCard title="Internet Status — Iran" icon={<IconWifi />} colSpan={4}>
          <InternetPanel />
        </PanelCard>

        <PanelCard title="Seismic Activity" icon={<IconSeismic />} colSpan={4}>
          <SeismicPanel />
        </PanelCard>

        {/* Row 4: Alerts + Quick Links */}
        <PanelCard title="Safety Alerts & Advisories" icon={<IconAlert />} colSpan={6}>
          <AlertsPanel />
        </PanelCard>

        <PanelCard title="Quick Links & OSINT Sources" icon={<IconLink />} colSpan={6}>
          <QuickLinksPanel />
        </PanelCard>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "1.5rem 1rem",
          borderTop: "1px solid #1e293b",
          color: "#475569",
          fontSize: 12,
        }}
      >
        CrisisMonitor — Open-source situation awareness dashboard. All data from publicly available sources.
        Not affiliated with any government or military organization. Verify all information independently.
      </footer>
    </div>
  );
}
