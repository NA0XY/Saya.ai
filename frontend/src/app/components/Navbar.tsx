import { useState } from 'react';
import { Link } from "react-router-dom";

export function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div data-animation="default" data-collapse="medium" data-duration="400" role="banner" className="nav_component w-nav">
      <div className="nav_container">
        {/* LEFT NAV (visible on tablet+ as hamburger menu content) */}
        <nav role="navigation" className={`nav_menu w-nav-menu ${mobileOpen ? 'w--open' : ''}`}>
          {/* Products dropdown */}
          <div className="nav_dropdown w-dropdown" onMouseEnter={() => setOpenDropdown('products')} onMouseLeave={() => setOpenDropdown(null)}>
            <div className="nav_menu_link is-dropdown w-dropdown-toggle">
              <div>Products</div>
              <div className="nav-menu-icon is-dropdown w-embed">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6l6 -6" />
                </svg>
              </div>
            </div>
            {openDropdown === 'products' && (
              <nav className="dropdown_list w-dropdown-list" style={{ display: 'block' }}>
                <div className="dropdown_list-innet">
                  <a href="#platform" className="dropdown_link w-inline-block">
                    <div className="dropdown_icon-wrapper">
                      <img src="/koi-assets/6833fd08b9c0fc51917041fe_platform_icon.svg" loading="lazy" alt="" />
                    </div>
                    <div className="dropdown_link-text">
                      <div>SAYA</div>
                      <div className="text-color-alternate">Complete elder care monitoring across all dimensions.</div>
                    </div>
                  </a>
                  <a href="#health" className="dropdown_link w-inline-block">
                    <div className="dropdown_icon-wrapper">
                      <img src="/koi-assets/6833fd08b9c0fc5191704209_discovery_icon.svg" loading="lazy" alt="" />
                    </div>
                    <div className="dropdown_link-text">
                      <div>SAYA HEALTH</div>
                      <div className="text-color-alternate">Monitor medications, vitals, and daily wellness patterns</div>
                    </div>
                  </a>
                  <a href="#safety" className="dropdown_link w-inline-block">
                    <div className="dropdown_icon-wrapper">
                      <img src="/koi-assets/6954f8f9e60acc3c7068b423_gateway.svg" loading="lazy" alt="" />
                    </div>
                    <div className="dropdown_link-text">
                      <div>SAYA SHIELD</div>
                      <div className="text-color-alternate">AI-powered scam prevention and safety gateway</div>
                    </div>
                  </a>
                </div>
              </nav>
            )}
          </div>

          {/* Solutions dropdown */}
          <div className="nav_dropdown w-dropdown" onMouseEnter={() => setOpenDropdown('solutions')} onMouseLeave={() => setOpenDropdown(null)}>
            <div className="nav_menu_link is-dropdown w-dropdown-toggle">
              <div>Solutions</div>
              <div className="nav-menu-icon is-dropdown w-embed">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6l6 -6" />
                </svg>
              </div>
            </div>
            {openDropdown === 'solutions' && (
              <nav className="dropdown_list w-dropdown-list" style={{ display: 'block' }}>
                <div className="dropdown_list-innet">
                  <a href="#discovery" className="dropdown_link w-inline-block">
                    <div className="dropdown_icon-wrapper">
                      <img src="/koi-assets/6833fd08b9c0fc5191704209_discovery_icon.svg" loading="lazy" alt="" />
                    </div>
                    <div className="dropdown_link-text">
                      <div>HEALTH TRACKING</div>
                      <div className="text-color-alternate">All your parent's health data in one place.</div>
                    </div>
                  </a>
                  <a href="#policies" className="dropdown_link w-inline-block">
                    <div className="dropdown_icon-wrapper">
                      <img src="/koi-assets/6833fd0829c964ec1f08358c_policies_icon.svg" loading="lazy" alt="" />
                    </div>
                    <div className="dropdown_link-text">
                      <div className="uppercase">Care Routines</div>
                      <div className="text-color-alternate">Automated daily care schedules that keep them safe.</div>
                    </div>
                  </a>
                  <a href="#approve" className="dropdown_link w-inline-block">
                    <div className="dropdown_icon-wrapper">
                      <img src="/koi-assets/6833fd0846cad0da74b1386c_approve_icon.svg" loading="lazy" alt="" />
                    </div>
                    <div className="dropdown_link-text">
                      <div className="uppercase">Family Alerts</div>
                      <div className="text-color-alternate">Instant alerts when something needs attention.</div>
                    </div>
                  </a>
                </div>
              </nav>
            )}
          </div>

          <a href="#about" className="nav_menu_link w-inline-block"><div>About</div></a>
          <a href="#blog" className="nav_menu_link w-inline-block"><div>Blog</div></a>
          <Link to="/auth" className="button is-nav hide-desktop w-button">Get Started</Link>
        </nav>

        {/* CENTER LOGO */}
        <Link to="/" className="nav_brand w-nav-brand">
          <span className="nav_logo" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '28px', color: '#83311A' }}>SAYA.AI</span>
        </Link>

        {/* RIGHT NAV */}
        <nav role="navigation" className="nav_menu hide-tablet w-nav-menu">
          <Link to="/auth" className="button is-nav w-button">GET STARTED</Link>
        </nav>

        {/* HAMBURGER */}
        <div className="nav_button w-nav-button" onClick={() => setMobileOpen(!mobileOpen)}>
          <div className="nav_button-icon">
            <div className="burger-line _01"></div>
            <div className="burger-line _02"></div>
            <div className="burger-line _03"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

