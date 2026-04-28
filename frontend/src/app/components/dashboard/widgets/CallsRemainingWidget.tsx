import React from "react";
import { SketchCard } from "./SketchCard";

const TOTAL = 20;
const REMAINING = 12;
const PCT = REMAINING / TOTAL;

// SVG ring math
const R = 28, CX = 36, CY = 36, CIRC = 2 * Math.PI * R;
const DASH = PCT * CIRC;
const GAP  = CIRC - DASH;

const SketchFilter = () => (
  <filter id="ring-pen" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="2" seed="18" result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.0" xChannelSelector="R" yChannelSelector="G" />
  </filter>
);

export function CallsRemainingWidget() {
  return (
    <SketchCard seed={18} className="flex flex-col p-4 h-full" style={{ padding: "16px", overflowY: "auto", scrollbarWidth: "thin" }}>
      {/* Header */}
      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "16px", color: "#1A1A1A", letterSpacing: "-0.01em", marginBottom: "8px" }}
        className="flex-shrink-0">
        Calls remaining
      </span>

      {/* Big Number Layout */}
      <div className="flex-1 flex flex-col justify-center gap-1 min-h-0">
        <div className="flex items-baseline gap-3">
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "48px", color: "#2D2F6E", lineHeight: 1 }}>
            {REMAINING}
          </span>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "rgba(26,26,26,0.35)", fontWeight: 500 }}>
            calls pending today
          </span>
        </div>

        <div className="flex gap-6 mt-3">
          <div className="flex flex-col">
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "rgba(26,26,26,0.45)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Completed</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "18px", color: "#22c55e" }}>{TOTAL - REMAINING}</span>
          </div>
          <div className="flex flex-col">
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "rgba(26,26,26,0.45)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Target</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "18px", color: "#1A1A1A" }}>{TOTAL}</span>
          </div>
          <div className="flex flex-col">
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "rgba(26,26,26,0.45)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Failed</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "18px", color: "#ef4444" }}>3</span>
          </div>
        </div>
      </div>
    </SketchCard>
  );
}
