"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl } from "react-leaflet";

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

function createPlaneIcon(heading: number | null): L.DivIcon {
  const deg = heading ?? 0;
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(${deg}deg);
        filter: drop-shadow(0 0 3px rgba(6,182,212,0.6));
      ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="#06b6d4"
        >
          <!-- Plane body pointing up (north = 0deg) -->
          <path d="M12 2 L15.5 10 L22 10 L17 14 L19 22 L12 18 L5 22 L7 14 L2 10 L8.5 10 Z" />
        </svg>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    tooltipAnchor: [10, 0],
  });
}

export default function FlightMapView({ aircraft }: FlightMapViewProps) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Aircraft count badge */}
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

      <MapContainer
        center={[29, 52]}
        zoom={5}
        style={{ height: "100%", width: "100%", background: "#0a0e17" }}
        zoomControl={false}
      >
        <ZoomControl position="topright" />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        {aircraft.map((ac) => {
          const altFt =
            ac.altitude != null ? Math.round(ac.altitude * 3.281) : null;
          const speedKt =
            ac.velocity != null ? Math.round(ac.velocity * 1.944) : null;

          return (
            <Marker
              key={ac.icao24}
              position={[ac.latitude, ac.longitude]}
              icon={createPlaneIcon(ac.heading)}
            >
              <Tooltip
                direction="top"
                offset={[0, -8]}
                opacity={1}
                className="flight-tooltip"
              >
                <div
                  style={{
                    background: "rgba(17,24,39,0.95)",
                    border: "1px solid #1e3a5f",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    color: "#e2e8f0",
                    fontSize: "11px",
                    lineHeight: "1.6",
                    minWidth: "130px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#06b6d4",
                      fontSize: "13px",
                      marginBottom: "2px",
                    }}
                  >
                    {ac.callsign}
                  </div>
                  <div style={{ color: "#94a3b8" }}>{ac.country}</div>
                  {altFt != null && (
                    <div>
                      Alt:{" "}
                      <span style={{ color: "#f1f5f9" }}>
                        {altFt.toLocaleString()} ft
                      </span>
                    </div>
                  )}
                  {speedKt != null && (
                    <div>
                      Speed:{" "}
                      <span style={{ color: "#f1f5f9" }}>{speedKt} kts</span>
                    </div>
                  )}
                  {ac.squawk && (
                    <div>
                      Squawk:{" "}
                      <span style={{ color: "#fbbf24" }}>{ac.squawk}</span>
                    </div>
                  )}
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
