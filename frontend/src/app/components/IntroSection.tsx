import { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const introCards = [
  {
    title: 'Pillar 1 — Medical Vision Engine',
    desc: 'Upload a handwritten prescription. Saya.ai extracts medicines and warns about dangerous food & drug combinations specific to Indian diets, verified by our India-first database.',
    animationSrc: '/koi-assets/67d6d51481c2dd042f62438d_Icon-03-bigger.json',
  },
  {
    title: 'Pillar 2 — The Guardian Caller',
    desc: 'Proactive medication adherence. Saya.ai calls elderly parents on Indian phone networks in their native language when medication is due, with SMS alerts to family members.',
    animationSrc: '/koi-assets/682d62392252eb8af632ea89_icon-04.lottie',
  },
  {
    title: 'Pillar 3 — The 2D Companion',
    desc: 'Emotional support that remembers. An animated companion with memory, sentiment awareness, and connection to daily news, turning conversations into a safety net.',
    animationSrc: '/koi-assets/6835aab76119e2ebcc85eae1_Icon-05-Bigger-v03.json',
  },
];

export function IntroSection() {
  const [activeCard, setActiveCard] = useState(0);

  return (
    <section className="intro-section">
      <div className="padding-global padding-section-medium">
        <div className="container-large">
          <div className="section-heading">
            <div className="koi-wrapper">
              <div className="platform_koi is-large w-embed">
                <video id="fishVideo" preload="auto" width="100%" height="100%" autoPlay muted loop playsInline>
                  <source src="https://et-public-media.s3.us-east-1.amazonaws.com/videos/Fish.mp4" type='video/mp4; codecs="hvc1"' />
                  <source src="https://et-public-media.s3.us-east-1.amazonaws.com/videos/Fish.webm" type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            <img src="/koi-assets/saya-logo.svg" loading="lazy" alt="Saya logo" className="platform_logo" />
            <h2 className="tilted-heading text-color-alternate">
              The 3 Core Pillars<br/>of Saya.ai
            </h2>
          </div>

          <div className="intro_component">
            <div className="text-align-center text-size-medium text-style-allcaps max-width-medium align-center">
              Crucially, Saya.ai is built around precaution, not prescription. It tells you what not to do — not what to do.
            </div>

            <div className="intro_wrapper">
              {introCards.map((card, idx) => (
                <div key={idx} className="intro_card" onClick={() => setActiveCard(idx)} style={{ cursor: 'pointer' }}>
                  <div className="intro_card-content">
                    <div className="text-color-accent text-size-medium">{card.title}</div>
                    <p>{card.desc}</p>
                  </div>
                  <div className="intro_image-wrapper">
                    <div className="intro-icon" style={{
                      width: '12rem', height: '12rem', transition: 'transform 0.3s ease',
                      transform: activeCard === idx ? 'scale(1.1)' : 'scale(1)',
                    }}>
                      <DotLottieReact src={card.animationSrc} loop autoplay style={{ width: '100%', height: '100%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation arrows */}
            <div className="intro-nav">
              <div id="introLeft" className="friendly_button" onClick={() => setActiveCard(p => Math.max(0, p - 1))}>
                <div className="friendly_arrow w-embed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 25" fill="none">
                    <path d="M3.3525 12.4616L10.1025 19.2116C10.2091 19.311 10.3502 19.365 10.4959 19.3625C10.6416 19.3599 10.7807 19.3009 10.8837 19.1978C10.9868 19.0948 11.0458 18.9557 11.0484 18.81C11.051 18.6643 10.9969 18.5232 10.8975 18.4166L5.10844 12.6266H20.25C20.3992 12.6266 20.5423 12.5673 20.6477 12.4618C20.7532 12.3564 20.8125 12.2133 20.8125 12.0641C20.8125 11.9149 20.7532 11.7718 20.6477 11.6663C20.5423 11.5609 20.3992 11.5016 20.25 11.5016H5.10844L10.8975 5.71159C10.9969 5.60496 11.051 5.46393 11.0484 5.3182C11.0458 5.17248 10.9868 5.03344 10.8837 4.93038C10.7807 4.82732 10.6416 4.76828 10.4959 4.76571C10.3502 4.76314 10.2091 4.81723 10.1025 4.91659L3.3525 11.6666C3.24716 11.7721 3.188 11.915 3.188 12.0641C3.188 12.2132 3.24716 12.3561 3.3525 12.4616Z" fill="#83311A"/>
                  </svg>
                </div>
              </div>
              <div id="introRight" className="friendly_button" onClick={() => setActiveCard(p => Math.min(2, p + 1))}>
                <div className="friendly_arrow w-embed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 25" fill="none">
                    <path d="M20.6475 12.4616L13.8975 19.2116C13.7909 19.311 13.6498 19.365 13.5041 19.3625C13.3584 19.3599 13.2193 19.3009 13.1163 19.1978C13.0132 19.0948 12.9542 18.9557 12.9516 18.81C12.949 18.6643 13.0031 18.5232 13.1025 18.4166L18.8916 12.6266H3.75C3.60082 12.6266 3.45774 12.5673 3.35225 12.4618C3.24676 12.3564 3.1875 12.2133 3.1875 12.0641C3.1875 11.9149 3.24676 11.7718 3.35225 11.6663C3.45774 11.5609 3.60082 11.5016 3.75 11.5016H18.8916L13.1025 5.71159C13.0031 5.60496 12.949 5.46393 12.9516 5.3182C12.9542 5.17248 13.0132 5.03344 13.1163 4.93038C13.2193 4.82732 13.3584 4.76828 13.5041 4.76571C13.6498 4.76314 13.7909 4.81723 13.8975 4.91659L20.6475 11.6666C20.7528 11.7721 20.812 11.915 20.812 12.0641C20.812 12.2132 20.7528 12.3561 20.6475 12.4616Z" fill="#83311A"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
