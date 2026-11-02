import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle,
  Truck
} from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function CartDrawer() {
  const {
    cart,
    cartCount,
    subtotal,
    discount,
    shippingFee,
    totalAmount,
    freeShippingThreshold,
    appliedCoupon,
    couponError,
    couponSuccess,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeFromCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const { getProductText, t } = useLanguage();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    await applyCouponCode(couponInput.trim());
    setApplyingCoupon(false);
  };

  const handleProceedToCheckout = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeCartDrawer();
    navigate('/cart');
  };

  // Shipping progress calculation
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" role="dialog" aria-modal="true">
      {/* Liquid Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={closeCartDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Luxury Liquid-Glass Sliding Drawer Panel */}
        <div className="w-screen max-w-md bg-[#202020] text-white shadow-2xl flex flex-col justify-between border-l border-[#383838] animate-slideInRight">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#383838] flex items-center justify-between bg-[#181818]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#242424] border border-[#383838] flex items-center justify-center text-[#D6A52A]">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-base tracking-wide text-white">
                  {t('yourShoppingCart')}
                </h2>
                <span className="text-xs text-[#D6A52A] font-semibold">
                  {t('itemsAvailable').replace('{count}', cartCount)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCartDrawer}
              className="p-2 rounded-xl text-[#B3B3B3] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Dynamic Progress Meter */}
          <div className="px-5 py-3 bg-[#181818] border-b border-[#383838]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-[#B3B3B3]">
                <Truck className="w-3.5 h-3.5 text-[#D6A52A]" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-emerald-400 font-bold">{t('freeDeliveryUnlocked')}</span>
                ) : (
                  <span>
                    {t('addMoreForFreeShipping').replace('{amount}', amountNeededForFreeShipping.toLocaleString('en-IN'))}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-mono text-[#B3B3B3]">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden border border-[#383838]">
              <div
                className="h-full bg-gradient-to-r from-[#D6A52A] to-[#E5B93B] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Drawer Body: Line Items or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-white/5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-4">
                  <ShoppingCart className="w-9 h-9 stroke-[1.5]" />
                </div>
                <h3 className="font-heading font-extrabold text-lg text-white mb-1">
                  {t('cartEmpty')}
                </h3>
                <p className="text-xs text-gray-400 max-w-xs mb-6 leading-relaxed">
                  {t('emptyCartDesc')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/shop');
                  }}
                  className="px-6 py-3 rounded-xl bg-[#D6A52A] hover:bg-[#E5B93B] text-[#000000] font-bold text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer"
                >
                  {t('startShopping')} →
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemTitle = getProductText(item, 'title') || item.title_en;

                return (
                  <div key={item.productId} className="pt-4 first:pt-0 flex gap-3.5 group">
                    {/* Thumbnail */}
                    <Link
                      to={`/product/${item.slug || item.productId}`}
                      onClick={closeCartDrawer}
                      className="w-20 h-20 rounded-xl overflow-hidden bg-[#242424] border border-[#383838] shrink-0 relative block"
                    >
                      <img
                        src={item.image || '/images/logo.png'}
                        alt={itemTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${item.slug || item.productId}`}
                            onClick={closeCartDrawer}
                            className="text-xs font-bold text-white hover:text-[#D6A52A] line-clamp-2 transition-colors leading-snug"
                          >
                            {itemTitle}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            className="text-gray-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm font-extrabold text-white">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                          {item.compareAtPrice && item.compareAtPrice > item.price && (
                            <span className="text-[11px] text-gray-500 line-through">
                              ₹{item.compareAtPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper & Subtotal */}
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <div className="flex items-center bg-black/60 rounded-lg border border-white/10 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold font-mono text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={item.stockQuantity && item.quantity >= item.stockQuantity}
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-mono font-bold text-gray-300">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer: Coupon, Summary & Action CTAs */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-black/60 space-y-3.5">
              {/* Coupon Code Section */}
              <div className="pt-1">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-300">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Coupon: <strong>{appliedCoupon.code}</strong> (-₹{discount.toLocaleString('en-IN')})
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-400 hover:underline text-[11px] font-bold cursor-pointer"
                    >
                      {t('removeCoupon')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder={t('couponCode')}
                        className="w-full bg-[#181818] text-white text-xs pl-8 pr-3 py-2 rounded-xl border border-[#383838] focus:outline-none focus:border-[#D6A52A] uppercase placeholder-gray-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="px-3.5 py-2 bg-[#252525] hover:bg-[#D6A52A] text-white hover:text-black text-xs font-bold rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {applyingCoupon ? '...' : t('apply')}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-400 mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-400 mt-1">{couponSuccess}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-300 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>{t('discount')}</span>
                    <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t('deliveryCharges')}</span>
                  <span className="font-mono text-white">
                    {shippingFee === 0 ? <strong className="text-emerald-400">{t('freeShipping')}</strong> : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/10">
                  <span>{t('totalAmountLabel')} ({t('gstIncluded')})</span>
                  <span className="font-mono text-[#D6A52A] text-base font-extrabold">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#D6A52A] hover:bg-[#E5B93B] text-[#000000] font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
                >
                  <span>{t('proceedToCheckout')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={handleViewCart}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#444444] bg-[#242424] hover:bg-[#2D2D2D] text-xs font-bold text-white transition-colors text-center cursor-pointer"
                >
                  {t('viewFullCart')}
                </button>
              </div>

              {/* Guarantee Footnote */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-[#B3B3B3] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D6A52A]" />
                <span>{t('genuinePartsBadge')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
