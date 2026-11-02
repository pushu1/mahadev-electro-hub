import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sun, MapPin, ChevronRight, ArrowRight, Phone } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { aboutPageTranslations } from '../translations.js';

export default function AboutUsPage() {
  const { language, t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const content = aboutPageTranslations[language] || aboutPageTranslations.en;

  const getIcon = (id) => {
    if (id === 'testing') return <ShieldCheck className="w-8 h-8 text-[#D6A52A] mx-auto mb-3" />;
    if (id === 'solar') return <Sun className="w-8 h-8 text-[#D6A52A] mx-auto mb-3" />;
    return <MapPin className="w-8 h-8 text-[#D6A52A] mx-auto mb-3" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-white selection:bg-[#D6A52A] selection:text-black">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#888888] mb-6 flex-wrap font-medium">
          <Link to="/" className="hover:text-[#D6A52A] transition-colors">{t('home')}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#555555]" />
          <span className="text-[#888888]">{t('usefulLinks')}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#555555]" />
          <span className="text-white font-bold">{content.title}</span>
        </nav>

        {/* Main Card Container */}
        <article className="bg-[#141414] rounded-2xl sm:rounded-3xl border border-[#262626] p-6 sm:p-10 md:p-12 shadow-2xl space-y-10">
          {/* Header & Brand Identity */}
          <div className="text-center max-w-2xl mx-auto border-b border-[#262626] pb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#D6A52A] bg-[#1E1E1E] mx-auto mb-4 shadow-lg p-1">
              <img src="/images/logo.png" alt="Mahadev Electro Hub Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#D6A52A] block mb-2">
              {content.eyebrow}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
              {content.title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[#D1D5DB] mt-3 leading-relaxed">
              {content.subtitle}
            </p>
          </div>

          {/* Story & Mission Content */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-white border-l-4 border-[#D6A52A] pl-3.5">
              {content.missionHeading}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#D1D5DB] leading-relaxed">
              {content.storyP1}
            </p>
            <p className="text-xs sm:text-sm md:text-base text-[#D1D5DB] leading-relaxed">
              {content.storyP2}
            </p>
          </div>

          {/* Values Grid: 3 Clean Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#262626]">
            {content.values.map((val) => (
              <div
                key={val.id}
                className="p-6 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] hover:border-[#D6A52A]/40 text-center transition-colors shadow-sm"
              >
                {getIcon(val.id)}
                <h3 className="font-heading font-bold text-sm sm:text-base text-white mb-2">
                  {val.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Action CTAs: Explore Products & Contact */}
          <div className="pt-6 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#D6A52A] hover:bg-[#E5B93B] text-black font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              <span>{t('exploreProducts')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1E1E1E] border border-[#383838] hover:border-[#D6A52A] text-white hover:text-[#D6A52A] font-bold text-xs sm:text-sm transition-all shadow-sm"
            >
              <Phone className="w-4 h-4 text-[#D6A52A]" />
              <span>{t('contactUs')}</span>
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
