import { useEffect, useState } from "react";
import { EXPRESSION_MAP, type MoodType } from "./expressionMap";

type VoiceState = "idle" | "listening" | "transcribing" | "thinking" | "speaking";

type CompanionAvatarProps = {
  mood: MoodType;
  voiceState: VoiceState;
};

export function CompanionAvatar({ mood, voiceState }: CompanionAvatarProps) {
  const [displayedMood, setDisplayedMood] = useState<MoodType>(mood);
  const [prevMood, setPrevMood] = useState<MoodType | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [currentVisible, setCurrentVisible] = useState(false);
  const [currentImageFailed, setCurrentImageFailed] = useState(false);

  useEffect(() => {
    if (mood === displayedMood) return;

    setPrevMood(displayedMood);
    setDisplayedMood(mood);
    setIsCrossfading(true);
    setCurrentVisible(false);

    const startFrame = window.requestAnimationFrame(() => {
      setCurrentVisible(true);
    });

    const timer = window.setTimeout(() => {
      setPrevMood(null);
      setIsCrossfading(false);
      setCurrentVisible(true);
    }, 650);

    return () => {
      window.cancelAnimationFrame(startFrame);
      window.clearTimeout(timer);
    };
  }, [displayedMood, mood]);

  useEffect(() => {
    setCurrentImageFailed(false);
  }, [displayedMood]);

  return (
    <div className="w-full h-full min-h-96 flex flex-col items-center justify-center relative group">
      <div
        className={`relative z-10 w-full h-full flex items-center justify-center transition-all duration-300 ${
          voiceState === "listening" ? "scale-105" : "scale-100 hover:scale-[1.02]"
        }`}
        style={{ animation: voiceState === "listening" ? "none" : "companion-float 6s ease-in-out infinite" }}
      >
        <div className="relative w-full h-full">
          {prevMood && (
            <img
              src={EXPRESSION_MAP[prevMood] ?? EXPRESSION_MAP.neutral}
              alt={`Companion ${prevMood} expression`}
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-[600ms] ease-in-out drop-shadow-[0_20px_35px_rgba(232,93,42,0.22)]"
              style={{ opacity: isCrossfading ? 0 : 1 }}
              loading="eager"
              decoding="sync"
            />
          )}
          {!currentImageFailed ? (
            <img
              src={EXPRESSION_MAP[displayedMood] ?? EXPRESSION_MAP.neutral}
              alt={`Companion ${displayedMood} expression`}
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-[600ms] ease-in-out drop-shadow-[0_20px_35px_rgba(232,93,42,0.28)]"
              style={{ opacity: isCrossfading ? (currentVisible ? 1 : 0) : 1 }}
              loading="eager"
              decoding="sync"
              onError={() => setCurrentImageFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80 border border-[#E85D2A]/20 text-7xl">
              🙂
            </div>
          )}
        </div>
        <div
          className="absolute inset-8 bg-[#E85D2A]/40 blur-[60px] -z-10 rounded-full opacity-60 animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div className="absolute inset-16 bg-[#E85D2A]/50 blur-[80px] -z-10 rounded-full opacity-50" />
      </div>

      {voiceState === "listening" && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-end gap-1 z-20">
          {[12, 20, 28, 20, 12].map((height, index) => (
            <span
              key={`soundwave-${height}-${index}`}
              className="w-1.5 rounded-full bg-[#E85D2A]"
              style={{
                height: `${height}px`,
                animation: `soundwave 900ms ease-in-out ${index * 120}ms infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      {(voiceState === "transcribing" || voiceState === "thinking") && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="w-2.5 h-2.5 bg-[#E85D2A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2.5 h-2.5 bg-[#E85D2A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2.5 h-2.5 bg-[#E85D2A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      )}

      <style>{`
        @keyframes companion-float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes soundwave {
          0% { transform: scaleY(0.45); opacity: 0.45; }
          100% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
