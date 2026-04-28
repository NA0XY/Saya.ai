import { useEffect, useRef } from 'react';

export function DemoSection() {
  const textRef = useRef<HTMLImageElement>(null);
  const angleRef = useRef(0);

  useEffect(() => {
    let animId: number;
    const speed = 0.6; // degrees per frame

    function rotate() {
      angleRef.current += speed;
      if (textRef.current) {
        textRef.current.style.transform = `rotate(${angleRef.current}deg)`;
      }
      animId = requestAnimationFrame(rotate);
    }
    animId = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <section className="demo-section">
      <div className="padding-global padding-section-medium">
        <div className="container-medium">
          <div className="demo-content">
            <div className="section-heading">
              <h2>See the 3 Pillars in action</h2>
              <p className="demo-p">
                <strong>Demo Strategy:</strong> 8–10 pre-loaded Indian prescriptions. A manual trigger initiates a live Exotel call to a phone in the room. Real-time emotion detection drives the 2D companion's expressions.
              </p>
            </div>

            <div className="demo_block">
              {/* Steampunk frame */}
              <img src="/koi-assets/68bfd644c67a7ecfe078c17c_KOI_rerecolored_frame_v1 1.avif"
                loading="lazy" alt="Decorative frame" className="demo_frame" />

              {/* Inner animated SVG area */}
              <div className="demo_inner-div">
                <svg viewBox="0 0 400 250" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="demoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1B223F" />
                      <stop offset="100%" stopColor="#2a3460" />
                    </linearGradient>
                    <pattern id="demoDots" patternUnits="userSpaceOnUse" width="20" height="20">
                      <circle cx="2" cy="2" r="1.5" fill="#fbd474" fillOpacity="0.15" />
                    </pattern>
                  </defs>
                  <rect width="400" height="250" fill="url(#demoGrad)" />
                  <rect width="400" height="250" fill="url(#demoDots)" />
                  {/* Animated pulse circles */}
                  <circle cx="200" cy="125" r="30" fill="none" stroke="#f93f12" strokeWidth="2" opacity="0.6">
                    <animate attributeName="r" values="30;60;30" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="200" cy="125" r="15" fill="none" stroke="#fbd474" strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" values="15;40;15" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="200" cy="125" r="8" fill="#f93f12" opacity="0.9">
                    <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  {/* Heart rate line */}
                  <polyline points="50,125 100,125 120,100 140,150 160,110 180,140 200,125 250,125 270,95 290,155 310,120 330,135 350,125"
                    fill="none" stroke="#fbd474" strokeWidth="2" opacity="0.5">
                    <animate attributeName="stroke-dashoffset" values="600;0" dur="4s" repeatCount="indefinite" />
                  </polyline>
                </svg>
              </div>

              {/* Play button */}
              <div className="demo_play-button">
                <img src="/koi-assets/68bfd9e1bca510ffe2d775c7_play button-frame.avif"
                  loading="lazy" alt="" className="demo-play-button_frame" />
                <div className="demo-button_animated-area">
                  <img ref={textRef} src="/koi-assets/68bfd9e1796c9656c8e29290_demo button text.svg"
                    loading="lazy" alt="" className="demo-button_text" />
                  <div className="demo-button_inner-btn">
                    <img src="/koi-assets/68bfdb0b3020d04acf49c17b_blue play button.svg"
                      loading="lazy" width="19" height="21" alt="" className="demo-play_icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
