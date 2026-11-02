import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, RotateCcw } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import ProductCard from '../components/common/ProductCard.jsx';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ShopPage() {
  const { t, getProductText } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const categoryParam = searchParams.get('category') || '';
  const subcategoryParam = searchParams.get('subcategory') || '';
  const qParam = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch categories for sidebar filter
    api.getCategories()
      .then(res => {
        if (res.success) setCategories(res.categories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (categoryParam) params.category = categoryParam;
    if (subcategoryParam) params.subcategory = subcategoryParam;
    if (qParam) params.q = qParam;
    if (sortParam) params.sort = sortParam;
    if (inStockParam) params.inStock = 'true';
    if (minPriceParam) params.minPrice = minPriceParam;
    if (maxPriceParam) params.maxPrice = maxPriceParam;

    api.getProducts(params)
      .then(res => {
        if (res.success && Array.isArray(res.products)) {
          setProducts(res.products);
          setTotalCount(res.total || res.products.length);
        }
      })
      .catch(err => {
        console.error('Error fetching products:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoryParam, subcategoryParam, qParam, sortParam, inStockParam, minPriceParam, maxPriceParam]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key === 'category') {
      newParams.delete('subcategory');
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const selectedCatObj = categories.find(c => c.slug === categoryParam || c.id === categoryParam);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0b0b] text-white relative overflow-x-hidden">
      <Header />

      {/* Persistent Animated Croma RGB Ambient Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="croma-rgb-orb-left top-[8%] -left-[18%] w-[600px] h-[600px] md:w-[850px] md:h-[850px]" />
        <div className="croma-rgb-orb-right top-[25%] -right-[18%] w-[550px] h-[550px] md:w-[800px] md:h-[800px]" />
        <div className="croma-rgb-orb-bottom top-[60%] -left-[14%] w-[550px] h-[550px] md:w-[750px] md:h-[750px]" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        {/* Title & Sorting */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white">
              {qParam ? `Search Results: "${qParam}"` : selectedCatObj ? getProductText(selectedCatObj, 'name') : t('allProducts')}
            </h1>
            <p className="text-xs text-[#B3B3B3] mt-1">
              {t('showingProducts').replace('{count}', totalCount)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-3.5 py-2 rounded-xl bg-[#242424] border border-[#444444] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#D6A52A]" />
              <span>{t('filterBy')}</span>
            </button>

            {/* Sorting */}
            <select
              value={sortParam}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-3.5 py-2 bg-[#242424] border border-[#444444] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#D6A52A] shadow-xs"
            >
              <option value="">{t('sortFeatured')}</option>
              <option value="price_asc">{t('sortPriceLowHigh')}</option>
              <option value="price_desc">{t('sortPriceHighLow')}</option>
              <option value="newest">{t('sortNewest')}</option>
            </select>
          </div>
        </div>

        {/* Sidebar + Products Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="bg-[#242424] p-5 rounded-2xl border border-[#383838] shadow-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#383838]">
                <span className="font-heading font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#D6A52A]" />
                  <span>{t('filterBy')}</span>
                </span>
                {(categoryParam || subcategoryParam || inStockParam || minPriceParam || maxPriceParam || qParam) && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[11px] text-red-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Categories Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#B3B3B3] mb-2.5">
                  {t('categories')}
                </h4>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => updateFilter('category', '')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      !categoryParam ? 'bg-[#D6A52A]/15 text-[#D6A52A] font-bold border border-[#D6A52A]/30' : 'text-[#B3B3B3] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t('allProducts')}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => updateFilter('category', cat.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        categoryParam === cat.slug || categoryParam === cat.id
                          ? 'bg-[#D6A52A]/15 text-[#D6A52A] font-bold border border-[#D6A52A]/30'
                          : 'text-[#B3B3B3] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{getProductText(cat, 'name')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories (if any) */}
              {selectedCatObj && Array.isArray(selectedCatObj.subcategories) && selectedCatObj.subcategories.length > 0 && (
                <div className="pt-3 border-t border-[#383838]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#B3B3B3] mb-2.5">
                    Subcategories
                  </h4>
                  <div className="space-y-1">
                    {selectedCatObj.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => updateFilter('subcategory', subcategoryParam === sub.id ? '' : sub.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          subcategoryParam === sub.id ? 'bg-[#D6A52A] text-black font-bold' : 'text-[#B3B3B3] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        • {getProductText(sub, 'name')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* In-Stock Filter */}
              <div className="pt-3 border-t border-[#383838]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#B3B3B3] mb-2.5">
                  Stock Availability
                </h4>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white font-medium">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                    className="rounded text-[#D6A52A] focus:ring-[#00A9A5] h-4 w-4"
                  />
                  <span>Sirf In-Stock Products</span>
                </label>
              </div>

              {/* Price Range Filter */}
              <div className="pt-3 border-t border-[#383838]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#B3B3B3] mb-2.5">
                  Price Range (₹)
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceParam}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#444444] bg-[#181818] text-white rounded-lg text-xs"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceParam}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#444444] bg-[#181818] text-white rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#242424] rounded-2xl h-80 animate-pulse border border-[#383838]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-[#242424] rounded-2xl p-8 sm:p-12 text-center border border-[#383838] max-w-lg mx-auto my-8 shadow-md">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">
                  {t('noProductsFound')}
                </h3>
                <p className="text-xs text-gray-500 mb-6 font-normal">
                  Kripya filters adjust karein ya reset karke sabhi products dekhein.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-brand-black text-[#D6A52A] font-bold text-xs rounded-xl shadow hover:bg-brand-charcoal transition-all"
                >
                  {t('clearFilters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Slide-out Drawer (< 1024px) */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#202020] border-l border-[#383838] text-white shadow-2xl flex flex-col justify-between z-50 p-5 overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#383838]">
                  <span className="font-heading font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-[#D6A52A]" />
                    <span>{t('filterBy')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-md text-[#B3B3B3] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#B3B3B3] mb-2">
                    {t('categories')}
                  </h4>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        updateFilter('category', '');
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs ${
                        !categoryParam ? 'bg-[#D6A52A]/15 text-[#D6A52A] font-bold border border-[#D6A52A]/30' : 'text-[#D1D5DB] hover:text-white'
                      }`}
                    >
                      {t('allProducts')}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          updateFilter('category', cat.slug);
                          setMobileFilterOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs ${
                          categoryParam === cat.slug || categoryParam === cat.id
                            ? 'bg-[#D6A52A]/15 text-[#D6A52A] font-bold border border-[#D6A52A]/30'
                            : 'text-[#D1D5DB] hover:text-white'
                        }`}
                      >
                        {getProductText(cat, 'name')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In Stock */}
                <div className="pt-3 border-t border-[#383838]">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white font-medium">
                    <input
                      type="checkbox"
                      checked={inStockParam}
                      onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                      className="rounded text-[#D6A52A] focus:ring-[#00A9A5] h-4 w-4"
                    />
                    <span>Sirf In-Stock Products</span>
                  </label>
                </div>

                {/* Price Range */}
                <div className="pt-3 border-t border-[#383838]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#B3B3B3] mb-2">
                    Price Range (₹)
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceParam}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#444444] bg-[#181818] text-white rounded-lg text-xs"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceParam}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#444444] bg-[#181818] text-white rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#383838] flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearAllFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#444444] bg-[#242424] text-xs font-bold text-white hover:bg-white/5"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#D6A52A] hover:bg-[#E5B93B] text-[#000000] text-xs font-bold shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
