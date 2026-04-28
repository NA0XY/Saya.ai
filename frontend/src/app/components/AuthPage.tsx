import { Link, useNavigate } from "react-router";
import { useState } from "react";

export function AuthPage() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/$/, "");
      if (!apiBase) {
        throw new Error("API base URL not configured. Set VITE_API_BASE_URL in frontend .env");
      }

      const response = await fetch(apiBase + "/auth/google/start");
      const payload = await response.json().catch(() => null) as { url?: string } | null;
      if (!response.ok || !payload?.url) {
        throw new Error("Unable to start Google sign-in. Please try again.");
      }

      window.location.href = payload.url;
    } catch (error) {
      setIsAuthenticating(false);
      setAuthError(error instanceof Error ? error.message : "Google sign-in setup failed");
    }
  };

  const handleGuest = () => {
    navigate("/onboarding");
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Auth Form */}
      <div className="w-full md:w-1/2 flex flex-col px-8 py-10 lg:px-20 relative z-10 2xl:w-[45%]">
        <div className="mb-auto">
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
            <span className="text-[#E85D2A] font-bold text-3xl tracking-tight">SAYA</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto space-y-10 my-auto">
          <div className="space-y-4">
            <h1 className="heading-display text-5xl sm:text-6xl text-[#1A1A1A] uppercase tracking-wide leading-none">
              Welcome to <span className="text-[#E85D2A] block">Saya.ai</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 font-medium leading-relaxed max-w-[90%]">
              Sign in to stay connected to your parents, monitor their safety, and receive real-time alerts.
            </p>
          </div>

          <div className="space-y-5 pt-4">
            <button
              onClick={handleGoogleAuth}
              disabled={isAuthenticating}
              className="w-full group relative flex items-center justify-center gap-4 bg-white border border-[#1A1A1A]/10 px-8 py-4 rounded-2xl hover:border-[#E85D2A]/50 hover:bg-[#E85D2A]/5 hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-semibold text-gray-700 text-lg transition-colors group-hover:text-[#E85D2A]">
                {isAuthenticating ? "Signing in..." : "Sign in with Google"}
              </span>
            </button>

            {authError && (
              <div className="rounded-2xl border border-[#E85D2A]/20 bg-[#E85D2A]/10 px-5 py-4 text-sm font-semibold text-[#83311A]">
                {authError}
              </div>
            )}

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-gray-300 text-sm font-semibold uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <button
              onClick={handleGuest}
              className="w-full group bg-[#1A1A1A] px-8 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#333333] hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
            >
              <span className="font-semibold text-lg text-[#FFFFFF]">Continue as Guest</span>
              <svg className="w-5 h-5 text-[#FFFFFF] opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-400 text-center pt-6 max-w-[280px] mx-auto">
            By continuing, you agree to our <a href="#" className="underline hover:text-[#E85D2A] transition-colors">Terms</a> and <a href="#" className="underline hover:text-[#E85D2A] transition-colors">Privacy Policy</a>.
          </p>
        </div>

        <div className="mt-auto pt-10">
          <p className="text-sm text-gray-400 font-medium">© 2024 Saya.ai. Built for families.</p>
        </div>
      </div>

      {/* Right Panel - Branding & Animated SVGs */}
      <div className="hidden md:flex w-1/2 bg-[#E85D2A] relative overflow-hidden items-center justify-center 2xl:w-[55%]">
        {/* Subtle dot pattern overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '40px 40px' }}
        ></div>

        {/* Abstract Animated Nodes / Constellation SVGs */}
        <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center z-10 perspective-1000">
          {/* Node Connections (SVG Lines) */}
          <svg className="absolute inset-0 w-full h-full text-white/20 pointer-events-none" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
            <path d="M 300 300 L 150 150 M 300 300 L 450 180 M 300 300 L 200 480 M 300 300 L 450 420" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" fill="none" className="animate-pulse" />
            <circle cx="300" cy="300" r="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" fill="none" className="animate-spin-slow opacity-30" />
            <circle cx="300" cy="300" r="260" stroke="currentColor" strokeWidth="1" strokeDasharray="2 12" fill="none" className="animate-spin-slow opacity-20" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
          </svg>

          {/* Center Hub */}
          <div className="absolute animate-float w-40 h-40 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.15)] z-20">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border border-white/40">
              <span className="text-5xl drop-shadow-md">🏡</span>
            </div>
          </div>

          {/* Floating Element 1 - Parent */}
          <div className="absolute top-[15%] left-[20%] animate-float-slow w-20 h-20 bg-[#E9C46A] rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(233,196,106,0.4)] border-4 border-white/30 z-30" style={{ animationDelay: '0.2s' }}>
             <span className="text-3xl">👴</span>
          </div>

          {/* Floating Element 2 - Dashboard/Alert */}
          <div className="absolute bottom-[20%] left-[25%] animate-float w-16 h-16 bg-[#3F48CC] rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(63,72,204,0.4)] border-2 border-white/30 z-30" style={{ animationDelay: '0.5s' }}>
             <span className="text-2xl">🛡️</span>
          </div>

          {/* Floating Element 3 - Notification */}
          <div className="absolute top-[25%] right-[20%] animate-float w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(255,255,255,0.2)] border-2 border-orange-200 z-30" style={{ animationDelay: '0.8s' }}>
             <svg className="w-6 h-6 text-[#E85D2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>

          {/* Floating Element 4 - Family */}
          <div className="absolute bottom-[25%] right-[22%] animate-float-slow w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10 z-30" style={{ animationDelay: '1.2s' }}>
             <span className="text-4xl">👩‍👧</span>
          </div>

          {/* Sparkling dots */}
          <div className="absolute top-[40%] text-white/80 left-[10%] animate-pulse">✨</div>
          <div className="absolute bottom-[35%] right-[15%] text-white/50 animate-pulse delay-300 scale-150">✨</div>
          <div className="absolute top-[20%] right-[40%] text-white/60 animate-pulse delay-700">✨</div>
        </div>

        {/* Small Testimonial overlay at the bottom matching professional vibe */}
        <div className="absolute bottom-10 inset-x-12 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-white shadow-2xl transform transition-transform hover:-translate-y-1 duration-500">
           <p className="text-lg font-medium leading-relaxed mb-4 text-white/90">
             "Saya gives me complete peace of mind while I'm at work. The real-time alerts and constant connection make elder care effortless."
           </p>
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm">
               <span className="font-bold text-sm">RC</span>
             </div>
             <div>
               <p className="font-bold text-sm tracking-wide">Rahul Chaudhary</p>
               <p className="text-xs text-white/70 font-medium">Software Engineer • Mumbai</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

