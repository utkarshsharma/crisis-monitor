import { ReactNode, CSSProperties } from "react";

interface PanelCardProps {
  title: string;
  icon: ReactNode;
  colSpan?: number;
  rowSpan?: number;
  maxHeight?: number;
  children?: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

const ROW_HEIGHT_PX = 300;

export default function PanelCard({
  title,
  icon,
  colSpan = 4,
  rowSpan = 1,
  maxHeight,
  children,
  className = "",
  headerRight,
}: PanelCardProps) {
  const minHeight = rowSpan * ROW_HEIGHT_PX;

  const containerStyle: CSSProperties = {
    gridColumn: `span ${colSpan}`,
    gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
    backgroundColor: "#111827",
    borderRadius: 8,
    border: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
    minHeight: maxHeight ? undefined : minHeight,
    maxHeight: maxHeight ?? undefined,
    overflow: "hidden",
    position: "relative",
    zIndex: 0, // creates stacking context — prevents leaflet z-indexes from escaping
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottom: "1px solid #1e293b",
    flexShrink: 0,
  };

  const headerLeftStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const titleStyle: CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#94a3b8",
  };

  const iconStyle: CSSProperties = {
    color: "#22d3ee", // cyan accent
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  };

  const bodyStyle: CSSProperties = {
    padding: 0,
    flex: 1,
    overflow: maxHeight ? "auto" : "hidden",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={containerStyle} className={className}>
      {/* Panel header */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <span style={iconStyle}>{icon}</span>
          <span style={titleStyle}>{title}</span>
        </div>
        {headerRight && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {headerRight}
          </div>
        )}
      </div>

      {/* Panel body */}
      <div style={bodyStyle}>{children}</div>
    </div>
  );
}
