import { Phone, ShieldAlert, Clock, Newspaper } from "lucide-react";

type QuickActionsProps = {
  onCallFamily: () => void;
  onHelp: () => void;
  onRemindLater: () => void;
  onShowNews: () => void;
};

export function QuickActions({ onCallFamily, onHelp, onRemindLater, onShowNews }: QuickActionsProps) {
  return (
    <div className="w-full grid [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))] gap-4 lg:gap-6 max-w-5xl mx-auto">
      {/* Call Family Card */}
      <button
        onClick={onCallFamily}
        aria-label="Call family"
        className="group bg-white hover:bg-gray-50 px-6 py-5 rounded-3xl border-2 border-transparent hover:border-pink-200 shadow-sm hover:shadow-md transition-all duration-300 text-left flex items-start gap-4 min-h-[138px]"
      >
        <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Phone className="w-5 h-5 text-[#C4245C]" fill="currentColor" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-extrabold text-[#C4245C] uppercase tracking-wider">Call Family</span>
          <span className="text-sm font-medium text-gray-500 mt-0.5">Connect with loved ones</span>
        </div>
      </button>

      {/* I Need Help Card */}
      <button
        onClick={onHelp}
        aria-label="I need help"
        className="group bg-gradient-to-br from-[#FF6B35] to-[#E85D2A] hover:from-[#ff794a] hover:to-[#f06432] px-6 py-5 rounded-3xl border-2 border-transparent shadow-[0_8px_16px_rgba(232,93,42,0.2)] hover:shadow-[0_12px_24px_rgba(232,93,42,0.3)] transition-all duration-300 text-left flex items-start gap-4 min-h-[138px]"
      >
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-extrabold text-white uppercase tracking-wider">I Need Help</span>
          <span className="text-sm font-medium text-white/90 mt-0.5">Get immediate assistance</span>
        </div>
      </button>

      {/* Remind Later Card */}
      <button
        onClick={onRemindLater}
        aria-label="Remind me later"
        className="group bg-white hover:bg-gray-50 px-6 py-5 rounded-3xl border-2 border-transparent hover:border-orange-200 shadow-sm hover:shadow-md transition-all duration-300 text-left flex items-start gap-4 min-h-[138px]"
      >
        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Clock className="w-5 h-5 text-[#D97746]" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-extrabold text-[#D97746] uppercase tracking-wider">Remind Later</span>
          <span className="text-sm font-medium text-gray-500 mt-0.5">Set a reminder</span>
        </div>
      </button>

      <button
        onClick={onShowNews}
        aria-label="Show today's news"
        className="group bg-white hover:bg-gray-50 px-6 py-5 rounded-3xl border-2 border-transparent hover:border-cyan-200 shadow-sm hover:shadow-md transition-all duration-300 text-left flex items-start gap-4 min-h-[138px]"
      >
        <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Newspaper className="w-5 h-5 text-[#2A2B3D]" strokeWidth={2.2} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-extrabold text-[#2A2B3D] uppercase tracking-wider">Today&apos;s News</span>
          <span className="text-sm font-medium text-gray-500 mt-0.5">Browse top headlines</span>
        </div>
      </button>
    </div>
  );
}
