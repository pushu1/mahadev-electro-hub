import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Check,
  Star,
  Zap,
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react';
import { useQuickView } from '../../context/QuickViewContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProductQuickViewModal() {
  const { quickViewProduct, closeQuickView } = useQuickView();
  const { productLang, getProductText, t } = useLanguage();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useAuth();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedImage(quickViewProduct.mainImage || '/images/logo.png');
      setQuantity(1);
      setJustAdded(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [quickViewProduct]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && quickViewProduct) {
        closeQuickView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewProduct, closeQuickView]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const title = getProductText(product, 'title');
  const description = getProductText(product, 'description') || getProductText(product, 'short_description');
  const isOutOfStock = (product.stockQuantity || 0) <= 0;
  const isLowStock = (product.stockQuantity || 0) > 0 && (product.stockQuantity || 0) <= 5;
  const isWishlisted = wishlist.includes(product.id);

  // Discount percentage
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? [product.mainImage, ...product.images.filter(img => img !== product.mainImage)]
    : [product.mainImage || '/images/logo.png'];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, true);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      closeQuickView();
    }, 1200);
  };

  const handleWishlistClick = () => {
    toggleWishlist(product.id);
  };

  const handleViewFullPage = () => {
    closeQuickView();
    navigate(`/product/${product.slug || product.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 select-none"
      role="dialog"
      aria-modal="true"
    >
      {/* Frosted Liquid Glass Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeQuickView}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#FFFFFF] text-[#171C17] rounded-2xl overflow-hidden shadow-2xl border border-[#D5DDD2] z-10 animate-fadeIn">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#F3F0E6] text-[#596358] hover:text-[#171C17] hover:bg-[#D5DDD2] transition-all border border-[#D5DDD2]"
          aria-label="Modal Band Karein"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 p-6 sm:p-8 bg-[#FAF9F6] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D5DDD2]">
            <div>
              {/* Main Preview with Badges */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#D5DDD2] flex items-center justify-center shadow-inner group">
                <img
                  src={selectedImage || product.mainImage || '/images/logo.png'}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  {hasDiscount && (
                    <span className="bg-[#B94343] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-md shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                  {product.featured && (
                    <span className="bg-[#DCE8D5] text-[#183D22] border border-[#356B3D] text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      ★ Featured
                    </span>
                  )}
                </div>

                {/* Wishlist Floating Button */}
                <button
                  type="button"
                  onClick={handleWishlistClick}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
                    isWishlisted
                      ? 'bg-red-500 text-white'
                      : 'bg-[#FFFFFF]/90 text-[#596358] hover:text-[#B94343] hover:bg-[#F3F0E6] border border-[#D5DDD2]'
                  }`}
                  aria-label="Wishlist Toggle"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Thumbnails row */}
              {imagesList.length > 1 && (
                <div className="flex gap-2.5 mt-3.5 overflow-x-auto pb-1 scrollbar-none">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImage === img
                          ? 'border-[#24532F] ring-2 ring-[#24532F]/30'
                          : 'border-[#D5DDD2] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Trust Bar */}
            <div className="pt-4 mt-4 border-t border-[#D5DDD2] flex items-center justify-between text-[11px] text-[#596358]">
              <span className="flex items-center gap-1.5 text-[#24532F] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pali Store Verified</span>
              </span>
              <span className="text-[#596358]">SKU: {product.sku || 'MEH-ELECTRO'}</span>
            </div>
          </div>

          {/* Right Column: Product Specs & Actions */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category Pill & Stock Status */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest text-[#24532F]">
                  <Zap className="w-3 h-3 text-[#24532F]" />
                  <span>{product.category?.name_en || 'Electricals'}</span>
                </span>

                {/* Stock Status Badge */}
                {isOutOfStock ? (
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                    {t('outOfStock')}
                  </span>
                ) : isLowStock ? (
                  <span className="text-[11px] font-bold text-[#B7791F] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    {t('onlyLeft').replace('{count}', product.stockQuantity)}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-[#2E7D46] bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                    {t('inStock')} ({product.stockQuantity} Units)
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#171C17] leading-snug">
                {title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-[#B7791F]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[#596358] font-semibold">(4.9/5 • Verified Pali Reviews)</span>
              </div>

              {/* Pricing */}
              <div className="py-2.5 px-4 rounded-xl bg-[#F3F0E6] border border-[#D5DDD2] flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#171C17] font-mono">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-[#596358] line-through">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-[11px] text-[#596358] ml-auto font-medium">
                  GST 18% Included
                </span>
              </div>

              {/* Short Description */}
              {description && (
                <p className="text-xs sm:text-sm text-[#252A25] line-clamp-3 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Technical Specifications Highlights */}
              {Array.isArray(product.specifications) && product.specifications.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-[#596358] uppercase tracking-wider block">
                    Technical Specifications:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {product.specifications.slice(0, 4).map((spec, sIdx) => (
                      <div key={sIdx} className="bg-[#FAF9F6] rounded-lg p-2 border border-[#D5DDD2]">
                        <span className="text-[#596358] block text-[10px]">{spec.key}:</span>
                        <strong className="text-[#171C17] font-mono">{spec.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Quantity + Add To Cart + View Full Page */}
            <div className="pt-6 mt-4 border-t border-[#D5DDD2] space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center bg-[#FAF9F6] rounded-xl border border-[#D5DDD2] p-1">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#252A25] hover:text-[#171C17] hover:bg-black/5 transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold font-mono text-[#171C17]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={product.stockQuantity && quantity >= product.stockQuantity}
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#252A25] hover:text-[#171C17] hover:bg-black/5 transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                    isOutOfStock
                      ? 'bg-[#D5DDD2] text-[#596358] cursor-not-allowed'
                      : justAdded
                      ? 'bg-[#2E7D46] text-white'
                      : 'bg-[#24532F] hover:bg-[#183D22] text-[#FFFFFF] font-extrabold active:scale-98'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Cart Mein Add Ho Gaya!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>{t('addToCart')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* View Full Product Details Link */}
              <button
                type="button"
                onClick={handleViewFullPage}
                className="w-full text-center text-xs font-bold text-[#24532F] hover:underline flex items-center justify-center gap-1.5 transition-colors py-1"
              >
                <span>Poore Details & Customer Reviews Dekhein</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
