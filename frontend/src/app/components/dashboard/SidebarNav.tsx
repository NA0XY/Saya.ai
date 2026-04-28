import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Users, BarChart2,
  MessageCircle, CreditCard, FileText, Settings, LogOut,
} from "lucide-react";

const SG = "'Space Grotesk', sans-serif";
const IN = "'Inter', sans-serif";

const SIDEBAR_BG   = "#F5A623";   // warm amber-yellow
const TEXT_DARK    = "#1A1A1A";
const TEXT_MUTED   = "rgba(26,26,26,0.55)";
const TEXT_LABEL   = "rgba(26,26,26,0.4)";
const DIVIDER      = "rgba(26,26,26,0.14)";
const ACTIVE_BG    = "rgba(255,255,255,0.30)";

function NavItem({
  to, icon: Icon, label,
}: { to: string; icon: React.ElementType; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "7px 12px",
        borderRadius: "10px",
        fontFamily: IN,
        fontSize: "13px",
        fontWeight: active ? 600 : 400,
        color: active ? TEXT_DARK : TEXT_MUTED,
        background: active ? ACTIVE_BG : "transparent",
        borderLeft: active ? `2px solid ${TEXT_DARK}` : "2px solid transparent",
        textDecoration: "none",
        transition: "all 0.15s ease",
        marginBottom: "2px",
      }}
    >
      <Icon
        size={15}
        style={{ color: active ? TEXT_DARK : TEXT_MUTED, flexShrink: 0 }}
      />
      {label}
    </Link>
  );
}

export function SidebarNav() {
  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "256px",
        height: "100vh",
        background: SIDEBAR_BG,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: `1px solid ${DIVIDER}`,
          flexShrink: 0,
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: TEXT_DARK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: SG, fontWeight: 800, fontSize: "14px", color: SIDEBAR_BG }}>S</span>
          </div>
          <span style={{ fontFamily: SG, fontWeight: 700, fontSize: "16px", color: TEXT_DARK, letterSpacing: "-0.02em" }}>
            SAYA.AI
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {/* General */}
        <p
          style={{
            fontFamily: IN, fontSize: "9px", fontWeight: 700,
            color: TEXT_LABEL, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "0 12px", margin: "0 0 6px",
          }}
        >
          General
        </p>
        <NavItem to="/dashboard"             icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/dashboard/medications" icon={Calendar}        label="Medication schedule" />
        <NavItem to="/dashboard/patients"    icon={Users}           label="Patient profiles" />
        <NavItem to="/dashboard/statistics"  icon={BarChart2}       label="Statistics & reports" />

        {/* Tools */}
        <p
          style={{
            fontFamily: IN, fontSize: "9px", fontWeight: 700,
            color: TEXT_LABEL, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "0 12px", margin: "20px 0 6px",
          }}
        >
          Tools
        </p>
        <NavItem to="/companion"           icon={MessageCircle} label="Companion" />
        <NavItem to="/dashboard/billing"   icon={CreditCard}    label="Billing" />
        <NavItem to="/dashboard/documents" icon={FileText}       label="Documents" />
        <NavItem to="/dashboard/settings"  icon={Settings}       label="Settings" />
      </div>

      {/* Log out */}
      <div style={{ padding: "8px 12px 16px", borderTop: `1px solid ${DIVIDER}` }}>
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "7px 12px",
            borderRadius: "10px",
            fontFamily: IN,
            fontSize: "13px",
            fontWeight: 400,
            color: TEXT_MUTED,
            textDecoration: "none",
          }}
        >
          <LogOut size={15} style={{ color: TEXT_MUTED }} />
          Log out
        </Link>
      </div>
    </aside>
  );
}
