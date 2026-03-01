"use client";

import dynamic from "next/dynamic";

// Leaflet cannot run on the server — import with ssr: false.
const ConflictMapView = dynamic(() => import("./ConflictMapView"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#1a2234] animate-pulse gap-3">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#334155]"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-[#475569] tracking-wide">
        Loading conflict map...
      </span>
    </div>
  ),
});

export default function ConflictMapPanel() {
  return (
    <div className="w-full h-full">
      <ConflictMapView />
    </div>
  );
}
