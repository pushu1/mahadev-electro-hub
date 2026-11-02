import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Supplied authentic hero banner slides (Desktop 2048x768 & Mobile 1024x1536)
const HERO_BANNERS = [
  {
    id: 'banner-torches',
    title_en: 'Mahadev Electro Hub Flashlight Showcase',
    title_hi: 'महादेव इलेक्ट्रो हब शक्तिशाली टॉर्च रेंज',
    desktopImage: '/images/banners/Mahadev Electro Hub Flashlight Showcase.png',
    mobileImage: '/images/banners/Mahadev Electro Hub Flashlight Showcase (1).png',
    link: '/category/torches',
    category: 'torches'
  },
  {
    id: 'banner-zatka',
    title_en: 'Mahadev Electro Hub Stronger Fencing, Safer Farming',
    title_hi: 'महादेव इलेक्ट्रो हब सोलर झटका मशीन व खेत सुरक्षा',
    desktopImage: '/images/banners/Mahadev Electro Hub_ Stronger Fencing, Safer Farming.png',
    mobileImage: '/images/banners/Mahadev Electric Fence Energizers Ad.png',
    link: '/category/zatka-machines',
    category: 'zatka-machines'
  },
  {
    id: 'banner-solar-street-lights',
    title_en: 'Mahadev Solar Street Light Showcase',
    title_hi: 'महादेव ऑटोमैटिक सोलर स्ट्रीट लाइट कलेक्शन',
    desktopImage: '/images/banners/Mahadev Solar Street Light Showcase.png',
    mobileImage: '/images/banners/Mahadev Solar Street Light Showcase (1).png',
    link: '/category/solar-street-lights',
    category: 'solar-street-lights'
  },
  {
    id: 'banner-headlamps',
    title_en: 'Mahadev Headlamps Illuminate Every Adventure',
    title_hi: 'महादेव रिचार्जेबल हेवी-ड्यूटी हेडलाइट्स',
    desktopImage: '/images/banners/Mahadev Headlamps_ Illuminate Every Adventure.png',
    mobileImage: '/images/banners/Mahadev Head Lamp_ Adventure Illuminated.png',
    link: '/category/headlamps',
    category: 'headlamps'
  },
  {
    id: 'banner-pocket-torches',
    title_en: 'Small Pocket Torch Adventure Banner',
    title_hi: 'महादेव कॉम्पैक्ट पॉकेट टॉर्च कलेक्शन',
    desktopImage: '/images/banners/Small Pocket Torch Adventure Banner.png',
    mobileImage: '/images/banners/Mahadev Pocket Torch Adventure Banner.png',
    link: '/category/small-pocket-torches',
    category: 'small-pocket-torches'
  }
];

export default function HeroSlider() {
  const { productLang } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const banners = HERO_BANNERS;

  // Viewport IntersectionObserver: Pause carousel when user scrolls down past hero
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Preload only the next banner slide just-in-time to eliminate latency without network congestion
  useEffect(() => {
    if (banners.length <= 1) return;
    const nextIdx = (currentIndex + 1) % banners.length;
    const nextBanner = banners[nextIdx];
    if (nextBanner) {
      const imgD = new Image();
      imgD.src = encodeURI(nextBanner.desktopImage.replace(/\.png$/, '.webp'));
      const imgM = new Image();
      imgM.src = encodeURI(nextBanner.mobileImage.replace(/\.png$/, '.webp'));
    }
  }, [currentIndex, banners]);

  // Clean autoplay timer cycling every 3.5 seconds, automatically paused when offscreen, hovered, or tab hidden
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isInViewport || isPaused || document.hidden || banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3500);
  };

  useEffect(() => {
    startTimer();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        startTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInViewport, isPaused, banners.length]);

  // Keyboard navigation listener (Left/Right arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isInViewport) return;
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInViewport, banners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // Mobile swipe gestures
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section
      ref={containerRef}
      aria-label="Mahadev Electro Hub Hero Showcase"
      className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mt-3 sm:mt-4 md:mt-6 mb-6 sm:mb-8 relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cinematic Ambient RGB Gradient Aura behind the Hero Banner */}
      <div
        className="absolute -inset-2 sm:-inset-4 md:-inset-6 rounded-[22px] sm:rounded-[28px] md:rounded-[36px] bg-gradient-to-r from-[#501B28]/55 via-[#28162C]/25 to-[#8A5A16]/50 blur-2xl md:blur-3xl pointer-events-none -z-10 croma-hero-aura"
        aria-hidden="true"
      />

      <div
        className="relative w-full overflow-hidden rounded-[14px] sm:rounded-[18px] md:rounded-[24px] lg:rounded-[28px] border border-[#E2E6DC] shadow-lg select-none bg-[#FFFFFF]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* CSS Grid stack: all slides share cell 1/1 so container matches the image's full natural height */}
        <div className="grid grid-cols-1 grid-rows-1 w-full">
          {banners.map((slide, idx) => {
            const isActive = idx === currentIndex;
            const desktopWebp = slide.desktopImage.replace(/\.png$/, '.webp');
            const mobileWebp = slide.mobileImage.replace(/\.png$/, '.webp');

            return (
              <div
                key={slide.id}
                className={`col-start-1 row-start-1 w-full transition-opacity duration-500 ease-in-out ${
                  isActive
                    ? 'opacity-100 z-10 pointer-events-auto'
                    : 'opacity-0 z-0 pointer-events-none'
                }`}
                aria-hidden={!isActive}
              >
                <Link
                  to={slide.link}
                  className="block w-full cursor-pointer"
                  title={productLang === 'hi' ? slide.title_hi : slide.title_en}
                  tabIndex={isActive ? 0 : -1}
                >
                  {/* Full-width responsive picture element (Desktop 2048x768 & Mobile 1024x1536) */}
                  <picture className="w-full block">
                    <source
                      type="image/webp"
                      media="(min-width: 768px)"
                      srcSet={encodeURI(desktopWebp)}
                      width="2048"
                      height="768"
                    />
                    <source
                      media="(min-width: 768px)"
                      srcSet={encodeURI(slide.desktopImage)}
                      width="2048"
                      height="768"
                    />
                    <source
                      type="image/webp"
                      srcSet={encodeURI(mobileWebp)}
                      width="1024"
                      height="1536"
                    />
                    <img
                      src={encodeURI(slide.mobileImage)}
                      alt={productLang === 'hi' ? slide.title_hi : slide.title_en}
                      width="1024"
                      height="1536"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      fetchPriority={idx === 0 ? 'high' : 'auto'}
                      decoding="async"
                      className="w-full h-auto block select-none"
                    />
                  </picture>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Previous Navigation Arrow Button */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Banner Slide"
          className="absolute left-2.5 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-[6px] bg-white/80 hover:bg-[#355E3B] hover:border-[#355E3B] hover:text-[#FFFFFF] border border-[#E2E6DC] text-[#26352A] flex items-center justify-center transition-all shadow-md backdrop-blur-xs active:scale-95 group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-x-0.5" />
        </button>

        {/* Next Navigation Arrow Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Banner Slide"
          className="absolute right-2.5 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-[6px] bg-white/80 hover:bg-[#355E3B] hover:border-[#355E3B] hover:text-[#FFFFFF] border border-[#E2E6DC] text-[#26352A] flex items-center justify-center transition-all shadow-md backdrop-blur-xs active:scale-95 group cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  );
}
