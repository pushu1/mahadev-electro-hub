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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCartDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Sliding Drawer Panel */}
        <div className="w-screen max-w-md bg-[#FFFFFF] text-[#171C17] shadow-2xl flex flex-col justify-between border-l border-[#D5DDD2] animate-slideInRight">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#D5DDD2] flex items-center justify-between bg-[#F3F0E6]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFFFFF] border border-[#D5DDD2] flex items-center justify-center text-[#24532F]">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-base tracking-wide text-[#171C17]">
                  {t('yourShoppingCart')}
                </h2>
                <span className="text-xs text-[#24532F] font-semibold">
                  {t('itemsAvailable').replace('{count}', cartCount)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCartDrawer}
              className="p-2 rounded-xl text-[#596358] hover:text-[#171C17] hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Dynamic Progress Meter */}
          <div className="px-5 py-3 bg-[#FAF9F6] border-b border-[#D5DDD2]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-[#252A25]">
                <Truck className="w-3.5 h-3.5 text-[#24532F]" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-[#2E7D46] font-bold">{t('freeDeliveryUnlocked')}</span>
                ) : (
                  <span>
                    {t('addMoreForFreeShipping').replace('{amount}', amountNeededForFreeShipping.toLocaleString('en-IN'))}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-mono text-[#596358]">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#D5DDD2] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#24532F] to-[#24532F] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Drawer Body: Line Items or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#D5DDD2]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-[#F3F0E6] border border-[#D5DDD2] flex items-center justify-center text-[#596358] mb-4">
                  <ShoppingCart className="w-9 h-9 stroke-[1.5]" />
                </div>
                <h3 className="font-heading font-extrabold text-lg text-[#171C17] mb-1">
                  {t('cartEmpty')}
                </h3>
                <p className="text-xs text-[#252A25] max-w-xs mb-6 leading-relaxed">
                  {t('emptyCartDesc')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/shop');
                  }}
                  className="px-6 py-3 rounded-xl bg-[#24532F] hover:bg-[#183D22] text-[#FFFFFF] font-bold text-xs tracking-wider uppercase shadow-sm transition-all cursor-pointer"
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
                      className="w-20 h-20 rounded-xl overflow-hidden bg-[#F3F0E6] border border-[#D5DDD2] shrink-0 relative block"
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
                            className="text-xs font-bold text-[#171C17] hover:text-[#24532F] line-clamp-2 transition-colors leading-snug"
                          >
                            {itemTitle}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            className="text-[#596358] hover:text-[#B94343] p-1 transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm font-extrabold text-[#171C17]">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                          {item.compareAtPrice && item.compareAtPrice > item.price && (
                            <span className="text-[11px] text-[#596358] line-through">
                              ₹{item.compareAtPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper & Subtotal */}
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <div className="flex items-center bg-[#FAF9F6] rounded-lg border border-[#D5DDD2] p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-[#252A25] hover:text-[#171C17] hover:bg-black/5 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold font-mono text-[#171C17]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={item.stockQuantity && item.quantity >= item.stockQuantity}
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-[#252A25] hover:text-[#171C17] hover:bg-black/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-mono font-bold text-[#252A25]">
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
            <div className="p-5 border-t border-[#D5DDD2] bg-[#F3F0E6] space-y-3.5">
              {/* Coupon Code Section */}
              <div className="pt-1">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs text-[#2E7D46]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-[#2E7D46]" />
                      Coupon: <strong>{appliedCoupon.code}</strong> (-₹{discount.toLocaleString('en-IN')})
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[#B94343] hover:underline text-[11px] font-bold cursor-pointer"
                    >
                      {t('removeCoupon')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#596358]" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder={t('couponCode')}
                        className="w-full bg-[#FFFFFF] text-[#171C17] text-xs pl-8 pr-3 py-2 rounded-xl border border-[#D5DDD2] focus:outline-none focus:border-[#24532F] uppercase placeholder-[#596358]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="px-3.5 py-2 bg-[#24532F] hover:bg-[#183D22] text-[#FFFFFF] text-xs font-bold rounded-xl transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      {applyingCoupon ? '...' : t('apply')}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-[#B94343] mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-[#2E7D46] mt-1">{couponSuccess}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#252A25] pt-2 border-t border-[#D5DDD2]">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-mono text-[#171C17] font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#2E7D46]">
                    <span>{t('discount')}</span>
                    <span className="font-mono font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t('deliveryCharges')}</span>
                  <span className="font-mono text-[#171C17]">
                    {shippingFee === 0 ? <strong className="text-[#2E7D46]">{t('freeShipping')}</strong> : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#171C17] pt-2 border-t border-[#D5DDD2]">
                  <span>{t('totalAmountLabel')} ({t('gstIncluded')})</span>
                  <span className="font-mono text-[#24532F] text-base font-extrabold">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#24532F] hover:bg-[#183D22] text-[#FFFFFF] font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
                >
                  <span>{t('proceedToCheckout')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={handleViewCart}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#D5DDD2] bg-[#FFFFFF] hover:bg-[#FAF9F6] text-xs font-bold text-[#171C17] transition-colors text-center cursor-pointer shadow-xs"
                >
                  {t('viewFullCart')}
                </button>
              </div>

              {/* Guarantee Footnote */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-[#596358] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#24532F]" />
                <span>{t('genuinePartsBadge')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
