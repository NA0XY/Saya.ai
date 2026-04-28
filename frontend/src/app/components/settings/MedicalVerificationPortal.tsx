import { useState } from "react";

type Medicine = {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  confidence: "high" | "low";
  verified: boolean;
};

const INDIAN_DRUGS = [
  "Metoprolol","Atorvastatin","Aspirin","Amlodipine","Metformin",
  "Losartan","Omeprazole","Pantoprazole","Telmisartan","Clopidogrel",
  "Ramipril","Rosuvastatin","Glimepiride","Dolo 650","Ecosprin","Cardace"
];

const FREQ_OPTS = [
  "Once daily","Twice daily","Three times daily",
  "Once daily (morning)","Once daily (night)","As needed","Every 12 hours","Every 8 hours"
];

type Props = { onSave: (medicines: Medicine[]) => Promise<void> };

export function MedicalVerificationPortal({ onSave }: Props) {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id:"1", drugName:"Metoprolol", dosage:"50mg", frequency:"Twice daily", confidence:"high", verified:true },
    { id:"2", drugName:"Aspirin", dosage:"75mg", frequency:"Once daily", confidence:"high", verified:false },
    { id:"3", drugName:"Atorvastatin", dosage:"20mg", frequency:"Once daily (night)", confidence:"low", verified:false },
  ]);
  const [focusId, setFocusId] = useState<string|null>(null);
  const [query, setQuery] = useState<Record<string,string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle"|"success"|"error">("idle");

  const update = (id:string, field:keyof Medicine, val:string|boolean) => {
    setMedicines(ms => ms.map(m => m.id===id ? {...m,[field]:val} : m));
    setStatus("idle");
  };

  const filtered = (id:string) => {
    const q = (query[id]||"").toLowerCase();
    return q ? INDIAN_DRUGS.filter(d => d.toLowerCase().includes(q)) : INDIAN_DRUGS.slice(0,8);
  };

  const confirmAll = async () => {
    setIsSaving(true); setStatus("idle");
    const updated = medicines.map(m => ({...m, verified:true}));
    setMedicines(updated);
    try { await onSave(updated); setStatus("success"); setTimeout(()=>setStatus("idle"),3000); }
    catch { setStatus("error"); }
    finally { setIsSaving(false); }
  };

  const allOk = medicines.every(m => m.verified);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white sketch-box text-[#D94F2B] flex items-center justify-center text-xl shadow-sm">
            💊
          </div>
          <div>
            <h3 className="text-xl font-sketch font-bold text-[#D94F2B] relative -top-1.5">Medical Verification</h3>
            <p className="text-[10px] text-[#83311A]/60 font-sketch font-medium uppercase tracking-wider">
              Verify prescriptions before activation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-transparent sketch-box border-[#D94F2B] px-3 py-1.5" style={{ transform: 'rotate(0.5deg)' }}>
          <div className="w-2 h-2 sketch-dot bg-[#D94F2B] animate-pulse" />
          <span className="text-[10px] font-sketch font-bold uppercase tracking-widest text-[#D94F2B]">HITL Required</span>
        </div>
      </div>

      <div className="space-y-4">
        {medicines.map((med, i) => (
          <div key={med.id} className="bg-white sketch-box p-5 text-[#D94F2B] shadow-sm" style={{ transform: `rotate(${i % 2 === 0 ? -0.2 : 0.2}deg)` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#D94F2B] text-white sketch-avatar flex items-center justify-center font-sketch font-bold text-base">{i+1}</div>
                <span className={`px-3 py-0.5 sketch-box font-sketch text-[10px] font-bold uppercase tracking-wider ${med.verified ? "text-green-600 border-green-600" : "text-[#D94F2B] border-[#D94F2B]"}`}>
                  {med.verified ? "✓ Verified" : "Pending"}
                </span>
              </div>
              <button onClick={() => update(med.id, "verified", !med.verified)} className="text-[10px] font-sketch font-bold uppercase tracking-widest px-3 py-1 sketch-box hover:rotate-[-0.5deg] transition-all">
                {med.verified ? "Unverify" : "Verify"}
              </button>
            </div>
            
            <div className="grid gap-4">
              <div className="relative">
                <div className="relative mb-2">
                  <label className="inline-block text-[10px] font-sketch font-bold uppercase tracking-widest text-[#83311A]/70">Drug Name</label>
                  <div className="absolute -bottom-0.5 left-0 w-12 sketch-underline border-[#D94F2B]"></div>
                </div>
                <div className="sketch-box text-[#D94F2B]">
                  <input type="text" value={query[med.id]!==undefined && focusId===med.id ? query[med.id] : med.drugName}
                    onChange={e => { setQuery({...query,[med.id]:e.target.value}); update(med.id,"drugName",e.target.value); }}
                    onFocus={() => setFocusId(med.id)} onBlur={() => setTimeout(()=>setFocusId(null),200)}
                    aria-label={`Drug name for medicine ${i+1}`}
                    className="w-full px-3 py-2 bg-transparent focus:outline-none font-sketch text-lg font-bold text-[#D94F2B] placeholder-[#83311A]/40" />
                </div>
                {focusId===med.id && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white sketch-box text-[#D94F2B] shadow-lg max-h-40 overflow-y-auto">
                    {filtered(med.id).map(d => (
                      <button key={d} onMouseDown={()=>{update(med.id,"drugName",d);setFocusId(null);setQuery({...query,[med.id]:""});}} className="w-full text-left px-3 py-2 hover:bg-[#D94F2B]/5 font-sketch text-base font-bold transition-colors">{d}</button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="relative mb-2">
                    <label className="inline-block text-[10px] font-sketch font-bold uppercase tracking-widest text-[#83311A]/70">Dosage</label>
                  </div>
                  <div className="sketch-box text-[#D94F2B]">
                    <input type="text" value={med.dosage} onChange={e => update(med.id,"dosage",e.target.value)} placeholder="e.g., 50mg" className="w-full px-3 py-2 bg-transparent focus:outline-none font-sketch text-base" />
                  </div>
                </div>
                <div>
                  <div className="relative mb-2">
                    <label className="inline-block text-[10px] font-sketch font-bold uppercase tracking-widest text-[#83311A]/70">Frequency</label>
                  </div>
                  <div className="sketch-box text-[#D94F2B]">
                    <select value={med.frequency} onChange={e => update(med.id,"frequency",e.target.value)} className="w-full px-3 py-2 bg-transparent focus:outline-none font-sketch text-base appearance-none">
                      {FREQ_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-white sketch-box text-[#D94F2B] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm" style={{ transform: 'rotate(-0.1deg)' }}>
        <div className="text-base font-sketch font-bold">
          {status==="success" && <span className="text-green-600">✓ All confirmed!</span>}
          {status==="error" && <span className="text-red-500">Oops! Try again.</span>}
          {status==="idle" && !allOk && <span className="text-amber-600 text-sm font-sketch">{medicines.filter(m=>!m.verified).length} pending...</span>}
        </div>
        <button onClick={confirmAll} disabled={isSaving||allOk} className="w-full sm:w-auto px-8 py-3 bg-[#D94F2B] text-white sketch-box font-sketch font-bold uppercase tracking-widest text-sm hover:rotate-[0.5deg] hover:scale-105 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
          {isSaving ? "Sketching..." : allOk ? "All Verified ✓" : "Confirm All"}
        </button>
      </div>
    </div>
  );
}