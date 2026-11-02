import express from 'express';
import { localStore } from '../database/store.js';
import { getDatabaseStatus } from '../database/connection.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', requireAdmin, (req, res) => {
  try {
    const orders = localStore.getOrders();
    const products = localStore.getProducts();
    const customers = localStore.get().customers || [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let totalRevenue = 0;
    let paidRevenue = 0;
    let pendingDeliveryBalanceRevenue = 0;
    let todayOrdersCount = 0;
    let monthOrdersCount = 0;
    let pendingOrdersCount = 0;
    let deliveredOrdersCount = 0;
    let cancelledOrdersCount = 0;

    const productSalesMap = {};

    for (const order of orders) {
      const orderTime = new Date(order.createdAt).getTime();

      if (orderTime >= startOfToday) todayOrdersCount++;
      if (orderTime >= startOfMonth) monthOrdersCount++;

      if (order.status === 'PENDING') pendingOrdersCount++;
      if (order.status === 'DELIVERED') deliveredOrdersCount++;
      if (order.status === 'CANCELLED') cancelledOrdersCount++;

      // Real revenue calculation: Do not count cancelled or refunded orders
      if (order.status !== 'CANCELLED' && order.status !== 'REFUNDED') {
        totalRevenue += (order.totalAmount || 0);

        if (order.paymentStatus === 'Fully Paid' || order.paymentStatus === 'PAID') {
          paidRevenue += (order.totalAmount || 0);
        } else {
          paidRevenue += (order.amountPaid || order.payableNow || 0);
          pendingDeliveryBalanceRevenue += (order.remainingBalance || 0);
        }

        // Aggregate top-selling products from order items
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            if (!productSalesMap[item.productId]) {
              productSalesMap[item.productId] = {
                id: item.productId,
                title: item.productTitle_en,
                image: item.productImage,
                unitsSold: 0,
                revenue: 0
              };
            }
            productSalesMap[item.productId].unitsSold += (item.quantity || 1);
            productSalesMap[item.productId].revenue += (item.total || 0);
          }
        }
      }
    }

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // Product stock metrics
    const activeProducts = products.filter(p => p.status === 'ACTIVE').length;
    const lowStockProducts = products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 10);
    const outOfStockProducts = products.filter(p => (p.stockQuantity || 0) <= 0);

    // Recent orders (last 8)
    const recentOrders = orders.slice(0, 8);

    // Database connection status
    const dbStatus = getDatabaseStatus();

    res.json({
      success: true,
      stats: {
        totalOrders: orders.length,
        todayOrders: todayOrdersCount,
        monthOrders: monthOrdersCount,
        pendingOrders: pendingOrdersCount,
        deliveredOrders: deliveredOrdersCount,
        cancelledOrders: cancelledOrdersCount,
        totalRevenue,
        paidRevenue,
        pendingDeliveryBalanceRevenue,
        pendingCodRevenue: pendingDeliveryBalanceRevenue, // Backward compatibility alias
        totalCustomers: customers.length,
        totalActiveProducts: activeProducts,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
      },
      lowStockProducts: lowStockProducts.map(p => ({
        id: p.id,
        title_en: p.title_en,
        title_hi: p.title_hi,
        stockQuantity: p.stockQuantity,
        price: p.price,
        sku: p.sku
      })),
      recentOrders,
      topSellingProducts,
      database: dbStatus,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
