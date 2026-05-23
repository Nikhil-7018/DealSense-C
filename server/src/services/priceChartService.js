import { toDateKey } from '../utils/date.js';

/**
 * Recharts-friendly rows: { date, Amazon: n, Flipkart: m, ... }
 */
export function pivotPriceHistory(rows) {
  const byDate = new Map();
  const storeNames = new Set();

  for (const row of rows) {
    const date = toDateKey(row.recorded_at);
    const name = row.store_name;
    storeNames.add(name);
    if (!byDate.has(date)) {
      byDate.set(date, { date });
    }
    byDate.get(date)[name] = Number(row.price);
  }

  return {
    chartData: [...byDate.keys()].sort().map((d) => byDate.get(d)),
    storeNames: [...storeNames].sort(),
  };
}
