const { dbGetAsync, dbRunAsync, isPostgres } = require('./db');
const { BILLING_PLANS } = require('./billingUtils');

/**
 * Resolves the scan limits based on user tier.
 */
function resolveTierLimits(tier) {
  const normalizedTier = String(tier || 'personal').toLowerCase();
  const plan = BILLING_PLANS.find(p => p.id === normalizedTier) || BILLING_PLANS[0];
  
  return { 
    single: plan.limits.single, 
    group: plan.limits.group, 
    tier: plan.id 
  };
}

/**
 * Atomically ensures the quota row exists and performs a month-boundary reset.
 * Cross-dialect support for SQLite and PostgreSQL.
 */
async function ensureQuotaRow(userId, currentTier = 'personal') {
  const limits = resolveTierLimits(currentTier);
  
  // 1. Get current quota to check for existing higher limits (Safety)
  const existing = await dbGetAsync('SELECT limit_amount, group_limit_amount FROM user_quotas WHERE user_id = ?', [userId]);
  
  const targetLimit = Math.max(limits.single, existing?.limit_amount || 0);
  const targetGroupLimit = Math.max(limits.group, existing?.group_limit_amount || 0);

  if (targetLimit > (existing?.limit_amount || 0)) {
    console.log(`[Quota] Promoting limit for User ${userId}: ${existing?.limit_amount || 0} -> ${targetLimit}`);
  }

  // 2. Dialect-specific month reset logic
  const monthCheck = isPostgres 
    ? "DATE_TRUNC('month', user_quotas.last_reset_date) != DATE_TRUNC('month', CURRENT_TIMESTAMP)"
    : "strftime('%Y-%m', user_quotas.last_reset_date) != strftime('%Y-%m', 'now')";

  const nowVal = isPostgres ? "CURRENT_TIMESTAMP" : "CURRENT_TIMESTAMP";

  // 3. Perform UPSERT
  const query = `
    INSERT INTO user_quotas (
      user_id, 
      used_count, 
      limit_amount, 
      group_scans_used, 
      group_limit_amount,
      last_reset_date
    ) 
    VALUES (?, 0, ?, 0, ?, ${nowVal})
    ON CONFLICT (user_id) DO UPDATE SET
      limit_amount = CASE 
        WHEN EXCLUDED.limit_amount > user_quotas.limit_amount THEN EXCLUDED.limit_amount 
        ELSE user_quotas.limit_amount 
      END,
      group_limit_amount = CASE 
        WHEN EXCLUDED.group_limit_amount > user_quotas.group_limit_amount THEN EXCLUDED.group_limit_amount 
        ELSE user_quotas.group_limit_amount 
      END,
      
      used_count = CASE 
        WHEN ${monthCheck} THEN 0 
        ELSE user_quotas.used_count 
      END,
      group_scans_used = CASE 
        WHEN ${monthCheck} THEN 0 
        ELSE user_quotas.group_scans_used 
      END,
      last_reset_date = CASE 
        WHEN ${monthCheck} THEN ${nowVal} 
        ELSE user_quotas.last_reset_date 
      END
  `;

  await dbRunAsync(query, [userId, targetLimit, targetGroupLimit]);
}

/**
 * Atomically increments the scan usage for a user.
 */
async function incrementUsage(userId, type = 'single') {
  const column = type === 'group' ? 'group_scans_used' : 'used_count';
  await dbRunAsync(
    `UPDATE user_quotas SET ${column} = ${column} + 1 WHERE user_id = ?`,
    [userId]
  );
}

module.exports = { ensureQuotaRow, resolveTierLimits, incrementUsage };