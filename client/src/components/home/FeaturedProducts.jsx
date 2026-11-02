import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import ProductCard from '../common/ProductCard.jsx';
import { api } from '../../services/api.js';
import { DEFAULT_FEATURED_PRODUCTS } from '../../data/defaultProducts.js';

export default function FeaturedProducts({ products: initialProducts = [] }) {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState(initialProducts.length > 0 ? initialProducts : DEFAULT_FEATURED_PRODUCTS);
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

  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    api.getProducts({ featured: 'true' })
      .then(res => {
        if (res && res.success && Array.isArray(res.products) && res.products.length > 0) {
          setProducts(res.products);
        } else {
          // Fallback to general active products if no featured flag
          return api.getProducts({ limit: 8 });
        }
      })
      .then(res => {
        if (res && res.success && Array.isArray(res.products)) {
          setProducts(res.products.slice(0, 8));
        }
      })
      .catch(err => {
        console.warn('Could not load featured products:', err);
      })
      .finally(() => setLoading(false));
  }, [initialProducts]);

  const fallbackList = initialProducts.length > 0 ? initialProducts : DEFAULT_FEATURED_PRODUCTS;
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
    ? 'चुनिंदा उत्पाद'
    : (language === 'hinglish' ? 'Featured Products' : 'Featured Products');
  const tagTitle = language === 'hi'
    ? 'शीर्ष चुनिंदा गुणवत्ता'
    : 'TOP HANDPICKED QUALITY';

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
      aria-label="Featured Products"
      className="py-12 md:py-16 bg-[#0c0c0c]/90 border-t border-b border-[#383838] select-none relative overflow-hidden"
    >
      {/* Subtle Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#501B28]/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#8A5A16]/20 blur-3xl pointer-events-none" />

      {/* Main Container: Exact same max-w-7xl, margins, and padding as Shop by Category */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header: Aligned with Shop by Category header boundaries */}
        <div className="flex items-center justify-between pb-4 mb-6 md:mb-8 border-b border-[#383838]">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#D6A52A] block mb-1">
              {tagTitle}
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-extrabold text-white tracking-tight">
              {headingTitle}
            </h2>
          </div>

          <Link
            to="/shop?featured=true"
            className="text-xs md:text-sm font-bold text-[#D6A52A] hover:text-[#E5B93B] flex items-center gap-1.5 transition-colors group shrink-0"
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
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-[#0c0c0c]/80 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-[#0c0c0c]/80 to-transparent" />

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
              const uniqueKey = `feat-${product.id}-${isFirstHalf ? 'a' : 'b'}-${idx}`;

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
