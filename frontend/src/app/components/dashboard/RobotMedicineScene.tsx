import React from "react";

/**
 * Animated SVG scene: a robot handing a medicine bottle to an elderly man.
 * All elements are hand-drawn style with CSS keyframe animations.
 */
export function RobotMedicineScene() {
  return (
    <>
      <style>{`
        @keyframes robotArmExtend {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(-12deg); }
          60% { transform: rotate(-8deg); }
        }
        @keyframes bottleFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(8px, -3px) rotate(4deg); }
          50% { transform: translate(16px, -1px) rotate(2deg); }
          75% { transform: translate(12px, -2px) rotate(-2deg); }
        }
        @keyframes oldManReach {
          0%, 100% { transform: rotate(0deg); }
          40% { transform: rotate(8deg); }
          70% { transform: rotate(5deg); }
        }
        @keyframes robotBlink {
          0%, 90%, 100% { ry: 5; }
          95% { ry: 1; }
        }
        @keyframes gentleNod {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes heartPulse {
          0%, 100% { opacity: 0; transform: scale(0) translate(0, 0); }
          20% { opacity: 1; transform: scale(1) translate(-5px, -8px); }
          80% { opacity: 0.6; transform: scale(1.2) translate(-10px, -20px); }
        }
        .robot-arm-group {
          transform-origin: 62px 95px;
          animation: robotArmExtend 3s ease-in-out infinite;
        }
        .medicine-bottle {
          animation: bottleFloat 3s ease-in-out infinite;
        }
        .oldman-arm {
          transform-origin: 160px 115px;
          animation: oldManReach 3s ease-in-out infinite;
        }
        .robot-head {
          transform-origin: 55px 55px;
          animation: gentleNod 4s ease-in-out infinite;
        }
        .heart-anim {
          animation: heartPulse 3.5s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 220 180"
        style={{ width: "100%", height: "auto", display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ===== BACKGROUND ELEMENTS ===== */}
        {/* Warm glow behind the scene */}
        <circle cx="140" cy="70" r="55" fill="#FFF3E0" opacity="0.6" />
        {/* Window */}
        <rect x="175" y="20" width="30" height="28" rx="2" fill="#87CEEB" stroke="#1A1A1A" strokeWidth="2" />
        <line x1="190" y1="20" x2="190" y2="48" stroke="#1A1A1A" strokeWidth="1.5" />
        <line x1="175" y1="34" x2="205" y2="34" stroke="#1A1A1A" strokeWidth="1.5" />

        {/* ===== ROBOT ===== */}
        {/* Robot body */}
        <rect x="35" y="85" width="40" height="45" rx="5" fill="#F5F5F5" stroke="#1A1A1A" strokeWidth="2" />
        {/* Robot chest detail */}
        <rect x="48" y="93" width="14" height="8" rx="2" fill="#E0E0E0" stroke="#1A1A1A" strokeWidth="1" />
        <circle cx="52" cy="97" r="2" fill="#E85D2A" />
        <circle cx="58" cy="97" r="2" fill="#4CAF50" />
        {/* Robot neck */}
        <rect x="49" y="78" width="12" height="9" rx="2" fill="#E0E0E0" stroke="#1A1A1A" strokeWidth="1.5" />

        {/* Robot head - animated nod */}
        <g className="robot-head">
          <rect x="38" y="48" width="34" height="32" rx="8" fill="#F5F5F5" stroke="#1A1A1A" strokeWidth="2" />
          {/* Eyes */}
          <ellipse cx="48" cy="60" rx="4" ry="5" fill="#1A1A1A">
            <animate attributeName="ry" values="5;5;1;5;5" dur="4s" repeatCount="indefinite" keyTimes="0;0.45;0.5;0.55;1" />
          </ellipse>
          <ellipse cx="62" cy="60" rx="4" ry="5" fill="#1A1A1A">
            <animate attributeName="ry" values="5;5;1;5;5" dur="4s" repeatCount="indefinite" keyTimes="0;0.45;0.5;0.55;1" />
          </ellipse>
          {/* Smile */}
          <path d="M 48 69 Q 55 76 62 69" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
          {/* Antenna */}
          <line x1="55" y1="48" x2="55" y2="40" stroke="#1A1A1A" strokeWidth="1.5" />
          <circle cx="55" cy="38" r="3" fill="#E85D2A" stroke="#1A1A1A" strokeWidth="1" />
          {/* Ear circles */}
          <circle cx="37" cy="62" r="5" fill="#E0E0E0" stroke="#1A1A1A" strokeWidth="1.5" />
          <circle cx="73" cy="62" r="5" fill="#E0E0E0" stroke="#1A1A1A" strokeWidth="1.5" />
        </g>

        {/* Robot left arm (the one extending to give medicine) */}
        <g className="robot-arm-group">
          {/* Upper arm */}
          <rect x="72" y="90" width="22" height="8" rx="4" fill="#F5F5F5" stroke="#1A1A1A" strokeWidth="1.5" />
          {/* Forearm */}
          <rect x="88" y="88" width="18" height="10" rx="4" fill="#F5F5F5" stroke="#1A1A1A" strokeWidth="1.5" />
          {/* Hand / gripper */}
          <circle cx="107" cy="93" r="5" fill="white" stroke="#1A1A1A" strokeWidth="1.5" />

          {/* Medicine bottle being handed */}
          <g className="medicine-bottle">
            <rect x="102" y="82" width="12" height="16" rx="3" fill="#E85D2A" stroke="#1A1A1A" strokeWidth="1.5" />
            <rect x="104" y="79" width="8" height="5" rx="2" fill="white" stroke="#1A1A1A" strokeWidth="1" />
            {/* Label on bottle */}
            <rect x="104" y="86" width="8" height="6" rx="1" fill="white" opacity="0.8" />
            <line x1="105" y1="88" x2="111" y2="88" stroke="#1A1A1A" strokeWidth="0.5" />
            <line x1="105" y1="90" x2="109" y2="90" stroke="#1A1A1A" strokeWidth="0.5" />
          </g>
        </g>

        {/* Robot right arm (hanging) */}
        <rect x="18" y="90" width="20" height="8" rx="4" fill="#F5F5F5" stroke="#1A1A1A" strokeWidth="1.5" />
        {/* Robot right hand holds another bottle */}
        <circle cx="18" cy="94" r="5" fill="white" stroke="#1A1A1A" strokeWidth="1.5" />
        <rect x="10" y="96" width="10" height="14" rx="3" fill="#8BC34A" stroke="#1A1A1A" strokeWidth="1.2" />
        <rect x="12" y="93" width="6" height="5" rx="2" fill="white" stroke="#1A1A1A" strokeWidth="0.8" />

        {/* Robot legs */}
        <rect x="40" y="128" width="10" height="22" rx="3" fill="#E0E0E0" stroke="#1A1A1A" strokeWidth="1.5" />
        <rect x="60" y="128" width="10" height="22" rx="3" fill="#E0E0E0" stroke="#1A1A1A" strokeWidth="1.5" />
        {/* Feet */}
        <ellipse cx="45" cy="152" rx="8" ry="4" fill="#1A1A1A" />
        <ellipse cx="65" cy="152" rx="8" ry="4" fill="#1A1A1A" />
        {/* Joints */}
        <circle cx="45" cy="128" r="4" fill="#1A1A1A" />
        <circle cx="65" cy="128" r="4" fill="#1A1A1A" />

        {/* ===== OLD MAN ===== */}
        {/* Chair */}
        <path d="M 140 105 Q 138 145 142 155 L 185 155 Q 188 140 185 105 Z" fill="#A5D6A7" stroke="#1A1A1A" strokeWidth="2" rx="8" />
        {/* Chair back */}
        <path d="M 175 60 Q 195 65 192 105 L 185 105 Q 185 70 175 68 Z" fill="#81C784" stroke="#1A1A1A" strokeWidth="1.5" />

        {/* Old man body */}
        <rect x="145" y="90" width="35" height="40" rx="6" fill="#5C6BC0" stroke="#1A1A1A" strokeWidth="2" />
        {/* Collar detail */}
        <path d="M 155 90 L 162 98 L 170 90" fill="none" stroke="#1A1A1A" strokeWidth="1" />

        {/* Old man head */}
        <g>
          <circle cx="162" cy="68" r="20" fill="#FFCC80" stroke="#1A1A1A" strokeWidth="2" />
          {/* Bald head highlight */}
          <path d="M 148 58 Q 162 44 176 58" fill="#FFE0B2" stroke="none" />
          {/* Glasses */}
          <circle cx="155" cy="66" r="6" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
          <circle cx="169" cy="66" r="6" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
          <line x1="161" y1="66" x2="163" y2="66" stroke="#1A1A1A" strokeWidth="1.2" />
          <line x1="149" y1="65" x2="145" y2="63" stroke="#1A1A1A" strokeWidth="1" />
          <line x1="175" y1="65" x2="179" y2="63" stroke="#1A1A1A" strokeWidth="1" />
          {/* Eyes behind glasses */}
          <circle cx="155" cy="66" r="2" fill="#1A1A1A" />
          <circle cx="169" cy="66" r="2" fill="#1A1A1A" />
          {/* Smile */}
          <path d="M 156 76 Q 162 82 168 76" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
          {/* Beard */}
          <path d="M 148 74 Q 148 88 162 90 Q 176 88 176 74" fill="white" stroke="#1A1A1A" strokeWidth="1.2" opacity="0.9" />
          {/* Eyebrows */}
          <path d="M 151 60 Q 155 57 159 60" fill="none" stroke="#808080" strokeWidth="1" />
          <path d="M 165 60 Q 169 57 173 60" fill="none" stroke="#808080" strokeWidth="1" />
        </g>

        {/* Old man arm reaching — animated */}
        <g className="oldman-arm">
          <rect x="135" y="108" width="18" height="8" rx="4" fill="#5C6BC0" stroke="#1A1A1A" strokeWidth="1.5" transform="rotate(-20, 145, 112)" />
          {/* Hand */}
          <circle cx="128" cy="105" r="5" fill="#FFCC80" stroke="#1A1A1A" strokeWidth="1.5" />
          {/* Fingers reaching */}
          <path d="M 125 101 Q 120 98 122 103" fill="none" stroke="#1A1A1A" strokeWidth="1" />
          <path d="M 124 104 Q 119 102 121 107" fill="none" stroke="#1A1A1A" strokeWidth="1" />
        </g>

        {/* Old man other arm resting */}
        <rect x="170" y="100" width="14" height="8" rx="4" fill="#5C6BC0" stroke="#1A1A1A" strokeWidth="1.2" />

        {/* Medicine bottles on side table */}
        <rect x="160" y="148" width="30" height="8" rx="2" fill="#8D6E63" stroke="#1A1A1A" strokeWidth="1.5" />
        <rect x="163" y="140" width="8" height="10" rx="2" fill="#E85D2A" stroke="#1A1A1A" strokeWidth="1" />
        <rect x="164.5" y="138" width="5" height="3" rx="1" fill="white" stroke="#1A1A1A" strokeWidth="0.7" />
        <rect x="174" y="137" width="7" height="13" rx="2" fill="white" stroke="#1A1A1A" strokeWidth="1" />
        <rect x="175.5" y="135" width="4" height="3" rx="1" fill="#E0E0E0" stroke="#1A1A1A" strokeWidth="0.7" />
        <rect x="183" y="142" width="6" height="8" rx="2" fill="#CE93D8" stroke="#1A1A1A" strokeWidth="1" />
        <rect x="184" y="140" width="4" height="3" rx="1" fill="white" stroke="#1A1A1A" strokeWidth="0.7" />

        {/* Floating hearts - care animation */}
        <g className="heart-anim">
          <path d="M 120 55 C 118 50, 112 50, 112 55 C 112 60, 120 65, 120 65 C 120 65, 128 60, 128 55 C 128 50, 122 50, 120 55 Z" fill="#E85D2A" opacity="0.7" />
        </g>
        <g className="heart-anim" style={{ animationDelay: "1.2s" }}>
          <path d="M 130 45 C 129 42, 125 42, 125 45 C 125 48, 130 51, 130 51 C 130 51, 135 48, 135 45 C 135 42, 131 42, 130 45 Z" fill="#E85D2A" opacity="0.5" transform="scale(0.6) translate(80, 20)" />
        </g>

        {/* Ground line */}
        <path d="M 5 156 Q 60 158 110 155 T 215 157" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    </>
  );
}
