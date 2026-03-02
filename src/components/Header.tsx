"use client";

import { useEffect, useState } from "react";

function ShieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="28"
      height="28"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function PulsingDot({ color }: { color: "green" | "red" }) {
  const baseColor =
    color === "green"
      ? { ring: "rgba(34,197,94,0.4)", dot: "#22c55e" }
      : { ring: "rgba(239,68,68,0.4)", dot: "#ef4444" };

  return (
    <span
      style={{ position: "relative", display: "inline-flex", width: 10, height: 10 }}
      aria-hidden="true"
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "9999px",
          backgroundColor: baseColor.ring,
          animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
        }}
      />
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          width: 10,
          height: 10,
          borderRadius: "9999px",
          backgroundColor: baseColor.dot,
        }}
      />
    </span>
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function Header() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
      <header
        className="header-main"
        style={{
          backgroundColor: "#111827",
          borderBottom: "1px solid #1e293b",
          height: 64,
          paddingLeft: 24,
          paddingRight: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Left: Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#ef4444" }}>
            <ShieldIcon />
          </span>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span
              className="header-brand-text"
              style={{
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#f1f5f9",
              }}
            >
              CRISISMONITOR
            </span>
            <span
              className="header-brand-sub"
              style={{
                fontSize: 9,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              REAL-TIME SITUATION AWARENESS
            </span>
          </div>
        </div>

        {/* Center: Live Clock */}
        <div
          className="header-clock"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            lineHeight: 1.3,
            fontFamily: "var(--font-geist-mono, monospace)",
          }}
        >
          <span
            className="clock-time"
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#f1f5f9",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {now ? formatTime(now) : "--:--:--"}
          </span>
          <span
            className="clock-date"
            style={{
              fontSize: 11,
              color: "#64748b",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {now ? formatDate(now) : "--- -- ----"}
          </span>
        </div>

        {/* Right: Telegram + Status Badges */}
        <div className="header-right-badges" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Follow on Telegram link */}
          <a
            href="https://t.me/crisis_monitor"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "rgba(0,136,204,0.1)",
              border: "1px solid rgba(0,136,204,0.3)",
              borderRadius: 6,
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 5,
              paddingBottom: 5,
              cursor: "pointer",
              textDecoration: "none",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,136,204,0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,136,204,0.1)")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#0088cc",
                fontFamily: "var(--font-geist-mono, monospace)",
              }}
            >
              <span className="telegram-text">Monitor The Situation @crisis_monitor</span>
            </span>
          </a>

          {/* Active Monitoring badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: 6,
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 5,
              paddingBottom: 5,
            }}
          >
            <PulsingDot color="green" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#22c55e",
                fontFamily: "var(--font-geist-mono, monospace)",
              }}
            >
              <span className="badge-text">ACTIVE MONITORING</span>
            </span>
          </div>

          {/* Threat Level badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 6,
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 5,
              paddingBottom: 5,
            }}
          >
            <PulsingDot color="red" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#ef4444",
                fontFamily: "var(--font-geist-mono, monospace)",
              }}
            >
              <span className="badge-text">THREAT LEVEL: HIGH</span>
            </span>
          </div>
        </div>
      </header>
    </>
  );
}
