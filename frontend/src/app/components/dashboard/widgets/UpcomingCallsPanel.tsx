import React, { useState } from "react";
import { SketchCard } from "./SketchCard";
import { Maximize2, Minimize2 } from "lucide-react";
import type { MedicationScheduleDto } from "../../../lib/api";

interface UpcomingCall {
  id: string;
  time: string;
  medicine: string;
  dosage: string;
}

function formatScheduledTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (match) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const local = new Date(2000, 0, 1, hours, minutes, 0, 0);
    return local.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  }
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  }
  return value;
}

export function UpcomingCallsPanel({
  selectedId,
  onSelect,
  calls,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  calls: MedicationScheduleDto[];
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const upcomingCalls: UpcomingCall[] = [...calls]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((call) => ({
    id: call.id,
    time: formatScheduledTime(call.scheduled_time),
    medicine: call.medicine_name,
    dosage: call.custom_message ? call.custom_message : call.language === "hi" ? "Hindi reminder" : "English reminder",
  }));

  const cardContent = (
    <SketchCard seed={3} className="flex flex-col h-full" style={{ padding: 0 }}>
      {/* Header */}
      <div
        style={{
          padding: "18px 24px 14px",
          borderBottom: "2px solid rgba(26,26,26,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h2 style={{
            fontFamily: "'Caveat', cursive",
            fontWeight: 700,
            fontSize: "28px",
            color: "#1A1A1A",
            margin: 0,
          }}>
            Upcoming Calls
          </h2>
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "18px",
            color: "rgba(26,26,26,0.4)",
            marginTop: "2px",
          }}>
            Today · ordered by schedule
          </p>
        </div>
        <button 
          onClick={() => setIsMaximized(!isMaximized)}
          style={{ 
            background: "transparent", 
            border: "none", 
            cursor: "pointer", 
            color: "#1A1A1A", 
            padding: "4px",
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          {isMaximized ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
        </button>
      </div>

      {/* Call list */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "12px 16px", scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
      >
        {upcomingCalls.length === 0 && (
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "22px",
            color: "rgba(26,26,26,0.45)",
            padding: "24px 16px",
            textAlign: "center",
          }}>
            No upcoming calls scheduled.
          </div>
        )}
        {upcomingCalls.map((call) => {
          const active = call.id === selectedId;
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
                gap: "16px",
                padding: "14px 16px",
                borderRadius: "14px",
                marginBottom: "8px",
                background: active ? "rgba(232,93,42,0.12)" : hovered ? "rgba(26,26,26,0.03)" : "transparent",
                border: active ? "2px solid rgba(232,93,42,0.4)" : "2px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              {/* Time */}
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "22px",
                fontWeight: 600,
                color: "#2D2F6E",
                flexShrink: 0,
                width: "90px",
              }}>
                {call.time}
              </div>

              {/* Medicine name + dosage */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Caveat', cursive",
                  fontWeight: 700,
                  fontSize: "24px",
                  color: "#1A1A1A",
                }}>
                  {call.medicine}
                </div>
                <div style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: "18px",
                  color: "rgba(26,26,26,0.45)",
                  marginTop: "2px",
                }}>
                  {call.dosage}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </SketchCard>
  );

  if (isMaximized) {
    return (
      <div style={{ 
        position: "fixed", 
        top: 0, left: 0, right: 0, bottom: 0, 
        zIndex: 100, 
        padding: "40px", 
        background: "rgba(246, 244, 235, 0.85)", 
        backdropFilter: "blur(5px)", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <div style={{ width: "100%", maxWidth: "800px", height: "85vh", display: "flex", flexDirection: "column" }}>
          {cardContent}
        </div>
      </div>
    );
  }

  return cardContent;
}
