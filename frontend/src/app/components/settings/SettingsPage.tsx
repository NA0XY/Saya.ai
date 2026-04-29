import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GuardianContactHub } from "./GuardianContactHub";
import { PatientNumberSettings } from "./PatientNumberSettings";
import { GuardianCallerPanel } from "./GuardianCallerPanel";
<<<<<<< HEAD
import { SafetyDashboardPanel } from "./SafetyDashboardPanel";
import { SystemStatusPanel } from "./SystemStatusPanel";
=======
>>>>>>> e91be6bedd39b27dc85e971e32baf7d41d4e0975
import {
  PhoneIcon,
  MobileIcon,
  CallerIcon
} from "./SketchIcons";
import { api } from "../../lib/api";
import type { UserProfile } from "../../lib/api";

<<<<<<< HEAD
type Tab = "contacts" | "patient" | "medical" | "caller" | "soul" | "safety" | "status";
=======
type Tab = "contacts" | "patient" | "caller";
>>>>>>> e91be6bedd39b27dc85e971e32baf7d41d4e0975

const PILLARS: { id: Tab; label: string; Icon: React.ComponentType }[] = [
  { id: "contacts", label: "Guardian Contacts", Icon: PhoneIcon },
  { id: "patient", label: "Patient Number", Icon: MobileIcon },
  { id: "caller", label: "Guardian Caller", Icon: CallerIcon },
<<<<<<< HEAD
  { id: "soul", label: "Companion Soul", Icon: SoulIcon },
  { id: "safety", label: "Safety & Precaution", Icon: SafetyIcon },
  { id: "status", label: "System Status", Icon: StatusIcon },
=======
>>>>>>> e91be6bedd39b27dc85e971e32baf7d41d4e0975
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

  const handleContactSave = async (contacts: Array<{ name: string; phone: string }>) => {
    await api.updateSettings({ contacts });
    if (profile) setProfile({ ...profile, guardianContacts: contacts });
  };

  const handlePatientNumberSave = async (patientNumber: string) => {
    const result = await api.updatePatientNumber({ patientNumber });
    if (profile) setProfile({ ...profile, patientNumber: result.patientNumber });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1EA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E85D2A]/20 border-t-[#E85D2A] rounded-full animate-spin" />
          <p className="text-[#83311A] font-bold tracking-widest uppercase font-sketch">Loading Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EA] flex flex-col font-sans">
      {/* Global Header */}
      <header className="bg-transparent sticky top-0 z-50 flex-shrink-0">
        <div className="w-full px-0 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="w-8 h-8 sketch-box flex items-center justify-center text-[#83311A] hover:bg-[#D94F2B] hover:text-white transition-all transform hover:-translate-y-0.5" aria-label="Back to Dashboard">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="text-xl font-sketch font-bold text-[#D94F2B] relative -top-1.5">SAYA.AI SETTINGS</h1>
          </div>
          <div className="w-10 h-10 bg-[#F5F1EA] sketch-box text-[#D94F2B] flex items-center justify-center text-lg">
            ⚙️
          </div>
        </div>
        <div className="h-[1.5px] bg-black/20 sketch-underline w-full opacity-50"></div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row">

        {/* Left Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0 pt-12 p-6 bg-transparent md:min-h-[calc(100vh-80px-60px)]">
          <nav className="flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
            {PILLARS.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 transition-all whitespace-nowrap md:whitespace-normal w-full flex-shrink-0 md:flex-shrink-1 font-sketch text-[1rem] ${activeTab === tab.id
                    ? "bg-white text-black sketch-box shadow-md font-bold"
                    : "bg-transparent text-[#83311A] hover:underline hover:decoration-wavy hover:decoration-[#D94F2B]"
                  }`}
                style={activeTab === tab.id ? {
                  transform: `rotate(${idx % 2 === 0 ? -0.5 : 0.5}deg)`
                } : {}}
              >
                <tab.Icon />
                <span className="font-bold uppercase tracking-wider">{tab.label}</span>
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
          {activeTab === "caller" && (
            <GuardianCallerPanel />
          )}
        </main>
      </div>

      {/* Persistent Footer */}
      <footer className="bg-transparent py-5 flex-shrink-0 mt-auto fixed bottom-0 left-0 right-0 z-50">
        <div className="w-full px-4 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-[10px] text-[#83311A]/60 font-sketch uppercase tracking-widest">
            Your data is secure and globally encrypted.
          </p>
          <p className="text-[10px] text-[#83311A]/40 font-sketch">
            SAYA.AI © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
