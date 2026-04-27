const { dbGetAsync } = require('./db');

/**
 * Returns a consistent socket.io room name for a workspace or user scope.
 */
function getWorkspaceRoom(workspaceId, userId) {
  return workspaceId ? `workspace-${workspaceId}` : `workspace-user-${userId}`;
}

/**
 * Calculates a scope-specific workspace ID.
 * If workspaceId exists, returns it.
 * If not, returns negative userId (personal scope).
 */
function getScopeWorkspaceId(workspaceId, userId) {
  const numWorkspaceId = workspaceId ? Number(workspaceId) : null;
  const numUserId = Number(userId);
  return numWorkspaceId ? numWorkspaceId : numUserId * -1;
}

/**
 * Fetches the workspace_id for a given user.
 */
async function getWorkspaceIdForUser(userId) {
  const numericId = Number(userId);
  if (!Number.isFinite(numericId)) return null;
  // 💎 MASTER KEY BYPASS: The enterprise bypass user has no physical workspace row
  if (numericId === 999999) return null;
  
  const row = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [numericId]);
  return row?.workspace_id ?? null;
}

/**
 * Convenience helper to get both the real workspace ID and the computed scope ID.
 */
async function getScopeForUser(userId) {
  const workspaceId = await getWorkspaceIdForUser(userId);
  return {
    workspaceId,
    scopeWorkspaceId: getScopeWorkspaceId(workspaceId, userId)
  };
}

module.exports = {
  getWorkspaceRoom,
  getScopeWorkspaceId,
  getWorkspaceIdForUser,
  getScopeForUser
};
