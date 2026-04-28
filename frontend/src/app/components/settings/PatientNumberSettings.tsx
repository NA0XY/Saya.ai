import { useEffect, useState } from "react";

type Props = {
  patientNumber?: string | null;
  onSave: (patientNumber: string) => Promise<void>;
};

export function PatientNumberSettings({ patientNumber, onSave }: Props) {
  const [value, setValue] = useState(patientNumber ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setValue(patientNumber ?? "");
  }, [patientNumber]);

  const handleSave = async () => {
    if (!value.trim()) return;
    setIsSaving(true);
    setStatus("idle");
    try {
      await onSave(value.trim());
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E85D2A] to-[#ff8a5c] rounded-xl flex items-center justify-center text-xl shadow-md">
            📱
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#83311A]">Patient Number</h3>
            <p className="text-sm text-[#83311A]/60 font-medium">Store the single mobile number Twilio will call for this account.</p>
          </div>
        </div>
      </div>

      <div className="bg-[#F5F1EA]/60 rounded-2xl p-5 border border-[#83311A]/10">
        <label className="block text-xs font-bold uppercase tracking-widest text-[#83311A]/70 mb-3">
          Mobile number
        </label>
        <input
          type="tel"
          inputMode="tel"
          placeholder="Enter patient mobile number"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Patient mobile number"
          className="w-full px-4 py-3 rounded-xl border-2 border-[#83311A]/10 focus:border-[#E85D2A] focus:outline-none bg-white transition-colors text-base font-medium placeholder-gray-400"
        />
        <p className="text-xs text-[#83311A]/60 mt-3 font-medium">Only one patient number is stored for this account.</p>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-[#83311A]/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="text-sm font-medium">
          {status === "success" && <span className="text-green-600 font-bold">Patient number saved successfully</span>}
          {status === "error" && <span className="text-red-500 font-bold">Save failed - please enter a valid Indian mobile number</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !value.trim()}
          className="w-full sm:w-auto px-8 py-4 bg-[#E85D2A] text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#83311A] transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
        >
          {isSaving ? "Saving..." : "Save Patient Number"}
        </button>
      </div>
    </div>
  );
}