type QuickActionsProps = {
  onCallFamily: () => void;
  onHelp: () => void;
  onRemindLater: () => void;
};

export function QuickActions({ onCallFamily, onHelp, onRemindLater }: QuickActionsProps) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        onClick={onCallFamily}
        className="bg-white hover:bg-[#F5F1EA] px-6 py-5 rounded-2xl shadow-sm hover:shadow-lg border-2 border-gray-200 hover:border-[#E85D2A] transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl">📞</span>
          <span className="text-base font-bold text-[#83311A] uppercase tracking-wide">Call Family</span>
        </div>
      </button>

      <button
        onClick={onHelp}
        className="bg-[#E85D2A] hover:bg-[#d64d1f] text-white px-6 py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl">🆘</span>
          <span className="text-base font-bold uppercase tracking-wide">I Need Help</span>
        </div>
      </button>

      <button
        onClick={onRemindLater}
        className="bg-white hover:bg-[#F5F1EA] px-6 py-5 rounded-2xl shadow-sm hover:shadow-lg border-2 border-gray-200 hover:border-[#E85D2A] transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl">⏰</span>
          <span className="text-base font-bold text-[#83311A] uppercase tracking-wide">Remind Later</span>
        </div>
      </button>
    </div>
  );
}
