import React, { useState } from "react";
import { SketchCard } from "./SketchCard";
import { Phone, Clock, RotateCcw, AlertCircle } from "lucide-react";

type CallStatus = "confirmed" | "retrying" | "missed";

interface UpcomingCall {
  id: string;
  time: string;
  contact: string;
  nickname: string;
  context: string;
  medicine: string;
  status: CallStatus;
}

const calls: UpcomingCall[] = [
  { id: "1", time: "10:15 AM", contact: "Rajesh Sharma",  nickname: "Papa",    context: "Morning Metoprolol",     medicine: "Metoprolol 25mg",  status: "confirmed" },
  { id: "2", time: "10:30 AM", contact: "Kamla Devi",     nickname: "Dadi Ji", context: "Breakfast Dolo-650",     medicine: "Dolo-650",         status: "retrying"  },
  { id: "3", time: "11:00 AM", contact: "Meera Verma",    nickname: "Nani Ma", context: "Glipizide with food",    medicine: "Glipizide 5mg",    status: "missed"    },
  { id: "4", time: "11:45 AM", contact: "Suresh Agarwal", nickname: "Dada Ji", context: "BP check reminder",      medicine: "Amlodipine 5mg",   status: "confirmed" },
  { id: "5", time: "12:30 PM", contact: "Priya Singh",    nickname: "Mausi",   context: "Afternoon Pantoprazole", medicine: "Pantoprazole 40mg", status: "confirmed" },
];

const statusConfig: Record<CallStatus, { color: string; icon: React.ElementType; label: string; bg: string }> = {
  confirmed: { color: "#22c55e", icon: Phone,       label: "Confirmed", bg: "#F0FDF4" },
  retrying:  { color: "#F59E0B", icon: RotateCcw,   label: "Retrying",  bg: "#FFFBEB" },
  missed:    { color: "#EF4444", icon: AlertCircle,  label: "Missed",    bg: "#FEF2F2" },
};

const SG = "'Space Grotesk',sans-serif";
const IN = "'Inter',sans-serif";

export function UpcomingCallsPanel({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <SketchCard seed={3} className="flex flex-col h-full" style={{ padding: 0 }}>
      {/* Header */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{ padding: "14px 20px 12px", borderBottom: "1px solid rgba(26,26,26,0.07)" }}
      >
        <div>
          <h2 style={{ fontFamily: SG, fontWeight: 700, fontSize: "14px", color: "#1A1A1A", letterSpacing: "-0.01em", margin: 0 }}>
            Upcoming calls
          </h2>
          <p style={{ fontFamily: IN, fontSize: "10px", color: "rgba(26,26,26,0.4)", marginTop: "2px" }}>
            Today · ordered by schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ fontFamily: IN, fontSize: "10px", fontWeight: 500, color: "#22c55e", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "3px 8px" }}>
            {calls.filter(c => c.status === "confirmed").length} confirmed
          </div>
          <div style={{ fontFamily: IN, fontSize: "10px", fontWeight: 500, color: "#EF4444", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "3px 8px" }}>
            {calls.filter(c => c.status === "missed").length} missed
          </div>
        </div>
      </div>

      {/* Call list */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "12px 16px", scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
      >
        {calls.map((call) => {
          const cfg   = statusConfig[call.status];
          const StatusIcon = cfg.icon;
          const active  = call.id === selectedId;
          const hovered = call.id === hoveredId;

          return (
            <button
              key={call.id}
              onClick={() => onSelect(call.id)}
              onMouseEnter={() => setHoveredId(call.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 14px",
                borderRadius: "14px",
                marginBottom: "6px",
                background: active ? `${cfg.color}10` : hovered ? "rgba(26,26,26,0.03)" : "transparent",
                border: active ? `1px solid ${cfg.color}35` : "1px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              {/* Status dot */}
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: cfg.color, flexShrink: 0, boxShadow: `0 0 0 3px ${cfg.color}15` }} />

              {/* Time */}
              <div
                style={{ fontFamily: IN, fontSize: "12px", fontWeight: 600, color: "rgba(26,26,26,0.55)", flexShrink: 0, width: "64px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Clock size={12} style={{ color: "rgba(26,26,26,0.3)" }} />
                {call.time}
              </div>

              {/* Contact info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: IN, fontWeight: 700, fontSize: "14px", color: "#1A1A1A", display: "flex", alignItems: "baseline", gap: "8px" }}>
                  {call.nickname}
                  <span style={{ fontFamily: IN, fontWeight: 400, fontSize: "11px", color: "rgba(26,26,26,0.4)" }}>
                    {call.contact}
                  </span>
                </div>
                <div style={{ fontFamily: IN, fontSize: "11px", color: "rgba(26,26,26,0.5)", marginTop: "2px" }}>
                  {call.context}
                </div>
              </div>

              {/* Status badge */}
              <div style={{
                fontFamily: IN, fontSize: "10px", fontWeight: 700,
                color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}25`,
                borderRadius: "8px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "4px",
                flexShrink: 0,
              }}>
                <StatusIcon size={10} />
                {cfg.label}
              </div>
            </button>
          );
        })}
      </div>
    </SketchCard>
  );
}
