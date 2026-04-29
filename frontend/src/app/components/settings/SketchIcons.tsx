import React from 'react';

const SketchIconWrapper = ({ children, className = "", fill = "none" }: { children: React.ReactNode, className?: string, fill?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={`w-8 h-8 ${className}`} 
    fill={fill} 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ filter: 'url(#rough)' }}
  >
    {children}
  </svg>
);

export const PhoneIcon = ({ active }: { active?: boolean }) => (
  <SketchIconWrapper fill="#E85D2A33">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="#E85D2A" fillOpacity="0.8" />
  </SketchIconWrapper>
);

export const MobileIcon = ({ active }: { active?: boolean }) => (
  <SketchIconWrapper fill="#F5C45D33">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" fill="#F5C45D" fillOpacity="0.8" />
    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
  </SketchIconWrapper>
);

export const PillIcon = () => (
  <SketchIconWrapper>
    <path d="M10.5 3.5a5.5 5.5 0 0 0-7.78 7.78l10.6 10.6a5.5 5.5 0 0 0 7.78-7.78Z" fill="#EF4444" fillOpacity="0.4" />
    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
  </SketchIconWrapper>
);

export const SoulIcon = () => (
  <SketchIconWrapper fill="#E9C46A33">
    <path d="M12 3v1m0 16v1m9-9h-1M4 11H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" />
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="#E9C46A" fillOpacity="0.6" />
  </SketchIconWrapper>
);

export const SafetyIcon = () => (
  <SketchIconWrapper fill="#3F48CC33">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#3F48CC" fillOpacity="0.3" />
  </SketchIconWrapper>
);

export const StatusIcon = () => (
  <SketchIconWrapper fill="#1A1A1A33">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#1A1A1A" fillOpacity="0.5" />
  </SketchIconWrapper>
);

export const CallerIcon = ({ active }: { active?: boolean }) => (
  <SketchIconWrapper fill="#4CAF5033">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="#4CAF50" fillOpacity="0.8" />
    <path d="M15 3h4v4" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M19 3l-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
  </SketchIconWrapper>
);