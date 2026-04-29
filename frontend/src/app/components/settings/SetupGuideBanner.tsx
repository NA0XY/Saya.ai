type Props = {
  onOpenSettings: () => void;
  onDismiss: () => void;
};

export function SetupGuideBanner({ onOpenSettings, onDismiss }: Props) {
  return (
    <div className="dashboard-card-wrapper mb-8 animate-fade-in">
      <div className="relative bg-gradient-to-r from-[#1A1A1A] to-[#ff8a5c] rounded-2xl p-6 shadow-lg overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)", backgroundSize: "20px 20px" }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl border border-white/30 flex-shrink-0">
              ⚙️
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Complete Your Setup</h3>
              <p className="text-white/80 text-sm font-medium leading-relaxed">
                Configure guardian contacts and companion personality to get the most out of Saya.ai.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onOpenSettings}
              className="px-6 py-2.5 bg-white text-[#1A1A1A] rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-md transform hover:-translate-y-0.5"
            >
              Open Settings
            </button>
            <button
              onClick={onDismiss}
              aria-label="Dismiss setup guide"
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}