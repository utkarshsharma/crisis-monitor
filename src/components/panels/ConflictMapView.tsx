"use client";

import { useEffect, useRef } from "react";

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

// ── Static location data ──────────────────────────────────────────────────────

const NUCLEAR_TARGETS: Array<{ name: string; pos: [number, number] }> = [
  { name: "Natanz Nuclear Facility",     pos: [33.724, 51.727] },
  { name: "Isfahan Nuclear Tech Center", pos: [32.652, 51.676] },
  { name: "Fordow Enrichment Plant",     pos: [34.883, 51.986] },
  { name: "Arak Heavy Water Reactor",    pos: [34.344, 49.243] },
  { name: "Bushehr Nuclear Power Plant", pos: [28.833, 50.889] },
  { name: "Tehran (Capital)",            pos: [35.689, 51.389] },
];

const MAJOR_CITIES: Array<{ name: string; pos: [number, number] }> = [
  { name: "Dubai, UAE",           pos: [25.276, 55.296] },
  { name: "Abu Dhabi, UAE",       pos: [24.453, 54.377] },
  { name: "Doha, Qatar",          pos: [25.286, 51.534] },
  { name: "Riyadh, Saudi Arabia", pos: [24.713, 46.675] },
  { name: "Baghdad, Iraq",        pos: [33.312, 44.366] },
  { name: "Manama, Bahrain",      pos: [26.225, 50.586] },
  { name: "Kuwait City, Kuwait",  pos: [29.376, 47.977] },
];

const MILITARY_BASES: Array<{ name: string; pos: [number, number] }> = [
  { name: "Al Udeid Air Base (US)",     pos: [25.117, 51.315] },
  { name: "Al Dhafra Air Base (US)",    pos: [24.248, 54.548] },
  { name: "Camp Arifjan, Kuwait (US)",  pos: [29.167, 48.083] },
  { name: "NSA Bahrain (US 5th Fleet)", pos: [26.193, 50.594] },
];

const CHOKEPOINTS: Array<{ name: string; pos: [number, number] }> = [
  { name: "Strait of Hormuz", pos: [26.565, 56.250] },
];

// ── Color maps ────────────────────────────────────────────────────────────────

const COLOR_HEX: Record<string, string> = {
  red:    "#ef4444",
  blue:   "#3b82f6",
  green:  "#22c55e",
  amber:  "#f59e0b",
  orange: "#f97316",
};

// ── Legend items ──────────────────────────────────────────────────────────────

