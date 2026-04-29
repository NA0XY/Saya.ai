import React, { useEffect, useMemo, useState } from "react";
import { SidebarNav } from "./dashboard/SidebarNav";
import { MoodWidget }              from "./dashboard/widgets/MoodWidget";
import { CallsRemainingWidget }    from "./dashboard/widgets/CallsRemainingWidget";
import { CallsMissedWidget }       from "./dashboard/widgets/CallsMissedWidget";
import { UpcomingCallsPanel }      from "./dashboard/widgets/UpcomingCallsPanel";
import { ScheduledRemindersPanel } from "./dashboard/widgets/ScheduledRemindersPanel";
import { SketchRobotAnimation }    from "./dashboard/SketchRobotAnimation";
import { AlertTriangle, Clock } from "lucide-react";
import { useUser } from "../hooks/useUser";
import { api, type DashboardSummaryDto } from "../lib/api";

export function DashboardPage() {
  const [selectedCallId, setSelectedCallId] = useState<string>("");
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useUser();

  const displayName = user?.name?.split(" ")[0] || "there";

  const loadSummary = async () => {
    try {
      const data = await api.dashboardSummary();
      setSummary(data);
      return data;
    } catch (error) {
      console.error("Failed to load dashboard summary", error);
      return null;
    }
  };

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      await loadSummary();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const data = await loadSummary();
      if (cancelled || !data) return;
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadSummary();
    }, 30000);

    const handleFocus = () => {
      void loadSummary();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadSummary();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "dashboard:schedule-created") {
        void loadSummary();
        localStorage.removeItem("dashboard:schedule-created");
      }
    };

    const handleScheduleCreated = () => {
      void loadSummary();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("dashboard:schedule-created", handleScheduleCreated);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("dashboard:schedule-created", handleScheduleCreated);
    };
  }, []);

  const activeSchedules = summary?.activeSchedules ?? [];
  const recentCallLogs = summary?.recentCallLogs ?? [];
  const upcomingCount = activeSchedules.length;
  const missedCount = useMemo(
    () => recentCallLogs.filter((log) => log.status === "no_answer" || log.status === "failed").length,
    [recentCallLogs]
  );

  useEffect(() => {
    if (!selectedCallId && activeSchedules.length > 0) {
      setSelectedCallId(activeSchedules[0].id);
    }
    if (selectedCallId && activeSchedules.length > 0 && !activeSchedules.some((schedule) => schedule.id === selectedCallId)) {
      setSelectedCallId(activeSchedules[0].id);
    }
  }, [activeSchedules, selectedCallId]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#F6F4EB",
        fontFamily: "'Caveat', cursive",
      }}
    >
      {/* ── Sidebar (256px fixed) */}
      <SidebarNav />

      {/*
       * CSS Grid — 5 rows:
       *   auto  → top bar
       *   auto  → alerts
       *   240px → widget row
       *   1fr   → panels
       *   auto  → footer
       */}
      <div
        style={{
          marginLeft: "256px",
          width: "calc(100vw - 256px)",
          height: "100vh",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "auto 240px 1fr auto",
        }}
      >

        {/* ── ROW 1 · Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "20px 32px",
            borderBottom: "2px solid rgba(26,26,26,0.07)",
            background: "#F6F4EB",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontFamily: "'Caveat', cursive",
                fontWeight: 700,
                fontSize: "36px",
                color: "#1A1A1A",
                lineHeight: 1.2,
                margin: 0,
                paddingRight: "10px",
              }}
            >
              Good morning, {displayName}
            </h1>
            <p
              style={{
                fontFamily: "'Caveat', cursive",
                fontWeight: 400,
                fontSize: "20px",
                color: "rgba(26,26,26,0.42)",
                margin: "4px 0 0",
              }}
            >
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          
          {/* Refresh button and animated sketching robot on the right */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={refreshDashboard}
              disabled={isRefreshing}
              style={{
                background: "transparent",
                border: "2px solid #1A1A1A",
                borderRadius: "6px",
                padding: "8px 12px",
                cursor: isRefreshing ? "not-allowed" : "pointer",
                opacity: isRefreshing ? 0.6 : 1,
                transition: "all 0.2s",
              }}
              aria-label="Refresh dashboard"
              title="Refresh dashboard data"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: isRefreshing ? "spin 1s linear infinite" : "none",
                  color: "#1A1A1A",
                }}
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36" />
              </svg>
            </button>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <SketchRobotAnimation />
          </div>
        </div>



        {/* ── ROW 3 · Analytics widgets (3 columns) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            padding: "0 32px 24px",
            overflow: "hidden",
          }}
        >
          <MoodWidget mood={summary?.lastMood} />
          <CallsRemainingWidget count={upcomingCount} />
          <CallsMissedWidget count={missedCount} />
        </div>

        {/* ── ROW 4 · Panels */}
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
          <UpcomingCallsPanel selectedId={selectedCallId} onSelect={setSelectedCallId} calls={activeSchedules} />
          <ScheduledRemindersPanel onScheduled={() => { void loadSummary(); }} />
        </div>

        {/* ── ROW 5 · Footer */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "7px 24px", borderTop: "1px solid rgba(26,26,26,0.06)",
          }}
        >
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "16px", color: "rgba(26,26,26,0.3)", margin: 0 }}>
            🔒 SAYA.AI Guardian — powered by Twilio + Supabase
          </p>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "16px", color: "rgba(26,26,26,0.2)", margin: 0 }}>
            v2.4.1 — Session active
          </p>
        </div>

      </div>
    </div>
  );
}
