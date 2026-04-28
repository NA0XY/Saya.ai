import React from "react";

/**
 * SketchCard — hand-drawn pen-sketch border overlay over a warm paper card.
 * Children are rendered DIRECTLY inside the flex container — no extra wrapping
 * div — so all `flex`, `h-full`, `overflow-hidden` layout classes work as expected.
 */
interface SketchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  seed?: number;
  strokeColor?: string;
}

export function SketchCard({
  seed = 1,
  strokeColor = "#1A1A1A",
  className = "",
  style,
  children,
  ...rest
}: SketchCardProps) {
  const filterId = `sk-card-${seed}`;

  return (
    <div
      className={`relative flex flex-col ${className}`}
      style={{
        background: "transparent",
        minHeight: 0,
        ...style,
      }}
      {...rest}
    >
      {/* Background and children container */}
      <div 
        className="flex flex-col h-full w-full"
        style={{
          background: "#FDFAF5",
          borderRadius: "14px",
          overflow: "hidden", // ensures scrollbars and content are clipped neatly
        }}
      >
        {children}
      </div>

      {/* SVG Border overlay - placed outside the overflow:hidden bounds so the rough lines don't get clipped */}
      <svg
        style={{
           position: "absolute",
           top: "-10px", left: "-10px", right: "-10px", bottom: "-10px",
           width: "calc(100% + 20px)", height: "calc(100% + 20px)",
           zIndex: 20, pointerEvents: "none"
        }}
      >
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed={seed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Primary thick, rough stroke */}
        <rect
          x="10" y="10" width="calc(100% - 20px)" height="calc(100% - 20px)" rx="14"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeOpacity="0.95"
          filter={`url(#${filterId})`}
        />
        {/* Secondary ghost/scribble stroke */}
        <rect
          x="11.5" y="11.5" width="calc(100% - 23px)" height="calc(100% - 23px)" rx="14"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1"
          strokeOpacity="0.6"
          filter={`url(#${filterId})`}
        />
      </svg>
    </div>
  );
}
