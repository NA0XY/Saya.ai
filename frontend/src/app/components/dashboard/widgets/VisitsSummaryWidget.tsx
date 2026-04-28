import React from "react";
import { SketchCard } from "./SketchCard";

const rawPoints: [number, number][] = [
  [0, 36], [16, 42], [32, 26], [48, 33], [64, 12], [80, 28], [96, 20], [110, 24],
];
const toPolyline = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(" ");
const toAreaPath = (pts: [number, number][], baseY: number) => {
  const line = pts.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(" ");
  return `${line} L ${pts[pts.length - 1][0]} ${baseY} L ${pts[0][0]} ${baseY} Z`;
};

export function VisitsSummaryWidget({ isDemoMode = false }: { isDemoMode?: boolean }) {
  const pts: [number, number][] = isDemoMode
    ? rawPoints.map(([x, y]) => [x, Math.max(4, y - 12)] as [number, number])
    : rawPoints;

  return (
    <SketchCard seed={5} className="flex flex-col p-4 h-full gap-2">
      <div className="flex items-center justify-between flex-shrink-0">
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px", color: "#1A1A1A", letterSpacing: "-0.01em" }}>Visits summary</span>
        <button className="text-[10px] text-[#1A1A1A]/35 hover:text-[#FF4D1C] transition-colors font-medium">All →</button>
      </div>

      <div className="flex gap-4 flex-shrink-0">
        {[
          [isDemoMode ? "12" : "24", "min", "Avg"],
          [isDemoMode ? "8" : "15", "min", "Min"],
          ["01:30", "h", "Max"],
        ].map(([val, unit, label]) => (
          <div key={label}>
            <div className="font-bold text-base text-[#1A1A1A] leading-none">
              {val}<span className="text-[9px] font-normal text-[#1A1A1A]/35 ml-0.5">{unit}</span>
            </div>
            <div className="text-[10px] text-[#1A1A1A]/45 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <svg width="100%" height="100%" viewBox="0 0 110 52" preserveAspectRatio="none">
          <defs>
            <filter id="pen-line-vs" x="-2%" y="-5%" width="104%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.022 0.015" numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.9" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <linearGradient id="areaG-vs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D2F6E" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#2D2F6E" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={toAreaPath(pts, 46)} fill="url(#areaG-vs)" />
          <g filter="url(#pen-line-vs)">
            <line x1={0} y1={46} x2={110} y2={46} stroke="#1A1A1A" strokeWidth={0.8} strokeOpacity={0.2} strokeLinecap="round" />
            <polyline points={toPolyline(pts)} fill="none" stroke="#1A1A1A" strokeWidth={1.4} strokeOpacity={0.65} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={toPolyline(pts.map(([x, y]) => [x, y + 0.8] as [number, number]))} fill="none" stroke="#2D2F6E" strokeWidth={0.6} strokeOpacity={0.25} strokeLinecap="round" strokeLinejoin="round" />
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={2} fill="white" stroke="#1A1A1A" strokeWidth={1.1} strokeOpacity={0.6} />
            ))}
          </g>
          {[[0, "10:30"], [32, "11:30"], [64, "12:30"], [96, "13:30"]].map(([x, label]) => (
            <g key={String(label)}>
              <line x1={Number(x)} y1={46} x2={Number(x)} y2={48.5} stroke="#1A1A1A" strokeWidth={0.7} strokeOpacity={0.2} />
              <text x={Number(x)} y={52} fontSize={6.5} fill="#1A1A1A" fillOpacity={0.3} fontFamily="Inter" textAnchor="middle">{label}</text>
            </g>
          ))}
        </svg>
      </div>
    </SketchCard>
  );
}
