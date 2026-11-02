import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Phone } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { api } from '../services/api.js';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { t, language } = useLanguage();
  const [order, setOrder] = useState(location.state?.order || null);

  const texts = {
    en: {
      badge: 'ORDER CONFIRMED!',
      title: 'Thank You! Your Order Has Been Placed',
      desc: 'Your order has been received and is being prepared for fast, shockproof dispatch from our Pali, Rajasthan warehouse.',
      orderNumLabel: 'Order Number',
      paymentMethodLabel: 'Payment Method',
      totalAmountLabel: 'Total Amount',
      deliveryAddressLabel: 'Delivery Address:',
      trackOrderBtn: 'Track Your Order',
      continueShoppingBtn: 'Continue Shopping',
      helpline: 'Pali Helpline: +91 70142 48415'
    },
    hi: {
      badge: 'ऑर्डर कन्फर्म हो गया!',
      title: 'धन्यवाद! आपका ऑर्डर सफलतापूर्वक दर्ज हो गया है',
      desc: 'आपका ऑर्डर प्राप्त हो गया है और हमारे पाली, राजस्थान स्टोर से तेज़ व सुरक्षित डिलीवरी के लिए तैयार किया जा रहा है।',
      orderNumLabel: 'ऑर्डर नंबर',
      paymentMethodLabel: 'भुगतान का प्रकार',
      totalAmountLabel: 'कुल राशि',
      deliveryAddressLabel: 'डिलीवरी का पता:',
      trackOrderBtn: 'ऑर्डर ट्रैक करें',
      continueShoppingBtn: 'और उत्पाद देखें',
      helpline: 'पाली हेल्पलाइन: +91 70142 48415'
    },
    hinglish: {
      badge: 'ORDER CONFIRMED!',
      title: 'Dhanyawad! Aapka Order Successfully Place Ho Gaya',
      desc: 'Aapka order receive ho chuka hai aur hamare Pali, Rajasthan store se tez dispatch ke liye prepare kiya ja raha hai.',
      orderNumLabel: 'Order Number',
      paymentMethodLabel: 'Payment Method',
      totalAmountLabel: 'Total Amount',
      deliveryAddressLabel: 'Delivery Address:',
      trackOrderBtn: 'Order Track Karein',
      continueShoppingBtn: 'Aur Products Dekhein',
      helpline: 'Pali Helpline: +91 70142 48415'
    }
  };

  const c = texts[language] || texts.en;

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!order && orderNumber) {
      api.trackOrder(orderNumber)
        .then(res => {
          if (res.success && res.order) {
            setOrder(res.order);
          }
        })
        .catch(() => {});
    }
  }, [order, orderNumber]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-white selection:bg-[#D6A52A] selection:text-black">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        <div className="bg-[#141414] rounded-2xl sm:rounded-3xl border border-[#262626] shadow-2xl p-6 sm:p-10 text-center text-white">
          <div className="w-16 h-16 bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle className="w-9 h-9" />
          </div>

          <span className="text-xs font-extrabold uppercase tracking-widest text-[#D6A52A] block mb-2">
            {c.badge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-2.5">
            {c.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#D1D5DB] mb-8 leading-relaxed max-w-xl mx-auto">
            {c.desc}
          </p>

          {/* Order Details Card */}
          <div className="bg-[#1A1A1A] rounded-xl p-5 sm:p-6 border border-[#2A2A2A] text-left mb-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-[#2A2A2A]">
              <div>
                <span className="text-[11px] text-[#A0A0A0] block">{c.orderNumLabel}</span>
                <span className="font-extrabold text-base text-[#D6A52A] font-mono">{orderNumber}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#A0A0A0] block">Payment Plan</span>
                <span className="font-bold text-xs text-white block">
                  {order?.paymentPlan === 'ADVANCE_25' ? '25% Advance Payment' : (order?.paymentPlan === 'ADVANCE_50' ? '50% Advance Payment' : '100% Full Payment')}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {order?.paymentStatus || 'Verified Online'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#A0A0A0] block">{c.totalAmountLabel}</span>
                <span className="font-extrabold text-base text-white font-mono">
                  ₹{(order?.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Advance vs Remaining Balance Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 bg-[#141414] p-3 rounded-lg border border-[#262626] text-xs">
              <div>
                <span className="text-[#A0A0A0] block text-[11px]">Amount Paid Online:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ₹{(order?.amountPaid || order?.payableNow || 0).toLocaleString('en-IN')}
                </span>
                {order?.advanceTransactionId && (
                  <span className="block text-[10px] text-[#888888] font-mono truncate">
                    Ref: {order.advanceTransactionId}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[#A0A0A0] block text-[11px]">Remaining Balance at Delivery:</span>
                <span className={`font-mono font-bold text-sm ${order?.remainingBalance === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {order?.remainingBalance === 0 ? '₹0 (Fully Paid - No Balance)' : `₹${(order?.remainingBalance || 0).toLocaleString('en-IN')}`}
                </span>
                {order?.remainingBalance > 0 && (
                  <span className="block text-[10px] text-amber-300">
                    Payable when parcel is delivered
                  </span>
                )}
              </div>
            </div>

            {order?.shippingAddress && (
              <div className="text-xs text-[#D1D5DB]">
                <span className="font-bold text-white block mb-1">{c.deliveryAddressLabel}</span>
                <p className="leading-relaxed">
                  {order.customerName} ({order.customerPhone})<br />
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/track-order?orderNumber=${encodeURIComponent(orderNumber || '')}`}
              className="w-full sm:w-auto px-6 py-3 bg-[#D6A52A] hover:bg-[#E5B93B] text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <Package className="w-4 h-4" />
              <span>{c.trackOrderBtn}</span>
            </Link>

            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3 border border-[#383838] bg-[#1E1E1E] text-white hover:border-[#D6A52A] hover:text-[#D6A52A] font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm"
            >
              {c.continueShoppingBtn}
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-[#262626] flex items-center justify-center gap-4 text-xs text-[#A0A0A0]">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#D6A52A]" />
              <span>{c.helpline}</span>
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
