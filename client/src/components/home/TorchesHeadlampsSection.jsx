import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flashlight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import ProductCard from '../common/ProductCard.jsx';
import { api } from '../../services/api.js';
import { DEFAULT_TORCHES_HEADLAMPS_PRODUCTS } from '../../data/defaultProducts.js';

export default function TorchesHeadlampsSection({ initialProducts = [] }) {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState(initialProducts.length > 0 ? initialProducts : DEFAULT_TORCHES_HEADLAMPS_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect accessibility preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Fetch Torches & Headlamps mixed products dynamically from API
  const fetchProducts = useCallback(() => {
    api.getProducts({ category: 'torches,headlamps' })
      .then(res => {
        if (res && res.success && Array.isArray(res.products)) {
          const activeOnly = res.products.filter(p => p.status !== 'INACTIVE');
          setProducts(activeOnly);
        }
      })
      .catch((err) => {
        console.warn('Could not load torches & headlamps products, using fallback:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();

    // Dynamically update when changed in Admin Panel, tab gains focus, or storage event
    window.addEventListener('meh_products_updated', fetchProducts);
    window.addEventListener('focus', fetchProducts);
    window.addEventListener('storage', fetchProducts);

    return () => {
      window.removeEventListener('meh_products_updated', fetchProducts);
      window.removeEventListener('focus', fetchProducts);
      window.removeEventListener('storage', fetchProducts);
    };
  }, [fetchProducts]);

  // Sync initialProducts if passed later
  useEffect(() => {
    if (initialProducts.length > 0 && products.length === 0) {
      setProducts(initialProducts);
      setLoading(false);
    }
  }, [initialProducts, products.length]);

  const fallbackList = initialProducts.length > 0 ? initialProducts : DEFAULT_TORCHES_HEADLAMPS_PRODUCTS;
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

  // Duplicate sequence ONLY for visual infinite continuity without duplicate database records
  const displayItems = [...baseSequence, ...baseSequence];

  // Dynamic animation duration: ~4.5 seconds per card for smooth, readable drift
  const animationDuration = Math.max(26, baseSequence.length * 4.5);

  const headingTitle = language === 'hi'
    ? 'टॉर्च व हेडलैंप'
    : 'Torches & Headlamps';

  const subtitleText = language === 'hi'
    ? 'खेती, सुरक्षा और आउटडोर उपयोग के लिए शक्तिशाली लाइटिंग समाधान'
    : 'Powerful Lighting Solutions for Farming, Security & Outdoor Adventures';

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
      aria-label="Torches & Headlamps"
      className="py-12 md:py-16 bg-[#F3F0E6] border-t border-b border-[#E2E6DC] select-none relative overflow-hidden"
    >
      {/* Subtle Ambient Glow Matching Organic Palette */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#A8BFA3]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#DCE8D5]/25 blur-3xl pointer-events-none" />

      {/* Main Container: Exact same max-w-7xl, margins, and padding as Shop by Category, Featured, and New Arrivals */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header: Aligned with standard section header boundaries */}
        <div className="flex items-center justify-between pb-4 mb-6 md:mb-8 border-b border-[#E2E6DC]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#355E3B] uppercase tracking-wider">
                <Flashlight className="w-3.5 h-3.5 text-[#355E3B]" />
                High-Lumen Illumination • Night Vigilance
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-extrabold text-[#26352A] tracking-tight">
              {headingTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#50574F] mt-1 font-medium">
              {subtitleText}
            </p>
          </div>

          <Link
            to="/shop?category=torches,headlamps"
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
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {displayItems.map((product, idx) => {
              const isFirstHalf = idx < baseSequence.length;
              const uniqueKey = `th-${product.id}-${isFirstHalf ? 'a' : 'b'}-${idx}`;

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
