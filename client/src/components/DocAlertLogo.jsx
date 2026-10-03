// DocAlert brand logo — matches the shield+document+bell design from the provided image
import React from 'react';

const DocAlertLogo = ({ size = 40, showText = true, textSize = 'text-2xl' }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Shield + Document + Bell SVG logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="DocAlert Logo"
      >
        {/* Outer shield */}
        <path
          d="M40 4 L72 16 L72 42 C72 58 58 70 40 76 C22 70 8 58 8 42 L8 16 Z"
          fill="url(#shieldGrad)"
        />
        {/* Inner shield highlight */}
        <path
          d="M40 10 L66 20 L66 42 C66 55 54 66 40 71 C26 66 14 55 14 42 L14 20 Z"
          fill="url(#shieldInner)"
          opacity="0.3"
        />
        {/* Document icon */}
        <rect x="26" y="18" width="22" height="30" rx="3" fill="white" opacity="0.95"/>
        <path d="M26 18 L26 48 L48 48 L48 26 L40 18 Z" fill="white"/>
        <path d="M40 18 L40 26 L48 26 Z" fill="#93c5fd"/>
        {/* Document lines */}
        <line x1="30" y1="30" x2="44" y2="30" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/>
        <line x1="30" y1="34" x2="44" y2="34" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/>
        <line x1="30" y1="38" x2="38" y2="38" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/>
        {/* Download arrow on document */}
        <circle cx="37" cy="26" r="5" fill="#1d4ed8" opacity="0.15"/>
        <path d="M37 23 L37 29 M34 27 L37 30 L40 27" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Bell */}
        <circle cx="53" cy="50" r="11" fill="#f59e0b"/>
        <path d="M53 42 C49 42 46 45 46 49 L46 53 L44 55 L62 55 L60 53 L60 49 C60 45 57 42 53 42 Z" fill="white" opacity="0.9"/>
        <rect x="50" y="55" width="6" height="2" rx="1" fill="white" opacity="0.9"/>
        <circle cx="49" cy="49" r="1" fill="#f59e0b"/>
        <circle cx="57" cy="49" r="1" fill="#f59e0b"/>
        {/* Bell vibration lines */}
        <path d="M43 47 C42 46 42 48 43 49" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M63 47 C64 46 64 48 63 49" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M41 44 C39 43 39 46 41 47" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <path d="M65 44 C67 43 67 46 65 47" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <defs>
          <linearGradient id="shieldGrad" x1="8" y1="4" x2="72" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563eb"/>
            <stop offset="100%" stopColor="#1e3a8a"/>
          </linearGradient>
          <linearGradient id="shieldInner" x1="14" y1="10" x2="66" y2="71" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white"/>
            <stop offset="100%" stopColor="#93c5fd"/>
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className={`font-extrabold tracking-tight ${textSize}`}>
          <span className="text-blue-800">Doc</span>
          <span className="text-blue-500">Alert</span>
        </span>
      )}
    </div>
  );
};

export default DocAlertLogo;
