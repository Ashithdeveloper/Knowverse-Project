import React from "react";

const CyberLogo = ({ size = "md", showText = true, className = "" }) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* High-Tech Cyber Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/10 to-purple-600/20 blur-[6px] animate-pulse-glow" />
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
        >
          <defs>
            <linearGradient id="cyberShieldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
            <linearGradient id="cyberCoreGrad" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="100%" stopColor="#4FACFE" />
            </linearGradient>
          </defs>
          {/* Hexagonal Shield Outer Frame */}
          <path
            d="M24 4L42 12V24C42 34 34.5 42.5 24 44C13.5 42.5 6 34 6 24V12L24 4Z"
            stroke="url(#cyberShieldGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
          {/* Internal Circuit Lines */}
          <path
            d="M24 11V18M15 17L21 21M33 17L27 21M24 37V30M16 30L21 27M32 30L27 27"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Center Glowing Core */}
          <circle cx="24" cy="24" r="5" fill="url(#cyberCoreGrad)" />
          <circle cx="24" cy="24" r="8" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 2" opacity="0.9" />
        </svg>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight font-heading bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent ${textSizes[size]}`}
            >
              CYBER<span className="text-white">HAVEN</span>
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-cyan-400/80 uppercase font-semibold mt-0.5">
            SECURE DEV NETWORK
          </span>
        </div>
      )}
    </div>
  );
};

export default CyberLogo;
