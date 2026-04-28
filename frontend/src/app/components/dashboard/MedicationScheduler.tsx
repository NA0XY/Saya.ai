import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

export function MedicationScheduler() {
  const [medicineName, setMedicineName] = useState("");
  const [time, setTime] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (medicineName && time) {
      setIsScheduling(true);
      setStatus(null);
      try {
        const result = await api.scheduleMedication({
          drugName: medicineName,
          time,
          customMessage: customMessage || undefined,
          timezoneOffsetMinutes: new Date().getTimezoneOffset()
        });
        setStatus(`Scheduled ${medicineName} (${result.status})`);
        setMedicineName("");
        setTime("");
        setCustomMessage("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to schedule medication");
      } finally {
        setIsScheduling(false);
      }
    }
  };

  return (
    <section className="medication-scheduler-section relative h-full">
      <div className="flex flex-col gap-6 h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-[#83311A]">Schedule Reminder</h2>
          <Link to="/prescription-upload">
            <button className="px-4 py-2.5 bg-[#F5F1EA] hover:bg-[#E85D2A] hover:text-white text-[#83311A] rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-sm border border-black/5 flex items-center gap-2 w-fit">
              <span className="text-lg">📋</span>
              Auto-Extract
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 relative overflow-hidden group flex-1 flex flex-col">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E85D2A] opacity-20 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600">
                  Medicine Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="e.g., Metoprolol"
                    className="w-full px-4 py-3 rounded-lg border-2 border-black/5 focus:border-[#E85D2A] focus:outline-none bg-[#F5F1EA]/40 transition-all text-sm font-medium placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600">
                  Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-black/5 focus:border-[#E85D2A] focus:outline-none bg-[#F5F1EA]/40 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5 flex flex-col justify-between">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600">
                  Voice Message (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Take your tablet now..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 border-black/5 focus:border-[#E85D2A] focus:outline-none bg-[#F5F1EA]/40 transition-all text-sm font-medium resize-none placeholder-gray-400"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>{status ?? "AI Personalized"}</span>
                </div>

                <button
                  onClick={handleSchedule}
                  disabled={!medicineName || !time || isScheduling}
                  className="px-6 py-2.5 bg-[#E85D2A] text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#83311A] transition-all shadow-md disabled:opacity-40 transform hover:-translate-y-0.5"
                >
                  {isScheduling ? "Scheduling" : "Schedule Call"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

