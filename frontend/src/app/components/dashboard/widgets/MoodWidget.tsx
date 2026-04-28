import React from "react";
import { SketchCard } from "./SketchCard";

// 7-day sentiment data: Joy, Neutral, Anxiety, Sadness (0-10 scale)
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const sentiments = {
  joy:     [7, 8, 6, 5, 4, 3, 3],
  neutral: [3, 2, 4, 5, 4, 4, 5],
  anxiety: [1, 1, 2, 3, 5, 6, 5],
  sadness: [1, 1, 2, 2, 4, 5, 6],
};

const W = 120, H = 42, PAD = 4;
const toX = (i: number) => PAD + (i / (days.length - 1)) * (W - PAD * 2);
const toY = (v: number) => H - PAD - (v / 10) * (H - PAD * 2);
const pts = (arr: number[]) => arr.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

const lines = [
  { key: "joy",     color: "#22c55e", label: "Joy"     },
  { key: "neutral", color: "#60a5fa", label: "Neutral" },
  { key: "anxiety", color: "#f59e0b", label: "Anxiety" },
  { key: "sadness", color: "#ef4444", label: "Sad"     },
] as const;

// Alert: anxiety or sadness ≥ 5 for last 2 days
const alertActive =
  (sentiments.anxiety[5] >= 5 && sentiments.anxiety[6] >= 5) ||
  (sentiments.sadness[5] >= 5 && sentiments.sadness[6] >= 5);

const SketchFilter = ({ id, seed }: { id: string; seed: number }) => (
  <filter id={id} x="-2%" y="-5%" width="104%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.022 0.015" numOctaves="2" seed={seed} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale="0.8" xChannelSelector="R" yChannelSelector="G" />
  </filter>
);

export function MoodWidget() {
  return (
    <SketchCard seed={14} className="flex flex-col p-4 h-full" style={{ padding: "16px", overflowY: "auto", scrollbarWidth: "thin" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-3">
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "16px", color: "#1A1A1A", letterSpacing: "-0.01em" }}>
          Last mood
        </span>
        {alertActive && (
          <span
            style={{
              fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700,
              background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FCA5A5",
              borderRadius: "6px", padding: "3px 8px", letterSpacing: "0.03em",
            }}
          >
            ⚠ Anxious 2+ days
          </span>
        )}
      </div>

      {/* 4 Mood metric blocks */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        {lines.map(({ key, color, label }) => {
          const val = (sentiments as any)[key][6]; // Latest day
          return (
            <div key={key} style={{ background: "rgba(0,0,0,0.02)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.04)", padding: "8px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "rgba(26,26,26,0.45)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{label}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "22px", color }}>{val}</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "rgba(26,26,26,0.25)" }}>/ 10</span>
              </div>
            </div>
          );
        })}
      </div>
    </SketchCard>
  );
}
