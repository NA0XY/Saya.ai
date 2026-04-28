import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="footer">
      <div className="padding-global padding-section-small">
        <div className="footer_container">
          <div className="footer_component">
            {/* Logo + Socials */}
            <div className="footer_item is-first">
              <Link to="/" className="foote_logo-link w-inline-block">
                <span className="footer_logo" style={{
                  fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '36px', color: '#83311A',
                }}>SAYA.AI</span>
              </Link>
              <div className="social-links">
                <a href="https://linkedin.com" className="social_link w-inline-block" target="_blank" rel="noopener">
                  <div className="social_link-icon w-embed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 15 15" fill="none">
                      <path d="M0.954 14.107H3.75V5.054H0.954V14.107Z" fill="currentColor"/>
                      <path d="M0.7 2.164C0.7 3.057 1.42 3.779 2.352 3.779C3.242 3.779 3.962 3.057 3.962 2.164C3.962 1.272 3.242 0.507 2.352 0.507C1.42 0.507 0.7 1.272 0.7 2.164Z" fill="currentColor"/>
                      <path d="M11.461 14.107H14.3V9.134C14.3 6.712 13.749 4.799 10.911 4.799C9.555 4.799 8.623 5.564 8.241 6.287H8.199V5.054H5.53V14.107H8.326V9.644C8.326 8.454 8.538 7.307 10.021 7.307C11.461 7.307 11.461 8.667 11.461 9.687V14.107Z" fill="currentColor"/>
                    </svg>
                  </div>
                </a>
                <a href="https://twitter.com" className="social_link twitter w-inline-block" target="_blank" rel="noopener">
                  <div className="social_link-icon w-embed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 15 14" fill="none">
                      <path d="M10.856 9.491L8.547 6.419L8.843 6.105C9.009 5.939 9.846 5.034 10.702 4.104C11.558 3.174 12.358 2.306 12.481 2.177L12.697 1.949H11.693L9.926 3.858C8.96 4.904 8.141 5.766 8.116 5.766C8.091 5.766 7.427 4.904 6.638 3.858L5.21 1.949H3.523C2.594 1.949 1.836 1.955 1.836 1.968C1.836 1.98 2.821 3.304 4.022 4.904C5.222 6.511 6.201 7.847 6.195 7.872C6.183 7.89 5.198 8.968 4.01 10.255C2.815 11.541 1.836 12.613 1.836 12.631C1.836 12.649 2.052 12.662 2.317 12.662H2.791L4.668 10.624C5.703 9.503 6.577 8.561 6.614 8.531C6.663 8.494 7.168 9.116 8.245 10.562L9.809 12.656L11.49 12.662C12.407 12.662 13.165 12.643 13.165 12.613C13.165 12.588 12.124 11.184 10.856 9.491Z" fill="currentColor"/>
                    </svg>
                  </div>
                </a>
              </div>
              <Link to="/auth" className="button w-button">Get Started</Link>
            </div>

            {/* Company */}
            <div className="footer_item">
              <div className="footer_links-wrapper">
                <div className="text-style-allcaps text-weight-medium text-size-regular">COMPANY</div>
                <a href="#about" className="footer_link">About us →</a>
                <a href="#contact" className="footer_link">Contact →</a>
              </div>
            </div>

            {/* Products */}
            <div className="footer_item">
              <div className="footer_links-wrapper">
                <div className="text-style-allcaps text-weight-medium text-size-regular">Products</div>
                <a href="#platform" className="footer_link">Platform →</a>
                <a href="#health" className="footer_link">Saya Health →</a>
                <a href="#shield" className="footer_link">Saya Shield →</a>
                <a href="#companion" className="footer_link">Saya Companion →</a>
              </div>
            </div>

            {/* Solutions */}
            <div className="footer_item">
              <div className="footer_links-wrapper">
                <div className="text-style-allcaps text-weight-medium text-size-regular">Solutions</div>
                <a href="#health-tracking" className="footer_link">Health Tracking →</a>
                <a href="#care-routines" className="footer_link">Care Routines →</a>
                <a href="#family-alerts" className="footer_link">Family Alerts →</a>
              </div>
            </div>

            {/* Contact + Legal */}
            <div className="footer_item is-last">
              <div>
                <span className="text-weight-semibold">Saya.ai</span><br/>
                Team: Merge Conflict<br/>
                Built for Indian Families<br/>
                Mumbai, India
              </div>
              <div>
                <span className="text-weight-semibold reachout-text">hello@saya.ai</span>
              </div>
              <a href="#privacy" className="footer_link">Privacy Policy →</a>
              <a href="#terms" className="footer_link">Terms & Conditions →</a>
              <div className="cta_logos">
                <img src="/koi-assets/683eb920552463589e606129_gdpr.svg" loading="lazy" alt="GDPR" className="image-3" />
                <img src="/koi-assets/67cff79fcaed643331eecdea_ico.svg" loading="lazy" alt="ISO 27001" className="image" />
                <img src="/koi-assets/67cff79f5f3350b9ddded599_soc.svg" loading="lazy" alt="SOC 3" className="image-2" />
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="footer_copy">
            <div>Copyright © 2026 Saya.ai. All rights reserved.</div>
          </div>

          {/* Bottom illustration */}
          <div className="footer_bottom">
            <img src="/koi-assets/67cff6c93a1d08a3784351f2_footer_bottom.avif"
              loading="lazy" alt="Illustration of a peaceful garden"
              className="footer_bottom-image"
              sizes="100vw"
              srcSet="/koi-assets/67cff6c93a1d08a3784351f2_footer_bottom-p-500.png 500w, /koi-assets/67cff6c93a1d08a3784351f2_footer_bottom-p-800.avif 800w, /koi-assets/67cff6c93a1d08a3784351f2_footer_bottom.avif 2880w"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
