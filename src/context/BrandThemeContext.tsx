import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrandType } from '../types';

interface BrandThemeContextType {
  activeBrand: BrandType;
  setActiveBrand: (brand: BrandType) => void;
  brandStyles: {
    navbarBg: string;
    brandColor: string;
    accentColor: string;
    badgeBg: string;
    heroGradient: string;
    buttonBg: string;
    hoverBorder: string;
    brandTitle: string;
  };
}

const BrandThemeContext = createContext<BrandThemeContextType | undefined>(undefined);

export const BrandThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBrand, setActiveBrand] = useState<BrandType>('ALL');

  useEffect(() => {
    // Persist brand choice in localStorage if needed
    const saved = localStorage.getItem('technishop_active_brand');
    if (saved && (saved === 'TECHNI_SCHOOLS' || saved === 'TECHNI_ZDALNI' || saved === 'ALL')) {
      setActiveBrand(saved as BrandType);
    }
  }, []);

  const handleSetBrand = (brand: BrandType) => {
    setActiveBrand(brand);
    localStorage.setItem('technishop_active_brand', brand);
  };

  const getStyles = () => {
    if (activeBrand === 'TECHNI_ZDALNI') {
      return {
        navbarBg: 'bg-slate-950 text-white border-b border-cyan-500/30',
        brandColor: 'text-cyan-400',
        accentColor: 'text-purple-400',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
        heroGradient: 'from-slate-950 via-slate-900 to-cyan-950',
        buttonBg: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30',
        hoverBorder: 'hover:border-cyan-400',
        brandTitle: 'Techni Zdalni',
      };
    }
    if (activeBrand === 'TECHNI_SCHOOLS') {
      return {
        navbarBg: 'bg-techni-navy text-white border-b border-emerald-500/30',
        brandColor: 'text-emerald-400',
        accentColor: 'text-emerald-500',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
        heroGradient: 'from-techni-navy via-slate-900 to-emerald-950',
        buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30',
        hoverBorder: 'hover:border-emerald-400',
        brandTitle: 'Techni Schools',
      };
    }
    // Default ALL
    return {
      navbarBg: 'bg-slate-900 text-white border-b border-gray-800',
      brandColor: 'text-emerald-400',
      accentColor: 'text-cyan-400',
      badgeBg: 'bg-gray-800 text-gray-200 border border-gray-700',
      heroGradient: 'from-slate-950 via-techni-navy to-slate-900',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30',
      hoverBorder: 'hover:border-emerald-500',
      brandTitle: 'Wszystkie Marki',
    };
  };

  return (
    <BrandThemeContext.Provider
      value={{
        activeBrand,
        setActiveBrand: handleSetBrand,
        brandStyles: getStyles(),
      }}
    >
      {children}
    </BrandThemeContext.Provider>
  );
};

export const useBrandTheme = () => {
  const context = useContext(BrandThemeContext);
  if (!context) {
    throw new Error('useBrandTheme must be used within BrandThemeProvider');
  }
  return context;
};
