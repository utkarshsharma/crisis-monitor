"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, AttributionControl, useMap } from "react-leaflet";
import L from "leaflet";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Earthquake {
  magnitude: number;
  place: string;
  time: number;
  url: string;
  coordinates: [number, number, number]; // [lon, lat, depth]
}

interface EarthquakeResponse {
  earthquakes: Earthquake[];
}

// ── Marker helpers ────────────────────────────────────────────────────────────

type MarkerColor = "red" | "blue" | "green" | "amber" | "orange";

function makeDivIcon(color: MarkerColor, size = 12): L.DivIcon {
  const colorMap: Record<MarkerColor, string> = {
    red:    "#ef4444",
    blue:   "#3b82f6",
    green:  "#22c55e",
    amber:  "#f59e0b",
    orange: "#f97316",
  };
  const hex = colorMap[color];
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;
      height:${size}px;
      background:${hex};
      border:2px solid rgba(255,255,255,0.55);
      border-radius:50%;
      box-shadow:0 0 6px 2px ${hex}80;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [size / 2 + 2, 0],
  });
}

function makePulsingIcon(color: MarkerColor, size = 10): L.DivIcon {
  const colorMap: Record<MarkerColor, string> = {
    red:    "#ef4444",
    blue:   "#3b82f6",
    green:  "#22c55e",
    amber:  "#f59e0b",
    orange: "#f97316",
  };
  const hex = colorMap[color];
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div style="
          position:absolute;inset:0;
          border-radius:50%;
          background:${hex}55;
          animation:quake-pulse 2s ease-out infinite;
          transform-origin:center;
        "></div>
        <div style="
          position:absolute;inset:2px;
          border-radius:50%;
          background:${hex};
          border:1px solid rgba(255,255,255,0.6);
        "></div>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [size / 2 + 2, 0],
  });
}

// ── Static location data ──────────────────────────────────────────────────────

const NUCLEAR_TARGETS: Array<{ name: string; pos: [number, number] }> = [
  { name: "Natanz Nuclear Facility",       pos: [33.724, 51.727] },
  { name: "Isfahan Nuclear Tech Center",   pos: [32.652, 51.676] },
  { name: "Fordow Enrichment Plant",       pos: [34.883, 51.986] },
  { name: "Arak Heavy Water Reactor",      pos: [34.344, 49.243] },
  { name: "Bushehr Nuclear Power Plant",   pos: [28.833, 50.889] },
  { name: "Tehran (Capital)",              pos: [35.689, 51.389] },
];

const MAJOR_CITIES: Array<{ name: string; pos: [number, number] }> = [
  { name: "Dubai, UAE",             pos: [25.276, 55.296] },
  { name: "Abu Dhabi, UAE",         pos: [24.453, 54.377] },
  { name: "Doha, Qatar",            pos: [25.286, 51.534] },
  { name: "Riyadh, Saudi Arabia",   pos: [24.713, 46.675] },
  { name: "Baghdad, Iraq",          pos: [33.312, 44.366] },
  { name: "Manama, Bahrain",        pos: [26.225, 50.586] },
  { name: "Kuwait City, Kuwait",    pos: [29.376, 47.977] },
  { name: "Muscat, Oman",           pos: [23.614, 58.545] },
];

const MILITARY_BASES: Array<{ name: string; pos: [number, number] }> = [
  { name: "Al Udeid Air Base (US)",      pos: [25.117, 51.315] },
  { name: "Al Dhafra Air Base (US)",     pos: [24.248, 54.548] },
  { name: "Camp Arifjan, Kuwait (US)",   pos: [29.167, 48.083] },
  { name: "NSA Bahrain (US 5th Fleet)",  pos: [26.193, 50.594] },
];

const CHOKEPOINTS: Array<{ name: string; pos: [number, number] }> = [
  { name: "Strait of Hormuz (Chokepoint)", pos: [26.565, 56.250] },
];

// ── CSS injection for pulsing animation ──────────────────────────────────────

