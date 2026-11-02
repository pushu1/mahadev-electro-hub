import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare, ChevronRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { policyPageTranslations } from '../translations.js';

export default function PoliciesPage({ type = 'shipping' }) {
  const { language, t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  const activeLangTranslations = policyPageTranslations[language] || policyPageTranslations.en;
  const currentPolicy = activeLangTranslations[type] || activeLangTranslations.shipping;

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
          <span className="text-[#171C17] font-bold">{currentPolicy.title}</span>
        </nav>

        {/* Main Policy Container */}
        <article className="bg-[#FFFFFF] rounded-2xl sm:rounded-3xl border border-[#D5DDD2] p-6 sm:p-10 md:p-12 shadow-sm space-y-8">
          {/* Header Banner */}
          <div className="border-b border-[#D5DDD2] pb-6 sm:pb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#24532F] inline-flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#24532F]" />
              <span>{activeLangTranslations.badge}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-[#171C17] tracking-tight leading-tight">
              {currentPolicy.title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[#252A25] mt-2.5 leading-relaxed max-w-3xl">
              {currentPolicy.subtitle}
            </p>
          </div>

          {/* Structured Policy Clauses */}
          <div className="space-y-6 sm:space-y-8">
            {currentPolicy.points.map((point) => (
              <section
                key={point.num}
                className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl bg-[#FAF9F6] border border-[#D5DDD2] hover:border-[#356B3D] transition-colors"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#F3F0E6] border border-[#356B3D]/50 text-[#24532F] font-extrabold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-2xs">
                  {point.num}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-heading font-bold text-[#171C17] mb-1.5 flex items-center gap-2">
                    <span>{point.title}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#252A25] leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              </section>
            ))}
          </div>

          {/* Bottom Support & Helpline Callout */}
          <div className="mt-8 pt-8 border-t border-[#D5DDD2] rounded-xl bg-[#F3F0E6] border border-[#D5DDD2] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-sm sm:text-base text-[#171C17] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#24532F]" />
                <span>{activeLangTranslations.supportTitle}</span>
              </h3>
              <p className="text-xs text-[#252A25] max-w-xl">
                {activeLangTranslations.supportDesc}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto shrink-0">
              <a
                href="https://wa.me/917014248415?text=Namaste%20Mahadev%20Electro%20Hub%2C%20mujhe%20store%20policy%20ke%20baare%20mein%20jankari%20chahiye."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{activeLangTranslations.whatsappButton}</span>
              </a>

              <a
                href="tel:+917014248415"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#D5DDD2] hover:border-[#24532F] text-[#171C17] hover:text-[#24532F] font-bold text-xs transition-colors shadow-2xs"
              >
                <Phone className="w-4 h-4 text-[#24532F]" />
                <span>{activeLangTranslations.callButton}</span>
              </a>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
