import React from "react";
import { SketchCard } from "./SketchCard";

const FinePenFilter = ({ id }: { id: string }) => (
  <filter id={id} x="-2%" y="-2%" width="104%" height="104%">
    <feTurbulence type="fractalNoise" baseFrequency="0.018 0.025" numOctaves="2" seed="3" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G" result="displaced" />
  </filter>
);

const barData = [
  { h: 30 }, { h: 100 }, { h: 60 }, { h: 80 }, { h: 40 }, { h: 70 }, { h: 50 },
];
const W = 140, BASE_Y = 44, MAX_H = 36;

export function PatientSummaryWidget() {
  return (
    <SketchCard seed={2} className="flex flex-col p-4 h-full gap-2">
      <div className="flex items-center justify-between flex-shrink-0">
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px", color: "#1A1A1A", letterSpacing: "-0.01em" }}>Patients</span>
        <span className="text-[10px] text-emerald-500 font-semibold">↑ +3</span>
      </div>

      <div className="flex gap-4 flex-shrink-0">
        {[["14", "22–32 yrs"], ["5", "32–45 yrs"], ["2", "45+ yrs"]].map(([val, label]) => (
          <div key={label}>
            <div className="font-bold text-base text-[#1A1A1A] leading-none">{val}</div>
            <div className="text-[10px] text-[#1A1A1A]/45 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <svg width="100%" height="100%" viewBox={`0 0 ${W} 52`} preserveAspectRatio="none">
          <defs><FinePenFilter id="pen-bars-ps" /></defs>
          <g filter="url(#pen-bars-ps)">
            {barData.map(({ h }, i) => {
              const barH = (h / 100) * MAX_H;
              const x = 4 + i * 19;
              const y = BASE_Y - barH;
              const w = 13;
              return (
                <g key={i}>
                  <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={barH - 1} fill="#2D2F6E" fillOpacity={0.06} />
                  <rect x={x} y={y} width={w} height={barH} fill="none" stroke="#1A1A1A" strokeWidth={0.9} strokeOpacity={0.55} strokeLinejoin="round" />
                  {Array.from({ length: Math.floor(barH / 4) }).map((_, j) => (
                    <line key={j} x1={x} y1={y + j * 4 + 3} x2={Math.min(x + w, x + (j * 4 + 3))} y2={y}
                      stroke="#2D2F6E" strokeWidth={0.45} strokeOpacity={0.18} strokeLinecap="round" />
                  ))}
                </g>
              );
            })}
            <line x1={2} y1={BASE_Y + 0.5} x2={W - 2} y2={BASE_Y} stroke="#1A1A1A" strokeWidth={0.9} strokeOpacity={0.3} strokeLinecap="round" />
          </g>
          <text x={2} y={51} fontSize={7} fill="#1A1A1A" fillOpacity={0.3} fontFamily="Inter">07:30</text>
          <text x={108} y={51} fontSize={7} fill="#1A1A1A" fillOpacity={0.3} fontFamily="Inter">13:00</text>
        </svg>
      </div>
    </SketchCard>
  );
}
