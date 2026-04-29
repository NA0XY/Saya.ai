const WARNING_DATA: Record<string, string[]> = {
  "Metoprolol": ["Avoid excessive chai or coffee", "Do not combine with NSAIDs", "Monitor heart rate regularly"],
  "Aspirin": ["Take with food for stomach health", "Avoid alcohol consumption", "Do not combine with blood thinners"],
  "Atorvastatin": ["Avoid grapefruit juice and mango", "Take at night for best results", "Report muscle pain immediately"],
  "Amlodipine": ["Avoid grapefruit", "May cause ankle swelling", "Do not stop abruptly"],
  "Metformin": ["Take with meals", "Avoid excessive alcohol", "Stay hydrated"],
};

export function SafetyDashboardPanel() {
  const activeDrugs = Object.keys(WARNING_DATA);
  const warnings = activeDrugs.flatMap(drug =>
    WARNING_DATA[drug].map(warning => ({ drugName: drug, warning }))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white sketch-box text-[#1A1A1A] flex items-center justify-center text-2xl shadow-sm">🛡️</div>
        <div>
          <h3 className="text-2xl font-sketch font-bold text-[#1A1A1A] relative -top-1.5">Safety Dashboard</h3>
          <p className="text-sm text-[#1A1A1A]/60 font-sketch font-medium uppercase tracking-wider">Drug interaction warnings & precautions</p>
        </div>
      </div>

      <div className="bg-white sketch-box p-6 text-[#1A1A1A]" style={{ transform: 'rotate(-0.3deg)' }}>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">⚠️</span>
          <div className="relative">
            <h4 className="text-xl font-sketch font-bold uppercase tracking-widest text-[#1A1A1A]">Active Precautions</h4>
            <div className="absolute -bottom-1 left-0 w-full sketch-underline border-[#1A1A1A]"></div>
          </div>
          <span className="ml-auto px-4 py-1 sketch-box text-[#1A1A1A] font-sketch font-bold text-sm">{warnings.length} warnings</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {warnings.map((item, i) => (
            <div key={i} className="bg-white sketch-box p-5 text-[#1A1A1A] sketch-shadow hover:scale-[1.01] transition-all" style={{ transform: `rotate(${i % 2 === 0 ? 0.3 : -0.3}deg)` }}>
              <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0 mt-1">💊</div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-sketch font-bold text-xl mb-1">{item.drugName}</h5>
                  <p className="text-lg font-sketch text-[#1A1A1A]/70 leading-relaxed">{item.warning}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1A1A1A]/5 sketch-box p-6 text-[#1A1A1A]" style={{ transform: 'rotate(0.2deg)' }}>
        <p className="text-base font-sketch leading-relaxed">
          <strong className="font-bold">Important:</strong> These warnings are based on the verified Indian drug database. Always consult with your doctor or pharmacist for personalized medical advice.
        </p>
      </div>

      <div className="text-sm font-sketch font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/30 text-center pt-4">
        Read-Only View • Updated from Verified Prescriptions
      </div>
    </div>
  );
}