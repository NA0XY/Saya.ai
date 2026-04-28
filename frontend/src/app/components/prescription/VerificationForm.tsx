import { Medicine } from "./PrescriptionUploadPage";

type VerificationFormProps = {
  uploadedImage: string;
  medicines: Medicine[];
  onMedicineUpdate: (id: string, field: keyof Medicine, value: string) => void;
};

const frequencyOptions = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Once daily (morning)",
  "Once daily (night)",
  "As needed",
  "Every 12 hours",
  "Every 8 hours"
];

export function VerificationForm({ uploadedImage, medicines, onMedicineUpdate }: VerificationFormProps) {
  return (
    <div className="max-w-[1200px] w-full grid grid-cols-[40%_60%] gap-12 mb-24">
      <div className="sticky top-32 h-fit">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Uploaded Prescription
          </h3>
          <img
            src={uploadedImage}
            alt="Prescription"
            className="w-full rounded-lg border border-gray-300 cursor-zoom-in hover:shadow-xl transition-shadow"
          />
          <p className="text-sm text-gray-500 mt-4 text-center">
            Click to zoom
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold tracking-tight uppercase">
            Extracted Medicines
          </h3>
          {medicines.length > 0 && (
            <p className="text-sm text-gray-600">
              {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} detected
            </p>
          )}
        </div>

        {medicines.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-600">Analyzing prescription...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medicines.map((medicine, index) => (
              <div
                key={medicine.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all hover:shadow-md ${
                  medicine.confidence === "low"
                    ? "border-[#E85D2A]/50 bg-orange-50/30"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#E85D2A] text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        medicine.confidence === "high"
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-orange-100 text-[#E85D2A] border border-[#E85D2A]/30"
                      }`}
                    >
                      {medicine.confidence === "high" ? "High confidence" : "Low confidence - Please verify"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Drug Name
                    </label>
                    <input
                      type="text"
                      value={medicine.drugName}
                      onChange={(e) => onMedicineUpdate(medicine.id, "drugName", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#E85D2A] focus:outline-none bg-white transition-colors font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) => onMedicineUpdate(medicine.id, "dosage", e.target.value)}
                        placeholder="e.g., 50mg"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#E85D2A] focus:outline-none bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Frequency
                      </label>
                      <select
                        value={medicine.frequency}
                        onChange={(e) => onMedicineUpdate(medicine.id, "frequency", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#E85D2A] focus:outline-none bg-white transition-colors"
                      >
                        {frequencyOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
