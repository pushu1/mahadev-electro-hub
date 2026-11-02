import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sun, MapPin, Truck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function WhyChooseUs() {
  const { language } = useLanguage();
  const sectionRef = useRef(null);
  const deckContainerRef = useRef(null);

  const [hasEntered, setHasEntered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileTapped, setIsMobileTapped] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [gapHalf, setGapHalf] = useState(10);

  // Check user prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Detect touch device & responsive gap calculation
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
      setGapHalf(window.innerWidth < 640 ? 6 : 10);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Handle outside click on mobile/touchscreen to collapse
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (deckContainerRef.current && !deckContainerRef.current.contains(e.target)) {
        setIsMobileTapped(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  // IntersectionObserver to trigger scroll-based entrance animation once per visit
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Is deck currently expanded (either by hover or mobile tap)
  const isExpanded = isHovered || isMobileTapped;

  // Content for English, Hinglish, and Hindi
  const content = {
    en: {
      eyebrow: 'WHY MAHADEV ELECTRO HUB',
      heading: 'Powering Rajasthan. Built on Trust.',
      description:
        'From powerful farming torches to reliable solar solutions, we bring dependable electrical products to homes, farms, and businesses.',
      cta: 'Explore Our Products',
      features: [
        {
          id: 'quality',
          title: 'Heavy-Duty Quality',
          desc: 'Reliable electrical products designed for demanding everyday use.',
          icon: ShieldCheck,
        },
        {
          id: 'solar',
          title: 'Solar-Powered Savings',
          desc: 'Discover solar lighting solutions that help reduce electricity consumption.',
          icon: Sun,
        },
        {
          id: 'store',
          title: 'Your Trusted Pali Store',
          desc: 'Local support and dependable service from Mahadev Electro Hub, Pali.',
          icon: MapPin,
        },
        {
          id: 'delivery',
          title: 'Fast & Secure Delivery',
          desc: 'Careful packaging and dependable delivery for your orders.',
          icon: Truck,
        },
      ],
    },
    hinglish: {
      eyebrow: 'WHY MAHADEV ELECTRO HUB',
      heading: 'Rajasthan Ki Shakti. Vishwas Ke Saath.',
      description:
        'Powerful farming torches se lekar reliable solar solutions tak, hum homes, farms aur businesses ke liye dependable electrical products laate hain.',
      cta: 'Explore Our Products',
      features: [
        {
          id: 'quality',
          title: 'Heavy-Duty Quality',
          desc: 'Demanding everyday use ke liye bharosemand aur mazboot electrical products.',
          icon: ShieldCheck,
        },
        {
          id: 'solar',
          title: 'Solar-Powered Savings',
          desc: 'Solar lighting solutions jo electricity consumption kam karne mein madad karein.',
          icon: Sun,
        },
        {
          id: 'store',
          title: 'Aapka Trusted Pali Store',
          desc: 'Mahadev Electro Hub, Pali se local support aur bharosemand service.',
          icon: MapPin,
        },
        {
          id: 'delivery',
          title: 'Fast & Secure Delivery',
          desc: 'Aapke orders ki surakshit packaging aur dependable delivery.',
          icon: Truck,
        },
      ],
    },
    hi: {
      eyebrow: 'महादेव इलेक्ट्रो हब क्यों चुनें',
      heading: 'राजस्थान की शक्ति। विश्वास की नींव।',
      description:
        'शक्तिशाली किसान टॉर्च से लेकर भरोसेमंद सोलर समाधान तक, हम घरों, खेतों और व्यापारों के लिए टिकाऊ इलेक्ट्रिकल उत्पाद लाते हैं।',
      cta: 'हमारे उत्पाद देखें',
      features: [
        {
          id: 'quality',
          title: 'हेवी-ड्यूटी क्वालिटी',
          desc: 'कठिन दैनिक उपयोग के लिए तैयार टिकाऊ और भरोसेमंद इलेक्ट्रिकल उत्पाद।',
          icon: ShieldCheck,
        },
        {
          id: 'solar',
          title: 'सोलर बचत समाधान',
          desc: 'सोलर लाइटिंग सॉल्यूशंस जो बिजली के खर्च को घटाने में मदद करते हैं।',
          icon: Sun,
        },
        {
          id: 'store',
          title: 'पाली का विश्वसनीय स्टोर',
          desc: 'महादेव इलेक्ट्रो हब, पाली से स्थानीय सहायता और भरोसेमंद सेवा।',
          icon: MapPin,
        },
        {
          id: 'delivery',
          title: 'सुरक्षित व तेज डिलीवरी',
          desc: 'आपके ऑर्डर्स की सुरक्षित पैकिंग और भरोसेमंद डिलीवरी।',
          icon: Truck,
        },
      ],
    },
  };

  const activeContent = content[language] || content.en;

  // Stacking & spreading transform configuration
  const getCardDeckStyle = (idx) => {
    if (reducedMotion) {
      return {
        transform: 'none',
        zIndex: 20,
        pointerEvents: 'auto',
        transition: 'none',
      };
    }

    const duration = '700ms';
    const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';

    if (isExpanded) {
      // SPREAD OUT: 2x2 grid positions with subtle forward stagger
      const expandDelays = [0, 70, 140, 210];
      return {
        transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)',
        zIndex: 20,
        pointerEvents: 'auto',
        transition: `transform ${duration} ${easing} ${expandDelays[idx]}ms, box-shadow ${duration} ease, border-color 300ms ease`,
      };
    } else {
      // STACKED STATE: Gathered in center deck with slight edge offsets and rotations
      // Reverse delays when collapsing back into the stack
      const collapseDelays = [180, 120, 60, 0];

      if (idx === 0) {
        // Front Card (Heavy-Duty Quality): center of container, scale 1.0, 0deg, top z-index 40
        return {
          transform: `translate3d(calc(50% + ${gapHalf}px), calc(50% + ${gapHalf}px), 0) scale(1) rotate(0deg)`,
          zIndex: 40,
          pointerEvents: 'auto',
          transition: `transform ${duration} ${easing} ${collapseDelays[idx]}ms, box-shadow ${duration} ease, border-color 300ms ease`,
        };
      }

      if (idx === 1) {
        // 2nd Card (Solar-Powered Savings): directly behind with top-right +6px / -5px offset & 2deg rotation
        return {
          transform: `translate3d(calc(-50% - ${gapHalf}px + 6px), calc(50% + ${gapHalf}px - 5px), 0) scale(0.98) rotate(2deg)`,
          zIndex: 30,
          pointerEvents: 'none',
          transition: `transform ${duration} ${easing} ${collapseDelays[idx]}ms, box-shadow ${duration} ease, border-color 300ms ease`,
        };
      }

      if (idx === 2) {
        // 3rd Card (Your Trusted Pali Store): directly behind with bottom-left -7px / +7px offset & -2.5deg rotation
        return {
          transform: `translate3d(calc(50% + ${gapHalf}px - 7px), calc(-50% - ${gapHalf}px + 7px), 0) scale(0.96) rotate(-2.5deg)`,
          zIndex: 20,
          pointerEvents: 'none',
          transition: `transform ${duration} ${easing} ${collapseDelays[idx]}ms, box-shadow ${duration} ease, border-color 300ms ease`,
        };
      }

      // 4th Card (Fast & Secure Delivery): directly behind with bottom-right +12px / +10px offset & 3.5deg rotation
      return {
        transform: `translate3d(calc(-50% - ${gapHalf}px + 12px), calc(-50% - ${gapHalf}px + 10px), 0) scale(0.94) rotate(3.5deg)`,
        zIndex: 10,
        pointerEvents: 'none',
        transition: `transform ${duration} ${easing} ${collapseDelays[idx]}ms, box-shadow ${duration} ease, border-color 300ms ease`,
      };
    }
  };

  return (
    <section
      id="why-choose-us"
      ref={sectionRef}
      aria-label="Why Choose Mahadev Electro Hub"
      className="relative py-16 sm:py-20 lg:py-28 bg-[#F3F0E6] border-t border-[#E2E6DC] overflow-hidden select-none"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Brand Introduction */}
          <div
            data-left-intro="true"
            className={`lg:col-span-5 flex flex-col items-start text-left transition-all duration-700 ease-out ${
              hasEntered || reducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-[#355E3B] mb-3">
              <span>{activeContent.eyebrow}</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-heading font-extrabold text-[#26352A] tracking-tight leading-[1.2] mb-3">
              {activeContent.heading}
            </h2>

            {/* Subtle Animated Sage Underline */}
            <div className="w-full h-[2.5px] bg-[#E2E6DC] rounded-full mb-5 overflow-hidden">
              <div
                data-gold-underline="true"
                className={`h-full bg-gradient-to-r from-[#355E3B] via-[#2E7D46] to-transparent transition-all duration-1000 ease-out rounded-full ${
                  hasEntered || reducedMotion ? 'w-32 sm:w-44 opacity-100' : 'w-0 opacity-0'
                }`}
              />
            </div>

            {/* Supporting Description */}
            <p className="text-sm sm:text-base text-[#50574F] leading-relaxed mb-8 max-w-lg font-normal">
              {activeContent.description}
            </p>

            {/* Small CTA Button */}
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-[#355E3B] hover:bg-[#294A30] active:scale-[0.98] transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-[#355E3B]/20"
            >
              <span>{activeContent.cta}</span>
              <ArrowRight className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right Column: Interactive Stacked-Card Deck spreading into 2x2 Grid */}
          <div
            ref={deckContainerRef}
            data-deck-container="true"
            onMouseEnter={() => {
              if (!isTouchDevice) setIsHovered(true);
            }}
            onMouseLeave={() => {
              if (!isTouchDevice) setIsHovered(false);
            }}
            onClick={() => {
              // Mobile tap to toggle expansion
              if (isTouchDevice) {
                setIsMobileTapped((prev) => !prev);
              }
            }}
            className={`lg:col-span-7 relative transition-all duration-700 ease-out ${
              hasEntered || reducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Restrained Sage Ambient Glow */}
            <div
              className={`absolute -top-12 -right-12 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl pointer-events-none -z-0 transition-opacity duration-700 ${
                isExpanded ? 'bg-[#A8BFA3]/[0.15] opacity-100' : 'bg-[#A8BFA3]/[0.08] opacity-70'
              }`}
              aria-hidden="true"
            />

            {/* 2x2 Feature Grid Slot System */}
            <div
              className="grid grid-cols-2 gap-3 sm:gap-5 relative z-10 min-h-[380px] sm:min-h-[420px]"
            >
              {activeContent.features.map((feature, idx) => {
                const Icon = feature.icon;
                const cardDeckStyle = getCardDeckStyle(idx);

                return (
                  <div
                    key={feature.id}
                    data-feature-card="true"
                    data-card-index={idx + 1}
                    style={cardDeckStyle}
                    className="relative w-full h-full will-change-transform select-none"
                  >
                    {/* Inner Card Presentation */}
                    <div
                      className={`w-full h-full min-h-[180px] sm:min-h-[200px] bg-[#FFFFFF] rounded-xl p-4 sm:p-6 border ${
                        isExpanded
                          ? 'border-[#E2E6DC] hover:border-[#A8BFA3] shadow-sm hover:shadow-xl hover:shadow-[#A8BFA3]/15 hover:-translate-y-1.5'
                          : idx === 0
                            ? 'border-[#E2E6DC] shadow-xl shadow-black/5'
                            : 'border-[#E2E6DC] shadow-md shadow-black/5'
                      } transition-all duration-300 ease-out flex flex-col justify-between group/card`}
                    >
                      {/* Top: Icon & Indicator */}
                      <div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#F3F0E6] border border-[#E2E6DC] group-hover/card:border-[#A8BFA3] flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 group-hover/card:scale-105 shrink-0">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#355E3B] transition-transform duration-300" />
                        </div>

                        {/* Title */}
                        <h3 className="font-heading font-bold text-sm sm:text-base lg:text-lg text-[#26352A] mb-1.5 group-hover/card:text-[#355E3B] transition-colors duration-200">
                          {feature.title}
                        </h3>
                      </div>

                      {/* Bottom: Description */}
                      <p className="text-[11px] sm:text-xs lg:text-sm text-[#50574F] leading-snug sm:leading-relaxed font-normal">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
