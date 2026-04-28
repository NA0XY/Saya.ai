import { Link, useNavigate } from "react-router-dom";
import { startGoogleOAuth } from "../lib/api";

export function AuthPage() {
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      const url = await startGoogleOAuth("/dashboard");
      window.location.assign(url);
    } catch (error) {
      console.error("Failed to start Google OAuth", error);
      navigate("/auth/callback#error=oauth_start_failed");
    }
  };

  return (
    <div className="relative flex min-h-screen bg-[#F6F4EB] items-center justify-center p-6 overflow-hidden">
      {/* Retro dot pattern overlay over the entire page */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#E85D2A 1.5px, transparent 1.5px)', backgroundSize: '36px 36px' }}
      ></div>

      {/* Left Illustration */}
      <div className="hidden lg:block absolute left-[-5%] xl:left-[2%] top-1/2 -translate-y-1/2 w-[350px] xl:w-[450px] opacity-90 z-0">
        <img 
          src="/illustration-left.png" 
          alt="" 
          className="w-full h-full object-contain animate-[float_8s_ease-in-out_infinite]"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Right Illustration - Rocking Chair */}
      <div className="hidden lg:block absolute right-[-5%] xl:right-[2%] top-1/2 -translate-y-1/2 w-[300px] xl:w-[400px] opacity-90 z-0">
        <img 
          src="/rocking-chair.png" 
          alt="" 
          className="w-full h-full object-contain animate-rocking scale-x-[-1]"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Auth Form Container */}
      <div className="w-full max-w-md relative z-10 flex flex-col">
        <div className="mb-12 text-center">
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
            <span className="text-[#E85D2A] font-bold text-4xl tracking-tight">SAYA.AI</span>
          </Link>
        </div>

        <div className="space-y-10">
          <div className="space-y-4 text-center">
            <h1 className="heading-display text-5xl sm:text-6xl text-[#1A1A1A] uppercase tracking-wide leading-none font-medium" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
              Welcome to <span className="text-[#E85D2A] block mt-2">Saya</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
              Sign in to stay connected to your parents, monitor their safety, and receive real-time proactive alerts.
            </p>
          </div>

          <div className="space-y-5 pt-4">
            <button
              onClick={handleAuth}
              className="w-full group relative flex items-center justify-center gap-4 bg-white border-2 border-[#1A1A1A]/10 px-8 py-4 rounded-xl hover:border-[#E85D2A] hover:bg-[#FFF8F5] hover:shadow-[0_8px_20px_rgba(232,93,42,0.15)] transition-all duration-300 active:scale-[0.98]"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-bold text-gray-700 text-lg transition-colors group-hover:text-[#E85D2A] uppercase tracking-wide">Sign in with Google</span>
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t-2 border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-bold uppercase tracking-widest">or</span>
              <div className="flex-grow border-t-2 border-gray-200"></div>
            </div>

            <button
              onClick={handleAuth}
              className="w-full group bg-[#F0E6D8] border-2 border-[#E5D5C0] text-[#1A1A1A] px-8 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#E85D2A] hover:border-[#E85D2A] hover:text-white hover:shadow-[0_8px_20px_rgba(232,93,42,0.25)] transition-all duration-300 active:scale-[0.98]"
            >
              <span className="font-bold text-lg uppercase tracking-wide">Continue as Guest</span>
              <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-500 text-center pt-6 font-medium">
            By continuing, you agree to our <a href="#" className="underline hover:text-[#E85D2A] transition-colors">Terms</a> and <a href="#" className="underline hover:text-[#E85D2A] transition-colors">Privacy Policy</a>.
          </p>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-400 font-medium tracking-wide">© 2024 Saya.ai. Built for families.</p>
        </div>
      </div>
    </div>
  );
}
