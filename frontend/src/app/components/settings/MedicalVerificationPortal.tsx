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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#3F48CC] to-[#6366f1] rounded-xl flex items-center justify-center text-xl shadow-md">💊</div>
          <div>
            <h3 className="text-xl font-bold text-[#83311A]">Medical Verification Portal</h3>
            <p className="text-sm text-[#83311A]/60 font-medium">Verify prescriptions before activation</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[#83311A]/5 border border-[#83311A]/10 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-[#E85D2A] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#83311A]">Human-in-the-Loop Required</span>
        </div>
      </div>

      <div className="space-y-4">
        {medicines.map((med, i) => (
          <div key={med.id} className={`bg-white rounded-2xl p-5 border-2 transition-all hover:shadow-md ${med.verified ? "border-green-200 bg-green-50/30" : med.confidence==="low" ? "border-[#E85D2A]/30 bg-orange-50/30" : "border-[#83311A]/10"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#E85D2A] text-white rounded-full flex items-center justify-center font-bold text-sm">{i+1}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${med.verified ? "bg-green-100 text-green-700 border border-green-300" : "bg-amber-100 text-amber-700 border border-amber-300"}`}>
                  {med.verified ? "✓ Verified" : "Pending"}
                </span>
              </div>
              <button onClick={() => update(med.id, "verified", !med.verified)} className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${med.verified ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-[#E85D2A] bg-[#E85D2A]/10 hover:bg-[#E85D2A]/20"}`}>
                {med.verified ? "Unverify" : "Verify"}
              </button>
            </div>
            <div className="grid gap-4">
              <div className="relative">
                <label className="block text-xs font-bold mb-2 text-[#83311A]/70 uppercase tracking-wider">Drug Name</label>
                <input type="text" value={query[med.id]!==undefined && focusId===med.id ? query[med.id] : med.drugName}
                  onChange={e => { setQuery({...query,[med.id]:e.target.value}); update(med.id,"drugName",e.target.value); }}
                  onFocus={() => setFocusId(med.id)} onBlur={() => setTimeout(()=>setFocusId(null),200)}
                  aria-label={`Drug name for medicine ${i+1}`}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#83311A]/10 focus:border-[#E85D2A] focus:outline-none bg-white transition-colors font-bold text-[#83311A]" />
                {focusId===med.id && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#83311A]/10 shadow-xl max-h-48 overflow-y-auto">
                    {filtered(med.id).map(d => (
                      <button key={d} onMouseDown={()=>{update(med.id,"drugName",d);setFocusId(null);setQuery({...query,[med.id]:""});}} className="w-full text-left px-4 py-2.5 hover:bg-[#E85D2A]/5 text-sm font-medium text-[#83311A] transition-colors">{d}</button>
                    ))}
                    {filtered(med.id).length===0 && <div className="px-4 py-3 text-sm text-[#83311A]/40">No matches</div>}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-[#83311A]/70 uppercase tracking-wider">Dosage</label>
                  <input type="text" value={med.dosage} onChange={e => update(med.id,"dosage",e.target.value)} placeholder="e.g., 50mg" className="w-full px-4 py-3 rounded-xl border-2 border-[#83311A]/10 focus:border-[#E85D2A] focus:outline-none bg-white transition-colors font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-[#83311A]/70 uppercase tracking-wider">Frequency</label>
                  <select value={med.frequency} onChange={e => update(med.id,"frequency",e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-[#83311A]/10 focus:border-[#E85D2A] focus:outline-none bg-white transition-colors font-medium">
                    {FREQ_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="mt-8 p-6 bg-white rounded-2xl border border-[#83311A]/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="text-sm font-medium">
          {status==="success" && <span className="text-green-600 flex items-center gap-2 font-bold"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>All prescriptions confirmed</span>}
          {status==="error" && <span className="text-red-500 font-bold">Verification failed</span>}
          {status==="idle" && !allOk && <span className="text-amber-600 flex items-center gap-2 font-bold"><div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"/>{medicines.filter(m=>!m.verified).length} pending</span>}
        </div>
        <button onClick={confirmAll} disabled={isSaving||allOk} className="w-full sm:w-auto px-8 py-4 bg-[#E85D2A] text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#83311A] transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-0.5">
          {isSaving ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Confirming...</span> : allOk ? "All Verified ✓" : "Confirm All"}
        </button>
      </div>
    </div>
  );
}
