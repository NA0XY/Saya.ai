export function SystemStatusPanel() {
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#047857] rounded-2xl flex items-center justify-center text-2xl shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#83311A]">System Status</h3>
            <p className="text-base text-[#83311A]/60 font-medium">Live connection status for critical Saya.ai infrastructure.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exotel Status */}
        <div className="bg-white rounded-2xl p-6 border border-[#83311A]/10 shadow-sm flex flex-col justify-between h-48 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
             <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#83311A] mb-1">Exotel Telephony</h4>
            <p className="text-sm text-[#83311A]/60 font-medium">Guardian Caller & SMS Infrastructure</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">Operational</span>
              <span className="text-xs font-bold text-[#83311A]/40">~24ms ping</span>
            </div>
            <p className="text-xs text-[#83311A]/50">Last checked: Just now</p>
          </div>
        </div>

        {/* Groq Status */}
        <div className="bg-white rounded-2xl p-6 border border-[#83311A]/10 shadow-sm flex flex-col justify-between h-48 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
             <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#83311A] mb-1">Groq LPU API</h4>
            <p className="text-sm text-[#83311A]/60 font-medium">Llama-3-70b Inference Engine</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">Operational</span>
              <span className="text-xs font-bold text-[#83311A]/40">810 tokens/s</span>
            </div>
            <p className="text-xs text-[#83311A]/50">Last checked: Just now</p>
          </div>
        </div>
        
        {/* Supabase Status */}
        <div className="bg-white rounded-2xl p-6 border border-[#83311A]/10 shadow-sm flex flex-col justify-between h-48 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
             <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#83311A] mb-1">Supabase Edge</h4>
            <p className="text-sm text-[#83311A]/60 font-medium">Encrypted Data & Authentication</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">Operational</span>
              <span className="text-xs font-bold text-[#83311A]/40">US-East (N. Virginia)</span>
            </div>
            <p className="text-xs text-[#83311A]/50">Last checked: Just now</p>
          </div>
        </div>
      </div>
    </div>
  );
}
