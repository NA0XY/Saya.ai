export function WingsSection() {
  return (
    <section className="wings-section">
      <div className="padding-global padding-section-large">
        <div className="container-small">
          <div className="wings_component">
            {/* Animated eyeball area */}
            <div className="eyeboll-video" style={{
              width: '120px', height: '120px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '80px',
            }}>
              👁️
            </div>

            <div className="wings_content">
              <h2>Give your parents <span className="wings" style={{ color: '#f93f12', fontStyle: 'italic' }}>wings™</span></h2>
              <div className="text-weight-medium max-width-medium">
                Wings™, Saya's proprietary care engine, scores each health indicator's risk level
                based on real-time data, not just assumptions.
              </div>
            </div>

            {/* Floating clouds */}
            <img src="/koi-assets/6836d87262e4ca8706e98a77_coud01.svg" loading="lazy" alt="" className="cloud _03" />
            <img src="/koi-assets/6836d872f816b78633d682b8_coud03.svg" loading="lazy" alt="" className="cloud _04" />
          </div>
        </div>

        {/* Wings diagram */}
        <img src="/koi-assets/68be540179cd85af4389228a_wings-diagram.svg" loading="lazy" alt="Saya Wings diagram" className="wings_image" />
        <img src="/koi-assets/68be54018256e43b1e5a7038_36274234f9b2a0552ea697c053ccc094_wings-diagram-mobile.avif" loading="lazy" alt="" className="wings_image mobile" />
      </div>
    </section>
  );
}
