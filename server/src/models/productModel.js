import pool from '../config/db.js';

export async function searchProducts(query, limit = 50) {
  const q = (query || '').trim();
  if (!q) {
    const [rows] = await pool.query(
      `SELECT id, name, description, category, url, image_url, created_at
       FROM products ORDER BY id DESC LIMIT ?`,
      [limit],
    );
    return rows;
  }

  const like = `%${q.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
  const [rows] = await pool.query(
    `SELECT id, name, description, category, url, image_url, created_at
     FROM products
     WHERE name LIKE ? ESCAPE '\\\\' OR category LIKE ? ESCAPE '\\\\'
     ORDER BY name ASC LIMIT ?`,
    [like, like, limit],
  );
  return rows;
}

export async function getProductById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, description, category, url, image_url, created_at FROM products WHERE id = ?',
    [id],
  );
  return rows[0] ?? null;
}
