const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const nodemailer = require('nodemailer');
const OpenAI = require('openai');
const path = require('path');
const { spawn } = require('child_process');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');


// Server restarted to pick up new GEMINI_API_KEY

function expandRecurringEvent(event, rangeStart, rangeEnd) {
  // Expands a recurring event into individual occurrences
  // within the given date range
  // Returns array of virtual event objects

  if (!event.recurrence_rule) return [event];

  let rule;
  try {
    rule = typeof event.recurrence_rule === 'string' ? JSON.parse(event.recurrence_rule) : event.recurrence_rule;
  } catch (e) {
    return [event];
  }
  // rule shape: { freq, interval, count, until, byDay, byMonth }
  // freq: 'daily'|'weekly'|'monthly'|'yearly'

  const occurrences = [];
  let current = new Date(event.start_datetime);
  const eventDuration = new Date(event.end_datetime).getTime() - new Date(event.start_datetime).getTime();
  const rangeStartDate = new Date(rangeStart);
  const rangeEndDate = new Date(rangeEnd);
  let count = 0;
  const maxCount = rule.count || 500;

  while (current <= rangeEndDate && count < maxCount) {
    if (rule.until && current > new Date(rule.until)) break;

    if (current.getTime() + eventDuration >= rangeStartDate.getTime()) {
      occurrences.push({
        ...event,
        id: `${event.id}_${current.toISOString()}`,
        parent_event_id: event.id,
        start_datetime: current.toISOString(),
        end_datetime: new Date(current.getTime() + eventDuration).toISOString(),
        recurrence_id: current.toISOString(),
        is_virtual: true
      });
    }

    const interval = rule.interval || 1;
    const next = new Date(current);

    switch (rule.freq) {
      case 'daily':
        next.setDate(next.getDate() + interval);
        break;
      case 'weekly':
        if (rule.byDay && Array.isArray(rule.byDay) && rule.byDay.length > 0) {
          // Handle specific days of week
          next.setDate(next.getDate() + 1);
          const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
          while (!rule.byDay.includes(days[next.getDay()])) {
            next.setDate(next.getDate() + 1);
          }
        } else {
          next.setDate(next.getDate() + (7 * interval));
        }
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + interval);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + interval);
        break;
      default:
        next.setDate(next.getDate() + interval);
    }
    current = next;
    count++;
  }

  return occurrences;
}

const { createSmtpTransporterFromEnv } = require('./src/utils/smtp');

// Configuration & Utils
const { 
  JWT_SECRET, 
  JWT_EXPIRES_IN, 
  PORT, 
  PERSONAL_EMAIL_DOMAINS 
} = require('./src/config/constants');

const { 
  db, 
  dbGetAsync, 
  dbAllAsync, 
  dbRunAsync, 
  dbExecAsync 
} = require('./src/utils/db');

const { 
  logAuditEvent, 
  AUDIT_SUCCESS, 
  AUDIT_DENIED, 
  AUDIT_ERROR 
} = require('./src/utils/logger');

const { 
  authenticateToken, 
  requireAdmin, 
  requireEnterpriseAdmin, 
  requireTier 
} = require('./src/middleware/auth');

function requireEnterpriseOrAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.role === 'super_admin' || req.user.role === 'business_admin' || req.user.tier === 'enterprise' || req.user.tier === 'business') {
    return next();
  }
  return res.status(403).json({ error: 'Calendar is available on Business and Enterprise plans' });
}

function requireSuperAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Super admin required' });
  next();
}

function requireFeature(feature) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    // Keep this resilient even if user has stale token data
    const dbUser = await dbGetAsync('SELECT role, tier FROM users WHERE id = ?', [req.user.id]);
    const profile = buildAccessProfile(dbUser?.role || req.user.role || 'user', dbUser?.tier || req.user.tier || 'personal');

    if (!profile.feature_flags || !profile.feature_flags[feature]) {
      return res.status(403).json({ error: `Feature '${feature}' is not available for your plan` });
    }

    next();
  };
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const rateLimiterBuckets = new Map();

function getWorkspaceRoom(workspaceId, userId) {
  return workspaceId ? `workspace-${workspaceId}` : `workspace-user-${userId}`;
}

function getClientIp(req) {
  const headerIp = req.headers['x-forwarded-for'];
  if (headerIp) return headerIp.split(',')[0].trim();
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function pickRateLimitRule(pathname) {
  if (/^\/api\/auth\/login/.test(pathname)) return { limit: 8, windowMs: 60 * 1000 };
  if (/^\/api\/auth\/register/.test(pathname)) return { limit: 6, windowMs: 60 * 1000 };
  if (/^\/api\/admin\//.test(pathname)) return { limit: 120, windowMs: 60 * 1000 };
  if (/^\/api\/scan/.test(pathname)) return { limit: 30, windowMs: 60 * 1000 };
  if (/^\/api\/contacts\/export-crm/.test(pathname)) return { limit: 25, windowMs: 60 * 1000 };
  return { limit: 300, windowMs: 60 * 1000 };
}

function extractUserIdFromAuthHeader(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded?.id || null;
  } catch (_) {
    return null;
  }
}

function rateLimitMiddleware(req, res, next) {
  const rule = pickRateLimitRule(req.originalUrl || req.path || '');
  const ip = getClientIp(req);
  const userId = extractUserIdFromAuthHeader(req);
  const identity = userId ? `user:${userId}` : `ip:${ip}`;
  const key = `${identity}:${rule.limit}:${rule.windowMs}`;
  const now = Date.now();

  let bucket = rateLimiterBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + rule.windowMs };
    rateLimiterBuckets.set(key, bucket);
  }

  bucket.count += 1;
  const remaining = Math.max(rule.limit - bucket.count, 0);
  const resetEpochSec = Math.ceil(bucket.resetAt / 1000);
  res.setHeader('X-RateLimit-Limit', `${rule.limit}`);
  res.setHeader('X-RateLimit-Remaining', `${remaining}`);
  res.setHeader('X-RateLimit-Reset', `${resetEpochSec}`);

  if (bucket.count > rule.limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader('Retry-After', `${Math.max(retryAfter, 1)}`);
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please retry shortly.'
    });
  }

  if (rateLimiterBuckets.size > 5000) {
    for (const [bucketKey, value] of rateLimiterBuckets.entries()) {
      if (now > value.resetAt) rateLimiterBuckets.delete(bucketKey);
    }
  }

  next();
}

// Database helpers are now imported from src/utils/db.js

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function maskEmail(email) {
  if (!email || !String(email).includes('@')) return email || '';
  const [local, domain] = String(email).split('@');
  if (!domain) return email;
  if (!PERSONAL_EMAIL_DOMAINS.has(domain.toLowerCase())) return email;
  if (!local) return `masked@${domain}`;
  if (local.length <= 2) return `${local[0] || 'x'}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone) {
  const raw = String(phone || '');
  const digits = normalizePhone(raw);
  if (digits.length < 7) return raw;
  const keepStart = digits.slice(0, Math.min(2, digits.length - 4));
  const keepEnd = digits.slice(-4);
  return `${keepStart}${'*'.repeat(Math.max(digits.length - keepStart.length - keepEnd.length, 2))}${keepEnd}`;
}

function firstNameFromFullName(name) {
  const parsed = String(name || '').trim().split(/\s+/)[0];
  return parsed || 'there';
}

function resolveTierLimits(tier) {
  const normalizedTier = String(tier || 'personal').toLowerCase();
  if (normalizedTier === 'enterprise') {
    return { single: 99999, group: 99999 };
  }
  if (normalizedTier === 'pro') {
    return { single: 100, group: 10 };
  }
  return { single: 10, group: 1 };
}

const BILLING_PLANS = [
  { id: 'personal', name: 'Personal', price: 0, currency: 'INR' },
  { id: 'pro', name: 'Professional', price: 999, currency: 'INR' },
  { id: 'enterprise', name: 'Enterprise', price: 4999, currency: 'INR' }
];

function getBillingPlan(planId) {
  const normalized = String(planId || '').trim().toLowerCase();
  return BILLING_PLANS.find((p) => p.id === normalized) || null;
}

function rupeesToPaise(rupees) {
  return Math.max(0, Math.round((Number(rupees) || 0) * 100));
}

function getRazorpayCredentials() {
  const keyId = String(process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

async function createRazorpayOrder({ amountPaise, currency = 'INR', receipt, notes }) {
  const creds = getRazorpayCredentials();
  if (!creds) return null;

  const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
  const resp = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency,
      receipt,
      notes: notes || {}
    })
  });

  let payload = null;
  try {
    payload = await resp.json();
  } catch (_) {
    payload = null;
  }

  if (!resp.ok) {
    const message =
      payload?.error?.description ||
      payload?.error?.code ||
      payload?.message ||
      resp.statusText ||
      `HTTP ${resp.status}`;
    throw new Error(`Razorpay order creation failed: ${message}`);
  }

  return payload;
}

function verifyRazorpaySignature({ orderId, paymentId, signature, keySecret }) {
  const expected = crypto
    .createHmac('sha256', String(keySecret || ''))
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === String(signature || '');
}

function buildAccessProfile(role = 'user', tier = 'personal') {
  const normalizedRole = String(role || 'user').toLowerCase();
  const normalizedTier = String(tier || 'personal').toLowerCase();
  const limits = resolveTierLimits(normalizedTier);

  const featureFlags = {
    dashboard_scan: true,
    batch_upload: true,
    contacts: true,
    events: true,
    ai_drafts: true,
    ai_coach: true,
    kiosk_mode: true,
    digital_card: true,
    workspace_contacts: true,
    workspace_members: true,
    workspace_scanner_links: true,
    workspace_crm_mapping: true,
    workspace_routing_rules: true,
    workspace_data_policies: true,
    workspace_data_quality: true,
    workspace_campaigns: true,
    workspace_analytics: true,
    workspace_org_chart: true,
    workspace_billing: true,
    workspace_shared_rolodex: true,
    api_integrations: normalizedTier !== 'personal',
    admin_platform: normalizedRole === 'super_admin'
  };

  return {
    role: normalizedRole,
    tier: normalizedTier,
    limits: {
      single_scans_per_cycle: limits.single,
      group_scans_per_cycle: limits.group,
      batch_upload_limit: normalizedTier === 'enterprise' ? 100 : normalizedTier === 'pro' ? 50 : 10
    },
    feature_flags: featureFlags
  };
}

function resolveSeatLimit(tier) {
  const normalizedTier = String(tier || 'personal').toLowerCase();
  if (normalizedTier === 'enterprise') return 25;
  if (normalizedTier === 'pro') return 5;
  return 1;
}

function detectCardBrand(rawNumber = '') {
  const digits = String(rawNumber || '').replace(/\D/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6(?:011|5)/.test(digits)) return 'discover';
  return 'card';
}

async function ensureBillingSeedForScope(scopeWorkspaceId, tier = 'personal') {
  const methodsCount = await dbGetAsync(
    'SELECT COUNT(*) as count FROM billing_payment_methods WHERE workspace_id = ?',
    [scopeWorkspaceId]
  );

  if (!Number(methodsCount?.count || 0)) {
    const now = new Date();
    const primaryExpYear = now.getFullYear() + 2;
    const backupExpYear = now.getFullYear() + 1;

    await dbRunAsync(
      `INSERT INTO billing_payment_methods
        (workspace_id, brand, last4, exp_month, exp_year, holder_name, is_primary, is_backup)
       VALUES (?, ?, ?, ?, ?, ?, 1, 0)`,
      [scopeWorkspaceId, 'visa', '4242', 12, primaryExpYear, 'Primary Billing']
    );

    await dbRunAsync(
      `INSERT INTO billing_payment_methods
        (workspace_id, brand, last4, exp_month, exp_year, holder_name, is_primary, is_backup)
       VALUES (?, ?, ?, ?, ?, ?, 0, 1)`,
      [scopeWorkspaceId, 'mastercard', '8812', 8, backupExpYear, 'Backup Billing']
    );
  }

  const invoicesCount = await dbGetAsync(
    'SELECT COUNT(*) as count FROM billing_invoices WHERE workspace_id = ?',
    [scopeWorkspaceId]
  );

  if (!Number(invoicesCount?.count || 0)) {
    const now = new Date();
    const amountCents =
      String(tier || 'personal').toLowerCase() === 'enterprise'
        ? 49900
        : String(tier || 'personal').toLowerCase() === 'pro'
          ? 2900
          : 0;

    for (let monthOffset = 0; monthOffset < 3; monthOffset += 1) {
      const issueDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const yyyy = issueDate.getFullYear();
      const mm = String(issueDate.getMonth() + 1).padStart(2, '0');
      const invoiceNumber = `INV-${Math.abs(scopeWorkspaceId)}-${yyyy}${mm}`;

      await dbRunAsync(
        `INSERT OR IGNORE INTO billing_invoices
          (workspace_id, invoice_number, amount_cents, currency, status, issued_at)
         VALUES (?, ?, ?, 'USD', 'paid', ?)`,
        [scopeWorkspaceId, invoiceNumber, amountCents, issueDate.toISOString()]
      );
    }
  }
}

async function ensureQuotaRow(userId, tier = 'personal') {
  const limits = resolveTierLimits(tier);
  await dbRunAsync(
    `INSERT OR IGNORE INTO user_quotas (user_id, used_count, limit_amount, group_scans_used, last_reset_date)
     VALUES (?, 0, ?, 0, datetime('now', 'start of month'))`,
    [userId, limits.single]
  );
  
  // Lazy Quota Reset
  await dbRunAsync(
    `UPDATE user_quotas
     SET used_count = 0, group_scans_used = 0, last_reset_date = datetime('now', 'start of month')
     WHERE user_id = ? AND (last_reset_date IS NULL OR last_reset_date < datetime('now', 'start of month'))`,
    [userId]
  );

  // Ensure limit amount is correct explicitly
  await dbRunAsync(
    `UPDATE user_quotas
     SET limit_amount = ?
     WHERE user_id = ? AND (limit_amount != ?)`,
    [limits.single, userId, limits.single]
  );
}

function applyTemplateVariables(template, contact = {}) {
  return String(template || '')
    .replace(/\{\{\s*firstName\s*\}\}/gi, firstNameFromFullName(contact.name))
    .replace(/\{\{\s*fullName\s*\}\}/gi, String(contact.name || firstNameFromFullName(contact.name)))
    .replace(/\{\{\s*company\s*\}\}/gi, String(contact.company || 'your company'))
    .replace(/\{\{\s*title\s*\}\}/gi, String(contact.job_title || contact.title || 'your role'));
}

async function getCampaignAudienceForUser({ userId, targetIndustry, targetSeniority, limit = 5000 }) {
  const { scopeWorkspaceId } = await getScopeForUser(userId);
  const where = ['workspace_scope = ?', "email IS NOT NULL", "TRIM(email) <> ''"];
  const params = [scopeWorkspaceId];

  if (String(targetIndustry || '').trim()) {
    where.push('LOWER(COALESCE(inferred_industry, "")) = LOWER(?)');
    params.push(String(targetIndustry).trim());
  }

  if (String(targetSeniority || '').trim()) {
    where.push('LOWER(COALESCE(inferred_seniority, "")) = LOWER(?)');
    params.push(String(targetSeniority).trim());
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 1000, 1), 5000);
  params.push(safeLimit);

  const rows = await dbAllAsync(
    `SELECT id, name, email, company, job_title, inferred_industry, inferred_seniority
     FROM contacts
     WHERE ${where.join(' AND ')}
     ORDER BY datetime(scan_date) DESC
     LIMIT ?`,
    params
  );

  const deduped = [];
  const seen = new Set();
  rows.forEach((row) => {
    const key = normalizeEmail(row.email);
    if (!key || seen.has(key)) return;
    seen.add(key);
    deduped.push(row);
  });

  return deduped;
}

function getContactCompletenessScore(contact) {
  let score = 0;
  if (contact?.name) score += 2;
  if (contact?.email) score += 3;
  if (contact?.phone) score += 2;
  if (contact?.company) score += 1;
  if (contact?.job_title) score += 1;
  if (contact?.notes) score += 1;
  score += Math.round((Number(contact?.confidence) || 0) / 20);
  return score;
}

function getScopeWorkspaceId(workspaceId, userId) {
  return workspaceId ? Number(workspaceId) : Number(userId) * -1;
}

function getAuditActor(req, options = {}) {
  return {
    userId: options.actorUserId ?? req.user?.id ?? null,
    email: options.actorEmail ?? req.user?.email ?? null,
    role: options.actorRole ?? req.user?.role ?? 'anonymous'
  };
}

// Shared logAuditEvent is now imported or defined once at the top

const requireWorkspaceAdmin = (req, res, next) => {
  if (!['business_admin', 'super_admin'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Forbidden - Workspace admin access required' });
  }
  next();
};

function simulateProviderSyncOutcome(provider, retryCount = 0) {
  const normalized = String(provider || '').trim().toLowerCase();
  const baseFailureProbability =
    normalized === 'salesforce' ? 0.24 :
      normalized === 'hubspot' ? 0.18 :
        normalized === 'zoho' ? 0.2 :
          0.22;

  // Retries become slightly more likely to succeed.
  const adjustedFailure = Math.max(baseFailureProbability - (retryCount * 0.06), 0.06);
  return Math.random() >= adjustedFailure;
}

function getProviderLatencyMs(provider) {
  const normalized = String(provider || '').trim().toLowerCase();
  if (normalized === 'salesforce') return 2200;
  if (normalized === 'hubspot') return 1500;
  if (normalized === 'zoho') return 1800;
  return 1700;
}

async function getWorkspaceIdForUser(userId) {
  const row = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [userId]);
  return row?.workspace_id ?? null;
}

async function getScopeForUser(userId) {
  const workspaceId = await getWorkspaceIdForUser(userId);
  return {
    workspaceId,
    scopeWorkspaceId: getScopeWorkspaceId(workspaceId, userId)
  };
}

function getDefaultPolicies() {
  return {
    retention_days: 90,
    pii_redaction_enabled: 1,
    strict_audit_storage_enabled: 1
  };
}

async function getPoliciesForScope(scopeWorkspaceId) {
  const row = await dbGetAsync(
    `SELECT retention_days, pii_redaction_enabled, strict_audit_storage_enabled
     FROM workspace_policies WHERE workspace_id = ?`,
    [scopeWorkspaceId]
  );

  if (!row) return getDefaultPolicies();
  return {
    retention_days: Number(row.retention_days),
    pii_redaction_enabled: Number(row.pii_redaction_enabled) ? 1 : 0,
    strict_audit_storage_enabled: Number(row.strict_audit_storage_enabled) ? 1 : 0
  };
}

function applyPiiPolicyToContactInput(contactInput = {}, policies = getDefaultPolicies()) {
  if (!policies?.pii_redaction_enabled) return contactInput;

  const sanitized = { ...contactInput };
  if (sanitized.email) sanitized.email = maskEmail(sanitized.email);
  if (sanitized.phone) sanitized.phone = maskPhone(sanitized.phone);
  if (sanitized.image_url && /^data:image\//.test(String(sanitized.image_url))) {
    sanitized.image_url = null;
  }
  if (sanitized.card_image && /^data:image\//.test(String(sanitized.card_image))) {
    sanitized.card_image = null;
  }
  return sanitized;
}

async function runRetentionPurgeForScope(scopeWorkspaceId, retentionDays) {
  if (!retentionDays || Number(retentionDays) <= 0) {
    return { purged: 0 };
  }

  const cutoff = new Date(Date.now() - Number(retentionDays) * 24 * 60 * 60 * 1000).toISOString();
  const result = await dbRunAsync(
    `DELETE FROM contacts
     WHERE workspace_scope = ?
       AND (crm_synced IS NULL OR crm_synced = 0)
       AND datetime(scan_date) < datetime(?)`,
    [scopeWorkspaceId, cutoff]
  );

  return { purged: Number(result?.changes || 0) };
}

function extractJsonObjectFromText(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  return raw.slice(firstBrace, lastBrace + 1);
}

function buildCoachFallbackInsights({ total, staleCount, missingContext, topIndustries, topSeniorities }) {
  const freshnessRatio = total > 0 ? Math.max(0, 1 - staleCount / total) : 0.5;
  const contextRatio = total > 0 ? Math.max(0, 1 - missingContext / total) : 0.5;
  const diversityBonus = topIndustries ? 0.12 : 0.05;
  const health = Math.round(Math.min(100, (freshnessRatio * 48 + contextRatio * 40 + diversityBonus * 100)));

  const actions = [
    {
      id: 'stale',
      title: staleCount > 0 ? `Re-activate ${staleCount} stale contacts` : 'Maintain outreach momentum',
      description: staleCount > 0
        ? `${staleCount} relationships are idle for over 14 days. Send follow-up drafts now to avoid deal decay.`
        : 'No stale contacts detected this week. Keep your weekly touchpoints consistent.',
      cta: staleCount > 0 ? 'Open AI Drafts' : 'Review Draft Queue',
      color: staleCount > 0 ? 'red' : 'emerald'
    },
    {
      id: 'industry',
      title: topIndustries ? `Double down on ${topIndustries.split(',')[0]}` : 'Build one focused segment',
      description: topIndustries
        ? `Your strongest network cluster is in ${topIndustries}. Run a tailored campaign with persona-specific messaging.`
        : 'No strong vertical cluster yet. Segment your contacts by industry to unlock smarter campaigns.',
      cta: 'Plan Campaign',
      color: 'indigo'
    },
    {
      id: 'context',
      title: missingContext > 0 ? `Fix ${missingContext} incomplete profiles` : 'Profiles look healthy',
      description: missingContext > 0
        ? `${missingContext} contacts are missing key context (role/company/email). Fill these fields to improve routing and outreach quality.`
        : `Your profile quality is strong. Seniority coverage: ${topSeniorities || 'balanced'}.`,
      cta: missingContext > 0 ? 'Clean Contacts' : 'View Contacts',
      color: missingContext > 0 ? 'blue' : 'emerald'
    }
  ];

  return {
    health_score: health,
    momentum_status: health >= 75 ? 'Strong Momentum' : health >= 55 ? 'Stable Growth' : 'Needs Attention',
    actions
  };
}

function shouldUseMockAiFallback() {
  const raw = String(process.env.ALLOW_MOCK_AI_FALLBACK || '').trim().toLowerCase();
  if (!raw) {
    // In dev, prefer returning deterministic fallbacks so the app is usable without keys.
    return String(process.env.NODE_ENV || '').trim().toLowerCase() !== 'production';
  }
  return ['1', 'true', 'yes', 'on'].includes(raw);
}

function buildFallbackSingleCardResponse() {
  return {
    rejected: false,
    name: 'Sarah Mitchell',
    company: 'Stark Industries',
    title: 'Senior Solutions Architect',
    email: 'sarah.mitchell@stark.com',
    phone: '+1 (555) 019-2834',
    website: 'www.stark.com',
    address: '10880 Malibu Point, CA 90265',
    inferred_industry: 'Technology',
    inferred_seniority: 'Senior',
    confidence: 82,
    engine_used: 'Fallback OCR (offline mode)',
    warning: 'Gemini AI is unavailable. This is a fallback draft - please review before saving.'
  };
}

function buildFallbackMultiCardResponse() {
  const baseContacts = [
    { name: 'Alex Harper', title: 'VP of Product', company: 'Acme Corp', email: 'alex@acme.io', phone: '+1-555-0100' },
    { name: 'Jordan Lee', title: 'CTO', company: 'Cybernetics Inc', email: 'jordan.l@cybernetics.dom', phone: '+1-555-0211' },
    { name: 'Jamie Rivera', title: 'Director of Sales', company: 'Global Traders', email: 'jamie@globaltraders.co', phone: '555-0322' },
    { name: 'Casey Smith', title: 'Marketing Lead', company: 'Nexus Ltd', email: 'casey@nexus.net', phone: '555-0450' },
    { name: 'Taylor Swift', title: 'Developer Advocate', company: 'TechFlow', email: 'taylor@techflow.dev', phone: '555-0678' }
  ];
  
  const mockContacts = Array.from({ length: 25 }).map((_, i) => {
    const base = baseContacts[i % baseContacts.length];
    return {
      ...base,
      name: `${base.name} ${i + 1}`,
      email: `user${i + 1}_${base.email}`
    };
  });
  
  const cards = mockContacts.map((c) => ({
    name: c.name,
    company: c.company,
    title: c.title,
    email: c.email,
    phone: c.phone,
    website: '',
    address: '',
    inferred_industry: 'Software',
    inferred_seniority: 'Executive',
    confidence: 85,
    is_duplicate: false
  }));
  return {
    cards,
    total_detected: cards.length,
    engine_used: 'Fallback OCR (offline mode)',
    warning: 'Gemini AI is unavailable. These fallback placeholders should be edited before saving.'
  };
}

function cleanCardValue(value, maxLength = 300) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function deriveNameFromEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes('@')) return '';
  const localPart = normalized.split('@')[0] || '';
  const words = localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '';
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function deriveCompanyFromEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes('@')) return '';
  const domain = normalized.split('@')[1] || '';
  if (!domain || PERSONAL_EMAIL_DOMAINS.has(domain)) return '';

  const root = domain.split('.')[0] || '';
  const words = root
    .replace(/[-_]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '';
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function normalizeExtractedCard(card = {}, options = {}) {
  const fallbackConfidence = Number(options.fallbackConfidence ?? 75);
  const normalized = {
    name: cleanCardValue(card.name, 160),
    company: cleanCardValue(card.company, 160),
    title: cleanCardValue(card.title || card.job_title, 160),
    email: normalizeEmail(card.email),
    phone: cleanCardValue(card.phone, 80),
    website: cleanCardValue(card.website, 180),
    address: cleanCardValue(card.address, 280),
    inferred_industry: cleanCardValue(card.inferred_industry, 80),
    inferred_seniority: cleanCardValue(card.inferred_seniority, 80),
    detected_language: cleanCardValue(card.detected_language || card.language, 64)
  };

  if (!normalized.name && normalized.email) {
    normalized.name = deriveNameFromEmail(normalized.email);
  }

  if (!normalized.company && normalized.email) {
    normalized.company = deriveCompanyFromEmail(normalized.email);
  }

  const parsedConfidence = Number(card.confidence);
  normalized.confidence = Number.isFinite(parsedConfidence)
    ? Math.max(0, Math.min(100, Math.round(parsedConfidence)))
    : fallbackConfidence;

  if (card.name_native) normalized.name_native = cleanCardValue(card.name_native, 160);
  if (card.company_native) normalized.company_native = cleanCardValue(card.company_native, 160);
  if (card.title_native) normalized.title_native = cleanCardValue(card.title_native, 160);

  return normalized;
}

function hasMeaningfulContactData(card = {}) {
  return Boolean(
    cleanCardValue(card.name) ||
    cleanCardValue(card.company) ||
    normalizeEmail(card.email) ||
    cleanCardValue(card.phone)
  );
}

function selectPrimaryContact(groupContacts) {
  if (!Array.isArray(groupContacts) || groupContacts.length === 0) return null;
  return [...groupContacts].sort((a, b) => {
    const scoreDelta = getContactCompletenessScore(b) - getContactCompletenessScore(a);
    if (scoreDelta !== 0) return scoreDelta;
    return new Date(b.scan_date || 0).getTime() - new Date(a.scan_date || 0).getTime();
  })[0];
}

function buildFieldMergeSuggestions(primary, others) {
  if (!primary) return {};
  const suggestions = {};
  const mergeFields = ['email', 'phone', 'company', 'job_title', 'notes', 'tags', 'inferred_industry', 'inferred_seniority', 'image_url'];

  mergeFields.forEach((field) => {
    if (primary[field]) return;
    const candidate = others.find((contact) => contact?.[field]);
    if (candidate?.[field]) {
      suggestions[field] = candidate[field];
    }
  });

  return suggestions;
}

function buildDedupeSuggestions(contacts = []) {
  const byEmail = new Map();
  const byPhone = new Map();
  const byNameCompany = new Map();
  const suggestionMap = new Map();
  const contactById = new Map((contacts || []).map((c) => [c.id, c]));

  contacts.forEach((contact) => {
    const emailKey = normalizeEmail(contact.email);
    if (emailKey) {
      if (!byEmail.has(emailKey)) byEmail.set(emailKey, []);
      byEmail.get(emailKey).push(contact.id);
    }

    const phoneKey = normalizePhone(contact.phone);
    if (phoneKey.length >= 7) {
      if (!byPhone.has(phoneKey)) byPhone.set(phoneKey, []);
      byPhone.get(phoneKey).push(contact.id);
    }

    const nameCompanyKey = `${normalizeEmail(contact.name)}::${normalizeEmail(contact.company)}`;
    if (normalizeEmail(contact.name) && normalizeEmail(contact.company)) {
      if (!byNameCompany.has(nameCompanyKey)) byNameCompany.set(nameCompanyKey, []);
      byNameCompany.get(nameCompanyKey).push(contact.id);
    }
  });

  const ingestGroup = (ids, reason, confidence) => {
    const uniqueSortedIds = [...new Set(ids)].sort((a, b) => a - b);
    if (uniqueSortedIds.length < 2) return;

    const idsKey = uniqueSortedIds.join(',');
    if (!suggestionMap.has(idsKey)) {
      suggestionMap.set(idsKey, { ids: uniqueSortedIds, reasons: new Set(), confidence: 0 });
    }
    const current = suggestionMap.get(idsKey);
    current.reasons.add(reason);
    current.confidence = Math.max(current.confidence, confidence);
  };

  for (const ids of byEmail.values()) if (ids.length > 1) ingestGroup(ids, 'Exact email match', 97);
  for (const ids of byPhone.values()) if (ids.length > 1) ingestGroup(ids, 'Exact phone match', 92);
  for (const ids of byNameCompany.values()) if (ids.length > 1) ingestGroup(ids, 'Same name + company', 83);

  return [...suggestionMap.values()].map((entry) => {
    const groupContacts = entry.ids.map((id) => contactById.get(id)).filter(Boolean);
    const primary = selectPrimaryContact(groupContacts);
    const duplicates = groupContacts.filter((c) => c.id !== primary?.id);
    const fingerprint = `${entry.ids.join('-')}|${[...entry.reasons].sort().join('&')}`;
    return {
      fingerprint,
      reason: [...entry.reasons].join(' + '),
      confidence: entry.confidence,
      contact_ids: entry.ids,
      primary_contact_id: primary?.id || entry.ids[0],
      primary_contact: primary || groupContacts[0],
      duplicates,
      merge_suggestions: buildFieldMergeSuggestions(primary, duplicates)
    };
  }).sort((a, b) => b.confidence - a.confidence);
}

async function rebuildDedupeQueueForScope(scopeWorkspaceId, contacts) {
  const suggestions = buildDedupeSuggestions(contacts);
  const seenFingerprints = suggestions.map((s) => s.fingerprint);

  for (const suggestion of suggestions) {
    await dbRunAsync(
      `INSERT OR IGNORE INTO data_quality_dedupe_queue
      (workspace_id, fingerprint, contact_ids_json, primary_contact_id, reason, confidence, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        scopeWorkspaceId,
        suggestion.fingerprint,
        JSON.stringify(suggestion.contact_ids),
        suggestion.primary_contact_id,
        suggestion.reason,
        suggestion.confidence
      ]
    );

    await dbRunAsync(
      `UPDATE data_quality_dedupe_queue
       SET contact_ids_json = ?, primary_contact_id = ?, reason = ?, confidence = ?, updated_at = CURRENT_TIMESTAMP
       WHERE workspace_id = ? AND fingerprint = ? AND status = 'pending'`,
      [
        JSON.stringify(suggestion.contact_ids),
        suggestion.primary_contact_id,
        suggestion.reason,
        suggestion.confidence,
        scopeWorkspaceId,
        suggestion.fingerprint
      ]
    );
  }

  if (seenFingerprints.length === 0) {
    await dbRunAsync(
      `DELETE FROM data_quality_dedupe_queue WHERE workspace_id = ? AND status = 'pending'`,
      [scopeWorkspaceId]
    );
  } else {
    const placeholders = seenFingerprints.map(() => '?').join(', ');
    await dbRunAsync(
      `DELETE FROM data_quality_dedupe_queue
       WHERE workspace_id = ? AND status = 'pending' AND fingerprint NOT IN (${placeholders})`,
      [scopeWorkspaceId, ...seenFingerprints]
    );
  }

  return suggestions;
}

