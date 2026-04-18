const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN, AUDIT_SUCCESS, AUDIT_ERROR, AUDIT_DENIED } = require('../config/constants');
const { dbGetAsync, dbRunAsync } = require('../utils/db');
const { logAuditEvent } = require('../utils/logger');
const { ensureQuotaRow } = require('../utils/quota');
const { getScopeForUser } = require('../utils/workspaceUtils');
const { 
  BILLING_PLANS, 
  getBillingPlan, 
  rupeesToPaise, 
  getRazorpayCredentials, 
  createRazorpayOrder, 
  verifyRazorpaySignature,
  rupeesToPaise 
} = require('../utils/billingUtils');
const { createSmtpTransporterFromEnv } = require('../utils/smtp');

// Check if we should allow simulated upgrades (no real payment)
const ALLOW_SIMULATED = process.env.ALLOW_SIMULATED_PAYMENTS === 'true' || process.env.NODE_ENV === 'development';

/**
 * GET /api/billing/plans
 * Public plan catalog
 */
exports.getPlans = (req, res) => {
  res.json({ plans: BILLING_PLANS });
};

/**
 * POST /api/billing/create-order
 * Create a Razorpay order or return simulated order
 */
exports.createOrder = async (req, res) => {
  try {
    const planId = String(req.body?.plan || '').trim().toLowerCase();
    const plan = getBillingPlan(planId);
    if (!plan || plan.id === 'personal') {
      return res.status(400).json({ error: 'Invalid plan. Allowed: pro, enterprise.' });
    }

    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const amountPaise = rupeesToPaise(plan.price);
    const currency = plan.currency || 'INR';

    const receipt = `rcpt_${scopeWorkspaceId}_${Date.now()}`;
    const notes = { user_id: req.user.id, workspace_id: scopeWorkspaceId, plan_id: plan.id };

    const creds = getRazorpayCredentials();
    let orderId = `sim_${Date.now()}`;
    let finalAmount = amountPaise;
    let finalCurrency = currency;
    let keyId = 'simulated_key';
    let simulated = 1;

    if (creds) {
      const order = await createRazorpayOrder({ amountPaise, currency, receipt, notes });
      orderId = order.id;
      finalAmount = Number(order.amount || amountPaise);
      finalCurrency = String(order.currency || currency);
      keyId = creds.keyId;
      simulated = 0;
    } else if (!ALLOW_SIMULATED) {
      return res.status(503).json({ 
        error: 'RAZORPAY_NOT_CONFIGURED', 
        message: 'The payment gateway is not configured on the server. Please add RAZORPAY_KEY_ID to Vercel.' 
      });
    }

    await dbRunAsync(
      `INSERT INTO billing_orders
        (user_id, workspace_id, plan_id, amount_paise, currency, razorpay_order_id, status, simulated)
       VALUES (?, ?, ?, ?, ?, ?, 'created', ?)`,
      [req.user.id, scopeWorkspaceId, plan.id, finalAmount, finalCurrency, orderId, simulated]
    );

    logAuditEvent(req, {
      action: 'BILLING_ORDER_CREATE',
      resource: '/api/billing/create-order',
      status: AUDIT_SUCCESS,
      details: { plan_id: plan.id, amount: finalAmount, currency: finalCurrency, simulated }
    });

    res.json({
      simulated,
      key_id: keyId,
      order_id: orderId,
      amount: finalAmount,
      currency: finalCurrency,
      plan_name: plan.name
    });
  } catch (error) {
    logAuditEvent(req, {
      action: 'BILLING_ORDER_CREATE',
      resource: '/api/billing/create-order',
      status: AUDIT_ERROR,
      details: { error: error.message }
    });
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/billing/verify-payment
 * Verify signature and upgrade tier
 */
exports.verifyPayment = async (req, res) => {
  try {
    const planId = String(req.body?.plan || '').trim().toLowerCase();
    const plan = getBillingPlan(planId);
    if (!plan || plan.id === 'personal') {
      return res.status(400).json({ error: 'Invalid plan. Allowed: pro, enterprise.' });
    }

    const orderId = String(req.body?.order_id || '').trim();
    const paymentId = String(req.body?.payment_id || '').trim();
    const signature = String(req.body?.signature || '').trim();
    const simulated = Boolean(req.body?.simulated);

    if (!orderId) return res.status(400).json({ error: 'order_id is required' });
    if (!simulated && (!paymentId || !signature)) {
      return res.status(400).json({ error: 'payment_id and signature are required' });
    }

    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const existingOrder = await dbGetAsync(
      `SELECT id, status, simulated, amount_paise, currency
       FROM billing_orders
       WHERE user_id = ? AND razorpay_order_id = ?
       ORDER BY id DESC LIMIT 1`,
      [req.user.id, orderId]
    );

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found for this user' });
    }

    const isSimulatedOrder = Boolean(existingOrder.simulated);

    if (!simulated && !isSimulatedOrder) {
      const creds = getRazorpayCredentials();
      if (!creds) return res.status(500).json({ error: 'Razorpay is not configured on the server.' });
      const valid = verifyRazorpaySignature({ orderId, paymentId, signature, keySecret: creds.keySecret });
      if (!valid) {
        await dbRunAsync(
          `UPDATE billing_orders
           SET status = 'failed', razorpay_payment_id = ?, razorpay_signature = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [paymentId || null, signature || null, existingOrder.id]
        );
        logAuditEvent(req, {
          action: 'BILLING_PAYMENT_VERIFY',
          resource: '/api/billing/verify-payment',
          status: AUDIT_DENIED,
          details: { reason: 'invalid_signature', order_id: orderId }
        });
        return res.status(400).json({ error: 'Invalid Razorpay signature' });
      }
    }

    // Mark order paid
    await dbRunAsync(
      `UPDATE billing_orders
       SET status = 'paid', razorpay_payment_id = ?, razorpay_signature = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [paymentId || null, signature || null, existingOrder.id]
    );

    // Upgrade tier in DB and refresh quota row
    await dbRunAsync('UPDATE users SET tier = ? WHERE id = ?', [plan.id, req.user.id]);
    await ensureQuotaRow(req.user.id, plan.id);

    // Create a billing invoice row
    const invoiceNumber = `INV-${Math.abs(scopeWorkspaceId)}-${Date.now()}`;
    await dbRunAsync(
      `INSERT INTO billing_invoices (workspace_id, invoice_number, amount_cents, currency, status, issued_at)
       VALUES (?, ?, ?, ?, 'paid', CURRENT_TIMESTAMP)`,
      [
        scopeWorkspaceId,
        invoiceNumber,
        Number(existingOrder.amount_paise || rupeesToPaise(plan.price)),
        String(existingOrder.currency || plan.currency || 'INR')
      ]
    );

    // Fetch fresh user and issue a new token
    const freshUser = await dbGetAsync('SELECT id, name, email, role, tier, workspace_id FROM users WHERE id = ?', [req.user.id]);
    const newToken = jwt.sign(
      { id: freshUser.id, email: freshUser.email, name: freshUser.name, role: freshUser.role, tier: freshUser.tier || 'personal' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logAuditEvent(req, {
      action: 'ACCOUNT_TIER_UPDATE',
      resource: '/api/billing/verify-payment',
      status: AUDIT_SUCCESS,
      details: { plan_id: plan.id, order_id: orderId, simulated }
    });

    // Send Invoice Email Asynchronously
    try {
      const smtp = createSmtpTransporterFromEnv();
      if (smtp) {
        const formattedAmount = (Number(existingOrder.amount_paise || rupeesToPaise(plan.price)) / 100).toLocaleString();
        const currencyStr = String(existingOrder.currency || plan.currency || 'INR');
        
        smtp.transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME || 'IntelliScan Billing'}" <${smtp.from}>`,
          to: freshUser.email,
          subject: `Payment Receipt & Invoice: ${invoiceNumber}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <div style="background: #4f46e5; padding: 20px; color: white;">
                <h2 style="margin: 0;">Payment Successful</h2>
              </div>
              <div style="padding: 24px;">
                <p>Hello ${freshUser.name},</p>
                <p>Thank you for your purchase! Your account has been successfully upgraded to the <strong>${plan.name}</strong> tier.</p>
                <br />
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Invoice Number:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Payment Reference:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${paymentId || orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${currencyStr} ${formattedAmount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Date:</strong></td>
                    <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString()}</td>
                  </tr>
                </table>
                <br />
                <p>You can view and manage your subscription anytime from your workspace billing dashboard.</p>
                <p style="margin-top: 24px; color: #64748b;">Best regards,<br>IntelliScan Team</p>
              </div>
            </div>
          `
        }).catch(err => console.error('Failed to send invoice email:', err.message));
      }
    } catch (emailErr) {
      console.warn('Silent email failure:', emailErr.message);
    }

    res.json({
      success: true,
      message: `Account upgraded to ${plan.name}!`,
      token: newToken,
      user: freshUser,
      invoice_number: invoiceNumber
    });
  } catch (error) {
    logAuditEvent(req, {
      action: 'BILLING_PAYMENT_VERIFY',
      resource: '/api/billing/verify-payment',
      status: AUDIT_ERROR,
      details: { error: error.message }
    });
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/billing/auto-pay
 * Toggle auto-pay for the user's active subscription
 */
exports.toggleAutoPay = async (req, res) => {
  try {
    const enabled = req.body.enabled === true || req.body.enabled === 'true';
    const userId = req.user.id;

    // Find the user's latest paid order
    const order = await dbGetAsync(
      `SELECT id FROM billing_orders WHERE user_id = ? AND status = 'paid' ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (!order) {
      return res.status(404).json({ error: 'No active subscription found. Upgrade first.' });
    }

    await dbRunAsync('UPDATE billing_orders SET auto_pay = ? WHERE id = ?', [enabled ? 1 : 0, order.id]);

    logAuditEvent(req, {
      action: 'BILLING_AUTOPAY_TOGGLE',
      resource: '/api/billing/auto-pay',
      status: AUDIT_SUCCESS,
      details: { enabled, order_id: order.id }
    });

    res.json({ success: true, auto_pay: enabled, message: enabled ? 'Auto-pay enabled. Your plan will renew automatically.' : 'Auto-pay disabled.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
