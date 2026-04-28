import React, { useState } from "react";
import { Phone, Video, FileText, Stethoscope } from "lucide-react";
import { SketchCard } from "./SketchCard";

type VisitType = "Emergency Visit" | "Routine Check-Up" | "Video Consultation" | "Report";
type Patient = {
  id: string; name: string; type: VisitType; time: string; status: "critical" | "pending" | "stable";
};

const patients: Patient[] = [
  { id: "1", name: "Taigo Wilkinson",   type: "Emergency Visit",    time: "09:15 AM", status: "critical" },
  { id: "2", name: "Samantha Williams", type: "Routine Check-Up",   time: "09:15 AM", status: "pending"  },
  { id: "3", name: "Amy White",         type: "Video Consultation", time: "09:15 AM", status: "stable"   },
  { id: "4", name: "Tyler Young",       type: "Report",             time: "09:45 AM", status: "stable"   },
];

const statusDot: Record<string, string> = {
  critical: "bg-red-500", pending: "bg-amber-400", stable: "bg-emerald-400",
};
const typeBadge: Record<string, string> = {
  "Emergency Visit":    "text-red-500",
  "Routine Check-Up":  "text-[#2D2F6E]",
  "Video Consultation":"text-[#2D2F6E]",
  "Report":            "text-[#1A1A1A]/40",
};
const typeIcon: Record<VisitType, React.ReactNode> = {
  "Emergency Visit":   <Stethoscope size={13} className="text-red-400" />,
  "Routine Check-Up":  <Phone size={13} className="text-[#2D2F6E]" />,
  "Video Consultation":<Video size={13} className="text-[#2D2F6E]" />,
  "Report":            <FileText size={13} className="text-[#1A1A1A]/40" />,
};

const SG = "'Space Grotesk', sans-serif";
const IN = "'Inter', sans-serif";

export function PatientListPanel({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <SketchCard seed={3} className="flex flex-col h-full" style={{ padding: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
        <div>
          <h2 style={{ fontFamily: SG, fontWeight: 700, fontSize: "14px", color: "#1A1A1A", letterSpacing: "-0.01em" }}>
            Patient list
          </h2>
          <p style={{ fontFamily: IN, fontSize: "10px", color: "rgba(26,26,26,0.4)", marginTop: "2px" }}>
            Today · sorted by priority
          </p>
        </div>
        <select
          className="border border-gray-200 bg-gray-50 rounded-lg outline-none cursor-pointer hover:border-[#FF4D1C]/40 transition-colors px-2.5 py-1.5"
          style={{ fontFamily: IN, fontSize: "10px", fontWeight: 500, color: "rgba(26,26,26,0.55)" }}
        >
          <option>Today</option>
          <option>This week</option>
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
        {patients.map((p) => {
          const isActive  = p.id === selectedId;
          const isHovered = p.id === hoveredId;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-left border ${
                isActive ? "bg-[#2D2F6E]/5 border-[#2D2F6E]/12" : "bg-transparent border-transparent hover:bg-gray-50"
              }`}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[p.status]}`} />
              <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                {typeIcon[p.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="truncate"
                  style={{ fontFamily: IN, fontWeight: 500, fontSize: "13px", color: isActive ? "#2D2F6E" : "#1A1A1A" }}
                >
                  {p.name}
                </div>
                <div
                  className="mt-0.5 truncate"
                  style={{ fontFamily: IN, fontWeight: 400, fontSize: "10px", color: `rgba(26,26,26,0.45)` }}
                >
                  {p.type}
                </div>
              </div>

              {isHovered ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="p-1.5 rounded-lg bg-[#2D2F6E] text-white hover:bg-[#FF4D1C] transition-colors"><FileText size={10} /></button>
                  <button className="p-1.5 rounded-lg bg-[#2D2F6E] text-white hover:bg-[#FF4D1C] transition-colors"><Phone size={10} /></button>
                  <button className="p-1.5 rounded-lg bg-[#FF4D1C] text-white hover:bg-[#e03a0b] transition-colors"><Stethoscope size={10} /></button>
                </div>
              ) : (
                <div
                  className={`flex-shrink-0 px-2 py-1 rounded-lg ${p.status === "critical" ? "bg-red-50 text-red-600" : "bg-gray-50 text-[#1A1A1A]/45"}`}
                  style={{ fontFamily: IN, fontWeight: 500, fontSize: "10px" }}
                >
                  {p.time}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </SketchCard>
  );
}