function InjectPulseCSS() {
  useMap(); // must be a child of MapContainer
  useEffect(() => {
    const id = "quake-pulse-css";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes quake-pulse {
        0%   { transform: scale(1);   opacity: 0.7; }
        70%  { transform: scale(2.8); opacity: 0;   }
        100% { transform: scale(1);   opacity: 0;   }
      }
    `;
    document.head.appendChild(style);
    return () => { /* leave in DOM — harmless */ };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

// ── Static markers layer ──────────────────────────────────────────────────────

function StaticMarkers() {
  const map = useMap();

  useEffect(() => {
    const markers: L.Marker[] = [];

    function addMarkers(
      list: Array<{ name: string; pos: [number, number] }>,
      color: MarkerColor,
    ) {
      for (const loc of list) {
        const m = L.marker(loc.pos, { icon: makeDivIcon(color) })
          .bindTooltip(loc.name, {
            direction: "right",
            className: "map-tooltip",
            offset: [6, 0],
          })
          .addTo(map);
        markers.push(m);
      }
    }

    addMarkers(NUCLEAR_TARGETS, "red");
    addMarkers(MAJOR_CITIES,    "blue");
    addMarkers(MILITARY_BASES,  "green");
    addMarkers(CHOKEPOINTS,     "amber");

    // Inject tooltip CSS once
    const cssId = "map-tooltip-css";
    if (!document.getElementById(cssId)) {
      const style = document.createElement("style");
      style.id = cssId;
      style.textContent = `
        .map-tooltip {
          background: #111827ee !important;
          border: 1px solid #334155 !important;
          color: #e2e8f0 !important;
          font-size: 11px !important;
          font-family: ui-monospace, monospace !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
          white-space: nowrap !important;
        }
        .map-tooltip::before {
          border-right-color: #334155 !important;
        }
        .leaflet-tooltip-right::before {
          border-right-color: #334155 !important;
        }
        .leaflet-tooltip-left::before {
          border-left-color: #334155 !important;
        }
        .leaflet-tooltip-top::before {
          border-top-color: #334155 !important;
        }
        .leaflet-tooltip-bottom::before {
          border-bottom-color: #334155 !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      markers.forEach((m) => m.remove());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ── Earthquake markers layer ──────────────────────────────────────────────────

function EarthquakeMarkers() {
  const map = useMap();
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/earthquakes");
        if (!res.ok) return;
        const data: EarthquakeResponse = await res.json();
        if (cancelled) return;

        // Clear previous
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        for (const eq of data.earthquakes ?? []) {
          // coordinates = [lon, lat, depth]
          const [lon, lat] = eq.coordinates;
          const mag = eq.magnitude;
          if (typeof lat !== "number" || typeof lon !== "number") continue;

          const size = Math.max(8, Math.min(22, mag * 3.5));
          const icon = makePulsingIcon("orange", size);

          const label = `M${mag.toFixed(1)} — ${eq.place}`;
          const m = L.marker([lat, lon], { icon })
            .bindTooltip(label, {
              direction: "top",
              className: "map-tooltip",
              offset: [0, -size / 2 - 2],
            })
            .addTo(map);

          markersRef.current.push(m);
        }
      } catch {
        // silently ignore fetch errors on the map layer
      }
    }

    load();
    const interval = setInterval(load, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ── Legend ────────────────────────────────────────────────────────────────────

const LEGEND_ITEMS: Array<{ color: string; label: string }> = [
  { color: "#ef4444", label: "Nuclear / Targets" },
  { color: "#3b82f6", label: "Major Cities" },
  { color: "#22c55e", label: "US Military" },
  { color: "#f59e0b", label: "Chokepoint" },
  { color: "#f97316", label: "Seismic (M3+)" },
];

function MapLegend() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "28px",
        right: "10px",
        zIndex: 1000,
        background: "rgba(17,24,39,0.90)",
        backdropFilter: "blur(6px)",
        borderRadius: "6px",
        padding: "10px 12px",
        fontSize: "11px",
        color: "#cbd5e1",
        border: "1px solid #1e293b",
        minWidth: "148px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        pointerEvents: "none",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: "6px", color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "9px" }}>
        Legend
      </div>
      {LEGEND_ITEMS.map(({ color, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}>
          <div style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: color,
            border: "1.5px solid rgba(255,255,255,0.4)",
            flexShrink: 0,
            boxShadow: `0 0 4px ${color}80`,
          }} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main map component ────────────────────────────────────────────────────────

export default function ConflictMapView() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer
        center={[30, 52]}
        zoom={5}
        style={{ height: "100%", width: "100%", background: "#0a0e17" }}
        zoomControl={false}
        attributionControl={false}
      >
        {/* Dark map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap, &copy; CARTO"
          subdomains="abcd"
          maxZoom={19}
        />

        <ZoomControl position="topright" />
        <AttributionControl position="bottomleft" />

        {/* Pulse animation keyframes */}
        <InjectPulseCSS />

        {/* Marker layers */}
        <StaticMarkers />
        <EarthquakeMarkers />
      </MapContainer>

      {/* Legend overlay — outside MapContainer so it's not affected by map transforms */}
      <MapLegend />
    </div>
  );
}
