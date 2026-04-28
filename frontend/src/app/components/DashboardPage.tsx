import React, { useState } from "react";
import { SidebarNav } from "./dashboard/SidebarNav";
import { MoodWidget }              from "./dashboard/widgets/MoodWidget";
import { CallsRemainingWidget }    from "./dashboard/widgets/CallsRemainingWidget";
import { CallsMissedWidget }       from "./dashboard/widgets/CallsMissedWidget";
import { UpcomingCallsPanel }      from "./dashboard/widgets/UpcomingCallsPanel";
import { ScheduledRemindersPanel } from "./dashboard/widgets/ScheduledRemindersPanel";
import { Search, SlidersHorizontal, AlertTriangle, Clock } from "lucide-react";

export function DashboardPage() {
  const [selectedCallId, setSelectedCallId] = useState<string>("1");
  const [verified, setVerified] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#F8F4EE",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Sidebar (256px fixed) */}
      <SidebarNav />

      {/*
       * CSS Grid — 5 rows, cannot overlap:
       *   auto  → top bar
       *   auto  → alerts + chips
       *   180px → widget row
       *   1fr   → panels  (fills ALL remaining space)
       *   auto  → footer
       */}
      <div
        style={{
          marginLeft: "256px",
          width: "calc(100vw - 256px)",
          height: "100vh",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "auto auto 240px 1fr auto",
        }}
      >

        {/* ── ROW 1 · Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "16px 32px",
            borderBottom: "1px solid rgba(26,26,26,0.07)",
            background: "#F8F4EE",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.2rem, 1.6vw, 1.5rem)",
                color: "#1A1A1A",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Good morning, Dr. Olivia
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: "13px",
                color: "rgba(26,26,26,0.42)",
                margin: "4px 0 0",
              }}
            >
              Tuesday, 29 April 2026 &nbsp;·&nbsp; 20 calls scheduled today &nbsp;·&nbsp; 3 pending verification
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute", left: "14px", top: "50%",
                  transform: "translateY(-50%)", color: "rgba(26,26,26,0.3)", pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search contacts, medicines…"
                style={{
                  width: "280px", background: "white", border: "1px solid #e5e7eb",
                  borderRadius: "14px", padding: "10px 16px 10px 42px",
                  fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#1A1A1A",
                  outline: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── ROW 2 · Alerts (Cleaned up - chips removed) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "20px",
            padding: "10px 32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "8px 16px" }}>
              <AlertTriangle size={14} style={{ color: "#EF4444", flexShrink: 0 }} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 500, color: "#991B1B", whiteSpace: "nowrap" }}>
                Dadi Ji — all 5 retries failed, SMS sent
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "8px 16px" }}>
              <Clock size={14} style={{ color: "#D97706", flexShrink: 0 }} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 500, color: "#92400E", whiteSpace: "nowrap" }}>
                Papa — anxious mood detected 2 days
              </span>
            </div>
          </div>
        </div>

        {/* ── ROW 3 · Analytics widgets (Adjusted to 3 columns) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            padding: "0 32px 24px",
            overflow: "hidden",
          }}
        >
          <MoodWidget />
          <CallsRemainingWidget />
          <CallsMissedWidget />
        </div>

        {/* ── ROW 4 · Panels (1fr — fills all remaining space) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            padding: "0 24px",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <UpcomingCallsPanel selectedId={selectedCallId} onSelect={setSelectedCallId} />
          <ScheduledRemindersPanel onVerify={() => setVerified(v => !v)} />
        </div>

        {/* ── ROW 5 · Footer */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "7px 24px", borderTop: "1px solid rgba(26,26,26,0.06)",
          }}
        >
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "rgba(26,26,26,0.3)", margin: 0 }}>
            🔒 SAYA.AI Guardian — powered by Exotel + Supabase. HIPAA &amp; DPDPA 2023 compliant.
          </p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "rgba(26,26,26,0.2)", margin: 0 }}>
            v2.4.1 — Session active
          </p>
        </div>

      </div>
    </div>
  );
}
