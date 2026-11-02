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
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252A25]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 sm:py-14 w-full">
        {/* User Card */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#D5DDD2] shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F3F0E6] text-[#24532F] font-bold text-xl flex items-center justify-center border-2 border-[#24532F] shadow-2xs">
              {customerUser?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-heading font-extrabold text-[#171C17]">
                {customerUser?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#252A25] mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#24532F]" />
                  <span>{customerUser?.phone}</span>
                </span>
                {customerUser?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#24532F]" />
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
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D5DDD2] p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-heading font-bold text-[#171C17] mb-4 pb-3 border-b border-[#D5DDD2] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#24532F]" />
            <span>Orders History ({orders.length})</span>
          </h2>

          {loadingOrders ? (
            <div className="py-8 text-center text-xs text-[#596358]">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#596358]">
              <Package className="w-12 h-12 text-[#356B3D] mx-auto mb-2" />
              <p className="font-semibold text-[#252A25] mb-2">No orders placed yet.</p>
              <Link to="/shop" className="text-[#24532F] hover:text-[#183D22] font-bold underline">
                {t('startShopping')} →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 sm:p-5 rounded-xl bg-[#FAF9F6] border border-[#D5DDD2] hover:border-[#356B3D] transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-[#D5DDD2] gap-2 mb-3">
                    <div>
                      <span className="text-xs font-extrabold text-[#171C17] block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-[#596358] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-right">
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-[#171C17] font-mono block">
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#2E7D46] font-semibold block">
                          Paid: ₹{(order.amountPaid || order.payableNow || 0).toLocaleString('en-IN')}
                          {order.remainingBalance > 0 && <span className="text-[#B7791F] ml-1.5">• Due: ₹{order.remainingBalance.toLocaleString('en-IN')}</span>}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCE8D5]/70 text-[#183D22] border border-[#356B3D]/50 uppercase self-end sm:self-auto">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="space-y-2 mb-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-[#252A25]">
                        <span>• {item.productTitle_en} (Qty: {item.quantity})</span>
                        <span className="font-semibold text-[#171C17]">₹{item.total?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#D5DDD2] flex justify-end">
                    <Link
                      to={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}
                      className="text-xs font-bold text-[#24532F] hover:text-[#183D22] hover:underline"
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
