import { useState } from "react";

export function LiveCallDemo() {
  const [isCalling, setIsCalling] = useState(false);

  const handleTriggerCall = () => {
    setIsCalling(true);
    setTimeout(() => {
      alert("Demo call initiated via Exotel!");
      setIsCalling(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <h2 className="text-3xl font-bold text-[#83311A]">Quick Actions</h2>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5 relative overflow-hidden group h-full flex flex-col items-center justify-center">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#E85D2A] opacity-20 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="relative">
            <div className={`text-6xl ${isCalling ? 'animate-bounce' : 'animate-float'}`}>
              📞
            </div>
            {isCalling && (
              <div className="absolute -top-3 -right-3 flex gap-1">
                <div className="w-2 h-2 bg-[#E85D2A] rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-[#E85D2A] rounded-full animate-ping [animation-delay:0.2s]"></div>
              </div>
            )}
          </div>

          <div className="text-center space-y-3">
            <p className="text-[#83311A] font-bold text-xl">
              Test Connection
            </p>
            <p className="text-sm text-gray-600 font-medium max-w-xs leading-relaxed">
              Receive a demonstration call on your registered device.
            </p>
          </div>

          <button
            onClick={handleTriggerCall}
            disabled={isCalling}
            className={`px-8 py-3 bg-[#E85D2A] text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 mt-4 ${isCalling ? 'opacity-80 scale-95' : 'hover:bg-[#83311A] shadow-lg active:scale-95 transform hover:-translate-y-0.5'}`}
          >
            <div className="flex items-center justify-center gap-2">
              {isCalling ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Initiating...</span>
                </>
              ) : (
                <span>Trigger Demo Call</span>
              )}
            </div>
          </button>

          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-3">
            Exotel Infrastructure Active
          </div>
        </div>
      </div>
    </div>
  );
}
