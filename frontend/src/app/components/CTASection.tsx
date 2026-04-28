import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="cta-section">
      <div className="padding-global padding-section-medium">
        <div className="container-large">
          <div className="cta_component">
            {/* Supply chain gateway equivalent */}
            <div className="section-heading">
              <div className="kicker">Always-on protection for your family</div>
              <h2 className="text-color-alternate">Family Safety Gateway</h2>
              <p>
                The Family Safety Gateway is a proactive layer that monitors incoming health risks,
                scam attempts, and daily care patterns — acting as a guardian between your parents
                and potential dangers, 24/7.
              </p>
            </div>

            <img src="/koi-assets/68be5537f19283a6c0cd5c38_supply-img.avif"
              loading="lazy" width="464" alt="" className="cta_image is-supply" />

            <h2 className="cta-heading">Care with zero compromise.</h2>
            <div className="spacer-small"></div>
            <div className="text-align-center text-weight-medium">
              ("Because your parents deserve the best")
            </div>

            {/* Certification logos */}
            <div className="cta_logos">
              <img src="/koi-assets/67cff79fcaed643331eecdea_ico.svg" loading="lazy" alt="ISO 27001" />
              <img src="/koi-assets/67cff79f5f3350b9ddded599_soc.svg" loading="lazy" alt="SOC 3 certified" />
            </div>

            {/* Final CTA block */}
            <div className="cta_wrapper">
              <div className="cta_inner">
                <h2 className="cta_title">Ready to protect your parents?</h2>
                <div className="cta_image" style={{
                  width: '120px', height: '120px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '80px',
                }}>
                  📱
                </div>
                <div className="cta_content">
                  <Link to="/auth" className="button is-secondary w-button">GET STARTED</Link>
                </div>
                <div className="cta_bg-color"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

