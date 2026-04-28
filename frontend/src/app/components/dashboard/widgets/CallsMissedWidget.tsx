import React from "react";
import { SketchCard } from "./SketchCard";
import { PhoneOff, MessageSquare } from "lucide-react";

const failures = [
  { name: "Dadi Ji",  time: "08:45 AM", retries: 5, smsSent: true,  status: "critical" },
  { name: "Papa",     time: "09:15 AM", retries: 3, smsSent: false, status: "warning"  },
  { name: "Nani Ma",  time: "09:50 AM", retries: 1, smsSent: false, status: "pending"  },
];

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "#FEF2F2", text: "#B91C1C", label: "5/5 — SMS sent" },
  warning:  { bg: "#FFFBEB", text: "#92400E", label: "3/5 retries"    },
  pending:  { bg: "#F0F9FF", text: "#075985", label: "1/5 retries"    },
};

export function CallsMissedWidget() {
  return (
    <SketchCard seed={22} className="flex flex-col p-4 h-full" style={{ padding: "16px", overflowY: "auto", scrollbarWidth: "thin" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-3">
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "16px", color: "#1A1A1A", letterSpacing: "-0.01em" }}>
          Calls missed
        </span>
        <span style={{
          fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700,
          background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FCA5A5",
          borderRadius: "6px", padding: "3px 8px",
        }}>
          3 failures
        </span>
      </div>

      {/* Simple Big Stats Rows */}
      <div className="flex flex-col gap-3 flex-1 justify-center">
        {[
          { label: "Critical Failures (SMS Sent)", val: 1, col: "#B91C1C", bg: "#FEF2F2" },
          { label: "Retrying Calls", val: 1, col: "#92400E", bg: "#FFFBEB" },
          { label: "Queued Retries", val: 2, col: "#075985", bg: "#F0F9FF" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: stat.bg, border: "1px solid rgba(0,0,0,0.05)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }} className="flex justify-between items-center">
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(26,26,26,0.6)" }}>{stat.label}</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "20px", color: stat.col }}>{stat.val}</span>
          </div>
        ))}
      </div>
    </SketchCard>
  );
}
