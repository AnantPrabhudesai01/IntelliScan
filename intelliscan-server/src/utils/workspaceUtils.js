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
  return workspaceId ? Number(workspaceId) : Number(userId) * -1;
}

/**
 * Fetches the workspace_id for a given user.
 */
async function getWorkspaceIdForUser(userId) {
  const row = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [userId]);
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
