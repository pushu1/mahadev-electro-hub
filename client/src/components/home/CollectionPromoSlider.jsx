import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { api } from '../../services/api.js';

// Clean helper to strip any legacy numbered badges (e.g. ' • 01', ' - 02')
export const sanitizeTag = (str) => {
  if (!str) return '';
  return str.replace(/\s*[•·\-–—]\s*\d+\s*$/i, '').trim();
};

// Default 5 authentic collection slides without numbered badges or pill backgrounds
const DEFAULT_SLIDES = [
  {
    id: 'slide-torches',
    collectionKey: 'torches',
    tag_en: 'FEATURED COLLECTION',
    tag_hi: 'विशेष कलेक्शन',
    title_en: 'Heavy-Duty Farming & Tactical Torches',
    title_hi: 'शक्तिशाली किसान व सुरक्षा लेजर टॉर्च',
    description_en: 'Ultra-bright long-range LED torches with up to 1.5 km focused beam throw, massive 10,000 mAh rechargeable backup, and dual solar charging built for night farming.',
    description_hi: '1.5 किमी तक फोकस लेजर बीम, 10,000 mAh दमदार बैटरी बैकअप और सोलर चार्जिंग सपोर्ट के साथ खेतों की रात में रखवाली के लिए सर्वश्रेष्ठ टॉर्च।',
    image: '/images/banners/Mahadev Electro Hub Flashlight Showcase (1).png',
    link: '/category/torches',
    categoryName: 'Torches',
    order: 1,
    isActive: true
  },
  {
    id: 'slide-zatka',
    collectionKey: 'zatka-machines',
    tag_en: 'FARM PERIMETER DEFENSE',
    tag_hi: 'खेत सुरक्षा बाड़',
    title_en: 'Solar Zatka Machines & Boundary Fencing',
    title_hi: 'सोलर झटका मशीनें व बाउंड्री फेंसिंग',
    description_en: 'Non-lethal high-voltage solar electric fence energizers designed to protect agricultural crops and orchards from wild animals, boars, and stray cattle 24/7.',
    description_hi: 'फसलों को नीलगाय और आवारा पशुओं से 24 घंटे सुरक्षित रखने के लिए 2 किमी व 5 किमी क्षमता वाली हेवी-ड्यूटी सोलर झटका मशीनें।',
    image: '/images/banners/Mahadev Electric Fence Energizers Ad.png',
    link: '/category/zatka-machines',
    categoryName: 'Zatka Machines',
    order: 2,
    isActive: true
  },
  {
    id: 'slide-solar-street-lights',
    collectionKey: 'solar-street-lights',
    tag_en: 'AUTONOMOUS OUTDOOR LIGHTING',
    tag_hi: 'ऑटोमैटिक सोलर लाइट',
    title_en: 'All-In-One Automatic Solar Street Lights',
    title_hi: 'ऑल-इन-वन ऑटोमैटिक सोलर स्ट्रीट लाइट्स',
    description_en: 'Zero electricity bill lighting equipped with intelligent dusk-to-dawn radar motion sensors, heavy-duty lithium battery packs, and IP65 weatherproof durability.',
    description_hi: 'जीरो बिजली बिल, शाम होते ही खुद ऑन होने वाले रडार मोशन सेंसर, वाटरप्रूफ IP65 बॉडी और पूरी रात निरंतर रोशनी।',
    image: '/images/banners/Mahadev Solar Street Light Showcase (1).png',
    link: '/category/solar-street-lights',
    categoryName: 'Solar Street Lights',
    order: 3,
    isActive: true
  },
  {
    id: 'slide-headlamps',
    collectionKey: 'headlamps',
    tag_en: 'HANDS-FREE FIELD ILLUMINATION',
    tag_hi: 'रिचार्जेबल हेडलाइट्स',
    title_en: 'Heavy-Duty Multi-Beam Headlamps',
    title_hi: 'हेवी-ड्यूटी मल्टी-बीम हेडलाइट्स',
    description_en: 'Ergonomic 90-degree tilt hands-free lighting with concentrated long-beam spotlight and wide COB floodlight for night farming, tractor repairs, and outdoor work.',
    description_hi: 'खेतों में काम और नाइट पेट्रोलिंग के लिए 90° एडजस्टेबल टिल्ट, डुअल स्पॉट व फ्लड COB बीम और कम्फर्टेबल हेडबैंड।',
    image: '/images/banners/Mahadev Head Lamp_ Adventure Illuminated.png',
    link: '/category/headlamps',
    categoryName: 'Headlamps',
    order: 4,
    isActive: true
  },
  {
    id: 'slide-pocket-torches',
    collectionKey: 'small-pocket-torches',
    tag_en: 'POCKET TACTICAL POWER',
    tag_hi: 'कॉम्पैक्ट पॉकेट टॉर्च',
    title_en: 'Precision Zoomable Pocket Torches',
    title_hi: 'प्रिसिजन ज़ूमेबल कॉम्पैक्ट पॉकेट टॉर्च',
    description_en: 'Compact aircraft-grade aluminum torches delivering intense zoomable laser beam focus, USB Type-C fast charging, and dependable pocket-sized power for everyday carry.',
    description_hi: 'मजबूत एयरक्राफ्ट मेटल बॉडी, टाइप-सी फास्ट चार्जिंग और अत्यधिक शक्तिशाली ज़ूम लेजर बीम के साथ हर सफर के लिए उत्तम पॉकेट टॉर्च।',
    image: '/images/banners/Mahadev Pocket Torch Adventure Banner.png',
    link: '/category/small-pocket-torches',
    categoryName: 'Small Pocket Torches',
    order: 5,
    isActive: true
  }
];

