import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function CartPage() {
  const {
    cart,
    subtotal,
    discount,
    shippingFee,
    totalAmount,
    freeShippingThreshold,
    appliedCoupon,
    couponError,
    couponSuccess,
    removeFromCart,
    updateQuantity,
    applyCouponCode,
    removeCoupon,
  } = useCart();
  const { t, getProductText, productLang } = useLanguage();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setApplying(true);
    await applyCouponCode(inputCode.trim());
    setApplying(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252A25]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-[#171C17] mb-6">
          {t('shoppingCart')} ({cart.length} items)
        </h1>

        {cart.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-2xl p-12 text-center border border-[#D5DDD2] max-w-lg mx-auto my-12 shadow-sm">
            <ShoppingBag className="w-16 h-16 text-[#356B3D] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#171C17] mb-2">{t('cartEmpty')}</h2>
            <p className="text-xs text-[#252A25] mb-6 font-normal">
              Aapki cart mein abhi koi product nahi hai. Hamari heavy-duty torches, solar street lights aur kheti suraksha zatka machines explore karein.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#24532F] hover:bg-[#183D22] text-white font-bold text-sm rounded-xl shadow-sm transition-all"
            >
              <span>{t('startShopping')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const title = getProductText(item, 'title') || item.title_en || item.title_hi;
                const lineTotal = item.price * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className="bg-[#FFFFFF] p-4 md:p-5 rounded-xl border border-[#D5DDD2] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    {/* Image & Title */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <Link to={`/product/${item.slug || item.productId}`} className="w-20 h-20 rounded-lg overflow-hidden bg-[#FAF9F6] shrink-0 border border-[#D5DDD2]">
                        <img src={item.image} alt={title} className="w-full h-full object-cover" />
                      </Link>
                      <div>
                        <Link
                          to={`/product/${item.slug || item.productId}`}
                          className="font-bold text-sm text-[#171C17] hover:text-[#24532F] line-clamp-2"
                        >
                          {title}
                        </Link>
                        <span className="text-xs text-[#596358] block mt-1 font-medium">
                          Unit Price: ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Qty Controls & Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-[#D5DDD2] pt-3 sm:pt-0">
                      {/* Qty buttons */}
                      <div className="flex items-center border border-[#D5DDD2] rounded-lg overflow-hidden bg-[#FAF9F6]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1 text-[#252A25] hover:bg-[#D5DDD2] hover:text-[#171C17] font-bold text-sm cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-[#171C17]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2.5 py-1 text-[#252A25] hover:bg-[#D5DDD2] hover:text-[#171C17] font-bold text-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Total */}
                      <span className="font-extrabold text-sm text-[#171C17] min-w-[70px] text-right">
                        ₹{lineTotal.toLocaleString('en-IN')}
                      </span>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        aria-label="Remove item"
                        className="text-[#596358] hover:text-[#B94343] p-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-2">
                <Link to="/shop" className="text-xs font-semibold text-[#24532F] hover:text-[#183D22] flex items-center gap-1">
                  ← {t('startShopping')}
                </Link>
              </div>
            </div>

            {/* Order Summary & Coupon Card */}
            <div className="space-y-6">
              {/* Coupon Box */}
              <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#D5DDD2] shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#596358] mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#24532F]" />
                  <span>{t('applyCoupon')}</span>
                </h3>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-[#DCE8D5]/60 border border-[#356B3D]/50 rounded-lg">
                    <div>
                      <span className="font-bold text-xs text-[#183D22] uppercase block">
                        ✓ {appliedCoupon.code} Apply Ho Gaya
                      </span>
                      <span className="text-[11px] text-[#24532F]">
                        Aapki bachat: ₹{discount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs font-bold text-[#B94343] hover:underline cursor-pointer"
                    >
                      {t('removeCoupon')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder={t('couponCode')}
                        className="flex-1 px-3 py-2 text-xs border border-[#D5DDD2] bg-[#FFFFFF] text-[#171C17] rounded-lg focus:outline-none focus:border-[#24532F] uppercase"
                      />
                      <button
                        type="submit"
                        disabled={applying}
                        className="px-4 py-2 bg-[#24532F] hover:bg-[#183D22] text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {applying ? 'Check Ho Raha Hai...' : t('apply')}
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-[#B94343]">{couponError}</p>}
                    {couponSuccess && <p className="text-[11px] text-[#2E7D46]">{couponSuccess}</p>}
                    <p className="text-[10px] text-[#596358]">
                      Sample coupons: <strong className="text-[#24532F]">MAHADEV50</strong> or <strong className="text-[#24532F]">KISAN10</strong>
                    </p>
                  </form>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#D5DDD2] shadow-sm space-y-4">
                <h3 className="font-heading font-bold text-base text-[#171C17] pb-3 border-b border-[#D5DDD2]">
                  {t('orderSummary')}
                </h3>

                <div className="space-y-2.5 text-xs text-[#252A25]">
                  <div className="flex justify-between">
                    <span>{t('subtotal')}</span>
                    <span className="font-semibold text-[#171C17]">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-[#2E7D46] font-semibold">
                      <span>{t('discount')} ({appliedCoupon?.code})</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>{t('shippingCharges')}</span>
                    {shippingFee === 0 ? (
                      <span className="font-bold text-[#2E7D46] uppercase">{t('freeShipping')}</span>
                    ) : (
                      <span className="text-[#171C17]">₹{shippingFee}</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D5DDD2] flex justify-between items-baseline">
                  <span className="font-bold text-sm text-[#171C17]">{t('finalTotal')}</span>
                  <span className="font-extrabold text-xl text-[#171C17]">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 px-6 bg-[#24532F] hover:bg-[#183D22] text-white font-extrabold text-sm rounded-xl shadow-md shadow-[#24532F]/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t('proceedToCheckout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#596358]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D46]" />
                  <span>100% Secure Checkout • Online Advance & Full Payment Available</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
