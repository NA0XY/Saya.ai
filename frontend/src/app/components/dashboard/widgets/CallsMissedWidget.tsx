import React from "react";
import { SketchCard } from "./SketchCard";

export function CallsMissedWidget({ count }: { count: number }) {
  return (
    <SketchCard seed={22} className="flex flex-col h-full" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
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
        Calls Missed
      </span>

      {/* Big Number */}
      <span style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        fontSize: "80px",
        color: "#EF4444",
        lineHeight: 1,
        textAlign: "center",
      }}>
        {count}
      </span>
    </SketchCard>
  );
}
