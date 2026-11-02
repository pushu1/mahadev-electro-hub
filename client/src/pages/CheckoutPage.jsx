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
      <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#50574F]">
        <Header />
        <div className="flex-1 max-w-lg mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold mb-4 text-[#26352A]">Aapki Cart Khali Hai</h2>
          <Link to="/shop" className="text-[#355E3B] font-bold underline hover:text-[#294A30]">
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
            color: '#355E3B',
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
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#50574F] selection:bg-[#DCE8D5] selection:text-[#26352A]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Title & Back link */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/cart" className="text-xs font-semibold text-[#50574F] hover:text-[#355E3B] flex items-center gap-1 mb-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← {t('backToCart')}</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-[#26352A]">
              {t('checkout')}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#2E7D46] bg-[#DCE8D5]/70 px-3 py-1.5 rounded-lg border border-[#A8BFA3]/50">
            <ShieldCheck className="w-4 h-4 text-[#2E7D46]" />
            <span className="font-bold">100% Secure SSL Checkout</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-[#B94343] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#B94343]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Details & Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Contact */}
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E6DC] shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-base text-[#26352A] pb-3 border-b border-[#E2E6DC] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F3F0E6] border border-[#355E3B] text-[#355E3B] text-xs flex items-center justify-center font-extrabold">1</span>
                <span>{t('contactDetails')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#26352A] mb-1">
                    {t('fullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3 py-2 text-xs border border-[#E2E6DC] bg-[#FFFFFF] text-[#26352A] rounded-lg focus:outline-none focus:border-[#355E3B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352A] mb-1">
                    {t('mobileNumber')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 text-xs border border-[#E2E6DC] bg-[#FFFFFF] text-[#26352A] rounded-lg focus:outline-none focus:border-[#355E3B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#26352A] mb-1">
                    {t('emailAddress')} (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com (for order receipt & tracking updates)"
                    className="w-full px-3 py-2 text-xs border border-[#E2E6DC] bg-[#FFFFFF] text-[#26352A] rounded-lg focus:outline-none focus:border-[#355E3B]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E6DC] shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-base text-[#26352A] pb-3 border-b border-[#E2E6DC] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F3F0E6] border border-[#355E3B] text-[#355E3B] text-xs flex items-center justify-center font-extrabold">2</span>
                <span>{t('deliveryAddress')}</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#26352A] mb-1">
                    {t('streetAddress')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House/Shop no, Near temple/main road, Village/Colony"
                    className="w-full px-3 py-2 text-xs border border-[#E2E6DC] bg-[#FFFFFF] text-[#26352A] rounded-lg focus:outline-none focus:border-[#355E3B]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#26352A] mb-1">
                      {t('cityTehsil')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E2E6DC] bg-[#FFFFFF] text-[#26352A] rounded-lg focus:outline-none focus:border-[#355E3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#26352A] mb-1">
                      {t('district')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E2E6DC] bg-[#FFFFFF] text-[#26352A] rounded-lg focus:outline-none focus:border-[#355E3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#26352A] mb-1">
                      {t('state')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E2E6DC] bg-[#FFFFFF] text-[#26352A] rounded-lg focus:outline-none focus:border-[#355E3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#26352A] mb-1">
                      {t('pincode')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E2E6DC] bg-[#FFFFFF] text-[#26352A] rounded-lg focus:outline-none focus:border-[#355E3B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352A] mb-1">
                    {t('landmark')}
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Primary School, Old Bus Stand, etc."
                    className="w-full px-3 py-2 text-xs border border-[#E2E6DC] bg-[#FFFFFF] text-[#26352A] rounded-lg focus:outline-none focus:border-[#355E3B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352A] mb-1">
                    Order Notes / Special Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Koi vishesh delivery instructions ya preferred timing yahan likhein"
                    className="w-full px-3 py-2 text-xs border border-[#E2E6DC] bg-[#FFFFFF] text-[#26352A] rounded-lg focus:outline-none focus:border-[#355E3B]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Advance Payment Plan Selection (No COD) */}
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E6DC] shadow-sm space-y-4">
              <div className="pb-3 border-b border-[#E2E6DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-heading font-bold text-base text-[#26352A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#F3F0E6] border border-[#355E3B] text-[#355E3B] text-xs flex items-center justify-center font-extrabold">3</span>
                  <span>{t('paymentPlanTitle')}</span>
                </h3>
                <span className="text-[11px] font-bold text-[#294A30] bg-[#DCE8D5]/70 border border-[#A8BFA3]/50 px-2.5 py-0.5 rounded-full">
                  Advance Payment Mandatory • 100% Verified Dispatch
                </span>
              </div>

              <p className="text-xs text-[#50574F] leading-relaxed">
                Choose how you want to pay. Advance payments are securely processed online to lock your inventory and dispatch your parcel.
              </p>

              {/* 3 Selectable Payment Plan Cards */}
              <div className="space-y-3 pt-1">
                {/* Plan 1: 25% Advance */}
                <label
                  onClick={() => setPaymentPlan('ADVANCE_25')}
                  className={`block p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentPlan === 'ADVANCE_25'
                      ? 'border-[#355E3B] bg-[#DCE8D5]/25 shadow-md shadow-[#355E3B]/10'
                      : 'border-[#E2E6DC] hover:border-[#A8BFA3] bg-[#FAF9F6]'
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
                        className="mt-1 text-[#355E3B] focus:ring-[#8BA889] h-4 w-4 accent-[#355E3B]"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-extrabold text-sm sm:text-base text-[#26352A]">
                            {t('advance25Title')}
                          </span>
                          <span className="text-[10px] font-bold bg-[#F3F0E6] text-[#355E3B] border border-[#A8BFA3]/40 px-2 py-0.5 rounded">
                            {t('advance25Badge')}
                          </span>
                        </div>
                        <p className="text-xs text-[#50574F] leading-relaxed">
                          {t('advance25Desc')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-[#7A8277]">{t('payOnlineNow')}</div>
                      <div className="font-mono font-extrabold text-base sm:text-lg text-[#355E3B]">
                        ₹{plan25Payable.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#B7791F] font-semibold mt-0.5">
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
                      ? 'border-[#355E3B] bg-[#DCE8D5]/25 shadow-md shadow-[#355E3B]/10'
                      : 'border-[#E2E6DC] hover:border-[#A8BFA3] bg-[#FAF9F6]'
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
                        className="mt-1 text-[#355E3B] focus:ring-[#8BA889] h-4 w-4 accent-[#355E3B]"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-extrabold text-sm sm:text-base text-[#26352A]">
                            {t('advance50Title')}
                          </span>
                          <span className="text-[10px] font-bold bg-[#F3F0E6] text-[#26352A] border border-[#E2E6DC] px-2 py-0.5 rounded">
                            {t('advance50Badge')}
                          </span>
                        </div>
                        <p className="text-xs text-[#50574F] leading-relaxed">
                          {t('advance50Desc')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-[#7A8277]">{t('payOnlineNow')}</div>
                      <div className="font-mono font-extrabold text-base sm:text-lg text-[#355E3B]">
                        ₹{plan50Payable.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#B7791F] font-semibold mt-0.5">
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
                      ? 'border-[#355E3B] bg-[#DCE8D5]/25 shadow-md shadow-[#355E3B]/10'
                      : 'border-[#E2E6DC] hover:border-[#A8BFA3] bg-[#FAF9F6]'
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
                        className="mt-1 text-[#355E3B] focus:ring-[#8BA889] h-4 w-4 accent-[#355E3B]"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-extrabold text-sm sm:text-base text-[#26352A]">
                            {t('full100Title')}
                          </span>
                          <span className="text-[10px] font-bold bg-[#DCE8D5]/70 text-[#2E7D46] border border-[#A8BFA3]/50 px-2 py-0.5 rounded">
                            {t('full100Badge')}
                          </span>
                        </div>
                        <p className="text-xs text-[#50574F] leading-relaxed">
                          {t('full100Desc')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-[#7A8277]">{t('payOnlineNow')}</div>
                      <div className="font-mono font-extrabold text-base sm:text-lg text-[#2E7D46]">
                        ₹{plan100Payable.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#2E7D46] font-semibold mt-0.5">
                        ₹0 balance at delivery
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Clear Delivery Terms Notice */}
              <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E2E6DC] text-[11px] text-[#50574F] leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#355E3B] shrink-0 mt-0.5" />
                <span>
                  {t('paymentTermsNotice')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E6DC] shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-base text-[#26352A] pb-3 border-b border-[#E2E6DC]">
                {t('orderSummary')}
              </h3>

              {/* Items Preview */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-xs py-1.5 border-b border-[#E2E6DC]">
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <span className="font-bold text-[#355E3B]">×{item.quantity}</span>
                      <span className="truncate text-[#50574F]">{getProductText(item, 'title') || item.title_en}</span>
                    </div>
                    <span className="font-bold text-[#26352A] font-mono">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Cost Breakdown */}
              <div className="pt-2 border-t border-[#E2E6DC] space-y-2 text-xs text-[#50574F]">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold text-[#26352A] font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#2E7D46] font-semibold">
                    <span>{t('discount')} ({appliedCoupon?.code})</span>
                    <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t('shippingCharges')}</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-[#2E7D46] uppercase">{t('freeShipping')}</span>
                  ) : (
                    <span className="font-mono text-[#26352A]">₹{shippingFee}</span>
                  )}
                </div>
              </div>

              {/* Order Total & Advance Split */}
              <div className="pt-3 border-t border-[#E2E6DC] space-y-2">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="font-bold text-[#26352A]">{t('finalTotal')}</span>
                  <span className="font-extrabold text-xl text-[#26352A] font-mono">₹{total.toLocaleString('en-IN')}</span>
                </div>

                {/* Selected Plan Realtime Calculation Box */}
                <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#A8BFA3]/40 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[#26352A]">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#355E3B]" />
                      <span>{t('payOnlineNow')} ({currentPercentage}%):</span>
                    </span>
                    <span className="text-[#355E3B] font-extrabold text-sm font-mono">
                      ₹{currentPayable.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-semibold text-[#50574F] pt-1.5 border-t border-[#E2E6DC]">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#B7791F]" />
                      <span>{t('remainingBalanceAtDelivery')}:</span>
                    </span>
                    <span className={`font-bold font-mono ${currentBalance === 0 ? 'text-[#2E7D46]' : 'text-[#B7791F]'}`}>
                      {currentBalance === 0 ? '₹0 (Fully Paid)' : `₹${currentBalance.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Place Order & Pay CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-[#355E3B] hover:bg-[#294A30] text-white font-extrabold text-sm rounded-xl shadow-md shadow-[#355E3B]/20 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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

              <div className="text-[10px] text-[#7A8277] text-center leading-relaxed">
                By placing this order you agree to Mahadev Electro Hub's Advance Delivery Terms and Policies.
              </div>
            </div>
          </div>
        </form>

        {/* Secure Online Payment Simulator Modal */}
        {pendingPaymentOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-[#E2E6DC] space-y-6 text-[#26352A] animate-fadeIn">
              <div className="flex justify-between items-start pb-4 border-b border-[#E2E6DC]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#355E3B] block">
                    ONLINE GATEWAY VERIFICATION
                  </span>
                  <h3 className="font-heading font-extrabold text-xl text-[#26352A]">
                    Order Payment ({pendingPaymentOrder.order.orderNumber})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingPaymentOrder(null)}
                  className="p-1 rounded-lg text-[#7A8277] hover:text-[#26352A] hover:bg-[#F3F0E6] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Payment Summary */}
              <div className="bg-[#FAF9F6] rounded-xl p-4 border border-[#E2E6DC] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#7A8277]">Customer Name:</span>
                  <span className="font-bold text-[#26352A]">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A8277]">Selected Plan:</span>
                  <span className="font-bold text-[#355E3B]">{paymentPlan === 'ADVANCE_25' ? '25% Advance' : (paymentPlan === 'ADVANCE_50' ? '50% Advance' : '100% Full Payment')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A8277]">Total Order Amount:</span>
                  <span className="font-bold font-mono text-[#26352A]">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-[#E2E6DC]">
                  <span className="font-bold text-[#26352A]">Pay Online Now:</span>
                  <span className="font-extrabold font-mono text-base text-[#355E3B]">
                    ₹{pendingPaymentOrder.payableNow.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#7A8277]">Remaining Balance at Delivery:</span>
                  <span className="font-bold font-mono text-[#B7791F]">
                    ₹{pendingPaymentOrder.remainingBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="text-xs text-[#50574F] bg-[#F3F0E6] p-3 rounded-lg border border-[#E2E6DC]">
                <strong>Developer / Store Notice:</strong> Live Razorpay API keys are not yet configured in <code className="text-[#355E3B]">server/.env</code>. The backend has calculated and cryptographically signed this payment order. Choose an action to simulate gateway response:
              </div>

              {/* Simulation Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={simulating}
                  onClick={handleSimulateSuccess}
                  className="w-full py-3.5 px-4 bg-[#355E3B] hover:bg-[#294A30] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{simulating ? 'Verifying...' : `Simulate Successful Online Payment (₹${pendingPaymentOrder.payableNow})`}</span>
                </button>

                <button
                  type="button"
                  disabled={simulating}
                  onClick={handleSimulateFailure}
                  className="w-full py-3 px-4 bg-[#FAF9F6] border border-red-300 hover:bg-red-50 text-[#B94343] font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
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
