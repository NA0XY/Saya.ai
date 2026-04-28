import { useState } from "react";
import { useNavigate } from "react-router";
import { DottedBackground } from "../DottedBackground";
import { ContactControl } from "./ContactControl";
import { PersonalityConfig } from "./PersonalityConfig";
import { LanguageSetup } from "./LanguageSetup";
import { SuccessScreen } from "./SuccessScreen";
import { api } from "../../lib/api";

export type OnboardingData = {
  contacts: Array<{ name: string; phone: string }>;
  personality: "warm" | "formal" | "playful" | null;
  language: "english" | "hindi" | null;
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData>({
    contacts: [],
    personality: null,
    language: null,
  });

  const handleContactsNext = (contacts: Array<{ name: string; phone: string }>) => {
    setData({ ...data, contacts });
    setStep(2);
  };

  const handlePersonalityNext = (personality: "warm" | "formal" | "playful") => {
    setData({ ...data, personality });
    setStep(3);
  };

  const handleLanguageFinish = async (language: "english" | "hindi") => {
    const nextData = { ...data, language };
    setData(nextData);
    setSubmitError(null);

    if (nextData.personality) {
      try {
        await api.submitOnboarding({
          contacts: nextData.contacts,
          personality: nextData.personality,
          language
        });
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Onboarding sync failed");
      }
    }

    setShowSuccess(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  if (showSuccess) {
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F5F1EA] relative overflow-hidden">
      <DottedBackground />

      <div className="relative z-10">
        <nav className="h-20 flex items-center justify-between px-20">
          <div className="text-2xl font-bold tracking-tight">SAYA</div>
          <div className="text-sm tracking-wide text-gray-600">
            Setup {step} of 3
          </div>
        </nav>

        <div className="flex items-center justify-center px-20 py-16">
          <div className="max-w-[1200px] w-full grid grid-cols-[52%_48%] gap-16 items-center min-h-[600px]">
            <div className="transition-all duration-500 ease-in-out">
              {submitError && (
                <div className="mb-6 rounded-xl border border-[#E85D2A]/20 bg-[#E85D2A]/10 px-4 py-3 text-sm font-semibold text-[#83311A]">
                  Backend onboarding sync unavailable: {submitError}
                </div>
              )}
              {step === 1 && <ContactControl onNext={handleContactsNext} initialContacts={data.contacts} />}
              {step === 2 && <PersonalityConfig onNext={handlePersonalityNext} initialPersonality={data.personality} />}
              {step === 3 && <LanguageSetup onFinish={handleLanguageFinish} initialLanguage={data.language} />}
            </div>

            <div className="relative flex items-center justify-center">
              <OnboardingIllustration step={step} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pb-12">
          <div className={`w-3 h-3 rounded-full transition-all ${step === 1 ? 'bg-[#E85D2A]' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full transition-all ${step === 2 ? 'bg-[#E85D2A]' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full transition-all ${step === 3 ? 'bg-[#E85D2A]' : 'bg-gray-300'}`} />
        </div>

        <footer className="py-8 text-center">
          <p className="text-sm text-gray-500">
            Your data is secure and controlled by you.
          </p>
        </footer>
      </div>
    </div>
  );
}

function OnboardingIllustration({ step }: { step: number }) {
  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      <div className="absolute top-16 right-24 w-20 h-20 bg-white rounded-full opacity-70 animate-float" style={{ animationDelay: "0.5s" }} />
      <div className="absolute top-40 left-12 w-16 h-16 bg-white rounded-full opacity-50 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full opacity-60 animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-56 h-56 bg-gradient-to-br from-[#E85D2A] to-[#ff8a5c] rounded-full flex items-center justify-center shadow-2xl animate-float">
          <div className="w-44 h-44 bg-white rounded-full flex items-center justify-center">
            <div className="text-6xl">🤖</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-0.5 h-16 bg-[#E85D2A]/40"></div>
          <div className="w-0.5 h-16 bg-[#E85D2A]/40"></div>
          <div className="w-0.5 h-16 bg-[#E85D2A]/40"></div>
        </div>

        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-2xl flex items-center justify-center shadow-lg">
            <div className="text-5xl">👴</div>
          </div>
          {step === 1 && (
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#E85D2A] rounded-full flex items-center justify-center shadow-md animate-pulse">
              <div className="text-lg">📞</div>
            </div>
          )}
          {step === 2 && (
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#E85D2A] rounded-full flex items-center justify-center shadow-md animate-pulse">
              <div className="text-lg">💬</div>
            </div>
          )}
          {step === 3 && (
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#E85D2A] rounded-full flex items-center justify-center shadow-md animate-pulse">
              <div className="text-lg">🌐</div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-1/3 -left-6 w-28 h-20 bg-orange-200 rounded-3xl opacity-50 transform -rotate-12" />
      <div className="absolute bottom-1/3 -right-6 w-32 h-24 bg-orange-200 rounded-3xl opacity-50 transform rotate-12" />
    </div>
  );
}
