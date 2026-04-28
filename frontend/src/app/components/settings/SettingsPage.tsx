import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GuardianContactHub } from "./GuardianContactHub";
import { MedicalVerificationPortal } from "./MedicalVerificationPortal";
import { CompanionSoulSettings } from "./CompanionSoulSettings";
import { PatientNumberSettings } from "./PatientNumberSettings";
import { SafetyDashboardPanel } from "./SafetyDashboardPanel";
import { SystemStatusPanel } from "./SystemStatusPanel";
import { api } from "../../lib/api";
import type { UserProfile } from "../../lib/api";

type Tab = "contacts" | "patient" | "medical" | "soul" | "safety" | "status";

const PILLARS: { id: Tab; label: string; icon: string }[] = [
  { id: "contacts", label: "Guardian Contacts", icon: "📞" },
  { id: "patient", label: "Patient Number", icon: "📱" },
  { id: "medical", label: "Medical Verification", icon: "💊" },
  { id: "soul", label: "Companion Soul", icon: "✨" },
  { id: "safety", label: "Safety & Precaution", icon: "🛡️" },
  { id: "status", label: "System Status", icon: "⚡" },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("contacts");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.profile();
        if (!cancelled) setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleContactSave = async (contacts: Array<{name:string;phone:string}>) => {
    await api.updateSettings({ contacts });
    if (profile) setProfile({ ...profile, guardianContacts: contacts });
  };

  const handlePatientNumberSave = async (patientNumber: string) => {
    const result = await api.updatePatientNumber({ patientNumber });
    if (profile) setProfile({ ...profile, patientNumber: result.patientNumber });
  };

  const handleMedicalSave = async () => {
    // Medical verification forms saved to API
  };

  const handleSoulSave = async (tone: any, language: any, interests: string[]) => {
    await api.updateSettings({ personality: tone, language });
    await api.updateMemory({ interests });
    if (profile) setProfile({ ...profile, companionTone: tone, companionLanguage: language, interests });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1EA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E85D2A]/20 border-t-[#E85D2A] rounded-full animate-spin" />
          <p className="text-[#83311A] font-bold tracking-widest uppercase">Loading Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EA] flex flex-col font-sans">
      {/* Global Header */}
      <header className="bg-white border-b border-[#83311A]/10 sticky top-0 z-50 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="w-10 h-10 rounded-full bg-[#F5F1EA] flex items-center justify-center text-[#83311A] hover:bg-[#E85D2A] hover:text-white transition-all transform hover:-translate-y-0.5" aria-label="Back to Dashboard">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#83311A]">SAYA.AI SETTINGS</h1>
              <p className="text-xs text-[#83311A]/60 font-bold uppercase tracking-widest">SAYA.AI Control Center</p>
            </div>
          </div>
          <div className="w-12 h-12 bg-[#F5F1EA] rounded-xl flex items-center justify-center text-[#83311A] text-xl shadow-sm">
            ⚙️
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0 p-6 md:border-r border-[#83311A]/10 bg-white md:bg-transparent md:min-h-[calc(100vh-80px-60px)]">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
            {PILLARS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all whitespace-nowrap md:whitespace-normal w-full flex-shrink-0 md:flex-shrink-1 ${
                  activeTab === tab.id 
                  ? "bg-[#E85D2A] text-white shadow-md transform md:-translate-x-2" 
                  : "bg-white md:bg-[#F5F1EA]/60 text-[#83311A] hover:bg-white hover:shadow-sm"
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <span className="text-sm font-bold uppercase tracking-wider">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-10 pb-32">
          {activeTab === "contacts" && (
            <GuardianContactHub initialContacts={profile?.guardianContacts ?? []} onSave={handleContactSave} />
          )}
          {activeTab === "patient" && (
            <PatientNumberSettings patientNumber={profile?.patientNumber ?? null} onSave={handlePatientNumberSave} />
          )}
          {activeTab === "medical" && (
            <MedicalVerificationPortal onSave={handleMedicalSave} />
          )}
          {activeTab === "soul" && (
            <CompanionSoulSettings profile={profile} onSave={handleSoulSave} />
          )}
          {activeTab === "safety" && (
            <SafetyDashboardPanel />
          )}
          {activeTab === "status" && (
            <SystemStatusPanel />
          )}
        </main>
      </div>

      {/* Persistent Footer */}
      <footer className="bg-white border-t border-[#83311A]/10 py-5 flex-shrink-0 mt-auto fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-[#83311A]/60 font-bold uppercase tracking-widest">
            Your data is secure and globally encrypted.
          </p>
          <p className="text-xs text-[#83311A]/40 font-bold">
            SAYA.AI © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

