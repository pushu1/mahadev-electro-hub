import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Home, Tractor, Factory, Warehouse, Compass, Mountain, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function ShopByUse() {
  const { t, language } = useLanguage();
  const sectionRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // IntersectionObserver to trigger entrance animations once
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect(); // Play once per page visit
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const useCases = language === 'hi' ? [
    {
      id: 'farming',
      icon: Tractor,
      title: 'खेती एवं कृषि सुरक्षा',
      desc: 'फसल सुरक्षा हेतु हाई-पल्स सोलर झटका मशीन, 1.5 किमी किसान लेजर टॉर्च और रात के काम हेतु रिचार्जेबल हेडलैंप।',
      link: '/category/zatka-machines',
      badge: 'किसान सुरक्षा',
      categoryTag: 'AGRICULTURE'
    },
    {
      id: 'home',
      icon: Home,
      title: 'घर एवं आवासीय उपयोग',
      desc: 'गेट व छत हेतु सोलर स्ट्रीट लाइट, शून्य बिजली बिल आंगन फ्लडलाइट और 8 घंटे बैकअप रिचार्जेबल पंखे।',
      link: '/category/solar-street-lights',
      badge: 'शून्य बिजली बिल',
      categoryTag: 'RESIDENTIAL'
    },
    {
      id: 'factory',
      icon: Factory,
      title: 'फैक्ट्री व कार्यशाला',
      desc: 'औद्योगिक सोलर फ्लडलाइट, मजबूत मेटल इंस्पेक्शन टॉर्च और हेवी-ड्यूटी 12V डीसी उपकरण।',
      link: '/category/solar-street-lights',
      badge: 'हेवी-ड्यूटी',
      categoryTag: 'INDUSTRIAL'
    },
    {
      id: 'warehouse',
      icon: Warehouse,
      title: 'वेयरहाउस व स्टॉक यार्ड',
      desc: 'चारदीवारी सोलर रोशनी, मोशन सेंसर रडार लाइट्स और लंबा बैकअप इंस्पेक्शन टॉर्च।',
      link: '/category/torches',
      badge: 'व्यावसायिक',
      categoryTag: 'LOGISTICS'
    },
    {
      id: 'travelling',
      icon: Compass,
      title: 'यात्रा व आपातकालीन किट',
      desc: 'टाइप-सी फास्ट चार्जिंग और ऑप्टिकल ज़ूम के साथ जेब में आने वाली मजबूत मेटल टॉर्च।',
      link: '/category/small-pocket-torches',
      badge: 'पॉकेट साइज',
      categoryTag: 'EMERGENCY'
    },
    {
      id: 'outdoor',
      icon: Mountain,
      title: 'आउटडोर व ट्रैकिंग',
      desc: 'IP65 वाटरप्रूफ वेदरप्रूफ हंटिंग टॉर्च और 90-डिग्री टिल्टेबल रिचार्जेबल हेडलैंप।',
      link: '/category/headlamps',
      badge: 'वेदरप्रूफ',
      categoryTag: 'EXPEDITION'
    },
  ] : language === 'hinglish' ? [
    {
      id: 'farming',
      icon: Tractor,
      title: 'Farming & Agriculture',
      desc: 'Fasal suraksha ke liye high-pulse Solar Zatka machine, 1000m long-beam farmer torch aur hands-free night headlamps.',
      link: '/category/zatka-machines',
      badge: 'FARMERS FAVORITE',
      categoryTag: 'AGRICULTURE'
    },
    {
      id: 'home',
      icon: Home,
      title: 'Home & Household Use',
      desc: 'Gate & terrace solar street lights, zero power bill courtyard floodlights aur 8-hour backup rechargeable fans.',
      link: '/category/solar-street-lights',
      badge: 'ZERO POWER BILLS',
      categoryTag: 'RESIDENTIAL'
    },
    {
      id: 'factory',
      icon: Factory,
      title: 'Factory & Workshop Use',
      desc: 'Industrial compound solar floodlights, durable aircraft aluminum inspection torches aur direct DC motor appliances.',
      link: '/category/solar-street-lights',
      badge: 'HEAVY-DUTY',
      categoryTag: 'INDUSTRIAL'
    },
    {
      id: 'warehouse',
      icon: Warehouse,
      title: 'Warehouses & Stock Yards',
      desc: 'Perimeter solar illumination, all-night radar sensor lights aur long battery backup stock inspection torches.',
      link: '/category/torches',
      badge: 'COMMERCIAL GRADE',
      categoryTag: 'LOGISTICS'
    },
    {
      id: 'travelling',
      icon: Compass,
      title: 'Travel & Emergency Kits',
      desc: 'Compact EDC metal torches with Type-C fast charging, optical zoom optic aur pocket-sized emergency backup.',
      link: '/category/small-pocket-torches',
      badge: 'POCKET SIZED',
      categoryTag: 'EMERGENCY'
    },
    {
      id: 'outdoor',
      icon: Mountain,
      title: 'Outdoor & Adventure',
      desc: 'IP65 weatherproof hunting torches aur 90-degree tiltable rechargeable high-lumen headlamps.',
      link: '/category/headlamps',
      badge: 'WEATHERPROOF',
      categoryTag: 'EXPEDITION'
    },
  ] : [
    {
      id: 'farming',
      icon: Tractor,
      title: 'Farming & Agriculture',
      desc: 'High-pulse Solar Zatka energizers for crop security, 1.5 km focused farmer torches, and hands-free night headlamps.',
      link: '/category/zatka-machines',
      badge: 'FARMER FAVORITE',
      categoryTag: 'AGRICULTURE'
    },
    {
      id: 'home',
      icon: Home,
      title: 'Home & Household Use',
      desc: 'Gate & terrace solar street lights, zero electricity bill floodlights, and 8-hour backup rechargeable fans.',
      link: '/category/solar-street-lights',
      badge: 'ZERO POWER BILLS',
      categoryTag: 'RESIDENTIAL'
    },
    {
      id: 'factory',
      icon: Factory,
      title: 'Factory & Workshop Use',
      desc: 'Industrial compound solar floodlights, durable aircraft aluminum inspection torches, and DC motor equipment.',
      link: '/category/solar-street-lights',
      badge: 'HEAVY-DUTY',
      categoryTag: 'INDUSTRIAL'
    },
    {
      id: 'warehouse',
      icon: Warehouse,
      title: 'Warehouses & Stock Yards',
      desc: 'Perimeter solar illumination, all-night radar sensor lights, and long battery backup inspection torches.',
      link: '/category/torches',
      badge: 'COMMERCIAL GRADE',
      categoryTag: 'LOGISTICS'
    },
    {
      id: 'travelling',
      icon: Compass,
      title: 'Travel & Emergency Kits',
      desc: 'Compact EDC metal torches with Type-C fast charging, optical zoom lens, and pocket-sized emergency backup.',
      link: '/category/small-pocket-torches',
      badge: 'POCKET SIZED',
      categoryTag: 'EMERGENCY'
    },
    {
      id: 'outdoor',
      icon: Mountain,
      title: 'Outdoor & Adventure',
      desc: 'IP65 weatherproof tactical torches and 90-degree tiltable rechargeable high-lumen headlamps.',
      link: '/category/headlamps',
      badge: 'WEATHERPROOF',
      categoryTag: 'EXPEDITION'
    },
  ];

  const exploreLabel = language === 'hi'
    ? 'श्रेणी देखें'
    : 'Explore Category';

  const eyebrowText = language === 'hi'
    ? 'विशेष इलेक्ट्रिकल एवं सोलर समाधान'
    : 'TAILORED ELECTRICAL & SOLAR SOLUTIONS';

  const headingText = language === 'hi'
    ? 'अपनी आवश्यकता अनुसार पावर समाधान चुनें'
    : 'Find Your Perfect Power Solution';

  const subtitleText = language === 'hi'
    ? 'अपनी दैनिक आवश्यकताओं के अनुसार डिज़ाइन किए गए विश्वसनीय इलेक्ट्रिकल और सोलर उत्पाद खोजें।'
    : 'Explore reliable electrical and solar products designed around your everyday needs.';

  return (
    <section
      ref={sectionRef}
      aria-label="Shop by Use Case"
      className="py-16 md:py-24 bg-[#FAF9F6] select-none relative overflow-hidden border-t border-b border-[#E2E6DC]"
    >
      {/* Subtle Ambient Sage Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#A8BFA3]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#DCE8D5]/25 blur-3xl pointer-events-none" />
      
      {/* Fine Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#26352A_1px,transparent_1px),linear-gradient(to_bottom,#26352A_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Staggered Entrance Animation */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          {/* Eyebrow */}
          <div
            className={`inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#355E3B] mb-2.5 transition-all duration-500 ease-out ${
              hasEntered || reducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-3'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#355E3B]" />
            <span>{eyebrowText}</span>
          </div>

          {/* Main Heading with Upward Fade */}
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-[#26352A] tracking-tight leading-tight transition-all duration-600 ease-out delay-150 ${
              hasEntered || reducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            {headingText}
          </h2>

          {/* Animated Center Accent Line */}
          <div
            className={`h-[2px] bg-gradient-to-r from-transparent via-[#355E3B] to-transparent mx-auto mt-4 transition-all duration-700 ease-out delay-300 ${
              hasEntered || reducedMotion ? 'w-24 sm:w-32 opacity-100' : 'w-0 opacity-0'
            }`}
          />

          {/* Subtitle */}
          <p
            className={`text-xs sm:text-sm md:text-base text-[#50574F] mt-3.5 leading-relaxed font-normal max-w-2xl mx-auto transition-all duration-600 ease-out delay-500 ${
              hasEntered || reducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            {subtitleText}
          </p>
        </div>

        {/* 6-Card Interactive Grid with Staggered Scroll Reveal and Luxury Hover */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {useCases.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className={`transform transition-all duration-600 ease-out ${
                  hasEntered || reducedMotion
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: reducedMotion ? '0ms' : `${200 + index * 100}ms`
                }}
              >
                <Link
                  to={item.link}
                  className="group relative rounded-2xl p-6 sm:p-7 md:p-8 bg-[#FFFFFF] border border-[#E2E6DC] hover:border-[#A8BFA3] transition-all duration-300 flex flex-col justify-between h-full shadow-sm hover:shadow-xl hover:shadow-[#A8BFA3]/15 overflow-hidden transform hover:-translate-y-2 block"
                >
                  {/* Subtle Background Shimmer Gradient (Reveals on Hover) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#DCE8D5]/20 via-[#FAF9F6] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Top-Right Ambient Halo */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#A8BFA3]/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                  <div className="relative z-10">
                    {/* Top Row: Refined Forest Green Icon + Small Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-xl bg-[#F3F0E6] border border-[#E2E6DC] group-hover:border-[#A8BFA3] flex items-center justify-center text-[#355E3B] shadow-inner transition-colors duration-300">
                        <Icon className="w-7 h-7 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 text-[#355E3B]" />
                      </div>

                      <span className="text-[10px] sm:text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-[#F3F0E6] text-[#294A30] border border-[#A8BFA3]/40 tracking-wider shadow-xs">
                        {item.badge}
                      </span>
                    </div>

                    {/* Category Uppercase Tag */}
                    <div className="text-[10px] font-bold text-[#7A8277] uppercase tracking-widest mb-1.5">
                      {item.categoryTag}
                    </div>

                    {/* Card Bold Title */}
                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#26352A] group-hover:text-[#355E3B] transition-colors duration-200 mb-2.5 leading-snug">
                      {item.title}
                    </h3>

                    {/* Short Readable Description: Soft Dark Grey */}
                    <p className="text-xs sm:text-sm text-[#50574F] group-hover:text-[#26352A] leading-relaxed mb-6 font-normal transition-colors duration-200">
                      {item.desc}
                    </p>
                  </div>

                  {/* Card Bottom: Explore Category Link & Bottom Expanding Accent */}
                  <div className="relative z-10 pt-4 border-t border-[#E2E6DC] group-hover:border-[#A8BFA3] flex items-center justify-between transition-colors duration-200">
                    <span className="text-xs sm:text-sm font-bold text-[#355E3B] group-hover:text-[#294A30] flex items-center gap-1.5 transition-colors duration-200">
                      <span>{exploreLabel}</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-200 text-[#355E3B] group-hover:text-[#294A30]" />
                    </span>
                  </div>

                  {/* Small Accent Line along bottom edge expanding smoothly on hover */}
                  <div className="absolute bottom-0 left-0 h-[2px] w-12 bg-gradient-to-r from-[#355E3B] to-[#2E7D46] group-hover:w-full transition-all duration-300" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
