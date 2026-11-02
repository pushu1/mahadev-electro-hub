import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertCircle, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { api } from '../../services/api.js';

export default function Footer() {
  const { t, language, setLanguage } = useLanguage();

  // Newsletter state
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setNewsletterStatus('error');
      setNewsletterMessage(t('subscribedError', 'Please enter a valid email address.'));
      return;
    }

    try {
      setNewsletterStatus('loading');
      setNewsletterMessage('');
      const res = await api.subscribeNewsletter(email.trim());
      if (res && res.success) {
        setNewsletterStatus('success');
        setNewsletterMessage(res.message || t('subscribedSuccess', 'Thank you for subscribing!'));
        setEmail('');
      } else {
        throw new Error(res?.message || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      setNewsletterStatus('error');
      setNewsletterMessage(err.message || 'Unable to subscribe right now. Please try again later.');
    }
  };

  return (
    <footer className="bg-[#F3F0E6] text-[#252A25] border-t border-[#D5DDD2] select-none">
      {/* Main 4-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
          
          {/* ====================================================================
              COLUMN 1 — CONNECT WITH US
              ==================================================================== */}
          <div className="lg:pr-8 lg:border-r lg:border-[#D5DDD2] flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#171C17] mb-4">
                {t('connectWithUs')}
              </h3>

              {/* Newsletter Input */}
              <form onSubmit={handleNewsletterSubmit} className="mb-4">
                <div className="relative flex items-center bg-[#FFFFFF] rounded-lg p-1 border border-[#D5DDD2] shadow-inner focus-within:ring-2 focus-within:ring-[#24532F] transition-all">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (newsletterStatus !== 'idle') setNewsletterStatus('idle');
                    }}
                    placeholder={t('newsletterPlaceholder')}
                    aria-label={t('newsletterPlaceholder')}
                    className="w-full pl-3 pr-10 py-2 text-xs text-[#171C17] placeholder-[#596358] bg-transparent focus:outline-none"
                    disabled={newsletterStatus === 'loading'}
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === 'loading'}
                    aria-label="Subscribe to newsletter"
                    className="absolute right-1 w-8 h-8 rounded-md bg-[#24532F] hover:bg-[#183D22] text-[#FFFFFF] flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer shadow-xs"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Status Feedback Messages */}
                {newsletterStatus === 'success' && (
                  <p className="mt-2 text-xs text-[#2E7D46] font-medium flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{newsletterMessage}</span>
                  </p>
                )}
                {newsletterStatus === 'error' && (
                  <p className="mt-2 text-xs text-[#B94343] font-medium flex items-center gap-1.5 animate-fadeIn">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{newsletterMessage}</span>
                  </p>
                )}
              </form>

              {/* Social Media Icons */}
              <div className="pt-2">
                <div className="flex items-center gap-4">
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/maha.dev0535?cplk=MWl1YW5odGIxNmI0Zg%3D%3D&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Mahadev Electro Hub on Instagram"
                    className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#D5DDD2] hover:border-[#24532F] text-[#171C17] hover:text-[#24532F] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group shadow-xs"
                    title="Instagram"
                  >
                    <svg
                      className="w-4 h-4 fill-current transition-colors"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/share/1FMTYgopH3/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Mahadev Electro Hub on Facebook"
                    className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#D5DDD2] hover:border-[#24532F] text-[#171C17] hover:text-[#24532F] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group shadow-xs"
                    title="Facebook"
                  >
                    <svg
                      className="w-4 h-4 fill-current transition-colors"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/917014248415"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Connect with Mahadev Electro Hub on WhatsApp"
                    className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#D5DDD2] hover:border-[#25D366] text-[#171C17] hover:text-[#25D366] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group shadow-xs"
                    title="WhatsApp (+91 70142 48415)"
                  >
                    <svg
                      className="w-4 h-4 fill-current transition-colors"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Copyright Note */}
            <div className="pt-6 mt-6 border-t border-[#D5DDD2] lg:border-none lg:pt-0 lg:mt-0 text-[11px] text-[#596358]">
              {t('allRightsReserved')}
            </div>
          </div>

          {/* ====================================================================
              COLUMN 2 — USEFUL LINKS
              ==================================================================== */}
          <div className="lg:px-8 lg:border-r lg:border-[#D5DDD2]">
            <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#171C17] mb-4">
              {t('usefulLinks')}
            </h3>
            <ul className="space-y-2.5 text-xs text-[#252A25]">
              <li>
                <Link to="/about" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('faqs')}
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('shippingPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/return-refund-policy" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('returnRefundPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('termsConditions')}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* ====================================================================
              COLUMN 3 — PRODUCTS
              ==================================================================== */}
          <div className="lg:px-8 lg:border-r lg:border-[#D5DDD2]">
            <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#171C17] mb-4">
              {t('productsHeading')}
            </h3>
            <ul className="space-y-2.5 text-xs text-[#252A25]">
              <li>
                <Link to="/shop" className="hover:text-[#24532F] transition-colors block py-0.5 font-bold text-[#171C17]">
                  {t('allProducts')}
                </Link>
              </li>
              <li>
                <Link to="/category/torches" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('cat_torches')}
                </Link>
              </li>
              <li>
                <Link to="/category/zatka-machines" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('cat_zatka_machines')}
                </Link>
              </li>
              <li>
                <Link to="/category/solar-street-lights" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('cat_solar_street_lights')}
                </Link>
              </li>
              <li>
                <Link to="/category/headlamps" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('cat_headlamps')}
                </Link>
              </li>
              <li>
                <Link to="/category/small-pocket-torches" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('cat_small_pocket_torches')}
                </Link>
              </li>
              <li>
                <Link to="/category/rechargeable-fans" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('cat_rechargeable_fans')}
                </Link>
              </li>
              <li>
                <Link to="/category/bike-lights" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('cat_bike_lights')}
                </Link>
              </li>
              <li>
                <Link to="/category/solar-dc-products" className="hover:text-[#24532F] transition-colors block py-0.5">
                  {t('cat_solar_dc_products')}
                </Link>
              </li>
            </ul>
          </div>

          {/* ====================================================================
              COLUMN 4 — CONTACT US
              ==================================================================== */}
          <div className="lg:pl-8 flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#171C17] mb-4">
                {t('contactUsHeading')}
              </h3>
              
              <div className="space-y-3 text-xs text-[#252A25] mb-5">
                <div>
                  <span className="block text-[#171C17] font-bold text-sm">
                    Mahadev Electro Hub
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#596358] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#24532F] shrink-0" />
                    <span>{t('paliLocation')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#D5DDD2] space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#24532F] shrink-0" />
                    <a
                      href="tel:+917014248415"
                      className="text-[#171C17] hover:text-[#24532F] transition-colors font-semibold"
                    >
                      +91 70142 48415
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#24532F] shrink-0" />
                    <a
                      href="mailto:mahadevelectohub@gmail.com"
                      className="text-[#171C17] hover:text-[#24532F] transition-colors truncate font-semibold"
                      title="mahadevelectohub@gmail.com"
                    >
                      mahadevelectohub@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons: WhatsApp & Email Us */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  href="https://wa.me/917014248415?text=Namaste%20Mahadev%20Electro%20Hub%2C%20mujhe%20products%20ke%20baare%20mein%20jankari%20chahiye."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition-all duration-200 shadow-xs active:scale-95"
                >
                  <svg
                    className="w-4 h-4 fill-white shrink-0 drop-shadow-xs"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>{t('whatsappUs')}</span>
                </a>

                <a
                  href="mailto:mahadevelectohub@gmail.com?subject=Inquiry%20from%20Mahadev%20Electro%20Hub%20Website"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#D5DDD2] hover:border-[#24532F] text-[#171C17] hover:text-[#24532F] font-bold text-xs transition-colors shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-[#24532F]" />
                  <span>{t('emailUs')}</span>
                </a>
              </div>
            </div>

            {/* Language Switcher in Column 4 */}
            <div className="pt-6 mt-6 border-t border-[#D5DDD2]">
              <span className="block text-[11px] text-[#596358] mb-2 font-medium flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-[#24532F]" />
                <span>{t('websiteLanguage')}:</span>
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-[#24532F] text-white shadow-xs'
                      : 'bg-[#FFFFFF] text-[#252A25] hover:text-[#171C17] border border-[#D5DDD2]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hinglish')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    language === 'hinglish'
                      ? 'bg-[#24532F] text-white shadow-xs'
                      : 'bg-[#FFFFFF] text-[#252A25] hover:text-[#171C17] border border-[#D5DDD2]'
                  }`}
                >
                  Hinglish
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all font-devanagari cursor-pointer ${
                    language === 'hi'
                      ? 'bg-[#24532F] text-white shadow-xs'
                      : 'bg-[#FFFFFF] text-[#252A25] hover:text-[#171C17] border border-[#D5DDD2]'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Sub-Footer Bottom Bar */}
      <div className="border-t border-[#D5DDD2] bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#596358]">
          <div className="flex items-center gap-3">
            <span>{t('subFooterTagline')}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/track-order" className="hover:text-[#24532F] transition-colors font-medium">
              {t('trackOrder')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
