export function FeaturesSlider() {
  return (
    <section className="w-full relative z-10 border-b border-[#1A1A1A] bg-[#FCFBFA]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20 py-20 lg:py-24">
        
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="heading-display text-[#1A1A1A] leading-[1]" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
            <span className="font-normal uppercase">UNPRECEDENTED ENDPOINT VISIBILITY INTO EVERY TYPE OF NON-BINARY SOFTWARE.</span>
          </h2>
        </div>

        {/* Visual / SVG Container */}
        <div className="relative w-full aspect-video md:aspect-[21/9] bg-[#1B223F] rounded-[8px] border border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] flex items-center justify-center overflow-hidden mb-16">
          <svg className="w-3/4 h-full" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="800" height="400" fill="#1B223F"/>
            <path d="M0 0H800V400H0V0Z" fill="url(#pattern_dots2)"/>
            {/* Simple abstract islands representation */}
            <path d="M200 250 L400 150 L600 250 L400 350 Z" fill="#fbd474" stroke="#1A1A1A" strokeWidth="4"/>
            <path d="M200 250 L400 350 V380 L200 280 Z" fill="#d6ab47" stroke="#1A1A1A" strokeWidth="4"/>
            <path d="M600 250 L400 350 V380 L600 280 Z" fill="#b08b34" stroke="#1A1A1A" strokeWidth="4"/>
            <defs>
              <pattern id="pattern_dots2" patternUnits="userSpaceOnUse" width="20" height="20">
                <circle cx="2" cy="2" r="1.5" fill="#fbd474" fillOpacity="0.2"/>
              </pattern>
            </defs>
          </svg>
        </div>

        {/* Logos Grid */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
          <div className="flex items-center gap-10 flex-shrink-0">
            {["azure.png", "9970250fcce1b387a69de90339165c34_cursor.avif", "chrome.svg", "edge.svg", "office.svg", "appstore.avif"].map((img, i) => (
              <img key={i} src={`/koi-assets/68be42e16d671f8ef1bdb6f5_${img}`} alt="logo" className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100" onError={(e) => e.currentTarget.style.display = 'none'} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
