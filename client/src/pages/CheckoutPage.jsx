import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Zap,
  Check,
  X
} from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function CheckoutPage() {
  const { cart, subtotal, discount, shippingFee, totalAmount, appliedCoupon, clearCart } = useCart();
  const { t, getProductText } = useLanguage();
  const { customerUser } = useAuth();
  const navigate = useNavigate();

  // Customer Contact & Delivery Form
  const [customerName, setCustomerName] = useState(customerUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(customerUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(customerUser?.email || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Pali');
  const [district, setDistrict] = useState('Pali');
  const [state, setState] = useState('Rajasthan');
  const [pincode, setPincode] = useState('306401');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');

  // 3 Payment Plans: 'ADVANCE_25' | 'ADVANCE_50' | 'FULL_100'
  const [paymentPlan, setPaymentPlan] = useState('ADVANCE_25');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulator Modal State (for test environments without live Razorpay keys)
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);
  const [simulating, setSimulating] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#181818] text-white">
        <Header />
        <div className="flex-1 max-w-lg mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold mb-4">Aapki Cart Khali Hai</h2>
          <Link to="/shop" className="text-[#D6A52A] font-bold underline">
            Products Dekhein Aur Cart Mein Add Karein →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Precise calculations for the 3 payment plans
  const total = Number(totalAmount.toFixed(2));
  const plan25Payable = Number((total * 0.25).toFixed(2));
  const plan25Balance = Number((total - plan25Payable).toFixed(2));

  const plan50Payable = Number((total * 0.50).toFixed(2));
  const plan50Balance = Number((total - plan50Payable).toFixed(2));

  const plan100Payable = total;
  const plan100Balance = 0;

  let currentPayable = plan25Payable;
  let currentBalance = plan25Balance;
  let currentPercentage = 25;

  if (paymentPlan === 'ADVANCE_50') {
    currentPayable = plan50Payable;
    currentBalance = plan50Balance;
    currentPercentage = 50;
  } else if (paymentPlan === 'FULL_100') {
    currentPayable = plan100Payable;
    currentBalance = plan100Balance;
    currentPercentage = 100;
  }

  // Handle Form Submission and Trigger Payment
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!customerName.trim() || !customerPhone.trim() || !street.trim() || !pincode.trim()) {
      setError('Kripya sabhi zaroori details (Naam, Mobile Number, Address, PIN code) bharein.');
      return;
    }

    if (!/^\d{10}$/.test(customerPhone.trim().replace(/\D/g, ''))) {
      setError('Kripya valid 10-digit mobile number dalein.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        shippingAddress: {
          street: street.trim(),
          city: city.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          landmark: landmark.trim() || undefined,
        },
        items: cart.map(item => ({
          productId: item.productId,
          productTitle: item.title_en,
          quantity: item.quantity,
        })),
        couponCode: appliedCoupon?.code || undefined,
        paymentPlan,
        paymentMethod: paymentPlan,
        notes: notes.trim() || undefined,
      };

      const res = await api.createOrder(orderPayload);

      if (!res.success || !res.order) {
        throw new Error(res.message || 'Order create nahi ho paya.');
      }

      // Check if Live Razorpay is available
      if (res.isLiveGateway && window.Razorpay && res.keyId && res.razorpayOrderId) {
        const options = {
          key: res.keyId,
          amount: Math.round(res.payableNow * 100),
          currency: 'INR',
          name: 'Mahadev Electro Hub',
          description: `${currentPercentage}% Online Payment for Order ${res.order.orderNumber}`,
          image: '/images/logo.png',
          order_id: res.razorpayOrderId,
          prefill: {
            name: customerName.trim(),
            contact: customerPhone.trim(),
            email: customerEmail.trim() || 'support@mahadevelectrohub.com',
          },
          theme: {
            color: '#D6A52A',
          },
          handler: async function (response) {
            try {
              const verifyRes = await api.verifyPayment({
                orderId: res.order.id,
                orderNumber: res.order.orderNumber,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success && verifyRes.order) {
                clearCart();
                navigate(`/order-confirmation/${verifyRes.order.orderNumber}`, { state: { order: verifyRes.order } });
              } else {
                throw new Error(verifyRes.message || 'Payment signature verification failed.');
              }
            } catch (vErr) {
              setError(vErr.message || 'Payment verification failed on server.');
            }
          },
          modal: {
            ondismiss: async function () {
              await api.reportPaymentFailed({
                orderId: res.order.id,
                orderNumber: res.order.orderNumber,
                reason: 'Customer cancelled or closed Razorpay checkout modal.'
              }).catch(() => {});
              setError('Payment process cancel ho gaya. Aap dobara try kar sakte hain.');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (failedRes) {
          await api.reportPaymentFailed({
            orderId: res.order.id,
            orderNumber: res.order.orderNumber,
            reason: failedRes.error?.description || 'Gateway transaction declined.'
          }).catch(() => {});
          setError(`Payment failed: ${failedRes.error?.description || 'Transaction declined'}`);
        });
        rzp.open();
      } else {
        // Razorpay keys not yet configured in server/.env -> Launch interactive Secure Simulator Modal
        setPendingPaymentOrder(res);
      }
    } catch (err) {
      setError(err.message || 'Order process karne mein samasya aayi. Kripya dobara try karein.');
    } finally {
      setLoading(false);
    }
  };

  // Simulator: Confirm Online Payment (Test Mode)
  const handleSimulateSuccess = async () => {
    if (!pendingPaymentOrder) return;
    setSimulating(true);
    try {
      const verifyRes = await api.verifyPayment({
        orderId: pendingPaymentOrder.order.id,
        orderNumber: pendingPaymentOrder.order.orderNumber,
        simulationToken: pendingPaymentOrder.simulationToken,
        razorpay_payment_id: `PAY-SIM-${Date.now()}`
      });

      if (verifyRes.success && verifyRes.order) {
        clearCart();
        setPendingPaymentOrder(null);
        navigate(`/order-confirmation/${verifyRes.order.orderNumber}`, { state: { order: verifyRes.order } });
      } else {
        throw new Error(verifyRes.message || 'Simulation verification failed');
      }
    } catch (err) {
      setError(err.message || 'Payment verification failed');
    } finally {
      setSimulating(false);
    }
  };

  // Simulator: Simulate Failed Payment
  const handleSimulateFailure = async () => {
    if (!pendingPaymentOrder) return;
    setSimulating(true);
    try {
      await api.reportPaymentFailed({
        orderId: pendingPaymentOrder.order.id,
        orderNumber: pendingPaymentOrder.order.orderNumber,
        reason: 'Customer simulated payment cancellation.'
      });
      setError('Payment cancel / decline simulate kiya gaya. Order confirmed nahi hua.');
      setPendingPaymentOrder(null);
    } catch (err) {
      setError(err.message || 'Error recording failure');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#181818] text-white selection:bg-[#D6A52A] selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Title & Back link */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/cart" className="text-xs font-semibold text-[#D1D5DB] hover:text-[#D6A52A] flex items-center gap-1 mb-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← {t('backToCart')}</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white">
              {t('checkout')}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">100% Secure SSL Checkout</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Details & Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Contact */}
            <div className="bg-[#242424] p-6 rounded-2xl border border-[#383838] shadow-md space-y-4">
              <h3 className="font-heading font-bold text-base text-white pb-3 border-b border-[#383838] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#181818] border border-[#D6A52A] text-[#D6A52A] text-xs flex items-center justify-center font-extrabold">1</span>
                <span>{t('contactDetails')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                    {t('fullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3 py-2 text-xs border border-[#444444] bg-[#181818] text-white rounded-lg focus:outline-none focus:border-[#D6A52A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                    {t('mobileNumber')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 text-xs border border-[#444444] bg-[#181818] text-white rounded-lg focus:outline-none focus:border-[#D6A52A]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                    {t('emailAddress')} (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com (for order receipt & tracking updates)"
                    className="w-full px-3 py-2 text-xs border border-[#444444] bg-[#181818] text-white rounded-lg focus:outline-none focus:border-[#D6A52A]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="bg-[#242424] p-6 rounded-2xl border border-[#383838] shadow-md space-y-4">
              <h3 className="font-heading font-bold text-base text-white pb-3 border-b border-[#383838] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#181818] border border-[#D6A52A] text-[#D6A52A] text-xs flex items-center justify-center font-extrabold">2</span>
                <span>{t('deliveryAddress')}</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                    {t('streetAddress')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House/Shop no, Near temple/main road, Village/Colony"
                    className="w-full px-3 py-2 text-xs border border-[#444444] bg-[#181818] text-white rounded-lg focus:outline-none focus:border-[#D6A52A]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                      {t('cityTehsil')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#444444] bg-[#181818] text-white rounded-lg focus:outline-none focus:border-[#D6A52A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                      {t('district')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#444444] bg-[#181818] text-white rounded-lg focus:outline-none focus:border-[#D6A52A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                      {t('state')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#444444] bg-[#181818] text-white rounded-lg focus:outline-none focus:border-[#D6A52A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                      {t('pincode')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#444444] bg-[#181818] text-white rounded-lg focus:outline-none focus:border-[#D6A52A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                    {t('landmark')}
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Primary School, Old Bus Stand, etc."
                    className="w-full px-3 py-2 text-xs border border-[#444444] bg-[#181818] text-white rounded-lg focus:outline-none focus:border-[#D6A52A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                    Order Notes / Special Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Koi vishesh delivery instructions ya preferred timing yahan likhein"
                    className="w-full px-3 py-2 text-xs border border-[#444444] bg-[#181818] text-white rounded-lg focus:outline-none focus:border-[#D6A52A]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Advance Payment Plan Selection (No COD) */}
            <div className="bg-[#242424] p-6 rounded-2xl border border-[#383838] shadow-md space-y-4">
              <div className="pb-3 border-b border-[#383838] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#181818] border border-[#D6A52A] text-[#D6A52A] text-xs flex items-center justify-center font-extrabold">3</span>
                  <span>{t('paymentPlanTitle')}</span>
                </h3>
                <span className="text-[11px] font-bold text-[#D6A52A] bg-[#181818] border border-[#D6A52A]/40 px-2.5 py-0.5 rounded-full">
                  Advance Payment Mandatory • 100% Verified Dispatch
                </span>
              </div>

              <p className="text-xs text-[#D1D5DB] leading-relaxed">
                Choose how you want to pay. Advance payments are securely processed online to lock your inventory and dispatch your parcel.
              </p>

              {/* 3 Selectable Payment Plan Cards */}
              <div className="space-y-3 pt-1">
                {/* Plan 1: 25% Advance */}
                <label
                  onClick={() => setPaymentPlan('ADVANCE_25')}
                  className={`block p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentPlan === 'ADVANCE_25'
                      ? 'border-[#D6A52A] bg-[#D6A52A]/10 shadow-lg shadow-[#D6A52A]/10'
                      : 'border-[#383838] hover:border-[#555555] bg-[#1E1E1E]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentPlan"
                        value="ADVANCE_25"
                        checked={paymentPlan === 'ADVANCE_25'}
                        onChange={() => setPaymentPlan('ADVANCE_25')}
                        className="mt-1 text-[#D6A52A] focus:ring-[#D6A52A] h-4 w-4 accent-[#D6A52A]"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-extrabold text-sm sm:text-base text-white">
                            {t('advance25Title')}
                          </span>
                          <span className="text-[10px] font-bold bg-[#181818] text-[#D6A52A] border border-[#D6A52A]/40 px-2 py-0.5 rounded">
                            {t('advance25Badge')}
                          </span>
                        </div>
                        <p className="text-xs text-[#D1D5DB] leading-relaxed">
                          {t('advance25Desc')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-[#9CA3AF]">{t('payOnlineNow')}</div>
                      <div className="font-mono font-extrabold text-base sm:text-lg text-[#D6A52A]">
                        ₹{plan25Payable.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                        ₹{plan25Balance.toLocaleString('en-IN')} due at delivery
                      </div>
                    </div>
                  </div>
                </label>

                {/* Plan 2: 50% Advance */}
                <label
                  onClick={() => setPaymentPlan('ADVANCE_50')}
                  className={`block p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentPlan === 'ADVANCE_50'
                      ? 'border-[#D6A52A] bg-[#D6A52A]/10 shadow-lg shadow-[#D6A52A]/10'
                      : 'border-[#383838] hover:border-[#555555] bg-[#1E1E1E]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentPlan"
                        value="ADVANCE_50"
                        checked={paymentPlan === 'ADVANCE_50'}
                        onChange={() => setPaymentPlan('ADVANCE_50')}
                        className="mt-1 text-[#D6A52A] focus:ring-[#D6A52A] h-4 w-4 accent-[#D6A52A]"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-extrabold text-sm sm:text-base text-white">
                            {t('advance50Title')}
                          </span>
                          <span className="text-[10px] font-bold bg-[#181818] text-white border border-[#444444] px-2 py-0.5 rounded">
                            {t('advance50Badge')}
                          </span>
                        </div>
                        <p className="text-xs text-[#D1D5DB] leading-relaxed">
                          {t('advance50Desc')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-[#9CA3AF]">{t('payOnlineNow')}</div>
                      <div className="font-mono font-extrabold text-base sm:text-lg text-[#D6A52A]">
                        ₹{plan50Payable.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                        ₹{plan50Balance.toLocaleString('en-IN')} due at delivery
                      </div>
                    </div>
                  </div>
                </label>

                {/* Plan 3: 100% Full Payment */}
                <label
                  onClick={() => setPaymentPlan('FULL_100')}
                  className={`block p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentPlan === 'FULL_100'
                      ? 'border-[#D6A52A] bg-[#D6A52A]/10 shadow-lg shadow-[#D6A52A]/10'
                      : 'border-[#383838] hover:border-[#555555] bg-[#1E1E1E]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentPlan"
                        value="FULL_100"
                        checked={paymentPlan === 'FULL_100'}
                        onChange={() => setPaymentPlan('FULL_100')}
                        className="mt-1 text-[#D6A52A] focus:ring-[#D6A52A] h-4 w-4 accent-[#D6A52A]"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-extrabold text-sm sm:text-base text-white">
                            {t('full100Title')}
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">
                            {t('full100Badge')}
                          </span>
                        </div>
                        <p className="text-xs text-[#D1D5DB] leading-relaxed">
                          {t('full100Desc')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-[#9CA3AF]">{t('payOnlineNow')}</div>
                      <div className="font-mono font-extrabold text-base sm:text-lg text-emerald-400">
                        ₹{plan100Payable.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                        ₹0 balance at delivery
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Clear Delivery Terms Notice */}
              <div className="p-3.5 bg-[#181818] rounded-xl border border-[#383838] text-[11px] text-[#A0A0A0] leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#D6A52A] shrink-0 mt-0.5" />
                <span>
                  {t('paymentTermsNotice')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="space-y-6">
            <div className="bg-[#242424] p-6 rounded-2xl border border-[#383838] shadow-md space-y-4">
              <h3 className="font-heading font-bold text-base text-white pb-3 border-b border-[#383838]">
                {t('orderSummary')}
              </h3>

              {/* Items Preview */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-xs py-1.5 border-b border-[#333333]">
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <span className="font-bold text-[#D6A52A]">×{item.quantity}</span>
                      <span className="truncate text-[#D1D5DB]">{getProductText(item, 'title') || item.title_en}</span>
                    </div>
                    <span className="font-bold text-white font-mono">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Cost Breakdown */}
              <div className="pt-2 border-t border-[#383838] space-y-2 text-xs text-[#D1D5DB]">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold text-white font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>{t('discount')} ({appliedCoupon?.code})</span>
                    <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t('shippingCharges')}</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-400 uppercase">{t('freeShipping')}</span>
                  ) : (
                    <span className="font-mono text-white">₹{shippingFee}</span>
                  )}
                </div>
              </div>

              {/* Order Total & Advance Split */}
              <div className="pt-3 border-t border-[#383838] space-y-2">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="font-bold text-[#E5E7EB]">{t('finalTotal')}</span>
                  <span className="font-extrabold text-xl text-white font-mono">₹{total.toLocaleString('en-IN')}</span>
                </div>

                {/* Selected Plan Realtime Calculation Box */}
                <div className="p-3.5 bg-[#181818] rounded-xl border border-[#D6A52A]/30 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#D6A52A]" />
                      <span>{t('payOnlineNow')} ({currentPercentage}%):</span>
                    </span>
                    <span className="text-[#D6A52A] font-extrabold text-sm font-mono">
                      ₹{currentPayable.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-semibold text-[#D1D5DB] pt-1.5 border-t border-[#333333]">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('remainingBalanceAtDelivery')}:</span>
                    </span>
                    <span className={`font-bold font-mono ${currentBalance === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {currentBalance === 0 ? '₹0 (Fully Paid)' : `₹${currentBalance.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Place Order & Pay CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-[#D6A52A] hover:bg-[#E5B93B] text-black font-extrabold text-sm rounded-xl shadow-lg shadow-[#D6A52A]/20 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>{t('orderProcessing')}</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Pay ₹{currentPayable.toLocaleString('en-IN')} & Confirm Order</span>
                  </>
                )}
              </button>

              <div className="text-[10px] text-[#888888] text-center leading-relaxed">
                By placing this order you agree to Mahadev Electro Hub's Advance Delivery Terms and Policies.
              </div>
            </div>
          </div>
        </form>

        {/* Secure Online Payment Simulator Modal (Active when live Razorpay keys are not yet configured in .env) */}
        {pendingPaymentOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#242424] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-[#383838] space-y-6 text-white animate-fadeIn">
              <div className="flex justify-between items-start pb-4 border-b border-[#383838]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D6A52A] block">
                    ONLINE GATEWAY VERIFICATION
                  </span>
                  <h3 className="font-heading font-extrabold text-xl text-white">
                    Order Payment ({pendingPaymentOrder.order.orderNumber})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingPaymentOrder(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Payment Summary */}
              <div className="bg-[#181818] rounded-xl p-4 border border-[#383838] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Customer Name:</span>
                  <span className="font-bold text-white">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Selected Plan:</span>
                  <span className="font-bold text-[#D6A52A]">{paymentPlan === 'ADVANCE_25' ? '25% Advance' : (paymentPlan === 'ADVANCE_50' ? '50% Advance' : '100% Full Payment')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Total Order Amount:</span>
                  <span className="font-bold font-mono text-white">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-[#333333]">
                  <span className="font-bold text-white">Pay Online Now:</span>
                  <span className="font-extrabold font-mono text-base text-[#D6A52A]">
                    ₹{pendingPaymentOrder.payableNow.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9CA3AF]">Remaining Balance at Delivery:</span>
                  <span className="font-bold font-mono text-amber-400">
                    ₹{pendingPaymentOrder.remainingBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="text-xs text-[#D1D5DB] bg-[#1E1E1E] p-3 rounded-lg border border-[#383838]">
                <strong>Developer / Store Notice:</strong> Live Razorpay API keys are not yet configured in <code className="text-[#D6A52A]">server/.env</code>. The backend has calculated and cryptographically signed this payment order. Choose an action to simulate gateway response:
              </div>

              {/* Simulation Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={simulating}
                  onClick={handleSimulateSuccess}
                  className="w-full py-3.5 px-4 bg-[#D6A52A] hover:bg-[#E5B93B] text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{simulating ? 'Verifying...' : `Simulate Successful Online Payment (₹${pendingPaymentOrder.payableNow})`}</span>
                </button>

                <button
                  type="button"
                  disabled={simulating}
                  onClick={handleSimulateFailure}
                  className="w-full py-3 px-4 bg-[#181818] border border-red-500/40 hover:bg-red-950/40 text-red-400 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  Simulate Payment Cancelled / Declined
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