// Health Check for GCP/Load Balancers
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db_ok: !!db
  });
});

app.use(helmet());
const allowedOrigins = (process.env.CLIENT_ORIGIN || '').split(',').filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : '*',
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
  credentials: true,
  maxAge: 86400
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded', message: 'Too many requests mapped to this IP.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Security Lockout', message: 'Too many login attempts. Please try again later.' }
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ==========================================
// PRODUCTION LOGGING MIDDLEWARE
// ==========================================
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Time: ${duration}ms`);
  });
  next();
});

// Initialize SQLite DB
// db instance is imported from src/utils/db; run migrations/initialization on load
if (db) {
  db.serialize(() => {
    // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user',
        workspace_id INTEGER
      )`);

      db.run("ALTER TABLE users ADD COLUMN tier TEXT DEFAULT 'personal'", () => { });

      // Dev/demo: seed plan/role test accounts in the *active* runtime DB (intelliscan.db),
      // so you can preview Free/Pro/Enterprise/SuperAdmin flows without manual setup.
      const seedFlag = String(process.env.SEED_DEMO_USERS || '').trim().toLowerCase();
      const isProd = String(process.env.NODE_ENV || '').trim().toLowerCase() === 'production';
      const shouldSeedDemoUsers = !isProd && !['0', 'false', 'no', 'off'].includes(seedFlag);
      if (shouldSeedDemoUsers) {
        try {
          const demoWorkspaceId = 1001;
          const demoUsers = [
            { name: 'Free Personal User', email: 'free@intelliscan.io', password: 'user12345', role: 'user', tier: 'personal', workspace_id: null },
            { name: 'Pro Personal User', email: 'pro@intelliscan.io', password: 'user12345', role: 'user', tier: 'pro', workspace_id: null },
            { name: 'Enterprise User', email: 'enterprise.user@intelliscan.io', password: 'user12345', role: 'user', tier: 'enterprise', workspace_id: demoWorkspaceId },
            { name: 'Enterprise Admin', email: 'enterprise@intelliscan.io', password: 'admin12345', role: 'business_admin', tier: 'enterprise', workspace_id: demoWorkspaceId },
            { name: 'Super Admin', email: 'superadmin@intelliscan.io', password: 'admin12345', role: 'super_admin', tier: 'enterprise', workspace_id: null },
          ];

          demoUsers.forEach((u) => {
            const hashed = bcrypt.hashSync(u.password, 10);
            db.run(
              'INSERT OR IGNORE INTO users (name, email, password, role, tier, workspace_id) VALUES (?, ?, ?, ?, ?, ?)',
              [u.name, u.email, hashed, u.role, u.tier, u.workspace_id]
            );
            // Keep demo accounts deterministic even if they were modified during local testing (upgrades, role changes, etc).
            db.run(
              'UPDATE users SET name = ?, password = ?, role = ?, tier = ?, workspace_id = ? WHERE email = ?',
              [u.name, hashed, u.role, u.tier, u.workspace_id, u.email]
            );
          });
        } catch (err) {
          console.warn('Demo user seed skipped:', err?.message || err);
        }
      }

      // Sessions table
      db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        token TEXT,
        device_info TEXT,
        ip_address TEXT,
        location TEXT,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      )`);

      // Contacts table
      db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        name_native TEXT,
        email TEXT,
        phone TEXT,
        company TEXT,
        company_native TEXT,
        job_title TEXT,
        title_native TEXT,
        detected_language TEXT,
        confidence INTEGER DEFAULT 95,
        scan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        image_url TEXT,
        notes TEXT,
        tags TEXT,
        event_id INTEGER,
        inferred_industry TEXT,
        inferred_seniority TEXT,
        workspace_scope INTEGER,
        crm_synced INTEGER DEFAULT 0,
        crm_synced_at DATETIME
      )`, () => {
        // Seed demo contacts for the seeded Enterprise workspace, so Email Marketing / Data Quality pages
        // show real data immediately after first run.
        const demoWorkspaceId = 1001;
        db.get('SELECT COUNT(*) as count FROM contacts WHERE workspace_scope = ?', [demoWorkspaceId], (err, row) => {
          if (err || Number(row?.count || 0) > 0) return;

          db.get('SELECT id, workspace_id FROM users WHERE email = ?', ['enterprise@intelliscan.io'], (uErr, uRow) => {
            if (uErr || !uRow?.id) return;
            const ownerId = Number(uRow.id);
            const scope = Number(uRow.workspace_id || demoWorkspaceId);

            console.log('--- SEEDING DEMO WORKSPACE CONTACTS ---');
            const contactsSeed = [
              { name: 'Alice Tech', email: 'alice.tech@acme.com', phone: '+1-555-0100', company: 'Acme Corp', job_title: 'Senior Solutions Architect', industry: 'Technology', seniority: 'Senior', confidence: 92 },
              { name: 'Bob Finance', email: 'bob.finance@bigbank.com', phone: '+1-555-0101', company: 'BigBank', job_title: 'VP Finance', industry: 'Finance', seniority: 'VP / Director', confidence: 93 },
              { name: 'Carol Health', email: 'carol@healthco.org', phone: '+1-555-0102', company: 'HealthCo', job_title: 'Chief Medical Officer', industry: 'Healthcare', seniority: 'CXO / Founder', confidence: 94 },
              { name: 'Dan Retail', email: 'dan@retailhub.io', phone: '+1-555-0103', company: 'RetailHub', job_title: 'Marketing Lead', industry: 'Retail', seniority: 'Mid-Level', confidence: 88 },
              { name: 'Eve Education', email: 'eve@edutech.edu', phone: '+1-555-0104', company: 'EduTech', job_title: 'Director of Partnerships', industry: 'Education', seniority: 'VP / Director', confidence: 90 },
              { name: 'Frank Manufacturing', email: 'frank@factoryworks.com', phone: '+1-555-0105', company: 'FactoryWorks', job_title: 'Operations Manager', industry: 'Manufacturing', seniority: 'Mid-Level', confidence: 86 },
              { name: 'Grace Real Estate', email: 'grace@homelink.com', phone: '+1-555-0106', company: 'HomeLink', job_title: 'Senior Agent', industry: 'Real Estate', seniority: 'Senior', confidence: 84 },

              // Duplicate pair to populate Data Quality Center with a merge suggestion.
              { name: 'Jamie Rivera', email: 'duplicate@acme.com', phone: '+1-555-0199', company: 'Acme Corp', job_title: 'Director of Sales', industry: 'Technology', seniority: 'VP / Director', confidence: 82 },
              { name: 'Jamie R.', email: 'duplicate@acme.com', phone: '+1-555-0199', company: 'Acme Corporation', job_title: 'Sales Director', industry: 'Technology', seniority: 'VP / Director', confidence: 80 },
            ];

            contactsSeed.forEach((c) => {
              db.run(
                `INSERT INTO contacts (user_id, name, email, phone, company, job_title, confidence, inferred_industry, inferred_seniority, workspace_scope)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [ownerId, c.name, c.email, c.phone, c.company, c.job_title, c.confidence, c.industry, c.seniority, scope]
              );
            });
          });
        });
      });
      db.run("ALTER TABLE contacts ADD COLUMN confidence INTEGER DEFAULT 95", () => { });
      db.run("ALTER TABLE contacts ADD COLUMN name_native TEXT", () => { });
      db.run("ALTER TABLE contacts ADD COLUMN company_native TEXT", () => { });
      db.run("ALTER TABLE contacts ADD COLUMN title_native TEXT", () => { });
      db.run("ALTER TABLE contacts ADD COLUMN detected_language TEXT", () => { });
      db.run("ALTER TABLE contacts ADD COLUMN engine_used TEXT", () => { });
      db.run("ALTER TABLE contacts ADD COLUMN event_id INTEGER", () => { });
      db.run("ALTER TABLE contacts ADD COLUMN inferred_industry TEXT", () => { });
      db.run("ALTER TABLE contacts ADD COLUMN inferred_seniority TEXT", () => { });
      db.run("ALTER TABLE contacts ADD COLUMN workspace_scope INTEGER", () => { });
      db.run("ALTER TABLE contacts ADD COLUMN crm_synced INTEGER DEFAULT 0", () => { });
      db.run("ALTER TABLE contacts ADD COLUMN crm_synced_at DATETIME", () => { });
      db.run(`
        UPDATE contacts
        SET workspace_scope = COALESCE(
          (
            SELECT CASE
              WHEN u.workspace_id IS NOT NULL THEN u.workspace_id
              ELSE -u.id
            END
            FROM users u
            WHERE u.id = contacts.user_id
          ),
          -contacts.user_id
        )
        WHERE workspace_scope IS NULL
      `, () => { });

      // User Quotas table
      db.run(`CREATE TABLE IF NOT EXISTS user_quotas (
        user_id INTEGER PRIMARY KEY,
        used_count INTEGER DEFAULT 0,
        limit_amount INTEGER DEFAULT 100,
        group_scans_used INTEGER DEFAULT 0,
        last_reset_date DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      db.run("ALTER TABLE user_quotas ADD COLUMN group_scans_used INTEGER DEFAULT 0", () => { });
      db.run("ALTER TABLE user_quotas ADD COLUMN last_reset_date DATETIME", () => { });
      db.run("UPDATE user_quotas SET last_reset_date = datetime('now', 'start of month') WHERE last_reset_date IS NULL", () => { });

      // Events table
      db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        date TEXT,
        location TEXT,
        type TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Contact Relationships table
      db.run(`CREATE TABLE IF NOT EXISTS contact_relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_contact_id INTEGER,
        to_contact_id INTEGER,
        type TEXT, -- 'reports_to', 'colleague', 'introduced_by'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(from_contact_id, to_contact_id, type)
      )`);

      // Analytics Logs table

      db.run(`CREATE TABLE IF NOT EXISTS analytics_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_role TEXT DEFAULT 'anonymous',
        user_email TEXT,
        action TEXT,
        path TEXT,
        duration_ms INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Platform incidents table (super-admin operations center)
      db.run(`CREATE TABLE IF NOT EXISTS platform_incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        severity TEXT DEFAULT 'medium',
        service TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        impact TEXT,
        acknowledged_by TEXT,
        acknowledged_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, () => {
        db.run(`INSERT OR IGNORE INTO platform_incidents (id, title, severity, service, status, impact, created_at) VALUES
          (1, 'Spike in OCR latency across EU region', 'high', 'ocr-engine', 'open', 'Elevated API response times for enterprise workspaces', datetime('now','-45 minutes'))`);
        db.run(`INSERT OR IGNORE INTO platform_incidents (id, title, severity, service, status, impact, created_at) VALUES
          (2, 'Webhook retries exceeded threshold', 'medium', 'webhooks', 'open', 'Delivery delays for outbound CRM webhooks', datetime('now','-2 hours'))`);
        db.run(`INSERT OR IGNORE INTO platform_incidents (id, title, severity, service, status, impact, created_at) VALUES
          (3, 'Background queue drain completed', 'low', 'job-queue', 'resolved', 'No active user impact. Resolved automatically.', datetime('now','-6 hours'))`);
      });

      // Engine Config table (persistent slider values)
      db.run(`CREATE TABLE IF NOT EXISTS engine_config (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, () => {
        // Seed default config values if not present
        db.run(`INSERT OR IGNORE INTO engine_config (key, value) VALUES ('ocr_threshold', '88')`);
        db.run(`INSERT OR IGNORE INTO engine_config (key, value) VALUES ('denoising_sensitivity', '42')`);
        db.run(`INSERT OR IGNORE INTO engine_config (key, value) VALUES ('active_engine', 'gemini')`);
      });

      // Model Versions table
      db.run(`CREATE TABLE IF NOT EXISTS model_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version_tag TEXT,
        description TEXT,
        ocr_accuracy REAL,
        avg_latency_ms INTEGER,
        status TEXT DEFAULT 'standby',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, () => {
        // Seed some model versions
        db.run(`INSERT OR IGNORE INTO model_versions (id, version_tag, description, ocr_accuracy, avg_latency_ms, status) VALUES
          (1, 'v3.2.1', 'Latest production model with improved handwriting recognition', 98.4, 420, 'active')`);
        db.run(`INSERT OR IGNORE INTO model_versions (id, version_tag, description, ocr_accuracy, avg_latency_ms, status) VALUES
          (2, 'v3.1.0', 'Previous stable release. Legal domain optimized.', 96.1, 512, 'standby')`);
        db.run(`INSERT OR IGNORE INTO model_versions (id, version_tag, description, ocr_accuracy, avg_latency_ms, status) VALUES
          (3, 'v2.9.8', 'Legacy model. Medical dataset trained.', 91.7, 680, 'standby')`);
      });

      // AI Custom Models table
      db.run(`CREATE TABLE IF NOT EXISTS ai_models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'deployed', -- 'deployed', 'training', 'paused'
        accuracy REAL,
        latency_ms INTEGER,
        calls_30d INTEGER DEFAULT 0,
        vram_gb REAL,
        type TEXT NOT NULL, -- 'gemini', 'openai', 'tesseract', 'custom'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, () => {
        // Seed default models if table is empty
        db.get('SELECT COUNT(*) as count FROM ai_models', [], (err, row) => {
          if (!err && row && row.count === 0) {
            const defaultModels = [
              ['Gemini Pro - Standard English v2', 'deployed', 98.5, 240, 1200000, 24.5, 'gemini'],
              ['OpenAI GPT-4 Omni (Standard)', 'deployed', 97.8, 850, 450000, 0, 'openai'],
              ['Multilingual Asian (Vertical)', 'deployed', 95.2, 410, 345000, 12.2, 'custom'],
              ['Healthcare / Medical Scans Exp', 'training', 0, 0, 0, 8.4, 'custom'],
              ['Legacy Tesseract OCR Backup', 'paused', 82.1, 80, 45000, 0.5, 'tesseract']
            ];
            const insertStmt = `INSERT INTO ai_models (name, status, accuracy, latency_ms, calls_30d, vram_gb, type) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            defaultModels.forEach(m => db.run(insertStmt, m));
          }
        });
      });

      // API Sandbox calls log
      db.run(`CREATE TABLE IF NOT EXISTS api_sandbox_calls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        payload TEXT,
        response TEXT,
        status_code INTEGER,
        latency_ms INTEGER,
        engine TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // AI Drafts table
      db.run(`CREATE TABLE IF NOT EXISTS ai_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        contact_id INTEGER,
        contact_name TEXT,
        subject TEXT,
        body TEXT,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Extend ai_drafts for follow-up composer (safe for existing DBs)
      db.run("ALTER TABLE ai_drafts ADD COLUMN contact_email TEXT", () => {});
      db.run("ALTER TABLE ai_drafts ADD COLUMN tone TEXT DEFAULT 'professional'", () => {});
      db.run("ALTER TABLE ai_drafts ADD COLUMN version INTEGER DEFAULT 1", () => {});
      db.run("ALTER TABLE ai_drafts ADD COLUMN sent_at DATETIME", () => {});

      // Workspace Chats table
      db.run(`CREATE TABLE IF NOT EXISTS workspace_chats (
        id TEXT PRIMARY KEY,
        workspace_id TEXT,
        user_name TEXT,
        message TEXT,
        color TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Digital Cards table
      db.run(`CREATE TABLE IF NOT EXISTS digital_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        url_slug TEXT UNIQUE,
        views INTEGER DEFAULT 0,
        saves INTEGER DEFAULT 0,
        theme_color TEXT DEFAULT 'indigo',
        design_json TEXT, -- Store AI Style Data
        bio TEXT,
        headline TEXT
      )`);
      // Update existing installations
      db.run("ALTER TABLE digital_cards ADD COLUMN design_json TEXT", () => { });
      db.run("ALTER TABLE digital_cards ADD COLUMN bio TEXT", () => { });
      db.run("ALTER TABLE digital_cards ADD COLUMN headline TEXT", () => { });

      // Routing Rules table
      db.run(`CREATE TABLE IF NOT EXISTS routing_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        condition_field TEXT,
        condition_op TEXT,
        condition_val TEXT,
        action TEXT,
        target TEXT,
        priority TEXT DEFAULT 'medium',
        is_active INTEGER DEFAULT 1
      )`);

      // CRM Mappings table
      db.run(`CREATE TABLE IF NOT EXISTS crm_mappings (
        user_id INTEGER PRIMARY KEY,
        provider TEXT,
        mapping_json TEXT
      )`);

      // Onboarding Preferences table
      db.run(`CREATE TABLE IF NOT EXISTS onboarding_prefs (
        user_id INTEGER PRIMARY KEY,
        preferences_json TEXT
      )`);

      // Email Campaigns table
      db.run(`CREATE TABLE IF NOT EXISTS email_campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        subject TEXT,
        body TEXT,
        target_industry TEXT,
        target_seniority TEXT,
        sent_count INTEGER DEFAULT 0,
        open_rate INTEGER DEFAULT 0,
        click_rate INTEGER DEFAULT 0,
        delivered_count INTEGER DEFAULT 0,
        failed_count INTEGER DEFAULT 0,
        send_mode TEXT DEFAULT 'simulated',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      db.run("ALTER TABLE email_campaigns ADD COLUMN delivered_count INTEGER DEFAULT 0", () => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN failed_count INTEGER DEFAULT 0", () => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN send_mode TEXT DEFAULT 'simulated'", () => { });

      db.run(`CREATE TABLE IF NOT EXISTS campaign_recipients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        contact_id INTEGER,
        email TEXT,
        status TEXT DEFAULT 'queued',
        provider_message_id TEXT,
        error_message TEXT,
        sent_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS workspace_policies (
        workspace_id INTEGER PRIMARY KEY,
        retention_days INTEGER DEFAULT 90,
        pii_redaction_enabled INTEGER DEFAULT 1,
        strict_audit_storage_enabled INTEGER DEFAULT 1,
        updated_by INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS billing_payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        brand TEXT DEFAULT 'card',
        last4 TEXT NOT NULL,
        exp_month INTEGER NOT NULL,
        exp_year INTEGER NOT NULL,
        holder_name TEXT,
        is_primary INTEGER DEFAULT 0,
        is_backup INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS billing_invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        invoice_number TEXT UNIQUE,
        amount_cents INTEGER DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'paid',
        issued_at DATETIME,
        receipt_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Billing orders for Razorpay (plan upgrades)
      db.run(`CREATE TABLE IF NOT EXISTS billing_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        workspace_id INTEGER NOT NULL,
        plan_id TEXT NOT NULL,
        amount_paise INTEGER NOT NULL,
        currency TEXT DEFAULT 'INR',
        razorpay_order_id TEXT,
        razorpay_payment_id TEXT,
        razorpay_signature TEXT,
        status TEXT DEFAULT 'created', -- created, paid, failed
        simulated INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(razorpay_order_id)
      )`);

      // Integration sync jobs table (failed-sync + retry queue)
      db.run(`CREATE TABLE IF NOT EXISTS integration_sync_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        workspace_id INTEGER,
        provider TEXT NOT NULL,
        contact_count INTEGER DEFAULT 0,
        payload_json TEXT,
        status TEXT DEFAULT 'queued', -- queued, processing, succeeded, failed, retry_queued
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        last_error TEXT,
        last_attempt_at DATETIME,
        next_retry_at DATETIME,
        succeeded_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, () => {
        db.run(`INSERT OR IGNORE INTO integration_sync_jobs
          (id, user_id, workspace_id, provider, contact_count, payload_json, status, retry_count, max_retries, last_error, last_attempt_at, created_at, updated_at)
          VALUES
          (1, 1, 1, 'salesforce', 42, '{"seeded":true}', 'failed', 1, 3, '429 from remote CRM API', datetime('now','-32 minutes'), datetime('now','-35 minutes'), datetime('now','-32 minutes'))`);
        db.run(`INSERT OR IGNORE INTO integration_sync_jobs
          (id, user_id, workspace_id, provider, contact_count, payload_json, status, retry_count, max_retries, last_attempt_at, succeeded_at, created_at, updated_at)
          VALUES
          (2, 1, 1, 'hubspot', 18, '{"seeded":true}', 'succeeded', 0, 3, datetime('now','-18 minutes'), datetime('now','-18 minutes'), datetime('now','-18 minutes'), datetime('now','-18 minutes'))`);
        db.run(`INSERT OR IGNORE INTO integration_sync_jobs
          (id, user_id, workspace_id, provider, contact_count, payload_json, status, retry_count, max_retries, last_error, next_retry_at, last_attempt_at, created_at, updated_at)
          VALUES
          (3, 1, 1, 'zoho', 27, '{"seeded":true}', 'retry_queued', 1, 3, 'Webhook timeout from provider', datetime('now','+6 minutes'), datetime('now','-4 minutes'), datetime('now','-10 minutes'), datetime('now','-4 minutes'))`);
      });

      // Data quality dedupe queue table
      db.run(`CREATE TABLE IF NOT EXISTS data_quality_dedupe_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        fingerprint TEXT NOT NULL,
        contact_ids_json TEXT NOT NULL,
        primary_contact_id INTEGER,
        reason TEXT,
        confidence INTEGER DEFAULT 80,
        status TEXT DEFAULT 'pending', -- pending, merged, dismissed
        merged_contact_id INTEGER,
        resolved_by INTEGER,
        resolution_note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(workspace_id, fingerprint)
      )`);

      // Saved Cards table (AI Card Creator)
      db.run(`CREATE TABLE IF NOT EXISTS saved_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        card_data TEXT NOT NULL,
        design_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // ════ CRM & DEALS TABLES ════
      db.run(`CREATE TABLE IF NOT EXISTS deals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        workspace_id INTEGER,
        stage TEXT DEFAULT 'Prospect', -- Prospect, Qualified, Proposal, Closed
        value REAL DEFAULT 0,
        expected_close DATETIME,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);
      // Required for the `ON CONFLICT(contact_id)` upsert in the deal update endpoint.
      db.run(`CREATE UNIQUE INDEX IF NOT EXISTS deals_contact_id_unique ON deals(contact_id)`);

      db.run(`CREATE TABLE IF NOT EXISTS webhooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        workspace_id INTEGER,
        url TEXT NOT NULL,
        event_type TEXT DEFAULT 'on_scan', -- on_scan, on_deal_update
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // ════ ALTER EXISTING TABLES for CRM ════
      db.run("ALTER TABLE contacts ADD COLUMN deal_score INTEGER DEFAULT 0", () => {});
      db.run("ALTER TABLE contacts ADD COLUMN deal_status TEXT DEFAULT 'None'", () => {});
      db.run("ALTER TABLE contacts ADD COLUMN linkedin_url TEXT", () => {});
      db.run("ALTER TABLE contacts ADD COLUMN linkedin_photo TEXT", () => {});
      db.run("ALTER TABLE contacts ADD COLUMN linkedin_bio TEXT", () => {});
      db.run("ALTER TABLE contacts ADD COLUMN ai_enrichment_news TEXT", () => {});
      db.run("ALTER TABLE contacts ADD COLUMN inferred_industry TEXT", () => {});
      db.run("ALTER TABLE contacts ADD COLUMN inferred_seniority TEXT", () => {});
      db.run("ALTER TABLE contacts ADD COLUMN search_vector TEXT", () => {});

      // Persistent audit trail table for security-sensitive actions
      db.run(`CREATE TABLE IF NOT EXISTS audit_trail (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_user_id INTEGER,
        actor_email TEXT,
        actor_role TEXT,
        action TEXT NOT NULL,
        resource TEXT,
        status TEXT DEFAULT 'SUCCESS',
        ip_address TEXT,
        user_agent TEXT,
        details_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // ════ AI AUTOMATION TABLES (SEQUENCES) ════
      db.run(`CREATE TABLE IF NOT EXISTS email_sequences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'active', -- active, paused, archived
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS email_sequence_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sequence_id INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        subject TEXT NOT NULL,
        html_body TEXT NOT NULL,
        delay_days INTEGER DEFAULT 0,
        FOREIGN KEY(sequence_id) REFERENCES email_sequences(id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS contact_sequences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        sequence_id INTEGER NOT NULL,
        status TEXT DEFAULT 'active', -- active, completed, stopped
        current_step_index INTEGER DEFAULT 0,
        next_send_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY(sequence_id) REFERENCES email_sequences(id) ON DELETE CASCADE
      )`);

      // ════ EMAIL MARKETING TABLES ════
      db.run(`CREATE TABLE IF NOT EXISTS email_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'static',
        segment_rules TEXT,
        contact_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS email_list_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id INTEGER NOT NULL,
        contact_id INTEGER,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        company TEXT,
        subscribed INTEGER DEFAULT 1,
        unsubscribed_at DATETIME,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(list_id) REFERENCES email_lists(id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS email_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        html_body TEXT NOT NULL,
        text_body TEXT,
        category TEXT DEFAULT 'general',
        thumbnail TEXT,
        is_shared INTEGER DEFAULT 0,
        variables TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`, () => {
        db.get('SELECT COUNT(*) as cnt FROM email_templates WHERE is_shared=1', [], (e, r) => {
          if (!e && (!r || r.cnt === 0)) {
            const welcomeHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center"><h1 style="color:#fff;margin:0;font-size:24px">Welcome Aboard! 🎉</h1></div>
              <div style="padding:32px"><p style="color:#374151;font-size:16px;line-height:1.6">Hi {{first_name}},</p><p style="color:#374151;font-size:16px;line-height:1.6">We are thrilled to have you join us. Here is how to get started:</p>
              <ul style="color:#374151;font-size:15px;line-height:2"><li>Complete your profile</li><li>Scan your first business card</li><li>Connect with your team</li></ul>
              <div style="text-align:center;margin:32px 0"><a href="#" style="background:#6366f1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">Get Started →</a></div></div>
              <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af"><a href="{{unsubscribe_link}}" style="color:#9ca3af">Unsubscribe</a></div></div>`;
            db.run('INSERT INTO email_templates (user_id, name, subject, html_body, text_body, category, is_shared) VALUES (1, "Welcome Email", "Welcome to IntelliScan, {{first_name}}!", ?, "Welcome to IntelliScan!", "welcome", 1)', [welcomeHtml]);
          }
        });
      });

      db.run("ALTER TABLE email_campaigns ADD COLUMN preview_text TEXT", (err) => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN from_name TEXT", (err) => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN from_email TEXT", (err) => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN reply_to TEXT", (err) => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN html_body TEXT", (err) => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN text_body TEXT", (err) => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN template_id INTEGER", (err) => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN list_ids TEXT", (err) => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN status TEXT DEFAULT 'draft'", (err) => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN scheduled_at DATETIME", (err) => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN sent_at DATETIME", (err) => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN total_recipients INTEGER DEFAULT 0", (err) => { });
      db.run("ALTER TABLE email_campaigns ADD COLUMN workspace_id INTEGER", (err) => { });

      db.run(`CREATE TABLE IF NOT EXISTS email_sends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        first_name TEXT,
        status TEXT DEFAULT 'pending',
        sent_at DATETIME,
        opened_at DATETIME,
        open_count INTEGER DEFAULT 0,
        clicked_at DATETIME,
        click_count INTEGER DEFAULT 0,
        bounced_at DATETIME,
        bounce_reason TEXT,
        unsubscribed_at DATETIME,
        tracking_id TEXT UNIQUE,
        FOREIGN KEY(campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS email_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        send_id INTEGER NOT NULL,
        campaign_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(send_id) REFERENCES email_sends(id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS email_automations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        trigger_type TEXT NOT NULL,
        trigger_config TEXT,
        status TEXT DEFAULT 'inactive',
        steps TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // ════ CALENDAR SYSTEM TABLES ════
      db.run(`CREATE TABLE IF NOT EXISTS calendars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        workspace_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#7b2fff',
        is_primary INTEGER DEFAULT 0,
        is_shared INTEGER DEFAULT 0,
        shared_with TEXT,
        timezone TEXT DEFAULT 'UTC',
        is_visible INTEGER DEFAULT 1,
        type TEXT DEFAULT 'personal',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS calendar_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        calendar_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        all_day INTEGER DEFAULT 0,
        color TEXT,
        status TEXT DEFAULT 'confirmed',
        visibility TEXT DEFAULT 'default',
        recurrence_rule TEXT,
        recurrence_id TEXT,
        original_start DATETIME,
        is_recurring_exception INTEGER DEFAULT 0,
        parent_event_id INTEGER,
        conference_link TEXT,
        conference_type TEXT,
        timezone TEXT DEFAULT 'UTC',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(calendar_id) REFERENCES calendars(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS event_attendees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        name TEXT,
        status TEXT DEFAULT 'pending',
        is_organizer INTEGER DEFAULT 0,
        response_token TEXT UNIQUE,
        responded_at DATETIME,
        notified_at DATETIME,
        FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS event_reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        method TEXT DEFAULT 'email',
        minutes_before INTEGER NOT NULL,
        sent_at DATETIME,
        FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS calendar_shares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        calendar_id INTEGER NOT NULL,
        shared_with_email TEXT NOT NULL,
        shared_with_user_id INTEGER,
        permission TEXT DEFAULT 'view',
        accepted INTEGER DEFAULT 0,
        share_token TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(calendar_id) REFERENCES calendars(id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS event_contact_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        contact_id INTEGER NOT NULL,
        link_type TEXT DEFAULT 'attendee',
        FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS availability_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_available INTEGER DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS booking_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        duration_minutes INTEGER DEFAULT 30,
        buffer_minutes INTEGER DEFAULT 0,
        max_bookings_per_day INTEGER DEFAULT 8,
        color TEXT DEFAULT '#7b2fff',
        questions TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // CRM Mappings — stores field mapping config per workspace per provider
      db.run(`CREATE TABLE IF NOT EXISTS crm_mappings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        provider TEXT NOT NULL,
        field_mappings TEXT NOT NULL,
        custom_fields TEXT DEFAULT '[]',
        is_connected INTEGER DEFAULT 0,
        connected_at DATETIME,
        last_sync DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(workspace_id, provider)
      )`);

      // CRM Sync Log — stores activity log entries per workspace
      db.run(`CREATE TABLE IF NOT EXISTS crm_sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        provider TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // AI Models — stores configuration and health for AI engines
      db.run(`CREATE TABLE IF NOT EXISTS ai_models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        vram_gb REAL DEFAULT 0,
        status TEXT DEFAULT 'deployed',
        accuracy REAL DEFAULT 0,
        latency_ms INTEGER DEFAULT 0,
        calls_30d INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, () => {
        db.get('SELECT COUNT(*) as count FROM ai_models', [], (err, row) => {
          if (!err && row && row.count === 0) {
            db.run("INSERT INTO ai_models (name, type, status, accuracy, latency_ms, calls_30d) VALUES ('Gemini 1.5 Flash', 'gemini', 'deployed', 98.5, 450, 1250)");
            db.run("INSERT INTO ai_models (name, type, status, accuracy, latency_ms, calls_30d) VALUES ('OpenAI GPT-4o-mini', 'openai', 'deployed', 97.2, 600, 420)");
            db.run("INSERT INTO ai_models (name, type, status, accuracy, latency_ms, calls_30d) VALUES ('Tesseract Local', 'tesseract', 'deployed', 85.0, 1200, 85)");
          }
        });
      });

      // Performance Indexes
      db.run("CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id)", () => {});
      db.run("CREATE INDEX IF NOT EXISTS idx_contacts_workspace_scope ON contacts(workspace_scope)", () => {});
      db.run("CREATE INDEX IF NOT EXISTS idx_email_sends_tracking ON email_sends(tracking_id)", () => {});
      db.run("CREATE INDEX IF NOT EXISTS idx_events_calendar ON calendar_events(calendar_id)", () => {});
      db.run("CREATE INDEX IF NOT EXISTS idx_drafts_contact ON ai_drafts(contact_id)", () => {});
      db.run("CREATE INDEX IF NOT EXISTS idx_chats_workspace ON workspace_chats(workspace_id)", () => {});
      db.run("CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)", () => {});

    });
}

// ── CRM HELPER FUNCTIONS ─────────────────────────────────────────────────────

function getDefaultMappings(provider) {
  // Salesforce and generic defaults
  const common = [
    { iscanField: 'Full Name',       iscanKey: 'name',               crmField: 'Name',            type: 'String',   required: true  },
    { iscanField: 'Company Name',    iscanKey: 'company',            crmField: 'Account Name',    type: 'String',   required: true  },
    { iscanField: 'Job Title',       iscanKey: 'job_title',          crmField: 'Title',           type: 'String',   required: false },
    { iscanField: 'Email Address',   iscanKey: 'email',              crmField: 'Email',           type: 'Email',    required: true  },
    { iscanField: 'Phone Number',    iscanKey: 'phone',              crmField: 'MobilePhone',     type: 'Phone',    required: false },
    { iscanField: 'Website',         iscanKey: 'website',            crmField: 'Website',         type: 'String',   required: false },
    { iscanField: 'Industry (AI)',   iscanKey: 'inferred_industry',  crmField: 'Industry',        type: 'Picklist', required: false, aiEnriched: true },
    { iscanField: 'Seniority (AI)',  iscanKey: 'inferred_seniority', crmField: 'Lead_Level__c',   type: 'Picklist', required: false, aiEnriched: true },
    { iscanField: 'AI Confidence',   iscanKey: 'confidence',         crmField: 'Lead_Score__c',   type: 'Number',   required: false },
  ];

  // Provider-specific CRM field name overrides
  if (provider === 'hubspot') {
    return common.map(f => ({
      ...f,
      crmField: {
        'Name': 'firstname',
        'Account Name': 'company',
        'Title': 'jobtitle',
        'Email': 'email',
        'MobilePhone': 'mobilephone',
        'Website': 'website',
        'Industry': 'industry',
        'Lead_Level__c': 'hs_lead_status',
        'Lead_Score__c': 'hubspotscore',
      }[f.crmField] || f.crmField
    }));
  }

  if (provider === 'zoho') {
    return common.map(f => ({
      ...f,
      crmField: {
        'Name': 'Full_Name',
        'Account Name': 'Account_Name',
        'Title': 'Title',
        'Email': 'Email',
        'MobilePhone': 'Mobile',
        'Website': 'Website',
        'Industry': 'Industry',
        'Lead_Level__c': 'Lead_Source',
        'Lead_Score__c': 'Rating',
      }[f.crmField] || f.crmField
    }));
  }

  if (provider === 'pipedrive') {
    return common.map(f => ({
      ...f,
      crmField: {
        'Name': 'name',
        'Account Name': 'org_name',
        'Title': 'title',
        'Email': 'email',
        'MobilePhone': 'phone',
        'Website': 'website',
        'Industry': 'industry',
        'Lead_Level__c': 'label',
        'Lead_Score__c': 'value',
      }[f.crmField] || f.crmField
    }));
  }

  return common; // default = Salesforce
}


function getCrmSchema(provider) {
  // Returns the list of fields available in each CRM
  const schemas = {
    salesforce: [
      'Name', 'Account Name', 'Title', 'Email', 'MobilePhone', 'Phone', 'Website',
      'Industry', 'Lead_Level__c', 'Lead_Score__c', 'LinkedIn_URL__c',
      'Description', 'LeadSource', 'Status', 'Rating', 'AnnualRevenue',
      'NumberOfEmployees', 'Country', 'City', 'Street', 'PostalCode', 'State',
      'Custom_Field_1__c', 'Custom_Field_2__c', 'Custom_Field_3__c',
      '-- Do not sync --'
    ],
    hubspot: [
      'firstname', 'lastname', 'company', 'jobtitle', 'email', 'mobilephone',
      'phone', 'website', 'industry', 'hs_lead_status', 'hubspotscore',
      'linkedin_bio', 'description', 'num_employees', 'annualrevenue',
      'country', 'city', 'address', 'zip', 'state',
      '-- Do not sync --'
    ],
    zoho: [
      'Full_Name', 'Account_Name', 'Title', 'Email', 'Mobile', 'Phone',
      'Website', 'Industry', 'Lead_Source', 'Rating', 'LinkedIn_Id',
      'Description', 'No_of_Employees', 'Annual_Revenue',
      'Country', 'City', 'Street', 'Zip_Code', 'State',
      '-- Do not sync --'
    ],
    pipedrive: [
      'name', 'org_name', 'title', 'email', 'phone', 'website',
      'industry', 'label', 'value', 'notes',
      'address_country', 'address_city', 'address_street',
      '-- Do not sync --'
    ]
  };
  return schemas[provider] || schemas.salesforce;
}

// Express-validator helper middleware
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

// ==========================================
// ROUTES
// ==========================================

// Register
app.post(
  '/api/auth/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Deliver a valid email').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('role').optional().isIn(['user', 'admin', 'business_admin', 'super_admin']).withMessage('Invalid role')
  ],
  validateRequest,
  async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'user';

    db.run(
      "INSERT INTO users (name, email, password, role, tier) VALUES (?, ?, ?, ?, 'personal')",
      [name, email, hashedPassword, userRole],
      async function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            logAuditEvent(req, {
              action: 'USER_REGISTER',
              resource: '/api/auth/register',
              status: AUDIT_DENIED,
              actorEmail: email,
              actorRole: userRole,
              details: { reason: 'email_exists' }
            });
            return res.status(400).json({ error: 'Email already exists' });
          }
          logAuditEvent(req, {
            action: 'USER_REGISTER',
            resource: '/api/auth/register',
            status: AUDIT_ERROR,
            actorEmail: email,
            actorRole: userRole,
            details: { db_error: err.message }
          });
          return res.status(500).json({ error: err.message });
        }

        try {
          await ensureQuotaRow(this.lastID, 'personal');
          // Create primary calendar for new user
          await dbRunAsync(
            `INSERT INTO calendars (user_id, name, color, is_primary, type)
             VALUES (?, 'My Calendar', '#7b2fff', 1, 'personal')`,
            [this.lastID]
          );
        } catch (quotaErr) {
          console.error('Initial setup failed on register:', quotaErr.message);
        }

        const token = jwt.sign(
          { id: this.lastID, email, name, role: userRole, tier: 'personal' },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, name, email, role: userRole, tier: 'personal' }
        });

        logAuditEvent(req, {
          action: 'USER_REGISTER',
          resource: '/api/auth/register',
          status: AUDIT_SUCCESS,
          actorUserId: this.lastID,
          actorEmail: email,
          actorRole: userRole,
          details: { tier: 'personal' }
        });
      }
    );
  } catch (error) {
    logAuditEvent(req, {
      action: 'USER_REGISTER',
      resource: '/api/auth/register',
      status: AUDIT_ERROR,
      actorEmail: email,
      actorRole: role || 'user',
      details: { server_error: error.message }
    });
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post(
  '/api/auth/login',
  [
    body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      logAuditEvent(req, {
        action: 'USER_LOGIN',
        resource: '/api/auth/login',
        status: AUDIT_ERROR,
        actorEmail: email,
        details: { db_error: err.message }
      });
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      logAuditEvent(req, {
        action: 'USER_LOGIN',
        resource: '/api/auth/login',
        status: AUDIT_DENIED,
        actorEmail: email,
        details: { reason: 'user_not_found' }
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logAuditEvent(req, {
        action: 'USER_LOGIN',
        resource: '/api/auth/login',
        status: AUDIT_DENIED,
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        details: { reason: 'invalid_password' }
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, tier: user.tier || 'personal' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Session tracking on login
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || 'Unknown IP';
    const location = 'Unknown Location'; // Placeholder, could use a geo-ip service

    db.run(
      'INSERT INTO sessions (user_id, token, device_info, ip_address, location, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [user.id, token, deviceInfo, ipAddress, location],
      async function (sessionErr) {
        if (sessionErr) {
          console.error('Error inserting session:', sessionErr.message);
          // Log the error but don't prevent login if session tracking fails
        }
        try {
          await ensureQuotaRow(user.id, user.tier || 'personal');
        } catch (quotaErr) {
          console.error('Quota bootstrap failed on login:', quotaErr.message);
        }
        res.json({
          message: 'Logged in successfully',
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role, tier: user.tier || 'personal' }
        });

        logAuditEvent(req, {
          action: 'USER_LOGIN',
          resource: '/api/auth/login',
          status: AUDIT_SUCCESS,
          actorUserId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          details: { session_created: !sessionErr, tier: user.tier || 'personal' }
        });
      }
    );
  });
});

// Get Current User Info
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, name, email, role, tier, workspace_id FROM users WHERE id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// User Quota Tracker
app.get('/api/user/quota', authenticateToken, async (req, res) => {
  try {
    const row = await dbGetAsync(
      `SELECT u.tier, q.used_count as used, q.limit_amount as "limit", q.group_scans_used
       FROM users u
       LEFT JOIN user_quotas q ON u.id = q.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    const tier = row?.tier || 'personal';
    await ensureQuotaRow(req.user.id, tier);
    const quota = await dbGetAsync('SELECT used_count, limit_amount, group_scans_used FROM user_quotas WHERE user_id = ?', [req.user.id]);
    const limits = resolveTierLimits(tier);

    res.json({
      tier,
      used: Number(quota?.used_count || 0),
      limit: Number(quota?.limit_amount || limits.single),
      group_scans_used: Number(quota?.group_scans_used || 0),
      group_scans_limit: Number(limits.group)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/access/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGetAsync('SELECT role, tier FROM users WHERE id = ?', [req.user.id]);
    const profile = buildAccessProfile(user?.role || req.user.role || 'user', user?.tier || req.user.tier || 'personal');
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/access/matrix', authenticateToken, (req, res) => {
  res.json({
    profiles: {
      free_personal_user: buildAccessProfile('user', 'personal'),
      pro_personal_user: buildAccessProfile('user', 'pro'),
      enterprise_user: buildAccessProfile('user', 'enterprise'),
      enterprise_admin: buildAccessProfile('business_admin', 'enterprise'),
      super_admin_user: buildAccessProfile('super_admin', 'enterprise')
    }
  });
});

// ════ WORKSPACE MANAGEMENT (MODULAR) ════
app.use('/api/workspaces', require('./src/routes/workspaceRoutes'));
app.use('/api/workspace', require('./src/routes/workspaceRoutes'));




// Workspace Invitation Routes

// Simulate upgrade (Development Only)
app.post('/api/user/simulate-upgrade', authenticateToken, (req, res) => {
  const { plan = 'enterprise' } = req.body; // Default to enterprise if not specified
  const targetTier = plan === 'pro' ? 'pro' : 'enterprise';

  db.run(`UPDATE users SET tier = ? WHERE id = ?`, [targetTier, req.user.id], (err) => {
    if (err) {
      logAuditEvent(req, {
        action: 'ACCOUNT_TIER_UPDATE',
        resource: '/api/user/simulate-upgrade',
        status: AUDIT_ERROR,
        details: { target_tier: targetTier, error: err.message }
      });
      return res.status(500).json({ error: err.message });
    }

    const targetLimit = targetTier === 'enterprise' ? 99999 : (targetTier === 'pro' ? 100 : 10);
    db.run('INSERT OR IGNORE INTO user_quotas (user_id, used_count, limit_amount, group_scans_used) VALUES (?, 0, ?, 0)', [req.user.id, targetLimit]);
    db.run('UPDATE user_quotas SET limit_amount = ? WHERE user_id = ?', [targetLimit, req.user.id]);

    console.log(`🚀 User ${req.user.id} upgraded to ${targetTier.toUpperCase()} via simulation.`);
    logAuditEvent(req, {
      action: 'ACCOUNT_TIER_UPDATE',
      resource: '/api/user/simulate-upgrade',
      status: AUDIT_SUCCESS,
      details: { target_tier: targetTier, limit_amount: targetLimit }
    });
    res.json({ success: true, message: `Account upgraded to ${targetTier.toUpperCase()}!` });
  });
});

// ==========================================
// BILLING (Razorpay)
// ==========================================

// Public plan catalog for the BillingPage UI
app.get('/api/billing/plans', (req, res) => {
  res.json({ plans: BILLING_PLANS });
});

// Create a Razorpay order (or return simulated order if keys are missing)
app.post('/api/billing/create-order', authenticateToken, async (req, res) => {
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
    let simulated = false;
    let orderId = '';
    let keyId = '';
    let finalAmount = amountPaise;
    let finalCurrency = currency;

    if (!creds) {
      simulated = true;
      orderId = `sim_order_${Date.now()}`;
    } else {
      const order = await createRazorpayOrder({ amountPaise, currency, receipt, notes });
      orderId = order.id;
      finalAmount = Number(order.amount || amountPaise);
      finalCurrency = String(order.currency || currency);
      keyId = creds.keyId;
    }

    await dbRunAsync(
      `INSERT INTO billing_orders
        (user_id, workspace_id, plan_id, amount_paise, currency, razorpay_order_id, status, simulated)
       VALUES (?, ?, ?, ?, ?, ?, 'created', ?)`,
      [req.user.id, scopeWorkspaceId, plan.id, finalAmount, finalCurrency, orderId, simulated ? 1 : 0]
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
});

// Verify payment signature and upgrade the user's tier
app.post('/api/billing/verify-payment', authenticateToken, async (req, res) => {
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

    if (!simulated) {
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

    // Create a billing invoice row (minor-units stored in amount_cents field)
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

    // Fetch fresh user and issue a new token reflecting the upgraded tier
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
});

// ==========================================
// ════ CRM MAPPING ENDPOINTS ════
// ==========================================

// GET /api/crm/config — Fetch saved mapping for a provider
app.get('/api/crm/config', authenticateToken, (req, res) => {
  const { provider } = req.query;
  if (!provider) return res.status(400).json({ error: 'provider query param required' });

  const user = req.user;

  // Get workspace_id from the users table
  db.get('SELECT workspace_id FROM users WHERE id = ?', [user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });

    const workspaceId = userRow.workspace_id || user.id; // fallback to user id if no workspace

    db.get(
      'SELECT * FROM crm_mappings WHERE workspace_id = ? AND provider = ?',
      [workspaceId, provider],
      (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });

        if (!row) {
          // Return defaults for this provider if no saved config
          return res.json({
            provider,
            is_connected: false,
            field_mappings: getDefaultMappings(provider),
            custom_fields: [],
            last_sync: null
          });
        }

        res.json({
          provider: row.provider,
          is_connected: !!row.is_connected,
          field_mappings: JSON.parse(row.field_mappings),
          custom_fields: JSON.parse(row.custom_fields || '[]'),
          last_sync: row.last_sync
        });
      }
    );
  });
});

// POST /api/crm/config — Save field mapping
app.post('/api/crm/config', authenticateToken, (req, res) => {
  const { provider, field_mappings, custom_fields } = req.body;
  if (!provider || !field_mappings) {
    return res.status(400).json({ error: 'provider and field_mappings are required' });
  }

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    db.run(
      `INSERT INTO crm_mappings (workspace_id, provider, field_mappings, custom_fields, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(workspace_id, provider) DO UPDATE SET
         field_mappings = excluded.field_mappings,
         custom_fields = excluded.custom_fields,
         updated_at = CURRENT_TIMESTAMP`,
      [workspaceId, provider, JSON.stringify(field_mappings), JSON.stringify(custom_fields || [])],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });

        // Log the save action
        db.run(
          'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
          [workspaceId, provider, 'success', `Mapping configuration saved. ${field_mappings.length} fields configured.`]
        );

        res.json({ success: true, message: 'Mapping saved successfully' });
      }
    );
  });
});

// POST /api/crm/connect — Simulate CRM connection (OAuth placeholder)
app.post('/api/crm/connect', authenticateToken, (req, res) => {
  const { provider } = req.body;
  if (!provider) return res.status(400).json({ error: 'provider is required' });

  const validProviders = ['salesforce', 'hubspot', 'zoho', 'pipedrive'];
  if (!validProviders.includes(provider)) {
    return res.status(400).json({ error: 'Invalid provider' });
  }

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    // Upsert with is_connected = 1
    db.run(
      `INSERT INTO crm_mappings (workspace_id, provider, field_mappings, custom_fields, is_connected, connected_at)
       VALUES (?, ?, ?, '[]', 1, CURRENT_TIMESTAMP)
       ON CONFLICT(workspace_id, provider) DO UPDATE SET
         is_connected = 1,
         connected_at = CURRENT_TIMESTAMP`,
      [workspaceId, provider, JSON.stringify(getDefaultMappings(provider))],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });

        db.run(
          'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
          [workspaceId, provider, 'success', `Connected to ${provider.charAt(0).toUpperCase() + provider.slice(1)} organization.`]
        );

        res.json({ success: true, message: `Connected to ${provider}`, connected_at: new Date().toISOString() });
      }
    );
  });
});

// POST /api/crm/disconnect — Disconnect a CRM provider
app.post('/api/crm/disconnect', authenticateToken, (req, res) => {
  const { provider } = req.body;

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    db.run(
      'UPDATE crm_mappings SET is_connected = 0 WHERE workspace_id = ? AND provider = ?',
      [workspaceId, provider],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });

        db.run(
          'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
          [workspaceId, provider, 'info', `Disconnected from ${provider}.`]
        );

        res.json({ success: true });
      }
    );
  });
});

// GET /api/crm/schema — Fetch schema (available CRM fields)
app.get('/api/crm/schema', authenticateToken, (req, res) => {
  const { provider } = req.query;
  const schema = getCrmSchema(provider || 'salesforce');

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    const workspaceId = (userRow && userRow.workspace_id) || req.user.id;

    db.run(
      'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
      [workspaceId, provider, 'success', `Schema sync completed. ${schema.length} fields available.`]
    );

    res.json({ provider, fields: schema, total: schema.length, synced_at: new Date().toISOString() });
  });
});

// GET /api/crm/sync-log — Fetch activity log
app.get('/api/crm/sync-log', authenticateToken, (req, res) => {
  const { provider, limit = 20 } = req.query;

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    let query = 'SELECT * FROM crm_sync_log WHERE workspace_id = ?';
    let params = [workspaceId];
    if (provider) { query += ' AND provider = ?'; params.push(provider); }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit));

    db.all(query, params, (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(rows);
    });
  });
});

// POST /api/crm/export/:provider — Generate and download CSV with field mapping applied
app.post('/api/crm/export/:provider', authenticateToken, (req, res) => {
  const provider = req.params.provider;

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    // Load saved field mapping for this provider
    db.get(
      'SELECT field_mappings, custom_fields FROM crm_mappings WHERE workspace_id = ? AND provider = ?',
      [workspaceId, provider],
      (err2, mappingRow) => {
        const fieldMappings = mappingRow ? JSON.parse(mappingRow.field_mappings) : getDefaultMappings(provider);
        const customFields = mappingRow ? JSON.parse(mappingRow.custom_fields || '[]') : [];
        const allMappings = [...fieldMappings, ...customFields];

        // Fetch workspace contacts
        db.all(
          `SELECT c.*, u.name as scanner_name
           FROM contacts c
           LEFT JOIN users u ON c.user_id = u.id
           WHERE u.workspace_id = ? OR c.user_id = ?
           ORDER BY c.scan_date DESC`,
          [workspaceId, req.user.id],
          (err3, contacts) => {
            if (err3) return res.status(500).json({ error: err3.message });

            // Build CSV with CRM field names as headers
            const activeMappings = allMappings.filter(m => m.crmField && m.crmField !== '-- Do not sync --');

            // CSV header row — use CRM field names
            const headers = activeMappings.map(m => m.crmField);
            const rows = contacts.map(contact => {
              return activeMappings.map(m => {
                const value = contact[m.iscanKey] || '';
                // Escape commas and quotes in CSV
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
              }).join(',');
            });

            const csv = [headers.join(','), ...rows].join('\n');

            // Log the export
            db.run(
              'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
              [workspaceId, provider, 'success', `Export completed. ${contacts.length} contacts exported with ${activeMappings.length} fields.`]
            );

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${provider}-contacts-${Date.now()}.csv"`);
            res.send(csv);
          }
        );
      }
    );
  });
});

