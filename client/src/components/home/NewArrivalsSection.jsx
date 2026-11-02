import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import ProductCard from '../common/ProductCard.jsx';
import { api } from '../../services/api.js';
import { DEFAULT_NEW_ARRIVALS } from '../../data/defaultProducts.js';

export default function NewArrivalsSection({ initialProducts = [] }) {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState(initialProducts.length > 0 ? initialProducts : DEFAULT_NEW_ARRIVALS);
  const [config, setConfig] = useState({
    title_en: 'New Arrivals',
    title_hi: 'नए उत्पाद',
    subtitle_en: 'Discover Our Latest Products',
    subtitle_hi: 'हमारे नवीनतम उत्पाद देखें',
    displayLimit: 12
  });
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef(null);

  // Viewport IntersectionObserver to pause animation when offscreen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold: 0.05, rootMargin: '100px 0px 100px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Detect accessibility preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Fetch configured products from Admin CMS
  const fetchNewArrivals = useCallback(() => {
    api.getNewArrivals()
      .then(res => {
        if (res && res.success) {
          if (res.config) {
            setConfig(prev => ({ ...prev, ...res.config }));
          }
          if (Array.isArray(res.products) && res.products.length > 0) {
            const activeOnly = res.products.filter(p => p.status !== 'INACTIVE' && p.newArrivalEnabled !== false);
            if (activeOnly.length > 0) {
              setProducts(activeOnly);
              return;
            }
          }
        }
        // Fallback: If no CMS items configured, fetch newest products from catalog
        return api.getProducts({ sort: 'newest', limit: 12 });
      })
      .then(res => {
        if (res && res.success && Array.isArray(res.products) && res.products.length > 0) {
          setProducts(res.products.filter(p => p.status !== 'INACTIVE'));
        }
      })
      .catch((err) => {
        console.warn('Could not load new arrivals config, falling back to initial data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchNewArrivals();

    // Dynamically update when changed in Admin Panel or when tab gains focus
    window.addEventListener('meh_new_arrivals_updated', fetchNewArrivals);
    window.addEventListener('focus', fetchNewArrivals);
    window.addEventListener('storage', fetchNewArrivals);

    return () => {
      window.removeEventListener('meh_new_arrivals_updated', fetchNewArrivals);
      window.removeEventListener('focus', fetchNewArrivals);
      window.removeEventListener('storage', fetchNewArrivals);
    };
  }, [fetchNewArrivals]);

  // Sync initialProducts if passed later
  useEffect(() => {
    if (initialProducts.length > 0 && products.length === 0) {
      setProducts(initialProducts);
      setLoading(false);
    }
  }, [initialProducts, products.length]);

  const fallbackList = initialProducts.length > 0 ? initialProducts : DEFAULT_NEW_ARRIVALS;
  const activeProducts = products.length > 0 ? products : fallbackList;
  const rawActive = activeProducts.filter(p => p.status !== 'INACTIVE');
  if (!loading && rawActive.length === 0) {
    return null;
  }

  // Ensure minimum items in base sequence so visual track spans wider than screen on any monitor
  let baseSequence = [...rawActive];
  if (baseSequence.length > 0) {
    while (baseSequence.length < 8) {
      baseSequence = [...baseSequence, ...rawActive];
    }
  }

  // Duplicate sequence ONLY for visual infinite continuity
  const displayItems = [...baseSequence, ...baseSequence];

  // Dynamic animation duration: ~4.5 seconds per card for smooth, readable drift
  const animationDuration = Math.max(28, baseSequence.length * 4.5);

  const headingTitle = language === 'hi'
    ? (config.title_hi || 'नए उत्पाद')
    : (config.title_en || 'New Arrivals');

  const subtitleText = language === 'hi'
    ? (config.subtitle_hi || 'हमारे नवीनतम उत्पाद देखें')
    : (config.subtitle_en || 'Discover Our Latest Products');

  const handleTouchStart = () => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsPaused(false);
    }, 1500);
  };

  return (
    <section
      ref={sectionRef}
      aria-label="New Arrivals"
      className="py-12 md:py-16 bg-[#F3F0E6] border-t border-b border-[#E2E6DC] select-none relative overflow-hidden"
    >
      {/* Subtle Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#A8BFA3]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#DCE8D5]/25 blur-3xl pointer-events-none" />

      {/* Main Container: Exact same max-w-7xl, margins, and padding as Shop by Category */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header: Aligned with Shop by Category header boundaries */}
        <div className="flex items-center justify-between pb-4 mb-6 md:mb-8 border-b border-[#E2E6DC]">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-extrabold text-[#26352A] tracking-tight">
              {headingTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#50574F] mt-1 font-medium">
              {subtitleText}
            </p>
          </div>

          <Link
            to="/shop?sort=newest"
            className="text-xs md:text-sm font-bold text-[#355E3B] hover:text-[#294A30] flex items-center gap-1.5 transition-colors group shrink-0"
          >
            <span>{t('viewAll') || 'View All'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        {/* Continuous Automatic Marquee Slider Container — Strictly contained within max-w-7xl */}
        <div
          className="w-full overflow-hidden relative continuous-marquee-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Edge gradient masks inside the container boundaries */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-[#F3F0E6] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-[#F3F0E6] to-transparent" />

          {/* Marquee Track: Translates continuously from 0% to -50% without jump */}
          <div
            className="continuous-marquee-track flex gap-4 md:gap-6 w-max will-change-transform py-2"
            style={{
              animationName: reducedMotion ? 'none' : 'continuousMarquee',
              animationDuration: `${animationDuration}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationPlayState: (isPaused || !isInView) ? 'paused' : 'running',
            }}
          >
            {displayItems.map((product, idx) => {
              const isFirstHalf = idx < baseSequence.length;
              const uniqueKey = `arr-${product.id}-${isFirstHalf ? 'a' : 'b'}-${idx}`;

              return (
                <div
                  key={uniqueKey}
                  className="w-[240px] xs:w-[260px] sm:w-[280px] lg:w-[286px] shrink-0 flex flex-col justify-between"
                >
                  <ProductCard product={product} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
