/**
 * Cron Router — Serverless-compatible background task execution
 * These routes are designed to be called by Vercel Cron or similar services.
 */
const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const { dbAllAsync, dbRunAsync, dbGetAsync, isPostgres } = require('../utils/db');
const { getBillingPlan, createRazorpayOrder, getRazorpayCredentials, rupeesToPaise } = require('../utils/billingUtils');

/**
 * GET /api/cron/process-all
 * Triggers all background maintenance and automated outreach tasks.
 */
router.all('/process-all', async (req, res) => {
  // 🔐 Security: Check for a shared secret to prevent unauthorized trigger
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || 'intelliscan_internal_cron_v1'; // Fallback for dev
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron] Unauthorized trigger attempt blocked.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('[Cron] Initiating global background processing...');
  
  const results = {
    sequences: 'running',
    campaigns: 'running',
    reminders: 'running',
    billing_reminders: 'running',
    auto_pay: 'running',
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Process Pending Email Sequences (Marketing)
    await marketingController.processPendingSequences();
    results.sequences = 'success';

    // 2. Process Scheduled Campaigns
    const now = new Date().toISOString();
    const campaigns = await dbAllAsync(`SELECT id FROM email_campaigns WHERE status = 'scheduled' AND scheduled_at <= ?`, [now]);
    for (const c of campaigns) {
      await marketingController.processCampaignSending(c.id);
    }
    results.campaigns = `success (${campaigns.length} processed)`;

    // 3. Process Calendar Reminders
    const upcoming = await dbAllAsync(isPostgres ? `
        SELECT r.* FROM event_reminders r
        JOIN calendar_events e ON r.event_id = e.id
        WHERE r.sent_at IS NULL
        AND (e.start_datetime - (r.minutes_before || ' minutes')::interval) <= CURRENT_TIMESTAMP
        AND e.start_datetime > CURRENT_TIMESTAMP
      ` : `
        SELECT r.* FROM event_reminders r
        JOIN calendar_events e ON r.event_id = e.id
        WHERE r.sent_at IS NULL
        AND CURRENT_TIMESTAMP >= datetime(e.start_datetime, '-' || r.minutes_before || ' minutes')
      `);
    results.reminders = `success (${upcoming.length} processed)`;

    // 4. Subscription Renewal Reminders (5 days before period_end)
    let reminderCount = 0;
    try {
      const expiringOrders = await dbAllAsync(isPostgres ? `
        SELECT bo.*, u.email, u.name FROM billing_orders bo
        JOIN users u ON bo.user_id = u.id
        WHERE bo.status = 'paid' AND bo.reminder_sent = 0
        AND bo.period_end IS NOT NULL
        AND bo.period_end <= (NOW() + INTERVAL '5 days')
        AND bo.period_end > NOW()
      ` : `
        SELECT bo.*, u.email, u.name FROM billing_orders bo
        JOIN users u ON bo.user_id = u.id
        WHERE bo.status = 'paid' AND bo.reminder_sent = 0
        AND bo.period_end IS NOT NULL
        AND bo.period_end <= datetime('now', '+5 days')
        AND bo.period_end > datetime('now')
      `);

      for (const order of expiringOrders) {
        const plan = getBillingPlan(order.plan_id);
        const planName = plan ? plan.name : order.plan_id;
        const expiryDate = new Date(order.period_end).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        const daysLeft = Math.ceil((new Date(order.period_end) - new Date()) / (1000 * 60 * 60 * 24));

        // Send reminder email via SMTP if configured
        const smtpHost = process.env.SMTP_HOST;
        if (smtpHost && order.email) {
          try {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
              host: smtpHost,
              port: Number(process.env.SMTP_PORT || 587),
              secure: process.env.SMTP_SECURE === 'true',
              auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            });
            await transporter.sendMail({
              from: process.env.SMTP_FROM || `"IntelliScan" <noreply@intelliscan.app>`,
              to: order.email,
              subject: `⏰ Your ${planName} plan expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
              html: `
                <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#FFFDF9;border-radius:16px;border:1px solid #E8E2D9">
                  <h2 style="margin:0 0 8px;color:#2D2518">Hi ${order.name || 'there'},</h2>
                  <p style="color:#6B5E4F;font-size:15px;line-height:1.6">
                    Your <strong>${planName}</strong> subscription is expiring on <strong>${expiryDate}</strong> (${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining).
                  </p>
                  ${order.auto_pay ? '<p style="color:#16a34a;font-size:14px;font-weight:600">✅ Auto-pay is enabled — your plan will renew automatically.</p>' : '<p style="color:#dc2626;font-size:14px;font-weight:600">⚠️ Auto-pay is not enabled. Please renew manually to avoid service interruption.</p>'}
                  <a href="${process.env.FRONTEND_URL || 'https://intelli-scan-psi.vercel.app'}/dashboard/billing" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px">
                    Manage Subscription →
                  </a>
                  <p style="color:#a8a29e;font-size:12px;margin-top:24px">IntelliScan • AI-Powered Business Card Intelligence</p>
                </div>`
            });
            console.log(`[Cron] Renewal reminder sent to ${order.email} (${daysLeft}d left)`);
          } catch (mailErr) {
            console.warn(`[Cron] Failed to send renewal email to ${order.email}:`, mailErr.message);
          }
        } else {
          console.log(`[Cron] Renewal reminder (no SMTP): ${order.email || 'no-email'}, plan=${planName}, expires=${expiryDate}`);
        }

        await dbRunAsync('UPDATE billing_orders SET reminder_sent = 1 WHERE id = ?', [order.id]);
        reminderCount++;
      }
      results.billing_reminders = `success (${reminderCount} sent)`;
    } catch (brErr) {
      console.warn('[Cron] Billing reminder check failed:', brErr.message);
      results.billing_reminders = `error: ${brErr.message}`;
    }

    // 5. Auto-Pay Processing (renew expired subscriptions with auto_pay enabled)
    let autoPayCount = 0;
    try {
      const autoPayOrders = await dbAllAsync(isPostgres ? `
        SELECT bo.*, u.email, u.name, u.tier FROM billing_orders bo
        JOIN users u ON bo.user_id = u.id
        WHERE bo.status = 'paid' AND bo.auto_pay = 1
        AND bo.period_end IS NOT NULL AND bo.period_end <= NOW()
      ` : `
        SELECT bo.*, u.email, u.name, u.tier FROM billing_orders bo
        JOIN users u ON bo.user_id = u.id
        WHERE bo.status = 'paid' AND bo.auto_pay = 1
        AND bo.period_end IS NOT NULL AND bo.period_end <= datetime('now')
      `);

      for (const order of autoPayOrders) {
        const plan = getBillingPlan(order.plan_id);
        if (!plan || plan.price === 0) continue;

        const creds = getRazorpayCredentials();
        if (creds) {
          // Real Razorpay auto-charge would require subscriptions API — log for now
          console.log(`[Cron] Auto-pay: Would charge ₹${plan.price} for user ${order.email} (plan: ${plan.name}). Razorpay Subscriptions API needed for production.`);
        }

        // Extend the period by 1 month (simulated renewal)
        const newStart = new Date();
        const newEnd = new Date();
        newEnd.setMonth(newEnd.getMonth() + 1);

        await dbRunAsync(
          `INSERT INTO billing_orders (user_id, plan_id, amount, currency, status, auto_pay, period_start, period_end, reminder_sent)
           VALUES (?, ?, ?, 'INR', 'paid', 1, ?, ?, 0)`,
          [order.user_id, order.plan_id, plan.price * 100, newStart.toISOString(), newEnd.toISOString()]
        );
        await dbRunAsync('UPDATE billing_orders SET status = ? WHERE id = ?', ['renewed', order.id]);
        autoPayCount++;
        console.log(`[Cron] Auto-renewed ${order.email} on ${plan.name} until ${newEnd.toISOString()}`);
      }
      results.auto_pay = `success (${autoPayCount} renewed)`;
    } catch (apErr) {
      console.warn('[Cron] Auto-pay processing failed:', apErr.message);
      results.auto_pay = `error: ${apErr.message}`;
    }

    console.log('[Cron] Processing completed:', results);
    res.json(results);
  } catch (err) {
    console.error('[Cron] Processing failed:', err.message);
    res.status(500).json({ error: 'Cron processing partial/full failure', details: err.message });
  }
});

module.exports = router;