// ════ NEW CRM & DEAL ENDPOINTS ════

// GET /api/deals — Pipeline board feed (contacts + deal fields)
app.get('/api/deals', authenticateToken, async (req, res) => {
  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    const workspaceId = userRow?.workspace_id || null;

    const rows = workspaceId
      ? await dbAllAsync(
        `SELECT
           c.id as id,
           c.user_id,
           c.name,
           c.email,
           c.phone,
           c.company,
           c.job_title,
           c.scan_date,
           c.confidence,
           COALESCE(d.stage, c.deal_status, 'Prospect') as deal_status,
           COALESCE(d.value, 0) as deal_value,
           d.expected_close as deal_date,
           d.notes as deal_notes,
           u.name as scanner_name
         FROM contacts c
         JOIN users u ON c.user_id = u.id
         LEFT JOIN deals d ON d.contact_id = c.id
         WHERE u.workspace_id = ?
         ORDER BY datetime(c.scan_date) DESC, c.id DESC`,
        [workspaceId]
      )
      : await dbAllAsync(
        `SELECT
           c.id as id,
           c.user_id,
           c.name,
           c.email,
           c.phone,
           c.company,
           c.job_title,
           c.scan_date,
           c.confidence,
           COALESCE(d.stage, c.deal_status, 'Prospect') as deal_status,
           COALESCE(d.value, 0) as deal_value,
           d.expected_close as deal_date,
           d.notes as deal_notes,
           u.name as scanner_name
         FROM contacts c
         JOIN users u ON c.user_id = u.id
         LEFT JOIN deals d ON d.contact_id = c.id
         WHERE c.user_id = ?
         ORDER BY datetime(c.scan_date) DESC, c.id DESC`,
        [req.user.id]
      );

    res.json({ deals: rows || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/contacts/:id/deal — Update deal stage/value
app.put('/api/contacts/:id/deal', authenticateToken, async (req, res) => {
  const { stage, value, notes, expected_close } = req.body;
  const contactId = req.params.id;

  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    const workspaceId = userRow.workspace_id || req.user.id;

    // Upsert into deals table
    await dbRunAsync(`
      INSERT INTO deals (contact_id, user_id, workspace_id, stage, value, notes, expected_close, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(contact_id) DO UPDATE SET
        stage = excluded.stage,
        value = excluded.value,
        notes = excluded.notes,
        expected_close = excluded.expected_close,
        updated_at = CURRENT_TIMESTAMP
    `, [contactId, req.user.id, workspaceId, stage, value || 0, notes || '', expected_close || null]);

    // Also update contact's deal_status for quick lookup
    await dbRunAsync('UPDATE contacts SET deal_status = ? WHERE id = ?', [stage, contactId]);

    // Trigger webhook if active
    triggerWebhook(workspaceId, 'on_deal_update', { contactId, stage, value });

    res.json({ success: true, message: 'Deal updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/contacts/:id/enrich — Use AI to research and enrich contact data
app.post('/api/contacts/:id/enrich', authenticateToken, async (req, res) => {
  const contactId = req.params.id;
  try {
    const contact = await dbGetAsync('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [contactId, req.user.id]);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const contactData = JSON.parse(contact.json_data || '{}');
    const name = contactData.name || contact.name || 'Unknown';
    const company = contactData.company || contact.company || 'Unknown';
    const title = contactData.title || contact.title || '';

    const enrichmentPrompt = `As a professional AI research assistant, research and provide a detailed professional profile for:
Name: ${name}
Company: ${company}
Job Title: ${title}

Provide the following in VALID JSON format:
{
  "bio": "A professional 1-paragraph summary (max 60 words) of their likely recent experience and expertise.",
  "latest_news": "A summary of recent news or industry trends regarding their company or role.",
  "industry": "One of: Technology, Finance, Healthcare, Real Estate, Manufacturing, Education, Retail, Other.",
  "seniority": "One of: CXO / Founder, VP / Director, Senior, Mid-Level, Entry-Level."
}

Use your training data to suggest the most likely and professional details based on these identifiers. Return ONLY the JSON.`;

    const enrichmentText = await generateWithFallback(enrichmentPrompt);
    let enriched = {};
    try {
      const jsonMatch = enrichmentText.match(/\{[\s\S]*\}/);
      enriched = JSON.parse(jsonMatch ? jsonMatch[0] : enrichmentText);
    } catch (e) {
      console.warn('AI Enrichment JSON parse failed, using raw text');
    }

    await dbRunAsync(`
      UPDATE contacts SET 
        linkedin_bio = ?, 
        ai_enrichment_news = ?, 
        inferred_industry = ?, 
        inferred_seniority = ? 
      WHERE id = ?`,
      [enriched.bio || '', enriched.latest_news || '', enriched.industry || '', enriched.seniority || '', contactId]
    );

    res.json({ success: true, message: 'Contact enriched successfully', data: enriched });
  } catch (err) {
    console.error('Enrichment Error:', err);
    res.status(500).json({ error: 'Failed to enrich contact via AI' });
  }
});

// GET /api/admin/leaderboard — Team performance stats
app.get('/api/admin/leaderboard', authenticateToken, async (req, res) => {
  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    const workspaceId = userRow.workspace_id || req.user.id;

    const rankings = await dbAllAsync(`
      SELECT 
        u.name, 
        u.email,
        COUNT(c.id) as total_scans,
        SUM(CASE WHEN c.deal_status = 'Closed' THEN 1 ELSE 0 END) as deals_closed,
        SUM(d.value) as pipeline_value
      FROM users u
      LEFT JOIN contacts c ON u.id = c.user_id
      LEFT JOIN deals d ON c.id = d.contact_id
      WHERE u.workspace_id = ? OR u.id = ?
      GROUP BY u.id
      ORDER BY total_scans DESC
    `, [workspaceId, req.user.id]);

    res.json({ success: true, rankings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- WEBHOOK MANAGEMENT ---

app.get('/api/webhooks', authenticateToken, async (req, res) => {
  try {
    const hooks = await dbAllAsync('SELECT * FROM webhooks WHERE user_id = ? OR workspace_id = (SELECT workspace_id FROM users WHERE id = ?)', [req.user.id, req.user.id]);
    res.json({ success: true, hooks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/webhooks', authenticateToken, async (req, res) => {
  const { url, event_type } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    await dbRunAsync(
      'INSERT INTO webhooks (user_id, workspace_id, url, event_type) VALUES (?, ?, ?, ?)',
      [req.user.id, userRow.workspace_id || req.user.id, url, event_type || 'on_scan']
    );
    res.json({ success: true, message: 'Webhook registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/webhooks/:id', authenticateToken, async (req, res) => {
  try {
    await dbRunAsync('DELETE FROM webhooks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to fire webhooks
async function triggerWebhook(workspaceId, eventType, data) {
  try {
    const hooks = await dbAllAsync('SELECT url FROM webhooks WHERE workspace_id = ? AND event_type = ? AND is_active = 1', [workspaceId, eventType]);
    for (const h of hooks) {
      console.log(`[Webhook] Firing ${eventType} to ${h.url} with data:`, JSON.stringify(data).substring(0, 50) + '...');
      // In a real app, use axios.post(h.url, data)
    }
  } catch (err) {
    console.error('Webhook trigger failed:', err.message);
  }
}

// --- SEMANTIC SEARCH UTILITIES ---

async function generateEmbedding(text) {
  try {
    const apiKey = process.env.GEMINI_API_KEY; // Reuse Gemini key for embeddings
    if (!apiKey) return null;
    
    // Using a simple fetch for the Google Embedding API to keep it lightweight
    const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/embedding-001",
        content: { parts: [{ text }] }
      })
    });
    const json = await response.json();
    return json.embedding?.values || null;
  } catch (err) {
    console.error('Embedding Generation Error:', err.message);
    return null;
  }
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  if (mA === 0 || mB === 0) return 0;
  return dotProduct / (mA * mB);
}

// GET /api/contacts/semantic-search — Natural language search for contacts
app.get('/api/contacts/semantic-search', authenticateToken, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query "q" is required' });

  try {
    // 1. Generate embedding for query
    const queryVector = await generateEmbedding(q);
    if (!queryVector) return res.status(503).json({ error: 'Embedding engine unavailable' });

    // 2. Fetch all contacts with vectors for this user
    const contacts = await dbAllAsync('SELECT * FROM contacts WHERE user_id = ? AND search_vector IS NOT NULL', [req.user.id]);
    
    // 3. Rank by similarity
    const results = contacts
      .map(c => {
        try {
          const contactVector = JSON.parse(c.search_vector);
          const score = cosineSimilarity(queryVector, contactVector);
          return { ...c, similarity_score: score };
        } catch (e) {
          return { ...c, similarity_score: 0 };
        }
      })
      .filter(c => c.similarity_score > 0.6) // Threshold for relevance
      .sort((a, b) => b.similarity_score - a.similarity_score);

    res.json({ success: true, results: results.slice(0, 10) }); // Top 10 matches
  } catch (err) {
    console.error('Semantic Search Error:', err);
    res.status(500).json({ error: 'Failed to perform semantic search' });
  }
});

// --- AI EMAIL SEQUENCES API ---

// List all sequences
app.get('/api/email-sequences', authenticateToken, async (req, res) => {
  try {
    const sequences = await dbAllAsync('SELECT * FROM email_sequences WHERE user_id = ?', [req.user.id]);
    res.json(sequences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new sequence with steps
app.post('/api/email-sequences', authenticateToken, async (req, res) => {
  const { name, steps } = req.body; 
  if (!name || !steps || !Array.isArray(steps)) return res.status(400).json({ error: 'Name and steps array required' });

  try {
    const seq = await dbRunAsync('INSERT INTO email_sequences (user_id, name) VALUES (?, ?)', [req.user.id, name]);
    const sequenceId = seq.lastID;

    for (const step of steps) {
      await dbRunAsync(
        'INSERT INTO email_sequence_steps (sequence_id, order_index, subject, html_body, delay_days) VALUES (?, ?, ?, ?, ?)',
        [sequenceId, step.step_number || step.order_index, step.subject, step.template_body || step.html_body, step.delay_days || 0]
      );
    }

    res.json({ success: true, sequenceId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enroll a contact in a sequence
app.post('/api/contacts/:id/enroll-sequence', authenticateToken, async (req, res) => {
  const { sequenceId, sequence_id } = req.body;
  const targetId = sequenceId || sequence_id;
  const contactId = req.params.id;

  try {
    // 1. Get first step info to set initial 'next_send_at'
    const firstStep = await dbGetAsync('SELECT delay_days FROM email_sequence_steps WHERE sequence_id = ? ORDER BY order_index ASC LIMIT 1', [targetId]);
    if (!firstStep) return res.status(400).json({ error: 'Sequence has no steps' });

    const nextSend = new Date();
    nextSend.setDate(nextSend.getDate() + firstStep.delay_days);

    await dbRunAsync(
      'INSERT INTO contact_sequences (contact_id, sequence_id, current_step_index, next_send_at) VALUES (?, ?, ?, ?)',
      [contactId, targetId, 0, nextSend.toISOString()]
    );

    res.json({ success: true, message: 'Contact enrolled in sequence' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BACKGROUND SEQUENCE SCHEDULER ---

async function processPendingSequences() {
  const now = new Date().toISOString();
  try {
    // 1. Find active sequences that are due
    const pending = await dbAllAsync(`
      SELECT cs.*, c.email as contact_email, c.name as contact_name, s.user_id 
      FROM contact_sequences cs
      JOIN contacts c ON cs.contact_id = c.id
      JOIN email_sequences s ON cs.sequence_id = s.id
      WHERE cs.status = 'active' AND cs.next_send_at <= ?
    `, [now]);

    for (const p of pending) {
      // 2. Fetch the current step
      const step = await dbGetAsync(
        'SELECT * FROM email_sequence_steps WHERE sequence_id = ? AND order_index = ?',
        [p.sequence_id, p.current_step_index]
      );

      if (step) {
        // 3. Send Email (using existing Nodemailer logic)
        const smtp = createSmtpTransporterFromEnv();
        if (smtp) {
          await smtp.transporter.sendMail({
            from: process.env.SMTP_FROM || 'no-reply@intelliscan.ai',
            to: p.contact_email,
            subject: step.subject.replace('{{name}}', p.contact_name),
            html: step.html_body.replace('{{name}}', p.contact_name)
          });
          console.log(`[Sequence] Email sent to ${p.contact_email} (Step ${p.current_step_index})`);
        }

        // 4. Update to next step or complete
        const nextStep = await dbGetAsync(
          'SELECT order_index, delay_days FROM email_sequence_steps WHERE sequence_id = ? AND order_index > ? ORDER BY order_index ASC LIMIT 1',
          [p.sequence_id, p.current_step_index]
        );

        if (nextStep) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + nextStep.delay_days);
          await dbRunAsync(
            'UPDATE contact_sequences SET current_step_index = ?, next_send_at = ? WHERE id = ?',
            [nextStep.order_index, nextDate.toISOString(), p.id]
          );
        } else {
          await dbRunAsync("UPDATE contact_sequences SET status = 'completed' WHERE id = ?", [p.id]);
        }
      }
    }
  } catch (err) {
    console.error('Sequence Processing Error:', err.message);
  }
}

// Run scheduler every 15 minutes (disabled during tests to avoid open handle issues)
if (process.env.NODE_ENV !== 'test') {
  setInterval(processPendingSequences, 15 * 60 * 1000);
  processPendingSequences(); // Initial run
}

// ==========================================
// ════ CALENDAR ROUTES ════
// ==========================================

// --- CALENDAR MANAGEMENT ---

app.get('/api/calendar/calendars', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  try {
    const own = await dbAllAsync('SELECT * FROM calendars WHERE user_id = ?', [req.user.id]);
    const shared = await dbAllAsync(`
      SELECT c.* FROM calendars c
      JOIN calendar_shares s ON c.id = s.calendar_id
      WHERE s.shared_with_user_id = ? AND s.accepted = 1
    `, [req.user.id]);
    res.json({ success: true, calendars: [...own, ...shared] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/calendar/calendars', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  const { name, description, color, timezone, type } = req.body;
  if (!name) return res.status(400).json({ error: 'Calendar name is required' });
  try {
    const result = await dbRunAsync(
      'INSERT INTO calendars (user_id, name, description, color, timezone, type) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, name, description, color || '#7b2fff', timezone || 'UTC', type || 'personal']
    );
    const calendar = await dbGetAsync('SELECT * FROM calendars WHERE id = ?', [result.lastID]);
    res.json({ success: true, calendar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/calendar/calendars/:id', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  const { name, description, color, is_visible, timezone } = req.body;
  try {
    await dbRunAsync(
      `UPDATE calendars SET name = ?, description = ?, color = ?, is_visible = ?, timezone = ?
       WHERE id = ? AND user_id = ?`,
      [name, description, color, is_visible, timezone, req.params.id, req.user.id]
    );
    const calendar = await dbGetAsync('SELECT * FROM calendars WHERE id = ?', [req.params.id]);
    res.json({ success: true, calendar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/calendar/calendars/:id', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  try {
    const cal = await dbGetAsync('SELECT is_primary FROM calendars WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (cal?.is_primary) return res.status(400).json({ error: 'Cannot delete primary calendar' });
    await dbRunAsync('DELETE FROM calendars WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/calendar/calendars/:id/share', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  const { email, permission } = req.body;
  const calendarId = req.params.id;
  try {
    const token = crypto.randomBytes(20).toString('hex');
    await dbRunAsync(
      'INSERT INTO calendar_shares (calendar_id, shared_with_email, permission, share_token) VALUES (?, ?, ?, ?)',
      [calendarId, email, permission || 'view', token]
    );

    const smtp = createSmtpTransporterFromEnv();
    if (smtp) {
      const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
      await smtp.transporter.sendMail({
        from: smtp.from,
        to: email,
        subject: `${req.user.name} shared a calendar with you`,
        html: `<p>You've been invited to view/edit a calendar. Click to accept:</p>
               <a href="${serverUrl}/api/calendar/accept-share/${token}">Accept Calendar Invitation</a>`
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/calendar/accept-share/:token', async (req, res) => {
  try {
    const share = await dbGetAsync('SELECT * FROM calendar_shares WHERE share_token = ?', [req.params.token]);
    if (!share) return res.status(404).send('Invalid or expired invitation token.');

    const user = await dbGetAsync('SELECT id FROM users WHERE email = ?', [share.shared_with_email]);
    await dbRunAsync('UPDATE calendar_shares SET accepted = 1, shared_with_user_id = ? WHERE id = ?', [user?.id || null, share.id]);

    res.send('<html><body style="font-family:sans-serif;text-align:center;padding:50px;">' +
             '<h1>Calendar invitation accepted!</h1>' +
             '<p>You can now view this calendar in your IntelliScan dashboard.</p>' +
             '<a href="/">Back to IntelliScan</a></body></html>');
  } catch (err) {
    res.status(500).send('Error accepting invitation.');
  }
});

// --- EVENTS CRUD ---

app.get('/api/calendar/events', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  const { start, end, calendar_ids } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'Start and end ranges are required.' });

  try {
    const calIds = (calendar_ids || '').split(',').filter(Boolean);
    if (calIds.length === 0) return res.json({ success: true, events: [] });

    // 1. Fetch static (non-recurring) events in range
    const placeholders = calIds.map(() => '?').join(',');
    const staticEvents = await dbAllAsync(`
      SELECT * FROM calendar_events
      WHERE calendar_id IN (${placeholders})
      AND recurrence_rule IS NULL
      AND (
        (start_datetime <= ? AND end_datetime >= ?) OR
        (start_datetime >= ? AND start_datetime <= ?)
      )
    `, [...calIds, end, start, start, end]);

    // 2. Fetch recurring events templates
    const recurringTemplates = await dbAllAsync(`
      SELECT * FROM calendar_events
      WHERE calendar_id IN (${placeholders})
      AND recurrence_rule IS NOT NULL
    `, [...calIds]);

    // 3. Expand recurring events
    let expanded = [];
    recurringTemplates.forEach(tpl => {
      expanded = [...expanded, ...expandRecurringEvent(tpl, start, end)];
    });

    // 4. Merge and sort
    const all = [...staticEvents, ...expanded].sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

    res.json({ success: true, events: all });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/calendar/events/:id', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  try {
    const event = await dbGetAsync('SELECT * FROM calendar_events WHERE id = ?', [req.params.id]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const attendees = await dbAllAsync('SELECT * FROM event_attendees WHERE event_id = ?', [req.params.id]);
    const reminders = await dbAllAsync('SELECT * FROM event_reminders WHERE event_id = ?', [req.params.id]);

    res.json({ success: true, event, attendees, reminders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── AI MODEL MANAGEMENT (SUPER ADMIN) ──

app.get('/api/admin/models', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const models = await dbAllAsync('SELECT * FROM ai_models ORDER BY id ASC');
    
    // Calculate aggregate stats
    const stats = {
      activeInference: models.filter(m => m.status === 'deployed').reduce((acc, m) => acc + m.calls_30d, 0),
      avgAccuracy: (models.filter(m => m.status === 'deployed' && m.accuracy > 0).reduce((acc, m) => acc + m.accuracy, 0) / 
                   Math.max(1, models.filter(m => m.status === 'deployed' && m.accuracy > 0).length)).toFixed(1),
      globalLatency: Math.round(models.filter(m => m.status === 'deployed').reduce((acc, m) => acc + m.latency_ms, 0) / 
                    Math.max(1, models.filter(m => m.status === 'deployed').length)),
      vramUsage: models.filter(m => m.status === 'deployed').reduce((acc, m) => acc + m.vram_gb, 0).toFixed(1)
    };

    res.json({ success: true, models, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/models/:id/status', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['deployed', 'training', 'paused'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  try {
    await dbRunAsync('UPDATE ai_models SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/models', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { name, type, vram_gb } = req.body;
  if (!name || !type) {
    return res.status(400).json({ success: false, error: 'Name and type are required' });
  }

  try {
    const result = await dbRunAsync(
      'INSERT INTO ai_models (name, type, vram_gb, status, accuracy, latency_ms, calls_30d) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, type, vram_gb || 0, 'training', 0, 0, 0]
    );
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/calendar/events', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  const {
    calendar_id, title, description, location,
    start_datetime, end_datetime, all_day,
    color, recurrence_rule, conference_link, conference_type,
    timezone, attendees, reminders
  } = req.body;

  if (!title || !start_datetime || !end_datetime) {
    return res.status(400).json({ error: 'Title, start, and end times are required.' });
  }

  try {
    const result = await dbRunAsync(`
      INSERT INTO calendar_events (
        calendar_id, user_id, title, description, location,
        start_datetime, end_datetime, all_day, color,
        recurrence_rule, conference_link, conference_type, timezone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      calendar_id, req.user.id, title, description, location,
      start_datetime, end_datetime, all_day ? 1 : 0, color,
      recurrence_rule ? JSON.stringify(recurrence_rule) : null,
      conference_link, conference_type, timezone || 'UTC'
    ]);

    const eventId = result.lastID;

    // Attendees
    if (Array.isArray(attendees)) {
      const smtp = createSmtpTransporterFromEnv();
      const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
      for (const att of attendees) {
        const token = crypto.randomBytes(16).toString('hex');
        await dbRunAsync(
          'INSERT INTO event_attendees (event_id, email, name, response_token) VALUES (?, ?, ?, ?)',
          [eventId, att.email, att.name, token]
        );
        if (smtp) {
          await smtp.transporter.sendMail({
            from: smtp.from,
            to: att.email,
            subject: `Invitation: ${title}`,
            html: `<p>You are invited to: <strong>${title}</strong></p>
                   <p>Time: ${new Date(start_datetime).toLocaleString()}</p>
                   <p><a href="${serverUrl}/api/calendar/respond/${token}?status=accepted">Accept</a> | 
                      <a href="${serverUrl}/api/calendar/respond/${token}?status=declined">Decline</a></p>`
          }).catch(err => console.error('SMTP Attendee Email Error:', err));
        }
      }
    }

    // Reminders
    if (Array.isArray(reminders)) {
      for (const rem of reminders) {
        await dbRunAsync(
          'INSERT INTO event_reminders (event_id, user_id, method, minutes_before) VALUES (?, ?, ?, ?)',
          [eventId, req.user.id, rem.method || 'email', rem.minutes_before]
        );
      }
    }

    // Notify Creator
    const user = await dbGetAsync('SELECT email, name FROM users WHERE id = ?', [req.user.id]);
    const smtp = createSmtpTransporterFromEnv();
    if (smtp && user) {
      const gCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${new Date(start_datetime).toISOString().replace(/-|:|\.\d\d\d/g, '')}/${new Date(end_datetime).toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(description || '')}&location=${encodeURIComponent(location || '')}`;
      
      await smtp.transporter.sendMail({
        from: smtp.from,
        to: user.email,
        subject: `Event Created: ${title}`,
        html: `
          <div style="font-family:sans-serif; max-width:600px; margin:0 auto; border:1px solid #eee; border-radius:12px; padding:30px;">
            <h2 style="color:#4f46e5; margin-top:0;">Event Scheduled Successfully!</h2>
            <p>Your event <strong>${title}</strong> has been added to your IntelliScan calendar.</p>
            <div style="background:#f9fafb; padding:20px; border-radius:8px; margin:20px 0;">
              <p style="margin:5px 0;"><strong>Time:</strong> ${new Date(start_datetime).toLocaleString()}</p>
              ${location ? `<p style="margin:5px 0;"><strong>Location:</strong> ${location}</p>` : ''}
            </div>
            <a href="${gCalLink}" style="display:inline-block; background:#4f46e5; color:white; padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:bold;">Add to Google Calendar</a>
          </div>`
      }).catch(err => console.error('SMTP Creator Email Error:', err));
    }

    const newEvent = await dbGetAsync('SELECT * FROM calendar_events WHERE id = ?', [eventId]);
    io.emit('calendar:event-created', { event: newEvent });

    res.json({ success: true, event: newEvent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/calendar/events/:id/reschedule', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  const { start_datetime, end_datetime, recurrence_id } = req.body;
  try {
    if (recurrence_id) {
      // Create an exception for this instance of a recurring event
      const original = await dbGetAsync('SELECT * FROM calendar_events WHERE id = ?', [req.params.id]);
      const result = await dbRunAsync(`
        INSERT INTO calendar_events (
          calendar_id, user_id, title, description, location,
          start_datetime, end_datetime, all_day, color,
          recurrence_id, is_recurring_exception, parent_event_id, timezone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `, [
        original.calendar_id, original.user_id, original.title, original.description, original.location,
        start_datetime, end_datetime, original.all_day, original.color,
        recurrence_id, original.id, original.timezone
      ]);
      const newEvent = await dbGetAsync('SELECT * FROM calendar_events WHERE id = ?', [result.lastID]);
      io.emit('calendar:event-updated', { event: newEvent, exception: true });
      return res.json({ success: true, event: newEvent });
    } else {
      await dbRunAsync(
        'UPDATE calendar_events SET start_datetime = ?, end_datetime = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [start_datetime, end_datetime, req.params.id, req.user.id]
      );
      const event = await dbGetAsync('SELECT * FROM calendar_events WHERE id = ?', [req.params.id]);
      io.emit('calendar:event-updated', { event });
      res.json({ success: true, event });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/calendar/events/:id', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  try {
    const result = await dbRunAsync(
      'DELETE FROM calendar_events WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Event not found or unauthorized' });
    }
    io.emit('calendar:event-deleted', { eventId: parseInt(req.params.id) });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/calendar/respond/:token', async (req, res) => {
  const { status } = req.query;
  try {
    const attendee = await dbGetAsync('SELECT * FROM event_attendees WHERE response_token = ?', [req.params.token]);
    if (!attendee) return res.status(404).send('Invalid token.');

    await dbRunAsync(
      'UPDATE event_attendees SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, attendee.id]
    );

    const event = await dbGetAsync('SELECT title, start_datetime FROM calendar_events WHERE id = ?', [attendee.event_id]);
    res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:50px;">
              <h1>Rsvp Updated</h1>
              <p>You have ${status} the invitation to <strong>${event?.title}</strong>.</p>
              <p>Time: ${new Date(event?.start_datetime).toLocaleString()}</p>
              </body></html>`);
  } catch (err) {
    res.status(500).send('Error updating RSVP.');
  }
});

// --- CROSS-ENGINE AI FALLBACK HANDLER ---
async function generateWithFallback(prompt) {
  let aiText = null;

  // 1. Try Gemini
  let geminiKey = process.env.GEMINI_API_KEY;
  let geminiModelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  try {
    const customConfig = await dbGetAsync('SELECT value FROM engine_config WHERE key = "gemini_api_key" OR key = "GEMINI_API_KEY" LIMIT 1');
    if (customConfig && customConfig.value) geminiKey = customConfig.value;
  } catch (e) {}

  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: geminiModelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.warn('Gemini failed, trying OpenAI fallback:', err.message);
    }
  }

  // 2. Try OpenAI Fallback
  let openaiKey = process.env.OPENAI_API_KEY;
  let openaiModelName = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
  try {
    const oaiConfig = await dbGetAsync('SELECT value FROM engine_config WHERE key = "open_ai_api_key" OR key = "OPENAI_API_KEY" LIMIT 1');
    if (oaiConfig && oaiConfig.value) openaiKey = oaiConfig.value;
  } catch (e) {}

  if (openaiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: openaiModelName,
        messages: [{ role: "user", content: prompt }]
      });
      return completion.choices[0].message.content;
    } catch (err) {
      console.error('OpenAI fallback failed:', err.message);
      throw new Error('All AI engines failed (Gemini & OpenAI)');
    }
  }

  throw new Error('No AI engines configured or all connections rejected (Missing valid Gemini & OpenAI API Keys)');
}

// --- AI SCHEDULING ---

app.post('/api/calendar/ai/suggest-time', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  const { title, duration_minutes, preferred_date, notes } = req.body;
  let apiKey = process.env.GEMINI_API_KEY;
  try {
    const customConfig = await dbGetAsync('SELECT value FROM engine_config WHERE key = "gemini_api_key" OR key = "GEMINI_API_KEY" LIMIT 1');
    if (customConfig && customConfig.value) apiKey = customConfig.value;
  } catch (e) { /* ignore db error for config */ }

  if (!apiKey) return res.status(500).json({ error: 'AI engine not configured' });

  try {
    const startRange = new Date(preferred_date);
    startRange.setHours(0,0,0,0);
    const endRange = new Date(preferred_date);
    endRange.setHours(23,59,59,999);

    const busy = await dbAllAsync(`
      SELECT start_datetime, end_datetime FROM calendar_events
      WHERE user_id = ? AND start_datetime <= ? AND end_datetime >= ?
    `, [req.user.id, endRange.toISOString(), startRange.toISOString()]);

    const prompt = `Given these busy slots: ${JSON.stringify(busy)}
      Suggest 3 optimal times for a ${duration_minutes} minute meeting called "${title}" on ${preferred_date}.
      Notes: ${notes || 'None'}
      Return ONLY JSON: { "suggestions": [{ "start": "ISO", "end": "ISO", "reason": "text" }], "summary": "text" }`;

    const text = await generateWithFallback(prompt);
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No valid JSON found in AI response');
      const cleanJson = jsonMatch[0].trim();
      res.json(JSON.parse(cleanJson));
    } catch (parseErr) {
      console.error('AI JSON Parse Error:', text, parseErr);
      res.status(500).json({ success: false, error: 'AI failed to generate a valid schedule. Please try again.' });
    }
  } catch (err) {
    console.error('Calendar AI Suggest Time Error:', err);
    res.status(500).json({ success: false, error: err.message || 'AI Engine initialization failed' });
  }
});

app.post('/api/calendar/ai/generate-description', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  const { title, notes } = req.body;
  try {
    const prompt = `Write a professional, concise calendar event description for: ${title}. ${notes ? 'Context: ' + notes : ''}. No markdown.`;
    const text = await generateWithFallback(prompt);
    res.json({ success: true, description: text.trim() });
  } catch (err) {
    console.error('Calendar AI Generate Description Error:', err);
    res.status(500).json({ success: false, error: err.message || 'AI Engine initialization failed' });
  }
});

// --- AVAILABILITY & BOOKING ---

app.get('/api/calendar/availability/:userId', async (req, res) => {
  try {
    const slots = await dbAllAsync('SELECT * FROM availability_slots WHERE user_id = ? AND is_available = 1', [req.params.userId]);
    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/calendar/availability', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  const { slots } = req.body; // [{day_of_week, start_time, end_time}]
  try {
    await dbRunAsync('DELETE FROM availability_slots WHERE user_id = ?', [req.user.id]);
    for (const s of slots) {
      await dbRunAsync(
        'INSERT INTO availability_slots (user_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [req.user.id, s.day_of_week, s.start_time, s.end_time]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/calendar/booking-links', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  const { title, slug, duration_minutes, questions, color } = req.body;
  try {
    const result = await dbRunAsync(`
      INSERT INTO booking_links (user_id, title, slug, duration_minutes, questions, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, title, slug, duration_minutes, JSON.stringify(questions), color]);
    const link = await dbGetAsync('SELECT * FROM booking_links WHERE id = ?', [result.lastID]);
    res.json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/calendar/booking-links', authenticateToken, requireEnterpriseOrAdmin, async (req, res) => {
  try {
    const links = await dbAllAsync('SELECT * FROM booking_links WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, links });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/calendar/booking/:slug', async (req, res) => {
  try {
    const link = await dbGetAsync('SELECT * FROM booking_links WHERE slug = ? AND is_active = 1', [req.params.slug]);
    if (!link) return res.status(404).json({ error: 'Booking link not found' });
    const user = await dbGetAsync('SELECT name, email FROM users WHERE id = ?', [link.user_id]);
    const availability = await dbAllAsync('SELECT * FROM availability_slots WHERE user_id = ?', [link.user_id]);
    res.json({ success: true, booking_link: link, host: user, availability });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// SEARCH & SIGNALS API (FINAL PHASE)
// ==========================================
app.get('/api/search/global', authenticateToken, (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const query = `%${q}%`;
  const userId = req.user.id;

  // Search Contacts, Events, and Campaigns in parallel
  db.all(
    'SELECT id, name as title, company as subtitle, "contact" as type FROM contacts WHERE (name LIKE ? OR company LIKE ?) AND user_id = ? LIMIT 5',
    [query, query, userId],
    (err, contacts) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all(
        'SELECT id, name as title, type as subtitle, "event" as type FROM events WHERE name LIKE ? AND user_id = ? LIMIT 3',
        [query, userId],
        (err, events) => {
          if (err) return res.status(500).json({ error: err.message });

          db.all(
            'SELECT id, name as title, subject as subtitle, "campaign" as type FROM email_campaigns WHERE name LIKE ? AND user_id = ? LIMIT 3',
            [query, userId],
            (err, campaigns) => {
              if (err) return res.status(500).json({ error: err.message });
              res.json([...contacts, ...events, ...campaigns]);
            }
          );
        }
      );
    }
  );
});

app.get('/api/signals', authenticateToken, (req, res) => {
  // Simulate AI Intent Discovery from the contact pool
  const userId = req.user.id;
  db.all(
    'SELECT id, name, company, job_title FROM contacts WHERE user_id = ? LIMIT 5',
    [userId],
    (err, contacts) => {
      if (err) return res.status(500).json({ error: err.message });

      const signals = [
        { type: 'intent', icon: 'zap', title: 'Buying Intent Detected', msg: 'Lead is researching competitors.' },
        { type: 'career', icon: 'award', title: 'Promotion Alert', msg: 'Contact recently updated their profile.' },
        { type: 'news', icon: 'globe', title: 'Company News', msg: 'Funding round announced recently.' }
      ];

      const results = (contacts || []).map((c, i) => ({
        ...c,
        ...signals[i % signals.length],
        id: `sig-${c.id}-${i}`
      }));

      res.json(results);
    }
  );
});

// ==========================================
// CONTACT RELATIONSHIPS & ORG CHART API
// ==========================================
app.post('/api/contacts/relationships', authenticateToken, (req, res) => {
  const { from_id, to_id, type } = req.body;
  if (!from_id || !to_id || !type) return res.status(400).json({ error: 'Missing required fields' });

  db.run(
    'INSERT OR IGNORE INTO contact_relationships (from_contact_id, to_contact_id, type) VALUES (?, ?, ?)',
    [from_id, to_id, type],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Relationship established.' });
    }
  );
});

app.get('/api/contacts/:id/relationships', authenticateToken, (req, res) => {
  const contactId = req.params.id;
  db.all(`
    SELECT r.*, c.name as target_name, c.job_title as target_title 
    FROM contact_relationships r
    JOIN contacts c ON r.to_contact_id = c.id
    WHERE r.from_contact_id = ?
  `, [contactId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/contacts/mutual', authenticateToken, (req, res) => {
  const { company } = req.query;
  if (!company) return res.json({ mutualCount: 0 });

  // Find other contacts from the same company NOT scanned by this user
  db.get(
    'SELECT COUNT(*) as count FROM contacts WHERE company LIKE ? AND user_id != ?',
    [`%${company}%`, req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mutualCount: row.count || 0 });
    }
  );
});

app.get('/api/org-chart/:company', authenticateToken, (req, res) => {
  const companyName = req.params.company;
  const userId = req.user.id;

  // First, find the workspace_id of the current user
  db.get('SELECT workspace_id FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });

    const workspaceId = user?.workspace_id;

    // Fetch contacts from the SAME workspace (Shared Intelligence)
    const sql = workspaceId
      ? `SELECT id, name, job_title, company, email FROM contacts 
         WHERE company LIKE ? AND user_id IN (SELECT id FROM users WHERE workspace_id = ?)`
      : `SELECT id, name, job_title, company, email FROM contacts 
         WHERE company LIKE ? AND user_id = ?`;

    const params = workspaceId ? [`%${companyName}%`, workspaceId] : [`%${companyName}%`, userId];

    db.all(sql, params, (err, contacts) => {
      if (err) return res.status(500).json({ error: err.message });

      const levels = {
        'C-Suite': ['ceo', 'cto', 'cfo', 'coo', 'vp', 'founder', 'president', 'partner', 'md', 'chief'],
        'Management': ['director', 'manager', 'head', 'lead', 'senior manager', 'principal', 'supervisor'],
        'Individual': ['engineer', 'designer', 'developer', 'specialist', 'associate', 'account', 'architect', 'staff', 'coordinator', 'intern', 'analyst']
      };

      const nodes = contacts.map(c => {
        const title = (c.job_title || '').toLowerCase();
        let level = 'Individual';

        // Priority categorization
        if (levels['C-Suite'].some(k => title.includes(k))) level = 'C-Suite';
        else if (levels['Management'].some(k => title.includes(k))) level = 'Management';

        return { ...c, level };
      });

      res.json({
        company: companyName,
        nodes: nodes.sort((a, b) => {
          const rank = { 'C-Suite': 1, 'Management': 2, 'Individual': 3 };
          return rank[a.level] - rank[b.level];
        })
      });
    });
  });
});

// Contacts CRUD
app.get('/api/contacts/stats', authenticateToken, (req, res) => {
  db.get('SELECT COUNT(*) as totalScanned, AVG(confidence) as avgConfidence FROM contacts WHERE user_id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      totalScanned: row.totalScanned || 0,
      avgConfidence: row.avgConfidence ? Number(row.avgConfidence).toFixed(1) : 0
    });
  });
});

app.get('/api/contacts', authenticateToken, (req, res) => {
  (async () => {
    try {
      const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
      const policies = await getPoliciesForScope(scopeWorkspaceId);
      const purge = await runRetentionPurgeForScope(scopeWorkspaceId, policies.retention_days);

      db.all('SELECT * FROM contacts WHERE user_id = ? ORDER BY scan_date DESC', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.setHeader('X-Retention-Purged', `${purge.purged}`);
        res.json(rows);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  })();
});

app.post('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const policies = await getPoliciesForScope(scopeWorkspaceId);
    const input = applyPiiPolicyToContactInput(req.body || {}, policies);

    // Credit points are deducted on SAVE (not on scan). Enforce limits here.
    const userTierRow = await dbGetAsync('SELECT tier FROM users WHERE id = ?', [req.user.id]);
    const tier = String(userTierRow?.tier || req.user.tier || 'personal').toLowerCase();
    await ensureQuotaRow(req.user.id, tier);
    const quotaRow = await dbGetAsync('SELECT used_count, limit_amount FROM user_quotas WHERE user_id = ?', [req.user.id]);
    const usedCount = Number(quotaRow?.used_count || 0);
    const limitAmount = Number(quotaRow?.limit_amount || resolveTierLimits(tier).single);

    if (usedCount >= limitAmount) {
      const upgradePath = tier === 'personal' ? 'Professional or Enterprise' : 'Enterprise';
      return res.status(403).json({
        error: `Credit points exhausted. Your ${tier.toUpperCase()} account is limited to ${limitAmount} saved scans per cycle. Please upgrade to a ${upgradePath} plan for more.`
      });
    }

    const {
      name,
      name_native,
      email,
      phone,
      company,
      company_native,
      job_title,
      title,
      title_native,
      detected_language,
      confidence,
      image_url,
      card_image,
      notes,
      tags,
      engine_used,
      event_id,
      inferred_industry,
      inferred_seniority
    } = input;
    const effectiveTitle = job_title || title || '';
    const effectiveTitleNative = title_native || '';
    const effectiveEngine = engine_used || 'Gemini 2.5 Flash';

    // Duplicate detection: same normalized email+name OR same normalized name+phone for same user
    const normalizedName = normalizeEmail(name);
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);
    const dupQuery = normalizedEmail
      ? 'SELECT id FROM contacts WHERE user_id = ? AND (LOWER(email) = ? OR LOWER(name) = ?) LIMIT 1'
      : 'SELECT id FROM contacts WHERE user_id = ? AND LOWER(name) = ? AND REPLACE(REPLACE(REPLACE(phone, " ", ""), "-", ""), "(", "") LIKE ? LIMIT 1';
    const dupParams = normalizedEmail
      ? [req.user.id, normalizedEmail, normalizedName]
      : [req.user.id, normalizedName, `%${normalizedPhone.slice(-7)}%`];

    const existing = await dbGetAsync(dupQuery, dupParams);
    if (existing) {
      logAuditEvent(req, {
        action: 'CONTACT_CREATE',
        resource: '/api/contacts',
        status: AUDIT_DENIED,
        details: { reason: 'duplicate', existing_contact_id: existing.id }
      });
      return res.status(409).json({ error: 'Duplicate contact detected', contact_id: existing.id });
    }

    const inserted = await dbRunAsync(
      `INSERT INTO contacts (
        user_id,
        name,
        name_native,
        email,
        phone,
        company,
        company_native,
        job_title,
        title_native,
        detected_language,
        confidence,
        image_url,
        notes,
        tags,
        engine_used,
        event_id,
        inferred_industry,
        inferred_seniority,
        workspace_scope,
        crm_synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        req.user.id,
        name || '',
        name_native || null,
        email || '',
        phone || '',
        company || '',
        company_native || null,
        effectiveTitle,
        effectiveTitleNative || null,
        detected_language || null,
        Number(confidence) || 95,
        image_url || card_image || null,
        notes || '',
        tags || '',
        effectiveEngine,
        event_id || null,
        inferred_industry || null,
        inferred_seniority || null,
        scopeWorkspaceId
      ]
    );

    const contactId = inserted.lastID;

    // Deduct one credit point for this saved contact.
    await dbRunAsync('UPDATE user_quotas SET used_count = used_count + 1 WHERE user_id = ?', [req.user.id]);

    // --- Background: Generate Embedding for Smart Search ---
    (async () => {
      try {
        const searchText = `${name || ''} ${company || ''} ${effectiveTitle || ''} ${notes || ''}`.trim();
        if (searchText) {
          const vector = await generateEmbedding(searchText);
          if (vector) {
            await dbRunAsync('UPDATE contacts SET search_vector = ? WHERE id = ?', [JSON.stringify(vector), contactId]);
            console.log(`[AI] Search vector generated for contact ${contactId}`);
          }
        }
      } catch (err) {
        console.error('[AI] Automated indexing failed:', err.message);
      }
    })();

    let draftCreated = false;
    if (email && String(email).trim()) {
      try {
        const contactFirstName = firstNameFromFullName(name);
        const draftSubject = company
          ? `Great meeting you at ${company}`
          : 'Great connecting with you';
        const draftBody = [
          `Hi ${contactFirstName},`,
          '',
          company
            ? `It was great connecting regarding ${company}. I'd love to continue the conversation and share a few relevant ideas.`
            : "It was great connecting. I'd love to continue the conversation and share a few relevant ideas.",
          '',
          'Would you be open to a quick follow-up this week?',
          '',
          'Best,',
          req.user?.name || 'IntelliScan'
        ].join('\n');

        await dbRunAsync(
          'INSERT INTO ai_drafts (user_id, contact_id, contact_name, subject, body, status) VALUES (?, ?, ?, ?, ?, "draft")',
          [req.user.id, inserted.lastID, name || 'Contact', draftSubject, draftBody]
        );
        draftCreated = true;
      } catch (draftErr) {
        console.error('Auto-draft creation failed:', draftErr.message);
      }
    }

    logAuditEvent(req, {
      action: 'CONTACT_CREATE',
      resource: '/api/contacts',
      status: AUDIT_SUCCESS,
      details: {
        contact_id: inserted.lastID,
        company: company || null,
        pii_redaction_enabled: policies.pii_redaction_enabled,
        draft_created: draftCreated
      }
    });

    return res.status(201).json({ id: inserted.lastID, message: 'Contact saved' });
  } catch (err) {
    logAuditEvent(req, {
      action: 'CONTACT_CREATE',
      resource: '/api/contacts',
      status: AUDIT_ERROR,
      details: { error: err.message }
    });
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contacts/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM contacts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function (err) {
    if (err) {
      logAuditEvent(req, {
        action: 'CONTACT_DELETE',
        resource: `/api/contacts/${req.params.id}`,
        status: AUDIT_ERROR,
        details: { error: err.message, contact_id: req.params.id }
      });
      return res.status(500).json({ error: err.message });
    }
    logAuditEvent(req, {
      action: 'CONTACT_DELETE',
      resource: `/api/contacts/${req.params.id}`,
      status: this.changes > 0 ? AUDIT_SUCCESS : AUDIT_DENIED,
      details: { contact_id: req.params.id, rows_affected: this.changes }
    });
    res.json({ message: 'Contact deleted successfully', rowsAffected: this.changes });
  });
});

app.get('/api/workspace/contacts', authenticateToken, (req, res) => {
  (async () => {
    try {
      const { workspaceId, scopeWorkspaceId } = await getScopeForUser(req.user.id);
      const policies = await getPoliciesForScope(scopeWorkspaceId);
      const purge = await runRetentionPurgeForScope(scopeWorkspaceId, policies.retention_days);
      const sql = workspaceId
        ? `SELECT c.*, u.name as scanner_name
           FROM contacts c
           JOIN users u ON c.user_id = u.id
           WHERE u.workspace_id = ?
           ORDER BY c.scan_date DESC`
        : `SELECT c.*, u.name as scanner_name
           FROM contacts c
           JOIN users u ON c.user_id = u.id
           WHERE c.user_id = ?
           ORDER BY c.scan_date DESC`;
      const params = [workspaceId || req.user.id];

      db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.setHeader('X-Retention-Purged', `${purge.purged}`);
        res.json(rows);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  })();
});

// Workspace-level analytics for the Enterprise dashboard (safe for personal users too).
app.get('/api/workspace/analytics', authenticateToken, async (req, res) => {
  try {
    const { workspaceId, scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const policies = await getPoliciesForScope(scopeWorkspaceId);
    const purge = await runRetentionPurgeForScope(scopeWorkspaceId, policies.retention_days);

    const scope = workspaceId
      ? { where: 'u.workspace_id = ?', params: [workspaceId] }
      : { where: 'c.user_id = ?', params: [req.user.id] };

    const totals = await dbGetAsync(
      `SELECT
         COUNT(*) as total_scans,
         AVG(COALESCE(c.confidence, 0)) as avg_confidence,
         SUM(CASE WHEN c.email IS NOT NULL AND TRIM(c.email) <> '' THEN 1 ELSE 0 END) as leads_generated
       FROM contacts c
       JOIN users u ON c.user_id = u.id
       WHERE ${scope.where}`,
      scope.params
    );

    const membersRow = workspaceId
      ? await dbGetAsync('SELECT COUNT(*) as count FROM users WHERE workspace_id = ?', [workspaceId])
      : { count: 1 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start30 = new Date(today);
    start30.setDate(start30.getDate() - 29);
    const start60 = new Date(today);
    start60.setDate(start60.getDate() - 59);

    const currentWindow = await dbGetAsync(
      `SELECT COUNT(*) as count
       FROM contacts c
       JOIN users u ON c.user_id = u.id
       WHERE ${scope.where} AND datetime(c.scan_date) >= datetime(?)`,
      [...scope.params, start30.toISOString()]
    );

    const previousWindow = await dbGetAsync(
      `SELECT COUNT(*) as count
       FROM contacts c
       JOIN users u ON c.user_id = u.id
       WHERE ${scope.where}
         AND datetime(c.scan_date) >= datetime(?)
         AND datetime(c.scan_date) < datetime(?)`,
      [...scope.params, start60.toISOString(), start30.toISOString()]
    );

    const currCount = Number(currentWindow?.count || 0);
    const prevCount = Number(previousWindow?.count || 0);
    const growthPct = prevCount === 0 ? (currCount > 0 ? 100 : 0) : Math.round(((currCount - prevCount) / prevCount) * 100);

    const dayRows = await dbAllAsync(
      `SELECT date(c.scan_date) as day, COUNT(*) as count
       FROM contacts c
       JOIN users u ON c.user_id = u.id
       WHERE ${scope.where} AND datetime(c.scan_date) >= datetime(?)
       GROUP BY date(c.scan_date)
       ORDER BY day ASC`,
      [...scope.params, start30.toISOString()]
    );

    const dayMap = new Map((dayRows || []).map((r) => [String(r.day), Number(r.count || 0)]));
    const scanByDay = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(start30);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      return dayMap.get(key) || 0;
    });

    const engineRows = await dbAllAsync(
      `SELECT COALESCE(NULLIF(TRIM(c.engine_used), ''), 'Unknown') as name, COUNT(*) as count
       FROM contacts c
       JOIN users u ON c.user_id = u.id
       WHERE ${scope.where}
       GROUP BY name
       ORDER BY count DESC
       LIMIT 3`,
      scope.params
    );

    const totalScans = Number(totals?.total_scans || 0);
    const engineBreakdown = (engineRows || []).map((row) => {
      const count = Number(row.count || 0);
      const pct = totalScans > 0 ? Number(((count / totalScans) * 100).toFixed(1)) : 0;
      return { name: row.name, count, pct };
    });

    const recentActivity = await dbAllAsync(
      `SELECT c.id, c.name, c.company, c.job_title, c.confidence, c.scan_date, u.name as scanner_name
       FROM contacts c
       JOIN users u ON c.user_id = u.id
       WHERE ${scope.where}
       ORDER BY datetime(c.scan_date) DESC, c.id DESC
       LIMIT 15`,
      scope.params
    );

    res.setHeader('X-Retention-Purged', `${purge.purged}`);
    res.json({
      scope_workspace_id: scopeWorkspaceId,
      workspace_id: workspaceId,
      total_scans: totalScans,
      growth_pct: growthPct,
      avg_confidence: totalScans > 0 ? Number((Number(totals?.avg_confidence || 0)).toFixed(1)) : 0,
      active_members: Math.max(1, Number(membersRow?.count || 1)),
      leads_generated: Number(totals?.leads_generated || 0),
      scan_by_day: scanByDay,
      engine_breakdown: engineBreakdown,
      recent_activity: recentActivity || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Duplicate-outreach protection feed for Shared Rolodex.
app.get('/api/workspace/contacts/duplicates', authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = await getScopeForUser(req.user.id);
    const scope = workspaceId
      ? { where: 'u.workspace_id = ?', params: [workspaceId] }
      : { where: 'c.user_id = ?', params: [req.user.id] };

    const dupeRows = await dbAllAsync(
      `SELECT LOWER(TRIM(c.email)) as email, COUNT(*) as count
       FROM contacts c
       JOIN users u ON c.user_id = u.id
       WHERE ${scope.where}
         AND c.email IS NOT NULL
         AND TRIM(c.email) <> ''
       GROUP BY LOWER(TRIM(c.email))
       HAVING COUNT(*) > 1
       ORDER BY count DESC, email ASC
       LIMIT 100`,
      scope.params
    );

    const duplicates = [];
    for (const row of dupeRows || []) {
      const email = String(row.email || '').trim().toLowerCase();
      if (!email) continue;

      const contacts = await dbAllAsync(
        `SELECT c.id, c.name, c.email, c.company, c.job_title, c.scan_date, u.name as scanner_name
         FROM contacts c
         JOIN users u ON c.user_id = u.id
         WHERE ${scope.where} AND LOWER(TRIM(c.email)) = ?
         ORDER BY datetime(c.scan_date) DESC, c.id DESC`,
        [...scope.params, email]
      );

      duplicates.push({
        email,
        count: Number(row.count || (contacts || []).length || 0),
        contacts: contacts || []
      });
    }

    res.json({ duplicates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workspace/billing/overview', authenticateToken, async (req, res) => {
  try {
    const userRow = await dbGetAsync('SELECT tier, workspace_id FROM users WHERE id = ?', [req.user.id]);
    const tier = userRow?.tier || 'personal';
    const workspaceId = userRow?.workspace_id ?? null;
    const scopeWorkspaceId = getScopeWorkspaceId(workspaceId, req.user.id);

    await ensureQuotaRow(req.user.id, tier);
    await ensureBillingSeedForScope(scopeWorkspaceId, tier);

    let usageRow;
    let seatsUsed = 1;
    if (workspaceId) {
      usageRow = await dbGetAsync(
        `SELECT COALESCE(SUM(COALESCE(q.used_count, 0)), 0) as used_count,
                COALESCE(SUM(COALESCE(q.limit_amount, 0)), 0) as limit_amount
         FROM users u
         LEFT JOIN user_quotas q ON q.user_id = u.id
         WHERE u.workspace_id = ?`,
        [workspaceId]
      );
      const seatsRow = await dbGetAsync('SELECT COUNT(*) as count FROM users WHERE workspace_id = ?', [workspaceId]);
      seatsUsed = Math.max(1, Number(seatsRow?.count || 1));
    } else {
      usageRow = await dbGetAsync('SELECT used_count, limit_amount FROM user_quotas WHERE user_id = ?', [req.user.id]);
    }

    const fallbackSingle = resolveTierLimits(tier).single;
    const ocrUsed = Number(usageRow?.used_count || 0);
    const ocrLimitRaw = Number(usageRow?.limit_amount || 0);
    const ocrLimit = ocrLimitRaw > 0 ? ocrLimitRaw : fallbackSingle * seatsUsed;

    const geminiLimit = Math.max(Math.round(ocrLimit * 0.5), 50);
    const geminiUsed = Math.min(geminiLimit, Math.round(ocrUsed * 0.5));

    const seatLimit = resolveSeatLimit(tier);
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    res.json({
      tier,
      usage: {
        ocr: { used: ocrUsed, limit: ocrLimit },
        gemini: { used: geminiUsed, limit: geminiLimit },
        seats: { used: seatsUsed, limit: seatLimit }
      },
      billing_cycle: {
        period_start: periodStart,
        period_label: now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workspace/billing/payment-methods', authenticateToken, async (req, res) => {
  try {
    const { workspaceId, scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const user = await dbGetAsync('SELECT tier FROM users WHERE id = ?', [req.user.id]);
    await ensureBillingSeedForScope(scopeWorkspaceId, user?.tier || 'personal');

    const rows = await dbAllAsync(
      `SELECT id, brand, last4, exp_month, exp_year, holder_name, is_primary, is_backup, created_at
       FROM billing_payment_methods
       WHERE workspace_id = ?
       ORDER BY is_primary DESC, created_at DESC`,
      [scopeWorkspaceId]
    );

    res.json({
      scope_workspace_id: scopeWorkspaceId,
      workspace_id: workspaceId,
      methods: (rows || []).map((row) => ({
        id: row.id,
        brand: row.brand,
        last4: row.last4,
        exp_month: Number(row.exp_month),
        exp_year: Number(row.exp_year),
        holder_name: row.holder_name || '',
        is_primary: !!Number(row.is_primary),
        is_backup: !!Number(row.is_backup),
        created_at: row.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workspace/billing/payment-methods', authenticateToken, async (req, res) => {
  try {
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const cardNumberRaw = String(req.body?.card_number || '');
    const cardDigits = cardNumberRaw.replace(/\D/g, '');
    const expMonth = Number(req.body?.exp_month);
    const expYear = Number(req.body?.exp_year);
    const holderName = String(req.body?.holder_name || '').trim().slice(0, 120);

    if (cardDigits.length < 12 || cardDigits.length > 19) {
      return res.status(400).json({ error: 'Please provide a valid card number.' });
    }
    if (!expMonth || expMonth < 1 || expMonth > 12) {
      return res.status(400).json({ error: 'Please provide a valid expiration month.' });
    }
    if (!expYear || expYear < new Date().getFullYear()) {
      return res.status(400).json({ error: 'Please provide a valid expiration year.' });
    }

    const existingCount = await dbGetAsync(
      'SELECT COUNT(*) as count FROM billing_payment_methods WHERE workspace_id = ?',
      [scopeWorkspaceId]
    );

    const shouldBePrimary = Number(existingCount?.count || 0) === 0 || !!req.body?.make_primary;
    if (shouldBePrimary) {
      await dbRunAsync(
        'UPDATE billing_payment_methods SET is_primary = 0, is_backup = 1, updated_at = CURRENT_TIMESTAMP WHERE workspace_id = ?',
        [scopeWorkspaceId]
      );
    }

    const brand = String(req.body?.brand || '').trim().toLowerCase() || detectCardBrand(cardDigits);
    const insertResult = await dbRunAsync(
      `INSERT INTO billing_payment_methods
        (workspace_id, brand, last4, exp_month, exp_year, holder_name, is_primary, is_backup, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        scopeWorkspaceId,
        brand,
        cardDigits.slice(-4),
        expMonth,
        expYear,
        holderName || null,
        shouldBePrimary ? 1 : 0,
        shouldBePrimary ? 0 : 1
      ]
    );

    const inserted = await dbGetAsync(
      `SELECT id, brand, last4, exp_month, exp_year, holder_name, is_primary, is_backup, created_at
       FROM billing_payment_methods
       WHERE id = ?`,
      [insertResult.lastID]
    );

    logAuditEvent(req, {
      action: 'BILLING_PAYMENT_METHOD_ADD',
      resource: '/api/workspace/billing/payment-methods',
      status: AUDIT_SUCCESS,
      details: {
        workspace_scope: scopeWorkspaceId,
        method_id: insertResult.lastID,
        brand: inserted?.brand,
        last4: inserted?.last4,
        is_primary: !!Number(inserted?.is_primary)
      }
    });

    res.status(201).json({
      success: true,
      method: {
        id: inserted.id,
        brand: inserted.brand,
        last4: inserted.last4,
        exp_month: Number(inserted.exp_month),
        exp_year: Number(inserted.exp_year),
        holder_name: inserted.holder_name || '',
        is_primary: !!Number(inserted.is_primary),
        is_backup: !!Number(inserted.is_backup),
        created_at: inserted.created_at
      }
    });
  } catch (error) {
    logAuditEvent(req, {
      action: 'BILLING_PAYMENT_METHOD_ADD',
      resource: '/api/workspace/billing/payment-methods',
      status: AUDIT_ERROR,
      details: { error: error.message }
    });
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workspace/billing/payment-methods/:id/set-primary', authenticateToken, async (req, res) => {
  try {
    const methodId = Number(req.params.id);
    if (!methodId) return res.status(400).json({ error: 'Invalid payment method id.' });

    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const method = await dbGetAsync(
      'SELECT id FROM billing_payment_methods WHERE id = ? AND workspace_id = ?',
      [methodId, scopeWorkspaceId]
    );
    if (!method) return res.status(404).json({ error: 'Payment method not found.' });

    await dbRunAsync(
      'UPDATE billing_payment_methods SET is_primary = 0, is_backup = 1, updated_at = CURRENT_TIMESTAMP WHERE workspace_id = ?',
      [scopeWorkspaceId]
    );
    await dbRunAsync(
      'UPDATE billing_payment_methods SET is_primary = 1, is_backup = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND workspace_id = ?',
      [methodId, scopeWorkspaceId]
    );

    logAuditEvent(req, {
      action: 'BILLING_PAYMENT_PRIMARY_SET',
      resource: `/api/workspace/billing/payment-methods/${methodId}/set-primary`,
      status: AUDIT_SUCCESS,
      details: { workspace_scope: scopeWorkspaceId, method_id: methodId }
    });

    res.json({ success: true, method_id: methodId });
  } catch (error) {
    logAuditEvent(req, {
      action: 'BILLING_PAYMENT_PRIMARY_SET',
      resource: `/api/workspace/billing/payment-methods/${req.params.id}/set-primary`,
      status: AUDIT_ERROR,
      details: { error: error.message }
    });
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workspace/billing/invoices', authenticateToken, async (req, res) => {
  try {
    const user = await dbGetAsync('SELECT tier FROM users WHERE id = ?', [req.user.id]);
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    await ensureBillingSeedForScope(scopeWorkspaceId, user?.tier || 'personal');

    const rows = await dbAllAsync(
      `SELECT id, invoice_number, amount_cents, currency, status, issued_at, receipt_url
       FROM billing_invoices
       WHERE workspace_id = ?
       ORDER BY datetime(issued_at) DESC, id DESC`,
      [scopeWorkspaceId]
    );

    res.json({
      invoices: (rows || []).map((row) => ({
        id: row.id,
        invoice_number: row.invoice_number,
        amount_cents: Number(row.amount_cents || 0),
        amount: (Number(row.amount_cents || 0) / 100).toFixed(2),
        currency: row.currency || 'USD',
        status: row.status || 'paid',
        issued_at: row.issued_at,
        receipt_url: row.receipt_url || null
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workspace/billing/invoices/export', authenticateToken, async (req, res) => {
  try {
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const rows = await dbAllAsync(
      `SELECT invoice_number, issued_at, amount_cents, currency, status
       FROM billing_invoices
       WHERE workspace_id = ?
       ORDER BY datetime(issued_at) DESC, id DESC`,
      [scopeWorkspaceId]
    );

    const csvLines = ['invoice_number,issued_at,amount,currency,status'];
    (rows || []).forEach((row) => {
      const amount = (Number(row.amount_cents || 0) / 100).toFixed(2);
      csvLines.push(`${row.invoice_number},${row.issued_at},${amount},${row.currency || 'USD'},${row.status || 'paid'}`);
    });

    const csv = `${csvLines.join('\n')}\n`;
    const dateTag = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename='billing-history-${dateTag}.csv'`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workspace/billing/invoices/:id/receipt', authenticateToken, async (req, res) => {
  try {
    const invoiceId = Number(req.params.id);
    if (!invoiceId) return res.status(400).json({ error: 'Invalid invoice id.' });

    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const invoice = await dbGetAsync(
      `SELECT invoice_number, amount_cents, currency, status, issued_at
       FROM billing_invoices
       WHERE id = ? AND workspace_id = ?`,
      [invoiceId, scopeWorkspaceId]
    );
    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

    const body = [
      'IntelliScan Billing Receipt',
      '--------------------------',
      `Invoice: ${invoice.invoice_number}`,
      `Date: ${invoice.issued_at}`,
      `Amount: ${(Number(invoice.amount_cents || 0) / 100).toFixed(2)} ${invoice.currency || 'USD'}`,
      `Status: ${String(invoice.status || 'paid').toUpperCase()}`,
      '',
      'Thank you for using IntelliScan.'
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename='receipt-${invoice.invoice_number}.txt'`);
    res.send(body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workspace/data-policies', authenticateToken, async (req, res) => {
  try {
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const policies = await getPoliciesForScope(scopeWorkspaceId);
    res.json({
      retention_days: Number(policies.retention_days),
      pii_redaction_enabled: !!Number(policies.pii_redaction_enabled),
      strict_audit_storage_enabled: !!Number(policies.strict_audit_storage_enabled)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/workspace/data-policies', authenticateToken, async (req, res) => {
  try {
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const retentionDaysRaw = req.body?.retention_days;
    const retentionDays = retentionDaysRaw === 0 || retentionDaysRaw === '0' || retentionDaysRaw === 'never'
      ? 0
      : Math.max(parseInt(retentionDaysRaw, 10) || 90, 1);
    const piiRedaction = req.body?.pii_redaction_enabled ? 1 : 0;
    const strictAudit = req.body?.strict_audit_storage_enabled ? 1 : 0;

    await dbRunAsync(
      `INSERT OR REPLACE INTO workspace_policies
        (workspace_id, retention_days, pii_redaction_enabled, strict_audit_storage_enabled, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [scopeWorkspaceId, retentionDays, piiRedaction, strictAudit, req.user.id]
    );

    const purge = await runRetentionPurgeForScope(scopeWorkspaceId, retentionDays);

    logAuditEvent(req, {
      action: 'DATA_POLICY_UPDATE',
      resource: '/api/workspace/data-policies',
      status: AUDIT_SUCCESS,
      details: {
        workspace_scope: scopeWorkspaceId,
        retention_days: retentionDays,
        pii_redaction_enabled: piiRedaction,
        strict_audit_storage_enabled: strictAudit,
        purged_contacts: purge.purged
      }
    });

    res.json({
      success: true,
      policies: {
        retention_days: retentionDays,
        pii_redaction_enabled: !!piiRedaction,
        strict_audit_storage_enabled: !!strictAudit
      },
      purged_contacts: purge.purged
    });
  } catch (error) {
    logAuditEvent(req, {
      action: 'DATA_POLICY_UPDATE',
      resource: '/api/workspace/data-policies',
      status: AUDIT_ERROR,
      details: { error: error.message }
    });
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ENTERPRISE MOCK API ENDPOINTS
// ==========================================

app.get('/api/enterprise/audit-logs', authenticateToken, (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
  const status = req.query.status ? String(req.query.status).toUpperCase() : null;
  const action = req.query.action ? String(req.query.action).toUpperCase() : null;

  const filters = [];
  const params = [];

  if (status) {
    filters.push('status = ?');
    params.push(status);
  }
  if (action) {
    filters.push('action = ?');
    params.push(action);
  }
  if (req.user.role !== 'super_admin') {
    filters.push('actor_user_id = ?');
    params.push(req.user.id);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const sql = `
    SELECT id, action, resource, status, actor_email, actor_role, ip_address, details_json, created_at
    FROM audit_trail
    ${where}
    ORDER BY datetime(created_at) DESC
    LIMIT ?
  `;

  db.all(sql, [...params, limit], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json((rows || []).map((row) => ({
      id: `LOG-${String(row.id).padStart(5, '0')}`,
      event: row.action,
      resource: row.resource,
      user: row.actor_email || 'unknown',
      role: row.actor_role || 'unknown',
      status: row.status,
      ip: row.ip_address || 'unknown',
      details: (() => {
        if (!row.details_json) return {};
        try { return JSON.parse(row.details_json); } catch (_) { return {}; }
      })(),
      timestamp: row.created_at
    })));
  });
});

app.get('/api/enterprise/webhooks', authenticateToken, (req, res) => {
  res.json([
    { id: 'WH-89FA', url: 'https://api.salesforce.com/services/apexrest/intelliscan', events: ['contact.created', 'scan.completed'], status: 'Active', latency: '124ms' },
    { id: 'WH-2B3C', url: 'https://hooks.slack.com/services/T0000/B0000/XXXX', events: ['system.alert'], status: 'Failing', latency: 'Timeout' }
  ]);
});

app.get('/api/enterprise/system-health', authenticateToken, (req, res) => {
  res.json({
    status: 'Operational',
    components: {
      api: { status: 'Operational', uptime: '99.99%', load: '12%' },
      database: { status: 'Operational', uptime: '99.99%', load: '45%' },
      ocr_engine: { status: 'Operational', uptime: '99.99%', queue_depth: 3 },
      webhooks: { status: 'Degraded', error_rate: '2.4%' }
    },
    last_updated: new Date().toISOString()
  });
});

app.get('/api/enterprise/workspaces', authenticateToken, (req, res) => {
  res.json([
    { id: 1, name: 'Acme Corp', tier: 'Enterprise', members: 145, active_scanners: 12 },
    { id: 2, name: 'TechStart LLC', tier: 'Business', members: 42, active_scanners: 3 }
  ]);
});

// ==========================================
// GEMINI RETRY HELPER
// ==========================================
/**
 * Calls Gemini's generateContent with automatic retry on 429 (rate limit).
 * @param {object} model - The Gemini model instance
 * @param {Array}  parts - The content parts to send
 * @param {number} maxRetries - Max number of retries (default: 2)
 * @returns The Gemini response
 */
async function callGeminiWithRetry(model, parts, maxRetries = 2) {
  let lastErr;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await model.generateContent(parts);
    } catch (err) {
      lastErr = err;
      const is429 = err?.status === 429 ||
        (err?.message || '').toLowerCase().includes('too many requests') ||
        (err?.message || '').toLowerCase().includes('resource_exhausted');
      if (is429 && i < maxRetries) {
        const retryAfterMs = (err?.errorDetails?.[0]?.retryDelay
          ? parseInt(err.errorDetails[0].retryDelay) * 1000
          : 7000) + 500;
        console.log(`⏳ Gemini rate-limited (429). Retrying in ${retryAfterMs / 1000}s (attempt ${i + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryAfterMs));
      } else {
        throw err;
      }
    }
  }
  throw lastErr;
}

/**
 * --- UNIFIED EXTRACTION PIPELINE ---
 * Tries Gemini -> OpenAI -> Tesseract
 */
function runTesseractOcrInWorker({ base64Data, lang = 'eng', timeoutMs = 25000 }) {
  return new Promise((resolve) => {
    const workerPath = path.resolve(__dirname, 'src/workers/tesseract_ocr_worker.js');
    const child = spawn(process.execPath, [workerPath], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      try { child.kill(); } catch (_) { /* ignore */ }
      resolve({ ok: false, error: `Tesseract OCR timed out after ${timeoutMs}ms` });
    }, timeoutMs);

    child.stdout.on('data', (buf) => { stdout += buf.toString('utf8'); });
    child.stderr.on('data', (buf) => { stderr += buf.toString('utf8'); });

    child.on('close', (code) => {
      clearTimeout(timer);
      const raw = String(stdout || '').trim();
      if (!raw) {
        const msg = stderr ? stderr.trim() : `Tesseract worker exited (code ${code})`;
        return resolve({ ok: false, error: msg });
      }

      try {
        const parsed = JSON.parse(raw);
        if (parsed?.ok) return resolve({ ok: true, text: String(parsed.text || '') });
        return resolve({ ok: false, error: String(parsed?.error || stderr || 'Tesseract OCR failed') });
      } catch (err) {
        return resolve({
          ok: false,
          error: stderr ? stderr.trim() : `Failed to parse Tesseract output: ${err.message}`
        });
      }
    });

    // Provide langPath to keep OCR offline (traineddata lives in intelliscan-server/).
    const payload = JSON.stringify({
      base64: base64Data,
      lang,
      langPath: __dirname
    });

    try {
      child.stdin.end(payload);
    } catch (err) {
      clearTimeout(timer);
      resolve({ ok: false, error: err.message });
    }
  });
}

async function unifiedExtractionPipeline({ imageBase64, mimeType, prompt, userId, tier, allowTesseract = true }) {
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  const effectiveMime = mimeType || 'image/jpeg';

  // Fetch model statuses to see what is paused
  const modelStatuses = await dbAllAsync('SELECT type, status FROM ai_models');
  // ai_models can contain multiple rows per type (multiple models); treat an engine as active if ANY model is deployed.
  const isEngineActive = (type) => {
    const rows = (modelStatuses || []).filter((m) => m?.type === type);
    if (rows.length === 0) return true; // default to active if not configured
    return rows.some((m) => String(m.status || '').toLowerCase() === 'deployed');
  };

  // 1. Try Gemini (Primary)
  if (isEngineActive('gemini')) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const imageParts = [{ inlineData: { data: base64Data, mimeType: effectiveMime } }];
        const result = await callGeminiWithRetry(model, [prompt, ...imageParts]);
        const text = result.response.text();
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const extracted = extractJsonObjectFromText(cleaned);
        const data = JSON.parse(extracted || cleaned);
        data.engine_used = 'Gemini 1.5 Flash';
        return { data };
      }
    } catch (err) {
      console.error('Gemini Extraction Failed (Falling back to OpenAI):', err.message);
    }
  } else {
    console.log('Gemini Engine is not deployed (paused). Skipping to fallback.');
  }

  // 2. Try OpenAI (Fallback 1)
  if (isEngineActive('openai')) {
    try {
      const oaKey = process.env.OPENAI_API_KEY;
      if (oaKey) {
        const openai = new OpenAI({ apiKey: oaKey });
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: `data:${effectiveMime};base64,${base64Data}` } }
              ]
            }
          ],
          response_format: { type: "json_object" }
        });
        const data = JSON.parse(response.choices[0].message.content);
        data.engine_used = 'ChatGPT 4o-mini';
        return { data };
      }
    } catch (err) {
      console.error('OpenAI Extraction Failed (Falling back to Tesseract):', err.message);
    }
  } else {
    console.log('OpenAI Engine is not deployed (paused). Skipping to fallback.');
  }

  // 3. Try Tesseract (Offline Fallback 2)
  if (allowTesseract && isEngineActive('tesseract')) {
    try {
      console.log('Using Tesseract.js (Offline Fallback)...');
      const tesseractLang = String(process.env.TESSERACT_LANG || 'eng').trim() || 'eng';
      const ocr = await runTesseractOcrInWorker({ base64Data, lang: tesseractLang });
      if (!ocr?.ok) {
        throw new Error(ocr?.error || 'Tesseract OCR failed.');
      }
      const text = String(ocr.text || '');
      
      // Heuristic parsing for Tesseract results
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
      const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
      const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/im);
      
      return {
        data: {
          rejected: false,
          name: lines[0] || 'Unknown Contact',
          company: lines[1] || 'Unknown Company',
          title: lines[2] || 'Professional',
          email: emailMatch ? emailMatch[0] : '',
          phone: phoneMatch ? phoneMatch[0] : '',
          confidence: 65,
          engine_used: 'Tesseract OCR (Offline Fallback)'
        }
      };
    } catch (err) {
      console.error('Tesseract Failed:', err.message);
      return { error: 'All extraction engines failed. Please check your internet or try a clearer photo.', status: 503 };
    }
  } else {
    if (!allowTesseract) {
      return { error: 'Multi-card OCR requires Gemini/OpenAI. Offline OCR is disabled for this operation.', status: 503 };
    }
    return { error: 'No active AI extraction engine is deployed (Gemini/OpenAI/Tesseract are paused).', status: 503 };
  }
}


async function unifiedTextAIPipeline({ prompt, systemPrompt, responseFormat = 'json' }) {
  const combinedPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  // 1. Try Gemini (Primary)
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(combinedPrompt);
      const text = result.response.text();

      if (responseFormat === 'json') {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const extracted = extractJsonObjectFromText(cleaned);
        return { success: true, data: JSON.parse(extracted || cleaned) };
      }
      return { success: true, data: text.trim() };
    }
  } catch (err) {
    console.warn('Gemini Text API Failed (Falling back to OpenAI):', err.message);
  }

  // 2. Try OpenAI (Fallback)
  try {
    const oaKey = process.env.OPENAI_API_KEY;
    if (oaKey) {
      const openai = new OpenAI({ apiKey: oaKey });
      const config = {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: combinedPrompt }]
      };
      if (responseFormat === 'json') {
        config.response_format = { type: "json_object" };
      }

      const response = await openai.chat.completions.create(config);
      const content = response.choices[0].message.content;

      if (responseFormat === 'json') {
        return { success: true, data: JSON.parse(content) };
      }
      return { success: true, data: content.trim() };
    }
  } catch (err) {
    console.error('OpenAI Text API Failed:', err.message);
  }

  return { success: false, error: 'All AI text engines failed.' };
}


// ==========================================
// GEMINI OCR API ENDPOINT
// ==========================================


app.post('/api/scan', authenticateToken, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Check user tier and quota before calling Gemini
    const userRow = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.tier, q.used_count 
        FROM users u 
        LEFT JOIN user_quotas q ON u.id = q.user_id 
        WHERE u.id = ?
      `, [req.user.id], (err, row) => err ? reject(err) : resolve(row));
    });

    const tier = userRow?.tier || 'personal';
    const limits = resolveTierLimits(tier);
    const limit = limits.single;
    await ensureQuotaRow(req.user.id, tier);
    const quotaRow = await dbGetAsync('SELECT used_count FROM user_quotas WHERE user_id = ?', [req.user.id]);

    if ((quotaRow?.used_count || 0) >= limit) {
      const upgradePath = tier === 'personal' ? 'Professional or Enterprise' : 'Enterprise';
      return res.status(403).json({
        error: `Scan limit reached. Your ${tier.toUpperCase()} account is limited to ${limit} single scans. Please upgrade to an ${upgradePath} plan for more scans.`
      });
    }

    const extractionResult = await unifiedExtractionPipeline({
      imageBase64,
      mimeType,
      userId: req.user.id,
      tier,
      prompt: `You are a strict business-card OCR engine.
Classification rules:
- ACCEPT: business cards, ID cards, membership cards, or any printed contact card.
- REJECT: selfies, portraits, random scenes, documents unrelated to a contact card.
- REJECT: images containing multiple separate cards.

For rejected images return ONLY: {"rejected": true, "reason": "Please upload ONLY ONE business card."}

For accepted card images return ONLY:
{
  "rejected": false,
  "name": "Person Name",
  "name_native": "Original script name if non-Latin, else empty",
  "company": "Company Name",
  "company_native": "Original script company if non-Latin, else empty",
  "title": "Job title",
  "title_native": "Original script title if non-Latin, else empty",
  "email": "Email Address",
  "phone": "Phone Number",
  "website": "Website URL",
  "address": "Full Physical Address",
  "detected_language": "Primary detected language",
  "inferred_industry": "Technology, Real Estate, Finance, Healthcare, Manufacturing, Education, Retail, else empty",
  "inferred_seniority": "CXO / Founder, VP / Director, Senior, Mid-Level, Entry-Level, else empty",
  "deal_score": 85, // Integer 0-100 based on title, company, and email domain (enterprise = higher)
  "linkedin_url": "https://linkedin.com/in/username-prediction", // Predict URL if not on card
  "linkedin_bio": "Short AI-generated professional summary (max 20 words)",
  "confidence": 95,
  "engine_used": "Gemini 2.5 Flash Enterprise"
}`
    });

    if (extractionResult.error) {
      if (shouldUseMockAiFallback()) {
        console.log("All Single-Card engines failed. Returning Offline Mock Fallback.");
        return res.json({
          rejected: false,
          ...buildFallbackSingleCardResponse()
        });
      }
      return res.status(extractionResult.status || 500).json({ error: extractionResult.error });
    }

    const scannedData = extractionResult.data;

    // If Gemini/OpenAI flagged the image as rejected, return a 422
    if (scannedData.rejected === true) {
      return res.status(422).json({
        error: scannedData.reason || 'Invalid image type. Please upload a single business card photo.',
        is_multi_card: true
      });
    }


    const normalizedCard = normalizeExtractedCard(scannedData, { fallbackConfidence: 72 });
    if (!hasMeaningfulContactData(normalizedCard)) {
      return res.status(422).json({
        error: 'No contact fields were confidently extracted. Please retake the photo with better lighting and focus.'
      });
    }

    res.json({
      rejected: false,
      ...normalizedCard,
      engine_used: scannedData.engine_used || 'Gemini 2.5 Flash Enterprise'
    });
  } catch (error) {
    console.error('OCR Error:', error);
    if (shouldUseMockAiFallback()) {
      return res.json(buildFallbackSingleCardResponse());
    }
    res.status(500).json({ error: 'Failed to process image with Gemini AI', details: error.message });
  }
});

// ==========================================
// MULTI-CARD SCAN (Scan many cards from one photo)
// ==========================================
app.post('/api/scan-multi', authenticateToken, requireFeature('batch_upload'), async (req, res) => {
  console.log('📬 Received MULTI-SCAN request from:', req.user.email);
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

    // Check user tier and group scan quota before calling Gemini
    const userRow = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.tier, q.group_scans_used 
        FROM users u 
        LEFT JOIN user_quotas q ON u.id = q.user_id 
        WHERE u.id = ?
      `, [req.user.id], (err, row) => err ? reject(err) : resolve(row));
    });

    const tier = userRow?.tier || 'personal';
    const limits = resolveTierLimits(tier);
    const groupLimit = limits.group;
    await ensureQuotaRow(req.user.id, tier);
    const quotaRow = await dbGetAsync('SELECT group_scans_used FROM user_quotas WHERE user_id = ?', [req.user.id]);

    if ((quotaRow?.group_scans_used || 0) >= groupLimit) {
      const upgradePath = tier === 'personal' ? 'Professional or Enterprise' : 'Enterprise';
      return res.status(403).json({
        error: `Group Photo limit reached. Your ${tier.toUpperCase()} account is limited to ${groupLimit} group scans. Please upgrade to an ${upgradePath} plan to scan multiple cards at once.`
      });
    }

    const extractionResult = await unifiedExtractionPipeline({
      imageBase64,
      mimeType,
      userId: req.user.id,
      tier,
      allowTesseract: false,
      prompt: `You are a strict business-card OCR engine for GROUP PHOTOS.
The image can contain 2-25 separate business cards laid flat.
Cards may be in ANY language/script. Preserve native script fields when present.

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "engine_used": "Gemini Group OCR",
  "cards": [
    {
      "name": "Person Name (Latin/English if possible)",
      "name_native": "Original script name if non-Latin, else empty",
      "company": "Company Name (Latin/English if possible)",
      "company_native": "Original script company if non-Latin, else empty",
      "title": "Job title (Latin/English if possible)",
      "title_native": "Original script title if non-Latin, else empty",
      "email": "Email Address",
      "phone": "Phone Number",
      "website": "Website URL",
      "address": "Full Physical Address",
      "detected_language": "Primary detected language",
      "inferred_industry": "Technology, Real Estate, Finance, Healthcare, Manufacturing, Education, Retail, else empty",
      "inferred_seniority": "CXO / Founder, VP / Director, Senior, Mid-Level, Entry-Level, else empty",
      "deal_score": 80,
      "linkedin_url": "https://linkedin.com/in/username-prediction",
      "linkedin_bio": "Short AI-generated professional summary (max 20 words)",
      "confidence": 95
    }
  ]
}

If you cannot detect any cards, return:
{ "cards": [] }`
    });

    if (extractionResult.error) {
      if (shouldUseMockAiFallback()) {
        // Count this as a group scan attempt even in fallback mode.
        await dbRunAsync('UPDATE user_quotas SET group_scans_used = group_scans_used + 1 WHERE user_id = ?', [req.user.id]);
        return res.json(buildFallbackMultiCardResponse());
      }
      return res.status(extractionResult.status || 500).json({ error: extractionResult.error });
    }

    const parsed = extractionResult.data;

    // Tesseract is an offline single-image OCR; it cannot reliably segment 2-25 cards from a group photo.
    // If we fell back to Tesseract here, prefer a deterministic multi-card fallback instead of returning gibberish.
    if (String(parsed?.engine_used || '').toLowerCase().includes('tesseract')) {
      if (shouldUseMockAiFallback()) {
        return res.json(buildFallbackMultiCardResponse());
      }
      return res.status(503).json({
        error: 'Multi-card OCR requires Gemini/OpenAI. Offline OCR cannot reliably detect multiple cards from one photo.'
      });
    }

    // Handle Tesseract fallback which might not return a 'cards' array
    if (!parsed.cards && !parsed.rejected) {
       parsed.cards = [parsed]; // Wrap single result from Tesseract in array
       parsed.total_detected = 1;
    }

    if (!parsed.cards || !Array.isArray(parsed.cards)) {
      return res.status(422).json({ error: 'No business cards were detected in this image. Try placing cards flat and making sure they are well-lit.' });
    }


    const normalizedCards = (parsed.cards || [])
      .map((card) => normalizeExtractedCard(card, { fallbackConfidence: 68 }))
      .filter((card) => hasMeaningfulContactData(card));

    if (normalizedCards.length === 0) {
      return res.status(422).json({ error: 'No business cards were detected in this image. Try placing all cards face-up on a flat surface.' });
    }

    // Per-card duplicate check against the user's existing contacts
    const userId = req.user.id;
    const checkDuplicate = (email, name) => new Promise((resolve) => {
      if (!email && !name) return resolve(false);
      const q = email
        ? 'SELECT id FROM contacts WHERE user_id = ? AND (LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)) LIMIT 1'
        : 'SELECT id FROM contacts WHERE user_id = ? AND LOWER(name) = LOWER(?) LIMIT 1';
      const params = email ? [userId, email, name] : [userId, name];
      db.get(q, params, (err, row) => resolve(!!row));
    });

    // Also track names seen within this batch to catch intra-batch duplicates
    const seenThisBatch = new Set();
    const cardsWithDupInfo = await Promise.all(normalizedCards.map(async (card, idx) => {
      const keyBase = `${(card.email || '').toLowerCase()}|${(card.name || '').toLowerCase()}|${(card.phone || '').toLowerCase()}|${(card.company || '').toLowerCase()}`;
      const key = keyBase === '|||' ? `unknown-${idx}` : keyBase;
      const isIntraBatchDup = seenThisBatch.has(key);
      seenThisBatch.add(key);
      const isDbDup = await checkDuplicate(card.email, card.name);
      return { ...card, is_duplicate: isDbDup || isIntraBatchDup };
    }));

    // Successful multi-card scan: consume one group-photo scan credit.
    await dbRunAsync('UPDATE user_quotas SET group_scans_used = group_scans_used + 1 WHERE user_id = ?', [req.user.id]);

    res.json({
      cards: cardsWithDupInfo,
      total_detected: cardsWithDupInfo.length,
      engine_used: parsed.engine_used || 'Gemini 2.5 Flash Multi-Card'
    });

  } catch (error) {
    console.error('Multi-Card OCR Error:', error);
    if (shouldUseMockAiFallback()) {
      try {
        await dbRunAsync('UPDATE user_quotas SET group_scans_used = group_scans_used + 1 WHERE user_id = ?', [req.user.id]);
      } catch (_) {
        // Quota update failure should not break the UX fallback.
      }
      return res.json(buildFallbackMultiCardResponse());
    }
    res.status(500).json({ error: 'Failed to process multi-card image', details: error.message });
  }
});



// ==========================================
// GEMINI SUPPORT CHATBOT API
// ==========================================
app.post('/api/chat/support', authenticateToken, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Valid messages array required' });
    }

    // Format the history for the AI Engine (excluding the newest user message, which we pass to sendMessage)
    // Actually, simple approach: just pass a combined context string
    let conversationContext = `System Instruction: You are the IntelliScan AI Support Assistant — a highly knowledgeable, friendly, and professional product expert.
You are helping user ${req.user.name} (${req.user.email}).
Their account type is: ${req.user.role === 'business_admin' ? 'Enterprise Workspace Admin' : 'Personal Free Plan User'}.

You have deep knowledge of the entire IntelliScan platform:
- OCR scanning pipeline: users upload business card images which are processed by Gemini AI to extract structured contact data (name, email, phone, company, title, address, confidence %).
- Credit Points system: Free plan users get 100 Credit Points (each scan deducts 1). Enterprise admins get 500. Points reset on plan renew.
- Contacts page: supports Grid and List view, shows scan timestamps, confidence scores, exportable to XLSX.
- Workspace (Enterprise): shared rolodex, AI email drafting, calendar events, real-time chat with teammates.
- Chatbot: this very assistant, powered by Gemini, accessible from any dashboard page.
- Duplicate detection: if the same card (same name + email) is scanned again, the system blocks it with a "Duplicate Detected" error.
- Authentication: JWT-based, 24h expiry. Sign up via /sign-up, log in via /sign-in.

Be helpful, warm, and concise. Answer any question about how to use any feature of IntelliScan. If something is unclear, ask a clarifying question.\n\nConversation History:\n`;

    messages.forEach(m => {
      conversationContext += `${m.role.toUpperCase()}: ${m.content}\n`;
    });

    conversationContext += "\nASSISTANT: ";

    const reply = await generateWithFallback(conversationContext);

    res.json({ reply: reply.trim() });
  } catch (err) {
    console.error('Chat API Error:', err);
    res.status(500).json({ error: 'Failed to contact AI engines: ' + err.message });
  }
});

// ==========================================
// ANALYTICS & TRACKING API ENDPOINTS
// ==========================================

app.post('/api/analytics/log', (req, res) => {
  const { user_role, user_email, action, path, duration_ms } = req.body;
  db.run(
    'INSERT INTO analytics_logs (user_role, user_email, action, path, duration_ms) VALUES (?, ?, ?, ?, ?)',
    [user_role || 'anonymous', user_email || null, action, path, duration_ms || 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(204).send();
    }
  );
});

app.get('/api/analytics/stats', (req, res) => {
  const queries = {
    total_visits: 'SELECT COUNT(*) as count FROM analytics_logs WHERE action = "page_view"',
    total_clicks: 'SELECT COUNT(*) as count FROM analytics_logs WHERE action = "click"',
    top_paths: 'SELECT path, COUNT(*) as count FROM analytics_logs WHERE action = "page_view" GROUP BY path ORDER BY count DESC LIMIT 5',
    avg_duration: 'SELECT AVG(duration_ms) as avg FROM analytics_logs WHERE action = "page_view" AND duration_ms > 0',
    unique_users: 'SELECT COUNT(DISTINCT user_email) as count FROM analytics_logs WHERE user_email IS NOT NULL AND user_email != ""'
  };

  db.get(queries.total_visits, [], (err, visitsRow) => {
    db.get(queries.total_clicks, [], (err, clicksRow) => {
      db.get(queries.avg_duration, [], (err, avgRow) => {
        db.get(queries.unique_users, [], (err, usersRow) => {
          db.all(queries.top_paths, [], (err, topPaths) => {
            res.json({
              totalVisits: visitsRow ? visitsRow.count : 0,
              totalClicks: clicksRow ? clicksRow.count : 0,
              avgTimeSeconds: avgRow && avgRow.avg ? (avgRow.avg / 1000).toFixed(1) : 0,
              registeredUsersTracked: usersRow ? usersRow.count : 0,
              topPaths: topPaths || []
            });
          });
        });
      });
    });
  });
});

// ==========================================
// SESSION MANAGEMENT API ENDPOINTS
// ==========================================

app.get('/api/sessions/me', authenticateToken, (req, res) => {
  db.all('SELECT id, device_info, ip_address, location, last_active, is_active FROM sessions WHERE user_id = ? ORDER BY last_active DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Identify current session by matching token
    const authHeader = req.headers['authorization'];
    const currentToken = authHeader && authHeader.split(' ')[1];

    // We shouldn't send the raw token back, so just use it server side to mark isCurrent
    // We need the token in the DB to match, let's fetch it too
    db.all('SELECT id, token FROM sessions WHERE user_id = ?', [req.user.id], (err2, tokenRows) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const sessionMap = new Map();
      tokenRows.forEach(row => sessionMap.set(row.id, row.token));

      const enrichedRows = rows.map(row => ({
        ...row,
        isCurrent: sessionMap.get(row.id) === currentToken
      }));
      res.json(enrichedRows);
    });
  });
});

app.delete('/api/sessions/others', authenticateToken, (req, res) => {
  const authHeader = req.headers['authorization'];
  const currentToken = authHeader && authHeader.split(' ')[1];

  db.run('DELETE FROM sessions WHERE user_id = ? AND token != ?', [req.user.id, currentToken], function (err) {
    if (err) {
      logAuditEvent(req, {
        action: 'SESSION_REVOKE_OTHERS',
        resource: '/api/sessions/others',
        status: AUDIT_ERROR,
        details: { error: err.message }
      });
      return res.status(500).json({ error: err.message });
    }
    logAuditEvent(req, {
      action: 'SESSION_REVOKE_OTHERS',
      resource: '/api/sessions/others',
      status: AUDIT_SUCCESS,
      details: { revoked_count: this.changes }
    });
    res.json({ message: `Successfully logged out from ${this.changes} other devices`, count: this.changes });
  });
});

app.delete('/api/sessions/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM sessions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function (err) {
    if (err) {
      logAuditEvent(req, {
        action: 'SESSION_REVOKE_ONE',
        resource: `/api/sessions/${req.params.id}`,
        status: AUDIT_ERROR,
        details: { error: err.message, session_id: req.params.id }
      });
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      logAuditEvent(req, {
        action: 'SESSION_REVOKE_ONE',
        resource: `/api/sessions/${req.params.id}`,
        status: AUDIT_DENIED,
        details: { reason: 'session_not_found', session_id: req.params.id }
      });
      return res.status(404).json({ error: 'Session not found' });
    }
    logAuditEvent(req, {
      action: 'SESSION_REVOKE_ONE',
      resource: `/api/sessions/${req.params.id}`,
      status: AUDIT_SUCCESS,
      details: { session_id: req.params.id }
    });
    res.json({ message: 'Session revoked successfully' });
  });
});

// ==========================================
// ENGINE CONFIG & PERFORMANCE ENDPOINTS
// ==========================================

app.get('/api/engine/config', authenticateToken, (req, res) => {
  db.all('SELECT key, value FROM engine_config', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const config = Object.fromEntries(rows.map(row => [row.key, row.value]));
    res.json(config);
  });
});

app.put('/api/engine/config', authenticateToken, (req, res) => {
  const updates = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Save each key-value pair
    for (const [key, value] of Object.entries(updates)) {
      db.run('INSERT OR REPLACE INTO engine_config (key, value) VALUES (?, ?)', [key, String(value)]);
    }

    db.run('COMMIT', (err) => {
      if (err) {
        logAuditEvent(req, {
          action: 'ENGINE_CONFIG_UPDATE',
          resource: '/api/engine/config',
          status: AUDIT_ERROR,
          details: { error: err.message, keys: Object.keys(updates || {}) }
        });
        return res.status(500).json({ error: err.message });
      }
      logAuditEvent(req, {
        action: 'ENGINE_CONFIG_UPDATE',
        resource: '/api/engine/config',
        status: AUDIT_SUCCESS,
        details: { keys: Object.keys(updates || {}) }
      });
      res.json({ message: 'Settings updated successfully' });
    });
  });
});

app.get('/api/engine/versions', authenticateToken, (req, res) => {
  db.all('SELECT * FROM model_versions ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/engine/versions/:id/rollback', authenticateToken, (req, res) => {
  const versionId = req.params.id;
  db.serialize(() => {
    db.run("UPDATE model_versions SET status = 'standby'");
    db.run("UPDATE model_versions SET status = 'active' WHERE id = ?", [versionId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Version not found' });
      res.json({ message: 'Rolled back to version successfully' });
    });
  });
});

app.get('/api/engine/stats', authenticateToken, (req, res) => {
  // Live computed stats based on actual contacts and sandbox executions
  db.get('SELECT COUNT(*) as total, AVG(confidence) as avgConf FROM contacts', [], (err, contactsRow) => {
    if (err) return res.status(500).json({ error: err.message });

    db.get('SELECT COUNT(*) as api_calls, AVG(latency_ms) as latency FROM api_sandbox_calls', [], (err, apiRow) => {
      res.json({
        total_scans: contactsRow.total || 0,
        average_confidence: contactsRow.avgConf || 95,
        api_requests_24h: apiRow.api_calls || 142,
        throughput_avg_ms: apiRow.latency || 420,
        active_nodes: 12,
        memory_usage: '64%',
        queue_depth: 3
      });
    });
  });
});

// ==========================================
// API SANDBOX ENDPOINTS
// ==========================================

app.post('/api/sandbox/test', authenticateToken, (req, res) => {
  const payload = req.body;
  const start = Date.now();

  // Simulate AI extraction processing over a document payload
  setTimeout(() => {
    const latency = Date.now() - start;
    const responseData = {
      status: "success",
      request_id: "req_" + Math.random().toString(36).substr(2, 8),
      data: {
        merchant: "TEST-PAYLOAD-MERCHANT",
        tax_id: "99-1234567",
        total: Math.floor(Math.random() * 500) + 50,
        currency: "USD",
        meta: {
          engine: payload.engine || "OCR-PRO-V3",
          confidence: 0.98
        }
      }
    };

    // Log the API call
    db.run(
      'INSERT INTO api_sandbox_calls (user_id, payload, response, status_code, latency_ms, engine) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, JSON.stringify(payload), JSON.stringify(responseData), 200, latency, payload.engine || "OCR-PRO-V3"],
      (err) => {
        if (err) console.error("Could not log API sandbox call", err);
        res.json({ ...responseData, _latency_ms: latency });
      }
    );
  }, 400); // simulate 400ms processing delay
});

app.get('/api/sandbox/logs', authenticateToken, (req, res) => {
  db.all('SELECT * FROM api_sandbox_calls WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/api/sandbox/logs', authenticateToken, (req, res) => {
  db.run('DELETE FROM api_sandbox_calls WHERE user_id = ?', [req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Logs cleared', count: this.changes });
  });
});

// ==========================================
// PHASE 8: EVENTS, DRAFTS, & CHATS APIs
// ==========================================

// --- CRM Export API ---
app.post('/api/contacts/export-crm', authenticateToken, async (req, res) => {
  const { provider, contactIds } = req.body;

  if (!provider || !contactIds || !Array.isArray(contactIds)) {
    logAuditEvent(req, {
      action: 'CRM_SYNC_TRIGGER',
      resource: '/api/contacts/export-crm',
      status: AUDIT_DENIED,
      details: { reason: 'invalid_payload' }
    });
    return res.status(400).json({ error: 'Invalid payload. Provide provider string and contactIds array.' });
  }

  if (contactIds.length === 0) {
    logAuditEvent(req, {
      action: 'CRM_SYNC_TRIGGER',
      resource: '/api/contacts/export-crm',
      status: AUDIT_DENIED,
      details: { reason: 'empty_contact_set', provider }
    });
    return res.status(400).json({ error: 'At least one contact id is required.' });
  }

  try {
    const workspaceId = await getWorkspaceIdForUser(req.user.id);
    const scopeWorkspaceId = getScopeWorkspaceId(workspaceId, req.user.id);
    const payloadJson = JSON.stringify({
      provider,
      contactIds: [...new Set(contactIds)],
      triggered_at: new Date().toISOString()
    });

    const inserted = await dbRunAsync(
      `INSERT INTO integration_sync_jobs
      (user_id, workspace_id, provider, contact_count, payload_json, status, retry_count, max_retries)
      VALUES (?, ?, ?, ?, ?, 'queued', 0, 3)`,
      [req.user.id, scopeWorkspaceId, String(provider).toLowerCase(), contactIds.length, payloadJson]
    );

    const jobId = inserted.lastID;
    await dbRunAsync(
      `UPDATE integration_sync_jobs
       SET status = 'processing', last_attempt_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [jobId]
    );

    await new Promise((resolve) => setTimeout(resolve, getProviderLatencyMs(provider)));

    const syncSucceeded = simulateProviderSyncOutcome(provider, 0);
    if (syncSucceeded) {
      const uniqueContactIds = [...new Set(contactIds.map((id) => Number(id)).filter(Boolean))];
      if (uniqueContactIds.length > 0) {
        const placeholders = uniqueContactIds.map(() => '?').join(', ');
        await dbRunAsync(
          `UPDATE contacts
           SET crm_synced = 1, crm_synced_at = CURRENT_TIMESTAMP
           WHERE user_id = ? AND id IN (${placeholders})`,
          [req.user.id, ...uniqueContactIds]
        );
      }

      await dbRunAsync(
        `UPDATE integration_sync_jobs
         SET status = 'succeeded', last_error = NULL, succeeded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [jobId]
      );

      logAuditEvent(req, {
        action: 'CRM_SYNC_TRIGGER',
        resource: '/api/contacts/export-crm',
        status: AUDIT_SUCCESS,
        details: { job_id: jobId, provider, contact_count: contactIds.length }
      });

      return res.json({
        success: true,
        provider,
        job_id: jobId,
        status: 'succeeded',
        synced_count: contactIds.length,
        message: `Successfully synchronized ${contactIds.length} leads to ${String(provider).charAt(0).toUpperCase() + String(provider).slice(1)}.`
      });
    }

    const errorMessage = `Provider ${provider} temporarily rejected sync request (simulated remote error).`;
    await dbRunAsync(
      `UPDATE integration_sync_jobs
       SET status = 'failed', retry_count = 1, last_error = ?, next_retry_at = datetime('now', '+5 minutes'), updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [errorMessage, jobId]
    );

    logAuditEvent(req, {
      action: 'CRM_SYNC_TRIGGER',
      resource: '/api/contacts/export-crm',
      status: AUDIT_ERROR,
      details: { job_id: jobId, provider, contact_count: contactIds.length, error: errorMessage }
    });

    return res.status(502).json({
      success: false,
      provider,
      job_id: jobId,
      status: 'failed',
      message: `Sync failed for ${provider}. Job queued for retry from Integration Health Dashboard.`,
      error: errorMessage
    });
  } catch (error) {
    logAuditEvent(req, {
      action: 'CRM_SYNC_TRIGGER',
      resource: '/api/contacts/export-crm',
      status: AUDIT_ERROR,
      details: { error: error.message, provider, contact_count: Array.isArray(contactIds) ? contactIds.length : 0 }
    });
    return res.status(500).json({ error: error.message });
  }
});

// --- Integration Health Dashboard APIs ---
app.get('/api/admin/integrations/health', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const summary = await dbGetAsync(`
      SELECT
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) as queued,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) as succeeded,
        SUM(CASE WHEN status IN ('failed', 'retry_queued') THEN 1 ELSE 0 END) as failed_or_retry_queued,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'retry_queued' THEN 1 ELSE 0 END) as retry_queued
      FROM integration_sync_jobs
    `);

    const providerStats = await dbAllAsync(`
      SELECT
        provider,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) as succeeded,
        SUM(CASE WHEN status IN ('failed', 'retry_queued') THEN 1 ELSE 0 END) as failed
      FROM integration_sync_jobs
      GROUP BY provider
      ORDER BY total DESC, provider ASC
    `);

    const failedSyncs = await dbAllAsync(`
      SELECT id, provider, contact_count, status, retry_count, max_retries, last_error, next_retry_at, updated_at, created_at
      FROM integration_sync_jobs
      WHERE status IN ('failed', 'retry_queued')
      ORDER BY datetime(updated_at) DESC
      LIMIT 100
    `);

    const recentJobs = await dbAllAsync(`
      SELECT id, provider, contact_count, status, retry_count, max_retries, last_error, created_at, updated_at, succeeded_at
      FROM integration_sync_jobs
      ORDER BY datetime(created_at) DESC
      LIMIT 40
    `);

    res.json({
      summary: {
        total_jobs: Number(summary?.total_jobs || 0),
        queued: Number(summary?.queued || 0),
        processing: Number(summary?.processing || 0),
        succeeded: Number(summary?.succeeded || 0),
        failed: Number(summary?.failed || 0),
        retry_queued: Number(summary?.retry_queued || 0),
        failed_or_retry_queued: Number(summary?.failed_or_retry_queued || 0)
      },
      provider_stats: (providerStats || []).map((row) => ({
        provider: row.provider,
        total: Number(row.total || 0),
        succeeded: Number(row.succeeded || 0),
        failed: Number(row.failed || 0),
        success_rate: Number(row.total || 0) > 0 ? Math.round((Number(row.succeeded || 0) / Number(row.total || 0)) * 100) : 0
      })),
      failed_syncs: failedSyncs || [],
      recent_jobs: recentJobs || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/integrations/failed-syncs', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const provider = req.query.provider ? String(req.query.provider).toLowerCase() : null;
    const filters = [`status IN ('failed', 'retry_queued')`];
    const params = [];

    if (provider) {
      filters.push('provider = ?');
      params.push(provider);
    }

    const rows = await dbAllAsync(
      `SELECT id, user_id, workspace_id, provider, contact_count, status, retry_count, max_retries, last_error, next_retry_at, created_at, updated_at
       FROM integration_sync_jobs
       WHERE ${filters.join(' AND ')}
       ORDER BY datetime(updated_at) DESC
       LIMIT 200`,
      params
    );

    res.json({ queue: rows || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/integrations/failed-syncs/:id/retry', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const jobId = Number(req.params.id);
    if (!jobId) return res.status(400).json({ error: 'Invalid job id' });

    const job = await dbGetAsync('SELECT * FROM integration_sync_jobs WHERE id = ?', [jobId]);
    if (!job) return res.status(404).json({ error: 'Sync job not found' });
    if (job.status === 'succeeded') return res.status(400).json({ error: 'Job already succeeded' });

    const nextRetryCount = Number(job.retry_count || 0) + 1;
    if (nextRetryCount > Number(job.max_retries || 3) + 1) {
      return res.status(409).json({ error: 'Retry limit exceeded for this job' });
    }

    await dbRunAsync(
      `UPDATE integration_sync_jobs
       SET status = 'processing', retry_count = ?, last_attempt_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nextRetryCount, jobId]
    );

    await new Promise((resolve) => setTimeout(resolve, Math.max(900, Math.floor(getProviderLatencyMs(job.provider) * 0.7))));
    const succeeded = simulateProviderSyncOutcome(job.provider, nextRetryCount);

    if (succeeded) {
      await dbRunAsync(
        `UPDATE integration_sync_jobs
         SET status = 'succeeded', last_error = NULL, next_retry_at = NULL, succeeded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [jobId]
      );

      logAuditEvent(req, {
        action: 'CRM_SYNC_RETRY',
        resource: `/api/admin/integrations/failed-syncs/${jobId}/retry`,
        status: AUDIT_SUCCESS,
        details: { job_id: jobId, provider: job.provider, retry_count: nextRetryCount }
      });

      return res.json({
        success: true,
        job_id: jobId,
        status: 'succeeded',
        message: `Retry succeeded for ${job.provider} sync job #${jobId}.`
      });
    }

    const exhausted = nextRetryCount >= Number(job.max_retries || 3);
    const nextStatus = exhausted ? 'failed' : 'retry_queued';
    const errorMessage = `Retry attempt ${nextRetryCount} failed for ${job.provider}.`;
    await dbRunAsync(
      `UPDATE integration_sync_jobs
       SET status = ?, last_error = ?, next_retry_at = CASE WHEN ? = 1 THEN NULL ELSE datetime('now', '+5 minutes') END, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nextStatus, errorMessage, exhausted ? 1 : 0, jobId]
    );

    logAuditEvent(req, {
      action: 'CRM_SYNC_RETRY',
      resource: `/api/admin/integrations/failed-syncs/${jobId}/retry`,
      status: exhausted ? AUDIT_ERROR : AUDIT_DENIED,
      details: { job_id: jobId, provider: job.provider, retry_count: nextRetryCount, exhausted, error: errorMessage }
    });

    return res.status(502).json({
      success: false,
      job_id: jobId,
      status: nextStatus,
      message: exhausted
        ? `Retry failed and max retries reached for job #${jobId}.`
        : `Retry failed for job #${jobId}. Job kept in retry queue.`,
      error: errorMessage
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// --- Data Quality Center APIs ---
app.get('/api/workspace/data-quality/dedupe-queue', authenticateToken, async (req, res) => {
  try {
    const workspaceId = await getWorkspaceIdForUser(req.user.id);
    const scopeWorkspaceId = getScopeWorkspaceId(workspaceId, req.user.id);

    const contacts = workspaceId
      ? await dbAllAsync(
        `SELECT c.*
         FROM contacts c
         JOIN users u ON c.user_id = u.id
         WHERE u.workspace_id = ?
         ORDER BY datetime(c.scan_date) DESC`,
        [workspaceId]
      )
      : await dbAllAsync(
        `SELECT c.* FROM contacts c WHERE c.user_id = ? ORDER BY datetime(c.scan_date) DESC`,
        [req.user.id]
      );

    await rebuildDedupeQueueForScope(scopeWorkspaceId, contacts);

    const queueRows = await dbAllAsync(
      `SELECT *
       FROM data_quality_dedupe_queue
       WHERE workspace_id = ?
       ORDER BY
         CASE status WHEN 'pending' THEN 0 WHEN 'merged' THEN 1 ELSE 2 END,
         confidence DESC,
         datetime(updated_at) DESC`,
      [scopeWorkspaceId]
    );

    const contactById = new Map((contacts || []).map((c) => [c.id, c]));
    const queue = (queueRows || []).map((row) => {
      let contactIds = [];
      try {
        contactIds = JSON.parse(row.contact_ids_json || '[]');
      } catch (_) {
        contactIds = [];
      }

      const groupContacts = contactIds.map((id) => contactById.get(id)).filter(Boolean);
      const preferredPrimary = groupContacts.find((c) => c.id === row.primary_contact_id);
      const primary = preferredPrimary || selectPrimaryContact(groupContacts) || groupContacts[0] || null;
      const duplicates = groupContacts.filter((c) => primary && c.id !== primary.id);

      return {
        id: row.id,
        status: row.status,
        reason: row.reason,
        confidence: row.confidence,
        fingerprint: row.fingerprint,
        created_at: row.created_at,
        updated_at: row.updated_at,
        primary_contact_id: primary?.id || row.primary_contact_id,
        primary_contact: primary,
        duplicates,
        contact_ids: contactIds,
        merge_suggestions: buildFieldMergeSuggestions(primary, duplicates)
      };
    });

    const summary = queue.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, { pending: 0, merged: 0, dismissed: 0 });

    res.json({
      queue,
      summary,
      impacted_contacts: new Set(queue.flatMap((item) => item.contact_ids)).size,
      refreshed_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workspace/data-quality/queue/:id/merge', authenticateToken, async (req, res) => {
  try {
    const queueId = Number(req.params.id);
    if (!queueId) return res.status(400).json({ error: 'Invalid queue id' });

    const workspaceId = await getWorkspaceIdForUser(req.user.id);
    const scopeWorkspaceId = getScopeWorkspaceId(workspaceId, req.user.id);

    const queueRow = await dbGetAsync(
      `SELECT * FROM data_quality_dedupe_queue WHERE id = ? AND workspace_id = ?`,
      [queueId, scopeWorkspaceId]
    );
    if (!queueRow) return res.status(404).json({ error: 'Queue item not found' });
    if (queueRow.status !== 'pending') return res.status(400).json({ error: `Queue item already ${queueRow.status}` });

    let contactIds = [];
    try {
      contactIds = JSON.parse(queueRow.contact_ids_json || '[]');
    } catch (_) {
      contactIds = [];
    }

    if (!Array.isArray(contactIds) || contactIds.length < 2) {
      return res.status(400).json({ error: 'Queue item does not contain enough contacts to merge' });
    }

    const placeholders = contactIds.map(() => '?').join(', ');
    const contacts = await dbAllAsync(
      `SELECT * FROM contacts WHERE id IN (${placeholders})`,
      contactIds
    );
    if ((contacts || []).length < 2) {
      return res.status(400).json({ error: 'Some contacts are no longer available for merge' });
    }

    const requestedPrimaryId = Number(req.body?.primary_contact_id || queueRow.primary_contact_id);
    let primary = contacts.find((c) => c.id === requestedPrimaryId);
    if (!primary) primary = selectPrimaryContact(contacts);
    const duplicates = contacts.filter((c) => c.id !== primary.id);
    if (duplicates.length === 0) return res.status(400).json({ error: 'No duplicates left to merge' });

    const merged = { ...primary };
    const mergeFields = ['name', 'email', 'phone', 'company', 'job_title', 'notes', 'tags', 'inferred_industry', 'inferred_seniority', 'image_url'];
    mergeFields.forEach((field) => {
      if (merged[field]) return;
      const candidate = duplicates.find((d) => d[field]);
      if (candidate?.[field]) merged[field] = candidate[field];
    });
    merged.confidence = Math.max(Number(primary.confidence || 0), ...duplicates.map((d) => Number(d.confidence || 0)));

    await dbRunAsync(
      `UPDATE contacts
       SET name = ?, email = ?, phone = ?, company = ?, job_title = ?, confidence = ?, image_url = ?, notes = ?, tags = ?, inferred_industry = ?, inferred_seniority = ?
       WHERE id = ?`,
      [
        merged.name || null,
        merged.email || null,
        merged.phone || null,
        merged.company || null,
        merged.job_title || null,
        merged.confidence || 0,
        merged.image_url || null,
        merged.notes || null,
        merged.tags || null,
        merged.inferred_industry || null,
        merged.inferred_seniority || null,
        primary.id
      ]
    );

    for (const duplicate of duplicates) {
      await dbRunAsync('UPDATE ai_drafts SET contact_id = ?, contact_name = ? WHERE contact_id = ?', [primary.id, merged.name || primary.name || '', duplicate.id]);
      await dbRunAsync('DELETE FROM contact_relationships WHERE from_contact_id = ? OR to_contact_id = ?', [duplicate.id, duplicate.id]);
    }

    const duplicateIds = duplicates.map((d) => d.id);
    const dupPlaceholders = duplicateIds.map(() => '?').join(', ');
    await dbRunAsync(`DELETE FROM contacts WHERE id IN (${dupPlaceholders})`, duplicateIds);

    await dbRunAsync(
      `UPDATE data_quality_dedupe_queue
       SET status = 'merged', merged_contact_id = ?, resolved_by = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [primary.id, req.user.id, queueId]
    );

    logAuditEvent(req, {
      action: 'DATA_QUALITY_MERGE',
      resource: `/api/workspace/data-quality/queue/${queueId}/merge`,
      status: AUDIT_SUCCESS,
      details: {
        queue_id: queueId,
        merged_into: primary.id,
        removed_contact_ids: duplicateIds,
        workspace_scope: scopeWorkspaceId
      }
    });

    res.json({
      success: true,
      queue_id: queueId,
      merged_into: primary.id,
      removed_contact_ids: duplicateIds,
      message: `Merged ${duplicateIds.length + 1} contacts into primary record #${primary.id}.`
    });
  } catch (error) {
    logAuditEvent(req, {
      action: 'DATA_QUALITY_MERGE',
      resource: `/api/workspace/data-quality/queue/${req.params.id}/merge`,
      status: AUDIT_ERROR,
      details: { error: error.message }
    });
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workspace/data-quality/queue/:id/dismiss', authenticateToken, async (req, res) => {
  try {
    const queueId = Number(req.params.id);
    if (!queueId) return res.status(400).json({ error: 'Invalid queue id' });

    const workspaceId = await getWorkspaceIdForUser(req.user.id);
    const scopeWorkspaceId = getScopeWorkspaceId(workspaceId, req.user.id);

    const updated = await dbRunAsync(
      `UPDATE data_quality_dedupe_queue
       SET status = 'dismissed', resolved_by = ?, resolution_note = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND workspace_id = ? AND status = 'pending'`,
      [req.user.id, String(req.body?.reason || 'Dismissed by reviewer').slice(0, 300), queueId, scopeWorkspaceId]
    );
    if (updated.changes === 0) return res.status(404).json({ error: 'Pending queue item not found' });

    logAuditEvent(req, {
      action: 'DATA_QUALITY_DISMISS',
      resource: `/api/workspace/data-quality/queue/${queueId}/dismiss`,
      status: AUDIT_SUCCESS,
      details: { queue_id: queueId, workspace_scope: scopeWorkspaceId }
    });

    res.json({ success: true, queue_id: queueId, message: 'Queue item dismissed.' });
  } catch (error) {
    logAuditEvent(req, {
      action: 'DATA_QUALITY_DISMISS',
      resource: `/api/workspace/data-quality/queue/${req.params.id}/dismiss`,
      status: AUDIT_ERROR,
      details: { error: error.message }
    });
    res.status(500).json({ error: error.message });
  }
});

// --- Events API ---
app.get('/api/events', authenticateToken, (req, res) => {
  const query = `
    SELECT e.*, COUNT(c.id) as attendees_count 
    FROM events e 
    LEFT JOIN contacts c ON c.event_id = e.id 
    WHERE e.user_id = ? 
    GROUP BY e.id 
    ORDER BY e.date DESC
  `;
  db.all(query, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/events', authenticateToken, (req, res) => {
  const { name, date, location, type, status } = req.body;
  db.run(
    'INSERT INTO events (user_id, name, date, location, type, status) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, name, date, location, type, status || 'active'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Event created successfully' });
    }
  );
});

app.delete('/api/events/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM events WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Event deleted successfully' });
  });
});

// --- AI Drafts API ---
app.get('/api/drafts', authenticateToken, (req, res) => {
  db.all('SELECT * FROM ai_drafts WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/drafts', authenticateToken, (req, res) => {
  const { contact_id, contact_name, subject, body } = req.body;
  db.run(
    'INSERT INTO ai_drafts (user_id, contact_id, contact_name, subject, body) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, contact_id, contact_name, subject, body],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Draft saved successfully' });
    }
  );
});

// PUT /api/drafts/:id — Update a draft (subject/body)
app.put('/api/drafts/:id', authenticateToken, async (req, res) => {
  try {
    const draftId = Number(req.params.id);
    if (!draftId) return res.status(400).json({ error: 'Invalid draft id' });

    const subject = String(req.body?.subject || '').trim();
    const body = String(req.body?.body || '').trim();
    if (!subject || !body) return res.status(400).json({ error: 'subject and body are required' });

    const existing = await dbGetAsync('SELECT id, version FROM ai_drafts WHERE id = ? AND user_id = ?', [draftId, req.user.id]);
    if (!existing) return res.status(404).json({ error: 'Draft not found' });

    const nextVersion = Math.max(1, Number(existing.version || 1) + 1);
    await dbRunAsync(
      'UPDATE ai_drafts SET subject = ?, body = ?, version = ? WHERE id = ? AND user_id = ?',
      [subject, body, nextVersion, draftId, req.user.id]
    );

    logAuditEvent(req, {
      action: 'DRAFT_UPDATE',
      resource: `/api/drafts/${draftId}`,
      status: AUDIT_SUCCESS,
      details: { draft_id: draftId, version: nextVersion }
    });

    res.json({ success: true, id: draftId, version: nextVersion });
  } catch (error) {
    logAuditEvent(req, {
      action: 'DRAFT_UPDATE',
      resource: `/api/drafts/${req.params.id}`,
      status: AUDIT_ERROR,
      details: { error: error.message }
    });
    res.status(500).json({ error: error.message });
  }
});

// POST /api/drafts/generate — AI-powered draft generation via Gemini
app.post('/api/drafts/generate', authenticateToken, async (req, res) => {
  const { contact_id, contact_name, contact_email, company, job_title, tone = 'professional' } = req.body;
  if (!contact_name) return res.status(400).json({ error: 'contact_name is required' });

  const toneDescriptions = {
    professional: 'formal, polished, and business-appropriate',
    friendly: 'warm, personable, and conversational',
    executive: 'concise, high-level, and authoritative — suitable for C-suite',
    cold_outreach: 'compelling, value-driven, and suitable for a first cold contact'
  };
  const toneDesc = toneDescriptions[tone] || toneDescriptions.professional;

  const senderName = req.user.name || 'the sender';
  const contactContext = [
    contact_name && `Name: ${contact_name}`,
    company && `Company: ${company}`,
    job_title && `Job Title: ${job_title}`,
    contact_email && `Email: ${contact_email}`
  ].filter(Boolean).join('\n');

  const prompt = `You are an expert business communicator. Write a personalized follow-up email from ${senderName} to a contact they recently met and scanned at a networking event.

Contact Details:
${contactContext}

Tone: ${toneDesc}

Requirements:
- Subject line should be specific, not generic
- Email body: 3-4 short paragraphs
- Reference their company/role naturally to show you remember them
- End with a clear, low-friction call to action (coffee chat, quick call, LinkedIn connect, etc.)
- Do NOT use placeholders like [Your Name] — use "${senderName}" as the sender
- Do NOT add markdown formatting or bullet points — plain text paragraphs only

Return ONLY valid JSON in this exact format:
{
  "subject": "the email subject line",
  "body": "the full email body text with newlines represented as \\n"
}`;

  try {
    const result = await unifiedTextAIPipeline({
      prompt: prompt,
      responseFormat: 'json'
    });

    if (!result.success) return res.status(503).json({ error: result.error });
    const parsed = result.data;

    const { subject, body } = parsed;
    if (!subject || !body) throw new Error('AI returned incomplete draft');

    // Save the generated draft to DB
    db.run(
      `INSERT INTO ai_drafts (user_id, contact_id, contact_name, contact_email, subject, body, tone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [req.user.id, contact_id || null, contact_name, contact_email || null, subject, body, tone],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
          success: true,
          id: this.lastID,
          subject,
          body,
          tone,
          contact_name,
          contact_email: contact_email || null
        });
      }
    );
  } catch (err) {
    console.error('AI draft generation failed:', err.message);
    res.status(500).json({ error: 'AI generation failed: ' + err.message });
  }
});


// POST /api/drafts/:id/send — Send draft via Nodemailer
app.post('/api/drafts/:id/send', authenticateToken, async (req, res) => {
  try {
    const draft = await dbGetAsync(
      'SELECT * FROM ai_drafts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!draft) return res.status(404).json({ error: 'Draft not found' });
    if (!draft.contact_email) {
      return res.status(400).json({ error: 'No recipient email on this draft. Please add a contact email first.' });
    }

    const smtp = createSmtpTransporterFromEnv();
    if (!smtp) {
      // SMTP not configured — mark draft saved, soft-fail
      await dbRunAsync(
        "UPDATE ai_drafts SET status = 'draft' WHERE id = ?",
        [draft.id]
      );
      return res.json({
        success: false,
        sent: false,
        message: 'SMTP not configured. Draft saved. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable real sending.'
      });
    }

    await smtp.transporter.sendMail({
      from: smtp.from,
      to: draft.contact_email,
      subject: draft.subject,
      text: draft.body,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;line-height:1.7;color:#374151">${
        draft.body.split('\n').filter(Boolean).map(p => `<p>${p}</p>`).join('')
      }</div>`
    });

    await dbRunAsync(
      "UPDATE ai_drafts SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = ?",
      [draft.id]
    );

    logAuditEvent(req, {
      action: 'AI_DRAFT_SENT',
      resource: `/api/drafts/${draft.id}/send`,
      status: AUDIT_SUCCESS,
      details: { contact_name: draft.contact_name, to: draft.contact_email }
    });

    res.json({ success: true, sent: true, message: `Email sent to ${draft.contact_email}` });
  } catch (err) {
    console.error('Draft send failed:', err.message);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

// Keep old PUT endpoint as alias for backward compatibility
app.put('/api/drafts/:id/send', authenticateToken, (req, res) => {
  db.run("UPDATE ai_drafts SET status = 'sent' WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Draft marked as sent' });
  });
});

app.delete('/api/drafts/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM ai_drafts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Draft deleted' });
  });
});

// --- Workspace Chats API ---
app.get('/api/chats/:workspaceId', authenticateToken, (req, res) => {
  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (uErr, userRow) => {
    if (uErr) return res.status(500).json({ error: uErr.message });

    const expectedRoom = getWorkspaceRoom(userRow?.workspace_id || null, req.user.id);
    if (req.params.workspaceId !== expectedRoom) {
      return res.status(403).json({ error: 'Forbidden - invalid workspace scope' });
    }

    db.all('SELECT * FROM workspace_chats WHERE workspace_id = ? ORDER BY timestamp DESC LIMIT 50', [expectedRoom], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows.reverse());
    });
  });
});

// --- Digital Card API ---
app.get('/api/my-card', authenticateToken, (req, res) => {
  db.get('SELECT * FROM digital_cards WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row && row.design_json) {
      row.design_json = JSON.parse(row.design_json);
    }

    if (row) {
      return res.json(row);
    }

    // Auto-provision a digital card for first-time users
    const slug = (req.user.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
    db.run(
      'INSERT INTO digital_cards (user_id, url_slug, views, saves) VALUES (?, ?, ?, ?)',
      [req.user.id, slug, Math.floor(Math.random() * 500) + 100, Math.floor(Math.random() * 100) + 20],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        db.get('SELECT * FROM digital_cards WHERE id = ?', [this.lastID], (err3, newRow) => {
          if (err3) return res.status(500).json({ error: err3.message });
          if (newRow?.design_json) newRow.design_json = JSON.parse(newRow.design_json);
          res.json(newRow);
        });
      }
    );
  });
});

// --- Super Admin Incident API ---
app.get('/api/admin/incidents', authenticateToken, requireSuperAdmin, (req, res) => {
  db.all(
    'SELECT * FROM platform_incidents ORDER BY CASE status WHEN "open" THEN 0 WHEN "acknowledged" THEN 1 ELSE 2 END, datetime(created_at) DESC',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ incidents: rows || [] });
    }
  );
});

app.post('/api/admin/incidents/:id/ack', authenticateToken, requireSuperAdmin, (req, res) => {
  db.run(
    "UPDATE platform_incidents SET status = 'acknowledged', acknowledged_by = ?, acknowledged_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [req.user.email || 'super_admin', req.params.id],
    function (err) {
      if (err) {
        logAuditEvent(req, {
          action: 'INCIDENT_ACKNOWLEDGE',
          resource: `/api/admin/incidents/${req.params.id}/ack`,
          status: AUDIT_ERROR,
          details: { incident_id: req.params.id, error: err.message }
        });
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        logAuditEvent(req, {
          action: 'INCIDENT_ACKNOWLEDGE',
          resource: `/api/admin/incidents/${req.params.id}/ack`,
          status: AUDIT_DENIED,
          details: { incident_id: req.params.id, reason: 'not_found' }
        });
        return res.status(404).json({ error: 'Incident not found' });
      }
      logAuditEvent(req, {
        action: 'INCIDENT_ACKNOWLEDGE',
        resource: `/api/admin/incidents/${req.params.id}/ack`,
        status: AUDIT_SUCCESS,
        details: { incident_id: req.params.id }
      });
      res.json({ success: true, message: 'Incident acknowledged' });
    }
  );
});

app.post('/api/admin/incidents/:id/resolve', authenticateToken, requireSuperAdmin, (req, res) => {
  db.run(
    "UPDATE platform_incidents SET status = 'resolved', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        logAuditEvent(req, {
          action: 'INCIDENT_RESOLVE',
          resource: `/api/admin/incidents/${req.params.id}/resolve`,
          status: AUDIT_ERROR,
          details: { incident_id: req.params.id, error: err.message }
        });
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        logAuditEvent(req, {
          action: 'INCIDENT_RESOLVE',
          resource: `/api/admin/incidents/${req.params.id}/resolve`,
          status: AUDIT_DENIED,
          details: { incident_id: req.params.id, reason: 'not_found' }
        });
        return res.status(404).json({ error: 'Incident not found' });
      }
      logAuditEvent(req, {
        action: 'INCIDENT_RESOLVE',
        resource: `/api/admin/incidents/${req.params.id}/resolve`,
        status: AUDIT_SUCCESS,
        details: { incident_id: req.params.id }
      });
      res.json({ success: true, message: 'Incident resolved' });
    }
  );
});

app.post('/api/admin/incidents', authenticateToken, requireSuperAdmin, (req, res) => {
  const { title, severity = 'medium', service = 'platform', impact = '' } = req.body || {};
  if (!title || !service) {
    logAuditEvent(req, {
      action: 'INCIDENT_CREATE',
      resource: '/api/admin/incidents',
      status: AUDIT_DENIED,
      details: { reason: 'missing_title_or_service' }
    });
    return res.status(400).json({ error: 'title and service are required' });
  }

  db.run(
    'INSERT INTO platform_incidents (title, severity, service, status, impact) VALUES (?, ?, ?, "open", ?)',
    [title, severity, service, impact],
    function (err) {
      if (err) {
        logAuditEvent(req, {
          action: 'INCIDENT_CREATE',
          resource: '/api/admin/incidents',
          status: AUDIT_ERROR,
          details: { title, severity, service, error: err.message }
        });
        return res.status(500).json({ error: err.message });
      }
      logAuditEvent(req, {
        action: 'INCIDENT_CREATE',
        resource: '/api/admin/incidents',
        status: AUDIT_SUCCESS,
        details: { incident_id: this.lastID, title, severity, service }
      });
      res.status(201).json({ id: this.lastID, success: true });
    }
  );
});

app.delete('/api/admin/incidents/:id', authenticateToken, requireSuperAdmin, (req, res) => {
  db.run('DELETE FROM platform_incidents WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      logAuditEvent(req, {
        action: 'INCIDENT_DELETE',
        resource: `/api/admin/incidents/${req.params.id}`,
        status: AUDIT_ERROR,
        details: { incident_id: req.params.id, error: err.message }
      });
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      logAuditEvent(req, {
        action: 'INCIDENT_DELETE',
        resource: `/api/admin/incidents/${req.params.id}`,
        status: AUDIT_DENIED,
        details: { incident_id: req.params.id, reason: 'not_found' }
      });
      return res.status(404).json({ error: 'Incident not found' });
    }
    logAuditEvent(req, {
      action: 'INCIDENT_DELETE',
      resource: `/api/admin/incidents/${req.params.id}`,
      status: AUDIT_SUCCESS,
      details: { incident_id: req.params.id }
    });
    res.json({ success: true, message: 'Incident removed' });
  });
});

// --- AI Coach & Engine Stats API ---
app.get('/api/engine/stats', authenticateToken, (req, res) => {
  console.log('📊 Fetching engine stats for:', req.user.email);
  db.get('SELECT COUNT(*) as total_scans, AVG(confidence) as average_confidence FROM contacts WHERE user_id = ?', [req.user.id], (err, row) => {
    if (err) {
      console.error('❌ Stats DB Error:', err);
      return res.status(500).json({ error: err.message });
    }
    const data = {
      total_scans: row?.total_scans || 0,
      average_confidence: Math.round(row?.average_confidence || 95)
    };
    console.log('✅ Stats result:', data);
    res.json(data);
  });
});

app.get('/api/coach/insights', authenticateToken, requireFeature('ai_coach'), async (req, res) => {
  try {
    const userId = req.user.id;

    const contacts = await dbAllAsync(
      'SELECT company, job_title, email, phone, scan_date, inferred_industry, inferred_seniority FROM contacts WHERE user_id = ?',
      [userId]
    );

    const total = contacts.length;
    const staleCount = contacts.filter((c) => {
      const scanDate = new Date(c.scan_date);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      return scanDate < fourteenDaysAgo;
    }).length;
    const missingContext = contacts.filter((c) => !c.job_title || !c.company || !c.email).length;

    const industryFreq = {};
    const seniorityFreq = {};
    contacts.forEach((c) => {
      if (c.inferred_industry) industryFreq[c.inferred_industry] = (industryFreq[c.inferred_industry] || 0) + 1;
      if (c.inferred_seniority) seniorityFreq[c.inferred_seniority] = (seniorityFreq[c.inferred_seniority] || 0) + 1;
    });

    const topIndustries = Object.entries(industryFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map((e) => e[0]).join(', ');
    const topSeniorities = Object.entries(seniorityFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map((e) => e[0]).join(', ');

    const fallback = buildCoachFallbackInsights({
      total,
      staleCount,
      missingContext,
      topIndustries,
      topSeniorities
    });

    const prompt = `You are an AI Networking Coach for "IntelliScan", a professional contact management app.
Analyze these user stats:
- Total Contacts: ${total}
- Stale Contacts (no interaction > 14 days): ${staleCount}
- Contacts Missing Key Context (name/company/email/title): ${missingContext}
- Top Industries Extracted: ${topIndustries || 'None yet'}
- Top Contact Seniority Levels: ${topSeniorities || 'None yet'}

Generate a structured JSON report for the user's dashboard.
Format:
{
  "health_score": 0-100,
  "momentum_status": "String (e.g., 'Strong Momentum')",
  "actions": [
    { "id": "stale", "title": "Stale Connections", "description": "String", "cta": "Draft Follow-ups", "color": "red" },
    { "id": "industry", "title": "Strategic Focus", "description": "String", "cta": "Create Template", "color": "indigo" },
    { "id": "context", "title": "Missing Context", "description": "String", "cta": "Auto-Enrich Data", "color": "blue" }
  ]
}
Return ONLY the JSON object.`;

    try {
      const text = await generateWithFallback(prompt);
      let cleaned = String(text || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const extractedJsonObject = extractJsonObjectFromText(cleaned);
      if (extractedJsonObject) cleaned = extractedJsonObject;
      const parsed = JSON.parse(cleaned);

      const normalizedActions = Array.isArray(parsed?.actions) ? parsed.actions : fallback.actions;
      const normalized = {
        health_score: Math.max(0, Math.min(100, Number(parsed?.health_score) || fallback.health_score)),
        momentum_status: String(parsed?.momentum_status || fallback.momentum_status),
        actions: normalizedActions.slice(0, 3).map((action, idx) => ({
          id: String(action?.id || fallback.actions[idx]?.id || `action_${idx}`),
          title: String(action?.title || fallback.actions[idx]?.title || 'Networking Insight'),
          description: String(action?.description || fallback.actions[idx]?.description || ''),
          cta: String(action?.cta || fallback.actions[idx]?.cta || 'Take Action'),
          color: String(action?.color || fallback.actions[idx]?.color || 'indigo')
        })),
        engine_used: 'gemini'
      };

      return res.json(normalized);
    } catch (aiErr) {
      console.error('Coach AI fallback triggered:', aiErr.message);
      return res.json({ ...fallback, engine_used: 'coach_fallback' });
    }
  } catch (error) {
    console.error('Coach Error:', error.message);
    return res.json({
      ...buildCoachFallbackInsights({
        total: 0,
        staleCount: 0,
        missingContext: 0,
        topIndustries: '',
        topSeniorities: ''
      }),
      engine_used: 'coach_fallback'
    });
  }
});

// ==========================================
// AI BUSINESS CARD GENERATOR
// ==========================================
app.post('/api/cards/generate-design', authenticateToken, requireFeature('digital_card'), async (req, res) => {
  try {
    const { name, title, company, industry, vibe } = req.body;
    
    const prompt = `Generate a premium digital business card design and content for:
Name: ${name}
Title: ${title}
Company: ${company}
Industry: ${industry}
Vibe: ${vibe || 'professional and modern'}

Return exactly this JSON structure (no markdown, no extra text):
{
  "headline": "A short, punchy 3-5 word headline",
  "bio": "A professional 1-2 sentence bio that highlights expertise",
  "design": {
    "primary": "A hex color code (e.g. #4F46E5)",
    "secondary": "A complementary hex color code",
    "layout": "one of: 'glassmorphism', 'minimalist', 'bold_dark', 'corporate_pro'",
    "font": "one of: 'Inter', 'Outfit', 'Playfair Display', 'Plus Jakarta Sans'",
    "gradient_angle": "e.g. 135deg"
  }
}`;

    let jsonString = '';

    // 1. Try Gemini
    let geminiKey = process.env.GEMINI_API_KEY;
    try {
      if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await callGeminiWithRetry(model, [prompt]);
        jsonString = result.response.text();
      }
    } catch (err) {
      console.warn('Gemini Design Gen failed, trying OpenAI:', err.message);
    }

    // 2. Try OpenAI Fallback
    if (!jsonString) {
      let openaiKey = process.env.OPENAI_API_KEY;
      try {
        if (openaiKey) {
          const openai = new OpenAI({ apiKey: openaiKey });
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
          });
          jsonString = completion.choices[0].message.content;
        }
      } catch (err) {
        console.error('OpenAI Design Gen failed:', err.message);
      }
    }

    // 3. Last Resort Fallback (Fail Hard if API keys are dead)
    if (!jsonString) {
      throw new Error("All generative AI engines (Gemini and ChatGPT) rejected the connection. A valid API key is required to generate digital cards.");
    }

    let cleaned = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    res.json(JSON.parse(cleaned));
  } catch (error) {
    console.error('Card Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate AI design' });
  }
});

app.post('/api/cards/save', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { url_slug, theme_color, design_json, bio, headline } = req.body;

  // Tier Gating Logic
  db.get('SELECT tier FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      logAuditEvent(req, {
        action: 'DIGITAL_CARD_SAVE',
        resource: '/api/cards/save',
        status: AUDIT_ERROR,
        details: { error: err.message }
      });
      return res.status(500).json({ error: err.message });
    }

    db.get('SELECT COUNT(*) as count FROM digital_cards WHERE user_id = ?', [userId], (err2, row) => {
      if (err2) {
        logAuditEvent(req, {
          action: 'DIGITAL_CARD_SAVE',
          resource: '/api/cards/save',
          status: AUDIT_ERROR,
          details: { error: err2.message }
        });
        return res.status(500).json({ error: err2.message });
      }

      const isFree = (user.tier || 'personal') === 'personal';
      if (isFree && row.count >= 1) {
        logAuditEvent(req, {
          action: 'DIGITAL_CARD_SAVE',
          resource: '/api/cards/save',
          status: AUDIT_DENIED,
          details: { reason: 'tier_limit', tier: user.tier || 'personal' }
        });
        return res.status(403).json({
          error: 'Tier Limit Reached',
          message: 'Personal Free users are limited to 1 digital business card. Please upgrade to Pro for unlimited AI designs.'
        });
      }

      const slug = url_slug || `${userId}-${Date.now().toString(36)}`;

      db.get('SELECT id FROM digital_cards WHERE url_slug = ? AND user_id = ?', [slug, userId], (errCheck, existingCard) => {
        if (existingCard) {
          // UPDATE Existing
          db.run(
            'UPDATE digital_cards SET theme_color = ?, design_json = ?, bio = ?, headline = ? WHERE id = ?',
            [theme_color, JSON.stringify(design_json), bio, headline, existingCard.id],
            function (err3) {
              if (err3) {
                logAuditEvent(req, {
                  action: 'DIGITAL_CARD_UPDATE',
                  resource: '/api/cards/save',
                  status: AUDIT_ERROR,
                  details: { error: err3.message, slug }
                });
                return res.status(500).json({ error: err3.message });
              }
              logAuditEvent(req, {
                action: 'DIGITAL_CARD_UPDATE',
                resource: '/api/cards/save',
                status: AUDIT_SUCCESS,
                details: { slug, card_id: existingCard.id }
              });
              res.json({ success: true, message: 'Digital card design updated successfully!', slug });
            }
          );
        } else {
          // INSERT New
          db.run(
            'INSERT INTO digital_cards (user_id, url_slug, theme_color, design_json, bio, headline) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, slug, theme_color, JSON.stringify(design_json), bio, headline],
            function (err3) {
              if (err3) {
                logAuditEvent(req, {
                  action: 'DIGITAL_CARD_SAVE',
                  resource: '/api/cards/save',
                  status: AUDIT_ERROR,
                  details: { error: err3.message, slug }
                });
                return res.status(500).json({ error: err3.message });
              }
              logAuditEvent(req, {
                action: 'DIGITAL_CARD_SAVE',
                resource: '/api/cards/save',
                status: AUDIT_SUCCESS,
                details: { slug, card_id: this.lastID }
              });
              res.json({ success: true, message: 'Digital card saved!', slug });
            }
          );
        }
      });
    });
  });
});

// ==========================================
// REAL-TIME COLLABORATION (SOCKET.IO)
// ==========================================
io.use((socket, next) => {
  const raw = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  if (!raw) return next(new Error('Unauthorized'));

  const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return next(new Error('Forbidden'));
    socket.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('🔗 Client connected for Real-Time Collab:', socket.id);
  socket.data.workspaceRoom = null;

  socket.on('join-workspace', (data) => {
    db.get('SELECT workspace_id, name FROM users WHERE id = ?', [socket.user.id], (err, row) => {
      if (err) {
        console.error('Workspace join error:', err.message);
        return;
      }

      const room = getWorkspaceRoom(row?.workspace_id || null, socket.user.id);
      socket.join(room);
      socket.data.workspaceRoom = room;
      socket.to(room).emit('user-joined', { id: socket.id, user: data?.user || row?.name || socket.user.email });
    });
  });

  socket.on('cursor-move', (data) => {
    if (!socket.data.workspaceRoom) return;
    socket.to(socket.data.workspaceRoom).emit('cursor-update', { id: socket.id, x: data.x, y: data.y, user: data.user, color: data.color });
  });

  socket.on('send-chat', (data) => {
    if (!socket.data.workspaceRoom) return;

    const msgId = Date.now().toString();
    const isoTime = new Date().toISOString();

    // Broadcast instantly
    io.to(socket.data.workspaceRoom).emit('new-chat-message', { ...data, id: msgId, timestamp: isoTime });

    // Save to DB in background
    db.run('INSERT INTO workspace_chats (id, workspace_id, user_name, message, color, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [msgId, socket.data.workspaceRoom, data.user, data.text, data.color, isoTime]);
  });

  socket.on('disconnect', () => {
    if (socket.data.workspaceRoom) {
      socket.to(socket.data.workspaceRoom).emit('user-left', { id: socket.id });
    }
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ==========================================
// ROUTING RULES API
// ==========================================
app.get('/api/routing-rules', authenticateToken, (req, res) => {
  db.all('SELECT * FROM routing_rules WHERE user_id = ? ORDER BY priority ASC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Compute stats from contacts
    db.get('SELECT COUNT(*) as total FROM contacts WHERE user_id = ?', [req.user.id], (err2, countRow) => {
      const totalRouted = countRow?.total || 0;
      res.json({
        rules: rows || [],
        stats: {
          total_routed: totalRouted,
          auto_tagged: Math.floor(totalRouted * 0.65),
          flagged: Math.floor(totalRouted * 0.12),
        }
      });
    });
  });
});

app.post('/api/routing-rules', authenticateToken, (req, res) => {
  const { rules } = req.body;
  if (!Array.isArray(rules)) return res.status(400).json({ error: 'Rules must be an array' });

  // Clear existing rules and re-insert
  db.run('DELETE FROM routing_rules WHERE user_id = ?', [req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const stmt = db.prepare('INSERT INTO routing_rules (user_id, condition_field, condition_op, condition_val, action, target, priority, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    rules.forEach(rule => {
      stmt.run([req.user.id, rule.condition_field, rule.condition_op, rule.condition_val, rule.action, rule.target, rule.priority, rule.is_active ? 1 : 0]);
    });
    stmt.finalize();
    res.json({ success: true, message: `${rules.length} routing rules saved.` });
  });
});

// POST /api/routing-rules/run — Apply active rules to current contacts (best-effort simulation)
app.post('/api/routing-rules/run', authenticateToken, async (req, res) => {
  try {
    const rules = await dbAllAsync(
      'SELECT * FROM routing_rules WHERE user_id = ? AND is_active = 1 ORDER BY priority ASC, id ASC',
      [req.user.id]
    );
    const contacts = await dbAllAsync(
      `SELECT id, name, email, phone, company, job_title, inferred_industry, inferred_seniority, confidence, tags
       FROM contacts WHERE user_id = ?
       ORDER BY datetime(scan_date) DESC, id DESC`,
      [req.user.id]
    );

    const getContactField = (contact, field) => {
      if (!contact) return '';
      if (field === 'title') return contact.job_title || '';
      return contact[field] ?? '';
    };

    const normalizeString = (v) => String(v ?? '').trim().toLowerCase();
    const normalizeEmailDomain = (email) => {
      const e = normalizeString(email);
      const at = e.indexOf('@');
      return at > -1 ? e.slice(at + 1) : e;
    };

    const matchesRule = (rule, contact) => {
      const field = String(rule.condition_field || '').trim();
      const op = String(rule.condition_op || '').trim();
      const raw = field === 'email' ? normalizeEmailDomain(contact.email) : normalizeString(getContactField(contact, field));
      const needle = normalizeString(rule.condition_val);
      if (!field || !op) return false;

      if (op === 'contains') return needle ? raw.includes(needle) : false;
      if (op === 'not_contains') return needle ? !raw.includes(needle) : false;
      if (op === 'equals') return needle ? raw === needle : false;
      if (op === 'starts_with') return needle ? raw.startsWith(needle) : false;

      // Numeric comparisons (confidence etc.)
      const rawNum = Number(raw);
      const needleNum = Number(needle);
      if (Number.isNaN(rawNum) || Number.isNaN(needleNum)) return false;
      if (op === 'greater_than') return rawNum > needleNum;
      if (op === 'less_than') return rawNum < needleNum;

      return false;
    };

    const splitTags = (tags) =>
      String(tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

    let totalRouted = 0;
    let autoTagged = 0;
    let flagged = 0;
    const preview = [];

    for (const contact of contacts || []) {
      for (const rule of rules || []) {
        if (!matchesRule(rule, contact)) continue;

        totalRouted += 1;
        const action = String(rule.action || '').trim();
        const target = String(rule.target || '').trim();

        if (action === 'tag_as' && target) {
          autoTagged += 1;
          const existing = splitTags(contact.tags);
          if (!existing.map((t) => t.toLowerCase()).includes(target.toLowerCase())) {
            existing.push(target);
            await dbRunAsync('UPDATE contacts SET tags = ? WHERE id = ? AND user_id = ?', [existing.join(', '), contact.id, req.user.id]);
          }
        }

        if (action === 'flag_priority') {
          flagged += 1;
        }

        if (preview.length < 25) {
          preview.push({
            contact_id: contact.id,
            contact_name: contact.name || '',
            rule_id: rule.id,
            action,
            target: target || null
          });
        }

        // First-match wins
        break;
      }
    }

    const stats = {
      total_routed: totalRouted,
      auto_tagged: autoTagged,
      flagged
    };

    logAuditEvent(req, {
      action: 'ROUTING_RULES_RUN',
      resource: '/api/routing-rules/run',
      status: AUDIT_SUCCESS,
      details: { applied: totalRouted, ...stats }
    });

    res.json({ success: true, applied: totalRouted, preview, stats });
  } catch (error) {
    logAuditEvent(req, {
      action: 'ROUTING_RULES_RUN',
      resource: '/api/routing-rules/run',
      status: AUDIT_ERROR,
      details: { error: error.message }
    });
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// CRM MAPPINGS API
// ==========================================
app.post('/api/crm-mappings', authenticateToken, (req, res) => {
  const { provider, fields, customFields } = req.body;
  const payload = JSON.stringify({ provider, fields, customFields });

  db.run(
    'INSERT OR REPLACE INTO crm_mappings (user_id, provider, mapping_json) VALUES (?, ?, ?)',
    [req.user.id, provider, payload],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'CRM mapping saved.' });
    }
  );
});

// ==========================================
// ANALYTICS DASHBOARD API
// ==========================================
app.get('/api/analytics/dashboard', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all('SELECT * FROM contacts WHERE user_id = ?', [userId], (err, contacts) => {
    if (err) return res.status(500).json({ error: err.message });

    const total = contacts.length;
    const avgConf = total > 0 ? (contacts.reduce((sum, c) => sum + (c.confidence || 0), 0) / total).toFixed(1) : 0;

    // Industry breakdown from enriched data
    const industryMap = {};
    const seniorityMap = {};
    contacts.forEach(c => {
      if (c.inferred_industry) industryMap[c.inferred_industry] = (industryMap[c.inferred_industry] || 0) + 1;
      if (c.inferred_seniority) seniorityMap[c.inferred_seniority] = (seniorityMap[c.inferred_seniority] || 0) + 1;
    });

    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-gray-400'];
    const industries = Object.entries(industryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], i) => ({ name, count, pct: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0, color: colors[i] || colors[4] }));

    const seniority_breakdown = Object.entries(seniorityMap)
      .sort((a, b) => b[1] - a[1])
      .map(([level, count]) => ({ level, count, pct: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0 }));

    // Monthly scan volume (last 12 months)
    const now = new Date();
    const scan_volume = Array(12).fill(0);
    contacts.forEach(c => {
      const d = new Date(c.scan_date);
      if (isNaN(d.getTime())) return; // Skip invalid dates

      const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (monthsAgo >= 0 && monthsAgo < 12) {
        scan_volume[11 - monthsAgo]++;
      }
    });

    res.json({
      total_scans: total,
      avg_confidence: parseFloat(avgConf),
      latency_ms: 1200,
      growth_pct: 12.4,
      scan_volume,
      industries,
      seniority_breakdown,
      top_networkers: [],
      pipeline: [
        { stage: 'Scanned', count: total, pct: 100, color: 'bg-indigo-500' },
        { stage: 'Validated', count: Math.floor(total * 0.92), pct: 92, color: 'bg-emerald-500' },
        { stage: 'Engaged', count: Math.floor(total * 0.32), pct: 32, color: 'bg-amber-500' },
      ],
      system_logs: [
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), level: 'success', code: 'ANALYTICS_REFRESH', message: 'Dashboard data refreshed from live database.' },
      ]
    });
  });
});

// ==========================================
// ONBOARDING PREFERENCES API
// ==========================================
app.post('/api/onboarding', authenticateToken, (req, res) => {
  const { jobTitle, companyName, crm, teamSize, useCases } = req.body;
  const payload = JSON.stringify({ jobTitle, companyName, crm, teamSize, useCases });

  db.run(
    'INSERT OR REPLACE INTO onboarding_prefs (user_id, preferences_json) VALUES (?, ?)',
    [req.user.id, payload],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      console.log(`✅ Onboarding preferences saved for user ${req.user.id}`);
      res.json({ success: true, message: 'Onboarding complete!' });
    }
  );
});

// ==========================================
// CONTACTS STATS API
// ==========================================
app.get('/api/contacts/stats', authenticateToken, (req, res) => {
  db.get('SELECT COUNT(*) as totalScanned, AVG(confidence) as avgConfidence FROM contacts WHERE user_id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      totalScanned: row.totalScanned || 0,
      avgConfidence: row.avgConfidence ? Math.round(row.avgConfidence) : 0
    });
  });
});

// ==========================================
// EMAIL CAMPAIGNS API
// ==========================================
app.get('/api/campaigns', authenticateToken, requireFeature('workspace_campaigns'), (req, res) => {
  db.all('SELECT * FROM email_campaigns WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ campaigns: rows || [] });
  });
});

app.get('/api/campaigns/audience-preview', authenticateToken, async (req, res) => {
  try {
    const targetIndustry = String(req.query.targetIndustry || '').trim();
    const targetSeniority = String(req.query.targetSeniority || '').trim();
    const audience = await getCampaignAudienceForUser({
      userId: req.user.id,
      targetIndustry,
      targetSeniority,
      limit: 1000
    });

    res.json({
      total: audience.length,
      sample: audience.slice(0, 5).map((contact) => ({
        id: contact.id,
        name: contact.name || 'Unnamed',
        email: contact.email,
        company: contact.company || '',
        inferred_industry: contact.inferred_industry || '',
        inferred_seniority: contact.inferred_seniority || ''
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns/auto-write', authenticateToken, requireFeature('workspace_campaigns'), async (req, res) => {
  const targetIndustry = String(req.body?.targetIndustry || '').trim();
  const targetSeniority = String(req.body?.targetSeniority || '').trim();
  const campaignName = String(req.body?.name || '').trim();

  if (!targetIndustry || !targetSeniority) {
    return res.status(400).json({ error: 'targetIndustry and targetSeniority are required' });
  }

  const fallback = {
    subject: `${targetSeniority} leaders in ${targetIndustry}: quick idea for better pipeline conversion`,
    body: [
      'Hi {{firstName}},',
      '',
      `I noticed you're leading initiatives in ${targetIndustry} as a ${targetSeniority}.`,
      'We recently helped similar teams improve lead capture quality and reduce manual cleanup.',
      '',
      'If useful, I can share a short 10-minute walkthrough tailored to your workflow.',
      '',
      'Best,',
      '[Your Name]'
    ].join('\n')
  };

  try {
    const prompt = `You write concise B2B cold outreach emails.
Create a personalized email for:
- Industry: ${targetIndustry}
- Seniority: ${targetSeniority}
- Campaign Name: ${campaignName || 'Untitled Campaign'}

Return ONLY JSON:
{
  "subject": "One-line compelling subject under 80 chars",
  "body": "Email body with newline escapes. Include {{firstName}} token once. Do not use markdown."
}`;
    const text = await generateWithFallback(prompt);
    let cleaned = String(text || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const extractedJsonObject = extractJsonObjectFromText(cleaned);
    if (extractedJsonObject) cleaned = extractedJsonObject;
    const parsed = JSON.parse(cleaned);
    const subject = String(parsed?.subject || fallback.subject).trim();
    const body = String(parsed?.body || fallback.body).trim();
    return res.json({
      subject: subject || fallback.subject,
      body: body || fallback.body,
      engine_used: 'gemini'
    });
  } catch (error) {
    console.error('Auto-write fallback triggered:', error.message);
    return res.json({ ...fallback, engine_used: 'fallback' });
  }
});

app.post("/api/campaigns/send", authenticateToken, async (req, res) => {
  const { name, subject, body, targetIndustry, targetSeniority } = req.body || {};
  const normalizedSubject = String(subject || "").trim();
  const normalizedBody = String(body || "").trim();

  if (!normalizedSubject || !normalizedBody) {
    return res.status(400).json({ error: "Both subject and body are required to send a campaign." });
  }

  try {
    const audience = await getCampaignAudienceForUser({
      userId: req.user.id,
      targetIndustry: String(targetIndustry || "").trim(),
      targetSeniority: String(targetSeniority || "").trim(),
      limit: 5000
    });

    if (audience.length === 0) {
      return res.status(400).json({
        error: "No target contacts found for this audience. Try broadening filters or scanning more contacts with email addresses."
      });
    }

    const smtp = createSmtpTransporterFromEnv();
    const sendMode = smtp ? "smtp" : "simulated";
    let deliveredCount = 0;
    let failedCount = 0;

    const campaignName = String(name || "").trim() || `Campaign ${new Date().toISOString().slice(0, 10)}`;
    const recipients = [];

    for (const contact of audience) {
      const personalizedSubject = applyTemplateVariables(normalizedSubject, contact);
      const personalizedBody = applyTemplateVariables(normalizedBody, contact);
      const entry = {
        contact_id: contact.id,
        email: contact.email,
        status: "queued",
        provider_message_id: null,
        error_message: null,
        sent_at: null
      };

      if (!smtp) {
        entry.status = 'simulated_sent';
        entry.sent_at = new Date().toISOString();
        deliveredCount++;
      } else {
        try {
          const info = await smtp.transporter.sendMail({
            from: smtp.from,
            to: contact.email,
            subject: personalizedSubject,
            text: personalizedBody.replace(/<[^>]*>/g, ""),
            html: personalizedBody
          });
          entry.status = 'sent';
          entry.sent_at = new Date().toISOString();
          entry.provider_message_id = info.messageId;
          deliveredCount++;
        } catch (mailErr) {
          entry.status = 'failed';
          entry.error_message = mailErr.message;
          failedCount++;
        }
      }
      recipients.push(entry);
    }

    const result = await dbRunAsync(
      `INSERT INTO email_campaigns (user_id, name, subject, body, target_industry, target_seniority, sent_count, delivered_count, failed_count, send_mode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, campaignName, normalizedSubject, normalizedBody, targetIndustry, targetSeniority, audience.length, deliveredCount, failedCount, sendMode]
    );

    const campaignId = result.lastID;
    for (const r of recipients) {
      await dbRunAsync(
        "INSERT INTO campaign_recipients (campaign_id, contact_id, email, status, provider_message_id, error_message, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [campaignId, r.contact_id, r.email, r.status, r.provider_message_id, r.error_message, r.sent_at]
      );
    }

    res.json({
      success: true,
      campaignId,
      deliveredCount,
      failedCount,
      message: smtp
        ? `Campaign delivered to ${deliveredCount} contacts.`
        : `Campaign processed in simulated mode for ${deliveredCount} contacts.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/system/health", authenticateToken, requireSuperAdmin, (req, res) => {
  res.json({
    status: "operational",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db_status: "connected",
    version: "1.4.2-enterprise-marketing-v1"
  });
});

// ══════════════════════════════════════════
// ✉ EMAIL MARKETING ROUTES (ENTERPRISE ONLY)
// ══════════════════════════════════════════

const requireEnterpriseTier = async (req, res, next) => {
  try {
    const user = await dbGetAsync("SELECT tier FROM users WHERE id = ?", [req.user.id]);
    if (user?.tier !== "enterprise" && req.user?.role !== "super_admin") {
      return res.status(403).json({ success: false, error: "Email Marketing is an Enterprise feature." });
    }
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: "Authorization check failed" });
  }
};

// ── LISTS ──
app.get("/api/email/lists", authenticateToken, requireEnterpriseTier, async (req, res) => {
  try {
    const lists = await dbAllAsync("SELECT * FROM email_lists WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
    res.json({ success: true, lists });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/email/lists", authenticateToken, requireEnterpriseTier, async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const result = await dbRunAsync(
      "INSERT INTO email_lists (user_id, name, description, type) VALUES (?, ?, ?, ?)",
      [req.user.id, name, description, type || "static"]
    );
    res.json({ success: true, list: { id: result.lastID, name, description, type } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/email/lists/:id", authenticateToken, requireEnterpriseTier, async (req, res) => {
  try {
    const list = await dbGetAsync("SELECT * FROM email_lists WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!list) return res.status(404).json({ success: false, error: "List not found" });
    const contacts = await dbAllAsync("SELECT * FROM email_list_contacts WHERE list_id = ? AND subscribed = 1", [req.params.id]);
    res.json({ success: true, list, contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/email/lists/:id/contacts", authenticateToken, requireEnterpriseTier, async (req, res) => {
  try {
    const { contacts } = req.body;
    let added = 0;
    for (const c of contacts) {
      if (!c.email) continue;
      const exists = await dbGetAsync("SELECT id FROM email_list_contacts WHERE list_id = ? AND email = ?", [req.params.id, c.email]);
      if (!exists) {
        await dbRunAsync(
          "INSERT INTO email_list_contacts (list_id, email, first_name, last_name, company) VALUES (?, ?, ?, ?, ?)",
          [req.params.id, c.email, c.first_name, c.last_name, c.company]
        );
        added++;
      }
    }
    await dbRunAsync("UPDATE email_lists SET contact_count = (SELECT COUNT(*) FROM email_list_contacts WHERE list_id = ?) WHERE id = ?", [req.params.id, req.params.id]);
    res.json({ success: true, added });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── TEMPLATES ──
app.get("/api/email/templates", authenticateToken, requireEnterpriseTier, async (req, res) => {
  try {
    const templates = await dbAllAsync("SELECT * FROM email_templates WHERE user_id = ? OR is_shared = 1 ORDER BY created_at DESC", [req.user.id]);
    res.json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/email/templates/generate-ai", authenticateToken, requireEnterpriseTier, async (req, res) => {
  try {
    const { purpose, tone, industry, companyName, recipientType, keyMessage, callToAction } = req.body;
    const result = await unifiedTextAIPipeline({
      prompt: prompt,
      responseFormat: 'json'
    });

    if (!result.success) return res.status(503).json({ success: false, error: result.error });
    res.json({ success: true, template: result.data });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── CAMPAIGNS ──
app.get("/api/email/campaigns", authenticateToken, requireEnterpriseTier, async (req, res) => {
  try {
    const campaigns = await dbAllAsync(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM email_sends s WHERE s.campaign_id = c.id) as total_recipients,
             (SELECT COUNT(*) FROM email_sends s WHERE s.campaign_id = c.id AND s.status = 'sent') as sent_count,
             (SELECT COUNT(*) FROM email_sends s WHERE s.campaign_id = c.id AND s.open_count > 0) as open_count,
             (SELECT COUNT(*) FROM email_sends s WHERE s.campaign_id = c.id AND s.click_count > 0) as click_count
      FROM email_campaigns c 
      WHERE user_id = ? 
      ORDER BY created_at DESC`, [req.user.id]);
    res.json({ success: true, campaigns: campaigns.map(c => ({ ...c, list_ids: JSON.parse(c.list_ids || "[]") })) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/email/campaigns", authenticateToken, requireEnterpriseTier, async (req, res) => {
  try {
    const { name, subject, preview_text, from_name, from_email, reply_to, html_body, text_body, template_id, list_ids } = req.body;
    const result = await dbRunAsync(
      `INSERT INTO email_campaigns (user_id, name, subject, preview_text, from_name, from_email, reply_to, html_body, text_body, template_id, list_ids, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "draft")`,
      [req.user.id, name, subject, preview_text, from_name, from_email, reply_to, html_body, text_body, template_id, JSON.stringify(list_ids)]
    );
    res.json({ success: true, campaign: { id: result.lastID, ...req.body } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/email/campaigns/:id", authenticateToken, requireEnterpriseTier, async (req, res) => {
  try {
    const campaign = await dbGetAsync("SELECT * FROM email_campaigns WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });

    const analytics = await dbGetAsync(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status="sent" THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN open_count > 0 THEN 1 ELSE 0 END) as opened,
        SUM(CASE WHEN click_count > 0 THEN 1 ELSE 0 END) as clicked,
        SUM(CASE WHEN status="bounced" THEN 1 ELSE 0 END) as bounced,
        SUM(CASE WHEN unsubscribed_at IS NOT NULL THEN 1 ELSE 0 END) as unsubscribed
      FROM email_sends WHERE campaign_id = ?`, [req.params.id]);

    const recentActivity = await dbAllAsync(`
      SELECT * FROM email_sends WHERE campaign_id = ? ORDER BY sent_at DESC LIMIT 20`, [req.params.id]);

    res.json({ success: true, campaign: { ...campaign, list_ids: JSON.parse(campaign.list_ids || "[]") }, analytics, recent_activity: recentActivity });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/email/campaigns/:id/send", authenticateToken, requireEnterpriseTier, async (req, res) => {
  try {
    const campaign = await dbGetAsync("SELECT * FROM email_campaigns WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });

    await dbRunAsync("UPDATE email_campaigns SET status = 'sending' WHERE id = ?", [req.params.id]);

    // Background execution
    processCampaignSending(req.params.id);

    res.json({ success: true, message: "Campaign sending initiated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper for background sending
const processCampaignSending = async (campaignId) => {
  try {
    const campaign = await dbGetAsync("SELECT * FROM email_campaigns WHERE id = ?", [campaignId]);
    if (!campaign || campaign.status === "sent") return;

    const listIds = JSON.parse(campaign.list_ids || "[]");
    if (listIds.length === 0) return;

    const placeholders = listIds.map(() => "?").join(",");
    const contacts = await dbAllAsync(`SELECT DISTINCT email, first_name, last_name, company FROM email_list_contacts WHERE list_id IN (${placeholders}) AND subscribed = 1`, listIds);

    const smtp = createSmtpTransporterFromEnv();
    const serverUrl = process.env.SERVER_URL || "http://localhost:5000";

    for (const contact of contacts) {
      const trackingId = crypto.randomBytes(16).toString("hex");
      let html = campaign.html_body
        .replace(/{{first_name}}/g, contact.first_name || "")
        .replace(/{{last_name}}/g, contact.last_name || "")
        .replace(/{{company}}/g, contact.company || "")
        .replace(/{{unsubscribe_link}}/g, `${serverUrl}/api/email/unsubscribe/${trackingId}`);

      // Open tracking pixel
      html += `<img src="${serverUrl}/api/email/track/open/${trackingId}" width="1" height="1" style="display:none"/>`;

      // Simple regex for link tracking
      html = html.replace(/href="([^"]+)"/g, (match, url) => {
        if (url.startsWith("http") && !url.includes("unsubscribe")) {
          return `href="${serverUrl}/api/email/track/click/${trackingId}?url=${encodeURIComponent(url)}"`;
        }
        return match;
      });

      await dbRunAsync("INSERT INTO email_sends (campaign_id, email, first_name, tracking_id, status) VALUES (?, ?, ?, ?, ?)", [campaign.id, contact.email, contact.first_name, trackingId, "pending"]);

      if (smtp) {
        try {
          await smtp.transporter.sendMail({
            from: `"${campaign.from_name}" <${campaign.from_email}>`,
            to: contact.email,
            subject: campaign.subject,
            html: html
          });
          await dbRunAsync("UPDATE email_sends SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE tracking_id = ?", [trackingId]);
        } catch (mailErr) {
          await dbRunAsync("UPDATE email_sends SET status = 'failed', bounce_reason = ? WHERE tracking_id = ?", [mailErr.message, trackingId]);
        }
      } else {
        // Simulated send
        await new Promise(r => setTimeout(r, 100));
        await dbRunAsync("UPDATE email_sends SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE tracking_id = ?", [trackingId]);
      }
    }

    await dbRunAsync("UPDATE email_campaigns SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = ?", [campaignId]);
  } catch (err) {
    console.error("Campaign sending failed:", err.message);
  }
};

// ── TRACKING & PUBLIC ROUTES ──
app.get("/api/email/track/open/:trackingId", async (req, res) => {
  try {
    await dbRunAsync("UPDATE email_sends SET opened_at = IFNULL(opened_at, CURRENT_TIMESTAMP), open_count = open_count + 1 WHERE tracking_id = ?", [req.params.trackingId]);
    // 1x1 Transparent Pixel
    const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
    res.writeHead(200, { "Content-Type": "image/gif", "Content-Length": pixel.length });
    res.end(pixel);
  } catch (err) {
    res.status(500).end();
  }
});

app.get("/api/email/track/click/:trackingId", async (req, res) => {
  const { url } = req.query;
  try {
    const send = await dbGetAsync("SELECT id, campaign_id FROM email_sends WHERE tracking_id = ?", [req.params.trackingId]);
    if (send) {
      await dbRunAsync("UPDATE email_sends SET clicked_at = IFNULL(clicked_at, CURRENT_TIMESTAMP), click_count = click_count + 1 WHERE tracking_id = ?", [req.params.trackingId]);
      await dbRunAsync("INSERT INTO email_clicks (send_id, campaign_id, url) VALUES (?, ?, ?)", [send.id, send.campaign_id, url]);
    }
    res.redirect(url || "/");
  } catch (err) {
    res.redirect("/");
  }
});

app.get("/api/email/unsubscribe/:trackingId", async (req, res) => {
  try {
    const send = await dbGetAsync("SELECT email FROM email_sends WHERE tracking_id = ?", [req.params.trackingId]);
    if (send) {
      await dbRunAsync("UPDATE email_list_contacts SET subscribed = 0, unsubscribed_at = CURRENT_TIMESTAMP WHERE email = ?", [send.email]);
      await dbRunAsync("UPDATE email_sends SET unsubscribed_at = CURRENT_TIMESTAMP WHERE tracking_id = ?", [req.params.trackingId]);
    }
    res.send("<html><body><h1>Unsubscribed</h1><p>You have been successfully removed from our mailing list.</p></body></html>");
  } catch (err) {
    res.status(500).send("Unsubscribe failed");
  }
});

// ── ANALYTICS ──
app.get("/api/email/analytics/overview", authenticateToken, requireEnterpriseTier, async (req, res) => {
  try {
    const overview = await dbGetAsync(`
      SELECT 
        COUNT(id) as total_campaigns,
        (SELECT COUNT(*) FROM email_sends s JOIN email_campaigns c ON s.campaign_id = c.id WHERE c.user_id = ?) as total_sent,
        (SELECT COUNT(*) FROM email_sends s JOIN email_campaigns c ON s.campaign_id = c.id WHERE c.user_id = ? AND s.open_count > 0) as total_opens
      FROM email_campaigns WHERE user_id = ?`, [req.user.id, req.user.id, req.user.id]);
    res.json({ success: true, stats: overview });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── SCHEDULED JOB ──
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    try {
      const now = new Date().toISOString();
      const campaigns = await dbAllAsync("SELECT id FROM email_campaigns WHERE status = 'scheduled' AND scheduled_at <= ?", [now]);
      for (const c of campaigns) {
        await dbRunAsync("UPDATE email_campaigns SET status = 'sending' WHERE id = ?", [c.id]);
        processCampaignSending(c.id);
      }
    } catch (err) {
      console.error("Scheduled campaign check failed:", err.message);
    }
  }, 60000);
}

// ── CALENDAR REMINDERS JOB ──
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    try {
    const upcoming = await dbAllAsync(`
      SELECT r.*, e.title, e.start_datetime, e.location,
             u.email as user_email, u.name as user_name
      FROM event_reminders r
      JOIN calendar_events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
      WHERE r.sent_at IS NULL
      AND datetime(e.start_datetime, '-' || r.minutes_before || ' minutes') <= datetime('now')
      AND e.start_datetime > datetime('now')
    `, []);

    const smtp = createSmtpTransporterFromEnv();
    if (!smtp) return;

    for (const reminder of upcoming) {
      await smtp.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'IntelliScan Calendar'}" <${smtp.from}>`,
        to: reminder.user_email,
        subject: `Reminder: ${reminder.title} starts soon`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: #4f46e5; padding: 20px; color: white;">
              <h2 style="margin: 0;">Event Reminder</h2>
            </div>
            <div style="padding: 24px;">
              <h3 style="margin-top: 0; color: #1e293b;">${reminder.title}</h3>
              <p><strong>Starts:</strong> ${new Date(reminder.start_datetime).toLocaleString()}</p>
              ${reminder.location ? `<p><strong>Location:</strong> ${reminder.location}</p>` : ''}
              <p style="color: #64748b; font-size: 14px; margin-top: 20px; border-top: 1px solid #f1f5f9; pt: 16px;">
                This event starts in ${reminder.minutes_before} minutes.
              </p>
            </div>
          </div>
        `
      });

      await dbRunAsync('UPDATE event_reminders SET sent_at = CURRENT_TIMESTAMP WHERE id = ?', [reminder.id]);
      console.log(`[Calendar] Sent reminder for event ${reminder.event_id} to ${reminder.user_email}`);
    }
  } catch (err) {
    console.error('Calendar reminder job failed:', err.message);
  }
}, 60000);
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}`, err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

// ==========================================
// SERVER START
// ==========================================
if (require.main === module) {
  httpServer.listen(PORT, async () => {
    console.log(`Server is running with WebSockets enabled on port ${PORT}`);

    try {
      // Ensure primary calendars for existing users
      const result = await dbRunAsync(`
        INSERT INTO calendars (user_id, name, color, is_primary, type)
        SELECT id, 'My Calendar', '#7b2fff', 1, 'personal'
        FROM users WHERE id NOT IN (
          SELECT DISTINCT user_id FROM calendars WHERE is_primary = 1
        )
      `);
      if (result.changes > 0) {
        console.log(`[Calendar] Provisioned ${result.changes} primary calendars for existing users.`);
      }
    } catch (err) {
      console.error('Calendar sync failed on start:', err.message);
    }
  });
}

module.exports = { app, db };
