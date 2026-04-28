import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="hero-section">
      <a
        aria-label="blog post link"
        href="https://www.koi.ai/blog/koi-to-join-palo-alto-networks-a-defining-moment"
        className="w-inline-block"
      >
        <div className="flag-video w-embed">
          <video
            id="flagVideo"
            preload="auto"
            width="100%"
            height="100%"
            autoPlay
            muted
            loop
            playsInline
            poster="/koi-assets/hero-balloon.avif"
          >
            <source
              src="https://pub-0ce1625df584471a91049d4bd7bb8aac.r2.dev/koi/koi-top.mp4"
              type='video/mp4; codecs="hvc1"'
            />
            <source src="https://pub-0ce1625df584471a91049d4bd7bb8aac.r2.dev/koi/koi-top.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      </a>

      <div className="padding-global padding-section-xlarge">
        <div className="container-large">
          <div className="hero-component">
            <div className="hero-content">
              <div className="hero-heading">
                <h1>
                  SAYA.AI: THE AUTONOMOUS <span className="text-color-black">ELDER CARE COMPANION</span>
                </h1>
              </div>
              <p>
                Saya.ai is a proactive, multi-agent AI system that acts as both a 24/7 safety net and an empathetic companion. It doesn't wait to be asked — it acts.
              </p>
              <Link to="/auth" className="button w-button">
                See Saya in Action
              </Link>
            </div>

            <div id="3d-container" className="hero-video-wrapper w-node-_1b36324d-741a-e90e-6258-00280b2b1c62-a54af95c">
              <div className="video-wrapper">
                <div className="hero-video w-embed">
                  <video
                    id="shipVideo"
                    preload="auto"
                    width="100%"
                    height="100%"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/koi-assets/island-center.avif"
                  >
                    <source
                      src="https://et-public-media.s3.us-east-1.amazonaws.com/videos/hero.mp4"
                      type='video/mp4; codecs="hvc1"'
                    />
                    <source src="https://et-public-media.s3.us-east-1.amazonaws.com/videos/hero.webm" type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

