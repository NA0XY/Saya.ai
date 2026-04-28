export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full opacity-60 animate-float" style={{ animationDelay: "0s" }} />
      <div className="absolute top-64 left-32 w-12 h-12 bg-orange-200 rounded-full opacity-40 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-48 right-40 w-20 h-20 bg-white rounded-full opacity-50 animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-96 left-24 w-14 h-14 bg-orange-100 rounded-full opacity-60 animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="absolute top-40 right-1/3 text-4xl opacity-30 animate-float" style={{ animationDelay: "0.5s" }}>
        ☁️
      </div>
      <div className="absolute bottom-64 left-1/4 text-5xl opacity-20 animate-float" style={{ animationDelay: "2.5s" }}>
        ☁️
      </div>
    </div>
  );
}
