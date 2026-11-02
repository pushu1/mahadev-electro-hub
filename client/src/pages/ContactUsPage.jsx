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
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#50574F] selection:bg-[#DCE8D5] selection:text-[#26352A]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#7A8277] mb-6 flex-wrap font-medium">
          <Link to="/" className="hover:text-[#355E3B] transition-colors">{t('home')}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8BFA3]" />
          <span className="text-[#26352A] font-bold">{content.title}</span>
        </nav>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#355E3B] block mb-2">
            {content.eyebrow}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-[#26352A] tracking-tight leading-tight">
            {content.title}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#50574F] mt-2.5 leading-relaxed">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Store Info & Quick Contact Card */}
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E2E6DC] shadow-sm space-y-6 text-[#26352A]">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#26352A] pb-3 border-b border-[#E2E6DC]">
              {content.storeInfoTitle}
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#50574F]">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#F3F0E6] text-[#355E3B] shrink-0 border border-[#E2E6DC]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#26352A] font-bold text-sm mb-0.5">{content.storeLocationLabel}</strong>
                  <span className="text-[#50574F]">{content.storeLocationValue}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#F3F0E6] text-[#355E3B] shrink-0 border border-[#E2E6DC]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#26352A] font-bold text-sm mb-0.5">{content.helplineLabel}</strong>
                  <a href="tel:+917014248415" className="hover:text-[#355E3B] transition-colors font-semibold text-[#26352A]">
                    {content.helplinePhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#F3F0E6] text-[#355E3B] shrink-0 border border-[#E2E6DC]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#26352A] font-bold text-sm mb-0.5">{content.emailLabel}</strong>
                  <a href="mailto:mahadevelectohub@gmail.com" className="hover:text-[#355E3B] transition-colors text-[#26352A]">
                    {content.emailAddress}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#F3F0E6] text-[#355E3B] shrink-0 border border-[#E2E6DC]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#26352A] font-bold text-sm mb-0.5">{content.timingsLabel}</strong>
                  <span className="text-[#50574F]">{content.timingsValue}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E6DC] flex flex-wrap gap-3">
              <a
                href="https://wa.me/917014248415?text=Namaste%20Mahadev%20Electro%20Hub%2C%20mujhe%20products%20ke%20baare%20mein%20jankari%20chahiye."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] text-white font-bold text-xs hover:bg-[#20ba59] transition-colors shadow-sm active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{content.whatsappUsButton}</span>
              </a>
              <a
                href="mailto:mahadevelectohub@gmail.com?subject=Product%20Inquiry%20-%20Mahadev%20Electro%20Hub"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#E2E6DC] text-[#26352A] hover:border-[#355E3B] hover:text-[#355E3B] font-bold text-xs transition-colors shadow-2xs active:scale-95"
              >
                <Mail className="w-4 h-4 text-[#355E3B]" />
                <span>{content.emailUsButton}</span>
              </a>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E2E6DC] shadow-sm">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#26352A] pb-3 border-b border-[#E2E6DC] mb-5 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#355E3B]" />
              <span>{content.formTitle}</span>
            </h2>

            {submitted ? (
              <div className="p-6 bg-[#DCE8D5]/60 border border-[#A8BFA3]/50 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#2E7D46] mx-auto" />
                <h3 className="font-bold text-sm text-[#2E7D46]">{content.successTitle}</h3>
                <p className="text-xs text-[#50574F]">
                  {content.successDesc}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold text-[#355E3B] hover:text-[#294A30] underline mt-3 inline-block cursor-pointer"
                >
                  {content.sendAnotherButton}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-[#B94343] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#B94343]" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#26352A] mb-1.5">{content.nameLabel}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={content.namePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] text-[#26352A] placeholder-[#7A8277] border border-[#E2E6DC] rounded-lg focus:outline-none focus:border-[#355E3B] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#26352A] mb-1.5">{content.phoneLabel}</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={content.phonePlaceholder}
                      className="w-full px-3.5 py-2.5 bg-[#FFFFFF] text-[#26352A] placeholder-[#7A8277] border border-[#E2E6DC] rounded-lg focus:outline-none focus:border-[#355E3B] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#26352A] mb-1.5">{content.emailInputLabel}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={content.emailInputPlaceholder}
                      className="w-full px-3.5 py-2.5 bg-[#FFFFFF] text-[#26352A] placeholder-[#7A8277] border border-[#E2E6DC] rounded-lg focus:outline-none focus:border-[#355E3B] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#26352A] mb-1.5">{content.messageLabel}</label>
                  <textarea
                    required
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={content.messagePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] text-[#26352A] placeholder-[#7A8277] border border-[#E2E6DC] rounded-lg focus:outline-none focus:border-[#355E3B] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#355E3B] hover:bg-[#294A30] text-white font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
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
