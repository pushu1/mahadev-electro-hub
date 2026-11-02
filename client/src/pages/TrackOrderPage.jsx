import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, CheckCircle2, Clock, Truck, Home, AlertCircle } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function TrackOrderPage() {
  const { t, productLang } = useLanguage();
  const [searchParams] = useSearchParams();

  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const initialNum = searchParams.get('orderNumber');
    if (initialNum) {
      handleTrack(initialNum);
    }
  }, [searchParams]);

  const handleTrack = async (numToTrack) => {
    const num = numToTrack || orderNumber;
    if (!num.trim()) {
      setError('Kripya apna order number enter karein.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await api.trackOrder(num.trim(), phone.trim() || undefined);
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        throw new Error(res.message || 'Order nahi mila');
      }
    } catch (err) {
      setError(err.message || 'Order nahi mila. Kripya apna order number check karein.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'PENDING', label: 'Order Place Ho Gaya', icon: Clock },
    { key: 'CONFIRMED', label: 'Order Confirm Hua', icon: CheckCircle2 },
    { key: 'PROCESSING', label: 'Packing & Ready', icon: Package },
    { key: 'SHIPPED', label: 'Dispatch (In Transit)', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered Ho Gaya', icon: Home },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252A25]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        <div className="text-center max-w-md mx-auto mb-8">
          <div className="w-12 h-12 rounded-full bg-[#F3F0E6] border border-[#D5DDD2] text-[#24532F] flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-[#171C17] mb-2">
            {t('orderTrackingTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#252A25]">
            {t('orderTrackingDesc')}
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#D5DDD2] shadow-sm max-w-xl mx-auto mb-10">
          <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#171C17] mb-1.5">
                {t('enterOrderNumber')} *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="e.g. MEH-2026-123456"
                className="w-full px-3.5 py-2.5 bg-[#FFFFFF] text-[#171C17] placeholder-[#596358] border border-[#D5DDD2] rounded-lg focus:outline-none focus:border-[#24532F] uppercase text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171C17] mb-1.5">
                {t('mobileNumber')} (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 bg-[#FFFFFF] text-[#171C17] placeholder-[#596358] border border-[#D5DDD2] rounded-lg focus:outline-none focus:border-[#24532F] text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#24532F] hover:bg-[#183D22] text-white font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              {loading ? (
                <span>Checking...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{t('checkStatus')}</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#B94343] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B94343]" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Result Timeline */}
        {order && (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#D5DDD2] shadow-sm p-6 md:p-8 space-y-8 animate-fadeIn">
            {/* Top Order Details */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#D5DDD2] gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#24532F] block">
                  Order Live Status
                </span>
                <h3 className="font-heading font-extrabold text-xl text-[#171C17] font-mono">
                  {order.orderNumber}
                </h3>
                <span className="text-xs text-[#596358]">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.paymentPlan === 'ADVANCE_25' ? '25% Advance' : (order.paymentPlan === 'ADVANCE_50' ? '50% Advance' : '100% Full Payment')}
                </span>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-[#DCE8D5]/70 text-[#183D22] border border-[#356B3D]/50 uppercase">
                  {order.status}
                </span>
                <div className="text-xs font-bold text-[#171C17] mt-1">
                  Paid Online: <span className="text-[#2E7D46] font-mono">₹{(order.amountPaid || order.payableNow || 0).toLocaleString('en-IN')}</span>
                </div>
                {order.remainingBalance > 0 ? (
                  <div className="text-[11px] font-semibold text-[#B7791F]">
                    Balance Due: ₹{order.remainingBalance.toLocaleString('en-IN')}
                  </div>
                ) : (
                  <div className="text-[11px] font-semibold text-[#2E7D46]">
                    Fully Paid (₹0 Balance)
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#596358] mb-6">
                Delivery Progress Timeline
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {steps.map((st, idx) => {
                  const Icon = st.icon;
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={st.key} className="flex flex-col items-center text-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all shadow-2xs ${
                          isCurrent
                            ? 'bg-[#24532F] text-white ring-4 ring-[#356B3D]/40'
                            : isDone
                            ? 'bg-[#2E7D46] text-white'
                            : 'bg-[#F3F0E6] text-[#596358]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold leading-tight ${isDone ? 'text-[#171C17]' : 'text-[#596358]'}`}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items Ordered List */}
            <div className="pt-6 border-t border-[#D5DDD2]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#596358] mb-3">
                Order Ke Items
              </h4>
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-2.5 border-b border-[#D5DDD2]">
                    <div className="flex items-center gap-3">
                      <img src={item.productImage} alt="" className="w-10 h-10 rounded object-cover bg-[#FAF9F6]" />
                      <div>
                        <span className="font-bold text-[#171C17] block">
                          {productLang === 'hi' ? (item.productTitle_hi || item.productTitle_en) : item.productTitle_en}
                        </span>
                        <span className="text-[#252A25]">Qty: {item.quantity} × ₹{item.price}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#171C17]">
                      ₹{item.total?.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
