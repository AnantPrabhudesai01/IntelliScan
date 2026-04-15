/**
 * Resolves the scan limits based on user tier.
 */
function resolveTierLimits(tier) {
  const normalizedTier = String(tier || 'personal').toLowerCase();
  
  // High-availability check: Always return Enterprise limits for Enterprise tier
  if (normalizedTier === 'enterprise' || normalizedTier === 'business_admin') {
    return { single: 99999, group: 99999, tier: 'enterprise' };
  }
  
  // Pro limits
  if (normalizedTier === 'pro') {
    return { single: 100, group: 10, tier: 'pro' };
  }

  // Fallback to personal
  return { single: 10, group: 1, tier: 'personal' };
}

/**
 * Atomically ensures the quota row exists, updates tier limits (if higher), 
 * and performs a lazy month-boundary reset.
 */
async function ensureQuotaRow(userId, currentTier = 'personal') {
  const limits = resolveTierLimits(currentTier);
  
  // 1. Get current quota to check for existing higher limits (Safety)
  const existing = await dbGetAsync('SELECT limit_amount, group_limit_amount FROM user_quotas WHERE user_id = ?', [userId]);
  
  // If user has manual overrides or higher existing limits, don't downgrade them
  const targetLimit = Math.max(limits.single, existing?.limit_amount || 0);
  const targetGroupLimit = Math.max(limits.group, existing?.group_limit_amount || 0);

  // 2. Perform UPSERT
  const query = `
    INSERT INTO user_quotas (
      user_id, 
      used_count, 
      limit_amount, 
      group_scans_used, 
      group_limit_amount,
      last_reset_date
    ) 
    VALUES (?, 0, ?, 0, ?, ${sql.monthStart})
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
        WHEN EXTRACT(MONTH FROM user_quotas.last_reset_date) != EXTRACT(MONTH FROM CURRENT_TIMESTAMP) 
             OR EXTRACT(YEAR FROM user_quotas.last_reset_date) != EXTRACT(YEAR FROM CURRENT_TIMESTAMP)
        THEN 0 
        ELSE user_quotas.used_count 
      END,
      group_scans_used = CASE 
        WHEN EXTRACT(MONTH FROM user_quotas.last_reset_date) != EXTRACT(MONTH FROM CURRENT_TIMESTAMP) 
             OR EXTRACT(YEAR FROM user_quotas.last_reset_date) != EXTRACT(YEAR FROM CURRENT_TIMESTAMP)
        THEN 0 
        ELSE user_quotas.group_scans_used 
      END,
      last_reset_date = CASE 
        WHEN EXTRACT(MONTH FROM user_quotas.last_reset_date) != EXTRACT(MONTH FROM CURRENT_TIMESTAMP) 
             OR EXTRACT(YEAR FROM user_quotas.last_reset_date) != EXTRACT(YEAR FROM CURRENT_TIMESTAMP)
        THEN ${sql.monthStart} 
        ELSE user_quotas.last_reset_date 
      END;
  `;

  await dbRunAsync(query, [userId, targetLimit, targetGroupLimit]);

  // 3. Proactive Sync: If user has 100+ limit but tier is still 'personal', promote them
  if (targetLimit >= 100 && currentTier.toLowerCase() === 'personal') {
    await dbRunAsync("UPDATE users SET tier = 'pro' WHERE id = ? AND tier = 'personal'", [userId]);
  }
}

// Need to import dbGetAsync
const { dbRunAsync, dbGetAsync, sql } = require('./db');

module.exports = { ensureQuotaRow, resolveTierLimits };