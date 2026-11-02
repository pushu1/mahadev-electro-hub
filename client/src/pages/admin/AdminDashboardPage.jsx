import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  Users,
  Clock,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { api } from '../../services/api.js';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats()
      .then(res => {
        if (res.success) setData(res);
      })
      .catch(err => {
        console.error('Error fetching dashboard stats:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-white">
              Store Dashboard Overview
            </h1>
            <p className="text-xs text-[#B3B3B3] mt-0.5">
              Mahadev Electro Hub ka live metrics aur orders tracking.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/products"
              className="px-4 py-2 bg-[#D6A52A] hover:bg-[#E5B93B] text-[#000000] font-bold text-xs rounded-xl transition-all shadow-sm"
            >
              + Naya Product Add Karein
            </Link>
          </div>
        </div>

        {/* Analytics Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Sales */}
          <div className="bg-[#242424] p-5 rounded-2xl border border-[#383838] shadow-md text-white">
            <div className="flex items-center justify-between text-[#B3B3B3] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
              <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#B3B3B3] mt-2">
              <span className="text-emerald-400">Paid: ₹{(stats?.paidRevenue || 0).toLocaleString('en-IN')}</span>
              <span>•</span>
              <span className="text-amber-400">Due: ₹{(stats?.pendingDeliveryBalanceRevenue || stats?.pendingCodRevenue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-[#242424] p-5 rounded-2xl border border-[#383838] shadow-md text-white">
            <div className="flex items-center justify-between text-[#B3B3B3] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Orders</span>
              <div className="p-2 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-500/30">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {stats?.totalOrders || 0}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#B3B3B3] mt-2">
              <span>Today: {stats?.todayOrders || 0}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">Pending: {stats?.pendingOrders || 0}</span>
            </div>
          </div>

          {/* Active Products */}
          <div className="bg-[#242424] p-5 rounded-2xl border border-[#383838] shadow-md text-white">
            <div className="flex items-center justify-between text-[#B3B3B3] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Products</span>
              <div className="p-2 rounded-lg bg-purple-950/60 text-purple-400 border border-purple-500/30">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {stats?.totalActiveProducts || 0}
            </div>
            <div className="text-[11px] text-[#B3B3B3] mt-2">
              8 bilingual categories ke andar
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-[#242424] p-5 rounded-2xl border border-[#383838] shadow-md text-white">
            <div className="flex items-center justify-between text-[#B3B3B3] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Inventory Alerts</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-600">
              {stats?.lowStockCount || 0} Low Stock
            </div>
            <div className="text-[11px] text-red-600 mt-2 font-medium">
              {stats?.outOfStockCount || 0} Out of Stock products
            </div>
          </div>
        </div>

        {/* Low Stock Urgent Items Table (if any) */}
        {Array.isArray(data?.lowStockProducts) && data.lowStockProducts.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Low Stock Warning (Kam Stock Wale Products)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {data.lowStockProducts.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block truncate max-w-[160px]">{p.title_en}</span>
                    <span className="text-[10px] text-[#B3B3B3]">SKU: {p.sku}</span>
                  </div>
                  <span className="font-extrabold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                    {p.stockQuantity} Pieces Bache Hain
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid: Recent Orders & Top Selling Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#383838] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#383838]">
              <h3 className="font-heading font-bold text-base text-white">
                Haal Ke Orders (Recent Orders)
              </h3>
              <Link to="/admin/orders" className="text-xs font-bold text-[#00A9A5] hover:underline flex items-center gap-1">
                <span>Sabhi Dekhein</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-[#B3B3B3]">Orders load ho rahe hain...</div>
            ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#B3B3B3] italic">Abhi tak koi customer order place nahi hua hai.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#383838] text-[#B3B3B3] uppercase text-[10px]">
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#383838]">
                    {data.recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-[#2D2D2D]">
                        <td className="py-3 px-3 font-bold text-white">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-white block">{order.customerName}</span>
                          <span className="text-[10px] text-gray-400">{order.customerPhone}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-white">
                          ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-gray-400 text-[11px]">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Selling Products */}
          <div className="bg-white rounded-2xl border border-[#383838] p-6 shadow-xs">
            <h3 className="font-heading font-bold text-base text-white mb-4 pb-3 border-b border-[#383838]">
              Sabse Zyada Bikne Wale Products
            </h3>

            {!data?.topSellingProducts || data.topSellingProducts.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#B3B3B3] italic">
                Orders place hone par sales rankings yahan automatically display hongi.
              </p>
            ) : (
              <div className="space-y-3">
                {data.topSellingProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                      <div>
                        <span className="font-bold text-white block truncate max-w-[150px]">{p.title}</span>
                        <span className="text-[11px] text-[#B3B3B3]">{p.unitsSold} pieces bike</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-700">
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
