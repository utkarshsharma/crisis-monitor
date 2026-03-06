"use client";

import { useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Aircraft {
  icao24: string;
  callsign: string;
  country: string;
  longitude: number;
  latitude: number;
  altitude: number | null;
  onGround: boolean;
  velocity: number | null;
  heading: number | null;
  squawk: string | null;
}

interface FlightMapViewProps {
  aircraft: Aircraft[];
}

// ── Escape HTML to prevent XSS from upstream data ────────────────────────────

function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FlightMapView({ aircraft }: FlightMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Store the Leaflet map instance across renders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // Store the layer group that holds aircraft markers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerLayerRef = useRef<any>(null);

  // ── Effect 1: initialise map once ─────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamic require — must NOT be at module top level (next/dynamic ssr:false)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("leaflet/dist/leaflet.css");

    // ── Inject tooltip CSS ─────────────────────────────────────────────────

    const cssId = "flight-map-tooltip-css";
    if (!document.getElementById(cssId)) {
      const style = document.createElement("style");
      style.id = cssId;
      style.textContent = `
        .flight-tooltip {
          background: rgba(17,24,39,0.95) !important;
          border: 1px solid #1e3a5f !important;
          color: #e2e8f0 !important;
          font-size: 11px !important;
          font-family: ui-monospace, monospace !important;
          padding: 6px 10px !important;
          border-radius: 6px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.6) !important;
          line-height: 1.6 !important;
          min-width: 130px !important;
        }
        .leaflet-tooltip-top.flight-tooltip::before    { border-top-color:    #1e3a5f !important; }
        .leaflet-tooltip-bottom.flight-tooltip::before { border-bottom-color: #1e3a5f !important; }
        .leaflet-tooltip-left.flight-tooltip::before   { border-left-color:   #1e3a5f !important; }
        .leaflet-tooltip-right.flight-tooltip::before  { border-right-color:  #1e3a5f !important; }
      `;
      document.head.appendChild(style);
    }

    // ── Create map ─────────────────────────────────────────────────────────

    const map = L.map(containerRef.current, {
      center: [29, 52],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
        className: "flight-map-tiles",
      }
    ).addTo(map);

    // Inject tile filter CSS — inverts light tiles for dark water + lighter land
    const tileCssId = "flight-map-tile-filter";
    if (!document.getElementById(tileCssId)) {
      const tileStyle = document.createElement("style");
      tileStyle.id = tileCssId;
      tileStyle.textContent = `
        .flight-map-tiles {
          filter: brightness(0.4) contrast(1.8) saturate(0.15);
        }
      `;
      document.head.appendChild(tileStyle);
    }

    L.control.zoom({ position: "topright" }).addTo(map);

    // Layer group to hold all aircraft markers (cleared on each update)
    const markerLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markerLayerRef.current = markerLayer;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  // ── Effect 2: update aircraft markers whenever `aircraft` prop changes ─────

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) return;

    // Dynamic require — safe to call multiple times; module is cached after first load
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");

    // Clear existing aircraft markers
    markerLayer.clearLayers();

    for (const ac of aircraft) {
      if (
        typeof ac.latitude !== "number" ||
        typeof ac.longitude !== "number" ||
        isNaN(ac.latitude) ||
        isNaN(ac.longitude)
      ) {
        continue;
      }

      const heading = ac.heading ?? 0;

      const icon = L.divIcon({
        className: "",
        html: `<div style="transform:rotate(${heading}deg);color:#06b6d4;font-size:14px;filter:drop-shadow(0 0 3px #06b6d4)">✈</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        tooltipAnchor: [10, 0],
      });

      const altFt =
        ac.altitude != null ? Math.round(ac.altitude * 3.281) : null;
      const speedKt =
        ac.velocity != null ? Math.round(ac.velocity * 1.944) : null;

      // Build tooltip HTML (escape upstream strings to prevent XSS)
      const callsignLine = `<div style="font-weight:700;color:#06b6d4;font-size:13px;margin-bottom:2px;">${esc(ac.callsign || ac.icao24)}</div>`;
      const countryLine  = `<div style="color:#94a3b8;">${esc(ac.country)}</div>`;
      const altLine      = altFt  != null ? `<div>Alt: <span style="color:#f1f5f9;">${altFt.toLocaleString()} ft</span></div>` : "";
      const speedLine    = speedKt != null ? `<div>Speed: <span style="color:#f1f5f9;">${speedKt} kts</span></div>` : "";
      const squawkLine   = ac.squawk ? `<div>Squawk: <span style="color:#fbbf24;">${esc(ac.squawk)}</span></div>` : "";

      const tooltipHtml = callsignLine + countryLine + altLine + speedLine + squawkLine;

      L.marker([ac.latitude, ac.longitude], { icon })
        .bindTooltip(tooltipHtml, {
          direction: "top",
          className: "flight-tooltip",
          offset: [0, -8],
          opacity: 1,
        })
        .addTo(markerLayer);
    }
  }, [aircraft]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Aircraft count badge — plain DOM element, not inside the Leaflet map */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
          background: "rgba(17,24,39,0.9)",
          border: "1px solid #1e3a5f",
          borderRadius: "6px",
          padding: "4px 10px",
          color: "#06b6d4",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.03em",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          pointerEvents: "none",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="#06b6d4"
          style={{ flexShrink: 0 }}
        >
          <path d="M12 2 L15.5 10 L22 10 L17 14 L19 22 L12 18 L5 22 L7 14 L2 10 L8.5 10 Z" />
        </svg>
        {aircraft.length} aircraft
      </div>

      {/* Leaflet map container */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", background: "#0a0e17" }}
      />
    </div>
  );
}
