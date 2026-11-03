import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  variant?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = false, variant = 'dark' }) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex items-center space-x-2.5 group select-none">
      {/* Freestanding Bespoke Geometric Streetwear Mark */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 38 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSize} transform group-hover:scale-105 group-hover:-rotate-2 transition-all duration-300 drop-shadow-[0_4px_12px_rgba(139,92,246,0.3)]`}
        >
          <defs>
            {/* Main Gradient: Vivid Violet to Royal Indigo */}
            <linearGradient id="ts-bar-grad" x1="4" y1="6" x2="34" y2="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9333EA" />
              <stop offset="0.5" stopColor="#7C3AED" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>

            {/* Stem Gradient: Deep Indigo to Ultraviolet */}
            <linearGradient id="ts-stem-grad" x1="14" y1="12" x2="24" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A855F7" />
              <stop offset="0.6" stopColor="#7C3AED" />
              <stop offset="1" stopColor="#3730A3" />
            </linearGradient>

            {/* Highlight Sheen */}
            <linearGradient id="ts-sheen" x1="19" y1="6" x2="19" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Aerodynamic Top Crossbar */}
          <path
            d="M5 10C5 7.79086 6.79086 6 9 6H29C31.2091 6 33 7.79086 33 10V11C33 13.2091 31.2091 15 29 15H9C6.79086 15 5 13.2091 5 11V10Z"
            fill="url(#ts-bar-grad)"
          />

          {/* Tapered Central Stem */}
          <path
            d="M14 12H24V28C24 31.3137 21.3137 34 18 34H20C16.6863 34 14 31.3137 14 28V12Z"
            fill="url(#ts-stem-grad)"
          />

          {/* Interlocking Dynamic Facet Cut */}
          <path
            d="M19 6L14 15H19L24 6H19Z"
            fill="url(#ts-sheen)"
          />

          {/* Minimalist Electric Accent Dot */}
          <circle cx="29" cy="10.5" r="1.75" fill="#FFFFFF" className="group-hover:animate-ping" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-baseline leading-none">
          <span className={`${textClass} font-black tracking-[-0.04em] ${variant === 'light' ? 'text-white' : 'text-slate-900'} font-sans`}>
            TECHNI
          </span>
          <span className={`${textClass} font-black tracking-[-0.04em] bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent ml-1`}>
            SHOP
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 ml-1 mb-0.5 group-hover:scale-125 transition-transform" />
        </div>
        {showSubtitle && (
          <span className={`text-[9px] font-black ${variant === 'light' ? 'text-purple-200' : 'text-slate-400'} tracking-[0.22em] uppercase mt-1`}>
            Official Store
          </span>
        )}
      </div>
    </div>
  );
};
