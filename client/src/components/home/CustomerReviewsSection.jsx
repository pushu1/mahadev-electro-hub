import React, { useState, useEffect, useRef } from 'react';
import { Star, MapPin, CheckCircle2, ChevronLeft, ChevronRight, Quote, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { api } from '../../services/api.js';
import { DEFAULT_REVIEWS } from '../../data/defaultProducts.js';

export default function CustomerReviewsSection() {
  const { language } = useLanguage();
  const sliderRef = useRef(null);

  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [loading, setLoading] = useState(false);
  const [tappedId, setTappedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Fetch approved customer reviews from live API
  useEffect(() => {
    let isMounted = true;
    api.getStorefrontReviews()
      .then((res) => {
        if (isMounted && res && res.success && Array.isArray(res.reviews) && res.reviews.length > 0) {
          const approved = res.reviews.filter((r) => r.status === 'APPROVED' && r.isActive !== false);
          if (approved.length > 0) {
            setReviews(approved);
          }
        }
      })
      .catch((err) => {
        console.warn('API notice (using authentic reviews fallback):', err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const displayReviews = reviews.length > 0 ? reviews : DEFAULT_REVIEWS;
  if (!loading && displayReviews.length === 0) return null;

  // Horizontal scroll controls
  const scrollLeft = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.querySelector('[data-review-card]')?.clientWidth || 320;
      sliderRef.current.scrollBy({ left: -(cardWidth + 20), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.querySelector('[data-review-card]')?.clientWidth || 320;
      sliderRef.current.scrollBy({ left: cardWidth + 20, behavior: 'smooth' });
    }
  };

  // Helper for customer initials
  const getInitials = (name) => {
    if (!name) return 'ME';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Multilingual heading content
  const headingText = {
    en: {
      eyebrow: 'VERIFIED CUSTOMER EXPERIENCES',
      heading: 'Real Customers. Real Experiences.',
      subtitle: 'Trusted by farmers, families, and businesses across Rajasthan.',
      verified: 'Verified Buyer',
      tapToClose: 'Tap again to close',
      viewProduct: 'Purchased:',
    },
    hinglish: {
      eyebrow: 'VERIFIED CUSTOMER EXPERIENCES',
      heading: 'Real Customers. Real Experiences.',
      subtitle: 'Rajasthan ke kisano, parivaron aur businesses ka bharosa.',
      verified: 'Verified Buyer',
      tapToClose: 'Band karne ke liye tap karein',
      viewProduct: 'Kharida:',
    },
    hi: {
      eyebrow: 'सत्यापित ग्राहकों के अनुभव',
      heading: 'असली ग्राहक। असली अनुभव।',
      subtitle: 'राजस्थान भर के किसानों, परिवारों और व्यापारियों का अटूट विश्वास।',
      verified: 'सत्यापित खरीदार',
      tapToClose: 'बंद करने के लिए पुनः टैप करें',
      viewProduct: 'खरीदा गया उत्पाद:',
    },
  };

  const content = headingText[language] || headingText.en;

  return (
    <section
      id="customer-reviews"
      aria-label="Verified Customer Experiences"
      className="py-16 md:py-24 bg-[#0B0B0B] border-t border-[#202020] relative overflow-hidden select-none"
    >
      {/* Subtle Ambient Gold Aura */}
      <div className="absolute top-1/2 -left-36 -translate-y-1/2 w-96 h-96 rounded-full bg-[#D6A52A]/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-36 -translate-y-1/2 w-96 h-96 rounded-full bg-[#8A5A16]/[0.05] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================================
            SECTION HEADER: Label, Large Heading, Subtitle & Slider Arrows
            ==================================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-8 sm:mb-10 border-b border-[#202020] gap-4">
          <div className="max-w-2xl">
            {/* Small Gold Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6A52A]/10 border border-[#D6A52A]/30 text-[#D6A52A] text-xs font-extrabold uppercase tracking-widest mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A52A]" />
              <span>{content.eyebrow}</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
              {content.heading}
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-[#A8A8A8] font-normal mt-2 leading-relaxed">
              {content.subtitle}
            </p>
          </div>

          {/* Navigation Arrows for Horizontal Carousel */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Previous Testimonials"
              className="w-10 h-10 rounded-lg bg-[#181818] border border-white/10 hover:border-[#D6A52A] text-white hover:text-[#D6A52A] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Next Testimonials"
              className="w-10 h-10 rounded-lg bg-[#181818] border border-white/10 hover:border-[#D6A52A] text-white hover:text-[#D6A52A] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ====================================================================
            CUSTOMER PHOTO CARDS SLIDER (Square Cards with Hover-to-Reveal)
            - 1:1 Aspect ratio
            - Prominent photo on base state
            - On hover: image zooms, gradient overlay appears, full review reveals
            - On mobile: tap toggles revealed review
            ==================================================================== */}
        <div
          ref={sliderRef}
          className="flex items-stretch gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-4 pt-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayReviews.map((rev) => {
            const isRevealed = tappedId === rev.id || hoveredId === rev.id;
            const hasPhoto = !!rev.customerPhoto;

            return (
              <div
                key={rev.id}
                data-review-card="true"
                onMouseEnter={() => setHoveredId(rev.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  setTappedId(prev => (prev === rev.id ? null : rev.id));
                }}
                className={`snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[340px] lg:w-[calc((100%-60px)/4)] aspect-square relative bg-[#181818] rounded-2xl border transition-all duration-300 overflow-hidden group cursor-pointer shadow-xl ${
                  isRevealed
                    ? 'border-[#D6A52A] shadow-2xl shadow-[#D6A52A]/20'
                    : 'border-white/10 hover:border-[#D6A52A]/90 hover:shadow-2xl hover:shadow-[#D6A52A]/15'
                }`}
              >
                {/* --------------------------------------------------------
                    BASE PHOTO STATE (Default visible)
                    -------------------------------------------------------- */}
                {hasPhoto ? (
                  <img
                    src={rev.customerPhoto}
                    alt={rev.customerName}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.08] ${
                      isRevealed ? 'filter blur-[2px] brightness-50' : 'group-hover:filter group-hover:blur-[2px] group-hover:brightness-50'
                    }`}
                  />
                ) : (
                  /* Tasteful Initials Avatar Placeholder */
                  <div className="w-full h-full bg-gradient-to-br from-[#262626] via-[#1c1c1c] to-[#141414] flex flex-col items-center justify-center p-6 text-center transition-transform duration-700 group-hover:scale-105">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#D6A52A]/20 to-[#F2C75C]/10 border-2 border-[#D6A52A]/50 flex items-center justify-center mb-3 shadow-inner">
                      <span className="font-heading font-black text-2xl text-[#F2C75C] tracking-wider">
                        {getInitials(rev.customerName)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium tracking-wide">
                      Verified Customer
                    </span>
                  </div>
                )}

                {/* Dark Vignette Bottom Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/60 to-transparent pointer-events-none transition-opacity duration-300 ${
                    isRevealed ? 'opacity-0' : 'group-hover:opacity-0'
                  }`}
                  aria-hidden="true"
                />

                {/* Bottom Minimal Overlay (Name, Location, Stars) */}
                {!isRevealed && (
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex flex-col justify-end transition-opacity duration-200 group-hover:opacity-0">
                    {/* Verified Buyer Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/70 border border-[#D6A52A]/40 text-[#D6A52A] text-[10px] font-bold w-fit mb-2 backdrop-blur-md">
                      <CheckCircle2 className="w-3 h-3 text-[#D6A52A]" />
                      <span>{content.verified}</span>
                    </div>

                    {/* Customer Name */}
                    <h3 className="font-heading font-bold text-base sm:text-lg text-white leading-tight drop-shadow-md">
                      {rev.customerName}
                    </h3>

                    {/* Location & Star Rating Row */}
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/10">
                      <div className="flex items-center gap-1 text-xs text-[#C5C5C5]">
                        <MapPin className="w-3 h-3 text-[#D6A52A] shrink-0" />
                        <span className="truncate max-w-[140px] sm:max-w-[170px]">
                          {rev.location || 'Rajasthan'}
                        </span>
                      </div>

                      {/* Star Rating Indicator */}
                      <div className="flex items-center gap-0.5 shrink-0" aria-label={`${rev.rating || 5} out of 5 stars`}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < (rev.rating || 5)
                                ? 'text-[#D6A52A] fill-[#D6A52A]'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------
                    HOVER-TO-REVEAL OVERLAY (Smoothly revealed on hover/tap)
                    -------------------------------------------------------- */}
                <div
                  className={`absolute inset-0 bg-[#0E0E0E]/95 backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 ease-out z-20 ${
                    isRevealed
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto'
                  }`}
                >
                  {/* Top: Stars, Verified Badge & Quote Icon */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (rev.rating || 5)
                                ? 'text-[#D6A52A] fill-[#D6A52A]'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-[#D6A52A] ml-1.5">
                          {(rev.rating || 5).toFixed(1)}
                        </span>
                      </div>
                      <Quote className="w-5 h-5 text-[#D6A52A]/40" />
                    </div>

                    {/* Associated Product Badge */}
                    {(rev.productName || rev.productId) && (
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-[#D6A52A] bg-[#D6A52A]/10 border border-[#D6A52A]/25 px-2.5 py-1 rounded-md mb-2.5 w-fit max-w-full">
                        <ShoppingBag className="w-3 h-3 text-[#D6A52A] shrink-0" />
                        <span className="truncate">
                          {rev.productName || 'Mahadev Solar Product'}
                        </span>
                      </div>
                    )}

                    {/* Review Title */}
                    {rev.title && (
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-white mb-1.5 leading-snug line-clamp-2">
                        "{rev.title}"
                      </h4>
                    )}

                    {/* Full Review Text with Subtle Scroll if long */}
                    <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed italic line-clamp-3 sm:line-clamp-4 max-h-[85px] overflow-y-auto pr-1">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Bottom: Customer Details & Trust Badge */}
                  <div className="pt-3 border-t border-white/10 mt-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block font-heading font-bold text-xs sm:text-sm text-white">
                          {rev.customerName}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-[#A8A8A8] mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-[#D6A52A]" />
                          <span>{rev.location || 'Rajasthan'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#22C55E]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{content.verified}</span>
                        </span>
                        {isTouchDevice && (
                          <span className="block text-[9px] text-gray-400 mt-0.5">
                            {content.tapToClose}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
