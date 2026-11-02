import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function NotFoundPage() {
  const { t, language } = useLanguage();

  const texts = {
    en: {
      title: 'Page Not Found',
      desc: 'The page you are looking for may have been moved, renamed, or is temporarily unavailable.',
      homeBtn: 'Go to Homepage',
      shopBtn: 'Browse Products'
    },
    hi: {
      title: 'पृष्ठ नहीं मिला',
      desc: 'आप जिस पृष्ठ को खोज रहे हैं वह शायद स्थानांतरित कर दिया गया है या अनुपलब्ध है।',
      homeBtn: 'होमपेज पर जाएं',
      shopBtn: 'सभी उत्पाद देखें'
    },
    hinglish: {
      title: 'Page Nahi Mila',
      desc: 'Aap jis page ko dhoondh rahe hain woh move ho gaya hai ya abhi uplabdh nahi hai.',
      homeBtn: 'Home Par Jaayein',
      shopBtn: 'Products Dekhein'
    }
  };

  const c = texts[language] || texts.en;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-white selection:bg-[#D6A52A] selection:text-black">
      <Header />

      <main className="flex-1 max-w-lg mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
        <span className="text-6xl md:text-8xl font-black text-[#D6A52A] tracking-tight mb-2">
          404
        </span>
        <h1 className="text-2xl font-heading font-extrabold text-white mb-3">
          {c.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#D1D5DB] mb-8 max-w-sm leading-relaxed">
          {c.desc}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-[#D6A52A] hover:bg-[#E5B93B] text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 shadow-md active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>{c.homeBtn}</span>
          </Link>

          <Link
            to="/shop"
            className="px-6 py-3 border border-[#383838] bg-[#1E1E1E] text-white hover:border-[#D6A52A] hover:text-[#D6A52A] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
          >
            <span>{c.shopBtn}</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
