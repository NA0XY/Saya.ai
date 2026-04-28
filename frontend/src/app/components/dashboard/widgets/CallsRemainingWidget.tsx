import React from "react";
import { SketchCard } from "./SketchCard";

export function CallsRemainingWidget({ count }: { count: number }) {
  return (
    <SketchCard seed={18} className="flex flex-col h-full" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Header */}
      <span style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        fontSize: "24px",
        color: "#1A1A1A",
        letterSpacing: "-0.01em",
        marginBottom: "16px",
        textAlign: "center",
      }}>
        Upcoming Calls
      </span>

      {/* Big Number */}
      <span style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        fontSize: "80px",
        color: "#2D2F6E",
        lineHeight: 1,
        textAlign: "center",
      }}>
        {count}
      </span>
    </SketchCard>
  );
}
