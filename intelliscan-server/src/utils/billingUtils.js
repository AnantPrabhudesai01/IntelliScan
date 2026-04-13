/**
 * Billing Utilities — Plan catalog, Razorpay helpers, seat limits
 */
const crypto = require('crypto');

const BILLING_PLANS = [
  {
    id: 'personal',
    name: 'Personal',
    price: 0,
    currency: 'INR',
    period: 'free',
    features: ['10 scans/month', '1 group scan', 'Basic AI drafts', 'Standard support'],
    limits: { single: 10, group: 1 }
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 499,
    currency: 'INR',
    period: 'month',
    features: ['100 scans/month', '10 group scans', 'AI coach', 'Priority support', 'CRM integration'],
    limits: { single: 100, group: 10 }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1999,
    currency: 'INR',
    period: 'month',
    features: ['Unlimited scans', 'Unlimited group scans', 'Full AI suite', 'Dedicated support', 'RBAC & Workspaces', 'Audit trail'],
    limits: { single: 99999, group: 99999 }
  }
];

function getBillingPlan(planId) {
  return BILLING_PLANS.find(p => p.id === String(planId || '').toLowerCase()) || null;
}

function rupeesToPaise(amount) {
  return Math.round(Number(amount || 0) * 100);
}

/** Razorpay helpers — gracefully degrade when keys are missing */
function getRazorpayCredentials() {
  const keyId = String(process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!keyId || !keySecret || keyId.includes('your_') || keySecret.includes('your_')) return null;
  return { keyId, keySecret };
}

async function createRazorpayOrder({ amountPaise, currency, receipt, notes }) {
  const creds = getRazorpayCredentials();
  if (!creds) throw new Error('Razorpay is not configured');
  const Razorpay = require('razorpay');
  const instance = new Razorpay({ key_id: creds.keyId, key_secret: creds.keySecret });
  return instance.orders.create({ amount: amountPaise, currency, receipt, notes });
}

function verifyRazorpaySignature({ orderId, paymentId, signature, keySecret }) {
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expectedSignature === signature;
}

function resolveSeatLimit(tier) {
  const t = String(tier || '').toLowerCase();
  if (t === 'enterprise') return 500;
  if (t === 'pro' || t === 'professional') return 10;
  return 1;
}

function detectCardBrand(digits) {
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6(?:011|5)/.test(digits)) return 'discover';
  return 'card';
}

module.exports = {
  BILLING_PLANS,
  getBillingPlan,
  rupeesToPaise,
  getRazorpayCredentials,
  createRazorpayOrder,
  verifyRazorpaySignature,
  resolveSeatLimit,
  detectCardBrand
};
