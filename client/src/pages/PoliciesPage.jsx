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
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-white selection:bg-[#D6A52A] selection:text-black">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#888888] mb-6 flex-wrap font-medium">
          <Link to="/" className="hover:text-[#D6A52A] transition-colors">{t('home')}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#555555]" />
          <span className="text-[#888888]">{t('usefulLinks')}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#555555]" />
          <span className="text-white font-bold">{currentPolicy.title}</span>
        </nav>

        {/* Main Dark Charcoal Policy Container */}
        <article className="bg-[#141414] rounded-2xl sm:rounded-3xl border border-[#262626] p-6 sm:p-10 md:p-12 shadow-2xl space-y-8">
          {/* Header Banner */}
          <div className="border-b border-[#262626] pb-6 sm:pb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#D6A52A] inline-flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#D6A52A]" />
              <span>{activeLangTranslations.badge}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight leading-tight">
              {currentPolicy.title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[#D1D5DB] mt-2.5 leading-relaxed max-w-3xl">
              {currentPolicy.subtitle}
            </p>
          </div>

          {/* Structured Policy Clauses */}
          <div className="space-y-6 sm:space-y-8">
            {currentPolicy.points.map((point) => (
              <section
                key={point.num}
                className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#D6A52A]/40 transition-colors"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#242424] border border-[#D6A52A]/40 text-[#D6A52A] font-extrabold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-xs">
                  {point.num}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-heading font-bold text-white mb-1.5 flex items-center gap-2">
                    <span>{point.title}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              </section>
            ))}
          </div>

          {/* Bottom Support & Helpline Callout */}
          <div className="mt-8 pt-8 border-t border-[#262626] rounded-xl bg-[#181818] border border-[#2A2A2A] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D6A52A]" />
                <span>{activeLangTranslations.supportTitle}</span>
              </h3>
              <p className="text-xs text-[#D1D5DB] max-w-xl">
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
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#202020] border border-[#D6A52A] hover:bg-[#D6A52A] text-white hover:text-black font-bold text-xs transition-colors shadow-sm"
              >
                <Phone className="w-4 h-4" />
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
