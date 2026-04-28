import { useState } from "react";
import { Link } from "react-router-dom";

type DashboardNavProps = {
  onSettingsOpen?: () => void;
};

export function DashboardNav({ onSettingsOpen }: DashboardNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div data-animation="default" data-collapse="medium" data-duration="400" role="banner" className="nav_component w-nav bg-white/95 backdrop-blur border-b border-black/5">
      <div className="nav_container px-6 md:px-8 py-4">
        {/* LEFT NAV */}
        <nav role="navigation" className={`nav_menu w-nav-menu ${mobileOpen ? 'w--open' : ''}`}>
          <Link to="/companion" className="nav_menu_link w-inline-block flex items-center gap-3 text-[#83311A] hover:text-[#E85D2A] transition-colors font-bold uppercase tracking-wider text-sm">
            <span className="text-xl">🤖</span>
            <div>Companion View</div>
          </Link>
          <div className="nav_menu_link is-active flex items-center gap-3 text-[#E85D2A] font-bold uppercase tracking-wider text-sm">
            <span className="text-xl">📊</span>
            <div>Dashboard</div>
          </div>
        </nav>

        {/* CENTER LOGO */}
        <Link to="/" className="nav_brand w-nav-brand flex-1 text-center">
          <span className="nav_logo" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '32px', color: '#83311A', letterSpacing: '0.05em' }}>SAYA.AI</span>
        </Link>

        {/* RIGHT NAV */}
        <nav role="navigation" className="nav_menu hide-tablet w-nav-menu">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard/settings"
                aria-label="Open system configuration"
                className="text-[#83311A] font-bold uppercase tracking-wider text-sm hover:text-[#E85D2A] transition-colors"
              >
                Settings
              </Link>
              <div className="w-12 h-12 bg-gradient-to-br from-[#E85D2A] to-[#83311A] rounded-xl flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                U
              </div>
              <div className="text-sm font-bold uppercase tracking-wider text-[#83311A]">User</div>
            </div>
            <Link to="/" className="button is-nav w-button px-6 py-2 bg-[#E85D2A] text-white rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-[#83311A] transition-all shadow-md">LOGOUT</Link>
          </div>
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

