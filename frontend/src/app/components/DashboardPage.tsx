import { useRef, useEffect, useState } from "react";
import { useLenisScroll } from "../hooks/useLenisScroll";
import { useCloudDrift } from "../hooks/useCloudDrift";
import { DashboardNav } from "./dashboard/DashboardNav";
import { SafetyStatus } from "./dashboard/SafetyStatus";
import { MedicationScheduler } from "./dashboard/MedicationScheduler";
import { UpcomingCalls } from "./dashboard/UpcomingCalls";
import { LiveCallDemo } from "./dashboard/LiveCallDemo";
import { AlertFeed } from "./dashboard/AlertFeed";
import { api, type AlertDto, type HealthVitalsDto, type SafetyStatusDto, type UserProfile } from "../lib/api";

export function DashboardPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [safetyStatuses, setSafetyStatuses] = useState<SafetyStatusDto[]>([]);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [vitals, setVitals] = useState<HealthVitalsDto | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);

  // Initialize smooth scroll
  useLenisScroll();

  // Initialize cloud drift animations
  useCloudDrift(pageRef);

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      setIsSyncing(true);
      setApiError(null);
      try {
        const [profileData, safetyData, alertsData, vitalsData] = await Promise.all([
          api.profile(),
          api.safetyStatus(),
          api.alerts(),
          api.healthVitals("7d")
        ]);
        if (cancelled) return;
        setProfile(profileData);
        setSafetyStatuses(safetyData);
        setAlerts(alertsData);
        setVitals(vitalsData);
      } catch (error) {
        if (!cancelled) setApiError(error instanceof Error ? error.message : "Dashboard sync failed");
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    }
    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  // Register GSAP plugins
  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger, window.Observer, window.ScrollSmoother);

      // Entrance animations for sections
      const sections = document.querySelectorAll('.dashboard-card-wrapper');
      sections.forEach((section) => {
        window.gsap.fromTo(section, 
          { 
            y: 30, 
            opacity: 0 
          }, 
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 90%",
              toggleActions: "play none none none"
            }
          }
        );
      });
    }
    // Set ready after a small delay
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, [isReady]);

  return (
    <div 
      id="smooth-wrapper" 
      className="page-wrapper" 
      ref={pageRef} 
      style={{ 
        opacity: isReady ? 1 : 0, 
        transition: 'opacity 0.4s ease-in-out',
        backgroundColor: '#F5F1EA'
      }}
    >
      <div className="global-styles w-embed" style={{ display: 'none' }}></div>

      {/* Background Decorative Clouds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <img src="/koi-assets/6833fd0829c964ec1f08358c_cloud01.svg" className="absolute top-[10%] -left-20 w-64 opacity-10 animate-float" style={{ animationDuration: '15s' }} alt="" />
        <img src="/koi-assets/6833fd0829c964ec1f08358c_cloud02.svg" className="absolute top-[40%] -right-20 w-80 opacity-10 animate-float" style={{ animationDuration: '20s', animationDirection: 'reverse' }} alt="" />
      </div>

      <div className="navbar">
        <DashboardNav />
      </div>

      <div id="smooth-content" className="dots-wrapper relative z-10">
        <div data-speed="0.5" className="dots-container"></div>
        
        <main className="main-wrapper py-8 px-4 md:px-6 lg:px-8">
              
              {/* Patient Profile Header - Improved Visual Hierarchy */}
              <div className="dashboard-card-wrapper mb-12 max-w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 bg-white rounded-3xl p-8 shadow-sm border border-black/5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#E85D2A]"></div>
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#F5F1EA] to-[#E85D2A]/10 flex items-center justify-center text-6xl shadow-lg flex-shrink-0">
                    👴
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-4 md:gap-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#83311A]">{profile?.name ?? "Rajesh Kumar"}</h1>
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest border border-green-200 w-fit">
                          {vitals?.vitalsStatus === "critical" ? "Needs Attention" : vitals?.vitalsStatus === "warning" ? "Watch Closely" : "Stable Condition"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        <div className="space-y-2">
                          <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Age</span>
                          <p className="text-[#83311A] font-bold text-lg">{profile ? "Caregiver" : "72 Years"}</p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Blood Group</span>
                          <p className="text-[#83311A] font-bold text-lg">{profile?.role ?? "O Positive"}</p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Location</span>
                          <p className="text-[#83311A] font-bold text-lg">{profile?.email ?? "Mumbai, MH"}</p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Last Check-in</span>
                          <p className="text-[#83311A] font-bold text-lg">{isSyncing ? "Syncing" : apiError ? "Demo Mode" : "Live"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 md:flex-col flex-shrink-0">
                    <button className="w-12 h-12 rounded-xl bg-[#F5F1EA] flex items-center justify-center text-[#83311A] hover:bg-[#E85D2A] hover:text-white transition-all shadow-md text-xl hover:shadow-lg transform hover:-translate-y-0.5">
                      📞
                    </button>
                    <button className="w-12 h-12 rounded-xl bg-[#F5F1EA] flex items-center justify-center text-[#83311A] hover:bg-[#E85D2A] hover:text-white transition-all shadow-md text-xl hover:shadow-lg transform hover:-translate-y-0.5">
                      ⚙️
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid Layout for Dashboard Components - Full Width */}
              <div className="grid grid-cols-1 gap-8 md:gap-10">
                
                {/* Safety Status - Full Width */}
                <div className="dashboard-card-wrapper">
                  <SafetyStatus statuses={safetyStatuses} isLoading={isSyncing} error={apiError} />
                </div>

                {/* Two Column Layout for Medication & Calls */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-10">
                  <div className="dashboard-card-wrapper">
                    <MedicationScheduler />
                  </div>
                  <div className="dashboard-card-wrapper">
                    <UpcomingCalls />
                  </div>
                </div>

                {/* Alert Feed and Quick Actions - Better Distribution */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 md:gap-10">
                  <div className="xl:col-span-2 dashboard-card-wrapper">
                    <AlertFeed alerts={alerts} error={apiError} />
                  </div>
                  <div className="xl:col-span-2 dashboard-card-wrapper">
                    <LiveCallDemo />
                  </div>
                </div>

              </div>
        </main>
        
        {/* Simplified Dashboard Footer */}
        <footer className="py-4 px-4 border-t border-[#83311A]/10 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-[#83311A]/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#83311A]">SAYA.AI</span>
              <span>© 2026 Dashboard</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#E85D2A] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#E85D2A] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#E85D2A] transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
