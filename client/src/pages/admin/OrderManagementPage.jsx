import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Eye,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  X,
  CreditCard,
  Truck,
  Check,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { api } from '../../services/api.js';

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Reconcile Balance Form State
  const [reconcileAmount, setReconcileAmount] = useState('');
  const [reconcileRef, setReconcileRef] = useState('');
  const [reconcileNotes, setReconcileNotes] = useState('');
  const [reconciling, setReconciling] = useState(false);
  const [reconcileSuccess, setReconcileSuccess] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (paymentFilter) params.paymentStatus = paymentFilter;

    api.getAllOrders(params)
      .then(res => {
        if (res.success && Array.isArray(res.orders)) {
          setOrders(res.orders);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    window.addEventListener('meh_data_synced', fetchOrders);
    window.addEventListener('focus', fetchOrders);
    return () => {
      window.removeEventListener('meh_data_synced', fetchOrders);
      window.removeEventListener('focus', fetchOrders);
    };
  }, [statusFilter, paymentFilter]);

  const handleStatusChange = async (orderId, newStatus, newPaymentStatus) => {
    setUpdating(true);
    try {
      const res = await api.updateOrderStatus(orderId, newStatus, newPaymentStatus);
      if (res.success && res.order) {
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
          setSelectedOrder(res.order);
        }
        fetchOrders();
      }
    } catch (err) {
      alert(err.message || 'Error updating order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setReconcileAmount(order.remainingBalance || '');
    setReconcileRef('');
    setReconcileNotes('');
    setReconcileSuccess('');
  };

  const handleReconcileBalance = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setReconciling(true);
    setReconcileSuccess('');
    try {
      const res = await api.reconcileBalance(selectedOrder.id, {
        amountCollected: parseFloat(reconcileAmount) || selectedOrder.remainingBalance,
        transactionRef: reconcileRef.trim() || undefined,
        notes: reconcileNotes.trim() || undefined,
      });

      if (res.success && res.order) {
        setSelectedOrder(res.order);
        setReconcileSuccess('Remaining balance successfully reconciled! Order is now Fully Paid.');
        fetchOrders();
      } else {
        throw new Error(res.message || 'Balance reconciliation failed.');
      }
    } catch (err) {
      alert(err.message || 'Error reconciling balance');
    } finally {
      setReconciling(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-[#252A25]">
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-[#171C17]">
              Order Management & Advance Reconciliation
            </h1>
            <p className="text-xs text-[#252A25] mt-0.5">
              Track customer orders, advance payments, and reconcile remaining delivery balances.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#D5DDD2] text-[#171C17] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#24532F]"
            >
              <option value="">All Order Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#D5DDD2] text-[#171C17] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#24532F]"
            >
              <option value="">All Payment Statuses</option>
              <option value="Partially Paid">Partially Paid (Balance Due)</option>
              <option value="Fully Paid">Fully Paid</option>
              <option value="Advance Payment Pending">Advance Payment Pending</option>
              <option value="Payment Failed">Payment Failed</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-[#D5DDD2] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F0E6] border-b border-[#D5DDD2] text-[#596358] uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Order Number & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Payment Plan</th>
                  <th className="py-3.5 px-4">Online Paid vs Balance</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DDD2]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-xs text-[#596358]">Loading orders...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-xs text-[#596358] italic">No orders found.</td>
                  </tr>
                ) : (
                  orders.map(order => {
                    const planLabel = order.paymentPlan === 'ADVANCE_25'
                      ? '25% Advance'
                      : (order.paymentPlan === 'ADVANCE_50' ? '50% Advance' : '100% Full Payment');

                    return (
                      <tr key={order.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#171C17]">
                          <span className="font-mono text-[#24532F] block">{order.orderNumber}</span>
                          <span className="text-[10px] text-[#596358]">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[#171C17] block">{order.customerName}</span>
                          <span className="text-[11px] text-[#596358]">{order.customerPhone}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#171C17] block">{planLabel}</span>
                          <span className="text-[10px] text-[#596358]">
                            Total: ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-xs">
                            <span className="text-[#2E7D46] font-bold font-mono">
                              Paid: ₹{(order.amountPaid || order.payableNow || 0).toLocaleString('en-IN')}
                            </span>
                            <div className="text-[11px]">
                              {order.remainingBalance > 0 ? (
                                <span className="text-[#B7791F] font-semibold font-mono">
                                  Due: ₹{order.remainingBalance.toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className="text-[#2E7D46] font-medium">✓ Due: ₹0</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            order.paymentStatus === 'Fully Paid'
                              ? 'bg-[#DCE8D5] text-[#183D22]'
                              : order.paymentStatus === 'Partially Paid'
                              ? 'bg-[#FAF9F6] text-[#B7791F] border border-[#B7791F]/30'
                              : 'bg-[#B94343]/10 text-[#B94343]'
                          }`}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            disabled={updating}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="px-2 py-1 text-[11px] font-bold rounded-xl border border-[#D5DDD2] bg-white text-[#171C17] focus:outline-none focus:border-[#24532F]"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(order)}
                            className="px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#F3F0E6] text-[#171C17] border border-[#D5DDD2] rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#24532F]" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details & Delivery Balance Reconciliation Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl border border-[#D5DDD2] space-y-6 max-h-[90vh] overflow-y-auto text-[#252A25] animate-fadeIn">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-[#D5DDD2]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#24532F] block">
                    ORDER FULFILLMENT & BALANCE AUDIT
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl text-[#171C17] font-mono">
                    {selectedOrder.orderNumber}
                  </h3>
                  <span className="text-xs text-[#596358]">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-xl text-[#596358] hover:text-[#171C17] hover:bg-[#FAF9F6] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Update Bar */}
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#D5DDD2] flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-[#171C17] block mb-1">Fulfillment Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="px-3 py-1.5 bg-white border border-[#D5DDD2] text-[#171C17] rounded-xl font-bold focus:outline-none focus:border-[#24532F]"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <span className="font-bold text-[#171C17] block mb-1">Payment Status:</span>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => handleStatusChange(selectedOrder.id, undefined, e.target.value)}
                    className="px-3 py-1.5 bg-white border border-[#D5DDD2] text-[#171C17] rounded-xl font-bold focus:outline-none focus:border-[#24532F]"
                  >
                    <option value="Advance Payment Pending">Advance Payment Pending</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Fully Paid">Fully Paid</option>
                    <option value="Payment Failed">Payment Failed</option>
                  </select>
                </div>
              </div>

              {/* Financial Balance Summary Card */}
              <div className="bg-[#F3F0E6] rounded-xl p-5 border border-[#D5DDD2] space-y-3">
                <h4 className="font-heading font-extrabold text-sm text-[#171C17] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#24532F]" />
                  <span>Payment Plan & Financial Breakdown</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#D5DDD2]">
                    <span className="text-[#596358] block text-[10px]">Payment Plan:</span>
                    <strong className="text-[#171C17] text-xs block mt-0.5">
                      {selectedOrder.paymentPlan === 'ADVANCE_25'
                        ? '25% Advance'
                        : (selectedOrder.paymentPlan === 'ADVANCE_50' ? '50% Advance' : '100% Full Payment')}
                    </strong>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#D5DDD2]">
                    <span className="text-[#596358] block text-[10px]">Total Order Amount:</span>
                    <strong className="text-[#171C17] text-sm font-mono block mt-0.5">
                      ₹{(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#D5DDD2]">
                    <span className="text-[#596358] block text-[10px]">Amount Paid Online:</span>
                    <strong className="text-[#2E7D46] text-sm font-mono block mt-0.5">
                      ₹{(selectedOrder.amountPaid || selectedOrder.payableNow || 0).toLocaleString('en-IN')}
                    </strong>
                    {selectedOrder.advanceTransactionId && (
                      <span className="text-[10px] text-[#596358] font-mono block truncate" title={selectedOrder.advanceTransactionId}>
                        Txn: {selectedOrder.advanceTransactionId}
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#D5DDD2]">
                    <span className="text-[#596358] block text-[10px]">Outstanding Balance:</span>
                    <strong className={`text-sm font-mono block mt-0.5 ${selectedOrder.remainingBalance === 0 ? 'text-[#2E7D46]' : 'text-[#B7791F]'}`}>
                      {selectedOrder.remainingBalance === 0 ? '₹0 (Fully Paid)' : `₹${selectedOrder.remainingBalance.toLocaleString('en-IN')}`}
                    </strong>
                  </div>
                </div>
              </div>

              {reconcileSuccess && (
                <div className="p-3 bg-[#DCE8D5] border border-[#356B3D]/40 rounded-xl text-[#183D22] text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2E7D46] shrink-0" />
                  <span>{reconcileSuccess}</span>
                </div>
              )}

              {/* Delivery Balance Reconciliation Form (If Balance Due > 0) */}
              {selectedOrder.remainingBalance > 0 ? (
                <div className="bg-[#FAF9F6] p-5 rounded-xl border border-[#D5DDD2] space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-extrabold text-sm text-[#171C17] flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#24532F]" />
                      <span>Reconcile Delivery Balance Collection</span>
                    </h4>
                    <span className="text-xs font-bold text-[#B7791F] bg-[#FAF9F6] border border-[#B7791F]/30 px-2.5 py-0.5 rounded-full">
                      Outstanding: ₹{selectedOrder.remainingBalance.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-xs text-[#252A25] leading-relaxed">
                    When the remaining balance is collected upon delivery (doorstep UPI, card, or transport collection), record the details below to reconcile the balance and mark this order as <strong>Fully Paid</strong>.
                  </p>

                  <form onSubmit={handleReconcileBalance} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#171C17] mb-1">
                        Amount Collected (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={reconcileAmount}
                        onChange={(e) => setReconcileAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D5DDD2] rounded-xl text-[#171C17] font-mono text-xs focus:outline-none focus:border-[#24532F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#171C17] mb-1">
                        Receipt / Reference ID
                      </label>
                      <input
                        type="text"
                        value={reconcileRef}
                        onChange={(e) => setReconcileRef(e.target.value)}
                        placeholder="e.g. REC-PALI-9842"
                        className="w-full px-3 py-2 bg-white border border-[#D5DDD2] rounded-xl text-[#171C17] text-xs focus:outline-none focus:border-[#24532F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#171C17] mb-1">
                        Notes / Receiver
                      </label>
                      <input
                        type="text"
                        value={reconcileNotes}
                        onChange={(e) => setReconcileNotes(e.target.value)}
                        placeholder="Delivered by DTDC / cash verified"
                        className="w-full px-3 py-2 bg-white border border-[#D5DDD2] rounded-xl text-[#171C17] text-xs focus:outline-none focus:border-[#24532F]"
                      />
                    </div>

                    <div className="sm:col-span-3 pt-2">
                      <button
                        type="submit"
                        disabled={reconciling}
                        className="px-5 py-2.5 bg-[#2E7D46] hover:bg-[#256639] text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>{reconciling ? 'Recording...' : `Record Balance Collected (₹${reconcileAmount || selectedOrder.remainingBalance}) & Mark Fully Paid`}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-4 bg-[#DCE8D5]/60 rounded-xl border border-[#356B3D]/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2E7D46]/20 text-[#2E7D46] flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <strong className="text-[#171C17] text-xs block">Order Fully Paid & Balance Reconciled</strong>
                      <span className="text-[11px] text-[#252A25]">
                        Zero outstanding balance at delivery. {selectedOrder.finalTransactionId ? `Receipt Ref: ${selectedOrder.finalTransactionId}` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-[#DCE8D5] text-[#183D22] border border-[#356B3D]/40 px-3 py-1 rounded-full uppercase">
                    Fully Paid
                  </span>
                </div>
              )}

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#D5DDD2] space-y-1.5">
                  <span className="font-bold text-[#171C17] block mb-1">Customer Information</span>
                  <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                  {selectedOrder.customerEmail && <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>}
                </div>

                <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#D5DDD2] space-y-1.5">
                  <span className="font-bold text-[#171C17] block mb-1">Delivery Destination</span>
                  {selectedOrder.shippingAddress && (
                    <p className="leading-relaxed text-[#252A25]">
                      {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},<br />
                      {selectedOrder.shippingAddress.district || ''} {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                    </p>
                  )}
                  {selectedOrder.notes && (
                    <p className="text-[#B7791F] italic mt-2"><strong>Notes:</strong> {selectedOrder.notes}</p>
                  )}
                </div>
              </div>

              {/* Items in order */}
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-[#596358] block mb-3">
                  Ordered Products ({selectedOrder.items?.length || 0} Items)
                </span>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-xl border border-[#D5DDD2] bg-[#FAF9F6]">
                      <div className="flex items-center gap-3">
                        <img src={item.productImage || '/images/logo.png'} alt="" className="w-10 h-10 rounded-lg object-cover bg-white border border-[#D5DDD2]" />
                        <div>
                          <span className="font-bold text-[#171C17] block">{item.productTitle_en}</span>
                          <span className="text-[#596358]">Qty: {item.quantity} × ₹{item.price}</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-[#171C17] font-mono">₹{item.total?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="pt-4 border-t border-[#D5DDD2] space-y-1 text-xs text-right text-[#252A25]">
                <div>Subtotal: ₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</div>
                {selectedOrder.discount > 0 && <div className="text-[#2E7D46]">Discount: -₹{selectedOrder.discount}</div>}
                <div>Shipping Fee: ₹{selectedOrder.shippingFee}</div>
                <div className="text-base font-extrabold text-[#171C17] pt-1 font-mono">
                  Final Order Total: ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
