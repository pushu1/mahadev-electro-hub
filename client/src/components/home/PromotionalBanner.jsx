import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, ArrowRight, Sun } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function PromotionalBanner() {
  const { language } = useLanguage();

  const content = {
    en: {
      tag: 'Farm Perimeter Defense • Pali Warehouse Exclusive',
      headline1: 'Solar Zatka Machines & ',
      headlineAccent: 'Boundary Fencing',
      description: 'High-voltage non-lethal solar electric fence energizers designed to protect agricultural crops and orchards from wild animals, boars, and stray cattle 24/7. Direct tested Pali store quality with full 1-year replacement warranty.',
      ctaPrimary: 'Explore Zatka Machines',
      ctaSecondary: 'Solar Street Lights Range',
      packingNote: '100% Shockproof Transit Packing',
      dispatchNote: 'Fast Dispatch Across Rajasthan & All-India',
    },
    hinglish: {
      tag: 'Farm Perimeter Defense • Pali Warehouse Exclusive',
      headline1: 'Solar Zatka Machines & ',
      headlineAccent: 'Boundary Fencing',
      description: 'High-voltage non-lethal solar electric fence energizers jo agricultural crops aur khet ko wild animals, boars aur pashuon se 24/7 protect karein. 1-year replacement warranty ke sath Pali store tested quality.',
      ctaPrimary: 'Zatka Machines Dekhein',
      ctaSecondary: 'Solar Street Lights Range',
      packingNote: '100% Shockproof Transit Packing',
      dispatchNote: 'Rajasthan aur All-India Tez Dispatch',
    },
    hi: {
      tag: 'खेत परिधि सुरक्षा • पाली वेयरहाउस एक्सक्लूसिव',
      headline1: 'सोलर झटका मशीनें व ',
      headlineAccent: 'बाउंड्री फेंसिंग',
      description: 'फसलों को नीलगाय, जंगली सूअर और आवारा पशुओं से 24/7 सुरक्षित रखने के लिए उच्च क्षमता वाली सोलर झटका मशीनें। 1-वर्षीय रिप्लेसमेंट वारंटी के साथ पाली स्टोर से प्रमाणित गुणवत्ता।',
      ctaPrimary: 'झटका मशीनें देखें',
      ctaSecondary: 'सोलर स्ट्रीट लाइट रेंज',
      packingNote: '100% शॉकप्रूफ सुरक्षित ट्रांजिट पैकिंग',
      dispatchNote: 'राजस्थान व पूरे भारत में तेज़ डिलीवरी',
    },
  };

  const c = content[language] || content.en;

  return (
    <section
      aria-label="Solar Zatka Machines & Boundary Fencing"
      className="py-16 md:py-20 bg-[#FAF9F6] select-none relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#F3F0E6] via-[#FAF9F6] to-[#EAE6D8] text-[#26352A] p-8 sm:p-12 md:p-16 border border-[#E2E6DC] shadow-xl">
          {/* Subtle Organic Ambient Aura */}
          <div className="absolute right-0 top-0 bottom-0 w-2/3 opacity-20 bg-radial from-[#A8BFA3]/30 via-[#DCE8D5]/15 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#A8BFA3]/20 blur-3xl pointer-events-none" />

          {/* Subtle Grid lines */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#26352A_1px,transparent_1px),linear-gradient(to_bottom,#26352A_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-5">
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DCE8D5]/70 border border-[#A8BFA3]/50 text-[#294A30] text-xs font-extrabold tracking-widest uppercase shadow-sm">
              <Zap className="w-3.5 h-3.5 text-[#355E3B] animate-pulse" />
              <span>{c.tag}</span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-extrabold leading-tight text-[#26352A] tracking-tight">
              {c.headline1}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#26352A] via-[#355E3B] to-[#2E7D46]">
                {c.headlineAccent}
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#50574F] leading-relaxed font-normal max-w-xl">
              {c.description}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/category/zatka-machines"
                className="px-6 py-3.5 rounded-xl bg-[#355E3B] hover:bg-[#294A30] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 group cursor-pointer"
              >
                <span>{c.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>

              <Link
                to="/category/solar-street-lights"
                className="px-5 py-3.5 rounded-xl border border-[#A8BFA3] hover:border-[#355E3B] bg-[#FFFFFF] text-[#26352A] font-semibold text-sm hover:bg-[#F3F0E6] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Sun className="w-4 h-4 text-[#355E3B]" />
                <span>{c.ctaSecondary}</span>
              </Link>
            </div>

            {/* Trust Footnote */}
            <div className="pt-4 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-[#50574F] border-t border-[#E2E6DC]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#355E3B]" />
                <span>{c.packingNote}</span>
              </span>
              <span>{c.dispatchNote}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
