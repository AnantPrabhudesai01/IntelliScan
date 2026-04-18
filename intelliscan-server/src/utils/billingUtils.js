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
    period: 'month',
    color: 'gray',
    icon: 'Shield',
    badge: 'Starter',
    features: [
      '100 Scan Credits / month', 
      'Gemini Flash OCR Engine',
      'Basic AI Follow-up Drafts',
      'Community Documentation'
    ],
    limits: { single: 100, group: 5, ai_credits: 100 },
    negatives: ['Manual CRM Export', 'No real-time sync']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    currency: 'INR',
    period: 'month',
    color: 'indigo',
    icon: 'Zap',
    badge: 'Advanced',
    features: [
      '5,000 Scan Credits / month',
      'Gemini Pro Vision Engine',
      'Real-time CRM Sync (Live)',
      'Priority Verification Support',
      'Custom AI Identity Policy',
      'No Branding on Digital Cards'
    ],
    limits: { single: 5000, group: 100, ai_credits: 5000 },
    negatives: ['Up to 10 Seats']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1999,
    currency: 'INR',
    period: 'month',
    color: 'amber',
    icon: 'Crown',
    badge: 'Scale',
    features: [
      'Unlimited Scan Credits',
      'Custom AI Training (Your Industry)',
      'Single Sign-On (SSO) & SAML',
      'Global Workspace Audit Trails',
      'Dedicated Account Manager',
      'Bulk Team Member Workspaces'
    ],
    limits: { single: 1000000, group: 1000000, ai_credits: -1 },
    negatives: []
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
