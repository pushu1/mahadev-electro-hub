import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import AnnouncementBar from './AnnouncementBar.jsx';
import { DEFAULT_CATEGORIES } from '../../data/defaultCategories.js';

export default function Header() {
  const { language, setLanguage, productLang, setProductLang, t, getProductText } = useLanguage();
  const { cartCount, subtotal, openCartDrawer } = useCart();
  const { isCustomerAuthenticated, customerUser, logoutCustomer, wishlist } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialized with canonical default categories so categories and dropdowns
  // are immediately available without flash, even if the backend is slow or offline.
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuTimeoutRef = useRef(null);
  const searchDebounceRef = useRef(null);

  // Dynamic category sync from API / Admin CMS with live focus/storage updates
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = () => {
      api.getCategories()
        .then(res => {
          if (isMounted && res && res.success && Array.isArray(res.categories) && res.categories.length > 0) {
            const navCats = res.categories.filter(c => c.showInNav !== false);
            if (navCats.length > 0) {
              setCategories(navCats);
            }
          }
        })
        .catch(() => {
          // If API fails or backend is unreachable, gracefully preserve default categories
        });
    };

    fetchCategories();

    // Dynamically update categories when returning from Admin Panel or another tab
    window.addEventListener('focus', fetchCategories);
    window.addEventListener('storage', fetchCategories);
    window.addEventListener('meh_categories_updated', fetchCategories);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', fetchCategories);
      window.removeEventListener('storage', fetchCategories);
      window.removeEventListener('meh_categories_updated', fetchCategories);
    };
  }, []);

  // Close open dropdowns on route changes
  useEffect(() => {
    setActiveMenuId(null);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open to prevent page scrolling behind it
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [mobileMenuOpen]);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      api.searchProducts(searchQuery.trim())
        .then((res) => {
          if (res && res.success && Array.isArray(res.products)) {
            setSearchResults(res.products.slice(0, 6));
          } else {
            setSearchResults([]);
          }
        })
        .catch(() => {
          setSearchResults([]);
        })
        .finally(() => {
          setSearchLoading(false);
        });
    }, 280);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  // Global Escape key closes all floating menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
        setSearchOpen(false);
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hover bridge handlers for mega menu
  const handleCategoryMouseEnter = (catId) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMenuId(catId);
  };

  const handleCategoryMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenuId(null);
    }, 200);
  };

  const handleMegaMenuMouseEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
  };

  const handleMegaMenuMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenuId(null);
    }, 200);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F6] select-none shadow-sm">
      {/* 1. ANNOUNCEMENT BAR */}
      <AnnouncementBar />

      {/* 2. MAIN BRAND HEADER */}
      <div className="relative w-full h-[72px] sm:h-[84px] md:h-[92px] border-b border-[#E2E6DC] bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* LEFT COLUMN: Hamburger (<1024px) / Search Toggle (<768px) / Desktop Search Bar */}
          <div className="flex items-center gap-1.5 xs:gap-2 lg:gap-3 flex-1 max-w-[110px] xs:max-w-[130px] md:max-w-[380px] lg:max-w-[420px] xl:max-w-[460px] z-20">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-[36px] h-[36px] xs:w-[38px] xs:h-[38px] sm:w-10 sm:h-10 rounded-[6px] border border-[#E2E6DC] bg-[#FFFFFF] flex items-center justify-center text-[#26352A] hover:text-[#355E3B] hover:border-[#8BA889] lg:hidden transition-colors shrink-0 shadow-xs"
              aria-label="Navigation Menu Toggle"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 xs:w-5 xs:h-5" /> : <Menu className="w-4 h-4 xs:w-5 xs:h-5" />}
            </button>

            {/* Mobile Search Icon Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-[36px] h-[36px] xs:w-[38px] xs:h-[38px] sm:w-10 sm:h-10 rounded-[6px] border border-[#E2E6DC] bg-[#FFFFFF] flex items-center justify-center text-[#26352A] hover:text-[#355E3B] hover:border-[#8BA889] md:hidden transition-colors shrink-0 shadow-xs"
              aria-label="Search"
            >
              <Search className="w-4 h-4 xs:w-5 xs:h-5" />
            </button>

            {/* Desktop Long Search Bar */}
            <div className="relative hidden md:block w-full max-w-[300px] md:max-w-[340px] lg:max-w-[400px] xl:max-w-[440px]">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full h-[42px] md:h-[44px] bg-[#FFFFFF] focus:bg-[#FFFFFF] text-xs lg:text-[13px] text-[#26352A] placeholder-[#7A8277] pl-10 pr-4 rounded-lg border border-[#E2E6DC] hover:border-[#8BA889] focus:border-[#8BA889] focus:outline-none focus:ring-1 focus:ring-[#8BA889] transition-all shadow-2xs"
                />
                <Search className="w-4 h-4 text-[#7A8277] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </form>

              {/* Search Suggestions Dropdown */}
              {searchQuery.trim().length >= 2 && (
                <div className="absolute left-0 top-full mt-2 w-full min-w-[320px] bg-[#FFFFFF] text-[#26352A] rounded-xl shadow-xl border border-[#E2E6DC] p-3 z-50 animate-fadeIn text-left">
                  {searchLoading ? (
                    <div className="py-3 text-center text-xs text-[#7A8277]">{t('searchLoading')}</div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold text-[#7A8277] px-1">{t('matchingProducts')}</div>
                      {searchResults.map((prod) => (
                        <Link
                          key={prod.id}
                          to={`/product/${prod.slug || prod.id}`}
                          onClick={() => setSearchQuery('')}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F3F0E6] transition-colors group"
                        >
                          <img
                            src={prod.mainImage || '/images/logo.png'}
                            alt={getProductText(prod, 'title')}
                            className="w-9 h-9 object-cover rounded-[4px] bg-[#FAF9F6] border border-[#E2E6DC] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#26352A] group-hover:text-[#355E3B] truncate">
                              {getProductText(prod, 'title')}
                            </p>
                            <span className="text-[11px] font-mono text-[#355E3B] font-bold">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full mt-1.5 py-1.5 text-center text-[11px] font-bold text-[#355E3B] hover:underline bg-[#F3F0E6] hover:bg-[#DCE8D5] rounded-lg"
                      >
                        {t('viewAllResults')}
                      </button>
                    </div>
                  ) : (
                    <div className="py-3 text-center text-xs text-[#7A8277]">{t('noProductsFound')}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CENTER COLUMN: Official Brand Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-auto">
            <Link
              to="/"
              className="flex items-center justify-center group"
              aria-label="Mahadev Electro Hub Home"
            >
              <img
                src="/images/logo.png"
                alt="Mahadev Electro Hub"
                className="h-8 xs:h-10 sm:h-13 md:h-16 w-auto max-w-[95px] xs:max-w-[130px] sm:max-w-[180px] md:max-w-none object-contain hover:scale-105 transition-transform duration-300 drop-shadow-xs"
              />
            </Link>
          </div>

          {/* RIGHT COLUMN: Language Segmented Control, Wishlist, User, Cart */}
          <div className="flex items-center justify-end gap-1 xs:gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-3.5 flex-1 max-w-[150px] xs:max-w-[190px] md:max-w-[380px] lg:max-w-[420px] xl:max-w-[460px] ml-auto z-20">
            
            {/* Language Selector: Compact 3-option segmented control */}
            <div className="hidden sm:flex items-center bg-[#FFFFFF] border border-[#E2E6DC] rounded-lg p-0.5 sm:p-1 shadow-xs h-[42px] md:h-[44px] w-[148px] md:w-[158px] justify-between gap-0.5">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex-1 h-full rounded-[4px] text-[11px] font-bold transition-all flex items-center justify-center ${
                  language === 'en'
                    ? 'bg-[#355E3B] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#50574F] hover:text-[#26352A] hover:bg-[#F3F0E6]'
                }`}
                title="English (Default)"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hinglish')}
                className={`flex-1 h-full rounded-[4px] text-[11px] font-bold transition-all flex items-center justify-center ${
                  language === 'hinglish'
                    ? 'bg-[#355E3B] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#50574F] hover:text-[#26352A] hover:bg-[#F3F0E6]'
                }`}
                title="Hinglish (Roman Hindi)"
              >
                Hinglish
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`flex-1 h-full rounded-[4px] text-[11px] font-bold transition-all font-devanagari flex items-center justify-center ${
                  language === 'hi'
                    ? 'bg-[#355E3B] text-[#FFFFFF] font-bold shadow-xs'
                    : 'text-[#50574F] hover:text-[#26352A] hover:bg-[#F3F0E6]'
                }`}
                title="हिंदी (Devanagari)"
              >
                हिंदी
              </button>
            </div>

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="hidden xs:flex w-[36px] h-[36px] xs:w-[38px] xs:h-[38px] sm:w-[42px] sm:h-[42px] md:w-[44px] md:h-[44px] rounded-[6px] border border-[#E2E6DC] bg-[#FFFFFF] hover:border-[#8BA889] hover:bg-[#F3F0E6] transition-all items-center justify-center text-[#26352A] hover:text-[#355E3B] relative shrink-0 shadow-xs group"
              title="Aapki Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 xs:w-5 xs:h-5 text-[#26352A] group-hover:text-[#355E3B] transition-colors" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] xs:min-w-[18px] h-[16px] xs:h-[18px] px-1 bg-[#355E3B] text-[#FFFFFF] font-black text-[8px] xs:text-[9px] rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Customer Account Button */}
            <div className="relative shrink-0">
              {isCustomerAuthenticated ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-[36px] h-[36px] xs:w-[38px] xs:h-[38px] sm:w-[42px] sm:h-[42px] md:w-[44px] md:h-[44px] rounded-[6px] border border-[#E2E6DC] bg-[#FFFFFF] hover:border-[#8BA889] hover:bg-[#F3F0E6] transition-all flex items-center justify-center text-[#26352A] hover:text-[#355E3B] shadow-xs"
                    aria-label="Customer Account"
                  >
                    <div className="w-6 h-6 xs:w-7 xs:h-7 rounded-full bg-[#DCE8D5] text-[#294A30] font-bold text-[11px] xs:text-xs flex items-center justify-center shadow-xs">
                      {customerUser?.name?.[0]?.toUpperCase() || 'C'}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] text-[#26352A] rounded-xl shadow-xl py-2 z-50 animate-fadeIn border border-[#E2E6DC]">
                      <div className="px-4 py-2 border-b border-[#E2E6DC] text-[11px]">
                        <span className="text-[#7A8277] block">Signed in as</span>
                        <strong className="text-[#26352A] truncate block">{customerUser?.name}</strong>
                      </div>
                      <Link
                        to="/my-account"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs text-[#26352A] hover:bg-[#F3F0E6] hover:text-[#355E3B]"
                      >
                        👤 {t('myAccount')}
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs text-[#26352A] hover:bg-[#F3F0E6] hover:text-[#355E3B]"
                      >
                        📦 My Orders
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logoutCustomer();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#B94343] hover:bg-red-50 font-semibold"
                      >
                        🚪 {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="w-[36px] h-[36px] xs:w-[38px] xs:h-[38px] sm:w-[42px] sm:h-[42px] md:w-[44px] md:h-[44px] rounded-[6px] border border-[#E2E6DC] bg-[#FFFFFF] hover:border-[#8BA889] hover:bg-[#F3F0E6] transition-all flex items-center justify-center text-[#26352A] hover:text-[#355E3B] shadow-xs group"
                  title="Customer Login"
                  aria-label="Customer Login"
                >
                  <User className="w-4 h-4 xs:w-5 xs:h-5 text-[#26352A] group-hover:text-[#355E3B] transition-colors" />
                </Link>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={openCartDrawer}
              className="h-[36px] xs:h-[38px] sm:h-[42px] md:h-[44px] px-2 xs:px-2.5 sm:px-3.5 min-w-[36px] xs:min-w-[38px] sm:min-w-[84px] md:min-w-[88px] max-w-none sm:max-w-[96px] rounded-[6px] border border-[#E2E6DC] bg-[#FFFFFF] hover:border-[#8BA889] hover:bg-[#F3F0E6] transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-[#26352A] shadow-xs group relative shrink-0"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 xs:w-5 xs:h-5 text-[#26352A] group-hover:text-[#355E3B] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] xs:min-w-[18px] h-[16px] xs:h-[18px] px-1 bg-[#355E3B] text-white font-black text-[8px] xs:text-[9px] rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-[#26352A] font-mono">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Expandable Search Bar (< 768px) */}
        {searchOpen && (
          <div className="md:hidden px-3 sm:px-4 py-2.5 bg-[#FAF9F6] border-b border-[#E2E6DC] animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full h-[40px] bg-[#FFFFFF] text-xs text-[#26352A] placeholder-[#7A8277] pl-9 pr-3 rounded-lg border border-[#E2E6DC] focus:border-[#8BA889] focus:outline-none focus:ring-1 focus:ring-[#8BA889]"
                autoFocus
              />
              <Search className="w-4 h-4 text-[#7A8277] absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        )}
      </div>

      {/* TOUCH-FRIENDLY HORIZONTAL CATEGORY BAR (< 1024px) */}
      <div className="lg:hidden bg-[#FAF9F6] border-b border-[#E2E6DC] py-2 px-3 overflow-x-auto scrollbar-none whitespace-nowrap">
        <div className="flex items-center gap-1.5 xs:gap-2">
          <Link
            to="/shop"
            className={`px-2.5 xs:px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 text-xs ${
              location.pathname === '/shop'
                ? 'bg-[#355E3B] text-[#FFFFFF] font-bold shadow-xs'
                : 'bg-[#FFFFFF] border border-[#E2E6DC] text-[#26352A] hover:border-[#8BA889] hover:text-[#355E3B]'
            }`}
          >
            {t('allProducts')}
          </Link>
          {categories.map((cat) => {
            const isCurrent = location.pathname === `/category/${cat.slug}`;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`px-2.5 xs:px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 text-xs ${
                  isCurrent
                    ? 'bg-[#355E3B] text-[#FFFFFF] font-bold shadow-xs'
                    : 'bg-[#FFFFFF] border border-[#E2E6DC] text-[#26352A] hover:border-[#8BA889] hover:text-[#355E3B]'
                }`}
              >
                {getProductText(cat, 'name')}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. PRODUCT NAVIGATION ROW (Desktop lg:block) */}
      <nav
        className="hidden lg:block bg-[#FAF9F6] border-b border-[#E2E6DC] relative z-40"
        aria-label="Product Categories Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-1 xl:gap-3 2xl:gap-5 h-12 overflow-x-auto lg:overflow-visible scrollbar-none whitespace-nowrap">
            
            {/* 1. All Products */}
            <div className="relative flex items-center h-full shrink-0">
              <Link
                to="/shop"
                className={`py-3 px-1 lg:px-1.5 xl:px-2.5 text-[11px] xl:text-[13px] font-semibold transition-colors border-b-2 ${
                  location.pathname === '/shop'
                    ? 'text-[#355E3B] border-[#355E3B] font-bold'
                    : 'text-[#26352A] hover:text-[#355E3B] border-transparent'
                }`}
              >
                {t('allProducts')}
              </Link>
            </div>

            {/* Categories 2 to 9 */}
            {categories.map((cat, idx) => {
              const hasSub = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;
              const isActive = activeMenuId === cat.id;
              const isRightAligned = idx >= categories.length - 4;
              const catName = getProductText(cat, 'name');

              return (
                <div
                  key={cat.id}
                  className="relative flex items-center h-full shrink-0"
                  onMouseEnter={() => handleCategoryMouseEnter(cat.id)}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className={`py-3 px-1 lg:px-1.5 xl:px-2.5 text-[11px] xl:text-[13px] font-semibold flex items-center gap-0.5 xl:gap-1 transition-colors border-b-2 ${
                      isActive || location.pathname === `/category/${cat.slug}`
                        ? 'text-[#355E3B] border-[#355E3B] font-bold'
                        : 'text-[#26352A] hover:text-[#355E3B] border-transparent'
                    }`}
                  >
                    <span>{catName}</span>
                    {hasSub && (
                      <ChevronDown
                        className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform duration-200 ${
                          isActive ? 'rotate-180 text-[#355E3B]' : 'text-[#7A8277]'
                        }`}
                      />
                    )}
                  </Link>

                  {/* MEGA MENU DROPDOWN */}
                  {isActive && hasSub && (
                    <div
                      className={`absolute top-full z-50 pt-1.5 ${
                        isRightAligned ? 'right-0 left-auto' : 'left-0 right-auto'
                      }`}
                      onMouseEnter={handleMegaMenuMouseEnter}
                      onMouseLeave={handleMegaMenuMouseLeave}
                      role="region"
                      aria-label={`${catName} Submenu`}
                    >
                      <div className="bg-[#FFFFFF] rounded-xl shadow-xl border border-[#E2E6DC] p-3.5 w-60 sm:w-64 max-w-[calc(100vw-32px)] box-border animate-fadeIn text-left">
                        <div className="text-[11px] font-bold text-[#7A8277] uppercase tracking-wider pb-1.5 mb-1.5 border-b border-[#E2E6DC]">
                          {catName} {t('categoryTypes')}
                        </div>
                        
                        <ul className="space-y-1">
                          {cat.subcategories.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                to={`/category/${cat.slug}?sub=${sub.slug}`}
                                onClick={() => setActiveMenuId(null)}
                                className="text-xs text-[#50574F] hover:text-[#355E3B] hover:bg-[#F3F0E6] px-2.5 py-1.5 rounded-lg block font-medium transition-colors break-words whitespace-normal"
                              >
                                {getProductText(sub, 'name')}
                              </Link>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-2 mt-2 border-t border-[#E2E6DC]">
                          <Link
                            to={`/category/${cat.slug}`}
                            onClick={() => setActiveMenuId(null)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#355E3B] hover:underline px-2"
                          >
                            <span>{t('viewAll')} {catName}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* MOBILE NAVIGATION DRAWER (< 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity z-[60]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 max-w-[280px] sm:max-w-xs w-full bg-[#FFFFFF] border-r border-[#E2E6DC] text-[#26352A] flex flex-col justify-between shadow-2xl z-[61]">
            {/* Header */}
            <div className="p-4 border-b border-[#E2E6DC] flex items-center justify-between bg-[#FAF9F6] shrink-0">
              <div className="flex items-center gap-2">
                <img src="/images/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
                <span className="font-heading text-sm font-bold text-[#26352A]">
                  Mahadev Electro Hub
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg border border-[#E2E6DC] bg-[#FFFFFF] flex items-center justify-center text-[#7A8277] hover:text-[#26352A]"
                aria-label="Menu Band Karein"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Accordion List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 divide-y divide-[#E2E6DC]">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-2 text-xs font-bold text-[#26352A] hover:text-[#355E3B] rounded-lg"
              >
                {t('home')}
              </Link>
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-2 text-xs font-bold text-[#355E3B] rounded-lg"
              >
                {t('allProducts')}
              </Link>

              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-[#7A8277] block mb-2 px-2">{t('categories')}</span>
                {categories.map((cat) => {
                  const hasSub = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;
                  const isExpanded = mobileExpandedCat === cat.id;
                  const catName = getProductText(cat, 'name');

                  return (
                    <div key={cat.id} className="py-1">
                      <div className="flex items-center justify-between px-2">
                        <Link
                          to={`/category/${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-xs font-semibold text-[#26352A] hover:text-[#355E3B] py-1.5 flex-1"
                        >
                          {catName}
                        </Link>
                        {hasSub && (
                          <button
                            type="button"
                            onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                            className="p-1.5 text-[#7A8277] hover:text-[#355E3B] rounded-lg"
                            aria-label={`${catName} Submenu Toggle`}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-[#355E3B]' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {isExpanded && hasSub && (
                        <div className="pl-4 pr-1 py-1 space-y-1 bg-[#F3F0E6] rounded-lg my-1 border border-[#E2E6DC]">
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub.id}
                              to={`/category/${cat.slug}?sub=${sub.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block py-1.5 px-2 text-[11px] text-[#50574F] hover:text-[#355E3B] rounded-[3px] transition-colors"
                            >
                              • {getProductText(sub, 'name')}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Utility Links */}
              <div className="pt-3 space-y-2 px-2">
                <Link
                  to="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs text-[#50574F] hover:text-[#355E3B] py-1"
                >
                  📦 {t('trackOrder')}
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs text-[#50574F] hover:text-[#355E3B] py-1"
                >
                  🏢 {t('aboutUs')}
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs text-[#50574F] hover:text-[#355E3B] py-1"
                >
                  📞 {t('contactUs')}
                </Link>
              </div>
            </div>

            {/* Mobile Footer (Language & Account CTA) */}
            <div className="p-4 border-t border-[#E2E6DC] bg-[#FAF9F6] space-y-3 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7A8277] text-[11px] font-medium">{t('websiteLanguage')}:</span>
                <div className="flex gap-1 bg-[#FFFFFF] p-1 rounded-lg border border-[#E2E6DC]">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold transition-all ${
                      language === 'en' ? 'bg-[#355E3B] text-white font-bold shadow-xs' : 'text-[#50574F] hover:text-[#26352A]'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hinglish')}
                    className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold transition-all ${
                      language === 'hinglish' ? 'bg-[#355E3B] text-white font-bold shadow-xs' : 'text-[#50574F] hover:text-[#26352A]'
                    }`}
                  >
                    Hinglish
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold font-devanagari transition-all ${
                      language === 'hi' ? 'bg-[#355E3B] text-white font-bold shadow-xs' : 'text-[#50574F] hover:text-[#26352A]'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {/* Account Link */}
              {isCustomerAuthenticated ? (
                <Link
                  to="/my-account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg bg-[#FFFFFF] border border-[#E2E6DC] text-center text-xs font-bold text-[#26352A] block hover:bg-[#F3F0E6]"
                >
                  {t('myAccount')} ({customerUser?.name?.split(' ')[0]})
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg bg-[#355E3B] hover:bg-[#294A30] text-[#FFFFFF] text-center text-xs font-bold block shadow-xs transition-all"
                >
                  {t('customerLogin')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
