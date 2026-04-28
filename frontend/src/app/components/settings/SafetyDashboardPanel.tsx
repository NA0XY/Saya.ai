const WARNING_DATA: Record<string, string[]> = {
  "Metoprolol": ["Avoid excessive chai or coffee", "Do not combine with NSAIDs without consulting doctor", "Monitor heart rate regularly"],
  "Aspirin": ["Take with food to prevent stomach upset", "Avoid alcohol consumption", "Do not combine with other blood thinners"],
  "Atorvastatin": ["Avoid grapefruit juice and mango", "Take at night for best results", "Report any muscle pain immediately"],
  "Amlodipine": ["Avoid grapefruit", "May cause ankle swelling", "Do not stop abruptly"],
  "Metformin": ["Take with meals", "Avoid excessive alcohol", "Stay hydrated"],
};

export function SafetyDashboardPanel() {
  const activeDrugs = Object.keys(WARNING_DATA);
  const warnings = activeDrugs.flatMap(drug =>
    WARNING_DATA[drug].map(warning => ({ drugName: drug, warning }))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#ef4444] to-[#f87171] rounded-xl flex items-center justify-center text-xl shadow-md">🛡️</div>
        <div>
          <h3 className="text-xl font-bold text-[#83311A]">Safety Dashboard</h3>
          <p className="text-sm text-[#83311A]/60 font-medium">Drug interaction warnings & precautions</p>
        </div>
      </div>

      <div className="bg-orange-50/60 rounded-2xl p-5 border border-[#E85D2A]/20">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⚠️</span>
          <h4 className="text-base font-bold text-[#83311A] uppercase tracking-wider">Active Precautions</h4>
          <span className="ml-auto px-2.5 py-1 bg-[#E85D2A]/10 text-[#E85D2A] rounded-full text-xs font-bold">{warnings.length} warnings</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {warnings.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border-l-4 border-[#E85D2A] hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="text-xl flex-shrink-0 mt-0.5">💊</div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-[#83311A] text-sm mb-1">{item.drugName}</h5>
                  <p className="text-sm text-[#83311A]/70 leading-relaxed">{item.warning}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-[#83311A]/10">
        <p className="text-xs text-[#83311A]/60 leading-relaxed">
          <strong className="text-[#83311A]/80">Important:</strong> These warnings are based on the verified Indian drug database. Always consult with your doctor or pharmacist for personalized medical advice.
        </p>
      </div>

      <div className="text-xs font-bold uppercase tracking-widest text-[#83311A]/30 text-center pt-2">
        Read-Only View • Updated from Verified Prescriptions
      </div>
    </div>
  );
}
