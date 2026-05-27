import React from 'react';

export function AppLogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(50, 50)">
        {/* Base Ellipses */}
        <ellipse cx="0" cy="0" rx="14" ry="36" stroke="#0A2540" strokeWidth="5.5" transform="rotate(30)" />
        <ellipse cx="0" cy="0" rx="14" ry="36" stroke="#16a34a" strokeWidth="5.5" transform="rotate(90)" />
        <ellipse cx="0" cy="0" rx="14" ry="36" stroke="#0A2540" strokeWidth="5.5" transform="rotate(150)" />

        {/* Layering magic to simulate interlacing */}
        <path d="M 0 -36 A 14 36 0 0 1 14 -30" stroke="#0A2540" strokeWidth="5.5" strokeLinecap="round" transform="rotate(30)" />

        {/* Center Node */}
        <circle cx="0" cy="0" r="11" fill="#0A2540" />
        <circle cx="0" cy="0" r="4.5" fill="white" />

        {/* Outer Dots inside center */}
        <circle cx="0" cy="-6" r="1.5" fill="white" />
        <circle cx="0" cy="6" r="1.5" fill="white" />
        <circle cx="-5" cy="-2" r="1.5" fill="white" />
        <circle cx="5" cy="-2" r="1.5" fill="white" />
        <circle cx="-3" cy="4" r="1.5" fill="white" />
        <circle cx="3" cy="4" r="1.5" fill="white" />
      </g>
    </svg>
  );
}
