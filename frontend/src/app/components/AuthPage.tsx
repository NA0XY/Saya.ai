import { Link, useNavigate } from "react-router-dom";
import { startGoogleOAuth } from "../lib/api";

export function AuthPage() {
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      const url = await startGoogleOAuth("/onboarding");
      window.location.assign(url);
    } catch (error) {
      console.error("Failed to start Google OAuth", error);
      navigate("/auth/callback#error=oauth_start_failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F4EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Left Illustration — Caregiver + Elderly */}
      <div
        className="auth-illust-left"
        style={{
          position: "absolute",
          left: "5%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(240px, 22vw, 360px)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <img
          src="/illustration-left.png"
          alt="Caregiver helping elderly person"
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* ── Right Illustration — Rocking Chair (animated) */}
      <div
        className="auth-illust-right"
        style={{
          position: "absolute",
          right: "5%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(240px, 22vw, 360px)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <img
          src="/rocking-chair.png"
          alt="Elderly person relaxing in rocking chair"
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            display: "block",
            transformOrigin: "bottom center",
            animation: "rockingChair 3s ease-in-out infinite",
            transform: "scaleX(-1)",
          }}
        />
      </div>

      {/* ── Central Auth Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "60px 24px 40px",
        }}
      >
        {/* Brand */}
        <Link to="/" style={{ textDecoration: "none", marginBottom: "40px" }}>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              color: "#E85D2A",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            SAYA.AI
          </span>
        </Link>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Space Grotesk', serif",
            fontWeight: 700,
            fontSize: "clamp(2.5rem, 5vw, 3.8rem)",
            color: "#E85D2A",
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            margin: "0 0 24px",
          }}
        >
          Welcome to
          <br />
          Saya
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "15px",
            fontWeight: 400,
            color: "#555",
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: "400px",
            margin: "0 0 40px",
          }}
        >
          Sign in to stay connected to your parents, monitor
          their safety, and receive real-time proactive alerts.
        </p>

        {/* Google Sign In Button */}
        <button
          onClick={handleAuth}
          style={{
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            background: "#FFFFFF",
            border: "2px solid rgba(0,0,0,0.08)",
            borderRadius: "14px",
            padding: "16px 24px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#E85D2A";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(232,93,42,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
          }}
        >
          {/* Google Icon */}
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              color: "#333",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Sign in with Google
          </span>
        </button>

        {/* OR divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: "400px",
            margin: "20px 0",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.1)" }} />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              color: "#aaa",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            or
          </span>
          <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.1)" }} />
        </div>

        {/* Guest Button */}
        <button
          onClick={handleAuth}
          style={{
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: "#EDE6DA",
            border: "2px solid #DDD3C2",
            borderRadius: "14px",
            padding: "16px 24px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#E85D2A";
            e.currentTarget.style.borderColor = "#E85D2A";
            e.currentTarget.style.color = "#fff";
            const span = e.currentTarget.querySelector("span");
            if (span) span.style.color = "#fff";
            const arrow = e.currentTarget.querySelector("svg");
            if (arrow) arrow.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#EDE6DA";
            e.currentTarget.style.borderColor = "#DDD3C2";
            e.currentTarget.style.color = "#333";
            const span = e.currentTarget.querySelector("span");
            if (span) span.style.color = "#333";
            const arrow = e.currentTarget.querySelector("svg");
            if (arrow) arrow.style.color = "#333";
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              color: "#333",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Continue as Guest
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "#333", transition: "color 0.2s" }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* Terms */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            color: "#999",
            textAlign: "center",
            marginTop: "36px",
            lineHeight: 1.6,
          }}
        >
          By continuing, you agree to our{" "}
          <a
            href="#"
            style={{
              color: "#666",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="#"
            style={{
              color: "#666",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            Privacy Policy
          </a>
          .
        </p>

        {/* Footer */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#bbb",
            textAlign: "center",
            marginTop: "48px",
            letterSpacing: "0.02em",
          }}
        >
          © 2024 Saya.ai. Built for families.
        </p>
      </div>

      {/* Rocking animation + responsive hide */}
      <style>{`
        @keyframes rockingChair {
          0%   { transform: scaleX(-1) rotate(0deg); }
          25%  { transform: scaleX(-1) rotate(3deg); }
          50%  { transform: scaleX(-1) rotate(0deg); }
          75%  { transform: scaleX(-1) rotate(-3deg); }
          100% { transform: scaleX(-1) rotate(0deg); }
        }
        @media (max-width: 1100px) {
          .auth-illust-left,
          .auth-illust-right { display: none !important; }
        }
      `}</style>
    </div>
  );
}