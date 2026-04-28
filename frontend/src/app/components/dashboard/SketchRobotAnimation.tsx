import React from 'react';

export function SketchRobotAnimation() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '60px', position: 'relative', width: '220px', marginLeft: "auto" }}>
      <style>{`
        .draw-path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: drawPathAnim 6s ease-in-out infinite;
        }
        .delay-1 { animation-delay: 0.6s; }
        .delay-2 { animation-delay: 1.2s; }
        .delay-3 { animation-delay: 2s; }

        @keyframes drawPathAnim {
          0% { stroke-dashoffset: 1; opacity: 1; }
          35%, 85% { stroke-dashoffset: 0; opacity: 1; }
          95%, 100% { stroke-dashoffset: 0; opacity: 0; }
        }

        .sketch-pen-wrap {
          position: absolute;
          top: -10px;
          left: -10px;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .sketch-pen {
          animation: penMove 6s ease-in-out infinite;
          transform-origin: 7px 29px; /* approximate tip of the pen */
        }
        
        @keyframes penMove {
          0% { transform: translate(10px, 20px) rotate(10deg); opacity: 0; }
          5% { opacity: 1; }
          15% { transform: translate(45px, 5px) rotate(25deg); }
          25% { transform: translate(60px, 30px) rotate(10deg); }
          35% { transform: translate(110px, 15px) rotate(30deg); }
          45% { transform: translate(150px, 35px) rotate(15deg); }
          55% { transform: translate(175px, 20px) rotate(25deg); }
          65% { transform: translate(190px, 45px) rotate(20deg); opacity: 1; }
          75%, 100% { transform: translate(210px, 55px) rotate(30deg); opacity: 0; }
        }
      `}</style>

      {/* The drawing canvas */}
      <svg viewBox="0 0 220 60" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        
        {/* Robot Head */}
        <path className="draw-path" pathLength="1" d="M 20 20 Q 20 10 30 10 L 60 10 Q 70 10 70 20 L 70 40 Q 70 50 60 50 L 30 50 Q 20 50 20 40 Z" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Antenna */}
        <path className="draw-path delay-1" pathLength="1" d="M 45 10 L 45 2" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
        {/* Antenna bulb (using path so pathLength works perfectly) */}
        <path className="draw-path delay-1" pathLength="1" d="M 45 2 A 2 2 0 1 1 44.9 2" fill="none" stroke="#E85D2A" strokeWidth="3" strokeLinecap="round" />
        
        {/* Eyes (happy curves) */}
        <path className="draw-path delay-2" pathLength="1" d="M 32 26 Q 35 22 38 26" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
        <path className="draw-path delay-2" pathLength="1" d="M 52 26 Q 55 22 58 26" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Smile */}
        <path className="draw-path delay-2" pathLength="1" d="M 35 35 Q 45 42 55 35" fill="none" stroke="#E85D2A" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Text "SAYA" */}
        <path className="draw-path delay-3" pathLength="1" d="M 100 22 C 100 16 90 16 90 24 C 90 28 100 28 100 33 C 100 40 90 40 90 34" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" /> {/* S */}
        <path className="draw-path delay-3" pathLength="1" d="M 105 38 L 110 18 L 115 38 M 107 30 L 113 30" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> {/* A */}
        <path className="draw-path delay-3" pathLength="1" d="M 120 18 L 125 28 L 130 18 M 125 28 L 125 38" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> {/* Y */}
        <path className="draw-path delay-3" pathLength="1" d="M 135 38 L 140 18 L 145 38 M 137 30 L 143 30" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> {/* A */}
        
        {/* Playful scribble line under "SAYA" */}
        <path className="draw-path delay-3" pathLength="1" d="M 90 48 Q 110 42 150 46" fill="none" stroke="#E85D2A" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Floating Sketch Pen that follows the drawing roughly */}
      <div className="sketch-pen-wrap">
        <svg className="sketch-pen" viewBox="0 0 30 30" style={{ width: "36px", height: "36px" }}>
          {/* Pen body */}
          <path d="M 7 23 L 13 23 L 29 7 L 23 1 Z" fill="#FDFAF5" stroke="#1A1A1A" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Pen tip */}
          <path d="M 7 23 L 13 23 L 10 29 Z" fill="#1A1A1A" />
          {/* Pen clip/details */}
          <line x1="20" y1="4" x2="26" y2="10" stroke="#1A1A1A" strokeWidth="1.5" />
          <line x1="11" y1="15" x2="17" y2="21" stroke="#1A1A1A" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
