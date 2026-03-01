"use client";

import { useState } from "react";

const WINDY_URL =
  "https://embed.windy.com/embed2.html?lat=30&lon=52&detailLat=30&detailLon=52&width=650&height=450&zoom=5&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=kt&metricTemp=%C2%B0C&radarRange=-1";

export default function WeatherPanel() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative flex flex-col w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-[#1a2234] animate-pulse rounded z-10" />
      )}

      <div className="relative flex-1 min-h-0">
        <iframe
          src={WINDY_URL}
          title="Windy Iran Gulf Weather"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
          allow="fullscreen"
          onLoad={() => setLoaded(true)}
          style={{ display: "block" }}
        />
      </div>
    </div>
  );
}
