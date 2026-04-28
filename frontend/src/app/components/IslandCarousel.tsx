import { useCarousel } from '../hooks/useCarousel';

const slides = [
  {
    id: 'island-red',
    videoId: 'islandRed',
    poster: 'https://cdn.prod.website-files.com/67bf17e426d92bdda54af956/68d94d90861a65e2ae6387dc_red.webp',
    mp4: 'https://pub-0ce1625df584471a91049d4bd7bb8aac.r2.dev/koi/red.mp4',
    webm: 'https://pub-0ce1625df584471a91049d4bd7bb8aac.r2.dev/koi/red.webm',
  },
  {
    id: 'island-gold',
    videoId: 'islandGold',
    poster: 'https://cdn.prod.website-files.com/67bf17e426d92bdda54af956/68d94d9180dcf8319ae3c176_gold.webp',
    mp4: 'https://pub-0ce1625df584471a91049d4bd7bb8aac.r2.dev/koi/gold.mp4',
    webm: 'https://pub-0ce1625df584471a91049d4bd7bb8aac.r2.dev/koi/gold.webm',
  },
  {
    id: 'island-blue',
    videoId: 'islandBlue',
    poster: 'https://cdn.prod.website-files.com/67bf17e426d92bdda54af956/68d94d9154573b870366c4e3_blue.webp',
    mp4: 'https://pub-0ce1625df584471a91049d4bd7bb8aac.r2.dev/koi/blue.mp4',
    webm: 'https://pub-0ce1625df584471a91049d4bd7bb8aac.r2.dev/koi/blue.webm',
  },
];

const logoGroups = [
  [
    { src: '/koi-assets/68be42e16d671f8ef1bdb6f5_azure.png', alt: 'azure logo', w: 46.5 },
    {
      src: '/koi-assets/68c15ee1480f57a5c753cbe6_9970250fcce1b387a69de90339165c34_cursor.avif',
      alt: 'Coursor logo',
      w: 46.5,
    },
    { src: '/koi-assets/68be42e05ba7eb0d9eb915d1_chrome.svg', alt: 'chrome logo', w: 46.5 },
    { src: '/koi-assets/68be42e14b2e2994dfcea893_edge.svg', alt: 'edge logo', w: 46.5 },
    { src: '/koi-assets/68be42e0de72cd452b201813_office.svg', alt: 'ms office logo', w: 46.5 },
    { src: '/koi-assets/68c15ee145787919bf5b6bf8_appstore.avif', alt: 'AppStore logo', w: 46.5 },
  ],
  [
    { src: '/koi-assets/68c15ee28d428484b55c04ff_happy.svg', alt: 'HuggingFace logo', w: 46.5 },
    { src: '/koi-assets/68c15ee1db665b096fba08ce_chat.avif', alt: 'OpenAI logo', w: 46.5 },
    { src: '/koi-assets/68c15ee1f7d9cd186f5f3581_anthro.avif', alt: 'anthropic logo', w: 46.5 },
    { src: '/koi-assets/68c15ee14c67c94294b95bba_mcp.avif', alt: 'MCP logo', w: 46.5 },
    {
      src: '/koi-assets/68c15ee1480f57a5c753cbe6_9970250fcce1b387a69de90339165c34_cursor.avif',
      alt: 'Coursor logo',
    },
    { src: '/koi-assets/68c15ee11eefa3d851f4f7b2_hub.avif', alt: 'Windsurf Current logo', w: 46.5 },
  ],
  [
    { src: '/koi-assets/68c15ee1208bbd67a25b82d7_npm.svg', alt: 'NPM logo', w: 46.5 },
    { src: '/koi-assets/68c15ee1c1243b0794f6d7cd_python.avif', alt: 'PyPi logo', w: 46.5 },
    { src: '/koi-assets/68be42e10e5485bb6dbf416c_homebrew.svg', alt: 'homebrew logo', w: 46.5 },
    { src: '/koi-assets/68c15ee16c38f5e2198875eb_choco.avif', alt: 'Chocolatey logo', w: 46.5 },
    { src: '/koi-assets/68c15ee1688cb00dbaeb1ca3_winget.avif', alt: 'Winget logo', w: 46.5 },
    { src: '/koi-assets/68c15ee22b0f0af0689c1999_apachi.avif', alt: 'Apache logo', w: 46.5 },
    { src: '/koi-assets/68c15f42ae4a630ea9c3de7d_git.svg', alt: 'Github logo', w: 46.5 },
  ],
];

export function IslandCarousel() {
  const { activeIndex, getPositionClass, slideLeft, slideRight, handleMouseDown, handleMouseUp, handleTouchStart, handleTouchEnd } = useCarousel(3);

  return (
    <section className="buildings-section">
      <div className="padding-global padding-section-medium is-bottom-large">
        <div className="container-large">
          <div className="section-heading">
            <h2>UNPRECEDENTED VISIBILITY INTO EVERY ASPECT OF YOUR PARENTS' DAILY LIFE.</h2>
          </div>

          <div
            className="swiper"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="swiper-wrapper">
              {slides.map((slide, i) => (
                <div key={slide.id} className={`swiper-slide ${getPositionClass(i)}`}>
                  <div className="island-video w-embed">
                    <video
                      id={slide.videoId}
                      preload="auto"
                      width="100%"
                      height="100%"
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster={slide.poster}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
                    >
                      <source src={slide.mp4} type='video/mp4; codecs="hvc1"' />
                      <source src={slide.webm} type="video/webm" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="swiper_nav">
            <a id="arrowPrev" aria-label="arrow left" href="#" className="swiper_arrow w-inline-block" onClick={(e) => { e.preventDefault(); slideLeft(); }}>
              <div className="swiper_arrow-icon w-embed">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 20 20" fill="none">
                  <path d="M10.0313 18.9098L1.28361 10.1622M1.28361 10.1622L10.0313 1.41455M1.28361 10.1622H18.6191" stroke="#83311A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </a>

            <div className="slider-logos-wrapper">
              {logoGroups.map((group, gi) => (
                <div
                  key={gi}
                  className="slider_logos"
                  style={{
                    display: gi === activeIndex ? 'flex' : 'none',
                    opacity: gi === activeIndex ? 1 : 0,
                    transition: 'opacity 0.45s ease',
                  }}
                >
                  {group.map((logo, li) => (
                    <img key={li} src={logo.src} loading="lazy" width={logo.w} alt={logo.alt} className="slider_logo" />
                  ))}
                </div>
              ))}
            </div>

            <a id="arrowNext" aria-label="arrow right" href="#" className="swiper_arrow w-inline-block" onClick={(e) => { e.preventDefault(); slideRight(); }}>
              <div className="swiper_arrow-icon w-embed">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 20 20" fill="none">
                  <path d="M9.9287 18.9098L18.6764 10.1622M18.6764 10.1622L9.9287 1.41455M18.6764 10.1622H1.34082" stroke="#83311A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
