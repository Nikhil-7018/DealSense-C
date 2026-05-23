import pool from '../config/db.js';

export async function savePrediction({
  productId,
  predictedPrice,
  recommendation,
  trend,
  slopePerDay,
  forecastDays,
  method,
}) {
  const [result] = await pool.query(
    `INSERT INTO predictions
     (product_id, predicted_price, recommendation, trend, slope_per_day, forecast_days, method)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      productId,
      predictedPrice,
      recommendation,
      trend,
      slopePerDay,
      forecastDays,
      method,
    ],
  );
  return result.insertId;
}

export async function listRecentPredictionsForProduct(productId, limit = 10) {
  const [rows] = await pool.query(
    `SELECT predicted_price, recommendation, trend, slope_per_day, forecast_days, method, created_at
     FROM predictions WHERE product_id = ? ORDER BY created_at DESC LIMIT ?`,
    [productId, limit],
  );
  return rows;
}
