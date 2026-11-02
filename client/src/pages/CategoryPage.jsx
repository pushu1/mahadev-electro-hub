import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import ProductCard from '../components/common/ProductCard.jsx';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Zap, ChevronRight } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories.js';

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const subParam = searchParams.get('sub');
  const { t, getProductText } = useLanguage();

  const fallbackCat = DEFAULT_CATEGORIES.find(c => c.slug === slug || c.id === slug) || null;
  const [category, setCategory] = useState(fallbackCat);
  const [products, setProducts] = useState([]);
  const [activeSubcategory, setActiveSubcategory] = useState('');
  const [loading, setLoading] = useState(!fallbackCat);

  useEffect(() => {
    window.scrollTo(0, 0);

    const initialCat = DEFAULT_CATEGORIES.find(c => c.slug === slug || c.id === slug);
    if (initialCat) {
      setCategory(initialCat);
      if (subParam && initialCat.subcategories) {
        const matched = initialCat.subcategories.find(s => s.slug === subParam || s.id === subParam);
        if (matched) setActiveSubcategory(matched.id);
      }
    } else {
      setLoading(true);
      setActiveSubcategory('');
    }

    api.getCategory(slug)
      .then(res => {
        if (res.success && res.category) {
          setCategory(res.category);
          if (subParam && res.category.subcategories) {
            const matched = res.category.subcategories.find(s => s.slug === subParam || s.id === subParam);
            if (matched) setActiveSubcategory(matched.id);
          }
          return api.getProducts({ category: res.category.id });
        }
      })
      .then(pRes => {
        if (pRes && pRes.success && Array.isArray(pRes.products)) {
          setProducts(pRes.products);
        }
      })
      .catch(err => {
        console.error('Error loading category:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, subParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#181818] text-white">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#D6A52A] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-white">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('productNotFound')}</h2>
          <Link to="/shop" className="text-[#D6A52A] font-bold underline">
            {t('browseAllProducts')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryName = getProductText(category, 'name');
  const categoryDesc = getProductText(category, 'description');

  const filteredProducts = activeSubcategory
    ? products.filter(p => p.subcategoryId === activeSubcategory)
    : products;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-white">
      <Header />

      <main className="flex-1">
        {/* Category Hero Banner */}
        <div className="relative bg-[#141414] text-white py-14 sm:py-16 px-4 overflow-hidden border-b border-[#383838]">
          <div className="absolute inset-0 z-0">
            <img
              src={category.bannerImage || category.image}
              alt={categoryName}
              className="w-full h-full object-cover object-center opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/90 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 font-medium">
              <Link to="/" className="hover:text-[#D6A52A]">{t('home')}</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/shop" className="hover:text-[#D6A52A]">{t('categories')}</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#D6A52A] font-bold">{categoryName}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-heading font-extrabold mb-3 text-white tracking-tight">
              {categoryName}
            </h1>
            {categoryDesc && (
              <p className="text-sm md:text-base text-[#D1D5DB] max-w-2xl leading-relaxed font-normal">
                {categoryDesc}
              </p>
            )}
          </div>
        </div>

        {/* Subcategories Filter Pills */}
        {Array.isArray(category.subcategories) && category.subcategories.length > 0 && (
          <div className="border-b border-[#383838] bg-[#141414] py-3.5 sticky top-[60px] md:top-[85px] z-20 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2.5 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveSubcategory('')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeSubcategory === ''
                    ? 'bg-[#D6A52A] text-black shadow-xs'
                    : 'bg-[#242424] text-[#B3B3B3] hover:text-white hover:bg-[#2D2D2D] border border-[#383838]'
                }`}
              >
                {t('allProducts')}
              </button>

              {category.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setActiveSubcategory(sub.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeSubcategory === sub.id
                      ? 'bg-[#171717] text-[#D6A52A] border border-[#D6A52A]/50 shadow-xs'
                      : 'bg-[#242424] text-[#B3B3B3] hover:text-white hover:bg-[#2D2D2D] border border-[#383838]'
                  }`}
                >
                  {getProductText(sub, 'name')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-[#B3B3B3] font-semibold">
              {t('showingProducts').replace('{count}', filteredProducts.length)} ({categoryName})
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-[#242424] p-12 text-center rounded-2xl border border-[#383838] text-white max-w-md mx-auto shadow-xs">
              <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-white mb-4">
                {t('noProductsFound')}
              </p>
              <button
                type="button"
                onClick={() => setActiveSubcategory('')}
                className="text-xs font-bold text-[#D6A52A] hover:underline"
              >
                {t('viewAll')} {categoryName}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
