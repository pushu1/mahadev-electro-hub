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
    if (id === 'testing') return <ShieldCheck className="w-8 h-8 text-[#24532F] mx-auto mb-3" />;
    if (id === 'solar') return <Sun className="w-8 h-8 text-[#24532F] mx-auto mb-3" />;
    return <MapPin className="w-8 h-8 text-[#24532F] mx-auto mb-3" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252A25] selection:bg-[#DCE8D5] selection:text-[#171C17]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#596358] mb-6 flex-wrap font-medium">
          <Link to="/" className="hover:text-[#24532F] transition-colors">{t('home')}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#356B3D]" />
          <span className="text-[#596358]">{t('usefulLinks')}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#356B3D]" />
          <span className="text-[#171C17] font-bold">{content.title}</span>
        </nav>

        {/* Main Card Container */}
        <article className="bg-[#FFFFFF] rounded-2xl sm:rounded-3xl border border-[#D5DDD2] p-6 sm:p-10 md:p-12 shadow-sm space-y-10">
          {/* Header & Brand Identity */}
          <div className="text-center max-w-2xl mx-auto border-b border-[#D5DDD2] pb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#24532F] bg-[#FAF9F6] mx-auto mb-4 shadow-xs p-1">
              <img src="/images/logo.png" alt="Mahadev Electro Hub Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#24532F] block mb-2">
              {content.eyebrow}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-[#171C17] tracking-tight leading-tight">
              {content.title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[#252A25] mt-3 leading-relaxed">
              {content.subtitle}
            </p>
          </div>

          {/* Story & Mission Content */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#171C17] border-l-4 border-[#24532F] pl-3.5">
              {content.missionHeading}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#252A25] leading-relaxed">
              {content.storyP1}
            </p>
            <p className="text-xs sm:text-sm md:text-base text-[#252A25] leading-relaxed">
              {content.storyP2}
            </p>
          </div>

          {/* Values Grid: 3 Clean Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#D5DDD2]">
            {content.values.map((val) => (
              <div
                key={val.id}
                className="p-6 bg-[#FAF9F6] rounded-xl border border-[#D5DDD2] hover:border-[#356B3D] text-center transition-colors shadow-2xs"
              >
                {getIcon(val.id)}
                <h3 className="font-heading font-bold text-sm sm:text-base text-[#171C17] mb-2">
                  {val.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#252A25] leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Action CTAs: Explore Products & Contact */}
          <div className="pt-6 border-t border-[#D5DDD2] flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#24532F] hover:bg-[#183D22] text-white font-extrabold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
            >
              <span>{t('exploreProducts')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FFFFFF] border border-[#D5DDD2] hover:border-[#24532F] text-[#171C17] hover:text-[#24532F] font-bold text-xs sm:text-sm transition-all shadow-2xs"
            >
              <Phone className="w-4 h-4 text-[#24532F]" />
              <span>{t('contactUs')}</span>
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
