import pool from '../config/db.js';

export async function createNotification(userId, productId, message, triggeredPrice, alertTargetPrice) {
  await pool.query(
    `INSERT INTO notifications (user_id, product_id, message, triggered_price, alert_target_price)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, productId, message, triggeredPrice, alertTargetPrice],
  );
}

export async function findNotificationByUniqueKey(userId, productId, message) {
  const [rows] = await pool.query(
    `SELECT id FROM notifications
     WHERE user_id = ? AND product_id = ? AND message = ? AND is_read = 0
     LIMIT 1`,
    [userId, productId, message],
  );
  return rows[0] ?? null;
}

export async function listNotificationsByUser(userId) {
  const [rows] = await pool.query(
    `SELECT n.id, n.product_id, n.message, n.triggered_price, n.alert_target_price, n.is_read, n.created_at,
            p.name AS product_name, p.image_url
     FROM notifications n
     JOIN products p ON p.id = n.product_id
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC
     LIMIT 50`,
    [userId],
  );
  return rows;
}

export async function markNotificationRead(userId, notificationId) {
  const [result] = await pool.query(
    `UPDATE notifications
     SET is_read = 1
     WHERE id = ? AND user_id = ?`,
    [notificationId, userId],
  );
  return result.affectedRows > 0;
}

export async function markAllNotificationsRead(userId) {
  await pool.query(
    `UPDATE notifications
     SET is_read = 1
     WHERE user_id = ?`,
    [userId],
  );
}