const LEGEND_ITEMS: Array<{ color: string; label: string }> = [
  { color: "#ef4444", label: "Nuclear / Targets" },
  { color: "#3b82f6", label: "Major Cities" },
  { color: "#22c55e", label: "US Military" },
  { color: "#f59e0b", label: "Chokepoint" },
  { color: "#f97316", label: "Seismic (M3+)" },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function ConflictMapView() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamic require — must NOT be at module top level (next/dynamic ssr:false)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("leaflet/dist/leaflet.css");

    // ── Inject global CSS (tooltip styles + pulse animation) ─────────────────

    const cssId = "conflict-map-global-css";
    if (!document.getElementById(cssId)) {
      const style = document.createElement("style");
      style.id = cssId;
      style.textContent = `
        @keyframes quake-pulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(2.8); opacity: 0;   }
          100% { transform: scale(1);   opacity: 0;   }
        }
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
        .leaflet-tooltip-right::before  { border-right-color:  #334155 !important; }
        .leaflet-tooltip-left::before   { border-left-color:   #334155 !important; }
        .leaflet-tooltip-top::before    { border-top-color:    #334155 !important; }
        .leaflet-tooltip-bottom::before { border-bottom-color: #334155 !important; }
      `;
      document.head.appendChild(style);
    }

    // ── Helper: solid circle divIcon ─────────────────────────────────────────

    function makeDivIcon(colorKey: string, size = 12): ReturnType<typeof L.divIcon> {
      const hex = COLOR_HEX[colorKey] ?? "#ffffff";
      return L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${hex};border:2px solid rgba(255,255,255,0.55);box-shadow:0 0 6px 2px ${hex}80;"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        tooltipAnchor: [size / 2 + 2, 0],
      });
    }

    // ── Helper: pulsing circle divIcon ───────────────────────────────────────

    function makePulsingIcon(colorKey: string, size = 10): ReturnType<typeof L.divIcon> {
      const hex = COLOR_HEX[colorKey] ?? "#f97316";
      return L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:${size}px;height:${size}px;">
            <div style="position:absolute;inset:0;border-radius:50%;background:${hex}55;animation:quake-pulse 2s ease-out infinite;transform-origin:center;"></div>
            <div style="position:absolute;inset:2px;border-radius:50%;background:${hex};border:1px solid rgba(255,255,255,0.6);"></div>
          </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        tooltipAnchor: [size / 2 + 2, 0],
      });
    }

    // ── Create map ───────────────────────────────────────────────────────────

    const map: ReturnType<typeof L.map> = L.map(mapRef.current, {
      center: [30, 52],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    // CartoDB Positron tiles with CSS filter for dark mode + high land/sea contrast
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap, &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19,
        className: "conflict-map-tiles",
      }
    ).addTo(map);

    // Inject tile filter CSS — inverts the light tiles to create dark water + lighter land
    const tileCssId = "conflict-map-tile-filter";
    if (!document.getElementById(tileCssId)) {
      const tileStyle = document.createElement("style");
      tileStyle.id = tileCssId;
      tileStyle.textContent = `
        .conflict-map-tiles {
          filter: brightness(0.4) contrast(1.8) saturate(0.15);
        }
      `;
      document.head.appendChild(tileStyle);
    }

    // Zoom control (top-right)
    L.control.zoom({ position: "topright" }).addTo(map);

    // Attribution (bottom-left)
    L.control.attribution({ position: "bottomleft" }).addTo(map);

    // ── Static markers ───────────────────────────────────────────────────────

    const staticMarkers: ReturnType<typeof L.marker>[] = [];

    function addMarkers(
      list: Array<{ name: string; pos: [number, number] }>,
      colorKey: string
    ) {
      for (const loc of list) {
        const m = L.marker(loc.pos, { icon: makeDivIcon(colorKey) })
          .bindTooltip(loc.name, {
            direction: "right",
            className: "map-tooltip",
            offset: [6, 0],
          })
          .addTo(map);
        staticMarkers.push(m);
      }
    }

    addMarkers(NUCLEAR_TARGETS, "red");
    addMarkers(MAJOR_CITIES,    "blue");
    addMarkers(MILITARY_BASES,  "green");
    addMarkers(CHOKEPOINTS,     "amber");

    // ── Earthquake markers ───────────────────────────────────────────────────

    const eqMarkers: ReturnType<typeof L.marker>[] = [];
    let cancelled = false;

    async function loadEarthquakes() {
      try {
        const res = await fetch("/api/earthquakes");
        if (!res.ok || cancelled) return;
        const data: EarthquakeResponse = await res.json();
        if (cancelled) return;

        // Clear previous earthquake markers
        eqMarkers.forEach((m) => m.remove());
        eqMarkers.length = 0;

        for (const eq of data.earthquakes ?? []) {
          const [lon, lat] = eq.coordinates;
          if (typeof lat !== "number" || typeof lon !== "number") continue;

          const mag  = eq.magnitude;
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

          eqMarkers.push(m);
        }
      } catch {
        // silently ignore fetch errors
      }
    }

    loadEarthquakes();
    const eqInterval = setInterval(loadEarthquakes, 5 * 60 * 1000);

    // ── Legend (injected as a Leaflet custom control) ─────────────────────────

    const LegendControl = L.Control.extend({
      options: { position: "bottomright" },
      onAdd() {
        const div = L.DomUtil.create("div");
        div.style.cssText = [
          "background:rgba(17,24,39,0.90)",
          "backdrop-filter:blur(6px)",
          "border-radius:6px",
          "padding:10px 12px",
          "font-size:11px",
          "color:#cbd5e1",
          "border:1px solid #1e293b",
          "min-width:148px",
          "box-shadow:0 4px 12px rgba(0,0,0,0.5)",
          "pointer-events:none",
        ].join(";");

        const title = document.createElement("div");
        title.style.cssText =
          "font-weight:600;margin-bottom:6px;color:#94a3b8;letter-spacing:0.05em;text-transform:uppercase;font-size:9px;";
        title.textContent = "Legend";
        div.appendChild(title);

        for (const item of LEGEND_ITEMS) {
          const row = document.createElement("div");
          row.style.cssText =
            "display:flex;align-items:center;gap:7px;margin-bottom:5px;";

          const dot = document.createElement("div");
          dot.style.cssText = [
            `background:${item.color}`,
            "width:10px",
            "height:10px",
            "border-radius:50%",
            "border:1.5px solid rgba(255,255,255,0.4)",
            "flex-shrink:0",
            `box-shadow:0 0 4px ${item.color}80`,
          ].join(";");

          const lbl = document.createElement("span");
          lbl.textContent = item.label;

          row.appendChild(dot);
          row.appendChild(lbl);
          div.appendChild(row);
        }

        return div;
      },
    });

    new LegendControl().addTo(map);

    // ── Cleanup ───────────────────────────────────────────────────────────────

    return () => {
      cancelled = true;
      clearInterval(eqInterval);
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", background: "#0a0e17" }}
    />
  );
}
