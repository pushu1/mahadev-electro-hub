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
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252A25] relative overflow-x-hidden">
      <Header />

      {/* Persistent Animated Ambient Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="croma-rgb-orb-left top-[8%] -left-[18%] w-[600px] h-[600px] md:w-[850px] md:h-[850px]" />
        <div className="croma-rgb-orb-right top-[25%] -right-[18%] w-[550px] h-[550px] md:w-[800px] md:h-[800px]" />
        <div className="croma-rgb-orb-bottom top-[60%] -left-[14%] w-[550px] h-[550px] md:w-[750px] md:h-[750px]" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        {/* Title & Sorting */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-[#171C17]">
              {qParam ? `Search Results: "${qParam}"` : selectedCatObj ? getProductText(selectedCatObj, 'name') : t('allProducts')}
            </h1>
            <p className="text-xs text-[#596358] mt-1 font-medium">
              {t('showingProducts').replace('{count}', totalCount)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#D5DDD2] text-[#171C17] text-xs font-bold flex items-center gap-1.5 shadow-xs hover:border-[#24532F] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#24532F]" />
              <span>{t('filterBy')}</span>
            </button>

            {/* Sorting */}
            <select
              value={sortParam}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-3.5 py-2 bg-[#FFFFFF] border border-[#D5DDD2] rounded-xl text-xs font-semibold text-[#171C17] focus:outline-none focus:border-[#24532F] shadow-xs cursor-pointer"
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
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D5DDD2] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#D5DDD2]">
                <span className="font-heading font-extrabold text-xs text-[#171C17] uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#24532F]" />
                  <span>{t('filterBy')}</span>
                </span>
                {(categoryParam || subcategoryParam || inStockParam || minPriceParam || maxPriceParam || qParam) && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[11px] text-[#B94343] font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Categories Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#596358] mb-2.5">
                  {t('categories')}
                </h4>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => updateFilter('category', '')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      !categoryParam ? 'bg-[#DCE8D5]/70 text-[#183D22] font-bold border border-[#356B3D]/50' : 'text-[#252A25] hover:text-[#171C17] hover:bg-[#F3F0E6]'
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
                          ? 'bg-[#DCE8D5]/70 text-[#183D22] font-bold border border-[#356B3D]/50'
                          : 'text-[#252A25] hover:text-[#171C17] hover:bg-[#F3F0E6]'
                      }`}
                    >
                      <span>{getProductText(cat, 'name')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories (if any) */}
              {selectedCatObj && Array.isArray(selectedCatObj.subcategories) && selectedCatObj.subcategories.length > 0 && (
                <div className="pt-3 border-t border-[#D5DDD2]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#596358] mb-2.5">
                    Subcategories
                  </h4>
                  <div className="space-y-1">
                    {selectedCatObj.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => updateFilter('subcategory', subcategoryParam === sub.id ? '' : sub.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          subcategoryParam === sub.id ? 'bg-[#24532F] text-white font-bold' : 'text-[#252A25] hover:text-[#171C17] hover:bg-[#F3F0E6]'
                        }`}
                      >
                        • {getProductText(sub, 'name')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* In-Stock Filter */}
              <div className="pt-3 border-t border-[#D5DDD2]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#596358] mb-2.5">
                  Stock Availability
                </h4>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#171C17] font-medium">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                    className="rounded text-[#24532F] focus:ring-[#24532F] h-4 w-4"
                  />
                  <span>Sirf In-Stock Products</span>
                </label>
              </div>

              {/* Price Range Filter */}
              <div className="pt-3 border-t border-[#D5DDD2]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#596358] mb-2.5">
                  Price Range (₹)
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceParam}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#D5DDD2] bg-[#FFFFFF] text-[#171C17] rounded-lg text-xs focus:outline-none focus:border-[#24532F]"
                  />
                  <span className="text-[#596358]">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceParam}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#D5DDD2] bg-[#FFFFFF] text-[#171C17] rounded-lg text-xs focus:outline-none focus:border-[#24532F]"
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
                  <div key={i} className="bg-[#FFFFFF] rounded-2xl h-80 animate-pulse border border-[#D5DDD2]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-[#FFFFFF] rounded-2xl p-8 sm:p-12 text-center border border-[#D5DDD2] max-w-lg mx-auto my-8 shadow-sm">
                <Search className="w-12 h-12 text-[#356B3D] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#171C17] mb-2">
                  {t('noProductsFound')}
                </h3>
                <p className="text-xs text-[#252A25] mb-6 font-normal">
                  Kripya filters adjust karein ya reset karke sabhi products dekhein.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[#24532F] hover:bg-[#183D22] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
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
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#FFFFFF] border-l border-[#D5DDD2] text-[#171C17] shadow-2xl flex flex-col justify-between z-50 p-5 overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#D5DDD2]">
                  <span className="font-heading font-extrabold text-sm text-[#171C17] uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-[#24532F]" />
                    <span>{t('filterBy')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-md text-[#252A25] hover:text-[#171C17]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#596358] mb-2">
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
                        !categoryParam ? 'bg-[#DCE8D5]/70 text-[#183D22] font-bold border border-[#356B3D]/50' : 'text-[#252A25] hover:text-[#171C17] hover:bg-[#F3F0E6]'
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
                            ? 'bg-[#DCE8D5]/70 text-[#183D22] font-bold border border-[#356B3D]/50'
                            : 'text-[#252A25] hover:text-[#171C17] hover:bg-[#F3F0E6]'
                        }`}
                      >
                        {getProductText(cat, 'name')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In Stock */}
                <div className="pt-3 border-t border-[#D5DDD2]">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#171C17] font-medium">
                    <input
                      type="checkbox"
                      checked={inStockParam}
                      onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                      className="rounded text-[#24532F] focus:ring-[#24532F] h-4 w-4"
                    />
                    <span>Sirf In-Stock Products</span>
                  </label>
                </div>

                {/* Price Range */}
                <div className="pt-3 border-t border-[#D5DDD2]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#596358] mb-2">
                    Price Range (₹)
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceParam}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#D5DDD2] bg-[#FFFFFF] text-[#171C17] rounded-lg text-xs focus:outline-none focus:border-[#24532F]"
                    />
                    <span className="text-[#596358]">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceParam}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#D5DDD2] bg-[#FFFFFF] text-[#171C17] rounded-lg text-xs focus:outline-none focus:border-[#24532F]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#D5DDD2] flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearAllFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#D5DDD2] bg-[#F3F0E6] text-xs font-bold text-[#171C17] hover:bg-[#EAE6D8]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#24532F] hover:bg-[#183D22] text-white text-xs font-bold shadow-xs cursor-pointer"
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
