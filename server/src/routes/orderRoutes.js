import express from 'express';
import crypto from 'crypto';
import { prisma } from '../database/connection.js';
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

    // Backend validation: Re-verify every product's live price and stock from database
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { id: item.productId },
            { slug: item.productId }
          ]
        }
      });

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
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase().trim() } });
      if (coupon && coupon.isActive) {
        if (!coupon.expiresAt || new Date(coupon.expiresAt) >= new Date()) {
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
    }

    // Shipping fee from settings
    let freeShippingThreshold = 1000;
    let standardShippingFee = 99;
    try {
      const settingRec = await prisma.setting.findUnique({ where: { key: 'store_settings' } });
      if (settingRec && settingRec.value) {
        const s = JSON.parse(settingRec.value);
        if (s.freeShippingThreshold !== undefined) freeShippingThreshold = s.freeShippingThreshold;
        if (s.standardShippingFee !== undefined) standardShippingFee = s.standardShippingFee;
      }
    } catch (e) {}

    const shippingFee = (subtotal - discount) >= freeShippingThreshold ? 0 : standardShippingFee;
    const totalAmount = Number(Math.max(0, subtotal - discount + shippingFee).toFixed(2));
    const { percentage: advancePercentage, payableNow, remainingBalance } = calculatePlanAmounts(totalAmount, chosenPlan);

    const generatedOrderNumber = `MEH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Order with pending payment in Neon PostgreSQL
    const order = await prisma.order.create({
      data: {
        orderNumber: generatedOrderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        shippingAddress,
        subtotal,
        discount,
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
        items: {
          create: validatedItems.map(item => ({
            productId: item.productId,
            productTitle_en: item.productTitle_en,
            productTitle_hi: item.productTitle_hi,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
            total: item.total
          }))
        }
      },
      include: {
        items: true
      }
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
          await prisma.order.update({
            where: { id: order.id },
            data: { razorpayOrderId }
          });
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
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
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

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId || '' },
          { orderNumber: orderNumber || orderId || '' }
        ]
      },
      include: { items: true }
    });

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
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'Payment Failed' }
        });
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

    // Payment Signature verified! Update financial fields on order in Neon PostgreSQL
    const paidAmount = order.payableNow;
    const remainingBalance = Number((order.totalAmount - paidAmount).toFixed(2));
    const txId = razorpay_payment_id || `PAY-SIM-${Date.now()}`;

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        amountPaid: paidAmount,
        remainingBalance,
        advanceTransactionId: txId,
        paymentStatus: remainingBalance <= 0 ? 'Fully Paid' : 'Partially Paid',
        status: 'CONFIRMED',
        paidAt: new Date(),
      },
      include: { items: true }
    });

    // Deduct stock for ordered items
    for (const item of updatedOrder.items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity }
          }
        }).catch(e => console.warn('Could not decrement stock for product:', item.productId, e.message));
      }
    }

    // Dispatch email notification to business inbox (non-blocking)
    emailService.sendOrderNotification(updatedOrder).catch((err) => {
      console.error('[OrderRoutes] Order notification dispatch failed:', err.message);
    });

    res.json({
      success: true,
      message: 'Payment verified and order confirmed successfully!',
      order: updatedOrder
    });
  } catch (err) {
    console.error('[OrderRoutes] Payment verification error:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Customer / Gateway: Handle Failed Payment
router.post('/payment-failed', async (req, res) => {
  try {
    const { orderId, orderNumber, reason } = req.body;
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId || '' },
          { orderNumber: orderNumber || orderId || '' }
        ]
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'Payment Failed',
        notes: reason || 'Payment cancelled or declined by customer/gateway.'
      },
      include: { items: true }
    });

    res.json({ success: true, message: 'Payment failure recorded.', order: updated });
  } catch (err) {
    console.error('[OrderRoutes] Payment failed update error:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin: Reconcile Remaining Delivery Balance
router.patch('/:id/reconcile-balance', requireAdmin, async (req, res) => {
  try {
    const { amountCollected, transactionRef, notes } = req.body;
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const collected = Number(amountCollected) || order.remainingBalance || 0;
    const newPaid = Number(((order.amountPaid || 0) + collected).toFixed(2));
    const newRemaining = Math.max(0, Number(((order.remainingBalance || 0) - collected).toFixed(2)));

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        amountPaid: newPaid,
        remainingBalance: newRemaining,
        finalTransactionId: transactionRef || `BAL-RECON-${Date.now()}`,
        balanceReconciledAt: new Date(),
        balanceReconciledBy: req.user?.email || 'Admin',
        balanceNotes: notes || order.balanceNotes || null,
        paymentStatus: newRemaining <= 0 ? 'Fully Paid' : 'Partially Paid',
        status: newRemaining <= 0 ? 'DELIVERED' : order.status
      },
      include: { items: true }
    });

    res.json({
      success: true,
      message: 'Remaining balance reconciled and order updated in database!',
      order: updatedOrder
    });
  } catch (err) {
    console.error('[OrderRoutes] Reconcile balance error:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Customer / Public: Track Order by Order Number and Phone (GET or POST)
router.all('/track', async (req, res) => {
  try {
    const orderNumber = req.query.orderNumber || req.body?.orderNumber;
    const phone = req.query.phone || req.body?.phone;

    if (!orderNumber) {
      return res.status(400).json({ success: false, message: 'Order number is required.' });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: orderNumber.trim() },
          { id: orderNumber.trim() }
        ]
      },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found. Please verify your order number.' });
    }

    if (phone && phone.trim() !== order.customerPhone.trim()) {
      return res.status(403).json({ success: false, message: 'Phone number does not match this order.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error('[OrderRoutes] Track order error:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Customer: My Orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const where = {
      OR: [
        { customerPhone: req.user.phone || '' },
        { customerEmail: req.user.email || '' },
        { customerId: req.user.id || '' }
      ]
    };

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error('[OrderRoutes] Customer orders error:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin: Get all orders with status/date filters
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, paymentStatus, paymentPlan, dateFrom, dateTo } = req.query;
    const where = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (paymentPlan) where.paymentPlan = paymentPlan;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error('[OrderRoutes] Admin orders error:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin: Update order status & payment status
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const data = {};
    if (status) data.status = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: { items: true }
    });

    res.json({ success: true, message: 'Order status updated successfully in database.', order });
  } catch (err) {
    console.error('[OrderRoutes] Update order status error:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

export default router;
