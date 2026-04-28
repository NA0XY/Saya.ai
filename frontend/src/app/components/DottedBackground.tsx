export function DottedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="dotPattern"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.5" fill="#E85D2A" opacity="0.15" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotPattern)" />
      </svg>
    </div>
  );
}
