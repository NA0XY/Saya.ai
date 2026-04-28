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
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white sketch-box text-[#D94F2B] flex items-center justify-center text-xl shadow-sm">
            📱
          </div>
          <div>
            <h3 className="text-xl font-sketch font-bold text-[#D94F2B] relative -top-1.5">Patient Number</h3>
            <p className="text-[10px] text-[#83311A]/60 font-sketch font-medium uppercase tracking-wider">Mobile number Twilio will call</p>
          </div>
        </div>
      </div>

      <div className="bg-white sketch-box p-5 text-[#D94F2B]" style={{ transform: 'rotate(-0.2deg)' }}>
        <div className="relative mb-4">
          <label className="inline-block text-xs font-sketch font-bold uppercase tracking-widest text-[#83311A]/70">
            Mobile number
          </label>
          <div className="absolute -bottom-1 left-0 w-16 sketch-underline border-[#D94F2B]"></div>
        </div>
        
        <div className="sketch-box text-[#D94F2B]">
          <input
            type="tel"
            inputMode="tel"
            placeholder="Enter mobile number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label="Patient mobile number"
            className="w-full px-3 py-3 bg-transparent focus:outline-none font-sketch text-lg placeholder-[#83311A]/40"
          />
        </div>
        <p className="text-xs font-sketch text-[#83311A]/60 mt-3 italic">Only one patient number is stored.</p>
      </div>

      <div className="p-6 bg-white sketch-box text-[#D94F2B] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm" style={{ transform: 'rotate(0.3deg)' }}>
        <div className="text-base font-sketch font-bold">
          {status === "success" && <span className="text-green-600">Saved!</span>}
          {status === "error" && <span className="text-red-500 font-bold">Oops! Try again.</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !value.trim()}
          className="w-full sm:w-auto px-8 py-3 bg-[#D94F2B] text-white sketch-box font-sketch font-bold uppercase tracking-widest text-sm hover:rotate-[0.5deg] hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          style={{ transform: 'rotate(-0.5deg)' }}
        >
          {isSaving ? "Sketching..." : "Save Number"}
        </button>
      </div>
    </div>
  );
}