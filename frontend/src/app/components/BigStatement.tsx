function IntegrationIcons() {
  const icons = [
    { name: "Groq", logo: "G" },
    { name: "AWS", logo: "A" },
    { name: "Supabase", logo: "S" },
    { name: "Exotel", logo: "E" },
    { name: "OpenFDA", logo: "O" },
  ];

  return (
    <div className="flex items-center justify-center gap-6 mt-16">
      <button className="w-10 h-10 bg-[#fbd474] rounded flex items-center justify-center hover:bg-[#ebd474] transition-colors cursor-pointer border border-[#1A1A2E]/10"
        style={{ boxShadow: "2px 2px 0 #1A1A2E" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      
      {icons.map((icon) => (
        <div key={icon.name} className="w-12 h-12 flex items-center justify-center cursor-default">
          <span className="text-xl font-bold text-[#1A1A2E]">{icon.logo}</span>
        </div>
      ))}
      
      <button className="w-10 h-10 bg-[#fbd474] rounded flex items-center justify-center hover:bg-[#ebd474] transition-colors cursor-pointer border border-[#1A1A2E]/10"
        style={{ boxShadow: "2px 2px 0 #1A1A2E" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 6L15 12L9 18" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function BigStatement() {
  return (
    <section className="w-full relative z-10" style={{ padding: "140px 0 100px" }}>
      <div className="max-w-[1200px] mx-auto px-20">
        <h2 className="heading-display text-center" style={{ fontSize: "clamp(34px, 4vw, 60px)" }}>
          <span className="text-[#E85D2A] font-normal" style={{ fontStyle: "normal" }}>UNPRECEDENTED VISIBILITY INTO </span>
          <br />
          <span className="text-[#E85D2A] font-normal" style={{ fontStyle: "normal" }}>EVERY DIMENSION OF ELDER CARE.</span>
        </h2>

        {/* 3 separate floating islands from Koi */}
        <div className="flex items-end justify-center gap-12 mt-20 relative">
          
          {/* Island 1 - Left */}
          <div className="animate-float-island relative w-[280px]" style={{ animationDelay: "0s" }}>
            <img src="/koi-assets/island-left.avif" alt="Left Island" className="w-full h-auto drop-shadow-xl" />
          </div>

          {/* Island 2 - Center (largest) */}
          <div className="animate-float-island relative w-[380px] z-10" style={{ animationDelay: "0.3s" }}>
            <img src="/koi-assets/island-center.avif" alt="Center Island" className="w-full h-auto drop-shadow-2xl" />
          </div>

          {/* Island 3 - Right */}
          <div className="animate-float-island relative w-[280px]" style={{ animationDelay: "0.6s" }}>
            <img src="/koi-assets/island-right.avif" alt="Right Island" className="w-full h-auto drop-shadow-xl" />
          </div>
        </div>

        <IntegrationIcons />
      </div>
    </section>
  );
}
