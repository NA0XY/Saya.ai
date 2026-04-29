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
          <div className="w-10 h-10 bg-white sketch-box text-[#1A1A1A] flex items-center justify-center text-xl shadow-sm">
            📱
          </div>
          <div>
            <h3 className="text-xl font-sketch font-bold text-[#1A1A1A] relative -top-1.5">Patient Number</h3>
            <p className="text-[10px] text-[#1A1A1A]/60 font-sketch font-medium uppercase tracking-wider">Mobile number Twilio will call</p>
          </div>
        </div>
      </div>

      <div className="bg-white sketch-box p-5 text-[#1A1A1A]" style={{ transform: 'rotate(-0.2deg)' }}>
        <div className="relative mb-4">
          <label className="inline-block text-xs font-sketch font-bold uppercase tracking-widest text-[#1A1A1A]/70">
            Mobile number
          </label>
          <div className="absolute -bottom-1 left-0 w-16 sketch-underline border-[#1A1A1A]"></div>
        </div>
        
        <div className="sketch-box text-[#1A1A1A]">
          <input
            type="tel"
            inputMode="tel"
            placeholder="Enter mobile number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label="Patient mobile number"
            className="w-full px-3 py-3 bg-transparent focus:outline-none font-sketch text-lg placeholder-[#1A1A1A]/40"
          />
        </div>
        <p className="text-xs font-sketch text-[#1A1A1A]/60 mt-3 italic">Only one patient number is stored.</p>
      </div>

      <div className="p-6 bg-white sketch-box text-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm" style={{ transform: 'rotate(0.3deg)' }}>
        <div className="text-base font-sketch font-bold">
          {status === "success" && <span className="text-green-600">Saved!</span>}
          {status === "error" && <span className="text-red-500 font-bold">Oops! Try again.</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !value.trim()}
          className="w-full sm:w-auto px-8 py-3 bg-[#E85D2A] text-white sketch-box border-black font-sketch font-bold uppercase tracking-widest text-sm hover:rotate-[0.5deg] hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          style={{ transform: 'rotate(-0.5deg)' }}
        >
          {isSaving ? "Sketching..." : "Save Number"}
        </button>
      </div>
    </div>
  );
}