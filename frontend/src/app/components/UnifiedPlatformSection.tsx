import { useState } from 'react';

const StarIcon = () => (
  <div className="u-svg-icon w-embed">
    <svg width="100%" height="100%" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.30803 3.10575C8.30803 4.53465 9.46638 5.69301 10.8953 5.69301H12.6917C13.4143 5.69301 14 6.27874 14 7.00128C14 7.72381 13.4143 8.30955 12.6917 8.30955H10.8946C9.46608 8.30955 8.30803 9.46759 8.30803 10.8961V12.692C8.30803 13.4144 7.7224 14 7 14C6.2776 14 5.69197 13.4144 5.69197 12.692V10.8961C5.69197 9.46759 4.53392 8.30955 3.1054 8.30955H1.30827C0.585731 8.30955 0 7.72381 0 7.00128C0 6.27874 0.585732 5.69301 1.30827 5.69301H3.10471C4.53362 5.69301 5.69197 4.53465 5.69197 3.10575V1.30803C5.69197 0.585625 6.2776 0 7 0C7.7224 0 8.30803 0.585625 8.30803 1.30803V3.10575Z" fill="currentColor"/>
    </svg>
  </div>
);

const tabs = [
  { title: 'India-first drug and food database', desc: 'Verified database covering the 20 most common Indian medicines and 10 common Indian dietary interactions. E.g., Atorvastatin → Avoid grapefruit, excess mango, alcohol.', image: '/koi-assets/68454bf266bac4e704898592_10c133b7f004690fdc27c669292df201_Inventory.avif' },
  { title: 'OCR reliability & Human verification', desc: 'Handles messy Indian doctor handwriting via Google Cloud Vision API and Groq NER. A mandatory "Confirm All" human verification step ensures safety before any schedule is activated.', image: '/koi-assets/68454bf25ab150cfbcd251a6_Risk Analysis.avif' },
  { title: 'Exotel over Twilio', desc: 'Uses Exotel for all telephony. Indian local numbers, significantly better voice clarity on Indian mobile networks, and zero international routing delay.', image: '/koi-assets/68454bf244f58ba31e98e29e_Policies.avif' },
  { title: 'Real-time sentiment tagging', desc: 'Web Speech API transcribes audio. Groq (Llama 3) returns a reply and sentiment tag (joy, anxiety, sadness). Escalates to family if consecutive sad/anxious messages are detected.', image: '/koi-assets/68454bf2a7b546547d4c1e17_Detection.avif' },
  { title: 'Tone and language customisation', desc: 'Caregiver selects tone (warm, formal, playful). Companion speaks Hindi or English natively, breaking down elder tech barriers in India.', image: '/koi-assets/68454bf289df375f49c10f80_Remediation.avif' },
];

export function UnifiedPlatformSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="platform-secion">
      <div className="padding-global padding-section-medium">
        <div className="container-large">
          <div className="platform_component">
            <img src="/koi-assets/6836d873d735542d459f0382_cloud02.svg" loading="lazy" alt="" className="cloud _02" />

            <div className="koi_tab_wrap">
              {/* Left: Accordion tabs */}
              <div className="koi_tab_left_wrap">
                {tabs.map((tab, idx) => (
                  <div key={idx} className={`koi_tab_header ${activeTab === idx ? 'is_active' : ''}`}
                    onClick={() => setActiveTab(idx)} style={{ cursor: 'pointer' }}>
                    <div className="koi_tab_header_top">
                      <div className="koi_tab_header_icon" style={{ transition: 'transform 0.3s ease, color 0.3s ease' }}>
                        <StarIcon />
                      </div>
                      <div className="koi_tab_header_top_text">
                        <div className="u-text-size-medium">{tab.title}</div>
                      </div>
                    </div>
                    <div className="koi_tab_header_bottom">
                      <div className="koi_tab_header_text_wrap">
                        <div className="koi_tab_header_bottom_text">
                          <p className="p1_v2">{tab.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Screenshot panel */}
              <div className="koi_tab_right_wrap">
                <div className="koi_tab_visual_wrap">
                  {tabs.map((tab, idx) => (
                    <div key={idx} className={`koi_tab_visual ${activeTab === idx ? 'is_active' : ''}`}>
                      <img src={tab.image} loading="lazy" alt="Saya platform screen"
                        className="koi_tab_visual_img"
                        sizes="(max-width: 1132px) 100vw, 1132px" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
