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
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#50574F] selection:bg-[#DCE8D5] selection:text-[#26352A]">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        <div className="bg-[#FFFFFF] rounded-2xl sm:rounded-3xl border border-[#E2E6DC] shadow-sm p-6 sm:p-10 text-center text-[#26352A]">
          <div className="w-16 h-16 bg-[#DCE8D5]/70 text-[#2E7D46] border border-[#A8BFA3]/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs">
            <CheckCircle className="w-9 h-9" />
          </div>

          <span className="text-xs font-extrabold uppercase tracking-widest text-[#355E3B] block mb-2">
            {c.badge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#26352A] mb-2.5">
            {c.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#50574F] mb-8 leading-relaxed max-w-xl mx-auto font-normal">
            {c.desc}
          </p>

          {/* Order Details Card */}
          <div className="bg-[#FAF9F6] rounded-xl p-5 sm:p-6 border border-[#E2E6DC] text-left mb-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-[#E2E6DC]">
              <div>
                <span className="text-[11px] text-[#7A8277] block">{c.orderNumLabel}</span>
                <span className="font-extrabold text-base text-[#355E3B] font-mono">{orderNumber}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#7A8277] block">Payment Plan</span>
                <span className="font-bold text-xs text-[#26352A] block">
                  {order?.paymentPlan === 'ADVANCE_25' ? '25% Advance Payment' : (order?.paymentPlan === 'ADVANCE_50' ? '50% Advance Payment' : '100% Full Payment')}
                </span>
                <span className="text-[10px] text-[#2E7D46] font-semibold">
                  {order?.paymentStatus || 'Verified Online'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#7A8277] block">{c.totalAmountLabel}</span>
                <span className="font-extrabold text-base text-[#26352A] font-mono">
                  ₹{(order?.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Advance vs Remaining Balance Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 bg-[#FFFFFF] p-3 rounded-lg border border-[#E2E6DC] text-xs">
              <div>
                <span className="text-[#7A8277] block text-[11px]">Amount Paid Online:</span>
                <span className="font-mono font-bold text-[#2E7D46] text-sm">
                  ₹{(order?.amountPaid || order?.payableNow || 0).toLocaleString('en-IN')}
                </span>
                {order?.advanceTransactionId && (
                  <span className="block text-[10px] text-[#7A8277] font-mono truncate">
                    Ref: {order.advanceTransactionId}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[#7A8277] block text-[11px]">Remaining Balance at Delivery:</span>
                <span className={`font-mono font-bold text-sm ${order?.remainingBalance === 0 ? 'text-[#2E7D46]' : 'text-[#B7791F]'}`}>
                  {order?.remainingBalance === 0 ? '₹0 (Fully Paid - No Balance)' : `₹${(order?.remainingBalance || 0).toLocaleString('en-IN')}`}
                </span>
                {order?.remainingBalance > 0 && (
                  <span className="block text-[10px] text-[#B7791F]">
                    Payable when parcel is delivered
                  </span>
                )}
              </div>
            </div>

            {order?.shippingAddress && (
              <div className="text-xs text-[#50574F]">
                <span className="font-bold text-[#26352A] block mb-1">{c.deliveryAddressLabel}</span>
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
              className="w-full sm:w-auto px-6 py-3 bg-[#355E3B] hover:bg-[#294A30] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>{c.trackOrderBtn}</span>
            </Link>

            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3 border border-[#E2E6DC] bg-[#FFFFFF] text-[#26352A] hover:bg-[#F3F0E6] hover:border-[#A8BFA3] font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-2xs"
            >
              {c.continueShoppingBtn}
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E2E6DC] flex items-center justify-center gap-4 text-xs text-[#7A8277]">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#355E3B]" />
              <span>{c.helpline}</span>
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
