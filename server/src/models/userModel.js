import pool from '../config/db.js';

export async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, email, name, created_at FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function createUser({ email, passwordHash, name }) {
  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
    [email, passwordHash, name],
  );
  return result.insertId;
}
