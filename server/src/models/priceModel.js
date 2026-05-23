import pool from '../config/db.js';

export async function getPriceHistoryByProduct(productId) {
  const [rows] = await pool.query(
    `SELECT p.price, p.recorded_at, s.id AS store_id, s.name AS store_name, s.slug AS store_slug
     FROM prices p
     JOIN stores s ON s.id = p.store_id
     WHERE p.product_id = ?
     ORDER BY p.recorded_at ASC, s.name ASC`,
    [productId],
  );
  return rows;
}

/**
 * Latest price per store (max recorded_at per store).
 */
export async function getLatestPricesByProduct(productId) {
  const [rows] = await pool.query(
    `SELECT s.id AS store_id, s.name AS store_name, s.slug AS store_slug, p.price, p.recorded_at
     FROM prices p
     INNER JOIN stores s ON s.id = p.store_id
     INNER JOIN (
       SELECT store_id, MAX(recorded_at) AS max_date
       FROM prices
       WHERE product_id = ?
       GROUP BY store_id
     ) latest ON latest.store_id = p.store_id AND latest.max_date = p.recorded_at
     WHERE p.product_id = ?
     ORDER BY p.price ASC`,
    [productId, productId],
  );
  return rows;
}

export async function ensureLiveFetchStore() {
  await pool.query(
    'INSERT IGNORE INTO stores (name, slug) VALUES (?, ?)',
    ['Live Fetch', 'live-fetch'],
  );
  const [rows] = await pool.query('SELECT id FROM stores WHERE slug = ? LIMIT 1', ['live-fetch']);
  return rows[0]?.id ?? null;
}

/**
 * Upsert today's scraped price under the Live Fetch store (same row shape as other retailers).
 */
export async function insertFetchedPrice(productId, price) {
  const storeId = await ensureLiveFetchStore();
  if (!storeId) {
    throw new Error('Failed to initialize Live Fetch store');
  }
  await pool.query(
    `INSERT INTO prices (product_id, store_id, price, recorded_at)
     VALUES (?, ?, ?, CURDATE())
     ON DUPLICATE KEY UPDATE price = VALUES(price)`,
    [productId, storeId, price],
  );
  return storeId;
}

export async function getLatestFetchedPrice(productId) {
  const [rows] = await pool.query(
    `SELECT p.product_id, p.price, p.recorded_at AS date, s.id AS store_id, s.name AS store_name, s.slug AS store_slug
     FROM prices p
     INNER JOIN stores s ON s.id = p.store_id
     WHERE p.product_id = ? AND s.slug = 'live-fetch'
     ORDER BY p.recorded_at DESC, p.id DESC
     LIMIT 1`,
    [productId],
  );
  return rows[0] ?? null;
}
