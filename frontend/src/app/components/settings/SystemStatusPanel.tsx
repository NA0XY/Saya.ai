export function SystemStatusPanel() {
  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white sketch-box text-[#1A1A1A] flex items-center justify-center text-2xl shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-sketch font-bold text-[#1A1A1A] relative -top-1.5">System Status</h3>
            <p className="text-sm text-[#1A1A1A]/60 font-sketch font-medium uppercase tracking-wider">Live connection status for critical infrastructure.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Exotel Status */}
        <div className="bg-white sketch-box p-6 text-[#1A1A1A] sketch-shadow flex flex-col justify-between h-52 relative" style={{ transform: 'rotate(-0.5deg)' }}>
          <div className="absolute top-0 right-0 p-6">
             <div className="w-3 h-3 bg-green-500 sketch-dot shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse" />
          </div>
          <div>
            <h4 className="text-xl font-sketch font-bold text-[#1A1A1A] mb-1">Exotel Telephony</h4>
            <p className="text-base text-[#1A1A1A]/60 font-sketch">Guardian Caller & SMS</p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-sketch font-bold uppercase tracking-widest text-green-600 sketch-box border-green-600 px-3 py-1">Operational</span>
              <span className="text-sm font-sketch text-[#1A1A1A]/40">~24ms ping</span>
            </div>
            <p className="text-xs font-sketch text-[#1A1A1A]/50">Last checked: Just now</p>
          </div>
        </div>

        {/* Groq Status */}
        <div className="bg-white sketch-box p-6 text-[#1A1A1A] sketch-shadow flex flex-col justify-between h-52 relative" style={{ transform: 'rotate(0.5deg)' }}>
          <div className="absolute top-0 right-0 p-6">
             <div className="w-3 h-3 bg-green-500 sketch-dot shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse" />
          </div>
          <div>
            <h4 className="text-xl font-sketch font-bold text-[#1A1A1A] mb-1">Groq LPU API</h4>
            <p className="text-base text-[#1A1A1A]/60 font-sketch">Llama-3-70b Engine</p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-sketch font-bold uppercase tracking-widest text-green-600 sketch-box border-green-600 px-3 py-1">Operational</span>
              <span className="text-sm font-sketch text-[#1A1A1A]/40">810 tokens/s</span>
            </div>
            <p className="text-xs font-sketch text-[#1A1A1A]/50">Last checked: Just now</p>
          </div>
        </div>
        
        {/* Supabase Status */}
        <div className="bg-white sketch-box p-6 text-[#1A1A1A] sketch-shadow flex flex-col justify-between h-52 relative" style={{ transform: 'rotate(-0.3deg)' }}>
          <div className="absolute top-0 right-0 p-6">
             <div className="w-3 h-3 bg-green-500 sketch-dot shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse" />
          </div>
          <div>
            <h4 className="text-xl font-sketch font-bold text-[#1A1A1A] mb-1">Supabase Edge</h4>
            <p className="text-base text-[#1A1A1A]/60 font-sketch">Encrypted Data & Auth</p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-sketch font-bold uppercase tracking-widest text-green-600 sketch-box border-green-600 px-3 py-1">Operational</span>
              <span className="text-sm font-sketch text-[#1A1A1A]/40">US-East (N. Virginia)</span>
            </div>
            <p className="text-xs font-sketch text-[#1A1A1A]/50">Last checked: Just now</p>
          </div>
        </div>
      </div>
    </div>
  );
}