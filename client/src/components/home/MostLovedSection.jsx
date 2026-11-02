import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

// 4 Authentic Products using the supplied original high-res PNG images
const PRODUCTS = [
  {
    id: 'zatka-machine-5km',
    title: 'Zatka Machine — 5KM Fencing Power',
    image: '/images/best-sellers/Zatka machine- 5km fencing power.png',
    link: '/product/mahadev-5km-heavy-duty-solar-zatka-machine',
    alt: 'Zatka Machine — 5KM Fencing Power',
  },
  {
    id: 'farming-torch',
    title: 'Farming Torch — 100W Long Range',
    image: '/images/best-sellers/farming torch.png',
    link: '/product/mahadev-100w-kisan-laser-torch',
    alt: 'Farming Torch — 100W Long Range',
  },
  {
    id: 'solar-street-light',
    title: 'Solar Street Light — 120W All-In-One',
    image: '/images/best-sellers/Solar street light-Factory.png',
    link: '/product/mahadev-120w-all-in-one-solar-street-light',
    alt: 'Solar Street Light — 120W All-In-One',
  },
  {
    id: 'bike-lights',
    title: 'Bike Lights — Dual-Color Fog Lights',
    image: '/images/best-sellers/Bike lights.png',
    link: '/product/mahadev-dual-color-owl-eye-bike-fog-lights-pair',
    alt: 'Bike Lights — Dual-Color Fog Lights',
  },
];

