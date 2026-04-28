import { Medicine } from "./PrescriptionUploadPage";

const warningData: Record<string, string[]> = {
  "Metoprolol": [
    "Avoid excessive chai or coffee",
    "Do not combine with NSAIDs without consulting doctor",
    "Monitor heart rate regularly"
  ],
  "Aspirin": [
    "Take with food to prevent stomach upset",
    "Avoid alcohol consumption",
    "Do not combine with other blood thinners"
  ],
  "Atorvastatin": [
    "Avoid grapefruit juice",
    "Take at night for best results",
    "Report any muscle pain immediately"
  ]
};

export function WarningCards({ medicines }: { medicines: Medicine[] }) {
  const warnings = medicines.flatMap(med =>
    (warningData[med.drugName] || []).map(warning => ({
      drugName: med.drugName,
      warning
    }))
  );

  if (warnings.length === 0) return null;

  return (
    <div className="max-w-[1200px] w-full mt-16 mb-12 animate-fade-in">
      <div className="bg-orange-50/50 rounded-2xl p-8 border-2 border-[#E85D2A]/30">
        <h2 className="text-3xl font-bold tracking-tight mb-6 uppercase flex items-center gap-3">
          <span className="text-4xl">⚠️</span>
          Things to Avoid
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {warnings.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-[#E85D2A] hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">💊</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {item.drugName}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {item.warning}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-white rounded-xl border border-gray-300">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>Important:</strong> These warnings are based on common interactions. Always consult with your doctor or pharmacist for personalized medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
