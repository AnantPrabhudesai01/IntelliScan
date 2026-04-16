const { dbGetAsync, dbRunAsync, isPostgres } = require('./db');

/**
 * Resolves the scan limits based on user tier.
 */
function resolveTierLimits(tier) {
  const normalizedTier = String(tier || 'personal').toLowerCase();
  
  if (normalizedTier === 'enterprise' || normalizedTier === 'business_admin') {
    return { single: 99999, group: 99999, tier: 'enterprise' };
  }
  
  if (normalizedTier === 'pro') {
    return { single: 100, group: 10, tier: 'pro' };
  }

  return { single: 10, group: 1, tier: 'personal' };
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

  // 2. Dialect-specific month reset logic
  const monthCheck = isPostgres 
    ? "DATE_TRUNC('month', last_reset_date) != DATE_TRUNC('month', CURRENT_TIMESTAMP)"
    : "strftime('%Y-%m', last_reset_date) != strftime('%Y-%m', 'now')";

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
      END;
  `;

  await dbRunAsync(query, [userId, targetLimit, targetGroupLimit]);

  // 4. Proactive Sync: If user has 100+ limit but tier is still 'personal', promote them
  if (targetLimit >= 100 && currentTier.toLowerCase() === 'personal') {
    await dbRunAsync("UPDATE users SET tier = 'pro' WHERE id = ? AND tier = 'personal'", [userId]);
  }
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