import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, LogOut, Phone, Mail, Clock } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function MyAccountPage() {
  const { isCustomerAuthenticated, customerUser, logoutCustomer } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!isCustomerAuthenticated) {
      navigate('/login', { state: { from: '/my-account' } });
      return;
    }

    api.getMyOrders()
      .then(res => {
        if (res.success && Array.isArray(res.orders)) {
          setOrders(res.orders);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingOrders(false);
      });
  }, [isCustomerAuthenticated, navigate]);

  if (!isCustomerAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#50574F]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 sm:py-14 w-full">
        {/* User Card */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#E2E6DC] shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F3F0E6] text-[#355E3B] font-bold text-xl flex items-center justify-center border-2 border-[#355E3B] shadow-2xs">
              {customerUser?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-heading font-extrabold text-[#26352A]">
                {customerUser?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#50574F] mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#355E3B]" />
                  <span>{customerUser?.phone}</span>
                </span>
                {customerUser?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#355E3B]" />
                    <span>{customerUser?.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { logoutCustomer(); navigate('/'); }}
            className="px-4 py-2 text-xs font-bold text-[#B94343] bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>

        {/* My Orders Section */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E6DC] p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-heading font-bold text-[#26352A] mb-4 pb-3 border-b border-[#E2E6DC] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#355E3B]" />
            <span>Orders History ({orders.length})</span>
          </h2>

          {loadingOrders ? (
            <div className="py-8 text-center text-xs text-[#7A8277]">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7A8277]">
              <Package className="w-12 h-12 text-[#A8BFA3] mx-auto mb-2" />
              <p className="font-semibold text-[#50574F] mb-2">No orders placed yet.</p>
              <Link to="/shop" className="text-[#355E3B] hover:text-[#294A30] font-bold underline">
                {t('startShopping')} →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 sm:p-5 rounded-xl bg-[#FAF9F6] border border-[#E2E6DC] hover:border-[#A8BFA3] transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-[#E2E6DC] gap-2 mb-3">
                    <div>
                      <span className="text-xs font-extrabold text-[#26352A] block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-[#7A8277] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-right">
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-[#26352A] font-mono block">
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#2E7D46] font-semibold block">
                          Paid: ₹{(order.amountPaid || order.payableNow || 0).toLocaleString('en-IN')}
                          {order.remainingBalance > 0 && <span className="text-[#B7791F] ml-1.5">• Due: ₹{order.remainingBalance.toLocaleString('en-IN')}</span>}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCE8D5]/70 text-[#294A30] border border-[#A8BFA3]/50 uppercase self-end sm:self-auto">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="space-y-2 mb-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-[#50574F]">
                        <span>• {item.productTitle_en} (Qty: {item.quantity})</span>
                        <span className="font-semibold text-[#26352A]">₹{item.total?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#E2E6DC] flex justify-end">
                    <Link
                      to={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}
                      className="text-xs font-bold text-[#355E3B] hover:text-[#294A30] hover:underline"
                    >
                      Order Details Track Karein →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