export default function MostLovedSection() {
  const { language } = useLanguage();
  const trackRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(175);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect accessibility preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Dynamically detect header height so the sticky pin aligns seamlessly below navbar
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  // Measure scroll progress through the pinned track (optimized requestAnimationFrame with IntersectionObserver)
  useEffect(() => {
    let ticking = false;
    let rafId = null;
    let isTrackInView = false;

    const calculateProgress = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const stickyHeight = windowHeight - headerHeight;
      const totalScrollable = rect.height - stickyHeight;

      if (totalScrollable <= 0) {
        setScrollProgress(0);
        ticking = false;
        return;
      }

      // Distance the top of the track has scrolled past the header bottom
      const scrolled = headerHeight - rect.top;
      const rawProgress = scrolled / totalScrollable;
      const clamped = Math.max(0, Math.min(1, rawProgress));

      setScrollProgress(prev => {
        // Prevent state update & re-render if delta is microscopic
        if (Math.abs(prev - clamped) < 0.002) return prev;
        return clamped;
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!isTrackInView) return;
      if (!ticking) {
        rafId = window.requestAnimationFrame(calculateProgress);
        ticking = true;
      }
    };

    // IntersectionObserver to only bind active scroll calculations when track is near/in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isTrackInView = entry.isIntersecting;
        if (isTrackInView) {
          calculateProgress();
        }
      },
      { threshold: 0, rootMargin: '250px 0px 250px 0px' }
    );

    if (trackRef.current) {
      observer.observe(trackRef.current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    calculateProgress();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [headerHeight]);

  // Desktop step interpolation:
  // Stage 1 (0.00 - 0.20): Card 1 slides in from left and settles.
  // Stage 2 (0.20 - 0.40): Card 2 slides in from bottom and settles. Card 1 remains.
  // Stage 3 (0.40 - 0.60): Card 3 slides in from bottom and settles. Cards 1 & 2 remain.
  // Stage 4 (0.60 - 0.80): Card 4 slides in from right and settles. All 4 cards visible together!
  // Plateau (0.80 - 1.00): Stable interactive viewing window, then naturally releases to next section.
  const getDesktopCardStyle = (index) => {
    if (reducedMotion) {
      return { opacity: 1, transform: 'none', pointerEvents: 'auto' };
    }

    const stages = [
      { start: 0.00, end: 0.20, type: 'left' },
      { start: 0.20, end: 0.40, type: 'up' },
      { start: 0.40, end: 0.60, type: 'up' },
      { start: 0.60, end: 0.80, type: 'right' },
    ];

    const stage = stages[index];
    const p = scrollProgress;

    if (p < stage.start) {
      if (stage.type === 'left') {
        return { opacity: 0, transform: 'translateX(-60px)', pointerEvents: 'none' };
      }
      if (stage.type === 'right') {
        return { opacity: 0, transform: 'translateX(60px)', pointerEvents: 'none' };
      }
      return { opacity: 0, transform: 'translateY(50px)', pointerEvents: 'none' };
    }

    if (p >= stage.start && p < stage.end) {
      const fraction = (p - stage.start) / (stage.end - stage.start);
      const eased = Math.min(1, Math.max(0, fraction));

      let transformValue = 'none';
      if (stage.type === 'left') {
        transformValue = `translateX(${(1 - eased) * -60}px)`;
      } else if (stage.type === 'right') {
        transformValue = `translateX(${(1 - eased) * 60}px)`;
      } else {
        transformValue = `translateY(${(1 - eased) * 50}px)`;
      }

      return {
        opacity: eased,
        transform: transformValue,
        pointerEvents: eased > 0.5 ? 'auto' : 'none',
      };
    }

    // Fully settled in position; stays visible for all subsequent stages
    return {
      opacity: 1,
      transform: 'translate(0, 0)',
      pointerEvents: 'auto',
    };
  };

  // Mobile active card determination (One card visible at a time with smooth transitions)
  const getMobileActiveIndex = () => {
    if (scrollProgress < 0.25) return 0;
    if (scrollProgress < 0.50) return 1;
    if (scrollProgress < 0.75) return 2;
    return 3;
  };

  const mobileActiveIndex = getMobileActiveIndex();

  const titleText = language === 'hi'
    ? 'सर्वाधिक पसंद किए गए उत्पाद'
    : language === 'hinglish'
    ? 'MOST LOVED BY PEOPLE'
    : 'MOST LOVED BY PEOPLE';

  const subtitleText = language === 'hi'
    ? 'शक्तिशाली उत्पाद। विश्वसनीय प्रदर्शन।'
    : language === 'hinglish'
    ? 'Shaktishali Products. Vishwasniya Performance.'
    : 'Powerful Products. Trusted Performance.';

  const ctaButtonText = language === 'hi'
    ? 'अभी देखें'
    : language === 'hinglish'
    ? 'EXPLORE KAREIN'
    : 'EXPLORE NOW';

  return (
    <section
      ref={trackRef}
      aria-label="Most Loved By People"
      className="relative w-full h-[180vh] lg:h-[190vh] bg-[#FAF9F6] select-none overflow-visible"
    >
      {/* Ambient Sage and Mint glow accents */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#356B3D]/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#DCE8D5]/35 blur-3xl pointer-events-none" />

      {/* ======================================================================
          STICKY VIEWPORT CONTAINER
          Pins securely below the sticky header while user scrolls through all 4 stages.
          Unpins naturally at progress 1.0 so page continues smoothly to the next section.
          ====================================================================== */}
      <div
        style={{
          top: `${headerHeight}px`,
          height: `calc(100vh - ${headerHeight}px)`,
        }}
        className="sticky w-full flex flex-col justify-between py-4 sm:py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden z-20"
      >
        {/* ====================================================================
            1. SECTION HEADER: Centered Title & Subtitle
            ==================================================================== */}
        <div className="w-full text-center shrink-0 mb-3 sm:mb-5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tight text-[#171C17]">
            {titleText}
          </h2>
          <p className="text-xs sm:text-sm text-[#252A25] font-medium mt-1">
            {subtitleText}
          </p>
        </div>

        {/* ====================================================================
            2. DESKTOP LAYOUT (>= 1024px)
            Clean, Square-Box Rectangular Cards with Sage Border
            Inner image keeps rounded corners. Forest green buttons.
            Animated in sequence with page scroll!
            ==================================================================== */}
        <div className="hidden lg:grid grid-cols-4 gap-4 xl:gap-6 w-full max-w-7xl mx-auto my-auto items-stretch">
          {PRODUCTS.map((item, idx) => {
            const motionStyle = getDesktopCardStyle(idx);

            return (
              <div
                key={item.id}
                style={motionStyle}
                className="w-full h-full transition-transform will-change-transform"
              >
                {/* Rectangular Card Container */}
                <div
                  className="relative w-full h-full p-3.5 sm:p-4 rounded-xl bg-[#FFFFFF] border border-[#D5DDD2] hover:border-[#24532F] shadow-md hover:shadow-xl transition-all duration-300 ease-out flex flex-col justify-between group cursor-pointer hover:scale-[1.02]"
                >
                  {/* Image Container with rounded corners ONLY on the product image */}
                  <Link
                    to={item.link}
                    className="block relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F3F0E6] border border-[#D5DDD2] mb-3.5 group-hover:border-[#24532F] transition-colors"
                    title={item.title}
                  >
                    <img
                      src={encodeURI(item.image)}
                      alt={item.alt}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 select-none pointer-events-none"
                      loading="eager"
                      decoding="async"
                    />
                  </Link>

                  {/* Rectangular Forest Green Button: "EXPLORE NOW →" */}
                  <Link
                    to={item.link}
                    className="w-full h-11 inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-[#24532F] hover:bg-[#183D22] text-[#FFFFFF] font-heading font-extrabold text-xs tracking-wider uppercase shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 group/btn"
                  >
                    <span>{ctaButtonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ====================================================================
            3. MOBILE LAYOUT (< 1024px)
            One Image at a Time: Stage 1 -> 2 -> 3 -> 4
            ==================================================================== */}
        <div className="lg:hidden relative w-full max-w-[320px] xs:max-w-[350px] sm:max-w-[400px] mx-auto my-auto min-h-[400px] xs:min-h-[440px] flex items-center justify-center">
          {PRODUCTS.map((item, idx) => {
            const isActive = mobileActiveIndex === idx;
            const isPrev = idx < mobileActiveIndex;
            const isNext = idx > mobileActiveIndex;

            let motionClass = 'opacity-0 scale-95 pointer-events-none z-0';
            if (isActive) {
              motionClass = 'opacity-100 scale-100 translate-x-0 z-10 pointer-events-auto';
            } else if (isPrev) {
              motionClass = 'opacity-0 -translate-x-12 scale-95 pointer-events-none z-0';
            } else if (isNext) {
              motionClass = 'opacity-0 translate-x-12 scale-95 pointer-events-none z-0';
            }

            return (
              <div
                key={item.id}
                className={`absolute inset-0 w-full h-full transition-all duration-500 ease-out ${motionClass}`}
                aria-hidden={!isActive}
              >
                {/* Mobile Rectangular Card Frame */}
                <div className="w-full h-full p-3.5 xs:p-4 rounded-xl bg-[#FFFFFF] border border-[#D5DDD2] shadow-lg flex flex-col justify-between">
                  {/* Product Image Container */}
                  <Link
                    to={item.link}
                    className="block relative aspect-square w-full rounded-xl xs:rounded-2xl overflow-hidden bg-[#F3F0E6] border border-[#D5DDD2] mb-3.5"
                    title={item.title}
                  >
                    <img
                      src={encodeURI(item.image)}
                      alt={item.alt}
                      className="w-full h-full object-cover select-none pointer-events-none"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </Link>

                  {/* Full-Width Mobile Forest Green Button */}
                  <Link
                    to={item.link}
                    className="w-full h-11 inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-[#24532F] hover:bg-[#183D22] text-[#FFFFFF] font-heading font-extrabold text-xs tracking-wider uppercase shadow-sm active:scale-95"
                  >
                    <span>{ctaButtonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll hint & stage progress indicator */}
        <div className="text-center shrink-0 pt-1 flex items-center justify-center gap-2 text-[11px] text-[#596358] font-medium">
          <span className="inline-block animate-bounce text-[#24532F]">↓</span>
          <span>Scroll to explore best sellers ({Math.round(scrollProgress * 100)}%)</span>
        </div>
      </div>
    </section>
  );
}
