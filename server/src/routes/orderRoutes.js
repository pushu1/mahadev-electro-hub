import express from 'express';
import crypto from 'crypto';
import { localStore } from '../database/store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { emailService } from '../services/emailService.js';
import { config } from '../config/index.js';

const router = express.Router();

// Helper: Calculate advance and balance
function calculatePlanAmounts(totalAmount, plan) {
  const percentage = plan === 'ADVANCE_25' ? 25 : (plan === 'ADVANCE_50' ? 50 : 100);
  const payableNow = Number((totalAmount * (percentage / 100)).toFixed(2));
  const remainingBalance = Number((totalAmount - payableNow).toFixed(2));
  return { percentage, payableNow, remainingBalance };
}

// Customer / Public: Place an Order with Advance / Full Payment Plan
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      items,
      couponCode,
      paymentMethod,
      paymentPlan,
      notes
    } = req.body;

    // Strict COD rejection: Cash on Delivery is strictly disallowed
    if (paymentMethod === 'COD' || paymentPlan === 'COD') {
      return res.status(400).json({
        success: false,
        message: 'Cash on Delivery (COD) is not accepted. Please choose a 25% Advance, 50% Advance, or 100% Full Payment plan.'
      });
    }

    if (!customerName || !customerPhone || !shippingAddress || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, mobile number, shipping address, and order items are required.'
      });
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address (Street/Village, City/Tehsil, State, PIN code) is required.'
      });
    }

    // Determine chosen plan
    const validPlans = ['ADVANCE_25', 'ADVANCE_50', 'FULL_100'];
    const chosenPlan = paymentPlan || (paymentMethod && validPlans.includes(paymentMethod) ? paymentMethod : 'ADVANCE_25');

    if (!validPlans.includes(chosenPlan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment plan. Must be one of: ADVANCE_25, ADVANCE_50, FULL_100.'
      });
    }

    // Backend validation: Re-verify every product's live price and stock
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = localStore.getProductByIdOrSlug(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.productTitle || item.productId}" is no longer available.`
        });
      }

      if (product.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: `Product "${product.title_en}" is currently inactive and cannot be ordered.`
        });
      }

      const requestedQty = Math.max(1, parseInt(item.quantity, 10) || 1);

      // Check stock
      if ((product.stockQuantity || 0) < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title_en}". Available stock: ${product.stockQuantity}.`
        });
      }

      const itemTotal = product.price * requestedQty;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        productSlug: product.slug,
        productTitle_en: product.title_en,
        productTitle_hi: product.title_hi,
        productImage: product.mainImage,
        price: product.price,
        quantity: requestedQty,
        total: itemTotal,
      });
    }

    // Calculate coupon discount if provided
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = localStore.getCouponByCode(couponCode);
      if (coupon) {
        if (subtotal >= (coupon.minOrderValue || 0)) {
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
          discount = Math.min(discount, subtotal);
          appliedCoupon = coupon.code;
        }
      }
    }

    // Shipping fee
    const settings = localStore.getSettings();
    const freeShippingThreshold = settings.freeShippingThreshold || 1000;
    const standardShippingFee = settings.standardShippingFee || 99;
    const shippingFee = (subtotal - discount) >= freeShippingThreshold ? 0 : standardShippingFee;

    const totalAmount = Number(Math.max(0, subtotal - discount + shippingFee).toFixed(2));
    const { percentage: advancePercentage, payableNow, remainingBalance } = calculatePlanAmounts(totalAmount, chosenPlan);

    // Create Order with pending payment
    const order = localStore.createOrder({
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      shippingAddress,
      items: validatedItems,
      subtotal,
      discount,
      appliedCoupon,
      shippingFee,
      totalAmount,
      paymentPlan: chosenPlan,
      advancePercentage,
      payableNow,
      amountPaid: 0,
      remainingBalance,
      paymentMethod: chosenPlan,
      paymentStatus: advancePercentage === 100 ? 'Payment Pending' : 'Advance Payment Pending',
      status: 'PENDING',
      notes: notes || '',
    });

    // Check if live Razorpay credentials are configured
    const isLiveGateway = Boolean(config.razorpayKeyId && config.razorpayKeySecret);
    let razorpayOrderId = null;

    if (isLiveGateway) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString('base64');
        const rzRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            amount: Math.round(payableNow * 100), // in paise
            currency: 'INR',
            receipt: order.orderNumber,
            notes: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              paymentPlan: chosenPlan,
              advancePercentage: String(advancePercentage),
              payableNow: String(payableNow),
              remainingBalance: String(remainingBalance)
            }
          })
        });

        if (rzRes.ok) {
          const rzData = await rzRes.json();
          razorpayOrderId = rzData.id;
          order.razorpayOrderId = razorpayOrderId;
          localStore.saveOrder(order);
        } else {
          const errText = await rzRes.text();
          console.warn('[OrderRoutes] Razorpay API response non-200:', errText);
        }
      } catch (err) {
        console.error('[OrderRoutes] Razorpay order call exception:', err.message);
      }
    }

    // Generate secure simulation token for sandbox verification when live keys are absent
    const simulationToken = crypto.createHmac('sha256', config.jwtSecret)
      .update(`${order.id}|${payableNow}|${order.orderNumber}`)
      .digest('hex');

    res.status(201).json({
      success: true,
      message: 'Payment order created. Please proceed to payment.',
      order,
      payableNow,
      remainingBalance,
      advancePercentage,
      isLiveGateway,
      razorpayOrderId,
      keyId: isLiveGateway ? config.razorpayKeyId : null,
      simulationToken: !isLiveGateway ? simulationToken : undefined,
    });
  } catch (err) {
    console.error('[OrderRoutes] Order creation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer / Gateway: Verify Online Payment
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      orderId,
      orderNumber,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      simulationToken
    } = req.body;

    const order = localStore.getOrderByIdOrNumber(orderId || orderNumber);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Idempotency: If order is already partially paid or fully paid, do not re-verify
    if (order.paymentStatus === 'Partially Paid' || order.paymentStatus === 'Fully Paid') {
      return res.json({
        success: true,
        message: 'Order payment is already verified.',
        order
      });
    }

    const isLiveGateway = Boolean(config.razorpayKeyId && config.razorpayKeySecret);

    if (isLiveGateway) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing Razorpay verification parameters (order_id, payment_id, signature).'
        });
      }

      // Backend HMAC verification
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpayKeySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        order.paymentStatus = 'Payment Failed';
        localStore.saveOrder(order);
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Invalid Razorpay cryptographic signature.'
        });
      }
    } else {
      // In simulator mode, verify secure HMAC simulation token
      const expectedToken = crypto.createHmac('sha256', config.jwtSecret)
        .update(`${order.id}|${order.payableNow}|${order.orderNumber}`)
        .digest('hex');

      if (simulationToken !== expectedToken && razorpay_payment_id !== 'SIMULATED_TEST_PAYMENT') {
        return res.status(400).json({
          success: false,
          message: 'Invalid simulation verification signature.'
        });
      }
    }

    // Payment Signature verified! Update financial fields on order
    const paidAmount = order.payableNow;
    const remainingBalance = Number((order.totalAmount - paidAmount).toFixed(2));

    order.amountPaid = paidAmount;
    order.remainingBalance = remainingBalance;
    order.advanceTransactionId = razorpay_payment_id || `PAY-SIM-${Date.now()}`;
    order.paymentStatus = remainingBalance <= 0 ? 'Fully Paid' : 'Partially Paid';
    order.status = 'CONFIRMED';
    order.paidAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    localStore.saveOrder(order);

    // Asynchronously dispatch email notification to business inbox (non-blocking)
    emailService.sendOrderNotification(order).catch((err) => {
      console.error('[OrderRoutes] Order notification dispatch failed:', err.message);
    });

    res.json({
      success: true,
      message: 'Payment verified and order confirmed successfully!',
      order
    });
  } catch (err) {
    console.error('[OrderRoutes] Payment verification error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer / Gateway: Handle Failed Payment
router.post('/payment-failed', (req, res) => {
  try {
    const { orderId, orderNumber, reason } = req.body;
    const order = localStore.getOrderByIdOrNumber(orderId || orderNumber);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentStatus = 'Payment Failed';
    order.paymentNotes = reason || 'Payment cancelled or declined by customer/gateway.';
    order.updatedAt = new Date().toISOString();
    localStore.saveOrder(order);

    res.json({ success: true, message: 'Payment failure recorded.', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Reconcile Remaining Delivery Balance
router.patch('/:id/reconcile-balance', requireAdmin, (req, res) => {
  try {
    const { amountCollected, transactionRef, notes } = req.body;
    const order = localStore.reconcileOrderBalance(req.params.id, {
      amountCollected,
      finalTransactionId: transactionRef,
      notes,
      reconciledBy: req.user?.email || 'Admin'
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({
      success: true,
      message: 'Remaining balance reconciled and order marked Fully Paid!',
      order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer / Public: Track Order by Order Number and Phone (GET or POST)
router.all('/track', (req, res) => {
  try {
    const orderNumber = req.query.orderNumber || req.body?.orderNumber;
    const phone = req.query.phone || req.body?.phone;

    if (!orderNumber) {
      return res.status(400).json({ success: false, message: 'Order number is required.' });
    }

    const order = localStore.getOrderByIdOrNumber(orderNumber);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found. Please verify your order number.' });
    }

    // If phone is provided, verify match for privacy
    if (phone && phone.trim() !== order.customerPhone.trim()) {
      return res.status(403).json({ success: false, message: 'Phone number does not match this order.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer: My Orders
router.get('/my-orders', authenticateToken, (req, res) => {
  try {
    const orders = localStore.getOrders().filter(o =>
      (req.user.phone && o.customerPhone === req.user.phone) ||
      (req.user.email && o.customerEmail === req.user.email) ||
      (o.customerId === req.user.id)
    );
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all orders with status/date filters
router.get('/', requireAdmin, (req, res) => {
  try {
    const { status, paymentStatus, paymentPlan, dateFrom, dateTo } = req.query;
    let orders = localStore.getOrders();

    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (paymentStatus) {
      orders = orders.filter(o => o.paymentStatus === paymentStatus);
    }
    if (paymentPlan) {
      orders = orders.filter(o => o.paymentPlan === paymentPlan);
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      orders = orders.filter(o => new Date(o.createdAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      orders = orders.filter(o => new Date(o.createdAt).getTime() <= to);
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update order status & payment status
router.patch('/:id/status', requireAdmin, (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = localStore.updateOrderStatus(req.params.id, status, paymentStatus);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, message: 'Order status updated successfully.', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
