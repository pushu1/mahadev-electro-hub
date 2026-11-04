import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuickView } from '../../context/QuickViewContext.jsx';

export default function ProductCard({ product }) {
  const { t, getProductText } = useLanguage();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useAuth();
  const { openQuickView } = useQuickView();
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const title = getProductText(product, 'title');
  const shortDesc = getProductText(product, 'short_description');
  const isOutOfStock = (product.stockQuantity || 0) <= 0;
  const isLowStock = (product.stockQuantity || 0) > 0 && (product.stockQuantity || 0) <= 5;
  const isWishlisted = wishlist.includes(product.id);

  // Discount percentage
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product, 1, true);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  return (
    <div className="group bg-[#FFFFFF] hover:bg-[#FAF9F6] rounded-xl border border-[#D5DDD2] hover:border-[#24532F] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative transform hover:-translate-y-1">
      {/* Badges: Discount & Featured */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
        {hasDiscount && (
          <span className="bg-[#B94343] text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded shadow-xs tracking-wide">
            {discountPercent}% OFF
          </span>
        )}
        {product.featured && (
          <span className="bg-[#DCE8D5] text-[#183D22] border border-[#356B3D] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
            ★ Featured
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        aria-label="Wishlist Mein Add Karein"
        className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full transition-all shadow-xs ${
          isWishlisted
            ? 'bg-[#FFFFFF] text-[#B94343] border border-red-300 scale-105'
            : 'bg-[#FFFFFF]/90 text-[#596358] hover:text-[#B94343] hover:bg-[#F3F0E6] border border-[#D5DDD2]'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Link with Hover Zoom & Floating Quick-View Pill */}
      <div className="relative aspect-square overflow-hidden bg-[#FFFFFF] p-2 flex items-center justify-center">
        <Link to={`/product/${product.slug || product.id}`} className="block w-full h-full flex items-center justify-center">
          <img
            src={product.mainImage || '/images/logo.png'}
            alt={title}
            width="286"
            height="286"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/categories/zatka-machines.png';
            }}
          />
        </Link>

        {/* Floating Quick-View Trigger (reveals on card hover) */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            type="button"
            onClick={handleQuickView}
            className="w-full py-2 px-3 rounded-lg bg-[#FFFFFF]/95 hover:bg-[#F3F0E6] text-[#171C17] hover:text-[#24532F] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#D5DDD2] hover:border-[#24532F] shadow-md transition-all cursor-pointer backdrop-blur-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#24532F]" />
            <span>{t('quickView')}</span>
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <span className="bg-[#B94343] text-white font-extrabold text-xs uppercase px-3 py-1 rounded shadow-md tracking-wider">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Product Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-inherit">
        <div>
          {/* Brand & Stock Pill */}
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-bold text-[#24532F] uppercase tracking-wider text-[10px]">
              {product.brand || 'Mahadev Electro Hub'}
            </span>
            {isLowStock && (
              <span className="text-[#B7791F] font-bold text-[10px] bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded">
                {t('onlyLeft').replace('{count}', product.stockQuantity)}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.slug || product.id}`}
            className="block text-sm font-bold text-[#171C17] hover:text-[#24532F] line-clamp-2 transition-colors mb-1.5 leading-snug"
            title={title}
          >
            {title}
          </Link>

          {/* Short description */}
          {shortDesc && (
            <p className="text-xs text-[#252A25] line-clamp-2 mb-3 leading-relaxed">
              {shortDesc}
            </p>
          )}
        </div>

        {/* Pricing & Working Buttons */}
        <div className="pt-3 border-t border-[#D5DDD2]">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-xl font-extrabold text-[#171C17] font-mono">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#596358] line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#596358] font-medium">{t('gstIncluded')}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 xs:gap-2">
            <button
              type="button"
              onClick={handleQuickView}
              className="px-1.5 xs:px-2.5 py-2 text-[11px] xs:text-xs font-bold text-center border border-[#D5DDD2] rounded-lg bg-[#FFFFFF] hover:bg-[#F3F0E6] text-[#171C17] hover:border-[#24532F] hover:text-[#24532F] flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#596358] shrink-0" />
              <span className="truncate">{t('quickView')}</span>
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`px-1.5 xs:px-2.5 py-2 text-[11px] xs:text-xs font-extrabold rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-[#D5DDD2] text-[#596358] border border-[#D5DDD2] cursor-not-allowed'
                  : justAdded
                  ? 'bg-[#2E7D46] text-white'
                  : 'bg-[#24532F] hover:bg-[#183D22] text-[#FFFFFF] active:scale-95'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t('addedToCart')}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 shrink-0 text-[#FFFFFF]" />
                  <span className="truncate">{t('addToCart')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
