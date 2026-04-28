import React from "react";
import { SketchCard } from "./SketchCard";

// Mood emojis for visual flair
const moods: Record<string, { emoji: string; color: string }> = {
  happy:   { emoji: "😊", color: "#22c55e" },
  calm:    { emoji: "😌", color: "#60a5fa" },
  concerned: { emoji: "😟", color: "#f59e0b" },
  neutral: { emoji: "😐", color: "#a3a3a3" },
};

export interface MoodWidgetProps {
  mood?: string | null;
}

export function MoodWidget({ mood }: MoodWidgetProps) {
  const displayMood = mood || "neutral";
  const moodData = moods[displayMood] || moods.neutral;

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
        {moodData.emoji}
      </div>

      {/* Mood label */}
      <span style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        fontSize: "32px",
        color: moodData.color,
        textTransform: "capitalize",
        textAlign: "center",
      }}>
        {displayMood}
      </span>
    </SketchCard>
  );
}
