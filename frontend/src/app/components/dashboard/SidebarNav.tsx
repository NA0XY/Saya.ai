import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { RobotMedicineScene } from "./RobotMedicineScene";

const SIDEBAR_WIDTH = 256;

export function SidebarNav() {
  const { pathname } = useLocation();
  const { user, avatarUrl, isLoggedIn, logout } = useUser();

  const displayName = user?.name || "Guest";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');
        
        .sketch-nav-item {
          display: block;
          padding: 8px 24px;
          color: #1A1A1A;
          text-decoration: none;
          font-family: 'Caveat', cursive;
          font-size: 26px;
          transition: all 0.2s;
          position: relative;
        }
        .sketch-nav-item:hover {
          color: #1A1A1A;
          transform: scale(1.15) translateX(5px) rotate(-2deg);
          text-shadow: 2px 2px 0px rgba(255,255,255,0.4);
        }
        .sketch-nav-item.active {
          font-weight: 700;
        }
        /* sketchy underline for active item */
        .sketch-nav-item.active::after {
          content: '';
          position: absolute;
          left: 20px;
          bottom: 6px;
          width: 60%;
          height: 3px;
          background: #E85D2A;
          border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
          transform: rotate(-2deg);
        }

        .sketch-button {
          background: transparent;
          border: 2px solid #1A1A1A;
          border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
          padding: 6px 32px;
          font-family: 'Caveat', cursive;
          font-size: 22px;
          color: #1A1A1A;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-block;
          text-align: center;
          margin-top: 12px;
          box-shadow: 2px 3px 0px rgba(26,26,26,0.2);
        }
        .sketch-button:hover {
          transform: translateY(1px);
          box-shadow: 1px 1px 0px rgba(26,26,26,0.2);
          background: rgba(239,68,68,0.08);
          border-color: #EF4444;
          color: #EF4444;
        }

        .sidebar-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #1A1A1A;
          box-shadow: 2px 2px 0px rgba(26,26,26,0.15);
        }
      `}</style>

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${SIDEBAR_WIDTH}px`,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 50,
          background: "transparent",
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          {/* Sketchy curved background for top area */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '380px',
              zIndex: -1,
            }}
            viewBox="0 0 256 380"
            preserveAspectRatio="none"
          >
            {/* Main colored shape */}
            <path
              d="M -10 -10 L 250 -10 C 255 150, 160 270, -10 360 Z"
              fill="#E85D2A"
              stroke="#1A1A1A"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Sketchy double-line effect */}
            <path
              d="M 2 2 L 246 2 C 250 155, 155 272, 2 355 Z"
              fill="none"
              stroke="#1A1A1A"
              strokeWidth="1.5"
              opacity="0.6"
            />
            {/* Some scribbles inside for sketch pen feel */}
            <path d="M 20 20 Q 40 30 20 40 T 30 60" fill="none" stroke="#D4531F" strokeWidth="2" opacity="0.4" />
            <path d="M 180 50 Q 200 60 170 80 T 190 110" fill="none" stroke="#D4531F" strokeWidth="2" opacity="0.4" />
          </svg>

          {/* Top Content */}
          <div style={{ padding: "40px 0 0 20px" }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h1 style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "36px",
                fontWeight: 700,
                color: "#1A1A1A",
                margin: "0 0 30px 10px",
                transform: "rotate(-2deg)"
              }}>
                Saya.ai
              </h1>
            </Link>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/dashboard" className={`sketch-nav-item ${pathname === '/dashboard' ? 'active' : ''}`}>
                dashboard
              </Link>
              <Link to="/companion" className={`sketch-nav-item ${pathname === '/companion' ? 'active' : ''}`}>
                companion
              </Link>
              <Link to="/dashboard/settings" className={`sketch-nav-item ${pathname === '/dashboard/settings' ? 'active' : ''}`}>
                settings
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Content (Illustration + User + Logout) */}
        <div style={{ padding: "0 0 30px 10px" }}>
          {/* Animated robot scene */}
          <div style={{ width: "220px", marginBottom: "12px" }}>
            <RobotMedicineScene />
          </div>
          {/* User info with avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="sidebar-avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#E85D2A",
                border: "2px solid #1A1A1A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Caveat', cursive",
                fontSize: "22px",
                fontWeight: 700,
                color: "#1A1A1A",
                boxShadow: "2px 2px 0px rgba(26,26,26,0.15)",
              }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "24px", color: "#1A1A1A", fontWeight: 600 }}>
              {displayName}
            </span>
          </div>

          {/* Logout button */}
          <button className="sketch-button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
