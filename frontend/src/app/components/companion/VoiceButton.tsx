type VoiceState = "idle" | "listening" | "processing";

export function VoiceButton({ state, onClick }: { state: VoiceState; onClick: () => void }) {
  return (
    <div className="flex justify-center">
      <button
        onClick={onClick}
        disabled={state !== "idle"}
        className={`relative w-40 h-40 rounded-full shadow-2xl transition-all duration-500 ${
          state === "idle"
            ? "bg-gradient-to-br from-[#E85D2A] to-[#ff9e6e] hover:from-[#d64d1f] hover:to-[#ff8a5c] hover:scale-110 active:scale-95 cursor-pointer"
            : state === "listening"
            ? "bg-gradient-to-br from-[#E85D2A] to-[#ff9e6e] scale-110"
            : "bg-gradient-to-br from-[#E85D2A] to-[#ff9e6e] opacity-80"
        } disabled:cursor-not-allowed font-semibold`}
      >
        <div className="flex items-center justify-center h-full w-full">
          {state === "idle" && (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-16 h-16 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
              <span className="text-white text-sm font-semibold uppercase tracking-wide">Speak</span>
            </div>
          )}

          {state === "listening" && (
            <div className="flex gap-2 items-end justify-center h-full">
              <div className="w-1.5 h-12 bg-white/90 rounded-full animate-pulse" style={{ animationDuration: "0.6s", animationDelay: "0s" }} />
              <div className="w-1.5 h-16 bg-white rounded-full animate-pulse" style={{ animationDuration: "0.6s", animationDelay: "0.1s" }} />
              <div className="w-1.5 h-12 bg-white/90 rounded-full animate-pulse" style={{ animationDuration: "0.6s", animationDelay: "0.2s" }} />
              <div className="w-1.5 h-16 bg-white rounded-full animate-pulse" style={{ animationDuration: "0.6s", animationDelay: "0.3s" }} />
              <div className="w-1.5 h-12 bg-white/90 rounded-full animate-pulse" style={{ animationDuration: "0.6s", animationDelay: "0.4s" }} />
            </div>
          )}

          {state === "processing" && (
            <svg className="w-16 h-16 text-white animate-spin drop-shadow" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>

        {state === "listening" && (
          <div className="absolute inset-0 rounded-full border-3 border-white/40 animate-ping opacity-75" />
        )}
      </button>
    </div>
  );
}
