import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import ProductCard from '../components/common/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function WishlistPage() {
  const { wishlist } = useAuth();
  const { t, language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const emptyTexts = {
    en: {
      title: 'Your Wishlist is Empty',
      desc: 'Click the heart icon on any product to save it to your wishlist for later.',
      btn: 'Explore Products'
    },
    hi: {
      title: 'आपकी विशलिस्ट अभी खाली है',
      desc: 'अपनी पसंद के उत्पादों को सहेजने के लिए किसी भी उत्पाद पर हार्ट आइकन पर क्लिक करें।',
      btn: 'उत्पाद देखें'
    },
    hinglish: {
      title: 'Aapki Wishlist Abhi Khali Hai',
      desc: 'Kisi bhi product par heart icon par click karke apni pasand save karein.',
      btn: 'Products Dekhein'
    }
  };

  const emptyInfo = emptyTexts[language] || emptyTexts.en;

  useEffect(() => {
    window.scrollTo(0, 0);

    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    api.getProducts()
      .then(res => {
        if (res.success && Array.isArray(res.products)) {
          const wishlisted = res.products.filter(p => wishlist.includes(p.id));
          setProducts(wishlisted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [wishlist]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#50574F]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-[#26352A] mb-6 flex items-center gap-2">
          <Heart className="w-6 h-6 text-[#B94343] fill-[#B94343]" />
          <span>{t('wishlist')} ({wishlist.length})</span>
        </h1>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#7A8277]">Loading wishlist...</div>
        ) : products.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-2xl p-8 sm:p-12 text-center border border-[#E2E6DC] text-[#26352A] max-w-md mx-auto my-12 shadow-sm">
            <Heart className="w-16 h-16 text-[#A8BFA3] mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#26352A] mb-2">{emptyInfo.title}</h2>
            <p className="text-xs sm:text-sm text-[#50574F] mb-6 leading-relaxed">
              {emptyInfo.desc}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#355E3B] hover:bg-[#294A30] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-95"
            >
              <span>{emptyInfo.btn}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
