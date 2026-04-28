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
      className={`relative ${className}`}
      style={{
        background: "#FDFAF5",
        borderRadius: "14px",
        minHeight: 0,      // critical for flex/grid children — prevents content from overflowing
        overflow: "hidden",
        ...style,
      }}
      {...rest}
    >
      {/* Content first — painted below the SVG in DOM order */}
      {children}

      {/* Hand-drawn border — SVG layer rendered ON TOP, pointer-events:none */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 20, top: 0, left: 0 }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-4%" y="-4%" width="108%" height="108%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02 0.025"
              numOctaves="2"
              seed={seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        {/* Primary pen-border — inset 2px so displacement never clips content */}
        <rect
          x="2" y="2" width="96" height="96" rx="9"
          fill="none"
          stroke={strokeColor}
          strokeWidth="0.85"
          strokeOpacity="0.18"
          filter={`url(#${filterId})`}
        />
        {/* Ghost pass */}
        <rect
          x="2.8" y="2.8" width="94.4" height="94.4" rx="7"
          fill="none"
          stroke={strokeColor}
          strokeWidth="0.35"
          strokeOpacity="0.07"
          filter={`url(#${filterId})`}
        />
      </svg>
    </div>
  );
}
