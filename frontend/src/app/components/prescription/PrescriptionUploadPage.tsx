import { useState } from "react";
import { Link } from "react-router";
import { DottedBackground } from "../DottedBackground";
import { UploadZone } from "./UploadZone";
import { VerificationForm } from "./VerificationForm";
import { WarningCards } from "./WarningCards";
import { SuccessMessage } from "./SuccessMessage";
import { api } from "../../lib/api";

export type Medicine = {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  confidence: "high" | "low";
};

export function PrescriptionUploadPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const handleImageUpload = async (imageUrl: string, file: File) => {
    setUploadedImage(imageUrl);
    setExtractError(null);

    try {
      const result = await api.extractMedicines(file);
      setMedicines(result.medicines);
    } catch (error) {
      setExtractError(error instanceof Error ? error.message : "Prescription extraction failed");
      setMedicines([
        {
          id: "1",
          drugName: "Metoprolol",
          dosage: "50mg",
          frequency: "Twice daily",
          confidence: "high"
        },
        {
          id: "2",
          drugName: "Aspirin",
          dosage: "75mg",
          frequency: "Once daily",
          confidence: "high"
        },
        {
          id: "3",
          drugName: "Atorvastatin",
          dosage: "20mg",
          frequency: "Once daily (night)",
          confidence: "low"
        }
      ]);
    }
  };

  const handleMedicineUpdate = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleConfirmAll = () => {
    setIsConfirmed(true);
    setTimeout(() => {
      setShowSuccess(true);
    }, 500);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setMedicines([]);
    setIsConfirmed(false);
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F1EA] relative">
      <DottedBackground />

      <div className="relative z-10">
        <nav className="h-20 flex items-center justify-center px-20 border-b border-gray-300/50 bg-[#F5F1EA]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-[1200px] w-full flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tight">SAYA</div>
            <Link to="/dashboard" className="hover:opacity-70 transition-opacity">
              Back to Dashboard
            </Link>
          </div>
        </nav>

        <section className="flex flex-col items-center px-20 py-16">
          <div className="max-w-[1200px] w-full text-center space-y-4 mb-16">
            <h1 className="text-5xl font-bold tracking-tight uppercase leading-tight">
              VERIFY BEFORE ANY<br />ACTION IS TAKEN
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Saya.ai extracts prescription details, but nothing is activated without your confirmation.
            </p>
          </div>

          {!uploadedImage ? (
            <UploadZone onImageUpload={handleImageUpload} />
          ) : !showSuccess ? (
            <>
              <VerificationForm
                uploadedImage={uploadedImage}
                medicines={medicines}
                onMedicineUpdate={handleMedicineUpdate}
              />
              {extractError && (
                <div className="max-w-[1200px] w-full -mt-16 mb-10 rounded-xl border border-[#E85D2A]/20 bg-[#E85D2A]/10 px-5 py-4 text-sm font-semibold text-[#83311A]">
                  Backend OCR unavailable: {extractError}. Showing demo extraction so verification can continue.
                </div>
              )}

              {medicines.length > 0 && !isConfirmed && (
                <div className="max-w-[1200px] w-full mt-12 sticky bottom-0 bg-[#F5F1EA]/95 backdrop-blur-sm border-t border-gray-300 py-6 px-8 rounded-t-2xl shadow-2xl">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700 font-semibold">
                      Nothing will be activated until you confirm all details.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-all font-semibold"
                      >
                        Start Over
                      </button>
                      <button
                        onClick={handleConfirmAll}
                        className="px-10 py-3 bg-[#E85D2A] text-white rounded-xl shadow-lg hover:bg-[#d64d1f] hover:shadow-xl hover:scale-105 transition-all font-semibold text-lg"
                      >
                        Confirm All
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isConfirmed && !showSuccess && (
                <WarningCards medicines={medicines} />
              )}
            </>
          ) : (
            <SuccessMessage />
          )}
        </section>
      </div>
    </div>
  );
}
