import React from "react";
import { SketchCard } from "./SketchCard";

// Mood emojis for visual flair
const moods: Record<string, { emoji: string; color: string }> = {
  happy:   { emoji: "😊", color: "#22c55e" },
  calm:    { emoji: "😌", color: "#60a5fa" },
  anxious: { emoji: "😟", color: "#f59e0b" },
  sad:     { emoji: "😢", color: "#ef4444" },
  neutral: { emoji: "😐", color: "#a3a3a3" },
};

// In production, this would come from the API
const currentMood = "anxious";

export function MoodWidget() {
  const mood = moods[currentMood] || moods.neutral;

  return (
    <SketchCard seed={14} className="flex flex-col h-full" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Header */}
      <span style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        fontSize: "24px",
        color: "#1A1A1A",
        letterSpacing: "-0.01em",
        marginBottom: "16px",
        textAlign: "center",
      }}>
        Last mood
      </span>

      {/* Big emoji */}
      <div style={{
        fontSize: "64px",
        lineHeight: 1,
        marginBottom: "12px",
        textAlign: "center",
      }}>
        {mood.emoji}
      </div>

      {/* Mood label */}
      <span style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        fontSize: "32px",
        color: mood.color,
        textTransform: "capitalize",
        textAlign: "center",
      }}>
        {currentMood}
      </span>
    </SketchCard>
  );
}
