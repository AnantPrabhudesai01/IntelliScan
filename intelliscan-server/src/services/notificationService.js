const { dbRunAsync, dbGetAsync, dbAllAsync } = require('../utils/db');

let ioInstance = null;

/**
 * Initialize the notification service with the Socket.io instance
 * @param {object} io - Socket.io instance
 */
function setIo(io) {
  ioInstance = io;
}

/**
 * Global helper to notify a user via DB and Real-time Socket.io
 */
async function notifyUser(userId, { type, title, message }) {
  try {
    const result = await dbRunAsync(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [userId, type, title, message]
    );
    
    if (ioInstance) {
      // Emit to user's private room
      ioInstance.to(`user-${userId}`).emit('new-notification', {
        id: result.lastID,
        type,
        title,
        message,
        is_read: 0,
        created_at: new Date().toISOString()
      });
    }
    
    console.log(`[Notification] Sent to user ${userId}: ${title}`);
  } catch (err) {
    console.error('[Notification] Failed to send:', err.message);
  }
}

/**
 * Get notifications for a user
 */
async function getUserNotifications(userId, limit = 50) {
  return await dbAllAsync(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', 
    [userId, limit]
  );
}

/**
 * Mark notifications as read
 */
async function markAsRead(userId, notificationIds) {
  if (!notificationIds || notificationIds.length === 0) return 0;
  
  const placeholders = notificationIds.map(() => '?').join(',');
  const query = `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`;
  
  const result = await dbRunAsync(query, [userId, ...notificationIds]);
  return result.changes;
}

/**
 * Mark all notifications as read
 */
async function markAllAsRead(userId) {
  const result = await dbRunAsync('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
  return result.changes;
}

/**
 * Get the current Socket.io instance
 */
function getIo() {
  return ioInstance;
}

module.exports = {
  setIo,
  getIo,
  notifyUser,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};
