import { useEffect, useState } from "react";

type CompanionMood = "neutral" | "happy" | "concerned";
type VoiceState = "idle" | "listening" | "processing";

export function CompanionAvatar({ mood, voiceState }: { mood: CompanionMood; voiceState: VoiceState }) {
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    if (voiceState !== "listening") return;
    
    const mouthInterval = setInterval(() => {
      setMouthOpen((prev) => !prev);
    }, 200);
    return () => clearInterval(mouthInterval);
  }, [voiceState]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      const timer = setTimeout(() => setBlink(false), 200);
      return () => clearTimeout(timer);
    }, 4000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const getMouthPath = () => {
    if (voiceState === "listening" || voiceState === "processing") {
      return mouthOpen ? "M35 65 Q50 72 65 65" : "M35 62 Q50 70 65 62";
    }

    switch (mood) {
      case "happy":
        return "M35 65 Q50 72 65 65";
      case "concerned":
        return "M35 68 Q50 62 65 68";
      default:
        return "M35 65 L65 65";
    }
  };

  const getEyeRadius = () => {
    if (blink) return 1;
    return 5.5;
  };

  return (
    <div className="w-full h-full min-h-96 flex items-center justify-center relative">
      {/* Outer glow */}
      <div
        className={`absolute rounded-full blur-3xl transition-all duration-500 ${
          voiceState === "listening"
            ? "w-96 h-96 bg-[#E85D2A]/50 opacity-100"
            : "w-80 h-80 bg-[#E85D2A]/30 opacity-70"
        }`}
        style={{ pointerEvents: "none" }}
      />

      {/* Avatar Circle */}
      <div
        className={`relative z-10 rounded-full overflow-hidden transition-all duration-500 flex items-center justify-center ${
          voiceState === "listening" ? "w-96 h-96 scale-105" : "w-80 h-80 scale-100"
        }`}
        style={{
          background: "linear-gradient(135deg, #E85D2A 0%, #ff9e6e 50%, #E85D2A 100%)",
          boxShadow: voiceState === "listening" 
            ? "0 0 80px rgba(232, 93, 42, 0.7), 0 0 120px rgba(232, 93, 42, 0.4)"
            : "0 20px 60px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Face Background */}
        <div className="w-full h-full bg-white/95 flex items-center justify-center relative">
          
          {/* SVG Face - Ensure it renders */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            style={{
              maxWidth: "280px",
              maxHeight: "280px",
              transition: "transform 0.3s ease"
            }}
          >
            {/* Left Eye White */}
            <circle cx="28" cy="38" r="9.5" fill="#F5F1EA" />
            
            {/* Left Eye Iris */}
            <circle cx="28" cy="40" r={getEyeRadius()} fill="#E85D2A" />
            
            {/* Left Eye Pupil */}
            <circle cx="28" cy="40" r="3" fill="#000" />
            
            {/* Left Eye Shine */}
            {!blink && <circle cx="29" cy="37" r="1.5" fill="white" />}

            {/* Right Eye White */}
            <circle cx="72" cy="38" r="9.5" fill="#F5F1EA" />
            
            {/* Right Eye Iris */}
            <circle cx="72" cy="40" r={getEyeRadius()} fill="#E85D2A" />
            
            {/* Right Eye Pupil */}
            <circle cx="72" cy="40" r="3" fill="#000" />
            
            {/* Right Eye Shine */}
            {!blink && <circle cx="73" cy="37" r="1.5" fill="white" />}

            {/* Left Eyebrow */}
            <path
              d={mood === "happy" ? "M18 26 Q28 22 38 26" : mood === "concerned" ? "M18 32 Q28 26 38 32" : "M18 28 Q28 24 38 28"}
              stroke="#83311A"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              style={{ transition: "all 0.3s ease" }}
            />

            {/* Right Eyebrow */}
            <path
              d={mood === "happy" ? "M62 26 Q72 22 82 26" : mood === "concerned" ? "M62 32 Q72 26 82 32" : "M62 28 Q72 24 82 28"}
              stroke="#83311A"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              style={{ transition: "all 0.3s ease" }}
            />

            {/* Nose */}
            <path
              d="M50 35 L50 52"
              stroke="#E85D2A"
              strokeWidth="1"
              fill="none"
              opacity="0.2"
            />

            {/* Mouth */}
            <path
              d={getMouthPath()}
              stroke="#E85D2A"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              style={{ transition: "all 0.2s ease" }}
            />

            {/* Blush for Happy */}
            {mood === "happy" && (
              <>
                <circle cx="10" cy="50" r="5" fill="#ffb3ba" opacity="0.7" />
                <circle cx="90" cy="50" r="5" fill="#ffb3ba" opacity="0.7" />
              </>
            )}
          </svg>
        </div>

        {/* Listening Rings */}
        {voiceState === "listening" && (
          <>
            <div
              className="absolute inset-0 rounded-full border-2 border-white/50"
              style={{
                animation: "pulse-ring 1.5s ease-out infinite",
              }}
            />
            <div
              className="absolute inset-6 rounded-full border-2 border-white/30"
              style={{
                animation: "pulse-ring 1.5s ease-out infinite",
                animationDelay: "0.3s",
              }}
            />
          </>
        )}
      </div>

      {/* Processing Dots */}
      {voiceState === "processing" && (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          <div
            className="w-3 h-3 bg-[#E85D2A] rounded-full"
            style={{
              animation: "bounce 1.4s infinite",
              animationDelay: "0ms",
            }}
          />
          <div
            className="w-3 h-3 bg-[#E85D2A] rounded-full"
            style={{
              animation: "bounce 1.4s infinite",
              animationDelay: "200ms",
            }}
          />
          <div
            className="w-3 h-3 bg-[#E85D2A] rounded-full"
            style={{
              animation: "bounce 1.4s infinite",
              animationDelay: "400ms",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          40% {
            transform: translateY(-20px);
            opacity: 1;
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
