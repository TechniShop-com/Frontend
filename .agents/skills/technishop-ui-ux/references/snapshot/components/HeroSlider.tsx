import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideItem {
  id: number;
  imageUrl: string;
  alt: string;
  cloneKey?: string;
}

const SLIDE_IMAGES: SlideItem[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=1920&q=80',
    alt: 'Koszulka T-Shirt Techni Pure Packshot',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1920&q=80',
    alt: 'Bluzy Hoodie i Odzież Techni Flatlay',
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1920&q=80',
    alt: 'Koszulka Polo Techni Classic Studio',
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1920&q=80',
    alt: 'Kolekcja Koszulek Bawełnianych Techni',
  },
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1920&q=80',
    alt: 'Pastelowe Koszulki Polo Techni',
  },
];

export const HeroSlider: React.FC = () => {
  // Index 1 corresponds to SLIDE_IMAGES[0] due to prepended clone
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const isAnimatingRef = useRef(false);

  // Extend slides with clone of last slide at the start and first slide at the end
  const extendedSlides = useMemo<SlideItem[]>(() => {
    const firstClone: SlideItem = { ...SLIDE_IMAGES[0], cloneKey: 'first-clone' };
    const lastClone: SlideItem = { ...SLIDE_IMAGES[SLIDE_IMAGES.length - 1], cloneKey: 'last-clone' };
    return [lastClone, ...SLIDE_IMAGES, firstClone];
  }, []);

  const handleNext = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => Math.min(prev + 1, extendedSlides.length - 1));
  }, [extendedSlides.length]);

  const handlePrev = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleTransitionEnd = () => {
    if (currentIndex === extendedSlides.length - 1) {
      // Reached the clone of the first slide -> snap to real first slide (index 1)
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      // Reached the clone of the last slide -> snap to real last slide
      setIsTransitioning(false);
      setCurrentIndex(SLIDE_IMAGES.length);
    }
    isAnimatingRef.current = false;
  };

  const handleDotClick = (idx: number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex(idx + 1);
  };

  // Auto-scroll every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [handleNext]);

  // Compute which original slide dot is currently active
  const activeDotIndex =
    currentIndex === 0
      ? SLIDE_IMAGES.length - 1
      : currentIndex === extendedSlides.length - 1
      ? 0
      : currentIndex - 1;

  return (
    <div
      className="relative w-full h-[530px] sm:h-[620px] lg:h-[680px] rounded-3xl overflow-hidden shadow-xl shadow-purple-950/15 border border-[#E2DDD3] bg-[#060e1e] group select-none"
    >
      {/* Infinite Seamless Carousel Track */}
      <div
        onTransitionEnd={handleTransitionEnd}
        className={`flex h-full w-full ${
          isTransitioning ? 'transition-transform duration-300 ease-out' : ''
        }`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {extendedSlides.map((slide, index) => (
          <div
            key={slide.cloneKey || `slide-${slide.id}-${index}`}
            className="w-full h-full flex-shrink-0 relative"
          >
            <img
              src={slide.imageUrl}
              alt={slide.alt}
              className="w-full h-full object-cover object-center"
            />
            {/* Dark & Purple gradient for contrast and readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#060e1e]/90 via-[#060e1e]/55 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060e1e]/70 via-transparent to-[#060e1e]/40" />
          </div>
        ))}
      </div>

      {/* OVERLAY CONTENT (Left-Aligned Directly on Slider) */}
      <div className="absolute inset-0 z-20 flex items-center justify-start p-6 sm:p-12 lg:p-16 pointer-events-none">
        <div className="max-w-xl text-left space-y-3.5 pointer-events-auto">
          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Odkryj Oryginalny{' '}
            <span className="bg-gradient-to-r from-purple-300 via-purple-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.7)]">
              Styl Techni
            </span>
          </h1>

          {/* Subtitle / Description */}
          <p className="text-slate-200 text-xs sm:text-sm lg:text-base leading-relaxed font-medium drop-shadow-md">
            Oficjalna odzież, akcesoria i gadżety stworzone dla społeczności Techni Schools oraz Techni Zdalni. Najwyższa jakość materiałów, nowoczesny design i wygoda na co dzień.
          </p>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        aria-label="Poprzedni slajd"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-white/90 backdrop-blur-md border border-white/30 text-white hover:text-purple-900 flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        aria-label="Następny slajd"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-white/90 backdrop-blur-md border border-white/30 text-white hover:text-purple-900 flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Simple Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2.5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/15">
        {SLIDE_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            aria-label={`Przejdź do slajdu ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === activeDotIndex
                ? 'w-7 h-2.5 bg-purple-500 shadow-md shadow-purple-500/50'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
