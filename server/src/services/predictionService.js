function toDateKey(value) {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

/**
 * Linear regression y = slope * x + intercept
 * x = day index (0, 1, 2, ... from first observation)
 */
export function linearRegression(points) {
  const valid = points.filter(
    (p) => Number.isFinite(p.x) && Number.isFinite(p.y),
  );
  const n = valid.length;
  if (n === 0) {
    return { slope: 0, intercept: 0 };
  }
  if (n === 1) {
    return { slope: 0, intercept: valid[0].y };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const { x, y } of valid) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) {
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Daily minimum prices (best deal per day) for trend / prediction.
 */
export function minPriceByDay(rawRows) {
  const byDate = new Map();
  for (const row of rawRows) {
    const d = toDateKey(row.recorded_at);
    const price = Number(row.price);
    if (!Number.isFinite(price)) continue;
    if (!byDate.has(d) || price < byDate.get(d).min) {
      byDate.set(d, { min: price, date: d });
    }
  }
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => ({ date: v.date, minPrice: v.min }));
}

export function buildRegressionPoints(dailyMins) {
  return dailyMins.map((row, index) => ({
    x: index,
    y: row.minPrice,
    date: row.date,
  }));
}

export function forecastPrice(slope, intercept, lastDayIndex, daysAhead) {
  const x = lastDayIndex + daysAhead;
  const raw = slope * x + intercept;
  if (!Number.isFinite(raw)) return null;
  return Math.max(0, Math.round(raw * 100) / 100);
}

const SLOPE_EPS = 0.5;

export function recommendationFromSlope(slope) {
  const s = Number.isFinite(slope) ? slope : 0;
  if (s < -SLOPE_EPS) {
    return {
      recommendation: 'Wait',
      trend: 'decreasing',
      rationale: 'Prices are trending down; waiting may save money.',
    };
  }
  if (s > SLOPE_EPS) {
    return {
      recommendation: 'Buy Now',
      trend: 'increasing',
      rationale: 'Prices are rising; buying soon may avoid higher costs.',
    };
  }
  return {
    recommendation: 'Wait',
    trend: 'stable',
    rationale: 'Prices are relatively flat; no strong urgency to buy immediately.',
  };
}

export function runPrediction(rawPriceRows, forecastDays = 7) {
  const daily = minPriceByDay(rawPriceRows);
  if (daily.length === 0) {
    return {
      points: [],
      slope: 0,
      intercept: 0,
      predictedPrice: null,
      forecastDays,
      ...recommendationFromSlope(0),
      method: 'linear_regression',
    };
  }

  const series = buildRegressionPoints(daily);
  const { slope, intercept } = linearRegression(series.map(({ x, y }) => ({ x, y })));
  const safeSlope = Number.isFinite(slope) ? slope : 0;
  const safeIntercept = Number.isFinite(intercept) ? intercept : series[0]?.y ?? 0;
  const lastIndex = series.length - 1;
  const predictedPrice = forecastPrice(safeSlope, safeIntercept, lastIndex, forecastDays);
  const rec = recommendationFromSlope(safeSlope);

  return {
    points: series,
    slope: safeSlope,
    intercept: safeIntercept,
    predictedPrice,
    forecastDays,
    lastObservedMin: daily[daily.length - 1].minPrice,
    method: 'linear_regression',
    ...rec,
  };
}