export default function CollectionPromoSlider() {
  const { language, t } = useLanguage();
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const timerRef = useRef(null);

  // Fetch configured slides from CMS
  const fetchSlides = useCallback(() => {
    api.getCollectionSlides()
      .then(res => {
        if (res?.success && Array.isArray(res.slides) && res.slides.length > 0) {
          setSlides(res.slides);
        }
      })
      .catch((err) => {
        console.warn('Using default collection promo slides:', err);
      });
  }, []);

  useEffect(() => {
    fetchSlides();

    // Live update listeners when admin updates slides
    window.addEventListener('meh_collection_slides_updated', fetchSlides);
    window.addEventListener('storage', fetchSlides);
    window.addEventListener('focus', fetchSlides);

    return () => {
      window.removeEventListener('meh_collection_slides_updated', fetchSlides);
      window.removeEventListener('storage', fetchSlides);
      window.removeEventListener('focus', fetchSlides);
    };
  }, [fetchSlides]);

  const activeSlides = slides.filter(s => s.isActive !== false);
  const totalSlides = activeSlides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay timer with 4.5s interval, pauses on hover
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides, isPaused, nextSlide]);

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      nextSlide();
    } else if (distance < -50) {
      prevSlide();
    }
  };

  if (totalSlides === 0) return null;

  return (
    <section
      aria-label="Promotional Collection Slider"
      className="py-12 sm:py-16 md:py-20 bg-[#0a0a0a]/90 select-none overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Card Container */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#180a10] via-[#111111] to-[#140e08] text-white border border-[#383838] shadow-2xl"
        >
          {/* Subtle Ambient Glow and Grid Lines */}
          <div className="absolute -top-28 -left-28 w-[420px] h-[420px] rounded-full bg-[#501B28]/45 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-20 w-[380px] h-[380px] rounded-full bg-[#28162C]/40 blur-3xl pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full bg-[#8A5A16]/35 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -right-28 w-[400px] h-[400px] rounded-full bg-[#6B451B]/30 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

          {/* Slider Horizontal Track */}
          <div
            className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {activeSlides.map((slide, idx) => {
              const title = language === 'hi' ? (slide.title_hi || slide.title_en) : slide.title_en;
              const desc = language === 'hi' ? (slide.description_hi || slide.description_en) : slide.description_en;
              const rawTag = language === 'hi' ? (slide.tag_hi || slide.tag_en) : slide.tag_en;
              const cleanTag = sanitizeTag(rawTag);
              const encodedImage = encodeURI(slide.image);
              const isCurrent = idx === currentIndex;

              return (
                <div
                  key={slide.id || idx}
                  className="w-full shrink-0 p-6 sm:p-10 md:p-12 lg:p-16 flex items-center justify-center"
                >
                  <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-14 items-center">
                    {/* Left Column: Collection Image Card */}
                    <div className="md:col-span-5 lg:col-span-5 flex justify-center">
                      <div className="relative w-full max-w-[340px] sm:max-w-[380px] md:max-w-none aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4] max-h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#121212] border border-[#383838] shadow-2xl p-2.5 sm:p-3 group/img">
                        {/* Collection Category Badge */}
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[#D6A52A] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider shadow-lg">
                          <span>{slide.categoryName || 'Collection'}</span>
                        </div>

                        {/* Image */}
                        <img
                          src={encodedImage}
                          alt={title}
                          className="w-full h-full object-cover rounded-xl sm:rounded-2xl transition-transform duration-700 ease-out group-hover/img:scale-105 select-none"
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          onError={(e) => {
                            if (!e.target.src.includes('Mahadev%20Electro%20Hub')) {
                              e.target.src = '/images/banners/Mahadev%20Electro%20Hub%20Flashlight%20Showcase%20(1).png';
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Right Column: Collection Typography & Shop Now CTA */}
                    <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-center text-left space-y-4 sm:space-y-6">
                      {/* Unique Animated Collection Label (No pill, no box, no border, no number) */}
                      {cleanTag && (
                        <div
                          key={`tag-${slide.id || idx}-${currentIndex}`}
                          className="flex flex-wrap items-center gap-x-2.5 gap-y-1"
                          aria-label={cleanTag}
                        >
                          {cleanTag.split(' ').map((word, wIdx) => (
                            <span
                              key={`${word}-${wIdx}`}
                              className="promo-tag-word text-[#D6A52A] text-xs sm:text-sm font-heading font-extrabold uppercase tracking-[0.22em] select-none"
                              style={{
                                animationDelay: isCurrent ? `${wIdx * 0.07}s` : '0s',
                              }}
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Collection Title */}
                      <h3 className="text-2xl sm:text-3xl md:text-3xl lg:text-5xl font-heading font-black text-white leading-[1.16] tracking-tight">
                        {title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm md:text-base text-[#B3B3B3] font-normal leading-relaxed max-w-xl">
                        {desc}
                      </p>

                      {/* CTA Button: Prominent "Shop Now" */}
                      <div className="pt-2 sm:pt-4">
                        <Link
                          to={slide.link}
                          className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl bg-[#D6A52A] hover:bg-[#E5B93B] text-[#000000] font-heading font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-[#D6A52A]/25 active:scale-95 transition-all duration-300 group/btn"
                        >
                          <span>{t('shopNow')}</span>
                          <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover/btn:translate-x-1.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Previous Arrow Button */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-2.5 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#D6A52A] text-white hover:text-[#000000] border border-white/20 hover:border-[#D6A52A] backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-xl z-20 cursor-pointer group"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Next Arrow Button */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-2.5 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#D6A52A] text-white hover:text-[#000000] border border-white/20 hover:border-[#D6A52A] backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-xl z-20 cursor-pointer group"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
