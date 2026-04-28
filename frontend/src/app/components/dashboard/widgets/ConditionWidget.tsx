import React from "react";
import { SketchCard } from "./SketchCard";

const conditions = [
  { label: "Stable",   count: 14, color: "#22c55e", pct: 70 },
  { label: "At risk",  count: 5,  color: "#f59e0b", pct: 25 },
  { label: "Critical", count: 1,  color: "#ef4444", pct: 5  },
];

export function ConditionWidget() {
  const segments: { x: number; w: number; color: string; label: string }[] = [];
  let cursor = 1;
  const TOTAL_W = 138;
  conditions.forEach((c) => {
    const w = (c.pct / 100) * TOTAL_W;
    segments.push({ x: cursor, w, color: c.color, label: c.label });
    cursor += w;
  });

  return (
    <SketchCard seed={8} className="flex flex-col p-4 h-full gap-2">
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px", color: "#1A1A1A", letterSpacing: "-0.01em" }} className="flex-shrink-0">By condition</span>

      <div className="flex flex-col gap-2 flex-1 justify-center">
        {conditions.map((c) => (
          <div key={c.label} className="flex items-center gap-2">
            <svg width="9" height="9" viewBox="0 0 9 9" className="flex-shrink-0">
              <circle cx="4.5" cy="4.5" r="3.2" fill={c.color} fillOpacity={0.18} stroke={c.color} strokeWidth={1.1} />
            </svg>
            <span className="text-[11px] text-[#1A1A1A]/65 flex-1 font-normal">{c.label}</span>
            <span className="text-[10px] font-semibold" style={{ color: c.color }}>{c.count} pts</span>
          </div>
        ))}
      </div>

      <div className="flex-shrink-0">
        <svg width="100%" height="16" viewBox="0 0 140 16" preserveAspectRatio="none">
          <defs>
            <filter id="pen-prog-cw" x="-1%" y="-10%" width="102%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.025 0.06" numOctaves="2" seed="9" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.9" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <g filter="url(#pen-prog-cw)">
            <rect x={1} y={4} width={138} height={8} rx={4} fill="none" stroke="#1A1A1A" strokeWidth={0.8} strokeOpacity={0.18} />
            {segments.map((seg) => {
              const n = Math.floor(seg.w / 5);
              return (
                <g key={seg.label}>
                  <rect x={seg.x} y={4} width={seg.w} height={8} fill={seg.color} fillOpacity={0.18} />
                  <rect x={seg.x} y={4} width={seg.w} height={8} fill="none" stroke={seg.color} strokeWidth={0.9} strokeOpacity={0.65} />
                  {Array.from({ length: n }).map((_, j) => (
                    <line key={j} x1={seg.x + j * 5 + 3} y1={4} x2={seg.x + j * 5} y2={12}
                      stroke={seg.color} strokeWidth={0.5} strokeOpacity={0.3} strokeLinecap="round" />
                  ))}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </SketchCard>
  );
}
