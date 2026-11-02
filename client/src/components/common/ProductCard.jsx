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
    <div className="group bg-[#242424] hover:bg-[#2D2D2D] rounded-xl border border-[#383838] hover:border-[#D6A52A] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative transform hover:-translate-y-1">
      {/* Badges: Discount & Featured */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
        {hasDiscount && (
          <span className="bg-[#E53935] text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded shadow-sm tracking-wide">
            {discountPercent}% OFF
          </span>
        )}
        {product.featured && (
          <span className="bg-[#000000]/85 text-[#D6A52A] border border-[#D6A52A]/40 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            ★ Featured
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        aria-label="Wishlist Mein Add Karein"
        className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full transition-all shadow-md ${
          isWishlisted
            ? 'bg-[#202020] text-[#E53935] border border-red-500/50 scale-105'
            : 'bg-[#202020]/90 text-white hover:text-[#D6A52A] hover:bg-[#2A2A2A] border border-[#383838]'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Link with Hover Zoom & Floating Quick-View Pill */}
      <div className="relative aspect-square overflow-hidden bg-[#1E1E1E]">
        <Link to={`/product/${product.slug || product.id}`} className="block w-full h-full">
          <img
            src={product.mainImage || '/images/logo.png'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Floating Quick-View Trigger (reveals on card hover) */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            type="button"
            onClick={handleQuickView}
            className="w-full py-2 px-3 rounded-lg bg-[#242424]/95 hover:bg-[#2D2D2D] text-white hover:text-[#D6A52A] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#444444] hover:border-[#D6A52A] shadow-lg transition-all cursor-pointer backdrop-blur-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#D6A52A]" />
            <span>{t('quickView')}</span>
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-10">
            <span className="bg-[#D92D20] text-white font-extrabold text-xs uppercase px-3 py-1 rounded shadow-md tracking-wider">
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
            <span className="font-bold text-[#D6A52A] uppercase tracking-wider text-[10px]">
              {product.brand || 'Mahadev Electro Hub'}
            </span>
            {isLowStock && (
              <span className="text-amber-300 font-bold text-[10px] bg-amber-950/60 border border-amber-600/40 px-1.5 py-0.5 rounded">
                {t('onlyLeft').replace('{count}', product.stockQuantity)}
              </span>
            )}
          </div>

          {/* Product Title: White text */}
          <Link
            to={`/product/${product.slug || product.id}`}
            className="block text-sm font-bold text-white hover:text-[#D6A52A] line-clamp-2 transition-colors mb-1.5 leading-snug"
            title={title}
          >
            {title}
          </Link>

          {/* Short description: Light grey text */}
          {shortDesc && (
            <p className="text-xs text-[#B3B3B3] line-clamp-2 mb-3 leading-relaxed">
              {shortDesc}
            </p>
          )}
        </div>

        {/* Pricing & Working Buttons */}
        <div className="pt-3 border-t border-[#383838]">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-xl font-extrabold text-white font-mono">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#888888] line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#888888] font-medium">{t('gstIncluded')}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 xs:gap-2">
            <button
              type="button"
              onClick={handleQuickView}
              className="px-1.5 xs:px-2.5 py-2 text-[11px] xs:text-xs font-bold text-center border border-[#444444] rounded-lg bg-[#242424] hover:bg-[#2D2D2D] text-white hover:border-[#D6A52A] hover:text-[#D6A52A] flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#B3B3B3] shrink-0" />
              <span className="truncate">{t('quickView')}</span>
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`px-1.5 xs:px-2.5 py-2 text-[11px] xs:text-xs font-extrabold rounded-lg flex items-center justify-center gap-1 shadow-md transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-[#333333] text-gray-500 border border-[#444444] cursor-not-allowed'
                  : justAdded
                  ? 'bg-[#16803D] text-white'
                  : 'bg-[#D6A52A] hover:bg-[#E5B93B] text-[#000000] active:scale-95'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t('addedToCart')}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 shrink-0 text-[#000000]" />
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
