import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Direct mapping to the supplied high-resolution category banner images from collection
const CATEGORY_IMAGE_MAP = {
  'torches': '/images/categories/torches.png',
  'zatka-machines': '/images/categories/zatka-machines.png',
  'solar-street-lights': '/images/categories/solar-street-lights.png',
  'headlamps': '/images/categories/headlamps.png',
  'small-pocket-torches': '/images/categories/small-pocket-torches.png',
  'rechargeable-fans': '/images/categories/rechargeable-fans.png',
  'bike-lights': '/images/categories/bike-lights.png',
  'solar-dc-products': '/images/categories/solar-dc-products.png',
};

const getCategoryImage = (cat) => {
  if (!cat) return '/images/logo.png';
  if (cat.slug && CATEGORY_IMAGE_MAP[cat.slug]) {
    return CATEGORY_IMAGE_MAP[cat.slug];
  }
  const cleanId = (cat.id || '').replace(/^cat-/, '');
  if (CATEGORY_IMAGE_MAP[cleanId]) {
    return CATEGORY_IMAGE_MAP[cleanId];
  }
  return cat.image || '/images/logo.png';
};

export default function CategoryGrid({ categories = [] }) {
  const { t, language, getProductText } = useLanguage();

  const sectionRef = useRef(null);
  const sliderRef = useRef(null);
  const posRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const isInitializedRef = useRef(false);

  const isVisibleRef = useRef(false);
  const isHoveredRef = useRef(false);
  const isInteractingRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Keep refs synchronized with state
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    isInteractingRef.current = isInteracting;
  }, [isInteracting]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  // Mouse / Touch drag refs for seamless gesture control
  const isMouseDownRef = useRef(false);
  const mouseStartXRef = useRef(0);
  const mouseStartScrollRef = useRef(0);
  const touchStartXRef = useRef(0);
  const touchStartScrollRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const interactionTimeoutRef = useRef(null);

  // Check accessibility reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // IntersectionObserver: automatically start running when visible
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05, rootMargin: '50px 0px 50px 0px' }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [categories.length]);

  // Measure single set width accurately based on DOM positions
  const measureSetWidth = useCallback(() => {
    const container = sliderRef.current;
    if (!container || !categories || categories.length === 0) return;

    const cards = container.children;
    const catCount = categories.length;

    if (cards.length >= catCount * 2) {
      const firstCard = cards[0];
      const secondSetFirstCard = cards[catCount];
      if (firstCard && secondSetFirstCard) {
        const width = secondSetFirstCard.offsetLeft - firstCard.offsetLeft;
        if (width > 0) {
          singleSetWidthRef.current = width;

          // Initialize scroll to the second set (Set 1) so user can scroll left or right infinitely
          if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            posRef.current = width;
            container.scrollLeft = width;
          }
        }
      }
    }
  }, [categories]);

  useEffect(() => {
    // Initial measurement after render
    const timer = setTimeout(measureSetWidth, 80);

    const handleResize = () => {
      measureSetWidth();
    };
    window.addEventListener('resize', handleResize);

    let ro;
    if (window.ResizeObserver && sliderRef.current) {
      ro = new ResizeObserver(() => {
        measureSetWidth();
      });
      ro.observe(sliderRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, [measureSetWidth]);

  // Continuous auto-running animation loop via requestAnimationFrame
  useEffect(() => {
    const container = sliderRef.current;
    if (!container || categories.length === 0) return;

    let animId;
    let lastTime = null;
    const speed = 45; // pixels per second

    const tick = (now) => {
      if (lastTime === null) lastTime = now;
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Auto-run only when visible, not hovered on desktop, not actively interacting, and no reduced motion
      if (isVisibleRef.current && !isHoveredRef.current && !isInteractingRef.current && !reducedMotionRef.current) {
        const singleWidth = singleSetWidthRef.current;
        if (singleWidth > 0) {
          posRef.current += speed * delta;

          // Seamless infinite forward wrap without any visual jump
          if (posRef.current >= singleWidth * 2) {
            posRef.current -= singleWidth;
          }

          container.scrollLeft = posRef.current;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [categories.length]);

  // Handle native scroll & seamless wrap during user touch/drag interaction
  const handleScroll = () => {
    const container = sliderRef.current;
    const singleWidth = singleSetWidthRef.current;
    if (!container || singleWidth <= 0) return;

    const currentScroll = container.scrollLeft;

    if (isInteracting) {
      posRef.current = currentScroll;
      // Seamless wrap while dragging/swiping
      if (currentScroll >= singleWidth * 2) {
        posRef.current = currentScroll - singleWidth;
        container.scrollLeft = posRef.current;
      } else if (currentScroll <= 10) {
        posRef.current = currentScroll + singleWidth;
        container.scrollLeft = posRef.current;
      }
    }
  };

  // Desktop Hover Handlers (Pause on hover, resume on leave)
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    setIsHovered(false);
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      isInteractingRef.current = false;
      setIsInteracting(false);
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    }
  };

  // Mobile Touch Gestures (Swipe smoothly, continue auto-running afterwards)
  const handleTouchStart = (e) => {
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    isInteractingRef.current = true;
    setIsInteracting(true);
    hasDraggedRef.current = false;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartScrollRef.current = sliderRef.current ? sliderRef.current.scrollLeft : 0;
    posRef.current = touchStartScrollRef.current;
  };

  const handleTouchMove = (e) => {
    if (!sliderRef.current) return;
    const currentX = e.touches[0].clientX;
    const deltaX = touchStartXRef.current - currentX;
    if (Math.abs(deltaX) > 6) {
      hasDraggedRef.current = true;
    }
    sliderRef.current.scrollLeft = touchStartScrollRef.current + deltaX;
    posRef.current = sliderRef.current.scrollLeft;
  };

  const handleTouchEnd = () => {
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    // Allow touch momentum to settle before resuming automatic scroll smoothly
    interactionTimeoutRef.current = setTimeout(() => {
      if (sliderRef.current) {
        posRef.current = sliderRef.current.scrollLeft;
      }
      isInteractingRef.current = false;
      setIsInteracting(false);
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 150);
    }, 1200);
  };

  // Desktop Mouse Drag Support
  const handleMouseDown = (e) => {
    if (e.button !== 0 || !sliderRef.current) return;
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    isMouseDownRef.current = true;
    isInteractingRef.current = true;
    hasDraggedRef.current = false;
    mouseStartXRef.current = e.pageX - sliderRef.current.offsetLeft;
    mouseStartScrollRef.current = sliderRef.current.scrollLeft;
    setIsInteracting(true);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = x - mouseStartXRef.current;
    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }
    sliderRef.current.scrollLeft = mouseStartScrollRef.current - walk;
    posRef.current = sliderRef.current.scrollLeft;
  };

  const handleMouseUp = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      if (sliderRef.current) {
        posRef.current = sliderRef.current.scrollLeft;
      }
      setTimeout(() => {
        isInteractingRef.current = false;
        setIsInteracting(false);
        setTimeout(() => {
          hasDraggedRef.current = false;
        }, 120);
      }, 80);
    }
  };

  // Prevent link navigation if the action was a swipe/drag
  const handleCardClick = (e) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!categories || categories.length === 0) return null;

  // Triplicate the categories (Set 0, Set 1, Set 2) to ensure a truly infinite, glitch-free loop
  const displayItems = [
    ...categories.map((c) => ({ ...c, _key: `s0-${c.id}` })),
    ...categories.map((c) => ({ ...c, _key: `s1-${c.id}` })),
    ...categories.map((c) => ({ ...c, _key: `s2-${c.id}` })),
  ];

  return (
    <section
      ref={sectionRef}
      className="py-12 md:py-16 bg-[#0a0a0a]/90 relative overflow-hidden"
      aria-label="Shop by Category Slider"
    >
      {/* Container aligned and matching Most Loved by People section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Clean Heading and View All Link */}
        <div className="flex items-center justify-between pb-4 mb-6 md:mb-8 border-b border-[#383838]">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-extrabold text-white tracking-tight">
            {t('shopByCategory')}
          </h2>

          <Link
            to="/shop"
            className="text-xs md:text-sm font-bold text-[#D6A52A] hover:text-[#E5B93B] flex items-center gap-1.5 transition-colors group"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        {/* Continuously Auto-running Horizontal Slider Container — Contained inside max-w-7xl */}
        <div className="w-full overflow-hidden relative">
          <div
            ref={sliderRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onScroll={handleScroll}
            className="flex gap-4 md:gap-6 overflow-x-auto select-none cursor-grab active:cursor-grabbing py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x',
            }}
          >
            {displayItems.map((cat) => {
              const name = getProductText(cat, 'name');
              const hindiSub = language === 'hinglish' && cat.name_hi ? `(${cat.name_hi})` : '';
              const desc = getProductText(cat, 'description');
              const imageSrc = getCategoryImage(cat);

              return (
                <Link
                  key={cat._key}
                  to={`/category/${cat.slug}`}
                  onClick={handleCardClick}
                  draggable={false}
                  className="group shrink-0 flex flex-col justify-between w-[240px] xs:w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] bg-[#242424] hover:bg-[#2D2D2D] border border-[#383838] hover:border-[#D6A52A] shadow-md hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden select-none"
                >
                  {/* Category Image at Top (Pure White Background, Original aspect ratio preserved) */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[#1E1E1E] flex items-center justify-center p-3 sm:p-4 border-b border-[#383838]">
                    <img
                      src={imageSrc}
                      alt={name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
                      loading="eager"
                      draggable={false}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = cat.image || '/images/logo.png';
                      }}
                    />
                    {/* Subtle luxury antique gold accent line on bottom of image */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D6A52A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </div>

                  {/* Card Body: Name, Description, and Antique Gold Explore Products Button */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-transparent">
                    <div>
                      <h3 className="font-heading font-extrabold text-sm sm:text-base text-white group-hover:text-[#D6A52A] transition-colors line-clamp-1 leading-snug">
                        {name}
                      </h3>
                      {hindiSub && (
                        <span className="text-[11px] sm:text-xs text-[#B3B3B3] font-devanagari block mt-0.5 opacity-90 line-clamp-1">
                          {hindiSub}
                        </span>
                      )}
                      {desc && (
                        <p className="text-xs text-[#B3B3B3] line-clamp-2 mt-2 leading-relaxed">
                          {desc}
                        </p>
                      )}
                    </div>

                    {/* Explore Products Button with Antique Gold Background & Pure White Text */}
                    <div className="w-full mt-4 pt-3 border-t border-[#383838]">
                      <div className="category-explore-btn w-full py-2.5 px-4 bg-[#D6A52A] hover:bg-[#E5B93B] text-[#000000] font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-300">
                        <span>{t('exploreProducts')}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
