import React, { useState } from "react";
import { SketchCard } from "./SketchCard";
import { api } from "../../../lib/api";
import { Maximize2, Minimize2 } from "lucide-react";

const CAVEAT = "'Caveat', cursive";

export function ScheduledRemindersPanel({ onScheduled }: { onScheduled: () => void }) {
  const [medicineName, setMedicineName] = useState("");
  const [medicineTime, setMedicineTime] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleSchedule = async () => {
    if (!medicineName.trim() || !medicineTime.trim()) {
      setFeedback({ type: "error", msg: "Please fill medicine name and time" });
      return;
    }

    setScheduling(true);
    setFeedback(null);

    try {
      await api.scheduleMedication({
        drugName: medicineName.trim(),
        time: medicineTime,
        customMessage: voiceMessage.trim() || undefined,
        timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      });

      setFeedback({ type: "success", msg: "Call scheduled! You'll get a Twilio call at the set time." });
      setMedicineName("");
      setMedicineTime("");
      setVoiceMessage("");
      onScheduled();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err?.message || "Failed to schedule. Try again." });
    } finally {
      setScheduling(false);
    }
  };

  const cardContent = (
    <SketchCard seed={7} className="flex flex-col h-full" style={{ padding: 0 }}>
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
            fontFamily: CAVEAT,
            fontWeight: 700,
            fontSize: "28px",
            color: "#1A1A1A",
            margin: 0,
          }}>
            Schedule a Reminder
          </h2>
          <p style={{
            fontFamily: CAVEAT,
            fontSize: "18px",
            color: "rgba(26,26,26,0.4)",
            marginTop: "2px",
          }}>
            Set medicine time & voice message
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

      {/* Form */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px", scrollbarWidth: "thin" }}
      >
        {/* Medicine Name */}
        <div>
          <label style={{
            fontFamily: CAVEAT,
            fontSize: "20px",
            fontWeight: 700,
            color: "#1A1A1A",
            display: "block",
            marginBottom: "6px",
          }}>
            Medicine Name
          </label>
          <input
            type="text"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            placeholder="e.g. Metoprolol 25mg"
            style={{
              width: "100%",
              padding: "10px 14px",
              fontFamily: CAVEAT,
              fontSize: "20px",
              color: "#1A1A1A",
              background: "#FDFAF5",
              border: "2px solid rgba(26,26,26,0.15)",
              borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Medicine Time */}
        <div>
          <label style={{
            fontFamily: CAVEAT,
            fontSize: "20px",
            fontWeight: 700,
            color: "#1A1A1A",
            display: "block",
            marginBottom: "6px",
          }}>
            Call Time
          </label>
          <input
            type="time"
            value={medicineTime}
            onChange={(e) => setMedicineTime(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              fontFamily: CAVEAT,
              fontSize: "20px",
              color: "#1A1A1A",
              background: "#FDFAF5",
              border: "2px solid rgba(26,26,26,0.15)",
              borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Voice Message */}
        <div>
          <label style={{
            fontFamily: CAVEAT,
            fontSize: "20px",
            fontWeight: 700,
            color: "#1A1A1A",
            display: "block",
            marginBottom: "6px",
          }}>
            Voice Message (optional)
          </label>
          <textarea
            value={voiceMessage}
            onChange={(e) => setVoiceMessage(e.target.value)}
            placeholder="e.g. Namaste Papa, apni goli le lijiye..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px 14px",
              fontFamily: CAVEAT,
              fontSize: "20px",
              color: "#1A1A1A",
              background: "#FDFAF5",
              border: "2px solid rgba(26,26,26,0.15)",
              borderRadius: "14px",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={{
            fontFamily: CAVEAT,
            fontSize: "20px",
            fontWeight: 600,
            padding: "8px 14px",
            borderRadius: "10px",
            background: feedback.type === "success" ? "#F0FDF4" : "#FEF2F2",
            color: feedback.type === "success" ? "#166534" : "#B91C1C",
            border: `1px solid ${feedback.type === "success" ? "#BBF7D0" : "#FCA5A5"}`,
          }}>
            {feedback.msg}
          </div>
        )}

        {/* Schedule Button */}
        <button
          onClick={handleSchedule}
          disabled={scheduling}
          style={{
            width: "100%",
            padding: "12px",
            fontFamily: CAVEAT,
            fontSize: "24px",
            fontWeight: 700,
            color: scheduling ? "rgba(26,26,26,0.4)" : "#FDFAF5",
            background: scheduling ? "rgba(26,26,26,0.08)" : "#E85D2A",
            border: "2px solid #1A1A1A",
            borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
            cursor: scheduling ? "not-allowed" : "pointer",
            boxShadow: "3px 4px 0px rgba(26,26,26,0.2)",
            transition: "all 0.2s",
          }}
        >
          {scheduling ? "Scheduling..." : "Schedule Call 📞"}
        </button>
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
