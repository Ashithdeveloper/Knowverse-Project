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
      {/* High-Tech KnowVerse Nexus Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/25 via-sky-500/15 to-purple-600/25 blur-[7px] animate-pulse-glow" />
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative drop-shadow-[0_0_10px_rgba(56,189,248,0.55)]"
        >
          <defs>
            <linearGradient id="knowShieldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
            <linearGradient id="knowCoreGrad" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="100%" stopColor="#4FACFE" />
            </linearGradient>
            <linearGradient id="orbitGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {/* Hexagonal Knowledge Gateway */}
          <path
            d="M24 4L42 13V35L24 44L6 35V13L24 4Z"
            stroke="url(#knowShieldGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
          {/* Interconnected Knowledge Lattice */}
          <path
            d="M24 4V18M42 13L29 21M6 13L19 21M24 44V30M42 35L29 27M6 35L19 27"
            stroke="#38BDF8"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Knowledge Vertex Connections */}
          <path
            d="M17 19L24 14L31 19M17 29L24 34L31 29"
            stroke="url(#orbitGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
          {/* Central Radiant Nexus Core */}
          <circle cx="24" cy="24" r="5.5" fill="url(#knowCoreGrad)" />
          <circle
            cx="24"
            cy="24"
            r="8.5"
            stroke="#38BDF8"
            strokeWidth="1"
            strokeDasharray="3 2"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight font-heading bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent ${textSizes[size]}`}
            >
              KNOW<span className="text-white">VERSE</span>
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-cyan-400/80 uppercase font-semibold mt-0.5">
            KNOWLEDGE & DEV NETWORK
          </span>
        </div>
      )}
    </div>
  );
};

export const KnowVerseLogo = CyberLogo;
export default CyberLogo;
