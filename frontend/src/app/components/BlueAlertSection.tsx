import { useRef } from 'react';
import { useRainAnimation } from '../hooks/useRainAnimation';

const statsCards = [
  {
    href: '#',
    number: '340M',
    label: 'Elderly by 2050',
    desc: 'India\'s elderly population will reach 340 million.',
    icon: '/koi-assets/68c15ee28d428484b55c04ff_happy.svg',
    iconAlt: 'Population icon',
  },
  {
    href: '#',
    number: '1st',
    label: 'Priority',
    desc: 'Children work in different cities. Nuclear families are the norm.',
    icon: '/koi-assets/6829a13fb6a5b758938889d4_icon02.svg',
    iconAlt: 'Family icon',
  },
  {
    href: '#',
    number: 'Daily',
    label: 'Struggle',
    desc: 'Elderly parents live alone, struggling with medications.',
    icon: '/koi-assets/6829a13fe14db4928d84d9b8_icon03.svg',
    iconAlt: 'Pill icon',
  },
  {
    href: '#',
    number: 'Hidden',
    label: 'Risk',
    desc: 'Eating foods that interact with prescriptions.',
    icon: '/koi-assets/6829a13f79bd1b2d43ef6f4e_icon04.svg',
    iconAlt: 'Food icon',
  },
  {
    href: '#',
    number: '0',
    label: 'Connection',
    desc: 'Spending long hours with no one to talk to.',
    icon: '/koi-assets/68c15ee14c67c94294b95bba_mcp.avif',
    iconAlt: 'Chat icon',
  },
];

export function BlueAlertSection() {
  const rainRef = useRef<HTMLDivElement>(null);
  useRainAnimation(rainRef);

  return (
    <section className="rain-section">
      {/* Top cloud transition */}
      <img src="/koi-assets/68aafb81c17c8da6efaa2450_d892bafde828421d568284a2aeef4580_cloud-top.svg" loading="lazy" alt="" className="rain_clouds-top top" />

      <div className="padding-global padding-section-large">
        <div className="container-medium">
          <div className="rain_component">
            {/* Main heading */}
            <div className="section-heading">
              <h2 className="text-color-white">
                ELDER CARE IN INDIA <span className="text-color-yellow">IS AT A BREAKING POINT.</span>
              </h2>
            </div>

            {/* Stat cards */}
            <div className="found_cards mobile-center">
              {statsCards.map((card, i) => (
                <a
                  key={i}
                  href={card.href}
                  className="threatlink w-inline-block"
                  target={card.href.startsWith('http') ? '_blank' : undefined}
                  rel={card.href.startsWith('http') ? 'noreferrer' : undefined}
                  onClick={(e) => {
                    if (card.href === '#') e.preventDefault();
                  }}
                >
                  <div className="found_card">
                    <div className="found_card-top">
                      <div className="found_number-wrapper">
                        <div className="found_number no-wrap">{card.number}</div>
                        <div className="no-wrap">{card.label}</div>
                      </div>
                      <p className="found-desc">{card.desc}</p>
                    </div>
                    <img src={card.icon} loading="lazy" alt={card.iconAlt} className="found_card-logo" />
                  </div>
                </a>
              ))}
            </div>

            <div className="outlined-heading-wrapper"></div>

            {/* Second heading */}
            <div className="section-heading is-rain">
              <h2 className="text-color-white">
                Responsible AI Design — Three Commitments
              </h2>
            </div>

            {/* Info cards */}
            <div className="rain_cards">
              <div className="rain_card">
                <div className="text-color-yellow text-size-medium">Precaution, not prescription</div>
                <p>Saya.ai only tells users what to avoid — never what to take, what dosage to follow, or when to see a doctor.</p>
              </div>
              <div className="rain_card">
                <div className="text-color-yellow text-size-medium">Human verification before action</div>
                <p>No AI-extracted medical data activates without caregiver confirmation. The editable verification form is mandatory.</p>
              </div>
              <div className="rain_card">
                <div className="text-color-yellow text-size-medium">Grounded in verified data</div>
                <p>Every medical warning traces to a verified database record. The LLM formats the output; it never generates medical facts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rain canvas container */}
      <div id="rain-container" className="rain-container" ref={rainRef}></div>

      {/* Net and Spear animations */}
      <div className="animation-wrapper">
        <div className="net-video w-embed">
          <video id="netVideo" preload="auto" width="100%" height="100%" autoPlay muted loop playsInline>
            <source src="https://et-public-media.s3.us-east-1.amazonaws.com/videos/Net.mp4" type='video/mp4; codecs="hvc1"' />
            <source src="https://et-public-media.s3.us-east-1.amazonaws.com/videos/Net.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="spear-video w-embed">
          <video id="spearVideo" preload="auto" width="100%" height="100%" autoPlay muted loop playsInline>
            <source src="https://et-public-media.s3.us-east-1.amazonaws.com/videos/Spear.mp4" type='video/mp4; codecs="hvc1"' />
            <source src="https://et-public-media.s3.us-east-1.amazonaws.com/videos/Spear.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
