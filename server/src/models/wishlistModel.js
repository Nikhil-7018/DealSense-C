import pool from '../config/db.js';

export async function addWishlistItem(userId, productId) {
  await pool.query(
    'INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)',
    [userId, productId],
  );
}

export async function removeWishlistItem(userId, productId) {
  const [result] = await pool.query(
    'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
    [userId, productId],
  );
  return result.affectedRows > 0;
}

export async function listWishlistByUser(userId) {
  const [rows] = await pool.query(
    `SELECT w.product_id, w.created_at AS added_at,
            w.alert_enabled, w.alert_target_price,
            pr.name, pr.description, pr.category, pr.image_url
     FROM wishlist w
     JOIN products pr ON pr.id = w.product_id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function getWishlistAlertStatus(userId, productId) {
  const [rows] = await pool.query(
    `SELECT alert_enabled, alert_target_price
     FROM wishlist
     WHERE user_id = ? AND product_id = ?
     LIMIT 1`,
    [userId, productId],
  );
  return rows[0] ?? null;
}

export async function updateWishlistAlert(userId, productId, enabled, targetPrice) {
  const [result] = await pool.query(
    `UPDATE wishlist
     SET alert_enabled = ?, alert_target_price = ?
     WHERE user_id = ? AND product_id = ?`,
    [enabled ? 1 : 0, targetPrice, userId, productId],
  );
  return result.affectedRows > 0;
}

export async function isInWishlist(userId, productId) {
  const [rows] = await pool.query(
    'SELECT 1 FROM wishlist WHERE user_id = ? AND product_id = ? LIMIT 1',
    [userId, productId],
  );
  return rows.length > 0;
}

export async function getActiveAlertsForProduct(productId, price) {
  const [rows] = await pool.query(
    `SELECT user_id, alert_target_price
     FROM wishlist
     WHERE product_id = ? AND alert_enabled = 1 AND alert_target_price >= ?`,
    [productId, price],
  );
  return rows;
}
