export function HeroStatus() {
  return (
    <section className="hero-section">
      <div className="padding-global padding-section-xlarge">
        <div className="container-large">
          <div className="hero-component">
            <div className="hero-content">
              <div className="hero-heading">
                <h1 className="heading-display">
                  YOUR PARENTS ARE BEING <span className="text-color-orange">MONITORED</span> — IN REAL TIME
                </h1>
              </div>
              <p className="text-size-large">
                Track medication, safety alerts, and emotional signals from one place. Saya.ai is actively watching over your loved ones.
              </p>
              <div className="flex items-center gap-4 mt-8">
                <div className="status-indicator flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#E85D2A]/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold uppercase tracking-wider">System Active</span>
                </div>
                <div className="status-indicator flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#E85D2A]/20">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold uppercase tracking-wider">Saya Online</span>
                </div>
              </div>
            </div>

            <div className="hero-video-wrapper">
              <div className="video-wrapper relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E85D2A]/10 to-transparent rounded-3xl -z-10 transform translate-x-4 translate-y-4"></div>
                <img 
                  src="/koi-assets/68bfd644c67a7ecfe078c17c_KOI_rerecolored_frame_v1 1.avif" 
                  alt="Saya AI Status" 
                  className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white"
                />
                
                {/* Floating Elements for Dashboard Hero */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#E85D2A] rounded-2xl flex items-center justify-center shadow-xl animate-float">
                  <div className="text-4xl">🤖</div>
                </div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg animate-float-slow" style={{ animationDelay: '1s' }}>
                  <div className="text-3xl">🏠</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background SVG elements */}
      <div className="absolute top-0 right-0 -z-10 opacity-20 pointer-events-none">
        <img src="/koi-assets/6836d87262e4ca8706e98a77_coud01.svg" className="w-96 animate-float" alt="" />
      </div>
      <div className="absolute bottom-0 left-0 -z-10 opacity-20 pointer-events-none">
        <img src="/koi-assets/6836d873d735542d459f0382_cloud02.svg" className="w-80 animate-float-slow" alt="" />
      </div>
    </section>
  );
}
