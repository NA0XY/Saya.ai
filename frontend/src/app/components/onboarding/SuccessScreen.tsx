import { DottedBackground } from "../DottedBackground";

export function SuccessScreen() {
  return (
    <div className="min-h-screen bg-[#F5F1EA] relative flex items-center justify-center">
      <DottedBackground />

      <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
        <div className="w-32 h-32 bg-gradient-to-br from-[#E85D2A] to-[#ff8a5c] rounded-full flex items-center justify-center shadow-2xl animate-scale-in">
          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-center">
          You're all set.
        </h1>

        <p className="text-lg text-gray-600">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
