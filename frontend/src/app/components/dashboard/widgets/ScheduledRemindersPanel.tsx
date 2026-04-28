import React from "react";
import { SketchCard } from "./SketchCard";
import { Sparkles, Volume2, Clock, RotateCcw, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const SG = "'Space Grotesk',sans-serif";
const IN = "'Inter',sans-serif";

// Deterministic reminder data — in production pulled from Supabase + Exotel scheduler
const reminder = {
  contact:   "Rajesh Sharma",
  nickname:  "Papa",
  id:        "EXO-TGT-3K82",
  tags:      ["Cardiac", "Hypertension", "Liver Sensitivity ⚠"],
  medicine:  "Metoprolol 25mg",
  frequency: "Once daily — Subah 10 baje",
  nextCall:  "10:15 AM, Today",
  retries:   5,
  language:  "Hindi/English",
  script: {
    hi: "Namaste. Yeh aapke bete ki taraf se ek yaad dilaane ki call hai. Abhi apni Metoprolol ki goli lijiye.",
    en: "Hello! This is a reminder call from your son. Please take your Metoprolol tablet right now.",
  },
  verified: false,
};

export function ScheduledRemindersPanel({ onVerify }: { onVerify: () => void }) {
  return (
    <SketchCard seed={7} className="flex flex-col h-full" style={{ padding: 0 }}>

      {/* ── Header */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{ padding: "16px 24px 14px", borderBottom: "1px solid rgba(26,26,26,0.07)" }}
      >
        <h2 style={{ fontFamily: SG, fontWeight: 700, fontSize: "16px", color: "#1A1A1A", letterSpacing: "-0.01em", margin: 0 }}>
          Scheduled reminders
        </h2>
      </div>

      {/* ── Scrollable body */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px", scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
      >

        {/* Contact identity */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <h3 style={{ fontFamily: SG, fontWeight: 700, fontSize: "17px", color: "#FF4D1C", letterSpacing: "-0.02em", lineHeight: 1.2, margin: 0 }}>
              {reminder.nickname}
            </h3>
            <p style={{ fontFamily: IN, fontWeight: 400, fontSize: "11px", color: "rgba(26,26,26,0.45)", marginTop: "4px" }}>
              {reminder.contact}
            </p>
          </div>
          <div style={{ fontFamily: IN, fontWeight: 600, fontSize: "11px", color: "#2D2F6E", background: "rgba(45,47,110,0.06)", border: "1px solid rgba(45,47,110,0.12)", borderRadius: "8px", padding: "5px 10px", letterSpacing: "0.04em", flexShrink: 0 }}>
            {reminder.id}
          </div>
        </div>

        {/* Medical tags */}
        <div>
          <p style={{ fontFamily: IN, fontWeight: 700, fontSize: "10px", color: "rgba(26,26,26,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Medical context
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {reminder.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: IN, fontWeight: 500, fontSize: "12px",
                  background: tag.includes("⚠") ? "#FEF3C7" : "#EFF6FF",
                  border: `1px solid ${tag.includes("⚠") ? "#FDE68A" : "#BFDBFE"}`,
                  color: tag.includes("⚠") ? "#92400E" : "#1D4ED8",
                  borderRadius: "10px", padding: "4px 12px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Medicine + schedule */}
        <div style={{ background: "#F5F0E8", border: "1px solid rgba(26,26,26,0.08)", borderRadius: "14px", padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <p style={{ fontFamily: IN, fontWeight: 700, fontSize: "10px", color: "rgba(26,26,26,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
                Medicine
              </p>
              <p style={{ fontFamily: SG, fontWeight: 700, fontSize: "17px", color: "#1A1A1A", margin: 0 }}>{reminder.medicine}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            <div>
              <p style={{ fontFamily: IN, fontSize: "10px", color: "rgba(26,26,26,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Schedule</p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: IN, fontSize: "12px", fontWeight: 500, color: "#1A1A1A" }}>
                <Clock size={13} style={{ color: "#2D2F6E" }} />
                {reminder.frequency}
              </div>
            </div>
            <div>
              <p style={{ fontFamily: IN, fontSize: "10px", color: "rgba(26,26,26,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Next call</p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: IN, fontSize: "12px", fontWeight: 500, color: "#1A1A1A" }}>
                <RotateCcw size={13} style={{ color: "#FF4D1C" }} />
                {reminder.nextCall}
              </div>
            </div>
          </div>
        </div>

        {/* Script preview */}
        <div style={{ border: "1px solid rgba(45,47,110,0.15)", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ background: "rgba(45,47,110,0.05)", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(45,47,110,0.1)" }}>
            <Volume2 size={14} style={{ color: "#2D2F6E" }} />
            <p style={{ fontFamily: SG, fontWeight: 600, fontSize: "12px", color: "#2D2F6E", margin: 0 }}>Script preview · {reminder.language}</p>
          </div>
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <span style={{ fontFamily: IN, fontSize: "10px", fontWeight: 700, color: "#FF4D1C", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, paddingTop: "2px" }}>HI</span>
              <p style={{ fontFamily: IN, fontSize: "12px", color: "#1A1A1A", lineHeight: 1.6, margin: 0 }}>
                "{reminder.script.hi}"
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <span style={{ fontFamily: IN, fontSize: "10px", fontWeight: 700, color: "#2D2F6E", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, paddingTop: "2px" }}>EN</span>
              <p style={{ fontFamily: IN, fontSize: "12px", color: "rgba(26,26,26,0.65)", lineHeight: 1.6, margin: 0 }}>
                "{reminder.script.en}"
              </p>
            </div>
          </div>
        </div>

        {/* Responsible AI verification */}
        <div style={{ background: "linear-gradient(135deg, rgba(45,47,110,0.04), rgba(255,77,28,0.04))", border: "1px solid rgba(45,47,110,0.1)", borderRadius: "14px", padding: "14px 18px", display: "flex", gap: "10px" }}>
          <Sparkles size={14} style={{ color: "#FF4D1C", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={{ fontFamily: SG, fontWeight: 600, fontSize: "12px", color: "rgba(26,26,26,0.75)", margin: "0 0 4px" }}>Human verification required</p>
            <p style={{ fontFamily: IN, fontWeight: 400, fontSize: "11px", color: "rgba(26,26,26,0.5)", lineHeight: 1.6, margin: 0 }}>
              Metoprolol has Liver Sensitivity flag. Please confirm dosage before automated call is dispatched.
            </p>
            {!reminder.verified && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                <AlertTriangle size={12} style={{ color: "#D97706" }} />
                <span style={{ fontFamily: IN, fontSize: "10px", fontWeight: 600, color: "#D97706" }}>Pending doctor approval</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </SketchCard>
  );
}
