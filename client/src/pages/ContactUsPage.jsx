import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, AlertCircle, ChevronRight } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { contactPageTranslations } from '../translations.js';
import { api } from '../services/api.js';

export default function ContactUsPage() {
  const { language, t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const content = contactPageTranslations[language] || contactPageTranslations.en;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || (!phone && !email) || !message) {
      setErrorMsg(content.errorMissing);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await api.sendContactInquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        message: message.trim(),
        type: 'CONTACT_PAGE'
      });

      if (res && res.success) {
        setSubmitted(true);
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error(res?.message || content.errorServer);
      }
    } catch (err) {
      setErrorMsg(err.message || content.errorServer);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-white selection:bg-[#D6A52A] selection:text-black">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#888888] mb-6 flex-wrap font-medium">
          <Link to="/" className="hover:text-[#D6A52A] transition-colors">{t('home')}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#555555]" />
          <span className="text-white font-bold">{content.title}</span>
        </nav>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#D6A52A] block mb-2">
            {content.eyebrow}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
            {content.title}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#D1D5DB] mt-2.5 leading-relaxed">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Store Info & Quick Contact Card */}
          <div className="bg-[#141414] p-6 sm:p-8 rounded-2xl border border-[#262626] shadow-2xl space-y-6 text-white">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-white pb-3 border-b border-[#262626]">
              {content.storeInfoTitle}
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#D1D5DB]">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#202020] text-[#D6A52A] shrink-0 border border-[#383838]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-bold text-sm mb-0.5">{content.storeLocationLabel}</strong>
                  <span className="text-[#D1D5DB]">{content.storeLocationValue}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#202020] text-[#D6A52A] shrink-0 border border-[#383838]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-bold text-sm mb-0.5">{content.helplineLabel}</strong>
                  <a href="tel:+917014248415" className="hover:text-[#D6A52A] transition-colors font-semibold text-white">
                    {content.helplinePhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#202020] text-[#D6A52A] shrink-0 border border-[#383838]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-bold text-sm mb-0.5">{content.emailLabel}</strong>
                  <a href="mailto:mahadevelectohub@gmail.com" className="hover:text-[#D6A52A] transition-colors text-white">
                    {content.emailAddress}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#202020] text-[#D6A52A] shrink-0 border border-[#383838]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-bold text-sm mb-0.5">{content.timingsLabel}</strong>
                  <span className="text-[#D1D5DB]">{content.timingsValue}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#262626] flex flex-wrap gap-3">
              <a
                href="https://wa.me/917014248415?text=Namaste%20Mahadev%20Electro%20Hub%2C%20mujhe%20products%20ke%20baare%20mein%20jankari%20chahiye."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] text-white font-bold text-xs hover:bg-[#20ba59] transition-colors shadow-md active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{content.whatsappUsButton}</span>
              </a>
              <a
                href="mailto:mahadevelectohub@gmail.com?subject=Product%20Inquiry%20-%20Mahadev%20Electro%20Hub"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#202020] border border-[#383838] text-white hover:border-[#D6A52A] hover:text-[#D6A52A] font-bold text-xs transition-colors shadow-sm active:scale-95"
              >
                <Mail className="w-4 h-4 text-[#D6A52A]" />
                <span>{content.emailUsButton}</span>
              </a>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="bg-[#141414] p-6 sm:p-8 rounded-2xl border border-[#262626] shadow-2xl">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-white pb-3 border-b border-[#262626] mb-5 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#D6A52A]" />
              <span>{content.formTitle}</span>
            </h2>

            {submitted ? (
              <div className="p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-sm text-emerald-300">{content.successTitle}</h3>
                <p className="text-xs text-emerald-200/80">
                  {content.successDesc}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold text-[#D6A52A] hover:text-[#E5B93B] underline mt-3 inline-block cursor-pointer"
                >
                  {content.sendAnotherButton}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                {errorMsg && (
                  <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-lg text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#E0E0E0] mb-1.5">{content.nameLabel}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={content.namePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-[#1F1F1F] text-white placeholder-[#777777] border border-[#383838] rounded-lg focus:outline-none focus:border-[#D6A52A] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#E0E0E0] mb-1.5">{content.phoneLabel}</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={content.phonePlaceholder}
                      className="w-full px-3.5 py-2.5 bg-[#1F1F1F] text-white placeholder-[#777777] border border-[#383838] rounded-lg focus:outline-none focus:border-[#D6A52A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#E0E0E0] mb-1.5">{content.emailInputLabel}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={content.emailInputPlaceholder}
                      className="w-full px-3.5 py-2.5 bg-[#1F1F1F] text-white placeholder-[#777777] border border-[#383838] rounded-lg focus:outline-none focus:border-[#D6A52A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#E0E0E0] mb-1.5">{content.messageLabel}</label>
                  <textarea
                    required
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={content.messagePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-[#1F1F1F] text-white placeholder-[#777777] border border-[#383838] rounded-lg focus:outline-none focus:border-[#D6A52A] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#D6A52A] hover:bg-[#E5B93B] text-black font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? content.sendingButton : content.sendButton}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
