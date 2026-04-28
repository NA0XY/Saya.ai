import { Mic, Loader2 } from "lucide-react";

type VoiceState =
  | "idle"
  | "listening"
  | "finalizing"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "auto_relisten";

type VoiceButtonProps = {
  state: VoiceState;
  onClick: () => void;
};

export function VoiceButton({ state, onClick }: VoiceButtonProps) {
  const isProcessing =
    state === "finalizing" || state === "transcribing" || state === "thinking" || state === "speaking" || state === "auto_relisten";
  const canToggleListening = state === "idle" || state === "listening";
  const stateLabel =
    state === "idle"
      ? "Speak"
      : state === "listening"
      ? "Listening"
      : state === "finalizing"
      ? "Finalizing"
      : state === "transcribing"
      ? "Transcribing"
      : state === "thinking"
      ? "Thinking"
      : state === "auto_relisten"
      ? "Restarting"
      : "Speaking";

  // Waveform bars on the left and right
  const renderWaveform = (side: "left" | "right") => {
    const isListening = state === "listening";
    const delays = side === "left" ? ["0ms", "150ms", "300ms"] : ["300ms", "150ms", "0ms"];
    const heights = ["h-6", "h-10", "h-14"];
    
    return (
      <div className="flex items-center gap-1.5 mx-4">
        {delays.map((delay, i) => (
          <div 
            key={`${side}-${i}`}
            className={`w-1.5 bg-[#E85D2A] rounded-full transition-all duration-500 ease-in-out
              ${isListening ? 'animate-pulse opacity-100' : 'h-2 opacity-40'}
              ${isListening ? heights[i] : ''}
            `}
            style={{ animationDelay: delay }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center">
      {renderWaveform("left")}
      
      <button
        onClick={onClick}
        aria-label={
          state === "idle"
            ? "Start voice input"
            : state === "listening"
            ? "Stop voice input"
            : `${stateLabel} in progress`
        }
        disabled={!canToggleListening}
        className={`relative w-32 h-32 rounded-full transition-all duration-300 flex items-center justify-center z-10
          ${
            state === "idle"
              ? "bg-gradient-to-b from-[#ff8a63] to-[#E85D2A] shadow-[0_15px_30px_rgba(232,93,42,0.4),inset_0_4px_10px_rgba(255,255,255,0.5),inset_0_-4px_10px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 cursor-pointer hover:shadow-[0_20px_40px_rgba(232,93,42,0.5),inset_0_6px_12px_rgba(255,255,255,0.6),inset_0_-4px_10px_rgba(0,0,0,0.15)]"
              : state === "listening"
              ? "bg-gradient-to-b from-[#ff8a63] to-[#E85D2A] scale-105 shadow-[0_0_40px_rgba(232,93,42,0.6),inset_0_4px_10px_rgba(255,255,255,0.5),inset_0_-4px_10px_rgba(0,0,0,0.15)]"
              : "bg-gradient-to-b from-[#ff8a63] to-[#E85D2A] opacity-85 shadow-none"
          } disabled:cursor-not-allowed disabled:opacity-80`}
      >
        {state === "idle" && (
          <div className="flex flex-col items-center gap-2">
            <Mic className="w-10 h-10 text-white filter drop-shadow-md" strokeWidth={2.5} />
            <span className="text-white text-sm font-extrabold uppercase tracking-widest drop-shadow-md">Speak</span>
          </div>
        )}

        {state === "listening" && (
          <div className="flex flex-col items-center gap-2">
             <Mic className="w-10 h-10 text-white animate-pulse" strokeWidth={2.5} />
             <span className="text-white text-sm font-extrabold uppercase tracking-widest animate-pulse">Listening</span>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <span className="text-white text-sm font-extrabold uppercase tracking-widest">{stateLabel}</span>
          </div>
        )}
      </button>

      {renderWaveform("right")}
      </div>
    </div>
  );
}
