import React from "react";
import { SketchCard } from "./SketchCard";

const PenPhone = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2.5 1.5 C2 1.5 1.5 2 1.5 2.5 L1.5 4.5 C1.5 8.5 4.5 11.5 8.5 11.5 L10.5 11.5 C11 11.5 11.5 11 11.5 10.5 L11.5 9 C11.5 8.6 11.2 8.3 10.8 8.4 L9.2 8.8 C8.8 8.9 8.5 8.7 8.3 8.4 L7.3 6.8 C7.1 6.5 7.2 6.1 7.5 5.9 L8.5 5.3 C8.8 5.1 8.9 4.8 8.7 4.5 L7.4 2.6 C7.2 2.3 6.9 2.1 6.6 2 L3 1.5 Z"
      stroke="#2D2F6E" strokeWidth={1.05} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PenVideo = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <rect x={1} y={3.5} width={7.5} height={6} rx={1.2} stroke="#FF4D1C" strokeWidth={1.05} strokeLinejoin="round" />
    <path d="M8.5 5.8 L12 4.2 L12 8.8 L8.5 7.2 Z" stroke="#FF4D1C" strokeWidth={1.05} strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);
const PenChat = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M1.5 2 C1.5 1.7 1.7 1.5 2 1.5 L11 1.5 C11.3 1.5 11.5 1.7 11.5 2 L11.5 8 C11.5 8.3 11.3 8.5 11 8.5 L5 8.5 L2.5 11 L2.5 8.5 C2 8.5 1.5 8 1.5 7.5 Z"
      stroke="#22c55e" strokeWidth={1.05} strokeLinecap="round" strokeLinejoin="round" />
    <line x1={3.5} y1={4} x2={9.5} y2={4} stroke="#22c55e" strokeWidth={0.7} strokeOpacity={0.45} strokeLinecap="round" />
    <line x1={3.5} y1={6} x2={7.5} y2={6} stroke="#22c55e" strokeWidth={0.7} strokeOpacity={0.45} strokeLinecap="round" />
  </svg>
);

const sessions = [
  { icon: <PenPhone />, label: "Telephony",     value: "03:45", unit: "h"   },
  { icon: <PenVideo />, label: "Video consult", value: "02:00", unit: "min" },
  { icon: <PenChat  />, label: "Companion",     value: "00:24", unit: "min" },
];

export function SessionsWidget() {
  return (
    <SketchCard seed={11} className="flex flex-col p-4 h-full gap-2">
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px", color: "#1A1A1A", letterSpacing: "-0.01em" }} className="flex-shrink-0">Sessions</span>

      <div className="flex flex-col gap-3 flex-1 justify-center">
        {sessions.map((s) => (
          <div key={s.label} className="flex items-center justify-between" style={{ padding: "4px 0" }}>
            <div className="flex flex-col">
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: "rgba(26,26,26,0.6)" }}>{s.label}</span>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "9px", color: "rgba(26,26,26,0.35)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Duration</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "20px", color: "#1A1A1A" }}>{s.value}</span>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 500, color: "rgba(26,26,26,0.35)" }}>{s.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </SketchCard>
  );
}
