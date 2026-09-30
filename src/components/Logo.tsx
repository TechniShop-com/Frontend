import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = false }) => {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  const textClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex items-center space-x-2.5 group select-none">
      {/* Sleek Modern Gradient Emblem */}
      <div className={`relative ${iconSize} rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 p-[1.5px] shadow-md shadow-purple-600/20 group-hover:shadow-purple-600/40 group-hover:scale-105 transition-all duration-300`}>
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden relative">
          {/* Subtle Ambient Glow inside icon */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/25 to-indigo-600/10 pointer-events-none" />
          
          {/* Modern Geometric 'T' & Shopping Vector Mark */}
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Top crossbar */}
            <path
              d="M4.5 7C4.5 6.44772 4.94772 6 5.5 6H18.5C19.0523 6 19.5 6.44772 19.5 7C19.5 7.55228 19.0523 8 18.5 8H5.5C4.94772 8 4.5 7.55228 4.5 7Z"
              fill="url(#logo_grad)"
            />
            {/* Stem */}
            <path
              d="M10.5 7.5V17.5C10.5 18.0523 10.9477 18.5 11.5 18.5H12.5C13.0523 18.5 13.5 18.0523 13.5 17.5V7.5H10.5Z"
              fill="white"
            />
            {/* Purple dot accent */}
            <circle cx="18" cy="7" r="1.5" fill="#C084FC" />
            <defs>
              <linearGradient id="logo_grad" x1="4.5" y1="6" x2="19.5" y2="8" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A855F7" />
                <stop offset="1" stopColor="#818CF8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Typography */}
      <div className="flex flex-col text-left">
        <div className={`${textClass} font-black tracking-tight leading-none flex items-center`}>
          <span className="text-slate-900 tracking-tighter">Techni</span>
          <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent tracking-tight ml-0.5">
            Shop
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Oficjalny Sklep
          </span>
        )}
      </div>
    </div>
  );
};
