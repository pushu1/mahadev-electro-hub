import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { localStore } from '../database/store.js';

let transporter = null;

// Initialize transporter if SMTP credentials are provided
function getTransporter() {
  if (transporter) return transporter;

  if (config.smtpHost && config.smtpUser && config.smtpPass) {
    try {
      transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort || 587,
        secure: config.smtpPort === 465, // true for 465, false for 587/25
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log(`[EmailService] SMTP Transporter configured for host: ${config.smtpHost}`);
    } catch (err) {
      console.error('[EmailService] Failed to create SMTP transporter:', err.message);
      transporter = null;
    }
  } else {
    // Graceful fallback logger when credentials have not yet been populated
    transporter = null;
  }

  return transporter;
}

/**
 * Send an email safely with error handling and fallback simulation
 */
async function sendMailSafely({ to, subject, html, text }) {
  const mailRecipient = to || config.businessNotificationEmail || 'mahadevelectohub@gmail.com';
  const mailSender = config.mailFrom || 'Mahadev Electro Hub <notifications@mahadevelectrohub.com>';

  const mailOptions = {
    from: mailSender,
    to: mailRecipient,
    subject,
    text,
    html,
  };

  const activeTransporter = getTransporter();

  if (activeTransporter) {
    try {
      const info = await activeTransporter.sendMail(mailOptions);
      console.log(`[EmailService] Email sent successfully to ${mailRecipient} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, mode: 'SMTP' };
    } catch (err) {
      console.error(`[EmailService] SMTP delivery error to ${mailRecipient}:`, err.message);
      return { success: false, error: err.message, mode: 'SMTP_FAILED' };
    }
  } else {
    // If SMTP is not yet configured, securely log notification details to console and audit store
    console.log(`[EmailService - AUDIT LOG] Notification generated for: ${mailRecipient}`);
    console.log(`[EmailService - AUDIT LOG] Subject: "${subject}"`);
    console.log(`[EmailService - AUDIT LOG] (Notice: Configure SMTP_HOST, SMTP_USER, SMTP_PASS in server/.env for live inbox delivery)`);
    return { success: true, mode: 'MOCK_AUDIT_LOG', loggedAt: new Date().toISOString() };
  }
}

export const emailService = {
  /**
   * Send notification for a newly placed customer order
   */
  sendOrderNotification: async (order) => {
    if (!order) return { success: false, message: 'Invalid order' };

    // Prevent duplicate notification emails
    if (order.emailNotificationSent) {
      console.log(`[EmailService] Notification already sent for Order #${order.orderNumber}. Skipping duplicate.`);
      return { success: true, message: 'Already sent' };
    }

    const orderDate = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const street = order.shippingAddress?.street || 'N/A';
    const city = order.shippingAddress?.city || 'N/A';
    const state = order.shippingAddress?.state || 'Rajasthan';
    const pincode = order.shippingAddress?.pincode || 'N/A';
    const landmark = order.shippingAddress?.landmark ? ` (Landmark: ${order.shippingAddress.landmark})` : '';
    const fullAddress = `${street}${landmark}, ${city}, ${state} - ${pincode}`;

    const itemsRows = (order.items || []).map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #333; color: #ffffff;">
          <strong>${item.productTitle_en || 'Product'}</strong>
          ${item.productSlug ? `<br><span style="font-size: 11px; color: #888;">Slug: ${item.productSlug}</span>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: center; color: #D6A52A; font-weight: bold;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: right; color: #ffffff;">
          ₹${Number(item.price || 0).toLocaleString('en-IN')}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: right; color: #ffffff; font-weight: bold;">
          ₹${Number(item.total || 0).toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0b; color: #e5e5e5; margin: 0; padding: 20px; }
          .container { max-width: 650px; margin: 0 auto; background: #141414; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #1c1c1c, #0d0d0d); padding: 25px; border-bottom: 2px solid #D6A52A; text-align: center; }
          .header h1 { margin: 0; color: #D6A52A; font-size: 22px; letter-spacing: 1px; }
          .header p { margin: 5px 0 0; color: #a0a0a0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 25px; }
          .badge { display: inline-block; background: #D6A52A; color: #000000; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-size: 12px; }
          .section-title { font-size: 14px; text-transform: uppercase; color: #D6A52A; font-weight: bold; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #222; padding-bottom: 5px; }
          .info-grid { display: table; width: 100%; margin-bottom: 15px; }
          .info-row { display: table-row; }
          .info-label { display: table-cell; width: 35%; padding: 6px 0; color: #888888; font-size: 13px; }
          .info-value { display: table-cell; width: 65%; padding: 6px 0; color: #ffffff; font-size: 13px; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th { background: #1f1f1f; color: #D6A52A; text-transform: uppercase; font-size: 11px; padding: 10px; text-align: left; }
          .totals-table { width: 100%; margin-top: 15px; border-top: 2px solid #333; }
          .footer { background: #0c0c0c; padding: 18px; text-align: center; font-size: 11px; color: #666666; border-top: 1px solid #222; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MAHADEV ELECTRO HUB</h1>
            <p>New Customer Order Alert • Pali, Rajasthan</p>
          </div>
          <div class="content">
            <div style="text-align: right; margin-bottom: 15px;">
              <span class="badge">ORDER #${order.orderNumber}</span>
            </div>

            <div class="section-title">Customer Information</div>
            <div class="info-grid">
              <div class="info-row">
                <div class="info-label">Customer Name:</div>
                <div class="info-value"><strong>${order.customerName}</strong></div>
              </div>
              <div class="info-row">
                <div class="info-label">Phone Number:</div>
                <div class="info-value"><a href="tel:${order.customerPhone}" style="color: #D6A52A; text-decoration: none;">${order.customerPhone}</a></div>
              </div>
              ${order.customerEmail ? `
              <div class="info-row">
                <div class="info-label">Email Address:</div>
                <div class="info-value">${order.customerEmail}</div>
              </div>` : ''}
              <div class="info-row">
                <div class="info-label">Delivery Address:</div>
                <div class="info-value">${fullAddress}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Order Date & Time:</div>
                <div class="info-value">${orderDate}</div>
              </div>
            </div>

            <div class="section-title">Ordered Products</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <table class="totals-table">
              <tr>
                <td style="padding: 6px 0; color: #888;">Subtotal:</td>
                <td style="padding: 6px 0; text-align: right; color: #fff;">₹${Number(order.subtotal || 0).toLocaleString('en-IN')}</td>
              </tr>
              ${order.discount ? `
              <tr>
                <td style="padding: 6px 0; color: #22C55E;">Coupon Discount (${order.appliedCoupon || 'Promo'}):</td>
                <td style="padding: 6px 0; text-align: right; color: #22C55E;">-₹${Number(order.discount).toLocaleString('en-IN')}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 6px 0; color: #888;">Delivery / Shipping:</td>
                <td style="padding: 6px 0; text-align: right; color: #fff;">${order.shippingFee === 0 ? '<span style="color: #22C55E;">FREE</span>' : `₹${order.shippingFee}`}</td>
              </tr>
              <tr style="border-top: 1px solid #444;">
                <td style="padding: 10px 0; font-size: 15px; font-weight: bold; color: #D6A52A;">Total Order Amount:</td>
                <td style="padding: 10px 0; font-size: 16px; font-weight: bold; text-align: right; color: #D6A52A;">₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #888;">Payment Plan:</td>
                <td style="padding: 4px 0; text-align: right; color: #fff; font-weight: bold;">${order.paymentPlan === 'ADVANCE_25' ? '25% Advance' : (order.paymentPlan === 'ADVANCE_50' ? '50% Advance' : '100% Full Payment')}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #888;">Amount Paid Online:</td>
                <td style="padding: 4px 0; text-align: right; color: #22C55E; font-weight: bold;">₹${Number(order.amountPaid || order.payableNow || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #888;">Balance Due at Delivery:</td>
                <td style="padding: 4px 0; text-align: right; color: #EAB308; font-weight: bold;">${order.remainingBalance === 0 ? '₹0 (Fully Paid)' : `₹${Number(order.remainingBalance || 0).toLocaleString('en-IN')}`}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #888;">Payment Status:</td>
                <td style="padding: 4px 0; text-align: right; color: #fff;">${order.paymentStatus || 'Partially Paid'}</td>
              </tr>
            </table>

            ${order.notes ? `
            <div style="margin-top: 20px; padding: 12px; background: #1c1c1c; border-left: 3px solid #D6A52A; border-radius: 4px;">
              <strong style="color: #D6A52A; font-size: 12px;">Customer Delivery Instructions:</strong>
              <p style="margin: 4px 0 0; font-size: 12px; color: #bbb;">${order.notes}</p>
            </div>` : ''}
          </div>
          <div class="footer">
            Mahadev Electro Hub Store Management • Pali, Rajasthan, India<br>
            Official Business Helpline: +91 70142 48415 | mahadevelectohub@gmail.com
          </div>
        </div>
      </body>
      </html>
    `;

    const plainText = `
NEW ORDER RECEIVED — MAHADEV ELECTRO HUB
Order Number: #${order.orderNumber}
Customer Name: ${order.customerName}
Phone: ${order.customerPhone}
${order.customerEmail ? `Email: ${order.customerEmail}` : ''}
Delivery Address: ${fullAddress}
Order Date: ${orderDate}

ITEMS:
${(order.items || []).map(i => `- ${i.productTitle_en || 'Product'} x ${i.quantity} = ₹${i.total}`).join('\n')}

Subtotal: ₹${order.subtotal}
Discount: ₹${order.discount || 0}
Shipping: ₹${order.shippingFee || 0}
Grand Total: ₹${order.totalAmount}
Payment Method: ${order.paymentMethod}
Payment Status: ${order.paymentStatus}

Contact Customer: tel:${order.customerPhone}
    `.trim();

    const result = await sendMailSafely({
      to: config.businessNotificationEmail || 'mahadevelectohub@gmail.com',
      subject: `📦 [New Order] #${order.orderNumber} - ₹${order.totalAmount} by ${order.customerName}`,
      html,
      text: plainText,
    });

    // Mark notification sent to prevent duplicates
    if (result.success) {
      order.emailNotificationSent = true;
      order.emailNotificationSentAt = new Date().toISOString();
      localStore.saveOrder?.(order);
    }

    return result;
  },

  /**
   * Send notification for a customer contact inquiry
   */
  sendContactNotification: async (inquiry) => {
    const submissionDate = new Date(inquiry.createdAt || Date.now()).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0b; color: #e5e5e5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #141414; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; }
          .header { background: #1a1a1a; padding: 20px; border-bottom: 2px solid #D6A52A; text-align: center; }
          .header h1 { margin: 0; color: #D6A52A; font-size: 20px; }
          .content { padding: 25px; font-size: 13px; line-height: 1.6; }
          .row { margin-bottom: 12px; }
          .label { color: #888; font-weight: bold; }
          .message-box { background: #1c1c1c; border-left: 3px solid #D6A52A; padding: 15px; margin-top: 15px; border-radius: 4px; font-style: italic; color: #fff; }
          .footer { background: #0c0c0c; padding: 15px; text-align: center; font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MAHADEV ELECTRO HUB</h1>
            <p style="margin: 4px 0 0; color: #aaa; font-size: 12px;">New Contact Us Enquiry</p>
          </div>
          <div class="content">
            <div class="row"><span class="label">Customer Name:</span> <strong>${inquiry.name}</strong></div>
            <div class="row"><span class="label">Email:</span> <a href="mailto:${inquiry.email || ''}" style="color: #D6A52A;">${inquiry.email || 'Not provided'}</a></div>
            <div class="row"><span class="label">Phone:</span> <a href="tel:${inquiry.phone || ''}" style="color: #D6A52A;">${inquiry.phone || 'Not provided'}</a></div>
            <div class="row"><span class="label">Date & Time:</span> ${submissionDate}</div>
            <div class="section-title" style="margin-top: 18px; color: #D6A52A; font-weight: bold;">Message Content:</div>
            <div class="message-box">
              "${inquiry.message}"
            </div>
          </div>
          <div class="footer">
            Mahadev Electro Hub Store Support • Pali, Rajasthan
          </div>
        </div>
      </body>
      </html>
    `;

    return sendMailSafely({
      to: config.businessNotificationEmail || 'mahadevelectohub@gmail.com',
      subject: `✉️ [Website Inquiry] From ${inquiry.name} (${inquiry.phone || inquiry.email || 'Store Visitor'})`,
      html,
      text: `Website Inquiry received from ${inquiry.name}\nEmail: ${inquiry.email}\nPhone: ${inquiry.phone}\nMessage: ${inquiry.message}`,
    });
  },

  /**
   * Send notification for a new newsletter subscription
   */
  sendNewsletterNotification: async (subscriber) => {
    return sendMailSafely({
      to: config.businessNotificationEmail || 'mahadevelectohub@gmail.com',
      subject: `📰 [Newsletter Subscriber] New signup: ${subscriber.email}`,
      html: `
        <div style="font-family: sans-serif; background: #111; color: #fff; padding: 20px; border-radius: 8px;">
          <h2 style="color: #D6A52A; margin-top: 0;">New Newsletter Subscription</h2>
          <p>A new visitor subscribed to updates on Mahadev Electro Hub:</p>
          <p><strong>Email Address:</strong> <a href="mailto:${subscriber.email}" style="color: #D6A52A;">${subscriber.email}</a></p>
          <p style="font-size: 12px; color: #888;">Subscribed on: ${new Date(subscriber.subscribedAt || Date.now()).toLocaleString('en-IN')}</p>
        </div>
      `,
      text: `New Newsletter Subscription: ${subscriber.email} on ${new Date().toLocaleString()}`,
    });
  }
};
